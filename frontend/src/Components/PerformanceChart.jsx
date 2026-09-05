import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function PerformanceChart({ data = [] }) {

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

      <h2 className="text-lg font-semibold text-slate-800">
        Portfolio Performance
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        Portfolio value over time
      </p>

      {data.length === 0 ? (

        <div className="h-72 flex items-center justify-center">
          <p className="text-slate-400">
            Performance data will appear here.
          </p>
        </div>

      ) : (

        <div className="h-72 mt-4">

          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={data}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="value"
                strokeWidth={2}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      )}

    </div>
  );
}

export default PerformanceChart;