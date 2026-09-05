import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Navbar({ setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const pageNames = {
    "/dashboard": "Dashboard",
    "/portfolio": "Portfolio",
    "/optimisation": "Optimization",
    "/risk-control": "Risk Controls",
    "/scenarios": "Scenarios",
  };

  const currentPage = pageNames[location.pathname] || "Dashboard";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-30 shadow-sm">

      {/* Left Section */}
      <div className="flex items-center gap-4">

        {/* Menu Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 rounded-lg flex items-center justify-center
          text-slate-600 hover:text-blue-600 hover:bg-blue-50
          transition-all duration-200"
        >
          <span className="text-xl">☰</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            F
          </div>

          <span className="text-xl font-bold text-slate-800">
            Fin<span className="text-blue-600">Tech</span>
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-7 w-px bg-slate-200"></div>

        {/* Current Page */}
        <h3 className="hidden sm:block text-lg font-bold text-blue-600">
          {currentPage}
        </h3>

      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
          S
        </div>

        {/* User Name */}
        <span className="hidden sm:block font-medium text-slate-700">
          Srushti
        </span>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="ml-2 px-4 py-2 rounded-lg text-sm font-medium
          text-black hover:text-red-600 cursor-pointer
          transition-all duration-200"
        >
          Logout
        </button>

      </div>

    </header>
  );
}

export default Navbar;