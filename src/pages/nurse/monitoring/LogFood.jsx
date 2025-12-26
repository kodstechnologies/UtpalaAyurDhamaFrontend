import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
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
} from "@mui/material";
import {
    BreakfastDining,
    LunchDining,
    DinnerDining,
    LocalDrink,
    Add,
    Note,
} from "@mui/icons-material";

function LogFoodPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const patientName = searchParams.get("patientName") || "";

    const [mealCategory, setMealCategory] = useState("Breakfast");
    const [notes, setNotes] = useState("");
    const [selectedFoods, setSelectedFoods] = useState([]);

    const foodMap = {
        Breakfast: ["Oatmeal", "Eggs", "Toast", "Fruit"],
        Lunch: ["Rice", "Dal", "Vegetables", "Curd"],
        Dinner: ["Chapati", "Sabzi", "Soup"],
        "Juice / Extras": ["Orange Juice", "Milk", "Nuts"],
    };

    const foodItems = foodMap[mealCategory] || [];

    const toggleFood = (food) => {
        setSelectedFoods((prev) =>
            prev.includes(food)
                ? prev.filter((f) => f !== food)
                : [...prev, food]
        );
    };

    const handleSave = () => {
        const payload = {
            patientId: patientId,
            mealCategory,
            foods: selectedFoods,
            notes,
        };
        console.log("Saved Food Intake:", payload);
        // Implement API call here
        navigate(-1); // Go back to previous page
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
                        {foodItems.length === 0 ? (
                            <Alert severity="info" sx={{ mt: 1 }}>
                                No food items available for this category. Add custom details in notes.
                            </Alert>
                        ) : (
                            <FormControl fullWidth>
                                <FormGroup>
                                    <Stack spacing={1.5}>
                                        {foodItems.map((food) => (
                                            <Box
                                                key={food}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    px: 2,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    transition: "all 0.2s ease",
                                                    backgroundColor: selectedFoods.includes(food)
                                                        ? "var(--color-bg-card-b)"
                                                        : "transparent",
                                                    borderLeft: selectedFoods.includes(food)
                                                        ? "3px solid var(--color-icon-2)"
                                                        : "none",
                                                    "&:hover": {
                                                        backgroundColor: selectedFoods.includes(food)
                                                            ? "var(--color-bg-card-b)"
                                                            : "var(--color-bg-input-hover)",
                                                        transform: "translateX(4px)",
                                                    },
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={selectedFoods.includes(food) ? 600 : 400}
                                                    sx={{
                                                        color: selectedFoods.includes(food)
                                                            ? "var(--color-text-dark)"
                                                            : "var(--color-text)",
                                                        flexGrow: 1,
                                                    }}
                                                >
                                                    {food}
                                                </Typography>
                                                <Checkbox
                                                    checked={selectedFoods.includes(food)}
                                                    onChange={() => toggleFood(food)}
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
                        onChange={(e) => setNotes(e.target.value)}
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
                        startIcon={<Add />}
                        onClick={handleSave}
                        disabled={!patientId || selectedFoods.length === 0}
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
                        Save Intake
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

