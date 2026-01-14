import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Grid,
    Divider,
    Button,
    CircularProgress,
    alpha,
    useTheme,
    Container,
    Stack,
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Medication as MedicationIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    LocalHospital as HospitalIcon,
    Assignment as AssignmentIcon,
    LocalHotel as RoomIcon,
    Bed as BedIcon,
    Notes as NotesIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";

function IPDPrescriptionDetails() {
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
                // Fetch the specific prescription first
                const response = await axios.get(
                    getApiUrl(`examinations/prescriptions/detail/${id}`),
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    const prescriptionData = response.data.data;
                    setPrescription(prescriptionData);
                    
                    // Get patient ID and inpatient ID to fetch all prescriptions for this patient
                    const patientId = prescriptionData.patient?._id || prescriptionData.patient;
                    const inpatientId = prescriptionData.examination?.inpatient?._id || prescriptionData.examination?.inpatient;
                    
                    // Fetch all IPD prescriptions for this doctor
                    const allPrescriptionsResponse = await axios.get(
                        getApiUrl("examinations/prescriptions/ipd/by-doctor"),
                        { headers: getAuthHeaders() }
                    );
                    
                    if (allPrescriptionsResponse.data.success) {
                        // Filter prescriptions by the same patient/inpatient
                        const allPresc = allPrescriptionsResponse.data.data || [];
                        const patientPrescriptions = allPresc.filter(p => {
                            const prescPatientId = p.patient?._id?.toString() || p.patient?.toString();
                            const prescInpatientId = p.examination?.inpatient?._id?.toString() || p.examination?.inpatient?.toString();
                            return (prescPatientId === patientId?.toString()) || 
                                   (inpatientId && prescInpatientId === inpatientId.toString());
                        });
                        setAllPrescriptions(patientPrescriptions);
                    }
                } else {
                    toast.error(response.data.message || "Failed to fetch prescription details");
                    navigate("/doctor/ipd-prescriptions");
                }
            } catch (error) {
                console.error("Error fetching prescription:", error);
                toast.error(error.response?.data?.message || "Error fetching prescription details");
                navigate("/doctor/ipd-prescriptions");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrescription();
    }, [id, navigate]);

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (!prescription) {
        return null;
    }

    const patient = prescription.patient || prescription.examination?.patient;
    const doctor = prescription.doctor || prescription.examination?.doctor;
    const inpatient = prescription.examination?.inpatient;
    const patientName = patient?.user?.name || "Unknown";
    const patientUHID = patient?.user?.uhid || patient?.patientId || "N/A";
    const doctorName = doctor?.user?.name || "Unknown";
    const prescriptionDate = prescription.createdAt
        ? new Date(prescription.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "N/A";
    const status = prescription.status === "Pending" ? "Active" : prescription.status === "Dispensed" ? "Completed" : prescription.status || "Active";
    const diagnosis = prescription.examination?.complaints || "N/A";
    const roomNumber = inpatient?.roomNumber || "N/A";
    const bedNumber = inpatient?.bedNumber || "N/A";
    const wardCategory = inpatient?.wardCategory || "N/A";
    const medicines = prescription.medication
        ? [
              {
                  name: prescription.medication,
                  dosage: prescription.dosage || "",
                  frequency: prescription.frequency || "",
                  duration: prescription.duration || "",
                  foodTiming: prescription.foodTiming || "",
                  remarks: prescription.remarks || "",
                  instructions: prescription.notes || "",
                  medicineType: prescription.medicineType || "",
                  administration: prescription.administration || "",
                  quantity: prescription.quantity || "",
              },
          ]
        : [];
    const notes = prescription.notes || "";

    const getStatusColor = (status) => {
        switch (status) {
            case "Active":
                return "success";
            case "Completed":
                return "default";
            case "Dispensed":
                return "success";
            case "Pending":
                return "warning";
            default:
                return "default";
        }
    };

    const DetailRow = ({ icon, label, value, highlight = false }) => (
        <Box
            sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: highlight
                    ? alpha(theme.palette.primary.main, 0.05)
                    : "var(--color-bg-a)",
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                mb: 1.5,
            }}
        >
            {icon && (
                <Box
                    sx={{
                        color: highlight ? "var(--color-primary)" : "var(--color-text-dark)",
                        display: "flex",
                        alignItems: "center",
                        minWidth: "40px",
                    }}
                >
                    {icon}
                </Box>
            )}
            <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    {label}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        fontWeight: highlight ? 600 : 500,
                        color: highlight ? "var(--color-primary)" : "var(--color-text-dark)",
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <HeadingCard
                title="IPD Prescription Details"
                subtitle={`Prescription for ${patientName}`}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "In Patients", url: "/doctor/in-patients" },
                    { label: "IPD Prescriptions", url: "/doctor/ipd-prescriptions" },
                    { label: "View Details" },
                ]}
            />

            <Box sx={{ mt: 3, mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/doctor/ipd-prescriptions")}
                    sx={{
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-dark)",
                        "&:hover": {
                            borderColor: "var(--color-primary)",
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        },
                    }}
                >
                    Back to Prescriptions
                </Button>
                <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/doctor/ipd-prescriptions/edit/${id}`)}
                    sx={{
                        backgroundColor: "var(--color-primary)",
                        "&:hover": {
                            backgroundColor: "var(--color-primary-dark)",
                        },
                    }}
                >
                    Edit Prescription
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Header Card with Prescription Status */}
                <Grid item xs={12}>
                    <Card
                        sx={{
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            boxShadow: "var(--shadow-medium)",
                            overflow: "hidden",
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: "var(--color-primary)",
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <MedicationIcon sx={{ fontSize: 32 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--color-text-dark)", mb: 0.5 }}>
                                            IPD Prescription
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Prescription #{prescription._id?.slice(-8) || "N/A"}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip
                                    label={status}
                                    color={getStatusColor(status)}
                                    size="large"
                                    sx={{ fontWeight: 600, fontSize: "0.95rem", px: 1 }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Patient Information */}
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            backgroundColor: "var(--color-bg-card)",
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: "var(--shadow-medium)",
                            height: "100%",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <PersonIcon sx={{ mr: 1.5, color: "var(--color-primary)", fontSize: 28 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                    Patient Information
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2, borderColor: "var(--color-border)" }} />
                            <DetailRow
                                icon={<PersonIcon fontSize="small" />}
                                label="Patient Name"
                                value={patientName}
                                highlight
                            />
                            <DetailRow icon={<AssignmentIcon fontSize="small" />} label="UHID" value={patientUHID} />
                            {patient?.user?.phone && (
                                <DetailRow icon={<CalendarIcon fontSize="small" />} label="Contact" value={patient.user.phone} />
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Inpatient Information */}
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            backgroundColor: "var(--color-bg-card)",
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: "var(--shadow-medium)",
                            height: "100%",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <HospitalIcon sx={{ mr: 1.5, color: "var(--color-primary)", fontSize: 28 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                    Inpatient Information
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2, borderColor: "var(--color-border)" }} />
                            <DetailRow
                                icon={<RoomIcon fontSize="small" />}
                                label="Room Number"
                                value={roomNumber}
                                highlight
                            />
                            <DetailRow icon={<BedIcon fontSize="small" />} label="Bed Number" value={bedNumber} />
                            <DetailRow icon={<HospitalIcon fontSize="small" />} label="Ward Category" value={wardCategory} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Prescription Information */}
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            backgroundColor: "var(--color-bg-card)",
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: "var(--shadow-medium)",
                            height: "100%",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <MedicationIcon sx={{ mr: 1.5, color: "var(--color-primary)", fontSize: 28 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                    Prescription Information
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2, borderColor: "var(--color-border)" }} />
                            <DetailRow icon={<CalendarIcon fontSize="small" />} label="Prescription Date" value={prescriptionDate} />
                            <DetailRow
                                icon={<HospitalIcon fontSize="small" />}
                                label="Prescribed By"
                                value={doctorName}
                                highlight
                            />
                            <DetailRow
                                icon={<AssignmentIcon fontSize="small" />}
                                label="Status"
                                value={
                                    <Chip
                                        label={status}
                                        color={getStatusColor(status)}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                }
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Diagnosis */}
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            backgroundColor: "var(--color-bg-card)",
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: "var(--shadow-medium)",
                            height: "100%",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <NotesIcon sx={{ mr: 1.5, color: "var(--color-primary)", fontSize: 28 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                    Diagnosis
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2, borderColor: "var(--color-border)" }} />
                            <Box
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    backgroundColor: alpha(theme.palette.warning.main, 0.05),
                                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                                }}
                            >
                                <Typography variant="body1" sx={{ color: "var(--color-text-dark)", lineHeight: 1.8 }}>
                                    {diagnosis}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* All Prescriptions for Patient */}
                {allPrescriptions.length > 1 && (
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                backgroundColor: "var(--color-bg-card)",
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                boxShadow: "var(--shadow-medium)",
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                    <MedicationIcon sx={{ mr: 1.5, color: "var(--color-primary)", fontSize: 28 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                        All Prescriptions for {patientName}
                                    </Typography>
                                    <Chip 
                                        label={`${allPrescriptions.length} prescriptions`} 
                                        size="small" 
                                        sx={{ ml: 2, backgroundColor: "var(--color-primary)", color: "white" }}
                                    />
                                </Box>
                                <Divider sx={{ mb: 2, borderColor: "var(--color-border)" }} />
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
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
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

                {/* Prescribed Medicines */}
                <Grid item xs={12}>
                    <Card
                        sx={{
                            backgroundColor: "var(--color-bg-card)",
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: "var(--shadow-medium)",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <MedicationIcon sx={{ mr: 1.5, color: "var(--color-primary)", fontSize: 28 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                    Current Prescription Details
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2, borderColor: "var(--color-border)" }} />
                            {medicines && medicines.length > 0 ? (
                                <Grid container spacing={2}>
                                    {medicines.map((medicine, index) => (
                                        <Grid item xs={12} key={index}>
                                            <Box
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 2,
                                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                                }}
                                            >
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-text-dark)", mb: 0.5 }}>
                                                            {medicine.name}
                                                        </Typography>
                                                        {medicine.medicineType && (
                                                            <Chip
                                                                label={medicine.medicineType}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ mt: 0.5 }}
                                                            />
                                                        )}
                                                    </Box>
                                                    <Chip
                                                        label={medicine.dosage}
                                                        color="primary"
                                                        size="medium"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </Box>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6} md={3}>
                                                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                                            Frequency
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {medicine.frequency || "N/A"}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6} md={3}>
                                                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                                            Duration
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {medicine.duration || "N/A"}
                                                        </Typography>
                                                    </Grid>
                                                    {medicine.foodTiming && (
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                                                Food Timing
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {medicine.foodTiming}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {medicine.quantity && (
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                                                Quantity
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {medicine.quantity}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {medicine.administration && (
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                                                Administration
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {medicine.administration}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {medicine.remarks && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                                                Remarks
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {medicine.remarks}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {medicine.instructions && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
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
                                    ))}
                                </Grid>
                            ) : (
                                <Box
                                    sx={{
                                        p: 3,
                                        textAlign: "center",
                                        borderRadius: 2,
                                        backgroundColor: alpha(theme.palette.divider, 0.1),
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        No medicines found
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Additional Notes */}
                {notes && (
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                backgroundColor: "var(--color-bg-card)",
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                boxShadow: "var(--shadow-medium)",
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                    <NotesIcon sx={{ mr: 1.5, color: "var(--color-primary)", fontSize: 28 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                        Additional Notes
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2, borderColor: "var(--color-border)" }} />
                                <Typography variant="body1" sx={{ color: "var(--color-text-dark)", lineHeight: 1.8 }}>
                                    {notes}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}

export default IPDPrescriptionDetails;

