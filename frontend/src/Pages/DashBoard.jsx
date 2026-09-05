import StatCard from "../Components/StatCard";
import RiskCard from "../Components/RiskCard";
import AllocationChart from "../Components/AllocationChart";
import PerformanceChart from "../Components/PerformanceChart";

function Dashboard() {
  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Portfolio Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Monitor your capital, portfolio performance and risk.
        </p>
      </div>


      {/* Main Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard
          title="Total Capital"
          value="--"
        />

        <StatCard
          title="Portfolio Value"
          value="--"
        />

        <StatCard
          title="Expected Return"
          value="--"
        />

        <StatCard
          title="Portfolio Risk"
          value="--"
        />

      </div>


      {/* Risk & Liquidity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        <RiskCard
          title="Liquidity Ratio"
          value="--"
          status="Waiting for data"
        />

        <RiskCard
          title="Risk Status"
          value="--"
          status="Waiting for data"
        />

      </div>


      {/* Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

  <AllocationChart data={[]} />

  <PerformanceChart data={[]} />

</div>


      {/* Recent Alerts */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mt-6">

        <h2 className="text-lg font-semibold text-slate-800">
          Recent Risk Alerts
        </h2>

        <p className="text-sm text-slate-400 mt-4">
          No risk alerts available.
        </p>

      </div>

    </main>
  );
}

export default Dashboard;