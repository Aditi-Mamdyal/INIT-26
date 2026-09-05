import { useState } from "react";
import {
  WalletCards,
  ShieldCheck,
  Target,
  Zap,
  Percent,
  Droplets,
  SlidersHorizontal,
} from "lucide-react";

function OptimizationForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    capital: "",
    riskTolerance: "balanced",
    maxEquity: 60,
    maxAsset: 25,
    minLiquidity: 15,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleRiskChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      riskTolerance: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.capital || Number(formData.capital) <= 0) {
      newErrors.capital = "Enter a valid portfolio capital.";
    }

    if (Number(formData.maxAsset) > Number(formData.maxEquity)) {
      newErrors.maxAsset =
        "Maximum single asset cannot exceed maximum equity.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Send the actual form values to Optimisation.jsx
    onSubmit(formData);
  };

  const riskOptions = [
    {
      value: "conservative",
      label: "Conservative",
      description: "Lower risk",
      icon: ShieldCheck,
    },
    {
      value: "balanced",
      label: "Balanced",
      description: "Moderate risk",
      icon: Target,
    },
    {
      value: "aggressive",
      label: "Aggressive",
      description: "Higher growth",
      icon: Zap,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start gap-4">

          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <SlidersHorizontal
              size={22}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Optimization Controls
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Set your capital, risk tolerance and portfolio constraints.
            </p>
          </div>

        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-6"
      >

        {/* Capital */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <WalletCards
              size={16}
              className="text-blue-600"
            />
            Portfolio Capital
          </label>

          <div className="relative">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
              ₹
            </span>

            <input
              type="number"
              name="capital"
              min="0"
              value={formData.capital}
              onChange={handleChange}
              placeholder="1000000"
              className={`w-full pl-9 pr-4 py-3 rounded-xl border ${
                errors.capital
                  ? "border-red-400"
                  : "border-slate-300"
              } focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition`}
            />

          </div>

          {errors.capital && (
            <p className="text-xs text-red-500 mt-2">
              {errors.capital}
            </p>
          )}
        </div>

        {/* Risk tolerance */}
        <div>

          <label className="text-sm font-semibold text-slate-700 mb-3 block">
            Risk Tolerance
          </label>

          <div className="grid grid-cols-3 gap-2">

            {riskOptions.map((option) => {
              const Icon = option.icon;

              const selected =
                formData.riskTolerance === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleRiskChange(option.value)
                  }
                  className={`p-3 rounded-xl border transition-all ${
                    selected
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >

                  <Icon
                    size={19}
                    className={
                      selected
                        ? "text-blue-600"
                        : "text-slate-400"
                    }
                  />

                  <p
                    className={`text-xs font-semibold mt-2 ${
                      selected
                        ? "text-blue-700"
                        : "text-slate-700"
                    }`}
                  >
                    {option.label}
                  </p>

                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {option.description}
                  </p>

                </button>
              );
            })}

          </div>

        </div>

        {/* Maximum Equity */}
        <div>

          <div className="flex justify-between mb-2">

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Percent
                size={16}
                className="text-blue-600"
              />
              Maximum Equity
            </label>

            <span className="text-sm font-bold text-blue-600">
              {formData.maxEquity}%
            </span>

          </div>

          <input
            type="range"
            name="maxEquity"
            min="0"
            max="100"
            value={formData.maxEquity}
            onChange={handleChange}
            className="w-full accent-blue-600 cursor-pointer"
          />

        </div>

        {/* Maximum Single Asset */}
        <div>

          <div className="flex justify-between mb-2">

            <label className="text-sm font-semibold text-slate-700">
              Maximum Single Asset
            </label>

            <span className="text-sm font-bold text-indigo-600">
              {formData.maxAsset}%
            </span>

          </div>

          <input
            type="range"
            name="maxAsset"
            min="0"
            max="100"
            value={formData.maxAsset}
            onChange={handleChange}
            className="w-full accent-indigo-600 cursor-pointer"
          />

          {errors.maxAsset && (
            <p className="text-xs text-red-500 mt-2">
              {errors.maxAsset}
            </p>
          )}

        </div>

        {/* Minimum Liquidity */}
        <div>

          <div className="flex justify-between mb-2">

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Droplets
                size={16}
                className="text-cyan-600"
              />
              Minimum Liquidity
            </label>

            <span className="text-sm font-bold text-cyan-600">
              {formData.minLiquidity}%
            </span>

          </div>

          <input
            type="range"
            name="minLiquidity"
            min="0"
            max="100"
            value={formData.minLiquidity}
            onChange={handleChange}
            className="w-full accent-cyan-600 cursor-pointer"
          />

        </div>

        {/* REAL SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-3.5 transition-all shadow-sm hover:shadow-md"
        >

          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap size={18} />
              Optimize Portfolio
            </>
          )}

        </button>

      </form>
    </div>
  );
}

export default OptimizationForm;