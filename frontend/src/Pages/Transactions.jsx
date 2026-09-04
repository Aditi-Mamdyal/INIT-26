import TransactionTable from "../Components/TransTable";

function Transactions() {
  return (
    <main className="pt-20 p-8 bg-slate-100 min-h-screen">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Transactions
          </h1>

          <p className="text-slate-500 mt-1">
            Track and manage your income and expenses.
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl transition shadow-sm">
          + Add Transaction
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          
          <input
            type="text"
            placeholder="Search transactions..."
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select className="border border-slate-200 rounded-xl px-4 py-3 text-slate-600 outline-none">
            <option>All Categories</option>
            <option>Food</option>
            <option>Shopping</option>
            <option>Transport</option>
            <option>Entertainment</option>
            <option>Income</option>
          </select>

          <select className="border border-slate-200 rounded-xl px-4 py-3 text-slate-600 outline-none">
            <option>All Types</option>
            <option>Income</option>
            <option>Expense</option>
          </select>
        </div>
      </div>

      <TransactionTable />

    </main>
  );
}

export default Transactions;