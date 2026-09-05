from flask import Flask, jsonify
from flask_cors import CORS
from db import supabase
from price_feed import start_scheduler

app = Flask(__name__)
CORS(app)

@app.route("/test-db")
def test_db():
    result = supabase.table("assets").select("*").execute()
    return jsonify(result.data)

from flask import request
import pandas as pd
from optimizer import optimize

@app.route("/optimize", methods=["POST"])
def optimize_endpoint():
    body = request.json
    portfolio_id = body["portfolio_id"]

    # Read form-provided constraints (sent from Optimisation.jsx), converting % → fraction
    max_equity = float(body.get("maxEquity", 100)) / 100
    max_single_asset = float(body.get("maxAsset", 100)) / 100
    min_liquidity = float(body.get("minLiquidity", 0)) / 100
    capital = body.get("capital")

    assets = supabase.table("assets").select("*").execute().data
    rows = supabase.table("market_prices").select("*").order("recorded_at").execute().data

    asset_map = {a["id"]: a["asset_class"] for a in assets}
    df = pd.DataFrame(rows)
    df["asset_class"] = df["asset_id"].map(asset_map)
    pivot = df.pivot_table(index="recorded_at", columns="asset_class", values="price")

    max_weights = {"Equity": max_equity}   # only Equity has a form-specific cap; others default to max_single_asset
    min_weights = {"Cash": min_liquidity}

    try:
        weights, ret, vol, sharpe = optimize(
            pivot, max_weights,
            max_single_asset=max_single_asset,
            min_weights=min_weights
        )
    except Exception as e:
        print("OPTIMIZATION ERROR:", repr(e))
        return jsonify({"error": f"Optimization failed: {str(e)}"}), 500

    # Update capital if the user provided a new one
    if capital is not None:
        supabase.table("portfolios").update({"capital": float(capital)}).eq("id", portfolio_id).execute()

    supabase.table("optimization_runs").insert({
        "portfolio_id": portfolio_id, "weights": weights,
        "expected_return": ret, "volatility": vol, "sharpe": sharpe,
        "triggered_by": "manual"
    }).execute()

    supabase.table("portfolio_holdings").update({"is_current": False}).eq("portfolio_id", portfolio_id).execute()
    class_to_asset_id = {a["asset_class"]: a["id"] for a in assets}
    for cls, w in weights.items():
        if cls not in class_to_asset_id:
            continue
        supabase.table("portfolio_holdings").insert({
            "portfolio_id": portfolio_id, "asset_id": class_to_asset_id[cls], "weight": w, "is_current": True
        }).execute()

    return jsonify({"weights": weights, "expectedReturn": ret, "portfolioRisk": vol, "sharpeRatio": sharpe})

@app.route("/portfolio/<portfolio_id>", methods=["GET"])
def get_portfolio(portfolio_id):
    portfolio = supabase.table("portfolios").select("*").eq("id", portfolio_id).single().execute().data
    holdings = supabase.table("portfolio_holdings").select("*").eq("portfolio_id", portfolio_id).eq("is_current", True).execute().data
    assets = supabase.table("assets").select("*").execute().data
    asset_map = {a["id"]: a for a in assets}

    result = []
    for h in holdings:
        a = asset_map[h["asset_id"]]
        result.append({
            "asset": a["name"],
            "type": a["asset_class"],
            "allocation": round(h["weight"] * 100, 2),
            "currentValue": round(h["weight"] * portfolio["capital"], 2)
        })

    return jsonify({
        "capital": portfolio["capital"],
        "holdings": result
    })

from risk_engine import compute_returns, evaluate, check_breaches

@app.route("/risk-status/<portfolio_id>", methods=["GET"])
def risk_status(portfolio_id):
    holdings = supabase.table("portfolio_holdings").select("*").eq("portfolio_id", portfolio_id).eq("is_current", True).execute().data
    assets = supabase.table("assets").select("*").execute().data
    rules = supabase.table("risk_rules").select("*").eq("portfolio_id", portfolio_id).execute().data
    prices = supabase.table("market_prices").select("*").order("recorded_at").execute().data

    asset_map = {a["id"]: a["asset_class"] for a in assets}
    weights = {asset_map[h["asset_id"]]: h["weight"] for h in holdings}

    returns_by_class = {}
    for cls in weights:
        class_prices = [p["price"] for p in prices if asset_map[p["asset_id"]] == cls]
        returns_by_class[cls] = compute_returns(class_prices).tolist()

    risk_values = evaluate(returns_by_class, weights)
    breaches = check_breaches(risk_values, weights, rules)

    # Log any breaches
    for b in breaches:
        supabase.table("risk_alerts").insert({
            "portfolio_id": portfolio_id,
            "metric": b["metric"],
            "value": b["value"],
            "threshold": b["threshold"],
            "severity": b["severity"],
            "source": "live",
            "message": f"{b['metric']} is {round(b['value'],3)}, threshold is {b['threshold']}",
            "action_taken": "Alert raised" if b["severity"] == "alert" else "Auto-rebalance triggered",
            "status": "active"
        }).execute()

    rule_cards = []
    for r in rules:
        current = None
        if r["metric"] in ["max_equity", "max_gold", "max_single_asset", "min_liquidity"]:
            cls_map = {"max_equity": "Equity", "max_gold": "Gold"}
            if r["metric"] in cls_map:
                current = weights.get(cls_map[r["metric"]])
            elif r["metric"] == "min_liquidity":
                current = weights.get("Cash")
            elif r["metric"] == "max_single_asset":
                current = max(weights.values()) if weights else 0
        elif r["metric"] == "max_volatility":
            current = risk_values["volatility"]

        breached = any(b["metric"] == r["metric"] for b in breaches)
        rule_cards.append({
            "ruleName": r["metric"],
            "currentValue": current,
            "threshold": r["threshold_value"],
            "status": "Breached" if breached else "OK"
        })

    return jsonify({"rules": rule_cards, "riskValues": risk_values})

import copy

SCENARIO_SHOCKS = {
    "market_crash": {"Equity": -0.20, "Gold": 0.05},
    "interest_rate_shock": {"Bonds": -0.10, "Cash": 0.01},
    "high_inflation": {"Gold": 0.10, "Bonds": -0.05},
    "normal": {},
}

@app.route("/simulate-shock", methods=["POST"])
def simulate_shock():
    body = request.json
    portfolio_id = body["portfolio_id"]
    scenario = body["scenario"]
    custom_shock = body.get("shock")  # used if scenario == 'custom'

    portfolio = supabase.table("portfolios").select("*").eq("id", portfolio_id).single().execute().data
    holdings = supabase.table("portfolio_holdings").select("*").eq("portfolio_id", portfolio_id).eq("is_current", True).execute().data
    assets = supabase.table("assets").select("*").execute().data
    asset_map = {a["id"]: a["asset_class"] for a in assets}
    weights = {asset_map[h["asset_id"]]: h["weight"] for h in holdings}

    value_before = portfolio["capital"]

    shocks = SCENARIO_SHOCKS.get(scenario, {})
    if scenario == "custom" and custom_shock is not None:
        shocks = {cls: float(custom_shock) / 100 for cls in weights}

    value_after = value_before
    for cls, w in weights.items():
        value_after += value_before * w * shocks.get(cls, 0)

    loss_pct = round((value_after - value_before) / value_before * 100, 2)
    risk_level = "High" if loss_pct < -15 else "Medium" if loss_pct < -5 else "Low"
    recommendation = "Reduce equity exposure and increase cash buffer" if loss_pct < -10 else "No action needed"

    run = supabase.table("scenario_runs").insert({
        "portfolio_id": portfolio_id,
        "shock_description": scenario,
        "pre_shock_metrics": {"value": value_before},
        "post_shock_metrics": {"value": value_after},
        "proposed_allocation": weights,   # placeholder: same weights; refine later with re-optimization
        "risk_level": risk_level,
        "recommendation": recommendation,
        "applied": False
    }).execute()

    return jsonify({
        "scenario_run_id": run.data[0]["id"],
        "valueBefore": value_before,
        "valueAfter": round(value_after, 2),
        "lossPercentage": loss_pct,
        "riskLevel": risk_level,
        "recommendation": recommendation
    })

@app.route("/apply-scenario/<int:run_id>", methods=["POST"])
def apply_scenario(run_id):
    run = supabase.table("scenario_runs").select("*").eq("id", run_id).single().execute().data
    portfolio_id = run["portfolio_id"]

    supabase.table("portfolio_holdings").update({"is_current": False}).eq("portfolio_id", portfolio_id).execute()

    assets = supabase.table("assets").select("*").execute().data
    class_to_id = {a["asset_class"]: a["id"] for a in assets}
    for cls, w in run["proposed_allocation"].items():
        supabase.table("portfolio_holdings").insert({
            "portfolio_id": portfolio_id, "asset_id": class_to_id[cls], "weight": w, "is_current": True
        }).execute()

    supabase.table("scenario_runs").update({"applied": True}).eq("id", run_id).execute()
    return jsonify({"status": "applied"})

@app.route("/alerts/<portfolio_id>", methods=["GET"])
def get_alerts(portfolio_id):
    data = supabase.table("risk_alerts").select("*").eq("portfolio_id", portfolio_id).order("created_at", desc=True).execute().data
    return jsonify(data)

@app.route("/performance/<portfolio_id>", methods=["GET"])
def get_performance(portfolio_id):
    data = supabase.table("portfolio_snapshots").select("*").eq("portfolio_id", portfolio_id).order("created_at").execute().data
    return jsonify([{"date": d["created_at"][:10], "value": d["value"]} for d in data])

@app.route("/tick-now", methods=["POST"])
def tick_now():
    from price_feed import tick
    tick()
    return jsonify({"status": "tick complete"})

if __name__ == "__main__":
    start_scheduler()
    app.run(debug=True, port=5000)
