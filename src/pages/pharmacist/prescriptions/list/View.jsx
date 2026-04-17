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
import MedicationIcon from "@mui/icons-material/Medication";
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
            const response = await prescriptionService.getPendingAll_List_patientPrescriptions();
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
            const total = item.totalAmountWithGst || 0;
            const paid = item.padeamount || 0;
            const balance = Math.max(0, total - paid);

            return {
                _id: item._id,
                patientProfileId: item.patient?._id,
                patientId: item.patient?.patientId || "N/A",
                name: item.patient?.user?.name || "Unknown",
                uhid: item.patient?.user?.uhid || "N/A",
                status: item.patient?.admissionStatus || "N/A",
                total: total,
                paid: paid,
                balance: balance,
                paymentStatus: item.paymentStatus || (paid > 0 ? "Partially Paid" : "Unpaid"),
                prescriptions: (item.prescriptions || []).map((med) => ({
                    medication: med.medication,
                    dosage: med.dosage,
                    quantity: med.quantity,
                    status: med.status
                }))
            };
        });
    }, [prescriptions]);

    const filteredRows = useMemo(() => {
        if (!searchText) return groupedPrescriptions;

        const q = searchText.toLowerCase();

        return groupedPrescriptions.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.uhid.toLowerCase().includes(q) ||
                r.patientId.toLowerCase().includes(q) ||
                r.prescriptions.some((p) =>
                    p.medication?.toLowerCase().includes(q)
                )
        );
    }, [searchText, groupedPrescriptions]);

    const formatMedicines = (medicines) => {
        if (!medicines || medicines.length === 0) return "No medicines";
        return medicines.map((med, idx) => (
            <Chip
                key={idx}
                label={`${med.medication}${med.dosage ? ` - ${med.dosage}` : ""}`}
                size="small"
                icon={<MedicationIcon fontSize="small" />}
                sx={{
                    m: 0.25,
                    fontSize: "0.75rem",
                    height: "24px",
                }}
            />
        ));
    };

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
        const payload = {
            paymentAmount: Number(paymentDetails.amount),
            paymentMethod: paymentDetails.method,
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
        { field: "name", header: "Patient Name" },
        { field: "uhid", header: "UHID" },
        { field: "patientId", header: "Patient ID" },
        {
            field: "total",
            header: "Total (₹)",
            render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{row.total.toFixed(2)}</Typography>
        },
        {
            field: "paid",
            header: "Paid (₹)",
            render: (row) => <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>₹{row.paid.toFixed(2)}</Typography>
        },
        {
            field: "balance",
            header: "Balance (₹)",
            render: (row) => (
                <Typography
                    variant="body2"
                    color={row.balance > 0 ? "error.main" : "success.main"}
                    sx={{ fontWeight: 700 }}
                >
                    ₹{row.balance.toFixed(2)}
                </Typography>
            )
        },
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
        {
            field: "medicines",
            header: "Medicines Allocated",
            render: (row) => {
                if (!row.prescriptions || row.prescriptions.length === 0) {
                    return (
                        <Typography variant="body2" color="text.secondary">
                            No medicines
                        </Typography>
                    );
                }

                return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxWidth: "400px" }}>
                        {formatMedicines(row.prescriptions)}
                    </Box>
                );
            },
        },
    ];

    const actions = [
        {
            label: "View Prescriptions",
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: (row) => {
                navigate(`/pharmacist/prescriptions/list/${row._id}?patientId=${row.patientId}`);
            },
        },
        {
            label: "Record Payment",
            icon: <PaymentIcon fontSize="small" />,
            color: theme.palette.success.main,
            disabled: (row) => row.balance <= 0,
            onClick: (row) => handleOpenPayment(row),
        },
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
                <Box sx={{ flex: 1, mr: 1 }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        sx={{ flex: 1 }}
                        placeholder="Search by patient name, UHID, or medicine"
                    />
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
                        {isSavingPayment ? "Saving..." : "Record Payment"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default List_View_Details;
