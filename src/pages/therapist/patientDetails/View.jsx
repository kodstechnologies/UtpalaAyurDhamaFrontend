import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import PendingIcon from "@mui/icons-material/Pending";

function Patient_List_View() {
    const [search, setSearch] = useState("");
    const [hoveredButton, setHoveredButton] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Mock patients data with sessions
    const [patients] = useState([
        {
            id: "1",
            patientId: "PAT-101",
            patientName: "Sumitra Devi",
            age: 56,
            gender: "Female",
            diagnosis: "Stress/Insomnia",
            doctor: "Dr. Sharma",
            totalSessions: 5,
            completedSessions: 3,
            status: "In Progress",
            lastSessionDate: "2024-05-20",
            sessions: [
                {
                    sessionNumber: 1,
                    date: "2024-05-15",
                    time: "10:00 AM",
                    therapyType: "Shirodhara",
                    duration: "45 mins",
                    status: "Completed",
                    notes: "Patient felt relaxed post-session. Blood pressure normal.",
                },
                {
                    sessionNumber: 2,
                    date: "2024-05-17",
                    time: "10:00 AM",
                    therapyType: "Shirodhara",
                    duration: "45 mins",
                    status: "Completed",
                    notes: "Good response. Sleep quality improved.",
                },
                {
                    sessionNumber: 3,
                    date: "2024-05-20",
                    time: "10:00 AM",
                    therapyType: "Shirodhara",
                    duration: "45 mins",
                    status: "Completed",
                    notes: "Patient reported better sleep patterns.",
                },
                {
                    sessionNumber: 4,
                    date: "2024-05-22",
                    time: "10:00 AM",
                    therapyType: "Abhyangam",
                    duration: "60 mins",
                    status: "Scheduled",
                    notes: "",
                },
                {
                    sessionNumber: 5,
                    date: "2024-05-24",
                    time: "10:00 AM",
                    therapyType: "Shirodhara",
                    duration: "45 mins",
                    status: "Pending",
                    notes: "",
                },
            ],
        },
        {
            id: "2",
            patientId: "PAT-102",
            patientName: "Rajesh Kumar",
            age: 48,
            gender: "Male",
            diagnosis: "Hypertension",
            doctor: "Dr. Khan",
            totalSessions: 8,
            completedSessions: 5,
            status: "In Progress",
            lastSessionDate: "2024-05-21",
            sessions: [
                {
                    sessionNumber: 1,
                    date: "2024-05-10",
                    time: "11:00 AM",
                    therapyType: "Abhyangam",
                    duration: "60 mins",
                    status: "Completed",
                    notes: "Initial assessment completed.",
                },
                {
                    sessionNumber: 2,
                    date: "2024-05-12",
                    time: "11:00 AM",
                    therapyType: "Abhyangam",
                    duration: "60 mins",
                    status: "Completed",
                    notes: "Blood pressure slightly lower after therapy.",
                },
                {
                    sessionNumber: 3,
                    date: "2024-05-15",
                    time: "11:00 AM",
                    therapyType: "Pizhichil",
                    duration: "50 mins",
                    status: "Completed",
                    notes: "Good progress observed.",
                },
                {
                    sessionNumber: 4,
                    date: "2024-05-18",
                    time: "11:00 AM",
                    therapyType: "Abhyangam",
                    duration: "60 mins",
                    status: "Completed",
                    notes: "Patient responding well to treatment.",
                },
                {
                    sessionNumber: 5,
                    date: "2024-05-21",
                    time: "11:00 AM",
                    therapyType: "Pizhichil",
                    duration: "50 mins",
                    status: "Completed",
                    notes: "Blood pressure stable.",
                },
                {
                    sessionNumber: 6,
                    date: "2024-05-23",
                    time: "11:00 AM",
                    therapyType: "Abhyangam",
                    duration: "60 mins",
                    status: "Scheduled",
                    notes: "",
                },
                {
                    sessionNumber: 7,
                    date: "2024-05-25",
                    time: "11:00 AM",
                    therapyType: "Pizhichil",
                    duration: "50 mins",
                    status: "Pending",
                    notes: "",
                },
                {
                    sessionNumber: 8,
                    date: "2024-05-28",
                    time: "11:00 AM",
                    therapyType: "Abhyangam",
                    duration: "60 mins",
                    status: "Pending",
                    notes: "",
                },
            ],
        },
        {
            id: "3",
            patientId: "PAT-103",
            patientName: "Anil Gupta",
            age: 62,
            gender: "Male",
            diagnosis: "Digestive Issues",
            doctor: "Dr. Patel",
            totalSessions: 6,
            completedSessions: 6,
            status: "Completed",
            lastSessionDate: "2024-05-18",
            sessions: [
                {
                    sessionNumber: 1,
                    date: "2024-05-05",
                    time: "02:00 PM",
                    therapyType: "Pizhichil",
                    duration: "50 mins",
                    status: "Completed",
                    notes: "Initial therapy session.",
                },
                {
                    sessionNumber: 2,
                    date: "2024-05-08",
                    time: "02:00 PM",
                    therapyType: "Pizhichil",
                    duration: "50 mins",
                    status: "Completed",
                    notes: "Digestive symptoms improving.",
                },
                {
                    sessionNumber: 3,
                    date: "2024-05-11",
                    time: "02:00 PM",
                    therapyType: "Abhyangam",
                    duration: "60 mins",
                    status: "Completed",
                    notes: "Good response to treatment.",
                },
                {
                    sessionNumber: 4,
                    date: "2024-05-14",
                    time: "02:00 PM",
                    therapyType: "Pizhichil",
                    duration: "50 mins",
                    status: "Completed",
                    notes: "Patient feeling better.",
                },
                {
                    sessionNumber: 5,
                    date: "2024-05-16",
                    time: "02:00 PM",
                    therapyType: "Abhyangam",
                    duration: "60 mins",
                    status: "Completed",
                    notes: "Significant improvement noted.",
                },
                {
                    sessionNumber: 6,
                    date: "2024-05-18",
                    time: "02:00 PM",
                    therapyType: "Pizhichil",
                    duration: "50 mins",
                    status: "Completed",
                    notes: "Final session completed successfully.",
                },
            ],
        },
        {
            id: "4",
            patientId: "PAT-104",
            patientName: "Meera Desai",
            age: 45,
            gender: "Female",
            diagnosis: "Arthritis",
            doctor: "Dr. Verma",
            totalSessions: 4,
            completedSessions: 2,
            status: "In Progress",
            lastSessionDate: "2024-05-19",
            sessions: [
                {
                    sessionNumber: 1,
                    date: "2024-05-12",
                    time: "09:00 AM",
                    therapyType: "Abhyangam",
                    duration: "60 mins",
                    status: "Completed",
                    notes: "First session. Patient comfortable.",
                },
                {
                    sessionNumber: 2,
                    date: "2024-05-19",
                    time: "09:00 AM",
                    therapyType: "Shirodhara",
                    duration: "45 mins",
                    status: "Completed",
                    notes: "Joint mobility improved slightly.",
                },
                {
                    sessionNumber: 3,
                    date: "2024-05-22",
                    time: "09:00 AM",
                    therapyType: "Abhyangam",
                    duration: "60 mins",
                    status: "Scheduled",
                    notes: "",
                },
                {
                    sessionNumber: 4,
                    date: "2024-05-26",
                    time: "09:00 AM",
                    therapyType: "Shirodhara",
                    duration: "45 mins",
                    status: "Pending",
                    notes: "",
                },
            ],
        },
    ]);

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
            case "Pending":
                return "bg-warning";
            default:
                return "bg-secondary";
        }
    };

    const filteredPatients = useMemo(() => {
        if (!search) return patients;
        const searchLower = search.toLowerCase();
        return patients.filter(
            (patient) =>
                patient.patientName.toLowerCase().includes(searchLower) ||
                patient.patientId.toLowerCase().includes(searchLower) ||
                patient.diagnosis.toLowerCase().includes(searchLower)
        );
    }, [patients, search]);

    const handleViewDetails = (patient) => {
        setSelectedPatient(patient);
        setIsViewModalOpen(true);
    };

    const calculateProgress = (completed, total) => {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    };

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

                        {filteredPatients.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th style={{ fontSize: "0.875rem" }}>Sl. No.</th>
                                            <th style={{ fontSize: "0.875rem" }}>Patient ID</th>
                                            <th style={{ fontSize: "0.875rem" }}>Patient Name</th>
                                            <th style={{ fontSize: "0.875rem" }}>Age/Gender</th>
                                            <th style={{ fontSize: "0.875rem" }}>Diagnosis</th>
                                            <th style={{ fontSize: "0.875rem" }}>Consulting Doctor</th>
                                            <th style={{ fontSize: "0.875rem" }}>Progress</th>
                                            <th style={{ fontSize: "0.875rem" }}>Status</th>
                                            <th style={{ fontSize: "0.875rem" }}>Last Session</th>
                                            <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPatients.map((patient, index) => {
                                            const progress = calculateProgress(patient.completedSessions, patient.totalSessions);
                                            return (
                                                <tr key={patient.id}>
                                                    <td style={{ fontSize: "0.875rem" }}>{index + 1}</td>
                                                    <td style={{ fontSize: "0.875rem" }}>{patient.patientId}</td>
                                                    <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                        {patient.patientName}
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        {patient.age} / {patient.gender}
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
                                                            {patient.diagnosis}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        <LocalHospitalIcon fontSize="small" className="me-1" />
                                                        {patient.doctor}
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
                                                                {patient.completedSessions}/{patient.totalSessions}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        <span
                                                            className={`badge ${getStatusBadgeClass(patient.status)}`}
                                                            style={{
                                                                borderRadius: "50px",
                                                                padding: "4px 10px",
                                                                fontSize: "0.75rem",
                                                            }}
                                                        >
                                                            {patient.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem" }}>{formatDate(patient.lastSessionDate)}</td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <div style={{ position: "relative", display: "inline-block" }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleViewDetails(patient)}
                                                                    onMouseEnter={() => setHoveredButton(`view-${patient.id}`)}
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
                                                                {hoveredButton === `view-${patient.id}` && (
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

            {/* View Patient Details Modal */}
            {isViewModalOpen && selectedPatient && (
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
                                    <PersonIcon sx={{ color: "#D4A574" }} />
                                    Patient Details: {selectedPatient.patientName}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsViewModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                                {/* Patient Information Card */}
                                <div className="card shadow-sm mb-4" style={{ borderRadius: "12px", overflow: "hidden" }}>
                                    <div className="card-body p-4">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <h6 className="text-muted mb-1">Patient Name</h6>
                                                <p className="mb-0 fw-bold">{selectedPatient.patientName}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="text-muted mb-1">Patient ID</h6>
                                                <p className="mb-0">{selectedPatient.patientId}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="text-muted mb-1">Age / Gender</h6>
                                                <p className="mb-0">{selectedPatient.age} / {selectedPatient.gender}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="text-muted mb-1">Diagnosis</h6>
                                                <p className="mb-0">
                                                    <span className="badge bg-info" style={{ borderRadius: "50px", padding: "4px 10px", fontSize: "0.75rem" }}>
                                                        {selectedPatient.diagnosis}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="text-muted mb-1">Consulting Doctor</h6>
                                                <p className="mb-0">
                                                    <LocalHospitalIcon fontSize="small" className="me-1" />
                                                    {selectedPatient.doctor}
                                                </p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="text-muted mb-1">Status</h6>
                                                <p className="mb-0">
                                                    <span className={`badge ${getStatusBadgeClass(selectedPatient.status)}`} style={{ borderRadius: "50px", padding: "4px 10px", fontSize: "0.75rem" }}>
                                                        {selectedPatient.status}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="text-muted mb-1">Total Sessions</h6>
                                                <p className="mb-0 fw-bold">{selectedPatient.totalSessions}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="text-muted mb-1">Completed Sessions</h6>
                                                <p className="mb-0 fw-bold">{selectedPatient.completedSessions}</p>
                                            </div>
                                            <div className="col-md-12">
                                                <h6 className="text-muted mb-2">Progress</h6>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="progress" style={{ width: "100%", height: "12px", flex: 1 }}>
                                                        <div
                                                            className="progress-bar"
                                                            role="progressbar"
                                                            style={{ width: `${calculateProgress(selectedPatient.completedSessions, selectedPatient.totalSessions)}%` }}
                                                            aria-valuenow={calculateProgress(selectedPatient.completedSessions, selectedPatient.totalSessions)}
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        ></div>
                                                    </div>
                                                    <span style={{ fontSize: "0.875rem", fontWeight: 600, minWidth: "50px" }}>
                                                        {calculateProgress(selectedPatient.completedSessions, selectedPatient.totalSessions)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="text-muted mb-1">Last Session</h6>
                                                <p className="mb-0">{formatDate(selectedPatient.lastSessionDate)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sessions List */}
                                {selectedPatient.sessions && selectedPatient.sessions.length > 0 && (
                                    <div className="card shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                                        <div className="card-body p-4">
                                            <h5 className="card-title mb-4" style={{ fontWeight: 600, fontSize: "1.125rem" }}>
                                                Therapy Sessions
                                            </h5>
                                            <div className="d-flex flex-column gap-3">
                                                {selectedPatient.sessions.map((session, index) => (
                                                    <div
                                                        key={index}
                                                        className="border rounded-3 p-3"
                                                        style={{
                                                            borderColor: session.status === "Completed" ? "#28a745" : session.status === "Scheduled" ? "#0dcaf0" : "#ffc107",
                                                            backgroundColor: session.status === "Completed" ? "#f8fff9" : session.status === "Scheduled" ? "#f0f9ff" : "#fffbf0",
                                                            transition: "all 0.2s ease",
                                                        }}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div
                                                                    style={{
                                                                        width: "32px",
                                                                        height: "32px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: session.status === "Completed" ? "#28a745" : session.status === "Scheduled" ? "#0dcaf0" : "#ffc107",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        color: "white",
                                                                        fontWeight: 600,
                                                                        fontSize: "0.875rem",
                                                                    }}
                                                                >
                                                                    {session.sessionNumber}
                                                                </div>
                                                                <div>
                                                                    <h6 className="mb-0" style={{ fontWeight: 600, fontSize: "1rem" }}>
                                                                        Session {session.sessionNumber}: {session.therapyType}
                                                                    </h6>
                                                                    <div className="d-flex align-items-center gap-3 mt-1" style={{ fontSize: "0.875rem" }}>
                                                                        <span className="text-muted d-flex align-items-center gap-1">
                                                                            <CalendarTodayIcon fontSize="small" />
                                                                            {formatDate(session.date)}
                                                                        </span>
                                                                        <span className="text-muted d-flex align-items-center gap-1">
                                                                            <AccessTimeIcon fontSize="small" />
                                                                            {session.time}
                                                                        </span>
                                                                        <span className="text-muted">
                                                                            Duration: {session.duration}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span
                                                                className={`badge ${
                                                                    session.status === "Completed"
                                                                        ? "bg-success"
                                                                        : session.status === "Scheduled"
                                                                        ? "bg-info"
                                                                        : "bg-warning"
                                                                }`}
                                                                style={{
                                                                    borderRadius: "50px",
                                                                    padding: "4px 10px",
                                                                    fontSize: "0.75rem",
                                                                }}
                                                            >
                                                                {session.status === "Completed" && <CheckCircleIcon fontSize="small" className="me-1" />}
                                                                {session.status === "Scheduled" && <RadioButtonUncheckedIcon fontSize="small" className="me-1" />}
                                                                {session.status === "Pending" && <PendingIcon fontSize="small" className="me-1" />}
                                                                {session.status}
                                                            </span>
                                                        </div>
                                                        {session.notes && (
                                                            <div
                                                                className="mt-2 p-2 rounded"
                                                                style={{
                                                                    backgroundColor: "rgba(255,255,255,0.7)",
                                                                    fontSize: "0.875rem",
                                                                    color: "#495057",
                                                                }}
                                                            >
                                                                <strong>Notes:</strong> {session.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6" }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsViewModalOpen(false)}
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

export default Patient_List_View;
