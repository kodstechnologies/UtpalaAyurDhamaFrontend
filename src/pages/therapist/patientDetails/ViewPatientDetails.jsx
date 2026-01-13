import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, Typography, Button, Card, CardContent, LinearProgress, CircularProgress } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import PendingIcon from "@mui/icons-material/Pending";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function ViewPatientDetailsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [session, setSession] = useState(location.state?.session || null);
    const [isLoading, setIsLoading] = useState(!session);

    const sessionId = searchParams.get("sessionId");

    useEffect(() => {
        const fetchSessionDetails = async () => {
            if (session || !sessionId) return;

            setIsLoading(true);
            try {
                const response = await axios.get(
                    getApiUrl(`therapist-sessions/${sessionId}`),
                    { headers: getAuthHeaders() }
                );
                if (response.data.success) {
                    setSession(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching session details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessionDetails();
    }, [sessionId, session]);

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!session) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" color="error">Session details not found</Typography>
                <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>Back</Button>
            </Box>
        );
    }

    const completedSessions = session.days?.filter(d => d.completed).length || 0;
    const progress = Math.round((completedSessions / (session.daysOfTreatment || 1)) * 100);

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
        switch (status) {
            case "Completed": return "bg-success";
            case "In Progress": return "bg-primary";
            case "Scheduled": return "bg-info";
            case "Pending": return "bg-warning";
            default: return "bg-secondary";
        }
    };

    return (
        <div>
            <HeadingCard
                title={`Patient Details: ${session.patient?.user?.name || "Unknown"}`}
                subtitle="View complete patient information and therapy sessions"
                breadcrumbItems={[
                    { label: "Therapist", url: "/therapist/dashboard" },
                    { label: "Patient Monitoring", url: "/therapist/patient-monitoring" },
                    { label: "Patient Details" },
                ]}
            />

            <Box sx={{ mt: 2 }}>
                {/* Patient Information Card */}
                <Card sx={{ mb: 3, borderRadius: "12px" }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Patient Name
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {session.patient?.user?.name || "Unknown"}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    UHID
                                </Typography>
                                <Typography variant="body1">
                                    {session.patient?.user?.uhid || "N/A"}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Therapy / Diagnosis
                                </Typography>
                                <Typography variant="body1">
                                    <span
                                        style={{
                                            display: "inline-block",
                                            padding: "4px 10px",
                                            borderRadius: "50px",
                                            fontSize: "0.75rem",
                                            backgroundColor: "#0dcaf0",
                                            color: "white",
                                        }}
                                    >
                                        {session.treatmentName || "N/A"}
                                    </span>
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Consulting Doctor
                                </Typography>
                                <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <LocalHospitalIcon fontSize="small" />
                                    {session.examination?.doctor?.user?.name || "N/A"}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Status
                                </Typography>
                                <Typography variant="body1">
                                    <span
                                        className={`badge ${getStatusBadgeClass(session.status)}`}
                                        style={{
                                            borderRadius: "50px",
                                            padding: "4px 10px",
                                            fontSize: "0.75rem",
                                        }}
                                    >
                                        {session.status}
                                    </span>
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Total Sessions
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {session.daysOfTreatment}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Completed Sessions
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {completedSessions}
                                </Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                                    Progress
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{
                                            flex: 1,
                                            height: 12,
                                            borderRadius: 1,
                                        }}
                                    />
                                    <Typography variant="body2" fontWeight={600} sx={{ minWidth: "50px" }}>
                                        {progress}%
                                    </Typography>
                                </Box>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Session Date / Time
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(session.sessionDate)} {session.sessionTime && `at ${session.sessionTime}`}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Sessions List */}
                {session.days && session.days.length > 0 && (
                    <Card sx={{ borderRadius: "12px" }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                Session History
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {session.days.map((day, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            border: "1px solid",
                                            borderColor:
                                                day.completed
                                                    ? "#28a745"
                                                    : "#ffc107",
                                            bgcolor:
                                                day.completed
                                                    ? "#f8fff9"
                                                    : "#fffbf0",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: "50%",
                                                        bgcolor:
                                                            day.completed
                                                                ? "#28a745"
                                                                : "#ffc107",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: "white",
                                                        fontWeight: 600,
                                                        fontSize: "0.875rem",
                                                    }}
                                                >
                                                    {index + 1}
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Session {index + 1}
                                                    </Typography>
                                                    <Box sx={{ display: "flex", gap: 2, mt: 0.5, fontSize: "0.875rem" }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                            <CalendarTodayIcon fontSize="small" />
                                                            {formatDate(day.date)}
                                                        </Typography>
                                                        {day.time && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                                <AccessTimeIcon fontSize="small" />
                                                                {day.time}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: "50px",
                                                    bgcolor: day.completed ? "#28a745" : "#ffc107",
                                                    color: "white",
                                                }}
                                            >
                                                {day.completed ? (
                                                    <><CheckCircleIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} /> Completed</>
                                                ) : (
                                                    <><PendingIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} /> Pending</>
                                                )}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </Box>
            </Box>
        </div>
    );
}

export default ViewPatientDetailsPage;

