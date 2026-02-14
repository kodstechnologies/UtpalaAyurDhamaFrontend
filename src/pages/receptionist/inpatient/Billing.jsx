import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Box,
    SvgIcon,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    CircularProgress,
    Typography,
    Divider,
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

// Icons
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SpaIcon from "@mui/icons-material/Spa";
import MedicationIcon from "@mui/icons-material/Medication";
import LocalHotelIcon from "@mui/icons-material/LocalHotel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

// Custom Rupee Icon Component - styled to match other Material-UI icons
const RupeeIcon = (props) => {
    const { sx, ...other } = props;
    return (
        <Box
            component="span"
            sx={{
                fontSize: sx?.fontSize || 20,
                color: sx?.color || 'inherit',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                ...sx,
            }}
            {...other}
        >
            ₹
        </Box>
    );
};

const ChargesPanel = ({ title, charges, category, onEdit, isEditable = true, useHeaderAction = false }) => {
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

    const columnCount = category === "therapy" ? 6 : category === "pharmacy" ? 9 : category === "consultation" ? 4 : category === "ward" ? 3 : 3;

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center" style={{ padding: "12px 20px" }}>
                <h5 className="card-title mb-0" style={{ fontWeight: 700, fontSize: "1.1rem" }}>{title}</h5>
                <div className="d-flex align-items-center gap-2">
                    {category === "ward" && charges.length > 0 && (
                        <span className="badge bg-primary" style={{ fontSize: "0.875rem", padding: "6px 12px" }}>
                            Total: {formatCurrency(totalAmount)}
                        </span>
                    )}
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
                                ) : category === "ward" ? (
                                    <>
                                        <th style={{ fontSize: "0.875rem" }}>Ward Category</th>
                                        <th style={{ fontSize: "0.875rem" }}>Description</th>
                                    </>
                                ) : category === "food" ? (
                                    <th style={{ fontSize: "0.875rem" }}>Description</th>
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
                                                {charge.status ? (
                                                    <span className={getStatusBadgeClass(charge.status)} style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "50px" }}>
                                                        {charge.status}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: "#888" }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 500 }}>
                                                {formatCurrency(charge.therapyCharge ?? 0)}
                                            </td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 500 }}>
                                                {formatCurrency(charge.therapistCharge ?? 0)}
                                            </td>
                                        </>
                                    ) : category === "pharmacy" ? (
                                        <>
                                            <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                {charge.medication || "N/A"}
                                                {charge.type && (
                                                    <span className={`badge ${charge.type === "inpatient" ? "bg-info" : "bg-success"} ms-2`} style={{ fontSize: "0.65rem" }}>
                                                        {charge.type === "inpatient" ? "IPD" : "OPD"}
                                                    </span>
                                                )}
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
                                    ) : category === "ward" ? (
                                        <>
                                            <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                {charge.wardCategory || "N/A"}
                                            </td>
                                            <td style={{ fontSize: "0.875rem" }}>
                                                {charge.description || "Ward Charge"}
                                            </td>
                                        </>
                                    ) : category === "food" ? (
                                        <td style={{ fontSize: "0.875rem" }}>
                                            {charge.description || "Food Charge"}
                                        </td>
                                    ) : (
                                        <td style={{ fontSize: "0.875rem" }}>
                                            {charge.description || charge.medication}
                                            {charge.type && (
                                                <span className={`badge ${charge.type === "inpatient" ? "bg-info" : "bg-success"} ms-2`} style={{ fontSize: "0.65rem" }}>
                                                    {charge.type === "inpatient" ? "IPD" : "OPD"}
                                                </span>
                                            )}
                                        </td>
                                    )}
                                    {category === "consultation" && (
                                        <td style={{ fontSize: "0.875rem" }}>
                                            {charge.doctorName || "—"}
                                            {charge.type && (
                                                <span className={`badge ${charge.type === "inpatient" ? "bg-info" : "bg-success"} ms-2`} style={{ fontSize: "0.65rem" }}>
                                                    {charge.type === "inpatient" ? "IPD" : "OPD"}
                                                </span>
                                            )}
                                        </td>
                                    )}
                                    <td style={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 600 }}>
                                        {formatCurrency(category === "therapy" ? (
                                            charge.amount ||
                                            ((charge.therapyCharge !== undefined ? charge.therapyCharge : charge.amount || 0) +
                                                (charge.therapistCharge !== undefined ? charge.therapistCharge : 0))
                                        ) : charge.amount)}
                                    </td>
                                    {!useHeaderAction && isEditable && onEdit && (
                                        <td style={{ fontSize: "0.875rem", textAlign: "center" }}>
                                            <button
                                                type="button"
                                                className="btn btn-sm"
                                                onClick={() => onEdit(charge)}
                                                style={{
                                                    backgroundColor: "#D4A574",
                                                    borderColor: "#D4A574",
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
                            {charges.length > 0 && category === "therapy" && (
                                <tr style={{ backgroundColor: "#f8f9fa", fontWeight: 600, borderTop: "2px solid #dee2e6" }}>
                                    <td colSpan={6} style={{ fontSize: "0.9rem", textAlign: "right", padding: "12px", fontWeight: 700 }}>
                                        Total:
                                    </td>
                                    <td style={{ fontSize: "0.9rem", textAlign: "right", padding: "12px", fontWeight: 700 }}>
                                        {formatCurrency(charges.reduce((sum, ch) => sum + Number(ch.therapyCharge || 0), 0))}
                                    </td>
                                    <td style={{ fontSize: "0.9rem", textAlign: "right", padding: "12px", fontWeight: 700 }}>
                                        {formatCurrency(charges.reduce((sum, ch) => sum + Number(ch.therapistCharge || 0), 0))}
                                    </td>
                                    <td style={{ fontSize: "0.9rem", textAlign: "right", padding: "12px", fontWeight: 700, color: "#4CAF50" }}>
                                        {formatCurrency(charges.reduce((sum, ch) => {
                                            const therapyCharge = Number(ch.therapyCharge || 0);
                                            const therapistCharge = Number(ch.therapistCharge || 0);
                                            const total = Number(ch.amount || 0) > 0 ? Number(ch.amount) : (therapyCharge + therapistCharge);
                                            return sum + total;
                                        }, 0))}
                                    </td>
                                </tr>
                            )}
                            {charges.length > 0 && category === "ward" && (
                                <tr style={{ backgroundColor: "#f8f9fa", fontWeight: 600, borderTop: "2px solid #dee2e6" }}>
                                    <td colSpan={3} style={{ fontSize: "0.9rem", textAlign: "right", padding: "12px", fontWeight: 700 }}>
                                        Total:
                                    </td>
                                    <td style={{ fontSize: "0.9rem", textAlign: "right", padding: "12px", fontWeight: 700, color: "#4CAF50" }}>
                                        {formatCurrency(charges.reduce((sum, ch) => sum + Number(ch.amount || ch.dailyRate || 0), 0))}
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

function InpatientBilling() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [billingData, setBillingData] = useState(null);
    const [discountRate, setDiscountRate] = useState(0);
    const [discountType, setDiscountType] = useState("percentage");
    const [taxRate, setTaxRate] = useState(5);
    const [isDischarging, setIsDischarging] = useState(false);
    const [patientId, setPatientId] = useState(null);

    // Edit consultation dialog state
    const [editConsultationDialog, setEditConsultationDialog] = useState({ open: false, charge: null });
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [consultationAmount, setConsultationAmount] = useState("");
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
    const [isUpdatingConsultation, setIsUpdatingConsultation] = useState(false);
    const [inpatientId, setInpatientId] = useState(null);
    const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);

    // Edit Therapist Dialog State
    const [editTherapistDialog, setEditTherapistDialog] = useState({ open: false, charge: null });
    const [therapists, setTherapists] = useState([]);
    const [selectedTherapist, setSelectedTherapist] = useState("");
    const [therapyCost, setTherapyCost] = useState("");
    const [therapistCharge, setTherapistCharge] = useState("");
    const [replaceTherapists, setReplaceTherapists] = useState(false); // Flag to replace all therapists
    const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);
    const [isUpdatingTherapist, setIsUpdatingTherapist] = useState(false);

    // Edit Pharmacy Dialog State
    const [editPharmacyDialog, setEditPharmacyDialog] = useState({ open: false, charge: null });
    const [pharmacyUnitPrice, setPharmacyUnitPrice] = useState("");
    const [isUpdatingPharmacy, setIsUpdatingPharmacy] = useState(false);

    // First, get patient ID from inpatient if id is an inpatient ID
    useEffect(() => {
        const fetchPatientId = async () => {
            if (id) {
                try {
                    const response = await inpatientService.getInpatientById(id);
                    if (response && response.success && response.data) {
                        const inpatient = response.data;
                        const pid = inpatient.patient?._id || inpatient.patient;
                        setPatientId(pid);
                        setInpatientId(id); // Store inpatient ID for consultation updates
                    } else {
                        // If not an inpatient ID, assume it's a patient ID
                        setPatientId(id);
                    }
                } catch (error) {
                    // If error, assume id is a patient ID
                    setPatientId(id);
                }
            }
        };
        fetchPatientId();
    }, [id]);

    const fetchBillingDetails = async () => {
        if (!patientId) return;

        try {
            setLoading(true);
            console.log("Fetching unified billing details for patient ID:", patientId);
            const response = await inpatientService.getUnifiedBillingSummary(patientId);
            console.log("Billing API Response:", response);

            if (response && response.success && response.data) {
                const data = response.data;

                // Ensure charges arrays exist
                const charges = {
                    food: Array.isArray(data.charges?.food) ? data.charges.food : [],
                    consultation: Array.isArray(data.charges?.consultation) ? data.charges.consultation : [],
                    therapy: Array.isArray(data.charges?.therapy) ? data.charges.therapy : [],
                    pharmacy: Array.isArray(data.charges?.pharmacy) ? data.charges.pharmacy : [],
                    ward: Array.isArray(data.charges?.ward) ? data.charges.ward : [],
                };

                const billingDataWithCharges = {
                    ...data,
                    charges,
                };

                console.log("Processed billing data:", billingDataWithCharges);
                setBillingData(billingDataWithCharges);

                // Set initial values from invoice if available
                if (data.invoice && data.invoice.id) {
                    setDiscountRate(data.invoice.discountValue !== undefined ? data.invoice.discountValue : (data.invoice.discountRate || 0));
                    setDiscountType(data.invoice.discountType || "percentage");
                    setTaxRate(data.invoice.taxRate || 5);
                }
            } else {
                console.error("Invalid response structure:", response);
                toast.error("Invalid response from server");
            }
        } catch (error) {
            console.error("Error fetching billing details:", error);
            const msg = error.response?.data?.message || error.message || "Failed to load billing details.";
            toast.error(msg);
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
        if (!billingData?.charges) return { food: 0, consultation: 0, therapy: 0, pharmacy: 0, ward: 0 };
        const { charges } = billingData;
        return {
            food: charges.food.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
            consultation: charges.consultation.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
            therapy: charges.therapy.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
            pharmacy: charges.pharmacy.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
            ward: charges.ward.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
        };
    }, [billingData]);

    const grandTotal = useMemo(() => {
        if (!billingData) return 0;
        // Prefer backend calculation if available, otherwise sum frontend
        return billingData.totals?.grandTotal || Object.values(chargeTotals).reduce((a, b) => a + b, 0);
    }, [billingData, chargeTotals]);

    const discountAmount = useMemo(() => {
        if (discountType === "percentage") {
            return grandTotal * (discountRate / 100);
        } else {
            return Math.min(discountRate, grandTotal);
        }
    }, [grandTotal, discountRate, discountType]);

    const discountedTotal = useMemo(() => Math.max(0, grandTotal - discountAmount), [grandTotal, discountAmount]);
    const taxAmount = useMemo(() => {
        const isDischarged = billingData?.admission?.status === "Discharged";
        if (isDischarged && billingData?.invoice) {
            // If discharged, tax is already fixed in invoice or we recalculate based on stored rate
            // But usually we just display what's there. 
            // To allow consistent display, we calculate based on current total and rate
            // UNLESS the invoice amount is fixed.
            return 0; // Tax is usually included or calculated at the end
        }
        // GST applied only on medicines (pharmacy)
        return Number((chargeTotals.pharmacy * (taxRate / 100)).toFixed(2));
    }, [chargeTotals.pharmacy, taxRate, billingData]);

    const hasInvoice = useMemo(() => {
        return !!billingData?.invoice?.id;
    }, [billingData]);

    const totalCharges = useMemo(() => {
        // If bill is finalized (has invoice), use invoice totalPayable
        if (hasInvoice && billingData?.invoice) {
            return billingData.invoice.totalPayable;
        }
        // Otherwise calculate from charges
        return Number((discountedTotal + taxAmount).toFixed(2));
    }, [grandTotal, discountedTotal, taxAmount, billingData, hasInvoice]);

    const amountPaid = useMemo(() => {
        return billingData?.invoice?.amountPaid || 0;
    }, [billingData]);

    const outstandingAmount = useMemo(() => {
        // If bill is finalized (has invoice), calculate outstanding = totalPayable - amountPaid
        if (hasInvoice) {
            return Math.max(0, totalCharges - amountPaid);
        }
        // If not finalized, outstanding is the same as total charges
        return totalCharges;
    }, [totalCharges, amountPaid, hasInvoice]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };

    const handleDiscountInput = (value) => {
        if (billingData?.admission?.status === "Discharged") return;
        let sanitized = 0;
        if (Number.isFinite(value)) {
            if (discountType === "percentage") {
                sanitized = Math.min(Math.max(value, 0), 100);
            } else {
                // Fixed amount
                sanitized = Math.max(value, 0); // Allow valid positive number, clamp to total at calculation/submit time
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

    // Handle edit therapist
    const handleEditTherapist = (charge) => {
        setEditTherapistDialog({ open: true, charge });
        setSelectedTherapist(charge.therapistId || "");
        // Initialize costs
        setTherapyCost((charge.therapyCharge || 0).toString());
        setTherapistCharge((charge.therapistCharge || 0).toString());
        // Reset replace mode
        setReplaceTherapists(false);

        if (!therapists.length) {
            fetchTherapists();
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

        // Get sessionId from charge
        const sessionId = editTherapistDialog.charge?.sessionId || editTherapistDialog.charge?.id;

        if (!sessionId) {
            toast.error("Invalid therapy session record");
            return;
        }

        setIsUpdatingTherapist(true);
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
                if (patientId) {
                    await fetchBillingDetails();
                }
            } else {
                toast.error(response.data?.message || "Failed to update therapist");
            }
        } catch (error) {
            console.error("Error updating therapist:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to update therapist");
        } finally {
            setIsUpdatingTherapist(false);
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
                if (patientId) {
                    await fetchBillingDetails();
                }
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

    // Handle edit consultation charge
    const handleEditConsultation = (charge) => {
        setEditConsultationDialog({ open: true, charge });
        setSelectedDoctor(charge.doctorId || "");
        setConsultationAmount((charge.amount || 0).toString());
        if (!doctors.length) {
            fetchDoctors();
        }
    };

    // Update consultation charge
    const handleUpdateConsultation = async () => {
        if (!consultationAmount || parseFloat(consultationAmount) < 0) {
            toast.error("Please enter a valid consultation amount");
            return;
        }

        const charge = editConsultationDialog.charge;
        if (!charge?.id || !inpatientId) {
            toast.error("Invalid consultation record");
            return;
        }

        setIsUpdatingConsultation(true);
        try {
            let apiUrl;
            if (charge.type === "outpatient") {
                // For outpatient consultations appearing in unified view
                apiUrl = getApiUrl(`examinations/${charge.id}/consultation`);
            } else {
                // For inpatient daily checkups
                const checkupId = charge.id.includes("-") ? charge.id.split("-")[1] : charge.id;
                apiUrl = getApiUrl(`inpatients/${inpatientId}/checkups/${checkupId}/consultation`);
            }

            const response = await axios.patch(
                apiUrl,
                {
                    doctorId: selectedDoctor || null,
                    price: parseFloat(consultationAmount),
                },
                { headers: getAuthHeaders() }
            );

            if (response.data && response.data.success) {
                toast.success("Consultation charge updated successfully!");
                setEditConsultationDialog({ open: false, charge: null });
                setSelectedDoctor("");
                setConsultationAmount("");

                // Refresh billing data
                if (patientId) {
                    await fetchBillingDetails();
                }
            } else {
                toast.error(response.data?.message || "Failed to update consultation charge");
            }
        } catch (error) {
            console.error("Error updating consultation charge:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to update consultation charge");
        } finally {
            setIsUpdatingConsultation(false);
        }
    };

    const handleEditCharge = (charge) => {
        // For consultation charges, use the dialog
        if (charge.category === "consultation" || charge.type === "consultation") {
            handleEditConsultation(charge);
            return;
        }

        // For therapy charges, use the new dialog
        if (charge.category === "therapy" || charge.type === "therapy") {
            handleEditTherapist(charge);
            return;
        }

        // For pharmacy charges, use the new dialog
        if (charge.category === "pharmacy" || charge.type === "pharmacy") {
            handleEditPharmacy(charge);
            return;
        }

        // For other charges, navigate to edit page
        const params = new URLSearchParams({
            chargeId: charge.id || "",
            chargeName: charge.description || charge.medication || "",
            amount: (charge.amount || "").toString(),
        });
        navigate(`/receptionist/inpatient-billing/edit-charge?${params.toString()}`);
    };

    const handleFinalizeDischarge = () => {
        setFinalizeDialogOpen(true);
    };

    const handleConfirmFinalize = async () => {
        setFinalizeDialogOpen(false);
        try {
            setIsDischarging(true);
            const response = await inpatientService.finalizeDischarge(id, {
                discountType,
                discountValue: discountRate, // State is named "discountRate" but holds the value
                discountRate, // Kept for backend backward compatibility if needed, though backend should prioritize type/value
                taxRate
            });

            if (response && response.success) {
                toast.success(`Discharge completed. Invoice #${response.data.invoiceNumber} generated.`);

                // Refresh billing data to show updated invoice information
                if (patientId) {
                    await fetchBillingDetails();
                }

                // Navigate to payments page after a short delay
                setTimeout(() => {
                    navigate("/receptionist/payments");
                }, 2000);
            }
        } catch (error) {
            console.error("Discharge error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to finalize discharge.";
            toast.error(errorMessage);
        } finally {
            setIsDischarging(false);
        }
    };

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Inpatients", url: "/receptionist/inpatient" },
        { label: "Patient Billing" },
    ];

    if (loading) {
        return (
            <Box sx={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Box>
        );
    }

    if (!billingData) {
        return (
            <Box sx={{ padding: "20px" }}>
                <div className="alert alert-danger">Failed to load billing data.</div>
            </Box>
        );
    }

    const { patient, admission, charges, doctor, hasInpatient, hasOutpatient } = billingData;
    const isDischarged = admission?.status === "Discharged" || admission?.status === "readyToDischarged";

    return (
        <Box sx={{ padding: "20px" }}>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Page Heading */}
            <HeadingCardingCard
                category="INPATIENT BILLING"
                title={`Billing Details - ${patient.name}`}
                subtitle={hasInpatient && hasOutpatient
                    ? "View and manage all charges for this patient (Inpatient & Outpatient)."
                    : hasInpatient
                        ? "View and manage all charges for this inpatient."
                        : "View and manage all charges for this outpatient."
                }
            />

            {/* ⭐ Patient Info Card */}
            <div className="card shadow-sm mb-4" style={{ border: "none", borderRadius: "12px", overflow: "hidden" }}>
                <div className="card-body" style={{ padding: "24px" }}>
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h3 className="mb-3" style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1a1a1a" }}>
                                {patient.name}
                            </h3>
                            <div className="d-flex flex-wrap gap-3" style={{ fontSize: "0.875rem" }}>
                                <span className="badge bg-light text-dark p-2">
                                    <strong className="text-muted me-1">Ward:</strong> {admission.wardCategory || 'N/A'}
                                </span>
                                {admission.roomNumber && (
                                    <span className="badge bg-light text-dark p-2">
                                        <strong className="text-muted me-1">Room:</strong> {admission.roomNumber}
                                    </span>
                                )}
                                {admission.bedNumber && (
                                    <span className="badge bg-light text-dark p-2">
                                        <strong className="text-muted me-1">Bed:</strong> {admission.bedNumber}
                                    </span>
                                )}
                                {doctor && (
                                    <span className="badge bg-light text-dark p-2">
                                        <strong className="text-muted me-1">Doctor:</strong> {doctor.name || 'N/A'}
                                    </span>
                                )}
                                {patient.uhid && (
                                    <span className="badge bg-light text-dark p-2">
                                        <strong className="text-muted me-1">UHID:</strong> {patient.uhid}
                                    </span>
                                )}
                                <span className="badge bg-light text-dark p-2">
                                    <strong className="text-muted me-1">Admitted:</strong> {new Date(admission.admissionDate).toLocaleDateString()}
                                </span>
                                <span className={`badge ${isDischarged ? 'bg-secondary' : 'bg-success'} p-2`}>
                                    {admission.status}
                                </span>
                            </div>
                        </div>
                        <div className="col-md-4 text-md-end">
                            <div
                                style={{
                                    background: isDischarged ? "linear-gradient(135deg, #6c757d 0%, #495057 100%)" : "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
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
                                        {isDischarged ? "Total Paid / Billed" : "Total Outstanding"}
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
                                        {formatCurrency(isDischarged ? totalCharges : outstandingAmount)}
                                    </h2>
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
                        lg: "repeat(5, 1fr)",
                    },
                    gap: "15px",
                    marginBottom: 3,
                }}
            >
                <DashboardCard title="Food" count={chargeTotals.food} prefix="₹" icon={RupeeIcon} />
                <DashboardCard title="Consultation" count={chargeTotals.consultation} prefix="₹" icon={LocalHospitalIcon} />
                <DashboardCard title="Therapy" count={chargeTotals.therapy} prefix="₹" icon={SpaIcon} />
                <DashboardCard title="Pharmacy" count={chargeTotals.pharmacy} prefix="₹" icon={MedicationIcon} />
                <DashboardCard title="Ward" count={chargeTotals.ward} prefix="₹" icon={LocalHotelIcon} />
            </Box>

            {/* ⭐ Adjustments Panel */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h5 className="mb-1">Adjustments</h5>
                            <p className="text-muted small mb-0">
                                {isDischarged ? "Final adjustments applied at discharge." : "Apply discount before finalizing discharge."}
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
                                            if (billingData?.admission?.status === "Discharged") return;
                                            setDiscountType(e.target.value);
                                            // Reset value when switching types to avoid confusion or errors
                                            setDiscountRate(0);
                                        }}
                                        disabled={isDischarged}
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
                                        disabled={isDischarged}
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
                                            if (billingData?.admission?.status === "Discharged") return;
                                            const val = parseFloat(e.target.value);
                                            setTaxRate(Number.isFinite(val) && val >= 0 ? val : 0);
                                        }}
                                        disabled={isDischarged}
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
                        charges={charges.consultation.map(ch => ({ ...ch, category: "consultation" }))}
                        category="consultation"
                        isEditable={!isDischarged}
                        onEdit={handleEditCharge}
                    />
                </div>
                <div className="col-12 mb-4">
                    <ChargesPanel
                        title="Therapy Charges"
                        charges={charges.therapy}
                        category="therapy"
                        isEditable={!isDischarged}
                        onEdit={handleEditCharge}
                    />
                </div>
                <div className="col-12 mb-4">
                    <ChargesPanel
                        title="Pharmacy Charges"
                        charges={charges.pharmacy.map(ch => ({ ...ch, category: "pharmacy" }))}
                        category="pharmacy"
                        isEditable={!isDischarged}
                        onEdit={handleEditCharge}
                    />
                </div>
                <div className="col-12 mb-4">
                    <ChargesPanel
                        title="Ward Charges"
                        charges={charges.ward}
                        category="ward"
                        isEditable={false}
                    />
                </div>
                <div className="col-12 mb-4">
                    <ChargesPanel
                        title="Food Charges"
                        charges={charges.food}
                        category="food"
                        isEditable={false}
                    />
                </div>
            </div>

            {/* ⭐ Action Buttons */}
            <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/receptionist/inpatient" className="btn btn-outline-secondary">
                    <ArrowBackIcon className="me-2" />
                    Back to In-Patient List
                </Link>
                {!isDischarged && (
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleFinalizeDischarge}
                        disabled={isDischarging}
                    >
                        {isDischarging ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Finalizing...
                            </>
                        ) : (
                            <>
                                <CheckCircleIcon className="me-2" />
                                Finalize Discharge
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Edit Consultation Dialog */}
            <Dialog
                open={editConsultationDialog.open}
                onClose={() => !isUpdatingConsultation && setEditConsultationDialog({ open: false, charge: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Edit Consultation Charge
                    </Typography>
                    <Button
                        onClick={() => setEditConsultationDialog({ open: false, charge: null })}
                        disabled={isUpdatingConsultation}
                        sx={{ minWidth: "auto", p: 0.5 }}
                    >
                        <CloseIcon />
                    </Button>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Consultation: <strong>{editConsultationDialog.charge?.description || "N/A"}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Current Doctor: <strong>{editConsultationDialog.charge?.doctorName || "N/A"}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Current Amount: <strong>{formatCurrency(editConsultationDialog.charge?.amount || 0)}</strong>
                        </Typography>
                    </Box>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="doctor-select-label">Select Doctor</InputLabel>
                        <Select
                            labelId="doctor-select-label"
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            label="Select Doctor"
                            disabled={isLoadingDoctors || isUpdatingConsultation}
                        >
                            <MenuItem value="">
                                {isLoadingDoctors ? "Loading doctors..." : "No Change"}
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
                        disabled={isUpdatingConsultation}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setEditConsultationDialog({ open: false, charge: null })}
                        disabled={isUpdatingConsultation}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateConsultation}
                        disabled={!consultationAmount || isUpdatingConsultation}
                        sx={{ backgroundColor: "#8B4513" }}
                        startIcon={isUpdatingConsultation ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
                    >
                        {isUpdatingConsultation ? "Updating..." : "Update Consultation"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Therapist Dialog */}
            <Dialog
                open={editTherapistDialog.open}
                onClose={() => !isUpdatingTherapist && setEditTherapistDialog({ open: false, charge: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Edit Therapist
                    </Typography>
                    <Button
                        onClick={() => setEditTherapistDialog({ open: false, charge: null })}
                        disabled={isUpdatingTherapist}
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
                        <InputLabel id="therapist-select-label-ipd">Select Therapist</InputLabel>
                        <Select
                            labelId="therapist-select-label-ipd"
                            value={selectedTherapist}
                            onChange={(e) => setSelectedTherapist(e.target.value)}
                            label="Select Therapist"
                            disabled={isLoadingTherapists || isUpdatingTherapist}
                        >
                            <MenuItem value="" disabled>
                                {isLoadingTherapists ? "Loading therapists..." : "Select Therapist"}
                            </MenuItem>
                            {therapists.map((therapist) => {
                                const therapistName = therapist.user?.name || therapist.name || "Therapist";
                                const displayName = therapist.speciality
                                    ? `${therapistName} - ${therapist.speciality}`
                                    : therapistName;
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
                        disabled={isUpdatingTherapist}
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
                        disabled={isUpdatingTherapist}
                        sx={{ mt: 2 }}
                    />
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={replaceTherapists}
                                    onChange={(e) => setReplaceTherapists(e.target.checked)}
                                    disabled={isUpdatingTherapist}
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
                        disabled={isUpdatingTherapist}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateTherapist}
                        disabled={!selectedTherapist || isUpdatingTherapist}
                        sx={{ backgroundColor: "#8B4513" }}
                        startIcon={isUpdatingTherapist ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
                    >
                        {isUpdatingTherapist ? "Updating..." : "Update Therapist"}
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

            {/* Finalize Discharge Confirmation Dialog */}
            <Dialog
                open={finalizeDialogOpen}
                onClose={() => !isDischarging && setFinalizeDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Finalize Discharge
                    </Typography>
                    <Button
                        onClick={() => setFinalizeDialogOpen(false)}
                        disabled={isDischarging}
                        sx={{ minWidth: "auto", p: 0.5 }}
                    >
                        <CloseIcon />
                    </Button>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Are you sure you want to finalize the discharge and generate the final bill?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            This action will:
                        </Typography>
                        <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
                            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Generate the final invoice for all charges
                            </Typography>
                            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Mark the patient as discharged
                            </Typography>
                            <Typography component="li" variant="body2" color="text.secondary">
                                Make the bill final and uneditable
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setFinalizeDialogOpen(false)}
                        disabled={isDischarging}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmFinalize}
                        disabled={isDischarging}
                        sx={{ backgroundColor: "#4CAF50", "&:hover": { backgroundColor: "#45a049" } }}
                        startIcon={isDischarging ? <CircularProgress size={20} sx={{ color: "white" }} /> : <CheckCircleIcon />}
                    >
                        {isDischarging ? "Finalizing..." : "Confirm & Finalize"}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

export default InpatientBilling;

