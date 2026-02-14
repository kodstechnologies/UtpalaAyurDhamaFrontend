import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

// Icons
import PeopleIcon from "@mui/icons-material/People";
import LocalHotelIcon from "@mui/icons-material/LocalHotel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EditIcon from "@mui/icons-material/Edit";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

function Inpatient_View() {
    const [inpatients, setInpatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All"); // Changed default to "All" to show discharged patients
    const navigate = useNavigate();

    // Tooltip states
    const [hoveredButton, setHoveredButton] = useState(null);

    // Breadcrumb Data
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Receptionist", url: "/receptionist/dashboard" },
        { label: "Inpatients" },
    ];

    // Fetch only inpatients
    const fetchInpatients = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl("inpatients"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000, // Get all inpatients
                    },
                }
            );

            if (response.data.success) {
                const inpatientsData = response.data.data || [];

                // Fetch invoices for all inpatients to check payment status
                const invoiceIds = inpatientsData
                    .filter(ip => ip._id)
                    .map(ip => ip._id);

                let invoicesMap = {};
                if (invoiceIds.length > 0) {
                    try {
                        const invoicesResponse = await axios.get(
                            getApiUrl("invoices"),
                            {
                                headers: getAuthHeaders(),
                                params: {
                                    page: 1,
                                    limit: 1000,
                                },
                            }
                        );

                        if (invoicesResponse.data.success && invoicesResponse.data.data) {
                            // Create a map of inpatientId -> invoice
                            invoicesResponse.data.data.forEach((invoice) => {
                                if (invoice.inpatient) {
                                    const inpatientId = invoice.inpatient._id || invoice.inpatient;
                                    if (!invoicesMap[inpatientId] ||
                                        new Date(invoice.createdAt) > new Date(invoicesMap[inpatientId].createdAt)) {
                                        invoicesMap[inpatientId] = invoice;
                                    }
                                }
                            });
                        }
                    } catch (error) {
                        console.error("Error fetching invoices for payment status:", error);
                    }
                }

                // Transform API response to match frontend table structure
                const transformedInpatients = inpatientsData.map((inpatient) => {
                    // Check payment status
                    const invoice = invoicesMap[inpatient._id];
                    const isFullyPaid = invoice ? ((invoice.amountPaid || 0) >= (invoice.totalPayable || 0)) : false;

                    // Determine status based on payment and discharge date
                    let displayStatus = inpatient.status;

                    // If dischargeDate is set (bill finalized), check payment status
                    if (inpatient.dischargeDate) {
                        if (isFullyPaid) {
                            // Payment is complete - show as Discharged
                            displayStatus = "Discharged";
                        } else {
                            // Payment pending - show as Admitted (pending payment)
                            displayStatus = "Admitted";
                        }
                    }
                    // If no dischargeDate, use original status

                    // Map backend status to frontend status
                    const statusMap = {
                        "Admitted": "Admitted",
                        "admitted": "Admitted",
                        "Discharged": "Discharged",
                        "discharged": "Discharged",
                        "Transferred": "Under Observation",
                        "transferred": "Under Observation",
                    };

                    const mappedStatus = statusMap[displayStatus] || "Pending Allocation";

                    // Get patient profile ID (could be object or string)
                    const patientProfileId = inpatient.patient?._id || inpatient.patient || null;

                    return {
                        id: inpatient._id,
                        _id: inpatient._id,
                        patientProfileId: patientProfileId?.toString() || null,
                        name: inpatient.patient?.user?.name || "Unknown",
                        age: inpatient.patient?.user?.age || "N/A",
                        gender: inpatient.patient?.user?.gender || "N/A",
                        admittedOn: inpatient.admissionDate
                            ? new Date(inpatient.admissionDate).toISOString().split("T")[0]
                            : "N/A",
                        complain: inpatient.reason || "N/A",
                        admitStatus: mappedStatus,
                        roomNo: inpatient.roomNumber || undefined,
                        wardCategory: inpatient.wardCategory || undefined,
                        allocatedNurse: inpatient.allocatedNurse?.user?.name || undefined,
                        allocatedNurseId: inpatient.allocatedNurse?._id || undefined,
                        doctorName: inpatient.doctor?.user?.name || inpatient.examinations?.[0]?.doctor?.user?.name || "N/A",
                        bedNumber: inpatient.bedNumber || undefined,
                        hasPendingPayment: invoice && !isFullyPaid, // Flag for UI indication
                        hasBill: !!invoice, // Flag for Billed badge
                    };
                });

                setInpatients(transformedInpatients);
            } else {
                toast.error(response.data.message || "Failed to fetch inpatients");
            }
        } catch (error) {
            console.error("Error fetching inpatients:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch inpatients");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInpatients();
    }, [fetchInpatients]);

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

    // Filter and sort inpatients by admission time (most recent first)
    const filteredData = useMemo(() => {
        const filtered = inpatients.filter((patient) => {
            const matchesSearch =
                patient.name.toLowerCase().includes(search.toLowerCase()) ||
                (patient.doctorName && patient.doctorName.toLowerCase().includes(search.toLowerCase())) ||
                (patient.roomNo && patient.roomNo.toLowerCase().includes(search.toLowerCase()));
            const matchesStatus = statusFilter === "All" || patient.admitStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
        
        // Sort by admission date (most recent first)
        return filtered.sort((a, b) => {
            const dateA = a.admittedOn && a.admittedOn !== "N/A" ? new Date(a.admittedOn) : new Date(0);
            const dateB = b.admittedOn && b.admittedOn !== "N/A" ? new Date(b.admittedOn) : new Date(0);
            return dateB - dateA; // Most recent first
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
            />

            {/* Statistics Cards */}
            <Box
                sx={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "15px",
                    marginTop: 3,
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
                                        placeholder="Search by name, doctor, or room..."
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
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                                <CircularProgress />
                            </Box>
                        ) : filteredData.length === 0 ? (
                            <Box sx={{ textAlign: "center", padding: "40px" }}>
                                <Typography variant="body1" color="text.secondary">
                                    No inpatients found.
                                </Typography>
                            </Box>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover" style={{ fontSize: "0.875rem" }}>
                                    <thead>
                                        <tr>
                                            <th style={{ fontSize: "0.875rem" }}>Sl. No.</th>
                                            <th style={{ fontSize: "0.875rem" }}>Patient Name</th>
                                            <th style={{ fontSize: "0.875rem" }}>Doctor</th>
                                            <th style={{ fontSize: "0.875rem" }}>Ward</th>
                                            <th style={{ fontSize: "0.875rem" }}>Room No.</th>
                                            <th style={{ fontSize: "0.875rem" }}>Bed No.</th>
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
                                                    <div className="d-flex align-items-center gap-2">
                                                        <strong>{patient.name}</strong>
                                                        {patient.hasBill && (
                                                            <span className="badge rounded-pill bg-success" style={{ fontSize: "0.65rem" }}>
                                                                Billed
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
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
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {patient.bedNumber ? (
                                                        <span>{patient.bedNumber}</span>
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
                                                    {patient.hasPendingPayment && (
                                                        <span
                                                            className="badge bg-warning ms-2"
                                                            style={{ fontSize: "0.7rem", padding: "2px 6px" }}
                                                            title="Payment pending - Patient will show as Discharged after full payment"
                                                        >
                                                            Payment Pending
                                                        </span>
                                                    )}
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
                                                        <div style={{ position: "relative", display: "inline-block" }}>
                                                            <Link
                                                                to={`/receptionist/patient-history/${patient.patientProfileId || patient.id}`}
                                                                className="btn btn-sm"
                                                                style={{
                                                                    backgroundColor: "#4A90E2",
                                                                    borderColor: "#4A90E2",
                                                                    color: "#fff",
                                                                    borderRadius: "8px",
                                                                    padding: "6px 12px",
                                                                    fontWeight: 500,
                                                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                    transition: "all 0.3s ease",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    gap: "4px",
                                                                    textDecoration: "none",
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#357ABD";
                                                                    e.currentTarget.style.transform = "translateY(-2px)";
                                                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                    setHoveredButton(`history-${patient.id}`);
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#4A90E2";
                                                                    e.currentTarget.style.transform = "translateY(0)";
                                                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    setHoveredButton(null);
                                                                }}
                                                            >
                                                                <CalendarTodayIcon fontSize="small" />
                                                                <span style={{ fontSize: "0.75rem" }}>View History</span>
                                                            </Link>
                                                            {hoveredButton === `history-${patient.id}` && (
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
                                                                    View Complete History
                                                                </span>
                                                            )}
                                                        </div>
                                                        {patient.admitStatus !== "Discharged" && (
                                                            <div style={{ position: "relative", display: "inline-block" }}>
                                                                {!patient.allocatedNurse || patient.allocatedNurse === "N/A" ? (
                                                                    // No nurse assigned - Show "Allocate Nurse" button
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm"
                                                                            onClick={() => handleOpenAllocationModal(patient)}
                                                                            style={{
                                                                                backgroundColor: "#90EE90",
                                                                                borderColor: "#90EE90",
                                                                                color: "#fff",
                                                                                borderRadius: "8px",
                                                                                padding: "6px 12px",
                                                                                fontWeight: 500,
                                                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                                transition: "all 0.3s ease",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                gap: "4px",
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
                                                                            <AssignmentIcon fontSize="small" />
                                                                            <span style={{ fontSize: "0.75rem" }}>Allocate Nurse</span>
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
                                                                                Allocate Nurse
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    // Nurse assigned - Show edit/pen button with "Re-allocate Nurse" tooltip
                                                                    <>
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
                                                                            <EditIcon fontSize="small" />
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
                                                                                Re-allocate Nurse
                                                                            </span>
                                                                        )}
                                                                    </>
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
                        )}
                    </div>
                </div>
            </Box>
        </Box>
    );
}

export default Inpatient_View;
