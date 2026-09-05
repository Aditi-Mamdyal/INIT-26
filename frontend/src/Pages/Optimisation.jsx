import { useState } from "react";
import axios from "axios";
import OptimizationForm from "../Components/OptimizationForm";
import OptimizationResult from "../Components/OptimizationResult";
import { supabase } from "../supabaseClient";

const API_URL = "http://localhost:5000";
const PORTFOLIO_ID = "your-real-portfolio-uuid"; // replace with real logged-in user's ID later

function Optimisation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOptimization = async (formData) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("User is not logged in.");
      }

      // Get user's portfolio
      const { data: portfolio, error: portfolioError } =
        await supabase
          .from("portfolios")
          .select("id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

      if (portfolioError) throw portfolioError;

      // Send form values to Flask
      const response = await axios.post(`${API_URL}/optimize`, {
        portfolio_id: portfolio.id,

        capital: Number(formData.capital),

        riskTolerance: formData.riskTolerance,

        maxEquity: Number(formData.maxEquity),

        maxAsset: Number(formData.maxAsset),

        minLiquidity: Number(formData.minLiquidity),
      });

      setResult({
        equity: response.data.weights?.Equity,
        bonds: response.data.weights?.Bonds,
        gold: response.data.weights?.Gold,
        cash: response.data.weights?.Cash,

        expectedReturn: response.data.expectedReturn,
        portfolioRisk: response.data.portfolioRisk,
        sharpeRatio: response.data.sharpeRatio,
      });
    } catch (err) {
      console.error("Optimization failed:", err);

      setError(
        err.response?.data?.error ||
        err.message ||
        "Optimization failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Portfolio Optimization</h1>
        <p className="text-slate-500 mt-2">
          Optimize capital allocation while maintaining risk and
          liquidity controls.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OptimizationForm onSubmit={handleOptimization} loading={loading} />
        <OptimizationResult result={result} />
      </div>
    </main>
  );
}

export default Optimisation;