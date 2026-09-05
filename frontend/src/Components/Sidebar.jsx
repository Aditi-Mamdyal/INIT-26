import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ShieldCheck,
  Zap,
  X,
} from "lucide-react";

function Sidebar({ isOpen, setIsOpen }) {
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
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-blue-950 text-white z-50
        shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >

        {/* Logo Section */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-blue-900">

          <div className="flex items-center gap-3">

            {/* Logo Icon */}
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-lg font-bold">
                F
              </span>
            </div>

            {/* Logo Text */}
            <div>
              <h2 className="text-xl font-bold">
                Fin<span className="text-blue-300">Tech</span>
              </h2>

              <p className="text-xs text-blue-200">
                Capital Management
              </p>
            </div>

          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-lg flex items-center justify-center
            text-white hover:bg-blue-700
            transition-all duration-200"
          >
            <X size={20} />
          </button>

        </div>

        {/* Navigation */}
        <div className="px-4 py-6">

          <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-blue-200">
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
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                        : "text-white hover:text-white hover:bg-blue-800"
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
                            : "bg-blue-900 group-hover:bg-blue-700"
                        }`}
                      >
                        <Icon
                          size={20}
                          strokeWidth={2}
                        />
                      </span>

                      {/* Page Name */}
                      <span className="font-medium">
                        {item.name}
                      </span>

                      {/* Active Indicator */}
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
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

          <div className="rounded-xl bg-blue-800 border border-blue-700 p-4">

            <p className="text-xs text-white">
              Portfolio Control System
            </p>

            <p className="text-sm font-medium text-blue-100 mt-1">
              Risk-aware capital management
            </p>

          </div>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;