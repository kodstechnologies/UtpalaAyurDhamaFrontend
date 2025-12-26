import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, Typography, Button, Card, CardContent, Grid, Chip, Divider } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";

function PatientTherapyDetailsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientName = searchParams.get("patientName") || "";
    const date = searchParams.get("date") || "";

    // Helper function to get date string
    const getDateString = (daysFromToday) => {
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() + daysFromToday);
        return dateObj.toISOString().split("T")[0];
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    // Mock sessions data - matching the therapy progress page
    const allSessions = [
        {
            id: "1",
            patientName: "Sumitra Devi",
            treatmentName: "Shirodhara",
            date: getDateString(-2),
            startTime: "10:00",
            endTime: "11:00",
            status: "Completed",
            flowType: "Outpatient",
            notes: "Patient felt relaxed post-session. Good response to treatment.",
            therapist: "Dr. Aisha Patel",
            duration: "60 minutes",
        },
        {
            id: "2",
            patientName: "Rajesh Kumar",
            treatmentName: "Abhyangam",
            date: getDateString(-1),
            startTime: "11:00",
            endTime: "12:00",
            status: "Completed",
            flowType: "Inpatient",
            notes: "Patient showed improvement in mobility.",
            therapist: "Dr. Aisha Patel",
            duration: "60 minutes",
        },
        {
            id: "3",
            patientName: "Anil Gupta",
            treatmentName: "Pizhichil",
            date: getTodayDate(),
            startTime: "14:00",
            endTime: "15:00",
            status: "In Progress",
            flowType: "Outpatient",
            notes: "Session currently ongoing.",
            therapist: "Dr. Aisha Patel",
            duration: "60 minutes",
        },
        {
            id: "4",
            patientName: "Meera Desai",
            treatmentName: "Shirodhara",
            date: getDateString(1),
            startTime: "09:00",
            endTime: "10:00",
            status: "Scheduled",
            flowType: "Inpatient",
            notes: "",
            therapist: "Dr. Aisha Patel",
            duration: "60 minutes",
        },
        {
            id: "5",
            patientName: "Vijay Rathod",
            treatmentName: "Abhyangam",
            date: getDateString(1),
            startTime: "10:30",
            endTime: "11:30",
            status: "Scheduled",
            flowType: "Outpatient",
            notes: "",
            therapist: "Dr. Aisha Patel",
            duration: "60 minutes",
        },
        {
            id: "6",
            patientName: "Geeta Kapoor",
            treatmentName: "Pizhichil",
            date: getDateString(1),
            startTime: "15:00",
            endTime: "16:00",
            status: "Pending",
            flowType: "Inpatient",
            notes: "",
            therapist: "Dr. Aisha Patel",
            duration: "60 minutes",
        },
        {
            id: "7",
            patientName: "Priya Sharma",
            treatmentName: "Shirodhara",
            date: getDateString(2),
            startTime: "10:00",
            endTime: "11:00",
            status: "Scheduled",
            flowType: "Outpatient",
            notes: "",
            therapist: "Dr. Aisha Patel",
            duration: "60 minutes",
        },
        {
            id: "8",
            patientName: "Ravi Patel",
            treatmentName: "Abhyangam",
            date: getDateString(3),
            startTime: "11:00",
            endTime: "12:00",
            status: "Scheduled",
            flowType: "Inpatient",
            notes: "",
            therapist: "Dr. Aisha Patel",
            duration: "60 minutes",
        },
        {
            id: "9",
            patientName: "Sunita Reddy",
            treatmentName: "Pizhichil",
            date: getDateString(4),
            startTime: "14:00",
            endTime: "15:00",
            status: "Pending",
            flowType: "Outpatient",
            notes: "",
            therapist: "Dr. Aisha Patel",
            duration: "60 minutes",
        },
        {
            id: "10",
            patientName: "Kiran Desai",
            treatmentName: "Shirodhara",
            date: getDateString(5),
            startTime: "09:00",
            endTime: "10:00",
            status: "Scheduled",
            flowType: "Inpatient",
            notes: "",
            therapist: "Dr. Aisha Patel",
            duration: "60 minutes",
        },
    ];

    // Filter sessions based on patientName and date from URL params
    const patientDaySessions = allSessions.filter(
        (session) =>
            session.patientName === patientName && session.date === date
    );

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
                title={`Therapy Details: ${patientName || "Unknown Patient"}`}
                subtitle={`Date: ${formatDate(date)}`}
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

            {/* Patient Info Card */}
            {patientName && (
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
                                            {patientName}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <CalendarMonthIcon color="primary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Session Date
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {formatDate(date)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <LocalHospitalIcon color="primary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Flow Type
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {patientDaySessions.length > 0 ? patientDaySessions[0].flowType : "N/A"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <AccessTimeIcon color="primary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Total Sessions
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {patientDaySessions.length}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Sessions List */}
            <Box sx={{ mt: 2 }}>
                {patientDaySessions.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {patientDaySessions.map((session) => (
                            <Card
                                key={session.id}
                                sx={{
                                    borderRadius: 2,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    borderLeft: `4px solid ${getStatusColor(session.status)}`,
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" fontWeight={600} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                                {session.treatmentName}
                                                <Chip
                                                    label={session.flowType}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: session.flowType === "Inpatient" ? "#e3f2fd" : "#f3e5f5",
                                                        color: session.flowType === "Inpatient" ? "#1976d2" : "#7b1fa2",
                                                        fontSize: "0.7rem",
                                                        height: "20px",
                                                    }}
                                                />
                                            </Typography>
                                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <AccessTimeIcon fontSize="small" color="action" />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                Time
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {session.startTime} - {session.endTime}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <AccessTimeIcon fontSize="small" color="action" />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                Duration
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {session.duration}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <PersonIcon fontSize="small" color="action" />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                Therapist
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {session.therapist}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <CalendarMonthIcon fontSize="small" color="action" />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                Date
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {formatDate(session.date)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        <Chip
                                            label={session.status}
                                            icon={getStatusIcon(session.status)}
                                            className={getStatusBadgeClass(session.status)}
                                            sx={{
                                                borderRadius: "50px",
                                                px: 1.5,
                                                py: 0.5,
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                height: "auto",
                                            }}
                                        />
                                    </Box>
                                    {session.notes && (
                                        <>
                                            <Divider sx={{ my: 2 }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                                    Session Notes
                                                </Typography>
                                                <Typography variant="body2" sx={{ 
                                                    p: 1.5, 
                                                    bgcolor: "rgba(0,0,0,0.02)", 
                                                    borderRadius: 1,
                                                    fontStyle: session.notes ? "normal" : "italic",
                                                    color: session.notes ? "text.primary" : "text.secondary"
                                                }}>
                                                    {session.notes || "No notes available for this session."}
                                                </Typography>
                                            </Box>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                ) : (
                    <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        <CardContent>
                            <Box sx={{ textAlign: "center", py: 5 }}>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    No therapy sessions found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {patientName && date
                                        ? `No sessions found for ${patientName} on ${formatDate(date)}.`
                                        : "Please select a patient and date to view sessions."}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Box>
    );
}

export default PatientTherapyDetailsPage;
