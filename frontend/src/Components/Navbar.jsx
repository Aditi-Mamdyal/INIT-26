import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
function Navbar({ setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const pageNames = {
    "/dashboard": "Dashboard",
    "/transactions": "Transactions",
    "/analytics": "Analytics",
    "/settings": "Settings",
  };

  const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate("/login");
};

  const currentPage = pageNames[location.pathname] || "Dashboard";

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30">

      {/* Left Section */}
      <div className="flex items-center gap-4">

        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(true)}
          className="text-2xl text-slate-700 hover:text-blue-600 transition"
        >
          ☰
        </button>

        {/* Logo */}
        <div className="text-xl font-bold">
          <span className="text-slate-800">Fin</span>
          <span className="text-blue-600">Tech</span>
        </div>

        {/* Current Page */}
        <div className="h-6 w-px bg-slate-300"></div>

        <h3 className="text-lg font-semibold text-slate-700">
          {currentPage}
        </h3>

      </div>

      {/* Right Section */}
<div className="flex items-center gap-3">

  <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
    S
  </div>

  <span className="font-medium text-slate-700">
    Srushti
  </span>

  <button
    onClick={handleLogout}
    className="px-4 py-2 text-black font-medium hover:text-red-700 cursor-pointer transition"
  >
    Logout
  </button>

</div>

    </div>
  );
}

export default Navbar;