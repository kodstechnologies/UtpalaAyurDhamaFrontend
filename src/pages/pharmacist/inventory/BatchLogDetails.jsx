import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Inventory as InventoryIcon,
    LocalShipping as LocalShippingIcon,
    CalendarToday as CalendarTodayIcon,
    Business as BusinessIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";

function BatchLogDetailsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const batchId = searchParams.get("batchId") || searchParams.get("_id") || "1";
    const itemName = searchParams.get("itemName") || searchParams.get("medicineName") || "Paracetamol 500mg";
    const batchNo = searchParams.get("batchNo") || searchParams.get("batchId") || "BATCH001";
    const expiryDate = searchParams.get("expiryDate") || "2026-06-15";
    const quantity = parseInt(searchParams.get("quantity") || "100");
    const dispensed = parseInt(searchParams.get("dispensed") || "25");

    // Calculate days until expiry
    const calculateDaysUntilExpiry = (expDate) => {
        const today = new Date();
        const expiry = new Date(expDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
    const remaining = quantity - dispensed;
    const utilizationRate = ((dispensed / quantity) * 100).toFixed(1);

    // Mock transaction history
    const transactionHistory = [
        {
            id: "1",
            date: "2025-01-20",
            type: "Dispensed",
            quantity: 10,
            reference: "RX-001",
            patient: "Amit Kumar",
        },
        {
            id: "2",
            date: "2025-01-19",
            type: "Dispensed",
            quantity: 5,
            reference: "RX-002",
            patient: "Sita Verma",
        },
        {
            id: "3",
            date: "2025-01-18",
            type: "Received",
            quantity: quantity,
            reference: "PO-2025-001",
            patient: "-",
        },
        {
            id: "4",
            date: "2025-01-17",
            type: "Dispensed",
            quantity: 10,
            reference: "RX-003",
            patient: "Rajesh Singh",
        },
    ];

    // Get expiry status
    const getExpiryStatus = () => {
        if (daysUntilExpiry < 0) return { label: "Expired", color: "error", icon: <WarningIcon /> };
        if (daysUntilExpiry <= 30) return { label: "Expiring Soon", color: "warning", icon: <WarningIcon /> };
        if (daysUntilExpiry <= 90) return { label: "Expiring in 3 Months", color: "info", icon: <CalendarTodayIcon /> };
        return { label: "Valid", color: "success", icon: <CheckCircleIcon /> };
    };

    const expiryStatus = getExpiryStatus();

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title={`Batch Details${itemName ? ` - ${itemName}` : ""}`}
                subtitle="Comprehensive batch information, stock levels, and transaction history"
                breadcrumbItems={[
                    { label: "Home", url: "/" },
                    { label: "Pharmacist", url: "/pharmacist/dashboard" },
                    { label: "Inventory", url: "/pharmacist/inventory" },
                    { label: "Batch Log", url: `/pharmacist/batch-log/${batchId}` },
                    { label: "Batch Details" },
                ]}
            />

            {/* Action Button */}
            <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-start" }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        px: 3,
                    }}
                >
                    Back to Batch Log
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                        title="Total Quantity"
                        count={quantity}
                        icon={InventoryIcon}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                        title="Dispensed"
                        count={dispensed}
                        icon={TrendingUpIcon}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                        title="Remaining"
                        count={remaining}
                        icon={TrendingDownIcon}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                        title="Utilization"
                        count={`${utilizationRate}%`}
                        icon={CheckCircleIcon}
                    />
                </Grid>
            </Grid>

            {/* Expiry Warning */}
            {daysUntilExpiry <= 90 && (
                <Alert
                    severity={daysUntilExpiry <= 30 ? "warning" : "info"}
                    icon={expiryStatus.icon}
                    sx={{ mb: 3, borderRadius: 2 }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {daysUntilExpiry < 0
                            ? `This batch expired ${Math.abs(daysUntilExpiry)} days ago`
                            : `This batch will expire in ${daysUntilExpiry} days`}
                    </Typography>
                </Alert>
            )}

            {/* Main Details Card */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            height: "100%",
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                                <InventoryIcon color="primary" />
                                Batch Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Batch ID
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {batchNo}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Medicine Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {itemName}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Expiry Date
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {new Date(expiryDate).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </Typography>
                                        <Chip
                                            label={expiryStatus.label}
                                            color={expiryStatus.color}
                                            size="small"
                                            icon={expiryStatus.icon}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Status
                                    </Typography>
                                    <Chip
                                        label={remaining > 20 ? "Active" : "Low Stock"}
                                        color={remaining > 20 ? "success" : "warning"}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            height: "100%",
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                                <LocalShippingIcon color="primary" />
                                Supply Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Supplier
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {searchParams.get("supplier") || "MedLife Pharmaceuticals"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Received On
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {searchParams.get("receivedOn") || new Date().toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Purchase Order
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {searchParams.get("purchaseOrder") || "PO-2025-001"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Unit Price
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        ₹{searchParams.get("unitPrice") || "25.00"}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Stock Summary Card */}
            <Card
                sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    mb: 3,
                }}
            >
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                        <TrendingUpIcon color="primary" />
                        Stock Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: "center", p: 2, bgcolor: "rgba(25, 118, 210, 0.1)", borderRadius: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
                                    {quantity}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Initial Stock
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: "center", p: 2, bgcolor: "rgba(46, 125, 50, 0.1)", borderRadius: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "success.main" }}>
                                    {dispensed}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Dispensed
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: "center", p: 2, bgcolor: "rgba(237, 108, 2, 0.1)", borderRadius: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "warning.main" }}>
                                    {remaining}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Available
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: "center", p: 2, bgcolor: "rgba(156, 39, 176, 0.1)", borderRadius: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "secondary.main" }}>
                                    {utilizationRate}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Utilization
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Transaction History */}
            <Card
                sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
            >
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                        <BusinessIcon color="primary" />
                        Transaction History
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: "rgba(0,0,0,0.05)" }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Patient/Supplier</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactionHistory.map((transaction) => (
                                    <TableRow key={transaction.id} hover>
                                        <TableCell>
                                            {new Date(transaction.date).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={transaction.type}
                                                color={transaction.type === "Received" ? "success" : "primary"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            {transaction.type === "Received" ? "+" : "-"}
                                            {transaction.quantity}
                                        </TableCell>
                                        <TableCell>{transaction.reference}</TableCell>
                                        <TableCell>{transaction.patient}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}

export default BatchLogDetailsPage;
