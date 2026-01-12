import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider,
    InputAdornment,
    CircularProgress,
} from "@mui/material";
import {
    Thermostat as TempIcon,
    Bloodtype as BPIcon,
    MonitorHeart as HeartIcon,
    Note as NotesIcon,
    Add as AddIcon,
} from "@mui/icons-material";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function UpdateVitalsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const inpatientId = searchParams.get("inpatientId") || patientId;
    const patientName = searchParams.get("patientName") || "";

    const [form, setForm] = useState({
        temperature: "",
        bloodPressure: "",
        heartRate: "",
        notes: "",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch latest vitals on component mount
    useEffect(() => {
        const fetchLatestVitals = async () => {
            if (!inpatientId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await axios.get(getApiUrl(`inpatients/${inpatientId}`), {
                    headers: getAuthHeaders(),
                });

                if (response.data.success && response.data.data) {
                    const inpatient = response.data.data;
                    
                    // Get dailyCheckups array and find the most recent one
                    const checkups = Array.isArray(inpatient.dailyCheckups) ? inpatient.dailyCheckups : [];
                    
                    if (checkups.length > 0) {
                        // Sort by date descending to get the latest first
                        const sortedCheckups = [...checkups].sort((a, b) => {
                            const dateA = new Date(a.date || a.createdAt || 0);
                            const dateB = new Date(b.date || b.createdAt || 0);
                            return dateB.getTime() - dateA.getTime();
                        });

                        const latestCheckup = sortedCheckups[0];

                        // Map backend field names to frontend field names
                        setForm({
                            temperature: latestCheckup.temperature || "",
                            bloodPressure: latestCheckup.bloodPressure || "",
                            heartRate: latestCheckup.pulseRate || "", // Map pulseRate to heartRate
                            notes: latestCheckup.notes || "",
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching latest vitals:", error);
                // Don't show error toast, just log it - it's okay if there are no previous vitals
            } finally {
                setIsLoading(false);
            }
        };

        fetchLatestVitals();
    }, [inpatientId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!inpatientId) {
            toast.error("Patient ID is required");
            return;
        }

        // Validate that at least one vital is entered
        if (!form.temperature && !form.bloodPressure && !form.heartRate) {
            toast.error("Please enter at least one vital sign");
            return;
        }

        setIsSaving(true);
        try {
            // Map frontend field names to backend field names
            // Backend expects strings for all vitals
            const payload = {
                temperature: form.temperature ? String(form.temperature).trim() : undefined,
                bloodPressure: form.bloodPressure ? String(form.bloodPressure).trim() : undefined,
                pulseRate: form.heartRate ? String(form.heartRate).trim() : undefined, // Map heartRate to pulseRate
                notes: form.notes ? String(form.notes).trim() : undefined,
                date: new Date().toISOString(), // Current date
            };

            // Remove undefined and empty values
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined || payload[key] === "") {
                    delete payload[key];
                }
            });

            const response = await axios.post(
                getApiUrl(`inpatients/${inpatientId}/checkups`),
                payload,
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success("Vitals saved successfully");
                navigate(-1); // Go back to previous page
            } else {
                toast.error(response.data.message || "Failed to save vitals");
            }
        } catch (error) {
            console.error("Error saving vitals:", error);
            toast.error(
                error.response?.data?.message || 
                error.response?.data?.error || 
                "Failed to save vitals. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
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

            {isLoading ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "400px",
                        backgroundColor: "var(--color-bg-a)",
                        borderRadius: "12px",
                        mt: 2,
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : (
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
                        disabled={isSaving}
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
                        disabled={isSaving}
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
                <Field label="Heart Rate / Pulse Rate (bpm)">
                    <StyledTextField
                        name="heartRate"
                        type="number"
                        value={form.heartRate}
                        onChange={handleChange}
                        placeholder="e.g., 72"
                        disabled={isSaving}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <HeartIcon sx={{ color: "var(--color-icon-2)", fontSize: 20 }} />
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
                        disabled={isSaving}
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
                        disabled={isSaving}
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
                        endIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                        onClick={handleSave}
                        disabled={!inpatientId || isSaving}
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
                        {isSaving ? "Saving..." : "Save Vitals"}
                    </Button>
                </Box>
            </Box>
            )}
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
                "&.Mui-disabled": {
                    backgroundColor: "var(--color-bg-input)",
                    opacity: 0.7,
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
