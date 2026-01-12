import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Chip, Typography, alpha, useTheme } from "@mui/material";
import { toast } from "react-toastify";
import {
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    CalendarToday as CalendarTodayIcon,
    Inventory as InventoryIcon,
} from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

import HeadingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import TableComponent from "../../../components/table/TableComponent";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import medicineService from "../../../services/medicineService";

function BatchLogView() {
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist/dashboard" },
        { label: "Inventory", url: "/pharmacist/inventory" },
        { label: "Batch Log" },
    ];

    const navigate = useNavigate();
    const theme = useTheme();
    const [searchText, setSearchText] = useState("");
    const [medicines, setMedicines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        setIsLoading(true);
        try {
            const response = await medicineService.getAllMedicines({ page: 1, limit: 1000 });
            if (response && response.success && response.data) {
                const medicinesList = Array.isArray(response.data.medicines || response.data.data || response.data)
                    ? (response.data.medicines || response.data.data || response.data)
                    : [];
                setMedicines(medicinesList);
            }
        } catch (error) {
            console.error("Error fetching medicines:", error);
            toast.error("Failed to fetch batch log data");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate days until expiry
    const calculateDaysUntilExpiry = (expiryDate) => {
        if (!expiryDate) return null;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Transform medicines into batch-like entries
    const batchEntries = useMemo(() => {
        return medicines
            .filter((m) => m.expiryDate) // Only show medicines with expiry dates
            .map((medicine) => {
                const daysUntilExpiry = calculateDaysUntilExpiry(medicine.expiryDate);
                const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
                const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
                const isLowStock = medicine.stockStatus === "Low Stock" || medicine.stockStatus === "Out of Stock";

                let status = "Active";
                if (isExpired) status = "Expired";
                else if (isExpiringSoon) status = "Expiring Soon";
                else if (isLowStock) status = "Low Stock";

                return {
                    _id: medicine._id,
                    batchId: medicine.medicineCode || `BATCH-${medicine._id}`,
                    medicineName: medicine.medicineName,
                    expiryDate: medicine.expiryDate,
                    quantity: medicine.quantity || 0,
                    status,
                    daysUntilExpiry,
                    unit: medicine.unit,
                    costPrice: medicine.costPrice,
                    sellPrice: medicine.sellPrice,
                    stockStatus: medicine.stockStatus,
                    type: medicine.type,
                };
            })
            .sort((a, b) => {
                // Sort by expiry date (earliest first)
                if (!a.expiryDate && !b.expiryDate) return 0;
                if (!a.expiryDate) return 1;
                if (!b.expiryDate) return -1;
                return new Date(a.expiryDate) - new Date(b.expiryDate);
            });
    }, [medicines]);

    const columns = [
        { field: "batchId", header: "Batch ID" },
        { field: "medicineName", header: "Medicine Name" },
        {
            field: "type",
            header: "Type",
            render: (row) => (
                <Chip
                    label={row.type || "N/A"}
                    size="small"
                    variant="outlined"
                    sx={{ borderWidth: 2, fontWeight: 500 }}
                />
            ),
        },
        {
            field: "expiryDate",
            header: "Expiry Date",
            render: (row) => {
                if (!row.expiryDate) return "N/A";
                const date = new Date(row.expiryDate);
                return date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                });
            },
        },
        {
            field: "daysUntilExpiry",
            header: "Days Until Expiry",
            render: (row) => {
                if (row.daysUntilExpiry === null) return "N/A";
                const days = row.daysUntilExpiry;
                if (days < 0) {
                    return (
                        <Chip
                            label={`Expired ${Math.abs(days)} days ago`}
                            size="small"
                            color="error"
                            sx={{ fontWeight: 600 }}
                        />
                    );
                } else if (days <= 30) {
                    return (
                        <Chip
                            label={`${days} days`}
                            size="small"
                            color="warning"
                            sx={{ fontWeight: 600 }}
                        />
                    );
                } else {
                    return <Typography variant="body2">{days} days</Typography>;
                }
            },
        },
        {
            field: "quantity",
            header: "Quantity",
            render: (row) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.quantity || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {row.unit || ""}
                    </Typography>
                </Box>
            ),
        },
        {
            field: "status",
            header: "Status",
            render: (row) => {
                const getStatusColor = (status) => {
                    switch (status) {
                        case "Active":
                            return "success";
                        case "Expiring Soon":
                            return "warning";
                        case "Expired":
                            return "error";
                        case "Low Stock":
                            return "warning";
                        default:
                            return "default";
                    }
                };
                return (
                    <Chip
                        label={row.status}
                        size="small"
                        color={getStatusColor(row.status)}
                        sx={{ fontWeight: 600 }}
                    />
                );
            },
        },
    ];

    const filteredRows = useMemo(() => {
        if (!searchText) return batchEntries;
        const searchLower = searchText.toLowerCase();
        return batchEntries.filter(
            (row) =>
                row.batchId?.toLowerCase().includes(searchLower) ||
                row.medicineName?.toLowerCase().includes(searchLower) ||
                row.status?.toLowerCase().includes(searchLower)
        );
    }, [batchEntries, searchText]);

    const handleViewDetails = (row) => {
        const params = new URLSearchParams({
            batchId: row.batchId || row._id || "",
            _id: row._id || "",
            itemName: row.medicineName || "",
            medicineName: row.medicineName || "",
            batchNo: row.batchId || "",
            expiryDate: row.expiryDate || "",
            quantity: (row.quantity || 0).toString(),
            unit: row.unit || "",
            costPrice: (row.costPrice || 0).toString(),
            sellPrice: (row.sellPrice || 0).toString(),
            type: row.type || "",
            stockStatus: row.stockStatus || "",
        });
        navigate(`/pharmacist/inventory/batch-log-details?${params.toString()}`);
    };

    const actions = [
        {
            label: "View Details",
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: handleViewDetails,
            tooltip: "View Batch Details",
        },
    ];

    // Summary data
    const summary = useMemo(() => {
        const totalBatches = batchEntries.length;
        const activeBatches = batchEntries.filter((b) => b.status === "Active").length;
        const expiringSoon = batchEntries.filter((b) => b.status === "Expiring Soon").length;
        const expired = batchEntries.filter((b) => b.status === "Expired").length;
        const lowStock = batchEntries.filter((b) => b.status === "Low Stock").length;

        return {
            totalBatches,
            activeBatches,
            expiringSoon,
            expired,
            lowStock,
        };
    }, [batchEntries]);

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <HeadingCard
                title="Batch Log"
                subtitle="Monitor batch details, expiry dates, and inventory status for all medicines. Track expiry dates and manage stock efficiently."
                breadcrumbItems={breadcrumbItems}
            />

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard title="Total Batches" count={summary.totalBatches} icon={InventoryIcon} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard title="Active Batches" count={summary.activeBatches} icon={CheckCircleIcon} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard title="Expiring Soon" count={summary.expiringSoon} icon={WarningIcon} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard title="Expired" count={summary.expired} icon={CalendarTodayIcon} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard title="Low Stock" count={summary.lowStock} icon={ExitToAppIcon} />
                </Grid>
            </Grid>

            {/* Search and Export */}
            <CardBorder justify="between" align="center" wrap={true} padding="2rem" className="my-[2rem]">
                <Box sx={{ flex: 1, mr: 1 }}>
                    <Search value={searchText} onChange={(val) => setSearchText(val)} sx={{ flex: 1 }} />
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <ExportDataButton rows={filteredRows} columns={columns} fileName="batch-log.xlsx" />
                </Box>
            </CardBorder>

            {/* Table */}
            <TableComponent
                columns={columns}
                rows={filteredRows}
                actions={actions}
                showStatusBadge={true}
                isLoading={isLoading}
            />
        </Box>
    );
}

export default BatchLogView;
