import pandas as pd
from pypfopt import EfficientFrontier, expected_returns, risk_models

def optimize(price_df, max_weights):
    """
    price_df: DataFrame, columns = asset_class names, rows = price history
    max_weights: {"Equity": 0.5, "Gold": 0.3, ...}
    """
    mu = expected_returns.mean_historical_return(price_df, frequency=252)
    S = risk_models.sample_cov(price_df, frequency=252)

    ef = EfficientFrontier(mu, S)
    for cls, cap in max_weights.items():
        idx = price_df.columns.get_loc(cls)
        ef.add_constraint(lambda w, i=idx, c=cap: w[i] <= c)

    weights = ef.max_sharpe()
    cleaned = ef.clean_weights()
    ret, vol, sharpe = ef.portfolio_performance()

    return cleaned, ret, vol, sharpe