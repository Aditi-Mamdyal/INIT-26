function ScenarioForm({ onSubmit, loading = false }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

      <h2 className="text-lg font-semibold text-slate-800">
        Stress Test Scenario
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        Simulate market conditions and evaluate portfolio impact.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Scenario
          </label>

          <select
            name="scenario"
            defaultValue=""
            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select scenario
            </option>

            <option value="normal">
              Normal Market
            </option>

            <option value="market_crash">
              Market Crash
            </option>

            <option value="interest_rate_shock">
              Interest Rate Shock
            </option>

            <option value="high_inflation">
              High Inflation
            </option>

            <option value="custom">
              Custom Scenario
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Market Shock %
          </label>

          <input
            type="number"
            name="shock"
            placeholder="Enter market shock percentage"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg px-4 py-3 transition"
        >
          {loading ? "Running Scenario..." : "Run Scenario"}
        </button>

      </form>

    </div>
  );
}

export default ScenarioForm;