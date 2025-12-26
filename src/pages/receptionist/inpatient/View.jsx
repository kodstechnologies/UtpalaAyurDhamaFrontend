import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";

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

function Inpatient_View() {
    const [inpatients] = useState(mockInpatients);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const navigate = useNavigate();

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

    const handleOpenAllocationModal = (patient) => {
        const params = new URLSearchParams({
            inpatientId: patient.id || "",
            patientName: patient.name || "",
            allocatedNurse: patient.allocatedNurseId || "",
            wardCategory: patient.wardCategory || "",
            roomNo: patient.roomNo || "",
            bedNumber: patient.bedNumber || "",
            reallocate: patient.admitStatus !== "Pending Allocation" ? "true" : "false",
        });
        navigate(`/receptionist/inpatient/allocate?${params.toString()}`);
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
                        onClick={() => navigate("/receptionist/inpatient/admit")}
                        style={{
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            backgroundColor: "var(--color-bg-table-button)"
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
        </Box>
    );
}

export default Inpatient_View;
