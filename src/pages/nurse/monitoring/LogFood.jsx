import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    Box,
    Typography,
    Button,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    Stack,
    Divider,
    Checkbox,
    FormControl,
    FormGroup,
    IconButton,
    Chip,
    Alert,
    InputAdornment,
    CircularProgress,
} from "@mui/material";
import {
    BreakfastDining,
    LunchDining,
    DinnerDining,
    LocalDrink,
    Add,
    Note,
} from "@mui/icons-material";
import foodChargeService from "../../../services/foodChargeService";
import foodIntakeService from "../../../services/foodIntakeService";

function LogFoodPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const inpatientId = searchParams.get("inpatientId") || patientId;
    const patientName = searchParams.get("patientName") || "";

    const [mealCategory, setMealCategory] = useState("Breakfast");
    const [notes, setNotes] = useState("");
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [foodCharges, setFoodCharges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Map frontend category to backend category
    const categoryMap = {
        Breakfast: "breakfast",
        Lunch: "lunch",
        Dinner: "dinner",
        "Juice / Extras": "juice",
    };

    // Map backend category to frontend category
    const reverseCategoryMap = {
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        juice: "Juice / Extras",
    };

    // Fetch food charges from backend
    useEffect(() => {
        fetchFoodCharges();
    }, [mealCategory]);

    const fetchFoodCharges = async () => {
        setIsLoading(true);
        try {
            const backendCategory = categoryMap[mealCategory] || "breakfast";
            const response = await foodChargeService.getAllFoodCharges({
                category: backendCategory,
                isActive: true,
                page: 1,
                limit: 100,
            });

            if (response.success && response.data) {
                const chargesList = Array.isArray(response.data.data || response.data)
                    ? (response.data.data || response.data)
                    : [];
                // Filter only active food charges
                const activeCharges = chargesList.filter((charge) => charge.isActive !== false);
                setFoodCharges(activeCharges);
            } else {
                setFoodCharges([]);
            }
        } catch (error) {
            console.error("Error fetching food charges:", error);
            toast.error("Failed to load food items");
            setFoodCharges([]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFood = (foodId) => {
        setSelectedFoods((prev) =>
            prev.includes(foodId)
                ? prev.filter((id) => id !== foodId)
                : [...prev, foodId]
        );
    };

    const handleSave = async () => {
        if (!inpatientId || selectedFoods.length === 0) {
            toast.error("Please select at least one food item");
            return;
        }

        setIsSaving(true);
        try {
            const backendCategory = categoryMap[mealCategory] || "breakfast";
            const now = new Date();

            // Get selected food charge details
            const selectedFoodDetails = foodCharges.filter((charge) =>
                selectedFoods.includes(charge._id)
            );

            // Create food intake records for each selected food
            const promises = selectedFoodDetails.map((food) => {
                const foodDescription = notes.trim()
                    ? `${food.name}${notes.trim() ? ` - ${notes}` : ""}`
                    : food.name;

                return foodIntakeService.createFoodIntake({
                    inpatientId: inpatientId,
                    date: now.toISOString(),
                    mealType: backendCategory === "juice" ? "extra" : backendCategory,
                    foodDescription: foodDescription,
                    price: food.price !== undefined && food.price !== null ? Number(food.price) : 0,
                });
            });

            await Promise.all(promises);

            toast.success("Food intake logged successfully");
            navigate(-1); // Go back to previous page
        } catch (error) {
            console.error("Error saving food intake:", error);
            toast.error(error?.response?.data?.message || error?.message || "Failed to save food intake");
        } finally {
            setIsSaving(false);
        }
    };

    const getSelectedFoodNames = () => {
        return foodCharges
            .filter((charge) => selectedFoods.includes(charge._id))
            .map((charge) => charge.name);
    };

    return (
        <div>
            <HeadingCard
                title="Log Food Intake"
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Nurse", url: "/nurse/dashboard" },
                    { label: "Monitoring", url: "/nurse/monitoring" },
                    { label: "Log Food" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                    maxWidth: "800px",
                    mx: "auto",
                }}
            >
                <Divider sx={{ mb: 3, borderColor: "var(--color-border)" }} />

                {/* Meal Category */}
                <Field label="Meal Category">
                    <RadioGroup
                        row
                        value={mealCategory}
                        onChange={(e) => {
                            setMealCategory(e.target.value);
                            setSelectedFoods([]);
                        }}
                        sx={{ gap: 1.5, justifyContent: "space-around" }}
                    >
                        {[
                            { label: "Breakfast", icon: <BreakfastDining /> },
                            { label: "Lunch", icon: <LunchDining /> },
                            { label: "Dinner", icon: <DinnerDining /> },
                            { label: "Juice / Extras", icon: <LocalDrink /> },
                        ].map(({ label, icon }) => (
                            <FormControlLabel
                                key={label}
                                value={label}
                                control={<Radio sx={{ display: "none" }} />}
                                label={
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        sx={{
                                            px: 2.5,
                                            py: 1.5,
                                            borderRadius: 3,
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            backgroundColor:
                                                mealCategory === label
                                                    ? "var(--color-bg-card-b)"
                                                    : "var(--color-bg-input)",
                                            border:
                                                mealCategory === label
                                                    ? "2px solid var(--color-icon-2)"
                                                    : "1px solid var(--color-border)",
                                            boxShadow: mealCategory === label
                                                ? "0 2px 8px rgba(0,0,0,0.1)"
                                                : "none",
                                            "&:hover": {
                                                backgroundColor: mealCategory === label
                                                    ? "var(--color-bg-card-b)"
                                                    : "var(--color-bg-input-hover)",
                                                transform: "translateY(-1px)",
                                            },
                                        }}
                                    >
                                        <IconButton size="small" sx={{ color: mealCategory === label ? "var(--color-icon-2-dark)" : "var(--color-icon-2)" }}>
                                            {icon}
                                        </IconButton>
                                        <Typography fontSize={13} fontWeight={600}>
                                            {label}
                                        </Typography>
                                    </Stack>
                                }
                            />
                        ))}
                    </RadioGroup>
                </Field>

                {/* Food Items */}
                <Field label="Select Food Items">
                    <Chip
                        label={`${selectedFoods.length} selected`}
                        size="small"
                        sx={{
                            mb: 1.5,
                            backgroundColor: selectedFoods.length > 0 ? "var(--color-success-light)" : "var(--color-bg-card-b)",
                            color: selectedFoods.length > 0 ? "var(--color-success-dark)" : "var(--color-text-dark)",
                            fontWeight: 600,
                        }}
                    />

                    <Box
                        sx={{
                            backgroundColor: "var(--color-bg-input)",
                            border: selectedFoods.length > 0
                                ? "2px solid var(--color-success-light)"
                                : "1px solid var(--color-border)",
                            borderRadius: 2,
                            p: 2.5,
                            minHeight: 120,
                            transition: "border-color 0.2s ease",
                            "&:hover": {
                                borderColor: "var(--color-border-hover)",
                            },
                        }}
                    >
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : foodCharges.length === 0 ? (
                            <Alert severity="info" sx={{ mt: 1 }}>
                                No food items available for this category. Add custom details in notes.
                            </Alert>
                        ) : (
                            <FormControl fullWidth>
                                <FormGroup>
                                    <Stack spacing={1.5}>
                                        {foodCharges.map((food) => (
                                            <Box
                                                key={food._id}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    px: 2,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    transition: "all 0.2s ease",
                                                    backgroundColor: selectedFoods.includes(food._id)
                                                        ? "var(--color-bg-card-b)"
                                                        : "transparent",
                                                    borderLeft: selectedFoods.includes(food._id)
                                                        ? "3px solid var(--color-icon-2)"
                                                        : "none",
                                                    "&:hover": {
                                                        backgroundColor: selectedFoods.includes(food._id)
                                                            ? "var(--color-bg-card-b)"
                                                            : "var(--color-bg-input-hover)",
                                                        transform: "translateX(4px)",
                                                    },
                                                }}
                                            >
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={selectedFoods.includes(food._id) ? 600 : 400}
                                                        sx={{
                                                            color: selectedFoods.includes(food._id)
                                                                ? "var(--color-text-dark)"
                                                                : "var(--color-text)",
                                                        }}
                                                    >
                                                        {food.name}
                                                    </Typography>
                                                    {food.description && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{ display: "block", mt: 0.5 }}
                                                        >
                                                            {food.description}
                                                        </Typography>
                                                    )}
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: "block",
                                                            mt: 0.5,
                                                            fontWeight: 600,
                                                            color: "var(--color-success-dark)",
                                                        }}
                                                    >
                                                        ₹{food.price?.toLocaleString("en-IN") || "0"}
                                                    </Typography>
                                                </Box>
                                                <Checkbox
                                                    checked={selectedFoods.includes(food._id)}
                                                    onChange={() => toggleFood(food._id)}
                                                    sx={{
                                                        color: "var(--color-icon-2)",
                                                        "&.Mui-checked": {
                                                            color: "var(--color-icon-2-dark)",
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </Stack>
                                </FormGroup>
                            </FormControl>
                        )}
                    </Box>
                </Field>

                {/* Notes */}
                <Field label="Additional Notes (optional)">
                    <TextField
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Any additional notes or custom items..."
                        value={notes}
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setNotes(e.target.value);
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Note sx={{ color: "var(--color-icon-2)", mr: 1 }} />
                                </InputAdornment>
                            ),
                            endAdornment: notes.length > 0 && (
                                <InputAdornment position="end">
                                    <Chip
                                        label={`${notes.length}/500`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: 12, ml: 1 }}
                                    />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "var(--color-bg-input)",
                                borderRadius: 2,
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--color-border)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--color-border-hover)",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--color-text-b)",
                                borderWidth: 2,
                            },
                        }}
                    />
                </Field>

                <Divider sx={{ my: 3, borderColor: "var(--color-border)" }} />

                {/* Actions */}
                <Stack direction="row" justifyContent="flex-end" spacing={2}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        disabled={isSaving}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Add />}
                        onClick={handleSave}
                        disabled={!inpatientId || selectedFoods.length === 0 || isSaving}
                        sx={{
                            backgroundColor: "var(--color-btn-b)",
                            fontWeight: 700,
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                                backgroundColor: "var(--color-btn-dark-b)",
                                transform: "translateY(-1px)",
                            },
                            "&:disabled": {
                                backgroundColor: "var(--color-disabled)",
                                opacity: 0.6,
                                cursor: "not-allowed",
                            },
                        }}
                    >
                        {isSaving ? "Saving..." : "Save Intake"}
                    </Button>
                </Stack>
            </Box>
        </div>
    );
}

const Field = ({ label, children }) => (
    <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <Typography
                fontSize={13}
                fontWeight={700}
                sx={{ color: "var(--color-text-dark)" }}
            >
                {label}
            </Typography>
        </Stack>
        {children}
    </Box>
);

Field.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default LogFoodPage;
