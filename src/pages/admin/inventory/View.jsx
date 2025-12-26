import { useState, useMemo } from "react";
import {
    Box,
    Stack,
    Button,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BlockIcon from "@mui/icons-material/Block";
import { ListChecks } from 'lucide-react';

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import RedirectButton from "../../../components/buttons/RedirectButton";
import { useNavigate } from "react-router-dom";

const fields = [
    { name: 'stockId', label: 'Stock ID', type: 'text', required: true },
    { name: 'itemName', label: 'Item Name', type: 'text', required: true },
    {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
            { value: 'Internal Medicine', label: 'Internal Medicine' },
            { value: 'External Medicine', label: 'External Medicine' },
        ],
    },
    { name: 'category', label: 'Category', type: 'text', required: true },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
            { value: 'Available', label: 'Available' },
            { value: 'Low Stock', label: 'Low Stock' },
            { value: 'Out of Stock', label: 'Out of Stock' },
        ],
    },
];

function Inventory_View() {
    const [rows] = useState([
        {
            _id: "1",
            stockId: "STK-101",
            itemName: "Paracetamol",
            type: "Internal Medicine",
            category: "Pain Relief",
            quantity: 120,
            status: "Available",
        },
        {
            _id: "2",
            stockId: "STK-202",
            itemName: "Bandage Roll",
            type: "External Medicine",
            category: "First Aid",
            quantity: 50,
            status: "Low Stock",
        },
        {
            _id: "3",
            stockId: "STK-303",
            itemName: "Amoxicillin",
            type: "Internal Medicine",
            category: "Antibiotic",
            quantity: 200,
            status: "Available",
        },
    ]);

    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("All Items");
    const navigate = useNavigate();

    // Combined filtering: search + type filter
    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const searchMatch = searchText === '' ||
                row.itemName.toLowerCase().includes(searchText.toLowerCase()) ||
                row.stockId.toLowerCase().includes(searchText.toLowerCase()) ||
                row.category.toLowerCase().includes(searchText.toLowerCase()) ||
                row.type.toLowerCase().includes(searchText.toLowerCase()) ||
                row.status.toLowerCase().includes(searchText.toLowerCase()) ||
                row.quantity.toString().includes(searchText);

            const typeMatch = filter === "All Items" || row.type === filter;

            return searchMatch && typeMatch;
        });
    }, [rows, searchText, filter]);

    // Live Stats
    const stats = useMemo(() => {
        const total = rows.length;
        const lowStock = rows.filter(r => r.quantity < 100).length; // Assuming <100 is low stock
        const outOfStock = rows.filter(r => r.quantity === 0).length;

        return { total, lowStock, outOfStock };
    }, [rows]);

    const columns = [
        { field: "stockId", header: "Stock ID" },
        { field: "itemName", header: "Item Name" },
        { field: "type", header: "Type" },
        { field: "category", header: "Category" },
        { field: "quantity", header: "Quantity" },
        { field: "status", header: "Status" },
    ];

    const actions = [
        {
            icon: <ListChecks fontSize="small" />,
            color: "var(--color-primary)",
            label: "View",
            onClick: (row) => {
                navigate(`/admin/inventory/batch-log/${row._id}`);
            },
        },
        {
            icon: <DeleteIcon fontSize="small" />,
            color: "#f44336",
            label: "Delete",
            onClick: (row) => {
                navigate(`/admin/inventory/delete/${row._id}`);
            },
        },
    ];

    const customActions = [
        {
            icon: <DescriptionIcon fontSize="small" />,
            color: "#27AE60",
            onClick: (row) => {
                const params = new URLSearchParams({
                    itemId: row._id || "",
                    itemName: row.itemName || "",
                    batchNo: row.batchNo || "BCH-2025-001",
                    expiryDate: row.expiryDate || "31 Dec 2026",
                    supplier: row.supplier || "MedLife Pharmaceuticals",
                    receivedOn: row.receivedOn || "05 Jan 2025",
                    quantityReceived: (row.quantityReceived || "500").toString(),
                });
                navigate(`/admin/inventory/batch-log?${params.toString()}`);
            },
            tooltip: "View Batch Log",
        },
    ];

    return (
        <Box>
            <HeadingCard
                title="Inventory Management"
                subtitle="Monitor and manage the stock of medicines and essential supplies."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Inventory" }
                ]}
            />

            {/* Stats Cards */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                my={4}
                justifyContent="flex-start"
                sx={{
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
            >
                <DashboardCard
                    title="Total Items"
                    count={stats.total}
                    icon={LocalPharmacyIcon}
                />
                <DashboardCard
                    title="Low Stock"
                    count={stats.lowStock}
                    icon={WarningAmberIcon}
                />
                <DashboardCard
                    title="Out of Stock"
                    count={stats.outOfStock}
                    icon={BlockIcon}
                />
            </Stack>

            {/* SEARCH + EXPORT + CREATE */}
            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{
                    width: "100%",
                    marginBottom: "2rem",
                }}
            >
                {/* LEFT SIDE — Search */}
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ width: "100%" }}
                    />
                </div>

                {/* RIGHT SIDE — Export + Create Buttons */}
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="inventory.xlsx"
                    />
                    <RedirectButton text="Add Item" link="/admin/inventory/add" />
                </div>
            </CardBorder>

            {/* Filter Buttons */}
            <Stack direction="row" spacing={2} mb={3}>
                {["All Items", "Internal Medicine", "External Medicine"].map((btn) => (
                    <Button
                        key={btn}
                        onClick={() => setFilter(btn)}
                        variant={filter === btn ? "contained" : "outlined"}
                        sx={{
                            px: 3,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: filter === btn ? "var(--color-primary)" : "transparent",
                            color: filter === btn ? "white" : "var(--color-text-dark)",
                            borderColor: "var(--color-border)",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": {
                                bgcolor: filter === btn ? "var(--color-primary-dark)" : "var(--color-bg-hover)",
                            },
                        }}
                    >
                        {btn}
                    </Button>
                ))}
            </Stack>

            <TableComponent
                title="Inventory List"
                columns={columns}
                rows={filteredRows}
                actions={actions}
                formFields={fields}
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
                showExportButton={false}
                customActions={customActions}
                showStatusBadge={true}
                statusField="status"
            />

        </Box>
    );
}

export default Inventory_View;