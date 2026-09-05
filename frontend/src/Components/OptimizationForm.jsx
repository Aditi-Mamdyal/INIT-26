function OptimizationForm({ onSubmit, loading = false }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

      <h2 className="text-lg font-semibold text-slate-800">
        Portfolio Optimization
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        Set your portfolio constraints and risk preferences.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Portfolio Capital
          </label>

          <input
            type="number"
            name="capital"
            min="0"
            placeholder="Enter capital"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Risk Tolerance
          </label>

          <select
            name="riskTolerance"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="" disabled>
              Select risk tolerance
            </option>
            <option value="conservative">Conservative</option>
            <option value="balanced">Balanced</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Maximum Equity %
          </label>

          <input
            type="number"
            name="maxEquity"
            min="0"
            max="100"
            placeholder="Enter maximum equity percentage"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Maximum Single Asset %
          </label>

          <input
            type="number"
            name="maxAsset"
            min="0"
            max="100"
            placeholder="Enter maximum single asset percentage"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Minimum Liquidity %
          </label>

          <input
            type="number"
            name="minLiquidity"
            min="0"
            max="100"
            placeholder="Enter minimum liquidity percentage"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg px-4 py-3 transition"
        >
          {loading ? "Optimizing..." : "Optimize Portfolio"}
        </button>

      </form>

    </div>
  );
}

export default OptimizationForm;