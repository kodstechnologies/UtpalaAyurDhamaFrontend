import { useState, useEffect, useMemo, useRef } from "react";
import { Box, Typography, CircularProgress, Button, Chip } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import "../../../assets/css/fullcalendar.min.css";
import HeadingCard from "../../../components/card/HeadingCard";
import swarnaBinduEventService from "../../../services/swarnaBinduEventService";
import { toast } from "react-toastify";

function SwarnaBinduEvents_Calendar() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [calendarView, setCalendarView] = useState("dayGridMonth");
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

    const handleDatesSet = (dateInfo) => {
        // Don't fetch on initial mount to prevent infinite loop
        if (isInitialMount.current) {
            console.log('Skipping datesSet on initial mount');
            return;
        }
        
        // Prevent duplicate calls
        if (isFetching.current) {
            console.log('Already fetching, skipping datesSet');
            return;
        }
        
        const startDateStr = dateInfo.start.toISOString().split('T')[0];
        const endDateStr = dateInfo.end.toISOString().split('T')[0];
        
        // Only fetch if the range has changed
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

    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        const extendedProps = event.extendedProps;
        
        let eventDetails = `${event.title}\n\n`;
        
        if (extendedProps.description) {
            eventDetails += `Description: ${extendedProps.description}\n\n`;
        }
        
        if (extendedProps.location) {
            eventDetails += `Location: ${extendedProps.location}\n\n`;
        }
        
        if (extendedProps.startTime || extendedProps.endTime) {
            eventDetails += `Time: `;
            if (extendedProps.startTime) {
                eventDetails += extendedProps.startTime;
            }
            if (extendedProps.endTime) {
                eventDetails += ` - ${extendedProps.endTime}`;
            }
            eventDetails += `\n`;
        }
        
        alert(eventDetails);
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

    const handleToday = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.today();
            // datesSet will handle the fetch automatically
        }
    };

    const handlePrev = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.prev();
            // datesSet will handle the fetch automatically
        }
    };

    const handleNext = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.next();
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
        }
    };

    const breadcrumbItems = [
        { label: "Receptionist", url: "/receptionist/dashboard" },
        { label: "Swarna Bindu Events" },
    ];

    return (
        <Box sx={{ padding: "20px" }}>
            {/* Breadcrumb */}
            <HeadingCard
                category="SWARNA BINDU EVENTS"
                title="Events Calendar"
                subtitle="View Swarna Bindu events on the calendar"
                breadcrumbItems={breadcrumbItems}
            />

            {/* Calendar Controls */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 3,
                    marginBottom: 2,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleToday}
                    >
                        Today
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handlePrev}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                        variant={calendarView === "dayGridMonth" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleViewSelect("dayGridMonth")}
                        sx={{
                            minWidth: "80px",
                            fontWeight: calendarView === "dayGridMonth" ? 600 : 400,
                            textTransform: "none",
                        }}
                    >
                        Month
                    </Button>
                    <Button
                        variant={calendarView === "timeGridWeek" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleViewSelect("timeGridWeek")}
                        sx={{
                            minWidth: "80px",
                            fontWeight: calendarView === "timeGridWeek" ? 600 : 400,
                            textTransform: "none",
                        }}
                    >
                        Week
                    </Button>
                    <Button
                        variant={calendarView === "timeGridDay" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleViewSelect("timeGridDay")}
                        sx={{
                            minWidth: "80px",
                            fontWeight: calendarView === "timeGridDay" ? 600 : 400,
                            textTransform: "none",
                        }}
                    >
                        Day
                    </Button>
                    <Button
                        variant={calendarView === "listWeek" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleViewSelect("listWeek")}
                        sx={{
                            minWidth: "80px",
                            fontWeight: calendarView === "listWeek" ? 600 : 400,
                            textTransform: "none",
                        }}
                    >
                        List
                    </Button>
                </Box>
            </Box>

            {/* Calendar */}
            <Box sx={{ marginTop: 3, padding: "0 20px" }}>
                <div className="card shadow-sm">
                    <div className="card-body" style={{ padding: "20px" }}>
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "600px" }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <div style={{ minHeight: "600px", width: "100%" }}>
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
                            </div>
                        )}
                    </div>
                </div>
            </Box>
        </Box>
    );
}

export default SwarnaBinduEvents_Calendar;

