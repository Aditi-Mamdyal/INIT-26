import {
  TrendingUp,
  ShieldCheck,
  BarChart3,
  CheckCircle,
  Zap,
  WalletCards,
} from "lucide-react";

function OptimizationResult({
  result,
  onApply,
  applying = false,
}) {
  if (!result) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex items-center justify-center min-h-[400px]">

        <div className="text-center">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <BarChart3
              size={26}
              className="text-slate-400"
            />
          </div>

          <h2 className="text-lg font-semibold text-slate-700">
            Optimization Results
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            Configure your portfolio and click
            "Optimize Portfolio" to see the recommended allocation.
          </p>

        </div>

      </div>
    );
  }

  const weights = result.weights || {};

  /*
    Use selectedAssets when available so that assets with
    0% allocation are also displayed.
  */
  const selectedAssets =
    result.selectedAssets &&
    result.selectedAssets.length > 0
      ? result.selectedAssets
      : Object.keys(weights);

  const totalWeight = selectedAssets.reduce(
    (total, asset) =>
      total + Number(weights[asset] || 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle
              size={23}
              className="text-green-600"
            />
          </div>

          <div>

            <h2 className="text-lg font-semibold text-slate-800">
              Recommended Allocation
            </h2>

            <p className="text-sm text-slate-500">
              Based on your selected constraints.
            </p>

          </div>

        </div>

      </div>

      <div className="p-6 space-y-6">

        {/* Asset allocation */}
        <div>

          <div className="flex items-center justify-between mb-3">

            <h3 className="text-sm font-semibold text-slate-700">
              Asset Allocation
            </h3>

            <span className="text-xs font-semibold text-slate-500">
              Total: {(totalWeight * 100).toFixed(2)}%
            </span>

          </div>

          <div className="space-y-3">

            {selectedAssets.map((asset) => {

              const weight = Number(
                weights[asset] || 0
              );

              const percentage = weight * 100;

              const capital =
                Number(result.capital || 0) * weight;

              return (
                <div
                  key={asset}
                  className="border border-slate-200 rounded-xl p-4"
                >

                  <div className="flex justify-between items-center mb-2">

                    <span className="text-sm font-semibold text-slate-700">
                      {asset}
                    </span>

                    <span className="text-sm font-bold text-blue-600">
                      {percentage.toFixed(2)}%
                    </span>

                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          Math.max(percentage, 0),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                  <div className="flex justify-between mt-2">

                    <span className="text-[11px] text-slate-400">
                      Recommended allocation
                    </span>

                    {result.capital && (
                      <span className="text-[11px] font-medium text-slate-500">
                        ₹{capital.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">

          <div className="rounded-xl bg-blue-50 p-4">

            <TrendingUp
              size={18}
              className="text-blue-600 mb-2"
            />

            <p className="text-xs text-slate-500">
              Expected Return
            </p>

            <p className="text-lg font-bold text-slate-800">
              {Number(
                result.expectedReturn * 100
              ).toFixed(2)}
              %
            </p>

          </div>

          <div className="rounded-xl bg-amber-50 p-4">

            <ShieldCheck
              size={18}
              className="text-amber-600 mb-2"
            />

            <p className="text-xs text-slate-500">
              Portfolio Risk
            </p>

            <p className="text-lg font-bold text-slate-800">
              {Number(
                result.portfolioRisk * 100
              ).toFixed(2)}
              %
            </p>

          </div>

          <div className="rounded-xl bg-green-50 p-4">

            <BarChart3
              size={18}
              className="text-green-600 mb-2"
            />

            <p className="text-xs text-slate-500">
              Sharpe Ratio
            </p>

            <p className="text-lg font-bold text-slate-800">
              {Number(
                result.sharpeRatio
              ).toFixed(2)}
            </p>

          </div>

        </div>

        {/* Optimization summary */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">

          <div className="flex items-center gap-2 mb-3">

            <WalletCards
              size={17}
              className="text-blue-600"
            />

            <h3 className="text-sm font-semibold text-slate-700">
              Optimization Summary
            </h3>

          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">

            <div>
              <p className="text-slate-400">
                Assets considered
              </p>

              <p className="font-semibold text-slate-700 mt-1">
                {selectedAssets.length}
              </p>
            </div>

            <div>
              <p className="text-slate-400">
                Total allocation
              </p>

              <p className="font-semibold text-slate-700 mt-1">
                {(totalWeight * 100).toFixed(2)}%
              </p>
            </div>

          </div>

        </div>

        {/* Apply button */}
        <button
          type="button"
          onClick={onApply}
          disabled={applying}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-3.5 transition"
        >

          {applying ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Zap size={18} />
              Apply Optimization
            </>
          )}

        </button>

      </div>

    </div>
  );
}

export default OptimizationResult;