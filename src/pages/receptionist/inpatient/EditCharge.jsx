import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button } from "@mui/material";

function EditChargePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const chargeId = searchParams.get("chargeId") || "";
    const chargeName = searchParams.get("chargeName") || "";
    const currentAmount = searchParams.get("amount") || "";

    const [formData, setFormData] = useState({
        chargeName: chargeName,
        amount: currentAmount,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement API call here
        console.log("Charge updated:", { chargeId, ...formData });
        navigate(-1);
    };

    return (
        <div>
            <HeadingCard
                title="Edit Charge"
                subtitle="Update billing charge information"
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Inpatient Billing", url: "/receptionist/inpatient-billing" },
                    { label: "Edit Charge" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                    maxWidth: "600px",
                    mx: "auto",
                }}
            >
                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            label="Charge Name *"
                            name="chargeName"
                            fullWidth
                            required
                            value={formData.chargeName}
                            onChange={handleChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Amount (INR) *"
                            name="amount"
                            type="number"
                            fullWidth
                            required
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                        />
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: "#8B4513" }}>
                            Update Charge
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default EditChargePage;

