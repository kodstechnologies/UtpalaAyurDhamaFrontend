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
                        backgroundColor: 'transparent',
                        borderColor: 'transparent',
                        textColor: '#000',
                        classNames: ['swarna-bindu-event'],
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
                            cursor: "pointer",
                            backgroundColor: "transparent !important",
                            color: "#000 !important",
                            fontWeight: "600 !important"
                        },
                        // Style days with Swarna Bindu events - golden background for entire date box
                        "& .fc-daygrid-day.swarna-bindu-day": {
                            backgroundColor: "#FFD700 !important",
                            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%) !important",
                            border: "2px solid #FFA500 !important",
                        },
                        "& .fc-daygrid-day.swarna-bindu-day .fc-daygrid-day-number": {
                            color: "#000 !important",
                            fontWeight: "700 !important",
                        },
                        "& .fc-daygrid-day.swarna-bindu-day .fc-daygrid-day-frame": {
                            backgroundColor: "transparent !important",
                        },
                        "& .fc-daygrid-day.swarna-bindu-day .fc-daygrid-day-events": {
                            backgroundColor: "transparent !important",
                        },
                        "& .fc-daygrid-day.swarna-bindu-day .fc-event": {
                            backgroundColor: "transparent !important",
                            color: "#000 !important",
                            fontWeight: "600 !important"
                        }
                    }}>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={false}
                            events={events}
                            // eventClick={handleEventClick} // Commented out to disable dialog
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
                            dayCellClassNames={(dateInfo) => {
                                // Check if this day has any Swarna Bindu events
                                const dayEvents = events.filter(event => {
                                    const eventDate = new Date(event.start);
                                    return eventDate.toDateString() === dateInfo.date.toDateString();
                                });
                                return dayEvents.length > 0 ? ['swarna-bindu-day'] : [];
                            }}
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

            {/* Event Details Dialog - Commented out as per user request */}
        </Box>
    );
}

export default SwarnaBinduEvents_Calendar;

