import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    Divider,
    Grid,
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";

function AddDailyCheckup({ open, onClose, onAdd, patientName, initialDate = '2025-12-08' }) {
    const [formData, setFormData] = useState({
        date: initialDate,
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
        if (onAdd) {
            onAdd(formData);
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            {/* ================= HEADER (FIXED) ================= */}
            <DialogTitle
                sx={{
                    backgroundColor: "var(--color-bg-header)",
                    color: "var(--color-text-light)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 3,
                    py: 2,
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                }}
            >
                <Box>
                    <Typography fontWeight={700} fontSize="1.15rem">
                        Add Daily Checkup
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                        Record vitals and notes for {patientName}
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
                {/* ================= CONTENT (SCROLLABLE) ================= */}
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

                    {/* Date - Full Width */}
                    <StyledTextField
                        label="Date *"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* Vitals - 50/50 Layout */}
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

                    {/* Notes - Full Width */}
                    <StyledTextField
                        label="Notes / Description"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        multiline
                        rows={3}
                    />
                    <div className='flex justify-end'>

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
                                ml: 2,
                                "&:hover": {
                                    backgroundColor: "var(--color-btn-dark)",
                                },
                            }}
                        >
                            Add
                        </Button>
                    </div>
                </DialogContent>

                <Divider sx={{ borderColor: "var(--color-border)" }} />


            </form>
        </Dialog>
    );
}

/* =======================
   REUSABLE INPUTS
======================= */

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

export default AddDailyCheckup;