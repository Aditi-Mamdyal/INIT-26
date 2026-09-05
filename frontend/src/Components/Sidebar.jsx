import { NavLink } from "react-router-dom";

function Sidebar({ isOpen, setIsOpen }) {

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "🏠"
    },
    {
      name: "Portfolio",
      path: "/portfolio",
      icon: "💼"
    },
    {
      name: "Optimization",
      path: "/optimisation",
      icon: "📈"
    },
    {
      name: "Risk Controls",
      path: "/risk-control",
      icon: "🛡️"
    },
    {
      name: "Scenarios",
      path: "/scenarios",
      icon: "⚡"
    }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white p-6 z-50
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >

        {/* Logo */}
        <div className="flex items-center justify-between mb-10">

          <h2 className="text-2xl font-bold">
            Fin<span className="text-blue-400">Tech</span>
          </h2>

          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white text-xl"
          >
            ✕
          </button>

        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-3">

          {menuItems.map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 transition
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >

              <span>{item.icon}</span>
              <span>{item.name}</span>

            </NavLink>

          ))}

        </nav>

      </div>
    </>
  );
}

export default Sidebar;