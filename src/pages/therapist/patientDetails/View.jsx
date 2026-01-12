import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function Patient_List_View() {
    const [search, setSearch] = useState("");
    const [hoveredButton, setHoveredButton] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const navigate = useNavigate();

    // Fetch therapist's sessions
    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl("therapist-sessions/my-sessions"),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                setSessions(response.data.data || []);
            } else {
                toast.error(response.data.message || "Failed to fetch sessions");
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
            toast.error(error.response?.data?.message || "Failed to load sessions");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // Helper functions
    const calculateAge = (dob) => {
        if (!dob) return "N/A";
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Therapist", url: "/therapist" },
        { label: "Patient Monitoring" },
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
            default:
                return "bg-secondary";
        }
    };

    const filteredSessions = useMemo(() => {
        if (!search) return sessions;
        const searchLower = search.toLowerCase();
        return sessions.filter((session) => {
            const patientName = session.patient?.user?.name || "";
            const uhid = session.patient?.user?.uhid || "";
            const treatmentName = session.treatmentName || "";
            return (
                patientName.toLowerCase().includes(searchLower) ||
                uhid.toLowerCase().includes(searchLower) ||
                treatmentName.toLowerCase().includes(searchLower)
            );
        });
    }, [sessions, search]);

    const handleViewDetails = (session) => {
        const completedSessions = session.days?.filter(d => d.completed).length || 0;
        const lastSession = session.days?.filter(d => d.completed).sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        const params = new URLSearchParams({
            sessionId: session._id,
            patientName: session.patient?.user?.name || "Unknown",
            patientId: session.patient?.patientId || "N/A",
            age: calculateAge(session.patient?.user?.dob).toString(),
            gender: session.patient?.user?.gender || "N/A",
            diagnosis: session.treatmentName || "N/A",
            doctor: session.examination?.doctor?.user?.name || "N/A",
            status: session.status || "Pending",
            totalSessions: (session.daysOfTreatment || 0).toString(),
            completedSessions: completedSessions.toString(),
            lastSessionDate: lastSession ? lastSession.date : (session.sessionDate || ""),
        });
        navigate(`/therapist/patient-monitoring/view?${params.toString()}`, { state: { session } });
    };

    const calculateProgress = (completed, total) => {
        if (!total || total === 0) return 0;
        return Math.round((completed / total) * 100);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: "20px" }}>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Page Heading */}
            <HeadingCardingCard
                category="PATIENT MONITORING"
                title="Patient List"
                subtitle="View all patients undergoing therapy sessions and track their progress"
            />

            {/* Patients Table */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="card-title mb-0">Active Patients</h5>
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
                                        placeholder="Search by patient name, ID, or diagnosis..."
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
                                            <th style={{ fontSize: "0.875rem" }}>UHID</th>
                                            <th style={{ fontSize: "0.875rem" }}>Patient Name</th>
                                            <th style={{ fontSize: "0.875rem" }}>Therapy</th>
                                            <th style={{ fontSize: "0.875rem" }}>Consulting Doctor</th>
                                            <th style={{ fontSize: "0.875rem" }}>Progress</th>
                                            <th style={{ fontSize: "0.875rem" }}>Status</th>
                                            <th style={{ fontSize: "0.875rem" }}>Last Session</th>
                                            <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSessions.map((session, index) => {
                                            const completedCount = session.days?.filter(d => d.completed).length || 0;
                                            const progress = calculateProgress(completedCount, session.daysOfTreatment);
                                            const lastSession = session.days?.filter(d => d.completed).sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                                            return (
                                                <tr key={session._id}>
                                                    <td style={{ fontSize: "0.875rem" }}>{index + 1}</td>
                                                    <td style={{ fontSize: "0.875rem" }}>{session.patient?.user?.uhid || "N/A"}</td>
                                                    <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                        {session.patient?.user?.name || "Unknown"}
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        <span
                                                            className="badge bg-info"
                                                            style={{
                                                                borderRadius: "50px",
                                                                padding: "4px 10px",
                                                                fontSize: "0.75rem",
                                                            }}
                                                        >
                                                            {session.treatmentName}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        <LocalHospitalIcon fontSize="small" className="me-1" />
                                                        {session.examination?.doctor?.user?.name || "N/A"}
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="progress" style={{ width: "100px", height: "8px" }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    role="progressbar"
                                                                    style={{ width: `${progress}%` }}
                                                                    aria-valuenow={progress}
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"
                                                                ></div>
                                                            </div>
                                                            <span style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                                                                {completedCount}/{session.daysOfTreatment}
                                                            </span>
                                                        </div>
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
                                                    <td style={{ fontSize: "0.875rem" }}>{formatDate(lastSession ? lastSession.date : session.sessionDate)}</td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <div style={{ position: "relative", display: "inline-block" }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleViewDetails(session)}
                                                                    onMouseEnter={() => setHoveredButton(`view-${session._id}`)}
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
                                                                {hoveredButton === `view-${session._id}` && (
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
                                <p className="text-muted">No patients found. Try adjusting your search query.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Box>
        </Box>
    );
}

export default Patient_List_View;
