import {
  TrendingUp,
  ShieldAlert,
  BarChart3,
  PieChart,
  CheckCircle2,
  Check,
} from "lucide-react";

function OptimizationResult({
  result,
  onApply,
  applying = false,
  applied = false,
  applyError = "",
}) {
  const formatPercentage = (value) => {
    if (value === undefined || value === null || value === "") {
      return "--";
    }

    return `${(Number(value) * 100).toFixed(2)}%`;
  };

  const formatMetric = (value, suffix = "") => {
    if (value === undefined || value === null || value === "") {
      return "--";
    }

    return `${Number(value).toFixed(2)}${suffix}`;
  };

  const allocations = [
    {
      name: "Equity",
      value: result?.equity,
      label: "Equity",
      bar: "bg-blue-500",
      icon: "E",
    },
    {
      name: "Bonds",
      value: result?.bonds,
      label: "Bonds",
      bar: "bg-emerald-500",
      icon: "B",
    },
    {
      name: "Gold",
      value: result?.gold,
      label: "Gold",
      bar: "bg-amber-500",
      icon: "G",
    },
    {
      name: "Cash",
      value: result?.cash,
      label: "Cash",
      bar: "bg-purple-500",
      icon: "C",
    },
  ];

  const totalAllocation = allocations.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between">

          <div className="flex items-start gap-4">

            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <PieChart size={22} className="text-emerald-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Optimization Result
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Recommended portfolio allocation
              </p>
            </div>

          </div>

          {result && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <CheckCircle2 size={14} />
              Optimized
            </div>
          )}

        </div>
      </div>

      {!result ? (

        /* Empty state */
        <div className="min-h-[520px] flex flex-col items-center justify-center px-8 text-center">

          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
            <BarChart3 size={34} className="text-slate-300" />
          </div>

          <h3 className="text-base font-semibold text-slate-700">
            No optimization yet
          </h3>

          <p className="text-sm text-slate-400 mt-2 max-w-xs leading-6">
            Set your portfolio constraints on the left and run the optimizer
            to see the recommended allocation.
          </p>

        </div>

      ) : (

        <div className="p-6">

          {/* Allocation header */}
          <div className="flex items-center justify-between mb-4">

            <div>
              <h3 className="text-sm font-semibold text-slate-700">
                Recommended Allocation
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Optimized distribution across asset classes
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Total
              </p>

              <p className="text-sm font-bold text-slate-700">
                {(totalAllocation * 100).toFixed(2)}%
              </p>
            </div>

          </div>

          {/* Allocation cards */}
          <div className="space-y-3">

            {allocations.map((item) => {

              const percentage =
                Number(item.value || 0) * 100;

              return (
                <div
                  key={item.name}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div
                        className={`w-9 h-9 rounded-lg ${item.bar} flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {item.icon}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {item.label}
                        </p>

                        <p className="text-xs text-slate-400">
                          Portfolio allocation
                        </p>
                      </div>

                    </div>

                    <p className="text-base font-bold text-slate-800">
                      {formatPercentage(item.value)}
                    </p>

                  </div>

                  <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">

                    <div
                      className={`h-full ${item.bar} rounded-full transition-all duration-700`}
                      style={{
                        width: `${Math.min(
                          Math.max(percentage, 0),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>
              );
            })}

          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">

            {/* Expected Return */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">

              <div className="flex items-center gap-2">

                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp
                    size={17}
                    className="text-emerald-600"
                  />
                </div>

                <p className="text-xs font-medium text-emerald-700">
                  Expected Return
                </p>

              </div>

              <p className="text-xl font-bold text-slate-800 mt-3">
                {formatMetric(result.expectedReturn, "%")}
              </p>

            </div>

            {/* Portfolio Risk */}
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">

              <div className="flex items-center gap-2">

                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <ShieldAlert
                    size={17}
                    className="text-amber-600"
                  />
                </div>

                <p className="text-xs font-medium text-amber-700">
                  Portfolio Risk
                </p>

              </div>

              <p className="text-xl font-bold text-slate-800 mt-3">
                {formatMetric(result.portfolioRisk, "%")}
              </p>

            </div>

            {/* Sharpe */}
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">

              <div className="flex items-center gap-2">

                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BarChart3
                    size={17}
                    className="text-blue-600"
                  />
                </div>

                <p className="text-xs font-medium text-blue-700">
                  Sharpe Ratio
                </p>

              </div>

              <p className="text-xl font-bold text-slate-800 mt-3">
                {formatMetric(result.sharpeRatio)}
              </p>

            </div>

          </div>

          {/* Apply section */}
          <div className="mt-6 pt-5 border-t border-slate-200">

            {applyError && (
              <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {applyError}
              </div>
            )}

            {applied && (
              <div className="mb-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                <CheckCircle2 size={17} />
                Optimization applied successfully.
              </div>
            )}

            <button
              type="button"
              onClick={onApply}
              disabled={applying || applied}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-3.5 transition-all shadow-sm hover:shadow-md"
            >

              {applying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Applying...
                </>
              ) : applied ? (
                <>
                  <Check size={18} />
                  Optimization Applied
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Apply Optimization
                </>
              )}

            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default OptimizationResult;