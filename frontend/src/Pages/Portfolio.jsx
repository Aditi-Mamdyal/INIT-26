import { useEffect, useState } from "react";

import StatCard from "../Components/StatCard";
import HoldingsTable from "../Components/HoldingsTable";
import PortfolioAllocationChart from "../Components/PortfolioAllocationChart";

import { supabase } from "../supabaseClient";

function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("User is not logged in.");
      }

      const { data: portfolioData, error: portfolioError } =
        await supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", user.id)
          .order("portfolio_id", { ascending: false })
          .limit(1);

      if (portfolioError) {
        throw portfolioError;
      }

      if (!portfolioData || portfolioData.length === 0) {
        throw new Error(
          "No portfolio found for the currently logged-in user."
        );
      }

      const selectedPortfolio = portfolioData[0];

      setPortfolio(selectedPortfolio);

      const { data: holdingsData, error: holdingsError } =
        await supabase
          .from("portfolio_holdings")
          .select(`
            holding_id,
            quantity,
            average_price,
            assets (
              asset_id,
              symbol,
              name,
              asset_type,
              liquidity
            )
          `)
          .eq("portfolio_id", selectedPortfolio.portfolio_id);

      if (holdingsError) {
        throw holdingsError;
      }

      const formattedHoldings = (holdingsData || []).map(
        (holding) => {
          const asset = holding.assets;

          const currentValue =
            Number(holding.quantity) *
            Number(holding.average_price);

          return {
            id: holding.holding_id,
            asset: asset?.name,
            symbol: asset?.symbol,
            type: asset?.asset_type,
            quantity: Number(holding.quantity),
            averagePrice: Number(holding.average_price),
            currentValue,
          };
        }
      );

      setHoldings(formattedHoldings);
    } catch (err) {
      console.error("Portfolio fetch error:", err);

      setError(
        err.message || "Unable to load portfolio data."
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate total portfolio value
  const portfolioValue = holdings.reduce(
    (total, holding) =>
      total + holding.currentValue,
    0
  );

  // Calculate allocation percentage for each holding
  const holdingsWithAllocation = holdings.map((holding) => ({
    ...holding,
    allocation:
      portfolioValue > 0
        ? `${(
            (holding.currentValue / portfolioValue) *
            100
          ).toFixed(2)}%`
        : "--",
  }));

  // Calculate allocation by asset type
  const allocationMap = {};

  holdings.forEach((holding) => {
    const type = holding.type || "Other";

    allocationMap[type] =
      (allocationMap[type] || 0) +
      holding.currentValue;
  });

  const allocationData = Object.entries(
    allocationMap
  ).map(([name, value]) => ({
    name,
    value,
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

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Portfolio
        </h1>

        <p className="text-slate-500 mt-2">
          View and monitor your current asset holdings.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard
          title="Total Capital"
          value={
            portfolio
              ? `₹${Number(
                  portfolio.total_capital
                ).toLocaleString("en-IN")}`
              : "--"
          }
        />

        <StatCard
          title="Portfolio Value"
          value={
            portfolioValue > 0
              ? `₹${portfolioValue.toLocaleString("en-IN")}`
              : "--"
          }
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
        <HoldingsTable
          holdings={holdingsWithAllocation}
        />
      </div>

      {/* Allocation Chart */}
      <div className="mt-8">
        <PortfolioAllocationChart
          data={allocationData}
        />
      </div>

    </main>
  );
}

export default Portfolio;