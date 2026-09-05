import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function PortfolioAllocationChart({
  data = [],
  totalCapital = 0,
}) {
  const COLORS = {
    equity: "#2563EB",
    bonds: "#16A34A",
    gold: "#F59E0B",
    cash: "#9333EA",
  };

  const getColor = (name) => {
    return COLORS[name?.toLowerCase()] || "#64748B";
  };

  const totalAllocation = data.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const formatPercentage = (value) => {
    if (!totalAllocation) return "0%";

    return `${(
      (Number(value || 0) / totalAllocation) *
      100
    ).toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Portfolio Allocation
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Distribution of capital across asset classes
            </p>
          </div>

          {/* Total Capital */}
          <div className="hidden sm:block text-right">

            <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
              Total Capital
            </p>

            <p className="text-lg font-bold text-slate-800 mt-1">
              {formatCurrency(totalCapital)}
            </p>

          </div>

        </div>

      </div>

      {/* Chart Area */}
      <div className="p-6">

        {data.length === 0 ? (

          <div className="h-80 flex flex-col items-center justify-center">

            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="text-2xl text-slate-400">
                ◌
              </span>
            </div>

            <p className="text-sm font-medium text-slate-500">
              No allocation data available
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Portfolio allocation will appear here once data is available.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">

            {/* Pie Chart */}
            <div className="h-80">

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius={70}
                    outerRadius={115}
                    paddingAngle={4}
                    cornerRadius={6}
                    stroke="white"
                    strokeWidth={3}
                  >

                    {data.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={getColor(entry.name)}
                      />
                    ))}

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      boxShadow:
                        "0 10px 25px rgba(15, 23, 42, 0.10)",
                      padding: "10px 14px",
                    }}
                    formatter={(value, name) => [
                      formatCurrency(value),
                      name,
                    ]}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-sm text-slate-600">
                        {value}
                      </span>
                    )}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

            {/* Allocation Details */}
            <div className="space-y-3">

              {data.map((entry) => {

                const percentage = formatPercentage(entry.value);

                return (
                  <div
                    key={entry.name}
                    className="group p-4 rounded-xl border border-slate-200
                    hover:border-slate-300 hover:shadow-sm
                    transition-all duration-200"
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        {/* Color Indicator */}
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getColor(entry.name),
                          }}
                        />

                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {entry.name}
                          </p>

                          <p className="text-xs text-slate-400 mt-0.5">
                            {percentage} allocation
                          </p>
                        </div>

                      </div>

                      <div className="text-right">

                        <p className="text-sm font-bold text-slate-800">
                          {formatCurrency(entry.value)}
                        </p>

                        <p className="text-xs text-slate-400 mt-0.5">
                          {percentage}
                        </p>

                      </div>

                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: percentage,
                          backgroundColor: getColor(entry.name),
                        }}
                      />

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default PortfolioAllocationChart;