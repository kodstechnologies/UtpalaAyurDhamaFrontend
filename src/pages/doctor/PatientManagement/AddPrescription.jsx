import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Box,
    Typography,
    Checkbox,
    Radio,
    Grid,
    Divider,
} from "@mui/material";

function AddPrescriptionPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientName = searchParams.get("patientName") || "";

    const [formData, setFormData] = useState({
        medicineType: "",
        medicineName: "",
        frequencyTiming: "",
        dosageTimes: { morning: false, afternoon: false, evening: false },
        administrationRoute: "Internal",
        quantity: "",
        specialInstructions: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleDosageChange = (time) => {
        setFormData((p) => ({
            ...p,
            dosageTimes: { ...p.dosageTimes, [time]: !p.dosageTimes[time] },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Prescription added:", formData);
        // Implement API call here
        navigate(-1); // Go back to previous page
    };

    const medicineTypes = ["Tablet", "Capsule", "Syrup", "Injection", "Ointment"];
    const frequencyTimings = ["Before Meal", "After Meal", "With Meal", "As Needed"];

    return (
        <div>
            <HeadingCard
                title="Add Prescription"
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Patient Management", url: "/doctor/in-patients" },
                    { label: "Add Prescription" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                }}
            >
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Medicine Type */}
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-dark)",
                                        mb: 0.5,
                                    }}
                                >
                                    Medicine Type <span style={{ color: "var(--color-error)" }}>*</span>
                                </Typography>
                                <StyledSelect
                                    name="medicineType"
                                    value={formData.medicineType}
                                    onChange={handleChange}
                                    options={medicineTypes}
                                    placeholder="Select Type"
                                />
                            </Box>
                        </Grid>

                        {/* Medicine Name */}
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-dark)",
                                        mb: 0.5,
                                    }}
                                >
                                    Medicine Name <span style={{ color: "var(--color-error)" }}>*</span>
                                </Typography>
                                <StyledTextField
                                    placeholder="Start typing medicine name..."
                                    name="medicineName"
                                    value={formData.medicineName}
                                    onChange={handleChange}
                                    required
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Dosage */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={5}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-dark)",
                                        mb: 0.5,
                                    }}
                                >
                                    Frequency / Intake Timing{" "}
                                    <span style={{ color: "var(--color-error)" }}>*</span>
                                </Typography>
                                <StyledSelect
                                    name="frequencyTiming"
                                    value={formData.frequencyTiming}
                                    onChange={handleChange}
                                    options={frequencyTimings}
                                    placeholder="Select intake timing"
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={7}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-dark)",
                                        mb: 0.8,
                                    }}
                                >
                                    Dosage Times
                                </Typography>
                                <Grid container spacing={1.5}>
                                    {["morning", "afternoon", "evening"].map((t) => (
                                        <Grid item xs={12} sm={4} key={t}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    p: 1,
                                                    borderRadius: "8px",
                                                    backgroundColor: "var(--color-bg-card-hover)",
                                                    border: "1px solid var(--color-border)",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => handleDosageChange(t)}
                                            >
                                                <Checkbox
                                                    checked={formData.dosageTimes[t]}
                                                    sx={{
                                                        p: 0.5,
                                                        color: "var(--color-text-b)",
                                                        "&.Mui-checked": {
                                                            color: "var(--color-text-dark-b)",
                                                        },
                                                    }}
                                                />
                                                <Typography
                                                    sx={{
                                                        ml: 1,
                                                        fontSize: "0.9rem",
                                                        color: "var(--color-text-dark)",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Route */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-dark)",
                                        mb: 0.5,
                                    }}
                                >
                                    Administration Route
                                </Typography>
                                <Grid container spacing={1.5}>
                                    {["Internal", "External"].map((r) => {
                                        const selected = formData.administrationRoute === r;
                                        return (
                                            <Grid item xs={6} key={r}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        p: 1,
                                                        borderRadius: "8px",
                                                        backgroundColor: selected
                                                            ? "var(--color-bg-card-b)"
                                                            : "var(--color-bg-card-hover)",
                                                        border: "1px solid var(--color-border)",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                        setFormData((p) => ({
                                                            ...p,
                                                            administrationRoute: r,
                                                        }))
                                                    }
                                                >
                                                    <Radio
                                                        checked={selected}
                                                        sx={{
                                                            p: 0.5,
                                                            color: "var(--color-text-b)",
                                                            "&.Mui-checked": {
                                                                color: "var(--color-text-dark-b)",
                                                            },
                                                        }}
                                                    />
                                                    <Typography
                                                        sx={{
                                                            ml: 1,
                                                            fontSize: "0.9rem",
                                                            color: "var(--color-text-dark)",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {r}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-dark)",
                                        mb: 0.5,
                                    }}
                                >
                                    Quantity
                                </Typography>
                                <StyledTextField
                                    name="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="Enter quantity"
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Instructions */}
                    <Box>
                        <Typography
                            sx={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "var(--color-text-dark)",
                                mb: 0.5,
                            }}
                        >
                            Instructions
                        </Typography>
                        <StyledTextField
                            name="specialInstructions"
                            value={formData.specialInstructions}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            placeholder="Enter any special instructions for the patient..."
                        />
                    </Box>

                    <Divider sx={{ my: 2, borderColor: "var(--color-border)" }} />

                    {/* Actions */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            sx={{
                                borderRadius: "10px",
                                px: 4,
                                py: 1.2,
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                backgroundColor: "var(--color-btn)",
                                color: "var(--color-text-light)",
                                fontWeight: 700,
                                borderRadius: "10px",
                                px: 4,
                                py: 1.2,
                                "&:hover": {
                                    backgroundColor: "var(--color-btn-dark)",
                                },
                            }}
                        >
                            Add Prescription
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

const StyledTextField = (props) => (
    <TextField
        fullWidth
        sx={{
            mb: 2,
            "& .MuiInputLabel-root": { color: "var(--color-text)" },
            "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-text-dark-b)" },
            "& .MuiOutlinedInput-root": {
                backgroundColor: "var(--color-bg-input)",
                borderRadius: "10px",
                "& fieldset": { borderColor: "var(--color-border)" },
                "&:hover fieldset": { borderColor: "var(--color-text-b)" },
                "&.Mui-focused fieldset": {
                    borderColor: "var(--color-text-dark-b)",
                    borderWidth: 2,
                },
            },
        }}
        {...props}
    />
);

const StyledSelect = ({ label, options, ...props }) => (
    <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: "var(--color-text)" }}>{label}</InputLabel>
        <Select
            {...props}
            label={label}
            sx={{
                backgroundColor: "var(--color-bg-input)",
                borderRadius: "10px",
                "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-border)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-text-b)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-text-dark-b)",
                    borderWidth: 2,
                },
            }}
        >
            <MenuItem value="">Select {label || "Option"}</MenuItem>
            {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                    {opt}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
);

StyledSelect.propTypes = {
    label: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AddPrescriptionPage;

