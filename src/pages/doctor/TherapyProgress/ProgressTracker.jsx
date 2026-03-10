import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    Divider,
    CircularProgress,
    IconButton,
    Paper,
    Avatar,
    Stack
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

function ProgressTracker() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [progressData, setProgressData] = useState(null);

    const fetchProgress = async () => {
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
            toast.error("Failed to load therapy progress details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (sessionId) {
            fetchProgress();
        }
    }, [sessionId]);

    const breadcrumbItems = [
        { label: "Doctor", url: "/doctor/dashboard" },
        { label: "Therapies", url: "/doctor/opd-therapies" },
        { label: "Therapy Progress Tracker" },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (!progressData) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h5" color="error" gutterBottom>Therapy session data not found</Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>The requested session may not exist or has been removed.</Typography>
                <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Go Back</Button>
            </Box>
        );
    }

    const { patientName, treatmentName, completed, total, slots, therapistName } = progressData;
    const progressPercent = Math.round((completed / total) * 100);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", margin: "0 auto" }}>
            <Breadcrumb items={breadcrumbItems} />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, mt: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ color: "#2D3748", mb: 1 }}>
                        Therapy Progress Tracker
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Monitoring execution status for <b>{patientName || "the patient"}</b>'s {treatmentName} plan.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ borderRadius: "12px", textTransform: "none", px: 3, borderColor: "#CBD5E0", color: "#4A5568" }}
                >
                    Back to List
                </Button>
            </Box>

            <Grid container spacing={4}>
                {/* Progress Overview Card */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: "24px",
                            background: "linear-gradient(135deg, #2D3748 0%, #4A5568 100%)",
                            color: "white",
                            height: "100%",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        <Box sx={{ position: "relative", zIndex: 1 }}>
                            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>Execution Status</Typography>
                            <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
                                <CircularProgress
                                    variant="determinate"
                                    value={progressPercent}
                                    size={120}
                                    thickness={6}
                                    sx={{ color: "rgba(255,255,255,0.15)" }}
                                />
                                <CircularProgress
                                    variant="determinate"
                                    value={progressPercent}
                                    size={120}
                                    thickness={6}
                                    sx={{
                                        color: "white",
                                        position: "absolute",
                                        left: 0,
                                        "& .MuiCircularProgress-circle": { strokeLinecap: "round" }
                                    }}
                                />
                                <Box
                                    sx={{
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                        position: "absolute",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Typography variant="h5" fontWeight={700}>
                                        {progressPercent}%
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <b>{completed}</b> of <b>{total}</b> sessions completed
                            </Typography>
                            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />
                            <Box sx={{ display: "flex", gap: 3 }}>
                                <Box>
                                    <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>REMAINING</Typography>
                                    <Typography variant="h6" fontWeight={700}>{total - completed}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>MASTER STATUS</Typography>
                                    <Typography variant="h6" fontWeight={700}>{progressData.status}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Information Grid */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", height: "100%", border: "1px solid #E2E8F0" }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Treatment Details</Typography>
                            <Grid container spacing={4}>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: "#EBF8FF", color: "#3182CE" }}>
                                            <PersonIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">PATIENT</Typography>
                                            <Typography variant="body1" fontWeight={600}>{patientName}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: "#F0FFF4", color: "#38A169" }}>
                                            <LocalHospitalIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">THERAPIST</Typography>
                                            <Typography variant="body1" fontWeight={600}>{therapistName || "Not Assigned"}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: "#FAF5FF", color: "#805AD5" }}>
                                            <CalendarMonthIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">TREATMENT</Typography>
                                            <Typography variant="body1" fontWeight={600}>{treatmentName}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: "#FFF5F5", color: "#E53E3E" }}>
                                            <AccessTimeIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">SCHEDULE</Typography>
                                            <Typography variant="body1" fontWeight={600}>{progressData.timeline}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Session Timeline */}
                <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <Typography variant="h5" fontWeight={700}>Complete Session Log</Typography>
                            <Chip label={`${completed} Sessions Recorded`} color="success" variant="outlined" sx={{ fontWeight: 600 }} />
                        </Stack>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {slots.map((slot, index) => (
                                <Card
                                    key={index}
                                    sx={{
                                        borderRadius: "20px",
                                        border: "1px solid #E2E8F0",
                                        background: slot.isCompleted ? "#F7FAFC" : "white",
                                        boxShadow: "none",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    <CardContent sx={{ py: "16px !important", px: 4 }}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={12} sm={1}>
                                                <Box
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: "10px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        bgcolor: slot.isCompleted ? "#48BB78" : "#EDF2F7",
                                                        color: slot.isCompleted ? "white" : "#718096"
                                                    }}
                                                >
                                                    <Typography fontWeight={700} variant="body2">{index + 1}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <Box sx={{ ml: { sm: 2 } }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>SCHEDULED DATE</Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {new Date(slot.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>TIME SLOT</Typography>
                                                    <Typography variant="body2" sx={{ color: "#4A5568" }}>{slot.timeLabel}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4} sx={{ textAlign: "right" }}>
                                                <Chip
                                                    size="small"
                                                    icon={slot.isCompleted ? <CheckCircleIcon fontSize="small" /> : <PendingActionsIcon fontSize="small" />}
                                                    label={slot.isCompleted ? "Fully Executed" : "Pending"}
                                                    sx={{
                                                        bgcolor: slot.isCompleted ? "#F0FFF4" : "#FFFBEB",
                                                        color: slot.isCompleted ? "#2F855A" : "#D69E2E",
                                                        border: `1px solid ${slot.isCompleted ? "#C6F6D5" : "#FEFCBF"}`,
                                                        fontWeight: 600,
                                                        px: 1
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

export default ProgressTracker;
