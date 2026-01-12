import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, Typography, Button, Card, CardContent, Grid, Chip, Divider, CircularProgress, Alert } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import axios from "axios";
import { useEffect, useState } from "react";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { toast } from "react-toastify";

function PatientTherapyDetailsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("sessionId");

    const [progressData, setProgressData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProgress = async () => {
        if (!sessionId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl(`therapist-sessions/${sessionId}/progress`),
                { headers: getAuthHeaders() }
            );
            if (response.data.success) {
                setProgressData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching progress:", error);
            setError("Failed to load therapy progress details.");
            toast.error("Failed to load details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, [sessionId]);

    const session = progressData;


    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const getStatusBadgeClass = (status) => {
        const statusLower = status?.toLowerCase() || "";
        if (statusLower.includes("completed")) return "bg-success";
        if (statusLower.includes("in progress")) return "bg-info";
        if (statusLower.includes("scheduled")) return "bg-primary";
        if (statusLower.includes("pending")) return "bg-warning";
        if (statusLower.includes("cancelled")) return "bg-danger";
        return "bg-secondary";
    };

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase() || "";
        if (statusLower.includes("completed")) return "#28a745";
        if (statusLower.includes("in progress")) return "#0dcaf0";
        if (statusLower.includes("scheduled")) return "#8B5CF6";
        if (statusLower.includes("pending")) return "#ffc107";
        if (statusLower.includes("cancelled")) return "#dc3545";
        return "#6c757d";
    };

    const getStatusIcon = (status) => {
        const statusLower = status?.toLowerCase() || "";
        if (statusLower.includes("completed")) return <CheckCircleIcon fontSize="small" />;
        if (statusLower.includes("in progress")) return <PlayArrowIcon fontSize="small" />;
        if (statusLower.includes("pending")) return <PendingIcon fontSize="small" />;
        return null;
    };

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title={`Therapy Details: ${session?.patientName || "Loading..."}`}
                subtitle={`Treatment: ${session?.treatmentName || ""}`}
                breadcrumbItems={[
                    { label: "Home", url: "/" },
                    { label: "Therapist", url: "/therapist/dashboard" },
                    { label: "Therapy Progress", url: "/therapist/therapy-progress" },
                    { label: "Therapy Details" },
                ]}
            />

            {/* Back Button */}
            <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-start" }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        px: 3,
                    }}
                >
                    Back to Therapy Progress
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : !session ? (
                <Alert severity="info">No session details found.</Alert>
            ) : (
                <>
                    {/* Patient Info Card */}
                    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <PersonIcon color="primary" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Patient Name
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {session.patientName}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <LocalHospitalIcon color="primary" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Treatment
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {session.treatmentName}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CalendarMonthIcon color="primary" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Timeline
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {session.timeline} ({session.daysOfTreatment} Days)
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <AccessTimeIcon color="primary" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Progress
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {session.completed} / {session.total} Completed
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Sessions List */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Session Schedule & Progress
                        </Typography>
                        {session.slots && session.slots.length > 0 ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {session.slots.map((slot, index) => (
                                    <Card
                                        key={index}
                                        sx={{
                                            borderRadius: 2,
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                            borderLeft: `4px solid ${slot.isCompleted ? "#28a745" : "#ffc107"}`,
                                        }}
                                    >
                                        <CardContent sx={{ py: "12px !important" }}>
                                            <Grid container alignItems="center" spacing={2}>
                                                <Grid item xs={12} sm={4}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <CalendarMonthIcon fontSize="small" color="action" />
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {formatDate(slot.date)}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <AccessTimeIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {slot.timeLabel}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={4} sx={{ textAlign: "right" }}>
                                                    <Chip
                                                        label={slot.isCompleted ? "Completed" : "Planned"}
                                                        size="small"
                                                        color={slot.isCompleted ? "success" : "warning"}
                                                        variant={slot.isCompleted ? "filled" : "outlined"}
                                                        icon={slot.isCompleted ? <CheckCircleIcon /> : <PendingIcon />}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        ) : (
                            <Alert severity="info">No slots calculated for this session.</Alert>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
}

export default PatientTherapyDetailsPage;
