import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Scrollbars from "react-custom-scrollbars-2";
import MenuHeader from "./component/MenuHeader";
import MenuItemList from "./component/MenuItemList";
// import SidebarLoader from "./SidebarLoader";

function SidebarComponent({ roleMenu = [], activeItem: propActiveItem, isOpen = true, isMobile = false, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();
    const activeItem = propActiveItem || location.pathname.split("/").pop() || "";

    // Hover state for peek expansion (disabled on mobile)
    const [isHovered, setIsHovered] = useState(false);

    // Memoize initial menus to avoid unnecessary re-renders
    const initialMenus = useMemo(
        () => roleMenu.map((menu) => ({ ...menu, open: false })),
        [roleMenu]
    );

    const [menus, setMenus] = useState(initialMenus);

    // On mobile, always show expanded when open
    const isCollapsed = isMobile ? false : !isOpen;
    const effectiveIsCollapsed = isMobile ? false : (isCollapsed && !isHovered);


    // Reset all submenus when actually collapsing (via toggle)
    useEffect(() => {
        if (isCollapsed) {
            setMenus((prev) => prev.map((m) => ({ ...m, open: false })));
        }
    }, [isCollapsed]); // Dependency only on isCollapsed to avoid loops

    // Auto-open active parent when expanded (full or peek)
    useEffect(() => {
        if (!effectiveIsCollapsed) {
            setMenus((prev) =>
                prev.map((m) =>
                    m.children?.some((child) => child.key === activeItem)
                        ? { ...m, open: true }
                        : { ...m, open: m.open } // Preserve other opens
                )
            );
        }
    }, [activeItem, effectiveIsCollapsed]); // Safe dependencies

    // Auto-open active parent specifically during peek (when collapsed but hovered)
    useEffect(() => {
        if (isHovered && isCollapsed && activeItem) {
            setMenus((prev) =>
                prev.map((m) =>
                    m.children?.some((child) => child.key === activeItem)
                        ? { ...m, open: true }
                        : { ...m, open: false } // Close others during peek for cleaner view
                )
            );
        }
    }, [isHovered, activeItem, isCollapsed]);

    // Reset menus if roleMenu prop changes (e.g., role switch)
    useEffect(() => {
        setMenus(initialMenus);
    }, [initialMenus]);

    const handleToggle = (menuKey) => {
        if (effectiveIsCollapsed) return; // No toggle when effectively collapsed
        setMenus((prev) =>
            prev.map((m) =>
                m.key === menuKey ? { ...m, open: !m.open } : m
            )
        );
    };

    const handleHeaderClick = (menu) => {
        if (effectiveIsCollapsed) return; // No action when effectively collapsed
        if (menu.children?.length > 0) {
            handleToggle(menu.key);
        } else if (menu.to) {
            navigate(menu.to);
            // Close sidebar on mobile after navigation
            if (isMobile && onClose) {
                onClose();
            }
        }
    };

    // Log for debugging (remove in production)
    // console.log("🚀 ~ SidebarComponent ~ isCollapsed:==============", isCollapsed);

    // Sidebar width with smoother transition (longer duration and refined easing)
    const sidebarWidth = effectiveIsCollapsed ? 60 : 250;
    const transitionDuration = effectiveIsCollapsed ? '0.4s' : '0.35s'; // Slightly asymmetric for natural feel
    const transitionEasing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // Ease-out for expansion, ease-in-out for collapse

    return (
        <div
            className="sidebar h-full shadow-md"
            style={{
                width: sidebarWidth,
                minWidth: sidebarWidth,
                transition: `width ${transitionDuration} ${transitionEasing}`, // Smoother easing and adjustable duration
                overflow: "hidden",
                backgroundColor: "var(--color-bg-side-bar)",
                // color: "var(--color-text-side-bar)",

            }}
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
            onClick={(e) => {
                // Prevent backdrop click from closing sidebar when clicking inside
                e.stopPropagation();
            }}
        >
            <Scrollbars
                autoHide
                autoHeight
                autoHeightMax="100vh"
                style={{
                    width: sidebarWidth,
                    transition: `width ${transitionDuration} ${transitionEasing}`, // Sync scroll transition
                }}
            >
                <div className="sidebar-inner">
                    <ul
                        className="menu-list"
                        style={{
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            height: "86vh",
                            overflowY: "auto",
                            overflowX: "hidden",
                            paddingTop: "1rem",
                            transition: `padding ${transitionDuration} ${transitionEasing}`, // Smooth padding changes if needed
                            // border: " 2px solid",
                        }}
                    >


                        {menus.map((menu) => {
                            const hasChildren = menu.children?.length > 0;
                            const isActive = menu.key === activeItem ||
                                menu.children?.some(child => child.key === activeItem);
                            return (
                                <li key={menu.key} className="menu-item" style={{ listStyle: "none", marginBottom: "4px" }}>
                                    {/* HEADER */}
                                    <div
                                        className={`menu-header transition-all duration-200 ease-in-out ${isActive ? 'active' : ''} ${hasChildren ? 'has-children' : ''}`}
                                        onClick={() => handleHeaderClick(menu)}
                                        style={{
                                            padding: effectiveIsCollapsed ? "8px" : "12px 16px",
                                            margin: "0 8px",
                                            borderRadius: "10px",
                                            cursor: hasChildren && !effectiveIsCollapsed ? "pointer" : "default",
                                            transition: `all 0.25s ${transitionEasing}`, // Sync header transition
                                            position: "relative",
                                            minHeight: "40px",
                                            display: "flex",
                                            alignItems: "center",


                                        }}
                                    >
                                        <MenuHeader
                                            id={menu.key}
                                            label={menu.label}
                                            icon={menu.icon}
                                            isOpen={menu.open}
                                            isCollapsed={effectiveIsCollapsed}
                                            style={{ textDecoration: "none" }}
                                        />
                                    </div>
                                    {/* CHILDREN - Enhanced smooth open/close with longer duration */}
                                    {!effectiveIsCollapsed && hasChildren && (
                                        <div
                                            className={`submenu-wrapper ${menu.open ? 'open' : ''}`}
                                            style={{
                                                maxHeight: menu.open ? "500px" : "0",
                                                overflow: "hidden",
                                                transition: `max-height 0.4s ${transitionEasing}, opacity 0.4s ${transitionEasing}`, // Smoother submenu transition
                                                opacity: menu.open ? 1 : 0,
                                                paddingLeft: "16px",
                                            }}
                                        >
                                            <MenuItemList
                                                items={menu.children}
                                                activeItem={activeItem}
                                                isOpen={menu.open}
                                                className="text-decoration-none"
                                                onNavigate={isMobile && onClose ? onClose : undefined}
                                            />
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </Scrollbars>
        </div>
    );
}

export default SidebarComponent;