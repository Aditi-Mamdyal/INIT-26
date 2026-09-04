
function StatCard({ title, value, change, icon, positive = true }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">

      {/* Top section */}
      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
          {icon}
        </div>

      </div>

      {/* Amount */}
      <h2 className="text-2xl font-bold text-slate-800 mt-4">
        {value}
      </h2>

      {/* Change */}
      <p
        className={`text-sm font-medium mt-2 ${
          positive ? "text-green-600" : "text-red-500"
        }`}
      >
        {positive ? "↑" : "↓"} {change}
      </p>

    </div>
  );
  
}

export default StatCard;

