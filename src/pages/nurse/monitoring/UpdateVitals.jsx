import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider,
    InputAdornment,
} from "@mui/material";
import {
    Thermostat as TempIcon,
    Bloodtype as BPIcon,
    MonitorHeart as HeartIcon,
    Speed as RespIcon,
    Note as NotesIcon,
    Add as AddIcon,
} from "@mui/icons-material";

function UpdateVitalsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const patientName = searchParams.get("patientName") || "";

    const [form, setForm] = useState({
        temperature: "",
        bloodPressure: "",
        heartRate: "",
        respiratoryRate: "",
        notes: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const payload = {
            patientId: patientId,
            ...form,
        };

        console.log("Vitals Saved:", payload);
        // Implement API call here
        navigate(-1); // Go back to previous page
    };

    return (
        <div>
            <HeadingCard
                title="Update Vitals"
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Nurse", url: "/nurse/dashboard" },
                    { label: "Monitoring", url: "/nurse/monitoring" },
                    { label: "Update Vitals" },
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

                {/* Temperature */}
                <Field label="Temperature (°F)">
                    <StyledTextField
                        name="temperature"
                        type="number"
                        value={form.temperature}
                        onChange={handleChange}
                        placeholder="e.g., 98.6"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <TempIcon sx={{ color: "var(--color-icon-2)", fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Field>

                {/* Blood Pressure */}
                <Field label="Blood Pressure (mmHg)">
                    <StyledTextField
                        name="bloodPressure"
                        value={form.bloodPressure}
                        onChange={handleChange}
                        placeholder="e.g., 120/80"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <BPIcon sx={{ color: "var(--color-icon-2)", fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Field>

                {/* Heart Rate */}
                <Field label="Heart Rate (bpm)">
                    <StyledTextField
                        name="heartRate"
                        type="number"
                        value={form.heartRate}
                        onChange={handleChange}
                        placeholder="e.g., 72"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <HeartIcon sx={{ color: "var(--color-icon-2)", fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Field>

                {/* Respiratory Rate */}
                <Field label="Respiratory Rate">
                    <StyledTextField
                        name="respiratoryRate"
                        type="number"
                        value={form.respiratoryRate}
                        onChange={handleChange}
                        placeholder="e.g., 16"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <RespIcon sx={{ color: "var(--color-icon-2)", fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Field>

                {/* Notes */}
                <Field label="Notes (optional)">
                    <StyledTextField
                        name="notes"
                        multiline
                        rows={3}
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="Any additional observations..."
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <NotesIcon sx={{ color: "var(--color-icon-2)", fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
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
                        variant="contained"
                        endIcon={<AddIcon />}
                        onClick={handleSave}
                        disabled={!patientId}
                        sx={{
                            backgroundColor: "var(--color-btn)",
                            color: "var(--color-text-light)",
                            borderRadius: "10px",
                            px: 4,
                            py: 1.2,
                            fontWeight: 700,
                            "&:hover": {
                                backgroundColor: "var(--color-btn-dark)",
                            },
                            "&:disabled": {
                                backgroundColor: "var(--color-disabled)",
                            },
                        }}
                    >
                        Save Vitals
                    </Button>
                </Box>
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
                height: "44px",
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
            "& .MuiInputBase-multiline": {
                height: "auto",
                minHeight: "100px",
            },
        }}
        {...props}
    />
);

export default UpdateVitalsPage;

