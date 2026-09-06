
import { useEffect, useState } from "react";

import StatCard from "../Components/StatCard";
import HoldingsTable from "../Components/HoldingsTable";
import PortfolioAllocationChart from "../Components/PortfolioAllocationChart";
import PerformanceChart from "../Components/PerformanceChart";

import { supabase } from "../supabaseClient";

function Portfolio() {
  const API_URL = "http://localhost:5000";

  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [portfolioRisk, setPortfolioRisk] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError("");

      // ====================================================
      // 1. Get currently logged-in user
      // ====================================================

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

      // ====================================================
      // 2. Get latest portfolio for logged-in user
      // ====================================================

      const {
        data: portfolioData,
        error: portfolioError,
      } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(1);

      if (portfolioError) {
        throw portfolioError;
      }

      if (!portfolioData || portfolioData.length === 0) {
        throw new Error("No portfolio found for this user.");
      }

      const selectedPortfolio = portfolioData[0];

      setPortfolio(selectedPortfolio);

      const portfolioId = selectedPortfolio.id;

      // ====================================================
      // 3. Get current holdings
      // ====================================================

      const {
        data: holdingsData,
        error: holdingsError,
      } = await supabase
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
        .eq("portfolio_id", portfolioId)
        .eq("is_current", true);

      if (holdingsError) {
        throw holdingsError;
      }

      const capital = Number(
        selectedPortfolio.capital || 0
      );

      const formattedHoldings = (
        holdingsData || []
      ).map((holding) => {
        const weight = Number(
          holding.weight || 0
        );

        return {
          id: holding.id,

          assetClass:
            holding.assets?.asset_class ||
            "Unknown",

          allocationPct: Number(
            (weight * 100).toFixed(2)
          ),

          currentValue: Math.round(
            weight * capital
          ),
        };
      });

      setHoldings(formattedHoldings);

      // ====================================================
      // 4. Get latest 50 performance snapshots
      // ====================================================

      const {
        data: snapshotData,
        error: snapshotError,
      } = await supabase
        .from("portfolio_snapshots")
        .select("value, created_at")
        .eq("portfolio_id", portfolioId)
        .order("created_at", {
          ascending: false,
        })
        .limit(50);

      if (snapshotError) {
        throw snapshotError;
      }

      // Supabase gives newest first.
      // Reverse so chart displays oldest -> newest.
      const formattedSnapshots = (
        snapshotData || []
      )
        .reverse()
        .map((snapshot) => ({
          date: new Date(
            snapshot.created_at
          ).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),

          value: Number(snapshot.value),

          // Keep original timestamp internally.
          originalDate: snapshot.created_at,
        }));

      setSnapshots(formattedSnapshots);

      // ====================================================
      // 5. Get Portfolio Risk from Flask
      // SAME SOURCE AS DASHBOARD
      // ====================================================

      const riskResponse = await fetch(
        `${API_URL}/risk-status/${portfolioId}`
      );

      const riskResult = await riskResponse.json();

      if (!riskResponse.ok) {
        throw new Error(
          riskResult.error ||
            "Unable to fetch portfolio risk."
        );
      }

      // Same calculation as Dashboard
      const riskValues =
        riskResult?.riskValues || {};

      const calculatedPortfolioRisk =
        Number(
          riskValues.volatility || 0
        ) * 100;

      setPortfolioRisk(
        calculatedPortfolioRisk
      );

    } catch (err) {
      console.error(
        "Portfolio fetch error:",
        err
      );

      setError(
        err.message ||
          "Unable to load portfolio data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // CALCULATIONS
  // ========================================================

  const capital = Number(
    portfolio?.capital || 0
  );

  // ========================================================
  // Portfolio Value
  // Same logic as Dashboard:
  // Use latest portfolio snapshot when available.
  // ========================================================

  let portfolioValue = capital;

  if (snapshots.length > 0) {
    const latestSnapshotValue = Number(
      snapshots[snapshots.length - 1]?.value || 0
    );

    if (latestSnapshotValue > 0) {
      portfolioValue = latestSnapshotValue;
    }
  }

  const allocationData = holdings.map(
    (holding) => ({
      name: holding.assetClass,
      value: holding.currentValue,
    })
  );

  // Snapshots are already formatted above.
  const performanceData = snapshots;

  // ========================================================
  // LOADING
  // ========================================================

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

  // ========================================================
  // ERROR
  // ========================================================

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

  // ========================================================
  // PORTFOLIO PAGE
  // ========================================================

  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">

      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Portfolio
        </h1>

        <p className="text-slate-500 mt-2">
          View and monitor your current asset allocation.
        </p>
      </div>

      {/* ==================================================
          SUMMARY CARDS
          ================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Total Capital */}

        <StatCard
          title="Total Capital"
          value={`₹${capital.toLocaleString(
            "en-IN"
          )}`}
        />

        {/* Portfolio Value */}

        <StatCard
          title="Portfolio Value"
          value={`₹${portfolioValue.toLocaleString(
            "en-IN"
          )}`}
        />

        {/* Portfolio Risk */}

        <StatCard
          title="Portfolio Risk"
          value={`${portfolioRisk.toFixed(2)}%`}
        />

      </div>

      {/* ==================================================
          HOLDINGS
          ================================================== */}

      <div className="mt-8">
        <HoldingsTable
          holdings={holdings}
        />
      </div>

      {/* ==================================================
          ALLOCATION CHART
          ================================================== */}

      <div className="mt-8">
        <PortfolioAllocationChart
          data={allocationData}
        />
      </div>

      {/* ==================================================
          PERFORMANCE CHART
          ================================================== */}

      <div className="mt-8">
        <PerformanceChart
          data={performanceData}
        />
      </div>

    </main>
  );
}

export default Portfolio;