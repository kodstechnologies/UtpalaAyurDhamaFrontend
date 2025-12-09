

import React, { useState, useMemo } from "react";
import {
    Box,
    Stack,
    Button,                    // ← THIS WAS MISSING!
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import { X } from "lucide-react";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
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
    const [rows, setRows] = useState([
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

    const [filter, setFilter] = useState("All Items");
    const [openBatchLog, setOpenBatchLog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const navigate = useNavigate();
    const filteredRows = useMemo(() => {
        return filter === "All Items"
            ? rows
            : rows.filter(item => item.type === filter);
    }, [rows, filter]);

    const columns = [
        { field: "stockId", header: "Stock ID" },
        { field: "itemName", header: "Item Name" },
        { field: "type", header: "Type" },
        { field: "category", header: "Category" },
        { field: "quantity", header: "Quantity" },
        { field: "status", header: "Status" },
    ];

    const customActions = [
        {
            icon: <DescriptionIcon fontSize="small" />,
            color: "#27AE60", // or "var(--color-primary)"
            onClick: (row) => {
                // Redirect to Batch Log page with stockId
                navigate(`/inventory/batch-log/${row.stockId}`);
                // Alternative: use _id if you prefer
                // navigate(`/admin/inventory/batch-log/${row._id}`);
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
                formFields={fields}
                showView={true}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
                showExportButton={true}
                customActions={customActions}
            />

            {/* Batch Log Modal */}
            <Dialog open={openBatchLog} onClose={() => setOpenBatchLog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600, pr: 6 }}>
                    Batch Log - {selectedItem?.itemName || ""}
                    <IconButton
                        onClick={() => setOpenBatchLog(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <X />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary" mb={2}>
                        Batch information for this item:
                    </Typography>
                    <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2 }}>
                        <Typography><strong>Batch No:</strong> BCH-2025-001</Typography>
                        <Typography><strong>Expiry Date:</strong> 31 Dec 2026</Typography>
                        <Typography><strong>Supplier:</strong> MedLife Pharmaceuticals</Typography>
                        <Typography><strong>Received On:</strong> 05 Jan 2025</Typography>
                        <Typography><strong>Quantity Received:</strong> 500 units</Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default Inventory_View;