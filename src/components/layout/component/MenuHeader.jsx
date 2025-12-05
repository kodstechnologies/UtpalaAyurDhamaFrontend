// import React from "react";
// import { Link } from "react-router-dom";
// import { KeyboardArrowDown as ArrowDownIcon } from "@mui/icons-material";

// function MenuHeader({ id, label, icon, onClick, isOpen }) {
//     const handleMouseEnter = (e) => {
//         e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
//         e.currentTarget.style.color = "var(--color-primary)";
//         e.currentTarget.querySelector(".header-icon")?.style.setProperty("color", "var(--color-primary)", "important");
//         e.currentTarget.querySelector(".header-label")?.style.setProperty("color", "var(--color-primary)", "important");
//         e.currentTarget.querySelector(".header-arrow")?.style.setProperty("color", "var(--color-primary)", "important");
//     };

//     const handleMouseLeave = (e) => {
//         if (!isOpen) {
//             e.currentTarget.style.backgroundColor = "transparent";
//             e.currentTarget.style.color = "var(--color-text-side-bar)";
//             e.currentTarget.querySelector(".header-icon")?.style.setProperty("color", "var(--color-text-side-bar)", "important");
//             e.currentTarget.querySelector(".header-label")?.style.setProperty("color", "var(--color-text-side-bar)", "important");
//             e.currentTarget.querySelector(".header-arrow")?.style.setProperty("color", "var(--color-text-side-bar)", "important");
//         }
//     };

//     return (
//         <Link
//             to="#"
//             id={id}
//             onClick={(e) => {
//                 e.preventDefault();
//                 onClick?.(e);
//             }}
//             className={isOpen ? "subdrop" : ""}
//             onMouseEnter={handleMouseEnter}
//             onMouseLeave={handleMouseLeave}
//             style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//                 padding: "12px 18px",
//                 color: isOpen ? "var(--color-primary)" : "var(--color-text-side-bar)",
//                 fontWeight: 600,
//                 textDecoration: "none",
//                 borderLeft: isOpen ? "3px solid var(--color-primary)" : "3px solid transparent",
//                 backgroundColor: isOpen ? "rgba(255, 255, 255, 0.05)" : "transparent",
//                 transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//                 position: "relative",
//                 overflow: "hidden",
//             }}
//         >
//             <span className="header-icon" style={{ transition: "color 0.3s ease" }}>
//                 {React.cloneElement(icon, { style: { ...icon.props.style, transition: "color 0.3s ease" } })}
//             </span>
//             <span className="header-label" style={{ transition: "color 0.3s ease" }}>
//                 {label}
//             </span>
//             <ArrowDownIcon
//                 className="header-arrow"
//                 style={{
//                     marginLeft: "auto",
//                     color: isOpen ? "var(--color-primary)" : "var(--color-text-side-bar)",
//                     transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//                     transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
//                 }}
//             />
//             {/* Subtle underline glow for open state */}
//             {isOpen && (
//                 <div
//                     style={{
//                         position: "absolute",
//                         bottom: "0",
//                         left: "0",
//                         width: "100%",
//                         height: "2px",
//                         backgroundColor: "var(--color-primary)",
//                         boxShadow: "0 2px 8px rgba(var(--color-primary-rgb), 0.2)",
//                         transform: "scaleX(1)",
//                         transition: "all 0.3s ease",
//                     }}
//                 />
//             )}
//         </Link>
//     );
// }

// export default MenuHeader;

import React from "react";
import { Link } from "react-router-dom";
import {
    KeyboardArrowDown as ArrowDownIcon,
    KeyboardArrowRight as ArrowRightIcon
} from "@mui/icons-material";

function MenuHeader({ id, label, icon, onClick, isOpen }) {
    return (
        <Link
            to="#"
            id={id}
            onClick={(e) => {
                e.preventDefault();
                onClick?.(e);
            }}
        >
            <span className="header-icon">
                {icon}
            </span>

            <span className="header-label">
                {label}
            </span>

            {/* Toggle arrow icon */}
            {isOpen ? (
                <ArrowDownIcon className="header-arrow" />
            ) : (
                <ArrowRightIcon className="header-arrow" />
            )}
        </Link>
    );
}

export default MenuHeader;
