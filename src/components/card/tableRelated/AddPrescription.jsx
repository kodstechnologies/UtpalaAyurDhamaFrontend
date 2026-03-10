import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    Radio,
    RadioGroup,
    IconButton,
    Grid,
    Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function AddPrescription({ open, onClose, patientName, onAdd }) {
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
        onAdd?.(formData);
        onClose();
    };

    const medicineTypes = ["Tablet", "Capsule", "Syrup", "Injection", "Ointment"];
    const frequencyTimings = ["Before Meal", "After Meal", "With Meal", "As Needed"];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: "18px", overflow: "hidden" },
            }}
        >
            {/* ================= HEADER ================= */}
            <DialogTitle
                sx={{
                    backgroundColor: "var(--color-bg-header)",
                    color: "var(--color-text-light)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 3,
                    py: 2,
                }}
            >
                <Box>
                    <Typography fontWeight={700} fontSize="1.2rem">
                        Add Prescription
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                        Patient: {patientName}
                    </Typography>
                </Box>

                <IconButton
                    onClick={onClose}
                    sx={{
                        color: "var(--color-text-light)",
                        "&:hover": {
                            backgroundColor: "var(--color-bg-side-bar-hover)",
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                {/* ================= CONTENT ================= */}
                <DialogContent
                    sx={{
                        backgroundColor: "var(--color-bg-a)",
                        px: 3,
                        py: 3,
                        maxHeight: "65vh",
                        overflowY: "auto",
                        /* Scrollbar styling */
                        scrollbarWidth: "thin",
                        scrollbarColor: "var(--color-border) transparent",
                        "&::-webkit-scrollbar": {
                            width: "8px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "var(--color-border)",
                            borderRadius: "8px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                            backgroundColor: "var(--color-text-b)",
                        },
                    }}
                >
                    {/* ========= MEDICINE DETAILS ========= */}

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
                                    label="" // label handled manually above
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



                    {/* ========= DOSAGE ========= */}
                    <Grid container spacing={3}>
                        {/* ================= Frequency ================= */}
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

                        {/* ================= Dosage Times ================= */}
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



                    {/* ========= ROUTE ========= */}

                    <Grid container spacing={3}>
                        {/* ================= Route ================= */}
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

                        {/* ================= Quantity ================= */}
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



                    {/* ========= INSTRUCTIONS ========= */}

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

                    {/* ========= ACTION ========= */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
                </DialogContent>
            </form>
        </Dialog>
    );
}

/* ======================= UI HELPERS ======================= */

const Section = ({ title, children }) => (
    <Box sx={{ mb: 3 }}>
        <Typography
            sx={{
                fontWeight: 700,
                color: "var(--color-text-dark-b)",
                mb: 1,
            }}
        >
            {title}
        </Typography>
        {children}
    </Box>
);

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
            <MenuItem value="">Select {label}</MenuItem>
            {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                    {opt}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
);

export default AddPrescription;