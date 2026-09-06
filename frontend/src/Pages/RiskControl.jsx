
import { useEffect, useState } from "react";

import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from "lucide-react";

import RiskRuleCard from "../Components/RiskRuleCard";
import AlertCard from "../Components/AlertCard";

import { supabase } from "../supabaseClient";

function RiskControl() {
  const API_URL = "http://localhost:5000";

  const [riskRules, setRiskRules] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================================
  // FETCH RISK CONTROL DATA
  // ========================================================

  const fetchRiskData = async () => {
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
        data: portfolio,
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

      if (!portfolio) {
        throw new Error("No portfolio found.");
      }

      const portfolioId = portfolio.id;

      // ----------------------------------------------------
      // 3. Get risk status
      // ----------------------------------------------------

      const riskResponse = await fetch(
        `${API_URL}/risk-status/${portfolioId}`
      );

      const riskResult = await riskResponse.json();

      if (!riskResponse.ok) {
        throw new Error(
          riskResult.error ||
            "Unable to fetch risk controls."
        );
      }

      setRiskRules(riskResult.rules || []);

      // ----------------------------------------------------
      // 4. Get alerts
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

      const activeAlerts = (
        alertsResult.alerts || []
      ).filter(
        (alert) => alert.status === "active"
      );

      setAlerts(activeAlerts);
    } catch (err) {
      console.error(
        "Risk Control error:",
        err
      );

      setError(
        err.message ||
          "Unable to load risk controls."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {
    fetchRiskData();
  }, []);

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <main className="pt-20 p-8 bg-slate-100 min-h-screen">

        <div className="flex items-center justify-center min-h-[70vh]">

          <div className="text-center">

            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-5">
              <RefreshCw
                size={28}
                className="animate-spin text-blue-600"
              />
            </div>

            <h2 className="text-lg font-semibold text-slate-800">
              Loading Risk Controls
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Checking your portfolio risk status...
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

          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">

            <AlertTriangle
              className="text-red-600"
              size={28}
            />

          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Unable to load Risk Controls
          </h2>

          <p className="text-slate-500 mt-2">
            {error}
          </p>

          <button
            onClick={fetchRiskData}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm"
          >
            <RefreshCw size={17} />
            Try Again
          </button>

        </div>

      </main>
    );
  }

  // ========================================================
  // PAGE
  // ========================================================

  const breachedRules = riskRules.filter(
    (rule) => rule.status === "Breached"
  );

  const healthyRules =
    riskRules.length - breachedRules.length;

  return (
    <main className="pt-20 p-6 md:p-8 bg-slate-100 min-h-screen">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>

            <div className="flex items-center gap-2 mb-3">

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                <Activity size={13} />
                LIVE RISK MONITORING
              </span>

            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
              Risk Controls
            </h1>

            <p className="text-slate-500 mt-2 max-w-2xl">
              Monitor portfolio risk limits, threshold breaches and control actions in real time.
            </p>

          </div>

          <button
            onClick={fetchRiskData}
            className="self-start lg:self-auto inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
          >
            <RefreshCw size={17} />
            Refresh Data
          </button>

        </div>

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">

          {/* Total Rules */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Risk Rules
                </p>

                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {riskRules.length}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Rules currently monitored
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">

                <ShieldCheck
                  size={24}
                  className="text-blue-600"
                />

              </div>

            </div>

          </div>

          {/* Healthy Rules */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Rules Within Limit
                </p>

                <p className="text-3xl font-bold text-green-600 mt-2">
                  {healthyRules}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Currently healthy
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">

                <CheckCircle2
                  size={24}
                  className="text-green-600"
                />

              </div>

            </div>

          </div>

          {/* Breaches */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Active Breaches
                </p>

                <p
                  className={`text-3xl font-bold mt-2 ${
                    breachedRules.length > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {breachedRules.length}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Risk limits exceeded
                </p>

              </div>

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  breachedRules.length > 0
                    ? "bg-red-100"
                    : "bg-green-100"
                }`}
              >

                <ShieldAlert
                  size={24}
                  className={
                    breachedRules.length > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }
                />

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            RISK STATUS BANNER
        ================================================== */}

        <div
          className={`rounded-2xl p-5 mb-8 border ${
            breachedRules.length > 0
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >

          <div className="flex items-start gap-4">

            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                breachedRules.length > 0
                  ? "bg-red-100"
                  : "bg-green-100"
              }`}
            >

              {breachedRules.length > 0 ? (
                <ShieldAlert
                  size={23}
                  className="text-red-600"
                />
              ) : (
                <ShieldCheck
                  size={23}
                  className="text-green-600"
                />
              )}

            </div>

            <div>

              <h3
                className={`font-bold ${
                  breachedRules.length > 0
                    ? "text-red-800"
                    : "text-green-800"
                }`}
              >
                {breachedRules.length > 0
                  ? "Portfolio Risk Requires Attention"
                  : "Portfolio Risk Is Under Control"}
              </h3>

              <p
                className={`text-sm mt-1 ${
                  breachedRules.length > 0
                    ? "text-red-700"
                    : "text-green-700"
                }`}
              >
                {breachedRules.length > 0
                  ? `${breachedRules.length} risk rule(s) are currently outside the configured limits.`
                  : "All configured risk rules are currently within their permitted thresholds."}
              </p>

            </div>

          </div>

        </div>

        {/* ==================================================
            RISK RULES
        ================================================== */}

        <section>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Risk Rules
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Configured limits for your portfolio
              </p>

            </div>

            <span className="text-sm font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
              {riskRules.length} rules monitored
            </span>

          </div>

          {riskRules.length === 0 ? (

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">

              <ShieldCheck
                size={35}
                className="mx-auto text-slate-300 mb-3"
              />

              <p className="text-slate-500 font-medium">
                No risk rules configured
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {riskRules.map((rule, index) => {

                const currentValue =
                  Number(
                    rule.currentValue || 0
                  ) * 100;

                const threshold =
                  Number(
                    rule.threshold || 0
                  ) * 100;

                return (
                  <RiskRuleCard
                    key={`${rule.ruleName}-${index}`}
                    ruleName={
                      rule.ruleName
                        ?.replaceAll("_", " ")
                        .replace(
                          /\b\w/g,
                          (char) =>
                            char.toUpperCase()
                        ) ||
                      "Risk Rule"
                    }
                    currentValue={currentValue}
                    threshold={threshold}
                    status={
                      rule.status ||
                      "Unknown"
                    }
                  />
                );
              })}

            </div>

          )}

        </section>

        {/* ==================================================
            ALERTS
        ================================================== */}

        <section className="mt-10">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Risk Alerts
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Active notifications requiring attention
              </p>

            </div>

            <span
              className={`inline-flex items-center gap-2 self-start sm:self-auto text-sm font-semibold px-3 py-1.5 rounded-lg ${
                alerts.length > 0
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >

              <span
                className={`w-2 h-2 rounded-full ${
                  alerts.length > 0
                    ? "bg-red-500"
                    : "bg-green-500"
                }`}
              />

              {alerts.length > 0
                ? `${alerts.length} Active`
                : "No Active Alerts"}

            </span>

          </div>

          {alerts.length === 0 ? (

            <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-10 text-center">

              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">

                <CheckCircle2
                  size={28}
                  className="text-green-600"
                />

              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                All Clear
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                No active risk threshold breaches detected.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {alerts.map((alert) => (

                <AlertCard
                  key={alert.id}
                  severity={alert.severity}
                  message={
                    alert.message ||
                    "Risk threshold breach detected."
                  }
                  recommendedAction={
                    alert.action_taken ||
                    "Alert raised"
                  }
                  status={
                    alert.status ||
                    "active"
                  }
                />

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

export default RiskControl;