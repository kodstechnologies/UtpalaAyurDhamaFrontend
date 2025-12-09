// // import React from "react";
// // import SidebarComponent from "./SidebarComponent";
// // import { sidebarMenus } from "./SidebarMenus";

// // function SidebarLoader() {
// //     const role = localStorage.getItem("role") || "admin";
// //     // const role = localStorage.getItem("role") || "doctor";
// //     // const role = localStorage.getItem("role") || "nurse";
// //     // const role = localStorage.getItem("role") || "receptionist";
// //     // const role = localStorage.getItem("role") || "pharmacist";
// //     // const role = localStorage.getItem("role") || "therapist";
// //     // const role = localStorage.getItem("role") || "patient";
// //     const menu = sidebarMenus[role] || [];

// //     return <SidebarComponent roleMenu={menu} activeItem="" />;
// // }

// // export default SidebarLoader;


// import React from "react";
// import SidebarComponent from "./SidebarComponent";
// import { sidebarMenus } from "./SidebarMenus";
// import { useSelector } from "react-redux";

// function SidebarLoader() {
//     const role = localStorage.getItem("role") || "admin";
//     console.log("🚀 ~ SidebarLoader ~ role:", role)
//     const menu = sidebarMenus[role?.toLowerCase()] || [];

//     // 🔥 FIX: get sidebarOpen from Redux and pass it down
//     const isOpen = useSelector((state) => state.ui.sidebarOpen);

//     return (
//         <SidebarComponent
//             roleMenu={menu}
//             activeItem=""
//             isOpen={isOpen}   // ✅ CRITICAL FIX
//         />
//     );
// }

// export default SidebarLoader;


import React from "react";
import SidebarComponent from "./SidebarComponent";
import { sidebarMenus } from "./SidebarMenus";
import { useSelector } from "react-redux";

function SidebarLoader({ isOpen = true, onClose, isMobile = false }) {
    const role = localStorage.getItem("role") || "admin";
    console.log("🚀 ~ SidebarLoader ~ role:", role)
    const menu = sidebarMenus[role?.toLowerCase()] || [];

    // 🔥 FIX: get sidebarOpen from Redux and pass it down
    const reduxIsOpen = useSelector((state) => state.ui.sidebarOpen);

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