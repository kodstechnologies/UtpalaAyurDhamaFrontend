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
} from "@mui/material";
import { toast } from "react-toastify";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import invoiceService from "../../../services/invoiceService";
import inpatientService from "../../../services/inpatientService";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PaymentIcon from "@mui/icons-material/Payment";
import { invoiceHandlePrint } from "./components/invoiceHandlePrint";
import { invoiceHandleDownload } from "./components/invoiceHandleDownload";

function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transactionId, setTransactionId] = useState("");
  const [cardLastFourDigits, setCardLastFourDigits] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [printingReport, setPrintingReport] = useState(false);

  const breadcrumbItems = [
    { label: "Home", url: "/" },
    { label: "Payments", url: "/receptionist/payments" },
    { label: "Invoice Details" },
  ];

  const fetchInvoiceDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await invoiceService.getInvoiceById(id);

      if (response && response.success && response.data) {
        setInvoice(response.data);
      } else {
        toast.error("Failed to load invoice details");
        navigate("/receptionist/payments");
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      toast.error(error.response?.data?.message || "Failed to load invoice details");
      navigate("/receptionist/payments");
    } finally {
      setLoading(false);
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
      (paymentMethod === "Online" || paymentMethod === "Bank Transfer" || paymentMethod === "Card") &&
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

  // Categorize items — excluding pharmacy/prescription/medicines
  const categorizeItem = (item) => {
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

  const groupItemsByCategory = (items) => {
    if (!items || !Array.isArray(items)) return {};

    const grouped = {};
    items.forEach((item, index) => {
      // Skip pharmacy/medicines completely
      if (item.category?.toLowerCase() === "pharmacy" || categorizeItem(item) === "Medicines") {
        return;
      }

      const category = categorizeItem(item);
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
    await invoiceHandleDownload(invoice);
  };

  const handlePrint = async () => {
    invoiceHandlePrint(invoice);
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

  return (
    <Box sx={{ padding: "20px" }} className="invoice-details-page">
      <Breadcrumb items={breadcrumbItems} />

      <HeadingCardingCard
        category="INVOICE DETAILS"
        title={`Invoice #${invoice.invoiceNumber}`}
        subtitle="View complete invoice information"
      />

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/receptionist/payments")}
          sx={{ borderColor: "#D4A574", color: "#D4A574" }}
        >
          Back to Payments
        </Button>

        {(invoice.totalPayable - (invoice.amountPaid || 0)) > 0 && (
          <Button
            variant="contained"
            startIcon={<PaymentIcon />}
            onClick={handleOpenPaymentDialog}
            sx={{ backgroundColor: "#ff9800" }}
          >
            Record Payment
          </Button>
        )}

        {invoice.prescription && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPdf}
            sx={{ borderColor: "#1976d2", color: "#1976d2" }}
          >
            Download PDF
          </Button>
        )}

        {(invoice.inpatient || invoice.patient) && (
          <>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => invoiceHandleDownload(invoice)}
              disabled={downloadingReport}
              sx={{ backgroundColor: "#1976d2" }}
            >
              {downloadingReport ? "Preparing..." : "Download Report"}
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => invoiceHandlePrint(invoice)}
              disabled={printingReport}
              sx={{ backgroundColor: "#4CAF50" }}
            >
              {printingReport ? "Preparing..." : "Print Report"}
            </Button>
          </>
        )}
      </Box>

      {/* Invoice Card */}
      <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 4 }}>
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
                <Typography><strong>Name:</strong> {invoice.patient?.user?.name || invoice.patient?.name || "N/A"}</Typography>
                {invoice.patient?.uhid && <Typography><strong>UHID:</strong> {invoice.patient.uhid}</Typography>}
                <Typography><strong>Age/Gender:</strong> {invoice.patient?.age || ""} / {invoice.patient?.user?.gender || invoice.patient?.gender || ""}</Typography>
                <Typography><strong>Phone:</strong> {invoice.patient?.user?.phone || ""}</Typography>
                <Typography><strong>Email:</strong> {invoice.patient?.user?.email || ""}</Typography>
              </Box>
            </Box>

            {/* Invoice Info */}
            <Box>
              <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                <ReceiptIcon sx={{ color: "#D4A574" }} /> Invoice Information
              </Typography>
              <Box sx={{ bgcolor: "#f8f9fa", p: 2, borderRadius: 1 }}>
                <Typography><strong>Date:</strong> {formatDate(invoice.createdAt)}</Typography>
                {invoice.inpatient && <Typography><strong>Type:</strong> Inpatient</Typography>}
                {invoice.doctor && (
                  <Typography><strong>Doctor:</strong> {invoice.doctor.firstName ? `${invoice.doctor.firstName} ${invoice.doctor.lastName}` : invoice.doctor.user?.name || "N/A"}</Typography>
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

              const catTotal = items.reduce((sum, i) => sum + (i.total || 0), 0);
              const isTherapy = category === "Therapy";
              const isConsultation = category === "Doctor Consultation";
              const isBedCharges = category === "Bed Charges";

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
                          ) : !isBedCharges ? (
                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                          ) : null}
                          {isTherapy && <TableCell align="center" sx={{ fontWeight: 600 }}>Sessions</TableCell>}
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Unit Price</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>
                              {item.name}
                              {item.subTherapy && (
                                <Typography variant="caption" sx={{ display: "block", color: "#666", mt: 0.5 }}>
                                  <strong>Sub-Therapy:</strong> {item.subTherapy}
                                </Typography>
                              )}
                              {item.remarks && (
                                <Typography variant="caption" sx={{ display: "block", color: "#666", mt: 0.5 }}>
                                  <strong>Remarks:</strong> {item.remarks}
                                </Typography>
                              )}
                            </TableCell>
                            {!isBedCharges && (
                              <TableCell>
                                {isConsultation ? (
                                  <Typography variant="body2">
                                    {(item.total || item.amount || 0) > 0 ? (item.doctorName || invoice.doctor?.user?.name || "") : ""}
                                  </Typography>
                                ) : item.description ? (
                                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>{item.description}</Typography>
                                ) : "—"}
                              </TableCell>
                            )}
                            {isTherapy && <TableCell align="center">{item.quantity || 1}</TableCell>}
                            <TableCell align="right">{formatCurrency(item.unitPrice || item.amount)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              {formatCurrency(item.total || item.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
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
              <Paper sx={{ overflow: "hidden", border: "1px solid #eee" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#fff8f1" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Reference Details</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.payments.map((payment, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.paymentMethod}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500, borderColor: "#D4A574", color: "#D4A574" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            {payment.transactionId && (
                              <Typography variant="body2" sx={{ color: "#666" }}>
                                <strong>ID:</strong> {payment.transactionId}
                              </Typography>
                            )}
                            {payment.cardLastFourDigits && (
                              <Typography variant="body2" sx={{ color: "#666" }}>
                                <strong>Card (last 4):</strong> •••• {payment.cardLastFourDigits}
                              </Typography>
                            )}
                            {!payment.transactionId && !payment.cardLastFourDigits && (
                              <Typography variant="body2" sx={{ color: "#999" }}>—</Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: "#4CAF50" }}>
                          {formatCurrency(payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {/* Summary */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
            <Box sx={{ width: { xs: "100%", sm: 350 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography color="#666">Subtotal:</Typography>
                <Typography fontWeight={500}>{formatCurrency(invoice.subtotal || 0)}</Typography>
              </Box>

              {(() => {
                const pharmacySubtotal = (invoice.items || [])
                  .filter(item => item.category?.toLowerCase() === "pharmacy")
                  .reduce((sum, item) => sum + (item.total || 0), 0);
                const taxAmount = (pharmacySubtotal * (invoice.taxRate || 0)) / 100;
                const grandTotal = (invoice.subtotal || 0) + taxAmount;
                const discountAmount = Math.max(0, grandTotal - (invoice.totalPayable || 0));

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
                          Discount {invoice.discountType === "percentage" ? `(${invoice.discountRate}%)` : "(Fixed)"}
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
                <Typography variant="h5" fontWeight={700} color="#4CAF50" sx={{ bgcolor: "#f1f8f4", p: 1, borderRadius: 1 }}>
                  {formatCurrency(invoice.totalPayable || 0)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography color="#666">Amount Paid:</Typography>
                <Typography fontWeight={500} color={invoice.amountPaid > 0 ? "#4CAF50" : "#999"}>
                  {formatCurrency(invoice.amountPaid || 0)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography fontWeight={600} color="#666">Balance Due:</Typography>
                <Typography fontWeight={700} color={(invoice.totalPayable - (invoice.amountPaid || 0)) > 0 ? "#f57c00" : "#4CAF50"}>
                  {formatCurrency((invoice.totalPayable || 0) - (invoice.amountPaid || 0))}
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
            <MenuItem value="Online">Online</MenuItem>
            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
          </TextField>

          {(paymentMethod === "Online" || paymentMethod === "Bank Transfer" || paymentMethod === "Card") && (
            <TextField
              fullWidth
              label="Transaction/Reference ID *"
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