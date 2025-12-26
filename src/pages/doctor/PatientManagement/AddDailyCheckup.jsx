import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HeadingCard from "../../../components/card/HeadingCard";
import {
    TextField,
    Button,
    Box,
    Typography,
    Divider,
    Grid,
} from '@mui/material';

function AddDailyCheckupPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientName = searchParams.get("patientName") || "";

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        temperature: '',
        bloodPressure: '',
        pulseRate: '',
        spo2: '',
        notes: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Daily checkup added:', formData);
        // Implement API call here
        navigate(-1); // Go back to previous page
    };

    return (
        <div>
            <HeadingCard
                title="Add Daily Checkup"
                subtitle={`Record vitals and notes for ${patientName}`}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Patient Management", url: "/doctor/in-patients" },
                    { label: "Add Daily Checkup" },
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
                    {/* Patient Info */}
                    <Box
                        sx={{
                            mb: 3,
                            p: 2,
                            borderRadius: "12px",
                            backgroundColor: "var(--color-bg-card-b)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{ color: "var(--color-text-dark-b)", fontWeight: 600 }}
                        >
                            Patient
                        </Typography>
                        <Typography sx={{ color: "var(--color-text-dark)" }}>
                            {patientName}
                        </Typography>
                    </Box>

                    {/* Date */}
                    <StyledTextField
                        label="Date *"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* Vitals */}
                    <Grid container spacing={2} mb={2}>
                        <Grid item xs={6}>
                            <StyledTextField
                                label="Temperature (°F)"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                type="number"
                                inputProps={{ step: "0.1" }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StyledTextField
                                label="Pulse Rate (bpm)"
                                name="pulseRate"
                                type="number"
                                value={formData.pulseRate}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} mb={2}>
                        <Grid item xs={6}>
                            <StyledTextField
                                label="Blood Pressure (mmHg)"
                                name="bloodPressure"
                                value={formData.bloodPressure}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StyledTextField
                                label="SpO2 (%)"
                                name="spo2"
                                type="number"
                                value={formData.spo2}
                                onChange={handleChange}
                                inputProps={{ min: 0, max: 100, step: "0.1" }}
                            />
                        </Grid>
                    </Grid>

                    {/* Notes */}
                    <StyledTextField
                        label="Notes / Description"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        multiline
                        rows={3}
                    />

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
                            Add
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

const StyledTextField = ({ label, required = false, ...props }) => (
    <TextField
        fullWidth
        label={label}
        required={required}
        sx={{
            mb: 2,
            "& .MuiInputLabel-root": {
                color: "var(--color-text)",
            },
            "& .MuiInputLabel-root.Mui-focused": {
                color: "var(--color-text-dark-b)",
            },
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

StyledTextField.propTypes = {
    label: PropTypes.string,
    required: PropTypes.bool,
};

export default AddDailyCheckupPage;

