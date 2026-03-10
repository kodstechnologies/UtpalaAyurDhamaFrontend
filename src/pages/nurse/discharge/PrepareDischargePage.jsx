import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

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
    CircularProgress,
} from "@mui/material";
import {
    CheckCircle as CheckIcon,
    LocalHospital as HospitalIcon,
    MedicalServices as MedIcon,
    Description as SummaryIcon,
    Receipt as BillingIcon,
    FamilyRestroom as CounselingIcon,
} from "@mui/icons-material";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function PrepareDischargePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inpatientId = searchParams.get("inpatientId");
    const patientName = searchParams.get("patientName") || "";

    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingPatient, setIsFetchingPatient] = useState(true);
    const [patientData, setPatientData] = useState(null);

    const [checklist, setChecklist] = useState({
        vitals: false,
        medication: false,
        summary: false,
        billing: false,
        counseling: false,
    });

    useEffect(() => {
        if (inpatientId) {
            fetchPatientData();
        } else {
            setIsFetchingPatient(false);
        }
    }, [inpatientId]);

    const fetchPatientData = async () => {
        setIsFetchingPatient(true);
        try {
            const response = await axios.get(
                getApiUrl(`inpatients/${inpatientId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                setPatientData(response.data.data);
            } else {
                toast.error("Failed to fetch patient details");
            }
        } catch (error) {
            console.error("Error fetching patient data:", error);
            toast.error(error.response?.data?.message || "Error fetching patient details");
        } finally {
            setIsFetchingPatient(false);
        }
    };

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

    const handleConfirm = async () => {
        if (!inpatientId) {
            toast.error("Invalid patient ID");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.patch(
                getApiUrl(`inpatients/${inpatientId}/discharge`),
                {
                    dischargeChecklist: checklist,
                    dischargeDate: new Date().toISOString(),
                    status: "Discharged",
                },
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success("Patient discharge completed successfully!");
                
                // IMPORTANT: Nurse discharge confirmation should ONLY navigate to discharge preparation list
                // It should NEVER redirect to payment page. Payment page should only be accessed
                // after receptionist clicks "Finalize Bill" on billing pages.
                console.log("Nurse discharge confirmed - navigating to discharge preparation list");
                navigate("/nurse/discharge-preparation", { replace: true });
                
                // Explicitly prevent any other navigation
                return;
            } else {
                toast.error(response.data.message || "Failed to process discharge");
            }
        } catch (error) {
            console.error("Error processing discharge:", error);
            toast.error(error.response?.data?.message || "Error processing discharge");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetchingPatient) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    const displayPatientName = patientData?.patient?.user?.name || patientName || "Unknown Patient";

    return (
        <div>
            <HeadingCard
                title="Prepare Discharge"
                subtitle={`Patient: ${displayPatientName}`}
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
                        disabled={isLoading}
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
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                        color="success"
                        disabled={!allChecked || isLoading}
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
                        {isLoading ? "Processing..." : "Confirm Discharge"}
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
