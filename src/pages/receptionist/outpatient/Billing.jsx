import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
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
    FormControlLabel
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
import MedicationIcon from "@mui/icons-material/Medication";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";

const ChargesPanel = ({ title, charges, category, onEdit, isEditable = true, useHeaderAction = false }) => {
    // Safety check for charges array
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

    const totalAmount = charges.reduce((sum, ch) => sum + Number(ch.amount || 0), 0);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
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
        if (normalized === "completed" || normalized === "dispensed") {
            return "badge bg-success";
        } else if (normalized === "in progress" || normalized === "ongoing") {
            return "badge bg-warning";
        } else if (normalized === "pending") {
            return "badge bg-info";
        }
        return "badge bg-secondary";
    };

    const columnCount = category === "therapy" ? 5 : category === "pharmacy" ? 9 : category === "consultation" ? 4 : 3;

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center" style={{ padding: "12px 20px" }}>
                <h5 className="card-title mb-0" style={{ fontWeight: 700, fontSize: "1.1rem" }}>{title}</h5>
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
                                ) : category === "pharmacy" ? (
                                    <>
                                        <th style={{ fontSize: "0.875rem" }}>Medicine Name</th>
                                        <th style={{ fontSize: "0.875rem" }}>Dosage</th>
                                        <th style={{ fontSize: "0.875rem" }}>Frequency</th>
                                        <th style={{ fontSize: "0.875rem" }}>Duration</th>
                                        <th style={{ fontSize: "0.875rem" }}>Food Timing</th>
                                        <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Dispensed Qty</th>
                                        <th style={{ fontSize: "0.875rem", textAlign: "right" }}>Unit Price</th>
                                    </>
                                ) : (
                                    <th style={{ fontSize: "0.875rem" }}>Description</th>
                                )}
                                {category === "consultation" && <th style={{ fontSize: "0.875rem" }}>Doctor</th>}
                                <th style={{ fontSize: "0.875rem", textAlign: "right" }}>Amount</th>
                                {!useHeaderAction && isEditable && onEdit && <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {charges.map((charge) => (
                                <tr key={charge.id}>
                                    <td style={{ fontSize: "0.875rem" }}>{formatDate(charge.date || charge.dispensedAt || charge.createdAt)}</td>
                                    {category === "therapy" ? (
                                        <>
                                            <td style={{ fontSize: "0.875rem" }}>{charge.therapyName || charge.description}</td>
                                            <td style={{ fontSize: "0.875rem" }}>{charge.therapistName || "—"}</td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "center" }}>
                                                {charge.status && (
                                                    <span className={getStatusBadgeClass(charge.status)} style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "50px" }}>
                                                        {charge.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 500 }}>
                                                {formatCurrency(charge.therapyCharge !== undefined ? charge.therapyCharge : (charge.amount || 0))}
                                            </td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 500 }}>
                                                {formatCurrency(charge.therapistCharge !== undefined ? charge.therapistCharge : 0)}
                                            </td>
                                        </>
                                    ) : category === "pharmacy" ? (
                                        <>
                                            <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                {charge.medication || "N/A"}
                                                {charge.remarks && (
                                                    <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "4px", fontStyle: "italic" }}>
                                                        <strong>Remarks:</strong> {charge.remarks}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ fontSize: "0.875rem" }}>{charge.dosage || "N/A"}</td>
                                            <td style={{ fontSize: "0.875rem" }}>{charge.frequency || "N/A"}</td>
                                            <td style={{ fontSize: "0.875rem" }}>{charge.duration || "N/A"}</td>
                                            <td style={{ fontSize: "0.875rem" }}>
                                                {charge.foodTiming ? (
                                                    <span className={`badge ${charge.foodTiming === "Before Food" ? "bg-warning" : "bg-info"}`} style={{ fontSize: "0.7rem" }}>
                                                        {charge.foodTiming}
                                                    </span>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "center" }}>{charge.dispensedQuantity !== undefined ? charge.dispensedQuantity : (charge.quantity || 0)}</td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "right" }}>{formatCurrency(charge.unitPrice || 0)}</td>
                                        </>
                                    ) : (
                                        <td style={{ fontSize: "0.875rem" }}>{charge.description || charge.medication}</td>
                                    )}
                                    {category === "consultation" && (
                                        <td style={{ fontSize: "0.875rem" }}>{charge.doctorName || "—"}</td>
                                    )}
                                    <td style={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 600 }}>
                                        {formatCurrency(charge.amount)}
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
                            ))}
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
    console.log("OutpatientBilling component rendering...");
    const { patientId } = useParams();
    console.log("Patient ID from params:", patientId);
    const [searchParams] = useSearchParams();
    const examinationId = searchParams.get("examinationId");
    console.log("Examination ID from query:", examinationId);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [billingData, setBillingData] = useState(null);
    const [error, setError] = useState(null);
    const [discountRate, setDiscountRate] = useState(0);
    const [discountType, setDiscountType] = useState("percentage");
    const [taxRate, setTaxRate] = useState(5);
    const [isFinalizing, setIsFinalizing] = useState(false);

    // Edit dialogs state
    const [editDoctorDialog, setEditDoctorDialog] = useState({ open: false, charge: null });
    const [editTherapistDialog, setEditTherapistDialog] = useState({ open: false, charge: null });
    const [doctors, setDoctors] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedTherapist, setSelectedTherapist] = useState("");
    const [therapyCost, setTherapyCost] = useState("");
    const [therapistCharge, setTherapistCharge] = useState("");
    const [replaceTherapists, setReplaceTherapists] = useState(false); // Flag to replace all therapists
    const [consultationAmount, setConsultationAmount] = useState("");
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
    const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Edit Pharmacy Dialog State
    const [editPharmacyDialog, setEditPharmacyDialog] = useState({ open: false, charge: null });
    const [pharmacyUnitPrice, setPharmacyUnitPrice] = useState("");
    const [isUpdatingPharmacy, setIsUpdatingPharmacy] = useState(false);

    // Refetch billing details
    const fetchBillingDetails = async () => {
        if (!patientId) {
            console.error("No patientId provided");
            setError("No patient ID provided");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log("Fetching outpatient billing details for patient ID:", patientId, "Examination ID:", examinationId);
            const response = await inpatientService.getOutpatientBillingSummary(patientId, { examinationId });
            console.log("Outpatient Billing API Response:", response);

            if (response && response.success && response.data) {
                const data = response.data;

                // Ensure patient exists
                if (!data.patient) {
                    console.error("Patient data missing in response:", data);
                    const errorMsg = "Patient data not found in response";
                    setError(errorMsg);
                    toast.error(errorMsg);
                    setLoading(false);
                    return;
                }

                // Ensure charges arrays exist
                const charges = {
                    consultation: Array.isArray(data.charges?.consultation) ? data.charges.consultation : [],
                    therapy: Array.isArray(data.charges?.therapy) ? data.charges.therapy : [],
                    pharmacy: Array.isArray(data.charges?.pharmacy) ? data.charges.pharmacy : [],
                };

                const billingDataWithCharges = {
                    ...data,
                    charges,
                };

                console.log("Processed outpatient billing data:", billingDataWithCharges);
                setBillingData(billingDataWithCharges);
                setError(null);

                // Set initial values from invoice if available
                if (data.invoice && data.invoice.id) {
                    setDiscountRate(data.invoice.discountValue !== undefined ? data.invoice.discountValue : (data.invoice.discountRate || 0));
                    setDiscountType(data.invoice.discountType || "percentage");
                    setTaxRate(data.invoice.taxRate || 5);
                }
            } else {
                console.error("Invalid response structure:", response);
                const errorMsg = response?.message || "Invalid response from server";
                setError(errorMsg);
                toast.error(errorMsg);
                setBillingData(null);
            }
        } catch (error) {
            console.error("Error fetching outpatient billing details:", error);
            console.error("Error response:", error.response);
            console.error("Error details:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

            // Handle 401 Unauthorized - redirect to login
            if (error.response?.status === 401) {
                const errorMsg = error.response?.data?.message || "Session expired. Please login again.";
                setError(errorMsg);
                toast.error(errorMsg);
                // Redirect to login after a short delay
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                const msg = error.response?.data?.message || error.message || "Failed to load billing details.";
                setError(msg);
                toast.error(msg);
            }
            setBillingData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patientId) {
            fetchBillingDetails();
        }
    }, [patientId]);

    const chargeTotals = useMemo(() => {
        if (!billingData?.charges) return { consultation: 0, therapy: 0, pharmacy: 0 };
        const { charges } = billingData;
        return {
            consultation: charges.consultation.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
            therapy: charges.therapy.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
            pharmacy: charges.pharmacy.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
        };
    }, [billingData]);

    const grandTotal = useMemo(() => {
        if (!billingData) return 0;
        return billingData.totals?.grandTotal ?? Object.values(chargeTotals).reduce((a, b) => a + b, 0);
    }, [billingData, chargeTotals]);

    const discountAmount = useMemo(() => {
        if (discountType === "percentage") {
            return grandTotal * (discountRate / 100);
        } else {
            return Math.min(discountRate, grandTotal);
        }
    }, [grandTotal, discountRate, discountType]);
    const discountedTotal = useMemo(() => Math.max(0, grandTotal - discountAmount), [grandTotal, discountAmount]);

    const isFinalized = useMemo(() => {
        return !!billingData?.isFinalized || !!billingData?.invoice?.id;
    }, [billingData]);

    const taxAmount = useMemo(() => {
        if (isFinalized && billingData?.invoice) {
            // If finalized, tax is already fixed in invoice
            return 0;
        }
        // GST applied only on medicines (pharmacy)
        return Number((chargeTotals.pharmacy * (taxRate / 100)).toFixed(2));
    }, [chargeTotals.pharmacy, taxRate, isFinalized, billingData]);

    const totalCharges = useMemo(() => {
        if (isFinalized && billingData?.invoice) {
            return billingData.invoice.totalPayable;
        }
        return Number((discountedTotal + taxAmount).toFixed(2));
    }, [discountedTotal, taxAmount, billingData, isFinalized]);

    const amountPaid = useMemo(() => {
        return billingData?.invoice?.amountPaid || 0;
    }, [billingData]);

    const outstandingAmount = useMemo(() => {
        if (isFinalized) {
            return Math.max(0, totalCharges - amountPaid);
        }
        return totalCharges;
    }, [isFinalized, totalCharges, amountPaid]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };

    const handleDiscountInput = (value) => {
        if (billingData?.invoice?.id) return; // Don't allow changes if finalized
        let sanitized = 0;
        if (Number.isFinite(value)) {
            if (discountType === "percentage") {
                sanitized = Math.min(Math.max(value, 0), 100);
            } else {
                sanitized = Math.max(value, 0);
            }
        }
        setDiscountRate(sanitized);
    };

    // Fetch doctors for edit dialog
    const fetchDoctors = async () => {
        setIsLoadingDoctors(true);
        try {
            const response = await doctorService.getAllDoctorProfiles({ page: 1, limit: 1000 });
            if (response && response.success) {
                setDoctors(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
            toast.error("Failed to load doctors");
        } finally {
            setIsLoadingDoctors(false);
        }
    };

    // Fetch therapists for edit dialog
    const fetchTherapists = async () => {
        setIsLoadingTherapists(true);
        try {
            const response = await therapistService.getAllTherapists({ page: 1, limit: 1000 });
            if (response && response.success) {
                setTherapists(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching therapists:", error);
            toast.error("Failed to load therapists");
        } finally {
            setIsLoadingTherapists(false);
        }
    };

    // Handle edit doctor consultation
    const handleEditDoctor = (charge) => {
        setEditDoctorDialog({ open: true, charge });
        setSelectedDoctor(charge.doctorId || "");
        setConsultationAmount((charge.amount || 0).toString());
        if (!doctors.length) {
            fetchDoctors();
        }
    };

    // Handle edit therapist
    const handleEditTherapist = (charge) => {
        setEditTherapistDialog({ open: true, charge });
        
        // Initialize therapist selection - use therapistId if available, otherwise try to extract from session
        const therapistId = charge.therapistId || charge.therapist?._id || charge.therapist || "";
        setSelectedTherapist(therapistId);

        // Initialize costs
        setTherapyCost((charge.therapyCharge || 0).toString());
        setTherapistCharge((charge.therapistCharge || 0).toString());
        
        // Reset replace mode
        setReplaceTherapists(false);

        if (!therapists.length) {
            fetchTherapists();
        }
    };

    // Update doctor consultation
    const handleUpdateDoctor = async () => {
        if (!selectedDoctor) {
            toast.error("Please select a doctor");
            return;
        }

        if (!consultationAmount || parseFloat(consultationAmount) < 0) {
            toast.error("Please enter a valid consultation amount");
            return;
        }

        if (!editDoctorDialog.charge?.id) {
            toast.error("Invalid consultation record");
            return;
        }

        setIsUpdating(true);
        try {
            // Update the examination's doctor and consultation fee using the consultation endpoint
            const response = await axios.patch(
                getApiUrl(`examinations/${editDoctorDialog.charge.id}/consultation`),
                {
                    doctorId: selectedDoctor || null,
                    price: parseFloat(consultationAmount),
                },
                { headers: getAuthHeaders() }
            );

            if (response.data && response.data.success) {
                toast.success("Consultation charge updated successfully!");
                setEditDoctorDialog({ open: false, charge: null });
                setSelectedDoctor("");
                setConsultationAmount("");

                // Refresh billing data
                await fetchBillingDetails();
            } else {
                toast.error(response.data?.message || "Failed to update consultation charge");
            }
        } catch (error) {
            console.error("Error updating consultation charge:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to update consultation charge");
        } finally {
            setIsUpdating(false);
        }
    };

    // Update therapist
    const handleUpdateTherapist = async () => {
        if (!selectedTherapist) {
            toast.error("Please select a therapist");
            return;
        }

        if (!therapyCost || parseFloat(therapyCost) < 0) {
            toast.error("Please enter a valid therapy cost");
            return;
        }

        // CRITICAL: Always use sessionId field, never use 'id' field
        // The 'id' field may contain composite IDs like "sessionId-0" for display purposes
        // Only 'sessionId' contains the actual MongoDB ObjectId
        const sessionId = editTherapistDialog.charge?.sessionId;

        // Validate ObjectId format (24 hex characters, no hyphens)
        const isValidObjectId = (id) => {
            if (!id || typeof id !== 'string') return false;
            // ObjectId format: 24 hex characters, no hyphens
            return /^[0-9a-fA-F]{24}$/.test(id) && !id.includes('-');
        };

        if (!sessionId || !isValidObjectId(sessionId)) {
            toast.error("Invalid therapy session record. Please refresh the page and try again.");
            console.error("Invalid sessionId:", sessionId, "Charge object:", editTherapistDialog.charge);
            return;
        }

        setIsUpdating(true);
        try {
            // Update the therapist session's therapist AND cost
            // Using PATCH /therapist-sessions/:id
            const response = await axios.patch(
                getApiUrl(`therapist-sessions/${sessionId}`),
                {
                    therapist: selectedTherapist,
                    cost: parseFloat(therapyCost),
                    therapistCharge: parseFloat(therapistCharge || 0),
                    replaceTherapists: replaceTherapists // Flag to replace all therapists instead of adding
                },
                { headers: getAuthHeaders() }
            );

            if (response.data && response.data.success) {
                toast.success(
                    replaceTherapists 
                        ? "Therapist replaced and cost updated successfully!" 
                        : "Therapist added and cost updated successfully!"
                );
                setEditTherapistDialog({ open: false, charge: null });
                setSelectedTherapist("");
                setTherapyCost("");
                setTherapistCharge("");
                setReplaceTherapists(false);

                // Refresh billing data
                await fetchBillingDetails();
            } else {
                toast.error(response.data?.message || "Failed to update therapist");
            }
        } catch (error) {
            console.error("Error updating therapist:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to update therapist");
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle edit pharmacy charge
    const handleEditPharmacy = (charge) => {
        setEditPharmacyDialog({ open: true, charge });
        setPharmacyUnitPrice((charge.unitPrice || 0).toString());
    };

    // Update pharmacy charge
    const handleUpdatePharmacy = async () => {
        if (!pharmacyUnitPrice || parseFloat(pharmacyUnitPrice) < 0) {
            toast.error("Please enter a valid unit price");
            return;
        }

        const charge = editPharmacyDialog.charge;
        if (!charge?.id) {
            toast.error("Invalid pharmacy record");
            return;
        }

        setIsUpdatingPharmacy(true);
        try {
            const response = await axios.patch(
                getApiUrl(`examinations/prescriptions/${charge.id}`),
                {
                    unitPrice: parseFloat(pharmacyUnitPrice),
                },
                { headers: getAuthHeaders() }
            );

            if (response.data && response.data.success) {
                toast.success("Pharmacy price updated successfully!");
                setEditPharmacyDialog({ open: false, charge: null });
                setPharmacyUnitPrice("");

                // Refresh billing data
                await fetchBillingDetails();
            } else {
                toast.error(response.data?.message || "Failed to update pharmacy price");
            }
        } catch (error) {
            console.error("Error updating pharmacy price:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to update pharmacy price");
        } finally {
            setIsUpdatingPharmacy(false);
        }
    };
    const handleFinalizeBilling = async () => {
        try {
            setIsFinalizing(true);
            const response = await inpatientService.finalizeOutpatientBilling(patientId, {
                discountType,
                discountValue: discountRate,
                discountRate,
                taxRate
            }, { examinationId });

            if (response && response.success) {
                toast.success(`Billing finalized successfully. Invoice #${response.data.invoiceNumber} generated.`);

                // Refresh billing data to show updated invoice information
                if (patientId) {
                    try {
                        const billingResponse = await inpatientService.getOutpatientBillingSummary(patientId, { examinationId });
                        if (billingResponse && billingResponse.success && billingResponse.data) {
                            const data = billingResponse.data;
                            const charges = {
                                consultation: Array.isArray(data.charges?.consultation) ? data.charges.consultation : [],
                                therapy: Array.isArray(data.charges?.therapy) ? data.charges.therapy : [],
                                pharmacy: Array.isArray(data.charges?.pharmacy) ? data.charges.pharmacy : [],
                            };
                            setBillingData({ ...data, charges });

                            if (data.invoice && data.invoice.id) {
                                setDiscountRate(data.invoice.discountValue !== undefined ? data.invoice.discountValue : (data.invoice.discountRate || 0));
                                setDiscountType(data.invoice.discountType || "percentage");
                                setTaxRate(data.invoice.taxRate || 5);
                            }
                        }
                    } catch (refreshError) {
                        console.error("Error refreshing billing data:", refreshError);
                    }
                }

                // Navigate to payments page after a short delay
                setTimeout(() => {
                    navigate("/receptionist/payments");
                }, 2000);
            }
        } catch (error) {
            console.error("Finalize billing error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to finalize billing.";
            toast.error(errorMessage);
        } finally {
            setIsFinalizing(false);
            setIsConfirmModalOpen(false);
        }
    };

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Outpatients", url: "/receptionist/outpatient" },
        { label: "Outpatient Billing" },
    ];

    console.log("Component state:", { loading, error, hasBillingData: !!billingData, patientId });

    if (loading) {
        console.log("Rendering loading state");
        return (
            <Box sx={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <Breadcrumb items={breadcrumbItems} />
                <div className="spinner-border text-primary" role="status" style={{ marginLeft: "20px" }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Box>
        );
    }

    if (error || !billingData) {
        console.log("Rendering error state:", error);
        return (
            <Box sx={{ padding: "20px" }}>
                <Breadcrumb items={breadcrumbItems} />
                <div className="alert alert-danger">
                    <strong>Error:</strong> {error || "Failed to load billing data."}
                    {patientId && <div className="mt-2">Patient ID: {patientId}</div>}
                    <div className="mt-2">
                        <button className="btn btn-primary btn-sm" onClick={fetchBillingDetails}>
                            Retry
                        </button>
                    </div>
                </div>
            </Box>
        );
    }

    const { patient, charges } = billingData || {};
    // Removed duplicate isFinalized declaration

    console.log("Patient data:", patient);
    console.log("Charges:", charges);

    // Safety check for patient data
    if (!patient || !patient.name) {
        console.log("Patient data missing, rendering warning");
        return (
            <Box sx={{ padding: "20px" }}>
                <Breadcrumb items={breadcrumbItems} />
                <div className="alert alert-warning">
                    Patient data not available. Please check the patient ID and try again.
                    {patientId && <div className="mt-2">Patient ID: {patientId}</div>}
                </div>
            </Box>
        );
    }

    console.log("Rendering main content");
    return (
        <Box sx={{ padding: "20px" }}>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Page Heading */}
            <HeadingCardingCard
                category="OUTPATIENT BILLING"
                title={`Billing Details - ${patient?.name || "Unknown Patient"}`}
                subtitle="View and manage all outpatient charges for this patient."
            />

            {/* ⭐ Patient Info Card */}
            <div className="card shadow-sm mb-4" style={{ border: "none", borderRadius: "12px", overflow: "hidden" }}>
                <div className="card-body" style={{ padding: "24px" }}>
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h3 className="mb-3" style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1a1a1a" }}>
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
                                <span className="badge bg-success p-2">
                                    OUTPATIENT
                                </span>
                            </div>
                        </div>
                        <div className="col-md-4 text-md-end">
                            <div
                                style={{
                                    background: isFinalized ? "linear-gradient(135deg, #6c757d 0%, #495057 100%)" : "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
                                    borderRadius: "16px",
                                    padding: "24px 32px",
                                    display: "inline-block",
                                    boxShadow: "0 8px 24px rgba(0,0,0, 0.25)",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    minWidth: "220px",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <div style={{ position: "relative", zIndex: 1 }}>
                                    <p
                                        style={{
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "rgba(255, 255, 255, 0.9)",
                                            marginBottom: "8px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        {isFinalized ? (outstandingAmount === 0 ? "Total Paid (Finalized)" : "Amount Due") : "Total Outstanding"}
                                    </p>
                                    <h2
                                        style={{
                                            fontSize: "2rem",
                                            fontWeight: 700,
                                            color: "#FFFFFF",
                                            marginBottom: 0,
                                            lineHeight: "1.2",
                                        }}
                                    >
                                        {formatCurrency(isFinalized ? (outstandingAmount === 0 ? totalCharges : outstandingAmount) : totalCharges)}
                                    </h2>
                                    {isFinalized && outstandingAmount > 0 && (
                                        <p style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.8)", marginTop: "4px" }}>
                                            Paid: {formatCurrency(amountPaid)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ⭐ Summary Cards */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                    },
                    gap: "15px",
                    marginBottom: 3,
                }}
            >
                <DashboardCard title="Consultation" count={chargeTotals.consultation} prefix="₹" icon={LocalHospitalIcon} />
                <DashboardCard title="Therapy" count={chargeTotals.therapy} prefix="₹" icon={SpaIcon} />
                <DashboardCard title="Pharmacy" count={chargeTotals.pharmacy} prefix="₹" icon={MedicationIcon} />
            </Box>

            {/* ⭐ Adjustments Panel */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h5 className="mb-1">Adjustments</h5>
                            <p className="text-muted small mb-0">
                                {isFinalized ? "Final adjustments applied at billing finalization." : "Apply discount before finalizing bill."}
                            </p>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex flex-wrap align-items-center gap-3">
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Discount Type</InputLabel>
                                    <Select
                                        value={discountType}
                                        label="Discount Type"
                                        onChange={(e) => {
                                            if (billingData?.invoice?.id) return;
                                            setDiscountType(e.target.value);
                                            setDiscountRate(0);
                                        }}
                                        disabled={!!isFinalized}
                                    >
                                        <MenuItem value="percentage">Percentage (%)</MenuItem>
                                        <MenuItem value="fixed">Fixed Amount (₹)</MenuItem>
                                    </Select>
                                </FormControl>

                                <div className="d-flex align-items-center">
                                    <TextField
                                        label={discountType === "percentage" ? "Discount (%)" : "Discount (₹)"}
                                        type="number"
                                        size="small"
                                        inputProps={{
                                            min: 0,
                                            max: discountType === "percentage" ? 100 : undefined,
                                            step: discountType === "percentage" ? 0.5 : 1,
                                        }}
                                        sx={{ width: 120 }}
                                        value={discountRate}
                                        onChange={(e) => handleDiscountInput(parseFloat(e.target.value))}
                                        disabled={!!isFinalized}
                                    />
                                </div>
                                <div className="d-flex align-items-center ms-3">
                                    <TextField
                                        label="GST (%) on Meds"
                                        type="number"
                                        size="small"
                                        inputProps={{
                                            min: 0,
                                            max: 100,
                                            step: 0.5,
                                        }}
                                        sx={{ width: 140 }}
                                        value={taxRate}
                                        onChange={(e) => {
                                            if (billingData?.invoice?.id) return;
                                            const val = parseFloat(e.target.value);
                                            setTaxRate(Number.isFinite(val) && val >= 0 ? val : 0);
                                        }}
                                        disabled={!!isFinalized}
                                    />
                                    <span className="ms-2 text-muted fw-bold" style={{ fontSize: "0.875rem", minWidth: "80px" }}>
                                        {formatCurrency(taxAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ⭐ Charges Panels - All Vertical */}
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
                <div className="col-12 mb-4">
                    <ChargesPanel
                        title="Pharmacy Charges"
                        charges={charges?.pharmacy || []}
                        category="pharmacy"
                        isEditable={!isFinalized}
                        onEdit={handleEditPharmacy}
                    />
                </div>
            </div>

            {/* Edit Doctor Dialog */}
            <Dialog
                open={editDoctorDialog.open}
                onClose={() => !isUpdating && setEditDoctorDialog({ open: false, charge: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Edit Doctor
                    </Typography>
                    <Button
                        onClick={() => setEditDoctorDialog({ open: false, charge: null })}
                        disabled={isUpdating}
                        sx={{ minWidth: "auto", p: 0.5 }}
                    >
                        <CloseIcon />
                    </Button>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Consultation: <strong>{editDoctorDialog.charge?.description || "N/A"}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Current Doctor: <strong>{editDoctorDialog.charge?.doctorName || "N/A"}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Current Amount: <strong>{formatCurrency(editDoctorDialog.charge?.amount || 0)}</strong>
                        </Typography>
                    </Box>
                    <FormControl fullWidth required sx={{ mb: 2 }}>
                        <InputLabel id="doctor-select-label">Select Doctor</InputLabel>
                        <Select
                            labelId="doctor-select-label"
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            label="Select Doctor"
                            disabled={isLoadingDoctors || isUpdating}
                        >
                            <MenuItem value="" disabled>
                                {isLoadingDoctors ? "Loading doctors..." : "Select Doctor"}
                            </MenuItem>
                            {doctors.map((doctor) => {
                                const doctorName = doctor.user?.name ||
                                    `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() ||
                                    "Doctor";
                                const displayName = doctor.specialization
                                    ? `${doctorName} - ${doctor.specialization}`
                                    : doctorName;
                                return (
                                    <MenuItem key={doctor._id || doctor.id} value={doctor._id || doctor.id}>
                                        {displayName}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Consultation Amount (INR) *"
                        type="number"
                        value={consultationAmount}
                        onChange={(e) => setConsultationAmount(e.target.value)}
                        variant="outlined"
                        inputProps={{ min: 0, step: 0.01 }}
                        required
                        disabled={isUpdating}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setEditDoctorDialog({ open: false, charge: null })}
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateDoctor}
                        disabled={!selectedDoctor || !consultationAmount || isUpdating}
                        sx={{ backgroundColor: "#8B4513" }}
                        startIcon={isUpdating ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
                    >
                        {isUpdating ? "Updating..." : "Update Consultation"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Therapist Dialog */}
            <Dialog
                open={editTherapistDialog.open}
                onClose={() => !isUpdating && setEditTherapistDialog({ open: false, charge: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Edit Therapist
                    </Typography>
                    <Button
                        onClick={() => setEditTherapistDialog({ open: false, charge: null })}
                        disabled={isUpdating}
                        sx={{ minWidth: "auto", p: 0.5 }}
                    >
                        <CloseIcon />
                    </Button>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Therapy: <strong>{editTherapistDialog.charge?.therapyName || "N/A"}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Current Therapist: <strong>{editTherapistDialog.charge?.therapistName || "N/A"}</strong>
                        </Typography>
                    </Box>
                    <FormControl fullWidth required>
                        <InputLabel id="therapist-select-label">Select Therapist</InputLabel>
                        <Select
                            labelId="therapist-select-label"
                            value={selectedTherapist}
                            onChange={(e) => setSelectedTherapist(e.target.value)}
                            label="Select Therapist"
                            disabled={isLoadingTherapists || isUpdating}
                        >
                            <MenuItem value="" disabled>
                                {isLoadingTherapists ? "Loading therapists..." : "Select Therapist"}
                            </MenuItem>
                            {therapists.map((therapist) => {
                                const therapistName = therapist.user?.name || therapist.name || "Therapist";
                                const displayName = therapist.speciality
                                    ? `${therapistName} - ${therapist.speciality}`
                                    : therapistName;
                                // Get user ID for therapist (needed for assignment)
                                const therapistUserId = therapist.user?._id || therapist.user || therapist._id;
                                return (
                                    <MenuItem key={therapist._id || therapist.id} value={therapistUserId}>
                                        {displayName}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Therapy Cost (INR)"
                        type="number"
                        value={therapyCost}
                        onChange={(e) => setTherapyCost(e.target.value)}
                        variant="outlined"
                        inputProps={{ min: 0, step: 1 }}
                        disabled={isUpdating}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Therapist Charge (INR)"
                        type="number"
                        value={therapistCharge}
                        onChange={(e) => setTherapistCharge(e.target.value)}
                        variant="outlined"
                        inputProps={{ min: 0, step: 1 }}
                        disabled={isUpdating}
                        sx={{ mt: 2 }}
                    />
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={replaceTherapists}
                                    onChange={(e) => setReplaceTherapists(e.target.checked)}
                                    disabled={isUpdating}
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    <strong>Replace all therapists</strong> (instead of adding to existing list)
                                </Typography>
                            }
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, ml: 4 }}>
                            {replaceTherapists 
                                ? "All existing therapists will be removed and replaced with the selected therapist."
                                : "The selected therapist will be added to the existing therapists list."}
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(212, 165, 116, 0.1)', borderRadius: '8px', border: '1px solid rgba(212, 165, 116, 0.2)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Total Therapy Cost:</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B4513' }}>
                                {formatCurrency(parseFloat(therapyCost || 0) + parseFloat(therapistCharge || 0))}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setEditTherapistDialog({ open: false, charge: null })}
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateTherapist}
                        disabled={!selectedTherapist || isUpdating}
                        sx={{ backgroundColor: "#8B4513" }}
                        startIcon={isUpdating ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
                    >
                        {isUpdating ? "Updating..." : "Update Therapist"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Pharmacy Dialog */}
            <Dialog
                open={editPharmacyDialog.open}
                onClose={() => !isUpdatingPharmacy && setEditPharmacyDialog({ open: false, charge: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Edit Pharmacy Price
                    </Typography>
                    <Button
                        onClick={() => setEditPharmacyDialog({ open: false, charge: null })}
                        disabled={isUpdatingPharmacy}
                        sx={{ minWidth: "auto", p: 0.5 }}
                    >
                        <CloseIcon />
                    </Button>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Medicine: <strong>{editPharmacyDialog.charge?.description || editPharmacyDialog.charge?.medication || "N/A"}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Quantity: <strong>{editPharmacyDialog.charge?.dispensedQuantity || editPharmacyDialog.charge?.quantity || 1}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Current Amount: <strong>{formatCurrency(editPharmacyDialog.charge?.amount || 0)}</strong>
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        label="Unit Price (INR) *"
                        type="number"
                        value={pharmacyUnitPrice}
                        onChange={(e) => setPharmacyUnitPrice(e.target.value)}
                        variant="outlined"
                        inputProps={{ min: 0, step: 0.01 }}
                        required
                        disabled={isUpdatingPharmacy}
                        helperText="This will override the default price of the medicine for this billing."
                    />
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(212, 165, 116, 0.1)', borderRadius: '8px', border: '1px solid rgba(212, 165, 116, 0.2)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Total Pharmacy Cost:</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B4513' }}>
                                {formatCurrency(parseFloat(pharmacyUnitPrice || 0) * (editPharmacyDialog.charge?.dispensedQuantity || editPharmacyDialog.charge?.quantity || 1))}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setEditPharmacyDialog({ open: false, charge: null })}
                        disabled={isUpdatingPharmacy}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdatePharmacy}
                        disabled={!pharmacyUnitPrice || isUpdatingPharmacy}
                        sx={{ backgroundColor: "#8B4513" }}
                        startIcon={isUpdatingPharmacy ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
                    >
                        {isUpdatingPharmacy ? "Updating..." : "Update Price"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ⭐ Action Buttons */}
            <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/receptionist/outpatient" className="btn btn-outline-secondary">
                    <ArrowBackIcon className="me-2" />
                    Back to Outpatients
                </Link>
                {!isFinalized && (
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => setIsConfirmModalOpen(true)}
                        disabled={isFinalizing || !patientId || grandTotal === 0}
                        style={{
                            backgroundColor: "#4CAF50",
                            borderColor: "#4CAF50",
                            color: "#FFFFFF",
                            fontWeight: 600,
                            padding: "10px 24px",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                        }}
                    >
                        {isFinalizing ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
                description="Are you sure you want to finalize the outpatient billing? This will generate the final invoice and cannot be undone."
                confirmText="Finalize & Generate Bill"
                isLoading={isFinalizing}
                type="success"
            />

        </Box >
    );
}

export default OutpatientBilling;

