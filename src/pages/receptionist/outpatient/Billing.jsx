import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
    Divider
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";

const ChargesPanel = ({ title, charges, category, onEdit, isEditable = true }) => {
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

    const columnCount = category === "therapy" ? 7 : category === "pharmacy" ? 7 : category === "consultation" ? 4 : 3;

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">{title}</h5>
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
                                        <th style={{ fontSize: "0.875rem", textAlign: "center" }}>In Time</th>
                                        <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Out Time</th>
                                        <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Status</th>
                                    </>
                                ) : category === "pharmacy" ? (
                                    <>
                                        <th style={{ fontSize: "0.875rem" }}>Medicine Name</th>
                                        <th style={{ fontSize: "0.875rem" }}>Dosage</th>
                                        <th style={{ fontSize: "0.875rem" }}>Frequency</th>
                                        <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Qty</th>
                                        <th style={{ fontSize: "0.875rem", textAlign: "right" }}>Unit Price</th>
                                    </>
                                ) : (
                                    <th style={{ fontSize: "0.875rem" }}>Description</th>
                                )}
                                {category === "consultation" && <th style={{ fontSize: "0.875rem" }}>Doctor</th>}
                                <th style={{ fontSize: "0.875rem", textAlign: "right" }}>Amount</th>
                                {isEditable && onEdit && <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Actions</th>}
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
                                            <td style={{ fontSize: "0.875rem", textAlign: "center" }}>{charge.inTime || "—"}</td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "center" }}>{charge.outTime || "—"}</td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "center" }}>
                                                {charge.status && (
                                                    <span className={getStatusBadgeClass(charge.status)} style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "50px" }}>
                                                        {charge.status}
                                                    </span>
                                                )}
                                            </td>
                                        </>
                                    ) : category === "pharmacy" ? (
                                        <>
                                            <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>{charge.medication || "N/A"}</td>
                                            <td style={{ fontSize: "0.875rem" }}>{charge.dosage || "N/A"}</td>
                                            <td style={{ fontSize: "0.875rem" }}>{charge.frequency || "N/A"}</td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "center" }}>{charge.quantity || 0}</td>
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
                                    {isEditable && onEdit && (
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
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

function OutpatientBilling() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [billingData, setBillingData] = useState(null);
    const [discountRate, setDiscountRate] = useState(0);
    const [taxRate, setTaxRate] = useState(5);
    const [isFinalizing, setIsFinalizing] = useState(false);
    
    // Edit dialogs state
    const [editDoctorDialog, setEditDoctorDialog] = useState({ open: false, charge: null });
    const [editTherapistDialog, setEditTherapistDialog] = useState({ open: false, charge: null });
    const [doctors, setDoctors] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedTherapist, setSelectedTherapist] = useState("");
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
    const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Refetch billing details
    const fetchBillingDetails = async () => {
        if (!patientId) return;
        
        try {
            setLoading(true);
            console.log("Fetching outpatient billing details for patient ID:", patientId);
            const response = await inpatientService.getOutpatientBillingSummary(patientId);
            console.log("Outpatient Billing API Response:", response);
            
            if (response && response.success && response.data) {
                const data = response.data;
                
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

                // Set initial values from invoice if available
                if (data.invoice && data.invoice.id) {
                    setDiscountRate(data.invoice.discountRate || 0);
                    setTaxRate(data.invoice.taxRate || 5);
                }
            } else {
                console.error("Invalid response structure:", response);
                toast.error("Invalid response from server");
            }
        } catch (error) {
            console.error("Error fetching outpatient billing details:", error);
            console.error("Error response:", error.response);
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
        return billingData.totals?.grandTotal || Object.values(chargeTotals).reduce((a, b) => a + b, 0);
    }, [billingData, chargeTotals]);

    const discountAmount = useMemo(() => grandTotal * (discountRate / 100), [grandTotal, discountRate]);
    const discountedTotal = useMemo(() => Math.max(0, grandTotal - discountAmount), [grandTotal, discountAmount]);
    const taxAmount = useMemo(() => {
        const isFinalized = billingData?.invoice?.id;
        if (isFinalized && billingData?.invoice) {
            // If finalized, tax is already fixed in invoice
            return 0;
        }
        return Number((discountedTotal * (taxRate / 100)).toFixed(2));
    }, [discountedTotal, taxRate, billingData]);

    const totalCharges = useMemo(() => {
        const isFinalized = billingData?.invoice?.id;
        if (isFinalized && billingData?.invoice) {
            return billingData.invoice.totalPayable;
        }
        return Number((discountedTotal + taxAmount).toFixed(2));
    }, [grandTotal, discountedTotal, taxAmount, billingData]);

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
        const sanitized = Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
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
        setSelectedDoctor("");
        if (!doctors.length) {
            fetchDoctors();
        }
    };

    // Handle edit therapist
    const handleEditTherapist = (charge) => {
        setEditTherapistDialog({ open: true, charge });
        setSelectedTherapist("");
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

        if (!editDoctorDialog.charge?.id) {
            toast.error("Invalid consultation record");
            return;
        }

        setIsUpdating(true);
        try {
            // Update the examination's doctor
            const response = await axios.patch(
                getApiUrl(`doctor-examinations/${editDoctorDialog.charge.id}`),
                { doctor: selectedDoctor },
                { headers: getAuthHeaders() }
            );

            if (response.data && response.data.success) {
                toast.success("Doctor updated successfully!");
                setEditDoctorDialog({ open: false, charge: null });
                setSelectedDoctor("");
                
                // Refresh billing data
                await fetchBillingDetails();
            } else {
                toast.error(response.data?.message || "Failed to update doctor");
            }
        } catch (error) {
            console.error("Error updating doctor:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to update doctor");
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

        // Get sessionId from charge - for outpatient, id is the sessionId directly
        // For inpatient, it might be in sessionId field or composite id
        const sessionId = editTherapistDialog.charge?.sessionId || editTherapistDialog.charge?.id;
        
        if (!sessionId) {
            toast.error("Invalid therapy session record");
            return;
        }

        setIsUpdating(true);
        try {
            // Update the therapist session's therapist
            const response = await axios.patch(
                getApiUrl(`therapist-sessions/${sessionId}/assign`),
                { therapistIds: [selectedTherapist] },
                { headers: getAuthHeaders() }
            );

            if (response.data && response.data.success) {
                toast.success("Therapist updated successfully!");
                setEditTherapistDialog({ open: false, charge: null });
                setSelectedTherapist("");
                
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


    const handleFinalizeBilling = async () => {
        if (!window.confirm("Finalize outpatient billing and generate the final bill?")) {
            return;
        }
        try {
            setIsFinalizing(true);
            const response = await inpatientService.finalizeOutpatientBilling(patientId, {
                discountRate,
                taxRate
            });

            if (response && response.success) {
                toast.success(`Billing finalized successfully. Invoice #${response.data.invoiceNumber} generated.`);
                
                // Refresh billing data to show updated invoice information
                if (patientId) {
                    try {
                        const billingResponse = await inpatientService.getOutpatientBillingSummary(patientId);
                        if (billingResponse && billingResponse.success && billingResponse.data) {
                            const data = billingResponse.data;
                            const charges = {
                                consultation: Array.isArray(data.charges?.consultation) ? data.charges.consultation : [],
                                therapy: Array.isArray(data.charges?.therapy) ? data.charges.therapy : [],
                                pharmacy: Array.isArray(data.charges?.pharmacy) ? data.charges.pharmacy : [],
                            };
                            setBillingData({ ...data, charges });
                            
                            if (data.invoice && data.invoice.id) {
                                setDiscountRate(data.invoice.discountRate || 0);
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
        }
    };

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Outpatients", url: "/receptionist/outpatient" },
        { label: "Outpatient Billing" },
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

    const { patient, charges } = billingData;
    const isFinalized = billingData?.invoice?.id;

    return (
        <Box sx={{ padding: "20px" }}>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Page Heading */}
            <HeadingCardingCard
                category="OUTPATIENT BILLING"
                title={`Billing Details - ${patient.name}`}
                subtitle="View and manage all outpatient charges for this patient."
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
                                {patient.uhid && (
                                    <span className="badge bg-light text-dark p-2">
                                        <strong className="text-muted me-1">UHID:</strong> {patient.uhid}
                                    </span>
                                )}
                                {patient.patientId && (
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
                                        {isFinalized ? "Total Paid / Billed" : "Total Outstanding"}
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
                                        {formatCurrency(totalCharges)}
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
                                <label className="mb-0" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                    Discount (%)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.5}
                                    className="form-control"
                                    style={{ width: "100px" }}
                                    value={discountRate}
                                    onChange={(e) => handleDiscountInput(parseFloat(e.target.value))}
                                    disabled={isFinalized}
                                />
                                <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                                    GST ({taxRate}%): <strong>{formatCurrency(taxAmount)}</strong>
                                </span>
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
                        charges={charges.consultation}
                        category="consultation"
                        isEditable={!isFinalized}
                        onEdit={handleEditDoctor}
                    />
                </div>
                <div className="col-12 mb-4">
                    <ChargesPanel
                        title="Therapy Charges"
                        charges={charges.therapy}
                        category="therapy"
                        isEditable={!isFinalized}
                        onEdit={handleEditTherapist}
                    />
                </div>
                <div className="col-12 mb-4">
                    <ChargesPanel
                        title="Pharmacy Charges"
                        charges={charges.pharmacy}
                        category="pharmacy"
                        isEditable={false}
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
                    </Box>
                    <FormControl fullWidth required>
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
                        disabled={!selectedDoctor || isUpdating}
                        sx={{ backgroundColor: "#8B4513" }}
                        startIcon={isUpdating ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
                    >
                        {isUpdating ? "Updating..." : "Update Doctor"}
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
                    onClick={handleFinalizeBilling}
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

        </Box>
    );
}

export default OutpatientBilling;

