import { useState, useMemo, useRef } from "react";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import TableChartIcon from "@mui/icons-material/TableChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import "../../../assets/css/fullcalendar.min.css";

function Therapy_Progress() {
    const [search, setSearch] = useState("");
    const [hoveredButton, setHoveredButton] = useState(null);
    const [viewMode, setViewMode] = useState("table"); // "table" or "calendar"
    const [calendarView, setCalendarView] = useState("dayGridMonth"); // "dayGridMonth", "timeGridWeek", "timeGridDay", "listWeek"
    const calendarRef = useRef(null);
    const [isPatientDetailsModalOpen, setIsPatientDetailsModalOpen] = useState(false);
    const [selectedPatientDate, setSelectedPatientDate] = useState(null); // { patientName, date }

    // Mock therapy sessions data - spread across multiple dates
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    const getDateString = (daysFromToday) => {
        const date = new Date();
        date.setDate(date.getDate() + daysFromToday);
        return date.toISOString().split("T")[0];
    };

    const [sessions] = useState([
        {
            id: "1",
            patientName: "Sumitra Devi",
            treatmentName: "Shirodhara",
            date: getDateString(-2),
            startTime: "10:00",
            endTime: "11:00",
            status: "Completed",
            flowType: "Outpatient",
            notes: "Patient felt relaxed post-session.",
        },
        {
            id: "2",
            patientName: "Rajesh Kumar",
            treatmentName: "Abhyangam",
            date: getDateString(-1),
            startTime: "11:00",
            endTime: "12:00",
            status: "Completed",
            flowType: "Inpatient",
            notes: "",
        },
        {
            id: "3",
            patientName: "Anil Gupta",
            treatmentName: "Pizhichil",
            date: getTodayDate(),
            startTime: "14:00",
            endTime: "15:00",
            status: "In Progress",
            flowType: "Outpatient",
            notes: "",
        },
        {
            id: "4",
            patientName: "Meera Desai",
            treatmentName: "Shirodhara",
            date: getDateString(1),
            startTime: "09:00",
            endTime: "10:00",
            status: "Scheduled",
            flowType: "Inpatient",
            notes: "",
        },
        {
            id: "5",
            patientName: "Vijay Rathod",
            treatmentName: "Abhyangam",
            date: getDateString(1),
            startTime: "10:30",
            endTime: "11:30",
            status: "Scheduled",
            flowType: "Outpatient",
            notes: "",
        },
        {
            id: "6",
            patientName: "Geeta Kapoor",
            treatmentName: "Pizhichil",
            date: getDateString(1),
            startTime: "15:00",
            endTime: "16:00",
            status: "Pending",
            flowType: "Inpatient",
            notes: "",
        },
        {
            id: "7",
            patientName: "Priya Sharma",
            treatmentName: "Shirodhara",
            date: getDateString(2),
            startTime: "10:00",
            endTime: "11:00",
            status: "Scheduled",
            flowType: "Outpatient",
            notes: "",
        },
        {
            id: "8",
            patientName: "Ravi Patel",
            treatmentName: "Abhyangam",
            date: getDateString(3),
            startTime: "11:00",
            endTime: "12:00",
            status: "Scheduled",
            flowType: "Inpatient",
            notes: "",
        },
        {
            id: "9",
            patientName: "Sunita Reddy",
            treatmentName: "Pizhichil",
            date: getDateString(4),
            startTime: "14:00",
            endTime: "15:00",
            status: "Pending",
            flowType: "Outpatient",
            notes: "",
        },
        {
            id: "10",
            patientName: "Kiran Desai",
            treatmentName: "Shirodhara",
            date: getDateString(5),
            startTime: "09:00",
            endTime: "10:00",
            status: "Scheduled",
            flowType: "Inpatient",
            notes: "",
        },
    ]);

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

    const filteredSessions = useMemo(() => {
        if (!search) return sessions;
        const searchLower = search.toLowerCase();
        return sessions.filter(
            (session) =>
                session.patientName.toLowerCase().includes(searchLower) ||
                session.treatmentName.toLowerCase().includes(searchLower) ||
                session.status.toLowerCase().includes(searchLower)
        );
    }, [sessions, search]);

    const handleStartSession = (sessionId) => {
        // TODO: Implement start session logic
        console.log("Start session:", sessionId);
    };

    const handleStopSession = (sessionId) => {
        // TODO: Implement stop session logic
        console.log("Stop session:", sessionId);
    };

    const handleViewDetails = (sessionId) => {
        // TODO: Navigate to patient details or show modal
        console.log("View details:", sessionId);
    };

    // Convert sessions to FullCalendar events
    const calendarEvents = useMemo(() => {
        return filteredSessions.map((session) => {
            const startDateTime = new Date(`${session.date}T${session.startTime}`);
            const endDateTime = new Date(`${session.date}T${session.endTime}`);
            
            // Get color based on status
            let backgroundColor = "#6c757d"; // default gray
            let borderColor = "#495057";
            let textColor = "#ffffff";
            
            switch (session.status) {
                case "Completed":
                    backgroundColor = "#28a745";
                    borderColor = "#1e7e34";
                    break;
                case "In Progress":
                    backgroundColor = "#0dcaf0";
                    borderColor = "#087990";
                    break;
                case "Scheduled":
                    backgroundColor = "#8B5CF6";
                    borderColor = "#7C3AED";
                    break;
                case "Pending":
                    backgroundColor = "#ffc107";
                    borderColor = "#d39e00";
                    textColor = "#000000";
                    break;
                case "Cancelled":
                    backgroundColor = "#dc3545";
                    borderColor = "#c82333";
                    break;
                case "Missed":
                    backgroundColor = "#DC2626";
                    borderColor = "#991B1B";
                    break;
            }

            return {
                id: session.id,
                title: `${session.treatmentName} - ${session.patientName}`,
                start: startDateTime,
                end: endDateTime,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                textColor: textColor,
                extendedProps: {
                    patientName: session.patientName,
                    treatmentName: session.treatmentName,
                    status: session.status,
                    flowType: session.flowType,
                    notes: session.notes,
                },
            };
        });
    }, [filteredSessions]);

    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        const extendedProps = event.extendedProps;
        const eventDate = new Date(event.start);
        const dateString = eventDate.toISOString().split("T")[0];
        
        setSelectedPatientDate({
            patientName: extendedProps.patientName,
            date: dateString,
        });
        setIsPatientDetailsModalOpen(true);
    };

    // Get all therapy sessions for the selected patient on the selected date
    const patientDaySessions = useMemo(() => {
        if (!selectedPatientDate) return [];
        return sessions.filter(
            (session) =>
                session.patientName === selectedPatientDate.patientName &&
                session.date === selectedPatientDate.date
        );
    }, [selectedPatientDate, sessions]);

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
            <HeadingCardingCard
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

                        {filteredSessions.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th style={{ fontSize: "0.875rem" }}>Sl. No.</th>
                                            <th style={{ fontSize: "0.875rem" }}>Patient Name</th>
                                            <th style={{ fontSize: "0.875rem" }}>Treatment</th>
                                            <th style={{ fontSize: "0.875rem" }}>Date</th>
                                            <th style={{ fontSize: "0.875rem" }}>Time</th>
                                            <th style={{ fontSize: "0.875rem" }}>Flow Type</th>
                                            <th style={{ fontSize: "0.875rem" }}>Status</th>
                                            <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSessions.map((session, index) => (
                                            <tr key={session.id}>
                                                <td style={{ fontSize: "0.875rem" }}>{index + 1}</td>
                                                <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                    {session.patientName}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>{session.treatmentName}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{formatDate(session.date)}</td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {session.startTime} - {session.endTime}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            backgroundColor: session.flowType === "Inpatient" ? "#e3f2fd" : "#f3e5f5",
                                                            color: session.flowType === "Inpatient" ? "#1976d2" : "#7b1fa2",
                                                            borderRadius: "50px",
                                                            padding: "4px 10px",
                                                            fontSize: "0.75rem",
                                                        }}
                                                    >
                                                        {session.flowType === "Inpatient" ? "[IP]" : "[OP]"} {session.flowType}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <span
                                                        className={`badge ${getStatusBadgeClass(session.status)}`}
                                                        style={{
                                                            borderRadius: "50px",
                                                            padding: "4px 10px",
                                                            fontSize: "0.75rem",
                                                        }}
                                                    >
                                                        {session.status}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <div style={{ position: "relative", display: "inline-block" }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm"
                                                                onClick={() => handleViewDetails(session.id)}
                                                                onMouseEnter={() => setHoveredButton(`view-${session.id}`)}
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
                                                            {hoveredButton === `view-${session.id}` && (
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
                                                        {session.status === "Pending" || session.status === "Scheduled" ? (
                                                            <div style={{ position: "relative", display: "inline-block" }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleStartSession(session.id)}
                                                                    onMouseEnter={() => setHoveredButton(`start-${session.id}`)}
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
                                                                {hoveredButton === `start-${session.id}` && (
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
                                                                        Start Session
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : session.status === "In Progress" ? (
                                                            <div style={{ position: "relative", display: "inline-block" }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleStopSession(session.id)}
                                                                    onMouseEnter={() => setHoveredButton(`stop-${session.id}`)}
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
                                                                {hoveredButton === `stop-${session.id}` && (
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
                                                                        Stop Session
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
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

            {/* Patient Therapy Details Modal */}
            {isPatientDetailsModalOpen && selectedPatientDate && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        overflowY: "auto",
                    }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ margin: "auto", maxWidth: "800px" }}>
                        <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                            <div className="modal-header" style={{ flexShrink: 0 }}>
                                <h5 className="modal-title d-flex align-items-center gap-2">
                                    <PersonIcon sx={{ color: "#6B4423" }} />
                                    Therapy Details: {selectedPatientDate.patientName}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsPatientDetailsModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                                <div className="mb-3">
                                    <h6 className="text-muted mb-2">
                                        <CalendarMonthIcon fontSize="small" className="me-1" />
                                        Date: {formatDate(selectedPatientDate.date)}
                                    </h6>
                                </div>

                                {patientDaySessions.length > 0 ? (
                                    <div className="d-flex flex-column gap-3">
                                        {patientDaySessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className="card shadow-sm"
                                                style={{
                                                    borderRadius: "12px",
                                                    borderLeft: `4px solid ${
                                                        session.status === "Completed"
                                                            ? "#28a745"
                                                            : session.status === "In Progress"
                                                            ? "#0dcaf0"
                                                            : session.status === "Scheduled"
                                                            ? "#8B5CF6"
                                                            : session.status === "Pending"
                                                            ? "#ffc107"
                                                            : session.status === "Cancelled"
                                                            ? "#dc3545"
                                                            : "#DC2626"
                                                    }`,
                                                }}
                                            >
                                                <div className="card-body p-3">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div>
                                                            <h6 className="mb-1" style={{ fontWeight: 600, fontSize: "1rem" }}>
                                                                {session.treatmentName}
                                                            </h6>
                                                            <div className="d-flex align-items-center gap-3 mt-2" style={{ fontSize: "0.875rem" }}>
                                                                <span className="text-muted d-flex align-items-center gap-1">
                                                                    <AccessTimeIcon fontSize="small" />
                                                                    {session.startTime} - {session.endTime}
                                                                </span>
                                                                <span className="text-muted d-flex align-items-center gap-1">
                                                                    <LocalHospitalIcon fontSize="small" />
                                                                    {session.flowType}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={`badge ${getStatusBadgeClass(session.status)}`}
                                                            style={{
                                                                borderRadius: "50px",
                                                                padding: "4px 10px",
                                                                fontSize: "0.75rem",
                                                            }}
                                                        >
                                                            {session.status}
                                                        </span>
                                                    </div>
                                                    {session.notes && (
                                                        <div className="mt-2 pt-2 border-top">
                                                            <p className="mb-0" style={{ fontSize: "0.875rem", color: "#495057" }}>
                                                                <strong>Notes:</strong> {session.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <p className="text-muted">No therapy sessions found for this patient on this date.</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6" }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsPatientDetailsModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Box>
    );
}

export default Therapy_Progress;
