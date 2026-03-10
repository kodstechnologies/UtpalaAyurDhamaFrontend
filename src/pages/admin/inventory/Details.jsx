import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Chip,
    Paper,
    Grid,
    Card,
    CardContent,
    Divider,
    alpha,
    useTheme,
} from "@mui/material";
import {
    Edit as EditIcon,
    ArrowBack as ArrowBackIcon,
    Inventory as PackageIcon,
    Business as BuildingIcon,
    Science as FlaskIcon,
    Medication as PillIcon,
    Scale as ScaleIcon,
    CurrencyRupee as RupeeIcon,
    CalendarToday as CalendarTodayIcon,
    Warehouse as WarehouseIcon,
    Description as FileTextIcon,
    Warning as AlertCircleIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as XCircleIcon,
    Info as InfoIcon,
    Person as PersonIcon,
    TrendingUp as TrendingUpIcon,
    Assessment as AssessmentIcon,
    AccessTime as TimeIcon,
    Calculate as CalculateIcon,
} from "@mui/icons-material";
import medicineService from "../../../services/medicineService";
import HeadingCard from "../../../components/card/HeadingCard";

function InventoryDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const theme = useTheme();
    const [medicine, setMedicine] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMedicine = async () => {
            setIsLoading(true);
            try {
                const response = await medicineService.getMedicineById(id);
                if (response && response.success && response.data) {
                    setMedicine(response.data);
                } else {
                    toast.error("Failed to fetch medicine details");
                    navigate("/admin/inventory/view");
                }
            } catch (error) {
                console.error("Error fetching medicine:", error);
                toast.error(error?.response?.data?.message || "Failed to fetch medicine details");
                navigate("/admin/inventory/view");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchMedicine();
        }
    }, [id, navigate]);

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!medicine) {
        return null;
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "Active":
                return "success";
            case "Inactive":
                return "default";
            case "Discontinued":
                return "error";
            default:
                return "default";
        }
    };

    const getStockStatusColor = (status) => {
        switch (status) {
            case "In Stock":
                return "success";
            case "Low Stock":
                return "warning";
            case "Out of Stock":
                return "error";
            default:
                return "default";
        }
    };

    const getStockStatusIcon = (status) => {
        switch (status) {
            case "In Stock":
                return <CheckCircleIcon fontSize="small" />;
            case "Low Stock":
                return <AlertCircleIcon fontSize="small" />;
            case "Out of Stock":
                return <XCircleIcon fontSize="small" />;
            default:
                return <InfoIcon fontSize="small" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatCurrency = (amount) => {
        return `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const calculateProfitMargin = () => {
        if (!medicine.costPrice || !medicine.sellPrice) return null;
        const profit = medicine.sellPrice - medicine.costPrice;
        const margin = ((profit / medicine.costPrice) * 100).toFixed(2);
        return { profit, margin };
    };

    const calculateStockValue = () => {
        if (!medicine.quantity || !medicine.costPrice) return null;
        return medicine.quantity * medicine.costPrice;
    };

    const getDaysUntilExpiry = () => {
        if (!medicine.expiryDate) return null;
        const expiry = new Date(medicine.expiryDate);
        const today = new Date();
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const profitData = calculateProfitMargin();
    const stockValue = calculateStockValue();
    const daysUntilExpiry = getDaysUntilExpiry();

    const DetailItem = ({ icon, label, value, highlight = false }) => (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: highlight ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: "all 0.2s",
                "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                {icon && <Box sx={{ color: "var(--color-primary)" }}>{icon}</Box>}
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {label}
                </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, color: highlight ? "var(--color-primary)" : "inherit" }}>
                {value || "N/A"}
            </Typography>
        </Box>
    );

    return (
        <div className="space-y-6 p-6">
            <HeadingCard
                title="Inventory Details"
                subtitle="Complete information about the medicine in inventory"
                breadcrumbItems={[
                    { label: "Home", url: "/" },
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Inventory", url: "/admin/inventory/view" },
                    { label: "Details" },
                ]}
            />

            {/* Header with Actions */}
            <Card
                sx={{
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
                    mb: 3,
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    {/* Top Row: Back Button and Edit Button */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate("/admin/inventory/view")}
                            sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                px: 2,
                            }}
                        >
                            Back to Inventory
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/admin/inventory/edit/${id}`)}
                            sx={{
                                backgroundColor: "var(--color-primary)",
                                "&:hover": { backgroundColor: "var(--color-primary-dark)" },
                                borderRadius: 2,
                                textTransform: "none",
                                px: 3,
                                py: 1,
                                fontWeight: 600,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                        >
                            Edit Medicine
                        </Button>
                    </Box>

                    {/* Medicine Name and Code */}
                    <Box sx={{ mb: 2.5 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: "var(--color-text-dark)",
                                mb: 0.5,
                                fontSize: { xs: "1.75rem", md: "2rem" },
                            }}
                        >
                            {medicine.medicineName}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                            }}
                        >
                            <PackageIcon fontSize="small" />
                            Code: {medicine.medicineCode}
                        </Typography>
                    </Box>

                    {/* Status Badges */}
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                        <Chip
                            icon={getStockStatusIcon(medicine.stockStatus)}
                            label={medicine.stockStatus}
                            color={getStockStatusColor(medicine.stockStatus)}
                            size="medium"
                            sx={{
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                height: "32px",
                                "& .MuiChip-icon": {
                                    color: "inherit",
                                },
                            }}
                        />
                        <Chip
                            label={medicine.status}
                            color={getStatusColor(medicine.status)}
                            size="medium"
                            sx={{
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                height: "32px",
                            }}
                        />
                        {medicine.prescriptionRequired && (
                            <Chip
                                label="Prescription Required"
                                color="info"
                                size="medium"
                                icon={<AlertCircleIcon fontSize="small" />}
                                sx={{
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    height: "32px",
                                    "& .MuiChip-icon": {
                                        color: "inherit",
                                    },
                                }}
                            />
                        )}
                        <Chip
                            label={medicine.type}
                            variant="outlined"
                            size="medium"
                            sx={{
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                height: "32px",
                                borderWidth: 2,
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {/* Basic Information Card */}
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            height: "100%",
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <PackageIcon sx={{ color: "var(--color-primary)" }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Basic Information
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <DetailItem
                                        icon={<PackageIcon fontSize="small" />}
                                        label="Medicine Code"
                                        value={medicine.medicineCode}
                                        highlight
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <DetailItem
                                        icon={<PillIcon fontSize="small" />}
                                        label="Medicine Name"
                                        value={medicine.medicineName}
                                        highlight
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<BuildingIcon fontSize="small" />}
                                        label="Manufacturer"
                                        value={medicine.manufacturer}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<FlaskIcon fontSize="small" />}
                                        label="Type"
                                        value={medicine.type}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<ScaleIcon fontSize="small" />}
                                        label="Strength"
                                        value={medicine.strength}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<PackageIcon fontSize="small" />}
                                        label="Unit"
                                        value={medicine.unit}
                                    />
                                </Grid>
                                {medicine.composition && (
                                    <Grid item xs={12}>
                                        <DetailItem
                                            icon={<FlaskIcon fontSize="small" />}
                                            label="Composition"
                                            value={medicine.composition}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Stock & Pricing Information Card */}
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            height: "100%",
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <RupeeIcon sx={{ color: "var(--color-primary)" }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Stock & Pricing
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<PackageIcon fontSize="small" />}
                                        label="Quantity Available"
                                        value={`${medicine.quantity || 0} ${medicine.unit || ""}`}
                                        highlight={medicine.quantity <= medicine.lowStockThreshold}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<AlertCircleIcon fontSize="small" />}
                                        label="Low Stock Threshold"
                                        value={medicine.lowStockThreshold}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<RupeeIcon fontSize="small" />}
                                        label="Cost Price"
                                        value={formatCurrency(medicine.costPrice)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<RupeeIcon fontSize="small" />}
                                        label="Sell Price"
                                        value={formatCurrency(medicine.sellPrice)}
                                        highlight
                                    />
                                </Grid>
                                {profitData && (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <DetailItem
                                                icon={<TrendingUpIcon fontSize="small" />}
                                                label="Profit per Unit"
                                                value={formatCurrency(profitData.profit)}
                                                highlight
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <DetailItem
                                                icon={<AssessmentIcon fontSize="small" />}
                                                label="Profit Margin"
                                                value={`${profitData.margin}%`}
                                                highlight
                                            />
                                        </Grid>
                                    </>
                                )}
                                {stockValue !== null && (
                                    <Grid item xs={12} sm={6}>
                                        <DetailItem
                                            icon={<CalculateIcon fontSize="small" />}
                                            label="Total Stock Value"
                                            value={formatCurrency(stockValue)}
                                        />
                                    </Grid>
                                )}
                                {medicine.expiryDate && (
                                    <Grid item xs={12} sm={6}>
                                        <DetailItem
                                            icon={<CalendarTodayIcon fontSize="small" />}
                                            label="Expiry Date"
                                            value={formatDate(medicine.expiryDate)}
                                            highlight={daysUntilExpiry !== null && daysUntilExpiry < 90}
                                        />
                                    </Grid>
                                )}
                                {daysUntilExpiry !== null && (
                                    <Grid item xs={12} sm={6}>
                                        <DetailItem
                                            icon={<TimeIcon fontSize="small" />}
                                            label="Days Until Expiry"
                                            value={
                                                daysUntilExpiry > 0
                                                    ? `${daysUntilExpiry} days`
                                                    : daysUntilExpiry === 0
                                                    ? "Expires Today"
                                                    : `Expired ${Math.abs(daysUntilExpiry)} days ago`
                                            }
                                            highlight={daysUntilExpiry < 90}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Additional Details Card */}
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            height: "100%",
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <InfoIcon sx={{ color: "var(--color-primary)" }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Additional Details
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <DetailItem
                                        icon={<InfoIcon fontSize="small" />}
                                        label="Prescription Required"
                                        value={medicine.prescriptionRequired ? "Yes" : "No"}
                                    />
                                </Grid>
                                {medicine.storageConditions && (
                                    <Grid item xs={12}>
                                        <DetailItem
                                            icon={<WarehouseIcon fontSize="small" />}
                                            label="Storage Conditions"
                                            value={medicine.storageConditions}
                                        />
                                    </Grid>
                                )}
                                {medicine.description && (
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                <FileTextIcon fontSize="small" sx={{ color: "var(--color-primary)" }} />
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                    Description
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" sx={{ color: "text.primary", lineHeight: 1.6 }}>
                                                {medicine.description}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Metadata & Audit Information Card */}
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            height: "100%",
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <TimeIcon sx={{ color: "var(--color-primary)" }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Metadata & Audit Information
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<CalendarTodayIcon fontSize="small" />}
                                        label="Created On"
                                        value={formatDate(medicine.createdAt)}
                                    />
                                </Grid>
                                {medicine.updatedAt && medicine.updatedAt !== medicine.createdAt && (
                                    <Grid item xs={12} sm={6}>
                                        <DetailItem
                                            icon={<TimeIcon fontSize="small" />}
                                            label="Last Updated"
                                            value={formatDate(medicine.updatedAt)}
                                        />
                                    </Grid>
                                )}
                                {medicine.createdBy && (
                                    <Grid item xs={12} sm={6}>
                                        <DetailItem
                                            icon={<PersonIcon fontSize="small" />}
                                            label="Created By"
                                            value={
                                                typeof medicine.createdBy === "object"
                                                    ? medicine.createdBy.name || medicine.createdBy.email || "N/A"
                                                    : "N/A"
                                            }
                                        />
                                    </Grid>
                                )}
                                {medicine.updatedBy && (
                                    <Grid item xs={12} sm={6}>
                                        <DetailItem
                                            icon={<PersonIcon fontSize="small" />}
                                            label="Updated By"
                                            value={
                                                typeof medicine.updatedBy === "object"
                                                    ? medicine.updatedBy.name || medicine.updatedBy.email || "N/A"
                                                    : "N/A"
                                            }
                                        />
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: alpha(theme.palette.grey[50], 0.5),
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            Medicine ID
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                                            {medicine._id}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
}

export default InventoryDetails;

