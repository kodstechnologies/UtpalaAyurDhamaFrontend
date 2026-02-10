import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Divider,
    CircularProgress,
    Button,
    Stack,
} from "@mui/material";
import {
    ArrowBack,
    Restaurant as RestaurantIcon,
    MonitorHeart as VitalsIcon,
    Person as PersonIcon,
} from "@mui/icons-material";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import foodIntakeService from "../../../services/foodIntakeService";

function PatientDetails() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inpatientId = searchParams.get("inpatientId");
    const patientId = searchParams.get("patientId");
    const patientNameFromQuery = searchParams.get("patientName") || "";

    const [isLoading, setIsLoading] = useState(true);
    const [patientData, setPatientData] = useState(null);
    const [inpatientData, setInpatientData] = useState(null);
    const [foodIntakes, setFoodIntakes] = useState([]);
    const [vitals, setVitals] = useState([]);
    const [consultingDoctor, setConsultingDoctor] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                if (inpatientId) {
                    await fetchInpatientDetails();
                    await fetchFoodIntakes();
                } else if (patientId) {
                    await fetchPatientProfile();
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [inpatientId, patientId]);

    const fetchInpatientDetails = async () => {
        try {
            const response = await axios.get(getApiUrl(`inpatients/${inpatientId}`), {
                headers: getAuthHeaders(),
            });

            if (response.data.success) {
                const data = response.data.data;
                setInpatientData(data);
                setPatientData(data.patient);

                // Extract vitals from dailyCheckups
                const checkups = Array.isArray(data.dailyCheckups) ? data.dailyCheckups : [];
                const sortedVitals = checkups
                    .map((checkup) => ({
                        id: checkup._id?.toString() || checkup.id || `${inpatientId}-${checkup.date}`,
                        date: checkup.date || checkup.createdAt || new Date(),
                        temperature: checkup.temperature || "-",
                        bloodPressure: checkup.bloodPressure || "-",
                        pulseRate: checkup.pulseRate || "-",
                        spo2: checkup.spo2 || "-",
                        notes: checkup.notes || "",
                        recordedBy: typeof checkup.recordedBy === "object"
                            ? (checkup.recordedBy.name || "N/A")
                            : "N/A",
                    }))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setVitals(sortedVitals);
            } else {
                toast.error("Failed to fetch inpatient details");
            }
        } catch (error) {
            console.error("Error fetching inpatient details:", error);
            toast.error(error.response?.data?.message || "Failed to fetch inpatient details");
        }
    };

    const fetchPatientProfile = async () => {
        try {
            const response = await axios.get(getApiUrl(`patients/${patientId}`), {
                headers: getAuthHeaders(),
            });

            if (response.data.success) {
                setPatientData(response.data.data);
                // Fetch latest examination to get consulting doctor for outpatients
                await fetchLatestExamination();
            } else {
                toast.error("Failed to fetch patient profile");
            }
        } catch (error) {
            console.error("Error fetching patient profile:", error);
            toast.error(error.response?.data?.message || "Failed to fetch patient profile");
        }
    };

    const fetchLatestExamination = async () => {
        try {
            // Fetch latest outpatient examination for this patient to get consulting doctor
            const response = await axios.get(getApiUrl(`doctor-examinations`), {
                headers: getAuthHeaders(),
                params: {
                    patientId: patientId,
                    hasInpatient: false, // Only get outpatient examinations
                    limit: 1,
                    page: 1
                }
            });

            if (response.data.success && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                const latestExam = response.data.data[0];
                if (latestExam.doctor?.user?.name) {
                    setConsultingDoctor(latestExam.doctor.user.name);
                }
            }
        } catch (error) {
            console.error("Error fetching latest examination:", error);
            // Don't show error toast, just log it
        }
    };

    const fetchFoodIntakes = async () => {
        try {
            const response = await foodIntakeService.getAllFoodIntakes({
                inpatientId: inpatientId,
                page: 1,
                limit: 1000,
            });

            if (response.success) {
                // Handle different response structures
                let intakes = [];
                if (response.data?.data && Array.isArray(response.data.data)) {
                    intakes = response.data.data;
                } else if (Array.isArray(response.data)) {
                    intakes = response.data;
                }

                const sortedIntakes = intakes
                    .map((intake) => ({
                        id: intake._id?.toString() || intake.id || `${inpatientId}-${intake.date}`,
                        date: intake.date || new Date(),
                        mealType: intake.mealType || "-",
                        foodDescription: intake.foodDescription || "-",
                        price: intake.price !== undefined && intake.price !== null
                            ? Number(intake.price)
                            : 0,
                        status: intake.status || "logged",
                        loggedBy: typeof intake.loggedBy === "object"
                            ? (intake.loggedBy.name || "N/A")
                            : "N/A",
                    }))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setFoodIntakes(sortedIntakes);
            }
        } catch (error) {
            console.error("Error fetching food intakes:", error);
            // Don't show error toast, just log it
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch {
            return "-";
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "-";
        }
    };

    const getMealTypeLabel = (mealType) => {
        const labels = {
            breakfast: "Breakfast",
            lunch: "Lunch",
            dinner: "Dinner",
            extra: "Juice / Extras",
        };
        return labels[mealType?.toLowerCase()] || mealType || "-";
    };

    const getStatusColor = (status) => {
        const colors = {
            logged: "default",
            priced: "warning",
            billed: "success",
        };
        return colors[status] || "default";
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!patientData) {
        return (
            <Box sx={{ p: 3 }}>
                <HeadingCard
                    title="Patient Details"
                    subtitle="Patient information not found"
                    breadcrumbItems={[
                        { label: "Nurse", url: "/nurse/dashboard" },
                        { label: "Monitoring", url: "/nurse/monitoring" },
                        { label: "Patient Details" },
                    ]}
                />
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/nurse/monitoring")}
                    sx={{ mt: 2 }}
                >
                    Back to Monitoring
                </Button>
            </Box>
        );
    }

    return (
        <div>
            <HeadingCard
                title="Patient Details"
                subtitle={`Patient: ${patientNameFromQuery || (patientData?.user?.name) || "Unknown"}`}
                breadcrumbItems={[
                    { label: "Nurse", url: "/nurse/dashboard" },
                    { label: "Monitoring", url: "/nurse/monitoring" },
                    { label: "Patient Details" },
                ]}
            />

            <Box sx={{ mt: 2, mb: 2 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/nurse/monitoring")}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                >
                    Back to Monitoring
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Patient Information Card */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                <PersonIcon sx={{ color: "var(--color-icon-2)" }} />
                                <Typography variant="h6" fontWeight={600}>
                                    Patient Information
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="caption" color="text.secondary">
                                        Patient ID
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {patientData?.uhid || patientData?.patientId || patientData?.user?.uhid || "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="caption" color="text.secondary">
                                        Patient Name
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {patientData?.user?.name || "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="caption" color="text.secondary">
                                        Admission Date
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {formatDate(inpatientData ? inpatientData.admissionDate : patientData?.createdAt)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="caption" color="text.secondary">
                                        Ward / Bed
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {inpatientData ? (() => {
                                            const wardCategory = inpatientData.wardCategory || "N/A";
                                            const roomNumber = inpatientData.roomNumber || "";
                                            const bedNumber = inpatientData.bedNumber || "N/A";

                                            if (roomNumber) {
                                                return `${wardCategory} / Room ${roomNumber} / Bed ${bedNumber}`;
                                            } else {
                                                return `${wardCategory} / Bed ${bedNumber}`;
                                            }
                                        })() : "Outpatient"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="caption" color="text.secondary">
                                        Consulting Doctor
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {inpatientData 
                                            ? (inpatientData.doctor?.user?.name || "Not Assigned") 
                                            : (consultingDoctor || patientData?.primaryDoctor?.user?.name || "Not Assigned")}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="caption" color="text.secondary">
                                        Status
                                    </Typography>
                                    <Chip
                                        label={inpatientData ? (inpatientData.status || "N/A") : "Outpatient"}
                                        size="small"
                                        color={inpatientData?.status === "Admitted" ? "success" : "default"}
                                        sx={{ mt: 0.5 }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Food Intake History Card */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                <RestaurantIcon sx={{ color: "var(--color-icon-2)" }} />
                                <Typography variant="h6" fontWeight={600}>
                                    Food Intake History
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            {foodIntakes.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                                    No food intake records found.
                                </Typography>
                            ) : (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: "var(--color-bg-input)" }}>
                                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Meal Type</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Food Description</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }} align="right">Price (₹)</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Logged By</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {foodIntakes.map((intake) => (
                                                <TableRow key={intake.id} hover>
                                                    <TableCell>{formatDateTime(intake.date)}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={getMealTypeLabel(intake.mealType)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{intake.foodDescription}</TableCell>
                                                    <TableCell align="right">
                                                        ₹{intake.price ? intake.price.toLocaleString("en-IN") : "0"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={intake.status}
                                                            size="small"
                                                            color={getStatusColor(intake.status)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{intake.loggedBy}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Vitals History Card */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                <VitalsIcon sx={{ color: "var(--color-icon-2)" }} />
                                <Typography variant="h6" fontWeight={600}>
                                    Vitals History
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            {vitals.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                                    No vitals records found.
                                </Typography>
                            ) : (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: "var(--color-bg-input)" }}>
                                                <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Temperature (°F)</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Blood Pressure (mmHg)</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Pulse Rate (bpm)</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Recorded By</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {vitals.map((vital) => (
                                                <TableRow key={vital.id} hover>
                                                    <TableCell>{formatDateTime(vital.date)}</TableCell>
                                                    <TableCell>{vital.temperature}</TableCell>
                                                    <TableCell>{vital.bloodPressure}</TableCell>
                                                    <TableCell>{vital.pulseRate}</TableCell>
                                                    <TableCell>
                                                        {vital.notes || (
                                                            <Typography variant="caption" color="text.secondary">
                                                                No notes
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{vital.recordedBy}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
}

export default PatientDetails;

