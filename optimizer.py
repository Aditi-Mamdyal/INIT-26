import pandas as pd
from pypfopt import EfficientFrontier, expected_returns, risk_models


def optimize(price_df, max_weights, max_single_asset=1.0, min_weights=None):
    """
    price_df: DataFrame, columns = asset_class names, rows = price history
    max_weights: {"Equity": 0.6, "Gold": 0.3, ...} — per-class caps
    max_single_asset: float (0-1) — generic ceiling applied to every asset
    min_weights: {"Cash": 0.15, ...} — per-class floors (e.g. liquidity)
    """
    price_df = price_df.ffill().bfill()  # guard against gaps/NaN

    mu = expected_returns.mean_historical_return(price_df, frequency=252)
    S = risk_models.sample_cov(price_df, frequency=252)

    ef = EfficientFrontier(mu, S)

    for cls in price_df.columns:
        idx = price_df.columns.get_loc(cls)
        # effective cap = the tighter of (per-class cap) and (generic single-asset cap)
        cap = min(max_weights.get(cls, 1.0), max_single_asset)
        ef.add_constraint(lambda w, i=idx, c=cap: w[i] <= c)

    if min_weights:
        for cls, floor in min_weights.items():
            if cls not in price_df.columns:
                continue
            idx = price_df.columns.get_loc(cls)
            ef.add_constraint(lambda w, i=idx, f=floor: w[i] >= f)

    ef.max_sharpe()
    cleaned = ef.clean_weights()
    ret, vol, sharpe = ef.portfolio_performance()

    weights_clean = {str(k): float(v) for k, v in cleaned.items()}
    return weights_clean, float(ret), float(vol), float(sharpe)