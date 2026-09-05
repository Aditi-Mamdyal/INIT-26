import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "../supabaseClient";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  const [profile, setProfile] = useState({
    companyName: "",
    username: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("company_name, username")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile loading error:", error);
        return;
      }

      if (data) {
        setProfile({
          companyName: data.company_name,
          username: data.username,
        });
      }
    };

    loadProfile();
  }, []);

  return (
    <div>
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        companyName={profile.companyName}
        username={profile.username}
      />

      <Navbar
        setIsOpen={setIsOpen}
        companyName={profile.companyName}
        username={profile.username}
      />

      <Outlet />
    </div>
  );
}

export default Layout;