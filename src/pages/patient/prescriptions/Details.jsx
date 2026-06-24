import React, { useState, useEffect } from "react";
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
    CircularProgress,
    alpha,
    useTheme,
    Stack,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DescriptionIcon from "@mui/icons-material/Description";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import Brightness6Icon from "@mui/icons-material/Brightness6";
import Brightness3Icon from "@mui/icons-material/Brightness3";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import prescriptionService from "../../../services/prescriptionService";
import { toast } from "react-toastify";

function PrescriptionDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const theme = useTheme();

    const [prescription, setPrescription] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Helper function to parse frequency and extract timing information
    const parseTimingSchedule = (frequency, foodTiming) => {
        if (!frequency) return { times: [], display: "Not specified" };

        const frequencyLower = frequency.toLowerCase();
        const times = [];
        let display = frequency;

        // Extract number of times per day
        const timesMatch = frequencyLower.match(/(\d+)\s*(?:times?|x)\s*(?:per\s*)?(?:day|daily)/i);
        const numTimes = timesMatch ? parseInt(timesMatch[1]) : null;

        // Check for specific time mentions
        if (frequencyLower.includes("morning") || frequencyLower.includes("am")) {
            times.push({ label: "Morning", icon: WbSunnyIcon, time: "8:00 AM" });
        }
        if (frequencyLower.includes("afternoon") || frequencyLower.includes("noon")) {
            times.push({ label: "Afternoon", icon: Brightness6Icon, time: "2:00 PM" });
        }
        if (frequencyLower.includes("evening")) {
            times.push({ label: "Evening", icon: Brightness3Icon, time: "6:00 PM" });
        }
        if (frequencyLower.includes("night") || frequencyLower.includes("bedtime") || frequencyLower.includes("pm")) {
            times.push({ label: "Night", icon: NightsStayIcon, time: "9:00 PM" });
        }

        // If no specific times found but we have a number, suggest common schedules
        if (times.length === 0 && numTimes) {
            if (numTimes === 1) {
                times.push({ label: "Once Daily", icon: ScheduleIcon, time: "Morning" });
            } else if (numTimes === 2) {
                times.push({ label: "Morning", icon: WbSunnyIcon, time: "8:00 AM" });
                times.push({ label: "Evening", icon: Brightness3Icon, time: "8:00 PM" });
            } else if (numTimes === 3) {
                times.push({ label: "Morning", icon: WbSunnyIcon, time: "8:00 AM" });
                times.push({ label: "Afternoon", icon: Brightness6Icon, time: "2:00 PM" });
                times.push({ label: "Evening", icon: Brightness3Icon, time: "8:00 PM" });
            } else if (numTimes === 4) {
                times.push({ label: "Morning", icon: WbSunnyIcon, time: "8:00 AM" });
                times.push({ label: "Afternoon", icon: Brightness6Icon, time: "2:00 PM" });
                times.push({ label: "Evening", icon: Brightness3Icon, time: "6:00 PM" });
                times.push({ label: "Night", icon: NightsStayIcon, time: "9:00 PM" });
            }
        }

        // Add food timing context
        if (foodTiming && times.length > 0) {
            display = `${frequency} (${foodTiming})`;
        }

        return { times, display };
    };

    // Calculate end date based on duration
    const calculateEndDate = (startDate, duration) => {
        if (!duration || !startDate) return null;

        const start = new Date(startDate);
        const durationLower = duration.toLowerCase();

        // Extract number and unit
        const match = durationLower.match(/(\d+)\s*(day|days|week|weeks|month|months)/i);
        if (!match) return null;

        const number = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        const endDate = new Date(start);
        if (unit.includes("day")) {
            endDate.setDate(start.getDate() + number);
        } else if (unit.includes("week")) {
            endDate.setDate(start.getDate() + number * 7);
        } else if (unit.includes("month")) {
            endDate.setMonth(start.getMonth() + number);
        }

        return endDate;
    };

    useEffect(() => {
        const fetchPrescription = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                const response = await prescriptionService.getPrescriptionById(id);

                if (response.success) {
                    const data = response.data;

                    // Transform the prescription data
                    const transformedPrescription = {
                        _id: data._id,
                        prescriptionId: data._id
                            ? `RX-${data._id.toString().slice(-8).toUpperCase()}`
                            : "N/A",
                        patientName: data.patient?.user?.name || data.examination?.patient?.user?.name || "Unknown",
                        patientId: data.patient?.user?.uhid || data.patient?.patientId || data.examination?.patient?.user?.uhid || "N/A",
                        prescriptionDate: data.createdAt
                            ? new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                        diagnosis: data.examination?.complaints || data.diagnosis || "Not specified",
                        status: data.status || "Pending",
                        billingStatus: data.billingStatus || (data.isBilled ? "Unpaid" : "Not Billed"),
                        isBilled: !!data.isBilled,
                        billDetails: data.billDetails || null,
                        relatedPrescriptions: data.relatedPrescriptions || [],
                        medicinesInOrder: data.medicinesInOrder || 1,
                        doctorName: data.doctor?.user?.name || data.examination?.doctor?.user?.name || "Unknown",
                        doctorSpecialization: data.doctor?.specialization || data.examination?.doctor?.specialization || "",
                        medication: data.medication || "",
                        medicineType: data.medicineType || "",
                        administration: data.administration || "Internal",
                        dosage: data.dosage || "",
                        dosageSchedule: data.dosageSchedule || "",
                        subType: data.subType || data.subtype || "",
                        frequency: data.frequency || "",
                        duration: data.duration || "",
                        foodTiming: data.foodTiming || "",
                        foodTime: data.foodTime || "",
                        remarks: data.remarks || "",
                        notes: data.notes || "",
                        quantity: data.quantity || 1,
                        dispensedQuantity: data.dispensedQuantity,
                        createdAt: data.createdAt,
                        examinationId: data.examination?._id || data.examination,
                        consultationId: data.examination?._id
                            ? `CONS-${data.examination._id.toString().slice(-5)}`
                            : "N/A",
                    };

                    setPrescription(transformedPrescription);
                } else {
                    toast.error(response.message || "Failed to fetch prescription details");
                    navigate("/patient/prescriptions/orders");
                }
            } catch (error) {
                console.error("Error fetching prescription:", error);
                toast.error(error.response?.data?.message || error.message || "Error fetching prescription details");
                navigate("/patient/prescriptions/orders");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrescription();
    }, [id, navigate]);

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!prescription) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" color="error">
                    Prescription not found
                </Typography>
            </Box>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "Dispensed":
                return "success";
            case "Pending":
                return "warning";
            case "Cancelled":
                return "error";
            default:
                return "default";
        }
    };

    const getBillingStatusColor = (status) => {
        switch (status) {
            case "Paid":
                return "success";
            case "Partially Paid":
                return "info";
            case "Unpaid":
                return "warning";
            case "Not Billed":
            default:
                return "default";
        }
    };

    const backPath = prescription.isBilled
        ? "/patient/prescriptions/bills"
        : "/patient/prescriptions/orders";
    const backLabel = prescription.isBilled ? "Back to Bills" : "Back to Orders";

    return (
        <Box sx={{ pb: 4 }}>
            <HeadingCard
                title="Prescription Details"
                subtitle="View complete prescription information including medicines, dosage, and billing status"
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Prescriptions", url: backPath },
                    { label: prescription.isBilled ? "Bills" : "Orders", url: backPath },
                    { label: "Details" },
                ]}
            />

            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(backPath)}
                    sx={{
                        color: "var(--color-text-dark)",
                        textTransform: "none",
                        "&:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                    }}
                >
                    {backLabel}
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <MedicationIcon fontSize="small" />
                                    Prescribed Medicines
                                </Typography>
                                <Chip
                                    label={`${prescription.medicinesInOrder} medicine${prescription.medicinesInOrder > 1 ? "s" : ""}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Medicine</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Dosage</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Frequency</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Food Timing</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(prescription.relatedPrescriptions.length > 0
                                            ? prescription.relatedPrescriptions
                                            : [{
                                                _id: prescription._id,
                                                medication: prescription.medication,
                                                dosage: prescription.dosage,
                                                frequency: prescription.frequency,
                                                duration: prescription.duration,
                                                quantity: prescription.quantity,
                                                foodTiming: prescription.foodTiming,
                                                status: prescription.status,
                                            }]
                                        ).map((item) => {
                                            const isCurrent = item._id === prescription._id;
                                            return (
                                                <TableRow
                                                    key={item._id}
                                                    sx={{
                                                        backgroundColor: isCurrent
                                                            ? alpha(theme.palette.primary.main, 0.08)
                                                            : "inherit",
                                                    }}
                                                >
                                                    <TableCell sx={{ fontWeight: isCurrent ? 700 : 500 }}>
                                                        {item.medication || "N/A"}
                                                        {isCurrent ? " (Viewing)" : ""}
                                                    </TableCell>
                                                    <TableCell>{item.dosage || "N/A"}</TableCell>
                                                    <TableCell>{item.frequency || "N/A"}</TableCell>
                                                    <TableCell>{item.duration || "Not specified"}</TableCell>
                                                    <TableCell>{item.quantity || 1}</TableCell>
                                                    <TableCell>{item.foodTiming || "N/A"}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={item.status || "Pending"}
                                                            size="small"
                                                            color={getStatusColor(item.status || "Pending")}
                                                            sx={{ fontWeight: 500 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Left Column - Prescription Info */}
                <Grid item xs={12} md={8}>
                    {/* Medicine Details Card */}
                    <Card
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                                <MedicationIcon
                                    sx={{
                                        fontSize: 32,
                                        color: "var(--color-primary)",
                                        mr: 2,
                                    }}
                                />
                                <Typography variant="h5" fontWeight="bold" sx={{ color: "var(--color-text-dark)" }}>
                                    Medicine Information
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            {/* Medicine Name */}
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "var(--color-text)", mb: 1, fontWeight: 500 }}
                                >
                                    Medicine Name
                                </Typography>
                                <Typography variant="h5" sx={{ color: "var(--color-text-dark)", fontWeight: 700 }}>
                                    {prescription.medication}
                                </Typography>
                            </Box>

                            {/* Timing Schedule Section */}
                            {(() => {
                                const timingSchedule = parseTimingSchedule(prescription.frequency, prescription.foodTiming);
                                return (
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                            <ScheduleIcon
                                                sx={{ fontSize: 24, color: "var(--color-primary)", mr: 1.5 }}
                                            />
                                            <Typography variant="h6" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                                Dosage Schedule & Timing
                                            </Typography>
                                        </Box>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                                border: "1px solid",
                                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                            }}
                                        >
                                            <Grid container spacing={2}>
                                                {/* Frequency Display */}
                                                <Grid item xs={12}>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: "var(--color-text)", mb: 1, fontWeight: 500 }}
                                                        >
                                                            Frequency
                                                        </Typography>
                                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                                            <AccessTimeIcon
                                                                sx={{ fontSize: 20, color: "var(--color-primary)", mr: 1 }}
                                                            />
                                                            <Typography variant="h6" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                                                {timingSchedule.display}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                {/* Timing Schedule */}
                                                {timingSchedule.times.length > 0 && (
                                                    <Grid item xs={12}>
                                                        <Divider sx={{ my: 2 }} />
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: "var(--color-text)", mb: 2, fontWeight: 500 }}
                                                        >
                                                            Recommended Timing
                                                        </Typography>
                                                        <Grid container spacing={2}>
                                                            {timingSchedule.times.map((timeSlot, index) => (
                                                                <Grid item xs={12} sm={6} md={3} key={index}>
                                                                    <Paper
                                                                        elevation={0}
                                                                        sx={{
                                                                            p: 2,
                                                                            borderRadius: 2,
                                                                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                                            border: "1px solid",
                                                                            borderColor: alpha(theme.palette.primary.main, 0.3),
                                                                            textAlign: "center",
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                                                                            {timeSlot.icon && (
                                                                                React.createElement(timeSlot.icon, { sx: { fontSize: 32, color: "var(--color-primary)" } })
                                                                            )}
                                                                        </Box>
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{ color: "var(--color-text-dark)", fontWeight: 600, mb: 0.5 }}
                                                                        >
                                                                            {timeSlot.label}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{ color: "var(--color-text)", fontSize: "0.75rem" }}
                                                                        >
                                                                            {timeSlot.time}
                                                                        </Typography>
                                                                    </Paper>
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                    </Grid>
                                                )}

                                                {/* Food Timing */}
                                                {prescription.foodTiming && (
                                                    <Grid item xs={12}>
                                                        <Divider sx={{ my: 2 }} />
                                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                                            <RestaurantIcon
                                                                sx={{ fontSize: 20, color: "var(--color-success)", mr: 1 }}
                                                            />
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ color: "var(--color-text)", fontWeight: 500, mr: 1 }}
                                                            >
                                                                Food Timing:
                                                            </Typography>
                                                            <Chip
                                                                label={prescription.foodTiming}
                                                                color="success"
                                                                size="small"
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Paper>
                                    </Box>
                                );
                            })()}

                            {/* Medicine Details Grid */}
                            <Grid container spacing={3}>
                                {/* Dosage */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                            border: "1px solid",
                                            borderColor: alpha(theme.palette.primary.main, 0.2),
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                            <MedicationIcon
                                                sx={{ fontSize: 20, color: "var(--color-primary)", mr: 1 }}
                                            />
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "var(--color-text)", fontWeight: 500 }}
                                            >
                                                Dosage
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                            {prescription.dosage || "Not specified"}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Duration */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            backgroundColor: alpha(theme.palette.warning.main, 0.05),
                                            border: "1px solid",
                                            borderColor: alpha(theme.palette.warning.main, 0.2),
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                            <EventIcon
                                                sx={{ fontSize: 20, color: "var(--color-warning)", mr: 1 }}
                                            />
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "var(--color-text)", fontWeight: 500 }}
                                            >
                                                Duration
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                            {prescription.duration || "Not specified"}
                                        </Typography>
                                        {prescription.duration && prescription.createdAt && (
                                            <Typography variant="caption" sx={{ color: "var(--color-text)", display: "block", mt: 0.5 }}>
                                                Start: {new Date(prescription.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                {(() => {
                                                    const endDate = calculateEndDate(prescription.createdAt, prescription.duration);
                                                    return endDate ? ` | End: ${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}` : '';
                                                })()}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {/* Quantity */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            backgroundColor: alpha(theme.palette.info.main, 0.05),
                                            border: "1px solid",
                                            borderColor: alpha(theme.palette.info.main, 0.2),
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "var(--color-text)", fontWeight: 500, mb: 1 }}
                                        >
                                            Quantity Prescribed
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                            {prescription.quantity} {prescription.medicineType ? prescription.medicineType.toLowerCase() + "(s)" : "unit(s)"}
                                        </Typography>
                                        {prescription.dispensedQuantity !== undefined && (
                                            <Typography variant="caption" sx={{ color: "var(--color-text)", display: "block", mt: 0.5 }}>
                                                Dispensed: {prescription.dispensedQuantity || 0}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {prescription.medicineType && (
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Box
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                                                border: "1px solid",
                                                borderColor: alpha(theme.palette.secondary.main, 0.2),
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "var(--color-text)", fontWeight: 500, mb: 1 }}
                                            >
                                                Medicine Type
                                            </Typography>
                                            <Chip
                                                label={prescription.medicineType}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>
                                    </Grid>
                                )}

                                {/* Dosage Schedule */}
                                {prescription.dosageSchedule && (
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Box
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                backgroundColor: alpha(theme.palette.success.main, 0.05),
                                                border: "1px solid",
                                                borderColor: alpha(theme.palette.success.main, 0.2),
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "var(--color-text)", fontWeight: 500, mb: 1 }}
                                            >
                                                Dosage Schedule
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 700 }}>
                                                {prescription.dosageSchedule}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}

                                {/* Subtypes */}
                                {prescription.subType && (
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Box
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                border: "1px solid",
                                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "var(--color-text)", fontWeight: 500, mb: 1 }}
                                            >
                                                Subtypes
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                                {prescription.subType}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}

                                {/* Administration */}
                                {prescription.administration && (
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Box
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                backgroundColor: alpha(theme.palette.info.main, 0.05),
                                                border: "1px solid",
                                                borderColor: alpha(theme.palette.info.main, 0.2),
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "var(--color-text)", fontWeight: 500, mb: 1 }}
                                            >
                                                Administration Route
                                            </Typography>
                                            <Chip
                                                label={prescription.administration}
                                                color={prescription.administration === "Internal" ? "primary" : "secondary"}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>

                            {/* Important Instructions Section */}
                            {(prescription.remarks || prescription.notes) && (
                                <Box sx={{ mt: 4 }}>
                                    <Divider sx={{ mb: 3 }} />
                                    <Typography variant="h6" sx={{ color: "var(--color-text-dark)", fontWeight: 600, mb: 2 }}>
                                        Important Instructions & Notes
                                    </Typography>

                                    {/* Remarks */}
                                    {prescription.remarks && (
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                mb: 2,
                                                borderRadius: 2,
                                                backgroundColor: alpha(theme.palette.warning.main, 0.05),
                                                border: "1px solid",
                                                borderColor: alpha(theme.palette.warning.main, 0.2),
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                                <DescriptionIcon
                                                    sx={{ fontSize: 20, color: "var(--color-warning)", mr: 1 }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: "var(--color-text)", fontWeight: 600 }}
                                                >
                                                    Doctor's Remarks
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" sx={{ color: "var(--color-text-dark)", lineHeight: 1.7 }}>
                                                {prescription.remarks}
                                            </Typography>
                                        </Paper>
                                    )}

                                    {/* Additional Notes */}
                                    {prescription.notes && (
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                backgroundColor: alpha(theme.palette.info.main, 0.05),
                                                border: "1px solid",
                                                borderColor: alpha(theme.palette.info.main, 0.2),
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                                <DescriptionIcon
                                                    sx={{ fontSize: 20, color: "var(--color-info)", mr: 1 }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: "var(--color-text)", fontWeight: 600 }}
                                                >
                                                    Additional Notes
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" sx={{ color: "var(--color-text-dark)", lineHeight: 1.7 }}>
                                                {prescription.notes}
                                            </Typography>
                                        </Paper>
                                    )}
                                </Box>
                            )}

                            {/* Quick Summary Card */}
                            <Box sx={{ mt: 4 }}>
                                <Divider sx={{ mb: 3 }} />
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        backgroundColor: alpha(theme.palette.success.main, 0.05),
                                        border: "1px solid",
                                        borderColor: alpha(theme.palette.success.main, 0.2),
                                    }}
                                >
                                    <Typography variant="h6" sx={{ color: "var(--color-text-dark)", fontWeight: 600, mb: 2 }}>
                                        Quick Summary
                                    </Typography>
                                    <List dense>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <MedicationIcon sx={{ fontSize: 20, color: "var(--color-primary)" }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Medicine"
                                                secondary={prescription.medication}
                                                primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                                                secondaryTypographyProps={{ variant: "body1", fontWeight: 600 }}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <AccessTimeIcon sx={{ fontSize: 20, color: "var(--color-info)" }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="How Often"
                                                secondary={prescription.frequency || "Not specified"}
                                                primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                                                secondaryTypographyProps={{ variant: "body1", fontWeight: 600 }}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <EventIcon sx={{ fontSize: 20, color: "var(--color-warning)" }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Duration"
                                                secondary={prescription.duration || "Not specified"}
                                                primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                                                secondaryTypographyProps={{ variant: "body1", fontWeight: 600 }}
                                            />
                                        </ListItem>
                                        {prescription.foodTiming && (
                                            <ListItem sx={{ px: 0 }}>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <RestaurantIcon sx={{ fontSize: 20, color: "var(--color-success)" }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Food Timing"
                                                    secondary={prescription.foodTiming}
                                                    primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                                                    secondaryTypographyProps={{ variant: "body1", fontWeight: 600 }}
                                                />
                                            </ListItem>
                                        )}
                                    </List>
                                </Paper>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Prescription & Doctor Info */}
                <Grid item xs={12} md={4}>
                    {/* Prescription Info Card */}
                    <Card
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: "var(--color-text-dark)", mb: 2 }}>
                                Prescription Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                        Prescription ID
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                        {prescription.prescriptionId}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                        Consultation ID
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                        {prescription.consultationId}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                        Date
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <EventIcon sx={{ fontSize: 18, color: "var(--color-text)", mr: 1 }} />
                                        <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                            {prescription.prescriptionDate}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                        Prescription Status
                                    </Typography>
                                    <Chip
                                        label={prescription.status}
                                        color={getStatusColor(prescription.status)}
                                        size="small"
                                        sx={{ fontWeight: 500 }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                        Billing Status
                                    </Typography>
                                    <Chip
                                        label={prescription.billingStatus}
                                        color={getBillingStatusColor(prescription.billingStatus)}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                        Medicines in Order
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                        {prescription.medicinesInOrder}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    {prescription.isBilled && prescription.billDetails && (
                        <Card
                            elevation={0}
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                    <ReceiptLongIcon
                                        sx={{ fontSize: 24, color: "var(--color-primary)", mr: 1.5 }}
                                    />
                                    <Typography variant="h6" fontWeight="bold" sx={{ color: "var(--color-text-dark)" }}>
                                        Bill Information
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />

                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                            Bill ID
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                            {prescription.billDetails.billId}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                            Total Amount
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                            ₹{Number(prescription.billDetails.totalAmount || 0).toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                            Paid Amount
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                            ₹{Number(prescription.billDetails.paidAmount || 0).toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                            Balance
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                            ₹{Number(prescription.billDetails.balance || 0).toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                            Payment Status
                                        </Typography>
                                        <Chip
                                            label={prescription.billDetails.paymentStatus}
                                            color={getBillingStatusColor(prescription.billDetails.paymentStatus)}
                                            size="small"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    )}

                    {/* Doctor Info Card */}
                    <Card
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <LocalHospitalIcon
                                    sx={{
                                        fontSize: 24,
                                        color: "var(--color-primary)",
                                        mr: 1.5,
                                    }}
                                />
                                <Typography variant="h6" fontWeight="bold" sx={{ color: "var(--color-text-dark)" }}>
                                    Prescribed By
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                        Doctor Name
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <PersonIcon sx={{ fontSize: 18, color: "var(--color-text)", mr: 1 }} />
                                        <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                            {prescription.doctorName}
                                        </Typography>
                                    </Box>
                                </Box>

                                {prescription.doctorSpecialization && (
                                    <Box>
                                        <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                            Specialization
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                            {prescription.doctorSpecialization}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Patient Info Card */}
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <PersonIcon
                                    sx={{
                                        fontSize: 24,
                                        color: "var(--color-primary)",
                                        mr: 1.5,
                                    }}
                                />
                                <Typography variant="h6" fontWeight="bold" sx={{ color: "var(--color-text-dark)" }}>
                                    Patient Information
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                        Patient Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                        {prescription.patientName}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ color: "var(--color-text)", mb: 0.5 }}>
                                        Patient ID
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                                        {prescription.patientId}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default PrescriptionDetailsPage;

