import React, { useState, useCallback, useEffect } from "react";
import { Box, Stack, TextField, MenuItem, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
import HeadingCard from "../../../components/card/HeadingCard";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { toast } from "react-toastify";

import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { Eye } from "lucide-react";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";

function All_Patients_View() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [treatmentFilter, setTreatmentFilter] = useState("All Treatment Types");
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 25,
        total: 0,
    });

    // Fetch patients from API (server-side pagination and search)
    const fetchPatients = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                page: pagination.page + 1,
                limit: pagination.rowsPerPage,
            };
            if (searchText && searchText.trim()) params.search = searchText.trim();

            const response = await axios.get(getApiUrl("patients"), {
                headers: getAuthHeaders(),
                params,
            });

            if (response.data.success && response.data.data) {
                const { profiles = [], total = 0 } = response.data.data;
                const transformed = (Array.isArray(profiles) ? profiles : []).map((p) => ({
                    _id: p._id,
                    patientName: p?.user?.name || "N/A",
                    age: p?.user?.age ?? p?.age ?? "N/A",
                    condition: p?.condition || "—",
                    lastVisit: p?.updatedAt
                        ? new Date(p.updatedAt).toISOString().split("T")[0]
                        : "—",
                    status: p?.status || "Active",
                }));
                setRows(transformed);
                setPagination((prev) => ({ ...prev, total }));
            } else {
                setRows([]);
                setPagination((prev) => ({ ...prev, total: 0 }));
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
            toast.error(error.response?.data?.message || "Failed to load patients");
            setRows([]);
            setPagination((prev) => ({ ...prev, total: 0 }));
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.rowsPerPage, searchText]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };
    const handleRowsPerPageChange = (newRowsPerPage) => {
        setPagination((prev) => ({
            ...prev,
            rowsPerPage: newRowsPerPage,
            page: 0,
        }));
    };

    // Reset to first page when search changes
    const onSearchChange = (val) => {
        setSearchText(val);
        setPagination((prev) => ({ ...prev, page: 0 }));
    };

    // Client-side filter by treatment/condition only (backend has no condition filter)
    const filteredRows =
        treatmentFilter === "All Treatment Types"
            ? rows
            : rows.filter(
                  (row) =>
                      (row.condition || "").toLowerCase() ===
                      treatmentFilter.toLowerCase()
              );

    // COLUMNS
    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "age", header: "Age" },
        { field: "condition", header: "Condition" },
        { field: "lastVisit", header: "Last Visit" },
        { field: "status", header: "Status" },
    ];

    // Counts from current page data (for display only; for full stats would need separate API)
    const totalPatients = pagination.total;
    const activeTreatments = rows.filter((r) => r.status === "Active").length;
    const completed = rows.filter((r) => r.status === "Inactive").length;
    const pending = rows.filter((r) => r.status === "Pending").length;

    const actions = [
        {
            label: "View",
            icon: <Eye />,
            color: "var(--color-icon-3)",
            onClick: (row) => navigate(`/doctor/family-members/${row._id}`),
        },
    ];

    return (
        <Box className="space-y-6 p-6">
            <HeadingCard
                category="PATIENT MANAGEMENT"
                title="All Patients"
                subtitle="View and manage patient details, treatment history, and current status."
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "All Patients" },
                ]}
            />

            <Stack
                direction="row"
                spacing={3}
                mb={5}
                flexWrap="nowrap"
                sx={{
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    paddingBottom: "10px",
                }}
            >
                <DashboardCard title="Total Patients" count={totalPatients} icon={PeopleIcon} />
                <DashboardCard title="Active Treatments" count={activeTreatments} icon={LocalHospitalIcon} iconColor="#2e7d32" />
                <DashboardCard title="Completed" count={completed} icon={CheckCircleIcon} iconColor="#388e3c" />
                <DashboardCard title="Pending" count={pending} icon={PendingActionsIcon} iconColor="#ed6c02" />
            </Stack>

            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{ width: "100%" }}
            >
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={onSearchChange}
                        style={{ width: "100%" }}
                    />
                </div>
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
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                bgcolor: "white",
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

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableComponent
                    columns={columns}
                    rows={filteredRows}
                    actions={actions}
                    showStatusBadge={true}
                    statusField="status"
                    serverSidePagination={true}
                    totalCount={pagination.total}
                    page={pagination.page}
                    rowsPerPage={pagination.rowsPerPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
            )}
        </Box>
    );
}

export default All_Patients_View;
