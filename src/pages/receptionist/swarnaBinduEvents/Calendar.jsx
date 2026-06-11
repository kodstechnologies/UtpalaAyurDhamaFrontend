import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Paper,
    Stack,
} from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import "../../../assets/css/fullcalendar.min.css";
import HeadingCard from "../../../components/card/HeadingCard";
import RedirectButton from "../../../components/buttons/RedirectButton";
import swarnaBinduEventService from "../../../services/swarnaBinduEventService";
import { toast } from "react-toastify";

function SwarnaBinduEvents_Calendar() {
    const location = useLocation();
    const isAdminView = location.pathname.includes("/admin/");
    const listPath = isAdminView
        ? "/admin/swarna-bindu-events/view"
        : "/receptionist/swarna-bindu-events";

    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [calendarView, setCalendarView] = useState("dayGridMonth");
    const [currentTitle, setCurrentTitle] = useState("");
    const calendarRef = useRef(null);
    const isInitialMount = useRef(true);
    const isFetching = useRef(false);
    const lastFetchedRange = useRef({ start: null, end: null });

    const fetchEvents = async (start, end) => {
        if (isFetching.current) return;

        const startDateStr = start.toISOString().split("T")[0];
        const endDateStr = end.toISOString().split("T")[0];

        if (
            lastFetchedRange.current.start === startDateStr &&
            lastFetchedRange.current.end === endDateStr
        ) {
            setIsLoading(false);
            return;
        }

        try {
            isFetching.current = true;
            setIsLoading(true);

            const response = await swarnaBinduEventService.getEventsByDateRange(startDateStr, endDateStr);

            if (response.success) {
                const calendarEvents = (response.data || []).map((event) => {
                    const eventDate = new Date(event.eventDate);
                    let startDateTime = new Date(eventDate);

                    if (event.startTime) {
                        const [hours, minutes] = event.startTime.split(":").map(Number);
                        startDateTime.setHours(hours || 0, minutes || 0, 0, 0);
                    } else {
                        startDateTime.setHours(0, 0, 0, 0);
                    }

                    let endDateTime = new Date(startDateTime);
                    if (event.endTime) {
                        const [hours, minutes] = event.endTime.split(":").map(Number);
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
                        backgroundColor: "transparent",
                        borderColor: "transparent",
                        textColor: "#000",
                        classNames: ["swarna-bindu-event"],
                    };
                });

                setEvents(calendarEvents);
                lastFetchedRange.current = { start: startDateStr, end: endDateStr };
            } else {
                setEvents([]);
                if (response.message) toast.error(response.message);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch events");
            setEvents([]);
        } finally {
            isFetching.current = false;
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];
        setCurrentTitle(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);

        fetchEvents(start, end).finally(() => {
            setTimeout(() => {
                isInitialMount.current = false;
            }, 1000);
        });
    }, []);

    const handleViewChange = (viewInfo) => {
        const newViewType = viewInfo.view.type;
        if (calendarView !== newViewType) setCalendarView(newViewType);
    };

    const handleDatesSet = (dateInfo) => {
        setCurrentTitle(dateInfo.view.title);
        if (isInitialMount.current || isFetching.current) return;

        const startDateStr = dateInfo.start.toISOString().split("T")[0];
        const endDateStr = dateInfo.end.toISOString().split("T")[0];

        if (
            lastFetchedRange.current.start !== startDateStr ||
            lastFetchedRange.current.end !== endDateStr
        ) {
            fetchEvents(dateInfo.start, dateInfo.end);
        }
    };

    const handleToday = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.today();
            setCurrentTitle(calendarApi.view.title);
        }
    };

    const handlePrev = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.prev();
            setCurrentTitle(calendarApi.view.title);
        }
    };

    const handleNext = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.next();
            setCurrentTitle(calendarApi.view.title);
        }
    };

    const handleViewSelect = (viewType) => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            setCalendarView(viewType);
            calendarApi.changeView(viewType);
            setCurrentTitle(calendarApi.view.title);
        }
    };

    const breadcrumbItems = isAdminView
        ? [
            { label: "Admin", url: "/admin/dashboard" },
            { label: "Swarna Bindu Events", url: listPath },
            { label: "Calendar" },
        ]
        : [
            { label: "Receptionist", url: "/receptionist/dashboard" },
            { label: "Swarna Bindu Events", url: listPath },
            { label: "Calendar" },
        ];

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Swarna Bindu Events"
                subtitle="View and manage Swarna Bindu events on the calendar"
                breadcrumbItems={breadcrumbItems}
                action={<RedirectButton text="Manage Events" link={listPath} />}
            />

            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 4,
                    border: "1px solid var(--color-border)",
                    bgcolor: "white",
                    mt: 2,
                }}
            >
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
                            <Button size="small" onClick={handlePrev} sx={{ minWidth: 40, p: 0.5, borderRadius: 2 }}>
                                <ChevronLeftIcon />
                            </Button>
                            <Button size="small" onClick={handleNext} sx={{ minWidth: 40, p: 0.5, borderRadius: 2 }}>
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
                                "&:hover": { bgcolor: calendarView === "dayGridMonth" ? "white" : "rgba(0,0,0,0.05)" },
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
                    <Box
                        sx={{
                            "& .fc": {
                                "--fc-border-color": "var(--color-border)",
                                "--fc-today-bg-color": "rgba(139, 92, 246, 0.05)",
                                fontFamily: "inherit",
                            },
                            "& .fc-col-header-cell": {
                                py: 2,
                                bgcolor: "var(--color-bg-hover)",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                            },
                            "& .fc-daygrid-day-number": {
                                p: 1.5,
                                fontSize: "0.875rem",
                                fontWeight: 500,
                            },
                            "& .fc-event": {
                                borderRadius: 1.5,
                                p: 0.5,
                                border: "none",
                                cursor: "pointer",
                                backgroundColor: "transparent !important",
                                color: "#000 !important",
                                fontWeight: "600 !important",
                            },
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
                                fontWeight: "600 !important",
                            },
                        }}
                    >
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={false}
                            events={events}
                            datesSet={handleDatesSet}
                            viewDidMount={handleViewChange}
                            height="auto"
                            eventDisplay="block"
                            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", meridiem: "short" }}
                            slotMinTime="06:00:00"
                            slotMaxTime="22:00:00"
                            weekends
                            editable={false}
                            selectable={false}
                            dayMaxEvents
                            moreLinkClick="popover"
                            lazyFetching={false}
                            dayCellClassNames={(dateInfo) => {
                                const dayEvents = events.filter((event) => {
                                    const eventDate = new Date(event.start);
                                    return eventDate.toDateString() === dateInfo.date.toDateString();
                                });
                                return dayEvents.length > 0 ? ["swarna-bindu-day"] : [];
                            }}
                            eventContent={(eventInfo) => (
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
                            )}
                        />
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

export default SwarnaBinduEvents_Calendar;
