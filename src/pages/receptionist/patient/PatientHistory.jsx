import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Divider,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Grid,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
} from "@mui/material";
import {
    ExpandMore,
    CalendarToday,
    LocalHospital,
    Medication,
    Spa,
    Event,
    Receipt,
    Hotel,
    Restaurant,
    Person,
    Phone,
    Email,
    Home,
    ArrowBack,
    CloudUpload,
    PictureAsPdf,
    Visibility,
    Delete,
    Close,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import patientService from "../../../services/patientService";
import patientDocumentService from "../../../services/patientDocumentService";
import { Button } from "@mui/material";

function PatientHistory() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDocumentUrl, setSelectedDocumentUrl] = useState(null);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        file: null,
        description: '',
        category: 'other',
    });

    // Fetch patient documents
    const fetchDocuments = async () => {
        if (!patientId) return;
        try {
            const response = await patientDocumentService.getPatientDocuments(patientId);
            if (response && response.success) {
                setDocuments(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };

    useEffect(() => {
        const fetchHistory = async () => {
            if (!patientId) {
                toast.error("Patient ID is required");
                navigate(-1);
                return;
            }

            try {
                setLoading(true);
                const response = await patientService.getPatientHistory(patientId);
                if (response && response.success) {
                    setHistoryData(response.data);
                } else {
                    toast.error(response?.message || "Failed to load patient history");
                    navigate(-1);
                }
            } catch (error) {
                console.error("Error fetching patient history:", error);
                toast.error(error?.message || "Failed to load patient history");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
        fetchDocuments();
    }, [patientId, navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        const statusLower = (status || "").toLowerCase();
        if (statusLower.includes("completed") || statusLower.includes("discharged") || statusLower.includes("dispensed")) {
            return "success";
        } else if (statusLower.includes("ongoing") || statusLower.includes("admitted")) {
            return "primary";
        } else if (statusLower.includes("pending") || statusLower.includes("scheduled")) {
            return "warning";
        } else if (statusLower.includes("cancelled")) {
            return "error";
        }
        return "default";
    };

    // Handle file selection
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Only PDF files are allowed');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setUploadForm({ ...uploadForm, file });
        }
    };

    // Handle upload
    const handleUpload = async () => {
        if (!uploadForm.file) {
            toast.error('Please select a PDF file');
            return;
        }

        try {
            setUploading(true);
            const response = await patientDocumentService.uploadDocument(
                patientId,
                uploadForm.file,
                uploadForm.description,
                uploadForm.category
            );

            if (response && response.success) {
                toast.success('Document uploaded successfully');
                setUploadDialogOpen(false);
                setUploadForm({ file: null, description: '', category: 'other' });
                fetchDocuments();
            } else {
                toast.error(response?.message || 'Failed to upload document');
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            toast.error(error?.response?.data?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    // Handle view document
    const handleViewDocument = async (documentId) => {
        try {
            const response = await patientDocumentService.getDocumentViewUrl(documentId);
            if (response && response.success) {
                setSelectedDocumentUrl(response.data.url);
                setViewDialogOpen(true);
            } else {
                toast.error('Failed to load document');
            }
        } catch (error) {
            console.error('Error viewing document:', error);
            toast.error('Failed to load document');
        }
    };

    // Handle delete document - open confirmation dialog
    const handleDeleteDocument = (documentId) => {
        setDocumentToDelete(documentId);
        setDeleteDialogOpen(true);
    };

    // Confirm delete document
    const confirmDeleteDocument = async () => {
        if (!documentToDelete) return;

        try {
            setDeleting(true);
            const response = await patientDocumentService.deleteDocument(documentToDelete);
            if (response && response.success) {
                toast.success('Document deleted successfully');
                fetchDocuments();
                setDeleteDialogOpen(false);
                setDocumentToDelete(null);
            } else {
                toast.error(response?.message || 'Failed to delete document');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error(error?.response?.data?.message || 'Failed to delete document');
        } finally {
            setDeleting(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!historyData) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h6" color="error">
                    Failed to load patient history.
                </Typography>
            </Box>
        );
    }

    const { patient, history, summary } = historyData;

    return (
        <Box sx={{ padding: "20px" }}>
            <Breadcrumb
                items={[
                    { label: "Home", url: "/" },
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Patient History" },
                ]}
            />

            <Box sx={{ mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 2 }}
                >
                    Back
                </Button>
            </Box>

            <HeadingCard
                title="Complete Patient History"
                subtitle={`Comprehensive medical history for ${patient.name}`}
                action={
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<CloudUpload />}
                        onClick={() => setUploadDialogOpen(true)}
                        sx={{ 
                            fontSize: '0.875rem',
                            py: 0.75,
                            px: 1.5,
                        }}
                    >
                        Upload PDF
                    </Button>
                }
            />

            {/* Patient Info Card */}
            <Card sx={{ mb: 3, boxShadow: 3 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="h5" fontWeight={700} gutterBottom>
                                        {patient.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Patient ID: {patient.patientId} | UHID: {patient.uhid}
                                    </Typography>
                                </Box>
                                <Box>
                                    {patient.dateOfBirth && (
                                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                            <CalendarToday fontSize="small" /> DOB: {formatDate(patient.dateOfBirth)}
                                        </Typography>
                                    )}
                                    {patient.phone && patient.phone !== "N/A" && (
                                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                            <Phone fontSize="small" /> {patient.phone}
                                        </Typography>
                                    )}
                                    {patient.email && patient.email !== "N/A" && (
                                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                            <Email fontSize="small" /> {patient.email}
                                        </Typography>
                                    )}
                                    {patient.address && patient.address !== "N/A" && (
                                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Home fontSize="small" /> {patient.address}
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Medical Team
                                    </Typography>
                                    {patient.primaryDoctor && patient.primaryDoctor !== "N/A" && (
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Primary Doctor: <strong>{patient.primaryDoctor}</strong>
                                        </Typography>
                                    )}
                                    {patient.allocatedNurse && patient.allocatedNurse !== "N/A" && (
                                        <Typography variant="body2">
                                            Allocated Nurse: <strong>{patient.allocatedNurse}</strong>
                                        </Typography>
                                    )}
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Summary
                                    </Typography>
                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">Examinations: <strong>{summary.totalExaminations}</strong></Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">Prescriptions: <strong>{summary.totalPrescriptions}</strong></Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">Therapy Sessions: <strong>{summary.totalTherapySessions}</strong></Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">Appointments: <strong>{summary.totalAppointments}</strong></Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">Invoices: <strong>{summary.totalInvoices}</strong></Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">IPD Records: <strong>{summary.totalInpatientRecords}</strong></Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Patient Documents Section */}
            <Card sx={{ mb: 3, boxShadow: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight={700}>
                            Patient Documents ({documents.length})
                        </Typography>
                    </Box>
                    {documents.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                            No documents uploaded yet.
                        </Typography>
                    ) : (
                        <List>
                            {documents.map((doc) => (
                                <ListItem
                                    key={doc._id}
                                    sx={{
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 1,
                                        '&:hover': {
                                            bgcolor: '#f5f5f5',
                                        },
                                    }}
                                >
                                    <PictureAsPdf sx={{ color: 'error.main', mr: 2 }} />
                                    <ListItemText
                                        primary={doc.originalFileName}
                                        secondary={
                                            <Box>
                                                <Typography variant="caption" display="block">
                                                    {doc.description || 'No description'}
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
                                            sx={{ mr: 1 }}
                                        >
                                            <Visibility />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDeleteDocument(doc._id)}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>

            {/* History Timeline */}
            {history.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h6" color="text.secondary">
                        No history records found for this patient.
                    </Typography>
                </Paper>
            ) : (
                <Box>
                    {history.map((dayData, dayIndex) => (
                        <Paper key={dayIndex} sx={{ mb: 3, boxShadow: 2 }}>
                            <Box sx={{ p: 2, bgcolor: "primary.main", color: "white", borderRadius: "4px 4px 0 0" }}>
                                <Typography variant="h6" fontWeight={700}>
                                    {dayData.date === "unknown" ? "Unknown Date" : formatDate(dayData.date)}
                                </Typography>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                {/* Examinations */}
                                {dayData.examinations.length > 0 && (
                                    <Accordion defaultExpanded={dayIndex === 0} sx={{ mb: 2 }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                                                <LocalHospital color="primary" />
                                                <Typography variant="h6" fontWeight={600}>
                                                    Examinations ({dayData.examinations.length})
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {dayData.examinations.map((exam, idx) => (
                                                <Card key={idx} sx={{ mb: 2, border: "1px solid #e0e0e0" }}>
                                                    <CardContent>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                                            <Chip label={exam.type} color="primary" size="small" />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {formatDateTime(exam.createdAt)}
                                                            </Typography>
                                                        </Box>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                                    <strong>Doctor:</strong> {exam.doctor}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                                    <strong>Complaints:</strong> {exam.complaints}
                                                                </Typography>
                                                                {exam.historyOfPatientIllness && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>History of Illness:</strong>
                                                                        <Box sx={{ mt: 0.5, p: 1, bgcolor: "#f5f5f5", borderRadius: 1, fontSize: "0.8rem" }}>
                                                                            {exam.historyOfPatientIllness}
                                                                        </Box>
                                                                    </Typography>
                                                                )}
                                                                {exam.ongoingMedications && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>Ongoing Medications:</strong>
                                                                        <Box sx={{ mt: 0.5, p: 1, bgcolor: "#f5f5f5", borderRadius: 1, fontSize: "0.8rem" }}>
                                                                            {exam.ongoingMedications}
                                                                        </Box>
                                                                    </Typography>
                                                                )}
                                                                {exam.previousInvestigations && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>Previous Investigations:</strong>
                                                                        <Box sx={{ mt: 0.5, p: 1, bgcolor: "#f5f5f5", borderRadius: 1, fontSize: "0.8rem" }}>
                                                                            {exam.previousInvestigations}
                                                                        </Box>
                                                                    </Typography>
                                                                )}
                                                                {exam.presentInvestigations && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>Present Investigations:</strong>
                                                                        <Box sx={{ mt: 0.5, p: 1, bgcolor: "#f5f5f5", borderRadius: 1, fontSize: "0.8rem" }}>
                                                                            {exam.presentInvestigations}
                                                                        </Box>
                                                                    </Typography>
                                                                )}
                                                                {exam.medicalSurgicalHistory && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>Medical/Surgical History:</strong>
                                                                        <Box sx={{ mt: 0.5, p: 1, bgcolor: "#f5f5f5", borderRadius: 1, fontSize: "0.8rem" }}>
                                                                            {exam.medicalSurgicalHistory}
                                                                        </Box>
                                                                    </Typography>
                                                                )}
                                                                {exam.diagnosis && exam.diagnosis.length > 0 && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>Diagnosis:</strong> {exam.diagnosis.join(", ")}
                                                                    </Typography>
                                                                )}
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                {exam.laboratoryInvestigation && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>Laboratory Investigation:</strong>
                                                                        <Box sx={{ mt: 1, p: 1, bgcolor: "#f5f5f5", borderRadius: 1, whiteSpace: "pre-wrap", fontSize: "0.8rem" }}>
                                                                            {exam.laboratoryInvestigation}
                                                                        </Box>
                                                                    </Typography>
                                                                )}
                                                                {exam.examinationNotes && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>Examination Notes:</strong>
                                                                        <Box sx={{ mt: 1, p: 1, bgcolor: "#f5f5f5", borderRadius: 1, whiteSpace: "pre-wrap", fontSize: "0.8rem" }}>
                                                                            {exam.examinationNotes}
                                                                        </Box>
                                                                    </Typography>
                                                                )}
                                                                {exam.prakritiAssessment && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>Prakriti Assessment:</strong>
                                                                        <Box sx={{ mt: 0.5, p: 1, bgcolor: "#f5f5f5", borderRadius: 1, fontSize: "0.8rem" }}>
                                                                            {exam.prakritiAssessment}
                                                                        </Box>
                                                                    </Typography>
                                                                )}
                                                                {exam.customFields && exam.customFields.length > 0 && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>Clinical Examination:</strong>
                                                                        <Box sx={{ mt: 0.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                                                            {exam.customFields.map((field, fieldIdx) => (
                                                                                <Box key={fieldIdx} sx={{ fontSize: "0.8rem" }}>
                                                                                    <strong>{field.label}:</strong> {field.value}
                                                                                </Box>
                                                                            ))}
                                                                        </Box>
                                                                    </Typography>
                                                                )}
                                                                {exam.followUps && exam.followUps.length > 0 && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>Follow-ups:</strong>
                                                                        <Box sx={{ mt: 0.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                                                            {exam.followUps.map((fu, fuIdx) => (
                                                                                <Box key={fuIdx} sx={{ fontSize: "0.8rem" }}>
                                                                                    {formatDate(fu.date)}: {fu.note || "No notes"}
                                                                                </Box>
                                                                            ))}
                                                                        </Box>
                                                                    </Typography>
                                                                )}
                                                                {exam.inpatient && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>IPD:</strong> Room {exam.inpatient.roomNumber}, Bed {exam.inpatient.bedNumber} ({exam.inpatient.wardCategory})
                                                                    </Typography>
                                                                )}
                                                                {exam.appointment && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>Appointment:</strong> {formatDate(exam.appointment.date)} at {exam.appointment.time} ({exam.appointment.status})
                                                                    </Typography>
                                                                )}
                                                            </Grid>
                                                            {exam.vitals && exam.vitals.length > 0 && (
                                                                <Grid item xs={12}>
                                                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                                        <strong>Vitals:</strong>
                                                                    </Typography>
                                                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                                        {Object.entries(exam.vitals[0] || {}).filter(([key]) => key !== "recordedAt" && key !== "_id" && key !== "__v").map(([key, value]) => (
                                                                            value && (
                                                                                <Chip
                                                                                    key={key}
                                                                                    label={`${key}: ${value}`}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                />
                                                                            )
                                                                        ))}
                                                                    </Box>
                                                                </Grid>
                                                            )}
                                                        </Grid>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                )}

                                {/* Prescriptions */}
                                {dayData.prescriptions.length > 0 && (
                                    <Accordion defaultExpanded={dayIndex === 0} sx={{ mb: 2 }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                                                <Medication color="secondary" />
                                                <Typography variant="h6" fontWeight={600}>
                                                    Prescriptions ({dayData.prescriptions.length})
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell><strong>Medication</strong></TableCell>
                                                            <TableCell><strong>Dosage</strong></TableCell>
                                                            <TableCell><strong>Frequency</strong></TableCell>
                                                            <TableCell><strong>Duration</strong></TableCell>
                                                            <TableCell><strong>Quantity</strong></TableCell>
                                                            <TableCell><strong>Status</strong></TableCell>
                                                            <TableCell><strong>Doctor</strong></TableCell>
                                                            <TableCell><strong>Date</strong></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {dayData.prescriptions.map((presc, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell>
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight={600}>
                                                                            {presc.medication}
                                                                        </Typography>
                                                                        {presc.medicineType && (
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                {presc.medicineType} ({presc.administration || "Internal"})
                                                                            </Typography>
                                                                        )}
                                                                        {presc.notes && (
                                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                                Notes: {presc.notes}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell>{presc.dosage}</TableCell>
                                                                <TableCell>{presc.frequency}</TableCell>
                                                                <TableCell>{presc.duration || "N/A"}</TableCell>
                                                                <TableCell>
                                                                    {presc.dispensedQuantity > 0
                                                                        ? `${presc.dispensedQuantity} / ${presc.quantity}`
                                                                        : presc.quantity}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={presc.status}
                                                                        color={getStatusColor(presc.status)}
                                                                        size="small"
                                                                    />
                                                                    {presc.isInpatient && (
                                                                        <Chip label="IPD" size="small" color="info" sx={{ ml: 0.5 }} />
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>{presc.doctor}</TableCell>
                                                                <TableCell>
                                                                    {formatDateTime(presc.createdAt)}
                                                                    {presc.dispensedAt && (
                                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                                            Dispensed: {formatDateTime(presc.dispensedAt)}
                                                                        </Typography>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </AccordionDetails>
                                    </Accordion>
                                )}

                                {/* Therapy Sessions */}
                                {dayData.therapySessions.length > 0 && (
                                    <Accordion defaultExpanded={dayIndex === 0} sx={{ mb: 2 }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                                                <Spa color="success" />
                                                <Typography variant="h6" fontWeight={600}>
                                                    Therapy Sessions ({dayData.therapySessions.length})
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {dayData.therapySessions.map((session, idx) => {
                                                // Helper function to check if a string is a MongoDB ID
                                                const isMongoId = (str) => {
                                                    if (!str || typeof str !== 'string') return false;
                                                    return /^[0-9a-fA-F]{24}$/.test(str);
                                                };
                                                
                                                // Get treatment name, ensuring it's not a MongoDB ID
                                                const getTreatmentName = () => {
                                                    const name = session.treatmentName;
                                                    if (!name || name === "N/A" || isMongoId(name)) {
                                                        // Fallback to a meaningful default
                                                        return "Therapy Session";
                                                    }
                                                    return name;
                                                };
                                                
                                                return (
                                                <Card key={idx} sx={{ mb: 2, border: "1px solid #e0e0e0" }}>
                                                    <CardContent>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                                            <Typography variant="h6">{getTreatmentName()}</Typography>
                                                            <Chip
                                                                label={session.status || "Pending"}
                                                                color={getStatusColor(session.status)}
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                                    <strong>Therapists:</strong>{" "}
                                                                    {session.therapists.map((t, i) => (
                                                                        <span key={i}>
                                                                            {t.name} ({t.speciality})
                                                                            {i < session.therapists.length - 1 && ", "}
                                                                        </span>
                                                                    ))}
                                                                </Typography>
                                                                {session.examination && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>Related Examination:</strong> {session.examination.complaints} (Dr. {session.examination.doctor})
                                                                    </Typography>
                                                                )}
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                {session.inpatient && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>IPD:</strong> Room {session.inpatient.roomNumber}, Bed {session.inpatient.bedNumber}
                                                                    </Typography>
                                                                )}
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Created: {formatDateTime(session.createdAt)}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </CardContent>
                                                </Card>
                                                );
                                            })}
                                        </AccordionDetails>
                                    </Accordion>
                                )}

                                {/* Appointments */}
                                {dayData.appointments.length > 0 && (
                                    <Accordion defaultExpanded={dayIndex === 0} sx={{ mb: 2 }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                                                <Event color="info" />
                                                <Typography variant="h6" fontWeight={600}>
                                                    Appointments ({dayData.appointments.length})
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {dayData.appointments.map((appt, idx) => (
                                                <Card key={idx} sx={{ mb: 2, border: "1px solid #e0e0e0" }}>
                                                    <CardContent>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                            <Typography variant="h6">{formatDate(appt.date)} at {appt.time}</Typography>
                                                            <Chip
                                                                label={appt.status}
                                                                color={getStatusColor(appt.status)}
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Typography variant="body2">
                                                            <strong>Doctor:</strong> {appt.doctor}
                                                        </Typography>
                                                        {appt.notes && (
                                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                                <strong>Notes:</strong> {appt.notes}
                                                            </Typography>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                )}

                                {/* Invoices */}
                                {dayData.invoices.length > 0 && (
                                    <Accordion defaultExpanded={dayIndex === 0} sx={{ mb: 2 }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                                                <Receipt color="warning" />
                                                <Typography variant="h6" fontWeight={600}>
                                                    Invoices ({dayData.invoices.length})
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {dayData.invoices.map((invoice, idx) => (
                                                <Card key={idx} sx={{ mb: 2, border: "1px solid #e0e0e0" }}>
                                                    <CardContent>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                                            <Typography variant="h6">Invoice #{invoice.invoiceNumber}</Typography>
                                                            <Typography variant="h6" color="primary">
                                                                {formatCurrency(invoice.totalPayable)}
                                                            </Typography>
                                                        </Box>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                                    <strong>Subtotal:</strong> {formatCurrency(invoice.subtotal)}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                                    <strong>Discount:</strong> {invoice.discountRate}%
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                                    <strong>Tax:</strong> {invoice.taxRate}%
                                                                </Typography>
                                                                {invoice.inpatient && (
                                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                                        <strong>IPD:</strong> Room {invoice.inpatient.roomNumber}, Bed {invoice.inpatient.bedNumber}
                                                                    </Typography>
                                                                )}
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                {invoice.items && invoice.items.length > 0 && (
                                                                    <Box>
                                                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                                            <strong>Items:</strong>
                                                                        </Typography>
                                                                        <TableContainer>
                                                                            <Table size="small">
                                                                                <TableHead>
                                                                                    <TableRow>
                                                                                        <TableCell><strong>Item</strong></TableCell>
                                                                                        <TableCell align="right"><strong>Qty</strong></TableCell>
                                                                                        <TableCell align="right"><strong>Amount</strong></TableCell>
                                                                                    </TableRow>
                                                                                </TableHead>
                                                                                <TableBody>
                                                                                    {invoice.items.map((item, itemIdx) => (
                                                                                        <TableRow key={itemIdx}>
                                                                                            <TableCell>{item.name || "N/A"}</TableCell>
                                                                                            <TableCell align="right">{item.quantity || 1}</TableCell>
                                                                                            <TableCell align="right">{formatCurrency(item.total || item.unitPrice || 0)}</TableCell>
                                                                                        </TableRow>
                                                                                    ))}
                                                                                </TableBody>
                                                                            </Table>
                                                                        </TableContainer>
                                                                    </Box>
                                                                )}
                                                            </Grid>
                                                        </Grid>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                                            Date: {formatDateTime(invoice.createdAt)}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                )}

                                {/* Inpatient Records */}
                                {dayData.inpatients.length > 0 && (
                                    <Accordion defaultExpanded={dayIndex === 0} sx={{ mb: 2 }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                                                <Hotel color="primary" />
                                                <Typography variant="h6" fontWeight={600}>
                                                    Inpatient Records ({dayData.inpatients.length})
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {dayData.inpatients.map((ip, idx) => (
                                                <Card key={idx} sx={{ mb: 2, border: "1px solid #e0e0e0" }}>
                                                    <CardContent>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                                            <Chip label={ip.status} color={getStatusColor(ip.status)} size="small" />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {formatDate(ip.admissionDate)} - {ip.dischargeDate ? formatDate(ip.dischargeDate) : "Ongoing"}
                                                            </Typography>
                                                        </Box>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                                    <strong>Room:</strong> {ip.roomNumber} | <strong>Bed:</strong> {ip.bedNumber}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                                    <strong>Ward:</strong> {ip.wardCategory}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                                    <strong>Doctor:</strong> {ip.doctor}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                                    <strong>Nurse:</strong> {ip.allocatedNurse}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                                    <strong>Reason:</strong> {ip.reason}
                                                                </Typography>
                                                                {ip.notes && (
                                                                    <Typography variant="body2">
                                                                        <strong>Notes:</strong> {ip.notes}
                                                                    </Typography>
                                                                )}
                                                            </Grid>
                                                        </Grid>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                )}

                                {/* Food Intakes */}
                                {dayData.foodIntakes.length > 0 && (
                                    <Accordion defaultExpanded={dayIndex === 0} sx={{ mb: 2 }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                                                <Restaurant color="secondary" />
                                                <Typography variant="h6" fontWeight={600}>
                                                    Food Intakes ({dayData.foodIntakes.length})
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell><strong>Meal Type</strong></TableCell>
                                                            <TableCell><strong>Description</strong></TableCell>
                                                            <TableCell align="right"><strong>Price</strong></TableCell>
                                                            <TableCell><strong>Location</strong></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {dayData.foodIntakes.map((food, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell>{food.mealType}</TableCell>
                                                                <TableCell>{food.foodDescription}</TableCell>
                                                                <TableCell align="right">{formatCurrency(food.price)}</TableCell>
                                                                <TableCell>
                                                                    {food.inpatient
                                                                        ? `Room ${food.inpatient.roomNumber}, Bed ${food.inpatient.bedNumber}`
                                                                        : "N/A"}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </AccordionDetails>
                                    </Accordion>
                                )}
                            </Box>
                        </Paper>
                    ))}
                </Box>
            )}

            {/* Upload PDF Dialog */}
            <Dialog
                open={uploadDialogOpen}
                onClose={() => !uploading && setUploadDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Upload PDF Document</Typography>
                        <IconButton
                            onClick={() => setUploadDialogOpen(false)}
                            disabled={uploading}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Box>
                            <input
                                accept="application/pdf"
                                style={{ display: 'none' }}
                                id="pdf-upload-input"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="pdf-upload-input">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    fullWidth
                                    startIcon={<CloudUpload />}
                                    disabled={uploading}
                                    sx={{ py: 2 }}
                                >
                                    {uploadForm.file ? uploadForm.file.name : 'Select PDF File'}
                                </Button>
                            </label>
                            {uploadForm.file && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    File size: {formatFileSize(uploadForm.file.size)}
                                </Typography>
                            )}
                        </Box>
                        <TextField
                            label="Description"
                            multiline
                            rows={3}
                            value={uploadForm.description}
                            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                            disabled={uploading}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Category"
                            value={uploadForm.category}
                            onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                            disabled={uploading}
                            fullWidth
                        >
                            <MenuItem value="lab_report">Lab Report</MenuItem>
                            <MenuItem value="scan_report">Scan Report</MenuItem>
                            <MenuItem value="prescription">Prescription</MenuItem>
                            <MenuItem value="discharge_summary">Discharge Summary</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setUploadDialogOpen(false)}
                        disabled={uploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={uploading || !uploadForm.file}
                        startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View PDF Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth={false}
                fullWidth
                PaperProps={{
                    sx: {
                        height: '98vh',
                        width: '98vw',
                        maxWidth: '98vw',
                        maxHeight: '98vh',
                        margin: '1vh 1vw',
                    },
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">View PDF Document</Typography>
                        <IconButton onClick={() => setViewDialogOpen(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 0, height: 'calc(98vh - 64px)', overflow: 'hidden' }}>
                    {selectedDocumentUrl && (
                        <iframe
                            src={selectedDocumentUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                minHeight: 'calc(98vh - 64px)',
                            }}
                            title="PDF Viewer"
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !deleting && setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Delete Document</Typography>
                        <IconButton
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={deleting}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body1">
                            Are you sure you want to delete this document? This action cannot be undone.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => {
                            setDeleteDialogOpen(false);
                            setDocumentToDelete(null);
                        }}
                        disabled={deleting}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDeleteDocument}
                        disabled={deleting}
                        variant="contained"
                        color="error"
                        startIcon={deleting ? <CircularProgress size={20} /> : <Delete />}
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default PatientHistory;

