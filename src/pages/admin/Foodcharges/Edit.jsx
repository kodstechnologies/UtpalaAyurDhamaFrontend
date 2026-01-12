import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, TextField, Typography, CircularProgress, MenuItem } from "@mui/material";
import HeadingCard from "../../../components/card/HeadingCard";
import SubmitButton from "../../../components/buttons/SubmitButton";
import CancelButton from "../../../components/buttons/CancelButton";
import BookOpenIcon from "@mui/icons-material/Book";
import MenuIcon from "@mui/icons-material/Menu";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import foodChargeService from "../../../services/foodChargeService";

// Category options (backend uses lowercase)
const CATEGORY_OPTIONS = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "juice", label: "Juice" },
];

function Food_Charges_Edit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [foodName, setFoodName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Load existing food charge data
    useEffect(() => {
        const loadData = async () => {
            if (!id) {
                toast.error("Food charge ID is missing");
                navigate("/admin/foodcharges/view");
                return;
            }

            try {
                setIsLoading(true);
                const response = await foodChargeService.getFoodChargeById(id);
                
                if (response.success && response.data) {
                    const charge = response.data;
                    setFoodName(charge.name || "");
                    setCategory(charge.category || "");
                    setPrice(charge.price?.toString() || "");
                    setDescription(charge.description || "");
                    setIsActive(charge.isActive ?? true);
                } else {
                    toast.error(response.message || "Failed to fetch food charge details");
                    navigate("/admin/foodcharges/view");
                }
            } catch (error) {
                console.error("Error fetching food charge:", error);
                toast.error(error.message || "Failed to fetch food charge details");
                navigate("/admin/foodcharges/view");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id, navigate]);

    const validateForm = () => {
        const newErrors = {};

        if (!foodName || foodName.trim().length < 2) {
            newErrors.foodName = "Food name is required (min 2 characters)";
        }
        if (!category) {
            newErrors.category = "Category is required";
        }
        if (!price || parseFloat(price) <= 0) {
            newErrors.price = "Valid price is required";
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
                name: foodName.trim(),
                category: category.toLowerCase(), // Backend expects lowercase
                price: parseFloat(price),
                description: description.trim(),
                isActive: isActive,
            };
            
            const response = await foodChargeService.updateFoodCharge(id, payload);
            
            if (response.success) {
                toast.success("Food charge updated successfully");
                navigate("/admin/foodcharges/view");
            } else {
                toast.error(response.message || "Failed to update food charge");
            }
        } catch (error) {
            console.error("Error updating food charge:", error);
            const errorMessage = error.message || error.response?.data?.message || "Failed to update food charge";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Edit Food Charge"
                subtitle="Update food charge details"
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Food Charges", url: "/admin/foodcharges/view" },
                    { label: "Edit" },
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
                {/* Food Name Field */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <BookOpenIcon fontSize="small" />
                        <Typography variant="body1" fontWeight="semibold">
                            Food Name <span style={{ color: "red" }}>*</span>
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        placeholder="Enter food name"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        disabled={isSubmitting}
                        error={!!errors.foodName}
                        helperText={errors.foodName}
                        inputProps={{ maxLength: 120 }}
                    />
                </Box>

                {/* Category Field */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <MenuIcon fontSize="small" />
                        <Typography variant="body1" fontWeight="semibold">
                            Category <span style={{ color: "red" }}>*</span>
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isSubmitting}
                        error={!!errors.category}
                        helperText={errors.category}
                    >
                        <MenuItem value="" disabled>Select Category</MenuItem>
                        {CATEGORY_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {/* Price Field */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <CurrencyRupeeIcon fontSize="small" />
                        <Typography variant="body1" fontWeight="semibold">
                            Price (₹) <span style={{ color: "red" }}>*</span>
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        type="number"
                        placeholder="Enter price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={isSubmitting}
                        error={!!errors.price}
                        helperText={errors.price}
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
                    <CancelButton onClick={() => navigate("/admin/foodcharges/view")} />

                    <SubmitButton
                        text={isSubmitting ? "Updating..." : "Save Changes"}
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

export default Food_Charges_Edit;
