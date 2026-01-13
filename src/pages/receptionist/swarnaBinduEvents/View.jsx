import { useState, useEffect, useMemo, useRef } from "react";
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Button, 
    Chip, 
    Paper, 
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    IconButton
} from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PlaceIcon from "@mui/icons-material/Place";
import NotesIcon from "@mui/icons-material/Notes";
import CelebrationIcon from "@mui/icons-material/Celebration";
import "../../../assets/css/fullcalendar.min.css";
import HeadingCard from "../../../components/card/HeadingCard";
import swarnaBinduEventService from "../../../services/swarnaBinduEventService";
import { toast } from "react-toastify";

function SwarnaBinduEvents_Calendar() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [calendarView, setCalendarView] = useState("dayGridMonth");
    const [currentTitle, setCurrentTitle] = useState("");
    const [eventDialog, setEventDialog] = useState({
        open: false,
        event: null
    });
    const calendarRef = useRef(null);
    const isInitialMount = useRef(true);
    const isFetching = useRef(false);
    const lastFetchedRange = useRef({ start: null, end: null });

    const fetchEvents = async (start, end) => {
        // Prevent duplicate calls
        if (isFetching.current) {
            console.log('Already fetching, skipping...');
            return;
        }

        // Check if we're fetching the same date range
        const startDateStr = start.toISOString().split('T')[0];
        const endDateStr = end.toISOString().split('T')[0];
        
        if (
            lastFetchedRange.current.start === startDateStr &&
            lastFetchedRange.current.end === endDateStr
        ) {
            console.log('Same date range, skipping fetch');
            setIsLoading(false); // Ensure loading is false
            return;
        }

        try {
            isFetching.current = true;
            setIsLoading(true);
            
            console.log('Fetching events for date range:', startDateStr, 'to', endDateStr);
            
            const response = await swarnaBinduEventService.getEventsByDateRange(startDateStr, endDateStr);
            
            console.log('Events response:', response);
            
            if (response.success) {
                // Transform events to FullCalendar format
                const calendarEvents = (response.data || []).map((event) => {
                    const eventDate = new Date(event.eventDate);
                    let startDateTime = new Date(eventDate);
                    
                    // If start time is provided, parse it and add to date
                    if (event.startTime) {
                        const [hours, minutes] = event.startTime.split(':').map(Number);
                        startDateTime.setHours(hours || 0, minutes || 0, 0, 0);
                    } else {
                        startDateTime.setHours(0, 0, 0, 0);
                    }

                    let endDateTime = new Date(startDateTime);
                    // If end time is provided, use it; otherwise, set to end of day
                    if (event.endTime) {
                        const [hours, minutes] = event.endTime.split(':').map(Number);
                        endDateTime.setHours(hours || 23, minutes || 59, 59, 999);
                    } else {
                        endDateTime.setHours(23, 59, 59, 999);
                    }

                    return {
                        id: event._id,
                        title: event.title,
                        start: startDateTime.toISOString(),
                        end: endDateTime.toISOString(),
                        allDay: !event.startTime && !event.endTime,
                        extendedProps: {
                            description: event.description,
                            location: event.location,
                            startTime: event.startTime,
                            endTime: event.endTime,
                        },
                        backgroundColor: event.isActive ? '#1976d2' : '#9e9e9e',
                        borderColor: event.isActive ? '#1565c0' : '#757575',
                    };
                });
                
                console.log('Transformed calendar events:', calendarEvents);
                setEvents(calendarEvents);
                
                // Update last fetched range BEFORE setting loading to false
                lastFetchedRange.current = {
                    start: startDateStr,
                    end: endDateStr,
                };
            } else {
                console.warn('No events found or response not successful:', response);
                setEvents([]);
                if (response.message) {
                    toast.error(response.message);
                }
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch events";
            console.error("Error details:", error);
            toast.error(errorMessage);
            setEvents([]);
        } finally {
            // Always reset fetching flag and loading state
            isFetching.current = false;
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch for current month
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // Set initial title
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        setCurrentTitle(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);
        
        // Set initial mount to false after component mounts and initial fetch completes
        fetchEvents(start, end)
            .then(() => {
                // Mark initial mount as complete after a short delay
                setTimeout(() => {
                    isInitialMount.current = false;
                }, 1000);
            })
            .catch(err => {
                console.error('Initial fetch error:', err);
                setIsLoading(false);
                isInitialMount.current = false;
            });
    }, []);


    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        const extendedProps = event.extendedProps;
        
        // Format the event date
        const eventDate = new Date(event.start);
        const formattedDate = eventDate.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        setEventDialog({
            open: true,
            event: {
                title: event.title,
                date: formattedDate,
                description: extendedProps.description || '',
                location: extendedProps.location || '',
                startTime: extendedProps.startTime || '',
                endTime: extendedProps.endTime || '',
                backgroundColor: event.backgroundColor || '#1976d2'
            }
        });
    };

    const handleCloseEventDialog = () => {
        setEventDialog({
            open: false,
            event: null
        });
    };

    const handleViewChange = (viewInfo) => {
        // Update the calendar view state when view changes
        const newViewType = viewInfo.view.type;
        console.log('View changed to:', newViewType);
        
        // Only update state if it's different to prevent unnecessary re-renders
        if (calendarView !== newViewType) {
            setCalendarView(newViewType);
        }
        
        // Don't reset fetch range here - let datesSet handle it naturally
        // This prevents infinite loops
    };

    const handleDatesSet = (dateInfo) => {
        setCurrentTitle(dateInfo.view.title);
        // Call the existing handleDatesSet logic
        if (isInitialMount.current) {
            console.log('Skipping datesSet on initial mount');
            return;
        }
        
        if (isFetching.current) {
            console.log('Already fetching, skipping datesSet');
            return;
        }
        
        const startDateStr = dateInfo.start.toISOString().split('T')[0];
        const endDateStr = dateInfo.end.toISOString().split('T')[0];
        
        if (
            lastFetchedRange.current.start !== startDateStr ||
            lastFetchedRange.current.end !== endDateStr
        ) {
            console.log('Date range changed in datesSet, fetching:', startDateStr, 'to', endDateStr);
            fetchEvents(dateInfo.start, dateInfo.end);
        } else {
            console.log('Same date range in datesSet, skipping fetch');
        }
    };

    const handleToday = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.today();
            setCurrentTitle(calendarApi.view.title);
            // datesSet will handle the fetch automatically
        }
    };

    const handlePrev = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.prev();
            setCurrentTitle(calendarApi.view.title);
            // datesSet will handle the fetch automatically
        }
    };

    const handleNext = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.next();
            setCurrentTitle(calendarApi.view.title);
            // datesSet will handle the fetch automatically
        }
    };

    const handleViewSelect = (viewType) => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            console.log('Changing view to:', viewType);
            
            // Update state immediately for button highlighting
            setCalendarView(viewType);
            
            // Change the view - datesSet will automatically handle fetching events
            calendarApi.changeView(viewType);
            setCurrentTitle(calendarApi.view.title);
        }
    };

    const breadcrumbItems = [
        { label: "Receptionist", url: "/receptionist/dashboard" },
        { label: "Swarna Bindu Events" },
    ];

    return (
        <Box sx={{ p: 4 }}>
            <HeadingCard
                title="Swarna Bindu Events"
                subtitle="View and manage Swarna Bindu events on the calendar"
                breadcrumbItems={breadcrumbItems}
            />

            {/* Calendar Container */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 4,
                    border: "1px solid var(--color-border)",
                    bgcolor: "white",
                    mt: 4
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
                            {currentTitle || "Loading..."}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} bgcolor="var(--color-bg-hover)" p={0.5} borderRadius={3}>
                        <Button
                            size="small"
                            onClick={() => handleViewSelect("dayGridMonth")}
                            startIcon={<CalendarMonthIcon fontSize="small" />}
                            sx={{
                                borderRadius: 2.5,
                                textTransform: "none",
                                fontWeight: 600,
                                px: 2,
                                bgcolor: calendarView === "dayGridMonth" ? "white" : "transparent",
                                color: calendarView === "dayGridMonth" ? "var(--color-primary)" : "var(--color-text-muted)",
                                boxShadow: calendarView === "dayGridMonth" ? "var(--shadow-small)" : "none",
                                "&:hover": { bgcolor: calendarView === "dayGridMonth" ? "white" : "rgba(0,0,0,0.05)" }
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
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={false}
                            events={events}
                            eventClick={handleEventClick}
                            datesSet={handleDatesSet}
                            viewDidMount={handleViewChange}
                            height="auto"
                            eventDisplay="block"
                            eventTimeFormat={{
                                hour: "2-digit",
                                minute: "2-digit",
                                meridiem: "short",
                            }}
                            slotMinTime="06:00:00"
                            slotMaxTime="22:00:00"
                            weekends={true}
                            editable={false}
                            selectable={false}
                            dayMaxEvents={true}
                            moreLinkClick="popover"
                            lazyFetching={false}
                            eventContent={(eventInfo) => {
                                return (
                                    <div
                                        style={{
                                            padding: "4px 6px",
                                            fontSize: "0.75rem",
                                            fontWeight: 500,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {eventInfo.event.title}
                                    </div>
                                );
                            }}
                        />
                    </Box>
                )}
            </Paper>

            {/* Event Details Dialog */}
            <Dialog
                open={eventDialog.open}
                onClose={handleCloseEventDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)"
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        pb: 2.5,
                        pt: 3,
                        px: 3,
                        borderBottom: "2px solid var(--color-icon-8-dark)",
                        background: "linear-gradient(135deg, var(--color-icon-8-dark) 0%, var(--color-icon-8) 100%)",
                        color: "white",
                        borderRadius: "12px 12px 0 0",
                        boxShadow: "0 4px 12px rgba(74, 57, 42, 0.3)"
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                bgcolor: "rgba(255, 255, 255, 0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <CelebrationIcon sx={{ fontSize: 28 }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                            Event Details
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseEventDialog}
                        sx={{
                            color: "white",
                            bgcolor: "rgba(255, 255, 255, 0.1)",
                            "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 0.2)",
                                transform: "rotate(90deg)",
                                transition: "all 0.3s ease"
                            },
                            transition: "all 0.3s ease"
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
                    {eventDialog.event && (
                        <Stack spacing={3}>
                            {/* Event Title */}
                            <Box
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    bgcolor: "var(--color-bg-card-hover)",
                                    border: "2px solid var(--color-icon-8)",
                                    borderLeft: "6px solid var(--color-icon-8-dark)"
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: "var(--color-icon-8-dark)",
                                        mb: 0.5,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5
                                    }}
                                >
                                    <EventIcon sx={{ fontSize: 32, color: "var(--color-icon-8)" }} />
                                    {eventDialog.event.title}
                                </Typography>
                            </Box>

                            {/* Event Date */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 2.5,
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: "var(--color-bg-card-hover)",
                                    border: "1px solid var(--color-border)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        bgcolor: "var(--color-bg-card)",
                                        transform: "translateX(4px)",
                                        boxShadow: "0 4px 12px rgba(74, 57, 42, 0.1)"
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: "var(--color-icon-8)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minWidth: 48,
                                        height: 48
                                    }}
                                >
                                    <CalendarTodayIcon
                                        sx={{
                                            color: "white",
                                            fontSize: 28
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "var(--color-icon-8-dark)",
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            mb: 0.5,
                                            display: "block"
                                        }}
                                    >
                                        Event Date
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: "var(--color-text-dark)",
                                            fontWeight: 600,
                                            fontSize: "1.05rem"
                                        }}
                                    >
                                        {eventDialog.event.date}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Event Time */}
                            {(eventDialog.event.startTime || eventDialog.event.endTime) && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 2.5,
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: "var(--color-bg-card-hover)",
                                        border: "1px solid var(--color-border)",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            bgcolor: "var(--color-bg-card)",
                                            transform: "translateX(4px)",
                                            boxShadow: "0 4px 12px rgba(74, 57, 42, 0.1)"
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: "var(--color-icon-4)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            minWidth: 48,
                                            height: 48
                                        }}
                                    >
                                        <ScheduleIcon
                                            sx={{
                                                color: "white",
                                                fontSize: 28
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "var(--color-icon-4-dark)",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: 1,
                                                mb: 0.5,
                                                display: "block"
                                            }}
                                        >
                                            Time Schedule
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: "var(--color-text-dark)",
                                                fontWeight: 600,
                                                fontSize: "1.05rem"
                                            }}
                                        >
                                            {eventDialog.event.startTime && eventDialog.event.endTime
                                                ? `${eventDialog.event.startTime} - ${eventDialog.event.endTime}`
                                                : eventDialog.event.startTime || eventDialog.event.endTime}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Event Location */}
                            {eventDialog.event.location && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 2.5,
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: "var(--color-bg-card-hover)",
                                        border: "1px solid var(--color-border)",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            bgcolor: "var(--color-bg-card)",
                                            transform: "translateX(4px)",
                                            boxShadow: "0 4px 12px rgba(74, 57, 42, 0.1)"
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: "var(--color-icon-5)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            minWidth: 48,
                                            height: 48
                                        }}
                                    >
                                        <PlaceIcon
                                            sx={{
                                                color: "white",
                                                fontSize: 28
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "var(--color-icon-5-dark)",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: 1,
                                                mb: 0.5,
                                                display: "block"
                                            }}
                                        >
                                            Venue Location
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: "var(--color-text-dark)",
                                                fontWeight: 600,
                                                fontSize: "1.05rem"
                                            }}
                                        >
                                            {eventDialog.event.location}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Event Description */}
                            {eventDialog.event.description && (
                                <Box
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 2,
                                        bgcolor: "var(--color-bg-card-hover)",
                                        border: "1px solid var(--color-border)",
                                        borderLeft: "4px solid var(--color-icon-8-dark)"
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                                        <Box
                                            sx={{
                                                p: 1,
                                                borderRadius: 1.5,
                                                bgcolor: "var(--color-icon-8-dark)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            <NotesIcon
                                                sx={{
                                                    color: "white",
                                                    fontSize: 24
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "var(--color-icon-8-dark)",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: 1
                                            }}
                                        >
                                            Event Description
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: "var(--color-text-dark)",
                                            lineHeight: 1.8,
                                            whiteSpace: "pre-wrap",
                                            fontSize: "1rem"
                                        }}
                                    >
                                        {eventDialog.event.description}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2.5,
                        borderTop: "2px solid var(--color-icon-8-dark)",
                        bgcolor: "var(--color-bg-card-hover)",
                        borderRadius: "0 0 12px 12px"
                    }}
                >
                    <Button
                        onClick={handleCloseEventDialog}
                        variant="contained"
                        startIcon={<CloseIcon />}
                        sx={{
                            borderRadius: 2.5,
                            textTransform: "none",
                            fontWeight: 700,
                            px: 4,
                            py: 1,
                            fontSize: "1rem",
                            bgcolor: "var(--color-icon-8-dark)",
                            color: "white",
                            boxShadow: "0 4px 12px rgba(74, 57, 42, 0.3)",
                            "&:hover": {
                                bgcolor: "var(--color-icon-8)",
                                boxShadow: "0 6px 16px rgba(74, 57, 42, 0.4)",
                                transform: "translateY(-2px)",
                                transition: "all 0.3s ease"
                            },
                            transition: "all 0.3s ease"
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default SwarnaBinduEvents_Calendar;

