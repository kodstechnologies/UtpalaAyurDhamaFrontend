import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    Paper,
    Stack,
    Avatar,
    Typography,
    Chip,
    Box,
    CircularProgress,
} from "@mui/material";
import {
    PersonOutline,
    ArrowBack,
} from "@mui/icons-material";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";
import { Button } from "@mui/material";
import ExaminationRecordsFormView from "./Examination";

function EditExamination() {
    const navigate = useNavigate();
    const location = useLocation();
    const { examinationId } = useParams();
    const [examination, setExamination] = useState(null);
    const [patient, setPatient] = useState({
        name: "Loading...",
        age: "--",
        gender: "Unknown",
        avatar: "P",
    });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch examination details
    const fetchExaminationDetails = useCallback(async () => {
        if (!examinationId) {
            toast.error("Examination ID is required.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl(`examinations/${examinationId}`),
                { headers: getAuthHeaders() }
            );

            if (response?.data.success && response.data.data) {
                setExamination(response.data.data);
                // Set patient info from examination
                if (response.data.data.patient?.user) {
                    const user = response.data.data.patient.user;
                    const age = user.dob
                        ? new Date().getFullYear() - new Date(user.dob).getFullYear()
                        : "--";
                    setPatient({
                        _id: response.data.data.patient?._id,
                        name: user.name || "Patient",
                        age: age,
                        gender: user.gender || "Unknown",
                        avatar: user.name ? user.name.charAt(0).toUpperCase() : "P",
                        email: user.email || "",
                        phone: user.phone || "",
                        uhid: user.uhid || "",
                    });
                }
            } else {
                toast.error("Examination not found.");
                navigate("/doctor/op-consultation");
            }
        } catch (error) {
            console.error("Error fetching examination details:", error);
            toast.error(error.response?.data?.message || "Failed to load examination details");
            navigate("/doctor/op-consultation");
        } finally {
            setIsLoading(false);
        }
    }, [examinationId, navigate]);

    useEffect(() => {
        fetchExaminationDetails();
    }, [fetchExaminationDetails]);

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!examination) {
        return (
            <Box sx={{ p: 4 }}>
                <HeadingCard
                    title="Edit Examination"
                    subtitle="Examination record not found"
                    breadcrumbItems={[
                        { label: "Doctor", url: "/doctor/dashboard" },
                        { label: "OP Consultation", url: "/doctor/op-consultation" },
                        { label: "Edit Examination" },
                    ]}
                />
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h6" color="text.secondary">
                        No examination record found.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate("/doctor/op-consultation")}
                        sx={{ mt: 2 }}
                    >
                        Go Back
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <>
            <div className="mx-[2rem]">
                <HeadingCard
                    title="Edit Examination"
                    subtitle={`Edit examination record for ${patient.name}`}
                    breadcrumbItems={[
                        { label: "Doctor", url: "/doctor/dashboard" },
                        { label: "OP Consultation", url: "/doctor/op-consultation" },
                        { label: "Edit Examination" },
                    ]}
                />
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate("/doctor/op-consultation")}
                    >
                        Back
                    </Button>
                </Box>
                {/* Patient Info Card */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 3,
                        border: "2px solid var(--color-primary-light)",
                        bgcolor: "white",
                    }}
                >
                    <Stack direction="row" spacing={3} alignItems="center">
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: "var(--color-primary)",
                                fontSize: 32,
                                fontWeight: 700,
                            }}
                        >
                            {patient.avatar}
                        </Avatar>
                        <Box flex={1}>
                            <Typography variant="h5" fontWeight={700}>
                                {patient.name}
                            </Typography>
                            <Stack direction="row" spacing={2} mt={0.5} flexWrap="wrap">
                                <Chip
                                    icon={<PersonOutline fontSize="small" />}
                                    label={`${patient.age} years`}
                                    size="small"
                                />
                                {patient.uhid && <Chip label={`UHID: ${patient.uhid}`} size="small" />}
                                {patient.phone && <Chip label={`Phone: ${patient.phone}`} size="small" />}
                                {patient.email && <Chip label={`Email: ${patient.email}`} size="small" />}
                            </Stack>
                            {examination.createdAt && (
                                <Box mt={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        Examination Date: {new Date(examination.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </Paper>

                {/* Edit Examination Form */}
                <ExaminationRecordsFormView
                    patient={patient}
                    appointmentId={examination.appointment?._id || examination.appointment}
                    appointmentData={examination.appointment}
                    examinationId={examinationId}
                    examinationData={examination}
                    isEditMode={true}
                    onSubmitSuccess={() => {
                        toast.success("Examination updated successfully!");
                        // Navigate back to examination details using examinationId in URL
                        navigate(`/doctor/examination-details/${examinationId}`, {
                            state: {
                                examinationId: examinationId,
                                appointment: examination.appointment,
                                refresh: Date.now(), // Force refresh
                            },
                            replace: false, // Don't replace history to allow back navigation
                        });
                    }}
                />
            </div>
        </>
    );
}

export default EditExamination;
