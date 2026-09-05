import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function PortfolioAllocationChart({ data = [] }) {
  const COLORS = [
    "#2563EB", // Blue
    "#16A34A", // Green
    "#F59E0B", // Amber
    "#9333EA", // Purple
    "#DC2626", // Red
    "#0891B2", // Cyan
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">

      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Portfolio Allocation
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Distribution of capital across asset types
        </p>
      </div>

      {/* Chart */}
      <div className="p-6">

        {data.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <p className="text-slate-400">
              No allocation data available.
            </p>
          </div>
        ) : (
          <div className="h-80">

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(1)}%`
                  }
                  labelLine={false}
                >

                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}

                </Pie>

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString("en-IN")}`
                  }
                />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                />

              </PieChart>
            </ResponsiveContainer>

          </div>
        )}

      </div>
    </div>
  );
}

export default PortfolioAllocationChart;