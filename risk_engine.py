import numpy as np

def compute_returns(prices):
    """prices: list of floats, oldest first → returns list of % changes"""
    prices = np.array(prices)
    return np.diff(prices) / prices[:-1]

def evaluate(returns_by_asset_class, weights):
    """
    returns_by_asset_class: {"Equity": [r1, r2, ...], "Bonds": [...], ...}
    weights: {"Equity": 0.4, "Bonds": 0.3, "Gold": 0.2, "Cash": 0.1}
    Returns combined portfolio volatility and VaR.
    """
    min_len = min(len(v) for v in returns_by_asset_class.values())
    port_returns = np.zeros(min_len)

    for asset_class, w in weights.items():
        r = np.array(returns_by_asset_class[asset_class][:min_len])
        port_returns += r * w

    volatility = float(np.std(port_returns))
    var_95 = float(np.percentile(port_returns, 5))

    return {"volatility": volatility, "var_95": var_95}

def check_breaches(risk_values, weights, risk_rules):
    """
    risk_rules: list of {"metric": "max_equity", "threshold_value": 0.5}
    Returns a list of breach dicts.
    """
    breaches = []
    rule_map = {r["metric"]: r["threshold_value"] for r in risk_rules}

    if "max_volatility" in rule_map and risk_values["volatility"] > rule_map["max_volatility"]:
        breaches.append({"metric": "max_volatility", "value": risk_values["volatility"],
                          "threshold": rule_map["max_volatility"], "severity": "alert"})

    if "max_equity" in rule_map and weights.get("Equity", 0) > rule_map["max_equity"]:
        breaches.append({"metric": "max_equity", "value": weights["Equity"],
                          "threshold": rule_map["max_equity"], "severity": "alert"})

    if "max_gold" in rule_map and weights.get("Gold", 0) > rule_map["max_gold"]:
        breaches.append({"metric": "max_gold", "value": weights["Gold"],
                          "threshold": rule_map["max_gold"], "severity": "alert"})

    if "max_single_asset" in rule_map:
        for cls, w in weights.items():
            if w > rule_map["max_single_asset"]:
                breaches.append({"metric": "max_single_asset", "value": w,
                                  "threshold": rule_map["max_single_asset"], "severity": "alert"})

    if "min_liquidity" in rule_map and weights.get("Cash", 0) < rule_map["min_liquidity"]:
        breaches.append({"metric": "min_liquidity", "value": weights.get("Cash", 0),
                          "threshold": rule_map["min_liquidity"], "severity": "auto_intervene"})

    return breaches