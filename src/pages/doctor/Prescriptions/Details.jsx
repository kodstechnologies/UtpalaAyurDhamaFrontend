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
    alpha,
    useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { toast } from "react-toastify";

function PrescriptionsDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const theme = useTheme();

    const [prescription, setPrescription] = useState(null);
    const [allPrescriptions, setAllPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPrescription = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                const response = await axios.get(
                    getApiUrl(`examinations/prescriptions/detail/${id}`),
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    const data = response.data.data;

                    // Transform the prescription data to match the component structure
                    const transformedPrescription = {
                        _id: data._id,
                        patientName: data.patient?.user?.name || data.examination?.patient?.user?.name || "Unknown",
                        patientId: data.patient?.patientId || data.patient?.user?.uhid || data.examination?.patient?.patientId || data.examination?.patient?.user?.uhid || "N/A",
                        prescriptionDate: data.createdAt
                            ? new Date(data.createdAt).toISOString().split("T")[0]
                            : new Date().toISOString().split("T")[0],
                        diagnosis: data.examination?.complaints || data.diagnosis || "",
                        status: data.status === "Pending" ? "Active" : data.status === "Dispensed" ? "Completed" : data.status || "Active",
                        doctorName: data.doctor?.user?.name || data.examination?.doctor?.user?.name || "Unknown",
                        medicines: data.medication ? [{
                            name: data.medication,
                            dosage: data.dosage || "",
                            frequency: data.frequency || "",
                            duration: data.duration || "",
                            foodTiming: data.foodTiming || "",
                            dosageSchedule: data.dosageSchedule || "",
                            remarks: data.remarks || "",
                            instructions: data.notes || "",
                        }] : [],
                        notes: data.notes || "",
                        createdAt: data.createdAt,
                    };

                    setPrescription(transformedPrescription);

                    // Get patient ID to fetch all prescriptions for this patient
                    const patientId = data.patient?._id || data.patient || data.examination?.patient?._id || data.examination?.patient;

                    // Fetch all OPD prescriptions for this doctor
                    const allPrescriptionsResponse = await axios.get(
                        getApiUrl("examinations/prescriptions/opd/by-doctor"),
                        { headers: getAuthHeaders() }
                    );

                    if (allPrescriptionsResponse.data.success) {
                        // Filter prescriptions by the same patient
                        const allPresc = allPrescriptionsResponse.data.data || [];
                        const patientPrescriptions = allPresc.filter(p => {
                            const prescPatientId = p.patient?._id?.toString() || p.patient?.toString();
                            return prescPatientId === patientId?.toString();
                        });
                        setAllPrescriptions(patientPrescriptions);
                    }
                } else {
                    toast.error(response.data.message || "Failed to fetch prescription details");
                }
            } catch (error) {
                console.error("Error fetching prescription:", error);
                toast.error(error.response?.data?.message || "Error fetching prescription details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrescription();
    }, [id]);

    if (isLoading || !prescription) {
        return (
            <Box sx={{ p: 3 }}>
                <HeadingCard
                    title="Prescription Details"
                    subtitle={isLoading ? "Loading prescription information..." : "Prescription not found"}
                    breadcrumbItems={[
                        { label: "Doctor", url: "/doctor/dashboard" },
                        { label: "OPD Prescriptions", url: "/doctor/prescriptions" },
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
                    { label: "OPD Prescriptions", url: "/doctor/prescriptions" },
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

                {/* All Prescriptions for Patient */}
                {allPrescriptions.length > 1 && (
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                backgroundColor: "var(--color-bg-card)",
                                borderRadius: 2,
                                boxShadow: "var(--shadow-medium)",
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                    <MedicationIcon sx={{ mr: 1.5, color: "var(--color-primary)", fontSize: 28 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        All Prescriptions for {prescription.patientName}
                                    </Typography>
                                    <Chip
                                        label={`${allPrescriptions.length} prescriptions`}
                                        size="small"
                                        sx={{ ml: 2, backgroundColor: "var(--color-primary)", color: "white" }}
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {allPrescriptions.map((presc, idx) => (
                                        <Grid item xs={12} md={6} key={presc._id || idx}>
                                            <Box
                                                sx={{
                                                    p: 2.5,
                                                    borderRadius: 2,
                                                    border: `2px solid ${presc._id === id ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
                                                    backgroundColor: presc._id === id
                                                        ? alpha(theme.palette.primary.main, 0.05)
                                                        : alpha(theme.palette.background.paper, 0.5),
                                                }}
                                            >
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                        {presc.medication || "N/A"}
                                                    </Typography>
                                                    {presc._id === id && (
                                                        <Chip label="Current" size="small" color="primary" />
                                                    )}
                                                </Box>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Dosage
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {presc.dosage || "N/A"}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Frequency
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {presc.frequency || "N/A"}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Duration
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {presc.duration || "N/A"}
                                                        </Typography>
                                                    </Grid>
                                                    {presc.foodTiming && (
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                Food Timing
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {presc.foodTiming}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {presc.dosageSchedule && (
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                Dosage Schedule
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {presc.dosageSchedule}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Date
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {presc.createdAt
                                                                ? new Date(presc.createdAt).toLocaleDateString("en-GB", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                })
                                                                : "N/A"}
                                                        </Typography>
                                                    </Grid>
                                                    {presc.remarks && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                Remarks
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {presc.remarks}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
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
                                Current Prescription Details
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
                                                    {medicine.foodTiming && (
                                                        <Grid item xs={12} sm={4}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Food Timing
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {medicine.foodTiming}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {medicine.dosageSchedule && (
                                                        <Grid item xs={12} sm={4}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Dosage Schedule
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {medicine.dosageSchedule}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {medicine.remarks && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Remarks
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {medicine.remarks}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {medicine.instructions && (
                                                        <Grid item xs={12} sm={6}>
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




