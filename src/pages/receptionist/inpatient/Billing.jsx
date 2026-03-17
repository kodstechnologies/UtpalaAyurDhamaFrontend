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
  TextField,
  CircularProgress,
  Typography,
  Divider,
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
// Icons
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SpaIcon from "@mui/icons-material/Spa";
import LocalHotelIcon from "@mui/icons-material/LocalHotel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

// Custom Rupee Icon
const RupeeIcon = (props) => {
  const { sx, ...other } = props;
  return (
    <Box
      component="span"
      sx={{
        fontSize: sx?.fontSize || 20,
        color: sx?.color || "inherit",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        ...sx,
      }}
      {...other}
    >
      ₹
    </Box>
  );
};

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

  const columnCount = category === "therapy" ? 6 : category === "consultation" ? 4 : 3;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header d-flex justify-content-between align-items-center" style={{ padding: "12px 20px" }}>
        <h5 className="card-title mb-0" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
          {title}
        </h5>
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
                    <td style={{ fontSize: "0.875rem" }}>{formatDate(charge.date || charge.createdAt)}</td>
                    {category === "therapy" ? (
                      <>
                        <td style={{ fontSize: "0.875rem" }}>
                          {charge.therapies?.length > 0 ? (
                            <div>
                              {(() => {
                                const uniqueSub = [...new Set(charge.therapies.map(t => t.subTherapy || ""))];
                                const commonSub = uniqueSub.length === 1 && uniqueSub[0];
                                if (commonSub) {
                                  return (
                                    <>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                        {charge.therapies.map((t, i) => (
                                          <span key={i} style={{ fontWeight: 500 }}>
                                            {t.therapyName}
                                            {i < charge.therapies.length - 1 && <span style={{ margin: "0 4px", color: "#6c757d" }}>•</span>}
                                          </span>
                                        ))}
                                      </div>
                                      <div style={{ fontSize: "0.75rem", color: "#6c757d", mt: 1 }}>
                                        Sub-Therapy: {commonSub}
                                      </div>
                                    </>
                                  );
                                }
                                return charge.therapies.map((t, i) => (
                                  <div key={i} style={{ marginBottom: i < charge.therapies.length - 1 ? "6px" : "0" }}>
                                    <div style={{ fontWeight: 500 }}>{t.therapyName}</div>
                                    {t.subTherapy && (
                                      <div style={{ fontSize: "0.75rem", color: "#6c757d" }}>
                                        Sub-Therapy: {t.subTherapy}
                                      </div>
                                    )}
                                  </div>
                                ));
                              })()}
                            </div>
                          ) : (
                            charge.therapyName || charge.description || "N/A"
                          )}
                        </td>
                        <td style={{ fontSize: "0.875rem" }}>{charge.therapistName || "—"}</td>
                        <td style={{ textAlign: "center" }}>
                          {charge.status ? (
                            <span className={getStatusBadgeClass(charge.status)} style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "50px" }}>
                              {charge.status}
                            </span>
                          ) : "—"}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 500 }}>
                          {formatCurrency(charge.totalTherapyCharge ?? charge.therapyCharge ?? 0)}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 500 }}>
                          {formatCurrency(charge.totalTherapistCharge ?? charge.therapistCharge ?? 0)}
                        </td>
                      </>
                    ) : (
                      <td style={{ fontSize: "0.875rem" }}>
                        {charge.description || "Ward Charge"}
                      </td>
                    )}
                    {category === "consultation" && (
                      <td style={{ fontSize: "0.875rem" }}>{charge.doctorName || "—"}</td>
                    )}
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      {formatCurrency(displayAmount)}
                    </td>
                    {!useHeaderAction && isEditable && onEdit && (
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => onEdit(charge)}
                          style={{
                            backgroundColor: "#D4A574",
                            color: "#000",
                            borderRadius: "8px",
                            padding: "4px 8px",
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

function InpatientBilling() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState(null);

  const [patientId, setPatientId] = useState(null);
  const [inpatientId, setInpatientId] = useState(null);

  const [isDischarging, setIsDischarging] = useState(false);
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);

  // Consultation edit dialog
  const [editConsultationDialog, setEditConsultationDialog] = useState({ open: false, charge: null });
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [consultationAmount, setConsultationAmount] = useState("");
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isUpdatingConsultation, setIsUpdatingConsultation] = useState(false);

  // Therapist edit dialog
  const [editTherapistDialog, setEditTherapistDialog] = useState({ open: false, charge: null });
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState("");
  const [therapyCost, setTherapyCost] = useState("");
  const [therapistCharge, setTherapistCharge] = useState("");
  const [therapyEditRows, setTherapyEditRows] = useState([]);
  const [replaceTherapists, setReplaceTherapists] = useState(false);
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);
  const [isUpdatingTherapist, setIsUpdatingTherapist] = useState(false);

  // Get patient & inpatient IDs
  useEffect(() => {
    const fetchIds = async () => {
      try {
        const res = await inpatientService.getInpatientById(id);
        if (res?.success && res.data) {
          const inp = res.data;
          setPatientId(inp.patient?._id || inp.patient);
          setInpatientId(id);
        }
      } catch {
        setPatientId(id);
      }
    };
    if (id) fetchIds();
  }, [id]);

  const fetchBillingDetails = async () => {
    if (!patientId || !inpatientId) return;
    setLoading(true);
    try {
      const res = await inpatientService.getUnifiedBillingSummary(patientId, inpatientId);
      if (res?.success && res.data) {
        const data = res.data;
        const charges = {
          food: Array.isArray(data.charges?.food) ? data.charges.food : [],
          consultation: Array.isArray(data.charges?.consultation) ? data.charges.consultation : [],
          therapy: Array.isArray(data.charges?.therapy) ? data.charges.therapy : [],
          ward: Array.isArray(data.charges?.ward) ? data.charges.ward : [],
        };
        setBillingData({ ...data, charges });
      } else {
        toast.error("Invalid server response");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load billing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId && inpatientId) fetchBillingDetails();
  }, [patientId, inpatientId]);

  const chargeTotals = useMemo(() => {
    if (!billingData?.charges) return { food: 0, consultation: 0, therapy: 0, ward: 0 };
    const { charges } = billingData;
    return {
      food: charges.food.reduce((s, c) => s + Number(c.amount || 0), 0),
      consultation: charges.consultation.reduce((s, c) => s + Number(c.amount || 0), 0),
      therapy: charges.therapy.reduce((s, c) => s + Number(c.amount || 0), 0),
      ward: charges.ward.reduce((s, c) => s + Number(c.amount || 0), 0),
    };
  }, [billingData]);

  const grandTotal = useMemo(() => {
    return Object.values(chargeTotals).reduce((a, b) => a + b, 0);
  }, [chargeTotals]);

  const totalCharges = useMemo(() => {
    if (billingData?.invoice?.id) return billingData.invoice.totalPayable;
    return grandTotal;
  }, [billingData, grandTotal]);

  const amountPaid = useMemo(() => billingData?.invoice?.amountPaid || 0, [billingData]);

  const outstandingAmount = useMemo(() => {
    if (billingData?.invoice?.id) return Math.max(0, totalCharges - amountPaid);
    return totalCharges;
  }, [billingData, totalCharges, amountPaid]);

  const isDischarged = useMemo(() => {
    if (!billingData) return false;
    return (
      billingData.admission?.status === "Discharged" ||
      billingData.admission?.status === "readyToDischarged" ||
      !!billingData.invoice?.id
    );
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

  const handleEditConsultation = (charge) => {
    setEditConsultationDialog({ open: true, charge });
    setSelectedDoctor(charge.doctorId || "");
    setConsultationAmount(String(charge.amount || 0));
    if (!doctors.length) fetchDoctors();
  };

  const handleUpdateConsultation = async () => {
    if (!consultationAmount || Number(consultationAmount) < 0) {
      toast.error("Enter valid amount");
      return;
    }
    const charge = editConsultationDialog.charge;
    if (!charge?.id || !inpatientId) {
      toast.error("Invalid record");
      return;
    }
    setIsUpdatingConsultation(true);
    try {
      let url;
      if (charge.type === "outpatient" || charge.chargeSource === "examination") {
        url = getApiUrl(`examinations/${charge.id}/consultation`);
      } else {
        const checkupId = charge.id.includes("-") ? charge.id.split("-")[1] : charge.id;
        url = getApiUrl(`inpatients/${inpatientId}/checkups/${checkupId}/consultation`);
      }

      const res = await axios.patch(url, {
        doctorId: selectedDoctor || null,
        price: Number(consultationAmount),
      }, { headers: getAuthHeaders() });

      if (res.data?.success) {
        toast.success("Updated");
        setEditConsultationDialog({ open: false, charge: null });
        await fetchBillingDetails();
      } else {
        toast.error(res.data?.message || "Failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setIsUpdatingConsultation(false);
    }
  };

  const handleEditTherapist = (charge) => {
    setEditTherapistDialog({ open: true, charge });
    const tid = charge.therapistId || charge.therapist?._id || charge.therapist || "";
    setSelectedTherapist(tid);

    if (charge.therapies?.length > 1) {
      setTherapyEditRows(
        charge.therapies.map(t => ({
          therapyName: t.therapyName || "Therapy",
          sessionId: t.sessionId || t.id,
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

  const updateTherapyEditRow = (idx, field, val) => {
    setTherapyEditRows(prev => {
      const next = [...prev];
      if (next[idx]) next[idx][field] = val;
      return next;
    });
  };

  const handleUpdateTherapist = async () => {
    if (!selectedTherapist) {
      toast.error("Select therapist");
      return;
    }
    setIsUpdatingTherapist(true);
    try {
      if (therapyEditRows.length > 0) {
        let success = 0;
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
          if (res.data?.success) success++;
        }
        if (success === therapyEditRows.length) {
          toast.success("All updated");
          setEditTherapistDialog({ open: false, charge: null });
          setTherapyEditRows([]);
          await fetchBillingDetails();
        } else {
          toast.warning(`Updated ${success}/${therapyEditRows.length}`);
          await fetchBillingDetails();
        }
      } else {
        const sid = editTherapistDialog.charge?.sessionId || editTherapistDialog.charge?.id;
        if (!sid) throw new Error("No session");

        const res = await axios.patch(
          getApiUrl(`therapist-sessions/${sid}`),
          {
            therapist: selectedTherapist,
            cost: Number(therapyCost),
            therapistCharge: Number(therapistCharge || 0),
            replaceTherapists,
          },
          { headers: getAuthHeaders() }
        );

        if (res.data?.success) {
          toast.success("Updated");
          setEditTherapistDialog({ open: false, charge: null });
          await fetchBillingDetails();
        } else {
          toast.error(res.data?.message || "Failed");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setIsUpdatingTherapist(false);
    }
  };

  const handleFinalizeDischarge = async () => {
    setFinalizeDialogOpen(false);
    setIsDischarging(true);
    try {
      const res = await inpatientService.finalizeDischarge(inpatientId || id, {});
      if (res?.success) {
        toast.success(`Invoice #${res.data.invoiceNumber} generated`);
        await fetchBillingDetails();
        setTimeout(() => navigate("/receptionist/payments"), 1800);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Finalize failed");
    } finally {
      setIsDischarging(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", url: "/" },
    { label: "Inpatients", url: "/receptionist/inpatient" },
    { label: "Patient Billing" },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 5, display: "flex", justifyContent: "center" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Box>
    );
  }

  if (!billingData) {
    return (
      <Box sx={{ p: 4 }}>
        <Breadcrumb items={breadcrumbItems} />
        <div className="alert alert-danger mt-4">Failed to load billing data</div>
      </Box>
    );
  }

  const { patient, admission, charges } = billingData;

  return (
    <Box sx={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <HeadingCardingCard
        category="INPATIENT BILLING"
        title={`Billing Details - ${patient?.name || "Patient"}`}
        subtitle="Food • Consultation • Therapy • Ward charges"
      />

      {/* Patient Info Card */}
      <div className="card shadow-sm mb-4" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h3 className="mb-3 fw-bold">{patient?.name}</h3>
              <div className="d-flex flex-wrap gap-3">
                <span className="badge bg-light text-dark p-2"><strong>Ward:</strong> {admission?.wardCategory || "—"}</span>
                {admission?.roomNumber && <span className="badge bg-light text-dark p-2"><strong>Room:</strong> {admission.roomNumber}</span>}
                {admission?.bedNumber && <span className="badge bg-light text-dark p-2"><strong>Bed:</strong> {admission.bedNumber}</span>}
                <span className="badge bg-light text-dark p-2"><strong>Admitted:</strong> {admission?.admissionDate ? new Date(admission.admissionDate).toLocaleDateString() : "—"}</span>
                <span className={`badge p-2 ${isDischarged ? "bg-secondary" : "bg-success"}`}>{admission?.status || "Active"}</span>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <div
                style={{
                  background: isDischarged ? "linear-gradient(135deg, #6c757d, #495057)" : "linear-gradient(135deg, #4CAF50, #66BB6A)",
                  borderRadius: "16px",
                  padding: "24px 32px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                  display: "inline-block",
                  minWidth: "220px",
                }}
              >
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "white", marginBottom: "8px", textTransform: "uppercase" }}>
                  {isDischarged ? (outstandingAmount === 0 ? "Total Paid" : "Amount Due") : "Total Amount"}
                </p>
                <h2 style={{ color: "white", fontWeight: 700, margin: 0 }}>
                  {formatCurrency(isDischarged && outstandingAmount === 0 ? totalCharges : outstandingAmount)}
                </h2>
                {isDischarged && outstandingAmount > 0 && (
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.9)", marginTop: "6px" }}>
                    Paid: {formatCurrency(amountPaid)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 3, mb: 4 }}>
        <DashboardCard title="Food"        count={chargeTotals.food}        prefix="₹" icon={RupeeIcon} />
        <DashboardCard title="Consultation" count={chargeTotals.consultation} prefix="₹" icon={LocalHospitalIcon} />
        <DashboardCard title="Therapy"     count={chargeTotals.therapy}     prefix="₹" icon={SpaIcon} />
        <DashboardCard title="Ward"        count={chargeTotals.ward}        prefix="₹" icon={LocalHotelIcon} />
      </Box>

      {/* Charges Panels */}
      <div className="row">
        <div className="col-12 mb-4">
          <ChargesPanel
            title="Doctor Consultation"
            charges={charges.consultation}
            category="consultation"
            isEditable={!isDischarged}
            onEdit={handleEditConsultation}
          />
        </div>
        <div className="col-12 mb-4">
          <ChargesPanel
            title="Therapy Charges"
            charges={charges.therapy}
            category="therapy"
            isEditable={!isDischarged}
            onEdit={handleEditTherapist}
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

      {/* Action Buttons */}
      <div className="d-flex flex-wrap gap-3 mb-5">
        <Link to="/receptionist/inpatient" className="btn btn-outline-secondary">
          <ArrowBackIcon className="me-2" /> Back to Inpatients
        </Link>

        {!isDischarged && (
          <button
            className="btn btn-success"
            onClick={() => setFinalizeDialogOpen(true)}
            disabled={isDischarging}
            style={{ fontWeight: 600, padding: "10px 28px" }}
          >
            {isDischarging ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
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
      <Dialog open={editConsultationDialog.open} onClose={() => !isUpdatingConsultation && setEditConsultationDialog({ open: false, charge: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          <div className="d-flex justify-content-between align-items-center">
            <Typography variant="h6" fontWeight={700}>Edit Consultation</Typography>
            <Button onClick={() => setEditConsultationDialog({ open: false, charge: null })} disabled={isUpdatingConsultation}>
              <CloseIcon />
            </Button>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Current: <strong>{formatCurrency(editConsultationDialog.charge?.amount || 0)}</strong>
            </Typography>
          </Box>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Doctor</InputLabel>
            <Select
              value={selectedDoctor}
              label="Doctor"
              onChange={e => setSelectedDoctor(e.target.value)}
              disabled={isLoadingDoctors || isUpdatingConsultation}
            >
              <MenuItem value="">No change</MenuItem>
              {doctors.map(d => (
                <MenuItem key={d._id} value={d._id}>
                  {d.user?.name || `${d.firstName || ""} ${d.lastName || ""}`.trim()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Amount (₹)"
            type="number"
            value={consultationAmount}
            onChange={e => setConsultationAmount(e.target.value)}
            disabled={isUpdatingConsultation}
            inputProps={{ min: 0, step: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditConsultationDialog({ open: false, charge: null })} disabled={isUpdatingConsultation}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: "#8B4513" }} onClick={handleUpdateConsultation} disabled={isUpdatingConsultation || !consultationAmount}>
            {isUpdatingConsultation ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Therapist Dialog */}
      <Dialog open={editTherapistDialog.open} onClose={() => !isUpdatingTherapist && setEditTherapistDialog({ open: false, charge: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          <div className="d-flex justify-content-between align-items-center">
            <Typography variant="h6" fontWeight={700}>Edit Therapist</Typography>
            <Button onClick={() => setEditTherapistDialog({ open: false, charge: null })} disabled={isUpdatingTherapist}>
              <CloseIcon />
            </Button>
          </div>
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
              disabled={isLoadingTherapists || isUpdatingTherapist}
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
                      disabled={isUpdatingTherapist}
                    />
                    <TextField
                      label="Therapist Charge"
                      type="number"
                      size="small"
                      value={row.therapistCharge}
                      onChange={e => updateTherapyEditRow(i, "therapistCharge", e.target.value)}
                      sx={{ flex: 1 }}
                      disabled={isUpdatingTherapist}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <>
              <TextField fullWidth label="Therapy Cost (₹)" type="number" value={therapyCost} onChange={e => setTherapyCost(e.target.value)} sx={{ mt: 2 }} disabled={isUpdatingTherapist} />
              <TextField fullWidth label="Therapist Charge (₹)" type="number" value={therapistCharge} onChange={e => setTherapistCharge(e.target.value)} sx={{ mt: 2 }} disabled={isUpdatingTherapist} />
            </>
          )}

          <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(255,193,7,0.08)", borderRadius: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={replaceTherapists} onChange={e => setReplaceTherapists(e.target.checked)} disabled={isUpdatingTherapist} />}
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
          <Button onClick={() => setEditTherapistDialog({ open: false, charge: null })} disabled={isUpdatingTherapist}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: "#8B4513" }} onClick={handleUpdateTherapist} disabled={isUpdatingTherapist || !selectedTherapist}>
            {isUpdatingTherapist ? "Updating..." : "Update Therapist"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Finalize Confirmation */}
      <Dialog open={finalizeDialogOpen} onClose={() => !isDischarging && setFinalizeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <div className="d-flex justify-content-between align-items-center">
            <Typography variant="h6" fontWeight={700}>Confirm Discharge</Typography>
            <Button onClick={() => setFinalizeDialogOpen(false)} disabled={isDischarging}><CloseIcon /></Button>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          <Typography>Finalize discharge and generate invoice?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will lock the bill and mark patient as discharged.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinalizeDialogOpen(false)} disabled={isDischarging}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#4CAF50" }}
            onClick={handleFinalizeDischarge}
            disabled={isDischarging}
            startIcon={isDischarging ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
          >
            {isDischarging ? "Finalizing..." : "Confirm Discharge"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InpatientBilling;