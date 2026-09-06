
import { useMemo, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function PerformanceChart({ data = [] }) {
  const [startIndex, setStartIndex] = useState(0);

  // Number of points visible at one time
  const visiblePoints = 8;

  const maxStartIndex = Math.max(
    0,
    data.length - visiblePoints
  );

  const visibleData = useMemo(() => {
    return data.slice(
      startIndex,
      startIndex + visiblePoints
    );
  }, [data, startIndex]);

  const handleSliderChange = (event) => {
    setStartIndex(Number(event.target.value));
  };

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

        <div className="mt-4">

          {/* Chart */}
          <div className="h-72 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={visibleData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                  minTickGap={20}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    `₹${Number(value).toLocaleString(
                      "en-IN"
                    )}`
                  }
                />

                <Tooltip
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString(
                      "en-IN"
                    )}`,
                    "Portfolio Value",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                  dot={true}
                  activeDot={{ r: 5 }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* Slider */}
          {data.length > visiblePoints && (

            <div className="mt-4 px-2">

              <input
                type="range"
                min="0"
                max={maxStartIndex}
                value={startIndex}
                onChange={handleSliderChange}
                className="w-full cursor-pointer"
              />

              <div className="flex justify-between items-center mt-2">

                <span className="text-xs text-slate-400">
                  {visibleData[0]?.date || ""}
                </span>

                <span className="text-xs text-slate-400">
                  Showing {startIndex + 1}-
                  {Math.min(
                    startIndex + visiblePoints,
                    data.length
                  )}{" "}
                  of {data.length}
                </span>

                <span className="text-xs text-slate-400">
                  {visibleData[visibleData.length - 1]?.date || ""}
                </span>

              </div>

            </div>

          )}

        </div>

      )}

    </div>
  );
}

export default PerformanceChart;
