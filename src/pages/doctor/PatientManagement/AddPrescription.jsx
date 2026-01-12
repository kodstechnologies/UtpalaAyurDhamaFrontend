import { useState, useEffect, useCallback } from "react";
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
    CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function AddPrescriptionPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inpatientId = searchParams.get("inpatientId") || "";
    const patientName = searchParams.get("patientName") || "";
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Convert dosageTimes to a dosage string
    const formatDosage = () => {
        const times = [];
        if (formData.dosageTimes.morning) times.push("Morning");
        if (formData.dosageTimes.afternoon) times.push("Afternoon");
        if (formData.dosageTimes.evening) times.push("Evening");
        
        if (times.length === 0) {
            return formData.frequencyTiming || "As directed";
        }
        
        return `${times.join(", ")} - ${formData.frequencyTiming || "As directed"}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.medicineName || !formData.frequencyTiming || !formData.medicineType) {
            toast.error("Please fill in all required fields (Medicine Name, Medicine Type, Frequency).");
            return;
        }

        if (!inpatientId) {
            toast.error("Invalid patient information. Please try again.");
            navigate(-1);
            return;
        }

        setIsSubmitting(true);

        try {
            // Get existing examination for this inpatient
            let examinationId = null;
            
            try {
                const examResponse = await axios.get(
                    getApiUrl(`examinations/inpatient/${inpatientId}`),
                    { headers: getAuthHeaders() }
                );
                
                if (examResponse.data.success && examResponse.data.data && examResponse.data.data.length > 0) {
                    // Use the latest examination (already sorted by createdAt -1)
                    examinationId = examResponse.data.data[0]._id;
                }
            } catch (err) {
                console.error("Error fetching examinations:", err);
            }

            // If no examination exists, create one
            if (!examinationId) {
                try {
                    const createExamResponse = await axios.post(
                        getApiUrl(`examinations/inpatient/${inpatientId}`),
                        { complaints: "Prescription consultation" },
                        { headers: getAuthHeaders() }
                    );
                    if (createExamResponse.data.success && createExamResponse.data.data) {
                        examinationId = createExamResponse.data.data._id;
                    }
                } catch (createErr) {
                    console.error("Error creating examination:", createErr);
                    const errorMsg = createErr.response?.data?.message || "Failed to create examination";
                    toast.error(errorMsg);
                    setIsSubmitting(false);
                    return;
                }
            }

            if (!examinationId) {
                toast.error("Unable to find or create examination for this patient.");
                setIsSubmitting(false);
                return;
            }

            // Map form data to backend API structure
            const dosageString = formatDosage();
            
            const requestData = {
                medication: formData.medicineName.trim(),
                medicineType: formData.medicineType || undefined,
                administration: formData.administrationRoute || "Internal",
                dosage: dosageString,
                frequency: formData.frequencyTiming,
                duration: undefined, // Not in form, optional
                notes: formData.specialInstructions.trim() || undefined,
                quantity: formData.quantity ? parseInt(formData.quantity, 10) : 1,
            };

            // Remove undefined values
            Object.keys(requestData).forEach(key => {
                if (requestData[key] === undefined) {
                    delete requestData[key];
                }
            });

            const response = await axios.post(
                getApiUrl(`examinations/${examinationId}/prescriptions`),
                requestData,
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success("Prescription added successfully!");
                setTimeout(() => {
                    navigate(-1);
                }, 1500);
            } else {
                toast.error(response.data.message || "Failed to add prescription");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error adding prescription:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error adding prescription";
            toast.error(errorMessage);
            setIsSubmitting(false);
        }
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
                                    required
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
                                    required
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
                                    inputProps={{ min: 1 }}
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
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                                "&:disabled": {
                                    backgroundColor: "var(--color-btn)",
                                    opacity: 0.6,
                                },
                                "& .MuiCircularProgress-root": {
                                    color: "var(--color-text-light)",
                                },
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Add Prescription"}
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

const StyledSelect = ({ label, options, placeholder, required = false, ...props }) => (
    <FormControl fullWidth sx={{ mb: 2 }} required={required}>
        <InputLabel sx={{ color: "var(--color-text)" }}>{label}</InputLabel>
        <Select
            {...props}
            label={label}
            displayEmpty
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
            <MenuItem value="">
                <Typography sx={{ color: "var(--color-text)" }}>
                    {placeholder || `Select ${label || "Option"}`}
                </Typography>
            </MenuItem>
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
    placeholder: PropTypes.string,
    required: PropTypes.bool,
};

export default AddPrescriptionPage;
