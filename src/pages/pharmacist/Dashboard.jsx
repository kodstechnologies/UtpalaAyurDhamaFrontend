import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Chip, Avatar, Divider, alpha, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import GreetingBanner from "../../components/card/GreetingCard";
import DashboardCard from "../../components/card/DashboardCard";
import TableComponent from "../../components/table/TableComponent";
import pharmacistService from "../../services/pharmacistService";

// ICONS
import MedicationIcon from "@mui/icons-material/Medication";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GreetingsImg from "../../assets/greeting/pharmasist.png";

function Pharmacist_Dashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const pharmacistName = user?.name || "Pharmacist";

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await pharmacistService.getDashboardSummary();
            if (response && response.success && response.data) {
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

    // Format date with time
    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Get status chip color
    const getStatusChipColor = (status) => {
        switch (status) {
            case "Dispensed":
                return { bgcolor: theme.palette.success.light, color: theme.palette.success.dark };
            case "Pending":
                return { bgcolor: theme.palette.warning.light, color: theme.palette.warning.dark };
            case "Cancelled":
                return { bgcolor: theme.palette.error.light, color: theme.palette.error.dark };
            default:
                return { bgcolor: theme.palette.grey[300], color: theme.palette.grey[800] };
        }
    };

    const getStatusChipIcon = (status) => {
        switch (status) {
            case "Dispensed":
                return <CheckCircleIcon style={{ fontSize: 16 }} />;
            case "Pending":
                return <PendingActionsIcon style={{ fontSize: 16 }} />;
            case "Cancelled":
                return <ErrorOutlineIcon style={{ fontSize: 16 }} />;
            default:
                return null;
        }
    };

    const getAvatarText = (name) => {
        return name ? name.charAt(0).toUpperCase() : "";
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
                    name={pharmacistName}
                    subtitle="Review prescriptions, manage verification, and dispense medicines efficiently."
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

    // Pending Prescriptions Table Columns
    const pendingPrescriptionsColumns = [
        {
            field: "patientName",
            header: "Patient",
            render: (row) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 32, height: 32, fontSize: "0.8rem" }}>
                        {getAvatarText(row.patientName)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.patientName}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.patientPhone}</Typography>
                    </Box>
                </Box>
            ),
        },
        { field: "doctorName", header: "Doctor" },
        { field: "medication", header: "Medication" },
        { field: "dosage", header: "Dosage" },
        { field: "frequency", header: "Frequency" },
        { field: "quantity", header: "Qty", render: (row) => row.quantity || 0 },
        {
            field: "createdAt",
            header: "Date",
            render: (row) => formatDate(row.createdAt),
        },
    ];

    // Recent Prescriptions Table Columns
    const recentPrescriptionsColumns = [
        {
            field: "patientName",
            header: "Patient",
            render: (row) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, width: 32, height: 32, fontSize: "0.8rem" }}>
                        {getAvatarText(row.patientName)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.patientName}</Typography>
                </Box>
            ),
        },
        { field: "doctorName", header: "Doctor" },
        { field: "medication", header: "Medication" },
        {
            field: "status",
            header: "Status",
            render: (row) => (
                <Chip
                    label={row.status}
                    size="small"
                    sx={{ ...getStatusChipColor(row.status), fontWeight: 600 }}
                    icon={getStatusChipIcon(row.status)}
                />
            ),
        },
        {
            field: "createdAt",
            header: "Date",
            render: (row) => formatDate(row.createdAt),
        },
    ];

    return (
        <Box sx={{ padding: "20px", paddingBottom: "30px" }}>
            {/* ⭐ Greeting Banner */}
            <GreetingBanner
                title="Namaste"
                name={pharmacistName}
                subtitle="Review prescriptions, manage verification, and dispense medicines efficiently."
                image={GreetingsImg}
                breadcrumbItems={breadcrumbItems}
            />

            {/* ⭐ Main Statistics Cards */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "15px",
                    marginTop: 3,
                }}
            >
                <DashboardCard
                    title="New Prescriptions Today"
                    count={dashboardData?.newPrescriptionsToday || 0}
                    icon={MedicationIcon}
                    description="Prescriptions created today"
                />
                <DashboardCard
                    title="Pending Verification"
                    count={dashboardData?.pendingPrescriptionsCount || 0}
                    icon={PendingActionsIcon}
                    description="Prescriptions awaiting verification"
                />
                <DashboardCard
                    title="Dispensed Today"
                    count={dashboardData?.dispensedTodayCount || 0}
                    icon={LocalShippingIcon}
                    description="Prescriptions dispensed today"
                />
                <DashboardCard
                    title="Total Prescriptions"
                    count={dashboardData?.totalPrescriptionsCount || 0}
                    icon={AssignmentIcon}
                    description="All prescriptions in system"
                />
            </Box>

            {/* ⭐ Inventory Statistics Cards */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "15px",
                    marginTop: 3,
                }}
            >
                <DashboardCard
                    title="Low Stock Items"
                    count={dashboardData?.lowStockItemsCount || 0}
                    icon={WarningIcon}
                    description="Items below threshold"
                />
                <DashboardCard
                    title="Out of Stock"
                    count={dashboardData?.outOfStockItemsCount || 0}
                    icon={ErrorOutlineIcon}
                    description="Items out of stock"
                />
                <DashboardCard
                    title="In Stock Items"
                    count={dashboardData?.inStockItemsCount || 0}
                    icon={InventoryIcon}
                    description="Items available in stock"
                />
                <DashboardCard
                    title="Total Items"
                    count={dashboardData?.totalItemsCount || 0}
                    icon={Inventory2Icon}
                    description="All inventory items"
                />
            </Box>

            {/* ⭐ Inventory Breakdown by Category */}
            {dashboardData?.inventoryBreakdown && dashboardData.inventoryBreakdown.length > 0 && (
                <Box sx={{ marginTop: 4 }}>
                    <Card sx={{ borderRadius: 4, boxShadow: "0px 4px 18px rgba(0,0,0,0.08)", p: 2 }}>
                        <CardContent sx={{ "&:last-child": { paddingBottom: "16px" } }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
                                Inventory Breakdown by Category
                            </Typography>
                            <Grid container spacing={2}>
                                {dashboardData.inventoryBreakdown.map((category, index) => (
                                    <Grid item xs={12} sm={6} md={3} key={index}>
                                        <Card
                                            sx={{
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                borderRadius: 2,
                                                p: 2,
                                            }}
                                        >
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                                                {category.category}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Qty: <strong>{category.totalQuantity}</strong>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Items: <strong>{category.itemCount}</strong>
                                            </Typography>
                                            {category.lowStockCount > 0 && (
                                                <Typography variant="body2" sx={{ color: theme.palette.warning.main, mt: 0.5 }}>
                                                    ⚠ Low Stock: {category.lowStockCount}
                                                </Typography>
                                            )}
                                            {category.outOfStockCount > 0 && (
                                                <Typography variant="body2" sx={{ color: theme.palette.error.main, mt: 0.5 }}>
                                                    ❌ Out of Stock: {category.outOfStockCount}
                                                </Typography>
                                            )}
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* ⭐ Quick Actions */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="card-title mb-0" style={{ fontWeight: 700, color: theme.palette.text.primary }}>Quick Actions</h5>
                        </div>
                        <div className="row g-3">
                            <div className="col-12 col-sm-6 col-lg-4">
                                <Link to="/pharmacist/prescriptions/outpatient" className="btn btn-primary w-100" style={{ borderRadius: "8px", padding: "10px 15px" }}>
                                    <MedicationIcon className="me-2" /> Manage Prescriptions
                                </Link>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-4">
                                <Link to="/pharmacist/inventory" className="btn btn-info w-100" style={{ borderRadius: "8px", padding: "10px 15px", backgroundColor: "#17a2b8", borderColor: "#17a2b8", color: "white" }}>
                                    <Inventory2Icon className="me-2" /> View Inventory
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </Box>

            {/* ⭐ Pending Prescriptions Table */}
            <Box sx={{ marginTop: 4 }}>
                <Card sx={{ borderRadius: 4, boxShadow: "0px 4px 18px rgba(0,0,0,0.08)", p: 2 }}>
                    <CardContent sx={{ "&:last-child": { paddingBottom: "16px" } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                Pending Prescriptions
                            </Typography>
                            <Link to="/pharmacist/prescriptions/outpatient" className="btn btn-sm btn-outline-warning">
                                View All <ArrowForwardIcon fontSize="small" sx={{ ml: 1 }} />
                            </Link>
                        </Box>
                        {dashboardData?.pendingPrescriptions && dashboardData.pendingPrescriptions.length > 0 ? (
                            <TableComponent
                                columns={pendingPrescriptionsColumns}
                                rows={dashboardData.pendingPrescriptions}
                                showPagination={false}
                            />
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
                                No pending prescriptions at the moment.
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* ⭐ Recent Prescriptions Table */}
            <Box sx={{ marginTop: 4 }}>
                <Card sx={{ borderRadius: 4, boxShadow: "0px 4px 18px rgba(0,0,0,0.08)", p: 2 }}>
                    <CardContent sx={{ "&:last-child": { paddingBottom: "16px" } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                Recent Prescriptions
                            </Typography>
                            <Link to="/pharmacist/prescriptions/outpatient" className="btn btn-sm btn-outline-info">
                                View All <ArrowForwardIcon fontSize="small" sx={{ ml: 1 }} />
                            </Link>
                        </Box>
                        {dashboardData?.recentPrescriptions && dashboardData.recentPrescriptions.length > 0 ? (
                            <TableComponent
                                columns={recentPrescriptionsColumns}
                                rows={dashboardData.recentPrescriptions}
                                showPagination={false}
                                actions={[
                                    {
                                        icon: <VisibilityIcon />,
                                        tooltip: "View Prescription",
                                        onClick: (row) => navigate(`/pharmacist/prescriptions/outpatient`, { state: { prescriptionId: row._id } }),
                                    },
                                ]}
                            />
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
                                No recent prescriptions found.
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}

export default Pharmacist_Dashboard;
