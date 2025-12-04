// import React from "react";
// import { Box } from "@mui/material";
// import HeadingCardingCard from "../../components/card/HeadingCard";
// import DashboardCard from "../../components/card/DashboardCard";
// import { LocalHospital } from "@mui/icons-material";

// function Nurse_Dashboard() {
//     return (
//         <Box sx={{ padding: "20px" }}>

//             {/* HEADING CARD */}
//             <HeadingCardingCard
//                 category="NURSE PANEL"
//                 title="Welcome, Nurse"
//                 subtitle="Here is a summary of your current workload. Review admissions, monitor patients, and prepare discharges with confidence."
//             />

//             {/* ONE CARD BELOW */}
//             <Box
//                 sx={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
//                     gap: "20px",
//                     mt: 3,
//                 }}
//             >
//                 <DashboardCard
//                     title="Admitted Patients"
//                     count={1}
//                     icon={LocalHospital}
//                     iconColor="#0ca678"
//                 />
//             </Box>

//         </Box>
//     );
// }

// export default Nurse_Dashboard;

import React from "react";
import { Box } from "@mui/material";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../components/card/HeadingCard";
import DashboardCard from "../../components/card/DashboardCard";
import { LocalHospital } from "@mui/icons-material";

function Nurse_Dashboard() {
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Dashboard" },
    ];

    return (
        <Box sx={{ padding: "20px" }}>

            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Heading Card */}
            <HeadingCardingCard
                category="NURSE PANEL"
                title="Welcome, Nurse"
                subtitle="Here is a summary of your current workload. Review admissions, monitor patients, and prepare discharges with confidence."
            />

            {/* ⭐ Dashboard Cards */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "20px",
                    mt: 3,
                }}
            >
                <DashboardCard
                    title="Admitted Patients"
                    count={1}
                    icon={LocalHospital}
                    iconColor="#0ca678"
                />
            </Box>

        </Box>
    );
}

export default Nurse_Dashboard;
