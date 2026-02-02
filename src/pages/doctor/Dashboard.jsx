import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Stack,
    Chip,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Divider,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";

// Icons
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HotelIcon from "@mui/icons-material/Hotel";
import EventIcon from "@mui/icons-material/Event";
import MedicationIcon from "@mui/icons-material/Medication";
import HealingIcon from "@mui/icons-material/Healing";
import ReplayIcon from "@mui/icons-material/Replay";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";

import GreetingBanner from "../../components/card/GreetingCard";
import DashboardCard from "../../components/card/DashboardCard";
import GreetingsImg from "../../assets/greeting/doctor.png";
import { getApiUrl, getAuthHeaders } from "../../config/api";

function Doctor_Dashboard() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        inPatients: 0,
        totalPrescriptions: 0,
        pendingPrescriptions: 0,
        totalTherapies: 0,
        upcomingFollowUps: 0,
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);
    const [recentPrescriptions, setRecentPrescriptions] = useState([]);

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        if (!user?._id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const today = new Date().toISOString().split("T")[0];

            // Fetch appointments first to get doctor profile ID
            const appointmentsResponse = await axios.get(getApiUrl("appointments"), {
                headers: getAuthHeaders(),
                params: { page: 1, limit: 100 },
            });

            // Process appointments - handle different response formats
            let appointments = [];
            if (appointmentsResponse.data.success) {
                let rawAppointments = [];
                if (Array.isArray(appointmentsResponse.data.data)) {
                    rawAppointments = appointmentsResponse.data.data;
                } else if (appointmentsResponse.data.data?.appointments) {
                    rawAppointments = appointmentsResponse.data.data.appointments;
                } else if (appointmentsResponse.data.data?.data) {
                    rawAppointments = appointmentsResponse.data.data.data;
                }

                // Filter out Cancelled and No Show appointments
                appointments = rawAppointments.filter(
                    apt => apt.status !== "Cancelled" && apt.status !== "No Show"
                );
            }

            // Extract doctor profile ID from first appointment
            let doctorProfileId = null;
            if (appointments.length > 0 && appointments[0].doctor?._id) {
                doctorProfileId = appointments[0].doctor._id.toString();
            }

            // If no appointments, try to get doctor profile from examinations
            if (!doctorProfileId) {
                try {
                    const examinationsResponse = await axios.get(getApiUrl("examinations"), {
                        headers: getAuthHeaders(),
                        params: { page: 1, limit: 1 },
                    });
                    if (examinationsResponse.data.success && examinationsResponse.data.data?.data?.[0]?.doctor?._id) {
                        doctorProfileId = examinationsResponse.data.data.data[0].doctor._id.toString();
                    }
                } catch (err) {
                    console.error("Error fetching examinations:", err);
                }
            }

            // Fetch all data in parallel (if we have doctor profile ID, otherwise skip doctor-specific APIs)
            const fetchPromises = [
                Promise.resolve(appointmentsResponse), // Already fetched
                // Inpatients
                axios.get(getApiUrl("inpatients"), {
                    headers: getAuthHeaders(),
                    params: { page: 1, limit: 1000, status: "Admitted" },
                }),
            ];

            // Add doctor-specific API calls if we have doctor profile ID
            if (doctorProfileId) {
                fetchPromises.push(
                    // OPD Prescriptions
                    axios.get(getApiUrl("examinations/prescriptions/opd/by-doctor"), {
                        headers: getAuthHeaders(),
                    }),
                    // IPD Prescriptions
                    axios.get(getApiUrl("examinations/prescriptions/ipd/by-doctor"), {
                        headers: getAuthHeaders(),
                    }),
                    // OPD Therapies
                    axios.get(getApiUrl("examinations/therapy-plans/opd"), {
                        headers: getAuthHeaders(),
                    }),
                    // IPD Therapies
                    axios.get(getApiUrl("examinations/therapy-plans/ipd"), {
                        headers: getAuthHeaders(),
                    }),
                    // Follow-ups
                    axios.get(getApiUrl("examinations/followups/all/by-doctor"), {
                        headers: getAuthHeaders(),
                    })
                );
            } else {
                // Return empty arrays if no doctor profile ID
                fetchPromises.push(
                    Promise.resolve({ data: { success: true, data: [] } }),
                    Promise.resolve({ data: { success: true, data: [] } }),
                    Promise.resolve({ data: { success: true, data: [] } }),
                    Promise.resolve({ data: { success: true, data: [] } }),
                    Promise.resolve({ data: { success: true, data: [] } })
                );
            }

            const [
                ,
                inpatientsResponse,
                opdPrescriptionsResponse,
                ipdPrescriptionsResponse,
                opdTherapiesResponse,
                ipdTherapiesResponse,
                followUpsResponse,
            ] = await Promise.all(fetchPromises);

            // Filter today's appointments
            const todayAppointments = appointments.filter(
                (apt) => apt.appointmentDate === today && apt.status !== "Cancelled"
            );

            // Get unique patients from appointments
            const uniquePatientIds = new Set();
            appointments.forEach((apt) => {
                if (apt.patient?._id) uniquePatientIds.add(apt.patient._id.toString());
            });

            // Process inpatients
            const inpatients = inpatientsResponse.data.success
                ? inpatientsResponse.data.data?.inpatients || inpatientsResponse.data.data || []
                : [];
            const doctorInpatients = doctorProfileId
                ? inpatients.filter(
                    (ip) => ip.doctor?._id?.toString() === doctorProfileId.toString()
                )
                : [];

            // Add unique inpatients to patient count
            doctorInpatients.forEach((ip) => {
                if (ip.patient?._id) uniquePatientIds.add(ip.patient._id.toString());
            });

            // Process prescriptions
            const opdPrescriptions = opdPrescriptionsResponse.data.success
                ? opdPrescriptionsResponse.data.data || []
                : [];
            const ipdPrescriptions = ipdPrescriptionsResponse.data.success
                ? ipdPrescriptionsResponse.data.data || []
                : [];
            const allPrescriptions = [...opdPrescriptions, ...ipdPrescriptions];
            const pendingPrescriptions = allPrescriptions.filter((p) => p.status === "Pending");

            // Process therapies
            const opdTherapies = opdTherapiesResponse.data.success
                ? opdTherapiesResponse.data.data || []
                : [];
            const ipdTherapies = ipdTherapiesResponse.data.success
                ? ipdTherapiesResponse.data.data || []
                : [];

            // Process follow-ups
            const followUps = followUpsResponse.data.success
                ? followUpsResponse.data.data || []
                : [];
            const upcomingFollowUpsList = followUps.filter(
                (fup) => fup.status === "Today" || fup.status === "Upcoming"
            );

            // Get recent appointments (last 5)
            const recentAppts = appointments
                .filter((apt) => apt.status !== "Cancelled")
                .sort((a, b) => new Date(b.appointmentDate || b.createdAt) - new Date(a.appointmentDate || a.createdAt))
                .slice(0, 5)
                .map((apt) => ({
                    _id: apt._id,
                    patientName: apt.patient?.user?.name || "Unknown",
                    date: apt.appointmentDate || new Date(apt.createdAt).toISOString().split("T")[0],
                    time: apt.appointmentTime || "N/A",
                    status: apt.status || "Scheduled",
                }));

            // Get recent prescriptions (last 5)
            const recentPrescs = allPrescriptions
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((presc) => ({
                    _id: presc._id,
                    patientName: presc.patient?.user?.name || "Unknown",
                    medication: presc.medication || "N/A",
                    date: presc.createdAt
                        ? new Date(presc.createdAt).toISOString().split("T")[0]
                        : "N/A",
                    status: presc.status === "Pending" ? "Active" : presc.status === "Dispensed" ? "Completed" : presc.status,
                }));

            // Update stats
            setStats({
                totalPatients: uniquePatientIds.size,
                todayAppointments: todayAppointments.length,
                inPatients: doctorInpatients.length,
                totalPrescriptions: allPrescriptions.length,
                pendingPrescriptions: pendingPrescriptions.length,
                totalTherapies: opdTherapies.length + ipdTherapies.length,
                upcomingFollowUps: upcomingFollowUpsList.length,
            });

            setRecentAppointments(recentAppts);
            setUpcomingFollowUps(upcomingFollowUpsList.slice(0, 3));
            setRecentPrescriptions(recentPrescs);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const breadcrumbItems = [
        { label: "Doctor", url: "/doctor/dashboard" },
        { label: "Dashboard" },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ paddingBottom: 4 }}>
            {/* Greeting Banner */}
            <GreetingBanner
                title="Namaste"
                name={user?.name || "Doctor"}
                subtitle="Here's a quick overview of your today's activities & patient updates."
                image={GreetingsImg}
                breadcrumbItems={breadcrumbItems}
            />

            {/* Main Statistics Cards */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                        title="My Patients"
                        count={stats.totalPatients}
                        icon={PeopleIcon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                        title="Today's Appointments"
                        count={stats.todayAppointments}
                        icon={LocalHospitalIcon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                        title="In-Patients"
                        count={stats.inPatients}
                        icon={HotelIcon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                        title="Pending Prescriptions"
                        count={stats.pendingPrescriptions}
                        icon={MedicationIcon}
                    />
                </Grid>
            </Grid>

            {/* Additional Statistics */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard
                        title="Total Prescriptions"
                        count={stats.totalPrescriptions}
                        icon={MedicationIcon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard
                        title="Therapy Plans"
                        count={stats.totalTherapies}
                        icon={HealingIcon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard
                        title="Upcoming Follow-ups"
                        count={stats.upcomingFollowUps}
                        icon={ReplayIcon}
                    />
                </Grid>
            </Grid>

            {/* Recent Activity Section */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {/* Recent Appointments */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: "var(--shadow-medium)" }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-text-dark)" }}>
                                    Recent Appointments
                                </Typography>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => navigate("/doctor/op-consultation")}
                                    sx={{ textTransform: "none" }}
                                >
                                    View All
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {recentAppointments.length > 0 ? (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Patient</TableCell>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Time</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {recentAppointments.map((apt) => (
                                                <TableRow key={apt._id} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <Avatar sx={{ width: 32, height: 32, bgcolor: "var(--color-primary)", fontSize: 14 }}>
                                                                {apt.patientName.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <Typography variant="body2">{apt.patientName}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{apt.date}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                                                            label={apt.time}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={apt.status}
                                                            size="small"
                                                            color={apt.status === "Completed" ? "success" : apt.status === "Scheduled" ? "info" : "default"}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
                                    No recent appointments
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Upcoming Follow-ups */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: "var(--shadow-medium)" }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-text-dark)" }}>
                                    Upcoming Follow-ups
                                </Typography>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => navigate("/doctor/follow-ups")}
                                    sx={{ textTransform: "none" }}
                                >
                                    View All
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {upcomingFollowUps.length > 0 ? (
                                <Stack spacing={2}>
                                    {upcomingFollowUps.map((fup) => (
                                        <Box
                                            key={fup._id}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                border: "1px solid var(--color-border)",
                                                backgroundColor: "var(--color-bg-a)",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <PersonIcon sx={{ fontSize: 20, color: "var(--color-primary)" }} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {fup.patientName}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={fup.status}
                                                    size="small"
                                                    color={fup.status === "Today" ? "warning" : "info"}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                <EventIcon sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />
                                                {fup.date ? new Date(fup.date).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                }) : "N/A"}
                                            </Typography>
                                            {fup.note && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {fup.note}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
                                    No upcoming follow-ups
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Prescriptions */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, boxShadow: "var(--shadow-medium)" }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-text-dark)" }}>
                                    Recent Prescriptions
                                </Typography>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => navigate("/doctor/prescriptions")}
                                    sx={{ textTransform: "none" }}
                                >
                                    View All
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {recentPrescriptions.length > 0 ? (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Patient</TableCell>
                                                <TableCell>Medicine</TableCell>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {recentPrescriptions.map((presc) => (
                                                <TableRow key={presc._id} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <Avatar sx={{ width: 32, height: 32, bgcolor: "var(--color-primary)", fontSize: 14 }}>
                                                                {presc.patientName.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <Typography variant="body2">{presc.patientName}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={<MedicationIcon sx={{ fontSize: 14 }} />}
                                                            label={presc.medication}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{presc.date}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={presc.status}
                                                            size="small"
                                                            color={presc.status === "Completed" ? "success" : "warning"}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
                                    No recent prescriptions
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Doctor_Dashboard;
