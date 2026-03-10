
import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Divider,
    Paper,
    IconButton,
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
import CloseIcon from "@mui/icons-material/Close";

function UpdateVitalsCard({ patient, onClose }) {
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
            patientId: patient?._id,
            ...form,
        };

        console.log("Vitals Saved:", payload);
        onClose?.();
    };

    return (
        <Paper
            elevation={2}
            sx={{
                backgroundColor: "var(--color-bg-a)",
                borderRadius: "18px",
                overflow: "hidden",
                maxWidth: 500,
                mx: "auto",
            }}
        >
            {/* Header */}
            <Box
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
                        Update Vitals
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                        Patient: {patient?.patientName}
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
            </Box>

            <Box sx={{
                px: 3,
                py: 3,
                maxHeight: 400,
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#5A5044 transparent",
                "&::-webkit-scrollbar": {
                    width: 6,
                },
                "&::-webkit-scrollbar-track": {
                    backgroundColor: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "brown",
                    borderRadius: 3,
                },
                "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "darkbrown",
                },
            }}>
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
                        variant="contained"
                        endIcon={<AddIcon />}
                        onClick={handleSave}
                        disabled={!patient?._id}
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
        </Paper>
    );
}

/* ======================= HELPER COMPONENTS ======================= */

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

export default UpdateVitalsCard;