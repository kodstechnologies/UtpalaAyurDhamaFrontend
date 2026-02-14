import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Chip, Avatar, Divider, alpha, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import GreetingBanner from "../../components/card/GreetingCard";
import DashboardCard from "../../components/card/DashboardCard";
import TableComponent from "../../components/table/TableComponent";
import receptionistService from "../../services/receptionistService";
// Removed popup imports - notifications now show in header bell icon
import { useNotifications } from "../../hooks/useNotifications";

// ICONS
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PeopleIcon from "@mui/icons-material/People";
import SpaIcon from "@mui/icons-material/Spa";
import DescriptionIcon from "@mui/icons-material/Description";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GreetingsImg from "../../assets/greeting/receptionist.png";

function Receptionist_Dashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const receptionistName = user?.name || "Receptionist";

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);

    // Notification hooks (not showing popups anymore - using header bell icon instead)
    const {
        paymentReminders,
        dobReminders,
    } = useNotifications();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await receptionistService.getDashboardSummary();
            if (response && response.success && response.data) {
                console.log("Dashboard data received:", response.data);
                console.log("Upcoming appointments count:", response.data.upcomingAppointments?.length || 0);
                console.log("Upcoming appointments:", response.data.upcomingAppointments);
                setDashboardData(response.data);
            } else {
                setError("Failed to fetch dashboard data");
                toast.error("Failed to load dashboard data");
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(err.message || "Failed to load dashboard data");
            toast.error(err.response?.data?.message || err.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Format date and time
    const formatDateTime = (dateString, timeString) => {
        if (!dateString) return "N/A";
        try {
            const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
            if (isNaN(date.getTime())) return "N/A";
            const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
            return timeString ? `${formattedDate} at ${timeString}` : formattedDate;
        } catch (error) {
            console.error("Error formatting date:", error, dateString);
            return "N/A";
        }
    };

    // Format time from date (convert UTC to IST)
    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        // Convert UTC to IST (Asia/Kolkata timezone)
        try {
            return date.toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });
        } catch (e) {
            // Fallback: manual conversion
            const IST_OFFSET = 5.5 * 60 * 60 * 1000;
            const dateIST = new Date(date.getTime() + IST_OFFSET);
            const hours = String(dateIST.getUTCHours()).padStart(2, '0');
            const minutes = String(dateIST.getUTCMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
    };

    // Get status color
    const getStatusColor = (status) => {
        const statusColors = {
            Completed: "success",
            Scheduled: "info",
            Ongoing: "warning",
            Confirmed: "primary",
            Pending: "warning",
            "In Progress": "info",
            Cancelled: "error",
            Paid: "success",
            Unpaid: "error",
            Partial: "warning",
        };
        return statusColors[status] || "default";
    };

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Dashboard" },
    ];

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !dashboardData) {
        return (
            <Box sx={{ p: 3 }}>
                <GreetingBanner
                    title="Namaste"
                    name={receptionistName}
                    subtitle="Here is your dashboard overview. Manage appointments, patient flow, and payments efficiently."
                    image={GreetingsImg}
                    breadcrumbItems={breadcrumbItems}
                />
                <Box sx={{ mt: 3, textAlign: "center", p: 4, bgcolor: "var(--color-bg-card)", borderRadius: 2 }}>
                    <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                        {error || "Failed to load dashboard data"}
                    </Typography>
                    <button className="btn btn-primary" onClick={fetchDashboardData}>
                        Retry
                    </button>
                </Box>
            </Box>
        );
    }

    // Transform appointments for table
    const appointmentsColumns = [
        { field: "patientName", header: "Patient Name" },
        { field: "doctorName", header: "Doctor" },
        { field: "appointmentTime", header: "Time" },
        { field: "status", header: "Status" },
    ];

    const appointmentsRows = dashboardData.recentAppointments?.map((apt, index) => ({
        _id: apt._id,
        slNo: index + 1,
        patientName: apt.patientName,
        doctorName: apt.doctorName,
        appointmentTime: apt.appointmentTime || "N/A",
        status: apt.status,
    })) || [];

    // Transform invoices for table
    const invoicesColumns = [
        { field: "invoiceNumber", header: "Invoice #" },
        { field: "patientName", header: "Patient" },
        { field: "totalPayable", header: "Amount" },
        { field: "createdAt", header: "Date" },
        { field: "status", header: "Payment" },
    ];

    const invoicesRows = dashboardData.recentInvoices?.map((inv, index) => ({
        _id: inv._id,
        slNo: index + 1,
        invoiceNumber: inv.invoiceNumber,
        patientName: inv.patientName,
        totalPayable: formatCurrency(inv.totalPayable),
        createdAt: formatDate(inv.createdAt),
        status: inv.isPaid ? "Paid" : "Pending",
    })) || [];

    return (
        <Box sx={{ padding: "20px" }}>
            {/* Notification Popups */}
            {/* Notifications now show in header bell icon - no popups needed */}

            {/* ⭐ Greeting Banner */}
            <GreetingBanner
                title="Namaste"
                name={receptionistName}
                subtitle="Here is your dashboard overview. Manage appointments, patient flow, and payments efficiently."
                image={GreetingsImg}
                breadcrumbItems={breadcrumbItems}
            />

            {/* ⭐ MAIN STATISTICS CARDS */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <DashboardCard
                        title="Today's Appointments"
                        count={dashboardData.todayAppointments || 0}
                        icon={EventAvailableIcon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <DashboardCard
                        title="Therapy Sessions Today"
                        count={dashboardData.todayTherapySessions || 0}
                        icon={SpaIcon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <DashboardCard
                        title="Total Patients"
                        count={dashboardData.totalPatients || 0}
                        icon={PeopleIcon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <DashboardCard
                        title="Invoices Created Today"
                        count={dashboardData.todayInvoicesCount ?? 0}
                        description={
                            [dashboardData.paidInvoicesToday, dashboardData.partialInvoicesToday].every((n) => (n ?? 0) === 0)
                                ? "No paid or partial yet"
                                : `${dashboardData.paidInvoicesToday ?? 0} paid, ${dashboardData.partialInvoicesToday ?? 0} partial`
                        }
                        icon={DescriptionIcon}
                    />
                </Grid>
            </Grid>

            {/* ⭐ SECONDARY STATISTICS CARDS */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <DashboardCard
                        title="Admitted Inpatients"
                        count={dashboardData.admittedInpatients || 0}
                        icon={LocalHospitalIcon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <DashboardCard
                        title="Outpatients"
                        count={dashboardData.outpatients || 0}
                        icon={PersonIcon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <DashboardCard
                        title="Today's Payments"
                        count={dashboardData.todayPayments || 0}
                        icon={PaymentIcon}
                        prefix="₹"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <DashboardCard
                        title="Discharged Today"
                        count={dashboardData.dischargedInpatientsToday || 0}
                        icon={CheckCircleIcon}
                    />
                </Grid>
            </Grid>

            {/* ⭐ APPOINTMENTS STATUS BREAKDOWN */}
            {(dashboardData.completedAppointmentsToday > 0 ||
                dashboardData.scheduledAppointmentsToday > 0 ||
                dashboardData.ongoingAppointmentsToday > 0) && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <Card
                                sx={{
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                    borderRadius: 2,
                                    p: 2,
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Completed
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                            {dashboardData.completedAppointmentsToday || 0}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card
                                sx={{
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                    borderRadius: 2,
                                    p: 2,
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <CalendarTodayIcon sx={{ color: theme.palette.info.main, fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Scheduled
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                                            {dashboardData.scheduledAppointmentsToday || 0}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card
                                sx={{
                                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                    borderRadius: 2,
                                    p: 2,
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <AccessTimeIcon sx={{ color: theme.palette.warning.main, fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Ongoing
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                                            {dashboardData.ongoingAppointmentsToday || 0}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                )}

            {/* ⭐ MAIN CONTENT GRID */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {/* Recent Appointments */}
                <Grid item xs={12} lg={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: "var(--shadow-medium)", height: "100%" }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-text-dark)" }}>
                                    Today's Appointments
                                </Typography>
                                <Link
                                    to="/receptionist/appointments"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        color: "var(--color-primary)",
                                        textDecoration: "none",
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    View All <ArrowForwardIcon fontSize="small" />
                                </Link>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {dashboardData.recentAppointments && dashboardData.recentAppointments.length > 0 ? (
                                <Box>
                                    {dashboardData.recentAppointments.slice(0, 5).map((apt) => (
                                        <Box
                                            key={apt._id}
                                            sx={{
                                                p: 2,
                                                mb: 1.5,
                                                borderRadius: 2,
                                                border: "1px solid var(--color-border)",
                                                bgcolor: "var(--color-bg-a)",
                                                transition: "all 0.2s",
                                                "&:hover": {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    borderColor: theme.palette.primary.main,
                                                    transform: "translateX(4px)",
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            bgcolor: "var(--color-primary)",
                                                            fontSize: 14,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {apt.patientName.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                            {apt.patientName}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                                            {apt.doctorName}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Chip
                                                    label={apt.status}
                                                    size="small"
                                                    color={getStatusColor(apt.status)}
                                                    sx={{ ml: 1 }}
                                                />
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {apt.appointmentTime || "N/A"}
                                                    </Typography>
                                                </Box>
                                                {apt.patientPhone && apt.patientPhone !== "N/A" && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        📞 {apt.patientPhone}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <EventAvailableIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1, opacity: 0.5 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        No appointments scheduled for today
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Upcoming Appointments (Next 7 Days) */}
                <Grid item xs={12} lg={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: "var(--shadow-medium)", height: "100%" }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-text-dark)" }}>
                                    Upcoming Appointments
                                </Typography>
                                <Chip
                                    label="Next 7 Days"
                                    size="small"
                                    icon={<TrendingUpIcon />}
                                    sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}
                                />
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {dashboardData.upcomingAppointments && Array.isArray(dashboardData.upcomingAppointments) && dashboardData.upcomingAppointments.length > 0 ? (
                                <Box>
                                    {dashboardData.upcomingAppointments.slice(0, 5).map((apt) => (
                                        <Box
                                            key={apt._id}
                                            sx={{
                                                p: 2,
                                                mb: 1.5,
                                                borderRadius: 2,
                                                border: "1px solid var(--color-border)",
                                                bgcolor: "var(--color-bg-a)",
                                                transition: "all 0.2s",
                                                "&:hover": {
                                                    bgcolor: alpha(theme.palette.info.main, 0.05),
                                                    borderColor: theme.palette.info.main,
                                                    transform: "translateX(4px)",
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            bgcolor: "var(--color-info)",
                                                            fontSize: 14,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {apt.patientName.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                            {apt.patientName}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                                            {apt.doctorName}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Chip
                                                    label={apt.status}
                                                    size="small"
                                                    color={getStatusColor(apt.status)}
                                                    sx={{ ml: 1 }}
                                                />
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDateTime(apt.appointmentDate, apt.appointmentTime)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <CalendarTodayIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1, opacity: 0.5 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        No upcoming appointments
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ⭐ RECENT INVOICES & TODAY'S THERAPY SESSIONS */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {/* Recent Invoices */}
                <Grid item xs={12} lg={7}>
                    <Card sx={{ borderRadius: 3, boxShadow: "var(--shadow-medium)" }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-text-dark)" }}>
                                    Recent Invoices
                                </Typography>
                                <Link
                                    to="/receptionist/payments"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        color: "var(--color-primary)",
                                        textDecoration: "none",
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    View All <ArrowForwardIcon fontSize="small" />
                                </Link>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {dashboardData.recentInvoices && dashboardData.recentInvoices.length > 0 ? (
                                <Box>
                                    {dashboardData.recentInvoices.map((inv) => (
                                        <Box
                                            key={inv._id}
                                            sx={{
                                                p: 2,
                                                mb: 1.5,
                                                borderRadius: 2,
                                                border: "1px solid var(--color-border)",
                                                bgcolor: "var(--color-bg-a)",
                                                transition: "all 0.2s",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                "&:hover": {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    borderColor: theme.palette.primary.main,
                                                    transform: "translateX(4px)",
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <DescriptionIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                        {inv.invoiceNumber}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                                        {inv.patientName}
                                                        {inv.doctorName && ` • ${inv.doctorName}`}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                                        {formatDate(inv.createdAt)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-success)" }}>
                                                    {formatCurrency(inv.totalPayable)}
                                                </Typography>
                                                <Chip
                                                    label={inv.isPaid ? "Paid" : "Pending"}
                                                    size="small"
                                                    color={inv.isPaid ? "success" : "warning"}
                                                />
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => navigate(`/receptionist/payments/invoice/${inv._id}`)}
                                                    style={{
                                                        marginTop: 4,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        padding: "4px 12px",
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                    View
                                                </button>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <DescriptionIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1, opacity: 0.5 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        No recent invoices
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Today's Therapy Sessions */}
                <Grid item xs={12} lg={5}>
                    <Card sx={{ borderRadius: 3, boxShadow: "var(--shadow-medium)", height: "100%" }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-text-dark)" }}>
                                    Today's Therapy Sessions
                                </Typography>
                                <Link
                                    to="/receptionist/treatments"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        color: "var(--color-primary)",
                                        textDecoration: "none",
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    View All <ArrowForwardIcon fontSize="small" />
                                </Link>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {dashboardData.recentTherapySessions && dashboardData.recentTherapySessions.length > 0 ? (
                                <Box>
                                    {dashboardData.recentTherapySessions.slice(0, 5).map((session) => (
                                        <Box
                                            key={session._id}
                                            sx={{
                                                p: 2,
                                                mb: 1.5,
                                                borderRadius: 2,
                                                border: "1px solid var(--color-border)",
                                                bgcolor: "var(--color-bg-a)",
                                                transition: "all 0.2s",
                                                "&:hover": {
                                                    bgcolor: alpha(theme.palette.success.main, 0.05),
                                                    borderColor: theme.palette.success.main,
                                                    transform: "translateX(4px)",
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            bgcolor: "var(--color-success)",
                                                            fontSize: 14,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {session.patientName.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                            {session.patientName}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                                            {session.therapyName}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Chip
                                                    label={session.status}
                                                    size="small"
                                                    color={getStatusColor(session.status)}
                                                    sx={{ ml: 1 }}
                                                />
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1, flexWrap: "wrap" }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {session.therapistName}
                                                    </Typography>
                                                </Box>
                                                {(session.inTime || session.sessionDate) && (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                        <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {session.inTime
                                                                ? formatTime(session.inTime)
                                                                : session.sessionDate
                                                                    ? formatDate(session.sessionDate)
                                                                    : "N/A"}
                                                            {session.outTime && ` - ${formatTime(session.outTime)}`}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <SpaIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1, opacity: 0.5 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        No therapy sessions scheduled for today
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ⭐ QUICK ACTIONS SECTION */}
            <Box sx={{ marginTop: 4 }}>
                <Card sx={{ borderRadius: 3, boxShadow: "var(--shadow-medium)" }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-text-dark)", mb: 3 }}>
                            Quick Actions
                        </Typography>
                        <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 12, lg: 15 }}>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <Link to="/receptionist/appointments" className="text-decoration-none">
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: "1px solid var(--color-border)",
                                            bgcolor: "var(--color-bg-a)",
                                            textAlign: "center",
                                            transition: "all 0.3s",
                                            cursor: "pointer",
                                            "&:hover": {
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                borderColor: theme.palette.primary.main,
                                                transform: "translateY(-4px)",
                                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                                            },
                                        }}
                                    >
                                        <EventAvailableIcon sx={{ fontSize: 36, color: "var(--color-primary)", mb: 1 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                            Manage Appointments
                                        </Typography>
                                    </Box>
                                </Link>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <Link to="/receptionist/inpatient" className="text-decoration-none">
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: "1px solid var(--color-border)",
                                            bgcolor: "var(--color-bg-a)",
                                            textAlign: "center",
                                            transition: "all 0.3s",
                                            cursor: "pointer",
                                            "&:hover": {
                                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                                borderColor: theme.palette.info.main,
                                                transform: "translateY(-4px)",
                                                boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.2)}`,
                                            },
                                        }}
                                    >
                                        <LocalHospitalIcon sx={{ fontSize: 36, color: "var(--color-info)", mb: 1 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                            In-Patients
                                        </Typography>
                                    </Box>
                                </Link>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <Link to="/receptionist/outpatient" className="text-decoration-none">
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: "1px solid var(--color-border)",
                                            bgcolor: "var(--color-bg-a)",
                                            textAlign: "center",
                                            transition: "all 0.3s",
                                            cursor: "pointer",
                                            "&:hover": {
                                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                                borderColor: theme.palette.success.main,
                                                transform: "translateY(-4px)",
                                                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}`,
                                            },
                                        }}
                                    >
                                        <PersonIcon sx={{ fontSize: 36, color: "var(--color-success)", mb: 1 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                            Out-Patients
                                        </Typography>
                                    </Box>
                                </Link>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <Link to="/receptionist/payments" className="text-decoration-none">
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: "1px solid var(--color-border)",
                                            bgcolor: "var(--color-bg-a)",
                                            textAlign: "center",
                                            transition: "all 0.3s",
                                            cursor: "pointer",
                                            "&:hover": {
                                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                                borderColor: theme.palette.warning.main,
                                                transform: "translateY(-4px)",
                                                boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.2)}`,
                                            },
                                        }}
                                    >
                                        <PaymentIcon sx={{ fontSize: 36, color: "var(--color-warning)", mb: 1 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                            Payments
                                        </Typography>
                                    </Box>
                                </Link>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <Link to="/receptionist/treatments" className="text-decoration-none">
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: "1px solid var(--color-border)",
                                            bgcolor: "var(--color-bg-a)",
                                            textAlign: "center",
                                            transition: "all 0.3s",
                                            cursor: "pointer",
                                            "&:hover": {
                                                bgcolor: alpha("#9c27b0", 0.1),
                                                borderColor: "#9c27b0",
                                                transform: "translateY(-4px)",
                                                boxShadow: `0 4px 12px ${alpha("#9c27b0", 0.2)}`,
                                            },
                                        }}
                                    >
                                        <SpaIcon sx={{ fontSize: 36, color: "#9c27b0", mb: 1 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                            Therapies
                                        </Typography>
                                    </Box>
                                </Link>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}

export default Receptionist_Dashboard;
