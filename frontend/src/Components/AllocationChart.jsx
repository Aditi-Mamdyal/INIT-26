function AllocationChart({ data = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

      <h2 className="text-lg font-semibold text-slate-800">
        Asset Allocation
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        Current portfolio allocation
      </p>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-400">
            Allocation data will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {/* Chart will be connected to real data later */}
        </div>
      )}

    </div>
  );
}

export default AllocationChart;