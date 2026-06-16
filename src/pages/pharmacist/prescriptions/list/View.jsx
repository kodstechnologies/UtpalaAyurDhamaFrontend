import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
    Box,
    CircularProgress,
    Chip,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Divider,
    IconButton
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import axios from "axios";

import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../../components/card/HeadingCard";
import TableComponent from "../../../../components/table/TableComponent";
import CardBorder from "../../../../components/card/CardBorder";
import Search from "../../../../components/search/Search";
import ExportDataButton from "../../../../components/buttons/ExportDataButton";
import prescriptionService from "../../../../services/prescriptionService";
import { getApiUrl } from "../../../../../src/config/api";

function List_View_Details() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("All");

    // Payment Dialog State
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isSavingPayment, setIsSavingPayment] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        amount: "",
        method: "Cash",
        transactionId: "",
        cardDigits: "",
    });

    const fetchPrescriptions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await prescriptionService.getPendingAll_List_patientPrescriptions(1, 500);
            if (response && response.success) {
                setPrescriptions(response.data || []);
            } else {
                toast.error(response?.message || "Failed to fetch prescriptions");
                setPrescriptions([]);
            }
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch prescriptions";
            toast.error(errorMessage);
            setPrescriptions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrescriptions();
    }, [fetchPrescriptions]);

    // Group prescriptions by examination (patient + examination combination)
    const groupedPrescriptions = useMemo(() => {
        return prescriptions.map((item) => {
            const isOutside = item.recordType === "outside";
            const total = item.totalAmountWithGst || item.totalAmount || 0;
            const paid = item.padeamount ?? item.paidAmount ?? 0;
            const balance = Math.max(0, total - paid);

            const billMedicines = Array.isArray(item.dispenseLines) && item.dispenseLines.length > 0
                ? item.dispenseLines.map((line) => ({
                    medication: line.medicationName,
                    quantity: line.quantity,
                }))
                : (item.prescriptions || []).map((med) => ({
                    medication: med.medication,
                    dosage: med.dosage,
                    quantity: med.quantity,
                }));

            return {
                _id: item._id,
                recordType: item.recordType || "pharmacy",
                patientProfileId: item.patient?._id,
                patientId: isOutside
                    ? (item.outsideCustomer?.phone || "Outside")
                    : (item.patient?.patientId || "N/A"),
                name: isOutside
                    ? (item.outsideCustomer?.name || "Walk-in Customer")
                    : (item.patient?.user?.name || "Unknown"),
                uhid: isOutside ? "Outside" : (item.patient?.user?.uhid || "N/A"),
                email: isOutside
                    ? (item.outsideCustomer?.email || "")
                    : (item.patient?.user?.email || ""),
                phone: isOutside ? (item.outsideCustomer?.phone || "") : (item.patient?.user?.phone || ""),
                doctor: isOutside
                    ? ""
                    : (item.prescriptions?.[0]?.doctor?.user?.name || ""),
                status: isOutside ? "Outside" : (item.patient?.admissionStatus || "N/A"),
                total: total,
                paid: paid,
                balance: balance,
                paymentStatus: item.paymentStatus || (paid > 0 ? "Partially Paid" : "Unpaid"),
                prescriptions: billMedicines,
            };
        });
    }, [prescriptions]);

    const filteredRows = useMemo(() => {
        let rows = groupedPrescriptions;

        if (paymentFilter === "Paid") {
            rows = rows.filter((r) => r.paymentStatus === "Paid");
        } else if (paymentFilter === "Unpaid") {
            rows = rows.filter((r) => r.paymentStatus !== "Paid");
        }

        if (!searchText) return rows;

        const q = searchText.toLowerCase();

        return rows.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                (r.doctor || "").toLowerCase().includes(q) ||
                (r.email || "").toLowerCase().includes(q) ||
                (r.phone || "").toLowerCase().includes(q)
        );
    }, [searchText, paymentFilter, groupedPrescriptions]);

    const handleOpenPayment = (row) => {
        setSelectedRecord(row);
        setPaymentDetails({
            amount: row.balance > 0 ? row.balance.toFixed(2) : "",
            method: "Cash",
            transactionId: "",
            cardDigits: "",
        });
        setShowPaymentDialog(true);
    };

    const handleRecordPayment = async () => {
        if (!paymentDetails.amount || Number(paymentDetails.amount) <= 0) {
            toast.error("Please enter a valid payment amount");
            return;
        }

        if (Number(paymentDetails.amount) > selectedRecord.balance + 1) { // 1 rupee buffer for rounding
            toast.error("Payment amount cannot exceed balance due");
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

        setIsSavingPayment(true);
        const newPaidTotal = selectedRecord.paid + Number(paymentDetails.amount);
        const payload = {
            paymentAmount: Number(paymentDetails.amount),
            paymentMethod: paymentDetails.method,
            paymentStatus: derivePaymentStatusFromAmounts(selectedRecord.total, newPaidTotal),
        };

        if (paymentDetails.method !== "Cash") {
            if (paymentDetails.transactionId) {
                payload.transactionId = paymentDetails.transactionId;
            }
            if (paymentDetails.method === "Card" && paymentDetails.cardDigits) {
                payload.cardLastFourDigits = paymentDetails.cardDigits;
            }
        }

        try {
            const response = await axios.post(
                getApiUrl(`invoices/pharmacy-payment/${selectedRecord._id}`),
                payload
            );

            if (response.data.success) {
                toast.success(response.data.message || "Payment recorded successfully");
                setShowPaymentDialog(false);
                fetchPrescriptions(); // Refresh the list
            } else {
                toast.error(response.data.message || "Failed to record payment");
            }
        } catch (error) {
            console.error("Error recording payment:", error);
            toast.error(error?.response?.data?.message || "Internal server error");
        } finally {
            setIsSavingPayment(false);
        }
    };

    const columns = [
        {
            field: "name",
            header: "Patient Name",
            render: (row) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                    <Typography variant="body2">{row.name}</Typography>
                    {row.recordType === "outside" && (
                        <Chip label="Outside" size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
                    )}
                </Box>
            ),
        },
        { field: "uhid", header: "UHID" },
        { field: "patientId", header: "Patient ID" },
      
        {
            field: "paymentStatus",
            header: "Payment Status",
            render: (row) => (
                <Chip
                    label={row.paymentStatus}
                    size="small"
                    color={
                        row.paymentStatus === "Paid" ? "success" :
                            row.paymentStatus === "Partially Paid" ? "info" : "warning"
                    }
                    sx={{ fontWeight: 500 }}
                />
            )
        },
    ];

    const actions = [
        {
            label: "View Prescriptions",
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: (row) => {
                if (row.recordType === "outside") {
                    navigate(`/pharmacist/prescriptions/outside/${row._id}`);
                    return;
                }
                navigate(`/pharmacist/prescriptions/list/${row._id}?patientId=${row.patientId}`);
            },
        },
        // {
        //     label: "Record Payment",
        //     icon: <PaymentIcon fontSize="small" />,
        //     color: theme.palette.success.main,
        //     disabled: (row) => row.balance <= 0,
        //     onClick: (row) => handleOpenPayment(row),
        // },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Breadcrumb
                items={[
                    { label: "Home", url: "/" },
                    { label: "Pharmacist", url: "/pharmacist/dashboard" },
                    { label: "List of Prescriptions" },
                ]}
            />

            <HeadingCard
                title="List of Prescriptions"
                subtitle="Manage payments and dispense medications for patient prescriptions."
            />

            <CardBorder justify="between" align="center" wrap={true} padding="2rem" className="mb-[2rem]">
                <Box sx={{ display: "flex", flex: 1, gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                        <Search
                            value={searchText}
                            onChange={(val) => setSearchText(val)}
                            sx={{ flex: 1 }}
                            placeholder="Search by doctor, patient name, email, phone..."
                        />
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="payment-filter-label">Payment Status</InputLabel>
                        <Select
                            labelId="payment-filter-label"
                            value={paymentFilter}
                            label="Payment Status"
                            onChange={(e) => setPaymentFilter(e.target.value)}
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="Paid">Paid</MenuItem>
                            <MenuItem value="Unpaid">Unpaid</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="pharmacy-prescriptions.xlsx"
                    />
                </Box>
            </CardBorder>

            <TableComponent
                columns={columns}
                rows={filteredRows}
                actions={actions}
                showStatusBadge={false}
            />

            {/* Payment Dialog */}
            <Dialog
                open={showPaymentDialog}
                onClose={() => !isSavingPayment && setShowPaymentDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, boxShadow: theme.shadows[10] }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), display: 'flex' }}>
                            <AccountBalanceWalletIcon color="success" />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>Record Pharmacy Payment</Typography>
                    </Box>
                    <IconButton onClick={() => setShowPaymentDialog(false)} size="small" disabled={isSavingPayment}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ p: 3 }}>
                    {selectedRecord && (
                        <Stack spacing={3}>
                            <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Patient Details</Typography>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>{selectedRecord.name}</Typography>
                                <Typography variant="body2" color="text.secondary">UHID: {selectedRecord.uhid} | ID: {selectedRecord.patientId}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${alpha(theme.palette.error.main, 0.1)}` }}>
                                <Box>
                                    <Typography variant="caption" color="error.main" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Balance Due</Typography>
                                    <Typography variant="h5" color="error.main" fontWeight={800}>₹{selectedRecord.balance.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Total Amount</Typography>
                                    <Typography variant="body1" fontWeight={600}>₹{selectedRecord.total.toFixed(2)}</Typography>
                                </Box>
                            </Box>

                            <TextField
                                label="Payment Amount"
                                type="number"
                                fullWidth
                                value={paymentDetails.amount}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: e.target.value })}
                                InputProps={{
                                    startAdornment: <Typography sx={{ mr: 1, fontWeight: 700 }}>₹</Typography>,
                                }}
                                helperText={`Recording partial payment? Enter less than ₹${selectedRecord.balance.toFixed(2)}`}
                            />

                            <FormControl fullWidth>
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    value={paymentDetails.method}
                                    label="Payment Method"
                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, method: e.target.value })}
                                >
                                    <MenuItem value="Cash">Cash</MenuItem>
                                    <MenuItem value="Card">Card</MenuItem>
                                    <MenuItem value="Online">Online/UPI</MenuItem>
                                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                                </Select>
                            </FormControl>

                            {paymentDetails.method !== "Cash" && (
                                <TextField
                                    label={paymentDetails.method === "Card" ? "Reference Number" : "Transaction ID"}
                                    fullWidth
                                    variant="outlined"
                                    value={paymentDetails.transactionId}
                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })}
                                />
                            )}

                            {paymentDetails.method === "Card" && (
                                <TextField
                                    label="Card Last 4 Digits"
                                    fullWidth
                                    variant="outlined"
                                    value={paymentDetails.cardDigits}
                                    placeholder="XXXX"
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        setPaymentDetails({ ...paymentDetails, cardDigits: val });
                                    }}
                                />
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button onClick={() => setShowPaymentDialog(false)} color="inherit" disabled={isSavingPayment}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRecordPayment}
                        variant="contained"
                        color="success"
                        disabled={isSavingPayment || !paymentDetails.amount}
                        startIcon={isSavingPayment ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                        sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 700 }}
                    >
                        {isSavingPayment ? "Saving..." : "Confirm UPI Payment"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default List_View_Details;
