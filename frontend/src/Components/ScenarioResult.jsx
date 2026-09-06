function ScenarioResult({ result }) {
  if (!result) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center text-center">

        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">

          <span className="text-2xl">
            📊
          </span>

        </div>

        <h3 className="text-lg font-semibold text-slate-700">
          No Scenario Run Yet
        </h3>

        <p className="text-sm text-slate-400 mt-2 max-w-sm">

          Select a scenario and enter a market shock
          to see the estimated impact on your current portfolio.

        </p>

      </div>
    );
  }

  const isHigh =
    result.riskLevel === "High";

  const isMedium =
    result.riskLevel === "Medium";

  return (
    <div className="space-y-5">

      {/* SCENARIO */}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

        <p className="text-xs font-medium text-slate-500">
          Selected Scenario
        </p>

        <p className="text-lg font-bold text-slate-800 mt-1">
          {result.scenario}
        </p>

      </div>

      {/* CURRENT PORTFOLIO */}

      {result.currentAllocation &&
        Object.keys(result.currentAllocation).length > 0 && (

          <div className="border border-slate-200 rounded-xl overflow-hidden">

            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">

              <p className="text-sm font-semibold text-slate-700">
                Current Portfolio Allocation
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Allocation used for this stress test
              </p>

            </div>

            <div className="divide-y divide-slate-100">

              {Object.entries(
                result.currentAllocation
              ).map(
                ([assetClass, weight]) => (

                  <div
                    key={assetClass}
                    className="px-4 py-3 flex items-center justify-between"
                  >

                    <p className="text-sm font-semibold text-slate-700">
                      {assetClass}
                    </p>

                    <p className="text-sm font-bold text-blue-600">
                      {(
                        Number(weight) * 100
                      ).toFixed(2)}%
                    </p>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      {/* SHOCK + IMPACT */}

      <div className="grid grid-cols-2 gap-4">

        <div className="bg-red-50 border border-red-100 rounded-xl p-4">

          <p className="text-xs font-medium text-red-600">
            Market Shock
          </p>

          <p className="text-2xl font-bold text-red-700 mt-2">

            {result.shock > 0
              ? "+"
              : ""}

            {Number(
              result.shock
            ).toFixed(2)}%

          </p>

        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">

          <p className="text-xs font-medium text-amber-600">
            Portfolio Impact
          </p>

          <p
            className={`text-2xl font-bold mt-2 ${
              result.portfolioImpact < 0
                ? "text-red-700"
                : "text-green-700"
            }`}
          >

            {result.portfolioImpact > 0
              ? "+"
              : ""}

            {Number(
              result.portfolioImpact
            ).toFixed(2)}%

          </p>

        </div>

      </div>

      {/* LOSS */}

      <div className="bg-red-50 border border-red-100 rounded-xl p-5">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs font-medium text-red-600">
              Estimated Loss
            </p>

            <p className="text-2xl font-bold text-red-700 mt-1">

              ₹
              {Number(
                result.estimatedLossAmount
              ).toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}

            </p>

          </div>

          <div className="text-right">

            <p className="text-xs text-slate-500">
              Loss Percentage
            </p>

            <p className="text-sm font-semibold text-red-600 mt-1">

              {Number(
                result.estimatedLoss
              ).toFixed(2)}%

            </p>

          </div>

        </div>

      </div>

      {/* PORTFOLIO VALUE */}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs font-medium text-blue-600">
              Estimated Portfolio Value
            </p>

            <p className="text-3xl font-bold text-blue-700 mt-1">

              ₹
              {Number(
                result.estimatedPortfolioValue
              ).toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}

            </p>

          </div>

          <div className="text-right">

            <p className="text-xs text-slate-500">
              Original Capital
            </p>

            <p className="text-sm font-semibold text-slate-700 mt-1">

              ₹
              {Number(
                result.capital
              ).toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}

            </p>

          </div>

        </div>

        {/* PROGRESS */}

        <div className="w-full h-2 bg-white rounded-full mt-4 overflow-hidden">

          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(
                0,
                Math.min(
                  Number(
                    result.remainingValue
                  ),
                  100
                )
              )}%`,
            }}
          />

        </div>

        <div className="flex justify-between mt-2">

          <span className="text-xs text-slate-400">
            Value after stress
          </span>

          <span className="text-xs font-semibold text-blue-600">

            {Number(
              result.remainingValue
            ).toFixed(2)}%

          </span>

        </div>

      </div>

      {/* RISK */}

      <div
        className={`rounded-xl p-4 border ${
          isHigh
            ? "bg-red-50 border-red-200"
            : isMedium
            ? "bg-amber-50 border-amber-200"
            : "bg-green-50 border-green-200"
        }`}
      >

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs text-slate-500">
              Risk Assessment
            </p>

            <p
              className={`text-lg font-bold mt-1 ${
                isHigh
                  ? "text-red-700"
                  : isMedium
                  ? "text-amber-700"
                  : "text-green-700"
              }`}
            >
              {result.riskLevel} Risk
            </p>

          </div>

          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              isHigh
                ? "bg-red-100 text-red-700"
                : isMedium
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            }`}
          >

            {isHigh
              ? "Critical"
              : isMedium
              ? "Moderate"
              : "Stable"}

          </span>

        </div>

      </div>

      {/* ASSET IMPACT */}

      {result.assetImpacts &&
        result.assetImpacts.length > 0 && (

          <div className="border border-slate-200 rounded-xl overflow-hidden">

            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">

              <p className="text-sm font-semibold text-slate-700">
                Asset Impact Breakdown
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Contribution of each asset class to the portfolio impact
              </p>

            </div>

            <div className="divide-y divide-slate-100">

              {result.assetImpacts.map(
                (asset) => (

                  <div
                    key={asset.assetClass}
                    className="px-4 py-3"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm font-semibold text-slate-700">
                          {asset.assetClass}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">

                          Portfolio Weight:{" "}
                          {(
                            Number(
                              asset.weight
                            ) * 100
                          ).toFixed(2)}%

                        </p>

                      </div>

                      <div className="text-right">

                        <p
                          className={`text-sm font-bold ${
                            asset.impact < 0
                              ? "text-red-600"
                              : asset.impact > 0
                              ? "text-green-600"
                              : "text-slate-500"
                          }`}
                        >

                          {asset.impact > 0
                            ? "+"
                            : ""}

                          {(
                            Number(
                              asset.impact
                            ) * 100
                          ).toFixed(2)}%

                        </p>

                        <p className="text-xs text-slate-400 mt-1">

                          Scenario Shock:{" "}
                          {asset.shock > 0
                            ? "+"
                            : ""}

                          {(
                            Number(
                              asset.shock
                            ) * 100
                          ).toFixed(2)}%

                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        )}

    </div>
  );
}

export default ScenarioResult;