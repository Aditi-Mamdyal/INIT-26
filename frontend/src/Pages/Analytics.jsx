import FinancialChart from "../Components/FinancialChart";
import ExpenseChart from "../Components/ExpenseChart";

function Analytics() {
  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Analytics
        </h1>

        <p className="text-slate-500 mt-1">
          Understand your spending and financial habits.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Income
          </p>

          <h2 className="text-2xl font-bold text-green-600 mt-2">
            ₹1,55,000
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Last 6 months
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Expenses
          </p>

          <h2 className="text-2xl font-bold text-red-500 mt-2">
            ₹81,000
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Last 6 months
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Savings
          </p>

          <h2 className="text-2xl font-bold text-blue-600 mt-2">
            ₹74,000
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Last 6 months
          </p>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialChart />
        <ExpenseChart />
      </div>

    </main>
  );
}

export default Analytics;