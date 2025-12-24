
// import React, { useState, useEffect, useMemo } from "react";
// import { useLocation, useNavigate, Link } from "react-router-dom";
// import Scrollbars from "react-custom-scrollbars-2";
// import {
//     KeyboardArrowDown as ArrowDownIcon,
//     KeyboardArrowRight as ArrowRightIcon
// } from "@mui/icons-material";

// const MenuItemList = ({ className = "", items = [], activeItem, onNavigate }) => {
//     return (
//         <ul
//             className={`submenu-list ${className}`}
//             style={{
//                 listStyle: "none",
//                 padding: "4px 0 4px 0", // Minimal vertical padding; horizontal indent via CSS
//                 margin: 0,
//             }}
//         >
//             {items.map((item) => {
//                 const isActive = activeItem === item.key;

//                 return (
//                     <li
//                         key={item.key}
//                         className={`submenu-item ${isActive ? "active" : ""}`}
//                         style={{
//                             listStyle: "none",
//                             marginBottom: "2px", // Tight spacing between items
//                         }}
//                     >
//                         <Link
//                             to={item.to || "#"} // Fallback if no to
//                             className="submenu-link"
//                             onClick={() => {
//                                 if (onNavigate && item.to) {
//                                     onNavigate();
//                                 }
//                             }}
//                             style={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: "12px",
//                                 padding: "10px 16px 10px 32px", // Indented padding as per demo
//                                 margin: "0 8px",
//                                 borderRadius: "8px",
//                                 color: "var(--color-text-side-bar)",
//                                 textDecoration: "none",
//                                 fontSize: "13px",
//                                 transition: "all 0.2s ease",
//                                 position: "relative",
//                                 cursor: "pointer",
//                                 backgroundColor: isActive
//                                     ? "var(--color-bg-side-bar-active)"
//                                     : "transparent",
//                             }}
//                             onMouseEnter={(e) => {
//                                 if (!isActive) {
//                                     e.currentTarget.style.backgroundColor = "var(--color-bg-side-bar-hover)";
//                                     e.currentTarget.style.color = "var(--color-text-side-bar-active)"; // Optional: darken on hover
//                                     e.currentTarget.style.paddingLeft = "36px"; // Subtle indent on hover
//                                 }
//                             }}
//                             onMouseLeave={(e) => {
//                                 e.currentTarget.style.backgroundColor = isActive
//                                     ? "var(--color-bg-side-bar-active)"
//                                     : "transparent";
//                                 e.currentTarget.style.color = "var(--color-text-side-bar)";
//                                 e.currentTarget.style.paddingLeft = "32px";
//                             }}
//                         >
//                             {/* Vertical line pseudo-element via CSS */}
//                             <span
//                                 className="submenu-dot"
//                                 style={{
//                                     width: "6px",
//                                     height: "6px",
//                                     borderRadius: "50%",
//                                     backgroundColor: "currentColor",
//                                     opacity: isActive ? 1 : 0.4,
//                                     flexShrink: 0,
//                                     transition: "all 0.2s ease",
//                                     transform: isActive ? "scale(1.3)" : "scale(1)",
//                                 }}
//                             />
//                             <span
//                                 className="submenu-text"
//                                 style={{
//                                     flex: 1,
//                                     whiteSpace: "nowrap",
//                                     overflow: "hidden",
//                                     textOverflow: "ellipsis",
//                                     fontWeight: isActive ? 600 : "normal",
//                                 }}
//                             >
//                                 {item.label}
//                             </span>
//                         </Link>
//                     </li>
//                 );
//             })}
//         </ul>
//     );
// };

// function MenuHeader({
//     id,
//     label,
//     icon,
//     onClick,
//     isOpen,
//     isCollapsed,
//     isActive = false,
//     hasChildren = false      // <-- NEW: tell header if children exist
// }) {
//     const showLabel = !isCollapsed;
//     const showArrow = !isCollapsed && hasChildren; // <-- FIX: show only if children exist

//     return (
//         <div
//             id={id}
//             onClick={onClick}
//             style={{
//                 color: "var(--color-text-side-bar)",
//                 display: "flex",
//                 alignItems: "center",
//                 width: "100%",
//                 textDecoration: "none",
//                 borderRadius: "inherit",
//                 padding: "inherit",
//                 transition: "background-color 0.2s ease",
//                 backgroundColor: isActive
//                     ? "var(--color-bg-side-bar-active)"
//                     : "transparent",
//                 cursor: "pointer"
//             }}
//             onMouseEnter={(e) => {
//                 e.currentTarget.style.backgroundColor =
//                     "var(--color-bg-side-bar-hover)";
//             }}
//             onMouseLeave={(e) => {
//                 e.currentTarget.style.backgroundColor = isActive
//                     ? "var(--color-bg-side-bar-active)"
//                     : "transparent";
//             }}
//         >
//             {/* ICON */}
//             <span
//                 className="header-icon"
//                 style={{
//                     backgroundColor: "var(--color-text-side-bar)",
//                     padding: "2px",
//                     marginRight: showLabel ? "10px" : "0",
//                     borderRadius: "4px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     minWidth: "24px",
//                     height: "24px",
//                     flexShrink: 0,
//                 }}
//             >
//                 {icon}
//             </span>

//             {/* LABEL */}
//             {showLabel && (
//                 <span className="header-label" style={{ flex: 1 }}>
//                     {label}
//                 </span>
//             )}

//             {/* ARROW → only if has children */}
//             {showArrow && (
//                 <span
//                     className="header-arrow"
//                     style={{
//                         marginLeft: "auto",
//                         opacity: 0.7,
//                         transition: "transform 0.2s ease",
//                         transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
//                     }}
//                 >
//                     {isOpen ? <ArrowDownIcon /> : <ArrowRightIcon />}
//                 </span>
//             )}
//         </div>
//     );
// }

// function SidebarComponent({ roleMenu = [], activeItem: propActiveItem, isOpen = true, isMobile = false, onClose }) {
//     // console.log("🚀 ~ SidebarComponent ~ isOpen:", isOpen)
//     // console.log("🚀 ~ SidebarComponent ~ isMobile:", isMobile)
//     const location = useLocation();
//     const navigate = useNavigate();
//     const activeItem = propActiveItem || location.pathname.split("/").pop() || "";
//     const [isMobileData, setIsMobileData] = useState(window.innerWidth <= 900);

//     useEffect(() => {
//         const handleResize = () => {
//             setIsMobileData(window.innerWidth <= 900);
//         };

//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);
//     console.log("🚀 ~ SidebarComponent ~ isMobileData:", isMobileData)


//     // Hover state for peek expansion (disabled on mobile)
//     const [isHovered, setIsHovered] = useState(false);

//     // Memoize initial menus to avoid unnecessary re-renders
//     const initialMenus = useMemo(
//         () => roleMenu.map((menu) => ({ ...menu, open: false })),
//         [roleMenu]
//     );

//     const [menus, setMenus] = useState(initialMenus);

//     // On mobile, always show expanded when open
//     const isCollapsed = isMobile ? false : !isOpen;
//     const effectiveIsCollapsed = isMobile ? false : (isCollapsed && !isHovered);
//     // console.log("🚀 ~ SidebarComponent ~ effectiveIsCollapsed:", effectiveIsCollapsed)


//     // Reset all submenus when actually collapsing (via toggle)
//     useEffect(() => {
//         if (isCollapsed) {
//             setMenus((prev) => prev.map((m) => ({ ...m, open: false })));
//         }
//     }, [isCollapsed]); // Dependency only on isCollapsed to avoid loops

//     // Auto-open active parent when expanded (full or peek) - accordion style: only active open
//     useEffect(() => {
//         if (!effectiveIsCollapsed) {
//             setMenus((prev) =>
//                 prev.map((m) =>
//                     m.children?.some((child) => child.key === activeItem)
//                         ? { ...m, open: true }
//                         : { ...m, open: false }
//                 )
//             );
//         }
//     }, [activeItem, effectiveIsCollapsed]); // Safe dependencies

//     // Auto-open active parent specifically during peek (when collapsed but hovered) - accordion
//     useEffect(() => {
//         if (isHovered && isCollapsed && activeItem) {
//             setMenus((prev) =>
//                 prev.map((m) =>
//                     m.children?.some((child) => child.key === activeItem)
//                         ? { ...m, open: true }
//                         : { ...m, open: false }
//                 )
//             );
//         }
//     }, [isHovered, activeItem, isCollapsed]);

//     // Reset menus if roleMenu prop changes (e.g., role switch)
//     useEffect(() => {
//         setMenus(initialMenus);
//     }, [initialMenus]);

//     const handleToggle = (menuKey) => {
//         if (effectiveIsCollapsed) return; // No toggle when effectively collapsed
//         setMenus((prev) =>
//             prev.map((m) =>
//                 m.key === menuKey ? { ...m, open: !m.open } : { ...m, open: false }
//             )
//         );
//     };

//     // const handleHeaderClick = (menu) => {
//     //     if (effectiveIsCollapsed) return; // No action when effectively collapsed
//     //     if (menu.children?.length > 0) {
//     //         handleToggle(menu.key);
//     //     } else if (menu.to) {
//     //         navigate(menu.to);
//     //         // Close sidebar on mobile after navigation
//     //         if (isMobile && onClose) {
//     //             onClose();
//     //         }
//     //     }
//     // };

//     const handleHeaderClick = (menu) => {
//         if (effectiveIsCollapsed) return;

//         // If menu has children → toggle (accordion: close others)
//         if (menu.children?.length > 0) {
//             setMenus((prev) =>
//                 prev.map((m) =>
//                     m.key === menu.key
//                         ? { ...m, open: !m.open }
//                         : { ...m, open: false }
//                 )
//             );
//             return;
//         }

//         // If no children → navigate only, close on mobile for top-level leaves
//         if (menu.to) {
//             navigate(menu.to);
//             if (isMobile && onClose) {
//                 onClose();
//             }
//         }
//     };



//     // Sidebar width with smoother transition (longer duration and refined easing)
//     const sidebarWidth = effectiveIsCollapsed ? 60 : 250;
//     const transitionDuration = '0.3s'; // Symmetric duration for smoother feel
//     // console.log("🚀 ~ SidebarComponent ~ transitionDuration:", transitionDuration)
//     const transitionEasing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // Ease-out for expansion, ease-in-out for collapse
//     const marginLeft = isOpen ? "0" : "-300px"
//     // console.log("🚀 ~ SidebarComponent ~ marginLeft:", marginLeft)
//     // const isMobile = 
//     return (


//         <div
//             className="sidebar h-full shadow-mdv ml-[7rem] "
//             style={{
//                 width: sidebarWidth,
//                 minWidth: sidebarWidth,
//                 // transition: `width ${transitionDuration} ${transitionEasing}`, // Smoother easing and adjustable duration
//                 transition: `
//       width ${transitionDuration} ${transitionEasing},
//       margin-left ${transitionDuration} ${transitionEasing},
//       background-color ${transitionDuration} ${transitionEasing}
//     `,
//                 overflow: "hidden",
//                 marginLeft: isMobileData ? marginLeft : "0px",

//                 backgroundColor: "var(--color-bg-side-bar)",
//                 // color: "var(--color-text-side-bar)",

//             }}
//             onMouseEnter={() => !isMobile && setIsHovered(true)}
//             onMouseLeave={() => !isMobile && setIsHovered(false)}
//             // onClick={(e) => {
//             //     // Prevent backdrop click from closing sidebar when clicking inside
//             //     e.stopPropagation();
//             // }}
//             onClick={(e) => {
//                 e.stopPropagation(); // Prevent backdrop click from closing sidebar when clicking inside
//             }}

//         >
//             <Scrollbars
//                 autoHide
//                 autoHeight
//                 autoHeightMax="100vh"
//                 renderThumbVertical={(props) => (
//                     <div
//                         {...props}
//                         style={{
//                             ...props.style,
//                             backgroundColor: "var(--color-text-side-bar)",
//                             opacity: 0.5,
//                             borderRadius: "6px",
//                             width: "4px",
//                             right: "2px",
//                             minHeight: "50px",
//                             transition: "opacity 0.2s ease",
//                         }}
//                     />
//                 )}
//                 style={{
//                     width: sidebarWidth,
//                     transition: `width ${transitionDuration} ${transitionEasing}`, // Sync scroll transition
//                 }}
//             >
//                 <div className="sidebar-inner">
//                     <ul
//                         className="menu-list"
//                         style={{
//                             listStyle: "none",
//                             padding: 0,
//                             margin: 0,
//                             height: "86vh",
//                             overflowY: "auto",
//                             overflowX: "hidden",
//                             paddingTop: "1rem",
//                             transition: `padding ${transitionDuration} ${transitionEasing}`, // Smooth padding changes if needed
//                             // border: " 2px solid",
//                         }}
//                     >


//                         {menus.map((menu) => {
//                             const hasChildren = menu.children?.length > 0;
//                             const isActive = menu.key === activeItem ||
//                                 menu.children?.some(child => child.key === activeItem);
//                             return (
//                                 <li key={menu.key} className="menu-item" style={{ listStyle: "none", marginBottom: "4px" }}>
//                                     {/* HEADER */}
//                                     <div
//                                         className={`menu-header transition-all duration-200 ease-in-out ${isActive ? 'active' : ''} ${hasChildren ? 'has-children' : ''}`}
//                                         onClick={() => handleHeaderClick(menu)}
//                                         style={{
//                                             padding: effectiveIsCollapsed ? "8px" : "12px 16px",
//                                             margin: "0 8px",
//                                             borderRadius: "10px",
//                                             cursor: hasChildren && !effectiveIsCollapsed ? "pointer" : "default",
//                                             transition: `all 0.25s ${transitionEasing}`, // Sync header transition
//                                             position: "relative",
//                                             minHeight: "40px",
//                                             display: "flex",
//                                             alignItems: "center",


//                                         }}
//                                     >
//                                         {/* <MenuHeader
//                                             id={menu.key}
//                                             label={menu.label}
//                                             icon={menu.icon}
//                                             isOpen={menu.open}
//                                             isCollapsed={effectiveIsCollapsed}
//                                             style={{ textDecoration: "none" }}
//                                         /> */}
//                                         <MenuHeader
//                                             id={menu.key}
//                                             label={menu.label}
//                                             icon={menu.icon}
//                                             isOpen={menu.open}
//                                             isCollapsed={effectiveIsCollapsed}
//                                             isActive={isActive}
//                                             hasChildren={hasChildren}   // <-- IMPORTANT
//                                         />

//                                     </div>
//                                     {/* CHILDREN - Enhanced smooth open/close with longer duration */}
//                                     {!effectiveIsCollapsed && hasChildren && (
//                                         <div
//                                             className={`submenu-wrapper ${menu.open ? 'open' : ''}`}
//                                             style={{
//                                                 maxHeight: menu.open ? "500px" : "0",
//                                                 overflow: "hidden",
//                                                 transition: `max-height 0.3s ${transitionEasing}, opacity 0.3s ${transitionEasing}`, // Smoother submenu transition
//                                                 opacity: menu.open ? 1 : 0,
//                                                 paddingLeft: "16px",
//                                             }}
//                                         >
//                                             <MenuItemList
//                                                 items={menu.children}
//                                                 activeItem={activeItem}
//                                                 isOpen={menu.open}
//                                                 className="text-decoration-none"
//                                                 onNavigate={undefined} // Don't close sidebar on child navigation (mobile or desktop)
//                                             />
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

import React from 'react'

function SidebarComponent() {
    return (
        <div>SidebarComponent</div>
    )
}

export default SidebarComponent