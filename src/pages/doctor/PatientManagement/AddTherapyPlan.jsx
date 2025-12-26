import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    TextField,
    Select,
    MenuItem,
    FormControl,
    Button,
    Box,
    Typography,
    Grid,
    Divider,
} from "@mui/material";

function AddTherapyPlanPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientName = searchParams.get("patientName") || "";

    const [formData, setFormData] = useState({
        treatmentName: "",
        daysOfTreatment: "",
        treatmentTimeline: "",
        specialInstructions: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Therapy plan added:", formData);
        // Implement API call here
        navigate(-1); // Go back to previous page
    };

    const timelines = ["Morning", "Afternoon", "Evening", "Full Day"];

    return (
        <div>
            <HeadingCard
                title="Add Therapy Plan"
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Patient Management", url: "/doctor/in-patients" },
                    { label: "Add Therapy Plan" },
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
                    {/* Treatment Name */}
                    <Field label="Treatment Name">
                        <StyledTextField
                            name="treatmentName"
                            value={formData.treatmentName}
                            onChange={handleChange}
                            placeholder="Enter treatment name..."
                        />
                    </Field>

                    {/* Days & Timeline */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Field label="Days of Treatment">
                                <StyledTextField
                                    name="daysOfTreatment"
                                    type="number"
                                    value={formData.daysOfTreatment}
                                    onChange={handleChange}
                                    placeholder="Enter number of days"
                                />
                            </Field>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Field label="Treatment Timeline">
                                <FormControl fullWidth>
                                    <Select
                                        name="treatmentTimeline"
                                        value={formData.treatmentTimeline}
                                        onChange={handleChange}
                                        displayEmpty
                                        sx={{
                                            backgroundColor: "var(--color-bg-input)",
                                            borderRadius: "10px",
                                            height: "44px",
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
                                                Select timeline
                                            </Typography>
                                        </MenuItem>
                                        {timelines.map((t) => (
                                            <MenuItem key={t} value={t}>
                                                {t}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Field>
                        </Grid>
                    </Grid>

                    {/* Instructions */}
                    <Field label="Special Instructions">
                        <StyledTextField
                            name="specialInstructions"
                            value={formData.specialInstructions}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            placeholder="Enter any special instructions..."
                        />
                    </Field>

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
                            Add Therapy
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

const Field = ({ label, children }) => (
    <Box sx={{ mb: 2.5 }}>
        <Typography
            sx={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--color-text-dark)",
                mb: 0.5,
            }}
        >
            {label}
        </Typography>
        {children}
    </Box>
);

Field.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

const StyledTextField = (props) => (
    <TextField
        fullWidth
        sx={{
            "& .MuiOutlinedInput-root": {
                backgroundColor: "var(--color-bg-input)",
                borderRadius: "10px",
                "& fieldset": {
                    borderColor: "var(--color-border)",
                },
                "&:hover fieldset": {
                    borderColor: "var(--color-text-b)",
                },
                "&.Mui-focused fieldset": {
                    borderColor: "var(--color-text-dark-b)",
                    borderWidth: 2,
                },
            },
        }}
        {...props}
    />
);

export default AddTherapyPlanPage;

