import {
  WalletCards,
  BriefcaseBusiness,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";

function StatCard({ title, value, change, positive = true }) {
  
  const getIcon = () => {
    if (title === "Total Capital") {
      return {
        icon: WalletCards,
        bg: "bg-blue-50",
        color: "text-blue-600",
      };
    }

    if (title === "Portfolio Value") {
      return {
        icon: BriefcaseBusiness,
        bg: "bg-indigo-50",
        color: "text-indigo-600",
      };
    }

    if (title === "Total Return") {
      return {
        icon: TrendingUp,
        bg: "bg-emerald-50",
        color: "text-emerald-600",
      };
    }

    if (title === "Portfolio Risk") {
      return {
        icon: ShieldAlert,
        bg: "bg-amber-50",
        color: "text-amber-600",
      };
    }

    return {
      icon: WalletCards,
      bg: "bg-slate-50",
      color: "text-slate-600",
    };
  };

  const { icon: Icon, bg, color } = getIcon();

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200
      p-6 shadow-sm hover:shadow-md transition-all duration-200"
    >

      {/* Top Section */}
      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        {/* Icon */}
        <div
          className={`h-11 w-11 rounded-xl ${bg}
          flex items-center justify-center`}
        >
          <Icon
            size={22}
            strokeWidth={2}
            className={color}
          />
        </div>

      </div>

      {/* Amount */}
      <h2 className="text-2xl font-bold text-slate-800 mt-5">
        {value}
      </h2>

      {/* Change */}
      {change && (
        <p
          className={`text-sm font-medium mt-2 ${
            positive
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {positive ? "↑" : "↓"} {change}
        </p>
      )}

    </div>
  );
}

export default StatCard;