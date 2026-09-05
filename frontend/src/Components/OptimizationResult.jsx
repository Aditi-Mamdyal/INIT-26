function OptimizationResult({ result }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

      <h2 className="text-lg font-semibold text-slate-800">
        Optimization Result
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        Recommended portfolio allocation
      </p>

      {!result ? (
        <div className="h-72 flex items-center justify-center">
          <p className="text-slate-400 text-center">
            Run optimization to view the recommended allocation.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">

          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3">
              Recommended Allocation
            </h3>

            <div className="grid grid-cols-2 gap-4">

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-500">Equity</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  {result.equity ?? "--"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-500">Bonds</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  {result.bonds ?? "--"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-500">Gold</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  {result.gold ?? "--"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-500">Cash</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  {result.cash ?? "--"}
                </p>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div>
              <p className="text-sm text-slate-500">
                Expected Return
              </p>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {result.expectedReturn ?? "--"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Portfolio Risk
              </p>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {result.portfolioRisk ?? "--"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Sharpe Ratio
              </p>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {result.sharpeRatio ?? "--"}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default OptimizationResult;