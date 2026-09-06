import numpy as np


def compute_returns(prices):
    """
    prices: list of prices, oldest first

    Returns:
        Daily percentage returns as decimals.
        Example:
        100 -> 105 = 0.05
    """

    prices = np.array(prices, dtype=float)

    if len(prices) < 2:
        return np.array([])

    prices = prices[np.isfinite(prices)]

    if len(prices) < 2:
        return np.array([])

    return np.diff(prices) / prices[:-1]


def evaluate(returns_by_asset_class, weights):
    """
    Calculate portfolio risk.

    Returns:
        volatility: annualized portfolio volatility as decimal
                    Example: 0.15 = 15%

        var_95: daily 95% Value at Risk as decimal
                Example: -0.02 = -2%
    """

    valid_returns = {}

    for asset_class, returns in returns_by_asset_class.items():

        if returns is None:
            continue

        values = np.array(returns, dtype=float)

        values = values[np.isfinite(values)]

        if len(values) > 0:
            valid_returns[asset_class] = values

    if not valid_returns:
        return {
            "volatility": 0.0,
            "var_95": 0.0
        }

    # Find common history length
    min_len = min(
        len(values)
        for values in valid_returns.values()
    )

    if min_len <= 1:
        return {
            "volatility": 0.0,
            "var_95": 0.0
        }

    # ---------------------------------------------------------
    # Calculate portfolio daily returns
    # ---------------------------------------------------------

    portfolio_returns = np.zeros(min_len)

    for asset_class, weight in weights.items():

        if asset_class not in valid_returns:
            continue

        asset_returns = valid_returns[asset_class][-min_len:]

        portfolio_returns += (
            asset_returns * float(weight)
        )

    # ---------------------------------------------------------
    # Daily volatility
    # ---------------------------------------------------------

    daily_volatility = float(
        np.std(
            portfolio_returns,
            ddof=1
        )
    )

    # ---------------------------------------------------------
    # Annualized volatility
    #
    # Correct formula:
    #
    # Annual volatility =
    # Daily volatility × sqrt(252)
    # ---------------------------------------------------------

    annualized_volatility = (
        daily_volatility * np.sqrt(252)
    )

    # ---------------------------------------------------------
    # Daily 95% VaR
    #
    # 5th percentile represents the lower 5% tail.
    # ---------------------------------------------------------

    var_95 = float(
        np.percentile(
            portfolio_returns,
            5
        )
    )

    return {
        "volatility": annualized_volatility,
        "var_95": var_95
    }


def check_breaches(
    risk_values,
    weights,
    risk_rules
):
    """
    Check portfolio against configured risk rules.

    IMPORTANT:
    Database thresholds are stored as decimals.

    Examples:
        0.50 = 50%
        0.30 = 30%
        0.40 = 40%
        0.10 = 10%
        0.25 = 25%

    Portfolio weights are also decimals.

    Therefore we DO NOT divide threshold_value by 100.
    """

    breaches = []

    # ---------------------------------------------------------
    # Create rule map
    # ---------------------------------------------------------

    rule_map = {}

    for rule in risk_rules:

        metric = rule["metric"]

        try:
            threshold = float(
                rule["threshold_value"]
            )
        except (TypeError, ValueError):
            continue

        rule_map[metric] = threshold

    # Small tolerance for floating-point calculations.
    tolerance = 1e-9

    # ---------------------------------------------------------
    # Maximum volatility
    # ---------------------------------------------------------

    if "max_volatility" in rule_map:

        volatility = float(
            risk_values.get("volatility", 0)
        )

        threshold = rule_map["max_volatility"]

        if volatility > threshold + tolerance:

            breaches.append({
                "metric": "max_volatility",
                "value": volatility,
                "threshold": threshold,
                "severity": "alert"
            })

    # ---------------------------------------------------------
    # Maximum equity
    # ---------------------------------------------------------

    equity_weight = float(
        weights.get("Equity", 0)
    )

    if "max_equity" in rule_map:

        threshold = rule_map["max_equity"]

        if equity_weight > threshold + tolerance:

            breaches.append({
                "metric": "max_equity",
                "value": equity_weight,
                "threshold": threshold,
                "severity": "alert"
            })

    # ---------------------------------------------------------
    # Maximum gold
    # ---------------------------------------------------------

    gold_weight = float(
        weights.get("Gold", 0)
    )

    if "max_gold" in rule_map:

        threshold = rule_map["max_gold"]

        if gold_weight > threshold + tolerance:

            breaches.append({
                "metric": "max_gold",
                "value": gold_weight,
                "threshold": threshold,
                "severity": "alert"
            })

    # ---------------------------------------------------------
    # Maximum single asset
    # ---------------------------------------------------------

    if "max_single_asset" in rule_map:

        threshold = rule_map["max_single_asset"]

        for asset_class, weight in weights.items():

            weight = float(weight)

            if weight > threshold + tolerance:

                breaches.append({
                    "metric": "max_single_asset",
                    "value": weight,
                    "threshold": threshold,
                    "severity": "alert"
                })

    # ---------------------------------------------------------
    # Minimum liquidity
    # ---------------------------------------------------------

    cash_weight = float(
        weights.get("Cash", 0)
    )

    if "min_liquidity" in rule_map:

        threshold = rule_map["min_liquidity"]

        if cash_weight < threshold - tolerance:

            breaches.append({
                "metric": "min_liquidity",
                "value": cash_weight,
                "threshold": threshold,
                "severity": "auto_intervene"
            })

    return breaches