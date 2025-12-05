

// import { Link } from "react-router-dom";

// const MenuItemList = ({ className, items, activeClassName, style = {} }) => {
//     return (
//         <ul className={className} style={style}>
//             {items.map((item) => {
//                 const isActive = activeClassName === item.key;
//                 const baseLinkStyle = {
//                     display: "block",
//                     padding: "12px 20px 12px 35px",
//                     color: isActive ? "var(--color-primary)" : "var(--color-text-side-bar)",
//                     textDecoration: "none",
//                     fontSize: "14px",
//                     fontWeight: 500,
//                     borderLeft: isActive ? "3px solid var(--color-primary)" : "3px solid transparent",
//                     backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
//                     transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//                     transform: isActive ? "translateX(5px)" : "translateX(0)",
//                     position: "relative",
//                     overflow: "hidden",
//                 };

//                 const dotStyle = {
//                     position: "absolute",
//                     left: "18px",
//                     top: "50%",
//                     transform: "translateY(-50%)",
//                     width: "6px",
//                     height: "6px",
//                     backgroundColor: isActive ? "var(--color-primary)" : "var(--color-text-side-bar)",
//                     borderRadius: "50%",
//                     transition: "all 0.3s ease",
//                     opacity: isActive ? 1 : 0.5,
//                 };

//                 const underlineStyle = {
//                     position: "absolute",
//                     bottom: "0",
//                     left: "0",
//                     width: "100%",
//                     height: "2px",
//                     backgroundColor: "var(--color-primary)",
//                     transform: isActive ? "scaleX(1)" : "scaleX(0)",
//                     transition: "transform 0.3s ease",
//                 };

//                 return (
//                     <li
//                         key={item.key}
//                         className={`${activeClassName === item.key ? "active" : ""}`}
//                         style={{
//                             listStyle: "none",
//                             margin: "0",
//                             padding: "0",
//                             overflow: "hidden",
//                         }}
//                     >
//                         <Link
//                             to={item.to}
//                             style={baseLinkStyle}
//                             className="menu-item-link"
//                             onMouseEnter={(e) => {
//                                 e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
//                                 e.currentTarget.style.borderLeftColor = "var(--color-primary)";
//                                 e.currentTarget.style.transform = "translateX(5px)";
//                                 e.currentTarget.style.color = "var(--color-primary)";
//                                 e.currentTarget.querySelector(".menu-dot").style.backgroundColor = "var(--color-primary)";
//                                 e.currentTarget.querySelector(".menu-dot").style.opacity = "1";
//                                 e.currentTarget.querySelector(".menu-underline").style.transform = "scaleX(1)";
//                             }}
//                             onMouseLeave={(e) => {
//                                 if (!isActive) {
//                                     e.currentTarget.style.backgroundColor = "transparent";
//                                     e.currentTarget.style.borderLeftColor = "transparent";
//                                     e.currentTarget.style.transform = "translateX(0)";
//                                     e.currentTarget.style.color = "var(--color-text-side-bar)";
//                                     e.currentTarget.querySelector(".menu-dot").style.backgroundColor = "var(--color-text-side-bar)";
//                                     e.currentTarget.querySelector(".menu-dot").style.opacity = "0.5";
//                                     e.currentTarget.querySelector(".menu-underline").style.transform = "scaleX(0)";
//                                 }
//                             }}
//                         >
//                             <div className="menu-dot" style={dotStyle} />
//                             <span
//                                 style={{
//                                     display: "inline-block",
//                                     transition: "all 0.3s ease",
//                                     transform: "scale(1)",
//                                 }}
//                                 className="link-label"
//                             >
//                                 {item.label}
//                             </span>
//                             <div className="menu-underline" style={underlineStyle} />
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
        <ul className={className}>
            {items.map((item) => {
                const isActive = activeItem === item.key;

                return (
                    <li
                        key={item.key}
                        className={`menu-item ${isActive ? "active" : ""}`}
                    >
                        <Link to={item.to} className="menu-link">
                            <span className="menu-label">{item.label}</span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};

export default MenuItemList;
