import { useState, useMemo, useEffect, useCallback } from "react";
import { Box, Stack, CircularProgress, Chip, TextField, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HealingIcon from "@mui/icons-material/Healing";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PsychologyIcon from "@mui/icons-material/Psychology";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
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

function AssignTherapy_View() {
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("All");
    const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 25, total: 0 });
    const navigate = useNavigate();

    const fetchAssignments = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = { page: pagination.page + 1, limit: pagination.rowsPerPage };
            if (searchText && searchText.trim()) params.search = searchText.trim();
            if (filter && filter !== "All") params.status = filter;

            const response = await axios.get(
                getApiUrl("examinations/therapy-plans/ipd"),
                { headers: getAuthHeaders(), params }
            );

            if (response.data.success) {
                const therapyData = response.data.data || [];
                const total = response.data.meta?.total ?? 0;
                setPagination((prev) => ({ ...prev, total }));

                const groupedByPatient = {};

                therapyData.forEach((therapy) => {
                    const patientId = therapy.examination?.patient?._id?.toString() || therapy.examination?.patient?.toString();
                    const patientUhid = therapy.examination?.patient?.user?.uhid || therapy.examination?.patient?.patientId || "N/A";
                    const key = patientId || patientUhid;

                    if (!groupedByPatient[key]) {
                        groupedByPatient[key] = {
                            _id: key, // Use patient ID as the row ID
                            patientName: therapy.examination?.patient?.user?.name || "Unknown",
                            patientId: patientUhid,
                            patientIdRaw: patientId,
                            assignedDate: therapy.createdAt
                                ? new Date(therapy.createdAt).toISOString().split("T")[0]
                                : "N/A",
                            therapies: [], // Array to store all therapies for this patient
                            status: "Active", // Default status
                        };
                    }

                    // Add this therapy to the patient's list
                    groupedByPatient[key].therapies.push({
                        _id: therapy._id,
                        therapyType: therapy.treatmentName || "N/A",
                        totalSessions: therapy.daysOfTreatment || 0,
                        therapistName: (therapy.therapists && therapy.therapists.length > 0)
                            ? therapy.therapists.map(t => t.user?.name || t.name || "Unknown").join(", ")
                            : therapy.therapist?.user?.name || "Urgent (Pending)",
                        sessionsCompleted: therapy.progressCount || 0,
                        sessionId: therapy.sessionId || null,
                        timeline: therapy.timeline || "AlternateDay",
                        createdAt: therapy.createdAt,
                        rawData: therapy,
                    });

                    // Update date to the latest therapy date
                    if (therapy.createdAt) {
                        const therapyDate = new Date(therapy.createdAt).toISOString().split("T")[0];
                        if (therapyDate > groupedByPatient[key].assignedDate) {
                            groupedByPatient[key].assignedDate = therapyDate;
                        }
                    }

                    // Update status - if inpatient is discharged, show Completed
                    const therapyStatus = therapy.examination?.inpatient?.status === "Discharged" ? "Completed" : "Active";
                    if (therapyStatus === "Completed" || groupedByPatient[key].status === "Completed") {
                        groupedByPatient[key].status = "Completed";
                    }
                });

                // Convert grouped object to array
                const groupedAssignments = Object.values(groupedByPatient);

                setAssignments(groupedAssignments);
            } else {
                toast.error(response.data.message || "Failed to fetch assignments");
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
            toast.error(error.response?.data?.message || "Error fetching assignments");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.rowsPerPage, searchText, filter]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

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

    const displayedAssignments = assignments;

    const stats = useMemo(() => ({
        total: pagination.total,
        active: assignments.filter((a) => a.status === "Active").length,
        completed: assignments.filter((a) => a.status === "Completed").length,
        pending: assignments.filter((a) => a.status === "Pending").length,
    }), [assignments, pagination.total]);

    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "patientId", header: "Patient ID" },
        {
            field: "therapyType",
            header: "Therapies",
            render: (row) => {
                if (!row.therapies || row.therapies.length === 0) {
                    return "N/A";
                }
                return (
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, max-content)",
                        gap: 0.5,
                        maxWidth: "100%",
                    }}>
                        {row.therapies.map((therapy, idx) => (
                            <Chip
                                key={idx}
                                label={therapy.therapyType}
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
        { field: "assignedDate", header: "Assigned Date" },
        {
            field: "sessionsProgress",
            header: "Total Sessions",
            render: (row) => {
                if (!row.therapies || row.therapies.length === 0) {
                    return "N/A";
                }
                const totalSessions = row.therapies.reduce((sum, t) => sum + (t.totalSessions || 0), 0);
                return totalSessions;
            }
        },
        { field: "status", header: "Status" },
    ];

    const getActions = (row) => {
        const actions = [
            {
                icon: <VisibilityIcon fontSize="small" />,
                color: "var(--color-info)",
                tooltip: "View Details",
                onClick: (row) => {
                    // Navigate to view page showing all therapies for this patient
                    // Use the first therapy ID to view details
                    if (row.therapies && row.therapies.length > 0) {
                        navigate(`/doctor/assign-therapy/${row.therapies[0]._id}`);
                    } else {
                        toast.info("No therapies found for this patient");
                    }
                },
            },
            {
                icon: <EditIcon fontSize="small" />,
                color: "var(--color-warning)",
                tooltip: "Edit Therapy",
                onClick: (row) => {
                    // Navigate to edit page for the first therapy
                    if (row.therapies && row.therapies.length > 0) {
                        navigate(`/doctor/assign-therapy/edit/${row.therapies[0]._id}`, {
                            state: { therapyData: row.therapies[0].rawData }
                        });
                    } else {
                        toast.info("No therapies found for this patient");
                    }
                },
            },
        ];

        // Add progress tracker button if sessionId exists
        if (row.therapies && row.therapies.length > 0) {
            const firstTherapy = row.therapies[0];
            if (firstTherapy.sessionId) {
                actions.push({
                    icon: <PersonIcon fontSize="small" />,
                    color: "var(--color-success)",
                    tooltip: "Track Progress",
                    onClick: (row) => {
                        navigate(`/doctor/therapy-execution/${firstTherapy.sessionId}`);
                    },
                });
            }
        }

        return actions;
    };

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
                title="IPD Therapies"
                subtitle="Manage therapy assignments for patients"
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "IPD Therapies" },
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
                <DashboardCard title="Total Assignments" count={stats.total} icon={AssignmentIcon} />
                <DashboardCard title="Active" count={stats.active} icon={HealingIcon} />
                <DashboardCard title="Completed" count={stats.completed} icon={HealingIcon} />
                <DashboardCard title="Pending" count={stats.pending} icon={AssignmentIcon} />
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
                        rows={displayedAssignments}
                        columns={columns}
                        fileName="therapy-assignments.xlsx"
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
                        <MenuItem value="Pending">Pending</MenuItem>
                    </TextField>
                    <RedirectButton text="Assign New Therapy" link="/doctor/assign-therapy/new" />
                </div>
            </CardBorder>

            {/* Table - client-side pagination same as in-patients */}
            <TableComponent
                title="Therapy Assignments"
                columns={columns}
                rows={displayedAssignments.map((row) => ({
                    ...row,
                    sessionsProgress: `${row.sessionsCompleted}/${row.totalSessions}`,
                    status: (
                        <Chip
                            label={row.status}
                            color={row.status === "Active" ? "primary" : row.status === "Completed" ? "success" : "default"}
                            size="small"
                        />
                    )
                }))}
                actions={getActions}
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
                showExportButton={false}
                showCheckbox={false}
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

export default AssignTherapy_View;

