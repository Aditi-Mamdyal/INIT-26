
function RecentTrans() {
  const transactions = [
    {
      name: "Amazon",
      category: "Shopping",
      amount: "- ₹1,200",
      date: "Sep 03",
      icon: "🛒",
      type: "expense",
    },
    {
      name: "Swiggy",
      category: "Food",
      amount: "- ₹450",
      date: "Sep 02",
      icon: "🍔",
      type: "expense",
    },
    {
      name: "Salary",
      category: "Income",
      amount: "+ ₹25,000",
      date: "Sep 01",
      icon: "💰",
      type: "income",
    },
    {
      name: "Uber",
      category: "Transport",
      amount: "- ₹300",
      date: "Aug 31",
      icon: "🚕",
      type: "expense",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-8">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

        <h2 className="text-lg font-semibold text-slate-800">
          Recent Transactions
        </h2>

        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View All →
        </button>

      </div>

      {/* Transactions */}
      <div className="divide-y divide-slate-100">

        {transactions.map((transaction, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
          >

            {/* Left */}
            <div className="flex items-center gap-4">

              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                {transaction.icon}
              </div>

              <div>
                <p className="font-medium text-slate-800">
                  {transaction.name}
                </p>

                <p className="text-sm text-slate-500">
                  {transaction.category}
                </p>
              </div>

            </div>

            {/* Right */}
            <div className="text-right">

              <p
                className={`font-semibold ${
                  transaction.type === "income"
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {transaction.amount}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {transaction.date}
              </p>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default RecentTrans;
