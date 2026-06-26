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
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
} from "@mui/material";
import {
    PersonOutline,
    ArrowBack,
    Image as ImageIcon,
    PictureAsPdf,
    Visibility,
    Close,
} from "@mui/icons-material";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";
import { Button } from "@mui/material";
import patientDocumentService from "../../../services/patientDocumentService";

function ExaminationDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const { examinationId: examIdFromParams } = useParams(); // Get examinationId from URL params
    const [examination, setExamination] = useState(null);
    const [patient, setPatient] = useState({
        name: "Loading...",
        age: "--",
        gender: "Unknown",
        avatar: "P",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [selectedDocumentUrl, setSelectedDocumentUrl] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const appointmentData = location.state?.appointment || null;
    // Prioritize examinationId from URL params, then location state
    const examinationId = examIdFromParams || location.state?.examinationId || null;

    // Fetch examination details
    const fetchExaminationDetails = useCallback(async () => {
        setIsLoading(true);

        // Use examinationId from URL params or location state
        const currentExaminationId = examinationId;

        try {
            let response;

            // First priority: Fetch by examination ID if available
            if (currentExaminationId) {
                console.log("Fetching examination by ID:", currentExaminationId);
                response = await axios.get(
                    getApiUrl(`examinations/${currentExaminationId}`),
                    { headers: getAuthHeaders() }
                );
            }
            // Second priority: Fetch by appointment ID if available
            else if (appointmentData?._id) {
                console.log("Fetching examination by appointment ID:", appointmentData._id);
                response = await axios.get(
                    getApiUrl(`examinations/by-appointment/${appointmentData._id}`),
                    { headers: getAuthHeaders() }
                );
            }
            // No examination ID or appointment ID available
            else {
                toast.error("Examination ID or Appointment ID is required.");
                setIsLoading(false);
                return;
            }

            if (response?.data.success && response.data.data) {
                console.log("Examination data received:", response.data.data);
                setExamination(response.data.data);
                // Set patient info from examination
                if (response.data.data.patient?.user) {
                    const user = response.data.data.patient.user;
                    const age = user.dob
                        ? new Date().getFullYear() - new Date(user.dob).getFullYear()
                        : "--";
                    setPatient({
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
                console.warn("Examination not found. Response:", response?.data);
                const errorMessage = response?.data?.message || "Examination not found.";
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Error fetching examination details:", error);
            toast.error(error.response?.data?.message || "Failed to load examination details");
        } finally {
            setIsLoading(false);
        }
    }, [examinationId, appointmentData, location.state]);

    // Fetch patient info if not in examination (fallback - patient info should come from examination data)
    const fetchPatientInfo = useCallback(async () => {
        // Patient info should already be available from examination data
        // This is just a fallback if examination doesn't have patient data
        if (patient.name !== "Loading..." || !examination?.patient?.user?._id) return;

        try {
            // Get patient user ID from examination
            const patientUserId = examination.patient.user._id;
            const response = await axios.get(
                getApiUrl(`patients/by-user/${patientUserId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success && response.data.data) {
                const profile = response.data.data;
                const user = profile.user || {};
                const age = user.dob
                    ? new Date().getFullYear() - new Date(user.dob).getFullYear()
                    : "--";

                setPatient({
                    name: user.name || "Patient",
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
        }
    }, [examination, patient.name]);

    // Fetch patient PDF documents (non-image files)
    const patientProfileId = examination?.patient?._id;
    const fetchDocuments = useCallback(async () => {
        if (!patientProfileId) return;
        try {
            const response = await patientDocumentService.getPatientDocuments(patientProfileId);
            if (response && response.success) {
                const allDocs = response.data || [];
                const documentFiles = allDocs.filter((doc) => !doc.fileType?.startsWith("image/"));
                setDocuments(documentFiles);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    }, [patientProfileId]);

    const handleViewDocument = async (documentId) => {
        try {
            const response = await patientDocumentService.getDocumentViewUrl(documentId);
            if (response && response.success) {
                setSelectedDocumentUrl(response.data.url);
                setViewDialogOpen(true);
            } else {
                toast.error("Failed to load document");
            }
        } catch (error) {
            console.error("Error viewing document:", error);
            toast.error("Failed to load document");
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes && bytes !== 0) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const formatDateTime = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleString();
    };

    useEffect(() => {
        fetchExaminationDetails();
    }, [fetchExaminationDetails]);

    useEffect(() => {
        fetchPatientInfo();
    }, [fetchPatientInfo]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Refetch data when page comes into focus (e.g., when returning from edit page)
    useEffect(() => {
        const handleFocus = () => {
            // Refetch examination details when window regains focus
            if (examinationId || appointmentData?._id) {
                fetchExaminationDetails();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [fetchExaminationDetails, examinationId, appointmentData]);

    // Also refetch when location state changes (when navigating back from edit)
    useEffect(() => {
        // Refetch when location state changes (includes refresh timestamp)
        if (location.state?.examinationId || location.state?.refresh) {
            fetchExaminationDetails();
        }
    }, [location.state?.examinationId, location.state?.refresh, fetchExaminationDetails]);

    const renderField = (label, value) => {
        if (!value || value === "" || value === "N/A") return null;
        return (
            <Grid item xs={12} sm={6} md={4}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {label}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {value}
                    </Typography>
                </Box>
            </Grid>
        );
    };

    const renderSection = (title, children) => (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "var(--color-primary)" }}>
                    {title}
                </Typography>
                <Grid container spacing={2}>
                    {children}
                </Grid>
            </CardContent>
        </Card>
    );

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
                    title="Examination Details"
                    subtitle="Examination record not found"
                    breadcrumbItems={[
                        { label: "Doctor", url: "/doctor/dashboard" },
                        location.state?.from === "in-patients"
                            ? { label: "In Patients", url: "/doctor/in-patients" }
                            : { label: "OP Consultation", url: "/doctor/op-consultation" },
                        { label: "Examination Details" },
                    ]}
                />
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h6" color="text.secondary">
                        No examination record found for this appointment.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(location.state?.from === "in-patients" ? "/doctor/in-patients" : "/doctor/op-consultation")}
                        sx={{ mt: 2 }}
                    >
                        Go Back
                    </Button>
                </Paper>
            </Box>
        );
    }

    // Parse customFields to extract clinical and systemic examination data
    const customFields = examination.customFields || [];
    const clinicalFields = {};
    const systemicFields = {};

    customFields.forEach((field) => {
        if (field.label?.includes("Cardiovascular") || field.label?.includes("Respiratory") ||
            field.label?.includes("Gastrointestinal") || field.label?.includes("Musculoskeletal") ||
            field.label?.includes("Neurological")) {
            systemicFields[field.label] = field.value;
        } else {
            clinicalFields[field.label] = field.value;
        }
    });

    // Parse vitals
    const vitals = examination.vitals?.[0] || {};
    const physicalExam = examination.physicalExamination
        || (examination.personalHistory && typeof examination.personalHistory === "object"
            ? examination.personalHistory
            : {});
    const personalHistoryText = typeof examination.personalHistory === "string"
        ? examination.personalHistory
        : "";
    const patientImages = examination.patientImages || [];

    return (
        <>
            <div className="mx-[2rem]">
                <HeadingCard
                    title="Examination Details"
                    subtitle={`Examination record for ${patient.name}`}
                    breadcrumbItems={[
                        { label: "Doctor", url: "/doctor/dashboard" },
                        location.state?.from === "in-patients"
                            ? { label: "In Patients", url: "/doctor/in-patients" }
                            : { label: "OP Consultation", url: "/doctor/op-consultation" },
                        { label: "Examination Details" },
                    ]}
                />
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(location.state?.from === "in-patients" ? "/doctor/in-patients" : "/doctor/op-consultation")}
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
                                    // label={`${patient.age} years`}
                                    size="small"
                                />
                                {patient.uhid && <Chip label={`UHID: ${patient.uhid}`} size="small" />}
                                {patient.phone && <Chip label={`Phone: ${patient.phone}`} size="small" />}
                                {patient.email && <Chip label={`Email: ${patient.email}`} size="small" />}
                            </Stack>
                            {examination.appointment && (
                                <Box mt={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        Examination Date: {new Date(examination.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </Paper>

                {/* Examination Details */}
                {renderSection("Chief Complaint", [
                    renderField("Chief Complaint", examination.complaints),
                    renderField("Associated Complaint", examination.associatedComplaint),
                    renderField("Duration", examination.historyOfPatientIllness?.match(/Duration:\s*([^.]*)/)?.[1]),
                    renderField("Severity", examination.historyOfPatientIllness?.match(/Severity:\s*([^/]*)/)?.[1]),
                ])}

                {renderSection("Illness History", [
                    renderField("Onset", examination.historyOfPatientIllness?.match(/Onset:\s*([^.]*)/)?.[1]),
                    renderField("Progression", examination.historyOfPatientIllness?.match(/Progression:\s*([^.]*)/)?.[1]),
                    renderField("History of Presenting Complaint", examination.historyOfPatientIllness?.match(/History of Presenting Complaint:\s*([\s\S]*?)(?=\.\s*Aggravating Factors:|$)/)?.[1]?.trim()),
                    renderField("Aggravating Factors", examination.historyOfPatientIllness?.match(/Aggravating Factors:\s*([^.]*)/)?.[1]),
                    renderField("Relieving Factors", examination.historyOfPatientIllness?.match(/Relieving Factors:\s*([^.]*)/)?.[1]),
                ])}

                {renderSection("General Medical History", [
                    renderField("Past Illness", examination.medicalSurgicalHistory?.match(/Past Illness:\s*([^.]*)/)?.[1]),
                    renderField("Surgeries", examination.medicalSurgicalHistory?.match(/Surgeries:\s*([^.]*)/)?.[1]),
                    renderField("Allergies", examination.medicalSurgicalHistory?.match(/Allergies:\s*([^.]*)/)?.[1]),
                    renderField("Past Medications", examination.medicalSurgicalHistory?.match(/Past Medications:\s*([^.]*)/)?.[1]),
                ])}

                {renderSection("Ongoing Medications", [
                    renderField("Current Medications", examination.ongoingMedications),
                ])}

                {renderSection("Family History", [
                    renderField("Family History", examination.familyHistory),
                ])}

                {renderSection("Personal History", [
                    renderField("Bowel", physicalExam.bowel),
                    renderField("Appetite", physicalExam.appetite),
                    renderField("Micturition", physicalExam.micturition),
                    renderField("Sleep", physicalExam.sleep),
                    renderField("Diet and Hydration", physicalExam.dietAndHydration),
                    renderField("Physical Activity", physicalExam.physicalActivity),
                    renderField("Habits", physicalExam.habits),
                    ...(personalHistoryText ? [renderField("Notes", personalHistoryText)] : []),
                ])}

                {renderSection("Social History", [
                    renderField("Social History", examination.socialHistory),
                ])}

                {Object.keys(clinicalFields).length > 0 && renderSection("Clinical Examination", [
                    ...Object.entries(clinicalFields).map(([label, value]) => renderField(label, value)),
                ])}

                {renderSection("AAHP Examination", [
                    renderField("Height", vitals.height),
                    renderField("Weight", vitals.weight),
                    renderField("BMI", vitals.bmi),
                    renderField("Blood Pressure", vitals.bloodPressure),
                    renderField("Heart Rate", vitals.heartRate),
                    renderField("Pulse", vitals.pulseRate),
                    renderField("Temperature", vitals.temperature),
                    renderField("SpO2", vitals.spo2),
                    renderField("Respiratory Rate", vitals.respiratoryRate),
                    ...Object.entries(systemicFields).map(([label, value]) => renderField(label, value)),
                ])}

                {renderSection("Prakriti Assessment", [
                    renderField("Vata Dosha", examination.prakritiAssessment?.match(/Vata:\s*([^,]*)/)?.[1]?.trim()),
                    renderField("Pitta Dosha", examination.prakritiAssessment?.match(/Pitta:\s*([^,]*)/)?.[1]?.trim()),
                    renderField("Kapha Dosha", examination.prakritiAssessment?.match(/Kapha:\s*([^,]*)/)?.[1]?.trim()),
                    renderField("Final Prakriti", examination.finalPrakriti),
                ])}

                {renderSection("Physical Examination", [
                    renderField("General Examination", examination.generalExamination),
                    renderField("Local Examination", examination.localExamination),
                ])}

                {renderSection("Laboratory Investigations", [
                    renderField("Laboratory Investigations", examination.laboratoryInvestigation),
                ])}

                {renderSection("Diagnosis & Recommendations", [
                    renderField("Diagnosis", examination.diagnoses?.[0] || examination.diagnoses),
                    renderField("Other Diseases", examination.otherDiseases),

                    renderField("Treatment Plan", examination.examinationNotes?.match(/Treatment Plan:\s*([^.]*)/)?.[1]),
                    renderField("Lifestyle Recommendations", examination.examinationNotes?.match(/Lifestyle Recommendations:\s*([^.]*)/)?.[1]),
                ])}

                {examination.followUps && examination.followUps.length > 0 && renderSection("Follow-ups", [
                    ...examination.followUps.map((followUp, index) =>
                        renderField(
                            `Follow-up ${index + 1}`,
                            `${new Date(followUp.date).toISOString().split("T")[0]} - ${followUp.note || "No notes"}`
                        )
                    ),
                ])}

                {examination.inpatient && (
                    <Card sx={{ mb: 3, bgcolor: "var(--color-warning-light)" }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "var(--color-warning)" }}>
                                Inpatient Information
                            </Typography>
                            <Grid container spacing={2}>
                                {renderField("Room Number", examination.inpatient?.roomNumber)}
                                {renderField("Bed Number", examination.inpatient?.bedNumber)}
                                {renderField("Ward Category", examination.inpatient?.wardCategory)}
                                {renderField("Admission Date", examination.inpatient?.admissionDate ? new Date(examination.inpatient.admissionDate).toLocaleDateString() : null)}
                                {renderField("Status", examination.inpatient?.status)}
                                {renderField("Reason for Admission", examination.inpatient?.reason)}
                                {renderField("Admission Notes", examination.inpatient?.notes)}
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                {patientImages.length > 0 && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                <ImageIcon sx={{ fontSize: "1.5rem", color: "var(--color-primary)" }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-primary)" }}>
                                    Patient Images ({patientImages.length})
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                                {patientImages.map((image) => (
                                    <Paper
                                        key={image._id}
                                        variant="outlined"
                                        title={image.originalFileName}
                                        onClick={() => image.viewUrl && setPreviewImage(image)}
                                        sx={{
                                            width: 88,
                                            height: 88,
                                            overflow: "hidden",
                                            borderRadius: 1.5,
                                            cursor: image.viewUrl ? "pointer" : "default",
                                            flexShrink: 0,
                                            transition: "transform 0.15s ease, box-shadow 0.15s ease",
                                            "&:hover": image.viewUrl
                                                ? {
                                                    transform: "scale(1.04)",
                                                    boxShadow: 2,
                                                }
                                                : {},
                                        }}
                                    >
                                        {image.viewUrl ? (
                                            <Box
                                                component="img"
                                                src={image.viewUrl}
                                                alt={image.originalFileName}
                                                sx={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    display: "block",
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: "100%",
                                                    height: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    bgcolor: "grey.100",
                                                    p: 0.5,
                                                }}
                                            >
                                                <Typography variant="caption" color="text.secondary" align="center" sx={{ fontSize: "0.65rem" }}>
                                                    N/A
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {documents.length > 0 && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                <PictureAsPdf sx={{ fontSize: "1.5rem", color: "error.main" }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-primary)" }}>
                                    Patient Documents ({documents.length})
                                </Typography>
                            </Box>
                            <List sx={{ p: 0 }}>
                                {documents.map((doc) => (
                                    <ListItem
                                        key={doc._id}
                                        sx={{
                                            border: "1px solid #e0e0e0",
                                            borderRadius: 1,
                                            mb: 1,
                                            "&:hover": {
                                                bgcolor: "#f5f5f5",
                                            },
                                        }}
                                    >
                                        <PictureAsPdf sx={{ color: "error.main", mr: 2 }} />
                                        <ListItemText
                                            primary={doc.originalFileName}
                                            secondary={
                                                <Box>
                                                    <Typography variant="caption" display="block">
                                                        {doc.description || "No description"}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatFileSize(doc.fileSize)} • {formatDateTime(doc.uploadedAt)} • {doc.category}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleViewDocument(doc._id)}
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                )}

                {/* View PDF Document Dialog */}
                <Dialog
                    open={viewDialogOpen}
                    onClose={() => setViewDialogOpen(false)}
                    fullWidth
                    PaperProps={{
                        sx: {
                            height: "98vh",
                            width: "98vw",
                            maxWidth: "98vw",
                            maxHeight: "98vh",
                            margin: "1vh 1vw",
                        },
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h6">View PDF Document</Typography>
                            <IconButton onClick={() => setViewDialogOpen(false)}>
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, height: "calc(98vh - 64px)", overflow: "hidden" }}>
                        {selectedDocumentUrl && (
                            <iframe
                                src={selectedDocumentUrl}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                    minHeight: "calc(98vh - 64px)",
                                }}
                                title="PDF Viewer"
                            />
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={Boolean(previewImage)}
                    onClose={() => setPreviewImage(null)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogContent sx={{ p: 1.5 }}>
                        {previewImage?.viewUrl && (
                            <Box
                                component="img"
                                src={previewImage.viewUrl}
                                alt={previewImage.originalFileName}
                                sx={{
                                    width: "100%",
                                    maxHeight: "80vh",
                                    objectFit: "contain",
                                    borderRadius: 1,
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

export default ExaminationDetails;

