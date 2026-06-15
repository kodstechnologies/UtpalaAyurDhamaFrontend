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
import EditIcon from "@mui/icons-material/Edit";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";
import MedicationIcon from "@mui/icons-material/Medication";
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
    const [statusFilter, setStatusFilter] = useState('All');
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 25,
        total: 0,
    });

    // Fetch inpatients from API (with server-side search and status filter)
    const fetchInpatients = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                page: pagination.page + 1, // Backend uses 1-based pagination
                limit: pagination.rowsPerPage,
            };
            if (searchText && searchText.trim()) params.search = searchText.trim();
            if (statusFilter && statusFilter !== 'All') params.status = statusFilter;

            const response = await axios.get(
                getApiUrl("inpatients"),
                {
                    headers: getAuthHeaders(),
                    params,
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
                // Update pagination total (backend sends meta.total)
                const total = response.data.meta?.total ?? response.data.total ?? 0;
                setPagination(prev => ({ ...prev, total }));
            }
            else {
                toast.error(response.data.message || "Failed to fetch inpatients");
            }
        } catch (error) {
            console.error("Error fetching inpatients:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch inpatients");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.rowsPerPage, searchText, statusFilter]);

    useEffect(() => {
        fetchInpatients();
    }, [fetchInpatients]);

    // No client-side filtering; search and status are applied on the server
    const displayedRows = rows;

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
    const handleOpenPrescription = (row) => {
        navigate(
            `/doctor/ipd-prescriptions/new?inpatientId=${row._id}&patientName=${encodeURIComponent(row.patientName)}`
        );
    };
    // Handler: Edit patient examination - fetch examination by inpatient and navigate
    const handleEditExamination = async (row) => {
        try {
            const response = await axios.get(
                getApiUrl(`examinations/inpatient/${row._id}`),
                { headers: getAuthHeaders() }
            );
            const examinations = response?.data?.data;
            const examinationId = Array.isArray(examinations) && examinations.length > 0
                ? examinations[0]._id
                : examinations?._id;
            if (examinationId) {
                navigate(`/doctor/edit-examination/${examinationId}`, { state: { from: "in-patients" } });
            } else {
                toast.warning("No examination record found for this patient yet.");
            }
        } catch (error) {
            console.error("Error fetching examination:", error);
            toast.error(error?.response?.data?.message || "Failed to load examination");
        }
    };
    // Handler: View examination details - fetch examination by inpatient and navigate
    const handleExaminationDetails = async (row) => {
        try {
            const response = await axios.get(
                getApiUrl(`examinations/inpatient/${row._id}`),
                { headers: getAuthHeaders() }
            );
            const examinations = response?.data?.data;
            const examinationId = Array.isArray(examinations) && examinations.length > 0
                ? examinations[0]._id
                : examinations?._id;
            if (examinationId) {
                navigate(`/doctor/examination-details/${examinationId}`, { state: { from: "in-patients" } });
            } else {
                toast.warning("No examination record found for this patient yet.");
            }
        } catch (error) {
            console.error("Error fetching examination:", error);
            toast.error(error?.response?.data?.message || "Failed to load examination");
        }
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
            icon: <MedicationIcon fontSize="small" />,
            color: "var(--color-success)",
            onClick: handleOpenPrescription,
            tooltip: "Add Prescription",
        },
        {
            icon: <EditIcon fontSize="small" />,
            color: "var(--color-info, #0288d1)",
            onClick: handleEditExamination,
            tooltip: "Edit Examination",
        },
        {
            icon: <DescriptionIcon fontSize="small" />,
            color: "var(--color-secondary, #9e9e9e)",
            onClick: handleExaminationDetails,
            tooltip: "Examination Details",
        },
        {
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: handleDetails,
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
                        onChange={(val) => {
                            setSearchText(val);
                            setPagination((prev) => ({ ...prev, page: 0 }));
                        }}
                        style={{ width: "100%" }}
                    />
                </div>
                {/* RIGHT SIDE — Export + Filter */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <ExportDataButton
                        rows={rows}
                        columns={columns}
                        fileName="patients.xlsx"
                    />
                    <TextField
                        select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPagination((prev) => ({ ...prev, page: 0 }));
                        }}
                        sx={{
                            width: { xs: "100%", sm: 220 },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: 'white',
                                height: 46,
                            },
                        }}
                        size="small"
                    >
                        <MenuItem value="All">All Status</MenuItem>
                        <MenuItem value="Admitted">Admitted</MenuItem>
                        <MenuItem value="Discharged">Discharged</MenuItem>
                        <MenuItem value="Transferred">Transferred</MenuItem>
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
                    rows={displayedRows}
                    showStatusBadge={true}
                    statusField="status"
                    actions={customActions}
                    serverSidePagination={true}
                    totalCount={pagination.total}
                    page={pagination.page}
                    rowsPerPage={pagination.rowsPerPage}
                    onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                    onRowsPerPageChange={(newRowsPerPage) => setPagination(prev => ({ ...prev, rowsPerPage: newRowsPerPage, page: 0 }))}
                />
            )}
        </div>
    );
}
export default Patient_Management_View;