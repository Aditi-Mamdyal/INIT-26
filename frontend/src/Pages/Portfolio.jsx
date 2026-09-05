
import { useEffect, useState } from "react";

import StatCard from "../Components/StatCard";
import HoldingsTable from "../Components/HoldingsTable";
import PortfolioAllocationChart from "../Components/PortfolioAllocationChart";
import PerformanceChart from "../Components/PerformanceChart";

import { supabase } from "../supabaseClient";

function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get currently logged-in user automatically
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("User is not logged in.");
      }

      // Get portfolio belonging to logged-in user
      const { data: portfolioData, error: portfolioError } =
        await supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

      if (portfolioError) throw portfolioError;

      if (!portfolioData || portfolioData.length === 0) {
        throw new Error("No portfolio found for this user.");
      }

      const selectedPortfolio = portfolioData[0];

      setPortfolio(selectedPortfolio);

      // Get current holdings
      const { data: holdingsData, error: holdingsError } =
        await supabase
          .from("portfolio_holdings")
          .select(`
            id,
            asset_id,
            weight,
            is_current,
            assets (
              symbol,
              name,
              asset_class
            )
          `)
          .eq("portfolio_id", selectedPortfolio.id)
          .eq("is_current", true);

      if (holdingsError) throw holdingsError;

      const capital = Number(selectedPortfolio.capital || 0);

      const formattedHoldings = (holdingsData || []).map((holding) => {
        const weight = Number(holding.weight || 0);

        return {
          id: holding.id,
          assetClass:
            holding.assets?.asset_class || "Unknown",
          allocationPct: Number((weight * 100).toFixed(2)),
          currentValue: Math.round(weight * capital),
        };
      });

      setHoldings(formattedHoldings);

      // Get performance snapshots
      const { data: snapshotData, error: snapshotError } =
        await supabase
          .from("portfolio_snapshots")
          .select("value, created_at")
          .eq("portfolio_id", selectedPortfolio.id)
          .order("created_at", { ascending: true });

      if (snapshotError) throw snapshotError;

      setSnapshots(snapshotData || []);

    } catch (err) {
      console.error("Portfolio fetch error:", err);

      setError(
        err.message || "Unable to load portfolio data."
      );
    } finally {
      setLoading(false);
    }
  };

  const capital = Number(portfolio?.capital || 0);

  const portfolioValue = holdings.reduce(
    (total, holding) =>
      total + Number(holding.currentValue || 0),
    0
  );

  const allocationData = holdings.map((holding) => ({
    name: holding.assetClass,
    value: holding.currentValue,
  }));

  const performanceData = snapshots.map((snapshot) => ({
    date: snapshot.created_at,
    value: Number(snapshot.value),
  }));

  if (loading) {
    return (
      <main className="pt-20 p-8 bg-slate-100 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-500">
            Loading portfolio data...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-20 p-8 bg-slate-100 min-h-screen">
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600">
            Unable to load portfolio
          </h2>

          <p className="text-slate-600 mt-2">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Portfolio
        </h1>

        <p className="text-slate-500 mt-2">
          View and monitor your current asset allocation.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard
          title="Total Capital"
          value={`₹${capital.toLocaleString("en-IN")}`}
        />

        <StatCard
          title="Portfolio Value"
          value={`₹${portfolioValue.toLocaleString("en-IN")}`}
        />

        <StatCard
          title="Total Return"
          value="--"
        />

        <StatCard
          title="Portfolio Risk"
          value="--"
        />

      </div>

      {/* Holdings */}
      <div className="mt-8">
        <HoldingsTable holdings={holdings} />
      </div>

      {/* Allocation Chart */}
      <div className="mt-8">
        <PortfolioAllocationChart
          data={allocationData}
        />
      </div>

      {/* Performance Chart */}
      <div className="mt-8">
        <PerformanceChart
          data={performanceData}
        />
      </div>

    </main>
  );
}

export default Portfolio;

