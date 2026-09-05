function AlertCard({
  severity,
  message,
  recommendedAction,
  status
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">
          Risk Alert
        </h3>

        <span className="text-sm font-medium text-slate-500">
          {severity ?? "--"}
        </span>
      </div>

      <p className="text-sm text-slate-600 mt-4">
        {message ?? "No alert information available."}
      </p>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">
          Recommended Action
        </p>

        <p className="text-sm text-slate-700 mt-1">
          {recommendedAction ?? "--"}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-sm text-slate-500">
          Status: {status ?? "--"}
        </p>
      </div>

    </div>
  );
}

export default AlertCard;