import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";

// Icons
import PeopleIcon from "@mui/icons-material/People";
import LocalHotelIcon from "@mui/icons-material/LocalHotel";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EditIcon from "@mui/icons-material/Edit";

// Mock data - will be replaced with API calls later
const mockInpatients = [
    {
        id: "inp-1",
        name: "Amit Kumar",
        age: 32,
        gender: "Male",
        admittedOn: "2025-01-15",
        complain: "Fever, Weakness",
        admitStatus: "Admitted",
        roomNo: "102",
        wardCategory: "General",
        allocatedNurse: "Nurse Priya",
        allocatedNurseId: "nurse-1",
        doctorName: "Dr. Sharma",
    },
    {
        id: "inp-2",
        name: "Sita Verma",
        age: 28,
        gender: "Female",
        admittedOn: "2025-01-12",
        complain: "Migraine",
        admitStatus: "Under Observation",
        roomNo: "205",
        wardCategory: "Duplex",
        allocatedNurse: "Nurse Geeta",
        allocatedNurseId: "nurse-2",
        doctorName: "Dr. Patel",
    },
    {
        id: "inp-3",
        name: "Rajesh Singh",
        age: 45,
        gender: "Male",
        admittedOn: "2025-01-10",
        complain: "Diabetes Management",
        admitStatus: "Pending Allocation",
        roomNo: undefined,
        wardCategory: undefined,
        allocatedNurse: undefined,
        allocatedNurseId: undefined,
        doctorName: "Dr. Kumar",
    },
    {
        id: "inp-4",
        name: "Priya Sharma",
        age: 35,
        gender: "Female",
        admittedOn: "2025-01-08",
        complain: "Post-surgery recovery",
        admitStatus: "Discharged",
        roomNo: "301",
        wardCategory: "Special",
        allocatedNurse: "Nurse Anjali",
        allocatedNurseId: "nurse-3",
        doctorName: "Dr. Mehta",
    },
];

const mockPatients = [
    {
        _id: "pat-1",
        patientId: "PAT001",
        name: "John Doe",
        email: "john@example.com",
        phone: "9876543210",
        inpatient: false,
    },
    {
        _id: "pat-2",
        patientId: "PAT002",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "9123456780",
        inpatient: false,
    },
    {
        _id: "pat-3",
        patientId: "PAT003",
        name: "Robert Johnson",
        email: "robert@example.com",
        phone: "9988776655",
        inpatient: true,
    },
];

const mockDoctors = [
    { _id: "doc-1", user: { name: "Dr. Sharma" } },
    { _id: "doc-2", user: { name: "Dr. Patel" } },
    { _id: "doc-3", user: { name: "Dr. Kumar" } },
    { _id: "doc-4", user: { name: "Dr. Mehta" } },
];

const mockNurses = [
    { _id: "nurse-1", user: { name: "Nurse Priya" }, nurseId: "N001" },
    { _id: "nurse-2", user: { name: "Nurse Geeta" }, nurseId: "N002" },
    { _id: "nurse-3", user: { name: "Nurse Anjali" }, nurseId: "N003" },
];

function Inpatient_View() {
    const [inpatients] = useState(mockInpatients);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
    const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
    const [selectedInpatient, setSelectedInpatient] = useState(null);
    const [patientSearchTerm, setPatientSearchTerm] = useState("");
    const [patientSearchResults, setPatientSearchResults] = useState([]);
    const [selectedPatientForAdmission, setSelectedPatientForAdmission] = useState(null);

    // Form states
    const [admitForm, setAdmitForm] = useState({
        patientId: "",
        doctorId: "",
        allocatedNurse: "",
        wardCategory: "",
        roomNumber: "",
        bedNumber: "",
        admissionDate: new Date().toISOString().split("T")[0],
        reason: "",
    });

    const [allocationForm, setAllocationForm] = useState({
        allocatedNurse: "",
        wardCategory: "",
        roomNo: "",
        bedNumber: "",
    });

    // Tooltip states
    const [hoveredButton, setHoveredButton] = useState(null);

    // Breadcrumb Data
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Receptionist", url: "/receptionist/dashboard" },
        { label: "Inpatients" },
    ];

    // Calculate statistics
    const stats = useMemo(() => {
        return {
            total: inpatients.length,
            admitted: inpatients.filter((p) => p.admitStatus === "Admitted").length,
            underObservation: inpatients.filter((p) => p.admitStatus === "Under Observation").length,
            pendingAllocation: inpatients.filter((p) => p.admitStatus === "Pending Allocation").length,
            discharged: inpatients.filter((p) => p.admitStatus === "Discharged").length,
        };
    }, [inpatients]);

    // Filter inpatients
    const filteredData = useMemo(() => {
        return inpatients.filter((patient) => {
            const matchesSearch =
                patient.name.toLowerCase().includes(search.toLowerCase()) ||
                patient.complain.toLowerCase().includes(search.toLowerCase()) ||
                (patient.doctorName && patient.doctorName.toLowerCase().includes(search.toLowerCase())) ||
                (patient.roomNo && patient.roomNo.toLowerCase().includes(search.toLowerCase()));
            const matchesStatus = statusFilter === "All" || patient.admitStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [inpatients, search, statusFilter]);

    // Patient search handler
    const handlePatientSearch = (term) => {
        setPatientSearchTerm(term);
        if (term.trim().length < 2) {
            setPatientSearchResults([]);
            return;
        }
        // Mock search - filter patients
        const results = mockPatients.filter(
            (p) =>
                p.name.toLowerCase().includes(term.toLowerCase()) ||
                p.email.toLowerCase().includes(term.toLowerCase()) ||
                p.phone.includes(term)
        );
        setPatientSearchResults(results);
    };

    const handleSelectPatientForAdmission = (patient) => {
        if (patient.inpatient) {
            toast.error("Patient is already admitted");
            return;
        }
        setSelectedPatientForAdmission(patient);
        setAdmitForm({ ...admitForm, patientId: patient.patientId });
        setPatientSearchTerm(patient.name);
        setPatientSearchResults([]);
    };

    const handleAdmitPatient = (e) => {
        e.preventDefault();
        if (!selectedPatientForAdmission) {
            toast.error("Please select a patient to admit.");
            return;
        }
        if (!admitForm.doctorId) {
            toast.error("Please select a doctor to assign.");
            return;
        }
        if (!admitForm.allocatedNurse) {
            toast.error("Please select a nurse to allocate.");
            return;
        }
        if (!admitForm.wardCategory) {
            toast.error("Please choose a ward category.");
            return;
        }
        if (!admitForm.roomNumber) {
            toast.error("Please provide a room number.");
            return;
        }
        toast.success("Patient admitted and resources assigned successfully!");
        setIsAdmitModalOpen(false);
        setAdmitForm({
            patientId: "",
            doctorId: "",
            allocatedNurse: "",
            wardCategory: "",
            roomNumber: "",
            bedNumber: "",
            admissionDate: new Date().toISOString().split("T")[0],
            reason: "",
        });
        setSelectedPatientForAdmission(null);
        setPatientSearchTerm("");
    };

    const handleOpenAllocationModal = (patient) => {
        setSelectedInpatient(patient);
        setAllocationForm({
            allocatedNurse: patient.allocatedNurseId || "",
            wardCategory: patient.wardCategory || "",
            roomNo: patient.roomNo || "",
            bedNumber: "",
        });
        setIsAllocationModalOpen(true);
    };

    const handleSaveAllocation = (e) => {
        e.preventDefault();
        if (!selectedInpatient) return;
        if (!allocationForm.allocatedNurse) {
            toast.error("Please select a nurse to allocate.");
            return;
        }
        if (!allocationForm.wardCategory) {
            toast.error("Please choose a ward category.");
            return;
        }
        if (!allocationForm.roomNo) {
            toast.error("Please provide a room number.");
            return;
        }
        toast.success("Resources allocated successfully!");
        setIsAllocationModalOpen(false);
        setSelectedInpatient(null);
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            Admitted: "badge bg-success",
            "Under Observation": "badge bg-info",
            "Pending Allocation": "badge bg-warning",
            Discharged: "badge bg-secondary",
        };
        return classes[status] || "badge bg-secondary";
    };

    return (
        <Box sx={{ padding: "20px" }}>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Page Heading */}
            <HeadingCardingCard
                category="INPATIENT MANAGEMENT"
                title="In-Patient Management"
                subtitle="Manage patient admissions, room allocations, and resource assignments"
                action={
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setIsAdmitModalOpen(true)}
                        style={{
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                    >
                        <AddIcon className="me-2" />
                        Admit Patient
                    </button>
                }
            />

            {/* Statistics Cards */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "15px",
                    marginTop: 3,
                    "@media (max-width: 1200px)": {
                        gridTemplateColumns: "repeat(3, 1fr)",
                    },
                    "@media (max-width: 768px)": {
                        gridTemplateColumns: "repeat(2, 1fr)",
                    },
                    "@media (max-width: 480px)": {
                        gridTemplateColumns: "1fr",
                    },
                }}
            >
                <DashboardCard title="Total Patients" count={stats.total} icon={PeopleIcon} />
                <DashboardCard title="Admitted" count={stats.admitted} icon={LocalHotelIcon} />
                <DashboardCard title="Under Observation" count={stats.underObservation} icon={MonitorHeartIcon} />
                <DashboardCard title="Pending Allocation" count={stats.pendingAllocation} icon={PendingActionsIcon} />
                <DashboardCard title="Discharged" count={stats.discharged} icon={CheckCircleIcon} />
            </Box>

            {/* Table Section */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="mb-4">
                            <h5 className="card-title mb-0">Inpatients List</h5>
                        </div>

                        {/* Search and Filter */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <SearchIcon />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by name, complain, doctor, or room..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <select
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All Status</option>
                                    <option value="Admitted">Admitted</option>
                                    <option value="Under Observation">Under Observation</option>
                                    <option value="Pending Allocation">Pending Allocation</option>
                                    <option value="Discharged">Discharged</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            <table className="table table-hover" style={{ fontSize: "0.875rem" }}>
                                <thead>
                                    <tr>
                                        <th style={{ fontSize: "0.875rem" }}>Sl. No.</th>
                                        <th style={{ fontSize: "0.875rem" }}>Patient Name</th>
                                        <th style={{ fontSize: "0.875rem" }}>Complain</th>
                                        <th style={{ fontSize: "0.875rem" }}>Doctor</th>
                                        <th style={{ fontSize: "0.875rem" }}>Ward</th>
                                        <th style={{ fontSize: "0.875rem" }}>Room No.</th>
                                        <th style={{ fontSize: "0.875rem" }}>Allocated Nurse</th>
                                        <th style={{ fontSize: "0.875rem" }}>Status</th>
                                        <th style={{ fontSize: "0.875rem" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((patient, index) => (
                                        <tr key={patient.id}>
                                            <td style={{ fontSize: "0.875rem" }}>{index + 1}</td>
                                            <td style={{ fontSize: "0.875rem" }}>
                                                <strong>{patient.name}</strong>
                                            </td>
                                            <td style={{ fontSize: "0.875rem" }}>{patient.complain}</td>
                                            <td style={{ fontSize: "0.875rem" }}>
                                                {patient.doctorName ? (
                                                    <span>
                                                        <LocalHospitalIcon fontSize="small" className="me-1" />
                                                        {patient.doctorName}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">N/A</span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: "0.875rem" }}>
                                                {patient.wardCategory ? (
                                                    <span className="badge bg-primary">{patient.wardCategory}</span>
                                                ) : (
                                                    <span className="text-muted">N/A</span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: "0.875rem" }}>
                                                {patient.roomNo ? (
                                                    <span>
                                                        <LocalHotelIcon fontSize="small" className="me-1" />
                                                        {patient.roomNo}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">N/A</span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: "0.875rem" }}>{patient.allocatedNurse || <span className="text-muted">N/A</span>}</td>
                                            <td style={{ fontSize: "0.875rem" }}>
                                                <span 
                                                    className={getStatusBadgeClass(patient.admitStatus)}
                                                    style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                                                >
                                                    {patient.admitStatus}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: "0.875rem" }}>
                                                <div className="d-flex gap-2">
                                                    <div style={{ position: "relative", display: "inline-block" }}>
                                                        <Link
                                                            to={`/receptionist/inpatient-billing/${patient.id}`}
                                                            className="btn btn-sm"
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
                                                                textDecoration: "none",
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = "#C8965A";
                                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                setHoveredButton(`view-${patient.id}`);
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = "#D4A574";
                                                                e.currentTarget.style.transform = "translateY(0)";
                                                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                setHoveredButton(null);
                                                            }}
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </Link>
                                                        {hoveredButton === `view-${patient.id}` && (
                                                            <span
                                                                style={{
                                                                    position: "absolute",
                                                                    bottom: "100%",
                                                                    left: "50%",
                                                                    transform: "translateX(-50%)",
                                                                    marginBottom: "5px",
                                                                    padding: "4px 8px",
                                                                    backgroundColor: "#333",
                                                                    color: "#fff",
                                                                    fontSize: "0.75rem",
                                                                    borderRadius: "4px",
                                                                    whiteSpace: "nowrap",
                                                                    zIndex: 1000,
                                                                    pointerEvents: "none",
                                                                }}
                                                            >
                                                                View/Add Charges
                                                            </span>
                                                        )}
                                                    </div>
                                                    {patient.admitStatus !== "Discharged" && (
                                                        <div style={{ position: "relative", display: "inline-block" }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm"
                                                                onClick={() => handleOpenAllocationModal(patient)}
                                                                style={{
                                                                    backgroundColor: "#90EE90",
                                                                    borderColor: "#90EE90",
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
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#7ACC7A";
                                                                    e.currentTarget.style.transform = "translateY(-2px)";
                                                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                    setHoveredButton(`allocate-${patient.id}`);
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#90EE90";
                                                                    e.currentTarget.style.transform = "translateY(0)";
                                                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    setHoveredButton(null);
                                                                }}
                                                            >
                                                                {patient.admitStatus === "Pending Allocation" ? (
                                                                    <AssignmentIcon fontSize="small" />
                                                                ) : (
                                                                    <EditIcon fontSize="small" />
                                                                )}
                                                            </button>
                                                            {hoveredButton === `allocate-${patient.id}` && (
                                                                <span
                                                                    style={{
                                                                        position: "absolute",
                                                                        bottom: "100%",
                                                                        left: "50%",
                                                                        transform: "translateX(-50%)",
                                                                        marginBottom: "5px",
                                                                        padding: "4px 8px",
                                                                        backgroundColor: "#333",
                                                                        color: "#fff",
                                                                        fontSize: "0.75rem",
                                                                        borderRadius: "4px",
                                                                        whiteSpace: "nowrap",
                                                                        zIndex: 1000,
                                                                        pointerEvents: "none",
                                                                    }}
                                                                >
                                                                    {patient.admitStatus === "Pending Allocation" ? "Allocate Resources" : "Re-allocate"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Box>

            {/* Admit Patient Modal */}
            {isAdmitModalOpen && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: "auto", padding: "20px 0" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ margin: "auto", maxWidth: "800px" }}>
                        <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                            <div className="modal-header" style={{ flexShrink: 0 }}>
                                <h5 className="modal-title">Admit Patient</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setIsAdmitModalOpen(false);
                                        setPatientSearchTerm("");
                                        setPatientSearchResults([]);
                                        setSelectedPatientForAdmission(null);
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleAdmitPatient} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                                <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label">Search Patient *</label>
                                            <div className="position-relative">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Type patient name to search..."
                                                    value={patientSearchTerm}
                                                    onChange={(e) => handlePatientSearch(e.target.value)}
                                                />
                                                {patientSearchResults.length > 0 && (
                                                    <div
                                                        className="position-absolute w-100 bg-white border rounded shadow-lg"
                                                        style={{ zIndex: 10000, maxHeight: "200px", overflowY: "auto", top: "100%", marginTop: "4px" }}
                                                    >
                                                        {patientSearchResults.map((patient) => (
                                                            <button
                                                                key={patient._id}
                                                                type="button"
                                                                className={`w-100 text-start p-3 border-bottom ${patient.inpatient ? "opacity-50" : ""}`}
                                                                onClick={() => handleSelectPatientForAdmission(patient)}
                                                                disabled={patient.inpatient}
                                                                style={{ backgroundColor: patient.inpatient ? "#f8f9fa" : "white" }}
                                                            >
                                                                <div className="fw-semibold">{patient.name}</div>
                                                                <div className="text-muted small">
                                                                    {patient.email} • {patient.phone}
                                                                </div>
                                                                {patient.inpatient && (
                                                                    <div className="text-danger small">Already admitted</div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Selected Patient</label>
                                            <input
                                                type="text"
                                                className="form-control bg-light"
                                                value={
                                                    selectedPatientForAdmission
                                                        ? `${selectedPatientForAdmission.name} (${selectedPatientForAdmission.patientId})`
                                                        : ""
                                                }
                                                placeholder="Select a patient from search results"
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Assign Doctor *</label>
                                            <select
                                                className="form-select"
                                                required
                                                value={admitForm.doctorId}
                                                onChange={(e) => setAdmitForm({ ...admitForm, doctorId: e.target.value })}
                                            >
                                                <option value="">Select Doctor</option>
                                                {mockDoctors.map((d) => (
                                                    <option key={d._id} value={d._id}>
                                                        {d.user.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Allocate Nurse *</label>
                                            <select
                                                className="form-select"
                                                required
                                                value={admitForm.allocatedNurse}
                                                onChange={(e) => setAdmitForm({ ...admitForm, allocatedNurse: e.target.value })}
                                            >
                                                <option value="">Select Nurse</option>
                                                {mockNurses.map((n) => (
                                                    <option key={n._id} value={n._id}>
                                                        {n.user.name} {n.nurseId ? `(${n.nurseId})` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Ward Category *</label>
                                            <select
                                                className="form-select"
                                                required
                                                value={admitForm.wardCategory}
                                                onChange={(e) => setAdmitForm({ ...admitForm, wardCategory: e.target.value })}
                                            >
                                                <option value="">Select Ward Category</option>
                                                <option value="General">General</option>
                                                <option value="Duplex">Duplex</option>
                                                <option value="Special">Special</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Room No. *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                value={admitForm.roomNumber}
                                                onChange={(e) => setAdmitForm({ ...admitForm, roomNumber: e.target.value })}
                                                placeholder="Enter room number"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Bed No.</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={admitForm.bedNumber}
                                                onChange={(e) => setAdmitForm({ ...admitForm, bedNumber: e.target.value })}
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Admission Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                required
                                                value={admitForm.admissionDate}
                                                onChange={(e) => setAdmitForm({ ...admitForm, admissionDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Reason for Admission</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={admitForm.reason}
                                                onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })}
                                                placeholder="Enter reason for admission"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6", padding: "15px" }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setIsAdmitModalOpen(false);
                                            setPatientSearchTerm("");
                                            setPatientSearchResults([]);
                                            setSelectedPatientForAdmission(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#8B4513", borderColor: "#8B4513" }}>
                                        Admit Patient
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Allocate Resources Modal */}
            {isAllocationModalOpen && selectedInpatient && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: "auto", padding: "20px 0" }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ margin: "auto", maxWidth: "600px" }}>
                        <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                            <div className="modal-header" style={{ flexShrink: 0 }}>
                                <h5 className="modal-title">
                                    {selectedInpatient.admitStatus === "Pending Allocation"
                                        ? "Allocate Resources"
                                        : "Re-allocate Resources"} for {selectedInpatient.name}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setIsAllocationModalOpen(false);
                                        setSelectedInpatient(null);
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleSaveAllocation} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                                <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label">Allocate Nurse *</label>
                                            <select
                                                className="form-select"
                                                required
                                                value={allocationForm.allocatedNurse}
                                                onChange={(e) => setAllocationForm({ ...allocationForm, allocatedNurse: e.target.value })}
                                            >
                                                <option value="">Select Nurse</option>
                                                {mockNurses.map((n) => (
                                                    <option key={n._id} value={n._id}>
                                                        {n.user.name} {n.nurseId ? `(${n.nurseId})` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Ward Category *</label>
                                            <select
                                                className="form-select"
                                                required
                                                value={allocationForm.wardCategory}
                                                onChange={(e) => setAllocationForm({ ...allocationForm, wardCategory: e.target.value })}
                                            >
                                                <option value="">Select Ward Category</option>
                                                <option value="General">General</option>
                                                <option value="Duplex">Duplex</option>
                                                <option value="Special">Special</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Room No. *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                value={allocationForm.roomNo}
                                                onChange={(e) => setAllocationForm({ ...allocationForm, roomNo: e.target.value })}
                                                placeholder="Enter room number"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Bed No.</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={allocationForm.bedNumber}
                                                onChange={(e) => setAllocationForm({ ...allocationForm, bedNumber: e.target.value })}
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6", padding: "15px" }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setIsAllocationModalOpen(false);
                                            setSelectedInpatient(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}>
                                        Save Allocation
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

export default Inpatient_View;
