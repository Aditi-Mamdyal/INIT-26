import pandas as pd
import numpy as np
import cvxpy as cp


def optimize(
    price_df,
    max_weights,
    max_single_asset=1.0,
    min_weights=None,
    max_volatility=None,
    risk_tolerance="balanced"
):
    """
    Portfolio optimization.

    Features:
    - All selected assets are returned.
    - 0% allocation is allowed.
    - Maximum allocation rules are enforced.
    - Minimum allocation rules are enforced.
    - Maximum portfolio volatility is enforced.
    - Risk tolerance changes the objective.
    """

    # =========================================================
    # 1. CLEAN PRICE DATA
    # =========================================================

    price_df = price_df.copy()

    price_df = price_df.apply(
        pd.to_numeric,
        errors="coerce"
    )

    price_df = price_df.dropna(
        axis=1,
        how="all"
    )

    if price_df.empty or len(price_df.columns) == 0:
        raise ValueError(
            "No valid price data available."
        )

    price_df = price_df.sort_index()

    # =========================================================
    # 2. HANDLE MISSING VALUES
    # =========================================================

    price_df = price_df.ffill()

    price_df = price_df.dropna()

    if len(price_df) < 20:
        raise ValueError(
            "Not enough common price history for optimization."
        )

    # =========================================================
    # 3. USE RECENT COMMON HISTORY
    # =========================================================

    price_df = price_df.tail(60)

    if len(price_df) < 20:
        raise ValueError(
            "Not enough historical data for optimization."
        )

    assets = list(price_df.columns)

    print("\n========================================")
    print("OPTIMIZER DATA")
    print("========================================")
    print("Assets:", assets)
    print("Rows:", len(price_df))
    print("Start:", price_df.index.min())
    print("End:", price_df.index.max())
    print("========================================\n")

    # =========================================================
    # 4. CALCULATE DAILY RETURNS
    # =========================================================

    returns = price_df.pct_change().dropna()

    if returns.empty:
        raise ValueError(
            "Unable to calculate asset returns."
        )

    returns = returns.replace(
        [np.inf, -np.inf],
        np.nan
    ).dropna()

    if len(returns) < 10:
        raise ValueError(
            "Not enough return observations for optimization."
        )

    # =========================================================
    # 5. EXPECTED RETURNS
    # =========================================================

    daily_mean_returns = returns.mean()

    mu = daily_mean_returns * 252

    # Prevent unrealistic returns from synthetic/demo data
    mu = mu.clip(
        lower=-0.50,
        upper=0.50
    )

    # =========================================================
    # 6. COVARIANCE MATRIX
    # =========================================================

    S = returns.cov() * 252

    S = S.replace(
        [np.inf, -np.inf],
        0
    ).fillna(0)

    S = (S + S.T) / 2

    S = S + np.eye(len(assets)) * 1e-8

    covariance = S.values

    # =========================================================
    # 7. MAKE COVARIANCE MATRIX POSITIVE SEMIDEFINITE
    # =========================================================

    eigenvalues = np.linalg.eigvalsh(
        covariance
    )

    minimum_eigenvalue = eigenvalues.min()

    if minimum_eigenvalue < 0:

        covariance += (
            np.eye(len(assets))
            * (-minimum_eigenvalue + 1e-8)
        )

    # =========================================================
    # 8. CREATE OPTIMIZATION VARIABLES
    # =========================================================

    n_assets = len(assets)

    weights = cp.Variable(
        n_assets
    )

    # =========================================================
    # 9. BASIC CONSTRAINTS
    # =========================================================

    constraints = [

        cp.sum(weights) == 1,

        weights >= 0
    ]

    # =========================================================
    # 10. MAXIMUM WEIGHT CONSTRAINTS
    # =========================================================

    for i, asset in enumerate(assets):

        asset_cap = float(
            max_single_asset
        )

        if asset in max_weights:

            asset_cap = min(
                asset_cap,
                float(max_weights[asset])
            )

        asset_cap = max(
            0.0,
            min(1.0, asset_cap)
        )

        constraints.append(
            weights[i] <= asset_cap
        )

    # =========================================================
    # 11. MINIMUM WEIGHT CONSTRAINTS
    # =========================================================

    if min_weights:

        for asset, minimum in min_weights.items():

            if asset not in assets:
                continue

            minimum = float(
                minimum
            )

            minimum = max(
                0.0,
                min(1.0, minimum)
            )

            index = assets.index(
                asset
            )

            constraints.append(
                weights[index] >= minimum
            )

    # =========================================================
    # 12. CHECK MAXIMUM POSSIBLE ALLOCATION
    # =========================================================

    total_max = 0.0

    for asset in assets:

        asset_cap = float(
            max_single_asset
        )

        if asset in max_weights:

            asset_cap = min(
                asset_cap,
                float(max_weights[asset])
            )

        total_max += max(
            0.0,
            asset_cap
        )

    if total_max < 1.0:

        raise ValueError(
            f"The selected assets can reach only "
            f"{total_max * 100:.1f}% allocation. "
            f"Select more assets or increase the "
            f"maximum allocation limits."
        )

    # =========================================================
    # 13. CHECK MINIMUM ALLOCATION
    # =========================================================

    total_min = 0.0

    if min_weights:

        for asset, minimum in min_weights.items():

            if asset in assets:

                total_min += max(
                    0.0,
                    float(minimum)
                )

    if total_min > 1.0:

        raise ValueError(
            "Minimum allocation rules exceed 100%."
        )

    # =========================================================
    # 14. MAXIMUM PORTFOLIO VOLATILITY
    # =========================================================

    if max_volatility is not None:

        max_volatility = float(
            max_volatility
        )

        if max_volatility <= 0:

            raise ValueError(
                "Maximum volatility must be greater than 0."
            )

        portfolio_variance = cp.quad_form(
            weights,
            covariance
        )

        constraints.append(
            portfolio_variance
            <= max_volatility ** 2
        )

    # =========================================================
    # 15. RISK TOLERANCE
    # =========================================================

    risk_tolerance = str(
        risk_tolerance
    ).lower()

    if risk_tolerance == "conservative":

        risk_aversion = 8.0

    elif risk_tolerance == "aggressive":

        risk_aversion = 0.5

    else:

        risk_aversion = 2.0

    # =========================================================
    # 16. OBJECTIVE
    # =========================================================

    expected_return = (
        mu.values @ weights
    )

    portfolio_variance = cp.quad_form(
        weights,
        covariance
    )

    objective = cp.Maximize(
        expected_return
        - risk_aversion * portfolio_variance
    )

    problem = cp.Problem(
        objective,
        constraints
    )

    # =========================================================
    # 17. SOLVE
    # =========================================================

    try:

        problem.solve(
            solver=cp.CLARABEL
        )

    except Exception as e:

        print(
            "CLARABEL ERROR:",
            repr(e)
        )

        try:

            problem.solve(
                solver=cp.SCS,
                eps=1e-6,
                max_iters=20000
            )

        except Exception as e2:

            print(
                "SCS ERROR:",
                repr(e2)
            )

            raise ValueError(
                "Optimization solver failed."
            )

    # =========================================================
    # 18. CHECK SOLUTION
    # =========================================================

    if problem.status not in [
        cp.OPTIMAL,
        cp.OPTIMAL_INACCURATE
    ]:

        if problem.status in [
            cp.INFEASIBLE,
            cp.INFEASIBLE_INACCURATE
        ]:

            raise ValueError(
                "No portfolio can satisfy all the selected "
                "allocation and volatility constraints. "
                "Try increasing maximum volatility or "
                "relaxing an allocation limit."
            )

        raise ValueError(
            f"Optimization could not be completed. "
            f"Solver status: {problem.status}"
        )

    if weights.value is None:

        raise ValueError(
            "Optimizer did not produce an allocation."
        )

    # =========================================================
    # 19. CLEAN WEIGHTS
    # =========================================================

    raw_weights = np.array(
        weights.value
    ).flatten()

    raw_weights[
        np.abs(raw_weights) < 1e-6
    ] = 0

    raw_weights = np.maximum(
        raw_weights,
        0
    )

    total = raw_weights.sum()

    if total <= 0:

        raise ValueError(
            "Optimizer produced zero allocation."
        )

    raw_weights = (
        raw_weights / total
    )

    weights_clean = {}

    for i, asset in enumerate(assets):

        weights_clean[asset] = float(
            raw_weights[i]
        )

    # =========================================================
    # 20. PORTFOLIO RETURN
    # =========================================================

    portfolio_return = float(
        np.dot(
            raw_weights,
            mu.values
        )
    )

    # =========================================================
    # 21. PORTFOLIO VOLATILITY
    # =========================================================

    portfolio_variance_value = float(
        raw_weights
        @ covariance
        @ raw_weights
    )

    portfolio_variance_value = max(
        0.0,
        portfolio_variance_value
    )

    portfolio_volatility = float(
        np.sqrt(
            portfolio_variance_value
        )
    )

    # =========================================================
    # 22. SHARPE RATIO
    # =========================================================

    if portfolio_volatility > 1e-10:

        sharpe_ratio = (
            portfolio_return
            / portfolio_volatility
        )

    else:

        sharpe_ratio = 0.0

    # =========================================================
    # 23. DEBUG OUTPUT
    # =========================================================

    print("\n========================================")
    print("OPTIMIZATION RESULT")
    print("========================================")

    for asset, weight in weights_clean.items():

        print(
            f"{asset}: "
            f"{weight * 100:.2f}%"
        )

    print("----------------------------------------")

    print(
        "Expected Return:",
        f"{portfolio_return * 100:.2f}%"
    )

    print(
        "Portfolio Risk:",
        f"{portfolio_volatility * 100:.2f}%"
    )

    print(
        "Sharpe Ratio:",
        f"{sharpe_ratio:.2f}"
    )

    print(
        "Total Weight:",
        f"{sum(weights_clean.values()) * 100:.2f}%"
    )

    print("========================================\n")

    # =========================================================
    # 24. FINAL SAFETY CHECK
    # =========================================================

    total_weight = sum(
        weights_clean.values()
    )

    if abs(total_weight - 1.0) > 0.001:

        raise ValueError(
            "Optimizer produced an invalid allocation. "
            f"Total allocation is "
            f"{total_weight:.4f}."
        )

    # =========================================================
    # 25. RETURN
    # =========================================================

    return (
        weights_clean,
        portfolio_return,
        portfolio_volatility,
        sharpe_ratio
    )