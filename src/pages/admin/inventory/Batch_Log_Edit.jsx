import React, { useState } from "react";
import { Box, TextField, Button, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import SubmitButton from "../../../components/buttons/SubmitButton";

function Batch_Log_Edit() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        quantity: "20000",
        manufactureDate: "",
        expiryDate: "2025-11-26",
        costPrice: "10",
        sellPrice: "12",
        details: "Initial stock",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.quantity || !formData.expiryDate || !formData.costPrice || !formData.sellPrice) {
            alert("Please fill all required fields");
            return;
        }

        console.log("SUBMITTED PAYLOAD 👉", formData);
        alert("Batch updated successfully");
        navigate("/admin/batch-log");
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* HEADER */}
            <HeadingCard
                title="Edit Batch: Ashwagandha Churna-INITIAL"
                subtitle="Edit the batch details in the inventory system."
                breadcrumbItems={[
                    { label: "Admin", path: "/admin/dashboard" },
                    { label: "Batch Log", path: "/admin/batch-log" },
                    { label: "Edit" },
                ]}
            />

            {/* MAIN FORM */}
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    backgroundColor: "var(--color-bg-card)",
                    borderRadius: 4,
                    p: 4,
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-medium)",
                    mt: 3,
                }}
            >
                <Grid container spacing={3}>
                    {/* Quantity */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Quantity <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            placeholder="Enter quantity"
                            inputProps={{ min: 0 }}
                            required
                        />
                    </Grid>

                    {/* Manufacture Date */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Manufacture Date
                        </Typography>
                        <TextField
                            fullWidth
                            name="manufactureDate"
                            type="date"
                            value={formData.manufactureDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Expiry Date */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Expiry Date <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="expiryDate"
                            type="date"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    {/* Cost Price */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Cost Price <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="costPrice"
                            type="number"
                            value={formData.costPrice}
                            onChange={handleInputChange}
                            placeholder="Enter cost price"
                            inputProps={{ min: 0, step: "0.01" }}
                            required
                        />
                    </Grid>

                    {/* Sell Price */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Sell Price <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="sellPrice"
                            type="number"
                            value={formData.sellPrice}
                            onChange={handleInputChange}
                            placeholder="Enter sell price"
                            inputProps={{ min: 0, step: "0.01" }}
                            required
                        />
                    </Grid>

                    {/* Details / Remarks */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Details / Remarks
                        </Typography>
                        <TextField
                            fullWidth
                            name="details"
                            multiline
                            rows={4}
                            value={formData.details}
                            onChange={handleInputChange}
                            placeholder="Enter details or remarks"
                        />
                    </Grid>
                </Grid>

                {/* ACTIONS */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate("/admin/batch-log")}
                        sx={{ mr: 2 }}
                    >
                        Cancel
                    </Button>
                    <SubmitButton
                        text="Save Changes"
                        type="submit"
                    />
                </Box>
            </Box>
        </Box>
    );
}

export default Batch_Log_Edit;