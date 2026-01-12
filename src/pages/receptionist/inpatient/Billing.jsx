import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";
import inpatientService from "../../../services/inpatientService";

// Icons
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SpaIcon from "@mui/icons-material/Spa";
import MedicationIcon from "@mui/icons-material/Medication";
import LocalHotelIcon from "@mui/icons-material/LocalHotel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";

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

    const columnCount = category === "therapy" ? 8 : category === "pharmacy" ? 7 : category === "consultation" ? 4 : category === "ward" ? 3 : 3;

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">{title}</h5>
                {category === "ward" && charges.length > 0 && (
                    <span className="badge bg-primary" style={{ fontSize: "0.875rem", padding: "6px 12px" }}>
                        Total: {formatCurrency(totalAmount)}
                    </span>
                )}
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
                                        <th style={{ fontSize: "0.875rem", textAlign: "right" }}>Therapy Charge</th>
                                        <th style={{ fontSize: "0.875rem", textAlign: "right" }}>Therapist Charge</th>
                                    </>
                                ) : category === "pharmacy" ? (
                                    <>
                                        <th style={{ fontSize: "0.875rem" }}>Medicine Name</th>
                                        <th style={{ fontSize: "0.875rem" }}>Dosage</th>
                                        <th style={{ fontSize: "0.875rem" }}>Frequency</th>
                                        <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Qty</th>
                                        <th style={{ fontSize: "0.875rem", textAlign: "right" }}>Unit Price</th>
                                    </>
                                ) : category === "ward" ? (
                                    <>
                                        <th style={{ fontSize: "0.875rem" }}>Ward Category</th>
                                        <th style={{ fontSize: "0.875rem" }}>Description</th>
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
                                            <td style={{ fontSize: "0.875rem" }}>{charge.therapistName || "N/A"}</td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "center" }}>{charge.inTime || "—"}</td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "center" }}>{charge.outTime || "—"}</td>
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
                                                {charge.type && (
                                                    <span className={`badge ${charge.type === "inpatient" ? "bg-info" : "bg-success"} ms-2`} style={{ fontSize: "0.65rem" }}>
                                                        {charge.type === "inpatient" ? "IPD" : "OPD"}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: "0.875rem" }}>{charge.dosage || "N/A"}</td>
                                            <td style={{ fontSize: "0.875rem" }}>{charge.frequency || "N/A"}</td>
                                            <td style={{ fontSize: "0.875rem", textAlign: "center" }}>{charge.quantity || 0}</td>
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
    const [taxRate, setTaxRate] = useState(5);
    const [isDischarging, setIsDischarging] = useState(false);
    const [downloadingReport, setDownloadingReport] = useState(false);
    const [patientId, setPatientId] = useState(null);

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

    useEffect(() => {
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
                    console.log("Ward charges count:", charges.ward.length);
                    console.log("Sample ward charge:", charges.ward[0]);
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
                console.error("Error fetching billing details:", error);
                console.error("Error response:", error.response);
                const msg = error.response?.data?.message || error.message || "Failed to load billing details.";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        };

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

    const discountAmount = useMemo(() => grandTotal * (discountRate / 100), [grandTotal, discountRate]);
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
        return Number((discountedTotal * (taxRate / 100)).toFixed(2));
    }, [discountedTotal, taxRate, billingData]);

    const totalCharges = useMemo(() => {
        const isDischarged = billingData?.admission?.status === "Discharged";
        if (isDischarged && billingData?.invoice) {
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
        if (billingData?.admission?.status === "Discharged") return;
        const sanitized = Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
        setDiscountRate(sanitized);
    };

    const handleEditCharge = (charge) => {
        const params = new URLSearchParams({
            chargeId: charge.id || "",
            chargeName: charge.description || charge.medication || "",
            amount: (charge.amount || "").toString(),
        });
        navigate(`/receptionist/inpatient-billing/edit-charge?${params.toString()}`);
    };

    const handleFinalizeDischarge = async () => {
        if (!window.confirm("Finalize discharge and generate the final bill?")) {
            return;
        }
        try {
            setIsDischarging(true);
            const response = await inpatientService.finalizeDischarge(id, {
                discountRate,
                taxRate
            });

            if (response && response.success) {
                toast.success(`Discharge completed. Invoice #${response.data.invoiceNumber} generated.`);
                
                // Refresh billing data to show updated invoice information
                if (patientId) {
                    try {
                        const billingResponse = await inpatientService.getUnifiedBillingSummary(patientId);
                        if (billingResponse && billingResponse.success && billingResponse.data) {
                            const data = billingResponse.data;
                            const charges = {
                                food: Array.isArray(data.charges?.food) ? data.charges.food : [],
                                consultation: Array.isArray(data.charges?.consultation) ? data.charges.consultation : [],
                                therapy: Array.isArray(data.charges?.therapy) ? data.charges.therapy : [],
                                pharmacy: Array.isArray(data.charges?.pharmacy) ? data.charges.pharmacy : [],
                                ward: Array.isArray(data.charges?.ward) ? data.charges.ward : [],
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
            console.error("Discharge error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to finalize discharge.";
            toast.error(errorMessage);
        } finally {
            setIsDischarging(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            setDownloadingReport(true);
            const response = await inpatientService.downloadDischargeReport(id);

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            const fileName = `Discharge_${billingData?.patient?.name || 'Report'}.pdf`;
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Report downloaded successfully!");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download discharge report.");
        } finally {
            setDownloadingReport(false);
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
    const isDischarged = admission?.status === "Discharged";

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
                                <span className="badge bg-light text-dark p-2">
                                    <strong className="text-muted me-1">Room:</strong> {admission.roomNumber || 'N/A'}
                                </span>
                                {doctor && (
                                    <span className="badge bg-light text-dark p-2">
                                        <strong className="text-muted me-1">Doctor:</strong> {doctor.name || 'N/A'}
                                    </span>
                                )}
                                <span className="badge bg-light text-dark p-2">
                                    <strong className="text-muted me-1">Gender:</strong> {patient.gender || 'N/A'}
                                </span>
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
                        lg: "repeat(5, 1fr)",
                    },
                    gap: "15px",
                    marginBottom: 3,
                }}
            >
                <DashboardCard title="Food" count={chargeTotals.food} prefix="₹" icon={AttachMoneyIcon} />
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
                                    disabled={isDischarged}
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
                        title="Food Charges"
                        charges={charges.food}
                        category="food"
                        isEditable={false}
                    />
                </div>
                <div className="col-12 mb-4">
                    <ChargesPanel
                        title="Doctor Consultation"
                        charges={charges.consultation}
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
                        isEditable={false}
                    />
                </div>
                <div className="col-12 mb-4">
                    <ChargesPanel
                        title="Pharmacy Charges"
                        charges={charges.pharmacy}
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
            </div>

            {/* ⭐ Action Buttons */}
            <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/receptionist/inpatient" className="btn btn-outline-secondary">
                    <ArrowBackIcon className="me-2" />
                    Back to In-Patient List
                </Link>
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleDownloadReport}
                    disabled={downloadingReport || !id}
                >
                    {downloadingReport ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Preparing PDF...
                        </>
                    ) : (
                        <>
                            <DownloadIcon className="me-2" />
                            Download Discharge Report
                        </>
                    )}
                </button>
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

        </Box>
    );
}

export default InpatientBilling;

