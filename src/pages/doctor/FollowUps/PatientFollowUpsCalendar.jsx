import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Stack, Button, Typography, Paper, Avatar, Chip, CircularProgress } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ListIcon from "@mui/icons-material/List";
import AddIcon from "@mui/icons-material/Add";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { toast } from "react-toastify";

import HeadingCard from "../../../components/card/HeadingCard";
import "../../../assets/css/fullcalendar.min.css";

function PatientFollowUpsCalendar() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const [viewMode, setViewMode] = useState("dayGridMonth");
    const [currentTitle, setCurrentTitle] = useState("");
    const [patient, setPatient] = useState({
        name: "Loading...",
        age: "--",
        gender: "Unknown",
        avatar: "P",
    });
    const [appointments, setAppointments] = useState([]);
    const [appointmentsRaw, setAppointmentsRaw] = useState([]); // Store raw appointment data
    const [isLoading, setIsLoading] = useState(true);

    // Fetch patient information
    const fetchPatientInfo = useCallback(async () => {
        try {
            const response = await axios.get(
                getApiUrl(`patients/by-user/${userId}`),
                { headers: getAuthHeaders() }
            );
            
            if (response.data.success && response.data.data) {
                const profile = response.data.data;
                const user = profile.user || {};
                setPatient({
                    name: user.name || `Patient ${userId}`,
                    age: user.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : "--",
                    gender: user.gender || "Unknown",
                    avatar: user.name ? user.name.charAt(0).toUpperCase() : "P",
                });
            }
        } catch (error) {
            console.error("Error fetching patient info:", error);
            // Use default patient info if fetch fails
            setPatient({
                name: `Patient ${userId}`,
                age: "--",
                gender: "Unknown",
                avatar: userId ? userId.charAt(0).toUpperCase() : "P",
            });
        }
    }, [userId]);

    // Fetch appointments for this patient
    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl(`appointments?userId=${userId}&type=patient&limit=1000`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                const appointmentsData = response.data.data || [];
                
                // Transform appointments to calendar events
                const events = appointmentsData.map((appointment) => {
                    const appointmentDate = new Date(appointment.appointmentDate);
                    const dateStr = appointmentDate.toISOString().split('T')[0];
                    
                    // Parse time (format: "HH:MM")
                    const [hours, minutes] = (appointment.appointmentTime || "10:00").split(':');
                    const startTime = `${dateStr}T${hours.padStart(2, '0')}:${minutes || '00'}:00`;
                    
                    // Calculate end time (assuming 30 minutes default duration)
                    const endDate = new Date(startTime);
                    endDate.setMinutes(endDate.getMinutes() + 30);
                    const endTime = endDate.toISOString();

                    // Determine color based on status
                    let backgroundColor = "#8B5CF6"; // Default purple
                    if (appointment.status === "Completed") backgroundColor = "#28a745"; // Green
                    if (appointment.status === "Cancelled") backgroundColor = "#dc3545"; // Red
                    if (appointment.status === "Ongoing") backgroundColor = "#ffc107"; // Yellow

                    // Create event title
                    const doctorName = appointment.doctor?.user?.name || "Doctor";
                    const title = `Appointment with ${doctorName}${appointment.notes ? ` - ${appointment.notes}` : ''}`;

                    return {
                        id: appointment._id,
                        title: title,
                        start: startTime,
                        end: endTime,
                        backgroundColor: backgroundColor,
                        borderColor: backgroundColor,
                        extendedProps: { 
                            status: appointment.status,
                            doctor: doctorName,
                            notes: appointment.notes,
                        }
                    };
                });

                setAppointments(events);
                setAppointmentsRaw(appointmentsData); // Store raw data for later use
            } else {
                toast.error(response.data.message || "Failed to fetch appointments");
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch appointments");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchPatientInfo();
        fetchAppointments();
    }, [fetchPatientInfo, fetchAppointments]);

    const calendarEvents = useMemo(() => {
        return appointments;
    }, [appointments]);

    const handlePrev = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.prev();
    };

    const handleNext = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.next();
    };

    const handleToday = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.today();
    };

    const handleViewChange = (view) => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(view);
        setViewMode(view);
        setCurrentTitle(calendarApi.view.title);
    };

    const handleDatesSet = (dateInfo) => {
        setCurrentTitle(dateInfo.view.title);
    };

    const handleEventClick = (clickInfo) => {
        // Prevent default event propagation
        clickInfo.jsEvent.preventDefault();
        
        // Get the appointment ID from the clicked event
        const appointmentId = clickInfo.event.id;
        
        // Find the full appointment data
        const appointment = appointmentsRaw.find(apt => apt._id === appointmentId);
        
        if (appointment) {
            // Navigate to patient examination page with appointment context
            // Store appointment ID in sessionStorage or pass via state
            navigate(`/doctor/add-examination/${userId}`, {
                state: {
                    appointment: appointment,
                    appointmentId: appointmentId
                }
            });
        } else {
            // Fallback: just navigate to examination page
            navigate(`/doctor/add-examination/${userId}`);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <HeadingCard
                title="Patient Follow-up Calendar"
                subtitle={`View and manage follow-up appointments for ${patient.name}`}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Follow-ups", url: "/doctor/follow-ups" },
                    { label: "Patient Calendar" },
                ]}
            />

            {/* Patient Info Card */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    mt: 4,
                    borderRadius: 3,
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 3
                }}
            >
                <Avatar
                    sx={{
                        width: 64,
                        height: 64,
                        bgcolor: "var(--color-primary-light)",
                        color: "var(--color-primary-dark)",
                        fontSize: "1.5rem",
                        fontWeight: 700
                    }}
                >
                    {patient.avatar}
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-text-dark)" }}>
                        {patient.name}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={0.5}>
                        <Chip
                            icon={<PersonOutlineIcon sx={{ fontSize: "16px !important" }} />}
                            label={`${patient.age} years • ${patient.gender}`}
                            size="small"
                            sx={{
                                bgcolor: "var(--color-bg-hover)",
                                fontWeight: 500,
                                fontSize: "0.75rem"
                            }}
                        />
                        <Chip
                            label={`ID: ${userId}`}
                            size="small"
                            sx={{
                                bgcolor: "var(--color-bg-hover)",
                                fontWeight: 500,
                                fontSize: "0.75rem"
                            }}
                        />
                    </Stack>
                </Box>
            </Paper>

            {/* Calendar Container */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 4,
                    border: "1px solid var(--color-border)",
                    bgcolor: "white"
                }}
            >
                {/* Custom Calendar Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleToday}
                            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                        >
                            Today
                        </Button>
                        <Stack direction="row" spacing={0.5}>
                            <Button
                                size="small"
                                onClick={handlePrev}
                                sx={{ minWidth: 40, p: 0.5, borderRadius: 2 }}
                            >
                                <ChevronLeftIcon />
                            </Button>
                            <Button
                                size="small"
                                onClick={handleNext}
                                sx={{ minWidth: 40, p: 0.5, borderRadius: 2 }}
                            >
                                <ChevronRightIcon />
                            </Button>
                        </Stack>
                        <Typography variant="h6" sx={{ fontWeight: 700, ml: 2, color: "var(--color-text-dark)" }}>
                            {currentTitle}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} bgcolor="var(--color-bg-hover)" p={0.5} borderRadius={3}>
                        <Button
                            size="small"
                            onClick={() => handleViewChange("dayGridMonth")}
                            startIcon={<CalendarMonthIcon fontSize="small" />}
                            sx={{
                                borderRadius: 2.5,
                                textTransform: "none",
                                fontWeight: 600,
                                px: 2,
                                bgcolor: viewMode === "dayGridMonth" ? "white" : "transparent",
                                color: viewMode === "dayGridMonth" ? "var(--color-primary)" : "var(--color-text-muted)",
                                boxShadow: viewMode === "dayGridMonth" ? "var(--shadow-small)" : "none",
                                "&:hover": { bgcolor: viewMode === "dayGridMonth" ? "white" : "rgba(0,0,0,0.05)" }
                            }}
                        >
                            Month
                        </Button>
                    </Stack>
                </Stack>

                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{
                        "& .fc": {
                            "--fc-border-color": "var(--color-border)",
                            "--fc-today-bg-color": "rgba(139, 92, 246, 0.05)",
                            fontFamily: "inherit"
                        },
                        "& .fc-col-header-cell": {
                            py: 2,
                            bgcolor: "var(--color-bg-hover)",
                            fontWeight: 600,
                            fontSize: "0.875rem"
                        },
                        "& .fc-daygrid-day-number": {
                            p: 1.5,
                            fontSize: "0.875rem",
                            fontWeight: 500
                        },
                        "& .fc-event": {
                            borderRadius: 1.5,
                            p: 0.5,
                            border: "none",
                            cursor: "pointer"
                        }
                    }}>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={calendarEvents}
                            headerToolbar={false}
                            height="auto"
                            datesSet={handleDatesSet}
                            eventClick={handleEventClick}
                        />
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

export default PatientFollowUpsCalendar;
