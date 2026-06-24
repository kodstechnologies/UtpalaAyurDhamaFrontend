import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Chip,
    Button,
    Stack,
    CircularProgress,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
    LocalPharmacy,
    Person,
    CalendarToday,
    Medication,
    CheckCircle,
    ArrowBack,
    Email,
    Phone,
    Print,
    Download,
    Payments,
    CreditCard,
    Smartphone,
    AccountBalance,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../../components/card/HeadingCard";
import outsideDispenseService from "../../../../services/outsideDispenseService";
import { handleOutsidePrint } from "../components/OutsideDispenseGenerator";
import { handleOutsideDownload } from "../components/OutsideDispenseDownload";
import { displayField } from "../components/outsideDispensePdfUtils";

const LIST_PATH = "/pharmacist/prescriptions/outside";
const BILL_LIST_PATH = "/pharmacist/prescriptions/list";

const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatPaymentMethod = (method) => {
    if (!method) return "";
    if (String(method).toLowerCase() === "online") return "UPI";
    return method;
};

const derivePaymentStatus = (record) => {
    const normalizedStatus = (record?.paymentStatus || "").toLowerCase();
    if (normalizedStatus === "paid") return "Paid";
    if (normalizedStatus === "partially paid") return "Unpaid";
    if (normalizedStatus === "unpaid") return "Unpaid";

    const totalAmount = Number(record?.totalAmountWithGst ?? record?.totalAmount ?? 0);
    const paidAmount = Number(record?.paidAmount || 0);
    return paidAmount >= totalAmount && totalAmount > 0 ? "Paid" : "Unpaid";
};

function DetailCard({ label, value, icon }) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: "background.default",
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: "100%",
            }}
        >
            <Typography variant="caption" color="text.secondary" display="block" mb={0.3} sx={{ fontSize: "0.7rem" }}>
                {icon && (
                    <Box component="span" sx={{ mr: 0.5, verticalAlign: "middle", fontSize: "0.9rem" }}>
                        {icon}
                    </Box>
                )}
                {label}
            </Typography>
            <Typography fontWeight={600} fontSize="0.875rem" sx={{ wordBreak: "break-word" }}>
                {displayField(value)}
            </Typography>
        </Box>
    );
}

function OutsideDispense_Details() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [record, setRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        amount: "",
        method: "Online",
        transactionId: "",
        cardDigits: "",
    });

    const fetchRecord = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await outsideDispenseService.getById(id);
            if (response?.success) {
                setRecord(response.data);
            } else {
                toast.error(response?.message || "Failed to load record");
                navigate(LIST_PATH);
            }
        } catch (error) {
            toast.error(error?.message || "Failed to load record");
            navigate(LIST_PATH);
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (id) fetchRecord();
    }, [id, fetchRecord]);

    const subtotal = Number(record?.totalAmount || 0);
    const gstRate = Number(record?.gst || 0);
    const gstAmount = Number(record?.gstAmount ?? (subtotal * gstRate) / 100);
    const totalAmount = Number(record?.totalAmountWithGst ?? subtotal + gstAmount);
    const paidAmount = Number(record?.paidAmount || 0);
    const balanceAmount = Math.max(0, Math.round((totalAmount - paidAmount) * 100) / 100);

    const handleOpenPaymentDialog = () => {
        setPaymentDetails({
            amount: balanceAmount > 0 ? balanceAmount.toFixed(2) : "",
            method: "Online",
            transactionId: "",
            cardDigits: "",
        });
        setShowPaymentDialog(true);
    };

    const handleRecordPayment = async () => {
        const paymentAmount = Number(paymentDetails.amount);

        if (balanceAmount <= 0) {
            toast.info("This bill is already fully paid");
            return;
        }

        if (!paymentDetails.amount || !Number.isFinite(paymentAmount) || paymentAmount <= 0) {
            toast.error("Please enter a valid payment amount");
            return;
        }

        if (paymentAmount > balanceAmount + 0.01) {
            toast.error(`Payment amount cannot exceed balance due (₹${balanceAmount.toFixed(2)})`);
            return;
        }

        if (paymentDetails.method === "Card") {
            if (!paymentDetails.cardDigits || paymentDetails.cardDigits.length !== 4) {
                toast.error("Please enter exactly 4 digits for the card number");
                return;
            }
            if (!paymentDetails.transactionId) {
                toast.error("Please enter a reference number or transaction ID");
                return;
            }
        } else if (paymentDetails.method !== "Cash" && !paymentDetails.transactionId) {
            toast.error("Please enter a transaction ID");
            return;
        }

        setIsSubmittingPayment(true);
        try {
            const payload = {
                paymentAmount,
                paymentMethod: paymentDetails.method,
            };

            if (paymentDetails.method !== "Cash") {
                payload.transactionId = paymentDetails.transactionId;
                if (paymentDetails.method === "Card") {
                    payload.cardLastFourDigits = paymentDetails.cardDigits;
                }
            }

            const response = await outsideDispenseService.recordPayment(id, payload);
            if (response?.success) {
                toast.success("Payment recorded successfully");
                setShowPaymentDialog(false);
                setPaymentDetails({ amount: "", method: "Online", transactionId: "", cardDigits: "" });

                const remainingBalance = Math.max(0, balanceAmount - paymentAmount);
                if (remainingBalance <= 0.01) {
                    navigate(BILL_LIST_PATH);
                } else {
                    await fetchRecord();
                }
            } else {
                toast.error(response?.message || "Failed to record payment");
            }
        } catch (error) {
            toast.error(error?.message || "Failed to record payment");
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!record) return null;

    const customerName = record.name || "Walk-in Customer";
    const medicines = record.medicines || [];
    const paymentStatus = derivePaymentStatus(record);
    const paymentMethod = formatPaymentMethod(record.paymentMethod || record.paymentDetails?.method);
    const paymentSystem = paymentMethod || "";
    const transactionId = displayField(record.transactionId || record.paymentDetails?.transactionId);

    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist/dashboard" },
        { label: "Outside Dispense", url: LIST_PATH },
        { label: customerName },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Breadcrumb items={breadcrumbItems} />
            </Box>

            <Box sx={{ mb: 4 }}>
                <HeadingCard
                    title={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                            <LocalPharmacy sx={{ color: theme.palette.primary.main }} />
                            <span>Outside Dispense</span>
                            <Chip
                                label="Dispensed"
                                color="success"
                                size="small"
                                icon={<CheckCircle />}
                            />
                        </Box>
                    }
                    subtitle="View outside walk-in customer dispense details."
                    action={
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Button
                                variant="contained"
                                startIcon={<Payments />}
                                onClick={handleOpenPaymentDialog}
                                disabled={balanceAmount <= 0}
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    "&:hover": {
                                        backgroundColor: theme.palette.primary.dark,
                                    },
                                }}
                            >
                                UPY VIA
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Print />}
                                onClick={() => handleOutsidePrint(record)}
                                sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                            >
                                Print
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() => handleOutsideDownload(record)}
                                sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                            >
                                Download
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBack />}
                                onClick={() => navigate(LIST_PATH)}
                                sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                            >
                                Back to List
                            </Button>
                        </Stack>
                    }
                />
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Person fontSize="small" />
                                Customer Information
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Full Name" value={customerName} icon={<Person fontSize="small" />} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Phone" value={record.phone} icon={<Phone fontSize="small" />} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Alternative No." value={record.alternativePhone} icon={<Phone fontSize="small" />} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Email" value={record.email} icon={<Email fontSize="small" />} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Age" value={record.age != null && record.age !== "" ? record.age : ""} />
                                </Grid>
                                <Grid item xs={12}>
                                    <DetailCard label="Address" value={record.address} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard
                                        label="Dispensed On"
                                        value={formatDate(record.createdAt)}
                                        icon={<CalendarToday fontSize="small" />}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard
                                        label="Dispensed By"
                                        value={record.dispensedBy?.name}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Payment Status" value={paymentStatus} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Payment Method" value={paymentMethod} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Payment System" value={paymentSystem} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Transaction ID" value={transactionId} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Paid Amount" value={`₹${paidAmount.toFixed(2)}`} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Balance Amount" value={`₹${balanceAmount.toFixed(2)}`} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1,
                                            backgroundColor: alpha(theme.palette.warning.main, 0.05),
                                            borderLeft: `3px solid ${theme.palette.warning.main}`,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                            Disease
                                        </Typography>
                                        <Typography fontWeight={600} fontSize="0.95rem">
                                            {displayField(record.disease)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                                <Typography variant="h6" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Medication fontSize="small" />
                                    Dispensed Medicines
                                </Typography>
                                <Chip
                                    label={`${medicines.length} item${medicines.length !== 1 ? "s" : ""}`}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>

                            <TableContainer sx={{ overflowX: "auto" }}>
                                <Table
                                    sx={{
                                        "& .MuiTableCell-head": {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                            fontWeight: 600,
                                            fontSize: "0.875rem",
                                            whiteSpace: "nowrap",
                                        },
                                    }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Medicine</TableCell>
                                            <TableCell>Frequency</TableCell>
                                            <TableCell>Duration</TableCell>
                                            <TableCell>Food Timing</TableCell>
                                            <TableCell>Food Time</TableCell>
                                            <TableCell>Dosage Schedule</TableCell>
                                            <TableCell>Subtype</TableCell>
                                            <TableCell align="center">Dispense Qty</TableCell>
                                            <TableCell align="center">Amount</TableCell>
                                            <TableCell>Notes</TableCell>
                                            <TableCell align="center">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {medicines.map((med, idx) => (
                                            <TableRow key={idx} hover>
                                                <TableCell>
                                                    <Typography fontWeight={600} fontSize="0.875rem">
                                                        {med.medicineName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{displayField(med.frequency)}</TableCell>
                                                <TableCell>{displayField(med.duration)}</TableCell>
                                                <TableCell>{displayField(med.foodTiming)}</TableCell>
                                                <TableCell>{displayField(med.foodTime)}</TableCell>
                                                <TableCell>{displayField(med.dosageSchedule)}</TableCell>
                                                <TableCell>{displayField(med.subType)}</TableCell>
                                                <TableCell align="center">{med.dispensedQuantity}</TableCell>
                                                <TableCell align="center">₹{Number(med.amount || 0).toFixed(2)}</TableCell>
                                                <TableCell>{displayField(med.notes)}</TableCell>
                                                <TableCell align="center">
                                                    <Chip label="Dispensed" size="small" color="success" variant="filled" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        width: { xs: "100%", sm: 380 },
                                        borderRadius: 2,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                                    }}
                                >
                                    <CardContent sx={{ p: 2 }}>
                                        <Stack spacing={1}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography color="text.secondary">Subtotal</Typography>
                                                <Typography fontWeight={600}>
                                                    ₹{subtotal.toFixed(2)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography color="text.secondary">GST ({gstRate}%)</Typography>
                                                <Typography fontWeight={600}>
                                                    ₹{gstAmount.toFixed(2)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography color="text.secondary">Total Amount</Typography>
                                                <Typography fontWeight={700} color="primary.main">
                                                    ₹{totalAmount.toFixed(2)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography color="text.secondary">Paid Amount</Typography>
                                                <Typography fontWeight={600} color="success.main">
                                                    ₹{paidAmount.toFixed(2)}
                                                </Typography>
                                            </Box>
                                            {balanceAmount > 0 && (
                                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                    <Typography color="text.secondary">Balance Due</Typography>
                                                    <Typography fontWeight={700} color="error.main">
                                                        ₹{balanceAmount.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Dialog
                open={showPaymentDialog}
                onClose={() => !isSubmittingPayment && setShowPaymentDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 },
                }}
            >
                <DialogTitle sx={{ pb: 1, pt: 3 }}>
                    <Typography variant="h5" fontWeight={700} textAlign="center">
                        UPI Payment
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Payment Amount"
                            type="number"
                            fullWidth
                            value={paymentDetails.amount}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: e.target.value })}
                            sx={{ mb: 2.5 }}
                            inputProps={{ min: 0, step: "0.01" }}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1, color: "text.secondary" }}>₹</Typography>,
                            }}
                            helperText={`Enter full or partial payment (balance due: ₹${balanceAmount.toFixed(2)})`}
                        />

                        <FormControl fullWidth sx={{ mb: 2.5 }}>
                            <InputLabel id="outside-payment-method-label">Payment Method</InputLabel>
                            <Select
                                labelId="outside-payment-method-label"
                                value={paymentDetails.method}
                                label="Payment Method"
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, method: e.target.value })}
                            >
                                <MenuItem value="Cash">
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Payments fontSize="small" /> Cash
                                    </Box>
                                </MenuItem>
                                <MenuItem value="Card">
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CreditCard fontSize="small" /> Card
                                    </Box>
                                </MenuItem>
                                <MenuItem value="Online">
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Smartphone fontSize="small" /> UPI
                                    </Box>
                                </MenuItem>
                                <MenuItem value="Bank Transfer">
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <AccountBalance fontSize="small" /> Bank Transfer
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {(paymentDetails.method === "Online" ||
                            paymentDetails.method === "Bank Transfer" ||
                            paymentDetails.method === "Card") && (
                            <TextField
                                label={paymentDetails.method === "Card" ? "Reference Number" : "Transaction ID"}
                                fullWidth
                                variant="outlined"
                                value={paymentDetails.transactionId}
                                onChange={(e) =>
                                    setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })
                                }
                                sx={{ mb: 2.5 }}
                                placeholder="Enter reference number"
                            />
                        )}

                        {paymentDetails.method === "Card" && (
                            <TextField
                                label="Card Last 4 Digits"
                                fullWidth
                                variant="outlined"
                                value={paymentDetails.cardDigits}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                                    setPaymentDetails({ ...paymentDetails, cardDigits: val });
                                }}
                                placeholder="XXXX"
                                sx={{ mb: 2.5 }}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={() => setShowPaymentDialog(false)}
                        disabled={isSubmittingPayment}
                        sx={{ fontWeight: 600, color: "text.secondary", textTransform: "none" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleRecordPayment}
                        disabled={isSubmittingPayment}
                        sx={{
                            px: 4,
                            fontWeight: 700,
                            textTransform: "none",
                            borderRadius: 1.5,
                            minWidth: 120,
                        }}
                    >
                        {isSubmittingPayment ? <CircularProgress size={24} color="inherit" /> : "Confirm Payment"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default OutsideDispense_Details;
