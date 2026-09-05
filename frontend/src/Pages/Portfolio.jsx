import StatCard from "../Components/StatCard";
import HoldingsTable from "../Components/HoldingsTable";
import PortfolioAllocationChart from "../Components/PortfolioAllocationChart";

function Portfolio() {
  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Portfolio
        </h1>

        <p className="text-slate-500 mt-2">
          View and monitor your current asset holdings.
        </p>
      </div>


      {/* Portfolio Summary */}
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

        <HoldingsTable holdings={[]} />

      </div>

      <div className="mt-8">
  <PortfolioAllocationChart data={[]} />
</div>

    </main>
  );
}

export default Portfolio;