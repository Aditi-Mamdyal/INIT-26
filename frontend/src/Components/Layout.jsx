
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <Navbar
        setIsOpen={setIsOpen}
      />

      {/* Current page appears here */}
      <Outlet />
    </div>
  );
}

export default Layout;

