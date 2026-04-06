import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Grid,
    TextField,
    MenuItem,
    Button,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    CircularProgress,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupsIcon from "@mui/icons-material/Groups";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { toast } from "react-toastify";
import doctorService from "../../../services/doctorService";
import therapyService from "../../../services/therapyService";
import subTherapyService from "../../../services/subTherapyService";
import { getApiUrl } from "../../../config/api";

function TherapyReportsView() {
    const breadcrumbItems = [
        { label: "Home", url: "/receptionist/dashboard" },
        { label: "Therapy Reports" },
    ];

    // Filter states
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [therapyName, setTherapyName] = useState("");
    const [subTherapy, setSubTherapy] = useState("");

    // Data states
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Dropdown data states
    const [doctors, setDoctors] = useState([]);
    const [therapies, setTherapies] = useState([]);
    const [subTherapies, setSubTherapies] = useState([]);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Sorting sessions by date (latest first)
    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => {
            const dateA = new Date(a.sessionDate || a.createdAt);
            const dateB = new Date(b.sessionDate || b.createdAt);
            return dateB - dateA;
        });
    }, [sessions]);

    // Group rows where Date + Therapy + Sub-Therapy are all the same
    const displayRows = useMemo(() => {
        const map = {};
        sortedSessions.forEach(session => {
            const d = new Date(session.sessionDate || session.createdAt);
            const dateKey = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            const key = `${dateKey}||${session.treatmentName || ""}||${session.subTherapy || ""}`;
            if (!map[key]) {
                map[key] = { ...session, _dateKey: dateKey, count: 1 };
            } else {
                map[key].count += 1;
            }
        });
        return Object.values(map);
    }, [sortedSessions]);

    // Fetch initial dropdown data
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [doctorRes, therapyRes, subTherapyRes] = await Promise.all([
                    doctorService.getAllDoctorProfiles(),
                    therapyService.getAllTherapies({ limit: 1000 }),
                    subTherapyService.getAllSubTherapies({ limit: 1000 }),
                ]);

                if (doctorRes.success) setDoctors(doctorRes.data);
                if (therapyRes.success) setTherapies(therapyRes.data);
                if (subTherapyRes.success) setSubTherapies(subTherapyRes.data);
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
                toast.error("Failed to load filter options.");
            }
        };

        fetchDropdownData();
    }, []);

    const handleSearch = async () => {
        try {
            setLoading(true);
            const params = {
                dateFrom: startDate,
                dateTo: endDate,
                doctorId,
                therapyName,
                subTherapy,
            };

            const response = await therapyService.getTreatmentList(params);
            if (response.success) {
                setSessions(response.data);
                setHasSearched(true);
                setPage(0);
                if (response.data.length === 0) {
                    toast.info("No matching records found.");
                } else {
                    toast.success(`Found ${response.data.length} records.`);
                }
            }
        } catch (error) {
            console.error("Error fetching therapy sessions:", error);
            toast.error("Failed to fetch therapy records.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStartDate("");
        setEndDate("");
        setDoctorId("");
        setTherapyName("");
        setSubTherapy("");
        setSessions([]);
        setHasSearched(false);
        setPage(0);
    };

    const handleExportExcel = () => {
        try {
            const queryParams = new URLSearchParams({
                dateFrom: startDate,
                dateTo: endDate,
                doctorId,
                therapyName,
                subTherapy,
                format: "excel"
            }).toString();

            // Construct the download URL
            const url = `${getApiUrl("therapist-sessions/treatment-list")}?${queryParams}`;

            // Trigger download by opening in a new window/tab
            window.open(url, "_blank");
            toast.info("Generating Excel report. Your download should start shortly.");
        } catch (error) {
            console.error("Error exporting excel:", error);
            toast.error("Failed to export Excel report.");
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed": return "success";
            case "In Progress": return "primary";
            case "Scheduled": return "info";
            case "Pending": return "warning";
            case "Cancelled": return "error";
            default: return "default";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Heading */}
            <HeadingCard
                category="FINANCIAL REPORTS"
                title="Therapy Reports"
                subtitle="Track and analyze therapy-related transactions"
            />

            {/* ⭐ Filters Panel */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: "1px solid #e0e0e0" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                    <FilterAltIcon color="primary" />
                    <Typography variant="h6" fontWeight="600">Filter Sessions</Typography>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField
                            fullWidth
                            select
                            label="Doctor"
                            value={doctorId}
                            onChange={(e) => setDoctorId(e.target.value)}
                        >
                            <MenuItem value="">All Doctors</MenuItem>
                            {doctors.map((doc) => (
                                <MenuItem key={doc._id} value={doc._id}>
                                    {`Dr. ${doc.user?.name || "N/A"}`}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField
                            fullWidth
                            select
                            label="Therapy"
                            value={therapyName}
                            onChange={(e) => setTherapyName(e.target.value)}
                        >
                            <MenuItem value="">All Therapies</MenuItem>
                            {therapies.map((t) => (
                                <MenuItem key={t._id} value={t.therapyName}>
                                    {t.therapyName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={12} md={2.4}>
                        <TextField
                            fullWidth
                            select
                            label="Sub-Therapy"
                            value={subTherapy}
                            onChange={(e) => setSubTherapy(e.target.value)}
                        >
                            <MenuItem value="">All Sub-Therapies</MenuItem>
                            {subTherapies.map((st) => (
                                <MenuItem key={st._id} value={st.name}>
                                    {st.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<RestartAltIcon />}
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<FileDownloadIcon />}
                            onClick={handleExportExcel}
                            disabled={loading || sessions.length === 0}
                            sx={{ color: "white" }}
                        >
                            Excel Report
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                            onClick={handleSearch}
                            disabled={loading}
                            sx={{ backgroundColor: "var(--color-btn-bg)", "&:hover": { backgroundColor: "var(--color-btn-hover)" } }}
                        >
                            {loading ? "Searching..." : "Search"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* ⭐ Results Section */}
            {hasSearched ? (
                <Box>
                    <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                        <GroupsIcon color="primary" />
                        <Typography variant="h6" fontWeight="600">Therapy Sessions ({sessions.length})</Typography>
                    </Box>

                    <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #e0e0e0", overflow: "hidden" }}>
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: "700" }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: "700" }}>Therapy</TableCell>
                                        <TableCell sx={{ fontWeight: "700" }}>Sub-Therapy</TableCell>
                                        <TableCell sx={{ fontWeight: "700" }}>Therapist</TableCell>
                                        <TableCell sx={{ fontWeight: "700" }}>Prescribed By</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: "700" }}>Count</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
                                        <TableRow key={`${row._id}-${idx}`} hover>
                                            <TableCell>{row._dateKey}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.treatmentName || "Unknown"}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ fontWeight: "600" }}
                                                />
                                            </TableCell>
                                            <TableCell>{row.subTherapy || "N/A"}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="secondary" fontWeight="600">
                                                    {row.therapistName || "Not Assigned"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{(row.doctorName && row.doctorName !== "N/A") ? row.doctorName : "Walk-in Patients"}</TableCell>
                                            <TableCell align="right">
                                                {row.count > 1 ? (
                                                    <Chip
                                                        label={`× ${row.count}`}
                                                        size="small"
                                                        color="warning"
                                                        sx={{ fontWeight: "700" }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="× 1"
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontWeight: "600" }}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={displayRows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </Box>
            ) : (
                <Box sx={{ textAlign: "center", py: 10, border: "2px dashed #e0e0e0", borderRadius: 4 }}>
                    <CalendarTodayIcon sx={{ fontSize: 60, color: "#ccc", mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">Select filters and click search to view records</Typography>
                </Box>
            )}
        </Box>
    );
}

export default TherapyReportsView;