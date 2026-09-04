import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function FinancialChart() {
  const data = [
    { month: "Apr", income: 22000, expense: 12000 },
    { month: "May", income: 25000, expense: 14000 },
    { month: "Jun", income: 24000, expense: 11000 },
    { month: "Jul", income: 28000, expense: 16000 },
    { month: "Aug", income: 26000, expense: 13000 },
    { month: "Sep", income: 30000, expense: 15000 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">
        Income vs Expenses
      </h2>

      <p className="text-sm text-slate-500 mt-1 mb-6">
        Monthly financial overview
      </p>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#16a34a"
              strokeWidth={3}
            />

            <Line
              type="monotone"
              dataKey="expense"
              name="Expenses"
              stroke="#ef4444"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default FinancialChart;