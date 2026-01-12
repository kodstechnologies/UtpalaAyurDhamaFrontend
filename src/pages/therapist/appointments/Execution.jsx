import { useState, useEffect, useRef } from "react";
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
    Paper,
    Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import HistoryIcon from "@mui/icons-material/History";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

function Execution() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [progressData, setProgressData] = useState(null);
    const [updatingSlot, setUpdatingSlot] = useState(null);
    const checkIntervalRef = useRef(null); // Store interval for auto-start/auto-complete checks

    const fetchProgress = async () => {
        setIsLoading(true);
        try {
            // Fetch both progress data and session data to get sessionTime
            const [progressResponse, sessionResponse] = await Promise.all([
                axios.get(getApiUrl(`therapist-sessions/${id}/progress`), { headers: getAuthHeaders() }),
                axios.get(getApiUrl(`therapist-sessions/${id}`), { headers: getAuthHeaders() })
            ]);

            if (progressResponse.data.success && sessionResponse.data.success) {
                const progressData = progressResponse.data.data;
                const sessionData = sessionResponse.data.data;
                // Add sessionTime to progressData for easier access
                progressData.sessionTime = sessionData.sessionTime || "10:00";
                setProgressData(progressData);
                // Check for auto-start and auto-complete after fetching
                checkAutoStartAndComplete(progressData);
            }
        } catch (error) {
            console.error("Error fetching progress:", error);
            toast.error("Failed to load session details");
        } finally {
            setIsLoading(false);
        }
    };

    // Check if sessions should be auto-started or auto-completed based on scheduled time
    const checkAutoStartAndComplete = async (data) => {
        if (!data || !data.slots) return;

        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        // Get session time (format: "10:00" or "10:30")
        const sessionTime = data.sessionTime || "10:00";
        const timeParts = sessionTime.split(":");
        const scheduledHour = parseInt(timeParts[0] || 10, 10);
        const scheduledMinute = parseInt(timeParts[1] || 0, 10);

        for (const slot of data.slots) {
            const slotDate = new Date(slot.date);
            slotDate.setHours(0, 0, 0, 0);
            
            // Get the day record for this slot
            const dayRecord = data.days?.find(day => {
                const dayDate = new Date(day.date);
                dayDate.setHours(0, 0, 0, 0);
                return dayDate.getTime() === slotDate.getTime();
            });

            // Skip if already completed
            if (dayRecord?.completed || slot.isCompleted) continue;

            // Check if scheduled date has passed (auto-complete)
            if (slotDate.getTime() < today.getTime()) {
                await handleAutoComplete(slot, data);
            }
            // Check if scheduled date is today and time has arrived (auto-start)
            else if (slotDate.getTime() === today.getTime()) {
                const scheduledDateTime = new Date(slotDate);
                scheduledDateTime.setHours(scheduledHour, scheduledMinute, 0, 0);
                
                // If current time >= scheduled time and not started, auto-start
                if (now >= scheduledDateTime && !dayRecord?.startTime) {
                    await handleAutoStart(slot, data);
                }
            }
        }
    };

    useEffect(() => {
        fetchProgress();
        
        // Set up periodic check every minute for auto-start/auto-complete
        checkIntervalRef.current = setInterval(() => {
            if (progressData) {
                checkAutoStartAndComplete(progressData);
            }
        }, 60000); // Check every minute

        // Cleanup interval on unmount
        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, [id]);

    // Update interval when progressData changes
    useEffect(() => {
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
        }

        if (progressData) {
            checkIntervalRef.current = setInterval(() => {
                checkAutoStartAndComplete(progressData);
            }, 60000);
        }

        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, [progressData]);

    const handleAutoStart = async (slot, dataToUse = null) => {
        try {
            let currentData = dataToUse;
            if (!currentData) {
                const response = await axios.get(
                    getApiUrl(`therapist-sessions/${id}/progress`),
                    { headers: getAuthHeaders() }
                );
                if (!response.data.success) return;
                currentData = response.data.data;
            }

            const currentDays = currentData.days || [];
            const slotDate = new Date(slot.date);
            slotDate.setHours(0, 0, 0, 0);
            const now = new Date();

            let dayUpdated = false;
            const updatedDays = currentDays.map(day => {
                const dayDate = new Date(day.date);
                dayDate.setHours(0, 0, 0, 0);
                if (dayDate.getTime() === slotDate.getTime()) {
                    dayUpdated = true;
                    return {
                        ...day,
                        startTime: now,
                        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                        completed: false
                    };
                }
                return day;
            });

            if (!dayUpdated) {
                updatedDays.push({
                    date: slot.date,
                    startTime: now,
                    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                    completed: false
                });
            }

            const response = await axios.patch(
                getApiUrl(`therapist-sessions/${id}`),
                {
                    days: updatedDays,
                    status: "In Progress"
                },
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success(`Session automatically started`);
                fetchProgress();
            }
        } catch (error) {
            console.error("Error auto-starting session:", error);
        }
    };

    const handleAutoComplete = async (slot, dataToUse = null) => {
        try {
            let currentData = dataToUse;
            if (!currentData) {
                const response = await axios.get(
                    getApiUrl(`therapist-sessions/${id}/progress`),
                    { headers: getAuthHeaders() }
                );
                if (!response.data.success) return;
                currentData = response.data.data;
            }
            
            const currentDays = currentData.days || [];
            const slotDate = new Date(slot.date);
            slotDate.setHours(0, 0, 0, 0);

            let dayUpdated = false;
            const updatedDays = currentDays.map(day => {
                const dayDate = new Date(day.date);
                dayDate.setHours(0, 0, 0, 0);
                if (dayDate.getTime() === slotDate.getTime()) {
                    dayUpdated = true;
                    const now = new Date();
                    return {
                        ...day,
                        completed: true,
                        endTime: day.endTime || now,
                        time: day.time || ""
                    };
                }
                return day;
            });

            if (!dayUpdated) {
                const now = new Date();
                updatedDays.push({
                    date: slot.date,
                    completed: true,
                    startTime: now,
                    endTime: now,
                    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                });
            }

            const updateResponse = await axios.patch(
                getApiUrl(`therapist-sessions/${id}`),
                {
                    days: updatedDays,
                    status: currentData.completed + 1 >= currentData.total ? "Completed" : currentData.status
                },
                { headers: getAuthHeaders() }
            );

            if (updateResponse.data.success) {
                toast.success(`Session automatically completed`);
                fetchProgress();
            }
        } catch (error) {
            console.error("Error auto-completing session:", error);
        }
    };

    const handleStartSession = async (slot) => {
        setUpdatingSlot(slot.dateLabel);
        try {
            const currentDays = progressData.days || [];
            const slotDate = new Date(slot.date);
            slotDate.setHours(0, 0, 0, 0);
            const now = new Date();

            let dayUpdated = false;
            let updatedDays = currentDays.map(day => {
                const dayDate = new Date(day.date);
                dayDate.setHours(0, 0, 0, 0);
                if (dayDate.getTime() === slotDate.getTime()) {
                    dayUpdated = true;
                    return {
                        ...day,
                        startTime: now,
                        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                        completed: false
                    };
                }
                return day;
            });

            if (!dayUpdated) {
                updatedDays.push({
                    date: slot.date,
                    startTime: now,
                    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                    completed: false
                });
            }

            const response = await axios.patch(
                getApiUrl(`therapist-sessions/${id}`),
                {
                    days: updatedDays,
                    status: "In Progress"
                },
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success(`Session started`);
                fetchProgress();
            }
        } catch (error) {
            console.error("Error starting session:", error);
            toast.error("Failed to start session");
        } finally {
            setUpdatingSlot(null);
        }
    };

    const handleStopSession = async (slot) => {
        setUpdatingSlot(slot.dateLabel);
        try {
            const currentDays = progressData.days || [];
            const slotDate = new Date(slot.date);
            slotDate.setHours(0, 0, 0, 0);
            const now = new Date();

            const updatedDays = currentDays.map(day => {
                const dayDate = new Date(day.date);
                dayDate.setHours(0, 0, 0, 0);
                if (dayDate.getTime() === slotDate.getTime()) {
                    return {
                        ...day,
                        completed: true,
                        endTime: now,
                        time: day.time || ""
                    };
                }
                return day;
            });

            const response = await axios.patch(
                getApiUrl(`therapist-sessions/${id}`),
                {
                    days: updatedDays,
                    status: progressData.completed + 1 >= progressData.total ? "Completed" : progressData.status
                },
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success(`Session stopped and marked as complete`);
                fetchProgress();
            }
        } catch (error) {
            console.error("Error stopping session:", error);
            toast.error("Failed to stop session");
        } finally {
            setUpdatingSlot(null);
        }
    };

    const handleToggleComplete = async (slot) => {
        setUpdatingSlot(slot.dateLabel);
        try {
            const currentDays = progressData.days || [];
            const slotDate = new Date(slot.date);
            slotDate.setHours(0, 0, 0, 0);

            let dayUpdated = false;
            let updatedDays = currentDays.map(day => {
                const dayDate = new Date(day.date);
                dayDate.setHours(0, 0, 0, 0);
                if (dayDate.getTime() === slotDate.getTime()) {
                    dayUpdated = true;
                    // Toggle the completed status
                    const isNowCompleted = !day.completed;
                    return {
                        ...day,
                        completed: isNowCompleted,
                        endTime: isNowCompleted ? new Date() : null,
                        time: day.time || slot.timeLabel?.split(" - ")[0] || ""
                    };
                }
                return day;
            });

            if (!dayUpdated) {
                updatedDays.push({
                    date: slot.date,
                    completed: true,
                    startTime: new Date(),
                    endTime: new Date(),
                    time: slot.timeLabel?.split(" - ")[0] || ""
                });
            }

            const response = await axios.patch(
                getApiUrl(`therapist-sessions/${id}`),
                {
                    days: updatedDays
                },
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                const action = updatedDays.find(d => {
                    const dDate = new Date(d.date);
                    dDate.setHours(0, 0, 0, 0);
                    return dDate.getTime() === slotDate.getTime();
                })?.completed ? "marked complete" : "unmarked";

                toast.success(`Session for ${slot.dateLabel} ${action}`);
                fetchProgress();
            }
        } catch (error) {
            console.error("Error updating session:", error);
            toast.error("Failed to update session");
        } finally {
            setUpdatingSlot(null);
        }
    };

    // Get the current day record for a slot to check if it's in progress
    const getDayRecord = (slot) => {
        if (!progressData || !progressData.days) return null;
        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);
        return progressData.days.find(day => {
            const dayDate = new Date(day.date);
            dayDate.setHours(0, 0, 0, 0);
            return dayDate.getTime() === slotDate.getTime();
        });
    };

    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Therapist", url: "/therapist" },
        { label: "Therapy Progress", url: "/therapist/therapy-progress" },
        { label: "Execute treatment" },
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
            <Box sx={{ p: 4 }}>
                <Typography variant="h5">Session not found</Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
            </Box>
        );
    }

    const { patientName, treatmentName, completed, total, slots } = progressData;
    const progressPercent = Math.round((completed / total) * 100);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", margin: "0 auto" }}>
            <Breadcrumb items={breadcrumbItems} />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, mt: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ color: "#2D3748", mb: 1 }}>
                        Treatment Execution
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Track and mark completions for <b>{patientName || "the patient"}</b>'s {treatmentName} plan.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ borderRadius: "12px", textTransform: "none", px: 3, borderColor: "#CBD5E0", color: "#4A5568" }}
                >
                    Back
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
                            background: "linear-gradient(135deg, #556B2F 0%, #6B8E23 100%)",
                            color: "white",
                            height: "100%",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        <Box sx={{ position: "relative", zIndex: 1 }}>
                            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>Overall Progress</Typography>
                            <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
                                <CircularProgress
                                    variant="determinate"
                                    value={progressPercent}
                                    size={120}
                                    thickness={6}
                                    sx={{ color: "rgba(255,255,255,0.3)" }}
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
                                <b>{completed}</b> of <b>{total}</b> sessions done
                            </Typography>
                            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" display="block">REMAINING</Typography>
                                    <Typography variant="h6" fontWeight={700}>{total - completed}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" display="block">STATUS</Typography>
                                    <Typography variant="h6" fontWeight={700}>{progressData.status}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Patient Summary Card */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", height: "100%", border: "1px solid #E2E8F0" }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Patient Information</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Avatar sx={{ bgcolor: "#EBF8FF", color: "#3182CE" }}>
                                            <PersonIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">PATIENT NAME</Typography>
                                            <Typography variant="body1" fontWeight={600}>{patientName}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Avatar sx={{ bgcolor: "#FAF5FF", color: "#805AD5" }}>
                                            <LocalHospitalIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">TREATMENT</Typography>
                                            <Typography variant="body1" fontWeight={600}>{treatmentName}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Avatar sx={{ bgcolor: "#F0FFF4", color: "#38A169" }}>
                                            <CalendarMonthIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">SCHEDULE TYPE</Typography>
                                            <Typography variant="body1" fontWeight={600}>{progressData.timeline}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Session Timeline */}
                <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>Treatment Schedule</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {slots.map((slot, index) => {
                                const dayRecord = getDayRecord(slot);
                                const isInProgress = dayRecord && dayRecord.startTime && !dayRecord.endTime && !dayRecord.completed;
                                
                                return (
                                    <Card
                                        key={index}
                                        sx={{
                                            borderRadius: "20px",
                                            border: "1px solid #E2E8F0",
                                            boxShadow: slot.isCompleted ? "none" : "0 4px 6px rgba(0,0,0,0.02)",
                                            background: slot.isCompleted ? "#F7FAFC" : isInProgress ? "#FFFBF0" : "white",
                                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                            "&:hover": {
                                                transform: slot.isCompleted ? "none" : "translateY(-4px)",
                                                boxShadow: slot.isCompleted ? "none" : "0 10px 15px rgba(0,0,0,0.05)"
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ py: "20px !important", px: 4 }}>
                                            <Grid container alignItems="center">
                                                <Grid item xs={12} sm={1}>
                                                    <Box
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: "12px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            bgcolor: slot.isCompleted ? "#48BB78" : isInProgress ? "#FFC107" : "#EDF2F7",
                                                            color: slot.isCompleted ? "white" : isInProgress ? "white" : "#718096"
                                                        }}
                                                    >
                                                        <Typography fontWeight={700}>{index + 1}</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Box sx={{ ml: { sm: 2 } }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>DATE</Typography>
                                                        <Typography variant="body1" fontWeight={600}>
                                                            {new Date(slot.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>PLANNED TIME</Typography>
                                                        <Typography variant="body1" sx={{ color: "#4A5568" }}>
                                                            {slot.timeLabel}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>STATUS</Typography>
                                                        <Chip
                                                            size="small"
                                                            icon={slot.isCompleted ? <CheckCircleIcon fontSize="small" /> : isInProgress ? <PlayCircleFilledIcon fontSize="small" /> : <PendingActionsIcon fontSize="small" />}
                                                            label={slot.isCompleted ? "Completed" : isInProgress ? "In Progress" : "Scheduled"}
                                                            sx={{
                                                                bgcolor: slot.isCompleted ? "#F0FFF4" : isInProgress ? "#FFFBF0" : "#FFFBEB",
                                                                color: slot.isCompleted ? "#2F855A" : isInProgress ? "#F59E0B" : "#D69E2E",
                                                                border: "none",
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={2} sx={{ textAlign: "right" }}>
                                                    {!slot.isCompleted && !isInProgress ? (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => handleStartSession(slot)}
                                                            disabled={updatingSlot === slot.dateLabel}
                                                            startIcon={updatingSlot === slot.dateLabel ? <CircularProgress size={16} color="inherit" /> : <PlayCircleFilledIcon />}
                                                            sx={{
                                                                borderRadius: "10px",
                                                                textTransform: "none",
                                                                bgcolor: "#3182CE",
                                                                boxShadow: "0 4px 6px rgba(49, 130, 206, 0.2)",
                                                                "&:hover": { bgcolor: "#2B6CB0" }
                                                            }}
                                                        >
                                                            Start
                                                        </Button>
                                                    ) : isInProgress ? (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => handleStopSession(slot)}
                                                            disabled={updatingSlot === slot.dateLabel}
                                                            startIcon={updatingSlot === slot.dateLabel ? <CircularProgress size={16} color="inherit" /> : <StopCircleIcon />}
                                                            sx={{
                                                                borderRadius: "10px",
                                                                textTransform: "none",
                                                                bgcolor: "#DC2626",
                                                                boxShadow: "0 4px 6px rgba(220, 38, 38, 0.2)",
                                                                "&:hover": { bgcolor: "#B91C1C" }
                                                            }}
                                                        >
                                                            Stop
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleToggleComplete(slot)}
                                                            disabled={updatingSlot === slot.dateLabel}
                                                            startIcon={updatingSlot === slot.dateLabel ? <CircularProgress size={16} /> : <HistoryIcon />}
                                                            sx={{
                                                                borderRadius: "10px",
                                                                textTransform: "none",
                                                                borderColor: "#E2E8F0",
                                                                color: "#718096",
                                                                "&:hover": { bgcolor: "#F7FAFC", borderColor: "#CBD5E0" }
                                                            }}
                                                        >
                                                            Undo
                                                        </Button>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Execution;
