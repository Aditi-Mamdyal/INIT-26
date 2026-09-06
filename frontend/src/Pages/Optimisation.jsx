import { useState } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";
import OptimizationForm from "../Components/OptimizationForm";
import OptimizationResult from "../Components/OptimizationResult";

const API_URL = "http://localhost:5000";

function Optimisation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleOptimization = async (data) => {
    setLoading(true);
    setError("");
    setSuccess("");
    setResult(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please login first.");
      }

      const { data: portfolio, error: portfolioError } =
        await supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

      if (portfolioError || !portfolio) {
        console.error("Portfolio error:", portfolioError);

        throw new Error(
          "Portfolio not found for the logged-in user."
        );
      }

      console.log("Portfolio found:", portfolio);

      const payload = {
        portfolio_id: portfolio.id,
        capital: Number(data.capital),
        riskTolerance: data.riskTolerance,
        maxEquity: Number(data.maxEquity),
        maxGold: Number(data.maxGold),
        maxAsset: Number(data.maxAsset),
        minLiquidity: Number(data.minLiquidity),
        maxVolatility: Number(data.maxVolatility),
        selectedAssets: data.selectedAssets,
      };

      console.log("Sending optimization request:");
      console.log(payload);

      const response = await axios.post(
        `${API_URL}/optimize`,
        payload
      );

      console.log("Backend optimization response:");
      console.log(response.data);

      setResult({
        weights: response.data.weights || {},
        selectedAssets: data.selectedAssets,

        capital: Number(
          response.data.capital || data.capital
        ),

        expectedReturn: Number(
          response.data.expectedReturn || 0
        ),

        portfolioRisk: Number(
          response.data.portfolioRisk || 0
        ),

        sharpeRatio: Number(
          response.data.sharpeRatio || 0
        ),

        runId: response.data.runId,
      });

    } catch (err) {
      console.error("Optimization failed:", err);

      setError(
        err.response?.data?.error ||
        err.message ||
        "Optimization failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // APPLY OPTIMIZATION
  const handleApplyOptimization = async () => {
    if (!result?.runId) {
      setError(
        "No optimization result is available to apply."
      );
      return;
    }

    setApplying(true);
    setError("");
    setSuccess("");

    try {
      console.log(
        "Applying optimization run:",
        result.runId
      );

      const response = await axios.post(
        `${API_URL}/apply-optimization`,
        {
          run_id: result.runId,
        }
      );

      console.log(
        "Apply optimization response:",
        response.data
      );

      setSuccess(
        "Optimization applied successfully. Your portfolio has been updated."
      );

    } catch (err) {
      console.error(
        "Apply optimization failed:",
        err
      );

      setError(
        err.response?.data?.error ||
        err.message ||
        "Unable to apply optimization."
      );

    } finally {
      setApplying(false);
    }
  };

  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Portfolio Optimization
        </h1>

        <p className="text-slate-500 mt-2">
          Optimize capital allocation using historical market
          data while maintaining risk and liquidity controls.
        </p>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">
          {success}
        </div>
      )}

      {/* Form + Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <OptimizationForm
          onSubmit={handleOptimization}
          loading={loading}
        />

        <OptimizationResult
          result={result}
          onApply={handleApplyOptimization}
          applying={applying}
        />

      </div>

    </main>
  );
}

export default Optimisation;