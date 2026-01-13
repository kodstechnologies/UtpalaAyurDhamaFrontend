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
} from "@mui/icons-material";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";
import ExaminationRecordsFormView from "./Examination";

function PatientExamination() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useParams(); // patient / family member id (userId from route)
    const [patient, setPatient] = useState({
        name: "Loading...",
        age: "--",
        gender: "Unknown",
        avatar: "P",
    });
    const [isLoadingPatient, setIsLoadingPatient] = useState(true);
    const [isCheckingExamination, setIsCheckingExamination] = useState(true);
    const appointmentData = location.state?.appointment || null;

    // Fetch patient information from API
    const fetchPatientInfo = useCallback(async () => {
        setIsLoadingPatient(true);
        try {
            const response = await axios.get(
                getApiUrl(`patients/by-user/${userId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success && response.data.data) {
                const profile = response.data.data;
                const user = profile.user || {};
                const age = user.dob
                    ? new Date().getFullYear() - new Date(user.dob).getFullYear()
                    : "--";

                setPatient({
                    _id: profile._id, // Include patient profile ID
                    name: user.name || `Patient ${userId}`,
                    age: age,
                    gender: user.gender || "Unknown",
                    avatar: user.name ? user.name.charAt(0).toUpperCase() : "P",
                    email: user.email || "",
                    phone: user.phone || "",
                    uhid: user.uhid || "",
                });
            }
        } catch (error) {
            console.error("Error fetching patient info:", error);
            toast.error("Failed to load patient information");
            // Use default patient info if fetch fails
            setPatient({
                name: `Patient ${userId}`,
                age: "--",
                gender: "Unknown",
                avatar: userId ? userId.charAt(0).toUpperCase() : "P",
            });
        } finally {
            setIsLoadingPatient(false);
        }
    }, [userId]);

    // Check if examination already exists for this appointment
    const checkExistingExamination = useCallback(async () => {
        if (!appointmentData?._id) {
            setIsCheckingExamination(false);
            return;
        }

        try {
            const response = await axios.get(
                getApiUrl(`examinations/by-appointment/${appointmentData._id}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success && response.data.data) {
                // Examination already exists, navigate to examination details page
                toast.info("Examination already recorded. Showing examination details.");
                navigate(`/doctor/examination-details/${userId}`, {
                    state: {
                        examinationId: response.data.data._id,
                        appointment: appointmentData,
                    }
                });
            }
        } catch (error) {
            // No examination found or error - continue with examination form
            console.log("No existing examination found or error:", error);
        } finally {
            setIsCheckingExamination(false);
        }
    }, [appointmentData, navigate, userId]);

    useEffect(() => {
        fetchPatientInfo();
        checkExistingExamination();
    }, [fetchPatientInfo, checkExistingExamination]);
    return (
        <>
            <div className="mx-[2rem]">
                <HeadingCard
                    title="Patient Examination"
                    subtitle={appointmentData ? `Examination for appointment on ${new Date(appointmentData.appointmentDate).toLocaleDateString()}` : "Record comprehensive patient examination details"}
                    breadcrumbItems={[
                        { label: "Doctor", url: "/doctor/dashboard" },
                        { label: "Follow-ups", url: "/doctor/follow-ups" },
                        { label: "Patient Examination" },
                    ]}
                />
                {isLoadingPatient ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            mb: 4,
                            borderRadius: 3,
                            border: "2px solid var(--color-primary-light)",
                            bgcolor: "white",
                            transition: "box-shadow 0.3s ease",
                            "&:hover": {
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                            },
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
                                    border: "3px solid rgba(255, 255, 255, 0.5)",
                                }}
                            >
                                {patient.avatar}
                            </Avatar>
                            <Box flex={1}>
                                <Typography variant="h5" fontWeight={700} color="var(--color-text-dark)">
                                    {patient.name}
                                </Typography>
                                <Stack direction="row" spacing={2} mt={0.5} flexWrap="wrap">
                                    <Chip
                                        icon={<PersonOutline fontSize="small" />}
                                        label={`${patient.age} years`}
                                        size="small"
                                        sx={{
                                            bgcolor: "var(--color-primary-light)",
                                            color: "var(--color-primary-dark)",
                                            fontWeight: 500,
                                        }}
                                    />
                                    {patient.uhid && (
                                        <Chip
                                            label={`UHID: ${patient.uhid}`}
                                            size="small"
                                            sx={{
                                                bgcolor: "var(--color-bg-hover)",
                                                fontWeight: 500,
                                            }}
                                        />
                                    )}
                                    {patient.phone && (
                                        <Chip
                                            label={`Phone: ${patient.phone}`}
                                            size="small"
                                            sx={{
                                                bgcolor: "var(--color-bg-hover)",
                                                fontWeight: 500,
                                            }}
                                        />
                                    )}
                                    {patient.email && (
                                        <Chip
                                            label={`Email: ${patient.email}`}
                                            size="small"
                                            sx={{
                                                bgcolor: "var(--color-bg-hover)",
                                                fontWeight: 500,
                                            }}
                                        />
                                    )}
                                </Stack>
                                {appointmentData && (
                                    <Box mt={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            Appointment Date: {new Date(appointmentData.appointmentDate).toLocaleDateString()} at {appointmentData.appointmentTime}
                                        </Typography>
                                        {appointmentData.notes && (
                                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                                                Notes: {appointmentData.notes}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Stack>
                    </Paper>
                )}
            </div>
            {/* Examination Form */}
            {!isCheckingExamination && (
                <ExaminationRecordsFormView
                    patient={patient}
                    appointmentId={appointmentData?._id}
                    appointmentData={appointmentData}
                    onSubmitSuccess={() => {
                        // Navigation is handled in Examination component after save
                    }}
                />
            )}
        </>
    );
}


export default PatientExamination;
