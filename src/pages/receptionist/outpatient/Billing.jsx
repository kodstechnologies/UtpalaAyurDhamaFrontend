// import { useState, useMemo, useEffect } from "react";
// import {
//   useParams,
//   Link,
//   useNavigate,
//   useSearchParams,
// } from "react-router-dom";
// import {
//   Box,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   CircularProgress,
//   Typography,
//   Divider,
//   TextField,
//   Checkbox,
//   FormControlLabel,
// } from "@mui/material";
// import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
// import HeadingCardingCard from "../../../components/card/HeadingCard";
// import DashboardCard from "../../../components/card/DashboardCard";
// import { toast } from "react-toastify";
// import inpatientService from "../../../services/inpatientService";
// import doctorService from "../../../services/doctorService";
// import therapistService from "../../../services/therapistService";
// import axios from "axios";
// import { getApiUrl, getAuthHeaders } from "../../../config/api";
// import ConfirmationModal from "../../../components/modal/ConfirmationModal";

// // Icons
// import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
// import SpaIcon from "@mui/icons-material/Spa";
// import MedicationIcon from "@mui/icons-material/Medication";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import EditIcon from "@mui/icons-material/Edit";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import CloseIcon from "@mui/icons-material/Close";

// const ChargesPanel = ({
//   title,
//   charges,
//   category,
//   onEdit,
//   isEditable = true,
//   useHeaderAction = false,
// }) => {
//   // Group therapy charges by examination (or treatmentPlan if no examination)
//   const groupedCharges = useMemo(() => {
//     if (!charges || !Array.isArray(charges)) {
//       return [];
//     }
//     if (category !== "therapy") {
//       return charges; // No grouping needed for other categories
//     }

//     const groups = new Map();

//     charges.forEach((charge) => {
//       // Create a unique key: examinationId (or treatmentPlanId, or date+therapist if neither exists)
//       const examinationId = charge.examinationId || charge.examination || "";
//       const treatmentPlanId =
//         charge.treatmentPlanId || charge.treatmentPlan || "";
//       const date = charge.date
//         ? new Date(charge.date).toISOString().split("T")[0]
//         : "";
//       const therapistName = charge.therapistName || "";

//       // Group by examination first, then treatmentPlan, then by date+therapist
//       const groupKey =
//         examinationId || treatmentPlanId || `${date}-${therapistName}`;

//       if (!groups.has(groupKey)) {
//         groups.set(groupKey, {
//           ...charge, // Use first charge's common fields
//           therapies: [],
//           totalTherapyCharge: 0,
//           totalTherapistCharge: 0,
//           totalAmount: 0,
//         });
//       }

//       const group = groups.get(groupKey);
//       group.therapies.push({
//         therapyName: charge.therapyName || charge.description || "",
//         subTherapy: charge.subTherapy || "",
//         therapyCharge: Number(charge.therapyCharge || 0),
//         therapistCharge: Number(charge.therapistCharge || 0),
//         amount: Number(charge.amount || 0),
//         status: charge.status,
//         sessionId: charge.sessionId || charge.id,
//       });

//       group.totalTherapyCharge += Number(charge.therapyCharge || 0);
//       group.totalTherapistCharge += Number(charge.therapistCharge || 0);
//       group.totalAmount += Number(charge.amount || 0);
//     });

//     return Array.from(groups.values());
//   }, [charges, category]);

//   // Safety check for charges array
//   if (!charges || !Array.isArray(charges)) {
//     return (
//       <div className="card shadow-sm mb-4">
//         <div className="card-header">
//           <h5 className="card-title mb-0">{title}</h5>
//         </div>
//         <div className="card-body">
//           <p className="text-muted">No charges available</p>
//         </div>
//       </div>
//     );
//   }

//   const totalAmount = groupedCharges.reduce((sum, ch) => {
//     if (category === "therapy" && ch.totalAmount) {
//       return sum + ch.totalAmount;
//     }
//     return sum + Number(ch.amount || 0);
//   }, 0);

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-IN", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(amount);
//   };

//   const getStatusBadgeClass = (status) => {
//     if (!status) return null;
//     const normalized = status.toLowerCase();
//     if (normalized === "completed" || normalized === "dispensed") {
//       return "badge bg-success";
//     } else if (normalized === "in progress" || normalized === "ongoing") {
//       return "badge bg-warning";
//     } else if (normalized === "pending") {
//       return "badge bg-info";
//     }
//     return "badge bg-secondary";
//   };

//   const columnCount =
//     category === "therapy"
//       ? 5
//       : category === "pharmacy"
//         ? 9
//         : category === "consultation"
//           ? 4
//           : 3;

//   return (
//     <div className="card shadow-sm mb-4">
//       <div
//         className="card-header d-flex justify-content-between align-items-center"
//         style={{ padding: "12px 20px" }}
//       >
//         <h5
//           className="card-title mb-0"
//           style={{ fontWeight: 700, fontSize: "1.1rem" }}
//         >
//           {title}
//         </h5>
//         <div className="d-flex align-items-center gap-2">
//           {useHeaderAction && isEditable && onEdit && charges.length > 0 && (
//             <button
//               type="button"
//               className="btn btn-sm"
//               onClick={() => onEdit(charges[0])}
//               style={{
//                 backgroundColor: "#D4A574",
//                 borderColor: "#D4A574",
//                 color: "#000",
//                 borderRadius: "8px",
//                 padding: "6px 14px",
//                 fontWeight: 600,
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "6px",
//                 boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//               }}
//             >
//               <EditIcon sx={{ fontSize: "1.1rem" }} />
//               <span>Edit</span>
//             </button>
//           )}
//         </div>
//       </div>
//       <div className="card-body">
//         <div className="table-responsive">
//           <table className="table table-hover">
//             <thead>
//               <tr>
//                 <th style={{ fontSize: "0.875rem" }}>Date</th>
//                 {category === "therapy" ? (
//                   <>
//                     <th style={{ fontSize: "0.875rem" }}>Therapy</th>
//                     <th style={{ fontSize: "0.875rem" }}>Therapist</th>
//                     <th style={{ fontSize: "0.875rem", textAlign: "center" }}>
//                       Status
//                     </th>
//                     <th style={{ fontSize: "0.875rem", textAlign: "right" }}>
//                       Therapy Charge
//                     </th>
//                     <th style={{ fontSize: "0.875rem", textAlign: "right" }}>
//                       Therapist Charge
//                     </th>
//                   </>
//                 ) : category === "pharmacy" ? (
//                   <>
//                     <th style={{ fontSize: "0.875rem" }}>Medicine Name</th>
//                     <th style={{ fontSize: "0.875rem" }}>Dosage</th>
//                     <th style={{ fontSize: "0.875rem" }}>Frequency</th>
//                     <th style={{ fontSize: "0.875rem" }}>Duration</th>
//                     <th style={{ fontSize: "0.875rem" }}>Food Timing</th>
//                     <th style={{ fontSize: "0.875rem", textAlign: "center" }}>
//                       Dispensed Qty
//                     </th>
//                     <th style={{ fontSize: "0.875rem", textAlign: "right" }}>
//                       Unit Price
//                     </th>
//                   </>
//                 ) : (
//                   <th style={{ fontSize: "0.875rem" }}>Description</th>
//                 )}
//                 {category === "consultation" && (
//                   <th style={{ fontSize: "0.875rem" }}>Doctor</th>
//                 )}
//                 <th style={{ fontSize: "0.875rem", textAlign: "right" }}>
//                   Amount
//                 </th>
//                 {!useHeaderAction && isEditable && onEdit && (
//                   <th style={{ fontSize: "0.875rem", textAlign: "center" }}>
//                     Actions
//                   </th>
//                 )}
//               </tr>
//             </thead>
//             <tbody>
//               {groupedCharges.map((charge, idx) => {
//                 // Calculate the correct amount for grouped charges
//                 const displayAmount =
//                   category === "therapy" && charge.totalAmount
//                     ? charge.totalAmount
//                     : charge.amount || 0;

//                 return (
//                   <tr key={charge.id || `group-${idx}`}>
//                     <td style={{ fontSize: "0.875rem" }}>
//                       {formatDate(
//                         charge.date || charge.dispensedAt || charge.createdAt,
//                       )}
//                     </td>
//                     {category === "therapy" ? (
//                       <>
//                         <td style={{ fontSize: "0.875rem" }}>
//                           {charge.therapies && charge.therapies.length > 0 ? (
//                             <div>
//                               {(() => {
//                                 // Check if all therapies have the same sub-therapy
//                                 const uniqueSubTherapies = [
//                                   ...new Set(
//                                     charge.therapies.map(
//                                       (t) => t.subTherapy || "",
//                                     ),
//                                   ),
//                                 ];
//                                 const hasCommonSubTherapy =
//                                   uniqueSubTherapies.length === 1 &&
//                                   uniqueSubTherapies[0] !== "";

//                                 if (hasCommonSubTherapy) {
//                                   // Show main therapies side by side, sub-therapy once below
//                                   return (
//                                     <div>
//                                       <div
//                                         style={{
//                                           display: "flex",
//                                           flexWrap: "wrap",
//                                           gap: "8px",
//                                           alignItems: "center",
//                                         }}
//                                       >
//                                         {charge.therapies.map(
//                                           (therapy, tIdx) => (
//                                             <span
//                                               key={tIdx}
//                                               style={{ fontWeight: 500 }}
//                                             >
//                                               {therapy.therapyName}
//                                               {tIdx <
//                                                 charge.therapies.length - 1 && (
//                                                   <span
//                                                     style={{
//                                                       margin: "0 4px",
//                                                       color: "#6c757d",
//                                                     }}
//                                                   >
//                                                     •
//                                                   </span>
//                                                 )}
//                                             </span>
//                                           ),
//                                         )}
//                                       </div>
//                                       <div
//                                         style={{
//                                           fontSize: "0.75rem",
//                                           color: "#6c757d",
//                                           marginTop: "4px",
//                                         }}
//                                       >
//                                         Sub-Therapy: {uniqueSubTherapies[0]}
//                                       </div>
//                                     </div>
//                                   );
//                                 } else {
//                                   // Show each therapy with its own sub-therapy
//                                   return (
//                                     <div>
//                                       {charge.therapies.map((therapy, tIdx) => (
//                                         <div
//                                           key={tIdx}
//                                           style={{
//                                             marginBottom:
//                                               tIdx < charge.therapies.length - 1
//                                                 ? "6px"
//                                                 : "0",
//                                           }}
//                                         >
//                                           <div style={{ fontWeight: 500 }}>
//                                             {therapy.therapyName}
//                                           </div>
//                                           {therapy.subTherapy && (
//                                             <div
//                                               style={{
//                                                 fontSize: "0.75rem",
//                                                 color: "#6c757d",
//                                                 marginTop: "2px",
//                                               }}
//                                             >
//                                               Sub-Therapy: {therapy.subTherapy}
//                                             </div>
//                                           )}
//                                         </div>
//                                       ))}
//                                     </div>
//                                   );
//                                 }
//                               })()}
//                             </div>
//                           ) : (
//                             charge.therapyName || charge.description || "N/A"
//                           )}
//                         </td>
//                         <td style={{ fontSize: "0.875rem" }}>
//                           {charge.therapistName || "—"}
//                         </td>
//                         <td
//                           style={{ fontSize: "0.875rem", textAlign: "center" }}
//                         >
//                           {charge.status ? (
//                             <span
//                               className={getStatusBadgeClass(charge.status)}
//                               style={{
//                                 fontSize: "0.75rem",
//                                 padding: "4px 10px",
//                                 borderRadius: "50px",
//                               }}
//                             >
//                               {charge.status}
//                             </span>
//                           ) : (
//                             <span style={{ color: "#888" }}>—</span>
//                           )}
//                         </td>
//                         <td
//                           style={{
//                             fontSize: "0.875rem",
//                             textAlign: "right",
//                             fontWeight: 500,
//                           }}
//                         >
//                           {formatCurrency(
//                             charge.totalTherapyCharge ??
//                             charge.therapyCharge ??
//                             0,
//                           )}
//                         </td>
//                         <td
//                           style={{
//                             fontSize: "0.875rem",
//                             textAlign: "right",
//                             fontWeight: 500,
//                           }}
//                         >
//                           {formatCurrency(
//                             charge.totalTherapistCharge ??
//                             charge.therapistCharge ??
//                             0,
//                           )}
//                         </td>
//                       </>
//                     ) : category === "pharmacy" ? (
//                       <>
//                         <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
//                           {charge.medication || "N/A"}
//                           {charge.remarks && (
//                             <div
//                               style={{
//                                 fontSize: "0.75rem",
//                                 color: "#666",
//                                 marginTop: "4px",
//                                 fontStyle: "italic",
//                               }}
//                             >
//                               <strong>Remarks:</strong> {charge.remarks}
//                             </div>
//                           )}
//                         </td>
//                         <td style={{ fontSize: "0.875rem" }}>
//                           {charge.dosage || "N/A"}
//                         </td>
//                         <td style={{ fontSize: "0.875rem" }}>
//                           {charge.frequency || "N/A"}
//                         </td>
//                         <td style={{ fontSize: "0.875rem" }}>
//                           {charge.duration || "N/A"}
//                         </td>
//                         <td style={{ fontSize: "0.875rem" }}>
//                           {charge.foodTiming ? (
//                             <span
//                               className={`badge ${charge.foodTiming === "Before Food" ? "bg-warning" : "bg-info"}`}
//                               style={{ fontSize: "0.7rem" }}
//                             >
//                               {charge.foodTiming}
//                             </span>
//                           ) : (
//                             "N/A"
//                           )}
//                         </td>
//                         <td
//                           style={{ fontSize: "0.875rem", textAlign: "center" }}
//                         >
//                           {charge.dispensedQuantity !== undefined
//                             ? charge.dispensedQuantity
//                             : charge.quantity || 0}
//                         </td>
//                         <td
//                           style={{ fontSize: "0.875rem", textAlign: "right" }}
//                         >
//                           {formatCurrency(charge.unitPrice || 0)}
//                         </td>
//                       </>
//                     ) : (
//                       <td style={{ fontSize: "0.875rem" }}>
//                         {charge.description || charge.medication}
//                       </td>
//                     )}
//                     {category === "consultation" && (
//                       <td style={{ fontSize: "0.875rem" }}>
//                         {charge.doctorName || "—"}
//                       </td>
//                     )}
//                     <td
//                       style={{
//                         fontSize: "0.875rem",
//                         textAlign: "right",
//                         fontWeight: 600,
//                       }}
//                     >
//                       {formatCurrency(displayAmount)}
//                     </td>
//                     {!useHeaderAction && isEditable && onEdit && (
//                       <td style={{ fontSize: "0.875rem", textAlign: "center" }}>
//                         <button
//                           type="button"
//                           className="btn btn-sm"
//                           onClick={() => onEdit(charge)}
//                           style={{
//                             backgroundColor: "#D4A574",
//                             color: "#000",
//                             borderRadius: "8px",
//                             padding: "4px 8px",
//                             fontWeight: 500,
//                             boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                           }}
//                         >
//                           <EditIcon fontSize="small" />
//                         </button>
//                       </td>
//                     )}
//                   </tr>
//                 );
//               })}
//               {charges.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={columnCount + (isEditable && onEdit ? 1 : 0)}
//                     className="text-center text-muted py-4"
//                   >
//                     No charges added yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// function OutpatientBilling() {
//   console.log("OutpatientBilling component rendering...");
//   const { patientId } = useParams();
//   console.log("Patient ID from params:", patientId);
//   const [searchParams] = useSearchParams();
//   const examinationId = searchParams.get("examinationId");
//   console.log("Examination ID from query:", examinationId);
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [billingData, setBillingData] = useState(null);
//   const [error, setError] = useState(null);
//   const [discountRate, setDiscountRate] = useState(0);
//   const [discountType, setDiscountType] = useState("percentage");
//   const [taxRate, setTaxRate] = useState(5);
//   const [isFinalizing, setIsFinalizing] = useState(false);

//   // Edit dialogs state
//   const [editDoctorDialog, setEditDoctorDialog] = useState({
//     open: false,
//     charge: null,
//   });
//   const [editTherapistDialog, setEditTherapistDialog] = useState({
//     open: false,
//     charge: null,
//   });
//   const [doctors, setDoctors] = useState([]);
//   const [therapists, setTherapists] = useState([]);
//   const [selectedDoctor, setSelectedDoctor] = useState("");
//   const [selectedTherapist, setSelectedTherapist] = useState("");
//   const [therapyCost, setTherapyCost] = useState("");
//   const [therapistCharge, setTherapistCharge] = useState("");
//   const [therapyEditRows, setTherapyEditRows] = useState([]); // For grouped therapies: [{ therapyName, sessionId, therapyCharge, therapistCharge }]
//   const [replaceTherapists, setReplaceTherapists] = useState(false); // Flag to replace all therapists
//   const [consultationAmount, setConsultationAmount] = useState("");
//   const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
//   const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

//   // Edit Pharmacy Dialog State
//   const [editPharmacyDialog, setEditPharmacyDialog] = useState({
//     open: false,
//     charge: null,
//   });
//   const [pharmacyUnitPrice, setPharmacyUnitPrice] = useState("");
//   const [isUpdatingPharmacy, setIsUpdatingPharmacy] = useState(false);

//   // Refetch billing details
//   const fetchBillingDetails = async () => {
//     if (!patientId) {
//       console.error("No patientId provided");
//       setError("No patient ID provided");
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
//       console.log(
//         "Fetching outpatient billing details for patient ID:",
//         patientId,
//         "Examination ID:",
//         examinationId,
//       );
//       const response = await inpatientService.getOutpatientBillingSummary(
//         patientId,
//         { examinationId },
//       );
//       console.log("Outpatient Billing API Response:", response);

//       if (response && response.success && response.data) {
//         const data = response.data;

//         // Ensure patient exists
//         if (!data.patient) {
//           console.error("Patient data missing in response:", data);
//           const errorMsg = "Patient data not found in response";
//           setError(errorMsg);
//           toast.error(errorMsg);
//           setLoading(false);
//           return;
//         }

//         // Ensure charges arrays exist
//         const charges = {
//           consultation: Array.isArray(data.charges?.consultation)
//             ? data.charges.consultation
//             : [],
//           therapy: Array.isArray(data.charges?.therapy)
//             ? data.charges.therapy
//             : [],
//           pharmacy: Array.isArray(data.charges?.pharmacy)
//             ? data.charges.pharmacy
//             : [],
//         };

//         const billingDataWithCharges = {
//           ...data,
//           charges,
//         };

//         console.log(
//           "Processed outpatient billing data:",
//           billingDataWithCharges,
//         );
//         setBillingData(billingDataWithCharges);
//         setError(null);

//         // Set initial values from invoice if available
//         if (data.invoice && data.invoice.id) {
//           setDiscountRate(
//             data.invoice.discountValue !== undefined
//               ? data.invoice.discountValue
//               : data.invoice.discountRate || 0,
//           );
//           setDiscountType(data.invoice.discountType || "percentage");
//           setTaxRate(data.invoice.taxRate || 5);
//         }
//       } else {
//         console.error("Invalid response structure:", response);
//         const errorMsg = response?.message || "Invalid response from server";
//         setError(errorMsg);
//         toast.error(errorMsg);
//         setBillingData(null);
//       }
//     } catch (error) {
//       console.error("Error fetching outpatient billing details:", error);
//       console.error("Error response:", error.response);
//       console.error("Error details:", {
//         message: error.message,
//         status: error.response?.status,
//         data: error.response?.data,
//       });

//       // Handle 401 Unauthorized - redirect to login
//       if (error.response?.status === 401) {
//         const errorMsg =
//           error.response?.data?.message ||
//           "Session expired. Please login again.";
//         setError(errorMsg);
//         toast.error(errorMsg);
//         // Redirect to login after a short delay
//         setTimeout(() => {
//           navigate("/login");
//         }, 2000);
//       } else {
//         const msg =
//           error.response?.data?.message ||
//           error.message ||
//           "Failed to load billing details.";
//         setError(msg);
//         toast.error(msg);
//       }
//       setBillingData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (patientId) {
//       fetchBillingDetails();
//     }
//   }, [patientId]);

//   const chargeTotals = useMemo(() => {
//     if (!billingData?.charges)
//       return { consultation: 0, therapy: 0, pharmacy: 0 };
//     const { charges } = billingData;
//     return {
//       consultation: charges.consultation.reduce(
//         (sum, ch) => sum + Number(ch.amount || 0),
//         0,
//       ),
//       therapy: charges.therapy.reduce(
//         (sum, ch) => sum + Number(ch.amount || 0),
//         0,
//       ),
//       pharmacy: charges.pharmacy.reduce(
//         (sum, ch) => sum + Number(ch.amount || 0),
//         0,
//       ),
//     };
//   }, [billingData]);

//   // Step 1: Is the bill already finalized?
//   const isFinalized = useMemo(() => {
//     return !!billingData?.isFinalized || !!billingData?.invoice?.id;
//   }, [billingData]);

//   // Step 2: Compute GST on pharmacy FIRST (before discount) — no rounding here
//   const taxAmount = useMemo(() => {
//     // GST applied only on medicines (pharmacy)
//     return chargeTotals.pharmacy * (taxRate / 100);
//   }, [chargeTotals.pharmacy, taxRate]);

//   // Step 3: grandTotal = consultation + therapy + pharmacy-WITH-GST — no rounding here
//   const grandTotal = useMemo(() => {
//     if (!billingData) return 0;
//     const pharmacyWithGST = chargeTotals.pharmacy + taxAmount;
//     return chargeTotals.consultation + chargeTotals.therapy + pharmacyWithGST;
//   }, [billingData, chargeTotals, taxAmount]);

//   // Step 4: Apply discount on GST-inclusive grandTotal — no rounding here
//   const discountAmount = useMemo(() => {
//     if (discountType === "percentage") {
//       return grandTotal * (discountRate / 100);
//     } else {
//       return Math.min(discountRate, grandTotal);
//     }
//   }, [grandTotal, discountRate, discountType]);

//   // Step 5: Final total = grandTotal - discount — ROUND ONLY HERE for display
//   const totalCharges = useMemo(() => {
//     if (isFinalized && billingData?.invoice) {
//       return billingData.invoice.totalPayable;
//     }
//     return Math.round(Math.max(0, grandTotal - discountAmount) * 100) / 100;
//   }, [grandTotal, discountAmount, billingData, isFinalized]);

//   const amountPaid = useMemo(() => {
//     return billingData?.invoice?.amountPaid || 0;
//   }, [billingData]);

//   const outstandingAmount = useMemo(() => {
//     if (isFinalized) {
//       return Math.max(0, totalCharges - amountPaid);
//     }
//     return totalCharges;
//   }, [isFinalized, totalCharges, amountPaid]);

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(amount || 0);
//   };

//   const handleDiscountInput = (rawValue) => {
//     if (billingData?.invoice?.id) return; // Don't allow changes if finalized
//     // Accept empty string while typing (store as 0 internally)
//     const value = parseFloat(rawValue);
//     let sanitized = 0;
//     if (Number.isFinite(value)) {
//       if (discountType === "percentage") {
//         sanitized = Math.min(Math.max(value, 0), 100);
//       } else {
//         sanitized = Math.max(value, 0);
//       }
//     }
//     setDiscountRate(sanitized);
//   };

//   // Fetch doctors for edit dialog
//   const fetchDoctors = async () => {
//     setIsLoadingDoctors(true);
//     try {
//       const response = await doctorService.getAllDoctorProfiles({
//         page: 1,
//         limit: 1000,
//       });
//       if (response && response.success) {
//         setDoctors(response.data || []);
//       }
//     } catch (error) {
//       console.error("Error fetching doctors:", error);
//       toast.error("Failed to load doctors");
//     } finally {
//       setIsLoadingDoctors(false);
//     }
//   };

//   // Fetch therapists for edit dialog
//   const fetchTherapists = async () => {
//     setIsLoadingTherapists(true);
//     try {
//       const response = await therapistService.getAllTherapists({
//         page: 1,
//         limit: 1000,
//       });
//       if (response && response.success) {
//         setTherapists(response.data || []);
//       }
//     } catch (error) {
//       console.error("Error fetching therapists:", error);
//       toast.error("Failed to load therapists");
//     } finally {
//       setIsLoadingTherapists(false);
//     }
//   };

//   // Handle edit doctor consultation
//   const handleEditDoctor = (charge) => {
//     setEditDoctorDialog({ open: true, charge });
//     setSelectedDoctor(charge.doctorId || "");
//     setConsultationAmount((charge.amount || 0).toString());
//     if (!doctors.length) {
//       fetchDoctors();
//     }
//   };

//   // Handle edit therapist
//   const handleEditTherapist = (charge) => {
//     setEditTherapistDialog({ open: true, charge });

//     // Initialize therapist selection - use therapistId if available, otherwise try to extract from session
//     const therapistId =
//       charge.therapistId || charge.therapist?._id || charge.therapist || "";
//     setSelectedTherapist(therapistId);

//     // Multiple therapies: one row per therapy with its own cost and therapist charge
//     if (charge.therapies && charge.therapies.length > 1) {
//       setTherapyEditRows(
//         charge.therapies.map((t) => ({
//           therapyName: t.therapyName || "Therapy",
//           sessionId: t.sessionId || "",
//           therapyCharge: String(t.therapyCharge ?? 0),
//           therapistCharge: String(t.therapistCharge ?? 0),
//         })),
//       );
//       setTherapyCost("");
//       setTherapistCharge("");
//     } else {
//       setTherapyEditRows([]);
//       const therapyCostVal =
//         charge.totalTherapyCharge !== undefined
//           ? charge.totalTherapyCharge
//           : charge.therapyCharge || 0;
//       const therapistCostVal =
//         charge.totalTherapistCharge !== undefined
//           ? charge.totalTherapistCharge
//           : charge.therapistCharge || 0;
//       setTherapyCost(therapyCostVal.toString());
//       setTherapistCharge(therapistCostVal.toString());
//     }

//     setReplaceTherapists(false);

//     if (!therapists.length) {
//       fetchTherapists();
//     }
//   };

//   // Update a single row in therapyEditRows (for grouped edit)
//   const updateTherapyEditRow = (index, field, value) => {
//     setTherapyEditRows((prev) => {
//       const next = [...prev];
//       if (next[index]) next[index] = { ...next[index], [field]: value };
//       return next;
//     });
//   };

//   // Update doctor consultation
//   const handleUpdateDoctor = async () => {
//     if (!selectedDoctor) {
//       toast.error("Please select a doctor");
//       return;
//     }

//     if (!consultationAmount || parseFloat(consultationAmount) < 0) {
//       toast.error("Please enter a valid consultation amount");
//       return;
//     }

//     if (!editDoctorDialog.charge?.id) {
//       toast.error("Invalid consultation record");
//       return;
//     }

//     setIsUpdating(true);
//     try {
//       // Update the examination's doctor and consultation fee using the consultation endpoint
//       const response = await axios.patch(
//         getApiUrl(`examinations/${editDoctorDialog.charge.id}/consultation`),
//         {
//           doctorId: selectedDoctor || null,
//           price: parseFloat(consultationAmount),
//         },
//         { headers: getAuthHeaders() },
//       );

//       if (response.data && response.data.success) {
//         toast.success("Consultation charge updated successfully!");
//         setEditDoctorDialog({ open: false, charge: null });
//         setSelectedDoctor("");
//         setConsultationAmount("");

//         // Refresh billing data
//         await fetchBillingDetails();
//       } else {
//         toast.error(
//           response.data?.message || "Failed to update consultation charge",
//         );
//       }
//     } catch (error) {
//       console.error("Error updating consultation charge:", error);
//       toast.error(
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to update consultation charge",
//       );
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   // Update therapist
//   const handleUpdateTherapist = async () => {
//     if (!selectedTherapist) {
//       toast.error("Please select a therapist");
//       return;
//     }

//     const isValidObjectId = (id) => {
//       if (!id || typeof id !== "string") return false;
//       return /^[0-9a-fA-F]{24}$/.test(id) && !id.includes("-");
//     };

//     // Multiple therapies: update each session with its row's cost and therapist charge
//     if (therapyEditRows.length > 0) {
//       const invalid = therapyEditRows.find(
//         (r) => !r.sessionId || !isValidObjectId(r.sessionId),
//       );
//       if (invalid) {
//         toast.error(
//           "Invalid therapy session record. Please refresh the page and try again.",
//         );
//         return;
//       }
//       const invalidCost = therapyEditRows.find(
//         (r) =>
//           parseFloat(r.therapyCharge || 0) < 0 ||
//           parseFloat(r.therapistCharge || 0) < 0,
//       );
//       if (invalidCost) {
//         toast.error("Please enter valid cost and charge for all therapies.");
//         return;
//       }

//       setIsUpdating(true);
//       try {
//         let successCount = 0;
//         for (const row of therapyEditRows) {
//           const response = await axios.patch(
//             getApiUrl(`therapist-sessions/${row.sessionId}`),
//             {
//               therapist: selectedTherapist,
//               cost: parseFloat(row.therapyCharge || 0),
//               therapistCharge: parseFloat(row.therapistCharge || 0),
//               replaceTherapists: replaceTherapists,
//             },
//             { headers: getAuthHeaders() },
//           );
//           if (response.data && response.data.success) successCount++;
//         }
//         if (successCount === therapyEditRows.length) {
//           toast.success(
//             `All ${successCount} therapy session(s) updated successfully!`,
//           );
//           setEditTherapistDialog({ open: false, charge: null });
//           setSelectedTherapist("");
//           setTherapyEditRows([]);
//           setReplaceTherapists(false);
//           await fetchBillingDetails();
//         } else {
//           toast.warning(
//             `Updated ${successCount} of ${therapyEditRows.length} session(s). Please refresh and retry if needed.`,
//           );
//           await fetchBillingDetails();
//         }
//       } catch (error) {
//         console.error("Error updating therapist sessions:", error);
//         toast.error(
//           error.response?.data?.message ||
//           error.message ||
//           "Failed to update therapist",
//         );
//       } finally {
//         setIsUpdating(false);
//       }
//       return;
//     }

//     // Single therapy
//     if (!therapyCost || parseFloat(therapyCost) < 0) {
//       toast.error("Please enter a valid therapy cost");
//       return;
//     }

//     const sessionId = editTherapistDialog.charge?.sessionId;
//     if (!sessionId || !isValidObjectId(sessionId)) {
//       toast.error(
//         "Invalid therapy session record. Please refresh the page and try again.",
//       );
//       return;
//     }

//     setIsUpdating(true);
//     try {
//       const response = await axios.patch(
//         getApiUrl(`therapist-sessions/${sessionId}`),
//         {
//           therapist: selectedTherapist,
//           cost: parseFloat(therapyCost),
//           therapistCharge: parseFloat(therapistCharge || 0),
//           replaceTherapists: replaceTherapists,
//         },
//         { headers: getAuthHeaders() },
//       );

//       if (response.data && response.data.success) {
//         toast.success(
//           replaceTherapists
//             ? "Therapist replaced and cost updated successfully!"
//             : "Therapist added and cost updated successfully!",
//         );
//         setEditTherapistDialog({ open: false, charge: null });
//         setSelectedTherapist("");
//         setTherapyCost("");
//         setTherapistCharge("");
//         setReplaceTherapists(false);
//         await fetchBillingDetails();
//       } else {
//         toast.error(response.data?.message || "Failed to update therapist");
//       }
//     } catch (error) {
//       console.error("Error updating therapist:", error);
//       toast.error(
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to update therapist",
//       );
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   // Handle edit pharmacy charge
//   const handleEditPharmacy = (charge) => {
//     setEditPharmacyDialog({ open: true, charge });
//     setPharmacyUnitPrice((charge.unitPrice || 0).toString());
//   };

//   // Update pharmacy charge
//   const handleUpdatePharmacy = async () => {
//     if (!pharmacyUnitPrice || parseFloat(pharmacyUnitPrice) < 0) {
//       toast.error("Please enter a valid unit price");
//       return;
//     }

//     const charge = editPharmacyDialog.charge;
//     if (!charge?.id) {
//       toast.error("Invalid pharmacy record");
//       return;
//     }

//     setIsUpdatingPharmacy(true);
//     try {
//       const response = await axios.patch(
//         getApiUrl(`examinations/prescriptions/${charge.id}`),
//         {
//           unitPrice: parseFloat(pharmacyUnitPrice),
//         },
//         { headers: getAuthHeaders() },
//       );

//       if (response.data && response.data.success) {
//         toast.success("Pharmacy price updated successfully!");
//         setEditPharmacyDialog({ open: false, charge: null });
//         setPharmacyUnitPrice("");

//         // Refresh billing data
//         await fetchBillingDetails();
//       } else {
//         toast.error(
//           response.data?.message || "Failed to update pharmacy price",
//         );
//       }
//     } catch (error) {
//       console.error("Error updating pharmacy price:", error);
//       toast.error(
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to update pharmacy price",
//       );
//     } finally {
//       setIsUpdatingPharmacy(false);
//     }
//   };
//   const handleFinalizeBilling = async () => {
//     try {
//       setIsFinalizing(true);
//       const response = await inpatientService.finalizeOutpatientBilling(
//         patientId,
//         {
//           discountType,
//           discountValue: discountRate,
//           discountRate,
//           taxRate,
//         },
//         { examinationId },
//       );

//       if (response && response.success) {
//         toast.success(
//           `Billing finalized successfully. Invoice #${response.data.invoiceNumber} generated.`,
//         );

//         // Refresh billing data to show updated invoice information
//         if (patientId) {
//           try {
//             const billingResponse =
//               await inpatientService.getOutpatientBillingSummary(patientId, {
//                 examinationId,
//               });
//             if (
//               billingResponse &&
//               billingResponse.success &&
//               billingResponse.data
//             ) {
//               const data = billingResponse.data;
//               const charges = {
//                 consultation: Array.isArray(data.charges?.consultation)
//                   ? data.charges.consultation
//                   : [],
//                 therapy: Array.isArray(data.charges?.therapy)
//                   ? data.charges.therapy
//                   : [],
//                 pharmacy: Array.isArray(data.charges?.pharmacy)
//                   ? data.charges.pharmacy
//                   : [],
//               };
//               setBillingData({ ...data, charges });

//               if (data.invoice && data.invoice.id) {
//                 setDiscountRate(
//                   data.invoice.discountValue !== undefined
//                     ? data.invoice.discountValue
//                     : data.invoice.discountRate || 0,
//                 );
//                 setDiscountType(data.invoice.discountType || "percentage");
//                 setTaxRate(data.invoice.taxRate || 5);
//               }
//             }
//           } catch (refreshError) {
//             console.error("Error refreshing billing data:", refreshError);
//           }
//         }

//         // Navigate to payments page after a short delay
//         setTimeout(() => {
//           navigate("/receptionist/payments");
//         }, 2000);
//       }
//     } catch (error) {
//       console.error("Finalize billing error:", error);
//       const errorMessage =
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to finalize billing.";
//       toast.error(errorMessage);
//     } finally {
//       setIsFinalizing(false);
//       setIsConfirmModalOpen(false);
//     }
//   };

//   // Breadcrumb items
//   const breadcrumbItems = [
//     { label: "Home", url: "/" },
//     { label: "Outpatients", url: "/receptionist/outpatient" },
//     { label: "Outpatient Billing" },
//   ];

//   console.log("Component state:", {
//     loading,
//     error,
//     hasBillingData: !!billingData,
//     patientId,
//   });

//   if (loading) {
//     console.log("Rendering loading state");
//     return (
//       <Box
//         sx={{
//           padding: "20px",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           minHeight: "400px",
//         }}
//       >
//         <Breadcrumb items={breadcrumbItems} />
//         <div
//           className="spinner-border text-primary"
//           role="status"
//           style={{ marginLeft: "20px" }}
//         >
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </Box>
//     );
//   }

//   if (error || !billingData) {
//     console.log("Rendering error state:", error);
//     return (
//       <Box sx={{ padding: "20px" }}>
//         <Breadcrumb items={breadcrumbItems} />
//         <div className="alert alert-danger">
//           <strong>Error:</strong> {error || "Failed to load billing data."}
//           {patientId && <div className="mt-2">Patient ID: {patientId}</div>}
//           <div className="mt-2">
//             <button
//               className="btn btn-primary btn-sm"
//               onClick={fetchBillingDetails}
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </Box>
//     );
//   }

//   const { patient, charges } = billingData || {};
//   // Removed duplicate isFinalized declaration

//   console.log("Patient data:", patient);
//   console.log("Charges:", charges);

//   // Safety check for patient data
//   if (!patient || !patient.name) {
//     console.log("Patient data missing, rendering warning");
//     return (
//       <Box sx={{ padding: "20px" }}>
//         <Breadcrumb items={breadcrumbItems} />
//         <div className="alert alert-warning">
//           Patient data not available. Please check the patient ID and try again.
//           {patientId && <div className="mt-2">Patient ID: {patientId}</div>}
//         </div>
//       </Box>
//     );
//   }

//   console.log("Rendering main content");
//   return (
//     <Box sx={{ padding: "20px" }}>
//       {/* ⭐ Breadcrumb */}
//       <Breadcrumb items={breadcrumbItems} />

//       {/* ⭐ Page Heading */}
//       <HeadingCardingCard
//         category="OUTPATIENT BILLING"
//         title={`Billing Details - ${patient?.name || "Unknown Patient"}`}
//         subtitle="View and manage all outpatient charges for this patient."
//       />

//       {/* ⭐ Patient Info Card */}
//       <div
//         className="card shadow-sm mb-4"
//         style={{ border: "none", borderRadius: "12px", overflow: "hidden" }}
//       >
//         <div className="card-body" style={{ padding: "24px" }}>
//           <div className="row align-items-center">
//             <div className="col-md-8">
//               <h3
//                 className="mb-3"
//                 style={{
//                   fontSize: "1.75rem",
//                   fontWeight: 700,
//                   color: "#1a1a1a",
//                 }}
//               >
//                 {patient?.name || "Unknown Patient"}
//               </h3>
//               <div
//                 className="d-flex flex-wrap gap-3"
//                 style={{ fontSize: "0.875rem" }}
//               >
//                 {patient?.uhid && (
//                   <span className="badge bg-light text-dark p-2">
//                     <strong className="text-muted me-1">UHID:</strong>{" "}
//                     {patient.uhid}
//                   </span>
//                 )}
//                 {patient?.patientId && (
//                   <span className="badge bg-light text-dark p-2">
//                     <strong className="text-muted me-1">Patient ID:</strong>{" "}
//                     {patient.patientId}
//                   </span>
//                 )}
//                 <span className="badge bg-success p-2">OUTPATIENT</span>
//               </div>
//             </div>
//             <div className="col-md-4 text-md-end">
//               <div
//                 style={{
//                   background: isFinalized
//                     ? "linear-gradient(135deg, #6c757d 0%, #495057 100%)"
//                     : "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
//                   borderRadius: "16px",
//                   padding: "24px 32px",
//                   display: "inline-block",
//                   boxShadow: "0 8px 24px rgba(0,0,0, 0.25)",
//                   border: "1px solid rgba(255, 255, 255, 0.2)",
//                   minWidth: "220px",
//                   position: "relative",
//                   overflow: "hidden",
//                 }}
//               >
//                 <div style={{ position: "relative", zIndex: 1 }}>
//                   <p
//                     style={{
//                       fontSize: "0.75rem",
//                       fontWeight: 600,
//                       color: "rgba(255, 255, 255, 0.9)",
//                       marginBottom: "8px",
//                       textTransform: "uppercase",
//                       letterSpacing: "0.5px",
//                     }}
//                   >
//                     {isFinalized
//                       ? outstandingAmount === 0
//                         ? "Total Paid (Finalized)"
//                         : "Amount Due"
//                       : "Total Outstanding"}
//                   </p>
//                   <h2
//                     style={{
//                       fontSize: "2rem",
//                       fontWeight: 700,
//                       color: "#FFFFFF",
//                       marginBottom: 0,
//                       lineHeight: "1.2",
//                     }}
//                   >
//                     {formatCurrency(
//                       isFinalized
//                         ? outstandingAmount === 0
//                           ? totalCharges
//                           : outstandingAmount
//                         : totalCharges,
//                     )}
//                   </h2>
//                   {isFinalized && outstandingAmount > 0 && (
//                     <p
//                       style={{
//                         fontSize: "0.75rem",
//                         color: "rgba(255, 255, 255, 0.8)",
//                         marginTop: "4px",
//                       }}
//                     >
//                       Paid: {formatCurrency(amountPaid)}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ⭐ Summary Cards */}
//       <Box
//         sx={{
//           display: "grid",
//           gridTemplateColumns: {
//             xs: "1fr",
//             sm: "repeat(2, 1fr)",
//             md: "repeat(3, 1fr)",
//           },
//           gap: "15px",
//           marginBottom: 3,
//         }}
//       >
//         <DashboardCard
//           title="Consultation"
//           count={chargeTotals.consultation}
//           prefix="₹"
//           icon={LocalHospitalIcon}
//         />
//         <DashboardCard
//           title="Therapy"
//           count={chargeTotals.therapy}
//           prefix="₹"
//           icon={SpaIcon}
//         />
//         <DashboardCard
//           title="Pharmacy"
//           count={chargeTotals.pharmacy}
//           prefix="₹"
//           icon={MedicationIcon}
//         />
//       </Box>

//       {/* ⭐ Adjustments Panel */}
//       <div className="card shadow-sm mb-4">
//         <div className="card-body">
//           <div className="row align-items-center">
//             <div className="col-md-6">
//               <h5 className="mb-1">Adjustments</h5>
//               <p className="text-muted small mb-0">
//                 {isFinalized
//                   ? "Final adjustments applied at billing finalization."
//                   : "Apply discount before finalizing bill."}
//               </p>
//             </div>
//             <div className="col-md-6">
//               <div className="d-flex flex-wrap align-items-center gap-3">
//                 <FormControl size="small" sx={{ minWidth: 120 }}>
//                   <InputLabel>Discount Type</InputLabel>
//                   <Select
//                     value={discountType}
//                     label="Discount Type"
//                     onChange={(e) => {
//                       if (billingData?.invoice?.id) return;
//                       setDiscountType(e.target.value);
//                       setDiscountRate(0);
//                     }}
//                     disabled={!!isFinalized}
//                   >
//                     <MenuItem value="percentage">Percentage (%)</MenuItem>
//                     <MenuItem value="fixed">Fixed Amount (₹)</MenuItem>
//                   </Select>
//                 </FormControl>

//                 <div className="d-flex align-items-center">
//                   <TextField
//                     label={
//                       discountType === "percentage"
//                         ? "Discount (%)"
//                         : "Discount (₹)"
//                     }
//                     type="number"
//                     size="small"
//                     inputProps={{
//                       min: 0,
//                       max: discountType === "percentage" ? 100 : undefined,
//                       step: discountType === "percentage" ? 0.5 : 1,
//                     }}
//                     sx={{ width: 120 }}
//                     value={discountRate}
//                     onChange={(e) =>
//                       handleDiscountInput(parseFloat(e.target.value))
//                     }
//                     disabled={!!isFinalized}
//                   />
//                 </div>
//                 <div className="d-flex align-items-center ms-3">
//                   <TextField
//                     label="GST (%) on Meds"
//                     type="number"
//                     size="small"
//                     inputProps={{
//                       min: 0,
//                       max: 100,
//                       step: 0.5,
//                     }}
//                     sx={{ width: 140 }}
//                     value={taxRate}
//                     onChange={(e) => {
//                       if (billingData?.invoice?.id) return;
//                       const val = parseFloat(e.target.value);
//                       setTaxRate(Number.isFinite(val) && val >= 0 ? val : 0);
//                     }}
//                     disabled={!!isFinalized}
//                   />
//                   <span
//                     className="ms-2 text-muted fw-bold"
//                     style={{ fontSize: "0.875rem", minWidth: "80px" }}
//                   >
//                     {formatCurrency(taxAmount)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ⭐ Charges Panels - All Vertical */}
//       <div className="row">
//         <div className="col-12 mb-4">
//           <ChargesPanel
//             title="Doctor Consultation"
//             charges={charges?.consultation || []}
//             category="consultation"
//             isEditable={!isFinalized}
//             onEdit={handleEditDoctor}
//           />
//         </div>
//         <div className="col-12 mb-4">
//           <ChargesPanel
//             title="Therapy Charges"
//             charges={charges?.therapy || []}
//             category="therapy"
//             isEditable={!isFinalized}
//             onEdit={handleEditTherapist}
//           />
//         </div>
//         <div className="col-12 mb-4">
//           <ChargesPanel
//             title="Pharmacy Charges"
//             charges={charges?.pharmacy || []}
//             category="pharmacy"
//             isEditable={!isFinalized}
//             onEdit={handleEditPharmacy}
//           />
//         </div>
//       </div>

//       {/* Edit Doctor Dialog */}
//       <Dialog
//         open={editDoctorDialog.open}
//         onClose={() =>
//           !isUpdating && setEditDoctorDialog({ open: false, charge: null })
//         }
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <Typography variant="h6" sx={{ fontWeight: 700 }}>
//             Edit Doctor
//           </Typography>
//           <Button
//             onClick={() => setEditDoctorDialog({ open: false, charge: null })}
//             disabled={isUpdating}
//             sx={{ minWidth: "auto", p: 0.5 }}
//           >
//             <CloseIcon />
//           </Button>
//         </DialogTitle>
//         <Divider />
//         <DialogContent sx={{ mt: 2 }}>
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//               Consultation:{" "}
//               <strong>{editDoctorDialog.charge?.description || "N/A"}</strong>
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Current Doctor:{" "}
//               <strong>{editDoctorDialog.charge?.doctorName || "N/A"}</strong>
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//               Current Amount:{" "}
//               <strong>
//                 {formatCurrency(editDoctorDialog.charge?.amount || 0)}
//               </strong>
//             </Typography>
//           </Box>
//           <FormControl fullWidth required sx={{ mb: 2 }}>
//             <InputLabel id="doctor-select-label">Select Doctor</InputLabel>
//             <Select
//               labelId="doctor-select-label"
//               value={selectedDoctor}
//               onChange={(e) => setSelectedDoctor(e.target.value)}
//               label="Select Doctor"
//               disabled={isLoadingDoctors || isUpdating}
//             >
//               <MenuItem value="" disabled>
//                 {isLoadingDoctors ? "Loading doctors..." : "Select Doctor"}
//               </MenuItem>
//               {doctors.map((doctor) => {
//                 const doctorName =
//                   doctor.user?.name ||
//                   `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() ||
//                   "Doctor";
//                 const displayName = doctor.specialization
//                   ? `${doctorName} - ${doctor.specialization}`
//                   : doctorName;
//                 return (
//                   <MenuItem
//                     key={doctor._id || doctor.id}
//                     value={doctor._id || doctor.id}
//                   >
//                     {displayName}
//                   </MenuItem>
//                 );
//               })}
//             </Select>
//           </FormControl>
//           <TextField
//             fullWidth
//             label="Consultation Amount (INR) *"
//             type="number"
//             value={consultationAmount}
//             onChange={(e) => setConsultationAmount(e.target.value)}
//             variant="outlined"
//             inputProps={{ min: 0, step: 0.01 }}
//             required
//             disabled={isUpdating}
//           />
//         </DialogContent>
//         <DialogActions sx={{ p: 2 }}>
//           <Button
//             onClick={() => setEditDoctorDialog({ open: false, charge: null })}
//             disabled={isUpdating}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={handleUpdateDoctor}
//             disabled={!selectedDoctor || !consultationAmount || isUpdating}
//             sx={{ backgroundColor: "#8B4513" }}
//             startIcon={
//               isUpdating ? (
//                 <CircularProgress size={20} sx={{ color: "white" }} />
//               ) : null
//             }
//           >
//             {isUpdating ? "Updating..." : "Update Consultation"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Edit Therapist Dialog */}
//       <Dialog
//         open={editTherapistDialog.open}
//         onClose={() => {
//           if (!isUpdating) {
//             setEditTherapistDialog({ open: false, charge: null });
//             setTherapyEditRows([]);
//           }
//         }}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <Typography variant="h6" sx={{ fontWeight: 700 }}>
//             Edit Therapist
//           </Typography>
//           <Button
//             onClick={() =>
//               setEditTherapistDialog({ open: false, charge: null })
//             }
//             disabled={isUpdating}
//             sx={{ minWidth: "auto", p: 0.5 }}
//           >
//             <CloseIcon />
//           </Button>
//         </DialogTitle>
//         <Divider />
//         <DialogContent sx={{ mt: 2 }}>
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//               Therapy:{" "}
//               <strong>
//                 {editTherapistDialog.charge?.therapies &&
//                   editTherapistDialog.charge.therapies.length > 0
//                   ? editTherapistDialog.charge.therapies
//                     .map((t, idx) => t.therapyName)
//                     .join(" • ")
//                   : editTherapistDialog.charge?.therapyName || "N/A"}
//               </strong>
//             </Typography>
//             {editTherapistDialog.charge?.therapies &&
//               editTherapistDialog.charge.therapies.length > 1 && (
//                 <Typography
//                   variant="caption"
//                   color="text.secondary"
//                   sx={{ display: "block", mb: 1, fontStyle: "italic" }}
//                 >
//                   Edit cost and therapist charge for each therapy below.
//                   Therapist selection applies to all.
//                 </Typography>
//               )}
//             <Typography variant="body2" color="text.secondary">
//               Current Therapist:{" "}
//               <strong>
//                 {editTherapistDialog.charge?.therapistName || "N/A"}
//               </strong>
//             </Typography>
//           </Box>
//           <FormControl fullWidth required>
//             <InputLabel id="therapist-select-label">
//               Select Therapist
//             </InputLabel>
//             <Select
//               labelId="therapist-select-label"
//               value={selectedTherapist}
//               onChange={(e) => setSelectedTherapist(e.target.value)}
//               label="Select Therapist"
//               disabled={isLoadingTherapists || isUpdating}
//             >
//               <MenuItem value="" disabled>
//                 {isLoadingTherapists
//                   ? "Loading therapists..."
//                   : "Select Therapist"}
//               </MenuItem>
//               {therapists.map((therapist) => {
//                 const therapistName =
//                   therapist.user?.name || therapist.name || "Therapist";
//                 const displayName = therapist.speciality
//                   ? `${therapistName} - ${therapist.speciality}`
//                   : therapistName;
//                 // Get user ID for therapist (needed for assignment)
//                 const therapistUserId =
//                   therapist.user?._id || therapist.user || therapist._id;
//                 return (
//                   <MenuItem
//                     key={therapist._id || therapist.id}
//                     value={therapistUserId}
//                   >
//                     {displayName}
//                   </MenuItem>
//                 );
//               })}
//             </Select>
//           </FormControl>
//           {therapyEditRows.length > 0 ? (
//             <Box sx={{ mt: 2 }}>
//               <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
//                 Per-therapy cost &amp; charge
//               </Typography>
//               {therapyEditRows.map((row, index) => (
//                 <Box
//                   key={index}
//                   sx={{
//                     mb: 2,
//                     p: 1.5,
//                     border: "1px solid",
//                     borderColor: "divider",
//                     borderRadius: 1,
//                   }}
//                 >
//                   <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
//                     {row.therapyName}
//                   </Typography>
//                   <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
//                     <TextField
//                       label="Therapy Cost (INR)"
//                       type="number"
//                       value={row.therapyCharge}
//                       onChange={(e) =>
//                         updateTherapyEditRow(
//                           index,
//                           "therapyCharge",
//                           e.target.value,
//                         )
//                       }
//                       variant="outlined"
//                       size="small"
//                       inputProps={{ min: 0, step: 1 }}
//                       disabled={isUpdating}
//                       sx={{ minWidth: 140 }}
//                     />
//                     <TextField
//                       label="Therapist Charge (INR)"
//                       type="number"
//                       value={row.therapistCharge}
//                       onChange={(e) =>
//                         updateTherapyEditRow(
//                           index,
//                           "therapistCharge",
//                           e.target.value,
//                         )
//                       }
//                       variant="outlined"
//                       size="small"
//                       inputProps={{ min: 0, step: 1 }}
//                       disabled={isUpdating}
//                       sx={{ minWidth: 140 }}
//                     />
//                   </Box>
//                 </Box>
//               ))}
//             </Box>
//           ) : (
//             <>
//               <TextField
//                 fullWidth
//                 label="Therapy Cost (INR)"
//                 type="number"
//                 value={therapyCost}
//                 onChange={(e) => setTherapyCost(e.target.value)}
//                 variant="outlined"
//                 inputProps={{ min: 0, step: 1 }}
//                 disabled={isUpdating}
//                 sx={{ mt: 2 }}
//               />
//               <TextField
//                 fullWidth
//                 label="Therapist Charge (INR)"
//                 type="number"
//                 value={therapistCharge}
//                 onChange={(e) => setTherapistCharge(e.target.value)}
//                 variant="outlined"
//                 inputProps={{ min: 0, step: 1 }}
//                 disabled={isUpdating}
//                 sx={{ mt: 2 }}
//               />
//             </>
//           )}
//           <Box
//             sx={{
//               mt: 2,
//               p: 2,
//               bgcolor: "rgba(255, 193, 7, 0.1)",
//               borderRadius: "8px",
//               border: "1px solid rgba(255, 193, 7, 0.3)",
//             }}
//           >
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={replaceTherapists}
//                   onChange={(e) => setReplaceTherapists(e.target.checked)}
//                   disabled={isUpdating}
//                 />
//               }
//               label={
//                 <Typography variant="body2">
//                   <strong>Replace all therapists</strong> (instead of adding to
//                   existing list)
//                 </Typography>
//               }
//             />
//             <Typography
//               variant="caption"
//               color="text.secondary"
//               sx={{ display: "block", mt: 0.5, ml: 4 }}
//             >
//               {replaceTherapists
//                 ? "All existing therapists will be removed and replaced with the selected therapist."
//                 : "The selected therapist will be added to the existing therapists list."}
//             </Typography>
//           </Box>
//           <Box
//             sx={{
//               mt: 2,
//               p: 2,
//               bgcolor: "rgba(212, 165, 116, 0.1)",
//               borderRadius: "8px",
//               border: "1px solid rgba(212, 165, 116, 0.2)",
//             }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
//                 Total Therapy Cost:
//               </Typography>
//               <Typography
//                 variant="h6"
//                 sx={{ fontWeight: 700, color: "#8B4513" }}
//               >
//                 {therapyEditRows.length > 0
//                   ? formatCurrency(
//                     therapyEditRows.reduce(
//                       (sum, r) =>
//                         sum +
//                         parseFloat(r.therapyCharge || 0) +
//                         parseFloat(r.therapistCharge || 0),
//                       0,
//                     ),
//                   )
//                   : formatCurrency(
//                     parseFloat(therapyCost || 0) +
//                     parseFloat(therapistCharge || 0),
//                   )}
//               </Typography>
//             </Box>
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ p: 2 }}>
//           <Button
//             onClick={() =>
//               setEditTherapistDialog({ open: false, charge: null })
//             }
//             disabled={isUpdating}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={handleUpdateTherapist}
//             disabled={!selectedTherapist || isUpdating}
//             sx={{ backgroundColor: "#8B4513" }}
//             startIcon={
//               isUpdating ? (
//                 <CircularProgress size={20} sx={{ color: "white" }} />
//               ) : null
//             }
//           >
//             {isUpdating ? "Updating..." : "Update Therapist"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Edit Pharmacy Dialog */}
//       <Dialog
//         open={editPharmacyDialog.open}
//         onClose={() =>
//           !isUpdatingPharmacy &&
//           setEditPharmacyDialog({ open: false, charge: null })
//         }
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <Typography variant="h6" sx={{ fontWeight: 700 }}>
//             Edit Pharmacy Price
//           </Typography>
//           <Button
//             onClick={() => setEditPharmacyDialog({ open: false, charge: null })}
//             disabled={isUpdatingPharmacy}
//             sx={{ minWidth: "auto", p: 0.5 }}
//           >
//             <CloseIcon />
//           </Button>
//         </DialogTitle>
//         <Divider />
//         <DialogContent sx={{ mt: 2 }}>
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//               Medicine:{" "}
//               <strong>
//                 {editPharmacyDialog.charge?.description ||
//                   editPharmacyDialog.charge?.medication ||
//                   "N/A"}
//               </strong>
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Quantity:{" "}
//               <strong>
//                 {editPharmacyDialog.charge?.dispensedQuantity ||
//                   editPharmacyDialog.charge?.quantity ||
//                   1}
//               </strong>
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//               Current Amount:{" "}
//               <strong>
//                 {formatCurrency(editPharmacyDialog.charge?.amount || 0)}
//               </strong>
//             </Typography>
//           </Box>
//           <TextField
//             fullWidth
//             label="Unit Price (INR) *"
//             type="number"
//             value={pharmacyUnitPrice}
//             onChange={(e) => setPharmacyUnitPrice(e.target.value)}
//             variant="outlined"
//             inputProps={{ min: 0, step: 0.01 }}
//             required
//             disabled={isUpdatingPharmacy}
//             helperText="This will override the default price of the medicine for this billing."
//           />
//           <Box
//             sx={{
//               mt: 2,
//               p: 2,
//               bgcolor: "rgba(212, 165, 116, 0.1)",
//               borderRadius: "8px",
//               border: "1px solid rgba(212, 165, 116, 0.2)",
//             }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
//                 Total Pharmacy Cost:
//               </Typography>
//               <Typography
//                 variant="h6"
//                 sx={{ fontWeight: 700, color: "#8B4513" }}
//               >
//                 {formatCurrency(
//                   parseFloat(pharmacyUnitPrice || 0) *
//                   (editPharmacyDialog.charge?.dispensedQuantity ||
//                     editPharmacyDialog.charge?.quantity ||
//                     1),
//                 )}
//               </Typography>
//             </Box>
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ p: 2 }}>
//           <Button
//             onClick={() => setEditPharmacyDialog({ open: false, charge: null })}
//             disabled={isUpdatingPharmacy}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={handleUpdatePharmacy}
//             disabled={!pharmacyUnitPrice || isUpdatingPharmacy}
//             sx={{ backgroundColor: "#8B4513" }}
//             startIcon={
//               isUpdatingPharmacy ? (
//                 <CircularProgress size={20} sx={{ color: "white" }} />
//               ) : null
//             }
//           >
//             {isUpdatingPharmacy ? "Updating..." : "Update Price"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* ⭐ Action Buttons */}
//       <div className="d-flex flex-wrap gap-3 mb-4">
//         <Link
//           to="/receptionist/outpatient"
//           className="btn btn-outline-secondary"
//         >
//           <ArrowBackIcon className="me-2" />
//           Back to Outpatients
//         </Link>
//         {!isFinalized && (
//           <button
//             type="button"
//             className="btn btn-success"
//             onClick={() => setIsConfirmModalOpen(true)}
//             disabled={isFinalizing || !patientId || grandTotal === 0}
//             style={{
//               backgroundColor: "#4CAF50",
//               borderColor: "#4CAF50",
//               color: "#FFFFFF",
//               fontWeight: 600,
//               padding: "10px 24px",
//               borderRadius: "8px",
//               boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
//             }}
//           >
//             {isFinalizing ? (
//               <>
//                 <span
//                   className="spinner-border spinner-border-sm me-2"
//                   role="status"
//                   aria-hidden="true"
//                 ></span>
//                 Finalizing...
//               </>
//             ) : (
//               <>
//                 <CheckCircleIcon className="me-2" />
//                 Finalize Bill
//               </>
//             )}
//           </button>
//         )}
//       </div>

//       <ConfirmationModal
//         isOpen={isConfirmModalOpen}
//         onClose={() => setIsConfirmModalOpen(false)}
//         onConfirm={handleFinalizeBilling}
//         title="Finalize Billing"
//         description="Are you sure you want to finalize the outpatient billing? This will generate the final invoice and cannot be undone."
//         confirmText="Finalize & Generate Bill"
//         isLoading={isFinalizing}
//         type="success"
//       />
//     </Box>
//   );
// }

// export default OutpatientBilling;


import { useState, useMemo, useEffect } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Divider,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";
import inpatientService from "../../../services/inpatientService";
import doctorService from "../../../services/doctorService";
import therapistService from "../../../services/therapistService";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import ConfirmationModal from "../../../components/modal/ConfirmationModal";
// Icons
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SpaIcon from "@mui/icons-material/Spa";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";

const ChargesPanel = ({
  title,
  charges,
  category,
  onEdit,
  isEditable = true,
  useHeaderAction = false,
}) => {
  const groupedCharges = useMemo(() => {
    if (!charges || !Array.isArray(charges)) return [];
    if (category !== "therapy") return charges;

    const groups = new Map();
    charges.forEach((charge) => {
      const examinationId = charge.examinationId || charge.examination || "";
      const treatmentPlanId = charge.treatmentPlanId || charge.treatmentPlan || "";
      const date = charge.date ? new Date(charge.date).toISOString().split("T")[0] : "";
      const therapistName = charge.therapistName || "";

      const groupKey = examinationId || treatmentPlanId || `${date}-${therapistName}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          ...charge,
          therapies: [],
          totalTherapyCharge: 0,
          totalTherapistCharge: 0,
          totalAmount: 0,
        });
      }

      const group = groups.get(groupKey);
      group.therapies.push({
        therapyName: charge.therapyName || charge.description || "",
        subTherapy: charge.subTherapy || "",
        therapyCharge: Number(charge.therapyCharge || 0),
        therapistCharge: Number(charge.therapistCharge || 0),
        amount: Number(charge.amount || 0),
        status: charge.status,
        sessionId: charge.sessionId || charge.id,
      });

      group.totalTherapyCharge += Number(charge.therapyCharge || 0);
      group.totalTherapistCharge += Number(charge.therapistCharge || 0);
      group.totalAmount += Number(charge.amount || 0);
    });

    return Array.from(groups.values());
  }, [charges, category]);

  if (!charges || !Array.isArray(charges)) {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">No charges available</p>
        </div>
      </div>
    );
  }

  const totalAmount = groupedCharges.reduce((sum, ch) => {
    if (category === "therapy" && ch.totalAmount) return sum + ch.totalAmount;
    return sum + Number(ch.amount || 0);
  }, 0);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return null;
    const normalized = status.toLowerCase();
    if (normalized === "completed" || normalized === "dispensed") return "badge bg-success";
    if (normalized === "in progress" || normalized === "ongoing") return "badge bg-warning";
    if (normalized === "pending") return "badge bg-info";
    return "badge bg-secondary";
  };

  const columnCount = category === "therapy" ? 5 : category === "consultation" ? 4 : 3;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header d-flex justify-content-between align-items-center" style={{ padding: "12px 20px" }}>
        <h5 className="card-title mb-0" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
          {title}
        </h5>
        <div className="d-flex align-items-center gap-2">
          {useHeaderAction && isEditable && onEdit && charges.length > 0 && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onEdit(charges[0])}
              style={{
                backgroundColor: "#D4A574",
                borderColor: "#D4A574",
                color: "#000",
                borderRadius: "8px",
                padding: "6px 14px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <EditIcon sx={{ fontSize: "1.1rem" }} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th style={{ fontSize: "0.875rem" }}>Date</th>
                {category === "therapy" ? (
                  <>
                    <th style={{ fontSize: "0.875rem" }}>Therapy</th>
                    <th style={{ fontSize: "0.875rem" }}>Therapist</th>
                    <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Status</th>
                    <th style={{ fontSize: "0.875rem", textAlign: "right" }}>Therapy Charge</th>
                    <th style={{ fontSize: "0.875rem", textAlign: "right" }}>Therapist Charge</th>
                  </>
                ) : (
                  <th style={{ fontSize: "0.875rem" }}>Description</th>
                )}
                {category === "consultation" && (
                  <th style={{ fontSize: "0.875rem" }}>Doctor</th>
                )}
                <th style={{ fontSize: "0.875rem", textAlign: "right" }}>Amount</th>
                {!useHeaderAction && isEditable && onEdit && (
                  <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {groupedCharges.map((charge, idx) => {
                const displayAmount = category === "therapy" && charge.totalAmount ? charge.totalAmount : charge.amount || 0;
                return (
                  <tr key={charge.id || `group-${idx}`}>
                    <td style={{ fontSize: "0.875rem" }}>
                      {formatDate(charge.date || charge.createdAt)}
                    </td>
                    {category === "therapy" ? (
                      <>
                        <td style={{ fontSize: "0.875rem" }}>
                          {charge.therapies && charge.therapies.length > 0 ? (
                            <div>
                              {(() => {
                                const uniqueSubTherapies = [...new Set(charge.therapies.map(t => t.subTherapy || ""))];
                                const hasCommonSubTherapy = uniqueSubTherapies.length === 1 && uniqueSubTherapies[0] !== "";
                                if (hasCommonSubTherapy) {
                                  return (
                                    <div>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                                        {charge.therapies.map((therapy, tIdx) => (
                                          <span key={tIdx} style={{ fontWeight: 500 }}>
                                            {therapy.therapyName}
                                            {tIdx < charge.therapies.length - 1 && <span style={{ margin: "0 4px", color: "#6c757d" }}>•</span>}
                                          </span>
                                        ))}
                                      </div>
                                      <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: "4px" }}>
                                        Sub-Therapy: {uniqueSubTherapies[0]}
                                      </div>
                                    </div>
                                  );
                                }
                                return (
                                  <div>
                                    {charge.therapies.map((therapy, tIdx) => (
                                      <div key={tIdx} style={{ marginBottom: tIdx < charge.therapies.length - 1 ? "6px" : "0" }}>
                                        <div style={{ fontWeight: 500 }}>{therapy.therapyName}</div>
                                        {therapy.subTherapy && (
                                          <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: "2px" }}>
                                            Sub-Therapy: {therapy.subTherapy}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            charge.therapyName || charge.description || "N/A"
                          )}
                        </td>
                        <td style={{ fontSize: "0.875rem" }}>{charge.therapistName || "—"}</td>
                        <td style={{ fontSize: "0.875rem", textAlign: "center" }}>
                          {charge.status ? (
                            <span className={getStatusBadgeClass(charge.status)} style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "50px" }}>
                              {charge.status}
                            </span>
                          ) : (
                            <span style={{ color: "#888" }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 500 }}>
                          {formatCurrency(charge.totalTherapyCharge ?? charge.therapyCharge ?? 0)}
                        </td>
                        <td style={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 500 }}>
                          {formatCurrency(charge.totalTherapistCharge ?? charge.therapistCharge ?? 0)}
                        </td>
                      </>
                    ) : (
                      <td style={{ fontSize: "0.875rem" }}>{charge.description || "N/A"}</td>
                    )}
                    {category === "consultation" && (
                      <td style={{ fontSize: "0.875rem" }}>{charge.doctorName || "—"}</td>
                    )}
                    <td style={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 600 }}>
                      {formatCurrency(displayAmount)}
                    </td>
                    {!useHeaderAction && isEditable && onEdit && (
                      <td style={{ fontSize: "0.875rem", textAlign: "center" }}>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => onEdit(charge)}
                          style={{
                            backgroundColor: "#D4A574",
                            color: "#000",
                            borderRadius: "8px",
                            padding: "4px 8px",
                            fontWeight: 500,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {charges.length === 0 && (
                <tr>
                  <td colSpan={columnCount + (isEditable && onEdit ? 1 : 0)} className="text-center text-muted py-4">
                    No charges added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function OutpatientBilling() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const examinationId = searchParams.get("examinationId");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState(null);
  const [error, setError] = useState(null);

  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Edit dialogs
  const [editDoctorDialog, setEditDoctorDialog] = useState({ open: false, charge: null });
  const [editTherapistDialog, setEditTherapistDialog] = useState({ open: false, charge: null });

  const [doctors, setDoctors] = useState([]);
  const [therapists, setTherapists] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedTherapist, setSelectedTherapist] = useState("");
  const [therapyCost, setTherapyCost] = useState("");
  const [therapistCharge, setTherapistCharge] = useState("");
  const [therapyEditRows, setTherapyEditRows] = useState([]);
  const [replaceTherapists, setReplaceTherapists] = useState(false);

  const [consultationAmount, setConsultationAmount] = useState("");

  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Discount
  const [discountType, setDiscountType] = useState("percentage"); // "percentage" | "fixed"
  const [discountValue, setDiscountValue] = useState("");

  const fetchBillingDetails = async () => {
    if (!patientId) {
      setError("No patient ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await inpatientService.getOutpatientBillingSummary(patientId, { examinationId });

      if (response?.success && response.data) {
        const data = response.data;

        if (!data.patient) {
          setError("Patient data not found");
          toast.error("Patient data not found");
          setLoading(false);
          return;
        }

        const charges = {
          consultation: Array.isArray(data.charges?.consultation) ? data.charges.consultation : [],
          therapy: Array.isArray(data.charges?.therapy) ? data.charges.therapy : [],
          // pharmacy intentionally removed
        };

        setBillingData({ ...data, charges });
      } else {
        const msg = response?.message || "Invalid response from server";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("Billing fetch error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to load billing details";
      setError(msg);
      toast.error(msg);

      if (err.response?.status === 401) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchBillingDetails();
  }, [patientId, examinationId]);

  // Only consultation + therapy — no pharmacy, no discount, no tax
  const chargeTotals = useMemo(() => {
    if (!billingData?.charges) return { consultation: 0, therapy: 0 };
    const { charges } = billingData;
    return {
      consultation: charges.consultation.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
      therapy: charges.therapy.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
    };
  }, [billingData]);

  const grandTotal = useMemo(() => {
    return chargeTotals.consultation + chargeTotals.therapy;
  }, [chargeTotals]);

  const discountAmount = useMemo(() => {
    const val = parseFloat(discountValue) || 0;
    if (!val || val <= 0) return 0;
    if (discountType === "percentage") {
      return Math.min((grandTotal * val) / 100, grandTotal);
    }
    return Math.min(val, grandTotal);
  }, [discountType, discountValue, grandTotal]);

  const totalCharges = useMemo(() => {
    if (billingData?.isFinalized && billingData?.invoice) {
      return billingData.invoice.totalPayable;
    }
    return Math.max(0, grandTotal - discountAmount);
  }, [billingData, grandTotal, discountAmount]);

  const amountPaid = useMemo(() => billingData?.invoice?.amountPaid || 0, [billingData]);

  const outstandingAmount = useMemo(() => {
    if (billingData?.isFinalized) return Math.max(0, totalCharges - amountPaid);
    return totalCharges;
  }, [billingData?.isFinalized, totalCharges, amountPaid]);

  const isFinalized = useMemo(() => {
    return !!billingData?.isFinalized || !!billingData?.invoice?.id;
  }, [billingData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const fetchDoctors = async () => {
    setIsLoadingDoctors(true);
    try {
      const res = await doctorService.getAllDoctorProfiles({ page: 1, limit: 1000 });
      if (res?.success) setDoctors(res.data || []);
    } catch {
      toast.error("Failed to load doctors");
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const fetchTherapists = async () => {
    setIsLoadingTherapists(true);
    try {
      const res = await therapistService.getAllTherapists({ page: 1, limit: 1000 });
      if (res?.success) setTherapists(res.data || []);
    } catch {
      toast.error("Failed to load therapists");
    } finally {
      setIsLoadingTherapists(false);
    }
  };

  const handleEditDoctor = (charge) => {
    setEditDoctorDialog({ open: true, charge });
    setSelectedDoctor(charge.doctorId || "");
    setConsultationAmount(String(charge.amount || 0));
    if (!doctors.length) fetchDoctors();
  };

  const handleEditTherapist = (charge) => {
    setEditTherapistDialog({ open: true, charge });
    const therapistId = charge.therapistId || charge.therapist?._id || charge.therapist || "";
    setSelectedTherapist(therapistId);

    if (charge.therapies?.length > 1) {
      setTherapyEditRows(
        charge.therapies.map(t => ({
          therapyName: t.therapyName || "Therapy",
          sessionId: t.sessionId || "",
          therapyCharge: String(t.therapyCharge ?? 0),
          therapistCharge: String(t.therapistCharge ?? 0),
        }))
      );
      setTherapyCost("");
      setTherapistCharge("");
    } else {
      setTherapyEditRows([]);
      setTherapyCost(String(charge.totalTherapyCharge ?? charge.therapyCharge ?? 0));
      setTherapistCharge(String(charge.totalTherapistCharge ?? charge.therapistCharge ?? 0));
    }

    setReplaceTherapists(false);
    if (!therapists.length) fetchTherapists();
  };

  const updateTherapyEditRow = (index, field, value) => {
    setTherapyEditRows(prev => {
      const next = [...prev];
      if (next[index]) next[index][field] = value;
      return next;
    });
  };

  const handleUpdateDoctor = async () => {
    if (!selectedDoctor || !consultationAmount || Number(consultationAmount) < 0) {
      toast.error("Please select doctor and enter valid amount");
      return;
    }
    setIsUpdating(true);
    try {
      const res = await axios.patch(
        getApiUrl(`examinations/${editDoctorDialog.charge.id}/consultation`),
        { doctorId: selectedDoctor || null, price: Number(consultationAmount) },
        { headers: getAuthHeaders() }
      );
      if (res.data?.success) {
        toast.success("Consultation updated");
        setEditDoctorDialog({ open: false, charge: null });
        await fetchBillingDetails();
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateTherapist = async () => {
    if (!selectedTherapist) {
      toast.error("Please select a therapist");
      return;
    }
    setIsUpdating(true);
    try {
      if (therapyEditRows.length > 0) {
        let successCount = 0;
        for (const row of therapyEditRows) {
          const res = await axios.patch(
            getApiUrl(`therapist-sessions/${row.sessionId}`),
            {
              therapist: selectedTherapist,
              cost: Number(row.therapyCharge || 0),
              therapistCharge: Number(row.therapistCharge || 0),
              replaceTherapists,
            },
            { headers: getAuthHeaders() }
          );
          if (res.data?.success) successCount++;
        }
        if (successCount === therapyEditRows.length) {
          toast.success("All therapy sessions updated");
          setEditTherapistDialog({ open: false, charge: null });
          setTherapyEditRows([]);
          await fetchBillingDetails();
        } else {
          toast.warning(`Updated ${successCount}/${therapyEditRows.length} sessions`);
          await fetchBillingDetails();
        }
      } else {
        const sessionId = editTherapistDialog.charge?.sessionId;
        if (!sessionId) throw new Error("Missing session ID");

        const res = await axios.patch(
          getApiUrl(`therapist-sessions/${sessionId}`),
          {
            therapist: selectedTherapist,
            cost: Number(therapyCost),
            therapistCharge: Number(therapistCharge || 0),
            replaceTherapists,
          },
          { headers: getAuthHeaders() }
        );

        if (res.data?.success) {
          toast.success("Therapy session updated");
          setEditTherapistDialog({ open: false, charge: null });
          await fetchBillingDetails();
        } else {
          toast.error(res.data?.message || "Update failed");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update therapist");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFinalizeBilling = async () => {
    setIsFinalizing(true);
    try {
      const payload = {};
      const dVal = parseFloat(discountValue) || 0;
      if (dVal > 0) {
        payload.discountType = discountType;
        payload.discountValue = dVal;
        payload.discountAmount = discountAmount;
      }

      const response = await inpatientService.finalizeOutpatientBilling(
        patientId,
        payload,
        { examinationId }
      );

      if (response?.success) {
        toast.success(`Invoice #${response.data.invoiceNumber} generated`);
        await fetchBillingDetails();
        setTimeout(() => navigate("/receptionist/payments"), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to finalize billing");
    } finally {
      setIsFinalizing(false);
      setIsConfirmModalOpen(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", url: "/" },
    { label: "Outpatients", url: "/receptionist/outpatient" },
    { label: "Outpatient Billing" },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 5, display: "flex", justifyContent: "center" }}>
        <Breadcrumb items={breadcrumbItems} />
        <div className="spinner-border text-primary ms-4" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Box>
    );
  }

  if (error || !billingData) {
    return (
      <Box sx={{ p: 4 }}>
        <Breadcrumb items={breadcrumbItems} />
        <div className="alert alert-danger mt-4">
          <strong>Error:</strong> {error || "Failed to load billing data"}
          <button className="btn btn-primary btn-sm ms-3" onClick={fetchBillingDetails}>
            Retry
          </button>
        </div>
      </Box>
    );
  }

  const { patient, charges } = billingData;

  if (!patient?.name) {
    return (
      <Box sx={{ p: 4 }}>
        <Breadcrumb items={breadcrumbItems} />
        <div className="alert alert-warning mt-4">
          Patient information not available.
        </div>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <HeadingCardingCard
        category="OUTPATIENT BILLING"
        title={`Billing Details  - ${patient?.name || "Unknown Patient"}`}
        subtitle="Consultation & Therapy charges"
      />

      <div className="card shadow-sm mb-4" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div className="card-body" style={{ padding: "24px" }}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <h3 className="mb-3" style={{ fontWeight: 700, fontSize: "1.75rem", color: "#1a1a1a" }}>
                {patient?.name || "Unknown Patient"}
              </h3>
              <div className="d-flex flex-wrap gap-3" style={{ fontSize: "0.875rem" }}>
                {patient?.uhid && (
                  <span className="badge bg-light text-dark p-2">
                    <strong className="text-muted me-1">UHID:</strong> {patient.uhid}
                  </span>
                )}
                {patient?.patientId && (
                  <span className="badge bg-light text-dark p-2">
                    <strong className="text-muted me-1">Patient ID:</strong> {patient.patientId}
                  </span>
                )}
                <span className="badge bg-success p-2">OUTPATIENT</span>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <div
                style={{
                  background: isFinalized
                    ? "linear-gradient(135deg, #6c757d 0%, #495057 100%)"
                    : "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
                  borderRadius: "16px",
                  padding: "24px 32px",
                  display: "inline-block",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                }}
              >
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: "8px", textTransform: "uppercase" }}>
                  {isFinalized ? (outstandingAmount === 0 ? "Total Paid" : "Amount Due") : "Total Amount"}
                </p>
                <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: 0 }}>
                  {formatCurrency(isFinalized && outstandingAmount === 0 ? totalCharges : outstandingAmount)}
                </h2>
                {isFinalized && outstandingAmount > 0 && (
                  <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>
                    Paid: {formatCurrency(amountPaid)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: "15px", mb: 4 }}>
        <DashboardCard title="Consultation" count={chargeTotals.consultation} prefix="₹" icon={LocalHospitalIcon} />
        <DashboardCard title="Therapy" count={chargeTotals.therapy} prefix="₹" icon={SpaIcon} />
      </Box>

      <div className="row">
        <div className="col-12 mb-4">
          <ChargesPanel
            title="Doctor Consultation"
            charges={charges?.consultation || []}
            category="consultation"
            isEditable={!isFinalized}
            onEdit={handleEditDoctor}
          />
        </div>
        <div className="col-12 mb-4">
          <ChargesPanel
            title="Therapy Charges"
            charges={charges?.therapy || []}
            category="therapy"
            isEditable={!isFinalized}
            onEdit={handleEditTherapist}
          />
        </div>
      </div>

      {/* Discount & Bill Summary */}
      {!isFinalized && (
        <div className="card shadow-sm mb-4" style={{ borderRadius: "12px", overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "12px 20px" }}>
            <h5 className="card-title mb-0" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Discount</h5>
          </div>
          <div className="card-body p-4">
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start", mb: 3 }}>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={discountType}
                  label="Discount Type"
                  onChange={e => { setDiscountType(e.target.value); setDiscountValue(""); }}
                >
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="fixed">Fixed Amount (₹)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={discountType === "percentage" ? "Discount %" : "Discount Amount (₹)"}
                type="number"
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                inputProps={{ min: 0, step: discountType === "percentage" ? 0.1 : 1, max: discountType === "percentage" ? 100 : undefined }}
                sx={{ minWidth: 180 }}
                placeholder={discountType === "percentage" ? "e.g. 10" : "e.g. 500"}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxWidth: 360, ml: "auto" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Gross Total</Typography>
                <Typography fontWeight={600}>{formatCurrency(grandTotal)}</Typography>
              </Box>
              {discountAmount > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="error.main">Discount ({discountType === "percentage" ? `${discountValue}%` : "Fixed"})</Typography>
                  <Typography color="error.main" fontWeight={600}>-{formatCurrency(discountAmount)}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" fontWeight={700}>Final Total</Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">{formatCurrency(totalCharges)}</Typography>
              </Box>
            </Box>
          </div>
        </div>
      )}

      {/* Edit Doctor Dialog */}
      <Dialog open={editDoctorDialog.open} onClose={() => !isUpdating && setEditDoctorDialog({ open: false, charge: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit Doctor</Typography>
          <Button onClick={() => setEditDoctorDialog({ open: false, charge: null })} disabled={isUpdating}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Consultation: <strong>{editDoctorDialog.charge?.description || "N/A"}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Amount: <strong>{formatCurrency(editDoctorDialog.charge?.amount || 0)}</strong>
            </Typography>
          </Box>
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Select Doctor</InputLabel>
            <Select
              value={selectedDoctor}
              label="Select Doctor"
              onChange={e => setSelectedDoctor(e.target.value)}
              disabled={isLoadingDoctors || isUpdating}
            >
              <MenuItem value="" disabled>{isLoadingDoctors ? "Loading..." : "Select Doctor"}</MenuItem>
              {doctors.map(d => (
                <MenuItem key={d._id} value={d._id}>
                  {d.user?.name || `${d.firstName || ""} ${d.lastName || ""}`.trim() || "Doctor"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Consultation Amount (INR)"
            type="number"
            value={consultationAmount}
            onChange={e => setConsultationAmount(e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
            disabled={isUpdating}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDoctorDialog({ open: false, charge: null })} disabled={isUpdating}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: "#8B4513" }} onClick={handleUpdateDoctor} disabled={isUpdating || !selectedDoctor || !consultationAmount}>
            {isUpdating ? "Updating..." : "Update Consultation"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Therapist Dialog */}
      <Dialog open={editTherapistDialog.open} onClose={() => !isUpdating && setEditTherapistDialog({ open: false, charge: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit Therapist</Typography>
          <Button onClick={() => setEditTherapistDialog({ open: false, charge: null })} disabled={isUpdating}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Therapy: <strong>{editTherapistDialog.charge?.therapies?.map(t => t.therapyName).join(" • ") || editTherapistDialog.charge?.therapyName || "N/A"}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Therapist: <strong>{editTherapistDialog.charge?.therapistName || "N/A"}</strong>
            </Typography>
          </Box>

          <FormControl fullWidth required>
            <InputLabel>Select Therapist</InputLabel>
            <Select
              value={selectedTherapist}
              label="Select Therapist"
              onChange={e => setSelectedTherapist(e.target.value)}
              disabled={isLoadingTherapists || isUpdating}
            >
              <MenuItem value="" disabled>{isLoadingTherapists ? "Loading..." : "Select Therapist"}</MenuItem>
              {therapists.map(t => (
                <MenuItem key={t._id} value={t.user?._id || t._id}>
                  {t.user?.name || t.name || "Therapist"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {therapyEditRows.length > 0 ? (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Per-therapy costs</Typography>
              {therapyEditRows.map((row, i) => (
                <Box key={i} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 1 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>{row.therapyName}</Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <TextField
                      label="Therapy Cost"
                      type="number"
                      size="small"
                      value={row.therapyCharge}
                      onChange={e => updateTherapyEditRow(i, "therapyCharge", e.target.value)}
                      sx={{ flex: 1 }}
                      disabled={isUpdating}
                    />
                    <TextField
                      label="Therapist Charge"
                      type="number"
                      size="small"
                      value={row.therapistCharge}
                      onChange={e => updateTherapyEditRow(i, "therapistCharge", e.target.value)}
                      sx={{ flex: 1 }}
                      disabled={isUpdating}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <>
              <TextField fullWidth label="Therapy Cost (INR)" type="number" value={therapyCost} onChange={e => setTherapyCost(e.target.value)} sx={{ mt: 2 }} disabled={isUpdating} />
              <TextField fullWidth label="Therapist Charge (INR)" type="number" value={therapistCharge} onChange={e => setTherapistCharge(e.target.value)} sx={{ mt: 2 }} disabled={isUpdating} />
            </>
          )}

          <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(255,193,7,0.08)", borderRadius: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={replaceTherapists} onChange={e => setReplaceTherapists(e.target.checked)} disabled={isUpdating} />}
              label={<strong>Replace all therapists</strong>}
            />
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(139,69,19,0.05)", borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" fontWeight={600}>Total:</Typography>
              <Typography variant="h6" color="#8B4513" fontWeight={700}>
                {therapyEditRows.length > 0
                  ? formatCurrency(therapyEditRows.reduce((s, r) => s + Number(r.therapyCharge||0) + Number(r.therapistCharge||0), 0))
                  : formatCurrency(Number(therapyCost||0) + Number(therapistCharge||0))}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditTherapistDialog({ open: false, charge: null })} disabled={isUpdating}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: "#8B4513" }} onClick={handleUpdateTherapist} disabled={isUpdating || !selectedTherapist}>
            {isUpdating ? "Updating..." : "Update Therapist"}
          </Button>
        </DialogActions>
      </Dialog>

      <div className="d-flex flex-wrap gap-3 mb-4">
        <Link to="/receptionist/outpatient" className="btn btn-outline-secondary">
          <ArrowBackIcon className="me-2" /> Back to Outpatients
        </Link>

        {!isFinalized && (
          <button
            type="button"
            className="btn btn-success"
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={isFinalizing || grandTotal <= 0}
            style={{
              backgroundColor: "#4CAF50",
              borderColor: "#4CAF50",
              color: "#FFFFFF",
              fontWeight: 600,
              padding: "10px 24px",
              borderRadius: "8px",
            }}
          >
            {isFinalizing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Finalizing...
              </>
            ) : (
              <>
                <CheckCircleIcon className="me-2" />
                Finalize Bill
              </>
            )}
          </button>
        )}
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleFinalizeBilling}
        title="Finalize Billing"
        description="Are you sure you want to finalize this outpatient billing? This action cannot be undone."
        confirmText="Finalize & Generate Invoice"
        isLoading={isFinalizing}
        type="success"
      />
    </Box>
  );
}

export default OutpatientBilling;