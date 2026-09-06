import { ChevronDown, Play } from "lucide-react";

function ScenarioForm({ onSubmit, loading }) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
    >

      {/* SCENARIO */}

      <div>

        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Select Scenario
        </label>

        <div className="relative">

          <select
            name="scenario"
            required
            defaultValue=""
            className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 pr-12 text-slate-700 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition cursor-pointer"
          >

            <option
              value=""
              disabled
            >
              Choose a scenario
            </option>

            <option value="Market Crash">
              Market Crash
            </option>

            <option value="Interest Rate Increase">
              Interest Rate Increase
            </option>

            <option value="Inflation Shock">
              Inflation Shock
            </option>

            <option value="Gold Price Drop">
              Gold Price Drop
            </option>

            <option value="Equity Market Decline">
              Equity Market Decline
            </option>

          </select>

          <ChevronDown
            size={20}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />

        </div>

      </div>

      {/* MARKET SHOCK */}

      <div>

        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Market Shock (%)
        </label>

        <input
          type="number"
          name="shock"
          placeholder="Example: -20"
          required
          step="0.01"
          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
        />

        <p className="text-xs text-slate-400 mt-2">
          Use a negative value for a decline.
          Example: -20 means the market falls by 20%.
        </p>

      </div>

      {/* RUN */}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold rounded-xl px-5 py-3 transition shadow-sm"
      >

        <Play size={18} />

        {loading
          ? "Running Scenario..."
          : "Run Scenario"}

      </button>

    </form>
  );
}

export default ScenarioForm;