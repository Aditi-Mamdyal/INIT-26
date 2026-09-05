import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

function PortfolioAllocationChart({ data = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

      <h2 className="text-lg font-semibold text-slate-800">
        Portfolio Allocation
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        Distribution of capital across asset types
      </p>

      {data.length === 0 ? (
        <div className="h-72 flex items-center justify-center">
          <p className="text-slate-400">
            Allocation data will appear here.
          </p>
        </div>
      ) : (
        <div className="h-72 mt-4">

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Pie>

              <Tooltip />
              <Legend />

            </PieChart>
          </ResponsiveContainer>

        </div>
      )}

    </div>
  );
}

export default PortfolioAllocationChart;