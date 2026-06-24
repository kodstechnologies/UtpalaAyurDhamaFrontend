import { useState, useMemo, useEffect, useCallback } from "react";
import { Box, Stack, Button, CircularProgress, Chip, TextField, MenuItem } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
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

function Prescriptions_View() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("All");
    const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 25, total: 0 });
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch OPD prescriptions from backend (server-side pagination + search + status)
    const fetchPrescriptions = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                page: pagination.page + 1,
                limit: pagination.rowsPerPage,
            };
            if (searchText && searchText.trim()) params.search = searchText.trim();
            if (filter && filter !== "All") params.status = filter === "Active" ? "Pending" : filter === "Completed" ? "Dispensed" : filter;

            const response = await axios.get(
                getApiUrl("examinations/prescriptions/opd/by-doctor"),
                { headers: getAuthHeaders(), params }
            );

            if (response.data.success) {
                const prescriptionData = response.data.data || [];
                const total = response.data.meta?.total ?? 0;
                setPagination((prev) => ({ ...prev, total }));

                // Group prescriptions by examination (each create/save = separate row)
                const groupedByExamination = {};

                prescriptionData.forEach((prescription) => {
                    const patientId = prescription.patient?._id?.toString() || prescription.patient?.toString();
                    const patientUhid = prescription.patient?.user?.uhid || prescription.patient?.patientId || "N/A";
                    const examId = prescription.examination?._id?.toString()
                        || prescription.examination?.toString()
                        || prescription._id;
                    const key = examId;

                    if (!groupedByExamination[key]) {
                        groupedByExamination[key] = {
                            _id: key,
                            examinationId: examId,
                            patientName: prescription.patient?.user?.name || "Unknown",
                            patientUhid: patientUhid,
                            patientIdRaw: patientId,
                            isFamilyMember: prescription.patient?.isFamilyMember || false,
                            primaryPatientName: prescription.patient?.primaryPatientName || null,
                            relation: prescription.patient?.relation || null,
                            prescriptionDate: prescription.createdAt
                                ? new Date(prescription.createdAt).toISOString().split("T")[0]
                                : new Date().toISOString().split("T")[0],
                            prescriptions: [],
                            status: "Active",
                        };
                    }

                    groupedByExamination[key].prescriptions.push({
                        _id: prescription._id,
                        medication: prescription.medication || "N/A",

                        frequency: prescription.frequency || "",
                        duration: prescription.duration || "",
                        dosage: prescription.dosage || "",
                        foodTiming: prescription.foodTiming || "",
                        status: prescription.status || "Pending",
                        createdAt: prescription.createdAt,
                        rawData: prescription,
                    });

                    // Update date to the latest prescription date
                    if (prescription.createdAt) {
                        const presDate = new Date(prescription.createdAt).toISOString().split("T")[0];
                        if (presDate > groupedByExamination[key].prescriptionDate) {
                            groupedByExamination[key].prescriptionDate = presDate;
                        }
                    }

                    const presStatus = prescription.status === "Pending" ? "Active" : prescription.status === "Dispensed" ? "Completed" : prescription.status;
                    if (presStatus === "Active" || groupedByExamination[key].status === "Active") {
                        groupedByExamination[key].status = "Active";
                    } else if (presStatus === "Completed") {
                        groupedByExamination[key].status = "Completed";
                    }
                });

                const groupedPrescriptions = Object.values(groupedByExamination);

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

    // Refresh when navigating back from create/edit page
    useEffect(() => {
        if (location.state?.refresh) {
            fetchPrescriptions();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, fetchPrescriptions]);

    // Display rows from API (grouped by examination; no client-side filter)
    const displayedPrescriptions = prescriptions;

    // Calculate statistics
    const stats = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        const totalPrescriptions = prescriptions.reduce((sum, p) => sum + (p.prescriptions?.length || 0), 0);
        return {
            total: pagination.total,
            active: prescriptions.filter((p) => p.status === "Active").length,
            completed: prescriptions.filter((p) => p.status === "Completed").length,
            today: prescriptions.filter((p) => p.prescriptionDate === today).length,
        };
    }, [prescriptions, pagination.total]);

    const columns = [
        {
            field: "patientName",
            header: "Patient Name",
            render: (row) => (
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <span>{row.patientName}</span>
                        {row.isFamilyMember && row.primaryPatientName && (
                            <Chip
                                label={`Family member of ${row.primaryPatientName}${row.relation ? ` (${row.relation})` : ``}`}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem", height: "20px" }}
                            />
                        )}
                    </Stack>
                </Box>
            ),
        },
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
                // Navigate to view page showing all prescriptions for this patient
                // Use the first prescription ID to view details
                if (row.prescriptions && row.prescriptions.length > 0) {
                    navigate(`/doctor/prescriptions/${row.prescriptions[0]._id}`);
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
                // Navigate to edit page for the first prescription
                if (row.prescriptions && row.prescriptions.length > 0) {
                    navigate(`/doctor/prescriptions/edit/${row.prescriptions[0]._id}`);
                } else {
                    toast.info("No prescriptions found for this patient");
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
                title="OPD Prescriptions"
                subtitle="Manage and view OPD patient prescriptions"
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "OPD Prescriptions" },
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
                    <Search
                        value={searchText}
                        onChange={onSearchChange}
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchPrescriptions}
                        disabled={isLoading}
                        sx={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-dark)",
                            "&:hover": {
                                borderColor: "var(--color-primary)",
                                backgroundColor: "var(--color-bg-hover)",
                            },
                        }}
                    >
                        Refresh
                    </Button>
                    <ExportDataButton
                        rows={displayedPrescriptions}
                        columns={columns}
                        fileName="prescriptions.xlsx"
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
                    <RedirectButton text="Create Prescription" link="/doctor/prescriptions/new" />
                </div>
            </CardBorder>

            {/* Table - client-side pagination same as in-patients */}
            <TableComponent
                title="OPD Prescriptions"
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

export default Prescriptions_View;
