function RiskRuleCard({
  ruleName,
  currentValue,
  threshold,
  status
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">
          {ruleName ?? "--"}
        </h3>

        <span className="text-sm font-medium text-slate-500">
          {status ?? "--"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5">

        <div>
          <p className="text-sm text-slate-500">
            Current Value
          </p>

          <p className="text-xl font-bold text-slate-800 mt-1">
            {currentValue ?? "--"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Threshold
          </p>

          <p className="text-xl font-bold text-slate-800 mt-1">
            {threshold ?? "--"}
          </p>
        </div>

      </div>

    </div>
  );
}

export default RiskRuleCard;