// import { useState, useMemo, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { Box, CircularProgress, Tabs, Tab, Chip, TablePagination } from "@mui/material";
// import axios from "axios";
// import { getApiUrl, getAuthHeaders } from "../../../config/api";
// import HeadingCard from "../../../components/card/HeadingCard";
// import { toast } from "react-toastify";

// // Icons
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import PersonIcon from "@mui/icons-material/Person";
// import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
// import SearchIcon from "@mui/icons-material/Search";
// import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

// function Treatments_View() {
//     const navigate = useNavigate();
//     const [activeTab, setActiveTab] = useState("all"); // "all", "opd", "ipd"
//     const [sessions, setSessions] = useState([]);
//     const [allSessionsData, setAllSessionsData] = useState([]); // Store all sessions for accurate counts
//     const [isLoading, setIsLoading] = useState(true);
//     const [search, setSearch] = useState("");
//     const [hoveredButton, setHoveredButton] = useState(null);
//     const [pagination, setPagination] = useState({
//         page: 0,
//         rowsPerPage: 25,
//         total: 0,
//     });

//     // Fetch therapist sessions (visits) from API
//     const fetchSessions = useCallback(async (signal = null) => {
//         setIsLoading(true);
//         try {
//             const params = {
//                 // Note: treatment-list endpoint doesn't support pagination yet, so we'll fetch all and paginate client-side
//                 // If backend adds pagination, update this
//             };

//             // Add type filter based on active tab
//             if (activeTab === "opd") {
//                 params.type = "OPD";
//             } else if (activeTab === "ipd") {
//                 params.type = "IPD";
//             }
//             // "all" means no type filter

//             // Fetch therapist sessions (treatment-list endpoint returns visit-wise data)
//             // Also fetch invoices, inpatients, and examinations to check discharge status
//             const [sessionsResponse, invoicesResponse, inpatientsResponse, examinationsResponse] = await Promise.all([
//                 axios.get(
//                     getApiUrl("therapist-sessions/treatment-list"),
//                     {
//                         headers: getAuthHeaders(),
//                         params,
//                         signal
//                     }
//                 ),
//                 // Fetch invoices to check payment status for OPD discharge
//                 axios.get(
//                     getApiUrl("invoices"),
//                     {
//                         headers: getAuthHeaders(),
//                         params: { page: 1, limit: 1000 },
//                         signal
//                     }
//                 ).catch(() => ({ data: { success: false, data: [] } })),
//                 // Fetch inpatients to check discharge status for IPD
//                 axios.get(
//                     getApiUrl("inpatients"),
//                     {
//                         headers: getAuthHeaders(),
//                         params: { page: 1, limit: 1000 },
//                         signal
//                     }
//                 ).catch(() => ({ data: { success: false, data: [] } })),
//                 // Fetch examinations to check isBilled status for OPD
//                 axios.get(
//                     getApiUrl("examinations"),
//                     {
//                         headers: getAuthHeaders(),
//                         params: { page: 1, limit: 1000 },
//                         signal
//                     }
//                 ).catch(() => ({ data: { success: false, data: [] } }))
//             ]);

//             if (sessionsResponse.data.success) {
//                 const sessionsData = sessionsResponse.data.data || [];

//                 // Create maps for discharge status checking
//                 const invoicesMap = new Map();
//                 if (invoicesResponse.data.success) {
//                     const invoices = Array.isArray(invoicesResponse.data.data)
//                         ? invoicesResponse.data.data
//                         : (invoicesResponse.data.data?.data || []);
//                     invoices.forEach(invoice => {
//                         if (invoice.examination) {
//                             const examId = invoice.examination._id?.toString() || invoice.examination.toString();
//                             invoicesMap.set(examId, invoice);
//                         }
//                     });
//                 }

//                 const examinationsMap = new Map();
//                 if (examinationsResponse.data.success) {
//                     const examinations = Array.isArray(examinationsResponse.data.data)
//                         ? examinationsResponse.data.data
//                         : (examinationsResponse.data.data?.data || []);
//                     examinations.forEach(exam => {
//                         const examId = exam._id?.toString();
//                         if (examId) {
//                             examinationsMap.set(examId, exam);
//                         }
//                     });
//                 }

//                 const inpatientsMap = new Map();
//                 if (inpatientsResponse.data.success) {
//                     const inpatients = Array.isArray(inpatientsResponse.data.data)
//                         ? inpatientsResponse.data.data
//                         : (inpatientsResponse.data.data?.data || []);
//                     inpatients.forEach(inpatient => {
//                         const patientId = inpatient.patient?._id?.toString() || inpatient.patient?.toString();
//                         if (patientId) {
//                             inpatientsMap.set(patientId, inpatient);
//                         }
//                     });
//                 }

//                 // Transform sessions to match frontend table structure (visit-wise)
//                 const transformedSessions = sessionsData.map((session) => {
//                     const patient = session.patient || {};
//                     const patientUser = patient.user || {};

//                     // Use backend-provided fields first, then fallback to nested structure
//                     const patientName = session.patientName || patientUser.name || patient?.name || "Unknown";
//                     const patientPhone = session.patientPhone || patientUser.phone || patient?.phone || "N/A";
//                     const patientUHID = session.patientUHID || patientUser.uhid || patient?.uhid || "N/A";
//                     const patientEmail = patientUser.email || patient?.email || "N/A";

//                     // Get therapists list - check both therapists array and single therapist
//                     const therapists = (session.therapists && session.therapists.length > 0)
//                         ? session.therapists
//                         : (session.therapist ? [session.therapist] : []);

//                     const therapistNames = therapists
//                         .map(t => t?.user?.name || t?.name || session.therapistName)
//                         .filter(Boolean);

//                     // Get allocated nurse
//                     let allocatedNurseName = "N/A";
//                     if (patient.allocatedNurse?.user?.name) {
//                         allocatedNurseName = patient.allocatedNurse.user.name;
//                     } else if (session.inpatient?.allocatedNurse?.user?.name) {
//                         allocatedNurseName = session.inpatient.allocatedNurse.user.name;
//                     }

//                     // Format session date
//                     const sessionDate = session.sessionDate
//                         ? new Date(session.sessionDate).toLocaleDateString("en-US", {
//                             month: "short",
//                             day: "numeric",
//                             year: "numeric",
//                         })
//                         : (session.createdAt
//                             ? new Date(session.createdAt).toLocaleDateString("en-US", {
//                                 month: "short",
//                                 day: "numeric",
//                                 year: "numeric",
//                             })
//                             : "N/A");

//                     // Determine if IPD or OPD - strictly trust backend provided type if available
//                     let isIPD = false;
//                     if (session.type === "IPD") {
//                         isIPD = true;
//                     } else if (session.type === "OPD") {
//                         isIPD = false;
//                     } else {
//                         // Fallback only if type is missing entirely
//                         isIPD = !!session.inpatient || patient?.inpatient === true;
//                     }

//                     const inpatientId = session.inpatient?._id?.toString() || session.inpatient?.toString();

//                     // Check discharge status
//                     let isDischarged = false;
//                     const examinationId = session.examination?._id?.toString() || session.examination?.toString();

//                     if (isIPD) {
//                         // For IPD: check inpatient status
//                         const inpatient = inpatientsMap.get(patient._id?.toString() || patient?.toString());
//                         if (inpatient && inpatient.status === "Discharged") {
//                             isDischarged = true;
//                         }
//                     } else {
//                         // For OPD: check if examination is billed and fully paid
//                         if (examinationId) {
//                             const examination = examinationsMap.get(examinationId);
//                             const invoice = invoicesMap.get(examinationId);

//                             // Only mark as discharged if examination is billed AND invoice is fully paid
//                             if (examination && examination.isBilled && invoice) {
//                                 const isFullyPaid = (invoice.amountPaid || 0) >= (invoice.totalPayable || 0);
//                                 if (isFullyPaid && invoice.totalPayable > 0) {
//                                     isDischarged = true;
//                                 }
//                             }
//                         }
//                     }

//                     return {
//                         _id: session._id,
//                         sessionId: session._id,
//                         patientId: patient._id?.toString() || patient?.toString() || session.patient?.toString(),
//                         patientName: patientName,
//                         uhid: patientUHID,
//                         phone: patientPhone,
//                         email: patientEmail,
//                         isIPD: isIPD,
//                         type: session.type || (isIPD ? "IPD" : "OPD"),
//                         treatmentName: session.treatmentName || "N/A",
//                         subTherapy: session.subTherapy || "",
//                         sessionDate: sessionDate,
//                         sessionTime: session.sessionTime || "N/A",
//                         status: session.status || "Pending",
//                         allocatedNurse: allocatedNurseName,
//                         therapists: therapistNames,
//                         therapistNames: therapistNames.length > 0 ? therapistNames.join(", ") : "N/A",
//                         doctorName: session.doctorName || session.examination?.doctor?.user?.name || "N/A",
//                         daysOfTreatment: session.daysOfTreatment || 0,
//                         timeline: session.timeline || "N/A",
//                         createdAt: session.createdAt || new Date(),
//                         examinationId: examinationId,
//                         inpatientId: inpatientId,
//                         isDischarged: isDischarged,
//                         invoice: examinationId ? invoicesMap.get(examinationId) : null,
//                     };
//                 });

//                 // Apply client-side search filter (before grouping)
//                 let filteredSessions = transformedSessions;
//                 if (search && search.trim()) {
//                     const searchLower = search.toLowerCase();
//                     filteredSessions = transformedSessions.filter(session => {
//                         return (
//                             session.patientName.toLowerCase().includes(searchLower) ||
//                             session.uhid.toLowerCase().includes(searchLower) ||
//                             session.phone.toLowerCase().includes(searchLower) ||
//                             session.email.toLowerCase().includes(searchLower) ||
//                             session.treatmentName.toLowerCase().includes(searchLower) ||
//                             (session.subTherapy && session.subTherapy.toLowerCase().includes(searchLower))
//                         );
//                     });
//                 }

//                 // Also apply search after grouping (for grouped visit fields)
//                 // This ensures search works on aggregated fields like treatmentNames and subTherapies

//                 // Group sessions by visit (patient + visit date)
//                 const visitGroups = new Map();

//                 filteredSessions.forEach((session) => {
//                     // Create a visit key: patientId + visitDate (normalized to date only)
//                     const visitDate = session.sessionDate
//                         ? new Date(session.sessionDate).toISOString().split("T")[0]
//                         : (session.createdAt
//                             ? new Date(session.createdAt).toISOString().split("T")[0]
//                             : new Date().toISOString().split("T")[0]);

//                     // Grouping criteria: 
//                     // 1. Same patient
//                     // 2. Same visit (examination for OPD, inpatient record for IPD)
//                     // 3. Same discharge status (to keep discharged and active rows separate)
//                     let visitKey = `${session.patientId}_`;
//                     if (session.isIPD && session.inpatientId) {
//                         visitKey += `IPD_${session.inpatientId}`;
//                     } else if (session.examinationId) {
//                         visitKey += `OPD_${session.examinationId}`;
//                     } else {
//                         visitKey += `DATE_${visitDate}`;
//                     }

//                     // Add discharge status to key to ensure they are separate
//                     visitKey += `_${session.isDischarged ? 'discharged' : 'active'}`;

//                     if (!visitGroups.has(visitKey)) {
//                         // Create a new visit group
//                         visitGroups.set(visitKey, {
//                             _id: visitKey,
//                             patientId: session.patientId,
//                             patientName: session.patientName,
//                             uhid: session.uhid,
//                             phone: session.phone,
//                             email: session.email,
//                             isIPD: session.isIPD,
//                             type: session.type,
//                             sessionDate: session.sessionDate,
//                             visitDate: visitDate,
//                             allocatedNurse: session.allocatedNurse,
//                             doctorName: session.doctorName,
//                             createdAt: session.createdAt,
//                             examinationId: session.examinationId, // Track examination ID for discharge check
//                             // Aggregated fields
//                             treatments: [], // Array of {name, subTherapy}
//                             therapists: new Set(), // Unique therapists
//                             statuses: new Set(), // All statuses for this visit
//                             status: session.status, // Most recent status
//                             sessionIds: [], // Track session IDs
//                             isDischarged: session.isDischarged || false, // Track discharge status
//                             invoice: session.invoice, // Track invoice for OPD discharge check
//                         });
//                     }

//                     const visit = visitGroups.get(visitKey);

//                     // Update discharge status if this session indicates discharge
//                     if (session.isDischarged) {
//                         visit.isDischarged = true;
//                     }

//                     // Add treatment (avoid duplicates)
//                     const treatmentKey = `${session.treatmentName}_${session.subTherapy || ""}`;
//                     const existingTreatment = visit.treatments.find(
//                         t => t.name === session.treatmentName && t.subTherapy === session.subTherapy
//                     );
//                     if (!existingTreatment) {
//                         visit.treatments.push({
//                             name: session.treatmentName,
//                             subTherapy: session.subTherapy || "",
//                         });
//                     }

//                     // Add therapists (unique)
//                     session.therapists.forEach(therapist => visit.therapists.add(therapist));

//                     // Track statuses
//                     visit.statuses.add(session.status);

//                     // Update to most recent status (if session is newer)
//                     if (new Date(session.createdAt) > new Date(visit.createdAt)) {
//                         visit.status = session.status;
//                         visit.createdAt = session.createdAt;
//                     }

//                     // Track session IDs
//                     if (session.sessionId) {
//                         visit.sessionIds.push(session.sessionId);
//                     }
//                 });

//                 // Convert grouped visits to array and format for display
//                 const groupedVisits = Array.from(visitGroups.values()).map(visit => {
//                     // Get the most relevant status (prioritize: In Progress > Scheduled > Completed > Pending)
//                     const statusPriority = {
//                         "In Progress": 4,
//                         "Scheduled": 3,
//                         "Completed": 2,
//                         "Pending": 1,
//                         "Cancelled": 0,
//                     };

//                     const statusesArray = Array.from(visit.statuses);
//                     const sortedStatuses = statusesArray.sort((a, b) => {
//                         return (statusPriority[b] || 0) - (statusPriority[a] || 0);
//                     });
//                     const displayStatus = sortedStatuses[0] || visit.status;

//                     return {
//                         _id: visit._id,
//                         patientId: visit.patientId,
//                         patientName: visit.patientName,
//                         uhid: visit.uhid,
//                         phone: visit.phone,
//                         email: visit.email,
//                         isIPD: visit.isIPD,
//                         type: visit.type,
//                         sessionDate: visit.sessionDate,
//                         visitDate: visit.visitDate,
//                         allocatedNurse: visit.allocatedNurse,
//                         doctorName: visit.doctorName,
//                         treatments: visit.treatments,
//                         treatmentNames: visit.treatments.map(t => t.name).join(", "),
//                         subTherapies: visit.treatments
//                             .filter(t => t.subTherapy)
//                             .map(t => t.subTherapy)
//                             .filter((v, i, a) => a.indexOf(v) === i) // Unique sub-therapies
//                             .join(", "),
//                         therapists: Array.from(visit.therapists),
//                         therapistNames: Array.from(visit.therapists).join(", ") || "N/A",
//                         status: displayStatus,
//                         isDischarged: visit.isDischarged || false,
//                         createdAt: visit.createdAt,
//                     };
//                 });

//                 // Apply search filter on grouped visits (for aggregated fields)
//                 let finalGroupedVisits = groupedVisits;
//                 if (search && search.trim()) {
//                     const searchLower = search.toLowerCase();
//                     finalGroupedVisits = groupedVisits.filter(visit => {
//                         return (
//                             visit.patientName.toLowerCase().includes(searchLower) ||
//                             visit.uhid.toLowerCase().includes(searchLower) ||
//                             visit.phone.toLowerCase().includes(searchLower) ||
//                             visit.email.toLowerCase().includes(searchLower) ||
//                             visit.treatmentNames.toLowerCase().includes(searchLower) ||
//                             (visit.subTherapies && visit.subTherapies.toLowerCase().includes(searchLower)) ||
//                             visit.therapistNames.toLowerCase().includes(searchLower)
//                         );
//                     });
//                 }

//                 // Sort by creation date (newest first)
//                 finalGroupedVisits.sort((a, b) => {
//                     const dateA = new Date(a.createdAt);
//                     const dateB = new Date(b.createdAt);
//                     return dateB - dateA;
//                 });

//                 // Store all grouped visits for accurate tab counts
//                 setAllSessionsData(finalGroupedVisits);

//                 // Client-side pagination
//                 const startIndex = pagination.page * pagination.rowsPerPage;
//                 const endIndex = startIndex + pagination.rowsPerPage;
//                 const paginatedVisits = finalGroupedVisits.slice(startIndex, endIndex);

//                 setSessions(paginatedVisits);
//                 setPagination(prev => ({
//                     ...prev,
//                     total: finalGroupedVisits.length,
//                 }));
//             } else {
//                 toast.error(sessionsResponse.data.message || "Failed to fetch treatment sessions");
//                 setSessions([]);
//             }
//         } catch (error) {
//             if (error.name === 'AbortError') {
//                 return; // Request was cancelled
//             }

//             // Handle 401 Unauthorized - JWT expired
//             if (error.response?.status === 401) {
//                 const errorMessage = error.response?.data?.message || error.message || "Session expired";
//                 if (errorMessage.toLowerCase().includes("expired") || errorMessage.toLowerCase().includes("jwt")) {
//                     toast.error("Your session has expired. Please log in again.");
//                     // Redirect to login after a short delay
//                     setTimeout(() => {
//                         window.location.href = "/login";
//                     }, 2000);
//                 } else {
//                     toast.error("Unauthorized. Please log in again.");
//                     setTimeout(() => {
//                         window.location.href = "/login";
//                     }, 2000);
//                 }
//                 setSessions([]);
//                 return;
//             }

//             console.error("Error fetching treatment sessions:", error);
//             const errorMessage = error.response?.data?.message || error.message || "Failed to fetch treatment sessions";

//             // Don't show error toast for network errors if it's just a token issue
//             if (!errorMessage.toLowerCase().includes("expired") && !errorMessage.toLowerCase().includes("jwt")) {
//                 toast.error(errorMessage);
//             }

//             setSessions([]);
//         } finally {
//             setIsLoading(false);
//         }
//     }, [pagination.page, pagination.rowsPerPage, activeTab, search]);

//     useEffect(() => {
//         const abortController = new AbortController();
//         fetchSessions(abortController.signal);

//         return () => {
//             abortController.abort();
//         };
//     }, [fetchSessions]);

//     // Reset to first page when search or tab changes
//     useEffect(() => {
//         if (pagination.page !== 0) {
//             setPagination(prev => ({ ...prev, page: 0 }));
//         }
//     }, [search, activeTab]);

//     const getTypeBadge = (isIPD) => {
//         if (isIPD) {
//             return <Chip label="IPD" size="small" color="error" sx={{ fontWeight: 600 }} />;
//         }
//         return <Chip label="OPD" size="small" color="primary" sx={{ fontWeight: 600 }} />;
//     };

//     const getStatusBadge = (status, isDischarged = false) => {
//         // If discharged, show discharged badge first
//         if (isDischarged) {
//             return <span className="badge rounded-pill bg-info" style={{ fontSize: "0.65rem" }}>Discharged</span>;
//         }

//         const statusLower = (status || "").toLowerCase();
//         if (statusLower.includes("completed")) {
//             return <span className="badge rounded-pill bg-success" style={{ fontSize: "0.65rem" }}>Completed</span>;
//         } else if (statusLower.includes("in progress")) {
//             return <span className="badge rounded-pill bg-info" style={{ fontSize: "0.65rem" }}>In Progress</span>;
//         } else if (statusLower.includes("scheduled")) {
//             return <span className="badge rounded-pill bg-primary" style={{ fontSize: "0.65rem" }}>Scheduled</span>;
//         } else if (statusLower.includes("pending")) {
//             return <span className="badge rounded-pill bg-warning" style={{ fontSize: "0.65rem" }}>Pending</span>;
//         } else if (statusLower.includes("cancelled")) {
//             return <span className="badge rounded-pill bg-danger" style={{ fontSize: "0.65rem" }}>Cancelled</span>;
//         }
//         return <span className="badge rounded-pill bg-secondary" style={{ fontSize: "0.65rem" }}>{status}</span>;
//     };

//     const handleViewPatient = (session) => {
//         if (session.patientId) {
//             navigate(`/receptionist/treatments/therapy-details?patientId=${session.patientId}`);
//         }
//     };

//     // Calculate counts for tabs from all filtered sessions (not just current page)
//     const allSessions = useMemo(() => {
//         return allSessionsData.length;
//     }, [allSessionsData]);

//     const opdCount = useMemo(() => {
//         return allSessionsData.filter(s => !s.isIPD).length;
//     }, [allSessionsData]);

//     const ipdCount = useMemo(() => {
//         return allSessionsData.filter(s => s.isIPD).length;
//     }, [allSessionsData]);

//     return (
//         <div>
//             <HeadingCard
//                 title="Treatments"
//                 subtitle="View and manage all treatment sessions (OPD and IPD) - Visit-wise"
//                 breadcrumbItems={[
//                     { label: "Home", url: "/" },
//                     { label: "Receptionist", url: "/receptionist/dashboard" },
//                     { label: "Treatments" },
//                 ]}
//             />

//             <Box
//                 sx={{
//                     mt: 2,
//                 }}
//             >
//                 <div className="card shadow-sm">
//                     <div className="card-body">
//                         {/* Tabs */}
//                         <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
//                             <Tabs
//                                 value={activeTab}
//                                 onChange={(e, newValue) => setActiveTab(newValue)}
//                                 sx={{
//                                     "& .MuiTab-root": {
//                                         textTransform: "none",
//                                         fontSize: "1rem",
//                                         fontWeight: 500,
//                                     },
//                                 }}
//                             >
//                                 <Tab label={`All Visits (${allSessions})`} value="all" />
//                                 <Tab label={`OPD (${opdCount})`} value="opd" />
//                                 <Tab label={`IPD (${ipdCount})`} value="ipd" />
//                             </Tabs>
//                         </Box>

//                         {/* Search */}
//                         <div className="row g-3 mb-4">
//                             <div className="col-md-12">
//                                 <div className="input-group">
//                                     <span className="input-group-text">
//                                         <SearchIcon />
//                                     </span>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         placeholder="Search by patient name, UHID, phone, email, treatment, or sub-therapy..."
//                                         value={search}
//                                         onChange={(e) => setSearch(e.target.value)}
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Table */}
//                         {isLoading ? (
//                             <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
//                                 <CircularProgress />
//                             </Box>
//                         ) : sessions.length === 0 ? (
//                             <Box sx={{ textAlign: "center", padding: "40px", color: "#666" }}>
//                                 No treatment sessions found. {search ? "Try adjusting your search." : ""}
//                             </Box>
//                         ) : (
//                             <div className="table-responsive">
//                                 <table className="table table-hover" style={{ fontSize: "0.875rem" }}>
//                                     <thead>
//                                         <tr>
//                                             <th style={{ fontSize: "0.875rem" }}>Sl. No.</th>
//                                             <th style={{ fontSize: "0.875rem" }}>Patient Name</th>
//                                             <th style={{ fontSize: "0.875rem" }}>UHID</th>
//                                             <th style={{ fontSize: "0.875rem" }}>Phone</th>
//                                             <th style={{ fontSize: "0.875rem" }}>Treatment</th>
//                                             <th style={{ fontSize: "0.875rem" }}>Visit Date</th>
//                                             <th style={{ fontSize: "0.875rem" }}>Type</th>
//                                             <th style={{ fontSize: "0.875rem" }}>Status</th>
//                                             <th style={{ fontSize: "0.875rem" }}>Allocated Nurse</th>
//                                             <th style={{ fontSize: "0.875rem" }}>Therapist</th>
//                                             <th style={{ fontSize: "0.875rem" }}>Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {sessions.map((session, index) => (
//                                             <tr key={session._id}>
//                                                 <td style={{ fontSize: "0.875rem" }}>{pagination.page * pagination.rowsPerPage + index + 1}</td>
//                                                 <td style={{ fontSize: "0.875rem" }}>
//                                                     <div className="d-flex align-items-center gap-2">
//                                                         <PersonIcon fontSize="small" color="primary" />
//                                                         <strong>{session.patientName}</strong>
//                                                     </div>
//                                                 </td>
//                                                 <td style={{ fontSize: "0.875rem" }}>{session.uhid}</td>
//                                                 <td style={{ fontSize: "0.875rem" }}>{session.phone}</td>
//                                                 <td style={{ fontSize: "0.875rem" }}>
//                                                     <div>
//                                                         <div style={{ fontWeight: 500 }}>{session.treatmentNames}</div>
//                                                         {session.subTherapies && (
//                                                             <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: "2px" }}>
//                                                                 Sub-Therapy: {session.subTherapies}
//                                                             </div>
//                                                         )}
//                                                         {session.treatments.length > 1 && (
//                                                             <div style={{ fontSize: "0.7rem", color: "#6c757d", marginTop: "4px", fontStyle: "italic" }}>
//                                                                 ({session.treatments.length} therapies)
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 </td>
//                                                 <td style={{ fontSize: "0.875rem" }}>
//                                                     <div className="d-flex align-items-center gap-1">
//                                                         <CalendarTodayIcon fontSize="small" color="action" />
//                                                         {session.sessionDate}
//                                                     </div>
//                                                 </td>
//                                                 <td style={{ fontSize: "0.875rem" }}>{getTypeBadge(session.isIPD)}</td>
//                                                 <td style={{ fontSize: "0.875rem" }}>{getStatusBadge(session.status, session.isDischarged)}</td>
//                                                 <td style={{ fontSize: "0.875rem" }}>{session.allocatedNurse}</td>
//                                                 <td style={{ fontSize: "0.875rem" }}>
//                                                     {session.therapistNames !== "N/A" ? (
//                                                         <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
//                                                             {session.therapists.map((therapist, idx) => (
//                                                                 <Chip
//                                                                     key={idx}
//                                                                     label={therapist}
//                                                                     size="small"
//                                                                     sx={{
//                                                                         fontSize: "0.75rem",
//                                                                         height: "24px",
//                                                                         backgroundColor: "#E3F2FD",
//                                                                         color: "#1976D2",
//                                                                         fontWeight: 500,
//                                                                     }}
//                                                                 />
//                                                             ))}
//                                                         </div>
//                                                     ) : (
//                                                         "N/A"
//                                                     )}
//                                                 </td>
//                                                 <td style={{ fontSize: "0.875rem" }}>
//                                                     <div style={{ position: "relative", display: "inline-block" }}>
//                                                         <button
//                                                             type="button"
//                                                             className="btn btn-sm"
//                                                             onClick={() => handleViewPatient(session)}
//                                                             style={{
//                                                                 backgroundColor: "#D4A574",
//                                                                 borderColor: "#D4A574",
//                                                                 color: "#000",
//                                                                 borderRadius: "8px",
//                                                                 padding: "6px 8px",
//                                                                 fontWeight: 500,
//                                                                 boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                                                                 transition: "all 0.3s ease",
//                                                                 minWidth: "40px",
//                                                                 display: "flex",
//                                                                 alignItems: "center",
//                                                                 justifyContent: "center",
//                                                             }}
//                                                             onMouseEnter={(e) => {
//                                                                 e.currentTarget.style.backgroundColor = "#C8965A";
//                                                                 e.currentTarget.style.transform = "translateY(-2px)";
//                                                                 e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
//                                                                 setHoveredButton(`view-${session._id}`);
//                                                             }}
//                                                             onMouseLeave={(e) => {
//                                                                 e.currentTarget.style.backgroundColor = "#D4A574";
//                                                                 e.currentTarget.style.transform = "translateY(0)";
//                                                                 e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
//                                                                 setHoveredButton(null);
//                                                             }}
//                                                         >
//                                                             <VisibilityIcon fontSize="small" />
//                                                         </button>
//                                                         {hoveredButton === `view-${session._id}` && (
//                                                             <span
//                                                                 style={{
//                                                                     position: "absolute",
//                                                                     bottom: "100%",
//                                                                     left: "50%",
//                                                                     transform: "translateX(-50%)",
//                                                                     marginBottom: "5px",
//                                                                     padding: "4px 8px",
//                                                                     backgroundColor: "#333",
//                                                                     color: "#fff",
//                                                                     fontSize: "0.75rem",
//                                                                     borderRadius: "4px",
//                                                                     whiteSpace: "nowrap",
//                                                                     zIndex: 1000,
//                                                                     pointerEvents: "none",
//                                                                 }}
//                                                             >
//                                                                 View Therapy Details
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         )}

//                         {/* Pagination */}
//                         {!isLoading && sessions.length > 0 && (
//                             <TablePagination
//                                 component="div"
//                                 count={pagination.total}
//                                 page={pagination.page}
//                                 rowsPerPage={pagination.rowsPerPage}
//                                 onPageChange={(_, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
//                                 onRowsPerPageChange={(e) => {
//                                     setPagination(prev => ({
//                                         ...prev,
//                                         rowsPerPage: parseInt(e.target.value, 10),
//                                         page: 0
//                                     }));
//                                 }}
//                                 rowsPerPageOptions={[10, 25, 50, 100]}
//                                 labelRowsPerPage="Rows per page:"
//                             />
//                         )}
//                     </div>
//                 </div>
//             </Box>
//         </div>
//     );
// }

// export default Treatments_View;


import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  TablePagination,
} from "@mui/material";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import { toast } from "react-toastify";

// Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

function Treatments_View() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "opd" | "ipd"
  const [sessions, setSessions] = useState([]); // paginated & filtered view
  const [allVisits, setAllVisits] = useState([]); // all grouped visits (for counts & pagination)
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [hoveredButton, setHoveredButton] = useState(null);

  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 25,
    total: 0,
  });

  // ────────────────────────────────────────────────
  // Fetch & transform data
  // ────────────────────────────────────────────────
  const fetchSessions = useCallback(async (signal = null) => {
    setIsLoading(true);

    try {
      const params = {};

      if (activeTab === "opd") params.type = "OPD";
      if (activeTab === "ipd") params.type = "IPD";

      const res = await axios.get(getApiUrl("therapist-sessions/treatment-list"), {
        headers: getAuthHeaders(),
        params,
        signal,
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load sessions");
      }

      const rawSessions = res.data.data || [];

      // ── Transform raw sessions ────────────────────────────────
      const transformed = rawSessions.map((s) => {
        const patient = s.patient || {};
        const patientUser = patient.user || {};

        const isIPD = s.type === "IPD" || !!s.inpatient;

        return {
          _id: s._id,
          patientId: patient._id || patientUser?._id || "unknown",
          patientName: s.patientName || patientUser.name || patient.name || "Unknown",
          uhid: s.patientUHID || patient.uhid || patientUser.uhid || "N/A",
          phone: s.patientPhone || patientUser.phone || patient.phone || "N/A",
          email: patientUser.email || patient.email || "N/A",

          type: s.type || (isIPD ? "IPD" : "OPD"),
          isIPD,

          treatmentName: s.treatmentName || "N/A",
          subTherapy: s.subTherapy || "",

          sessionDate:
            s.sessionDate || s.createdAt
              ? new Date(s.sessionDate || s.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A",

          therapists: (s.therapists || (s.therapist ? [s.therapist] : [])).map(
            (t) => t?.user?.name || t?.name || "Unknown"
          ),

          doctorName: s.doctorName || s.examination?.doctor?.user?.name || "N/A",
          allocatedNurse:
            patient.allocatedNurse?.user?.name ||
            s.inpatient?.allocatedNurse?.user?.name ||
            "N/A",

          status: s.status || "Pending",
          createdAt: s.createdAt || new Date().toISOString(),

          // For discharge — prefer backend flag if available
          isDischarged: s.isDischarged || false, // ← ideal: backend should send this
          examinationId: s.examination?._id,
          inpatientId: s.inpatient?._id,
        };
      });

      // ── Group by visit ───────────────────────────────────────
      const visitMap = new Map();

      transformed.forEach((session) => {
        // Better grouping key: patient + visit identifier + discharge state
        let visitKey = session.patientId;

        if (session.isIPD && session.inpatientId) {
          visitKey += `_IPD_${session.inpatientId}`;
        } else if (session.examinationId) {
          visitKey += `_OPD_${session.examinationId}`;
        } else {
          const dateStr = new Date(session.createdAt).toISOString().split("T")[0];
          visitKey += `_DATE_${dateStr}`;
        }

        visitKey += session.isDischarged ? "_DISCHARGED" : "_ACTIVE";

        if (!visitMap.has(visitKey)) {
          visitMap.set(visitKey, {
            _id: visitKey,
            patientId: session.patientId,
            patientName: session.patientName,
            uhid: session.uhid,
            phone: session.phone,
            email: session.email,
            isIPD: session.isIPD,
            type: session.type,
            sessionDate: session.sessionDate,
            allocatedNurse: session.allocatedNurse,
            doctorName: session.doctorName,
            createdAt: session.createdAt,
            isDischarged: session.isDischarged,
            treatments: [],
            therapists: new Set(),
            statuses: new Set(),
            highestStatus: session.status,
          });
        }

        const visit = visitMap.get(visitKey);

        // Aggregate treatments (avoid duplicates)
        const treatmentKey = `${session.treatmentName}||${session.subTherapy}`;
        if (!visit.treatments.some((t) => `${t.name}||${t.subTherapy}` === treatmentKey)) {
          visit.treatments.push({
            name: session.treatmentName,
            subTherapy: session.subTherapy,
          });
        }

        // Therapists
        session.therapists.forEach((t) => visit.therapists.add(t));

        // Statuses
        visit.statuses.add(session.status);
        // Keep "highest" status
        const priority = {
          "In Progress": 4,
          Scheduled: 3,
          Completed: 2,
          Pending: 1,
          Cancelled: 0,
        };
        if (priority[session.status] > priority[visit.highestStatus] || !visit.highestStatus) {
          visit.highestStatus = session.status;
        }
      });

      // Convert to array + format display fields
      const groupedVisits = Array.from(visitMap.values()).map((v) => ({
        ...v,
        treatmentNames: v.treatments.map((t) => t.name).join(", "),
        subTherapies: [...new Set(v.treatments.map((t) => t.subTherapy).filter(Boolean))].join(", "),
        therapistNames: [...v.therapists].join(", ") || "N/A",
        status: v.highestStatus,
      }));

      const getVisitDisplayStatus = (visit) => {
        if (visit.isDischarged) return "Discharged";
        return visit.status || "Pending";
      };

      // Final client-side search & status filter
      let filtered = groupedVisits;
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.patientName.toLowerCase().includes(q) ||
            v.uhid.toLowerCase().includes(q) ||
            v.phone.toLowerCase().includes(q) ||
            v.treatmentNames.toLowerCase().includes(q) ||
            v.subTherapies.toLowerCase().includes(q) ||
            v.therapistNames.toLowerCase().includes(q)
        );
      }

      if (statusFilter !== "All") {
        filtered = filtered.filter((v) => getVisitDisplayStatus(v) === statusFilter);
      }

      // Sort oldest first (ascending by visit date)
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setAllVisits(filtered);
      setPagination((prev) => ({ ...prev, total: filtered.length }));

      // Paginate
      const start = pagination.page * pagination.rowsPerPage;
      setSessions(filtered.slice(start, start + pagination.rowsPerPage));
    } catch (err) {
      if (err.name === "AbortError") return;

      if (err.response?.status === 401) {
        toast.error("Session expired. Redirecting to login...");
        setTimeout(() => (window.location.href = "/login"), 1800);
      } else {
        toast.error(err.message || "Failed to load treatments");
      }
      setAllVisits([]);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, search, statusFilter, pagination.page, pagination.rowsPerPage]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchSessions(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchSessions]);

  // Reset page when filters change
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 0 }));
  }, [search, activeTab, statusFilter]);

  // ── Helpers ────────────────────────────────────────────────
  const getTypeBadge = (isIPD) =>
    isIPD ? (
      <Chip label="IPD" size="small" color="error" sx={{ fontWeight: 600 }} />
    ) : (
      <Chip label="OPD" size="small" color="primary" sx={{ fontWeight: 600 }} />
    );

  const getStatusBadge = (status, isDischarged) => {
    if (isDischarged) {
      return <span className="badge rounded-pill bg-info">Discharged</span>;
    }

    const s = (status || "").toLowerCase();
    if (s.includes("completed")) return <span className="badge bg-success">Completed</span>;
    if (s.includes("in progress")) return <span className="badge bg-info">In Progress</span>;
    if (s.includes("scheduled")) return <span className="badge bg-primary">Scheduled</span>;
    if (s.includes("pending")) return <span className="badge bg-warning">Pending</span>;
    if (s.includes("cancelled")) return <span className="badge bg-danger">Cancelled</span>;
    return <span className="badge bg-secondary">{status || "Unknown"}</span>;
  };

  const handleViewPatient = (visit) => {
    if (visit.patientId && visit.patientId !== "unknown") {
      navigate(`/receptionist/treatments/therapy-details?patientId=${visit.patientId}`);
    } else {
      toast.warn("Cannot view details — missing patient ID");
    }
  };

  // Counts for tabs
  const allCount = allVisits.length;
  const opdCount = allVisits.filter((v) => !v.isIPD).length;
  const ipdCount = allVisits.filter((v) => v.isIPD).length;

  return (
    <div>
      <HeadingCard
        title="Treatments"
        subtitle="View and manage all treatment sessions (OPD & IPD) — grouped by visit"
        breadcrumbItems={[
          { label: "Home", url: "/" },
          { label: "Receptionist", url: "/receptionist/dashboard" },
          { label: "Treatments" },
        ]}
      />

      <Box sx={{ mt: 3 }}>
        <div className="card shadow-sm">
          <div className="card-body">
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                sx={{
                  "& .MuiTab-root": { textTransform: "none", fontSize: "1rem", fontWeight: 500 },
                }}
              >
                <Tab label={`All Visits (${allCount})`} value="all" />
                <Tab label={`OPD (${opdCount})`} value="opd" />
                <Tab label={`IPD (${ipdCount})`} value="ipd" />
              </Tabs>
            </Box>

            {/* Search & Status filter */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6 col-lg-4">
                <div className="input-group">
                  <span className="input-group-text">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search patient, UHID, phone, treatment..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Discharged">Discharged</option>
                </select>
              </div>
            </div>

            {/* Table / Loading / Empty */}
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", minHeight: 400 }}>
                <CircularProgress />
              </Box>
            ) : allVisits.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
                No treatment visits found
                {(search || statusFilter !== "All") && " matching your filters"}.
              </Box>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle" style={{ fontSize: "0.875rem" }}>
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Patient</th>
                        <th>UHID</th>
                        <th>Phone</th>
                        <th>Treatment(s)</th>
                        <th>Visit Date</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Nurse</th>
                        <th>Therapist(s)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((visit, idx) => (
                        <tr key={visit._id}>
                          <td>{pagination.page * pagination.rowsPerPage + idx + 1}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <PersonIcon fontSize="small" color="primary" />
                              <strong>{visit.patientName}</strong>
                            </div>
                          </td>
                          <td>{visit.uhid}</td>
                          <td>{visit.phone}</td>
                          <td>
                            <div>
                              <div style={{ fontWeight: 500 }}>{visit.treatmentNames}</div>
                              {visit.subTherapies && (
                                <small className="text-muted d-block mt-1">
                                  Sub: {visit.subTherapies}
                                </small>
                              )}
                              {visit.treatments.length > 1 && (
                                <small className="text-muted fst-italic d-block mt-1">
                                  ({visit.treatments.length} therapies)
                                </small>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <CalendarTodayIcon fontSize="small" color="action" />
                              {visit.sessionDate}
                            </div>
                          </td>
                          <td>{getTypeBadge(visit.isIPD)}</td>
                          <td>{getStatusBadge(visit.status, visit.isDischarged)}</td>
                          <td>{visit.allocatedNurse}</td>
                          <td>
                            {visit.therapistNames !== "N/A" ? (
                              <div className="d-flex flex-wrap gap-1">
                                {visit.therapistNames.split(", ").map((name, i) => (
                                  <Chip
                                    key={i}
                                    label={name}
                                    size="small"
                                    sx={{
                                      bgcolor: "#e3f2fd",
                                      color: "#1976d2",
                                      fontSize: "0.75rem",
                                    }}
                                  />
                                ))}
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm"
                              style={{
                                backgroundColor: "#D4A574",
                                color: "#000",
                                borderRadius: 8,
                                padding: "6px 10px",
                              }}
                              onClick={() => handleViewPatient(visit)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#C8965A";
                                setHoveredButton(visit._id);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#D4A574";
                                setHoveredButton(null);
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                              {hoveredButton === visit._id && (
                                <span
                                  style={{
                                    position: "absolute",
                                    bottom: "100%",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    marginBottom: 6,
                                    background: "#333",
                                    color: "#fff",
                                    padding: "4px 10px",
                                    borderRadius: 4,
                                    fontSize: "0.75rem",
                                    whiteSpace: "nowrap",
                                    zIndex: 10,
                                  }}
                                >
                                  View Therapy Details
                                </span>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <TablePagination
                  component="div"
                  count={pagination.total}
                  page={pagination.page}
                  rowsPerPage={pagination.rowsPerPage}
                  onPageChange={(_, page) => setPagination((p) => ({ ...p, page }))}
                  onRowsPerPageChange={(e) =>
                    setPagination((p) => ({
                      ...p,
                      rowsPerPage: parseInt(e.target.value, 10),
                      page: 0,
                    }))
                  }
                  rowsPerPageOptions={[10, 25, 50, 100]}
                />
              </>
            )}
          </div>
        </div>
      </Box>
    </div>
  );
}

export default Treatments_View;