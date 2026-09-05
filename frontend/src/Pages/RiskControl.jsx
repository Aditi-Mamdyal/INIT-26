import RiskRuleCard from "../Components/RiskRuleCard";
import AlertCard from "../Components/AlertCard";

function RiskControl() {
  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Risk Controls
        </h1>

        <p className="text-slate-500 mt-2">
          Monitor portfolio risk limits, threshold breaches and control actions.
        </p>
      </div>

      {/* Risk Rules */}

      <section>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Risk Rules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <RiskRuleCard
            ruleName="Maximum Equity Exposure"
            currentValue={null}
            threshold={null}
            status="Waiting for data"
          />

          <RiskRuleCard
            ruleName="Maximum Gold Exposure"
            currentValue={null}
            threshold={null}
            status="Waiting for data"
          />

          <RiskRuleCard
            ruleName="Maximum Single Asset Exposure"
            currentValue={null}
            threshold={null}
            status="Waiting for data"
          />

          <RiskRuleCard
            ruleName="Minimum Liquidity"
            currentValue={null}
            threshold={null}
            status="Waiting for data"
          />

          <RiskRuleCard
            ruleName="Maximum Portfolio Risk"
            currentValue={null}
            threshold={null}
            status="Waiting for data"
          />

        </div>
      </section>

      {/* Risk Alerts */}

      <section className="mt-10">

        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Risk Alerts
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <AlertCard
            severity={null}
            message={null}
            recommendedAction={null}
            status="No active alerts"
          />

        </div>

      </section>

    </main>
  );
}

export default RiskControl;