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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
import EventBusyIcon from "@mui/icons-material/EventBusy";
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
    const [completionDialog, setCompletionDialog] = useState({ open: false, allSessionsDone: false });
    const checkIntervalRef = useRef(null); // Store interval for auto-start/auto-complete checks
    const autoCompleteTimersRef = useRef({}); // Store timers for auto-completion by slot date
    const timerIntervalRef = useRef(null); // Store interval for running timer display
    const autoCompletingSlotsRef = useRef(new Set()); // Prevent duplicate auto-complete calls
    const notifiedCompletionsRef = useRef(new Set()); // Prevent duplicate completion toasts/dialogs
    const progressDataRef = useRef(null); // Latest progress data for interval callbacks

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

    const getEffectiveElapsedMs = (day, now = new Date()) => {
        if (!day?.startTime) return 0;
        const start = new Date(day.startTime).getTime();
        return Math.max(0, now.getTime() - start);
    };

    const getDurationMs = (data = progressData) => {
        if (!data?.duration) return null;
        const ms = parseDurationToMs(data.duration);
        return ms && ms > 0 ? ms : null;
    };

    const hasDurationReached = (day, data = progressData) => {
        const durationMs = getDurationMs(data);
        if (!durationMs) return false;
        return getEffectiveElapsedMs(day) >= durationMs;
    };

    const clearAutoCompleteTimer = (slotDateKey) => {
        if (autoCompleteTimersRef.current[slotDateKey]) {
            clearTimeout(autoCompleteTimersRef.current[slotDateKey]);
            delete autoCompleteTimersRef.current[slotDateKey];
        }
    };

    const formatElapsedDisplay = (elapsedMs) => {
        const totalSeconds = Math.floor(elapsedMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return hours > 0
            ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const findSlotForDay = (day, data) => {
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
        return data.slots?.find(s => {
            const sDate = new Date(s.date);
            sDate.setHours(0, 0, 0, 0);
            return sDate.getTime() === dayDate.getTime();
        });
    };

    const getSlotDateKey = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
    };

    const notifyTherapyCompleted = (slotDateKey, allSessionsDone = false) => {
        const notifyKey = `${id}-${slotDateKey}`;
        if (notifiedCompletionsRef.current.has(notifyKey)) return;
        notifiedCompletionsRef.current.add(notifyKey);

        toast.success("Therapy session completed successfully", {
            toastId: notifyKey,
            autoClose: 3000,
            onClose: () => {
                setCompletionDialog({ open: true, allSessionsDone });
            },
        });
    };

    const isDayAlreadyCompleted = (days, slot) => {
        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);
        const dayRecord = (days || []).find(day => {
            const dayDate = new Date(day.date);
            dayDate.setHours(0, 0, 0, 0);
            return dayDate.getTime() === slotDate.getTime();
        });
        return Boolean(dayRecord?.completed);
    };

    const triggerAutoCompleteIfDue = async (day, data) => {
        if (!day?.startTime || day.endTime || day.completed) return;

        const durationMs = getDurationMs(data);
        if (!durationMs) return;

        if (getEffectiveElapsedMs(day) < durationMs) return;

        const slot = findSlotForDay(day, data);
        if (!slot) return;

        const slotDateKey = getSlotDateKey(day.date);
        clearAutoCompleteTimer(slotDateKey);
        await handleAutoComplete(slot, data);
    };

    const fetchProgress = async (silent = false) => {
        if (!silent) setIsLoading(true);
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
                progressData.duration = sessionData.duration || sessionData?.treatmentPlan?.duration || progressData.duration || "";
                progressData.cost = sessionData.cost || 0;
                progressData.therapistCharge = sessionData.therapistCharge || 0;
                progressData.isBilled = sessionData.isBilled || false;
                progressDataRef.current = progressData;
                setProgressData(progressData);

                setupTimersForInProgressSessions(progressData);

                // Check for auto-start and auto-complete after fetching
                checkAutoStartAndComplete(progressData);
            }
        } catch (error) {
            console.error("Error fetching progress:", error);
            toast.error("Failed to load session details");
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    // Auto-complete only sessions that were started and reached their configured duration.
    const checkAutoStartAndComplete = async (data) => {
        if (!data || !data.slots) return;

        for (const slot of data.slots) {
            const slotDate = new Date(slot.date);
            slotDate.setHours(0, 0, 0, 0);

            const dayRecord = data.days?.find(day => {
                const dayDate = new Date(day.date);
                dayDate.setHours(0, 0, 0, 0);
                return dayDate.getTime() === slotDate.getTime();
            });

            if (dayRecord?.completed || slot.isCompleted) continue;

            if (dayRecord?.startTime) {
                await triggerAutoCompleteIfDue(dayRecord, data);
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
        };
    }, [progressData]);

    useEffect(() => {
        progressDataRef.current = progressData;
    }, [progressData]);

    // Running timer: update elapsed times every second for in-progress sessions
    useEffect(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        const updateElapsed = () => {
            const data = progressDataRef.current;
            if (!data || !data.days) return;
            const now = new Date();
            const newElapsed = {};
            const durationMs = getDurationMs(data);

            data.days.forEach(day => {
                if (day.startTime && !day.endTime && !day.completed) {
                    const startTime = new Date(day.startTime);
                    const elapsedMs = getEffectiveElapsedMs(day, now);
                    const cappedElapsedMs = durationMs ? Math.min(elapsedMs, durationMs) : elapsedMs;
                    const key = getSlotDateKey(day.date);
                    const durationReached = durationMs ? elapsedMs >= durationMs : false;

                    newElapsed[key] = {
                        display: formatElapsedDisplay(cappedElapsedMs),
                        startTimeFormatted: startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                        durationReached
                    };

                    if (durationReached) {
                        triggerAutoCompleteIfDue(day, data);
                    }
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
                        completed: false,
                        pausedAt: null,
                        totalPausedMs: 0
                    };
                }
                return day;
            });

            if (!dayUpdated) {
                updatedDays.push({
                    date: slot.date,
                    startTime: now,
                    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                    completed: false,
                    pausedAt: null,
                    totalPausedMs: 0
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
        const slotDateKey = getSlotDateKey(slot.date);
        if (autoCompletingSlotsRef.current.has(slotDateKey)) return false;

        try {
            let currentData = dataToUse;
            if (!currentData) {
                const response = await axios.get(
                    getApiUrl(`therapist-sessions/${id}/progress`),
                    { headers: getAuthHeaders() }
                );
                if (!response.data.success) return false;
                currentData = response.data.data;
            }

            const currentDays = currentData.days || [];
            if (isDayAlreadyCompleted(currentDays, slot)) return false;

            autoCompletingSlotsRef.current.add(slotDateKey);
            clearAutoCompleteTimer(slotDateKey);

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
                        pausedAt: null,
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

            const allSessionsDone = currentData.completed + 1 >= currentData.total;

            const updateResponse = await axios.patch(
                getApiUrl(`therapist-sessions/${id}`),
                {
                    days: updatedDays,
                    status: allSessionsDone ? "Completed" : currentData.status
                },
                { headers: getAuthHeaders() }
            );

            if (updateResponse.data.success) {
                notifyTherapyCompleted(slotDateKey, allSessionsDone);
                fetchProgress(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error auto-completing session:", error);
            return false;
        } finally {
            autoCompletingSlotsRef.current.delete(slotDateKey);
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
                const durationMs = parseDurationToMs(data.duration);
                const elapsedMs = getEffectiveElapsedMs(day, now);
                const remainingMs = durationMs - elapsedMs;
                console.log(`[AutoComplete] Session in progress. Started: ${startTime}, Elapsed: ${elapsedMs}, Remaining: ${remainingMs}, Paused: ${Boolean(day.pausedAt)}`);

                const dayDate = new Date(day.date);
                dayDate.setHours(0, 0, 0, 0);
                const slot = data.slots?.find(s => {
                    const sDate = new Date(s.date);
                    sDate.setHours(0, 0, 0, 0);
                    return sDate.getTime() === dayDate.getTime();
                });

                if (!slot) return;

                if (remainingMs > 0) {
                    const slotDateKey = dayDate.toISOString().split('T')[0];
                    console.log(`[AutoComplete] Session already in progress, setting timer for remaining ${remainingMs / 1000 / 60} minutes`);
                    setupAutoCompleteTimer(slotDateKey, slot, data, remainingMs);
                } else if (durationMs && durationMs > 0) {
                    console.log(`[AutoComplete] Duration already passed, auto-completing now`);
                    triggerAutoCompleteIfDue(day, data);
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

        if (slotDate.getTime() < today.getTime() && !slot.isCompleted) {
            toast.error("Cannot start a session that was missed.");
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
                        completed: false,
                        pausedAt: null,
                        totalPausedMs: 0
                    };
                }
                return day;
            });

            if (!dayUpdated) {
                updatedDays.push({
                    date: slot.date,
                    startTime: now,
                    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                    completed: false,
                    pausedAt: null,
                    totalPausedMs: 0
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

                const slotDateKey = slotDateForUpdate.toISOString().split('T')[0];
                setupAutoCompleteTimer(slotDateKey, slot, progressData);

                fetchProgress(true);
            }
        } catch (error) {
            console.error("Error starting session:", error);
            toast.error("Failed to start session");
        } finally {
            setUpdatingSlot(null);
        }
    };

    const handleStopSession = async (slot) => {
        const slotDateKey = getSlotDateKey(slot.date);
        if (autoCompletingSlotsRef.current.has(slotDateKey) || isDayAlreadyCompleted(progressData?.days, slot)) {
            return;
        }

        setUpdatingSlot(slot.dateLabel);
        try {
            clearAutoCompleteTimer(slotDateKey);

            const slotDate = new Date(slot.date);
            slotDate.setHours(0, 0, 0, 0);
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
                        pausedAt: null,
                        time: day.time || ""
                    };
                }
                return day;
            });

            const allSessionsDone = progressData.completed + 1 >= progressData.total;

            const response = await axios.patch(
                getApiUrl(`therapist-sessions/${id}`),
                {
                    days: updatedDays,
                    status: allSessionsDone ? "Completed" : progressData.status
                },
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                notifyTherapyCompleted(slotDateKey, allSessionsDone);
                fetchProgress(true);
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

    const overallStatus = (() => {
        if (total > 0 && completed >= total) return "Completed";
        if (completed > 0) return "In Progress";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let allMissed = slots.length > 0;
        for (const slot of slots) {
            const dayRecord = getDayRecord(slot);
            const isInProgress = Boolean(dayRecord?.startTime && !dayRecord?.endTime && !dayRecord.completed);
            if (isInProgress) return "In Progress";

            const slotDate = new Date(slot.date);
            slotDate.setHours(0, 0, 0, 0);
            const isMissed = slotDate.getTime() < today.getTime() && !slot.isCompleted;
            if (!isMissed) allMissed = false;
        }

        if (allMissed) return "Missed";
        return progressData.status || "Scheduled";
    })();

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
                                    <Typography variant="h6" fontWeight={700}>{overallStatus}</Typography>
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
                                const durationConfigured = Boolean(getDurationMs());
                                const durationReached = isInProgress && durationConfigured && hasDurationReached(dayRecord);
                                const elapsedInfo = getElapsedTimeForSlot(slot);

                                // Check if the session date is in the future
                                const slotDate = new Date(slot.date);
                                slotDate.setHours(0, 0, 0, 0);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isFutureDate = slotDate.getTime() > today.getTime();
                                const isPastDate = slotDate.getTime() < today.getTime();
                                const isMissed = isPastDate && !slot.isCompleted && !isInProgress;
                                const isStartDisabled = updatingSlot === slot.dateLabel || isFutureDate || isMissed;

                                const statusLabel = slot.isCompleted
                                    ? "Completed"
                                    : isInProgress
                                        ? (durationConfigured && durationReached ? "Duration Reached" : "In Progress")
                                        : isMissed
                                            ? "Missed"
                                            : "Scheduled";

                                const statusIcon = slot.isCompleted
                                    ? <CheckCircleIcon fontSize="small" />
                                    : isInProgress
                                        ? <PlayCircleFilledIcon fontSize="small" />
                                        : isMissed
                                            ? <EventBusyIcon fontSize="small" />
                                            : <PendingActionsIcon fontSize="small" />;

                                const statusStyles = slot.isCompleted
                                    ? { bgcolor: "#F0FFF4", color: "#2F855A" }
                                    : isInProgress
                                        ? { bgcolor: durationReached ? "#F0FFF4" : "#FFFBF0", color: durationReached ? "#16A34A" : "#F59E0B" }
                                        : isMissed
                                            ? { bgcolor: "#FEF2F2", color: "#DC2626" }
                                            : { bgcolor: "#FFFBEB", color: "#D69E2E" };

                                return (
                                    <Card
                                        key={index}
                                        sx={{
                                            borderRadius: "20px",
                                            border: isInProgress
                                                ? (durationReached ? "2px solid #48BB78" : "2px solid #F59E0B")
                                                : isMissed
                                                    ? "2px solid #FCA5A5"
                                                    : "1px solid #E2E8F0",
                                            boxShadow: slot.isCompleted ? "none" : isInProgress ? "0 4px 12px rgba(245,158,11,0.15)" : isMissed ? "0 4px 12px rgba(220,38,38,0.08)" : "0 4px 6px rgba(0,0,0,0.02)",
                                            background: slot.isCompleted ? "#F7FAFC" : isInProgress ? "#FFFBF0" : isMissed ? "#FFFAFA" : "white",
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
                                                            bgcolor: slot.isCompleted ? "#48BB78" : isInProgress ? "#FFC107" : isMissed ? "#DC2626" : "#EDF2F7",
                                                            color: slot.isCompleted ? "white" : isInProgress ? "white" : isMissed ? "white" : "#718096"
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
                                                                    {elapsedInfo?.startTimeFormatted || slot.timeLabel}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography
                                                                        variant="h6"
                                                                        sx={{
                                                                            color: durationReached ? "#16A34A" : "#D97706",
                                                                            fontWeight: 800,
                                                                            fontFamily: "monospace",
                                                                            animation: "pulse 2s infinite",
                                                                            "@keyframes pulse": {
                                                                                "0%, 100%": { opacity: 1 },
                                                                                "50%": { opacity: 0.7 }
                                                                            }
                                                                        }}
                                                                    >
                                                                        {elapsedInfo?.display || "00:00"}
                                                                    </Typography>
                                                                    {progressData.duration && (
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            / {progressData.duration}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                                {durationReached && (
                                                                    <Typography variant="caption" sx={{ color: "#16A34A", fontWeight: 600 }}>
                                                                        Session time reached
                                                                    </Typography>
                                                                )}
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
                                                            icon={statusIcon}
                                                            label={statusLabel}
                                                            sx={{
                                                                ...statusStyles,
                                                                border: "none",
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                        {isMissed && (
                                                            <Typography variant="caption" sx={{ color: "#DC2626", display: "block", mt: 0.5 }}>
                                                                Session missed
                                                            </Typography>
                                                        )}
                                                        {isInProgress && (!durationConfigured || !durationReached) && (
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
                                                            disabled={isStartDisabled}
                                                            startIcon={updatingSlot === slot.dateLabel ? <CircularProgress size={16} color="inherit" /> : <PlayCircleFilledIcon />}
                                                            title={
                                                                isFutureDate
                                                                    ? `This session is scheduled for ${new Date(slot.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}. You can only start sessions on or after the scheduled date.`
                                                                    : isMissed
                                                                        ? "This session was missed and can no longer be started."
                                                                        : ""
                                                            }
                                                            sx={{
                                                                borderRadius: "10px",
                                                                textTransform: "none",
                                                                bgcolor: isStartDisabled && !updatingSlot ? "#CBD5E0" : "#3182CE",
                                                                boxShadow: isStartDisabled && !updatingSlot ? "none" : "0 4px 6px rgba(49, 130, 206, 0.2)",
                                                                "&:hover": {
                                                                    bgcolor: isStartDisabled && !updatingSlot ? "#CBD5E0" : "#2B6CB0",
                                                                    cursor: isStartDisabled && !updatingSlot ? "not-allowed" : "pointer"
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

            <Dialog
                open={completionDialog.open}
                onClose={() => setCompletionDialog({ open: false, allSessionsDone: false })}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
            >
                <DialogTitle sx={{ textAlign: "center", pt: 4, pb: 1 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ width: 72, height: 72, bgcolor: "#F0FFF4", color: "#38A169" }}>
                            <CheckCircleIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="h5" fontWeight={700} sx={{ color: "#2D3748" }}>
                            Therapy Completed
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ textAlign: "center", pb: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                        {completionDialog.allSessionsDone
                            ? "All therapy sessions have been completed successfully."
                            : "The therapy session has been completed successfully."}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => setCompletionDialog({ open: false, allSessionsDone: false })}
                        sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            px: 5,
                            py: 1.25,
                            bgcolor: "#556B2F",
                            "&:hover": { bgcolor: "#6B8E23" },
                        }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Execution;
