
import React from "react";
import SidebarComponent from "./SidebarComponent";
import { sidebarMenus } from "./SidebarMenus";
import { useSelector } from "react-redux";

function SidebarLoader({ isOpen = true, onClose, isMobile = false }) {
    const role = localStorage.getItem("role") || "admin";
    // console.log("🚀 ~ SidebarLoader ~ role:", role)
    const menu = sidebarMenus[role?.toLowerCase()] || [];

    // 🔥 FIX: get sidebarOpen from Redux and pass it down
    const reduxIsOpen = useSelector((state) => state.ui.sidebarOpen);
    // console.log("🚀 ~ SidebarLoader ~ reduxIsOpen:------------", reduxIsOpen)

    return (
        <SidebarComponent
            roleMenu={menu}
            activeItem=""
            isOpen={isMobile ? (isOpen || reduxIsOpen) : (isOpen || reduxIsOpen)}   // ✅ CRITICAL FIX
            onClose={onClose}
            isMobile={isMobile}
        />
    );
}

export default SidebarLoader;