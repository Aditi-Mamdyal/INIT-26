import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function PortfolioAllocationChart({ data = [] }) {

  const COLORS = {
    equity: "#2563EB",
    bonds: "#16A34A",
    gold: "#F59E0B",
    cash: "#9333EA",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">

      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Portfolio Allocation
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Distribution of capital across asset classes
        </p>
      </div>

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
                  cy="45%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={3}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        COLORS[entry.name] ||
                        "#64748B"
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(
                      value
                    ).toLocaleString("en-IN")}`
                  }
                />

                <Legend />

              </PieChart>
            </ResponsiveContainer>

          </div>
        )}

      </div>
    </div>
  );
}

export default PortfolioAllocationChart;