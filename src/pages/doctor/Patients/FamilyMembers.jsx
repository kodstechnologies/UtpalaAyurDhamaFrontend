import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import FamilyMemberCard from "../../../components/card/patientCard/FamilyMammberCard";
import VisibilityIcon from "@mui/icons-material/Visibility";

function FamilyMembers() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("family");

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
        { title: "Family", count: 1, icon: FamilyRestroom, iconColor: "#4CAF50" },
        { title: "Prescriptions", count: 3, icon: Description, iconColor: "#2196F3" },
        { title: "Therapies", count: 3, icon: Healing, iconColor: "#9C27B0" },
        { title: "Visits", count: 4, icon: LocalHospital, iconColor: "#FF9800" },
        // { title: "History", count: 0, icon: History, iconColor: "#00BCD4" },
    ];

    // ================= FAMILY MEMBERS DATA =================
    const familyMembers = [
        {
            name: "Maya",
            relation: "Daughter",
            phone: "1234567890",
            dob: "2022-02-23",
            gender: "Female",
        },
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

    const historyActions = [
        {
            label: "View",
            icon: <VisibilityIcon fontSize="small" />,
            color: "#1DB954",
            onClick: (row) => {
                console.log("View history row:", row);
                navigate(`/doctor/examination/previous-details/${row._id}`);
            },
        },
    ];
    // ================= HISTORY TABLE =================
    const historyColumns = [
        { field: "doctor", header: "Doctor Name" },
        { field: "dateTime", header: "Date & Time" },
    ];

    // Example history data
    const historyRows = [
        {
            _id: "h1",
            doctor: "Dr. Anjali D",
            dateTime: "25 Nov 2025, 10:30 AM",
        },
        {
            _id: "h2",
            doctor: "Dr. Rajesh K",
            dateTime: "26 Nov 2025, 12:15 PM",
        },
    ];


    return (
        <Box>
            {/* Patient Header Card */}
            <PatientsCard
                patientId={patient.id}
                name={patient.name}
                gender={patient.gender}
                age={patient.age}
                lastVisit={patient.lastVisit}
                condition={patient.condition}
                active={patient.active}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "My Patients", url: "/doctor/my-patients" },
                    { label: patient.name },
                ]}
            />

            {/* 5 Dashboard Cards */}
            <Box sx={{ mt: 5, mb: 6 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}   // xs = wrap vertically, sm/md/lg = row
                    spacing={3}
                    flexWrap={{ xs: "wrap", sm: "nowrap", md: "nowrap" }}
                    sx={{
                        overflowX: { xs: "visible", sm: "auto" },
                        whiteSpace: { sm: "nowrap" },
                        paddingBottom: "10px",
                    }}
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
                    {/* Family Tab */}
                    {activeTab === "family" && (
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Family Members
                            </Typography>
                            {familyMembers.length > 0 ? (
                                <Stack spacing={3} direction="row" flexWrap="wrap" gap={3}>
                                    {familyMembers.map((member, index) => (
                                        <FamilyMemberCard key={index} {...member} />
                                    ))}
                                </Stack>
                            ) : (
                                <Box textAlign="center" py={12}>
                                    <Typography variant="h6" color="text.secondary">
                                        No family members added yet
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" mt={1}>
                                        Add family members to view their details here.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                    {activeTab === "history" && (
                        <TableComponent
                            title="Patient History"
                            columns={historyColumns}
                            rows={historyRows}
                            actions={historyActions}   // 👈 View icon shown here
                            showAddButton={false}
                            showExportButton={false}
                            showView={false}
                            showEdit={false}
                            showDelete={false}
                        />
                    )}

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
                </Box>
            </Paper>
        </Box>
    );
}

export default FamilyMembers;