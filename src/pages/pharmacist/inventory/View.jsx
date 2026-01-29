import React, { useState, useEffect, useMemo } from "react";
import { Box, Chip, alpha, useTheme, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import TableComponent from "../../../components/table/TableComponent";
import Search from "../../../components/search/Search";
import CardBorder from "../../../components/card/CardBorder";
import ExportDataButton from "../../../components/buttons/ExportDataButton";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningIcon from "@mui/icons-material/Warning";
import ChecklistIcon from "@mui/icons-material/Checklist";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import medicineService from "../../../services/medicineService";

function Inventory_View_Details() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [medicines, setMedicines] = useState([]);
    const [searchText, setSearchText] = useState("");

    /* Breadcrumb */
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist/dashboard" },
        { label: "Inventory" },
    ];

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
            toast.error("Failed to fetch inventory data");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate statistics
    const statistics = useMemo(() => {
        const totalItems = medicines.length;
        const lowStock = medicines.filter((m) => m.stockStatus === "Low Stock").length;
        const outOfStock = medicines.filter((m) => m.stockStatus === "Out of Stock").length;
        const inStock = medicines.filter((m) => m.stockStatus === "In Stock").length;
        const totalQuantity = medicines.reduce((sum, m) => sum + (m.quantity || 0), 0);
        const totalValue = medicines.reduce((sum, m) => sum + (m.quantity || 0) * (m.costPrice || 0), 0);

        return {
            totalItems,
            lowStock,
            outOfStock,
            inStock,
            totalQuantity,
            totalValue,
        };
    }, [medicines]);

    /* Dashboard Cards */
    const dashboardData = [
        {
            title: "Total Medicines",
            count: statistics.totalItems,
            icon: Inventory2Icon,
        },
        {
            title: "In Stock",
            count: statistics.inStock,
            icon: CheckCircleIcon,
        },
        {
            title: "Low Stock",
            count: statistics.lowStock,
            icon: WarningIcon,
        },
        {
            title: "Out of Stock",
            count: statistics.outOfStock,
            icon: TrendingDownIcon,
        },
    ];

    /* Table Columns */
    const columns = [
        { field: "medicineCode", header: "Medicine Code" },
        { field: "medicineName", header: "Medicine Name" },
        {
            field: "type",
            header: "Type",
            render: (row) => (
                <Chip
                    label={row.type || "N/A"}
                    size="small"
                    variant="outlined"
                    sx={{
                        borderWidth: 2,
                        fontWeight: 500,
                    }}
                />
            ),
        },
        {
            field: "quantity",
            header: "Quantity",
            render: (row) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ fontWeight: 600 }}>{row.quantity || 0}</Box>
                    <Box sx={{ color: "text.secondary", fontSize: "0.875rem" }}>{row.unit || ""}</Box>
                </Box>
            ),
        },
        {
            field: "stockStatus",
            header: "Stock Status",
            render: (row) => {
                const getStatusColor = (status) => {
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
                return (
                    <Chip
                        label={row.stockStatus || "N/A"}
                        size="small"
                        color={getStatusColor(row.stockStatus)}
                        sx={{ fontWeight: 600 }}
                    />
                );
            },
        },
        {
            field: "costPrice",
            header: "Cost Price",
            render: (row) => `₹${Number(row.costPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        },
        {
            field: "sellPrice",
            header: "Sell Price",
            render: (row) => `₹${Number(row.sellPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        },
        {
            field: "totalValue",
            header: "Stock Value",
            render: (row) => {
                const value = (row.quantity || 0) * (row.costPrice || 0);
                return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
            },
        },
    ];

    // Filter medicines based on search
    const filteredMedicines = useMemo(() => {
        if (!searchText) return medicines;
        const searchLower = searchText.toLowerCase();
        return medicines.filter(
            (m) =>
                m.medicineName?.toLowerCase().includes(searchLower) ||
                m.medicineCode?.toLowerCase().includes(searchLower) ||
                m.type?.toLowerCase().includes(searchLower) ||
                m.manufacturer?.toLowerCase().includes(searchLower)
        );
    }, [medicines, searchText]);

    /* Actions */
    const handleViewBatchLog = (row) => {
        const params = new URLSearchParams({
            batchId: row.medicineCode || row._id || "",
            _id: row._id || "",
            itemName: row.medicineName || "",
            medicineName: row.medicineName || "",
            batchNo: row.medicineCode || "",
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
            icon: <ChecklistIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: (row) => navigate(`/pharmacist/inventory/view/${row._id}`),
            tooltip: "View Inventory Details",
        },
        {
            label: "Batch Log",
            icon: <LocalPharmacyIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: handleViewBatchLog,
            tooltip: "View Batch Log",
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Heading */}
            <HeadingCard
                category="INVENTORY MANAGEMENT"
                title="Stock Overview"
                subtitle="Track stock levels, identify low quantities, and ensure timely replenishment. Monitor medicine inventory in real-time."
            />

            {/* Dashboard Cards */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mt: 3,
                    overflowX: "auto",
                    pb: 1,
                }}
            >
                {dashboardData.map((item, i) => (
                    <DashboardCard key={i} title={item.title} count={item.count} icon={item.icon} />
                ))}
            </Box>


            {/* Search and Export */}
            <CardBorder justify="between" align="center" wrap={true} padding="2rem" className="my-[2rem]">
                <Box sx={{ flex: 1, mr: 1 }}>
                    <Search value={searchText} onChange={(val) => setSearchText(val)} sx={{ flex: 1 }} />
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <ExportDataButton
                        rows={filteredMedicines}
                        columns={columns}
                        fileName="stock-overview.xlsx"
                    />
                </Box>
            </CardBorder>

            {/* Inventory Table */}
            <Box sx={{ mt: 3 }}>
                <TableComponent
                    columns={columns}
                    rows={filteredMedicines}
                    actions={actions}
                    showStatusBadge={true}
                    statusField="stockStatus"
                    isLoading={isLoading}
                />
            </Box>
        </Box>
    );
}

export default Inventory_View_Details;


            {/* Inventory Table */}
            <Box sx={{ mt: 3 }}>
                <TableComponent
                    columns={columns}
                    rows={filteredMedicines}
                    actions={actions}
                    showStatusBadge={true}
                    statusField="stockStatus"
                    isLoading={isLoading}
                />
            </Box>
        </Box>
    );
}

export default Inventory_View_Details;

