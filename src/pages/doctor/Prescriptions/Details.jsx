import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Grid,
    Divider,
    Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

function PrescriptionsDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    // Mock data - replace with API call
    const [prescription, setPrescription] = useState(null);

    useEffect(() => {
        // Simulate API call to fetch prescription details
        const fetchPrescription = async () => {
            // Mock prescription data
            const mockPrescription = {
                _id: id,
                patientName: "Amit Kumar",
                patientId: "PAT-001",
                prescriptionDate: "2025-01-18",
                diagnosis: "Fever and Upper Respiratory Infection",
                status: "Active",
                doctorName: "Dr. Sharma",
                medicines: [
                    {
                        name: "Paracetamol",
                        dosage: "500mg",
                        frequency: "Twice daily",
                        duration: "5 days",
                        instructions: "Take after meals",
                    },
                    {
                        name: "Amoxicillin",
                        dosage: "250mg",
                        frequency: "Thrice daily",
                        duration: "7 days",
                        instructions: "Take with food",
                    },
                ],
                notes: "Patient should rest and drink plenty of fluids. Follow up if symptoms persist.",
                createdAt: "2025-01-18T10:30:00",
            };

            setPrescription(mockPrescription);
        };

        if (id) {
            fetchPrescription();
        }
    }, [id]);

    if (!prescription) {
        return (
            <Box sx={{ p: 3 }}>
                <HeadingCard
                    title="Prescription Details"
                    subtitle="Loading prescription information..."
                    breadcrumbItems={[
                        { label: "Doctor", url: "/doctor/dashboard" },
                        { label: "Prescriptions", url: "/doctor/prescriptions" },
                        { label: "Details" },
                    ]}
                />
            </Box>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            Active: "success",
            Completed: "default",
            Cancelled: "error",
        };
        return colors[status] || "default";
    };

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Prescription Details"
                subtitle={`Prescription #${prescription._id}`}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Prescriptions", url: "/doctor/prescriptions" },
                    { label: "Details" },
                ]}
            />

            <Box sx={{ mt: 3, display: "flex", gap: 2, mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/doctor/prescriptions")}
                >
                    Back to Prescriptions
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Patient Information Card */}
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            backgroundColor: "var(--color-bg-card)",
                            borderRadius: 2,
                            boxShadow: "var(--shadow-medium)",
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <PersonIcon sx={{ mr: 1, color: "var(--color-primary)" }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Patient Information
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Patient Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {prescription.patientName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Patient ID
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {prescription.patientId}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Prescription Information Card */}
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            backgroundColor: "var(--color-bg-card)",
                            borderRadius: 2,
                            boxShadow: "var(--shadow-medium)",
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <MedicationIcon sx={{ mr: 1, color: "var(--color-primary)" }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Prescription Information
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Prescription Date
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <EventIcon fontSize="small" />
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {prescription.prescriptionDate}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Status
                                    </Typography>
                                    <Chip
                                        label={prescription.status}
                                        color={getStatusColor(prescription.status)}
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Prescribed By
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <LocalHospitalIcon fontSize="small" />
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {prescription.doctorName}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Diagnosis Card */}
                {prescription.diagnosis && (
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                backgroundColor: "var(--color-bg-card)",
                                borderRadius: 2,
                                boxShadow: "var(--shadow-medium)",
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                    Diagnosis
                                </Typography>
                                <Typography variant="body1">{prescription.diagnosis}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Medicines Card */}
                <Grid item xs={12}>
                    <Card
                        sx={{
                            backgroundColor: "var(--color-bg-card)",
                            borderRadius: 2,
                            boxShadow: "var(--shadow-medium)",
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Prescribed Medicines
                            </Typography>
                            <Grid container spacing={2}>
                                {prescription.medicines && prescription.medicines.length > 0 ? (
                                    prescription.medicines.map((medicine, index) => (
                                        <Grid item xs={12} key={index}>
                                            <Box
                                                sx={{
                                                    border: "1px solid var(--color-border)",
                                                    borderRadius: 2,
                                                    p: 2,
                                                    backgroundColor: "var(--color-bg-a)",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                        {medicine.name}
                                                    </Typography>
                                                    <Chip
                                                        label={medicine.dosage}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                                    <Grid item xs={12} sm={4}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Frequency
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {medicine.frequency}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Duration
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {medicine.duration}
                                                        </Typography>
                                                    </Grid>
                                                    {medicine.instructions && (
                                                        <Grid item xs={12} sm={4}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Instructions
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {medicine.instructions}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            No medicines found
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Notes Card */}
                {prescription.notes && (
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                backgroundColor: "var(--color-bg-card)",
                                borderRadius: 2,
                                boxShadow: "var(--shadow-medium)",
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                    Additional Notes
                                </Typography>
                                <Typography variant="body1">{prescription.notes}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}

export default PrescriptionsDetailsPage;

