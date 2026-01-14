import { useState, useMemo, useEffect } from "react";
import { Box, Stack, Button, CircularProgress, Chip } from "@mui/material";
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
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch OPD prescriptions from backend
    const fetchPrescriptions = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl("examinations/prescriptions/opd/by-doctor"),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                const prescriptionData = response.data.data || [];

                // Group prescriptions by patient (using patient _id or patientId)
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
                            patientIdRaw: patientId,
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
    };

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    // Refresh when navigating back from create/edit page
    useEffect(() => {
        if (location.state?.refresh) {
            fetchPrescriptions();
            // Clear the refresh flag
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    // Filter prescriptions
    const filteredPrescriptions = useMemo(() => {
        return prescriptions.filter((prescription) => {
            // Check if any medicine in the prescriptions array matches search
            const medicinesMatch = prescription.prescriptions?.some(p =>
                p.medication?.toLowerCase().includes(searchText.toLowerCase())
            ) || false;

            const searchMatch =
                searchText === "" ||
                prescription.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
                prescription.patientUhid.toLowerCase().includes(searchText.toLowerCase()) ||
                medicinesMatch;

            const statusMatch = filter === "All" || prescription.status === filter;

            return searchMatch && statusMatch;
        });
    }, [prescriptions, searchText, filter]);

    // Calculate statistics
    const stats = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        // Count total prescriptions (not grouped rows)
        const totalPrescriptions = prescriptions.reduce((sum, p) => sum + (p.prescriptions?.length || 0), 0);
        return {
            total: totalPrescriptions,
            active: prescriptions.filter((p) => p.status === "Active").length,
            completed: prescriptions.filter((p) => p.status === "Completed").length,
            today: prescriptions.filter((p) => {
                return p.prescriptionDate === today;
            }).length,
        };
    }, [prescriptions]);

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
                        onChange={(val) => setSearchText(val)}
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
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
                        rows={filteredPrescriptions}
                        columns={columns}
                        fileName="prescriptions.xlsx"
                    />
                    <RedirectButton text="Create Prescription" link="/doctor/prescriptions/new" />
                </div>
            </CardBorder>

            {/* Filter Buttons */}
            <Stack direction="row" spacing={2} mb={3}>
                {["All", "Active", "Completed"].map((btn) => (
                    <Button
                        key={btn}
                        onClick={() => setFilter(btn)}
                        variant={filter === btn ? "contained" : "outlined"}
                        sx={{
                            px: 3,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: filter === btn ? "var(--color-primary)" : "transparent",
                            color: filter === btn ? "white" : "var(--color-text-dark)",
                            borderColor: "var(--color-border)",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": {
                                bgcolor: filter === btn ? "var(--color-primary-dark)" : "var(--color-bg-hover)",
                            },
                        }}
                    >
                        {btn}
                    </Button>
                ))}
            </Stack>

            {/* Table */}
            <TableComponent
                title="OPD Prescriptions"
                columns={columns}
                rows={filteredPrescriptions}
                actions={actions}
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
                showExportButton={false}
            />
        </Box>
    );
}

export default Prescriptions_View;
