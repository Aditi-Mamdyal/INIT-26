import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ShieldCheck,
  Zap,
  X,
  CircleUserRound,
} from "lucide-react";

function Sidebar({
  isOpen,
  setIsOpen,
  companyName,
  username,
}) {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Portfolio",
      path: "/portfolio",
      icon: BriefcaseBusiness,
    },
    {
      name: "Optimization",
      path: "/optimisation",
      icon: ChartNoAxesCombined,
    },
    {
      name: "Risk Controls",
      path: "/risk-control",
      icon: ShieldCheck,
    },
    {
      name: "Scenarios",
      path: "/scenarios",
      icon: Zap,
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72
        bg-gradient-to-b from-slate-950 via-blue-950 to-indigo-950
        text-white z-50 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >

        {/* Logo Section */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/10">

          <div className="flex items-center gap-3">

            {/* Logo Icon */}
            <div className="w-10 h-10 rounded-xl
              bg-gradient-to-br from-blue-500 to-indigo-500
              flex items-center justify-center
              shadow-lg shadow-blue-500/20"
            >
              <span className="text-lg font-bold">
                F
              </span>
            </div>

            {/* Logo Text */}
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Fin<span className="text-blue-300">Tech</span>
              </h2>

              <p className="text-xs text-slate-400">
                Capital Management
              </p>
            </div>

          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-lg flex items-center justify-center
            text-slate-300 hover:text-white hover:bg-white/10
            transition-all duration-200"
          >
            <X size={20} />
          </button>

        </div>

        {/* Logged In User */}
        <div className="px-4 pt-5">

          <div
            className="rounded-2xl p-4
            bg-white/[0.07]
            border border-white/10
            shadow-inner"
          >

            <div className="flex items-center gap-3">

              {/* User Avatar */}
              <div
                className="w-11 h-11 rounded-xl
                bg-gradient-to-br from-blue-500/30 to-indigo-500/30
                border border-blue-400/20
                flex items-center justify-center
                text-blue-200"
              >
                <CircleUserRound size={22} />
              </div>

              {/* User Information */}
              <div className="min-w-0">

                <p className="text-[10px] uppercase tracking-[0.15em]
                  text-blue-300 font-semibold"
                >
                  System Operator
                </p>

                <p className="text-sm font-semibold text-white truncate mt-0.5">
                  {username || "User"}
                </p>

                <div className="flex items-center gap-1.5 mt-1">

                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />

                  <span className="text-[11px] text-slate-400">
                    Currently logged in
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Navigation */}
        <div className="px-4 py-6">

          <p
            className="px-3 mb-3 text-[11px] font-semibold
            uppercase tracking-[0.18em] text-white"
          >
            Navigation
          </p>

          <nav className="flex flex-col gap-2">

            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-4 px-4 py-3.5 rounded-xl
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/40"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.07]"
                    }`
                  }
                >

                  {({ isActive }) => (
                    <>
                      {/* Icon */}
                      <span
                        className={`w-9 h-9 rounded-lg flex items-center justify-center
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-white/15"
                            : "bg-white/[0.04] group-hover:bg-white/10"
                        }`}
                      >
                        <Icon
                          size={20}
                          strokeWidth={2}
                        />
                      </span>

                      {/* Page Name */}
                      <span className="font-medium text-sm">
                        {item.name}
                      </span>

                      {/* Active Indicator */}
                      {isActive && (
                        <span
                          className="ml-auto w-1.5 h-1.5 rounded-full
                          bg-white shadow-sm"
                        />
                      )}

                    </>
                  )}

                </NavLink>
              );
            })}

          </nav>

        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4">

          <div
            className="rounded-2xl
            bg-gradient-to-br from-blue-900/70 to-indigo-900/70
            border border-white/10
            p-4"
          >

            <div className="flex items-center gap-2 mb-2">

              <div className="w-2 h-2 rounded-full bg-blue-400" />

              <p className="text-xs font-semibold text-blue-200">
                Portfolio Control System
              </p>

            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Risk-aware capital management
            </p>

          </div>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;