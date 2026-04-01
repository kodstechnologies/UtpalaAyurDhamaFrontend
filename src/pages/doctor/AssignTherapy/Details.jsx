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
    Psychology as PsychologyIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    LocalHospital as HospitalIcon,
    AccessTime as TimeIcon,
    Assignment as AssignmentIcon,
    PersonPin as TherapistIcon,
    Notes as NotesIcon,
    Healing as TherapyIcon,
    LocalHotel as RoomIcon,
    Restore as HistoryIcon,
    Schedule as ScheduleIcon,
    CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";

function IPDTherapyDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const theme = useTheme();
    const [therapyPlan, setTherapyPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTherapyPlan = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                const response = await axios.get(
                    getApiUrl(`examinations/therapy-plans/ipd/${id}`),
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    setTherapyPlan(response.data.data);
                } else {
                    toast.error(response.data.message || "Failed to fetch therapy plan details");
                    navigate("/doctor/assign-therapy");
                }
            } catch (error) {
                console.error("Error fetching therapy plan:", error);
                toast.error(error.response?.data?.message || "Error fetching therapy plan details");
                navigate("/doctor/assign-therapy");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTherapyPlan();
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

    if (!therapyPlan) {
        return null;
    }

    const patient = therapyPlan.examination?.patient;
    const doctor = therapyPlan.examination?.doctor;
    const therapist = therapyPlan.therapist;
    const inpatient = therapyPlan.examination?.inpatient;
    const patientName = patient?.user?.name || "Unknown";
    const patientUHID = patient?.user?.uhid || "N/A";
    const doctorName = doctor?.user?.name || "Unknown";
    const therapyType = therapyPlan.treatmentName || "N/A";
    const subTherapy = therapyPlan.subTherapy || "";
    const duration = therapyPlan.duration || "";
    const treatmentDescription = therapyPlan.treatmentDescription || "";
    const relatedPlans = therapyPlan.relatedPlans || [];
    const allTherapies = [therapyPlan, ...relatedPlans];

    // Aggregate all therapy names
    const therapyDisplay = allTherapies.map(p => p.treatmentName).join(", ");

    const totalSessions = therapyPlan.daysOfTreatment || 0;
    const timeline = therapyPlan.timeline || "N/A";
    const assignedDate = therapyPlan.createdAt
        ? new Date(therapyPlan.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "N/A";
    const specialInstructions = therapyPlan.specialInstructions || "No special instructions provided.";
    const roomNumber = inpatient?.roomNumber || "N/A";
    const wardCategory = inpatient?.wardCategory || "N/A";
    const admissionDate = inpatient?.admissionDate
        ? new Date(inpatient.admissionDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "N/A";
    const inpatientStatus = inpatient?.status || "N/A";

    // Handle multiple therapists
    const therapistsList = therapyPlan.therapists || (therapyPlan.therapist ? [therapyPlan.therapist] : []);
    const therapistDisplay = therapistsList.length > 0
        ? therapistsList.map(t => t.user?.name || t.name || "Unknown").join(", ")
        : "Not Assigned";

    const getTimelineColor = (timeline) => {
        switch (timeline) {
            case "AlternateDay":
                return "info";
            case "Weekly":
                return "success";
            case "Monthly":
                return "success";
            case "Daily":
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
                title="IPD Therapy Plan Details"
                subtitle={`Therapy plan for ${patientName}`}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "In Patients", url: "/doctor/in-patients" },
                    { label: "IPD Therapies", url: "/doctor/assign-therapy" },
                    { label: "View Details" },
                ]}
            />

            <Box sx={{ mt: 3, mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/doctor/assign-therapy")}
                    sx={{
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-dark)",
                        "&:hover": {
                            borderColor: "var(--color-primary)",
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        },
                    }}
                >
                    Back to Therapies
                </Button>
                <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/doctor/assign-therapy/edit/${id}`)}
                    sx={{
                        backgroundColor: "var(--color-primary)",
                        "&:hover": {
                            backgroundColor: "var(--color-primary-dark)",
                        },
                    }}
                >
                    Edit Therapy Plan
                </Button>
                {therapyPlan.sessionId && (
                    <Button
                        variant="contained"
                        startIcon={<PsychologyIcon />}
                        onClick={() => navigate(`/doctor/therapy-execution/${therapyPlan.sessionId}`)}
                        sx={{
                            backgroundColor: "var(--color-success)",
                            "&:hover": {
                                backgroundColor: "var(--color-success-dark)",
                            },
                        }}
                    >
                        Track Progress
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* Header Card with Therapy Type */}
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
                                        <TherapyIcon sx={{ fontSize: 32 }} />
                                    </Box>
                                    <Box>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                            {allTherapies.map((plan, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={plan.treatmentName}
                                                    color="primary"
                                                    sx={{ fontWeight: 700, fontSize: '0.9rem' }}
                                                />
                                            ))}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            IPD Therapy Plans
                                        </Typography>
                                    </Box>
                                </Box>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <Chip
                                        label={timeline}
                                        color={getTimelineColor(timeline)}
                                        size="medium"
                                        sx={{ fontWeight: 600 }}
                                    />
                                    <Chip
                                        label={`${totalSessions} Sessions`}
                                        color="primary"
                                        variant="outlined"
                                        size="medium"
                                        sx={{ fontWeight: 600 }}
                                    />
                                    <Chip
                                        label={inpatientStatus}
                                        color={inpatientStatus === "Admitted" ? "success" : "default"}
                                        size="medium"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Stack>
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
                                <DetailRow icon={<TimeIcon fontSize="small" />} label="Contact" value={patient.user.phone} />
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
                            <DetailRow icon={<HospitalIcon fontSize="small" />} label="Ward Category" value={wardCategory} />
                            <DetailRow icon={<CalendarIcon fontSize="small" />} label="Admission Date" value={admissionDate} />
                            <DetailRow
                                icon={<AssignmentIcon fontSize="small" />}
                                label="Status"
                                value={
                                    <Chip
                                        label={inpatientStatus}
                                        color={inpatientStatus === "Admitted" ? "success" : "default"}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                }
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Therapy Details List */}
                <Grid item xs={12}>
                    <Card
                        sx={{
                            backgroundColor: "var(--color-bg-card)",
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: "var(--shadow-medium)",
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                                <TherapyIcon sx={{ mr: 1.5, color: "var(--color-primary)", fontSize: 28 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                    Therapy Details
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 4, borderColor: "var(--color-border)" }} />

                            {/* Individual Therapy Details Mapping */}
                            {allTherapies.map((plan, index) => (
                                <Box key={index} sx={{ mb: index !== allTherapies.length - 1 ? 6 : 0 }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 2, 
                                        mb: 3,
                                        p: 1.5,
                                        borderRadius: 2,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                        borderLeft: `4px solid ${theme.palette.primary.main}`
                                    }}>
                                        <TherapyIcon sx={{ color: 'var(--color-primary)', fontSize: 24 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                                            {index + 1}. {plan.treatmentName}
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            {plan.therapists && plan.therapists.length > 0 && (
                                                <DetailRow
                                                    icon={<TherapistIcon fontSize="small" />}
                                                    label="Assigned Therapist(s)"
                                                    value={plan.therapists.map(t => t.user?.name || t.name || "Unknown").join(", ")}
                                                    highlight
                                                />
                                            )}
                                            
                                            <DetailRow 
                                                icon={<CalendarMonthIcon fontSize="small" />} 
                                                label="Start Date" 
                                                value={formatDate(plan.startDate || plan.createdAt)} 
                                            />

                                            <DetailRow 
                                                icon={<HistoryIcon fontSize="small" />} 
                                                label="Total Sessions" 
                                                value={`${plan.daysOfTreatment || 0} Sessions`} 
                                            />

                                            <DetailRow 
                                                icon={<ScheduleIcon fontSize="small" />} 
                                                label="Timeline" 
                                                value={
                                                    <Chip
                                                        label={plan.timeline || "N/A"}
                                                        color={getTimelineColor(plan.timeline)}
                                                        size="small"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                } 
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            {plan.subTherapy && (
                                                <DetailRow
                                                    icon={<TherapyIcon fontSize="small" />}
                                                    label="Sub Therapy"
                                                    value={plan.subTherapy}
                                                />
                                            )}
                                            {plan.duration && (
                                                <DetailRow
                                                    icon={<TimeIcon fontSize="small" />}
                                                    label="Duration"
                                                    value={plan.duration}
                                                />
                                            )}
                                            {plan.specialInstructions && (
                                                <DetailRow
                                                    icon={<AssignmentIcon fontSize="small" />}
                                                    label="Special Instructions"
                                                    value={plan.specialInstructions}
                                                    highlight={plan.specialInstructions !== "No special instructions provided."}
                                                />
                                            )}
                                        </Grid>

                                        <Grid item xs={12}>
                                            {plan.treatmentDescription && (
                                                <DetailRow
                                                    icon={<NotesIcon fontSize="small" />}
                                                    label="Treatment Description"
                                                    value={plan.treatmentDescription}
                                                />
                                            )}
                                        </Grid>
                                    </Grid>

                                    {index !== allTherapies.length - 1 && (
                                        <Divider sx={{ mt: 5, mb: 2, borderStyle: 'solid', opacity: 0.1, borderColor: 'var(--color-primary)' }} />
                                    )}
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default IPDTherapyDetails;

