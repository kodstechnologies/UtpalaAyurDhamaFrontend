import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, TextField, Typography, CircularProgress, MenuItem } from "@mui/material";
import HeadingCard from "../../../components/card/HeadingCard";
import SubmitButton from "../../../components/buttons/SubmitButton";
import CancelButton from "../../../components/buttons/CancelButton";
import LocalHotelIcon from "@mui/icons-material/LocalHotel";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import wardChargeService from "../../../services/wardChargeService";

// Ward category options
const WARD_CATEGORY_OPTIONS = [
    { value: "General", label: "General" },
    { value: "Duplex", label: "Duplex" },
    { value: "Special", label: "Special" },
];

function Ward_Charges_Add() {
    const navigate = useNavigate();
    const [wardCategory, setWardCategory] = useState("");
    const [dailyRate, setDailyRate] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!wardCategory) {
            newErrors.wardCategory = "Ward category is required";
        }
        if (!dailyRate || parseFloat(dailyRate) <= 0) {
            newErrors.dailyRate = "Valid daily rate is required";
        }
        if (description && description.length > 500) {
            newErrors.description = "Description must be 500 characters or less";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                wardCategory: wardCategory.trim(),
                dailyRate: parseFloat(dailyRate),
                description: description.trim(),
                isActive: isActive,
            };
            
            const response = await wardChargeService.createWardCharge(payload);
            
            if (response.success) {
                toast.success("Ward charge created successfully");
                navigate("/admin/ward-charges/view", { state: { refresh: true } });
            } else {
                toast.error(response.message || "Failed to create ward charge");
            }
        } catch (error) {
            console.error("Error creating ward charge:", error);
            const errorMessage = error.message || error.response?.data?.message || "Failed to create ward charge";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Add Ward Charge"
                subtitle="Define daily rates for different ward categories (General, Duplex, Special)."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Ward Charges", url: "/admin/ward-charges/view" },
                    { label: "Add" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-card)",
                    borderRadius: 4,
                    p: 4,
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-medium)",
                    mt: 3,
                }}
            >
                {/* Ward Category Field */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <LocalHotelIcon fontSize="small" />
                        <Typography variant="body1" fontWeight="semibold">
                            Ward Category <span style={{ color: "red" }}>*</span>
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        select
                        value={wardCategory}
                        onChange={(e) => setWardCategory(e.target.value)}
                        disabled={isSubmitting}
                        error={!!errors.wardCategory}
                        helperText={errors.wardCategory}
                    >
                        <MenuItem value="" disabled>Select Ward Category</MenuItem>
                        {WARD_CATEGORY_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {/* Daily Rate Field */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <CurrencyRupeeIcon fontSize="small" />
                        <Typography variant="body1" fontWeight="semibold">
                            Daily Rate (₹) <span style={{ color: "red" }}>*</span>
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        type="number"
                        placeholder="Enter daily rate"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(e.target.value)}
                        disabled={isSubmitting}
                        error={!!errors.dailyRate}
                        helperText={errors.dailyRate}
                        inputProps={{ min: 0, step: 0.01 }}
                    />
                </Box>

                {/* Description Field */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <DescriptionOutlinedIcon fontSize="small" />
                        <Typography variant="body1" fontWeight="semibold">
                            Description
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Enter description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                        error={!!errors.description}
                        helperText={errors.description || `${description.length}/500 characters`}
                        inputProps={{ maxLength: 500 }}
                    />
                </Box>

                {/* Status Checkbox */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <input
                            type="checkbox"
                            id="markAsActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            disabled={isSubmitting}
                            style={{ width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        <Typography variant="body2" fontWeight="medium" component="label" htmlFor="markAsActive" sx={{ cursor: "pointer" }}>
                            Mark as Active
                        </Typography>
                    </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 3, borderTop: "1px solid var(--color-border)" }}>
                    <CancelButton onClick={() => navigate("/admin/ward-charges/view")} />

                    <SubmitButton
                        text={isSubmitting ? "Adding..." : "Add Ward Charge"}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    />
                </Box>

                {/* Footer Note */}
                <Typography variant="caption" sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                    <span style={{ color: "red" }}>●</span>
                    Required fields are marked with an asterisk (*). All changes will be saved upon submission.
                </Typography>
            </Box>
        </Box>
    );
}

export default Ward_Charges_Add;

