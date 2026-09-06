
function RiskRuleCard({
  ruleName,
  currentValue,
  threshold,
  status
}) {
  const isBreached =
    status?.toLowerCase() === "breached";

  const isHealthy =
    status?.toLowerCase() === "healthy";

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-200 hover:shadow-md ${
        isBreached
          ? "border-red-200"
          : isHealthy
          ? "border-green-200"
          : "border-slate-200"
      }`}
    >

      {/* Top Status Bar */}

      <div
        className={`h-1 ${
          isBreached
            ? "bg-red-500"
            : isHealthy
            ? "bg-green-500"
            : "bg-blue-500"
        }`}
      />

      <div className="p-6">

        {/* Header */}

        <div className="flex items-start justify-between gap-3">

          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              {ruleName ?? "--"}
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Portfolio risk control
            </p>
          </div>

          <span
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${
              isBreached
                ? "bg-red-100 text-red-700"
                : isHealthy
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {status ?? "--"}
          </span>

        </div>

        {/* Values */}

        <div className="grid grid-cols-2 gap-3 mt-6">

          {/* Current Value */}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

            <p className="text-xs font-medium text-slate-500">
              Current Value
            </p>

            <p className="text-2xl font-bold text-slate-800 mt-2">
              {currentValue !== null &&
              currentValue !== undefined
                ? `${Number(currentValue).toFixed(2)}%`
                : "--"}
            </p>

          </div>

          {/* Threshold */}

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">

            <p className="text-xs font-medium text-blue-600">
              Threshold
            </p>

            <p className="text-2xl font-bold text-blue-700 mt-2">
              {threshold !== null &&
              threshold !== undefined
                ? `${Number(threshold).toFixed(2)}%`
                : "--"}
            </p>

          </div>

        </div>

        {/* Comparison Bar */}

        {currentValue !== null &&
          currentValue !== undefined &&
          threshold !== null &&
          threshold !== undefined && (
            <div className="mt-5">

              <div className="flex items-center justify-between mb-2">

                <p className="text-xs font-medium text-slate-500">
                  Limit Utilization
                </p>

                <p
                  className={`text-xs font-semibold ${
                    isBreached
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {Number(threshold) > 0
                    ? `${(
                        (Number(currentValue) /
                          Number(threshold)) *
                        100
                      ).toFixed(1)}%`
                    : "--"}
                </p>

              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className={`h-full rounded-full transition-all ${
                    isBreached
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      Number(threshold) > 0
                        ? (Number(currentValue) /
                            Number(threshold)) *
                            100
                        : 0,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>
          )}

      </div>

    </div>
  );
}

export default RiskRuleCard;
