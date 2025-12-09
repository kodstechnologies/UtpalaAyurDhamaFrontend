import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";

// Icons
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import TodayIcon from "@mui/icons-material/Today";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalHotelIcon from "@mui/icons-material/LocalHotel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NotesIcon from "@mui/icons-material/Notes";

// Mock data - will be replaced with API calls later
const mockDischargePatients = [
    {
        id: "inp-1",
        patientId: "PAT-105",
        patientName: "Geeta Kapoor",
        age: 55,
        gender: "Female",
        ward: "Private Room",
        bed: "102-B",
        admissionDate: "2024-05-20",
        dischargeDate: "2024-05-25",
        doctorName: "Dr. Priya Singh",
        diagnosis: "Hypertension Management",
        lengthOfStay: 5,
        status: "Ready",
    },
    {
        id: "inp-2",
        patientId: "PAT-108",
        patientName: "Vijay Rathod",
        age: 48,
        gender: "Male",
        ward: "General Ward",
        bed: "GW-05",
        admissionDate: "2024-05-22",
        dischargeDate: "2024-05-26",
        doctorName: "Dr. Anjali Verma",
        diagnosis: "Post-surgery Recovery",
        lengthOfStay: 4,
        status: "Ready",
    },
    {
        id: "inp-3",
        patientId: "PAT-110",
        patientName: "Meera Desai",
        age: 62,
        gender: "Female",
        ward: "Special Ward",
        bed: "SW-03",
        admissionDate: "2024-05-18",
        dischargeDate: "2024-05-24",
        doctorName: "Dr. Rajesh Kumar",
        diagnosis: "Diabetes Management",
        lengthOfStay: 6,
        status: "Ready",
    },
    {
        id: "inp-4",
        patientId: "PAT-112",
        patientName: "Suresh Reddy",
        age: 50,
        gender: "Male",
        ward: "General Ward",
        bed: "GW-08",
        admissionDate: "2024-05-19",
        dischargeDate: "2024-05-25",
        doctorName: "Dr. Anjali Verma",
        diagnosis: "Cardiac Monitoring",
        lengthOfStay: 6,
        status: "Ready",
    },
];

function Discharge_Preparation() {
    const [dischargePatients] = useState(mockDischargePatients);
    const [search, setSearch] = useState("");
    const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
    const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [hoveredButton, setHoveredButton] = useState(null);
    const [dischargeChecklist, setDischargeChecklist] = useState({
        finalVitals: false,
        medicationSummary: false,
        dischargeSummary: false,
        billingCleared: false,
        counselingDone: false,
    });
    const [dischargeNotes, setDischargeNotes] = useState("");

    // Calculate statistics
    const stats = useMemo(() => {
        const total = dischargePatients.length;
        const completedToday = dischargePatients.filter((p) => {
            const today = new Date().toISOString().split("T")[0];
            return p.dischargeDate === today;
        }).length;
        return { total, completedToday };
    }, [dischargePatients]);

    // Filter patients
    const filteredPatients = useMemo(() => {
        return dischargePatients.filter(
            (patient) =>
                patient.patientName.toLowerCase().includes(search.toLowerCase()) ||
                patient.patientId.toLowerCase().includes(search.toLowerCase()) ||
                patient.ward.toLowerCase().includes(search.toLowerCase()) ||
                patient.diagnosis?.toLowerCase().includes(search.toLowerCase())
        );
    }, [dischargePatients, search]);

    // Calculate checklist progress
    const checklistProgress = useMemo(() => {
        const total = Object.keys(dischargeChecklist).length;
        const completed = Object.values(dischargeChecklist).filter(Boolean).length;
        return { completed, total, percentage: Math.round((completed / total) * 100) };
    }, [dischargeChecklist]);

    // Handle Prepare Discharge click
    const handlePrepareDischargeClick = (patient) => {
        setSelectedPatient(patient);
        setDischargeChecklist({
            finalVitals: false,
            medicationSummary: false,
            dischargeSummary: false,
            billingCleared: false,
            counselingDone: false,
        });
        setDischargeNotes("");
        setIsDischargeModalOpen(true);
    };

    // Handle View Details click
    const handleViewDetailsClick = (patient) => {
        setSelectedPatient(patient);
        setIsViewDetailsModalOpen(true);
    };

    // Handle checkbox change
    const handleChecklistChange = (key) => {
        setDischargeChecklist((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // Handle Confirm Discharge
    const handleConfirmDischarge = (e) => {
        e.preventDefault();
        const allChecked = Object.values(dischargeChecklist).every((checked) => checked);
        if (!allChecked) {
            toast.error("Please complete all checklist items before confirming discharge.");
            return;
        }
        // Mock save - will be replaced with API call later
        toast.success(`Discharge prepared successfully for ${selectedPatient.patientName}`);
        setIsDischargeModalOpen(false);
        setSelectedPatient(null);
        setDischargeNotes("");
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Calculate length of stay
    const calculateLengthOfStay = (admissionDate, dischargeDate) => {
        if (!admissionDate || !dischargeDate) return 0;
        const admission = new Date(admissionDate);
        const discharge = new Date(dischargeDate);
        const diffTime = Math.abs(discharge - admission);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Discharge Preparation" },
    ];

    return (
        <Box sx={{ padding: "20px" }}>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Page Heading */}
            <HeadingCardingCard
                category="DISCHARGE PREPARATION"
                title="Patients Ready for Discharge"
                subtitle="Complete discharge checklist, review patient details, and prepare patients for safe discharge"
            />

            {/* ⭐ DASHBOARD CARDS */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(2, 1fr)",
                    },
                    gap: "15px",
                    marginTop: 3,
                }}
            >
                <DashboardCard
                    title="Ready for Discharge"
                    count={stats.total}
                    icon={PendingActionsIcon}
                />
                <DashboardCard
                    title="Discharged Today"
                    count={stats.completedToday}
                    icon={TodayIcon}
                />
            </Box>

            {/* ⭐ Patients Table */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="card-title mb-0">Discharge Queue</h5>
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
                                        placeholder="Search by patient name, ID, ward, or diagnosis..."
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
                                            <th style={{ fontSize: "0.875rem" }}>Diagnosis</th>
                                            <th style={{ fontSize: "0.875rem" }}>Ward/Bed</th>
                                            <th style={{ fontSize: "0.875rem" }}>Admission Date</th>
                                            <th style={{ fontSize: "0.875rem" }}>Length of Stay</th>
                                            <th style={{ fontSize: "0.875rem" }}>Consulting Doctor</th>
                                            <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPatients.map((patient, index) => (
                                            <tr key={patient.id}>
                                                <td style={{ fontSize: "0.875rem" }}>{index + 1}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.patientId}</td>
                                                <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                    {patient.patientName}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <span className="badge bg-info" style={{ fontSize: "0.75rem", padding: "6px 12px", borderRadius: "50px" }}>
                                                        {patient.diagnosis || "N/A"}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <LocalHotelIcon fontSize="small" />
                                                        {patient.ward} / {patient.bed}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {formatDate(patient.admissionDate)}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <span className="badge bg-secondary" style={{ fontSize: "0.75rem", padding: "6px 8px", borderRadius: "50px", whiteSpace: "nowrap", display: "inline-block" }}>
                                                        {calculateLengthOfStay(patient.admissionDate, patient.dischargeDate)} days
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <LocalHospitalIcon fontSize="small" />
                                                        {patient.doctorName}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <div style={{ position: "relative", display: "inline-block" }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm"
                                                                onClick={() => handleViewDetailsClick(patient)}
                                                                onMouseEnter={() => setHoveredButton(`view-${patient.id}`)}
                                                                onMouseLeave={() => setHoveredButton(null)}
                                                                style={{
                                                                    backgroundColor: "#0dcaf0",
                                                                    borderColor: "#0dcaf0",
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
                                                        <div style={{ position: "relative", display: "inline-block" }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm"
                                                                onClick={() => handlePrepareDischargeClick(patient)}
                                                                onMouseEnter={() => setHoveredButton(`discharge-${patient.id}`)}
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
                                                                <ExitToAppIcon fontSize="small" />
                                                            </button>
                                                            {hoveredButton === `discharge-${patient.id}` && (
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
                                                                    Prepare Discharge
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <ExitToAppIcon sx={{ fontSize: 64, color: "#6c757d" }} />
                                <h5 className="mt-3 mb-2">No Patients Found</h5>
                                <p className="text-muted">Try adjusting your search query.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Box>

            {/* View Patient Details Modal */}
            {isViewDetailsModalOpen && selectedPatient && (
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
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ margin: "auto", maxWidth: "700px" }}>
                        <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                            <div className="modal-header" style={{ flexShrink: 0 }}>
                                <h5 className="modal-title d-flex align-items-center gap-2">
                                    <PersonIcon sx={{ color: "#0dcaf0" }} />
                                    Patient Details: {selectedPatient.patientName}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsViewDetailsModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                            <small className="text-muted d-block mb-1">Patient ID</small>
                                            <strong>{selectedPatient.patientId}</strong>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                            <small className="text-muted d-block mb-1">Name</small>
                                            <strong>{selectedPatient.patientName}</strong>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                            <small className="text-muted d-block mb-1">Age & Gender</small>
                                            <strong>{selectedPatient.age} years, {selectedPatient.gender}</strong>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                            <small className="text-muted d-block mb-1">Diagnosis</small>
                                            <strong>{selectedPatient.diagnosis || "N/A"}</strong>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                            <small className="text-muted d-block mb-1">
                                                <CalendarTodayIcon fontSize="small" className="me-1" />
                                                Admission Date
                                            </small>
                                            <strong>{formatDate(selectedPatient.admissionDate)}</strong>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                            <small className="text-muted d-block mb-1">
                                                <ExitToAppIcon fontSize="small" className="me-1" />
                                                Expected Discharge Date
                                            </small>
                                            <strong>{formatDate(selectedPatient.dischargeDate)}</strong>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                            <small className="text-muted d-block mb-1">
                                                <LocalHotelIcon fontSize="small" className="me-1" />
                                                Ward / Bed
                                            </small>
                                            <strong>{selectedPatient.ward} / {selectedPatient.bed}</strong>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                            <small className="text-muted d-block mb-1">
                                                <LocalHospitalIcon fontSize="small" className="me-1" />
                                                Consulting Doctor
                                            </small>
                                            <strong>{selectedPatient.doctorName}</strong>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="p-3 border rounded">
                                            <small className="text-muted d-block mb-1">Length of Stay</small>
                                            <strong>{calculateLengthOfStay(selectedPatient.admissionDate, selectedPatient.dischargeDate)} days</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6" }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsViewDetailsModalOpen(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setIsViewDetailsModalOpen(false);
                                        handlePrepareDischargeClick(selectedPatient);
                                    }}
                                    style={{
                                        backgroundColor: "#D4A574",
                                        borderColor: "#D4A574",
                                        color: "#000",
                                    }}
                                >
                                    Prepare Discharge
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Discharge Checklist Modal */}
            {isDischargeModalOpen && selectedPatient && (
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
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ margin: "auto", maxWidth: "700px" }}>
                        <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                            <div className="modal-header" style={{ flexShrink: 0 }}>
                                <h5 className="modal-title d-flex align-items-center gap-2">
                                    <CheckCircleIcon sx={{ color: "#D4A574" }} />
                                    Discharge Checklist for: {selectedPatient.patientName}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsDischargeModalOpen(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleConfirmDischarge} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                                <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                                    {/* Patient Info Summary */}
                                    <div className="card bg-light mb-4">
                                        <div className="card-body p-3">
                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <small className="text-muted d-block">Patient ID</small>
                                                    <strong>{selectedPatient.patientId}</strong>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted d-block">Ward / Bed</small>
                                                    <strong>{selectedPatient.ward} / {selectedPatient.bed}</strong>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted d-block">Diagnosis</small>
                                                    <strong>{selectedPatient.diagnosis || "N/A"}</strong>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted d-block">Length of Stay</small>
                                                    <strong>{calculateLengthOfStay(selectedPatient.admissionDate, selectedPatient.dischargeDate)} days</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Indicator */}
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted small">Checklist Progress</span>
                                            <span className="badge bg-primary" style={{ fontSize: "0.875rem" }}>
                                                {checklistProgress.completed} / {checklistProgress.total} Completed
                                            </span>
                                        </div>
                                        <div className="progress" style={{ height: "8px" }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{
                                                    width: `${checklistProgress.percentage}%`,
                                                    backgroundColor: checklistProgress.percentage === 100 ? "#198754" : "#D4A574",
                                                }}
                                                aria-valuenow={checklistProgress.percentage}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Checklist Items */}
                                    <div className="d-flex flex-column gap-3">
                                        <div className={`form-check p-3 border rounded ${dischargeChecklist.finalVitals ? "bg-success bg-opacity-10" : ""}`}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="finalVitals"
                                                checked={dischargeChecklist.finalVitals}
                                                onChange={() => handleChecklistChange("finalVitals")}
                                                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                                            />
                                            <label className="form-check-label ms-2 w-100" htmlFor="finalVitals" style={{ cursor: "pointer" }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <strong>Final Vitals Check Completed</strong>
                                                        <br />
                                                        <small className="text-muted">Record final temperature, BP, heart rate, and respiratory rate</small>
                                                    </span>
                                                    {dischargeChecklist.finalVitals && (
                                                        <CheckCircleIcon sx={{ color: "#198754", fontSize: 28 }} />
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                        <div className={`form-check p-3 border rounded ${dischargeChecklist.medicationSummary ? "bg-success bg-opacity-10" : ""}`}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="medicationSummary"
                                                checked={dischargeChecklist.medicationSummary}
                                                onChange={() => handleChecklistChange("medicationSummary")}
                                                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                                            />
                                            <label className="form-check-label ms-2 w-100" htmlFor="medicationSummary" style={{ cursor: "pointer" }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <strong>Medication Summary Prepared</strong>
                                                        <br />
                                                        <small className="text-muted">Prepare list of medications to continue at home</small>
                                                    </span>
                                                    {dischargeChecklist.medicationSummary && (
                                                        <CheckCircleIcon sx={{ color: "#198754", fontSize: 28 }} />
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                        <div className={`form-check p-3 border rounded ${dischargeChecklist.dischargeSummary ? "bg-success bg-opacity-10" : ""}`}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="dischargeSummary"
                                                checked={dischargeChecklist.dischargeSummary}
                                                onChange={() => handleChecklistChange("dischargeSummary")}
                                                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                                            />
                                            <label className="form-check-label ms-2 w-100" htmlFor="dischargeSummary" style={{ cursor: "pointer" }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <strong>Discharge Summary Signed by Doctor</strong>
                                                        <br />
                                                        <small className="text-muted">Ensure doctor has reviewed and signed the discharge summary</small>
                                                    </span>
                                                    {dischargeChecklist.dischargeSummary && (
                                                        <CheckCircleIcon sx={{ color: "#198754", fontSize: 28 }} />
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                        <div className={`form-check p-3 border rounded ${dischargeChecklist.billingCleared ? "bg-success bg-opacity-10" : ""}`}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="billingCleared"
                                                checked={dischargeChecklist.billingCleared}
                                                onChange={() => handleChecklistChange("billingCleared")}
                                                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                                            />
                                            <label className="form-check-label ms-2 w-100" htmlFor="billingCleared" style={{ cursor: "pointer" }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <strong>Invoice & Billing Cleared</strong>
                                                        <br />
                                                        <small className="text-muted">Verify all charges are settled and invoice is generated</small>
                                                    </span>
                                                    {dischargeChecklist.billingCleared && (
                                                        <CheckCircleIcon sx={{ color: "#198754", fontSize: 28 }} />
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                        <div className={`form-check p-3 border rounded ${dischargeChecklist.counselingDone ? "bg-success bg-opacity-10" : ""}`}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="counselingDone"
                                                checked={dischargeChecklist.counselingDone}
                                                onChange={() => handleChecklistChange("counselingDone")}
                                                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                                            />
                                            <label className="form-check-label ms-2 w-100" htmlFor="counselingDone" style={{ cursor: "pointer" }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <strong>Patient/Family Counseling Done</strong>
                                                        <br />
                                                        <small className="text-muted">Provide post-discharge care instructions and follow-up information</small>
                                                    </span>
                                                    {dischargeChecklist.counselingDone && (
                                                        <CheckCircleIcon sx={{ color: "#198754", fontSize: 28 }} />
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Discharge Notes */}
                                    <div className="mt-4">
                                        <label className="form-label d-flex align-items-center gap-2">
                                            <NotesIcon fontSize="small" />
                                            Discharge Notes (Optional)
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={dischargeNotes}
                                            onChange={(e) => setDischargeNotes(e.target.value)}
                                            placeholder="Add any additional notes or special instructions for discharge..."
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6" }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsDischargeModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={checklistProgress.percentage < 100}
                                        style={{
                                            backgroundColor: checklistProgress.percentage === 100 ? "#198754" : "#D4A574",
                                            borderColor: checklistProgress.percentage === 100 ? "#198754" : "#D4A574",
                                            color: "#000",
                                            opacity: checklistProgress.percentage === 100 ? 1 : 0.6,
                                        }}
                                    >
                                        <CheckCircleIcon className="me-2" />
                                        Confirm Discharge
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Box>
    );
}

export default Discharge_Preparation;
