import { useEffect, useState } from "react";
import {
  WalletCards,
  BriefcaseBusiness,
  TrendingUp,
  ShieldAlert,
  Droplets,
  Activity,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../supabaseClient";
import StatCard from "../Components/StatCard";
import RiskCard from "../Components/RiskCard";
import AllocationChart from "../Components/AllocationChart";
import PerformanceChart from "../Components/PerformanceChart";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [snapshots, setSnapshots] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("User is not logged in.");
      }

      // Get user's portfolio
      const { data: portfolioData, error: portfolioError } =
        await supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

      if (portfolioError) throw portfolioError;

      setPortfolio(portfolioData);

      // Get current holdings + asset information
      const { data: holdingsData, error: holdingsError } =
        await supabase
          .from("portfolio_holdings")
          .select(`
            id,
            weight,
            is_current,
            assets (
              symbol,
              name,
              asset_class
            )
          `)
          .eq("portfolio_id", portfolioData.id)
          .eq("is_current", true);

      if (holdingsError) throw holdingsError;

      setHoldings(holdingsData || []);

      // Get portfolio snapshots for performance chart
      const { data: snapshotData, error: snapshotError } =
        await supabase
          .from("portfolio_snapshots")
          .select("value, created_at")
          .eq("portfolio_id", portfolioData.id)
          .order("created_at", { ascending: true });

      if (snapshotError) throw snapshotError;

      setSnapshots(snapshotData || []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // -----------------------------
  // Calculations
  // -----------------------------

  const totalCapital = Number(portfolio?.capital || 0);

  const portfolioValue =
    snapshots.length > 0
      ? Number(snapshots[snapshots.length - 1].value || totalCapital)
      : totalCapital;

  const totalReturn =
    totalCapital > 0
      ? ((portfolioValue - totalCapital) / totalCapital) * 100
      : 0;

  const liquidityHolding = holdings.find(
    (holding) =>
      holding.assets?.asset_class?.toLowerCase() === "cash"
  );

  const liquidityRatio = liquidityHolding
    ? Number(liquidityHolding.weight || 0) * 100
    : 0;

  const allocationData = holdings.map((holding) => ({
    name: holding.assets?.asset_class || "Unknown",
    value: Number(holding.weight || 0) * totalCapital,
  }));

  const performanceData = snapshots.map((snapshot) => ({
    date: new Date(snapshot.created_at).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
    value: Number(snapshot.value || 0),
  }));

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {
    return (
      <main className="pt-20 p-8 bg-slate-100 min-h-screen">
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <RefreshCw
              size={32}
              className="animate-spin mx-auto text-blue-600 mb-4"
            />
            <p className="text-slate-500">
              Loading portfolio dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // -----------------------------
  // Error
  // -----------------------------

  if (error) {
    return (
      <main className="pt-20 p-8 bg-slate-100 min-h-screen">
        <div className="max-w-xl mx-auto mt-20 bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-600" size={28} />
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Unable to load dashboard
          </h2>

          <p className="text-slate-500 mt-2">
            {error}
          </p>

          <button
            onClick={fetchDashboardData}
            className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              LIVE PORTFOLIO
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Portfolio Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Monitor your capital, portfolio performance and risk.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Portfolio Name */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl p-6 mb-6 text-white shadow-lg">

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <BriefcaseBusiness size={25} />
          </div>

          <div>
            <p className="text-blue-100 text-sm">
              Current Portfolio
            </p>

            <h2 className="text-xl font-bold">
              {portfolio?.name || "My Portfolio"}
            </h2>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="px-3 py-1.5 bg-white/15 rounded-lg text-sm">
            Risk Profile:{" "}
            <strong className="capitalize">
              {portfolio?.risk_profile || "Balanced"}
            </strong>
          </span>

          <span className="px-3 py-1.5 bg-white/15 rounded-lg text-sm">
            Current Holdings: {holdings.length}
          </span>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard
          title="Total Capital"
          value={`₹${totalCapital.toLocaleString("en-IN")}`}
        />

        <StatCard
          title="Portfolio Value"
          value={`₹${portfolioValue.toLocaleString("en-IN")}`}
        />

        <StatCard
          title="Total Return"
          value={`${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}%`}
        />

        <StatCard
          title="Portfolio Risk"
          value="--"
        />

      </div>

      {/* Risk & Liquidity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

        <RiskCard
          title="Liquidity Ratio"
          value={`${liquidityRatio.toFixed(2)}%`}
          status={
            liquidityRatio >=
            Number(portfolio?.cash_buffer_pct || 0) * 100
              ? "Healthy liquidity"
              : "Below recommended level"
          }
        />

        <RiskCard
          title="Risk Status"
          value="--"
          status="Risk engine data pending"
        />

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Activity className="text-blue-600" size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Asset Allocation
              </h2>

              <p className="text-sm text-slate-400">
                Current portfolio distribution
              </p>
            </div>
          </div>

          <AllocationChart data={allocationData} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="text-emerald-600" size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Portfolio Performance
              </h2>

              <p className="text-sm text-slate-400">
                Portfolio value over time
              </p>
            </div>
          </div>

          <PerformanceChart data={performanceData} />
        </div>

      </div>

      {/* Current Allocation Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <WalletCards className="text-indigo-600" size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Current Allocation
            </h2>

            <p className="text-sm text-slate-400">
              Allocation currently stored in your portfolio
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {holdings.map((holding) => {
            const percentage =
              Number(holding.weight || 0) * 100;

            return (
              <div
                key={holding.id}
                className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between mb-3">

                  <div>
                    <p className="font-semibold text-slate-800">
                      {holding.assets?.asset_class || "Unknown"}
                    </p>

                    <p className="text-xs text-slate-400">
                      {holding.assets?.symbol || "--"}
                    </p>
                  </div>

                  <span className="text-lg font-bold text-blue-600">
                    {percentage.toFixed(2)}%
                  </span>

                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                    }}
                  />
                </div>

                <p className="text-sm text-slate-500 mt-3">
                  ₹
                  {(percentage / 100 * totalCapital).toLocaleString(
                    "en-IN",
                    { maximumFractionDigits: 0 }
                  )}
                </p>
              </div>
            );
          })}

        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <ShieldAlert className="text-amber-600" size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Recent Risk Alerts
              </h2>

              <p className="text-sm text-slate-400">
                Latest portfolio risk notifications
              </p>
            </div>
          </div>

          <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-500">
            No alerts loaded
          </span>

        </div>

        <div className="mt-5 rounded-xl bg-slate-50 border border-dashed border-slate-200 p-6 text-center">

          <Droplets
            size={26}
            className="mx-auto text-slate-300 mb-2"
          />

          <p className="text-sm text-slate-500">
            Risk alerts will appear here when the Flask risk engine
            detects a threshold breach.
          </p>

        </div>

      </div>

    </main>
  );
}

export default Dashboard;