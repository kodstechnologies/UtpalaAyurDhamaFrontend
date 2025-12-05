// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom"; // Enhanced: Added useNavigate for redirection
// import Scrollbars from "react-custom-scrollbars-2";
// import MenuHeader from "./component/MenuHeader"; // Fixed: Typo "comonent" -> "component"
// import MenuItemList from "./component/MenuItemList"; // Fixed: Typo "comonent" -> "component"

// function SidebarComponent({ roleMenu = [], activeItem: propActiveItem }) {
//     const location = useLocation();
//     const navigate = useNavigate(); // New: For handling redirects on header click if no children
//     // Enhanced: Dynamically determine active item from route if not provided
//     const activeItem = propActiveItem || location.pathname.split("/").pop() || "";

//     // Updated: Initialize menus with open: false to close by default (don't display sub-items initially)
//     const [menus, setMenus] = useState(
//         roleMenu.map((menu) => ({ ...menu, open: false }))
//     );

//     // New: Auto-open parent menu if a child is active
//     useEffect(() => {
//         setMenus((prev) =>
//             prev.map((m) => {
//                 if (m.children?.some((child) => child.key === activeItem)) {
//                     return { ...m, open: true };
//                 }
//                 return m;
//             })
//         );
//     }, [activeItem]);

//     // Enhanced: Toggle single menu (only if has children)
//     const handleToggle = (menuKey) => {
//         setMenus((prev) =>
//             prev.map((m) =>
//                 m.key === menuKey ? { ...m, open: !m.open } : m
//             )
//         );
//     };

//     // New: Handle header click - toggle if has children, else redirect
//     const handleHeaderClick = (menu) => {
//         if (menu.children && menu.children.length > 0) {
//             handleToggle(menu.key);
//         } else if (menu.to) {
//             navigate(menu.to);
//         }
//         // If no children and no 'to', do nothing or log warning (handled silently here)
//     };

//     // Enhanced: Custom scrollbar styling for smoother, themed appearance
//     const renderTrackVertical = ({ style, ...props }) => (
//         <div
//             {...props}
//             style={{
//                 ...style,
//                 right: "4px",
//                 bottom: "4px",
//                 top: "4px",
//                 backgroundColor: "transparent",
//                 borderRadius: "3px",
//             }}
//         />
//     );

//     const renderThumbVertical = ({ style, ...props }) => (
//         <div
//             {...props}
//             style={{
//                 ...style,
//                 backgroundColor: "var(--color-icons)",
//                 borderRadius: "7px",
//                 opacity: 0.6,
//                 transition: "opacity 0.3s ease, background-color 0.2s ease",
//                 boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//             }}
//         />
//     );

//     // Fixed: Determine if parent menu should be highlighted (any child active) - Added optional chaining
//     const getParentActive = (menu) => menu.children?.some((child) => child.key === activeItem) || false;

//     return (
//         <div
//             className="sidebar"
//             style={{
//                 width: "250px",
//                 background: "linear-gradient(180deg, var(--color-bg-side-bar) 0%, rgba(0,0,0,0.08) 100%)", // Enhanced: Gradient for depth
//                 color: "var(--color-text-side-bar)",
//                 borderRight: "1px solid var(--color-border)",
//                 height: "100vh",
//                 marginTop: "5rem",
//                 overflow: "hidden",
//                 position: "fixed",
//                 left: 0,
//                 top: 0,
//                 zIndex: 1000,
//                 boxShadow: "4px 0 20px rgba(0,0,0,0.15)", // Enhanced: Shadow for separation
//                 transition: "box-shadow 0.3s ease", // Enhanced: Smooth transition
//             }}
//         >
//             <Scrollbars
//                 autoHide
//                 autoHeight
//                 autoHeightMax="100vh"
//                 style={{ height: "100%" }}
//                 renderTrackVertical={renderTrackVertical}
//                 renderThumbVertical={renderThumbVertical}
//                 renderView={(props) => (
//                     <div
//                         {...props}
//                         style={{
//                             ...props.style,
//                             overflow: "hidden",
//                             paddingRight: "8px",
//                             marginTop: "20px", // Enhanced: Consistent top margin
//                         }}
//                     />
//                 )}
//             >
//                 <div className="sidebar-inner" style={{ padding: "20px 0" }}>
//                     <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
//                         {menus.map((menu) => {
//                             const isParentActive = getParentActive(menu);
//                             const hasChildren = menu.children && menu.children.length > 0;
//                             return (
//                                 <li
//                                     key={menu.key}
//                                     className="submenu"
//                                     style={{
//                                         marginBottom: "12px",
//                                         borderRadius: "10px", // Enhanced: Softer radius
//                                         overflow: "hidden",
//                                         background: menu.open
//                                             ? "rgba(255,255,255,0.12)"
//                                             : "rgba(255,255,255,0.04)", // Enhanced: Dynamic opacity
//                                         transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Enhanced: Smooth bezier
//                                         transform: isParentActive ? "scale(1.02)" : "scale(1)", // Enhanced: Subtle scale on active
//                                     }}
//                                 >
//                                     {/* HEADER - Enhanced with hover */}
//                                     <div
//                                         style={{
//                                             padding: "12px 18px",
//                                             display: "flex",
//                                             alignItems: "center",
//                                             gap: "12px",
//                                             cursor: "pointer",
//                                             fontWeight: 600,
//                                             transition: "all 0.25s ease",
//                                             background: isParentActive
//                                                 ? "rgba(255,255,255,0.15)"
//                                                 : "transparent",
//                                             borderRadius: hasChildren ? "10px 10px 0 0" : "10px", // Enhanced: Adjust radius if no children
//                                             position: "relative",
//                                         }}
//                                         onMouseEnter={(e) => {
//                                             if (!isParentActive) {
//                                                 e.currentTarget.style.background = "rgba(255,255,255,0.08)";
//                                             }
//                                         }}
//                                         onMouseLeave={(e) => {
//                                             if (!isParentActive) {
//                                                 e.currentTarget.style.background = "transparent";
//                                             }
//                                         }}
//                                         onClick={() => handleHeaderClick(menu)} // Updated: Use new handler for conditional logic
//                                     >
//                                         <MenuHeader
//                                             id={menu.key}
//                                             label={menu.label}
//                                             icon={menu.icon}
//                                             isOpen={menu.open && hasChildren} // Enhanced: Only show open state if has children
//                                             style={{
//                                                 opacity: 1,
//                                                 transition: "opacity 0.3s ease",
//                                                 color: isParentActive ? "#4CAF50" : "inherit", // Enhanced: Green accent for active
//                                             }}
//                                         />
//                                     </div>

//                                     {/* CHILDREN LIST - Only render if has children */}
//                                     {hasChildren && (
//                                         <div
//                                             style={{
//                                                 maxHeight: menu.open ? "500px" : "0px",
//                                                 overflow: "hidden",
//                                                 transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease", // Enhanced: Bezier for bounce feel
//                                                 opacity: menu.open ? 1 : 0,
//                                                 background: "rgba(0,0,0,0.05)",
//                                             }}
//                                         >
//                                             <div
//                                                 style={{
//                                                     padding: menu.open ? "8px 24px" : "0",
//                                                     transition: "padding 0.3s ease",
//                                                 }}
//                                             >
//                                                 <MenuItemList
//                                                     className="submenu-items"
//                                                     items={menu.children}
//                                                     activeItem={activeItem}
//                                                     isOpen={menu.open}
//                                                 />
//                                             </div>
//                                         </div>
//                                     )}
//                                 </li>
//                             );
//                         })}
//                     </ul>
//                 </div>
//             </Scrollbars>
//         </div>
//     );
// }

// export default SidebarComponent;


import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Scrollbars from "react-custom-scrollbars-2";

import MenuHeader from "./component/MenuHeader";
import MenuItemList from "./component/MenuItemList";

function SidebarComponent({ roleMenu = [], activeItem: propActiveItem }) {
    const location = useLocation();
    const navigate = useNavigate();

    const activeItem = propActiveItem || location.pathname.split("/").pop() || "";

    const [menus, setMenus] = useState(
        roleMenu.map((menu) => ({ ...menu, open: false }))
    );

    useEffect(() => {
        setMenus((prev) =>
            prev.map((m) =>
                m.children?.some((child) => child.key === activeItem)
                    ? { ...m, open: true }
                    : m
            )
        );
    }, [activeItem]);

    const handleToggle = (menuKey) => {
        setMenus((prev) =>
            prev.map((m) =>
                m.key === menuKey ? { ...m, open: !m.open } : m
            )
        );
    };

    const handleHeaderClick = (menu) => {
        if (menu.children?.length > 0) {
            handleToggle(menu.key);
        } else if (menu.to) {
            navigate(menu.to);
        }
    };

    return (
        <div className="sidebar">
            <Scrollbars autoHide autoHeight autoHeightMax="100vh">
                <div className="sidebar-inner">
                    <ul className="menu-list">
                        {menus.map((menu) => {
                            const hasChildren = menu.children?.length > 0;

                            return (
                                <li key={menu.key} className="menu-item">
                                    {/* HEADER */}
                                    <div
                                        className="menu-header"
                                        style={{
                                            backgroundColor: "pink",
                                            textDecoration: "none",

                                        }}
                                        onClick={() => handleHeaderClick(menu)}
                                    >
                                        <MenuHeader
                                            id={menu.key}
                                            label={menu.label}
                                            icon={menu.icon}
                                            isOpen={menu.open && hasChildren}
                                        />
                                    </div>

                                    {/* CHILDREN */}
                                    {hasChildren && menu.open && (
                                        <div className="submenu-container">
                                            <MenuItemList
                                                items={menu.children}
                                                activeItem={activeItem}
                                                isOpen={menu.open}
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
