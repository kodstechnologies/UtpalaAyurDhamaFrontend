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
} from "@mui/material";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";
import appointmentService from "../../../services/appointmentService";

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

function ConsultationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [consultationData, setConsultationData] = useState(null);

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
            Scheduled: "default",
            Confirmed: "info",
            Ongoing: "warning",
            Completed: "success",
            Cancelled: "error",
            "No Show": "error",
        };
        return statusColors[status] || "default";
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

    if (!consultationData.appointment) {
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
                            Appointment data not found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 3 }}>
                            Unable to load appointment information. Please try again later.
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

    const { appointment, examination, prescriptions, therapySessions, appointmentInvoice, doctorConsultationFee } = consultationData;

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
                        <Chip
                            label={appointment.status || "Scheduled"}
                            color={getStatusColor(appointment.status)}
                            sx={{ fontWeight: 600 }}
                        />
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
                                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                    <strong>Name:</strong> {appointment.doctor?.user?.name ? `Dr. ${appointment.doctor.user.name}` : "N/A"}
                                </Typography>
                                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                    <strong>Email:</strong> {appointment.doctor?.user?.email || "N/A"}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Phone:</strong> {appointment.doctor?.user?.phone || "N/A"}
                                </Typography>
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

            {/* Examination Information */}
            {examination && (
                <Card sx={{ boxShadow: 3, borderRadius: 2, marginBottom: 3 }}>
                    <CardContent sx={{ padding: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a", marginBottom: 3 }}>
                            Examination Details
                        </Typography>
                        <Divider sx={{ marginY: 3 }} />

                        <Grid container spacing={3}>
                            {/* Chief Complaint */}
                            {examination.complaints && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: 1 }}>
                                        Chief Complaint
                                    </Typography>
                                    <Box sx={{ backgroundColor: "#f8f9fa", padding: 2, borderRadius: 1 }}>
                                        <Typography variant="body2">{examination.complaints}</Typography>
                                    </Box>
                                </Grid>
                            )}

                            {/* History of Present Illness */}
                            {examination.historyOfPatientIllness && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: 1 }}>
                                        History of Present Illness
                                    </Typography>
                                    <Box sx={{ backgroundColor: "#f8f9fa", padding: 2, borderRadius: 1 }}>
                                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                            {examination.historyOfPatientIllness}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}

                            {/* Diagnoses */}
                            {examination.diagnoses && examination.diagnoses.length > 0 && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: 1 }}>
                                        Diagnoses
                                    </Typography>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {examination.diagnoses.map((diagnosis, index) => (
                                            <Chip key={index} label={diagnosis} color="primary" variant="outlined" />
                                        ))}
                                    </Box>
                                </Grid>
                            )}

                            {/* Follow-ups */}
                            {examination.followUps && examination.followUps.length > 0 && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: 2 }}>
                                        Follow-up Appointments
                                    </Typography>
                                    <Table component={Paper} variant="outlined">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Date</strong></TableCell>
                                                <TableCell><strong>Notes</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {examination.followUps.map((followUp, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{formatFollowUpDate(followUp.date)}</TableCell>
                                                    <TableCell>{followUp.note || "—"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            )}

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
                                    <TableCell><strong>Therapist</strong></TableCell>
                                    <TableCell><strong>Treatment</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {therapySessions.slice(0, 10).map((session) => (
                                    <TableRow key={session._id}>
                                        <TableCell>{formatDate(session.date)}</TableCell>
                                        <TableCell>{session.therapist?.user?.name || "N/A"}</TableCell>
                                        <TableCell>{session.treatmentPlan?.treatmentName || "N/A"}</TableCell>
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
        </div>
    );
}

export default ConsultationDetails;

