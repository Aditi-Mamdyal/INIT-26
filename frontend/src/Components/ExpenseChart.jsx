import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ExpenseChart() {
  const data = [
    { name: "Food", value: 3500 },
    { name: "Shopping", value: 2800 },
    { name: "Transport", value: 1800 },
    { name: "Entertainment", value: 1200 },
    { name: "Bills", value: 1700 },
  ];

  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#10b981",
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">
        Expense Breakdown
      </h2>

      <p className="text-sm text-slate-500 mt-1 mb-4">
        Where your money is going
      </p>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ExpenseChart;