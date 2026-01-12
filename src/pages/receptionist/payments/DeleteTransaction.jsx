import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, Typography, Button } from "@mui/material";
import { toast } from "react-toastify";
import paymentService from "../../../services/paymentService";
import { useState } from "react";

function DeleteTransactionPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const description = searchParams.get("description") || "";
    const amount = searchParams.get("amount") || "";
    const transactionId = searchParams.get("transactionId") || "";
    const [loading, setLoading] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(parseFloat(amount) || 0);
    };

    const handleDelete = async () => {
        if (!transactionId) {
            toast.error("Invalid transaction ID");
            return;
        }
        setLoading(true);
        try {
            await paymentService.deletePayment(transactionId);
            toast.success("Transaction deleted successfully!");
            navigate('/receptionist/payments');
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to delete transaction.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <HeadingCard
                title="Confirm Delete"
                subtitle="Are you sure you want to delete this transaction?"
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Payments", url: "/receptionist/payments" },
                    { label: "Delete Transaction" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                    maxWidth: "500px",
                    mx: "auto",
                }}
            >
                <Typography sx={{ mb: 2 }}>
                    Are you sure you want to delete this transaction?
                </Typography>
                {description && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: "var(--color-bg-card-b)", borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Description:</strong> {description}
                        </Typography>
                        {amount && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                <strong>Amount:</strong> {formatCurrency(amount)}
                            </Typography>
                        )}
                    </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={handleDelete} disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </Box>
            </Box>
        </div>
    );
}

export default DeleteTransactionPage;

