import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography, TablePagination } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

// Icons
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EditIcon from "@mui/icons-material/Edit";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

const EXPORT_COLUMNS = [
    { field: "slNo", header: "Sl. No." },
    { field: "name", header: "Patient Name" },
    { field: "uhid", header: "UHID" },
    { field: "doctorName", header: "Doctor" },
    { field: "lastVisitDate", header: "Last Visit" },
    { field: "allocatedNurse", header: "Allocated Nurse" },
    { field: "phone", header: "Phone" },
    { field: "status", header: "Status" },
];

const extractPatientsData = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (responseData?.profiles) return responseData.profiles;
    if (responseData?.data) return responseData.data;
    return [];
};

const extractExaminationsData = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (responseData?.data) return responseData.data;
    return [];
};

const extractInvoicesData = (responseData) => {
    if (!responseData?.success) return [];
    if (Array.isArray(responseData.data)) return responseData.data;
    if (responseData.data?.data) return responseData.data.data;
    return [];
};

const buildPatientByIdMap = (patientsData) => {
    const patientByIdMap = new Map();
    patientsData.forEach((patient) => {
        const id = patient._id?.toString();
        if (id) patientByIdMap.set(id, patient);
    });
    return patientByIdMap;
};

const buildInvoicesMap = (invoicesData, examinationIds) => {
    const invoicesMap = {};
    invoicesData.forEach((invoice) => {
        if (!invoice.examination) return;
        const examId = invoice.examination._id?.toString() || invoice.examination.toString();
        if (!examinationIds.includes(examId)) return;
        if (
            !invoicesMap[examId] ||
            new Date(invoice.createdAt) > new Date(invoicesMap[examId].createdAt)
        ) {
            invoicesMap[examId] = invoice;
        }
    });
    return invoicesMap;
};

const transformExaminationsToOutpatients = (examinationsData, patientByIdMap, invoicesMap) =>
    examinationsData
        .map((exam) => {
            const patientId = exam.patient?._id?.toString() || exam.patient?.toString();
            if (!patientId) return null;

            const patient =
                patientByIdMap.get(patientId) ||
                (exam.patient && typeof exam.patient === "object" ? exam.patient : null);
            const patientUser = patient?.user || {};

            const invoice = invoicesMap[exam._id?.toString()];
            const isFullyPaid = invoice
                ? (invoice.amountPaid || 0) >= (invoice.totalPayable || 0)
                : false;

            let isDischarged = false;
            if (exam.isBilled) {
                if (isFullyPaid && invoice && invoice.totalPayable > 0) {
                    isDischarged = true;
                }
            }

            return {
                id: exam._id,
                _id: exam._id,
                examinationId: exam._id,
                patientId,
                name: patientUser.name || patient?.name || "Unknown",
                age: patientUser.age || patient?.age || "N/A",
                gender: patientUser.gender || patient?.gender || "N/A",
                uhid: patientUser.uhid || patient?.uhid || "N/A",
                phone: patientUser.phone || patient?.phone || "N/A",
                email: patientUser.email || patient?.email || "N/A",
                registeredDate: exam.createdAt
                    ? new Date(exam.createdAt).toISOString().split("T")[0]
                    : "N/A",
                complain: exam.complaints || "OPD Patient",
                doctorName: exam.doctor?.user?.name || exam.doctor?.name || "N/A",
                lastVisitDate: exam.createdAt
                    ? new Date(exam.createdAt).toISOString().split("T")[0]
                    : "N/A",
                allocatedNurse: (() => {
                    const nurseSource = exam.allocatedNurse || patient?.allocatedNurse;
                    if (nurseSource && typeof nurseSource === "object") {
                        return nurseSource.user?.name;
                    }
                    return undefined;
                })(),
                allocatedNurseId: (() => {
                    const nurseSource = exam.allocatedNurse || patient?.allocatedNurse;
                    if (nurseSource && typeof nurseSource === "object" && nurseSource._id) {
                        return nurseSource._id;
                    }
                    return nurseSource || undefined;
                })(),
                hasFinalizedBill: !!exam.isBilled,
                hasUnbilledVisit: !exam.isBilled,
                isDischarged,
                hasPendingPayment: invoice && !isFullyPaid,
                hasBill: !!invoice,
                type: "OPD",
            };
        })
        .filter(Boolean);

const getOutpatientStatus = (patient) => {
    if (patient.isDischarged) return "Discharged";
    if (patient.hasFinalizedBill) return "Billed";
    return "Unbilled";
};

function Outpatient_View() {
    const [outpatients, setOutpatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 25,
        total: 0,
    });
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
            // Fetch patients (we need all for lookup, but can paginate later if needed)
            // For now, fetch a reasonable amount for patient lookup
            // Fetch paginated OPD examinations (hasInpatient: false). List is built from OPD exams
            const examParams = {
                page: pagination.page + 1, // Backend uses 1-based pagination
                limit: pagination.rowsPerPage,
                hasInpatient: "false" // Only OPD examinations
            };

            // Add search parameter if search is active
            if (search && search.trim()) {
                examParams.search = search.trim();
            }


            const [patientsResponse, allExamsResponse, invoicesResponse] = await Promise.all([
                axios.get(
                    getApiUrl("patients"),
                    {
                        headers: getAuthHeaders(),
                        params: {
                            page: 1,
                            limit: 500, // Reduced but still enough for patient lookup
                        },
                    }
                ),
                axios.get(
                    getApiUrl("examinations"),
                    {
                        headers: getAuthHeaders(),
                        params: examParams,
                    }
                ),
                // Fetch invoices to check payment status
                axios.get(
                    getApiUrl("invoices"),
                    {
                        headers: getAuthHeaders(),
                        params: {
                            page: 1,
                            limit: 1000, // Get invoices for payment status check
                        },
                    }
                ).catch(() => ({ data: { success: false, data: [] } })) // Don't fail if invoices fail
            ]);

            console.log("Patients API Response:", patientsResponse.data);
            console.log("All Exams Response:", allExamsResponse.data);

            if (patientsResponse.data.success && allExamsResponse.data.success) {
                const patientsData = extractPatientsData(patientsResponse.data.data);
                const examinationsData = extractExaminationsData(allExamsResponse.data.data);
                const examinationIds = examinationsData
                    .filter((exam) => exam._id)
                    .map((exam) => exam._id.toString());
                const patientByIdMap = buildPatientByIdMap(patientsData);
                const invoicesData = extractInvoicesData(invoicesResponse.data);
                const invoicesMap = buildInvoicesMap(invoicesData, examinationIds);
                const transformedOutpatients = transformExaminationsToOutpatients(
                    examinationsData,
                    patientByIdMap,
                    invoicesMap
                );

                console.log("Total outpatient examination rows:", transformedOutpatients.length);
                setOutpatients(transformedOutpatients);

                // Update pagination metadata from examinations response
                if (allExamsResponse.data.meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: allExamsResponse.data.meta.total || 0,
                    }));
                }
            } else {
                toast.error(allExamsResponse?.data?.message || "Failed to fetch outpatient visits");
            }
        } catch (error) {
            console.error("Error fetching outpatient visits:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch outpatient visits");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.rowsPerPage, search]);

    useEffect(() => {
        fetchOutpatients();
    }, [fetchOutpatients]);

    // Reset to first page when search changes
    useEffect(() => {
        setPagination(prev => (prev.page === 0 ? prev : { ...prev, page: 0 }));
    }, [search]);

    // Refresh data when navigating back from allocation page
    useEffect(() => {
        if (location.state?.refresh) {
            fetchOutpatients();
            // Clear the refresh state
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, fetchOutpatients, navigate, location.pathname]);

    // Calculate statistics: total from server (all pages), unbilled/billed/discharged from current page
    const stats = useMemo(() => {
        let unbilledVisits = 0;
        let billedVisits = 0;
        let dischargedVisits = 0;

        outpatients.forEach(patient => {
            if (patient.isDischarged) {
                dischargedVisits++;
            } else if (patient.hasUnbilledVisit) {
                unbilledVisits++;
            } else if (patient.hasFinalizedBill) {
                billedVisits++;
            }
        });

        return {
            total: pagination.total,
            unbilledVisits,
            billedVisits,
            dischargedVisits,
        };
    }, [outpatients, pagination.total]);

    // Sort outpatients by time (most recent first) - search is now server-side
    const filteredData = useMemo(() => {
        // Server-side search is already applied, just sort client-side
        return [...outpatients].sort((a, b) => {
            const dateA = a.lastVisitDate && a.lastVisitDate !== "N/A"
                ? new Date(a.lastVisitDate)
                : (a.registeredDate && a.registeredDate !== "N/A" ? new Date(a.registeredDate) : new Date(0));
            const dateB = b.lastVisitDate && b.lastVisitDate !== "N/A"
                ? new Date(b.lastVisitDate)
                : (b.registeredDate && b.registeredDate !== "N/A" ? new Date(b.registeredDate) : new Date(0));
            return dateB - dateA; // Most recent first
        });
    }, [outpatients]);

    const handleOpenAllocationModal = (patient) => {
        const params = new URLSearchParams({
            patientId: patient.patientId || patient.id || "",
            patientName: patient.name || "",
            allocatedNurse: patient.allocatedNurseId || "",
        });
        navigate(`/receptionist/outpatient/allocate?${params.toString()}`);
    };

    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const examParams = {
                hasInpatient: "false",
                limit: 100,
            };
            if (search && search.trim()) {
                examParams.search = search.trim();
            }

            const allExaminations = [];
            let page = 1;
            let totalPages = 1;

            do {
                const examsResponse = await axios.get(getApiUrl("examinations"), {
                    headers: getAuthHeaders(),
                    params: { ...examParams, page },
                });

                if (!examsResponse.data.success) {
                    throw new Error(examsResponse.data.message || "Failed to fetch outpatient visits");
                }

                const pageExams = extractExaminationsData(examsResponse.data.data);
                allExaminations.push(...pageExams);
                totalPages = examsResponse.data.meta?.totalPages || 1;
                page += 1;
            } while (page <= totalPages);

            if (allExaminations.length === 0) {
                toast.warning("No outpatients to export.");
                return;
            }

            const examinationIds = allExaminations
                .filter((exam) => exam._id)
                .map((exam) => exam._id.toString());

            const [patientsResponse, invoicesResponse] = await Promise.all([
                axios.get(getApiUrl("patients"), {
                    headers: getAuthHeaders(),
                    params: { page: 1, limit: 10000 },
                }),
                axios
                    .get(getApiUrl("invoices"), {
                        headers: getAuthHeaders(),
                        params: { page: 1, limit: 10000 },
                    })
                    .catch(() => ({ data: { success: false, data: [] } })),
            ]);

            const patientsData = patientsResponse.data.success
                ? extractPatientsData(patientsResponse.data.data)
                : [];
            const patientByIdMap = buildPatientByIdMap(patientsData);
            const invoicesData = extractInvoicesData(invoicesResponse.data);
            const invoicesMap = buildInvoicesMap(invoicesData, examinationIds);

            const exportRows = transformExaminationsToOutpatients(
                allExaminations,
                patientByIdMap,
                invoicesMap
            )
                .sort((a, b) => {
                    const dateA =
                        a.lastVisitDate && a.lastVisitDate !== "N/A"
                            ? new Date(a.lastVisitDate)
                            : new Date(0);
                    const dateB =
                        b.lastVisitDate && b.lastVisitDate !== "N/A"
                            ? new Date(b.lastVisitDate)
                            : new Date(0);
                    return dateB - dateA;
                })
                .map((patient, index) => ({
                    slNo: index + 1,
                    name: patient.name,
                    uhid: patient.uhid,
                    doctorName: patient.doctorName,
                    lastVisitDate: patient.lastVisitDate,
                    allocatedNurse: patient.allocatedNurse || "N/A",
                    phone: patient.phone,
                    status: getOutpatientStatus(patient),
                }));

            const sheetData = [
                EXPORT_COLUMNS.map((col) => col.header),
                ...exportRows.map((row) => EXPORT_COLUMNS.map((col) => row[col.field] ?? "")),
            ];

            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Outpatients");
            XLSX.writeFile(workbook, "outpatients.xlsx");

            toast.success(`Exported ${exportRows.length} outpatient records to Excel.`);
        } catch (error) {
            console.error("Error exporting outpatients:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to export Excel file.");
        } finally {
            setIsExporting(false);
        }
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
                        md: "repeat(2, 1fr)",
                        lg: "repeat(4, 1fr)",
                    },
                    gap: "15px",
                    marginTop: 3,
                }}
            >
                <DashboardCard
                    title="Total Outpatients"
                    count={stats.total}
                    icon={PeopleIcon}
                />
                <DashboardCard
                    title="Unbilled Visits"
                    count={stats.unbilledVisits}
                    icon={PendingActionsIcon}
                />
                <DashboardCard
                    title="Billed Visits"
                    count={stats.billedVisits}
                    icon={ReceiptIcon}
                />
                <DashboardCard
                    title="Discharged"
                    count={stats.dischargedVisits}
                    icon={LocalHospitalIcon}
                />
            </Box>

            {/* Table Section */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="mb-4">
                            <h5 className="card-title mb-0">Outpatients List</h5>
                        </div>

                        {/* Search */}
                        <div className="row g-3 mb-4 align-items-center">
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
                            <div className="col-md-6 d-flex justify-content-md-end">
                                <button
                                    type="button"
                                    onClick={handleExportExcel}
                                    disabled={isExporting || isLoading}
                                    style={{
                                        padding: "10px 18px",
                                        background: "var(--color-primary)",
                                        color: "#fff",
                                        borderRadius: "8px",
                                        border: "none",
                                        cursor: isExporting || isLoading ? "not-allowed" : "pointer",
                                        fontSize: "14px",
                                        opacity: isExporting || isLoading ? 0.7 : 1,
                                    }}
                                >
                                    {isExporting ? "Exporting..." : "Export Excel"}
                                </button>
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
                                                <td style={{ fontSize: "0.875rem" }}>{pagination.page * pagination.rowsPerPage + index + 1}</td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <strong>{patient.name}</strong>
                                                        {patient.isDischarged ? (
                                                            <span className="badge rounded-pill bg-info" style={{ fontSize: "0.65rem" }}>
                                                                Discharged
                                                            </span>
                                                        ) : patient.hasFinalizedBill ? (
                                                            <span className="badge rounded-pill bg-success" style={{ fontSize: "0.65rem" }}>
                                                                Billed
                                                            </span>
                                                        ) : null}
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

                        {/* Pagination */}
                        {!isLoading && filteredData.length > 0 && (
                            <TablePagination
                                component="div"
                                count={pagination.total}
                                page={pagination.page}
                                rowsPerPage={pagination.rowsPerPage}
                                onPageChange={(_, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                                onRowsPerPageChange={(e) => {
                                    setPagination(prev => ({
                                        ...prev,
                                        rowsPerPage: parseInt(e.target.value, 10),
                                        page: 0
                                    }));
                                }}
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                labelRowsPerPage="Rows per page:"
                            />
                        )}
                    </div>
                </div>
            </Box>
        </Box>
    );
}

export default Outpatient_View;

