import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
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
    alpha,
    useTheme,
    CircularProgress,
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
    Medication as MedicationIcon,
    Scale as ScaleIcon,
    CurrencyRupee as RupeeIcon,
} from "@mui/icons-material";
import medicineService from "../../../services/medicineService";

function BatchLogDetailsPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [searchParams] = useSearchParams();
    const [medicine, setMedicine] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const batchId = searchParams.get("batchId") || searchParams.get("_id") || "";
    const medicineId = searchParams.get("_id") || batchId;

    useEffect(() => {
        if (medicineId) {
            fetchMedicineDetails();
        }
    }, [medicineId]);

    const fetchMedicineDetails = async () => {
        setIsLoading(true);
        try {
            const response = await medicineService.getMedicineById(medicineId);
            if (response && response.success && response.data) {
                setMedicine(response.data);
            } else {
                toast.error("Failed to fetch batch details");
                navigate("/admin/inventory/view");
            }
        } catch (error) {
            console.error("Error fetching medicine:", error);
            toast.error("Failed to fetch batch details");
            navigate("/admin/inventory/view");
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

    if (!medicine) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Batch not found</Alert>
                <Button sx={{ mt: 2 }} onClick={() => navigate("/admin/inventory/view")}>
                    Back to Inventory
                </Button>
            </Box>
        );
    }

    // Calculate days until expiry
    const calculateDaysUntilExpiry = (expDate) => {
        if (!expDate) return null;
        const today = new Date();
        const expiry = new Date(expDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const expiryDate = medicine.expiryDate || searchParams.get("expiryDate");
    const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
    const quantity = medicine.quantity || parseInt(searchParams.get("quantity") || "0");
    const costPrice = medicine.costPrice || parseFloat(searchParams.get("costPrice") || "0");
    const sellPrice = medicine.sellPrice || parseFloat(searchParams.get("sellPrice") || "0");
    const stockValue = quantity * costPrice;
    const profitPerUnit = sellPrice - costPrice;
    const profitMargin = costPrice > 0 ? ((profitPerUnit / costPrice) * 100).toFixed(2) : 0;

    // Get expiry status
    const getExpiryStatus = () => {
        if (daysUntilExpiry === null) return { label: "No Expiry", color: "default", icon: <CalendarTodayIcon /> };
        if (daysUntilExpiry < 0) return { label: "Expired", color: "error", icon: <WarningIcon /> };
        if (daysUntilExpiry <= 30) return { label: "Expiring Soon", color: "warning", icon: <WarningIcon /> };
        if (daysUntilExpiry <= 90) return { label: "Expiring in 3 Months", color: "info", icon: <CalendarTodayIcon /> };
        return { label: "Valid", color: "success", icon: <CheckCircleIcon /> };
    };

    const expiryStatus = getExpiryStatus();

    // Mock transaction history (in a real app, this would come from prescription dispense records)
    const transactionHistory = [
        {
            id: "1",
            date: new Date().toISOString(),
            type: "Stock Entry",
            quantity: quantity,
            reference: medicine.medicineCode || "N/A",
            patient: "-",
        },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatCurrency = (amount) => {
        return `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title={`Batch Details${medicine.medicineName ? ` - ${medicine.medicineName}` : ""}`}
                subtitle="Comprehensive batch information, stock levels, and transaction history"
                breadcrumbItems={[
                    { label: "Home", url: "/" },
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Inventory", url: "/admin/inventory/view" },
                    { label: "Batch Log", url: `/admin/inventory/batch-log` },
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
                    <DashboardCard title="Total Quantity" count={quantity} icon={InventoryIcon} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                        title="Stock Value"
                        count={formatCurrency(stockValue)}
                        icon={TrendingUpIcon}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                        title="Profit Margin"
                        count={`${profitMargin}%`}
                        icon={TrendingDownIcon}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                        title="Days Until Expiry"
                        count={daysUntilExpiry !== null ? (daysUntilExpiry > 0 ? `${daysUntilExpiry}` : "Expired") : "N/A"}
                        icon={CalendarTodayIcon}
                    />
                </Grid>
            </Grid>

            {/* Expiry Warning */}
            {daysUntilExpiry !== null && daysUntilExpiry <= 90 && (
                <Alert
                    severity={daysUntilExpiry <= 30 ? (daysUntilExpiry < 0 ? "error" : "warning") : "info"}
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
                            <Typography
                                variant="h6"
                                sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
                            >
                                <InventoryIcon color="primary" />
                                Batch Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Batch ID / Medicine Code
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {medicine.medicineCode || "N/A"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Medicine Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {medicine.medicineName}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Type
                                    </Typography>
                                    <Chip label={medicine.type || "N/A"} size="small" variant="outlined" />
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Strength
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {medicine.strength || "N/A"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Unit
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {medicine.unit || "N/A"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Expiry Date
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {formatDate(expiryDate)}
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
                                        Stock Status
                                    </Typography>
                                    <Chip
                                        label={medicine.stockStatus || "N/A"}
                                        color={
                                            medicine.stockStatus === "In Stock"
                                                ? "success"
                                                : medicine.stockStatus === "Low Stock"
                                                ? "warning"
                                                : "error"
                                        }
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
                            <Typography
                                variant="h6"
                                sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
                            >
                                <LocalShippingIcon color="primary" />
                                Pricing & Stock Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Manufacturer
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {medicine.manufacturer || "N/A"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Cost Price (per unit)
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {formatCurrency(costPrice)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Sell Price (per unit)
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {formatCurrency(sellPrice)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Profit per Unit
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: "success.main" }}>
                                        {formatCurrency(profitPerUnit)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Stock Value
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {formatCurrency(stockValue)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Low Stock Threshold
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {medicine.lowStockThreshold || "N/A"}
                                    </Typography>
                                </Box>
                                {medicine.composition && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Composition
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {medicine.composition}
                                        </Typography>
                                    </Box>
                                )}
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
                    <Typography
                        variant="h6"
                        sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
                    >
                        <TrendingUpIcon color="primary" />
                        Stock Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    p: 2,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
                                    {quantity}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Available Stock ({medicine.unit || "units"})
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    p: 2,
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "success.main" }}>
                                    {formatCurrency(stockValue)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Stock Value
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    p: 2,
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "info.main" }}>
                                    {formatCurrency(profitPerUnit)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Profit per Unit
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    p: 2,
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "secondary.main" }}>
                                    {profitMargin}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Profit Margin
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Additional Information */}
            {(medicine.description || medicine.storageConditions) && (
                <Card
                    sx={{
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        mb: 3,
                    }}
                >
                    <CardContent>
                        <Typography
                            variant="h6"
                            sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
                        >
                            <BusinessIcon color="primary" />
                            Additional Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            {medicine.description && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Description
                                    </Typography>
                                    <Typography variant="body1">{medicine.description}</Typography>
                                </Grid>
                            )}
                            {medicine.storageConditions && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Storage Conditions
                                    </Typography>
                                    <Typography variant="body1">{medicine.storageConditions}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Transaction History */}
            <Card
                sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
            >
                <CardContent>
                    <Typography
                        variant="h6"
                        sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
                    >
                        <BusinessIcon color="primary" />
                        Stock Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactionHistory.map((transaction) => (
                                    <TableRow key={transaction.id} hover>
                                        <TableCell>{formatDate(transaction.date)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={transaction.type}
                                                color={transaction.type === "Stock Entry" ? "success" : "primary"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            +{transaction.quantity} {medicine.unit || "units"}
                                        </TableCell>
                                        <TableCell>{transaction.reference}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={medicine.stockStatus || "N/A"}
                                                color={
                                                    medicine.stockStatus === "In Stock"
                                                        ? "success"
                                                        : medicine.stockStatus === "Low Stock"
                                                        ? "warning"
                                                        : "error"
                                                }
                                                size="small"
                                            />
                                        </TableCell>
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

