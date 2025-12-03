import React from "react";
import AdminSidebar from "./roleSidebar/AdminSidebar";
// import DoctorSidebar from "./roleSidebar/DoctorSidebar"; // Create later

function Sidebar() {
  // Get role from localStorage
  const role = localStorage.getItem("role") || "admin";
  // For now hard-coded fallback

  return (
    <>
      {/* ADMIN SIDEBAR */}
      {role === "admin" && <AdminSidebar />}

      {/* DOCTOR SIDEBAR */}
      {/* {role === "doctor" && <DoctorSidebar />} */}

      {/* DEFAULT MESSAGE */}
      {!["admin", "doctor"].includes(role) && (
        <div style={{ padding: "20px" }}>No Sidebar Available</div>
      )}
    </>
  );
}

export default Sidebar;
