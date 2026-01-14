import React, { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, CircularProgress, alpha, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Chart from "react-apexcharts";
import GreetingCard from "../../components/card/GreetingCard";
import DashboardCard from "../../components/card/DashboardCard";
import GreetingsImg from "../../assets/greeting/admin.png";

import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonIcon from "@mui/icons-material/Person";
import HealingIcon from "@mui/icons-material/Healing";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import WarningIcon from "@mui/icons-material/Warning";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssignmentIcon from "@mui/icons-material/Assignment";

import dashboardService from "../../services/dashboardService";

function Admin_Dashboard() {
    const theme = useTheme();
    const { user } = useSelector((state) => state.auth);
    const adminName = user?.name || "Admin";
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [additionalStats, setAdditionalStats] = useState(null);
    const [monthlyRevenue, setMonthlyRevenue] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const [overview, stats, revenue] = await Promise.all([
                dashboardService.getDashboardOverview(),
                dashboardService.getAdditionalStats(),
                dashboardService.getMonthlyRevenue(),
            ]);

            if (overview.success) {
                setDashboardData(overview.data);
            }
            setAdditionalStats(stats);
            if (revenue.success) {
                setMonthlyRevenue(revenue.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    const staffCounts = dashboardData?.staffCounts || {};
    const medicineStock = dashboardData?.medicineStock || { total: 0, breakdown: [] };
    const stats = additionalStats || {};

    // Staff distribution chart data
    const staffChartData = {
        series: [
            staffCounts.doctors || 0,
            staffCounts.nurses || 0,
            staffCounts.receptionists || 0,
            staffCounts.pharmacists || 0,
            staffCounts.therapists || 0,
        ],
        options: {
            chart: {
                type: "donut",
                height: 350,
            },
            labels: ["Doctors", "Nurses", "Receptionists", "Pharmacists", "Therapists"],
            colors: ["#1976d2", "#00897b", "#6a1b9a", "#c62828", "#2e7d32"],
            legend: {
                position: "bottom",
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return val.toFixed(1) + "%";
                },
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: "65%",
                    },
                },
            },
            title: {
                text: "Staff Distribution",
                align: "center",
                style: {
                    fontSize: "16px",
                    fontWeight: 600,
                },
            },
        },
    };

    // Medicine stock breakdown chart
    const medicineChartData = {
        series: medicineStock.breakdown?.slice(0, 5).map((item) => item.total) || [],
        options: {
            chart: {
                type: "bar",
                height: 350,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "55%",
                    borderRadius: 4,
                },
            },
            dataLabels: {
                enabled: true,
            },
            xaxis: {
                categories: medicineStock.breakdown?.slice(0, 5).map((item) => item.category) || [],
            },
            colors: ["#1976d2"],
            title: {
                text: "Medicine Stock by Category (Top 5)",
                align: "center",
                style: {
                    fontSize: "16px",
                    fontWeight: 600,
                },
            },
        },
    };

    // Monthly revenue chart with real data
    const revenueChartData = {
        series: [
            {
                name: "Revenue",
                data: monthlyRevenue?.revenues || [0, 0, 0, 0, 0, 0],
            },
        ],
        options: {
            chart: {
                type: "area",
                height: 350,
                toolbar: {
                    show: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: "smooth",
                width: 2,
            },
            xaxis: {
                categories: monthlyRevenue?.months || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            },
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.9,
                    stops: [0, 90, 100],
                },
            },
            colors: ["#43a047"],
            title: {
                text: "Revenue Trend (Last 6 Months)",
                align: "center",
                style: {
                    fontSize: "16px",
                    fontWeight: 600,
                },
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return "₹" + (val / 1000).toFixed(0) + "K";
                    },
                },
            },
        },
    };

    // Activity overview chart
    const activityChartData = {
        series: [
            {
                name: "Count",
                data: [
                    stats.appointments?.total || 0,
                    stats.prescriptions?.total || 0,
                    stats.inpatients?.total || 0,
                    stats.invoices?.total || 0,
                ],
            },
        ],
        options: {
            chart: {
                type: "bar",
                height: 350,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    columnWidth: "55%",
                    borderRadius: 4,
                },
            },
            dataLabels: {
                enabled: true,
            },
            xaxis: {
                categories: ["Appointments", "Prescriptions", "Inpatients", "Invoices"],
            },
            colors: ["#1976d2"],
            title: {
                text: "Activity Overview",
                align: "center",
                style: {
                    fontSize: "16px",
                    fontWeight: 600,
                },
            },
        },
    };

    // Main dashboard cards
    const mainCards = [
        {
            title: "Doctors",
            count: staffCounts.doctors || 0,
            icon: LocalHospitalIcon,
            iconColor: "#1976d2",
        },
        {
            title: "Nurses",
            count: staffCounts.nurses || 0,
            icon: HealingIcon,
            iconColor: "#00897b",
        },
        {
            title: "Receptionists",
            count: staffCounts.receptionists || 0,
            icon: PersonIcon,
            iconColor: "#6a1b9a",
        },
        {
            title: "Pharmacists",
            count: staffCounts.pharmacists || 0,
            icon: MedicationIcon,
            iconColor: "#c62828",
        },
        {
            title: "Therapists",
            count: staffCounts.therapists || 0,
            icon: GroupsIcon,
            iconColor: "#2e7d32",
        },
        {
            title: "Patients",
            count: staffCounts.patients || 0,
            icon: PeopleIcon,
            iconColor: "#ef6c00",
        },
    ];

    // Statistics cards
    const statsCards = [
        {
            title: "Today's Appointments",
            count: stats.appointments?.today || 0,
            icon: EventIcon,
            iconColor: "#1976d2",
            subtitle: `Total: ${stats.appointments?.total || 0}`,
        },
        {
            title: "Pending Prescriptions",
            count: stats.prescriptions?.pending || 0,
            icon: AssignmentIcon,
            iconColor: "#ff9800",
            subtitle: `Total: ${stats.prescriptions?.total || 0}`,
        },
        {
            title: "Admitted Patients",
            count: stats.inpatients?.admitted || 0,
            icon: LocalHospitalIcon,
            iconColor: "#00897b",
            subtitle: `Total: ${stats.inpatients?.total || 0}`,
        },
        {
            title: "Total Revenue",
            count: `₹${(stats.invoices?.totalRevenue || 0).toLocaleString("en-IN")}`,
            icon: CurrencyRupeeIcon,
            iconColor: "#43a047",
            subtitle: `Invoices: ${stats.invoices?.total || 0}`,
        },
        {
            title: "Low Stock Medicines",
            count: stats.medicines?.lowStock || 0,
            icon: WarningIcon,
            iconColor: "#ff9800",
            subtitle: `Total: ${stats.medicines?.total || 0}`,
        },
        {
            title: "Out of Stock",
            count: stats.medicines?.outOfStock || 0,
            icon: InventoryIcon,
            iconColor: "#f44336",
            subtitle: `Total Medicines: ${stats.medicines?.total || 0}`,
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            {/* Greeting Card */}
                <GreetingCard
                    title="Namaste"
                    name={adminName}
                    subtitle="Manage staff, operations, and hospital activities from your admin dashboard."
                    image={GreetingsImg}
                breadcrumbItems={[
                            { label: "Admin", url: "/admin/dashboard" },
                    { label: "Dashboard" },
                ]}
            />

            {/* Main Staff Cards */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {mainCards.map((item, i) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
                    <DashboardCard
                        title={item.title}
                        count={item.count}
                        icon={item.icon}
                        iconColor={item.iconColor}
                    />
                    </Grid>
                ))}
            </Grid>

            {/* Statistics Cards */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
                {statsCards.map((item, i) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
                        <Card
                            sx={{
                                height: "100%",
                                borderRadius: 2,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                transition: "all 0.3s",
                                overflow: "hidden",
                                "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    transform: "translateY(-2px)",
                                },
                            }}
                        >
                            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                                <Box 
                                    sx={{ 
                                        display: "flex", 
                                        alignItems: "flex-start", 
                                        justifyContent: "space-between", 
                                        mb: 1.5,
                                        gap: 1,
                                    }}
                                >
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        sx={{ 
                                            fontWeight: 600,
                                            fontSize: "0.65rem",
                                            lineHeight: 1.3,
                                            flex: 1,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Box
                                        sx={{
                                            p: 0.6,
                                            borderRadius: 1.5,
                                            backgroundColor: alpha(item.iconColor, 0.1),
                                            color: item.iconColor,
                                            flexShrink: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <item.icon sx={{ fontSize: "0.95rem" }} />
                                    </Box>
                                </Box>
                                <Box sx={{ mb: 1 }}>
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            fontWeight: 700, 
                                            color: item.iconColor,
                                            fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" },
                                            lineHeight: 1.2,
                                            wordBreak: "break-word",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {item.count}
                                    </Typography>
                                </Box>
                                {item.subtitle && (
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{
                                            fontSize: "0.65rem",
                                            display: "block",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {item.subtitle}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {/* Revenue Trend Chart */}
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        <CardContent>
                            <Chart
                                options={revenueChartData.options}
                                series={revenueChartData.series}
                                type="area"
                                height={350}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Activity Overview Chart */}
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        <CardContent>
                            <Chart
                                options={activityChartData.options}
                                series={activityChartData.series}
                                type="bar"
                                height={350}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Additional Info Cards */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: alpha(theme.palette.success.main, 0.2),
                                        color: theme.palette.success.main,
                                    }}
                                >
                                    <ReceiptIcon fontSize="large" />
                                </Box>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                        {stats.invoices?.paid || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Paid Invoices
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: alpha(theme.palette.warning.main, 0.2),
                                        color: theme.palette.warning.main,
                                    }}
                                >
                                    <ReceiptIcon fontSize="large" />
                                </Box>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                                        {stats.invoices?.pending || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pending Invoices
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Admin_Dashboard;
