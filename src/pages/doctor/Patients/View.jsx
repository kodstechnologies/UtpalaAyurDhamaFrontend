import React, { useState } from "react";
import { Box, Stack, TextField, MenuItem } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useNavigate } from "react-router-dom";

import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
import HeadingCard from "../../../components/card/HeadingCard";

// ICONS
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { Eye } from "lucide-react";

function All_Patients_View() {
    const navigate = useNavigate();

    // FILTER
    const [treatmentFilter, setTreatmentFilter] = useState("All Treatment Types");

    // COLUMNS
    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "age", header: "Age" },
        { field: "condition", header: "Condition" },
        { field: "lastVisit", header: "Last Visit" },
        { field: "status", header: "Status" },
    ];

    // DATA
    const rows = [
        { _id: "P1", patientName: "Amit Kumar", age: 32, condition: "Diabetes", lastVisit: "2025-02-12", status: "Active" },
        { _id: "P2", patientName: "Neha Sharma", age: 28, condition: "Asthma", lastVisit: "2025-02-10", status: "Inactive" },
        { _id: "P3", patientName: "Rohan Das", age: 45, condition: "Hypertension", lastVisit: "2025-02-14", status: "Active" },
        { _id: "P4", patientName: "Priya Singh", age: 38, condition: "Arthritis", lastVisit: "2025-02-15", status: "Active" },
    ];

    // FILTERED ROWS
    const filteredRows = treatmentFilter === "All Treatment Types"
        ? rows
        : rows.filter(row => row.condition === treatmentFilter);

    // CUSTOM ACTIONS
    const customActions = [
        {
            icon: <Eye fontSize="small" />,
            color: "#27AE60",
            tooltip: "Message Patient",
            onClick: (row) => navigate(`/doctor/family-members/${row._id}`),
        },

    ];

    return (
        <Box>
            {/* BREADCRUMB */}
            <Breadcrumb
                items={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "All Patients" },
                ]}
            />

            {/* HEADING */}
            <HeadingCard
                category="PATIENT MANAGEMENT"
                title="All Patients"
                subtitle="View and manage patient details, treatment history, and current status."
            />

            {/* DASHBOARD CARDS */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                mb={5}
                // justifyContent="center"
                flexWrap="wrap"
            >
                <DashboardCard title="Total Patients" count={rows.length} icon={PeopleIcon} />
                <DashboardCard title="Active Treatments" count={3} icon={LocalHospitalIcon} iconColor="#2e7d32" />
                <DashboardCard title="Completed" count={15} icon={CheckCircleIcon} iconColor="#388e3c" />
                <DashboardCard title="Pending" count={5} icon={PendingActionsIcon} iconColor="#ed6c02" />
            </Stack>

            {/* FILTER */}
            <Stack direction="row" justifyContent="flex-end" mb={3}>
                <TextField
                    select
                    value={treatmentFilter}
                    onChange={(e) => setTreatmentFilter(e.target.value)}
                    sx={{
                        width: { xs: "100%", sm: 300 },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'white',
                            height: 46,
                        },
                    }}
                    size="small"
                >
                    <MenuItem value="All Treatment Types">
                        <strong>All Treatment Types</strong>
                    </MenuItem>
                    <MenuItem value="Diabetes">Diabetes</MenuItem>
                    <MenuItem value="Asthma">Asthma</MenuItem>
                    <MenuItem value="Hypertension">Hypertension</MenuItem>
                    <MenuItem value="Arthritis">Arthritis</MenuItem>
                </TextField>
            </Stack>

            {/* TABLE */}
            <TableComponent
                title=""
                columns={columns}
                rows={filteredRows}

                // HIDE ALL DEFAULT ACTIONS
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
                showExportButton={false}

                // ROW CLICK → VIEW PATIENT
                onRowClick={(row) => navigate(`/doctor/patients/view/${row._id}`)}

                // CUSTOM ACTION BUTTONS
                customActions={customActions}
            />
        </Box>
    );
}

export default All_Patients_View;