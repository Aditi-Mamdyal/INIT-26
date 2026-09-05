import { useState } from "react";

import OptimizationForm from "../Components/OptimizationForm";
import OptimizationResult from "../Components/OptimizationResult";

function Optimisation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOptimization = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const optimizationInput = {
      capital: formData.get("capital"),
      riskTolerance: formData.get("riskTolerance"),
      maxEquity: formData.get("maxEquity"),
      maxAsset: formData.get("maxAsset"),
      minLiquidity: formData.get("minLiquidity")
    };

    console.log("Optimization input:", optimizationInput);

    // Backend will be connected here later.
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setResult(null);
    }, 500);
  };

  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Portfolio Optimization
        </h1>

        <p className="text-slate-500 mt-2">
          Optimize capital allocation while maintaining risk and liquidity controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <OptimizationForm
          onSubmit={handleOptimization}
          loading={loading}
        />

        <OptimizationResult
          result={result}
        />

      </div>

    </main>
  );
}

export default Optimisation;