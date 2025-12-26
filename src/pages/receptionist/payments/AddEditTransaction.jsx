import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import WalletIcon from "@mui/icons-material/Wallet";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

function AddEditTransactionPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEdit = searchParams.get("edit") === "true";
    const transactionId = searchParams.get("transactionId") || "";

    const [formData, setFormData] = useState({
        date: searchParams.get("date") || new Date().toISOString().split("T")[0],
        type: searchParams.get("type") || "Credit",
        description: searchParams.get("description") || "",
        amount: searchParams.get("amount") || "",
        paymentMethod: searchParams.get("paymentMethod") || "Cash",
    });

    const paymentMethods = ["Cash", "UPI", "Card", "Net Banking", "Cheque", "Other"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement API call here
        console.log(isEdit ? "Transaction updated:" : "Transaction added:", formData);
        navigate(-1);
    };

    return (
        <div>
            <HeadingCard
                title={isEdit ? "Edit Transaction" : "Record New Transaction"}
                subtitle="Add or update payment transaction details"
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Payments", url: "/receptionist/payments" },
                    { label: isEdit ? "Edit Transaction" : "Add Transaction" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                    maxWidth: "700px",
                    mx: "auto",
                }}
            >
                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                            <TextField
                                label="Date *"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: "text.secondary" }} />,
                                }}
                            />
                            <FormControl fullWidth required>
                                <InputLabel>Transaction Type *</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    label="Transaction Type *"
                                >
                                    <MenuItem value="Credit">Credit (Income)</MenuItem>
                                    <MenuItem value="Debit">Debit (Expense)</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <TextField
                            label="Description / Reason *"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="e.g., Consultation Fee for John Doe"
                            required
                            fullWidth
                            sx={{ mb: 2 }}
                        />

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Amount (INR) *"
                                name="amount"
                                type="number"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="e.g., 500"
                                step="0.01"
                                min="0"
                                required
                                fullWidth
                                InputProps={{
                                    startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: "text.secondary" }} />,
                                }}
                                sx={{ mb: 2 }}
                            />
                            <FormControl fullWidth required sx={{ mb: 2 }}>
                                <InputLabel>Payment Method *</InputLabel>
                                <Select
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                    label="Payment Method *"
                                >
                                    {paymentMethods.map((method) => (
                                        <MenuItem key={method} value={method}>
                                            {method}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: "#0d6efd" }}>
                            {isEdit ? "Update Transaction" : "Save Transaction"}
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default AddEditTransactionPage;

