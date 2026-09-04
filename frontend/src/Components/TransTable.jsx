function TransTable() {
  const transactions = [
    {
      name: "Amazon",
      category: "Shopping",
      date: "03 Sep 2026",
      amount: "₹1,200",
      type: "Expense",
      icon: "🛒",
    },
    {
      name: "Swiggy",
      category: "Food",
      date: "02 Sep 2026",
      amount: "₹450",
      type: "Expense",
      icon: "🍔",
    },
    {
      name: "Salary",
      category: "Income",
      date: "01 Sep 2026",
      amount: "₹25,000",
      type: "Income",
      icon: "💰",
    },
    {
      name: "Uber",
      category: "Transport",
      date: "31 Aug 2026",
      amount: "₹300",
      type: "Expense",
      icon: "🚕",
    },
    {
      name: "Netflix",
      category: "Entertainment",
      date: "30 Aug 2026",
      amount: "₹649",
      type: "Expense",
      icon: "🎬",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                Transaction
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                Category
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                Date
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                Type
              </th>

              <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                Amount
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction, index) => (
              <tr
                key={index}
                className="hover:bg-slate-50 transition"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      {transaction.icon}
                    </div>

                    <span className="font-medium text-slate-800">
                      {transaction.name}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {transaction.category}
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {transaction.date}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.type === "Income"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {transaction.type}
                  </span>
                </td>

                <td
                  className={`px-6 py-4 text-right font-semibold ${
                    transaction.type === "Income"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {transaction.type === "Income" ? "+" : "-"}{" "}
                  {transaction.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransTable;