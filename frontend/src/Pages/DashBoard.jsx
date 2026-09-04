
import StatCard from "../Components/StatCard";
import RecentTrans from "../Components/RecentTrans";

function Dashboard() {
  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">

      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Welcome back, Srushti!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatCard
          title="Total Balance"
          value="₹45,000"
        />

        <StatCard
          title="Income"
          value="₹25,000"
        />

        <StatCard
          title="Expenses"
          value="₹12,000"
        />

      </div>
      <RecentTrans />

    </main>
  );
}

export default Dashboard;
