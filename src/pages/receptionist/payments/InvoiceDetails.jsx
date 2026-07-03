import { useState, useEffect, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import { toast } from "react-toastify";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import invoiceService from "../../../services/invoiceService";
import inpatientService from "../../../services/inpatientService";
import patientService from "../../../services/patientService";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PaymentIcon from "@mui/icons-material/Payment";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RestoreIcon from "@mui/icons-material/Restore";
import { invoiceHandlePrint } from "./components/invoiceHandlePrint";
import { invoiceHandleDownload } from "./components/invoiceHandleDownload";
import { getFoodChargeDisplay } from "./utils/foodChargeDisplay";

const categorizeInvoiceItem = (item) => {
  if (item.category) {
    const categoryMap = {
      consultation: "Doctor Consultation",
      therapy: "Therapy",
      food: "Food Charges",
      ward: "Bed Charges",
    };
    const mapped = categoryMap[item.category.toLowerCase()];
    if (mapped) return mapped;
    return item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase();
  }

  const name = (item.name || "").toLowerCase().trim();

  if (name.includes("food") || name.includes("meal") || name.includes("breakfast") || name.includes("lunch") || name.includes("dinner")) {
    return "Food Charges";
  }

  if (
    name.includes("ward") ||
    name.includes("bed") ||
    name.includes("room") ||
    name.includes("accommodation") ||
    name.includes("bed charge")
  ) {
    return "Bed Charges";
  }

  if (name.includes("therapy") || name.includes("session") || name.includes("treatment")) {
    return "Therapy";
  }

  if (name.includes("consultation") || name.includes("doctor") || name.includes("opd") || name.includes("ipd")) {
    return "Doctor Consultation";
  }

  return "Other";
};

const formatPaymentMethod = (method) => (method === "Online" ? "UPI" : method);

const renderPaymentReference = (payment) => {
  if (payment.transactionId) {
    return (
      <Typography variant="body2" sx={{ color: "#666" }}>
        <strong>REF ID:</strong> {payment.transactionId}
      </Typography>
    );
  }
  if (payment.cardLastFourDigits) {
    return (
      <Typography variant="body2" sx={{ color: "#666" }}>
        <strong>Card (last 4):</strong> •••• {payment.cardLastFourDigits}
      </Typography>
    );
  }
  return <Typography variant="body2" sx={{ color: "#999" }}>—</Typography>;
};

const PaymentHistoryTable = ({
  payments,
  formatDate,
  formatCurrency,
  adminViewMode,
  isAdminEditing,
  adminPayments,
  onPaymentAmountChange,
  showActions = false,
  onPrintRow,
  onDownloadRow,
  printingIndex = null,
  downloadingIndex = null,
}) => (
  <Paper
    elevation={0}
    sx={{
      overflow: "hidden",
      border: "1px solid #e7e9ee",
      borderRadius: 2,
      bgcolor: "#fff",
    }}
  >
    <Table size="small" sx={{ "& .MuiTableCell-root": { py: 1.2 } }}>
      <TableHead>
        <TableRow sx={{ bgcolor: "#f7f8fa" }}>
          <TableCell sx={{ fontWeight: 700, width: 50, color: "#4a4f57" }}>#</TableCell>
          <TableCell sx={{ fontWeight: 700, color: "#4a4f57" }}>Date</TableCell>
          <TableCell sx={{ fontWeight: 700, color: "#4a4f57" }}>Method</TableCell>
          <TableCell sx={{ fontWeight: 700, color: "#4a4f57" }}>Reference Details</TableCell>
          <TableCell align="right" sx={{ fontWeight: 700, color: "#4a4f57" }}>Amount</TableCell>
          {showActions && (
            <TableCell align="center" sx={{ fontWeight: 700, width: 110, color: "#4a4f57" }}>Action</TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {payments.map((payment, idx) => (
          <TableRow
            key={idx}
            hover
            sx={{
              "&:last-child td": { borderBottom: "none" },
              "&:hover": { bgcolor: "#fafbfd" },
            }}
          >
            <TableCell sx={{ color: "#666" }}>{idx + 1}</TableCell>
            <TableCell>{formatDate(payment.date)}</TableCell>
            <TableCell>
              <Chip
                label={formatPaymentMethod(payment.paymentMethod)}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500, borderColor: "#D4A574", color: "#D4A574" }}
              />
            </TableCell>
            <TableCell>{renderPaymentReference(payment)}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: "#2e7d32" }}>
              {adminViewMode && isAdminEditing ? (
                <TextField
                  type="number"
                  size="small"
                  value={adminPayments?.[idx]?.amount ?? payment.amount}
                  onChange={(e) => onPaymentAmountChange?.(idx, e.target.value)}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ width: 130 }}
                />
              ) : (
                formatCurrency(payment.amount)
              )}
            </TableCell>
            {showActions && (
              <TableCell align="center">
                <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                  <Tooltip title="Print">
                    <span>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => onPrintRow?.(idx)}
                        disabled={printingIndex === idx || downloadingIndex === idx}
                      >
                        {printingIndex === idx ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <PrintIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Download">
                    <span>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onDownloadRow?.(idx)}
                        disabled={printingIndex === idx || downloadingIndex === idx}
                      >
                        {downloadingIndex === idx ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <DownloadIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
);

const calculateAgeFromDob = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

const getInvoicePatientSources = (invoice) => [
  invoice?.patient,
  invoice?.examination?.patient,
  invoice?.inpatient?.patient,
].filter(Boolean);

const isGeneratedUhid = (value) => {
  if (!value || value === "N/A") return false;
  return String(value).trim().startsWith("UA");
};

const pickPatientUhid = (...values) => {
  for (const value of values) {
    if (isGeneratedUhid(value)) return String(value).trim();
  }
  return null;
};

const resolvePatientUhid = (invoice) =>
  pickPatientUhid(
    invoice?.patient?.user?.uhid,
    invoice?.patient?.uhid,
    invoice?.examination?.patient?.user?.uhid,
    invoice?.examination?.patient?.uhid,
    invoice?.inpatient?.patient?.user?.uhid,
    invoice?.inpatient?.patient?.uhid,
    invoice?.uhid,
  );

const resolvePatientId = (invoice) =>
  invoice?.patient?.patientId ||
  invoice?.examination?.patient?.patientId ||
  invoice?.inpatient?.patient?.patientId ||
  invoice?.patientId ||
  null;

const resolvePatientAgeInfo = (invoice) => {
  for (const source of getInvoicePatientSources(invoice)) {
    if (source.age != null && source.age !== "") {
      return {
        age: source.age,
        ageUnit: source.ageUnit || invoice?.patient?.ageUnit || "years",
      };
    }
  }

  if (invoice?.age != null && invoice?.age !== "") {
    return { age: invoice.age, ageUnit: invoice.ageUnit || "years" };
  }

  const dob =
    invoice?.patient?.dateOfBirth ||
    invoice?.patient?.user?.dob ||
    invoice?.patient?.user?.dateOfBirth ||
    invoice?.examination?.patient?.dateOfBirth ||
    invoice?.inpatient?.patient?.dateOfBirth;

  const calculatedAge = calculateAgeFromDob(dob);
  if (calculatedAge != null) {
    return { age: calculatedAge, ageUnit: "years" };
  }

  return null;
};

const resolvePatientGender = (invoice) => {
  for (const source of getInvoicePatientSources(invoice)) {
    const gender = source.user?.gender || source.gender;
    if (gender) return gender;
  }
  return invoice?.gender || null;
};

const formatPatientAgeLabel = (ageInfo) => {
  if (!ageInfo || ageInfo.age == null || ageInfo.age === "") return "N/A";
  const unit = String(ageInfo.ageUnit || "years").toLowerCase();
  return `${ageInfo.age} ${unit.startsWith("month") ? "m" : "y"}`;
};

const isAdminEditableInvoiceItem = (item) => {
  const category = categorizeInvoiceItem(item);
  return category === "Doctor Consultation" || category === "Therapy";
};

const isPharmacyItem = (item) =>
  item.category?.toLowerCase() === "pharmacy" || categorizeInvoiceItem(item) === "Medicines";

const recalculateAdminSummary = (form, invoiceData) => {
  if (!invoiceData) {
    return { subtotal: form.subtotal, totalPayable: form.totalPayable, amountPaid: form.amountPaid };
  }

  const subtotal = (invoiceData.items || [])
    .filter((item) => !isPharmacyItem(item))
    .reduce((sum, item, index) => {
      const editEntry = form.items.find((entry) => entry.index === index);
      const total =
        editEntry && isAdminEditableInvoiceItem(item)
          ? parseFloat(editEntry.total) || 0
          : item.total || item.amount || 0;
      return sum + total;
    }, 0);

  const pharmacySubtotal = (invoiceData.items || [])
    .filter((item) => item.category?.toLowerCase() === "pharmacy")
    .reduce((sum, item) => sum + (item.total || 0), 0);
  const taxAmount = (pharmacySubtotal * (invoiceData.taxRate || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

  let discount = 0;
  if (invoiceData.discountType === "fixed") {
    discount = Math.min(Number(invoiceData.discountValue) || 0, grandTotal);
  } else if ((invoiceData.discountRate || 0) > 0 || (invoiceData.discountValue || 0) > 0) {
    const rate = invoiceData.discountRate || invoiceData.discountValue || 0;
    discount = grandTotal * (Number(rate) / 100);
  }

  const totalPayable = Math.round(Math.max(0, grandTotal - discount) * 100) / 100;
  const amountPaid = (form.payments || []).reduce(
    (sum, payment) => sum + (parseFloat(payment.amount) || 0),
    0,
  );

  return {
    subtotal: String(subtotal),
    totalPayable: String(totalPayable),
    amountPaid: String(amountPaid),
  };
};

function InvoiceDetails({
  homeUrl = "/",
  backUrl = "/receptionist/payments",
  paymentsListUrl = "/receptionist/payments",
  paymentsListLabel = "Payments",
  adminViewMode = false,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [hasAdminDisplay, setHasAdminDisplay] = useState(false);
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [adminEditForm, setAdminEditForm] = useState({
    subtotal: "",
    totalPayable: "",
    amountPaid: "",
    payments: [],
    items: [],
  });
  const [isSavingAdminDisplay, setIsSavingAdminDisplay] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transactionId, setTransactionId] = useState("");
  const [cardLastFourDigits, setCardLastFourDigits] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [printingReport, setPrintingReport] = useState(false);
  const [paymentHistoryDialogOpen, setPaymentHistoryDialogOpen] = useState(false);
  const [downloadingPaymentIndex, setDownloadingPaymentIndex] = useState(null);
  const [printingPaymentIndex, setPrintingPaymentIndex] = useState(null);

  const breadcrumbItems = [
    { label: "Home", url: homeUrl },
    { label: paymentsListLabel, url: paymentsListUrl },
    { label: "Invoice Details" },
  ];

  const enrichInvoicePatientData = async (invoiceData) => {
    if (!invoiceData) return invoiceData;

    const existingUhid = resolvePatientUhid(invoiceData);
    const existingPatientId = resolvePatientId(invoiceData);
    const existingAgeInfo = resolvePatientAgeInfo(invoiceData);
    const existingGender = resolvePatientGender(invoiceData);

    if (existingUhid && existingPatientId && existingAgeInfo && existingGender) {
      return invoiceData;
    }

    const patientProfileId =
      invoiceData.patient?._id ||
      (typeof invoiceData.patient === "string" ? invoiceData.patient : null) ||
      invoiceData.examination?.patient?._id ||
      (typeof invoiceData.examination?.patient === "string" ? invoiceData.examination.patient : null) ||
      invoiceData.inpatient?.patient?._id ||
      (typeof invoiceData.inpatient?.patient === "string" ? invoiceData.inpatient.patient : null);

    if (!patientProfileId) return invoiceData;

    const examinationId = invoiceData.examination?._id || invoiceData.examinationId;
    const inpatientId = invoiceData.inpatient?._id || invoiceData.inpatientId;

    let patientFromBilling = null;
    let patientFromHistory = null;

    try {
      const outpatientRes = await inpatientService.getOutpatientBillingSummary(patientProfileId, { examinationId });
      if (outpatientRes?.success && outpatientRes?.data?.patient) {
        patientFromBilling = outpatientRes.data.patient;
      }
    } catch (_) {
      // Ignore; try unified billing as fallback
    }

    if (!patientFromBilling) {
      try {
        const unifiedRes = await inpatientService.getUnifiedBillingSummary(patientProfileId, inpatientId || null);
        if (unifiedRes?.success && unifiedRes?.data?.patient) {
          patientFromBilling = unifiedRes.data.patient;
        }
      } catch (_) {
        // Keep original invoice if fallback calls fail
      }
    }

    if (!existingAgeInfo || !existingGender) {
      try {
        const historyRes = await patientService.getPatientHistory(patientProfileId);
        if (historyRes?.success && historyRes?.data?.patient) {
          patientFromHistory = historyRes.data.patient;
        }
      } catch (_) {
        // Keep original invoice if history call fails
      }
    }

    if (!patientFromBilling && !patientFromHistory) return invoiceData;

    const billingAge = patientFromBilling?.dateOfBirth
      ? calculateAgeFromDob(patientFromBilling.dateOfBirth)
      : null;
    const historyAge = patientFromHistory?.dateOfBirth
      ? calculateAgeFromDob(patientFromHistory.dateOfBirth)
      : null;

    const mergedAge = existingAgeInfo?.age ?? patientFromBilling?.age ?? historyAge ?? null;
    const mergedAgeUnit =
      existingAgeInfo?.ageUnit ||
      patientFromBilling?.ageUnit ||
      (billingAge != null || historyAge != null ? "years" : "years");
    const mergedGender =
      existingGender ||
      patientFromBilling?.gender ||
      patientFromHistory?.gender ||
      null;

    const billingUhid = pickPatientUhid(patientFromBilling?.uhid);
    const historyUhid = pickPatientUhid(patientFromHistory?.uhid);
    const mergedUhid = existingUhid || billingUhid || historyUhid || null;

    return {
      ...invoiceData,
      uhid: mergedUhid || invoiceData.uhid,
      patientId:
        existingPatientId ||
        patientFromBilling?.patientId ||
        patientFromHistory?.patientId ||
        invoiceData.patientId,
      patient: {
        ...(invoiceData.patient || {}),
        uhid:
          pickPatientUhid(
            invoiceData.patient?.user?.uhid,
            invoiceData.patient?.uhid,
            billingUhid,
            historyUhid,
          ) || undefined,
        patientId:
          invoiceData.patient?.patientId ||
          patientFromBilling?.patientId ||
          patientFromHistory?.patientId ||
          undefined,
        age: mergedAge ?? invoiceData.patient?.age,
        ageUnit: mergedAgeUnit,
        gender: mergedGender ?? invoiceData.patient?.gender,
        user: {
          ...(invoiceData.patient?.user || {}),
          gender: invoiceData.patient?.user?.gender || mergedGender || undefined,
          uhid:
            pickPatientUhid(
              invoiceData.patient?.user?.uhid,
              billingUhid,
              historyUhid,
            ) || undefined,
        },
      },
    };
  };

  const fetchInvoiceDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = adminViewMode
        ? await invoiceService.getAdminInvoiceView(id)
        : await invoiceService.getInvoiceById(id);

      if (response && response.success) {
        if (adminViewMode && response.data?.invoice) {
          const enrichedInvoice = await enrichInvoicePatientData(response.data.invoice);
          setInvoice(enrichedInvoice);
          setHasAdminDisplay(Boolean(response.data.hasAdminDisplay));
        } else if (response.data) {
          const enrichedInvoice = await enrichInvoicePatientData(response.data);
          setInvoice(enrichedInvoice);
          setHasAdminDisplay(false);
        } else {
          toast.error("Failed to load invoice details");
          navigate(backUrl);
        }
      } else {
        toast.error("Failed to load invoice details");
        navigate(backUrl);
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      toast.error(error.response?.data?.message || "Failed to load invoice details");
      navigate(backUrl);
    } finally {
      setLoading(false);
    }
  };

  const populateAdminEditForm = (invoiceData) => {
    if (!invoiceData) return;
    setAdminEditForm({
      subtotal: invoiceData.subtotal ?? "",
      totalPayable: invoiceData.totalPayable ?? "",
      amountPaid: invoiceData.amountPaid ?? "",
      payments: (invoiceData.payments || []).map((payment, index) => ({
        index,
        amount: payment.amount ?? "",
        paymentMethod: payment.paymentMethod ?? "Cash",
      })),
      items: (invoiceData.items || [])
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => isAdminEditableInvoiceItem(item))
        .map(({ item, index }) => ({
          index,
          total: item.total ?? item.amount ?? "",
          unitPrice: item.unitPrice ?? item.amount ?? "",
        })),
    });
  };

  const updateAdminItemField = (itemIndex, field, value) => {
    setAdminEditForm((prev) => {
      let items = prev.items.map((entry) =>
        entry.index === itemIndex ? { ...entry, [field]: value } : entry
      );

      if (field === "unitPrice" && invoice?.items?.[itemIndex]) {
        const quantity = invoice.items[itemIndex].quantity || 1;
        const syncedTotal = (parseFloat(value) || 0) * quantity;
        items = items.map((entry) =>
          entry.index === itemIndex ? { ...entry, total: String(syncedTotal) } : entry
        );
      }

      const summary = recalculateAdminSummary({ ...prev, items }, invoice);
      return { ...prev, items, ...summary };
    });
  };

  const updateAdminPaymentAmount = (paymentIndex, value) => {
    setAdminEditForm((prev) => {
      const payments = prev.payments.map((item, i) =>
        i === paymentIndex ? { ...item, amount: value } : item
      );
      const summary = recalculateAdminSummary({ ...prev, payments }, invoice);
      return { ...prev, payments, ...summary };
    });
  };

  const getAdminItemField = (itemIndex, field, fallback) => {
    const entry = adminEditForm.items.find((item) => item.index === itemIndex);
    if (!entry || entry[field] === "" || entry[field] == null) return fallback;
    return entry[field];
  };

  const getDisplayItemAmount = (item, field) => {
    const fallback = item[field] ?? item.amount ?? 0;
    if (adminViewMode && isAdminEditing) {
      return getAdminItemField(item.originalIndex, field, fallback);
    }
    return fallback;
  };

  const getCategoryDisplayTotal = (items) =>
    items.reduce((sum, item) => {
      const total = adminViewMode && isAdminEditing
        ? parseFloat(getAdminItemField(item.originalIndex, "total", item.total || item.amount || 0)) || 0
        : (item.total || item.amount || 0);
      return sum + total;
    }, 0);

  const handleStartAdminEdit = () => {
    if (invoice) {
      populateAdminEditForm(invoice);
      setIsAdminEditing(true);
    }
  };

  const handleCancelAdminEdit = () => {
    if (invoice) populateAdminEditForm(invoice);
    setIsAdminEditing(false);
  };

  const handleSaveAdminDisplay = async () => {
    try {
      setIsSavingAdminDisplay(true);
      const payload = {
        subtotal: parseFloat(adminEditForm.subtotal) || 0,
        totalPayable: parseFloat(adminEditForm.totalPayable) || 0,
        amountPaid: parseFloat(adminEditForm.amountPaid) || 0,
        payments: adminEditForm.payments.map((payment, index) => ({
          index: payment.index != null ? payment.index : index,
          amount: parseFloat(payment.amount) || 0,
        })),
        items: adminEditForm.items.map((item, index) => ({
          index: item.index != null ? item.index : index,
          total: parseFloat(item.total) || 0,
          unitPrice: parseFloat(item.unitPrice) || 0,
        })),
      };

      const response = await invoiceService.saveAdminInvoiceDisplay(id, payload);
      if (response?.success) {
        toast.success("Admin display values saved. Only visible in admin panel.");
        const updatedInvoice = response.data?.invoice || invoice;
        setInvoice(updatedInvoice);
        populateAdminEditForm(updatedInvoice);
        setHasAdminDisplay(true);
        setIsAdminEditing(false);
      } else {
        toast.error(response?.message || "Failed to save admin display values");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to save admin display values");
    } finally {
      setIsSavingAdminDisplay(false);
    }
  };

  const handleResetAdminDisplay = async () => {
    try {
      setIsSavingAdminDisplay(true);
      const response = await invoiceService.resetAdminInvoiceDisplay(id);
      if (response?.success) {
        toast.success("Reset to original invoice values.");
        setIsAdminEditing(false);
        await fetchInvoiceDetails();
      } else {
        toast.error(response?.message || "Failed to reset admin display values");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to reset admin display values");
    } finally {
      setIsSavingAdminDisplay(false);
    }
  };

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id, navigate]);

  const handleOpenPaymentDialog = () => {
    const balanceDue = (invoice?.totalPayable || 0) - (invoice?.amountPaid || 0);
    setPaymentAmount(balanceDue > 0 ? balanceDue.toString() : "");
    setPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setPaymentAmount("");
    setPaymentMethod("Cash");
    setTransactionId("");
    setCardLastFourDigits("");
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (
      (paymentMethod === "UPI" || paymentMethod === "Bank Transfer" || paymentMethod === "Card") &&
      !transactionId
    ) {
      toast.error("Transaction ID is required for this payment method");
      return;
    }

    if (paymentMethod === "Card" && (!cardLastFourDigits || cardLastFourDigits.length !== 4)) {
      toast.error("Please enter the last 4 digits of the card");
      return;
    }

    const balanceDue = (invoice?.totalPayable || 0) - (invoice?.amountPaid || 0);
    const paymentValue = parseFloat(paymentAmount);

    if (paymentValue > balanceDue) {
      toast.error(`Payment cannot exceed balance due of ${formatCurrency(balanceDue)}`);
      return;
    }

    try {
      setIsRecordingPayment(true);
      const response = await invoiceService.recordPayment(
        id,
        paymentValue,
        paymentMethod,
        transactionId || undefined,
        cardLastFourDigits || undefined,
      );

      if (response && response.success) {
        toast.success("Payment recorded successfully!");
        setPaymentDialogOpen(false);
        handleClosePaymentDialog();
        await fetchInvoiceDetails();
      } else {
        toast.error(response?.message || "Failed to record payment");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupItemsByCategory = (items) => {
    if (!items || !Array.isArray(items)) return {};

    const grouped = {};
    items.forEach((item, index) => {
      // Skip pharmacy/medicines completely
      if (item.category?.toLowerCase() === "pharmacy" || categorizeInvoiceItem(item) === "Medicines") {
        return;
      }

      const category = categorizeInvoiceItem(item);
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({ ...item, originalIndex: index });
    });

    return grouped;
  };

  const getCategoryOrder = () => [
    "Doctor Consultation",
    "Therapy",
    "Food Charges",
    "Bed Charges",
    "Other",
  ];

  const handleDownloadPdf = async () => {
    try {
      setDownloadingReport(true);
      await invoiceHandleDownload(invoice);
    } finally {
      setDownloadingReport(false);
    }
  };

  const handlePrint = async () => {
    try {
      setPrintingReport(true);
      await invoiceHandlePrint(invoice);
    } finally {
      setPrintingReport(false);
    }
  };

  const handleDownloadSinglePayment = async (paymentIndex) => {
    try {
      setDownloadingPaymentIndex(paymentIndex);
      const invoiceNo = (invoice.invoiceNumber || "invoice").replace(/[/\\]/g, "-");
      await invoiceHandleDownload(invoice, {
        paymentIndex,
        fileName: `Payment_${paymentIndex + 1}_${invoiceNo}.pdf`,
        successMessage: `Payment ${paymentIndex + 1} downloaded successfully`,
      });
    } finally {
      setDownloadingPaymentIndex(null);
    }
  };

  const handlePrintSinglePayment = async (paymentIndex) => {
    try {
      setPrintingPaymentIndex(paymentIndex);
      await invoiceHandlePrint(invoice, { paymentIndex });
    } finally {
      setPrintingPaymentIndex(null);
    }
  };

  const handleDownloadDischargeReport = async () => {
    await invoiceHandleDownload(invoice);
  };

  if (loading) {
    return (
      <Box sx={{ p: 5, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ p: 4 }}>
        <div className="alert alert-danger">Invoice not found.</div>
      </Box>
    );
  }

  const groupedItems = groupItemsByCategory(invoice.items || []);
  const categoryOrder = getCategoryOrder();
  const canEditAdminDisplay =
    invoice.amountPaid > 0 || (invoice.payments && invoice.payments.length > 0);
  const editTotalPayable = parseFloat(adminEditForm.totalPayable) || 0;
  const editAmountPaid = parseFloat(adminEditForm.amountPaid) || 0;
  const editBalanceDue = editTotalPayable - editAmountPaid;

  return (
    <Box sx={{ padding: "20px" }} className="invoice-details-page">
      <Breadcrumb items={breadcrumbItems} />

      <HeadingCardingCard
        category="INVOICE DETAILS"
        title={`Invoice #${invoice.invoiceNumber}`}
        subtitle="View complete invoice information"
      />

      {adminViewMode && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ p: 2, bgcolor: "#fff8e1", borderRadius: 1, border: "1px solid #ffe082" }}>
            <Typography variant="body2" sx={{ color: "#795548", fontWeight: 500 }}>
              Admin display mode: edited values appear only in the admin panel. Reception keeps the original invoice.
            </Typography>
            {hasAdminDisplay && (
              <Chip label="Custom admin values applied" size="small" color="warning" sx={{ mt: 1 }} />
            )}
            {isAdminEditing && (
              <Chip label="Editing on this page" size="small" color="info" sx={{ mt: 1, ml: hasAdminDisplay ? 1 : 0 }} />
            )}
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(backUrl)}
          sx={{ borderColor: "#D4A574", color: "#D4A574" }}
        >
          Back to {paymentsListLabel}
        </Button>

        {!adminViewMode && (invoice.totalPayable - (invoice.amountPaid || 0)) > 0 && (
          <Button
            variant="contained"
            startIcon={<PaymentIcon />}
            onClick={handleOpenPaymentDialog}
            sx={{ backgroundColor: "#ff9800" }}
          >
            Record Payment
          </Button>
        )}

        {adminViewMode && canEditAdminDisplay && !isAdminEditing && (
          <Button
            variant="contained"
            startIcon={<EditOutlinedIcon />}
            onClick={handleStartAdminEdit}
            sx={{ backgroundColor: "#1976d2" }}
          >
            Edit Values
          </Button>
        )}

        {adminViewMode && isAdminEditing && (
          <>
            <Button
              variant="contained"
              onClick={handleSaveAdminDisplay}
              disabled={isSavingAdminDisplay}
              sx={{ bgcolor: "#1976d2" }}
            >
              {isSavingAdminDisplay ? "Saving..." : "Save Changes"}
            </Button>
            {hasAdminDisplay && (
              <Button
                variant="outlined"
                startIcon={<RestoreIcon />}
                onClick={handleResetAdminDisplay}
                disabled={isSavingAdminDisplay}
                color="warning"
              >
                Reset to Original
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={handleCancelAdminEdit}
              disabled={isSavingAdminDisplay}
            >
              Cancel
            </Button>
          </>
        )}

        {(!adminViewMode || !isAdminEditing) && invoice.prescription && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPdf}
            disabled={downloadingReport}
            sx={{ borderColor: "#1976d2", color: "#1976d2" }}
          >
            {downloadingReport ? "Preparing..." : "Download PDF"}
          </Button>
        )}

        {(!adminViewMode || !isAdminEditing) && (invoice.inpatient || invoice.patient) && (
          <>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPdf}
              disabled={downloadingReport}
              sx={{ backgroundColor: "#1976d2" }}
            >
              {downloadingReport ? "Preparing..." : "Download Report"}
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              disabled={printingReport}
              sx={{ backgroundColor: "#4CAF50" }}
            >
              {printingReport ? "Preparing..." : "Print Report"}
            </Button>
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={() => setPaymentHistoryDialogOpen(true)}
              sx={{ backgroundColor: "#D4A574", "&:hover": { backgroundColor: "#c49563" } }}
            >
              Payment History
            </Button>
          </>
        )}
      </Box>

      <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 4, ...(isAdminEditing ? { border: "2px solid #1976d2" } : {}) }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box mb={4}>
            <Typography variant="h4" fontWeight={700} color="#1a1a1a">
              Utpala Ayurdhama
            </Typography>
            <Typography variant="body2" color="#666">
              Invoice #{invoice.invoiceNumber}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Patient & Invoice Info */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4, mb: 4 }}>
            {/* Patient */}
            <Box>
              <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                <PersonIcon sx={{ color: "#D4A574" }} /> Patient Information
              </Typography>
              <Box sx={{ bgcolor: "#f8f9fa", p: 2, borderRadius: 1 }}>
                <Typography><strong>Name:</strong> {invoice.patient?.user?.name || invoice.patient?.name || invoice.patientName || "N/A"}</Typography>
                <Typography>
                  <strong>UHID:</strong> {resolvePatientUhid(invoice) || "N/A"}
                </Typography>
                <Typography>
                  <strong>Patient ID:</strong> {resolvePatientId(invoice) || "N/A"}
                </Typography>
                <Typography>
                  <strong>Age:</strong> {formatPatientAgeLabel(resolvePatientAgeInfo(invoice))}
                </Typography>
                <Typography>
                  <strong>Gender:</strong> {resolvePatientGender(invoice) || "N/A"}
                </Typography>
                <Typography><strong>Phone:</strong> {invoice.patient?.user?.phone || "N/A"}</Typography>
                {invoice.patient?.alternativeNumber && (
                  <Typography><strong>Alternative Number:</strong> {invoice.patient.alternativeNumber}</Typography>
                )}
                <Typography><strong>Email:</strong> {invoice.patient?.user?.email || "_"}</Typography>
              </Box>
            </Box>

            {/* Invoice Info */}
            <Box>
              <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                <ReceiptIcon sx={{ color: "#D4A574" }} /> Invoice Information
              </Typography>
              <Box sx={{ bgcolor: "#f8f9fa", p: 2, borderRadius: 1 }}>
                <Typography><strong>Date:</strong> {formatDate(invoice.createdAt)}</Typography>
                <Typography>
                  <strong>Type:</strong>{" "}
                  {invoice.inpatient ? (
                    <Chip
                      label="IN-PATIENT"
                      size="small"
                      sx={{ bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: 600, ml: 1 }}
                    />
                  ) : invoice.examination?.isDaycare ? (
                    <Chip
                      label="DAYCARE"
                      size="small"
                      sx={{ bgcolor: "#e0f7fa", color: "#00838f", fontWeight: 600, ml: 1 }}
                    />
                  ) : (
                    <Chip
                      label="OUT-PATIENT"
                      size="small"
                      sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 600, ml: 1 }}
                    />
                  )}
                </Typography>
                {invoice.doctor && (
                  <Typography>
                    <strong>Doctor:</strong>{" "}
                    {invoice.doctor.firstName
                      ? `${invoice.doctor.firstName} ${invoice.doctor.lastName === "Profile"
                        ? ""
                        : invoice.doctor.lastName || ""
                      }`
                      : invoice.doctor.user?.name || "N/A"}
                  </Typography>
                )}
                {invoice.referredBy && (
                  <Typography><strong>Referred By:</strong> {invoice.referredBy}</Typography>
                )}
                {invoice.consultedBy && (
                  <Typography><strong>Consulted By:</strong> {invoice.consultedBy}</Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Items Tables — Categorized individually */}
          <Typography variant="h6" fontWeight={600} mb={2}>
            Invoice Items
          </Typography>

          {Object.keys(groupedItems).length > 0 ? (
            categoryOrder.map((category) => {
              const items = groupedItems[category];
              if (!items?.length) return null;

              const catTotal = getCategoryDisplayTotal(items);
              const isTherapy = category === "Therapy";
              const isConsultation = category === "Doctor Consultation";
              const isBedCharges = category === "Bed Charges";
              const isEditableCategory = isConsultation || isTherapy;

              // Skip rendering "Doctor Consultation" if its total is 0
              if (isConsultation && catTotal === 0) return null;

              return (
                <Box key={category} mb={4}>
                  <Paper sx={{ overflow: "hidden" }}>
                    <Box sx={{ bgcolor: "#e8f4f8", px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ fontWeight: 700, m: 0 }}>{category}</Typography>
                      <Typography sx={{ fontWeight: 700, color: "#1a1a1a", m: 0 }}>
                        Total: {formatCurrency(catTotal)}
                      </Typography>
                    </Box>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                          <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                          {isConsultation ? (
                            <TableCell sx={{ fontWeight: 600 }}>Doctor Name</TableCell>
                          ) : !isBedCharges && !isTherapy ? (
                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                          ) : null}
                          {isTherapy && <TableCell sx={{ fontWeight: 600 }}>Treatment Description</TableCell>}
                          {isTherapy && <TableCell align="center" sx={{ fontWeight: 600 }}>Sessions</TableCell>}
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Unit Price</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item, idx) => {
                          const foodDisplay = category === "Food Charges" ? getFoodChargeDisplay(item) : null;
                          return (
                          <Fragment key={idx}>
                          <TableRow hover>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>
                              {foodDisplay?.name || item.name}
                              {isTherapy && (
                                <Typography variant="body2" sx={{ color: "#666", mt: 0.5, whiteSpace: "pre-line" }}>
                                  {item.subTherapy || "_"}
                                </Typography>
                              )}
                              {item.remarks && (
                                <Typography variant="caption" sx={{ display: "block", color: "#666", mt: 0.5 }}>
                                  <strong>Remarks:</strong> {item.remarks}
                                </Typography>
                              )}
                            </TableCell>
                            {isConsultation && (
                              <TableCell>
                                <Typography variant="body2">
                                  {(item.total || item.amount || 0) > 0 ? (item.doctorName || invoice.doctor?.user?.name || "") : ""}
                                </Typography>
                              </TableCell>
                            )}
                            {!isBedCharges && !isTherapy && !isConsultation && (
                              <TableCell>
                                {(foodDisplay?.description || item.description) ? (
                                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                                    {foodDisplay?.description || item.description}
                                  </Typography>
                                ) : "—"}
                              </TableCell>
                            )}
                            {isTherapy && (
                              <TableCell>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                                  {item.description || item.subTherapyDescription || "_"}
                                </Typography>
                              </TableCell>
                            )}
                            {isTherapy && <TableCell align="center">{item.quantity || 1}</TableCell>}
                            <TableCell align="right">
                              {adminViewMode && isAdminEditing && isEditableCategory ? (
                                <TextField
                                  type="number"
                                  size="small"
                                  value={getDisplayItemAmount(item, "unitPrice")}
                                  onChange={(e) => updateAdminItemField(item.originalIndex, "unitPrice", e.target.value)}
                                  inputProps={{ min: 0, step: 0.01 }}
                                  sx={{ width: 120 }}
                                />
                              ) : (
                                formatCurrency(item.unitPrice || item.amount)
                              )}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              {adminViewMode && isAdminEditing && isEditableCategory ? (
                                <TextField
                                  type="number"
                                  size="small"
                                  value={getDisplayItemAmount(item, "total")}
                                  onChange={(e) => updateAdminItemField(item.originalIndex, "total", e.target.value)}
                                  inputProps={{ min: 0, step: 0.01 }}
                                  sx={{ width: 120 }}
                                />
                              ) : (
                                formatCurrency(item.total || item.amount)
                              )}
                            </TableCell>
                          </TableRow>
                          </Fragment>
                        );
                        })}
                      </TableBody>
                    </Table>
                  </Paper>
                </Box>
              );
            })
          ) : (
            <Paper sx={{ overflow: "hidden", mb: 4 }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell align="center" sx={{ py: 4, color: "#999" }}>
                      No items found
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          )}

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                <PaymentIcon sx={{ color: "#D4A574" }} /> Payment History
              </Typography>
              <PaymentHistoryTable
                payments={invoice.payments}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                adminViewMode={adminViewMode}
                isAdminEditing={isAdminEditing}
                adminPayments={adminEditForm.payments}
                onPaymentAmountChange={updateAdminPaymentAmount}
              />
            </Box>
          )}

          {/* Summary */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
            <Box sx={{ width: { xs: "100%", sm: 350 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography color="#666">Subtotal:</Typography>
                {adminViewMode && isAdminEditing ? (
                  <TextField
                    type="number"
                    size="small"
                    value={adminEditForm.subtotal}
                    onChange={(e) => setAdminEditForm((prev) => ({ ...prev, subtotal: e.target.value }))}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ width: 140 }}
                  />
                ) : (
                  <Typography fontWeight={500}>{formatCurrency(invoice.subtotal || 0)}</Typography>
                )}
              </Box>

              {(() => {
                const summarySubtotal =
                  adminViewMode && isAdminEditing
                    ? parseFloat(adminEditForm.subtotal) || 0
                    : invoice.subtotal || 0;
                const summaryTotalPayable =
                  adminViewMode && isAdminEditing
                    ? parseFloat(adminEditForm.totalPayable) || 0
                    : invoice.totalPayable || 0;
                const pharmacySubtotal = (invoice.items || [])
                  .filter(item => item.category?.toLowerCase() === "pharmacy")
                  .reduce((sum, item) => sum + (item.total || 0), 0);
                const taxAmount = (pharmacySubtotal * (invoice.taxRate || 0)) / 100;
                const grandTotal = summarySubtotal + taxAmount;
                const discountAmount = Math.max(0, grandTotal - summaryTotalPayable);

                return (
                  <>
                    {taxAmount > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography color="#666">Tax ({invoice.taxRate}%):</Typography>
                        <Typography fontWeight={500}>{formatCurrency(taxAmount)}</Typography>
                      </Box>
                    )}

                    {(invoice.discountValue > 0 || invoice.discountRate > 0) && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography color="#666">
                          Discount {invoice.discountType === "percentage" ? `(${invoice.discountRate}%)` : "(Amount)"}
                        </Typography>
                        <Typography color="#4CAF50" fontWeight={500}>
                          -{formatCurrency(discountAmount)}
                        </Typography>
                      </Box>
                    )}
                  </>
                );
              })()}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Total Payable:</Typography>
                {adminViewMode && isAdminEditing ? (
                  <TextField
                    type="number"
                    size="small"
                    value={adminEditForm.totalPayable}
                    onChange={(e) => setAdminEditForm((prev) => ({ ...prev, totalPayable: e.target.value }))}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ width: 160 }}
                  />
                ) : (
                  <Typography variant="h5" fontWeight={700} color="#4CAF50" sx={{ bgcolor: "#f1f8f4", p: 1, borderRadius: 1 }}>
                    {formatCurrency(invoice.totalPayable || 0)}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography color="#666">Amount Paid:</Typography>
                {adminViewMode && isAdminEditing ? (
                  <TextField
                    type="number"
                    size="small"
                    value={adminEditForm.amountPaid}
                    onChange={(e) => setAdminEditForm((prev) => ({ ...prev, amountPaid: e.target.value }))}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ width: 140 }}
                  />
                ) : (
                  <Typography fontWeight={500} color={invoice.amountPaid > 0 ? "#4CAF50" : "#999"}>
                    {formatCurrency(invoice.amountPaid || 0)}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography fontWeight={600} color="#666">Balance Due:</Typography>
                <Typography
                  fontWeight={700}
                  color={
                    (adminViewMode && isAdminEditing ? editBalanceDue : (invoice.totalPayable || 0) - (invoice.amountPaid || 0)) > 0
                      ? "#f57c00"
                      : "#4CAF50"
                  }
                >
                  {formatCurrency(
                    adminViewMode && isAdminEditing
                      ? editBalanceDue
                      : (invoice.totalPayable || 0) - (invoice.amountPaid || 0)
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, p: 2, bgcolor: "#f8f9fa", borderRadius: 1, textAlign: "center" }}>
            <Typography variant="body2" color="#666" fontStyle="italic">
              Thank you for choosing Utpala Ayurdhama.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Payment History Dialog */}
      <Dialog
        open={paymentHistoryDialogOpen}
        onClose={() => setPaymentHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            borderBottom: "1px solid #eef1f4",
            py: 2,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: "#fff6ec",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PaymentIcon sx={{ color: "#D4A574", fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: "1.15rem", fontWeight: 700, color: "#30343a" }}>
            Payment History
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: "#fcfcfd" }}>
          {invoice?.payments && invoice.payments.length > 0 ? (
            <Box sx={{ p: 2 }}>
              <PaymentHistoryTable
                payments={invoice.payments}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                showActions
                onPrintRow={handlePrintSinglePayment}
                onDownloadRow={handleDownloadSinglePayment}
                printingIndex={printingPaymentIndex}
                downloadingIndex={downloadingPaymentIndex}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 2.5,
                  pt: 2,
                  borderTop: "1px dashed #dde2ea",
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2, fontWeight: 500 }}>
                  Total Amount Paid:
                </Typography>
                <Typography variant="body1" fontWeight={800} sx={{ color: "#2e7d32" }}>
                  {formatCurrency(
                    invoice.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
                  )}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography color="text.secondary" align="center" sx={{ py: 3, px: 2 }}>
              No payment history available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.8, borderTop: "1px solid #eef1f4", bgcolor: "#fff" }}>
          <Button onClick={() => setPaymentHistoryDialogOpen(false)} sx={{ fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <PaymentIcon sx={{ mr: 1, color: "#ff9800" }} /> Record Payment
        </DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>
            <Typography><strong>Invoice:</strong> {invoice?.invoiceNumber}</Typography>
            <Typography><strong>Patient:</strong> {invoice?.patient?.user?.name || "N/A"}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography><strong>Total:</strong> {formatCurrency(invoice?.totalPayable || 0)}</Typography>
          <Typography><strong>Paid:</strong> {formatCurrency(invoice?.amountPaid || 0)}</Typography>
          <Typography variant="h6" color="#f57c00" mt={2}>
            Balance Due: {formatCurrency((invoice?.totalPayable || 0) - (invoice?.amountPaid || 0))}
          </Typography>

          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            sx={{ mt: 3 }}
            inputProps={{ min: 0, step: 0.01 }}
          />

          <TextField
            select
            fullWidth
            label="Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Card">Card</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
          </TextField>

          {(paymentMethod === "UPI" || paymentMethod === "Bank Transfer" || paymentMethod === "Card") && (
            <TextField
              fullWidth
              label="Transaction/Reference ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              sx={{ mt: 2 }}
              required
            />
          )}

          {paymentMethod === "Card" && (
            <TextField
              fullWidth
              label="Last 4 Digits *"
              value={cardLastFourDigits}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 4) setCardLastFourDigits(val);
              }}
              sx={{ mt: 2 }}
              inputProps={{ maxLength: 4 }}
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog} disabled={isRecordingPayment}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRecordPayment}
            disabled={isRecordingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
            sx={{ bgcolor: "#ff9800" }}
          >
            {isRecordingPayment ? "Recording..." : "Record Payment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InvoiceDetails;