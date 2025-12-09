// import React, { useState } from "react";
// import {
//     Box,
//     Tabs,
//     Tab,
//     Paper,
//     Stack,
// } from "@mui/material";
// import {
//     FamilyRestroom,
//     History,
//     Description,
//     Healing,
//     LocalHospital,
// } from "@mui/icons-material";

// import PatientsCard from "../../../components/card/PatientsCard";
// import TableComponent from "../../../components/table/TableComponent";
// import DashboardCard from "../../../components/card/DashboardCard";

// function FamilyMembers() {
//     const [activeTab, setActiveTab] = useState("visits");

//     // Patient Data
//     const patient = {
//         name: "Sharavni",
//         gender: "Female",
//         age: 22,
//         lastVisit: "Nov 25, 2025",
//         condition: "2222",
//         active: true,
//         id: "P123",
//     };

//     // ================= DASHBOARD CARDS DATA =================
//     const stats = [
//         { title: "Family", count: 0, icon: FamilyRestroom, iconColor: "#4CAF50" },
//         { title: "Prescriptions", count: 3, icon: Description, iconColor: "#2196F3" },
//         { title: "Therapies", count: 3, icon: Healing, iconColor: "#9C27B0" },
//         { title: "Visits", count: 4, icon: LocalHospital, iconColor: "#FF9800" },
//         { title: "History", count: 0, icon: History, iconColor: "#00BCD4" },
//     ];

//     // ================= TABLE DATA =================
//     const visitsColumns = [
//         { field: "date", header: "Date" },
//         { field: "reason", header: "Reason" },
//         { field: "doctor", header: "Doctor" },
//     ];

//     const visitsRows = [
//         { _id: "1", date: "November 24, 2025", reason: "Completed", doctor: "Dr. Anjali D" },
//         { _id: "2", date: "November 25, 2025", reason: "Ongoing", doctor: "Dr. Anjali D" },
//     ];

//     const therapyColumns = [
//         { field: "therapy", header: "Therapy" },
//         { field: "days", header: "Days" },
//         { field: "timeline", header: "Timeline" },
//         { field: "startDate", header: "Start Date" },
//     ];

//     const therapyRows = [
//         { _id: "1", therapy: "Cardiology", days: 1, timeline: "Alternate Day", startDate: "-" },
//         { _id: "2", therapy: "Cardiology", days: 2, timeline: "Weekly", startDate: "-" },
//     ];

//     const prescriptionColumns = [
//         { field: "medication", header: "Medication" },
//         { field: "dosage", header: "Dosage" },
//         { field: "frequency", header: "Frequency" },
//     ];

//     const prescriptionRows = [
//         { _id: "1", medication: "Ashwagandha Tablet", dosage: "1-0-0", frequency: "Before Lunch" },
//         { _id: "2", medication: "Ashwagandha Tablet", dosage: "1-0-1", frequency: "Before Lunch" },
//     ];

//     return (
//         <Box >
//             {/* Patient Header Card */}
//             <PatientsCard
//                 breadcrumbItems={[
//                     { label: "Dashboard", url: "/doctor/dashboard" },
//                     { label: "My Patients", url: "/doctor/patients" },
//                     { label: "Patient Details" },
//                 ]}
//                 {...patient}
//             />

//             {/* 5 Dashboard Cards */}
//             <Box sx={{ px: { xs: 2, md: 6 }, mt: -5, mb: 6 }}>
//                 <Stack
//                     direction={{ xs: "column", sm: "row" }}
//                     spacing={3}
//                     justifyContent="center"
//                     flexWrap="wrap"
//                 >
//                     {stats.map((stat, index) => (
//                         <DashboardCard
//                             key={index}
//                             title={stat.title}
//                             count={stat.count}
//                             icon={stat.icon}
//                             iconColor={stat.iconColor}
//                         />
//                     ))}
//                 </Stack>
//             </Box>

//             {/* Tabs Section */}
//             <Paper
//                 elevation={3}
//                 sx={{
//                     mx: { xs: 2, md: 6 },
//                     borderRadius: 4,
//                     overflow: "hidden",
//                     bgcolor: "white",
//                 }}
//             >
//                 <Tabs
//                     value={activeTab}
//                     onChange={(_, v) => setActiveTab(v)}
//                     centered
//                     sx={{
//                         bgcolor: "#f8f9fa",
//                         "& .MuiTab-root": {
//                             textTransform: "none",
//                             fontWeight: 600,
//                             minHeight: 72,
//                             px: 4,
//                         },
//                         "& .Mui-selected": {
//                             color: "#1DB954",
//                         },
//                         "& .MuiTabs-indicator": {
//                             bgcolor: "#1DB954",
//                             height: 4,
//                         },
//                     }}
//                 >
//                     <Tab icon={<FamilyRestroom />} label="Family" value="family" />
//                     <Tab icon={<History />} label="History" value="history" />
//                     <Tab icon={<Description />} label="Prescription" value="prescription" />
//                     <Tab icon={<Healing />} label="Therapy" value="therapy" />
//                     <Tab icon={<LocalHospital />} label="Visits" value="visits" />
//                 </Tabs>

//                 <Box p={4}>
//                     {/* Visits Tab */}
//                     {activeTab === "visits" && (
//                         <TableComponent
//                             title="Visit History"
//                             columns={visitsColumns}
//                             rows={visitsRows}
//                             showAddButton={false}
//                             showExportButton={false}
//                             showView={false}
//                             showEdit={false}
//                             showDelete={false}
//                         />
//                     )}

//                     {/* Therapy Tab */}
//                     {activeTab === "therapy" && (
//                         <TableComponent
//                             title="Therapy Records"
//                             columns={therapyColumns}
//                             rows={therapyRows}
//                             showAddButton={false}
//                             showExportButton={false}
//                             showView={false}
//                             showEdit={false}
//                             showDelete={false}
//                         />
//                     )}

//                     {/* Prescription Tab */}
//                     {activeTab === "prescription" && (
//                         <TableComponent
//                             title="Prescription Records"
//                             columns={prescriptionColumns}
//                             rows={prescriptionRows}
//                             showAddButton={false}
//                             showExportButton={false}
//                             showView={false}
//                             showEdit={false}
//                             showDelete={false}
//                         />
//                     )}

//                     {/* Family & History - Empty State */}
//                     {(activeTab === "family" || activeTab === "history") && (
//                         <Box textAlign="center" py={12}>
//                             <Typography variant="h6" color="text.secondary">
//                                 No data available for this section
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary" mt={1}>
//                                 This information will be displayed when available.
//                             </Typography>
//                         </Box>
//                     )}
//                 </Box>
//             </Paper>
//         </Box>
//     );
// }

// export default FamilyMembers;

import React, { useState } from "react";
import {
    Box,
    Tabs,
    Tab,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import {
    FamilyRestroom,
    History,
    Description,
    Healing,
    LocalHospital,
} from "@mui/icons-material";

import PatientsCard from "../../../components/card/PatientsCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";

function FamilyMembers() {
    const [activeTab, setActiveTab] = useState("visits");

    // Patient Data
    const patient = {
        name: "Sharavni",
        gender: "Female",
        age: 22,
        lastVisit: "Nov 25, 2025",
        condition: "2222",
        active: true,
        id: "P123",
    };

    // ================= DASHBOARD CARDS DATA =================
    const stats = [
        { title: "Family", count: 0, icon: FamilyRestroom, iconColor: "#4CAF50" },
        { title: "Prescriptions", count: 3, icon: Description, iconColor: "#2196F3" },
        { title: "Therapies", count: 3, icon: Healing, iconColor: "#9C27B0" },
        { title: "Visits", count: 4, icon: LocalHospital, iconColor: "#FF9800" },
        // { title: "History", count: 0, icon: History, iconColor: "#00BCD4" },
    ];

    // ================= TABLE DATA =================
    const visitsColumns = [
        { field: "date", header: "Date" },
        { field: "reason", header: "Reason" },
        { field: "doctor", header: "Doctor" },
    ];

    const visitsRows = [
        { _id: "1", date: "November 24, 2025", reason: "Completed", doctor: "Dr. Anjali D" },
        { _id: "2", date: "November 25, 2025", reason: "Ongoing", doctor: "Dr. Anjali D" },
    ];

    const therapyColumns = [
        { field: "therapy", header: "Therapy" },
        { field: "days", header: "Days" },
        { field: "timeline", header: "Timeline" },
        { field: "startDate", header: "Start Date" },
    ];

    const therapyRows = [
        { _id: "1", therapy: "Cardiology", days: 1, timeline: "Alternate Day", startDate: "-" },
        { _id: "2", therapy: "Cardiology", days: 2, timeline: "Weekly", startDate: "-" },
    ];

    const prescriptionColumns = [
        { field: "medication", header: "Medication" },
        { field: "dosage", header: "Dosage" },
        { field: "frequency", header: "Frequency" },
    ];

    const prescriptionRows = [
        { _id: "1", medication: "Ashwagandha Tablet", dosage: "1-0-0", frequency: "Before Lunch" },
        { _id: "2", medication: "Ashwagandha Tablet", dosage: "1-0-1", frequency: "Before Lunch" },
    ];

    return (
        <Box>
            {/* Patient Header Card */}
            <PatientsCard
                breadcrumbItems={[
                    { label: "Dashboard", url: "/doctor/dashboard" },
                    { label: "My Patients", url: "/doctor/patients" },
                    { label: "Patient Details" },
                ]}
                {...patient}
            />

            {/* 5 Dashboard Cards */}
            <Box sx={{ mt: 5, mb: 6 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={3}
                    justifyContent="center"
                    flexWrap="wrap"
                >
                    {stats.map((stat, index) => (
                        <DashboardCard
                            key={index}
                            title={stat.title}
                            count={stat.count}
                            icon={stat.icon}
                            iconColor={stat.iconColor}
                        />
                    ))}
                </Stack>
            </Box>

            {/* Tabs Section */}
            <Paper
                elevation={3}
                sx={{
                    // mx: { xs: 2, md: 6 },
                    borderRadius: 4,
                    overflow: "hidden",
                    bgcolor: "white",
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    centered
                    sx={{
                        bgcolor: "#f8f9fa",
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            minHeight: 72,
                            px: 4,
                        },
                        "& .Mui-selected": {
                            color: "#1DB954",
                        },
                        "& .MuiTabs-indicator": {
                            bgcolor: "#1DB954",
                            height: 4,
                        },
                    }}
                >
                    <Tab icon={<FamilyRestroom />} label="Family" value="family" />
                    <Tab icon={<History />} label="History" value="history" />
                    <Tab icon={<Description />} label="Prescription" value="prescription" />
                    <Tab icon={<Healing />} label="Therapy" value="therapy" />
                    <Tab icon={<LocalHospital />} label="Visits" value="visits" />
                </Tabs>

                <Box p={4}>
                    {/* Visits Tab */}
                    {activeTab === "visits" && (
                        <TableComponent
                            title="Visit History"
                            columns={visitsColumns}
                            rows={visitsRows}
                            showAddButton={false}
                            showExportButton={false}
                            showView={false}
                            showEdit={false}
                            showDelete={false}
                        />
                    )}

                    {/* Therapy Tab */}
                    {activeTab === "therapy" && (
                        <TableComponent
                            title="Therapy Records"
                            columns={therapyColumns}
                            rows={therapyRows}
                            showAddButton={false}
                            showExportButton={false}
                            showView={false}
                            showEdit={false}
                            showDelete={false}
                        />
                    )}

                    {/* Prescription Tab */}
                    {activeTab === "prescription" && (
                        <TableComponent
                            title="Prescription Records"
                            columns={prescriptionColumns}
                            rows={prescriptionRows}
                            showAddButton={false}
                            showExportButton={false}
                            showView={false}
                            showEdit={false}
                            showDelete={false}
                        />
                    )}

                    {/* Family & History - Empty State */}
                    {(activeTab === "family" || activeTab === "history") && (
                        <Box textAlign="center" py={12}>
                            <Typography variant="h6" color="text.secondary">
                                No data available for this section
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                This information will be displayed when available.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

export default FamilyMembers;