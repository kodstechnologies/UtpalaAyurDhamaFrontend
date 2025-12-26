import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ⭐ ADDED for navigation
import HeadingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import TableComponent from "../../../components/table/TableComponent"; // Use standard TableComponent
// ICONS
import PeopleIcon from "@mui/icons-material/People";
import LocalHospital from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from "@mui/icons-material/Delete";
import { Stethoscope, Pill } from 'lucide-react';
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import { TextField, MenuItem, Chip } from "@mui/material"; // ⭐ ADDED Chip for status rendering
// Define fields for the form modals
const fields = [
    { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
    { name: 'roomNo', label: 'Room No.', type: 'text', required: true },
    { name: 'admittedOn', label: 'Admitted On', type: 'date', required: true },
    { name: 'reason', label: 'Reason', type: 'text', required: true },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
        ],
    },
];
// Placeholder API functions - replace with actual API calls
const createPatientAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newPatient = { _id: newId, ...data };
    console.log('Created patient:', newPatient);
    return newPatient;
};
const updatePatientAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated patient:', { _id: id, ...data });
    return { _id: id, ...data };
};
const deletePatientAPI = async (id) => {
    // Simulate API call
    console.log('Deleted patient:', id);
};
// Modal submit handlers
const handlePrescriptionSubmit = (data) => {
    console.log('Prescription added:', data);
    // Implement API call or state update here
};
const handleDailyCheckupSubmit = (data) => {
    console.log('Daily checkup added:', data);
    // Implement API call or state update here
};
const handleTherapyPlanSubmit = (data) => {
    console.log('Therapy plan added:', data);
    // Implement API call or state update here
};
function Patient_Management_View() {
    const navigate = useNavigate(); // ⭐ ADDED for redirect
    const [rows, setRows] = useState([
        {
            _id: "1",
            patientName: "Rakesh Mohanty",
            roomNo: "101",
            admittedOn: "2025-01-10",
            reason: "Fever & Weakness",
            status: "Active"
        },
        {
            _id: "2",
            patientName: "Priya Sharma",
            roomNo: "202",
            admittedOn: "2025-01-12",
            reason: "Body Pain",
            status: "Active"
        },
        {
            _id: "3",
            patientName: "Arun Das",
            roomNo: "305",
            admittedOn: "2025-01-14",
            reason: "Accident Injury",
            status: "Active"
        },
        {
            _id: "4",
            patientName: "Sneha Patnaik",
            roomNo: "115",
            admittedOn: "2025-01-08",
            reason: "High BP",
            status: "Inactive"
        },
        {
            _id: "5",
            patientName: "John Abraham",
            roomNo: "410",
            admittedOn: "2025-01-18",
            reason: "Chest Pain",
            status: "Active"
        }
    ]);
    // Search and Filter states
    const [searchText, setSearchText] = useState('');
    const [treatmentFilter, setTreatmentFilter] = useState('All Treatment Types');
    // Filtered rows
    const filteredRows = rows.filter(row =>
        row.patientName.toLowerCase().includes(searchText.toLowerCase()) &&
        (treatmentFilter === "All Treatment Types" || row.reason.includes(treatmentFilter))
    );
    // Dynamic dashboard counts based on rows
    const totalPatients = rows.length;
    const activeTreatments = rows.filter(row => row.status === 'Active').length;
    const completed = rows.filter(row => row.status === 'Inactive').length;
    const pending = 0; // No pending status; adjust as needed
    // ⭐ UPDATED: Custom render function for status column with color coding
    const renderStatusCell = (params) => {
        const colorMap = {
            'Active': 'success', // Green
            'Inactive': 'default', // Grey
        };
        return (
            <Chip
                label={params.value}
                color={colorMap[params.value] || 'default'}
                size="small"
                variant="outlined"
            />
        );
    };
    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "roomNo", header: "Room No." },
        { field: "admittedOn", header: "Admitted On" },
        { field: "reason", header: "Reason" },
        {
            field: "status",
            header: "Status",
            renderCell: renderStatusCell // ⭐ ADDED for color-coded status rendering
        }
    ];
    const handleCreateSubmit = async (data) => {
        const newPatient = await createPatientAPI(data);
        setRows(prev => [...prev, newPatient]);
    };
    const handleEditSubmit = async (data, row) => {
        const updatedPatient = await updatePatientAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedPatient : r));
    };
    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete patient ${id}?`)) {
            deletePatientAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };
    // ⭐ UPDATED HANDLER: Redirect to viewPage on view click
    const handleDetails = (row) => {
        navigate(`/doctor/in-patients/${row._id}`); // ⭐ REDIRECT TO VIEW PAGE (e.g., /patient/1/view)
        console.log("Redirecting to view page for patient:", row); // For debugging
    };
    // Custom action handlers (updated to navigate to pages)
    const handleAssignDoctor = (row) => {
        navigate(`/doctor/in-patients/add-therapy-plan?patientName=${encodeURIComponent(row.patientName)}`);
    };
    const handlePrescribeMedication = (row) => {
        navigate(`/doctor/in-patients/add-prescription?patientName=${encodeURIComponent(row.patientName)}`);
    };
    const handleViewRecords = (row) => {
        navigate(`/doctor/in-patients/add-daily-checkup?patientName=${encodeURIComponent(row.patientName)}`);
    };
    // Custom Actions Array (4 dynamic actions)
    const customActions = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: handleDetails, // ⭐ NOW REDIRECTS TO VIEW PAGE
            tooltip: "Patient Details",
        },
        {
            icon: <Stethoscope fontSize="small" />,
            color: "var(--color-success)",
            onClick: handleAssignDoctor,
            tooltip: "Assign Doctor",
        },
        {
            icon: <Pill fontSize="small" />,
            color: "var(--color-info)",
            onClick: handlePrescribeMedication,
            tooltip: "Prescribe Medication",
        },
        {
            icon: <AssignmentIcon fontSize="small" />,
            color: "var(--color-warning)",
            onClick: handleViewRecords,
            tooltip: "View Records",
        },
        {
            icon: <DeleteIcon fontSize="small" />,
            color: "var(--color-error)",
            onClick: (row) => handleDelete(row._id),
            tooltip: "Delete",
        },
    ];
    // --------------- UI ---------------
    return (
        <div>
            <HeadingCard
                title="Patient Management"
                subtitle="View and manage all patients, their admissions, treatments, and statuses."
                breadcrumbItems={
                    [
                        { label: "Doctor", url: "/doctor/dashboard" },
                        { label: "All Patients" },
                    ]
                }
            />
            {/* DASHBOARD CARDS */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "20px",
                    marginTop: "25px",
                    marginBottom: "20px",
                }}
            >
                <DashboardCard
                    title="Total Patients"
                    count={totalPatients}
                    icon={PeopleIcon}
                />
                <DashboardCard
                    title="Active Patients"
                    count={activeTreatments}
                    icon={LocalHospital}
                    iconColor="#2e7d32"
                />
                <DashboardCard
                    title="Inactive Patients"
                    count={completed}
                    icon={CheckCircleIcon}
                    iconColor="#388e3c"
                />
                <DashboardCard
                    title="Pending"
                    count={pending}
                    icon={PendingActionsIcon}
                    iconColor="#ed6c02"
                />
            </div>
            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{ width: "100%", marginBottom: "1rem" }}
            >
                {/* LEFT SIDE — Search */}
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ width: "100%" }}
                    />
                </div>
                {/* RIGHT SIDE — Export + Filter */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="patients.xlsx"
                    />
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
                </div>
            </CardBorder>
            {/* TABLE SECTION */}
            <TableComponent
                columns={columns}
                rows={filteredRows}
                showStatusBadge={true}
                statusField="status"
                actions={customActions}
            />
        </div>
    );
}
export default Patient_Management_View;