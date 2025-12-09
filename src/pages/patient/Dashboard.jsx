// import React from "react";
// import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
// import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
// import DescriptionIcon from "@mui/icons-material/Description";
// import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

// import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
// import GreetingBanner from "../../components/card/GreetingCard";
// import DashboardCard from "../../components/card/DashboardCard";

// import GreetingsImg from "../../assets/greeting/patient.png";
// import PatientDashboardCard from "../../components/card/patientCard/Patient_DashboardCard";

// import PeopleIcon from "@mui/icons-material/People";
// import MedicationIcon from "@mui/icons-material/Medication";


// function Patient_Dashboard() {
//     return (
//         <div style={{ paddingBottom: 30 }}>

//             {/* Breadcrumb */}
//             <Breadcrumb
//                 items={[
//                     { label: "Patient", url: "/patient/dashboard" },
//                     { label: "Dashboard" }
//                 ]}
//             />

//             {/* Greeting Section */}
//             <GreetingBanner
//                 title="Good Morning"
//                 name="User"
//                 subtitle="Here’s a quick overview of your health updates and upcoming activities."
//                 image={GreetingsImg}
//             />

//             {/* OLD DASHBOARD CARDS (3 small ones) */}
//             <div
//                 style={{
//                     display: "flex",
//                     gap: 25,
//                     marginTop: 30,
//                     flexWrap: "wrap",
//                 }}
//             >
//                 <DashboardCard
//                     title="Upcoming Appointment"
//                     description="No follow-ups scheduled. Your next appointment will appear here."
//                     icon={LocalHospitalIcon}
//                 />

//                 <DashboardCard
//                     title="Family Profiles"
//                     count={2}
//                     icon={PeopleIcon}
//                 />

//                 <DashboardCard
//                     title="Prescriptions"
//                     description="All caught up. No new prescriptions available."
//                     icon={MedicationIcon}
//                 />
//             </div>

//             {/* NEW SECTION — PATIENT DASHBOARD CARDS */}
//             <div
//                 style={{
//                     marginTop: 35,
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
//                     gap: 25,
//                 }}
//             >
//                 {/* 1️⃣ Ongoing Therapy */}
//                 <PatientDashboardCard
//                     title="Ongoing Therapy"
//                     icon={FavoriteBorderIcon}
//                     mainText="Cardiology"
//                     subText="Day 1 of 1 · Scheduled"
//                     showButton={true}
//                 />

//                 {/* 2️⃣ Upcoming Reminders */}
//                 <PatientDashboardCard
//                     title="Upcoming Reminders (Dec 9, 2025 - Dec 12, 2025)"
//                     subText="No appointments or therapies scheduled in the next three days."
//                 />

//                 {/* 3️⃣ Recent Reports */}
//                 <PatientDashboardCard
//                     title="Recent Reports"
//                     icon={DescriptionIcon}
//                     mainText="Clinical Report"
//                     subText="Uploaded on Nov 25, 2025"
//                     showButton={true}
//                 />

//                 {/* 4️⃣ Recent Invoice */}
//                 <PatientDashboardCard
//                     title="Recent Invoice"
//                     icon={ReceiptLongIcon}
//                     mainText="Invoice #INVOICE-20251125-0002"
//                     subText="Created on Nov 25, 2025 · Amount: ₹126.00"
//                     showButton={true}
//                 />

//             </div>
//         </div>
//     );
// }

// export default Patient_Dashboard;


import React from "react";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import GreetingBanner from "../../components/card/GreetingCard";
import DashboardCard from "../../components/card/DashboardCard";

import GreetingsImg from "../../assets/greeting/patient.png";
import PatientDashboardCard from "../../components/card/patientCard/Patient_DashboardCard";

import PeopleIcon from "@mui/icons-material/People";
import MedicationIcon from "@mui/icons-material/Medication";

function Patient_Dashboard() {
    return (
        <div style={{ paddingBottom: 30 }}>

            {/* Greeting Section with Breadcrumb inside */}
            <GreetingBanner
                title="Good Morning"
                name="User"
                subtitle="Here’s a quick overview of your health updates and upcoming activities."
                image={GreetingsImg}
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Dashboard" }
                ]}
            />

            {/* OLD DASHBOARD CARDS */}
            <div
                style={{
                    display: "flex",
                    gap: 25,
                    marginTop: 30,
                    flexWrap: "wrap",
                }}
            >
                <DashboardCard
                    title="Upcoming Appointment"
                    description="No follow-ups scheduled. Your next appointment will appear here."
                    icon={LocalHospitalIcon}
                />

                <DashboardCard
                    title="Family Profiles"
                    count={2}
                    icon={PeopleIcon}
                />

                <DashboardCard
                    title="Prescriptions"
                    description="All caught up. No new prescriptions available."
                    icon={MedicationIcon}
                />
            </div>

            {/* NEW PATIENT DASHBOARD CARDS */}
            <div
                style={{
                    marginTop: 35,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                    gap: 25,
                }}
            >
                <PatientDashboardCard
                    title="Ongoing Therapy"
                    icon={FavoriteBorderIcon}
                    mainText="Cardiology"
                    subText="Day 1 of 1 · Scheduled"
                    showButton={true}
                />

                <PatientDashboardCard
                    title="Upcoming Reminders (Dec 9, 2025 - Dec 12, 2025)"
                    subText="No appointments or therapies scheduled in the next three days."
                />

                <PatientDashboardCard
                    title="Recent Reports"
                    icon={DescriptionIcon}
                    mainText="Clinical Report"
                    subText="Uploaded on Nov 25, 2025"
                    showButton={true}
                />

                <PatientDashboardCard
                    title="Recent Invoice"
                    icon={ReceiptLongIcon}
                    mainText="Invoice #INVOICE-20251125-0002"
                    subText="Created on Nov 25, 2025 · Amount: ₹126.00"
                    showButton={true}
                />
            </div>

        </div>
    );
}

export default Patient_Dashboard;
