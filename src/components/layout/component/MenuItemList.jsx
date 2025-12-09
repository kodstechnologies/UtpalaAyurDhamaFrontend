

// import { Link } from "react-router-dom";

// const MenuItemList = ({ className = "", items = [], activeItem }) => {
//     return (
//         <ul
//             className={className}
//             style={{
//                 listStyle: "none",   // 🔥 Removes the dot
//                 padding: 0,          // 🔥 Removes left extra spacing
//                 margin: 0,           // Optional cleanup
//             }}
//         >
//             {items.map((item) => {
//                 const isActive = activeItem === item.key;

//                 return (
//                     <li
//                         key={item.key}
//                         className={`menu-item ${isActive ? "active" : ""}`}
//                         style={{
//                             padding: "6px 20px",
//                             cursor: "pointer",
//                             transition: "background-color 0.2s ease",
//                         }}
//                         onMouseEnter={(e) => {
//                             e.currentTarget.style.backgroundColor = "var(--color-bg-side-bar-hover)";
//                         }}
//                         onMouseLeave={(e) => {
//                             e.currentTarget.style.backgroundColor = isActive
//                                 ? "var(--color-bg-side-bar-active)"
//                                 : "transparent";
//                         }}
//                     >

//                         <Link
//                             to={item.to}
//                             className="menu-link"
//                             style={{
//                                 textDecoration: "none",
//                             }}
//                         >
//                             <span
//                                 className="menu-label"
//                                 style={{
//                                     color: "var(--color-text-side-bar)",
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

// export default MenuItemList;


import { Link } from "react-router-dom";

const MenuItemList = ({ className = "", items = [], activeItem }) => {
    return (
        <ul
            className={`submenu-list ${className}`}
            style={{
                listStyle: "none",
                padding: "4px 0 4px 0", // Minimal vertical padding; horizontal indent via CSS
                margin: 0,
            }}
        >
            {items.map((item) => {
                const isActive = activeItem === item.key;

                return (
                    <li
                        key={item.key}
                        className={`submenu-item ${isActive ? "active" : ""}`}
                        style={{
                            listStyle: "none",
                            marginBottom: "2px", // Tight spacing between items
                        }}
                    >
                        <Link
                            to={item.to || "#"} // Fallback if no to
                            className="submenu-link"
                            onClick={() => {
                                if (onNavigate && item.to) {
                                    onNavigate();
                                }
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 16px 10px 32px", // Indented padding as per demo
                                margin: "0 8px",
                                borderRadius: "8px",
                                color: "var(--color-text-side-bar)",
                                textDecoration: "none",
                                fontSize: "13px",
                                transition: "all 0.2s ease",
                                position: "relative",
                                cursor: "pointer",
                                backgroundColor: isActive
                                    ? "var(--color-bg-side-bar-active)"
                                    : "transparent",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = "var(--color-bg-side-bar-hover)";
                                    e.currentTarget.style.color = "var(--color-text-side-bar-active)"; // Optional: darken on hover
                                    e.currentTarget.style.paddingLeft = "36px"; // Subtle indent on hover
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isActive
                                    ? "var(--color-bg-side-bar-active)"
                                    : "transparent";
                                e.currentTarget.style.color = "var(--color-text-side-bar)";
                                e.currentTarget.style.paddingLeft = "32px";
                            }}
                        >
                            {/* Vertical line pseudo-element via CSS */}
                            <span
                                className="submenu-dot"
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "currentColor",
                                    opacity: isActive ? 1 : 0.4,
                                    flexShrink: 0,
                                    transition: "all 0.2s ease",
                                    transform: isActive ? "scale(1.3)" : "scale(1)",
                                }}
                            />
                            <span
                                className="submenu-text"
                                style={{
                                    flex: 1,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    fontWeight: isActive ? 600 : "normal",
                                }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};

export default MenuItemList;