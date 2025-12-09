import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useMediaQuery, useTheme } from "@mui/material";
import Header from "./Header";
import SidebarLoader from "./SidebarLoader";
import Footer from "./Footer";
import { toggleSidebar } from "../../redux/slices/uiSlice";

function Layout() {
    const location = useLocation();
    const dispatch = useDispatch();
    const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Below 900px (md breakpoint)

    // Create Title
    const lastSegment = location.pathname.split('/').pop() || '';
    const pageTitle = lastSegment
        ? lastSegment
            .replace(/[-_]/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .replace(/\b\w/g, (l) => l.toUpperCase())
        : '';

    // Close sidebar on mobile when route changes
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            dispatch(toggleSidebar());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]); // Only depend on pathname to close sidebar on navigation

    // Handle backdrop click to close sidebar on mobile
    const handleBackdropClick = () => {
        if (isMobile && sidebarOpen) {
            dispatch(toggleSidebar());
        }
    };

    return (
        <>
            <Header pageTitle={pageTitle} />

            {/* Main container with sidebar + content */}
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    minHeight: "calc(100vh - 60px)", // prevent footer overlap
                    background: "var(--color-background)",
                    position: "relative",
                }}
            >
                {/* Mobile Backdrop */}
                {isMobile && sidebarOpen && (
                    <div
                        onClick={handleBackdropClick}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            zIndex: 1199,
                            transition: "opacity 0.3s ease",
                        }}
                    />
                )}

                {/* SIDEBAR */}
                <div
                    style={{
                        width: isMobile 
                            ? (sidebarOpen ? "250px" : "0")
                            : (sidebarOpen ? "250px" : "60px"),
                        minWidth: isMobile 
                            ? (sidebarOpen ? "250px" : "0")
                            : (sidebarOpen ? "250px" : "60px"),
                        transition: "width 0.3s ease, transform 0.3s ease",
                        backgroundColor: "var(--color-background)",
                        overflow: "hidden",
                        height: isMobile ? "calc(100vh - 60px)" : "auto",
                        position: isMobile ? "fixed" : "relative",
                        left: isMobile ? (sidebarOpen ? "0" : "-250px") : "0",
                        top: isMobile ? "60px" : "0",
                        zIndex: isMobile ? 1200 : "auto",
                        boxShadow: isMobile && sidebarOpen ? "2px 0 8px rgba(0,0,0,0.15)" : "none",
                    }}
                >
                    <SidebarLoader 
                        isOpen={sidebarOpen} 
                        isMobile={isMobile}
                        onClose={() => dispatch(toggleSidebar())}
                    />
                </div>

                {/* PAGE CONTENT */}
                <div
                    style={{
                        flexGrow: 1,
                        padding: isMobile ? "15px" : "20px",
                        overflowY: "auto",
                        width: isMobile ? "100%" : "auto",
                        transition: isMobile ? "none" : "margin-left 0.3s ease",
                    }}
                >
                    <Outlet />
                </div>
            </div>

            {/* FOOTER FIXED AT BOTTOM */}
            <Footer />
        </>
    );
}

export default Layout;
