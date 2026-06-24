import { useState, useMemo, useEffect, useCallback } from "react";
import { Box, Stack, CircularProgress, Chip, TextField, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { toast } from "react-toastify";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import RedirectButton from "../../../components/buttons/RedirectButton";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function IPDPrescriptions_View() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("All");
    const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 25, total: 0 });
    const navigate = useNavigate();

    const fetchPrescriptions = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = { page: pagination.page + 1, limit: pagination.rowsPerPage };
            if (searchText && searchText.trim()) params.search = searchText.trim();
            if (filter && filter !== "All") params.status = filter === "Active" ? "Pending" : filter === "Completed" ? "Dispensed" : filter;

            const response = await axios.get(
                getApiUrl("examinations/prescriptions/ipd/by-doctor"),
                { headers: getAuthHeaders(), params }
            );

            if (response.data.success) {
                const prescriptionData = response.data.data || [];
                const total = response.data.meta?.total ?? 0;
                setPagination((prev) => ({ ...prev, total }));

                const groupedByPatient = {};

                prescriptionData.forEach((prescription) => {
                    const patientId = prescription.patient?._id?.toString() || prescription.patient?.toString();
                    const patientUhid = prescription.patient?.user?.uhid || prescription.patient?.patientId || "N/A";
                    const key = patientId || patientUhid;

                    if (!groupedByPatient[key]) {
                        groupedByPatient[key] = {
                            _id: key, // Use patient ID as the row ID
                            patientName: prescription.patient?.user?.name || "Unknown",
                            patientUhid: patientUhid,
                            patientId: patientId,
                            roomNumber: prescription.examination?.inpatient?.roomNumber || "N/A",
                            bedNumber: prescription.examination?.inpatient?.bedNumber || "N/A",
                            prescriptionDate: prescription.createdAt
                                ? new Date(prescription.createdAt).toISOString().split("T")[0]
                                : new Date().toISOString().split("T")[0],
                            prescriptions: [], // Array to store all prescriptions for this patient
                            status: "Active", // Default status
                        };
                    }

                    // Add this prescription to the patient's list
                    groupedByPatient[key].prescriptions.push({
                        _id: prescription._id,
                        medication: prescription.medication || "N/A",
                        dosage: prescription.dosage || "",
                        frequency: prescription.frequency || "",
                        duration: prescription.duration || "",
                        status: prescription.status || "Pending",
                        createdAt: prescription.createdAt,
                        rawData: prescription,
                    });

                    // Update date to the latest prescription date
                    if (prescription.createdAt) {
                        const presDate = new Date(prescription.createdAt).toISOString().split("T")[0];
                        if (presDate > groupedByPatient[key].prescriptionDate) {
                            groupedByPatient[key].prescriptionDate = presDate;
                        }
                    }

                    // Update status - if any prescription is Active, show Active
                    const presStatus = prescription.status === "Pending" ? "Active" : prescription.status === "Dispensed" ? "Completed" : prescription.status;
                    if (presStatus === "Active" || groupedByPatient[key].status === "Active") {
                        groupedByPatient[key].status = "Active";
                    } else if (presStatus === "Completed") {
                        groupedByPatient[key].status = "Completed";
                    }
                });

                // Convert grouped object to array
                const groupedPrescriptions = Object.values(groupedByPatient);

                setPrescriptions(groupedPrescriptions);
            } else {
                toast.error(response.data.message || "Failed to fetch prescriptions");
            }
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
            toast.error(error.response?.data?.message || "Error fetching prescriptions");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.rowsPerPage, searchText, filter]);

    useEffect(() => {
        fetchPrescriptions();
    }, [fetchPrescriptions]);

    const handlePageChange = (newPage) => setPagination((prev) => ({ ...prev, page: newPage }));
    const handleRowsPerPageChange = (newRowsPerPage) =>
        setPagination((prev) => ({ ...prev, rowsPerPage: newRowsPerPage, page: 0 }));
    const onSearchChange = (val) => {
        setSearchText(val);
        setPagination((prev) => ({ ...prev, page: 0 }));
    };
    const onFilterChange = (val) => {
        setFilter(val);
        setPagination((prev) => ({ ...prev, page: 0 }));
    };

    const displayedPrescriptions = prescriptions;

    // Calculate statistics
    const stats = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        return {
            total: pagination.total,
            active: prescriptions.filter((p) => p.status === "Active").length,
            completed: prescriptions.filter((p) => p.status === "Completed").length,
            today: prescriptions.filter((p) => p.prescriptionDate === today).length,
        };
    }, [prescriptions, pagination.total]);

    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "patientUhid", header: "UHID" },
        { field: "prescriptionDate", header: "Date" },
        {
            field: "medicines",
            header: "Medicines",
            render: (row) => {
                if (!row.prescriptions || row.prescriptions.length === 0) {
                    return "N/A";
                }
                return (
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, max-content)",
                        gap: 0.5,
                        maxWidth: "100%",
                    }}>
                        {row.prescriptions.map((pres, idx) => (
                            <Chip
                                key={idx}
                                label={pres.medication}
                                size="small"
                                sx={{
                                    backgroundColor: "var(--color-bg-a)",
                                    color: "var(--color-text-dark)",
                                    fontSize: "0.75rem",
                                    maxWidth: "fit-content",
                                }}
                            />
                        ))}
                    </Box>
                );
            }
        },
        { field: "status", header: "Status" },
    ];

    const actions = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            tooltip: "View Details",
            onClick: (row) => {
                if (row.prescriptions && row.prescriptions.length > 0) {
                    navigate(`/doctor/ipd-prescriptions/${row.prescriptions[0]._id}`);
                } else {
                    toast.info("No prescriptions found for this patient");
                }
            },
        },
        {
            icon: <EditIcon fontSize="small" />,
            color: "var(--color-warning)",
            tooltip: "Edit Prescription",
            onClick: (row) => {
                if (row.prescriptions && row.prescriptions.length > 0) {
                    navigate(`/doctor/ipd-prescriptions/edit/${row.prescriptions[0]._id}`);
                } else {
                    toast.info("No prescriptions found for this patient");
                }
            },
        },
        {
            icon: <DeleteIcon fontSize="small" />,
            color: "var(--color-error)",
            tooltip: "Delete Prescription",
            onClick: async (row) => {
                if (!row.prescriptions || row.prescriptions.length === 0) {
                    toast.info("No prescriptions found for this patient");
                    return;
                }

                const prescriptionCount = row.prescriptions.length;
                const confirmMessage = prescriptionCount > 1
                    ? `Delete all ${prescriptionCount} prescriptions for ${row.patientName}? This cannot be undone.`
                    : `Delete this prescription for ${row.patientName}? This cannot be undone.`;

                const confirmed = window.confirm(confirmMessage);
                if (!confirmed) return;

                try {
                    await Promise.all(
                        row.prescriptions.map((prescription) =>
                            axios.delete(
                                getApiUrl(`examinations/prescriptions/${prescription._id}`),
                                { headers: getAuthHeaders() }
                            )
                        )
                    );

                    toast.success(
                        prescriptionCount > 1
                            ? `${prescriptionCount} prescriptions deleted successfully`
                            : "Prescription deleted successfully"
                    );
                    fetchPrescriptions();
                } catch (error) {
                    console.error("Error deleting prescription(s):", error);
                    toast.error(error.response?.data?.message || "Failed to delete prescription");
                }
            },
        },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <HeadingCard
                title="IPD Prescriptions"
                subtitle="Manage and view IPD patient prescriptions"
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "In Patients", url: "/doctor/in-patients" },
                    { label: "IPD Prescriptions" },
                ]}
            />

            {/* Statistics Cards */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                my={4}
                justifyContent="flex-start"
                sx={{
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
            >
                <DashboardCard title="Total Prescriptions" count={stats.total} icon={MedicationIcon} />
                <DashboardCard title="Today's Prescriptions" count={stats.today} icon={EventIcon} />
                <DashboardCard title="Active" count={stats.active} icon={MedicationIcon} />
                <DashboardCard title="Completed" count={stats.completed} icon={MedicationIcon} />
            </Stack>

            {/* Search and Actions */}
            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{
                    width: "100%",
                    marginBottom: "2rem",
                }}
            >
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search value={searchText} onChange={onSearchChange} style={{ width: "100%" }} />
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <ExportDataButton
                        rows={displayedPrescriptions}
                        columns={columns}
                        fileName="ipd-prescriptions.xlsx"
                    />
                    <TextField
                        select
                        value={filter}
                        onChange={(e) => onFilterChange(e.target.value)}
                        sx={{
                            width: { xs: "100%", sm: 220 },
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                bgcolor: "white",
                                height: 46,
                            },
                        }}
                        size="small"
                    >
                        <MenuItem value="All">All Status</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                    </TextField>
                    <RedirectButton text="Create Prescription" link="/doctor/ipd-prescriptions/new" />
                </div>
            </CardBorder>

            {/* Table - client-side pagination same as in-patients */}
            <TableComponent
                title="IPD Prescriptions"
                columns={columns}
                rows={displayedPrescriptions}
                actions={actions}
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
                showExportButton={false}
                serverSidePagination={true}
                totalCount={pagination.total}
                page={pagination.page}
                rowsPerPage={pagination.rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
            />
        </Box>
    );
}

export default IPDPrescriptions_View;


