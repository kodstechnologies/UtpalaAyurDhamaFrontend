import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Chip } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import HistoryIcon from "@mui/icons-material/History";
import TableChartIcon from "@mui/icons-material/TableChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import "../../../assets/css/fullcalendar.min.css";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function Therapy_Progress() {
    const [search, setSearch] = useState("");
    const [hoveredButton, setHoveredButton] = useState(null);
    const [viewMode, setViewMode] = useState("table"); // "table" or "calendar"
    const [calendarView, setCalendarView] = useState("dayGridMonth"); // "dayGridMonth", "timeGridWeek", "timeGridDay", "listWeek"
    const calendarRef = useRef(null);
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl("therapist-sessions/my-sessions"),
                { headers: getAuthHeaders() }
            );
            if (response.data.success) {
                setSessions(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
            toast.error("Failed to load therapy sessions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Therapist", url: "/therapist" },
        { label: "Therapy Progress" },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Completed":
                return "bg-success";
            case "In Progress":
                return "bg-primary";
            case "Scheduled":
                return "bg-info";
            case "Pending":
                return "bg-warning";
            case "Cancelled":
                return "bg-danger";
            case "Missed":
                return "bg-danger";
            default:
                return "bg-secondary";
        }
    };

    // Group sessions by patient + examination (or treatmentPlan if no examination)
    const groupedSessions = useMemo(() => {
        const groups = new Map();
        
        sessions.forEach((session) => {
            // Create a unique key: patientId + examinationId (or treatmentPlanId)
            const patientId = session.patient?._id?.toString() || session.patient?.toString() || "";
            const examinationId = session.examination?._id?.toString() || session.examination?.toString() || "";
            const treatmentPlanId = session.treatmentPlan?._id?.toString() || session.treatmentPlan?.toString() || "";
            
            // Use examination as primary grouping key, fallback to treatmentPlan
            const groupKey = examinationId || treatmentPlanId || `patient-${patientId}`;
            const fullKey = `${patientId}-${groupKey}`;
            
            if (!groups.has(fullKey)) {
                groups.set(fullKey, {
                    patient: session.patient,
                    examination: session.examination,
                    treatmentPlan: session.treatmentPlan,
                    sessions: [],
                    // Use the first session's common fields
                    inpatient: session.inpatient,
                    status: session.status,
                    sessionDate: session.sessionDate,
                    sessionTime: session.sessionTime,
                    timeline: session.timeline,
                    createdAt: session.createdAt,
                });
            }
            
            groups.get(fullKey).sessions.push(session);
        });
        
        // Convert map to array and process each group
        return Array.from(groups.values()).map((group) => {
            // Aggregate therapies
            const therapies = group.sessions.map(s => ({
                treatmentName: s.treatmentName || "N/A",
                subTherapy: s.subTherapy || "",
                duration: s.duration || "",
                treatmentDescription: s.treatmentDescription || "",
                daysOfTreatment: s.daysOfTreatment || 0,
                days: s.days || [],
                status: s.status,
                _id: s._id,
            }));
            
            // Calculate total sessions - use the maximum daysOfTreatment from all therapies
            // (since they're assigned together, they share the same session count)
            const totalSessions = Math.max(...group.sessions.map(s => s.daysOfTreatment || 0), 0);
            
            // Aggregate completed sessions from all therapies
            const totalCompleted = group.sessions.reduce((sum, s) => {
                const completed = Array.isArray(s.days) ? s.days.filter(d => d.completed).length : 0;
                return sum + completed;
            }, 0);
            
            // Determine overall status (use most advanced status)
            const statusPriority = { "Completed": 4, "In Progress": 3, "Scheduled": 2, "Pending": 1, "Cancelled": 0 };
            const overallStatus = group.sessions.reduce((prev, curr) => {
                const prevPriority = statusPriority[prev.status] || 0;
                const currPriority = statusPriority[curr.status] || 0;
                return currPriority > prevPriority ? curr.status : prev.status;
            }, group.sessions[0]?.status || "Pending");
            
            return {
                ...group,
                therapies,
                totalSessions,
                totalCompleted,
                status: overallStatus,
                // Use first session's ID for navigation/actions
                primarySessionId: group.sessions[0]?._id,
                // All session IDs for reference
                sessionIds: group.sessions.map(s => s._id),
            };
        });
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        if (!search) return groupedSessions;
        const searchLower = search.toLowerCase();
        return groupedSessions.filter(
            (group) => {
                const patientName = group.patient?.user?.name || "";
                const uhid = group.patient?.user?.uhid || "";
                const therapyNames = group.therapies.map(t => t.treatmentName).join(" ");
                const status = group.status || "";
                return (
                    patientName.toLowerCase().includes(searchLower) ||
                    uhid.toLowerCase().includes(searchLower) ||
                    therapyNames.toLowerCase().includes(searchLower) ||
                    status.toLowerCase().includes(searchLower)
                );
            }
        );
    }, [groupedSessions, search]);

    const handleStartSession = async (sessionId) => {
        toast.info("Initializing session execution...", { autoClose: 1000 });
        try {
            // First mark as In Progress if not already (backend logic handles idempotency)
            const response = await axios.patch(
                getApiUrl(`therapist-sessions/${sessionId}`),
                { status: "In Progress" },
                { headers: getAuthHeaders() }
            );
            if (response.data.success) {
                toast.success("Session started - Loading execution tracker");
                navigate(`/therapist/therapy-progress/execution/${sessionId}`);
            }
        } catch (error) {
            console.error("Error starting session:", error);
            toast.error("Failed to start session");
        }
    };

    const handleStopSession = async (sessionId) => {
        try {
            const response = await axios.patch(
                getApiUrl(`therapist-sessions/${sessionId}`),
                { status: "Completed" },
                { headers: getAuthHeaders() }
            );
            if (response.data.success) {
                toast.success("Session completed successfully");
                fetchSessions();
            }
        } catch (error) {
            console.error("Error completing session:", error);
            toast.error("Failed to complete session");
        }
    };

    const handleViewDetails = (session) => {
        if (session) {
            navigate(`/therapist/therapy-progress/details?sessionId=${session._id}`, {
                state: { session }
            });
        }
    };

    // Convert sessions to FullCalendar events
    const calendarEvents = useMemo(() => {
        return sessions.flatMap((session) => {
            // If the session has a days array, show each day on the calendar
            if (session.days && session.days.length > 0) {
                return session.days.map((day, idx) => {
                    const date = new Date(day.date).toISOString().split("T")[0];
                    const startTime = day.time || session.sessionTime || "10:00";
                    // End time is roughly 1 hour after start
                    const [h, m] = startTime.split(":").map(Number);
                    const endH = String((h + 1) % 24).padStart(2, "0");
                    const endTime = `${endH}:${String(m).padStart(2, "0")}`;

                    const startDateTime = `${date}T${startTime}`;
                    const endDateTime = `${date}T${endTime}`;

                    // Color based on status
                    let backgroundColor = day.completed ? "#28a745" : "#8B5CF6";
                    if (session.status === "In Progress" && !day.completed) {
                        // Check if this is the "active" day
                        const todayStr = new Date().toISOString().split("T")[0];
                        if (date === todayStr) backgroundColor = "#0dcaf0";
                    }

                    // Include sub-therapy in calendar title if available
                    const title = session.subTherapy 
                        ? `${session.treatmentName} (${session.subTherapy}) - ${session.patient?.user?.name}`
                        : `${session.treatmentName} - ${session.patient?.user?.name}`;
                    
                    return {
                        id: `${session._id}-${idx}`,
                        title: title,
                        start: startDateTime,
                        end: endDateTime,
                        backgroundColor: backgroundColor,
                        borderColor: backgroundColor,
                        extendedProps: {
                            session: session,
                            day: day
                        }
                    };
                });
            }

            // If we have realized days, show them
            const realizedDays = Array.isArray(session.days) ? session.days : [];

            const daysCount = Number(session.daysOfTreatment) || 1;
            const timeline = session.timeline || "Daily";
            const stepDays = timeline === "Weekly" ? 7 : (timeline === "AlternateDay" ? 2 : 1);
            const startDate = session.sessionDate ? new Date(session.sessionDate) : new Date();
            const time = session.sessionTime || "10:00";

            const events = [];
            for (let i = 0; i < daysCount; i++) {
                const currentSlotDate = new Date(startDate);
                currentSlotDate.setDate(startDate.getDate() + i * stepDays);

                const dateStr = currentSlotDate.toISOString().split("T")[0];
                const startDateTime = `${dateStr}T${time}`;

                // Estimate end time (e.g., 1 hour later)
                const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString().split(".")[0];

                // Check if this day is already recorded in session.days
                const recordedDay = realizedDays.find(d => {
                    const dDate = new Date(d.date);
                    return dDate.toDateString() === currentSlotDate.toDateString();
                });

                let status = "Scheduled";
                if (recordedDay) {
                    status = recordedDay.completed ? "Completed" : (session.status === "In Progress" ? "In Progress" : "Scheduled");
                } else {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const slotDateNoTime = new Date(currentSlotDate);
                    slotDateNoTime.setHours(0, 0, 0, 0);

                    if (slotDateNoTime < today) {
                        status = "Missed";
                    } else if (slotDateNoTime.getTime() === today.getTime()) {
                        status = session.status === "In Progress" ? "In Progress" : "Pending";
                    }
                }

                let backgroundColor = "#6c757d";
                switch (status) {
                    case "Completed": backgroundColor = "#28a745"; break;
                    case "In Progress": backgroundColor = "#0dcaf0"; break;
                    case "Scheduled": backgroundColor = "#8B5CF6"; break;
                    case "Pending": backgroundColor = "#ffc107"; break;
                    case "Missed": backgroundColor = "#DC2626"; break;
                }

                events.push({
                    id: `${session._id}-${i}`,
                    title: `${session.treatmentName} - ${session.patient?.user?.name || "Unknown"}`,
                    start: startDateTime,
                    end: endDateTime,
                    backgroundColor: backgroundColor,
                    borderColor: backgroundColor,
                    extendedProps: {
                        session: session,
                        slotIndex: i,
                        status: status
                    },
                });
            }
            return events;
        });
    }, [sessions]);

    const handleEventClick = (clickInfo) => {
        const session = clickInfo.event.extendedProps.session;
        handleViewDetails(session);
    };

    const handleDatesSet = (dateInfo) => {
        // Handle date navigation
        console.log("Calendar dates changed:", dateInfo);
    };

    const handleViewChange = (view) => {
        setCalendarView(view.view.type);
    };

    const handleToday = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.today();
        }
    };

    const handlePrev = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.prev();
        }
    };

    const handleNext = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.next();
        }
    };

    return (
        <Box sx={{ padding: "20px" }}>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Page Heading */}
            <HeadingCard
                category="THERAPY PROGRESS"
                title="My Therapy Appointments"
                subtitle="View and manage your scheduled therapy sessions"
                action={
                    <div
                        style={{
                            position: "relative",
                            display: "inline-flex",
                            backgroundColor: "#6B4423",
                            borderRadius: "50px",
                            padding: "3px",
                            gap: 0,
                            minWidth: "140px",
                        }}
                    >
                        {/* Sliding white pill */}
                        <div
                            style={{
                                position: "absolute",
                                top: "3px",
                                left: viewMode === "table" ? "3px" : "calc(50% + 3px)",
                                width: "calc(50% - 3px)",
                                height: "calc(100% - 6px)",
                                backgroundColor: "#ffffff",
                                borderRadius: "50px",
                                border: "2px solid #6B4423",
                                transition: "left 0.3s ease",
                                zIndex: 1,
                            }}
                        />
                        {/* Table Button */}
                        <button
                            type="button"
                            onClick={() => setViewMode("table")}
                            style={{
                                position: "relative",
                                zIndex: 2,
                                backgroundColor: "transparent",
                                border: "none",
                                color: viewMode === "table" ? "#6B4423" : "#ffffff",
                                padding: "6px 16px",
                                fontSize: "0.8125rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                borderRadius: "50px",
                                transition: "color 0.3s ease",
                                flex: 1,
                            }}
                        >
                            <TableChartIcon style={{ fontSize: "14px" }} />
                            Table
                        </button>
                        {/* Calendar Button */}
                        <button
                            type="button"
                            onClick={() => setViewMode("calendar")}
                            style={{
                                position: "relative",
                                zIndex: 2,
                                backgroundColor: "transparent",
                                border: "none",
                                color: viewMode === "calendar" ? "#6B4423" : "#ffffff",
                                padding: "6px 16px",
                                fontSize: "0.8125rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                borderRadius: "50px",
                                transition: "color 0.3s ease",
                                flex: 1,
                            }}
                        >
                            <CalendarMonthIcon style={{ fontSize: "14px" }} />
                            Calendar
                        </button>
                    </div>
                }
            />

            {/* Calendar Controls */}
            {viewMode === "calendar" && (
                <Box sx={{ marginTop: 3 }}>
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm"
                                        onClick={handleToday}
                                        style={{
                                            backgroundColor: "#D4A574",
                                            borderColor: "#D4A574",
                                            color: "#000",
                                            borderRadius: "8px",
                                            padding: "6px 14px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Today
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm"
                                        onClick={handlePrev}
                                        style={{
                                            backgroundColor: "#D4A574",
                                            borderColor: "#D4A574",
                                            color: "#000",
                                            borderRadius: "8px",
                                            padding: "6px 14px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm"
                                        onClick={handleNext}
                                        style={{
                                            backgroundColor: "#D4A574",
                                            borderColor: "#D4A574",
                                            color: "#000",
                                            borderRadius: "8px",
                                            padding: "6px 14px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${calendarView === "dayGridMonth" ? "active" : ""}`}
                                        onClick={() => {
                                            if (calendarRef.current) {
                                                calendarRef.current.getApi().changeView("dayGridMonth");
                                            }
                                        }}
                                        style={{
                                            backgroundColor: calendarView === "dayGridMonth" ? "#D4A574" : "#f8f9fa",
                                            borderColor: "#D4A574",
                                            color: calendarView === "dayGridMonth" ? "#000" : "#495057",
                                            borderRadius: "8px",
                                            padding: "6px 14px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Month
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${calendarView === "timeGridWeek" ? "active" : ""}`}
                                        onClick={() => {
                                            if (calendarRef.current) {
                                                calendarRef.current.getApi().changeView("timeGridWeek");
                                            }
                                        }}
                                        style={{
                                            backgroundColor: calendarView === "timeGridWeek" ? "#D4A574" : "#f8f9fa",
                                            borderColor: "#D4A574",
                                            color: calendarView === "timeGridWeek" ? "#000" : "#495057",
                                            borderRadius: "8px",
                                            padding: "6px 14px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Week
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${calendarView === "timeGridDay" ? "active" : ""}`}
                                        onClick={() => {
                                            if (calendarRef.current) {
                                                calendarRef.current.getApi().changeView("timeGridDay");
                                            }
                                        }}
                                        style={{
                                            backgroundColor: calendarView === "timeGridDay" ? "#D4A574" : "#f8f9fa",
                                            borderColor: "#D4A574",
                                            color: calendarView === "timeGridDay" ? "#000" : "#495057",
                                            borderRadius: "8px",
                                            padding: "6px 14px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Day
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${calendarView === "listWeek" ? "active" : ""}`}
                                        onClick={() => {
                                            if (calendarRef.current) {
                                                calendarRef.current.getApi().changeView("listWeek");
                                            }
                                        }}
                                        style={{
                                            backgroundColor: calendarView === "listWeek" ? "#D4A574" : "#f8f9fa",
                                            borderColor: "#D4A574",
                                            color: calendarView === "listWeek" ? "#000" : "#495057",
                                            borderRadius: "8px",
                                            padding: "6px 14px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Agenda
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Box>
            )}

            {/* Therapy Sessions Table */}
            {viewMode === "table" && (
                <Box sx={{ marginTop: 3 }}>
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="card-title mb-0">Therapy Sessions</h5>
                            </div>

                            {/* Search */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <SearchIcon />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by patient name, treatment, or status..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isLoading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 5 }}>
                                    <CircularProgress />
                                </Box>
                            ) : filteredSessions.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th style={{ fontSize: "0.875rem" }}>Sl. No.</th>
                                                <th style={{ fontSize: "0.875rem" }}>UHID</th>
                                                <th style={{ fontSize: "0.875rem" }}>Patient Name</th>
                                                <th style={{ fontSize: "0.875rem" }}>Treatment</th>
                                                <th style={{ fontSize: "0.875rem" }}>Sessions Progress</th>
                                                <th style={{ fontSize: "0.875rem" }}>Flow Type</th>
                                                <th style={{ fontSize: "0.875rem" }}>Status</th>
                                                <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSessions.map((group, index) => {
                                                const isIPD = !!group.inpatient || group.patient?.inpatient;
                                                // Use primary session for actions (first session in group)
                                                const primarySession = group.sessions[0];
                                                
                                                return (
                                                    <tr key={group.primarySessionId || `group-${index}`}>
                                                        <td style={{ fontSize: "0.875rem" }}>{index + 1}</td>
                                                        <td style={{ fontSize: "0.875rem" }}>{group.patient?.user?.uhid || "N/A"}</td>
                                                        <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                            {group.patient?.user?.name || "Unknown"}
                                                        </td>
                                                        <td style={{ fontSize: "0.875rem" }}>
                                                            <div>
                                                                {/* Group therapies by sub-therapy if they share the same one */}
                                                                {(() => {
                                                                    // Check if all therapies have the same sub-therapy
                                                                    const uniqueSubTherapies = [...new Set(group.therapies.map(t => t.subTherapy || ""))];
                                                                    const hasCommonSubTherapy = uniqueSubTherapies.length === 1 && uniqueSubTherapies[0] !== "";
                                                                    
                                                                    if (hasCommonSubTherapy) {
                                                                        // Show main therapies side by side, sub-therapy once below
                                                                        return (
                                                                            <div>
                                                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                                                                                    {group.therapies.map((therapy, idx) => (
                                                                                        <span key={idx} style={{ fontWeight: 500 }}>
                                                                                            {therapy.treatmentName}
                                                                                            {idx < group.therapies.length - 1 && <span style={{ margin: "0 4px", color: "#6c757d" }}>•</span>}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                                <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: "4px" }}>
                                                                                    Sub-Therapy: {uniqueSubTherapies[0]}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        // Show each therapy with its own sub-therapy
                                                                        return (
                                                                            <div>
                                                                                {group.therapies.map((therapy, idx) => (
                                                                                    <div key={idx} style={{ marginBottom: idx < group.therapies.length - 1 ? "8px" : "0" }}>
                                                                                        <div style={{ fontWeight: 500 }}>{therapy.treatmentName}</div>
                                                                                        {therapy.subTherapy && (
                                                                                            <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: "2px" }}>
                                                                                                Sub-Therapy: {therapy.subTherapy}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        );
                                                                    }
                                                                })()}
                                                            </div>
                                                        </td>
                                                        <td style={{ fontSize: "0.875rem" }}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                <div style={{
                                                                    fontSize: "0.75rem",
                                                                    fontWeight: 600,
                                                                    color: "#2D3748",
                                                                    backgroundColor: "#EDF2F7",
                                                                    padding: "2px 8px",
                                                                    borderRadius: "4px"
                                                                }}>
                                                                    {group.totalCompleted} / {group.totalSessions}
                                                                </div>
                                                                <Typography variant="caption" color="text.secondary">Sessions</Typography>
                                                            </Box>
                                                        </td>
                                                        <td style={{ fontSize: "0.875rem" }}>
                                                            <span
                                                                className="badge"
                                                                style={{
                                                                    backgroundColor: isIPD ? "#e3f2fd" : "#f3e5f5",
                                                                    color: isIPD ? "#1976d2" : "#7b1fa2",
                                                                    borderRadius: "50px",
                                                                    padding: "4px 10px",
                                                                    fontSize: "0.75rem",
                                                                }}
                                                            >
                                                                {isIPD ? "[IP]" : "[OP]"} {isIPD ? "Inpatient" : "Outpatient"}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: "0.875rem" }}>
                                                            <span
                                                                className={`badge ${getStatusBadgeClass(group.status)}`}
                                                                style={{
                                                                    borderRadius: "50px",
                                                                    padding: "4px 10px",
                                                                    fontSize: "0.75rem",
                                                                }}
                                                            >
                                                                {group.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: "0.875rem" }}>
                                                            <div className="d-flex gap-2 justify-content-center">
                                                                <div style={{ position: "relative", display: "inline-block" }}>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm"
                                                                        onClick={() => handleViewDetails(primarySession)}
                                                                        onMouseEnter={() => setHoveredButton(`view-${group.primarySessionId}`)}
                                                                        onMouseLeave={() => setHoveredButton(null)}
                                                                        style={{
                                                                            backgroundColor: "#D4A574",
                                                                            borderColor: "#D4A574",
                                                                            color: "#000",
                                                                            borderRadius: "8px",
                                                                            padding: "6px 8px",
                                                                            fontWeight: 500,
                                                                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                            transition: "all 0.3s ease",
                                                                            minWidth: "40px",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                        }}
                                                                    >
                                                                        <VisibilityIcon fontSize="small" />
                                                                    </button>
                                                                    {hoveredButton === `view-${group.primarySessionId}` && (
                                                                        <div
                                                                            style={{
                                                                                position: "absolute",
                                                                                top: "-35px",
                                                                                left: "50%",
                                                                                transform: "translateX(-50%)",
                                                                                backgroundColor: "rgba(0, 0, 0, 0.8)",
                                                                                color: "white",
                                                                                padding: "4px 8px",
                                                                                borderRadius: "4px",
                                                                                whiteSpace: "nowrap",
                                                                                zIndex: 1000,
                                                                                pointerEvents: "none",
                                                                            }}
                                                                        >
                                                                            View Details
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {group.status === "Pending" || group.status === "Scheduled" ? (
                                                                    <div style={{ position: "relative", display: "inline-block" }}>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm"
                                                                            onClick={() => handleStartSession(group.primarySessionId)}
                                                                            onMouseEnter={() => setHoveredButton(`start-${group.primarySessionId}`)}
                                                                            onMouseLeave={() => setHoveredButton(null)}
                                                                            style={{
                                                                                backgroundColor: "#28a745",
                                                                                borderColor: "#28a745",
                                                                                color: "#fff",
                                                                                borderRadius: "8px",
                                                                                padding: "6px 8px",
                                                                                fontWeight: 500,
                                                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                                transition: "all 0.3s ease",
                                                                                minWidth: "40px",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                            }}
                                                                        >
                                                                            <PlayArrowIcon fontSize="small" />
                                                                        </button>
                                                                        {hoveredButton === `start-${group.primarySessionId}` && (
                                                                            <div
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "-35px",
                                                                                    left: "50%",
                                                                                    transform: "translateX(-50%)",
                                                                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                                                                    color: "white",
                                                                                    padding: "4px 8px",
                                                                                    borderRadius: "4px",
                                                                                    whiteSpace: "nowrap",
                                                                                    zIndex: 1000,
                                                                                    pointerEvents: "none",
                                                                                }}
                                                                            >
                                                                                Execute / Progress Tracker
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : group.status === "In Progress" ? (
                                                                    <div style={{ position: "relative", display: "inline-block" }}>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm"
                                                                            onClick={() => navigate(`/therapist/therapy-progress/execution/${group.primarySessionId}`)}
                                                                            onMouseEnter={() => setHoveredButton(`stop-${group.primarySessionId}`)}
                                                                            onMouseLeave={() => setHoveredButton(null)}
                                                                            style={{
                                                                                backgroundColor: "#ffc107",
                                                                                borderColor: "#ffc107",
                                                                                color: "#000",
                                                                                borderRadius: "8px",
                                                                                padding: "6px 8px",
                                                                                fontWeight: 500,
                                                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                                transition: "all 0.3s ease",
                                                                                minWidth: "40px",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                            }}
                                                                        >
                                                                            <StopIcon fontSize="small" />
                                                                        </button>
                                                                        {hoveredButton === `stop-${group.primarySessionId}` && (
                                                                            <div
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "-35px",
                                                                                    left: "50%",
                                                                                    transform: "translateX(-50%)",
                                                                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                                                                    color: "white",
                                                                                    padding: "4px 8px",
                                                                                    borderRadius: "4px",
                                                                                    whiteSpace: "nowrap",
                                                                                    zIndex: 1000,
                                                                                    pointerEvents: "none",
                                                                                }}
                                                                            >
                                                                                Update Session Progress
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : group.status === "Completed" ? (
                                                                    <div style={{ position: "relative", display: "inline-block" }}>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm"
                                                                            onClick={() => navigate(`/therapist/therapy-progress/execution/${group.primarySessionId}`)}
                                                                            onMouseEnter={() => setHoveredButton(`review-${group.primarySessionId}`)}
                                                                            onMouseLeave={() => setHoveredButton(null)}
                                                                            style={{
                                                                                backgroundColor: "#17a2b8",
                                                                                borderColor: "#17a2b8",
                                                                                color: "#fff",
                                                                                borderRadius: "8px",
                                                                                padding: "6px 8px",
                                                                                fontWeight: 500,
                                                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                                transition: "all 0.3s ease",
                                                                                minWidth: "40px",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                            }}
                                                                        >
                                                                            <HistoryIcon fontSize="small" />
                                                                        </button>
                                                                        {hoveredButton === `review-${group.primarySessionId}` && (
                                                                            <div
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "-35px",
                                                                                    left: "50%",
                                                                                    transform: "translateX(-50%)",
                                                                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                                                                    color: "white",
                                                                                    padding: "4px 8px",
                                                                                    borderRadius: "4px",
                                                                                    whiteSpace: "nowrap",
                                                                                    zIndex: 1000,
                                                                                    pointerEvents: "none",
                                                                                }}
                                                                            >
                                                                                Review Execution History
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted">No therapy sessions found. Try adjusting your search query.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Box>
            )}

            {/* Calendar View */}
            {viewMode === "calendar" && (
                <Box sx={{ marginTop: 3 }}>
                    <div className="card shadow-sm">
                        <div className="card-body" style={{ padding: "20px" }}>
                            <div style={{ minHeight: "600px" }}>
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                                    initialView={calendarView}
                                    headerToolbar={false}
                                    events={calendarEvents}
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
                                                }}
                                            >
                                                <div style={{ fontWeight: 600 }}>{eventInfo.event.title.split(" - ")[0]}</div>
                                                <div style={{ fontSize: "0.7rem", opacity: 0.9 }}>
                                                    {eventInfo.event.title.split(" - ")[1]}
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </Box>
            )}

            {/* Status Legend */}
            <Box sx={{ marginTop: 3 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h6 className="card-title mb-3">Status Legend</h6>
                        <div className="d-flex flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <span
                                    className="badge bg-success"
                                    style={{ borderRadius: "50px", padding: "4px 10px", fontSize: "0.75rem" }}
                                >
                                    Completed
                                </span>
                                <span style={{ fontSize: "0.875rem" }}>Session completed successfully</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span
                                    className="badge bg-primary"
                                    style={{ borderRadius: "50px", padding: "4px 10px", fontSize: "0.75rem" }}
                                >
                                    In Progress
                                </span>
                                <span style={{ fontSize: "0.875rem" }}>Session currently ongoing</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span
                                    className="badge bg-info"
                                    style={{ borderRadius: "50px", padding: "4px 10px", fontSize: "0.75rem" }}
                                >
                                    Scheduled
                                </span>
                                <span style={{ fontSize: "0.875rem" }}>Session scheduled for future</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span
                                    className="badge bg-warning"
                                    style={{ borderRadius: "50px", padding: "4px 10px", fontSize: "0.75rem" }}
                                >
                                    Pending
                                </span>
                                <span style={{ fontSize: "0.875rem" }}>Awaiting confirmation</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span
                                    className="badge bg-danger"
                                    style={{ borderRadius: "50px", padding: "4px 10px", fontSize: "0.75rem" }}
                                >
                                    Cancelled
                                </span>
                                <span style={{ fontSize: "0.875rem" }}>Session cancelled</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span
                                    className="badge"
                                    style={{
                                        backgroundColor: "#DC2626",
                                        borderRadius: "50px",
                                        padding: "4px 10px",
                                        fontSize: "0.75rem",
                                        color: "#fff",
                                    }}
                                >
                                    Missed
                                </span>
                                <span style={{ fontSize: "0.875rem" }}>Session missed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Box>

        </Box>
    );
}

export default Therapy_Progress;
