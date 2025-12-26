import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, Typography, Button, Card, CardContent, LinearProgress } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import PendingIcon from "@mui/icons-material/Pending";

function ViewPatientDetailsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // In a real app, you'd fetch this data based on patientId
    // For now, we'll use URL params or localStorage
    const patientId = searchParams.get("patientId") || "";
    
    // Mock data - in real app, fetch from API
    const selectedPatient = {
        patientName: searchParams.get("patientName") || "Unknown",
        patientId: patientId || "N/A",
        age: searchParams.get("age") || "N/A",
        gender: searchParams.get("gender") || "N/A",
        diagnosis: searchParams.get("diagnosis") || "N/A",
        doctor: searchParams.get("doctor") || "N/A",
        status: searchParams.get("status") || "Active",
        totalSessions: parseInt(searchParams.get("totalSessions") || "0"),
        completedSessions: parseInt(searchParams.get("completedSessions") || "0"),
        lastSessionDate: searchParams.get("lastSessionDate") || "N/A",
        sessions: [], // Would be fetched from API
    };

    const calculateProgress = (completed, total) => {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === "N/A") return "N/A";
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
        if (statusLower.includes("active")) return "bg-success";
        if (statusLower.includes("pending")) return "bg-warning";
        if (statusLower.includes("completed")) return "bg-info";
        return "bg-secondary";
    };

    const progress = calculateProgress(selectedPatient.completedSessions, selectedPatient.totalSessions);

    return (
        <div>
            <HeadingCard
                title={`Patient Details: ${selectedPatient.patientName}`}
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
                                    {selectedPatient.patientName}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Patient ID
                                </Typography>
                                <Typography variant="body1">
                                    {selectedPatient.patientId}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Age / Gender
                                </Typography>
                                <Typography variant="body1">
                                    {selectedPatient.age} / {selectedPatient.gender}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Diagnosis
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
                                        {selectedPatient.diagnosis}
                                    </span>
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Consulting Doctor
                                </Typography>
                                <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <LocalHospitalIcon fontSize="small" />
                                    {selectedPatient.doctor}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Status
                                </Typography>
                                <Typography variant="body1">
                                    <span
                                        className={`badge ${getStatusBadgeClass(selectedPatient.status)}`}
                                        style={{
                                            borderRadius: "50px",
                                            padding: "4px 10px",
                                            fontSize: "0.75rem",
                                        }}
                                    >
                                        {selectedPatient.status}
                                    </span>
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Total Sessions
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {selectedPatient.totalSessions}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Completed Sessions
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {selectedPatient.completedSessions}
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
                                    Last Session
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(selectedPatient.lastSessionDate)}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Sessions List */}
                {selectedPatient.sessions && selectedPatient.sessions.length > 0 && (
                    <Card sx={{ borderRadius: "12px" }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                Therapy Sessions
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {selectedPatient.sessions.map((session, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            border: "1px solid",
                                            borderColor:
                                                session.status === "Completed"
                                                    ? "#28a745"
                                                    : session.status === "Scheduled"
                                                    ? "#0dcaf0"
                                                    : "#ffc107",
                                            bgcolor:
                                                session.status === "Completed"
                                                    ? "#f8fff9"
                                                    : session.status === "Scheduled"
                                                    ? "#f0f9ff"
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
                                                            session.status === "Completed"
                                                                ? "#28a745"
                                                                : session.status === "Scheduled"
                                                                ? "#0dcaf0"
                                                                : "#ffc107",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: "white",
                                                        fontWeight: 600,
                                                        fontSize: "0.875rem",
                                                    }}
                                                >
                                                    {session.sessionNumber}
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Session {session.sessionNumber}: {session.therapyType}
                                                    </Typography>
                                                    <Box sx={{ display: "flex", gap: 2, mt: 0.5, fontSize: "0.875rem" }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                            <CalendarTodayIcon fontSize="small" />
                                                            {formatDate(session.date)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                            <AccessTimeIcon fontSize="small" />
                                                            {session.time}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Duration: {session.duration}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: "50px",
                                                    bgcolor:
                                                        session.status === "Completed"
                                                            ? "#28a745"
                                                            : session.status === "Scheduled"
                                                            ? "#0dcaf0"
                                                            : "#ffc107",
                                                    color: "white",
                                                }}
                                            >
                                                {session.status === "Completed" && <CheckCircleIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />}
                                                {session.status === "Scheduled" && <RadioButtonUncheckedIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />}
                                                {session.status === "Pending" && <PendingIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />}
                                                {session.status}
                                            </Typography>
                                        </Box>
                                        {session.notes && (
                                            <Box
                                                sx={{
                                                    mt: 1,
                                                    p: 1,
                                                    borderRadius: 1,
                                                    bgcolor: "rgba(255,255,255,0.7)",
                                                    fontSize: "0.875rem",
                                                }}
                                            >
                                                <strong>Notes:</strong> {session.notes}
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Close
                    </Button>
                </Box>
            </Box>
        </div>
    );
}

export default ViewPatientDetailsPage;

