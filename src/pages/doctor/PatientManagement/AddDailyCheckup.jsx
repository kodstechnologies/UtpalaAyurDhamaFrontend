import { useState, useEffect, useCallback } from 'react';
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
    CircularProgress,
} from '@mui/material';
import { toast } from "react-toastify";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function AddDailyCheckupPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inpatientId = searchParams.get("inpatientId") || "";
    const patientName = searchParams.get("patientName") || "";
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [existingCheckupId, setExistingCheckupId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        temperature: '',
        bloodPressure: '',
        pulseRate: '',
        spo2: '',
        notes: '',
    });

    // Fetch existing checkup data
    const fetchExistingCheckup = useCallback(async () => {
        if (!inpatientId) return;

        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl(`inpatients/${inpatientId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success && response.data.data) {
                const inpatient = response.data.data;
                const checkups = inpatient.dailyCheckups || [];
                
                if (checkups.length > 0) {
                    // Get the most recent checkup (sorted by date, most recent first)
                    const sortedCheckups = [...checkups].sort((a, b) => {
                        const dateA = a.date ? new Date(a.date).getTime() : 0;
                        const dateB = b.date ? new Date(b.date).getTime() : 0;
                        return dateB - dateA;
                    });
                    const latestCheckup = sortedCheckups[0];

                    if (latestCheckup && latestCheckup._id) {
                        setExistingCheckupId(latestCheckup._id);
                        setIsEditMode(true);
                        
                        // Pre-populate form with existing data
                        setFormData({
                            date: latestCheckup.date 
                                ? new Date(latestCheckup.date).toISOString().split('T')[0] 
                                : new Date().toISOString().split('T')[0],
                            temperature: latestCheckup.temperature || '',
                            bloodPressure: latestCheckup.bloodPressure || '',
                            pulseRate: latestCheckup.pulseRate || '',
                            spo2: latestCheckup.spo2 || '',
                            notes: latestCheckup.notes || '',
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching existing checkup:", error);
            // Continue with create mode if fetch fails
        } finally {
            setIsLoading(false);
        }
    }, [inpatientId]);

    useEffect(() => {
        fetchExistingCheckup();
    }, [fetchExistingCheckup]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!inpatientId) {
            toast.error("Invalid patient information. Please try again.");
            navigate(-1);
            return;
        }

        setIsSubmitting(true);

        try {
            const requestData = {
                date: formData.date || new Date().toISOString(),
                temperature: formData.temperature || undefined,
                bloodPressure: formData.bloodPressure || undefined,
                pulseRate: formData.pulseRate || undefined,
                spo2: formData.spo2 || undefined,
                notes: formData.notes.trim() || undefined,
            };

            // Remove undefined values
            Object.keys(requestData).forEach(key => {
                if (requestData[key] === undefined || requestData[key] === '') {
                    delete requestData[key];
                }
            });

            let response;
            if (isEditMode && existingCheckupId) {
                // Update existing checkup
                response = await axios.patch(
                    getApiUrl(`inpatients/${inpatientId}/checkups/${existingCheckupId}`),
                    requestData,
                    { headers: getAuthHeaders() }
                );
            } else {
                // Create new checkup
                response = await axios.post(
                    getApiUrl(`inpatients/${inpatientId}/checkups`),
                    requestData,
                    { headers: getAuthHeaders() }
                );
            }

            if (response.data.success) {
                toast.success(isEditMode ? "Daily checkup updated successfully!" : "Daily checkup added successfully!");
                setTimeout(() => {
                    navigate(-1);
                }, 1500);
            } else {
                toast.error(response.data.message || (isEditMode ? "Failed to update daily checkup" : "Failed to add daily checkup"));
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error saving daily checkup:", error);
            const errorMessage = error.response?.data?.message || error.message || (isEditMode ? "Error updating daily checkup" : "Error adding daily checkup");
            toast.error(errorMessage);
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
        <div>
            <HeadingCard
                title={isEditMode ? "Edit Daily Checkup" : "Add Daily Checkup"}
                subtitle={`Record vitals and notes for ${patientName}`}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Patient Management", url: "/doctor/in-patients" },
                    { label: isEditMode ? "Edit Daily Checkup" : "Add Daily Checkup" },
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
                        required
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
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? "Update" : "Add")}
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
