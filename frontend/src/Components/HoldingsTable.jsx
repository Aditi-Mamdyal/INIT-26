function HoldingsTable({ holdings = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">

      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Portfolio Allocation
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Current allocation across asset classes
        </p>
      </div>

      {holdings.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-slate-400">
            No portfolio allocation available.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Asset Class
                </th>

                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                  Allocation
                </th>

                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                  Current Value
                </th>
              </tr>
            </thead>

            <tbody>
              {holdings.map((holding) => (
                <tr
                  key={holding.assetClass}
                  className="border-t border-slate-100"
                >

                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-800 capitalize">
                      {holding.assetClass}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-right font-semibold text-slate-700">
                    {holding.allocationPct}%
                  </td>

                  <td className="px-6 py-4 text-sm text-right text-slate-700">
                    ₹{holding.currentValue.toLocaleString("en-IN")}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}

export default HoldingsTable;