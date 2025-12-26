import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";

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

// Mock data - will be replaced with API calls later
const mockPatientBilling = {
    id: "inp-1",
    name: "Amit Kumar",
    age: 32,
    gender: "Male",
    admittedOn: "2025-01-15",
    roomNo: "102",
    wardCategory: "General",
    doctorName: "Dr. Sharma",
    uhid: "UHID001",
    foodCharges: [
        {
            id: "food-1",
            date: "2025-01-20",
            description: "Breakfast - milk, bread, eggs",
            amount: 150.0,
        },
        {
            id: "food-2",
            date: "2025-01-20",
            description: "Lunch - rice, dal, vegetables",
            amount: 200.0,
        },
        {
            id: "food-3",
            date: "2025-01-19",
            description: "Breakfast - milk, bread",
            amount: 120.0,
        },
    ],
    consultationCharges: [
        {
            id: "cons-1",
            date: "2025-01-18",
            description: "Follow-up consultation",
            amount: 500.0,
            doctorName: "Dr. Sharma",
        },
        {
            id: "cons-2",
            date: "2025-01-16",
            description: "Initial consultation",
            amount: 1000.0,
            doctorName: "Dr. Sharma",
        },
    ],
    therapyCharges: [
        {
            id: "ther-1",
            date: "2025-01-19",
            description: "Physiotherapy Session",
            amount: 800.0,
            inTime: "10:00 AM",
            outTime: "11:00 AM",
            status: "Completed",
        },
        {
            id: "ther-2",
            date: "2025-01-17",
            description: "Occupational Therapy",
            amount: 600.0,
            inTime: "2:00 PM",
            outTime: "3:00 PM",
            status: "Completed",
        },
    ],
    pharmacyCharges: [
        {
            id: "pharm-1",
            date: "2025-01-18",
            description: "Paracetamol 500mg × 10",
            amount: 150.0,
            status: "Dispensed",
        },
        {
            id: "pharm-2",
            date: "2025-01-16",
            description: "Antibiotic × 5",
            amount: 300.0,
            status: "Dispensed",
        },
    ],
    wardCharges: [
        {
            id: "ward-1",
            date: "2025-01-15",
            description: "General Ward - Day 1",
            amount: 200.0,
        },
        {
            id: "ward-2",
            date: "2025-01-16",
            description: "General Ward - Day 2",
            amount: 200.0,
        },
        {
            id: "ward-3",
            date: "2025-01-17",
            description: "General Ward - Day 3",
            amount: 200.0,
        },
        {
            id: "ward-4",
            date: "2025-01-18",
            description: "General Ward - Day 4",
            amount: 200.0,
        },
        {
            id: "ward-5",
            date: "2025-01-19",
            description: "General Ward - Day 5",
            amount: 200.0,
        },
        {
            id: "ward-6",
            date: "2025-01-20",
            description: "General Ward - Day 6",
            amount: 200.0,
        },
    ],
    status: "Admitted",
    discountRate: 0,
    taxRate: 5,
};

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

    const columnCount = category === "therapy" ? 6 : category === "consultation" ? 4 : 3;

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
                                        <th style={{ fontSize: "0.875rem", textAlign: "center" }}>In Time</th>
                                        <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Out Time</th>
                                        <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Status</th>
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
                                    <td style={{ fontSize: "0.875rem" }}>{formatDate(charge.date)}</td>
                                    {category === "therapy" ? (
                                        <>
                                            <td style={{ fontSize: "0.875rem" }}>{charge.description}</td>
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
                                    ) : (
                                        <td style={{ fontSize: "0.875rem" }}>{charge.description}</td>
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

function InpatientBilling() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [patient, setPatient] = useState(mockPatientBilling);
    const [discountRate, setDiscountRate] = useState(0);
    const [taxRate, setTaxRate] = useState(5);
    const [isDischarging, setIsDischarging] = useState(false);
    const [downloadingReport, setDownloadingReport] = useState(false);

    // Calculate totals
    const chargeTotals = useMemo(() => {
        return {
            food: patient.foodCharges.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
            consultation: patient.consultationCharges.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
            therapy: patient.therapyCharges.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
            pharmacy: patient.pharmacyCharges.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
            ward: patient.wardCharges.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
        };
    }, [patient]);

    const grandTotal = useMemo(() => {
        return chargeTotals.food + chargeTotals.consultation + chargeTotals.therapy + chargeTotals.pharmacy + chargeTotals.ward;
    }, [chargeTotals]);

    const discountAmount = useMemo(() => grandTotal * (discountRate / 100), [grandTotal, discountRate]);
    const discountedTotal = useMemo(() => Math.max(0, grandTotal - discountAmount), [grandTotal, discountAmount]);
    const taxAmount = useMemo(() => {
        if (patient.status === "Discharged") {
            return 0; // Already included in finalPayable
        }
        return Number((discountedTotal * (taxRate / 100)).toFixed(2));
    }, [discountedTotal, taxRate, patient.status]);

    const totalCharges = useMemo(() => {
        if (patient.status === "Discharged") {
            return grandTotal; // Use stored final amount
        }
        return Number((discountedTotal + taxAmount).toFixed(2));
    }, [patient.status, grandTotal, discountedTotal, taxAmount]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const handleDiscountInput = (value) => {
        if (patient.status === "Discharged") return;
        const sanitized = Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
        setDiscountRate(sanitized);
    };

    const handleEditCharge = (charge) => {
        const params = new URLSearchParams({
            chargeId: charge.id || "",
            chargeName: charge.name || charge.chargeName || "",
            amount: (charge.amount || "").toString(),
        });
        navigate(`/receptionist/inpatient-billing/edit-charge?${params.toString()}`);
    };

    const handleSaveCharge = (formData) => {
        // Mock save - will be replaced with API call later
        toast.success("Charge updated successfully!");
        setIsEditModalOpen(false);
        setSelectedCharge(null);
    };

    const handleFinalizeDischarge = async () => {
        if (!window.confirm("Finalize discharge and generate the final bill?")) {
            return;
        }
        try {
            setIsDischarging(true);
            // Mock API call - will be replaced later
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success(`Discharge completed. Invoice amount ${formatCurrency(totalCharges)}`);
            setPatient((prev) => ({ ...prev, status: "Discharged" }));
        } catch (error) {
            toast.error(error.message || "Failed to finalize discharge.");
        } finally {
            setIsDischarging(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            setDownloadingReport(true);
            // Mock download - will be replaced with API call later
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success("Report download started!");
        } catch (error) {
            toast.error(error.message || "Failed to download discharge report.");
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

    return (
        <Box sx={{ padding: "20px" }}>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Page Heading */}
            <HeadingCardingCard
                category="INPATIENT BILLING"
                title={`Billing Details - ${patient.name}`}
                subtitle="View and manage all charges for this inpatient."
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
                                <span
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        fontWeight: 500,
                                        color: "#495057",
                                    }}
                                >
                                    <strong style={{ color: "#6c757d", marginRight: "4px" }}>Ward:</strong>
                                    {patient.wardCategory}
                                </span>
                                <span
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        fontWeight: 500,
                                        color: "#495057",
                                    }}
                                >
                                    <strong style={{ color: "#6c757d", marginRight: "4px" }}>Room No:</strong>
                                    {patient.roomNo}
                                </span>
                                {patient.doctorName && (
                                    <span
                                        style={{
                                            backgroundColor: "#f8f9fa",
                                            padding: "6px 12px",
                                            borderRadius: "8px",
                                            fontWeight: 500,
                                            color: "#495057",
                                        }}
                                    >
                                        <strong style={{ color: "#6c757d", marginRight: "4px" }}>Doctor:</strong>
                                        {patient.doctorName}
                                    </span>
                                )}
                                <span
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        fontWeight: 500,
                                        color: "#495057",
                                    }}
                                >
                                    <strong style={{ color: "#6c757d", marginRight: "4px" }}>Gender:</strong>
                                    {patient.gender}
                                </span>
                                <span
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        fontWeight: 500,
                                        color: "#495057",
                                    }}
                                >
                                    <strong style={{ color: "#6c757d", marginRight: "4px" }}>Age:</strong>
                                    {patient.age}
                                </span>
                                {patient.uhid && (
                                    <span
                                        style={{
                                            backgroundColor: "#f8f9fa",
                                            padding: "6px 12px",
                                            borderRadius: "8px",
                                            fontWeight: 500,
                                            color: "#495057",
                                        }}
                                    >
                                        <strong style={{ color: "#6c757d", marginRight: "4px" }}>UHID:</strong>
                                        {patient.uhid}
                                    </span>
                                )}
                                <span
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        fontWeight: 500,
                                        color: "#495057",
                                    }}
                                >
                                    <strong style={{ color: "#6c757d", marginRight: "4px" }}>Admitted:</strong>
                                    {new Date(patient.admittedOn).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="col-md-4 text-md-end">
                            <div
                                style={{
                                    background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
                                    borderRadius: "16px",
                                    padding: "24px 32px",
                                    display: "inline-block",
                                    boxShadow: "0 8px 24px rgba(76, 175, 80, 0.25), 0 4px 8px rgba(76, 175, 80, 0.15)",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    minWidth: "220px",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                {/* Decorative background element */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "-20px",
                                        right: "-20px",
                                        width: "100px",
                                        height: "100px",
                                        borderRadius: "50%",
                                        background: "rgba(255, 255, 255, 0.1)",
                                        zIndex: 0,
                                    }}
                                />
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
                                        Total Outstanding
                                    </p>
                                    <h2
                                        style={{
                                            fontSize: "2rem",
                                            fontWeight: 700,
                                            color: "#FFFFFF",
                                            marginBottom: 0,
                                            lineHeight: "1.2",
                                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
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
                            <p className="text-muted small mb-0">Apply discount before finalizing discharge.</p>
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
                                    disabled={patient.status === "Discharged"}
                                />
                                <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                                    GST ({taxRate}%): <strong>{formatCurrency(taxAmount)}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ⭐ Charges Panels */}
            <div className="row">
                <div className="col-lg-6 mb-4">
                    <ChargesPanel
                        title="Food Charges"
                        charges={patient.foodCharges}
                        category="food"
                        isEditable={false}
                    />
                </div>
                <div className="col-lg-6 mb-4">
                    <ChargesPanel
                        title="Doctor Consultation"
                        charges={patient.consultationCharges}
                        category="consultation"
                        isEditable={patient.status !== "Discharged"}
                        onEdit={handleEditCharge}
                    />
                </div>
                <div className="col-lg-6 mb-4">
                    <ChargesPanel
                        title="Therapy Charges"
                        charges={patient.therapyCharges}
                        category="therapy"
                        isEditable={false}
                    />
                </div>
                <div className="col-lg-6 mb-4">
                    <ChargesPanel
                        title="Pharmacy Charges"
                        charges={patient.pharmacyCharges}
                        category="pharmacy"
                        isEditable={patient.status !== "Discharged"}
                        onEdit={handleEditCharge}
                    />
                </div>
                <div className="col-12 mb-4">
                    <ChargesPanel
                        title="Ward Charges"
                        charges={patient.wardCharges}
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
                    disabled={downloadingReport || !patient.id}
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
                {patient.id && patient.status !== "Discharged" && (
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

