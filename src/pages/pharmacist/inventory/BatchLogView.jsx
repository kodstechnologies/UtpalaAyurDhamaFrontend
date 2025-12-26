import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Chip, Typography } from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
// import HeadingCard from "../../../../components/card/HeadingCard";
// import TableComponent from "../../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
// import CardBorder from "../../../ components/card/CardBorder";
// import Search from "../../../../components/search/Search";
// import ExportDataButton from "../../../../components/buttons/ExportDataButton";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";

function BatchLogView() {
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist/dashboard" },
        { label: "Inventory", url: "/pharmacist/inventory" },
        { label: "Batch Log" },
    ];

    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");

    const columns = [
        { field: "batchId", header: "Batch ID" },
        { field: "medicineName", header: "Medicine Name" },
        { field: "expiryDate", header: "Expiry Date" },
        { field: "quantity", header: "Quantity" },
        { field: "status", header: "Status" },
        {
            field: "dispensed",
            header: "Dispensed",
            renderCell: (params) => {
                const count = params.row.dispensed || 0;
                return (
                    <Chip
                        icon={<CheckCircleIcon sx={{ color: "var(--color-light)", fontSize: "16px" }} />}
                        label={count}
                        size="small"
                        sx={{
                            backgroundColor: "var(--color-success)",
                            color: "var(--color-light)",
                            fontWeight: 600,
                            "& .MuiChip-icon": {
                                color: "var(--color-light)",
                            },
                        }}
                    />
                );
            },
        },
    ];

    const rows = [
        {
            _id: "1",
            batchId: "BATCH001",
            medicineName: "Paracetamol 500mg",
            expiryDate: "2026-06-15",
            quantity: 100,
            status: "Active",
            dispensed: 25,
        },
        {
            _id: "2",
            batchId: "BATCH002",
            medicineName: "Ibuprofen 400mg",
            expiryDate: "2025-12-20",
            quantity: 50,
            status: "Low Stock",
            dispensed: 40,
        },
    ];

    const filteredRows = rows.filter((row) =>
        row.batchId.toLowerCase().includes(searchText.toLowerCase()) ||
        row.medicineName.toLowerCase().includes(searchText.toLowerCase()) ||
        row.status.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleViewDetails = (row) => {
        const params = new URLSearchParams({
            batchId: row.batchId || row.id || row._id || "",
            _id: row._id || row.id || "",
            itemName: row.medicineName || row.itemName || row.name || "",
            medicineName: row.medicineName || "",
            batchNo: row.batchId || row.batchNo || "",
            expiryDate: row.expiryDate || "",
            quantity: (row.quantity || "").toString(),
            dispensed: (row.dispensed || "0").toString(),
            supplier: row.supplier || "MedLife Pharmaceuticals",
            receivedOn: row.receivedOn || new Date().toISOString().split("T")[0],
            purchaseOrder: row.purchaseOrder || "PO-2025-001",
            unitPrice: row.unitPrice || "25.00",
        });
        navigate(`/pharmacist/inventory/batch-log-details?${params.toString()}`);
    };

    const actions = [
        {
            label: "View Details",
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: handleViewDetails,
        },
    ];

    // Summary data with numbers
    const summary = {
        totalBatches: 12,
        activeBatches: 8,
        lowStock: 4,
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <HeadingCard
                title="Batch Log"
                subtitle="Monitor batch details, expiry dates, and inventory status for all medicines."
                breadcrumbItems={breadcrumbItems}
            />

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard
                        title="Total Batches"
                        count={summary.totalBatches}
                        icon={PeopleIcon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard
                        title="Active Batches"
                        count={summary.activeBatches}
                        icon={PersonAddAlt1Icon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard
                        title="Low Stock"
                        count={summary.lowStock}
                        icon={ExitToAppIcon}
                    />
                </Grid>
            </Grid>

            {/* Search and Export */}
            <CardBorder justify="between" align="center" wrap={true} padding="2rem" className="my-[2rem]">
                <Box sx={{ flex: 1, mr: 1 }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        sx={{ flex: 1 }}
                    />
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <ExportDataButton
                        rows={rows}
                        columns={columns}
                        fileName="batch-log.xlsx"
                    />
                </Box>
            </CardBorder>

            {/* Table */}
            <TableComponent
                columns={columns}
                rows={filteredRows}
                actions={actions}
                showStatusBadge={true}
            />

        </Box>
    );
}

export default BatchLogView;