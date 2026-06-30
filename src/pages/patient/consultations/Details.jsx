import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Divider,
    Button,
    CircularProgress,
    Chip,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogContent,
} from "@mui/material";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";
import appointmentService from "../../../services/appointmentService";
import patientDocumentService from "../../../services/patientDocumentService";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import MedicationIcon from "@mui/icons-material/Medication";
import HealingIcon from "@mui/icons-material/Healing";
import ReceiptIcon from "@mui/icons-material/Receipt";
import EventIcon from "@mui/icons-material/Event";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VisibilityIcon from "@mui/icons-material/Visibility";

function ConsultationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [consultationData, setConsultationData] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [selectedDocumentUrl, setSelectedDocumentUrl] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    useEffect(() => {
        const fetchConsultationDetails = async () => {
            if (!id) {
                toast.error("Invalid consultation ID");
                navigate("/patient/consultations");
                return;
            }

            try {
                setLoading(true);
                console.log("Fetching consultation details for ID:", id);
                const response = await appointmentService.getAppointmentDetails(id);
                console.log("Consultation details response:", response);

                if (response && response.success && response.data) {
                    setConsultationData(response.data);
                } else {
                    console.error("Failed to load consultation details:", response);
                    toast.error(response?.message || "Failed to load consultation details");
                    // Don't navigate away - let user see the error state
                }
            } catch (error) {
                console.error("Error fetching consultation details:", error);
                const errorMessage = error.response?.data?.message || error.message || "Failed to load consultation details";
                toast.error(errorMessage);
                // Don't navigate away - let user see the error state
            } finally {
                setLoading(false);
            }
        };

        fetchConsultationDetails();
    }, [id, navigate]);

    useEffect(() => {
        const patientProfileId =
            consultationData?.appointment?.patient?._id ||
            consultationData?.examination?.patient?._id ||
            consultationData?.appointment?.patient ||
            consultationData?.examination?.patient;

        if (!patientProfileId) return;

        const fetchDocuments = async () => {
            try {
                const response = await patientDocumentService.getPatientDocuments(patientProfileId);
                if (response && response.success) {
                    const nonImageDocs = (response.data || []).filter(
                        (doc) => !doc.fileType?.startsWith("image/")
                    );
                    setDocuments(nonImageDocs);
                }
            } catch (error) {
                console.error("Error fetching patient documents:", error);
            }
        };

        fetchDocuments();
    }, [consultationData]);

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
            console.error("Error loading document:", error);
            toast.error("Failed to load document");
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes && bytes !== 0) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch (error) {
            return "N/A";
        }
    };

    const formatDateTime = (dateString, timeString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            const formattedDate = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            return timeString ? `${formattedDate} at ${timeString}` : formattedDate;
        } catch (error) {
            return "N/A";
        }
    };

    const formatFollowUpDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch (error) {
            return "N/A";
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            Scheduled: "primary",
            Confirmed: "info",
            Ongoing: "warning",
            Completed: "success",
            Cancelled: "error",
            "No Show": "error",
            Pending: "default",
            "In Progress": "warning",
        };
        return statusColors[status] || "default";
    };

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

    const renderSection = (title, children) => {
        const validChildren = Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean);
        if (validChildren.length === 0) return null;
        return (
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "var(--color-primary)" }}>
                        {title}
                    </Typography>
                    <Grid container spacing={2}>
                        {validChildren}
                    </Grid>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div style={{ paddingBottom: "30px" }}>
                <HeadingCard
                    title="Consultation Details"
                    subtitle="View detailed information about your consultation"
                    breadcrumbItems={[
                        { label: "Patient", url: "/patient/dashboard" },
                        { label: "Consultations", url: "/patient/consultations" },
                        { label: "Details" },
                    ]}
                />
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            </div>
        );
    }

    if (!consultationData) {
        return (
            <div style={{ paddingBottom: "30px" }}>
                <HeadingCard
                    title="Consultation Details"
                    subtitle="View detailed information about your consultation"
                    breadcrumbItems={[
                        { label: "Patient", url: "/patient/dashboard" },
                        { label: "Consultations", url: "/patient/consultations" },
                        { label: "Details" },
                    ]}
                />
                <Card sx={{ boxShadow: 3, borderRadius: 2, marginTop: 3 }}>
                    <CardContent sx={{ padding: 4, textAlign: "center" }}>
                        <Typography variant="h6" color="text.secondary" sx={{ marginBottom: 2 }}>
                            Consultation not found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 3 }}>
                            The consultation you're looking for doesn't exist or you don't have permission to view it.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate("/patient/consultations")}
                            sx={{ borderRadius: "8px" }}
                        >
                            Back to Consultations
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { appointment, examination, prescriptions, therapySessions, appointmentInvoice, doctorConsultationFee, patientImages = [] } = consultationData;

    // We allow rendering if either appointment or examination exists
    if (!appointment && !examination) {
        return (
            <div style={{ paddingBottom: "30px" }}>
                <HeadingCard
                    title="Consultation Details"
                    subtitle="View detailed information about your consultation"
                    breadcrumbItems={[
                        { label: "Patient", url: "/patient/dashboard" },
                        { label: "Consultations", url: "/patient/consultations" },
                        { label: "Details" },
                    ]}
                />
                <Card sx={{ boxShadow: 3, borderRadius: 2, marginTop: 3 }}>
                    <CardContent sx={{ padding: 4, textAlign: "center" }}>
                        <Typography variant="h6" color="text.secondary" sx={{ marginBottom: 2 }}>
                            Consultation data not found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 3 }}>
                            Unable to load consultation information. Please try again later.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate("/patient/consultations")}
                            sx={{ borderRadius: "8px" }}
                        >
                            Back to Consultations
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: "30px" }}>
            <HeadingCard
                title="Consultation Details"
                subtitle="View detailed information about your consultation"
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Consultations", url: "/patient/consultations" },
                    { label: "Details" },
                ]}
            />

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mb: 3, mt: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/patient/consultations")}
                    sx={{ borderRadius: "8px" }}
                >
                    Back to Consultations
                </Button>
            </Box>

            {/* Appointment Information Card */}
            <Card sx={{ boxShadow: 3, borderRadius: 2, marginBottom: 3 }}>
                <CardContent sx={{ padding: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a", marginBottom: 1 }}>
                                Appointment Information
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#666" }}>
                                Consultation scheduled details
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <Chip
                                label={
                                    examination?.isDaycare
                                        ? "Daycare"
                                        : examination?.inpatient
                                            ? "IPD"
                                            : "OPD"
                                }
                                color={
                                    examination?.isDaycare
                                        ? "secondary"
                                        : examination?.inpatient
                                            ? "warning"
                                            : "primary"
                                }
                                sx={{ fontWeight: 700 }}
                            />
                            <Chip
                                label={appointment.status || "Scheduled"}
                                color={getStatusColor(appointment.status)}
                                sx={{ fontWeight: 600 }}
                                variant="outlined"
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ marginY: 3 }} />

                    <Grid container spacing={3}>
                        {/* Patient Information */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
                                <PersonIcon sx={{ fontSize: "1.5rem", color: "#D4A574" }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Patient Information
                                </Typography>
                            </Box>
                            <Box sx={{ backgroundColor: "#f8f9fa", padding: 2, borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                    <strong>Name:</strong> {appointment.patient?.user?.name || "N/A"}
                                </Typography>
                                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                    <strong>Email:</strong> {appointment.patient?.user?.email || "N/A"}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Phone:</strong> {appointment.patient?.user?.phone || "N/A"}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Doctor Information */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
                                <LocalHospitalIcon sx={{ fontSize: "1.5rem", color: "#1976d2" }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Doctor Information
                                </Typography>
                            </Box>
                            <Box sx={{ backgroundColor: "#f8f9fa", padding: 2, borderRadius: 1 }}>
                                {(() => {
                                    const primaryDoc = appointment.patient?.primaryDoctor;
                                    const dr = primaryDoc || appointment.doctor;
                                    return (
                                        <>
                                            <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                                <strong>Name:</strong> {dr?.user?.firstName || dr?.user?.name || (dr?.firstName ? `${dr.firstName} ${dr.lastName || ""}` : "N/A")}
                                            </Typography>
                                            <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                                <strong>Email:</strong> {dr?.user?.email || "N/A"}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Phone:</strong> {dr?.user?.phone || "N/A"}
                                            </Typography>
                                        </>
                                    );
                                })()}
                            </Box>
                        </Grid>

                        {/* Appointment Date & Time */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
                                <CalendarTodayIcon sx={{ fontSize: "1.5rem", color: "#4CAF50" }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Appointment Date
                                </Typography>
                            </Box>
                            <Box sx={{ backgroundColor: "#f8f9fa", padding: 2, borderRadius: 1 }}>
                                <Typography variant="body2">
                                    <strong>Date:</strong> {formatDate(appointment.appointmentDate)}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
                                <AccessTimeIcon sx={{ fontSize: "1.5rem", color: "#FF9800" }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Appointment Time
                                </Typography>
                            </Box>
                            <Box sx={{ backgroundColor: "#f8f9fa", padding: 2, borderRadius: 1 }}>
                                <Typography variant="body2">
                                    <strong>Time:</strong> {appointment.appointmentTime || "N/A"}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Notes */}
                        {appointment.notes && (
                            <Grid item xs={12}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
                                    <DescriptionIcon sx={{ fontSize: "1.5rem", color: "#9C27B0" }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Notes
                                    </Typography>
                                </Box>
                                <Box sx={{ backgroundColor: "#f8f9fa", padding: 2, borderRadius: 1 }}>
                                    <Typography variant="body2">{appointment.notes}</Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            {/* Examination Information - structured like ExaminationDetails.jsx */}
            {examination && (() => {
                const customFields = examination.customFields || [];
                const clinicalFields = {};
                const systemicFields = {};
                customFields.forEach((field) => {
                    if (["Cardiovascular", "Respiratory", "Gastrointestinal", "Musculoskeletal", "Neurological"].includes(field.label)) {
                        systemicFields[field.label] = field.value;
                    } else {
                        clinicalFields[field.label] = field.value;
                    }
                });
                const vitals = examination.vitals?.[0] || {};
                const physicalExam = examination.physicalExamination
                    || (examination.personalHistory && typeof examination.personalHistory === "object"
                        ? examination.personalHistory
                        : {});
                const personalHistoryText = typeof examination.personalHistory === "string"
                    ? examination.personalHistory
                    : "";

                return (
                    <>
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
                            renderField("Diagnosis", examination.diagnoses?.[0] || (Array.isArray(examination.diagnoses) ? examination.diagnoses.join(", ") : examination.diagnoses)),
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
                            <Card sx={{ mb: 3, bgcolor: "#fff3e0" }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#E65100" }}>
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
                                            Examination Images ({patientImages.length})
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
                    </>
                );
            })()}

            {/* Prescriptions */}
            {prescriptions && prescriptions.length > 0 && (
                <Card sx={{ boxShadow: 3, borderRadius: 2, marginBottom: 3 }}>
                    <CardContent sx={{ padding: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 3 }}>
                            <MedicationIcon sx={{ fontSize: "1.5rem", color: "#4CAF50" }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                                Prescriptions ({prescriptions.length})
                            </Typography>
                        </Box>
                        <Divider sx={{ marginY: 3 }} />
                        {prescriptions.map((prescription, index) => (
                            <Box key={prescription._id || index} sx={{ marginBottom: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: 1 }}>
                                    Prescription #{index + 1}
                                </Typography>
                                <Box sx={{ backgroundColor: "#f8f9fa", padding: 2, borderRadius: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Prescribed by:</strong> {prescription.doctor?.user?.name ? `Dr. ${prescription.doctor.user.name}` : "N/A"}
                                    </Typography>
                                    <Typography variant="body2" sx={{ marginTop: 1 }}>
                                        <strong>Date:</strong> {formatDate(prescription.createdAt)}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Documents */}
            {documents.length > 0 && (
                <Card sx={{ boxShadow: 3, borderRadius: 2, marginBottom: 3 }}>
                    <CardContent sx={{ padding: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 3 }}>
                            <DescriptionIcon sx={{ fontSize: "1.5rem", color: "#E53935" }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                                Documents ({documents.length})
                            </Typography>
                        </Box>
                        <Divider sx={{ marginY: 3 }} />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {documents.map((doc) => (
                                <Paper
                                    key={doc._id}
                                    variant="outlined"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        padding: 2,
                                        borderRadius: 1.5,
                                    }}
                                >
                                    <PictureAsPdfIcon sx={{ color: "error.main", fontSize: "2rem" }} />
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
                                            {doc.originalFileName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {doc.description || "No description"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatFileSize(doc.fileSize)}
                                            {doc.uploadedAt ? ` • ${formatDate(doc.uploadedAt)}` : ""}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => handleViewDocument(doc._id)}
                                    >
                                        View
                                    </Button>
                                </Paper>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Therapy Sessions */}
            {therapySessions && therapySessions.length > 0 && (
                <Card sx={{ boxShadow: 3, borderRadius: 2, marginBottom: 3 }}>
                    <CardContent sx={{ padding: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 3 }}>
                            <HealingIcon sx={{ fontSize: "1.5rem", color: "#9C27B0" }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                                Therapy Sessions ({therapySessions.length})
                            </Typography>
                        </Box>
                        <Divider sx={{ marginY: 3 }} />
                        <Table component={Paper} variant="outlined">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell><strong>Treatment</strong></TableCell>
                                    <TableCell><strong>Sub Therapy</strong></TableCell>
                                    <TableCell><strong>Duration</strong></TableCell>
                                    <TableCell><strong>Days</strong></TableCell>
                                    <TableCell><strong>Timeline</strong></TableCell>
                                    <TableCell><strong>Therapist</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {therapySessions.map((session) => (
                                    <TableRow key={session._id}>
                                        <TableCell>{formatDate(session.sessionDate)}</TableCell>
                                        <TableCell>{session.treatmentName || session.treatmentPlan?.treatmentName || "N/A"}</TableCell>
                                        <TableCell>{session.subTherapy || "—"}</TableCell>
                                        <TableCell>{session.duration || "—"}</TableCell>
                                        <TableCell>{session.daysOfTreatment || "—"}</TableCell>
                                        <TableCell>{session.timeline || "—"}</TableCell>
                                        <TableCell>
                                            {session.therapists && session.therapists.length > 0
                                                ? session.therapists.map(t => t.user?.name || "N/A").join(", ")
                                                : session.therapist?.user?.name || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={session.status || "N/A"} size="small" color={getStatusColor(session.status)} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Invoice Information */}
            {appointmentInvoice && (
                <Card sx={{ boxShadow: 3, borderRadius: 2, marginBottom: 3 }}>
                    <CardContent sx={{ padding: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 3 }}>
                            <ReceiptIcon sx={{ fontSize: "1.5rem", color: "#FF9800" }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                                Invoice Information
                            </Typography>
                        </Box>
                        <Divider sx={{ marginY: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                    <strong>Invoice Number:</strong> {appointmentInvoice.invoiceNumber || "N/A"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                    <strong>Total Amount:</strong> ₹{appointmentInvoice.totalPayable?.toLocaleString("en-IN") || "0.00"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2">
                                    <strong>Date:</strong> {formatDate(appointmentInvoice.createdAt)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* No Examination Message */}
            {!examination && (
                <Card sx={{ boxShadow: 3, borderRadius: 2, marginBottom: 3 }}>
                    <CardContent sx={{ padding: 4, textAlign: "center" }}>
                        <Typography variant="h6" sx={{ marginBottom: 1, color: "#666" }}>
                            No Examination Record Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            This appointment has not been examined yet. Examination details will appear here once the doctor completes the examination.
                        </Typography>
                    </CardContent>
                </Card>
            )}

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

            <Dialog
                open={viewDialogOpen}
                onClose={() => {
                    setViewDialogOpen(false);
                    setSelectedDocumentUrl(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogContent sx={{ p: 1.5 }}>
                    {selectedDocumentUrl && (
                        <Box
                            component="iframe"
                            src={selectedDocumentUrl}
                            title="Document"
                            sx={{
                                width: "100%",
                                height: "80vh",
                                border: "none",
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ConsultationDetails;

