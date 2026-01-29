import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import DashboardCard from "../../components/card/DashboardCard";
import therapistService from "../../services/therapistService";

// Icons
import CalendarDaysIcon from "@mui/icons-material/Event";
import UsersIcon from "@mui/icons-material/People";
import ActivityIcon from "@mui/icons-material/FitnessCenter";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClockIcon from "@mui/icons-material/AccessTime";
import ArrowUpRightIcon from "@mui/icons-material/ArrowUpward";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import GreetingBanner from "../../components/card/GreetingCard";
import GreetingsImg from "../../assets/greeting/therapist.png"
function Therapist_Dashboard() {
    const { user } = useSelector((state) => state.auth);
    const therapistName = user?.name || "Therapist";
    
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState({
        todayAppointments: 0,
        todayTherapySessions: 0,
        totalPatients: 0,
    });

    // Fetch therapist sessions from API
    useEffect(() => {
        const fetchSessions = async () => {
            setIsLoading(true);
            try {
                const response = await therapistService.getMyTherapistSessions();
                if (response.success && response.data) {
                    setSessions(response.data);
                } else {
                    toast.error(response.message || "Failed to fetch sessions");
                }
            } catch (error) {
                console.error("Error fetching therapist sessions:", error);
                toast.error(error.message || "Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, []);

    // Transform sessions data for display
    const treatments = useMemo(() => {
        return sessions.map((session) => {
            // Parse session date and time
            let sessionDateTime = null;
            if (session.sessionDate) {
                const date = new Date(session.sessionDate);
                if (session.sessionTime) {
                    const [hours, minutes] = session.sessionTime.split(':');
                    date.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
                }
                sessionDateTime = date;
            } else if (session.days && session.days.length > 0) {
                // Use first day's date if sessionDate is not available
                const firstDay = session.days[0];
                if (firstDay.date) {
                    sessionDateTime = new Date(firstDay.date);
                    if (firstDay.time) {
                        const [hours, minutes] = firstDay.time.split(':');
                        sessionDateTime.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
                    }
                }
            }

            // Calculate duration - default to 45 mins per session
            // Note: Actual duration per session may vary, but we'll use a standard estimate
            const duration = "45 mins"; // Standard therapy session duration

            return {
                id: session._id,
                patientName: session.patient?.user?.name || "Unknown Patient",
                therapyName: session.treatmentName || "Unknown Therapy",
                date: sessionDateTime || new Date(),
                duration: duration,
                status: session.status,
                patientId: session.patient?.user?._id || session.patient?._id,
            };
        });
    }, [sessions]);

    // Calculate summary statistics
    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Filter sessions for today
        const todaySessions = treatments.filter((t) => {
            if (!t.date) return false;
            const sessionDate = new Date(t.date);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === today.getTime();
        });

        // Count unique patients
        const uniquePatients = new Set(
            treatments
                .filter((t) => t.patientId)
                .map((t) => t.patientId)
        );

        setSummary({
            todayAppointments: todaySessions.length,
            todayTherapySessions: todaySessions.length,
            totalPatients: uniquePatients.size,
        });
    }, [treatments]);

    const breadcrumbItems = [
        { label: "Home", url: "/" },
        // { label: "Therapist", url: "/therapist" },
        { label: "Dashboard" },
    ];

    // Format date helper
    const formatDate = (date) => {
        if (!date) return "—";
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Format time helper
    const formatTime = (date) => {
        if (!date) return "—";
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    };


    // Upcoming sessions (today and future) - filter by status and date
    const upcomingSessions = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return treatments
            .filter((item) => {
                // Only show scheduled, in progress, or pending sessions
                const validStatuses = ['Scheduled', 'In Progress', 'Pending'];
                if (!validStatuses.includes(item.status)) return false;
                
                // Check if date is valid and in the future (or today)
                if (!item.date) return false;
                const date = new Date(item.date);
                if (isNaN(date.getTime())) return false;
                
                const sessionDate = new Date(date);
                sessionDate.setHours(0, 0, 0, 0);
                return sessionDate >= now;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 6);
    }, [treatments]);

    // Therapy breakdown
    const therapyBreakdown = useMemo(() => {
        const map = new Map();
        treatments.forEach((t) => {
            const key = (t.therapyName || "Unnamed Therapy").trim();
            map.set(key, (map.get(key) || 0) + 1);
        });
        return Array.from(map.entries())
            .map(([therapy, amount]) => ({ therapy, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }, [treatments]);

    // Active patients - get most recent session for each patient
    const activePatients = useMemo(() => {
        const patientMap = new Map();
        treatments.forEach((t) => {
            if (!t.patientId) return;
            const existing = patientMap.get(t.patientId);
            if (!existing || (t.date && existing.date && new Date(t.date) > new Date(existing.date))) {
                patientMap.set(t.patientId, t);
            }
        });
        // Sort by most recent date and take top 4
        return Array.from(patientMap.values())
            .sort((a, b) => {
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(b.date) - new Date(a.date);
            })
            .slice(0, 4);
    }, [treatments]);

    if (isLoading) {
        return (
            <Box sx={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: "20px" }}>
            {/* Breadcrumb */}
            {/* <Breadcrumb items={breadcrumbItems} /> */}

            {/* Greeting Banner */}
            {/* <Box
                sx={{
                    background: "var(--color-bg-table)",
                    borderRadius: 4,
                    padding: 4,
                    color: "var(--color-text-dark)",
                    mb: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: { xs: "flex-start", md: "center" },
                        justifyContent: "space-between",
                        gap: 3,
                    }}
                >
                    <Box>
                        <Box
                            sx={{
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                fontSize: "0.75rem",
                                color: "var(--color-text-light)",
                                mb: 1,
                            }}
                        >
                            Welcome back
                        </Box>
                        <Box
                            component="h1"
                            sx={{
                                fontSize: { xs: "2rem", sm: "2.5rem" },
                                fontWeight: 600,
                                mb: 1,
                                color: "var(--color-text-dark)",
                            }}
                        >
                            {therapistName}
                        </Box>
                        <Box
                            sx={{
                                color: "var(--color-text-light)",
                                maxWidth: "600px",
                                fontSize: "0.95rem",
                            }}
                        >
                            Here is a snapshot of today&apos;s healing journey. Track upcoming sessions,
                            monitor patient progress, and jump into the areas that need your attention.
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 2,
                        }}
                    >
                        <button
                            className="btn"
                            style={{
                                backgroundColor: "transparent",
                                color: "var(--color-bg-side-bar)",
                                border: "2px solid var(--color-bg-side-bar)",
                                padding: "6px 14px",
                                borderRadius: "8px",
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--color-bg-side-bar)";
                                e.currentTarget.style.color = "#ffffff";
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "var(--color-bg-side-bar)";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                            }}
                        >
                            <RefreshIcon fontSize="small" />
                            Refresh Overview
                        </button>
                        <Link
                            to="/therapist/therapy-progress"
                            className="btn"
                            style={{
                                backgroundColor: "var(--color-bg-side-bar)",
                                color: "#ffffff",
                                border: "2px solid var(--color-bg-side-bar)",
                                padding: "6px 14px",
                                borderRadius: "8px",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                textDecoration: "none",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "var(--color-bg-side-bar)";
                                e.currentTarget.style.border = "2px solid var(--color-bg-side-bar)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--color-bg-side-bar)";
                                e.currentTarget.style.color = "#ffffff";
                                e.currentTarget.style.border = "2px solid var(--color-bg-side-bar)";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                            }}
                        >
                            View Therapy Progress
                        </Link>
                    </Box>
                </Box>
            </Box> */}
            <GreetingBanner
                title="Namaste"
                name={therapistName}
                subtitle="Here is a snapshot of today's healing journey. Track upcoming sessions, monitor patient progress, and jump into the areas that need your attention."
                image={GreetingsImg}
                breadcrumbItems={breadcrumbItems}
            />
            {/* Dashboard Cards */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(2, 1fr)",
                        xl: "repeat(3, 1fr)",
                    },
                    gap: 3,
                    my: 4,
                }}
            >
                <DashboardCard
                    title="Today's Appointments"
                    count={summary.todayAppointments}
                    icon={CalendarDaysIcon}
                />
                <DashboardCard
                    title="Therapy Sessions"
                    count={summary.todayTherapySessions}
                    icon={ActivityIcon}
                />
                <DashboardCard
                    title="Active Patients"
                    count={summary.totalPatients}
                    icon={UsersIcon}
                />
            </Box>

            {/* Main Content Grid */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        xl: "2fr 1fr",
                    },
                    gap: 3,
                    mb: 4,
                }}
            >
                {/* Upcoming Sessions */}
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div
                            className="d-flex justify-content-between align-items-center mb-4"
                            style={{ flexWrap: "wrap", gap: "12px" }}
                        >
                            <div>
                                <h5 className="card-title mb-1">Upcoming Sessions</h5>
                                <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                                    Prioritise your next appointments and arrive prepared.
                                </p>
                            </div>
                            <Link
                                to="/therapist/therapy-progress"
                                style={{
                                    color: "#059669",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                Manage schedule <ArrowUpRightIcon fontSize="small" />
                            </Link>
                        </div>

                        {upcomingSessions.length === 0 ? (
                            <div
                                className="text-center py-5"
                                style={{
                                    border: "2px dashed #dee2e6",
                                    borderRadius: "12px",
                                    color: "#6c757d",
                                }}
                            >
                                <p className="mb-0">You have no upcoming sessions scheduled.</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {upcomingSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="border rounded-3 p-3"
                                        style={{
                                            borderColor: "#dee2e6",
                                            transition: "all 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = "#10b981";
                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = "#dee2e6";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <div
                                            className="d-flex justify-content-between align-items-center"
                                            style={{ flexWrap: "wrap", gap: "12px" }}
                                        >
                                            <div>
                                                <h6 className="mb-1" style={{ fontWeight: 600 }}>
                                                    {session.patientName}
                                                </h6>
                                                <p
                                                    className="text-muted mb-0 d-flex align-items-center gap-2"
                                                    style={{ fontSize: "0.875rem" }}
                                                >
                                                    <ClockIcon fontSize="small" />
                                                    {formatDate(session.date)} · {formatTime(session.date)}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <p
                                                    className="mb-1"
                                                    style={{
                                                        color: "#059669",
                                                        fontWeight: 500,
                                                        fontSize: "0.875rem",
                                                    }}
                                                >
                                                    {session.therapyName}
                                                </p>
                                                <p
                                                    className="text-muted mb-0"
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.05em",
                                                    }}
                                                >
                                                    Duration: {session.duration || "N/A"}
                                                </p>
                                            </div>
                                            <Link
                                                to={`/therapist/patient-monitoring?patientId=${session.patientId}`}
                                                className="btn btn-outline-primary btn-sm"
                                                style={{ borderRadius: "12px" }}
                                            >
                                                View Profile
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Therapy Insights */}
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="mb-4">
                            <h5 className="card-title mb-1">Therapy Insights</h5>
                            <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                                Snapshot of where your energy is focused this week.
                            </p>
                        </div>

                        {therapyBreakdown.length === 0 ? (
                            <div
                                className="text-center py-5"
                                style={{
                                    border: "2px dashed #dee2e6",
                                    borderRadius: "12px",
                                    color: "#6c757d",
                                }}
                            >
                                <p className="mb-0" style={{ fontSize: "0.875rem" }}>
                                    No therapy activity logged yet.
                                </p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-2 mb-4">
                                {therapyBreakdown.map((item) => (
                                    <div
                                        key={item.therapy}
                                        className="border rounded-3 p-3"
                                        style={{
                                            borderColor: "#dee2e6",
                                            transition: "all 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = "#10b981";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = "#dee2e6";
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <p className="mb-1" style={{ fontWeight: 600 }}>
                                                    {item.therapy}
                                                </p>
                                                <p
                                                    className="text-muted mb-0"
                                                    style={{ fontSize: "0.75rem" }}
                                                >
                                                    Sessions delivered recently
                                                </p>
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: "1.125rem",
                                                    fontWeight: 600,
                                                    color: "#059669",
                                                }}
                                            >
                                                {item.amount}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Wellness Tip */}
                        <div
                            className="rounded-3 p-3"
                            style={{
                                backgroundColor: "#d1fae5",
                                border: "1px solid #a7f3d0",
                            }}
                        >
                            <p
                                className="mb-1"
                                style={{
                                    fontSize: "0.875rem",
                                    color: "#059669",
                                    fontWeight: 500,
                                }}
                            >
                                Wellness Tip
                            </p>
                            <p
                                className="mb-0"
                                style={{
                                    fontSize: "0.875rem",
                                    color: "#065f46",
                                }}
                            >
                                Align your sessions with mindful breathers. A 5-minute reset between
                                therapies keeps your energy calm and focused.
                            </p>
                        </div>
                    </div>
                </div>
            </Box>

            {/* Patient Highlights */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div
                        className="d-flex justify-content-between align-items-center mb-4"
                        style={{ flexWrap: "wrap", gap: "12px" }}
                    >
                        <div>
                            <h5 className="card-title mb-1">Patient Highlights</h5>
                            <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                                Patients with recent treatment updates. Check in to keep momentum strong.
                            </p>
                        </div>
                        <Link
                            to="/therapist/patient-monitoring"
                            className="btn btn-outline-primary btn-sm"
                            style={{ borderRadius: "12px" }}
                        >
                            Manage Patients
                        </Link>
                    </div>

                    {activePatients.length === 0 ? (
                        <div
                            className="text-center py-5"
                            style={{
                                border: "2px dashed #dee2e6",
                                borderRadius: "12px",
                                color: "#6c757d",
                            }}
                        >
                            <p className="mb-0">No active patient journeys yet.</p>
                        </div>
                    ) : (
                        <div
                            className="row g-3"
                            style={{
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "repeat(2, 1fr)",
                                    xl: "repeat(4, 1fr)",
                                },
                            }}
                        >
                            {activePatients.map((patient) => (
                                <div key={patient.id} className="col-12 col-md-6 col-xl-3">
                                    <div
                                        className="border rounded-3 p-3 h-100"
                                        style={{
                                            borderColor: "#dee2e6",
                                            transition: "all 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = "#10b981";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = "#dee2e6";
                                        }}
                                    >
                                        <div className="mb-2">
                                            <h6 className="mb-1" style={{ fontWeight: 600 }}>
                                                {patient.patientName}
                                            </h6>
                                            <p
                                                className="text-muted mb-0"
                                                style={{
                                                    fontSize: "0.75rem",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.05em",
                                                }}
                                            >
                                                {patient.therapyName || "Therapy Plan"}
                                            </p>
                                        </div>
                                        <div className="mb-2" style={{ fontSize: "0.875rem" }}>
                                            <p className="mb-1">
                                                <span style={{ fontWeight: 500 }}>Last session:</span>{" "}
                                                {formatDate(patient.date)}
                                            </p>
                                            <p className="mb-0">
                                                <span style={{ fontWeight: 500 }}>Duration:</span>{" "}
                                                {patient.duration || "N/A"}
                                            </p>
                                        </div>
                                        <Link
                                            to={`/therapist/therapy-progress?patientId=${patient.patientId}`}
                                            style={{
                                                color: "#059669",
                                                textDecoration: "none",
                                                fontWeight: 600,
                                                fontSize: "0.875rem",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                            }}
                                        >
                                            Track progress <ArrowUpRightIcon fontSize="small" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card shadow-sm">
                <div className="card-body">
                    <h5 className="card-title mb-4" style={{ fontWeight: 600, fontSize: "1.25rem", color: "var(--color-text-dark)" }}>
                        Quick Actions
                    </h5>
                    <div className="row g-3">
                        <div className="col-12 col-sm-6 col-lg-4">
                            <Link
                                to="/therapist/therapy-progress"
                                className="text-decoration-none"
                            >
                                <div
                                    className="border rounded-3 h-100"
                                    style={{
                                        borderColor: "#dee2e6",
                                        backgroundColor: "#ffffff",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer",
                                        padding: "20px",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "var(--color-bg-side-bar)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "#dee2e6";
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "12px",
                                            backgroundColor: "var(--color-bg-side-bar)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "16px",
                                        }}
                                    >
                                        <NoteAddIcon sx={{ color: "#ffffff", fontSize: "24px" }} />
                                    </div>
                                    <h6 className="mb-2" style={{ fontWeight: 600, fontSize: "1rem", color: "var(--color-text-dark)", marginBottom: "8px" }}>
                                        Therapy Log
                                    </h6>
                                    <p className="text-muted mb-0" style={{ fontSize: "0.875rem", color: "#6c757d", lineHeight: "1.5" }}>
                                        Capture session notes and vitals.
                                    </p>
                                </div>
                            </Link>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-4">
                            <Link
                                to="/therapist/patient-monitoring"
                                className="text-decoration-none"
                            >
                                <div
                                    className="border rounded-3 h-100"
                                    style={{
                                        borderColor: "#dee2e6",
                                        backgroundColor: "#ffffff",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer",
                                        padding: "20px",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "var(--color-bg-side-bar)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "#dee2e6";
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "12px",
                                            backgroundColor: "var(--color-bg-side-bar)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "16px",
                                        }}
                                    >
                                        <PersonSearchIcon sx={{ color: "#ffffff", fontSize: "24px" }} />
                                    </div>
                                    <h6 className="mb-2" style={{ fontWeight: 600, fontSize: "1rem", color: "var(--color-text-dark)", marginBottom: "8px" }}>
                                        Patient Details
                                    </h6>
                                    <p className="text-muted mb-0" style={{ fontSize: "0.875rem", color: "#6c757d", lineHeight: "1.5" }}>
                                        Review history & ongoing care.
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Box>
    );
}

export default Therapist_Dashboard;

                                    <h6 className="mb-2" style={{ fontWeight: 600, fontSize: "1rem", color: "var(--color-text-dark)", marginBottom: "8px" }}>
                                        Therapy Log
                                    </h6>
                                    <p className="text-muted mb-0" style={{ fontSize: "0.875rem", color: "#6c757d", lineHeight: "1.5" }}>
                                        Capture session notes and vitals.
                                    </p>
                                </div>
                            </Link>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-4">
                            <Link
                                to="/therapist/patient-monitoring"
                                className="text-decoration-none"
                            >
                                <div
                                    className="border rounded-3 h-100"
                                    style={{
                                        borderColor: "#dee2e6",
                                        backgroundColor: "#ffffff",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer",
                                        padding: "20px",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "var(--color-bg-side-bar)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "#dee2e6";
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "12px",
                                            backgroundColor: "var(--color-bg-side-bar)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "16px",
                                        }}
                                    >
                                        <PersonSearchIcon sx={{ color: "#ffffff", fontSize: "24px" }} />
                                    </div>
                                    <h6 className="mb-2" style={{ fontWeight: 600, fontSize: "1rem", color: "var(--color-text-dark)", marginBottom: "8px" }}>
                                        Patient Details
                                    </h6>
                                    <p className="text-muted mb-0" style={{ fontSize: "0.875rem", color: "#6c757d", lineHeight: "1.5" }}>
                                        Review history & ongoing care.
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Box>
    );
}

export default Therapist_Dashboard;
