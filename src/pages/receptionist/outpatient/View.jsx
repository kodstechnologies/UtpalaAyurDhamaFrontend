import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EditIcon from "@mui/icons-material/Edit";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

function Outpatient_View() {
    const [outpatients, setOutpatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // Tooltip states
    const [hoveredButton, setHoveredButton] = useState(null);

    // Breadcrumb Data
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Receptionist", url: "/receptionist/dashboard" },
        { label: "Outpatients" },
    ];

    // Fetch outpatients from API
    const fetchOutpatients = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch all patients, unbilled OPD examinations, today's examinations, and active inpatients in parallel
            const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
            const [patientsResponse, unbilledExamsResponse, todayExamsResponse, inpatientsResponse] = await Promise.all([
                axios.get(
                    getApiUrl("patients"),
                    {
                        headers: getAuthHeaders(),
                        params: {
                            page: 1,
                            limit: 1000,
                        },
                    }
                ),
                axios.get(
                    getApiUrl("examinations"),
                    {
                        headers: getAuthHeaders(),
                        params: {
                            page: 1,
                            limit: 1000,
                            isBilled: "false",
                            hasInpatient: "false"
                        },
                    }
                ),
                axios.get(
                    getApiUrl("examinations"),
                    {
                        headers: getAuthHeaders(),
                        params: {
                            page: 1,
                            limit: 1000,
                            startDate: today,
                            hasInpatient: "false"
                        },
                    }
                ),
                axios.get(
                    getApiUrl("inpatients"),
                    {
                        headers: getAuthHeaders(),
                        params: {
                            page: 1,
                            limit: 1000,
                            status: "Admitted"
                        },
                    }
                )
            ]);

            console.log("Patients API Response:", patientsResponse.data);
            console.log("Unbilled Exams Response:", unbilledExamsResponse.data);
            console.log("Today Exams Response:", todayExamsResponse.data);
            console.log("Inpatients API Response:", inpatientsResponse.data);

            if (patientsResponse.data.success && unbilledExamsResponse.data.success && todayExamsResponse.data.success) {
                // Handle different patient response structures
                let patientsData = [];
                if (Array.isArray(patientsResponse.data.data)) {
                    patientsData = patientsResponse.data.data;
                } else if (patientsResponse.data.data?.profiles) {
                    patientsData = patientsResponse.data.data.profiles;
                } else if (patientsResponse.data.data?.data) {
                    patientsData = patientsResponse.data.data.data;
                }

                // Combine and deduplicate examinations
                const allExams = [
                    ...(Array.isArray(unbilledExamsResponse.data.data) ? unbilledExamsResponse.data.data : (unbilledExamsResponse.data.data?.data || [])),
                    ...(Array.isArray(todayExamsResponse.data.data) ? todayExamsResponse.data.data : (todayExamsResponse.data.data?.data || []))
                ];

                const uniqueExamsMap = new Map();
                allExams.forEach(exam => {
                    uniqueExamsMap.set(exam._id.toString(), exam);
                });
                const examinationsData = Array.from(uniqueExamsMap.values());

                const inpatientsData = inpatientsResponse.data.success
                    ? (Array.isArray(inpatientsResponse.data.data)
                        ? inpatientsResponse.data.data
                        : inpatientsResponse.data.data?.data || [])
                    : [];

                // Get patient IDs who are currently admitted as inpatients
                const activeInpatientPatientIds = new Set(
                    inpatientsData
                        .filter(ip => ip.status === "Admitted")
                        .map(ip => {
                            const patientId = ip.patient?._id || ip.patient;
                            return patientId?.toString();
                        })
                        .filter(Boolean)
                );

                // Filter patients who are NOT currently admitted
                const filteredPatients = patientsData.filter((patient) => {
                    const patientId = patient._id?.toString();
                    return !activeInpatientPatientIds.has(patientId);
                });

                // Create a map of patient ID to their examinations (unbilled or today's billed)
                const patientExaminationsMap = new Map();
                examinationsData.forEach(exam => {
                    const patientId = exam.patient?._id?.toString() || exam.patient?.toString();
                    if (patientId) {
                        if (!patientExaminationsMap.has(patientId)) {
                            patientExaminationsMap.set(patientId, []);
                        }
                        patientExaminationsMap.get(patientId).push(exam);
                    }
                });

                // Build the final list: 
                // 1. One row per unbilled examination for patients who have them
                // 2. One row per patient for patients who have NO unbilled examinations
                const mergedRows = [];

                filteredPatients.forEach(patient => {
                    const patientId = patient._id?.toString();
                    const patientExams = patientExaminationsMap.get(patientId) || [];
                    const patientUser = patient.user || {};

                    if (patientExams.length > 0) {
                        patientExams.forEach(exam => {
                            mergedRows.push({
                                id: exam._id,
                                _id: exam._id,
                                examinationId: exam._id,
                                patientId: patientId,
                                name: patientUser.name || "Unknown",
                                age: patientUser.age || "N/A",
                                gender: patientUser.gender || "N/A",
                                uhid: patientUser.uhid || patient.uhid || "N/A",
                                phone: patientUser.phone || "N/A",
                                email: patientUser.email || "N/A",
                                registeredDate: exam.createdAt
                                    ? new Date(exam.createdAt).toISOString().split("T")[0]
                                    : "N/A",
                                complain: exam.complaints || "OPD Patient",
                                doctorName: exam.doctor?.user?.name || exam.doctor?.name || "N/A",
                                lastVisitDate: exam.createdAt
                                    ? new Date(exam.createdAt).toISOString().split("T")[0]
                                    : "N/A",
                                allocatedNurse: (() => {
                                    const nurseSource = exam.allocatedNurse || patient.allocatedNurse;
                                    if (nurseSource && typeof nurseSource === 'object') {
                                        return nurseSource.user?.name;
                                    }
                                    return undefined;
                                })(),
                                allocatedNurseId: (() => {
                                    const nurseSource = exam.allocatedNurse || patient.allocatedNurse;
                                    return typeof nurseSource === 'object' ? nurseSource._id : nurseSource;
                                })(),
                                hasFinalizedBill: !!exam.isBilled,
                                hasUnbilledVisit: !exam.isBilled,
                                type: "OPD",
                            });
                        });
                    } else {
                        mergedRows.push({
                            id: patient._id,
                            _id: patient._id,
                            examinationId: null,
                            patientId: patientId,
                            name: patientUser.name || "Unknown",
                            age: patientUser.age || "N/A",
                            gender: patientUser.gender || "N/A",
                            uhid: patientUser.uhid || patient.uhid || "N/A",
                            phone: patientUser.phone || "N/A",
                            email: patientUser.email || "N/A",
                            registeredDate: patient.createdAt
                                ? new Date(patient.createdAt).toISOString().split("T")[0]
                                : "N/A",
                            complain: "Idle / Follow-up Pending",
                            doctorName: patient.primaryDoctor?.user?.name || patient.primaryDoctor?.name || "N/A",
                            lastVisitDate: patient.createdAt ? new Date(patient.createdAt).toISOString().split("T")[0] : "N/A",
                            allocatedNurse: (patient.allocatedNurse && typeof patient.allocatedNurse === 'object') ? patient.allocatedNurse.user?.name : undefined,
                            allocatedNurseId: (patient.allocatedNurse && typeof patient.allocatedNurse === 'object') ? patient.allocatedNurse._id : patient.allocatedNurse,
                            hasFinalizedBill: true,
                            hasUnbilledVisit: false,
                            type: "OPD",
                        });
                    }
                });

                console.log("Total merged outpatient rows:", mergedRows.length);
                setOutpatients(mergedRows);
            } else {
                toast.error(examinationsResponse.data.message || "Failed to fetch outpatient visits");
            }
        } catch (error) {
            console.error("Error fetching outpatient visits:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch outpatient visits");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOutpatients();
    }, [fetchOutpatients]);

    // Refresh data when navigating back from allocation page
    useEffect(() => {
        if (location.state?.refresh) {
            fetchOutpatients();
            // Clear the refresh state
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, fetchOutpatients, navigate, location.pathname]);

    // Calculate statistics
    const stats = useMemo(() => {
        return {
            total: outpatients.length,
        };
    }, [outpatients]);

    // Filter outpatients
    const filteredData = useMemo(() => {
        return outpatients.filter((patient) => {
            const matchesSearch =
                patient.name.toLowerCase().includes(search.toLowerCase()) ||
                (patient.doctorName && patient.doctorName.toLowerCase().includes(search.toLowerCase())) ||
                (patient.phone && patient.phone.toLowerCase().includes(search.toLowerCase()));
            return matchesSearch;
        });
    }, [outpatients, search]);

    const handleOpenAllocationModal = (patient) => {
        const params = new URLSearchParams({
            patientId: patient.patientId || patient.id || "",
            patientName: patient.name || "",
            allocatedNurse: patient.allocatedNurseId || "",
        });
        navigate(`/receptionist/outpatient/allocate?${params.toString()}`);
    };

    return (
        <Box sx={{ padding: "20px" }}>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Page Heading */}
            <HeadingCardingCard
                category="OUTPATIENT MANAGEMENT"
                title="Out-Patient Management"
                subtitle="View and manage all outpatient records"
            />

            {/* Statistics Cards */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: "repeat(5, 1fr)",
                    },
                    gap: "15px",
                    marginTop: 3,
                }}
            >
                <DashboardCard title="Total Outpatients" count={stats.total} icon={PeopleIcon} />
            </Box>

            {/* Table Section */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="mb-4">
                            <h5 className="card-title mb-0">Outpatients List</h5>
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
                                        placeholder="Search by name, doctor, or phone..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
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
                                    No outpatients found.
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
                                            <th style={{ fontSize: "0.875rem" }}>Last Visit</th>
                                            <th style={{ fontSize: "0.875rem" }}>Allocated Nurse</th>
                                            <th style={{ fontSize: "0.875rem" }}>Phone</th>
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
                                                        {patient.hasFinalizedBill && (
                                                            <span className="badge rounded-pill bg-success" style={{ fontSize: "0.65rem" }}>
                                                                Billed
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {patient.doctorName && patient.doctorName !== "N/A" ? (
                                                        <span>
                                                            <LocalHospitalIcon fontSize="small" className="me-1" />
                                                            {patient.doctorName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">N/A</span>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.lastVisitDate}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.allocatedNurse || <span className="text-muted">N/A</span>}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.phone}</td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex gap-2">
                                                        <div style={{ position: "relative", display: "inline-block" }}>
                                                            <Link
                                                                to={patient.examinationId
                                                                    ? `/receptionist/outpatient-billing/${patient.patientId}?examinationId=${patient.examinationId}`
                                                                    : `/receptionist/outpatient-billing/${patient.patientId}`}
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
                                                                    View Billing
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ position: "relative", display: "inline-block" }}>
                                                            <Link
                                                                to={`/receptionist/patient-history/${patient.patientId}`}
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
                                                        {!patient.hasFinalizedBill && (
                                                            <div style={{ position: "relative", display: "inline-block" }}>
                                                                {!patient.allocatedNurse || patient.allocatedNurse === "N/A" || patient.allocatedNurse === "" ? (
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

export default Outpatient_View;

