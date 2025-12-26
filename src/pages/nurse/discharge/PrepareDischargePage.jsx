import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    Button,
    Stack,
    Divider,
    IconButton,
} from "@mui/material";
import {
    CheckCircle as CheckIcon,
    LocalHospital as HospitalIcon,
    MedicalServices as MedIcon,
    Description as SummaryIcon,
    Receipt as BillingIcon,
    FamilyRestroom as CounselingIcon,
} from "@mui/icons-material";

function PrepareDischargePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const patientName = searchParams.get("patientName") || "";

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

    const handleConfirm = () => {
        console.log("Discharge confirmed:", {
            patientId: patientId,
            patientName: patientName,
            checklist,
        });
        // Implement API call here
        navigate(-1); // Go back to previous page
    };

    return (
        <div>
            <HeadingCard
                title="Prepare Discharge"
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Nurse", url: "/nurse/dashboard" },
                    { label: "Discharge Preparation", url: "/nurse/discharge-preparation" },
                    { label: "Prepare Discharge" },
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
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<CheckIcon />}
                        color="success"
                        disabled={!allChecked}
                        onClick={handleConfirm}
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
        </div>
    );
}

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

Field.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default PrepareDischargePage;

