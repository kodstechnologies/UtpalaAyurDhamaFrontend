import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout() {
    return (
        <>
            <Header />

            <div style={{ display: "flex", width: "100%", height: "100vh" }}>

                {/* SIDEBAR FIXED WIDTH */}
                <div style={{ width: "250px", minWidth: "250px" }}>
                    <Sidebar />
                </div>

                {/* PAGE CONTENT */}
                <div style={{
                    flexGrow: 1,
                    padding: "20px",
                    overflowY: "auto",
                    background: "var(--color-background)"
                }}>
                    <Outlet />
                </div>
            </div>
        </>
    );
}

export default Layout;
