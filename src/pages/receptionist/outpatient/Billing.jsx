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
    // Disable grouping - each session should be its own row as requested
    return charges;
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

  const totalAmount = useMemo(() => {
    return groupedCharges.reduce((sum, ch) => sum + Number(ch.amount || 0), 0);
  }, [groupedCharges]);

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

  const columnCount = category === "therapy" ? 6 : category === "consultation" ? 4 : 3;

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
                    <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Sessions</th>
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
                          <div style={{ fontWeight: 600 }}>
                            {charge.therapyName || charge.description || "N/A"}
                          </div>
                          {charge.subTherapy && (
                            <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: "2px" }}>
                              Sub-Therapy: {charge.subTherapy}
                            </div>
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
                        <td style={{ fontSize: "0.875rem", textAlign: "center" }}>
                          <span className="badge bg-secondary" style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "50px" }}>
                            {charge.sessionsCount || 1}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 500 }}>
                          {formatCurrency(charge.therapyCharge || 0)}
                        </td>
                        <td style={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 500 }}>
                          {formatCurrency(charge.therapistCharge || 0)}
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
  const [referredBy, setReferredBy] = useState("");
  const [consultedBy, setConsultedBy] = useState("");
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

  useEffect(() => {
    if (billingData?.invoice) {
      if (billingData.invoice.referredBy)
        setReferredBy(billingData.invoice.referredBy);
      if (billingData.invoice.consultedBy)
        setConsultedBy(billingData.invoice.consultedBy);

      // Initialize discount state if invoice exists
      if (billingData.invoice.discountType)
        setDiscountType(billingData.invoice.discountType);
      if (billingData.invoice.discountValue !== undefined)
        setDiscountValue(String(billingData.invoice.discountValue));
    }
  }, [billingData]);

  // Consultation + therapy + pharmacy (even if hidden in UI for now)
  const chargeTotals = useMemo(() => {
    if (!billingData?.charges) return { consultation: 0, therapy: 0, pharmacy: 0 };
    const { charges } = billingData;
    return {
      consultation: charges.consultation.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
      therapy: charges.therapy.reduce((sum, ch) => sum + Number(ch.amount || 0), 0),
      pharmacy: charges.pharmacy?.reduce((sum, ch) => sum + Number(ch.amount || 0), 0) || 0,
    };
  }, [billingData]);

  const subtotal = useMemo(() => {
    return chargeTotals.consultation + chargeTotals.therapy + chargeTotals.pharmacy;
  }, [chargeTotals]);

  const taxAmount = useMemo(() => {
    // We use the taxRate from the invoice or default to 0 for outpatient
    const rate = billingData?.invoice?.taxRate ?? 0;
    return (chargeTotals.pharmacy * rate) / 100;
  }, [chargeTotals.pharmacy, billingData?.invoice?.taxRate]);

  const grandTotal = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  const isFinalized = useMemo(() => {
    return !!billingData?.isFinalized || !!billingData?.invoice?.id;
  }, [billingData]);

  const discountAmount = useMemo(() => {
    if (isFinalized && billingData?.invoice) {
      // If finalized, we can calculate based on stored invoice fields if needed,
      // but usually the backend provides the discount details.
      // If the backend doesn't provide discountAmount, calculate it from stored rates.
      const inv = billingData.invoice;
      const val = parseFloat(inv.discountValue || 0);
      if (!val || val <= 0) return 0;
      if (inv.discountType === "percentage") {
        return (grandTotal * val) / 100;
      }
      return val;
    }
    const val = parseFloat(discountValue) || 0;
    if (!val || val <= 0) return 0;
    if (discountType === "percentage") {
      return Math.min((grandTotal * val) / 100, grandTotal);
    }
    return Math.min(val, grandTotal);
  }, [isFinalized, billingData, discountType, discountValue, grandTotal]);

  const totalCharges = useMemo(() => {
    if (isFinalized && billingData?.invoice) {
      return billingData.invoice.totalPayable ?? Math.max(0, grandTotal - discountAmount);
    }
    return Math.max(0, grandTotal - discountAmount);
  }, [isFinalized, billingData, grandTotal, discountAmount]);

  const amountPaid = useMemo(() => billingData?.invoice?.amountPaid || 0, [billingData]);

  const outstandingAmount = useMemo(() => {
    if (isFinalized) return Math.max(0, totalCharges - amountPaid);
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

      if (referredBy) payload.referredBy = referredBy;
      if (consultedBy) payload.consultedBy = consultedBy;

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
        category={billingData.isDaycare ? "DAYCARE BILLING" : "OUTPATIENT BILLING"}
        title={`Billing Details  - ${patient?.name || "Unknown Patient"}`}
        subtitle="Consultation & Therapy charges "
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

                <span className={`badge ${billingData.isDaycare ? "bg-info" : "bg-success"} p-2`} style={billingData.isDaycare ? { backgroundColor: "#0dcaf0" } : {}}>
                  {billingData.isDaycare ? "DAYCARE" : "OUTPATIENT"}
                </span>
                {billingData?.invoice?.referredBy && (
                  <span className="badge bg-light text-dark p-2">
                    <strong className="text-muted me-1">Referred By:</strong>{" "}
                    {billingData.invoice.referredBy}
                  </span>
                )}
                {billingData?.invoice?.consultedBy && (
                  <span className="badge bg-light text-dark p-2">
                    <strong className="text-muted me-1">Consulted By:</strong>{" "}
                    {billingData.invoice.consultedBy}
                  </span>
                )}
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
        {(() => {
          const validConsultations = (charges?.consultation || []).filter(ch => !(ch.doctorName === "Doctor" && Number(ch.amount || 0) === 0));
          if (validConsultations.length === 0) return null;
          return (
            <div className="col-12 mb-4">
              <ChargesPanel
                title="Doctor Consultation"
                charges={validConsultations}
                category="consultation"
                isEditable={!isFinalized}
                onEdit={handleEditDoctor}
              />
            </div>
          );
        })()}
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

      {/* Referral & Consultant Section */}
      {!isFinalized && (
        <div className="card shadow-sm mb-4" style={{ borderRadius: "12px" }}>
          <div className="card-header bg-white py-3">
            <h5 className="mb-0" style={{ fontWeight: 700, color: "#1a1a1a" }}>
              Referral & Consultant
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <TextField
                  fullWidth
                  label="Referred By"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  placeholder="Enter referrer name"
                  variant="outlined"
                />
              </div>
              <div className="col-md-6">
                <TextField
                  fullWidth
                  label="Consulted By"
                  value={consultedBy}
                  onChange={(e) => setConsultedBy(e.target.value)}
                  placeholder="Enter consultant name"
                  variant="outlined"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discount & Bill Summary */}
      <div className="card shadow-sm mb-4" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div className="card-header" style={{ padding: "12px 20px" }}>
          <h5 className="card-title mb-0" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {isFinalized ? "Bill Summary" : "Discount"}
          </h5>
        </div>
        <div className="card-body p-4">
          {!isFinalized && (
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
          )}
          {!isFinalized && <Divider sx={{ mb: 2 }} />}

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

            {isFinalized && amountPaid > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Amount Paid</Typography>
                <Typography fontWeight={600} color="success.main">{formatCurrency(amountPaid)}</Typography>
              </Box>
            )}

            {isFinalized && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" fontWeight={700}>Balance Due</Typography>
                <Typography variant="h6" fontWeight={700} color={outstandingAmount > 0 ? "error.main" : "success.main"}>
                  {formatCurrency(outstandingAmount)}
                </Typography>
              </Box>
            )}
          </Box>
        </div>
      </div>

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
                  ? formatCurrency(therapyEditRows.reduce((s, r) => s + Number(r.therapyCharge || 0) + Number(r.therapistCharge || 0), 0))
                  : formatCurrency(Number(therapyCost || 0) + Number(therapistCharge || 0))}
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