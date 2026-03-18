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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
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
import TextField from "../../../components/treatment/TextField";

function Execution() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [progressData, setProgressData] = useState(null);
    const [updatingSlot, setUpdatingSlot] = useState(null);
    const [elapsedTimes, setElapsedTimes] = useState({}); // Track elapsed time per slot
    const checkIntervalRef = useRef(null); // Store interval for auto-start/auto-complete checks
    const autoCompleteTimersRef = useRef({}); // Store timers for auto-completion by slot date
    const timerIntervalRef = useRef(null); // Store interval for running timer display

    // Utility function to parse duration string to milliseconds
    const parseDurationToMs = (durationStr) => {
        if (!durationStr) return null;

        // Handle raw number (string or number type) as minutes
        if (!isNaN(durationStr)) {
            const minutes = parseFloat(durationStr);
            return minutes * 60 * 1000;
        }

        if (typeof durationStr !== 'string') return null;

        const normalized = durationStr.trim().toLowerCase();

        // Match patterns like "45 mins", "45 minutes", "1 hour", "1.5 hours", "30 min", etc.
        const minuteMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes)/);
        const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)/);

        if (minuteMatch) {
            const minutes = parseFloat(minuteMatch[1]);
            return minutes * 60 * 1000; // Convert to milliseconds
        } else if (hourMatch) {
            const hours = parseFloat(hourMatch[1]);
            return hours * 60 * 60 * 1000; // Convert to milliseconds
        }

        return null; // Invalid format
    };

    const fetchProgress = async () => {
        setIsLoading(true);
        try {
            // Fetch both progress data and session data to get sessionTime and duration
            const [progressResponse, sessionResponse] = await Promise.all([
                axios.get(getApiUrl(`therapist-sessions/${id}/progress`), { headers: getAuthHeaders() }),
                axios.get(getApiUrl(`therapist-sessions/${id}`), { headers: getAuthHeaders() })
            ]);

            if (progressResponse.data.success && sessionResponse.data.success) {
                const progressData = progressResponse.data.data;
                const sessionData = sessionResponse.data.data;
                // Add sessionTime, duration, and charges to progressData for easier access
                progressData.sessionTime = sessionData.sessionTime || "10:00";
                progressData.duration = sessionData.duration || "";
                progressData.cost = sessionData.cost || 0;
                progressData.therapistCharge = sessionData.therapistCharge || 0;
                progressData.isBilled = sessionData.isBilled || false;
                setProgressData(progressData);

                // Set up auto-completion timers for sessions already in progress
                setupTimersForInProgressSessions(progressData);

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
            /* Auto-start logic removed to ensure manual control by therapist
            else if (slotDate.getTime() === today.getTime()) {
                const scheduledDateTime = new Date(slotDate);
                scheduledDateTime.setHours(scheduledHour, scheduledMinute, 0, 0);

                // If current time >= scheduled time and not started, auto-start
                if (now >= scheduledDateTime && !dayRecord?.startTime) {
                    await handleAutoStart(slot, data);
                }
            }
            */
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

        // Cleanup interval and timers on unmount
        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
            // Clear all auto-completion timers
            Object.values(autoCompleteTimersRef.current).forEach(timer => {
                if (timer) clearTimeout(timer);
            });
            autoCompleteTimersRef.current = {};
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
            // Clear all auto-completion timers when progressData changes
            Object.values(autoCompleteTimersRef.current).forEach(timer => {
                if (timer) clearTimeout(timer);
            });
            autoCompleteTimersRef.current = {};
        };
    }, [progressData]);

    // Running timer: update elapsed times every second for in-progress sessions
    useEffect(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        const updateElapsed = () => {
            if (!progressData || !progressData.days) return;
            const now = new Date();
            const newElapsed = {};
            progressData.days.forEach(day => {
                if (day.startTime && !day.endTime && !day.completed) {
                    const startTime = new Date(day.startTime);
                    const elapsedMs = now.getTime() - startTime.getTime();
                    const totalSeconds = Math.floor(elapsedMs / 1000);
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;
                    const dayDate = new Date(day.date);
                    dayDate.setHours(0, 0, 0, 0);
                    const key = dayDate.toISOString().split('T')[0];
                    newElapsed[key] = {
                        display: hours > 0
                            ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                            : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
                        startTimeFormatted: startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    };
                }
            });
            setElapsedTimes(newElapsed);
        };

        updateElapsed(); // Run immediately
        timerIntervalRef.current = setInterval(updateElapsed, 1000); // Then every second

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [progressData]);

    // Helper to get elapsed time display for a slot
    const getElapsedTimeForSlot = (slot) => {
        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);
        const key = slotDate.toISOString().split('T')[0];
        return elapsedTimes[key] || null;
    };

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

                // Set up auto-completion timer if duration is available
                const slotDateKey = slotDate.toISOString().split('T')[0];
                setupAutoCompleteTimer(slotDateKey, slot, currentData);

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

    // Setup auto-completion timers for sessions already in progress when page loads
    const setupTimersForInProgressSessions = (data) => {
        console.log("[AutoComplete] Setting up timers with data:", { duration: data?.duration, days: data?.days });

        if (!data || !data.days || !data.duration) {
            console.log("[AutoComplete] Missing data for timers");
            return;
        }

        const durationMs = parseDurationToMs(data.duration);
        console.log("[AutoComplete] Parsed durationMs:", durationMs);

        if (!durationMs || durationMs <= 0) return;

        const now = new Date();

        data.days.forEach(day => {
            console.log("[AutoComplete] Checking day:", day);
            // Check if session is in progress (has startTime but no endTime and not completed)
            if (day.startTime && !day.endTime && !day.completed) {
                const startTime = new Date(day.startTime);
                const elapsedMs = now.getTime() - startTime.getTime();
                const remainingMs = durationMs - elapsedMs;
                console.log(`[AutoComplete] Session in progress. Started: ${startTime}, Elapsed: ${elapsedMs}, Remaining: ${remainingMs}`);

                if (remainingMs > 0) {
                    // Session is still in progress, set timer for remaining time
                    const dayDate = new Date(day.date);
                    dayDate.setHours(0, 0, 0, 0);
                    const slotDateKey = dayDate.toISOString().split('T')[0];

                    // Find corresponding slot
                    const slot = data.slots?.find(s => {
                        const sDate = new Date(s.date);
                        sDate.setHours(0, 0, 0, 0);
                        return sDate.getTime() === dayDate.getTime();
                    });

                    if (slot) {
                        console.log(`[AutoComplete] Session already in progress, setting timer for remaining ${remainingMs / 1000 / 60} minutes`);
                        setupAutoCompleteTimer(slotDateKey, slot, data, remainingMs);
                    }
                } else {
                    // Duration has already passed, auto-complete immediately
                    console.log(`[AutoComplete] Duration already passed, auto-completing immediately`);
                    const dayDate = new Date(day.date);
                    dayDate.setHours(0, 0, 0, 0);
                    const slot = data.slots?.find(s => {
                        const sDate = new Date(s.date);
                        sDate.setHours(0, 0, 0, 0);
                        return sDate.getTime() === dayDate.getTime();
                    });
                    if (slot) {
                        handleAutoComplete(slot, data);
                    }
                }
            }
        });
    };

    // Setup auto-completion timer for a session
    const setupAutoCompleteTimer = (slotDateKey, slot, dataToUse = null, customDurationMs = null) => {
        // Clear any existing timer for this slot
        if (autoCompleteTimersRef.current[slotDateKey]) {
            clearTimeout(autoCompleteTimersRef.current[slotDateKey]);
            delete autoCompleteTimersRef.current[slotDateKey];
        }

        // Use custom duration if provided, otherwise parse from string
        let durationMs = customDurationMs;

        if (!durationMs) {
            // Get duration from progressData or passed data
            const durationStr = (dataToUse?.duration || progressData?.duration || "").trim();
            if (!durationStr) {
                console.log(`[AutoComplete] No duration specified for session, skipping auto-completion`);
                return;
            }

            durationMs = parseDurationToMs(durationStr);
            if (!durationMs || durationMs <= 0) {
                console.warn(`[AutoComplete] Invalid duration format: "${durationStr}", skipping auto-completion`);
                return;
            }
        }

        const durationStr = dataToUse?.duration || progressData?.duration || "";
        console.log(`[AutoComplete] Setting timer for ${durationMs / 1000 / 60} minutes (${durationStr || 'custom duration'})`);

        // Set timer to auto-complete after duration
        autoCompleteTimersRef.current[slotDateKey] = setTimeout(async () => {
            console.log(`[AutoComplete] Timer expired, auto-completing session for ${slotDateKey}`);

            // Check if session is still in progress before auto-completing
            try {
                const checkResponse = await axios.get(
                    getApiUrl(`therapist-sessions/${id}/progress`),
                    { headers: getAuthHeaders() }
                );

                if (checkResponse.data.success) {
                    const currentData = checkResponse.data.data;
                    const currentDays = currentData.days || [];
                    const slotDate = new Date(slot.date);
                    slotDate.setHours(0, 0, 0, 0);

                    const dayRecord = currentDays.find(day => {
                        const dayDate = new Date(day.date);
                        dayDate.setHours(0, 0, 0, 0);
                        return dayDate.getTime() === slotDate.getTime();
                    });

                    // Only auto-complete if session is still in progress and not already completed
                    if (dayRecord && dayRecord.startTime && !dayRecord.completed && !dayRecord.endTime) {
                        await handleAutoComplete(slot, currentData);
                        toast.info(`Session automatically completed after ${durationStr}`);
                    } else {
                        console.log(`[AutoComplete] Session already completed or not in progress, skipping`);
                    }
                }
            } catch (error) {
                console.error("[AutoComplete] Error checking session status before auto-completion:", error);
            }

            // Clean up timer reference
            delete autoCompleteTimersRef.current[slotDateKey];
        }, durationMs);
    };

    const handleStartSession = async (slot) => {
        // Prevent starting sessions scheduled for future dates
        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (slotDate.getTime() > today.getTime()) {
            toast.error(`Cannot start session scheduled for ${new Date(slot.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}. Please wait until the scheduled date.`);
            return;
        }

        setUpdatingSlot(slot.dateLabel);
        try {
            const currentDays = progressData.days || [];
            const slotDateForUpdate = new Date(slot.date);
            slotDateForUpdate.setHours(0, 0, 0, 0);
            const now = new Date();

            let dayUpdated = false;
            let updatedDays = currentDays.map(day => {
                const dayDate = new Date(day.date);
                dayDate.setHours(0, 0, 0, 0);
                if (dayDate.getTime() === slotDateForUpdate.getTime()) {
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

                // Set up auto-completion timer if duration is available
                const slotDateKey = slotDateForUpdate.toISOString().split('T')[0];
                setupAutoCompleteTimer(slotDateKey, slot, progressData);

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
            // Clear auto-completion timer if session is being stopped manually
            const slotDate = new Date(slot.date);
            slotDate.setHours(0, 0, 0, 0);
            const slotDateKey = slotDate.toISOString().split('T')[0];
            if (autoCompleteTimersRef.current[slotDateKey]) {
                clearTimeout(autoCompleteTimersRef.current[slotDateKey]);
                delete autoCompleteTimersRef.current[slotDateKey];
                console.log(`[AutoComplete] Cleared timer for manually stopped session: ${slotDateKey}`);
            }

            const currentDays = progressData.days || [];
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
                        endTime: isNowCompleted ? (day.endTime || new Date()) : null,
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
                const updatedDay = updatedDays.find(d => {
                    const dDate = new Date(d.date);
                    dDate.setHours(0, 0, 0, 0);
                    return dDate.getTime() === slotDate.getTime();
                });
                const action = updatedDay?.completed ? "marked complete" : "unmarked";

                toast.success(`Session for ${slot.dateLabel} ${action}`);
                fetchProgress();
            } else {
                toast.error(response.data.message || "Failed to update session");
            }
        } catch (error) {
            console.error("Error updating session:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to update session";
            toast.error(errorMessage);
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
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Avatar sx={{ bgcolor: "#FFF5F5", color: "#E53E3E" }}>
                                            <AccessTimeIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">DURATION PER SESSION</Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {progressData.duration || "Not set"}
                                            </Typography>
                                            {progressData.duration && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                                    Auto-stops when duration reached
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Therapy Charges Card */}


                {/* Session Timeline */}
                <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>Treatment Schedule</Typography>

                        <TextField sessionId={id} />
                        <br />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {slots.map((slot, index) => {
                                const dayRecord = getDayRecord(slot);
                                const isInProgress = dayRecord && dayRecord.startTime && !dayRecord.endTime && !dayRecord.completed;

                                // Check if the session date is in the future
                                const slotDate = new Date(slot.date);
                                slotDate.setHours(0, 0, 0, 0);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isFutureDate = slotDate.getTime() > today.getTime();

                                return (
                                    <Card
                                        key={index}
                                        sx={{
                                            borderRadius: "20px",
                                            border: isInProgress ? "2px solid #F59E0B" : "1px solid #E2E8F0",
                                            boxShadow: slot.isCompleted ? "none" : isInProgress ? "0 4px 12px rgba(245,158,11,0.15)" : "0 4px 6px rgba(0,0,0,0.02)",
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
                                                <Grid item xs={12} sm={4}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                                            {isInProgress ? "STARTED AT / ELAPSED" : "PLANNED TIME"}
                                                        </Typography>
                                                        {isInProgress ? (
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                                <Typography variant="body2" sx={{ color: "#4A5568" }}>
                                                                    {getElapsedTimeForSlot(slot)?.startTimeFormatted || slot.timeLabel}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography
                                                                        variant="h6"
                                                                        sx={{
                                                                            color: "#D97706",
                                                                            fontWeight: 800,
                                                                            fontFamily: "monospace",
                                                                            animation: "pulse 2s infinite",
                                                                            "@keyframes pulse": {
                                                                                "0%, 100%": { opacity: 1 },
                                                                                "50%": { opacity: 0.7 }
                                                                            }
                                                                        }}
                                                                    >
                                                                        {getElapsedTimeForSlot(slot)?.display || "00:00"}
                                                                    </Typography>
                                                                    {progressData.duration && (
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            / {progressData.duration}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="body1" sx={{ color: "#4A5568" }}>
                                                                {slot.timeLabel}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={2}>
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
                                                        {isInProgress && (
                                                            <Typography variant="caption" sx={{ color: "#F59E0B", display: "block", mt: 0.5 }}>
                                                                Running...
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={2} sx={{ textAlign: "right" }}>
                                                    {!slot.isCompleted && !isInProgress ? (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => handleStartSession(slot)}
                                                            disabled={updatingSlot === slot.dateLabel || isFutureDate}
                                                            startIcon={updatingSlot === slot.dateLabel ? <CircularProgress size={16} color="inherit" /> : <PlayCircleFilledIcon />}
                                                            title={isFutureDate ? `This session is scheduled for ${new Date(slot.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}. You can only start sessions on or after the scheduled date.` : ""}
                                                            sx={{
                                                                borderRadius: "10px",
                                                                textTransform: "none",
                                                                bgcolor: isFutureDate ? "#CBD5E0" : "#3182CE",
                                                                boxShadow: isFutureDate ? "none" : "0 4px 6px rgba(49, 130, 206, 0.2)",
                                                                "&:hover": {
                                                                    bgcolor: isFutureDate ? "#CBD5E0" : "#2B6CB0",
                                                                    cursor: isFutureDate ? "not-allowed" : "pointer"
                                                                },
                                                                "&.Mui-disabled": {
                                                                    bgcolor: "#E2E8F0",
                                                                    color: "#A0AEC0"
                                                                }
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
                                                                bgcolor: "#E53E3E",
                                                                boxShadow: "0 4px 6px rgba(229, 62, 62, 0.25)",
                                                                "&:hover": { bgcolor: "#C53030" },
                                                                "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#A0AEC0" },
                                                            }}
                                                        >
                                                            Stop
                                                        </Button>
                                                    ) : (
                                                        <></>
                                                        // <Button
                                                        //     variant="outlined"
                                                        //     size="small"
                                                        //     onClick={() => handleToggleComplete(slot)}
                                                        //     disabled={updatingSlot === slot.dateLabel}
                                                        //     startIcon={updatingSlot === slot.dateLabel ? <CircularProgress size={16} /> : <HistoryIcon />}
                                                        //     sx={{
                                                        //         borderRadius: "10px",
                                                        //         textTransform: "none",
                                                        //         borderColor: "#E2E8F0",
                                                        //         color: "#718096",
                                                        //         "&:hover": { bgcolor: "#F7FAFC", borderColor: "#CBD5E0" }
                                                        //     }}
                                                        // >
                                                        //     Undo
                                                        // </Button>
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
