import React, { useState } from "react";
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    Button,
    Stack,
    Divider,
    Paper,
    IconButton,
} from "@mui/material";
import {
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    LocalHospital as HospitalIcon,
    MedicalServices as MedIcon,
    Description as SummaryIcon,
    Receipt as BillingIcon,
    FamilyRestroom as CounselingIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

function PrepareDischarge({ patient, onCancel, onConfirm }) {
    const [checklist, setChecklist] = useState({
        vitals: false,
        medication: false,
        summary: false,
        billing: false,
        counseling: false,
    });

    const handleChange = (name) => {
        setChecklist((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const allChecked = Object.values(checklist).every(Boolean);

    const checklistItems = [
        { key: "vitals", label: "Final Vitals Check Completed", icon: <HospitalIcon /> },
        { key: "medication", label: "Medication Summary Prepared", icon: <MedIcon /> },
        { key: "summary", label: "Discharge Summary Signed by Doctor", icon: <SummaryIcon /> },
        { key: "billing", label: "Invoice & Billing Cleared", icon: <BillingIcon /> },
        { key: "counseling", label: "Patient / Family Counseling Done", icon: <CounselingIcon /> },
    ];

    return (
        <Paper
            sx={{
                borderRadius: "18px",
                overflow: "hidden",
                backgroundColor: "var(--color-bg-card)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                maxWidth: 500,
                maxHeight: 500,
                mx: "auto",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                    boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, var(--color-bg-header), var(--color-bg-profile))",
                    color: "var(--color-text-light)",
                    px: 3,
                    py: 2.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton size="small" sx={{ color: "var(--color-text-light)" }}>
                        <CheckIcon />
                    </IconButton>
                    <Box>
                        <Typography fontWeight={700} fontSize={18}>
                            Prepare Discharge
                        </Typography>
                        <Typography fontSize={13} sx={{ opacity: 0.85 }}>
                            Patient: {patient?.patientName || "Unknown"}
                        </Typography>
                    </Box>
                </Stack>

                <IconButton
                    onClick={onCancel}
                    sx={{
                        color: "white",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{
                p: 3,
                maxHeight: 400,
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "green transparent",
                "&::-webkit-scrollbar": {
                    width: 6,
                },
                "&::-webkit-scrollbar-track": {
                    backgroundColor: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "green",
                    borderRadius: 3,
                },
                "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "darkgreen",
                },
            }}>
                <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.1)" }} />

                {/* Checklist */}
                <Field label="Discharge Checklist">
                    <Stack spacing={2}>
                        {checklistItems.map(({ key, label, icon }) => (
                            <FormControlLabel
                                key={key}
                                control={
                                    <Checkbox
                                        checked={checklist[key]}
                                        onChange={() => handleChange(key)}
                                        sx={{
                                            color: "var(--color-icon-2)",
                                            "&.Mui-checked": {
                                                color: "var(--color-success-dark)",
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <IconButton size="small" sx={{ color: checklist[key] ? "var(--color-success-dark)" : "var(--color-icon-2)" }}>
                                            {icon}
                                        </IconButton>
                                        <Typography variant="body2" fontWeight={checklist[key] ? 600 : 400}>
                                            {label}
                                        </Typography>
                                    </Stack>
                                }
                                sx={{ m: 0 }}
                            />
                        ))}
                    </Stack>
                </Field>

                <Divider sx={{ my: 3, borderColor: "var(--color-border)" }} />

                {/* Actions */}
                <Stack direction="row" justifyContent="flex-end" spacing={2}>


                    <Button
                        variant="contained"
                        startIcon={<CheckIcon />}
                        color="success"
                        disabled={!allChecked}
                        onClick={() => onConfirm?.(checklist)}
                        sx={{
                            backgroundColor: "var(--color-success)",
                            fontWeight: 700,
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                                backgroundColor: "var(--color-success-dark)",
                                transform: "translateY(-1px)",
                            },
                            "&:disabled": {
                                backgroundColor: "var(--color-disabled)",
                                opacity: 0.6,
                                cursor: "not-allowed",
                            },
                        }}
                    >
                        Confirm Discharge
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
}

/* ---------- Helper ---------- */

const Field = ({ label, children }) => (
    <Box sx={{ mb: 3 }}>
        <Typography
            fontSize={13}
            fontWeight={700}
            sx={{ color: "var(--color-text-dark)", mb: 1.5 }}
        >
            {label}
        </Typography>
        {children}
    </Box>
);

export default PrepareDischarge;