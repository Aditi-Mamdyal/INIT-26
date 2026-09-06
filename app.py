from flask import Flask, jsonify, request
from flask_cors import CORS

from db import supabase
from price_feed import start_scheduler
from optimizer import optimize
from risk_engine import compute_returns, evaluate, check_breaches

import pandas as pd


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# TEST DATABASE
# ============================================================

@app.route("/test-db")
def test_db():

    try:

        result = (
            supabase
            .table("assets")
            .select("*")
            .execute()
        )

        return jsonify(result.data)

    except Exception as e:

        print("TEST DB ERROR:", repr(e))

        return jsonify({
            "error": str(e)
        }), 500


# ============================================================
# PORTFOLIO OPTIMIZATION
# ============================================================

@app.route("/optimize", methods=["POST"])
def optimize_endpoint():

    body = request.json or {}

    # --------------------------------------------------------
    # Portfolio ID
    # --------------------------------------------------------

    portfolio_id = body.get("portfolio_id")

    if not portfolio_id:

        return jsonify({
            "error": "portfolio_id is required."
        }), 400

    # --------------------------------------------------------
    # USER ENTERED CAPITAL
    # --------------------------------------------------------

    capital = body.get("capital")

    if capital is None or capital == "":

        return jsonify({
            "error": "Total capital is required."
        }), 400

    try:

        capital = float(capital)

        if capital <= 0:

            return jsonify({
                "error": "Total capital must be greater than 0."
            }), 400

    except (TypeError, ValueError):

        return jsonify({
            "error": "Invalid total capital."
        }), 400

    # --------------------------------------------------------
    # Selected Assets
    # --------------------------------------------------------

    selected_assets = body.get(
        "selectedAssets",
        []
    )

    if not isinstance(selected_assets, list):

        return jsonify({
            "error": "selectedAssets must be a list."
        }), 400

    if len(selected_assets) < 2:

        return jsonify({
            "error": "Please select at least two assets."
        }), 400

    # --------------------------------------------------------
    # Allowed Asset Classes
    # --------------------------------------------------------

    allowed_assets = {
        "Equity",
        "Bonds",
        "Mutual Funds",
        "Gold",
        "Cash",
        "Real Estate"
    }

    invalid_assets = [
        asset
        for asset in selected_assets
        if asset not in allowed_assets
    ]

    if invalid_assets:

        return jsonify({
            "error": (
                "Invalid asset selection: "
                + ", ".join(invalid_assets)
            )
        }), 400

    # --------------------------------------------------------
    # Risk Tolerance
    # --------------------------------------------------------

    risk_tolerance = body.get(
        "riskTolerance",
        "balanced"
    )

    if risk_tolerance not in [
        "conservative",
        "balanced",
        "aggressive"
    ]:

        return jsonify({
            "error": "Invalid risk tolerance."
        }), 400

    # ========================================================
    # RISK CONTROLS
    # ========================================================

    try:

        max_equity = (
            float(
                body.get(
                    "maxEquity",
                    50
                )
            ) / 100
        )

        max_gold = (
            float(
                body.get(
                    "maxGold",
                    30
                )
            ) / 100
        )

        max_single_asset = (
            float(
                body.get(
                    "maxAsset",
                    40
                )
            ) / 100
        )

        min_liquidity = (
            float(
                body.get(
                    "minLiquidity",
                    10
                )
            ) / 100
        )

        max_volatility = (
            float(
                body.get(
                    "maxVolatility",
                    25
                )
            ) / 100
        )

    except (TypeError, ValueError):

        print(
            "INVALID CONSTRAINT VALUES:",
            body
        )

        return jsonify({
            "error": "Invalid optimization constraints."
        }), 400

    # --------------------------------------------------------
    # Validate constraints
    # --------------------------------------------------------

    if not 0 <= max_equity <= 1:

        return jsonify({
            "error": "Maximum Equity must be between 0 and 100."
        }), 400

    if not 0 <= max_gold <= 1:

        return jsonify({
            "error": "Maximum Gold must be between 0 and 100."
        }), 400

    if not 0 < max_single_asset <= 1:

        return jsonify({
            "error": (
                "Maximum Single Asset must be "
                "greater than 0 and at most 100."
            )
        }), 400

    if not 0 <= min_liquidity <= 1:

        return jsonify({
            "error": (
                "Minimum Liquidity must be "
                "between 0 and 100."
            )
        }), 400

    if not 0 < max_volatility <= 1:

        return jsonify({
            "error": (
                "Maximum Volatility must be "
                "greater than 0 and at most 100."
            )
        }), 400

    # ========================================================
    # GET ASSETS FROM DATABASE
    # ========================================================

    try:

        assets_result = (
            supabase
            .table("assets")
            .select("*")
            .execute()
        )

        assets = assets_result.data or []

    except Exception as e:

        print(
            "ASSET FETCH ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Could not fetch assets from database."
            )
        }), 500

    if not assets:

        return jsonify({
            "error": "No assets found in database."
        }), 400

    # ========================================================
    # GET HISTORICAL MARKET PRICES
    # ========================================================

    try:

        price_result = (
            supabase
            .table("market_prices")
            .select("*")
            .order("recorded_at")
            .execute()
        )

        rows = price_result.data or []

    except Exception as e:

        print(
            "PRICE FETCH ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Could not fetch market price data."
            )
        }), 500

    if not rows:

        return jsonify({
            "error": "No historical market price data found."
        }), 400

    # ========================================================
    # ASSET ID -> ASSET CLASS
    # ========================================================

    asset_map = {
        asset["id"]: asset["asset_class"]
        for asset in assets
    }

    # ========================================================
    # CREATE DATAFRAME
    # ========================================================

    df = pd.DataFrame(rows)

    if df.empty:

        return jsonify({
            "error": "Market price data is empty."
        }), 400

    required_columns = [
        "asset_id",
        "price",
        "recorded_at"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:

        return jsonify({
            "error": (
                "Market price data is missing columns: "
                + ", ".join(missing_columns)
            )
        }), 400

    # ========================================================
    # MAP ASSET IDs TO ASSET CLASSES
    # ========================================================

    df["asset_class"] = (
        df["asset_id"]
        .map(asset_map)
    )

    df = df.dropna(
        subset=["asset_class"]
    )

    # ========================================================
    # KEEP ONLY USER SELECTED ASSETS
    # ========================================================

    df = df[
        df["asset_class"].isin(
            selected_assets
        )
    ]

    if df.empty:

        return jsonify({
            "error": (
                "No historical market data available "
                "for the selected assets."
            )
        }), 400

    # ========================================================
    # CONVERT PRICE TO NUMERIC
    # ========================================================

    df["price"] = pd.to_numeric(
        df["price"],
        errors="coerce"
    )

    df["recorded_at"] = pd.to_datetime(
        df["recorded_at"],
        errors="coerce"
    )

    df = df.dropna(
        subset=[
            "price",
            "recorded_at"
        ]
    )

    if df.empty:

        return jsonify({
            "error": "No valid historical price data found."
        }), 400

    # ========================================================
    # CREATE HISTORICAL PRICE MATRIX
    # ========================================================

    try:

        pivot = df.pivot_table(
            index="recorded_at",
            columns="asset_class",
            values="price"
        )

    except Exception as e:

        print(
            "PIVOT ERROR:",
            repr(e)
        )

        return jsonify({
            "error": "Unable to create price history."
        }), 400

    if pivot.empty:

        return jsonify({
            "error": "Unable to create price history."
        }), 400

    pivot = pivot.sort_index()

    # ========================================================
    # USE ONLY COMMON HISTORICAL DATA
    # ========================================================

    pivot = pivot.dropna(
        axis=0,
        how="any"
    )

    pivot = pivot.dropna(
        axis=1,
        how="all"
    )

    if len(pivot.columns) < 2:

        return jsonify({
            "error": (
                "Please select at least two assets "
                "with available common historical data."
            )
        }), 400

    if len(pivot) < 20:

        return jsonify({
            "error": (
                "Not enough common historical market "
                "data for the selected assets. "
                "Please select assets with sufficient history."
            )
        }), 400

    pivot = pivot.tail(60)

    # ========================================================
    # MAXIMUM ALLOCATION RULES
    # ========================================================

    max_weights = {}

    if "Equity" in pivot.columns:

        max_weights["Equity"] = max_equity

    if "Gold" in pivot.columns:

        max_weights["Gold"] = max_gold

    # ========================================================
    # MINIMUM ALLOCATION RULES
    # ========================================================

    min_weights = {}

    if "Cash" in pivot.columns:

        min_weights["Cash"] = min_liquidity

    # ========================================================
    # DEBUG INFORMATION
    # ========================================================

    print()
    print("========================================")
    print("OPTIMIZATION REQUEST")
    print("========================================")

    print(
        "Portfolio ID:",
        portfolio_id
    )

    print(
        "Capital entered by user:",
        capital
    )

    print(
        "Selected Assets:",
        selected_assets
    )

    print(
        "Risk Tolerance:",
        risk_tolerance
    )

    print(
        "Maximum Equity:",
        max_equity
    )

    print(
        "Maximum Gold:",
        max_gold
    )

    print(
        "Maximum Single Asset:",
        max_single_asset
    )

    print(
        "Minimum Liquidity:",
        min_liquidity
    )

    print(
        "Maximum Volatility:",
        max_volatility
    )

    print(
        "Historical Price Columns:",
        list(pivot.columns)
    )

    print(
        "Common Historical Rows:",
        len(pivot)
    )

    print(
        "Current Price Input:",
        "NOT USED"
    )

    print("========================================")
    print()

    # ========================================================
    # RUN OPTIMIZER
    # ========================================================

    try:

        weights, ret, vol, sharpe = optimize(
            pivot,
            max_weights,
            max_single_asset=max_single_asset,
            min_weights=min_weights,
            max_volatility=max_volatility,
            risk_tolerance=risk_tolerance
        )

    except TypeError as e:

        print(
            "OPTIMIZER ARGUMENT ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Optimizer does not accept the required "
                "risk and volatility parameters. "
                "Please check optimizer.py."
            )
        }), 500

    except Exception as e:

        print(
            "OPTIMIZATION ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Optimization failed: "
                f"{str(e)}"
            )
        }), 500

    # ========================================================
    # SAVE USER ENTERED CAPITAL
    # ========================================================

    try:

        capital_update = (
            supabase
            .table("portfolios")
            .update({
                "capital": capital
            })
            .eq(
                "id",
                portfolio_id
            )
            .execute()
        )

        print(
            "CAPITAL UPDATE RESPONSE:",
            capital_update.data
        )

        if not capital_update.data:

            return jsonify({
                "error": (
                    "Capital could not be updated in "
                    "the portfolio. Check the portfolio ID "
                    "and Supabase permissions/RLS."
                )
            }), 500

    except Exception as e:

        print(
            "CAPITAL UPDATE ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Failed to save total capital: "
                f"{str(e)}"
            )
        }), 500

    # ========================================================
    # VERIFY CAPITAL SAVED
    # ========================================================

    try:

        saved_portfolio = (
            supabase
            .table("portfolios")
            .select(
                "id, capital"
            )
            .eq(
                "id",
                portfolio_id
            )
            .single()
            .execute()
        )

        saved_capital = None

        if saved_portfolio.data:

            saved_capital = (
                saved_portfolio
                .data
                .get("capital")
            )

        print(
            "SAVED CAPITAL IN DATABASE:",
            saved_capital
        )

        if saved_capital is None:

            return jsonify({
                "error": (
                    "Capital update could not be verified."
                )
            }), 500

    except Exception as e:

        print(
            "CAPITAL VERIFICATION ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Capital was updated but could not "
                "be verified: "
                f"{str(e)}"
            )
        }), 500

    # ========================================================
    # SAVE OPTIMIZATION RUN
    # ========================================================

    try:

        run_result = (
            supabase
            .table("optimization_runs")
            .insert({
                "portfolio_id": portfolio_id,
                "weights": weights,
                "expected_return": ret,
                "volatility": vol,
                "sharpe": sharpe,
                "triggered_by": "manual"
            })
            .execute()
        )

        if not run_result.data:

            return jsonify({
                "error": (
                    "Optimization result was not saved."
                )
            }), 500

        run_id = (
            run_result
            .data[0]
            ["id"]
        )

    except Exception as e:

        print(
            "OPTIMIZATION RUN INSERT ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Could not save optimization result: "
                f"{str(e)}"
            )
        }), 500

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return jsonify({

        "runId": run_id,

        "capital": float(
            saved_capital
        ),

        "weights": weights,

        "expectedReturn": float(ret),

        "portfolioRisk": float(vol),

        "sharpeRatio": float(sharpe)

    }), 200


# ============================================================
# APPLY OPTIMIZATION
# ============================================================

@app.route(
    "/apply-optimization",
    methods=["POST"]
)
def apply_optimization():

    body = request.json or {}

    run_id = body.get("run_id")

    if not run_id:

        return jsonify({
            "error": "run_id is required"
        }), 400

    try:

        run_result = (
            supabase
            .table("optimization_runs")
            .select("*")
            .eq(
                "id",
                run_id
            )
            .single()
            .execute()
        )

        run = run_result.data

        if not run:

            return jsonify({
                "error": "Optimization run not found."
            }), 404

        portfolio_id = run["portfolio_id"]
        weights = run["weights"]

        # ----------------------------------------------------
        # Mark old holdings as not current
        # ----------------------------------------------------

        (
            supabase
            .table("portfolio_holdings")
            .update({
                "is_current": False
            })
            .eq(
                "portfolio_id",
                portfolio_id
            )
            .execute()
        )

        # ----------------------------------------------------
        # Get assets
        # ----------------------------------------------------

        assets = (
            supabase
            .table("assets")
            .select("*")
            .execute()
            .data
        )

        class_to_asset_id = {
            asset["asset_class"]: asset["id"]
            for asset in assets
        }

        # ----------------------------------------------------
        # Insert new holdings
        # ----------------------------------------------------

        for asset_class, weight in weights.items():

            if asset_class not in class_to_asset_id:
                continue

            (
                supabase
                .table("portfolio_holdings")
                .insert({
                    "portfolio_id": portfolio_id,
                    "asset_id": class_to_asset_id[asset_class],
                    "weight": float(weight),
                    "is_current": True
                })
                .execute()
            )

        return jsonify({

            "success": True,

            "message": (
                "Optimization applied successfully."
            )

        })

    except Exception as e:

        print(
            "APPLY OPTIMIZATION ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Failed to apply optimization: "
                f"{str(e)}"
            )
        }), 500


# ============================================================
# CURRENT PORTFOLIO
# ============================================================

@app.route(
    "/portfolio/<portfolio_id>",
    methods=["GET"]
)
def get_portfolio(portfolio_id):

    try:

        portfolio = (
            supabase
            .table("portfolios")
            .select("*")
            .eq(
                "id",
                portfolio_id
            )
            .single()
            .execute()
            .data
        )

        holdings = (
            supabase
            .table("portfolio_holdings")
            .select("*")
            .eq(
                "portfolio_id",
                portfolio_id
            )
            .eq(
                "is_current",
                True
            )
            .execute()
            .data
        )

        assets = (
            supabase
            .table("assets")
            .select("*")
            .execute()
            .data
        )

        asset_map = {
            asset["id"]: asset
            for asset in assets
        }

        result_holdings = []

        for holding in holdings:

            asset = asset_map.get(
                holding["asset_id"]
            )

            result_holdings.append({

                "asset_id":
                    holding["asset_id"],

                "asset_class":
                    (
                        asset["asset_class"]
                        if asset
                        else "Unknown"
                    ),

                "weight":
                    float(holding["weight"])

            })

        return jsonify({

            "portfolio":
                portfolio,

            "holdings":
                result_holdings

        })

    except Exception as e:

        print(
            "PORTFOLIO ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Failed to fetch portfolio: "
                f"{str(e)}"
            )
        }), 500


# ============================================================
# RISK STATUS
# ============================================================

@app.route(
    "/risk-status/<portfolio_id>",
    methods=["GET"]
)
def risk_status(portfolio_id):

    try:

        # ====================================================
        # GET CURRENT HOLDINGS
        # ====================================================

        holdings = (
            supabase
            .table("portfolio_holdings")
            .select("*")
            .eq(
                "portfolio_id",
                portfolio_id
            )
            .eq(
                "is_current",
                True
            )
            .execute()
            .data
        )

        # ====================================================
        # GET ASSETS
        # ====================================================

        assets = (
            supabase
            .table("assets")
            .select("*")
            .execute()
            .data
        )

        asset_map = {
            asset["id"]: asset["asset_class"]
            for asset in assets
        }

        # ====================================================
        # CURRENT WEIGHTS
        # ====================================================

        weights = {}

        for holding in holdings:

            asset_class = asset_map.get(
                holding["asset_id"]
            )

            if asset_class:

                weights[asset_class] = float(
                    holding["weight"]
                )

        # ====================================================
        # DEFAULT RISK RULES
        #
        # 50% = 0.50
        # 30% = 0.30
        # 40% = 0.40
        # 10% = 0.10
        # 25% = 0.25
        # ====================================================

        default_rules = [

            {
                "metric": "max_equity",
                "threshold_value": 0.50
            },

            {
                "metric": "max_gold",
                "threshold_value": 0.30
            },

            {
                "metric": "max_single_asset",
                "threshold_value": 0.40
            },

            {
                "metric": "min_liquidity",
                "threshold_value": 0.10
            },

            {
                "metric": "max_volatility",
                "threshold_value": 0.25
            }

        ]

        # ====================================================
        # GET EXISTING RULES
        # ====================================================

        rules = (
            supabase
            .table("risk_rules")
            .select("*")
            .eq(
                "portfolio_id",
                portfolio_id
            )
            .execute()
            .data
        )

        # ====================================================
        # CREATE DEFAULT RULES IF MISSING
        # ====================================================

        if not rules:

            print(
                "No risk rules found. Creating default rules."
            )

            rule_rows = []

            for rule in default_rules:

                rule_rows.append({

                    "portfolio_id":
                        portfolio_id,

                    "metric":
                        rule["metric"],

                    "threshold_value":
                        rule["threshold_value"]

                })

            try:

                insert_result = (
                    supabase
                    .table("risk_rules")
                    .insert(rule_rows)
                    .execute()
                )

                rules = (
                    insert_result.data
                    or rule_rows
                )

            except Exception as e:

                print(
                    "RISK RULE INSERT ERROR:",
                    repr(e)
                )

                rules = rule_rows

        # ====================================================
        # GET MARKET PRICES
        # ====================================================

        prices = (
            supabase
            .table("market_prices")
            .select("*")
            .order("recorded_at")
            .execute()
            .data
        )

        # ====================================================
        # BUILD PRICE DATAFRAME
        # ====================================================

        price_df = pd.DataFrame(
            prices or []
        )

        if price_df.empty:

            return jsonify({

                "rules": [],

                "riskValues": {

                    "volatility": 0,

                    "var_95": 0

                }

            })

        # ====================================================
        # CLEAN PRICE DATA
        # ====================================================

        price_df["price"] = pd.to_numeric(
            price_df["price"],
            errors="coerce"
        )

        price_df["recorded_at"] = pd.to_datetime(
            price_df["recorded_at"],
            errors="coerce"
        )

        price_df = price_df.dropna(
            subset=[
                "price",
                "recorded_at"
            ]
        )

        price_df["asset_class"] = (
            price_df["asset_id"]
            .map(asset_map)
        )

        price_df = price_df.dropna(
            subset=["asset_class"]
        )

        # ====================================================
        # BUILD RETURNS BY ASSET CLASS
        # ====================================================

        try:

            returns_by_class = {}

            for asset_class in weights:

                class_data = (
                    price_df[
                        price_df["asset_class"] == asset_class
                    ]
                    .sort_values("recorded_at")
                    .groupby(
                        "recorded_at",
                        as_index=False
                    )["price"]
                    .mean()
                )

                class_prices = (
                    class_data["price"]
                    .astype(float)
                    .tolist()
                )

                if len(class_prices) >= 2:

                    returns = compute_returns(
                        class_prices
                    )

                    if len(returns) > 0:

                        returns_by_class[asset_class] = (
                            returns.tolist()
                        )

        except Exception as e:

            print(
                "RETURNS CALCULATION ERROR:",
                repr(e)
            )

            returns_by_class = {}

        # ====================================================
        # CALCULATE RISK
        # ====================================================

        try:

            risk_values = evaluate(
                returns_by_class,
                weights
            )

        except Exception as e:

            print(
                "RISK ENGINE ERROR:",
                repr(e)
            )

            risk_values = {
                "volatility": 0,
                "var_95": 0
            }

        # ====================================================
        # CORRECT PORTFOLIO VOLATILITY
        #
        # sqrt(w' * covariance * w * 252)
        # ====================================================

        try:

            class_price_data = (
                price_df[
                    price_df["asset_class"].isin(
                        weights.keys()
                    )
                ]
                .groupby(
                    [
                        "recorded_at",
                        "asset_class"
                    ],
                    as_index=False
                )["price"]
                .mean()
            )

            class_price_pivot = (
                class_price_data
                .pivot(
                    index="recorded_at",
                    columns="asset_class",
                    values="price"
                )
                .sort_index()
            )

            class_price_pivot = (
                class_price_pivot
                .dropna(
                    how="any"
                )
                .tail(60)
            )

            returns_df = (
                class_price_pivot
                .pct_change()
                .dropna()
            )

            available_assets = [
                asset
                for asset in returns_df.columns
                if asset in weights
            ]

            if (
                len(available_assets) >= 2
                and len(returns_df) >= 2
            ):

                returns_df = (
                    returns_df[
                        available_assets
                    ]
                )

                covariance = (
                    returns_df
                    .cov()
                    .values
                )

                weight_vector = pd.Series(
                    {
                        asset: float(
                            weights[asset]
                        )
                        for asset in available_assets
                    }
                ).values

                portfolio_variance = (
                    weight_vector
                    @ covariance
                    @ weight_vector
                )

                annualized_volatility = (
                    max(
                        float(portfolio_variance),
                        0.0
                    )
                    * 252
                ) ** 0.5

                risk_values["volatility"] = float(
                    annualized_volatility
                )

                print(
                    "Corrected annualized portfolio volatility:",
                    annualized_volatility
                )

        except Exception as e:

            print(
                "VOLATILITY CALCULATION ERROR:",
                repr(e)
            )

        # ====================================================
        # CHECK RULE BREACHES
        # ====================================================

        try:

            breaches = check_breaches(
                risk_values,
                weights,
                rules
            )

        except Exception as e:

            print(
                "BREACH CHECK ERROR:",
                repr(e)
            )

            breaches = []

        # ====================================================
        # SAVE RISK ALERTS
        # ====================================================

        for breach in breaches:

            try:

                (
                    supabase
                    .table("risk_alerts")
                    .insert({

                        "portfolio_id":
                            portfolio_id,

                        "metric":
                            breach["metric"],

                        "value":
                            breach["value"],

                        "threshold":
                            breach["threshold"],

                        "severity":
                            breach["severity"],

                        "source":
                            "live",

                        "message":
                            (
                                f'{breach["metric"]} is '
                                f'{round(breach["value"], 3)}, '
                                f'threshold is '
                                f'{breach["threshold"]}'
                            ),

                        "action_taken":
                            (
                                "Alert raised"
                                if breach["severity"]
                                == "alert"
                                else
                                "Auto-rebalance triggered"
                            ),

                        "status":
                            "active"

                    })
                    .execute()
                )

            except Exception as e:

                print(
                    "RISK ALERT INSERT ERROR:",
                    repr(e)
                )

        # ====================================================
        # PREPARE RULE CARDS
        # ====================================================

        rule_cards = []

        for rule in rules:

            metric = rule["metric"]

            threshold = float(
                rule["threshold_value"]
            )

            current = 0

            # ------------------------------------------------
            # MAX EQUITY
            # ------------------------------------------------

            if metric == "max_equity":

                current = weights.get(
                    "Equity",
                    0
                )

            # ------------------------------------------------
            # MAX GOLD
            # ------------------------------------------------

            elif metric == "max_gold":

                current = weights.get(
                    "Gold",
                    0
                )

            # ------------------------------------------------
            # MAX SINGLE ASSET
            # ------------------------------------------------

            elif metric == "max_single_asset":

                current = (
                    max(weights.values())
                    if weights
                    else 0
                )

            # ------------------------------------------------
            # MIN LIQUIDITY
            # ------------------------------------------------

            elif metric == "min_liquidity":

                current = weights.get(
                    "Cash",
                    0
                )

            # ------------------------------------------------
            # MAX VOLATILITY
            # ------------------------------------------------

            elif metric == "max_volatility":

                current = float(
                    risk_values.get(
                        "volatility",
                        0
                    )
                )

            # ------------------------------------------------
            # BREACH STATUS
            # ------------------------------------------------

            breached = any(

                breach["metric"]
                == metric

                for breach in breaches

            )

            rule_cards.append({

                "ruleName":
                    metric,

                "currentValue":
                    float(current),

                "threshold":
                    threshold,

                "status":
                    (
                        "Breached"
                        if breached
                        else "OK"
                    )

            })

        # ====================================================
        # DEBUG
        # ====================================================

        print()
        print("========================================")
        print("RISK STATUS")
        print("========================================")

        print(
            "Portfolio ID:",
            portfolio_id
        )

        print(
            "Current Weights:",
            weights
        )

        print(
            "Risk Values:",
            risk_values
        )

        print(
            "Risk Rules:",
            rule_cards
        )

        print(
            "Breaches:",
            breaches
        )

        print("========================================")
        print()

        # ====================================================
        # RESPONSE
        # ====================================================

        return jsonify({

            "rules":
                rule_cards,

            "riskValues":
                risk_values

        })

    except Exception as e:

        print(
            "RISK STATUS ERROR:",
            repr(e)
        )

        return jsonify({

            "error":
                (
                    "Failed to calculate risk status: "
                    f"{str(e)}"
                )

        }), 500


# ============================================================
# SCENARIO SHOCKS
# ============================================================

SCENARIO_SHOCKS = {

    "market_crash": {
        "Equity": -0.20,
        "Gold": 0.05
    },

    "interest_rate_shock": {
        "Bonds": -0.10,
        "Cash": 0.01
    },

    "high_inflation": {
        "Gold": 0.10,
        "Bonds": -0.05
    },

    "normal": {}

}


# ============================================================
# SIMULATE SHOCK
# ============================================================

@app.route(
    "/simulate-shock",
    methods=["POST"]
)
def simulate_shock():

    body = request.json or {}

    portfolio_id = body.get(
        "portfolio_id"
    )

    scenario = body.get(
        "scenario",
        "normal"
    )

    custom_shock = body.get(
        "custom_shock"
    )

    if not portfolio_id:

        return jsonify({
            "error": "portfolio_id is required"
        }), 400

    try:

        holdings = (
            supabase
            .table("portfolio_holdings")
            .select("*")
            .eq(
                "portfolio_id",
                portfolio_id
            )
            .eq(
                "is_current",
                True
            )
            .execute()
            .data
        )

        assets = (
            supabase
            .table("assets")
            .select("*")
            .execute()
            .data
        )

        asset_map = {
            asset["id"]: asset["asset_class"]
            for asset in assets
        }

        current_weights = {}

        for holding in holdings:

            asset_class = asset_map.get(
                holding["asset_id"]
            )

            if asset_class:

                current_weights[
                    asset_class
                ] = float(
                    holding["weight"]
                )

        # ----------------------------------------------------
        # Custom shock
        # ----------------------------------------------------

        if custom_shock is not None:

            try:

                shock = (
                    float(custom_shock)
                    / 100
                )

            except (TypeError, ValueError):

                return jsonify({
                    "error":
                        "Invalid custom shock value."
                }), 400

            shocks = {
                asset: shock
                for asset in current_weights
            }

        else:

            shocks = SCENARIO_SHOCKS.get(
                scenario
            )

            if shocks is None:

                return jsonify({
                    "error":
                        "Unknown scenario."
                }), 400

        # ----------------------------------------------------
        # Calculate impact
        # ----------------------------------------------------

        impact = 0

        shocked_values = {}

        for asset, weight in current_weights.items():

            asset_shock = shocks.get(
                asset,
                0
            )

            contribution = (
                weight * asset_shock
            )

            impact += contribution

            shocked_values[asset] = {

                "currentWeight":
                    weight,

                "shock":
                    asset_shock,

                "impact":
                    contribution

            }

        # ----------------------------------------------------
        # Proposed allocation
        # ----------------------------------------------------

        proposed_allocation = (
            current_weights.copy()
        )

        # ----------------------------------------------------
        # Save scenario run
        # ----------------------------------------------------

        scenario_result = (
            supabase
            .table("scenario_runs")
            .insert({

                "portfolio_id":
                    portfolio_id,

                "scenario_name":
                    scenario,

                "shock_percentage":
                    (
                        custom_shock
                        if custom_shock is not None
                        else None
                    ),

                "impact":
                    impact,

                "proposed_allocation":
                    proposed_allocation

            })
            .execute()
        )

        run_id = None

        if scenario_result.data:

            run_id = (
                scenario_result
                .data[0]
                ["id"]
            )

        return jsonify({

            "runId":
                run_id,

            "scenario":
                scenario,

            "impact":
                impact,

            "shockedValues":
                shocked_values,

            "proposedAllocation":
                proposed_allocation

        })

    except Exception as e:

        print(
            "SIMULATE SHOCK ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Scenario simulation failed: "
                f"{str(e)}"
            )
        }), 500


# ============================================================
# APPLY SCENARIO
# ============================================================

@app.route(
    "/apply-scenario/<int:run_id>",
    methods=["POST"]
)
def apply_scenario(run_id):

    try:

        scenario_result = (
            supabase
            .table("scenario_runs")
            .select("*")
            .eq(
                "id",
                run_id
            )
            .single()
            .execute()
        )

        scenario_run = (
            scenario_result.data
        )

        if not scenario_run:

            return jsonify({
                "error":
                    "Scenario run not found."
            }), 404

        portfolio_id = (
            scenario_run[
                "portfolio_id"
            ]
        )

        allocation = (
            scenario_run[
                "proposed_allocation"
            ]
        )

        # ----------------------------------------------------
        # Mark old holdings inactive
        # ----------------------------------------------------

        (
            supabase
            .table("portfolio_holdings")
            .update({
                "is_current": False
            })
            .eq(
                "portfolio_id",
                portfolio_id
            )
            .execute()
        )

        # ----------------------------------------------------
        # Get assets
        # ----------------------------------------------------

        assets = (
            supabase
            .table("assets")
            .select("*")
            .execute()
            .data
        )

        class_to_asset_id = {
            asset["asset_class"]:
                asset["id"]
            for asset in assets
        }

        # ----------------------------------------------------
        # Insert allocation
        # ----------------------------------------------------

        for asset_class, weight in allocation.items():

            if asset_class not in class_to_asset_id:
                continue

            (
                supabase
                .table("portfolio_holdings")
                .insert({

                    "portfolio_id":
                        portfolio_id,

                    "asset_id":
                        class_to_asset_id[
                            asset_class
                        ],

                    "weight":
                        float(weight),

                    "is_current":
                        True

                })
                .execute()
            )

        return jsonify({

            "success":
                True,

            "message":
                "Scenario allocation applied successfully."

        })

    except Exception as e:

        print(
            "APPLY SCENARIO ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Failed to apply scenario: "
                f"{str(e)}"
            )
        }), 500


# ============================================================
# ALERTS
# ============================================================

@app.route(
    "/alerts/<portfolio_id>",
    methods=["GET"]
)
def get_alerts(portfolio_id):

    try:

        alerts = (
            supabase
            .table("risk_alerts")
            .select("*")
            .eq(
                "portfolio_id",
                portfolio_id
            )
            .order(
                "created_at",
                desc=True
            )
            .execute()
            .data
        )

        return jsonify({
            "alerts": alerts
        })

    except Exception as e:

        print(
            "ALERT FETCH ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Failed to fetch alerts: "
                f"{str(e)}"
            )
        }), 500


# ============================================================
# PERFORMANCE
# ============================================================

@app.route(
    "/performance/<portfolio_id>",
    methods=["GET"]
)
def performance(portfolio_id):

    try:

        runs = (
            supabase
            .table("optimization_runs")
            .select("*")
            .eq(
                "portfolio_id",
                portfolio_id
            )
            .order(
                "created_at",
                desc=False
            )
            .execute()
            .data
        )

        return jsonify({
            "performance": runs
        })

    except Exception as e:

        print(
            "PERFORMANCE ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Failed to fetch performance: "
                f"{str(e)}"
            )
        }), 500


# ============================================================
# MANUAL PRICE TICK
# ============================================================

@app.route(
    "/tick-now",
    methods=["POST"]
)
def tick_now():

    try:

        result = start_scheduler(
            run_once=True
        )

        return jsonify({

            "success":
                True,

            "message":
                "Market prices updated.",

            "result":
                result

        })

    except TypeError:

        try:

            result = start_scheduler()

            return jsonify({

                "success":
                    True,

                "message":
                    "Price scheduler started.",

                "result":
                    result

            })

        except Exception as e:

            print(
                "TICK FALLBACK ERROR:",
                repr(e)
            )

            return jsonify({
                "error": str(e)
            }), 500

    except Exception as e:

        print(
            "TICK ERROR:",
            repr(e)
        )

        return jsonify({
            "error": (
                "Price update failed: "
                f"{str(e)}"
            )
        }), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print()
    print("========================================")
    print("Starting FinTech Optimization Backend")
    print("========================================")
    print()

    start_scheduler()

    app.run(
        debug=True,
        port=5000
    )