import { useEffect, useState } from "react";

import {
  WalletCards,
  BriefcaseBusiness,
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import { supabase } from "../supabaseClient";

import StatCard from "../Components/StatCard";
import RiskCard from "../Components/RiskCard";

function Dashboard() {
  const API_URL = "http://localhost:5000";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);

  const [riskData, setRiskData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // Portfolio snapshots
  const [snapshots, setSnapshots] = useState([]);

  // ========================================================
  // FETCH DASHBOARD DATA
  // ========================================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // ----------------------------------------------------
      // 1. Get logged-in user
      // ----------------------------------------------------

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

      // ----------------------------------------------------
      // 2. Get latest portfolio
      // ----------------------------------------------------

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
        .limit(1)
        .single();

      if (portfolioError) {
        throw portfolioError;
      }

      if (!portfolioData) {
        throw new Error("No portfolio found for this user.");
      }

      setPortfolio(portfolioData);

      const portfolioId = portfolioData.id;

      // ----------------------------------------------------
      // 3. Get current portfolio from Flask
      // ----------------------------------------------------

      const portfolioResponse = await fetch(
        `${API_URL}/portfolio/${portfolioId}`
      );

      const portfolioResult = await portfolioResponse.json();

      if (!portfolioResponse.ok) {
        throw new Error(
          portfolioResult.error ||
            "Unable to fetch portfolio."
        );
      }

      setHoldings(portfolioResult.holdings || []);

      // ----------------------------------------------------
      // 4. Get portfolio snapshots
      // ----------------------------------------------------

      const {
        data: snapshotData,
        error: snapshotError,
      } = await supabase
        .from("portfolio_snapshots")
        .select("value, created_at")
        .eq("portfolio_id", portfolioId)
        .order("created_at", {
          ascending: true,
        });

      if (snapshotError) {
        throw snapshotError;
      }

      setSnapshots(snapshotData || []);

      // ----------------------------------------------------
      // 5. Get risk status from Flask
      // ----------------------------------------------------

      const riskResponse = await fetch(
        `${API_URL}/risk-status/${portfolioId}`
      );

      const riskResult = await riskResponse.json();

      if (!riskResponse.ok) {
        throw new Error(
          riskResult.error ||
            "Unable to fetch risk status."
        );
      }

      setRiskData(riskResult);

      // ----------------------------------------------------
      // 6. Get alerts from Flask
      // ----------------------------------------------------

      const alertsResponse = await fetch(
        `${API_URL}/alerts/${portfolioId}`
      );

      const alertsResult = await alertsResponse.json();

      if (!alertsResponse.ok) {
        throw new Error(
          alertsResult.error ||
            "Unable to fetch risk alerts."
        );
      }

      setAlerts(alertsResult.alerts || []);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ========================================================
  // CALCULATIONS
  // ========================================================

  const totalCapital = Number(
    portfolio?.capital || 0
  );

  // --------------------------------------------------------
  // Portfolio Value
  // --------------------------------------------------------

  let portfolioValue = totalCapital;

  if (snapshots.length > 0) {
    const latestSnapshotValue = Number(
      snapshots[snapshots.length - 1]?.value || 0
    );

    if (latestSnapshotValue > 0) {
      portfolioValue = latestSnapshotValue;
    }
  }

  // --------------------------------------------------------
  // Risk values from Flask
  // --------------------------------------------------------

  const riskValues = riskData?.riskValues || {};

  const portfolioRisk =
    Number(riskValues.volatility || 0) * 100;

  const var95 =
    Number(riskValues.var_95 || 0) * 100;

  // --------------------------------------------------------
  // Find risk status
  // --------------------------------------------------------

  const riskRules = riskData?.rules || [];

  const breachedRules = riskRules.filter(
    (rule) => rule.status === "Breached"
  );

  const riskStatus =
    breachedRules.length > 0
      ? "At Risk"
      : "Healthy";

  // --------------------------------------------------------
  // Liquidity
  // --------------------------------------------------------

  const cashRule = riskRules.find(
    (rule) =>
      rule.ruleName === "min_liquidity"
  );

  const cashHolding = holdings.find(
    (holding) =>
      holding.asset_class?.toLowerCase() === "cash"
  );

  const liquidityRatio = cashHolding
    ? Number(cashHolding.weight || 0) * 100
    : 0;

  const liquidityThreshold = cashRule
    ? Number(cashRule.threshold || 0)
    : Number(
        portfolio?.cash_buffer_pct || 10
      );

  const liquidityHealthy =
    liquidityRatio >= liquidityThreshold;

  // ========================================================
  // LOADING
  // ========================================================

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

  // ========================================================
  // ERROR
  // ========================================================

  if (error) {
    return (
      <main className="pt-20 p-8 bg-slate-100 min-h-screen">
        <div className="max-w-xl mx-auto mt-20 bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle
              className="text-red-600"
              size={28}
            />
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

  // ========================================================
  // DASHBOARD
  // ========================================================

  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">

      {/* HEADER */}

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

      {/* CURRENT PORTFOLIO */}

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

          <span className="px-3 py-1.5 bg-white/15 rounded-lg text-sm">
            Risk Status:{" "}
            <strong>{riskStatus}</strong>
          </span>
        </div>
      </div>

      {/* MAIN STATISTICS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Capital"
          value={`₹${totalCapital.toLocaleString("en-IN")}`}
        />

        <StatCard
          title="Portfolio Value"
          value={`₹${portfolioValue.toLocaleString("en-IN")}`}
        />

        <StatCard
          title="Portfolio Risk"
          value={`${portfolioRisk.toFixed(2)}%`}
        />
      </div>

      {/* RISK & LIQUIDITY */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <RiskCard
          title="Liquidity Ratio"
          value={`${liquidityRatio.toFixed(2)}%`}
          status={
            liquidityHealthy
              ? `Healthy — minimum ${liquidityThreshold.toFixed(0)}%`
              : `Below minimum — ${liquidityThreshold.toFixed(0)}% required`
          }
        />

        <RiskCard
          title="Risk Status"
          value={riskStatus}
          status={
            breachedRules.length > 0
              ? `${breachedRules.length} rule(s) breached`
              : "All risk rules within limits"
          }
        />
      </div>

      {/* EXTRA RISK INFORMATION */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500">
            Portfolio Volatility
          </p>

          <p className="text-2xl font-bold text-slate-800 mt-2">
            {portfolioRisk.toFixed(2)}%
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Annualized risk
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500">
            VaR (95%)
          </p>

          <p className="text-2xl font-bold text-slate-800 mt-2">
            {var95.toFixed(2)}%
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Daily downside estimate
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500">
            Active Alerts
          </p>

          <p className="text-2xl font-bold text-slate-800 mt-2">
            {
              alerts.filter(
                (alert) =>
                  alert.status === "active"
              ).length
            }
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Current risk notifications
          </p>
        </div>

      </div>

      {/* CURRENT ALLOCATION */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <WalletCards
              className="text-indigo-600"
              size={20}
            />
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

        {holdings.length === 0 ? (

          <div className="text-center py-10">
            <p className="text-slate-400">
              No current holdings found.
            </p>
          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {holdings.map((holding) => {

              const percentage =
                Number(holding.weight || 0) * 100;

              return (
                <div
                  key={holding.asset_id}
                  className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition"
                >

                  <div className="flex items-center justify-between mb-3">

                    <div>

                      <p className="font-semibold text-slate-800">
                        {holding.asset_class || "Unknown"}
                      </p>

                      <p className="text-xs text-slate-400">
                        {holding.asset_id
                          ? `Asset ID: ${holding.asset_id}`
                          : "--"}
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
                        width: `${Math.min(
                          percentage,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                  <p className="text-sm text-slate-500 mt-3">
                    ₹
                    {(
                      (percentage / 100) *
                      totalCapital
                    ).toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </p>

                </div>
              );
            })}

          </div>

        )}

      </div>

      {/* RISK RULES */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <ShieldAlert
              className="text-red-600"
              size={20}
            />
          </div>

          <div>

            <h2 className="text-lg font-semibold text-slate-800">
              Risk Controls
            </h2>

            <p className="text-sm text-slate-400">
              Portfolio limits monitored by the Flask risk engine
            </p>

          </div>

        </div>

        {riskRules.length === 0 ? (

          <p className="text-slate-400 text-sm">
            No risk rules configured.
          </p>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {riskRules.map((rule, index) => {

              const current =
                Number(rule.currentValue || 0) * 100;

              const threshold =
                Number(rule.threshold || 0);

              const breached =
                rule.status === "Breached";

              return (
                <div
                  key={`${rule.ruleName}-${index}`}
                  className={`rounded-xl border p-4 ${
                    breached
                      ? "border-red-200 bg-red-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <p className="font-semibold text-slate-800">
                      {rule.ruleName
                        .replaceAll("_", " ")
                        .replace(
                          /\b\w/g,
                          (char) => char.toUpperCase()
                        )}
                    </p>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        breached
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {rule.status}
                    </span>

                  </div>

                  <div className="mt-4">

                    <p className="text-xs text-slate-500">
                      Current
                    </p>

                    <p className="text-xl font-bold text-slate-800">
                      {current.toFixed(2)}%
                    </p>

                  </div>

                  <div className="mt-2">

                    <p className="text-xs text-slate-500">
                      Limit
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      {threshold.toFixed(2)}%
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

      {/* RECENT ALERTS */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <ShieldAlert
                className="text-amber-600"
                size={20}
              />
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

          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              alerts.length > 0
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {alerts.length > 0
              ? `${alerts.length} alert${
                  alerts.length === 1 ? "" : "s"
                }`
              : "No alerts"}
          </span>

        </div>

        {alerts.length === 0 ? (

          <div className="mt-5 rounded-xl bg-green-50 border border-dashed border-green-200 p-6 text-center">

            <ShieldAlert
              size={26}
              className="mx-auto text-green-400 mb-2"
            />

            <p className="text-sm text-green-700 font-medium">
              All clear
            </p>

            <p className="text-sm text-green-600 mt-1">
              No risk alerts have been recorded for this portfolio.
            </p>

          </div>

        ) : (

          <div className="mt-5 space-y-3">

            {alerts
              .slice(0, 5)
              .map((alert) => (

                <div
                  key={alert.id}
                  className={`rounded-xl border p-4 ${
                    alert.severity === "alert"
                      ? "border-red-200 bg-red-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                    <div>

                      <p className="font-semibold text-slate-800">
                        {alert.metric
                          ?.replaceAll("_", " ")
                          .replace(
                            /\b\w/g,
                            (char) =>
                              char.toUpperCase()
                          ) ||
                          "Risk Alert"}
                      </p>

                      <p className="text-sm text-slate-600 mt-1">
                        {alert.message ||
                          "Risk threshold breach detected."}
                      </p>

                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        alert.severity === "alert"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {alert.severity || "warning"}
                    </span>

                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">

                    <span>
                      Threshold:{" "}
                      {(
                        Number(alert.threshold || 0) * 100
                      ).toFixed(2)}
                      %
                    </span>

                    <span>
                      Value:{" "}
                      {(
                        Number(alert.value || 0) * 100
                      ).toFixed(2)}
                      %
                    </span>

                    <span>
                      Action:{" "}
                      {alert.action_taken ||
                        "Alert raised"}
                    </span>

                  </div>

                </div>

              ))}

          </div>

        )}

      </div>

    </main>
  );
}

export default Dashboard;