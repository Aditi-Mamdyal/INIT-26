function RiskCard({ title, value, status }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-2">
        {value ?? "--"}
      </h2>

      <p className="text-sm text-slate-500 mt-2">
        Status: {status ?? "--"}
      </p>

    </div>
  );
}

export default RiskCard;