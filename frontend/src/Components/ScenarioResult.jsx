function ScenarioResult({ result }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

      <h2 className="text-lg font-semibold text-slate-800">
        Scenario Result
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        Estimated impact on the portfolio
      </p>

      {!result ? (
        <div className="h-72 flex items-center justify-center">
          <p className="text-slate-400 text-center">
            Run a scenario to view its portfolio impact.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">
                Portfolio Value Before
              </p>

              <p className="text-xl font-bold text-slate-800 mt-1">
                {result.valueBefore ?? "--"}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">
                Portfolio Value After
              </p>

              <p className="text-xl font-bold text-slate-800 mt-1">
                {result.valueAfter ?? "--"}
              </p>
            </div>

          </div>

          <div>
            <p className="text-sm text-slate-500">
              Loss Percentage
            </p>

            <p className="text-lg font-semibold text-slate-800 mt-1">
              {result.lossPercentage ?? "--"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Risk Level
            </p>

            <p className="text-lg font-semibold text-slate-800 mt-1">
              {result.riskLevel ?? "--"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Recommendation
            </p>

            <p className="text-sm text-slate-700 mt-1">
              {result.recommendation ?? "--"}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}

export default ScenarioResult;