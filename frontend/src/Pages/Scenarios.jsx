import { useState } from "react";
import { Activity, ShieldAlert, Zap } from "lucide-react";
import { supabase } from "../supabaseClient";

import ScenarioForm from "../Components/ScenarioForm";
import ScenarioResult from "../Components/ScenarioResult";

function Scenarios() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // CALCULATE SCENARIO
  // ============================================================

  const calculateScenario = (
    scenario,
    shock,
    weights,
    capital
  ) => {
    const shockDecimal = shock / 100;

    let scenarioImpacts = {};

    // ----------------------------------------------------------
    // MARKET CRASH
    // Example:
    // Equity = -20%
    // Bonds = -6%
    // Gold = -4%
    // Cash = 0%
    // ----------------------------------------------------------

    if (scenario === "Market Crash") {
      scenarioImpacts = {
        Equity: shockDecimal,
        Bonds: shockDecimal * 0.30,
        "Mutual Funds": shockDecimal * 0.80,
        Gold: shockDecimal * 0.20,
        Cash: 0,
        "Real Estate": shockDecimal * 0.60,
      };
    }

    // ----------------------------------------------------------
    // INTEREST RATE INCREASE
    // ----------------------------------------------------------

    else if (scenario === "Interest Rate Increase") {
      scenarioImpacts = {
        Equity: shockDecimal * 0.40,
        Bonds: shockDecimal * -0.80,
        "Mutual Funds": shockDecimal * -0.30,
        Gold: shockDecimal * -0.20,
        Cash: shockDecimal * 0.20,
        "Real Estate": shockDecimal * -0.50,
      };
    }

    // ----------------------------------------------------------
    // INFLATION SHOCK
    // ----------------------------------------------------------

    else if (scenario === "Inflation Shock") {
      scenarioImpacts = {
        Equity: shockDecimal * -0.40,
        Bonds: shockDecimal * -0.60,
        "Mutual Funds": shockDecimal * -0.30,
        Gold: shockDecimal * 0.80,
        Cash: shockDecimal * -0.20,
        "Real Estate": shockDecimal * 0.50,
      };
    }

    // ----------------------------------------------------------
    // GOLD PRICE DROP
    // ----------------------------------------------------------

    else if (scenario === "Gold Price Drop") {
      scenarioImpacts = {
        Equity: 0,
        Bonds: 0,
        "Mutual Funds": 0,
        Gold: shockDecimal,
        Cash: 0,
        "Real Estate": 0,
      };
    }

    // ----------------------------------------------------------
    // EQUITY MARKET DECLINE
    // ----------------------------------------------------------

    else if (scenario === "Equity Market Decline") {
      scenarioImpacts = {
        Equity: shockDecimal,
        Bonds: shockDecimal * 0.10,
        "Mutual Funds": shockDecimal * 0.70,
        Gold: shockDecimal * 0.10,
        Cash: 0,
        "Real Estate": shockDecimal * 0.50,
      };
    }

    // ----------------------------------------------------------
    // WEIGHTED PORTFOLIO IMPACT
    //
    // Portfolio Impact =
    // Equity Weight × Equity Shock
    // + Bonds Weight × Bonds Shock
    // + ...
    // ----------------------------------------------------------

    let portfolioImpact = 0;

    const assetImpacts = [];

    Object.entries(weights).forEach(
      ([assetClass, weight]) => {
        const numericWeight = Number(weight) || 0;

        const assetShock =
          Number(scenarioImpacts[assetClass]) || 0;

        const contribution =
          numericWeight * assetShock;

        portfolioImpact += contribution;

        assetImpacts.push({
          assetClass,
          weight: numericWeight,
          shock: assetShock,
          impact: contribution,
        });
      }
    );

    // ----------------------------------------------------------
    // CONVERT TO %
    // ----------------------------------------------------------

    const portfolioImpactPercent =
      portfolioImpact * 100;

    // ----------------------------------------------------------
    // LOSS
    //
    // If impact = -10.60%
    // loss = 10.60%
    //
    // If impact = +5%
    // loss = 0%
    // ----------------------------------------------------------

    const estimatedLossPercent = Math.max(
      0,
      -portfolioImpactPercent
    );

    const estimatedLossAmount =
      capital *
      (estimatedLossPercent / 100);

    // ----------------------------------------------------------
    // PORTFOLIO VALUE AFTER STRESS
    // ----------------------------------------------------------

    const estimatedPortfolioValue =
      Math.max(
        0,
        capital - estimatedLossAmount
      );

    // ----------------------------------------------------------
    // REMAINING VALUE %
    // ----------------------------------------------------------

    const remainingValue =
      capital > 0
        ? (estimatedPortfolioValue / capital) * 100
        : 0;

    // ----------------------------------------------------------
    // RISK LEVEL
    // ----------------------------------------------------------

    let riskLevel = "Low";

    if (estimatedLossPercent >= 15) {
      riskLevel = "High";
    } else if (estimatedLossPercent >= 7) {
      riskLevel = "Medium";
    }

    return {
      scenario,
      shock,

      portfolioImpact:
        Number(
          portfolioImpactPercent.toFixed(2)
        ),

      estimatedLoss:
        Number(
          estimatedLossPercent.toFixed(2)
        ),

      estimatedLossAmount:
        Number(
          estimatedLossAmount.toFixed(2)
        ),

      estimatedPortfolioValue:
        Number(
          estimatedPortfolioValue.toFixed(2)
        ),

      capital:

        Number(
          capital.toFixed(2)
        ),

      remainingValue:
        Number(
          remainingValue.toFixed(2)
        ),

      riskLevel,

      assetImpacts,
    };
  };

  // ============================================================
  // HANDLE SCENARIO
  // ============================================================

  const handleScenario = async (event) => {
    event.preventDefault();

    const formData =
      new FormData(event.target);

    const scenario =
      formData.get("scenario");

    const shock =
      Number(formData.get("shock"));

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!scenario) {
      alert("Please select a scenario.");
      return;
    }

    if (
      Number.isNaN(shock) ||
      shock === 0
    ) {
      alert("Please enter a valid non-zero market shock.");
      return;
    }

    // For crash/drop scenarios, shock should normally be negative.
    const negativeShockScenarios = [
      "Market Crash",
      "Gold Price Drop",
      "Equity Market Decline",
    ];

    if (
      negativeShockScenarios.includes(scenario) &&
      shock > 0
    ) {
      alert(
        "For this scenario, enter the market shock as a negative value. Example: -20"
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // ========================================================
      // 1. GET LOGGED-IN USER
      // ========================================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("User error:", userError);
      }

      if (!user) {
        throw new Error(
          "Please login first."
        );
      }

      console.log(
        "Logged-in user:",
        user.id
      );

      // ========================================================
      // 2. GET LATEST PORTFOLIO
      // ========================================================

      const {
        data: portfolio,
        error: portfolioError,
      } = await supabase
        .from("portfolios")
        .select(
          "id, user_id, capital, created_at"
        )
        .eq(
          "user_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();

      console.log(
        "Portfolio:",
        portfolio
      );

      if (portfolioError) {
        console.error(
          "Portfolio error:",
          portfolioError
        );

        throw new Error(
          `Unable to load portfolio: ${portfolioError.message}`
        );
      }

      if (!portfolio) {
        throw new Error(
          "No portfolio exists for this logged-in user. Please create or optimize a portfolio first."
        );
      }

      // ========================================================
      // 3. GET CURRENT HOLDINGS
      // ========================================================

      const {
        data: holdings,
        error: holdingsError,
      } = await supabase
        .from("portfolio_holdings")
        .select(
          "asset_id, weight, is_current"
        )
        .eq(
          "portfolio_id",
          portfolio.id
        )
        .eq(
          "is_current",
          true
        );

      console.log(
        "Current holdings:",
        holdings
      );

      if (holdingsError) {
        console.error(
          "Holdings error:",
          holdingsError
        );

        throw new Error(
          `Unable to load portfolio holdings: ${holdingsError.message}`
        );
      }

      if (
        !holdings ||
        holdings.length === 0
      ) {
        throw new Error(
          "This portfolio has no current holdings. Please apply an optimization first."
        );
      }

      // ========================================================
      // 4. GET ASSET DETAILS
      // ========================================================

      const assetIds =
        holdings
          .map(
            (holding) =>
              holding.asset_id
          )
          .filter(Boolean);

      if (assetIds.length === 0) {
        throw new Error(
          "No assets were found in the current portfolio."
        );
      }

      const {
        data: assets,
        error: assetsError,
      } = await supabase
        .from("assets")
        .select(
          "id, asset_class, name"
        )
        .in(
          "id",
          assetIds
        );

      console.log(
        "Assets:",
        assets
      );

      if (assetsError) {
        console.error(
          "Assets error:",
          assetsError
        );

        throw new Error(
          `Unable to load asset information: ${assetsError.message}`
        );
      }

      if (
        !assets ||
        assets.length === 0
      ) {
        throw new Error(
          "No asset information was found for the current holdings."
        );
      }

      // ========================================================
      // 5. CREATE ASSET MAP
      // ========================================================

      const assetMap = {};

      assets.forEach(
        (asset) => {
          assetMap[asset.id] = asset;
        }
      );

      // ========================================================
      // 6. CALCULATE CURRENT WEIGHTS BY ASSET CLASS
      // ========================================================

      const weights = {};

      holdings.forEach(
        (holding) => {
          const asset =
            assetMap[
              holding.asset_id
            ];

          if (!asset) {
            return;
          }

          const assetClass =
            asset.asset_class;

          const weight =
            Number(
              holding.weight
            ) || 0;

          weights[assetClass] =
            (
              weights[assetClass] || 0
            ) + weight;
        }
      );

      console.log(
        "Current portfolio weights:",
        weights
      );

      // ========================================================
      // 7. CHECK WEIGHTS
      // ========================================================

      const totalWeight =
        Object.values(weights).reduce(
          (sum, weight) =>
            sum + Number(weight),
          0
        );

      console.log(
        "Total portfolio weight:",
        totalWeight
      );

      if (totalWeight <= 0) {
        throw new Error(
          "Current portfolio allocation is invalid."
        );
      }

      // ========================================================
      // 8. CAPITAL
      // ========================================================

      const capital =
  Number(
    portfolio.capital
  ) || 0;
      console.log(
        "Portfolio capital:",
        capital
      );

      if (capital <= 0) {
        throw new Error(
          "Portfolio capital is not available."
        );
      }

      // ========================================================
      // 9. CALCULATE SCENARIO
      // ========================================================

      const scenarioResult =
        calculateScenario(
          scenario,
          shock,
          weights,
          capital
        );

      // Add current allocation to result
      scenarioResult.currentAllocation =
        weights;

      scenarioResult.portfolioId =
        portfolio.id;

      console.log(
        "Final Scenario Result:",
        scenarioResult
      );

      setResult(
        scenarioResult
      );
    }

    catch (error) {
      console.error(
        "Scenario failed:",
        error
      );

      alert(
        error.message ||
        "Unable to run scenario."
      );
    }

    finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="pt-20 p-6 md:p-8 bg-slate-100 min-h-screen">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>

            <div className="flex items-center gap-2 mb-3">

              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">

                <Activity size={14} />

                STRESS TESTING

              </span>

            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">

              Scenarios & Stress Testing

            </h1>

            <p className="text-slate-500 mt-2 max-w-2xl">

              Test how your current portfolio could
              respond to different market conditions
              and potential financial shocks.

            </p>

          </div>

          {/* SIMULATION MODE */}

          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">

            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">

              <ShieldAlert
                size={20}
                className="text-purple-600"
              />

            </div>

            <div>

              <p className="text-xs text-slate-400">
                Simulation Mode
              </p>

              <p className="text-sm font-semibold text-slate-700">
                Current Portfolio Stress Test
              </p>

            </div>

          </div>

        </div>

        {/* INFO CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">

                <Activity
                  size={20}
                  className="text-blue-600"
                />

              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  Current Portfolio
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Uses your latest holdings
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">

                <Zap
                  size={20}
                  className="text-amber-600"
                />

              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  Stress Scenario
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Simulate adverse conditions
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">

                <ShieldAlert
                  size={20}
                  className="text-green-600"
                />

              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  Risk Assessment
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Estimate potential losses
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* MAIN CONTENT */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CREATE SCENARIO */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">

                  <Zap
                    size={20}
                    className="text-purple-600"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-800">
                    Create Scenario
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Test your current portfolio against a market shock.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6">

              <ScenarioForm
                onSubmit={handleScenario}
                loading={loading}
              />

            </div>

          </div>

          {/* SCENARIO RESULT */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">

                  <Activity
                    size={20}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-800">
                    Scenario Impact
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Estimated effect on your current portfolio.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6">

              <ScenarioResult
                result={result}
              />

            </div>

          </div>

        </div>

        {/* INFORMATION */}

        <div className="mt-6 bg-slate-800 rounded-2xl p-6 text-white">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">

                <ShieldAlert size={22} />

              </div>

              <div>

                <h3 className="font-semibold text-lg">
                  Why use stress testing?
                </h3>

                <p className="text-sm text-slate-300 mt-1 max-w-2xl">

                  Stress testing shows how your current
                  portfolio may behave during market
                  downturns, volatility spikes and other
                  adverse financial conditions.

                </p>

              </div>

            </div>

            <div className="flex items-center gap-2 text-sm text-slate-300">

              <Activity size={16} />

              <span>
                Risk analysis before action
              </span>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

export default Scenarios;