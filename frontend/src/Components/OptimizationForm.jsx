import { useState } from "react";
import {
  WalletCards,
  ShieldCheck,
  Target,
  Zap,
  Percent,
  Droplets,
  SlidersHorizontal,
  TrendingUp,
  Landmark,
  Coins,
  Banknote,
  Building2,
  Activity,
} from "lucide-react";

function OptimizationForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    capital: "",
    riskTolerance: "balanced",

    maxEquity: 50,
    maxGold: 30,
    maxAsset: 40,
    minLiquidity: 10,
    maxVolatility: 25,

    selectedAssets: [
      "Equity",
      "Bonds",
      "Mutual Funds",
      "Gold",
      "Cash",
      "Real Estate",
    ],
  });

  const [errors, setErrors] = useState({});

  const assetOptions = [
    {
      value: "Equity",
      label: "Equity / Stocks",
      icon: TrendingUp,
    },
    {
      value: "Bonds",
      label: "Bonds / Fixed Income",
      icon: Landmark,
    },
    {
      value: "Mutual Funds",
      label: "Mutual Funds",
      icon: Coins,
    },
    {
      value: "Gold",
      label: "Gold",
      icon: Coins,
    },
    {
      value: "Cash",
      label: "Cash / Money Market",
      icon: Banknote,
    },
    {
      value: "Real Estate",
      label: "Real Estate / REITs",
      icon: Building2,
    },
  ];

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

    setErrors((prev) => ({
      ...prev,
      riskTolerance: "",
    }));
  };

  const handleAssetChange = (asset) => {
    setFormData((prev) => {
      const alreadySelected = prev.selectedAssets.includes(asset);

      if (alreadySelected) {
        return {
          ...prev,
          selectedAssets: prev.selectedAssets.filter(
            (item) => item !== asset
          ),
        };
      }

      return {
        ...prev,
        selectedAssets: [...prev.selectedAssets, asset],
      };
    });

    setErrors((prev) => ({
      ...prev,
      selectedAssets: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    const capital = Number(formData.capital);
    const maxEquity = Number(formData.maxEquity);
    const maxGold = Number(formData.maxGold);
    const maxAsset = Number(formData.maxAsset);
    const minLiquidity = Number(formData.minLiquidity);
    const maxVolatility = Number(formData.maxVolatility);

    // Capital validation
    if (!formData.capital || capital <= 0) {
      newErrors.capital = "Enter a valid portfolio capital.";
    }

    // Risk constraint validation
    if (maxEquity < 0 || maxEquity > 100) {
      newErrors.maxEquity =
        "Maximum equity must be between 0% and 100%.";
    }

    if (maxGold < 0 || maxGold > 100) {
      newErrors.maxGold =
        "Maximum gold must be between 0% and 100%.";
    }

    if (maxAsset <= 0 || maxAsset > 100) {
      newErrors.maxAsset =
        "Maximum single asset must be between 1% and 100%.";
    }

    if (minLiquidity < 0 || minLiquidity > 100) {
      newErrors.minLiquidity =
        "Minimum liquidity must be between 0% and 100%.";
    }

    if (maxVolatility <= 0 || maxVolatility > 100) {
      newErrors.maxVolatility =
        "Maximum volatility must be between 1% and 100%.";
    }

    // At least 2 assets
    if (formData.selectedAssets.length < 2) {
      newErrors.selectedAssets =
        "Select at least two investment assets.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Send only user-provided optimization controls.
    //
    // Historical market data, asset data and portfolio ID
    // will be obtained by the backend.
    onSubmit({
      capital,
      riskTolerance: formData.riskTolerance,

      maxEquity,
      maxGold,
      maxAsset,
      minLiquidity,
      maxVolatility,

      selectedAssets: formData.selectedAssets,
    });
  };

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
              Select assets and define your portfolio risk constraints.
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

        {/* Asset Selection */}
        <div>

          <label className="text-sm font-semibold text-slate-700 mb-3 block">
            Select Investment Assets
          </label>

          <div className="grid grid-cols-2 gap-3">

            {assetOptions.map((asset) => {
              const Icon = asset.icon;

              const selected =
                formData.selectedAssets.includes(asset.value);

              return (
                <button
                  key={asset.value}
                  type="button"
                  onClick={() =>
                    handleAssetChange(asset.value)
                  }
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selected
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >

                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      selected
                        ? "bg-blue-100"
                        : "bg-slate-100"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        selected
                          ? "text-blue-600"
                          : "text-slate-500"
                      }
                    />
                  </div>

                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        selected
                          ? "text-blue-700"
                          : "text-slate-700"
                      }`}
                    >
                      {asset.label}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {selected ? "Selected" : "Not selected"}
                    </p>
                  </div>

                </button>
              );
            })}

          </div>

          {errors.selectedAssets && (
            <p className="text-xs text-red-500 mt-2">
              {errors.selectedAssets}
            </p>
          )}

        </div>

        {/* Risk Tolerance */}
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

          {errors.maxEquity && (
            <p className="text-xs text-red-500 mt-2">
              {errors.maxEquity}
            </p>
          )}

        </div>

        {/* Maximum Gold */}
        <div>

          <div className="flex justify-between mb-2">

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Percent
                size={16}
                className="text-yellow-600"
              />
              Maximum Gold
            </label>

            <span className="text-sm font-bold text-yellow-600">
              {formData.maxGold}%
            </span>

          </div>

          <input
            type="range"
            name="maxGold"
            min="0"
            max="100"
            value={formData.maxGold}
            onChange={handleChange}
            className="w-full accent-yellow-500 cursor-pointer"
          />

          {errors.maxGold && (
            <p className="text-xs text-red-500 mt-2">
              {errors.maxGold}
            </p>
          )}

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
            min="1"
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

          {errors.minLiquidity && (
            <p className="text-xs text-red-500 mt-2">
              {errors.minLiquidity}
            </p>
          )}

        </div>

        {/* Maximum Volatility */}
        <div>

          <div className="flex justify-between mb-2">

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Activity
                size={16}
                className="text-red-500"
              />
              Maximum Portfolio Volatility
            </label>

            <span className="text-sm font-bold text-red-500">
              {formData.maxVolatility}%
            </span>

          </div>

          <input
            type="range"
            name="maxVolatility"
            min="1"
            max="100"
            value={formData.maxVolatility}
            onChange={handleChange}
            className="w-full accent-red-500 cursor-pointer"
          />

          {errors.maxVolatility && (
            <p className="text-xs text-red-500 mt-2">
              {errors.maxVolatility}
            </p>
          )}

        </div>

        {/* Submit */}
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