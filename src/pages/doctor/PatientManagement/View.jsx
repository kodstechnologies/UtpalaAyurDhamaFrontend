import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { toast } from "react-toastify";
import { CircularProgress, Box } from "@mui/material";
import HeadingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import TableComponent from "../../../components/table/TableComponent";
// ICONS
import PeopleIcon from "@mui/icons-material/People";
import LocalHospital from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from "@mui/icons-material/Delete";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import { TextField, MenuItem, Chip } from "@mui/material";
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
    try {
        const response = await axios.delete(
            getApiUrl(`inpatients/${id}`),
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting inpatient:', error);
        throw error;
    }
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
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // Search and Filter states
    const [searchText, setSearchText] = useState('');
    const [treatmentFilter, setTreatmentFilter] = useState('All Treatment Types');

    // Fetch inpatients from API
    const fetchInpatients = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl("inpatients"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000, // Get all inpatients for now
                    },
                }
            );

            if (response.data.success) {
                const inpatientsData = response.data.data || [];
                
                // Transform API response to match frontend table structure
                const transformedInpatients = inpatientsData.map((inpatient) => ({
                    _id: inpatient._id,
                    patientName: inpatient.patient?.user?.name || "N/A",
                    roomNo: inpatient.roomNumber || "N/A",
                    admittedOn: inpatient.admissionDate
                        ? new Date(inpatient.admissionDate).toISOString().split("T")[0]
                        : "N/A",
                    reason: inpatient.reason || "N/A",
                    status: inpatient.status || "Admitted",
                    // Store full inpatient object for navigation if needed
                    fullInpatient: inpatient,
                }));

                setRows(transformedInpatients);
            } else {
                toast.error(response.data.message || "Failed to fetch inpatients");
            }
        } catch (error) {
            console.error("Error fetching inpatients:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch inpatients");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInpatients();
    }, [fetchInpatients]);

    // Filtered rows
    const filteredRows = rows.filter(row =>
        row.patientName.toLowerCase().includes(searchText.toLowerCase()) &&
        (treatmentFilter === "All Treatment Types" || row.reason.toLowerCase().includes(treatmentFilter.toLowerCase()))
    );

    // Dynamic dashboard counts based on rows (using backend status values: Admitted, Discharged, Transferred)
    const totalPatients = rows.length;
    const activeTreatments = rows.filter(row => row.status === 'Admitted' || row.status === 'admitted').length;
    const completed = rows.filter(row => row.status === 'Discharged' || row.status === 'discharged').length;
    const pending = rows.filter(row => row.status === 'Transferred' || row.status === 'transferred').length;
    
    // Custom render function for status column with color coding
    const renderStatusCell = (params) => {
        const colorMap = {
            'Admitted': 'success',
            'admitted': 'success',
            'Discharged': 'default',
            'discharged': 'default',
            'Transferred': 'warning',
            'transferred': 'warning',
        };
        const statusValue = params.value || 'Admitted';
        const normalizedStatus = statusValue.charAt(0).toUpperCase() + statusValue.slice(1).toLowerCase();
        return (
            <Chip
                label={normalizedStatus}
                color={colorMap[statusValue] || 'success'}
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
    const handleDelete = async (id) => {
        // Find the patient name for the confirmation message
        const patient = rows.find(r => r._id === id);
        const patientName = patient?.patientName || "this patient";
        
        if (window.confirm(`Are you sure you want to delete ${patientName}? This action cannot be undone.`)) {
            try {
                await deletePatientAPI(id);
                toast.success("Inpatient deleted successfully");
                // Refresh the list
                fetchInpatients();
            } catch (error) {
                console.error("Error deleting inpatient:", error);
                toast.error(error.response?.data?.message || "Failed to delete inpatient");
            }
        }
    };
    // Handler: Redirect to viewPage on view click
    const handleDetails = (row) => {
        navigate(`/doctor/in-patients/${row._id}`);
    };
    // Custom action handlers (updated to navigate to pages)
    const handleViewRecords = (row) => {
        navigate(`/doctor/in-patients/add-daily-checkup?inpatientId=${row._id}&patientName=${encodeURIComponent(row.patientName)}`);
    };
    // Custom Actions Array
    const customActions = [
        {
            icon: <AssignmentIcon fontSize="small" />,
            color: "var(--color-warning)",
            onClick: handleViewRecords,
            tooltip: "View Records",
        },
        {
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: handleDetails, // ⭐ NOW REDIRECTS TO VIEW PAGE
            tooltip: "Patient Details",
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
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableComponent
                    columns={columns}
                    rows={filteredRows}
                    showStatusBadge={true}
                    statusField="status"
                    actions={customActions}
                />
            )}
        </div>
    );
}
export default Patient_Management_View;