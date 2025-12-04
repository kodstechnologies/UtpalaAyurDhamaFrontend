import React from "react";
import SidebarComponent from "./SidebarComponent";
import { sidebarMenus } from "./SidebarMenus";

function SidebarLoader() {
    // const role = localStorage.getItem("role") || "admin";
    // const role = localStorage.getItem("role") || "doctor";
    const role = localStorage.getItem("role") || "nurse";
    const menu = sidebarMenus[role] || [];

    return <SidebarComponent roleMenu={menu} activeItem="" />;
}

export default SidebarLoader;
