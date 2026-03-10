import React, { useState, useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard"; // Your animated card
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import RedirectButton from "../../../components/buttons/RedirectButton";

function Batch_Log_View() {
    const { stockId } = useParams();
    const navigate = useNavigate();

    // Mock data
    const itemName = "Ashwagandha churna";
    const currentStock = 20000;
    const expiredStock = 0;

    const [rows, setRows] = useState([
        {
            _id: "1",
            batchId: "BATCH-001",
            quantity: "2000 g",
            expiryDate: "2025-06-12",
            costPrice: "₹1200",
            sellPrice: "₹1500",
        },
        {
            _id: "2",
            batchId: "BATCH-002",
            quantity: "3000 g",
            expiryDate: "2025-08-01",
            costPrice: "₹1750",
            sellPrice: "₹2100",
        },
    ]);

    const [searchText, setSearchText] = useState("");

    // Filtered rows based on search
    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const searchMatch = searchText === '' ||
                row.batchId.toLowerCase().includes(searchText.toLowerCase()) ||
                row.quantity.toLowerCase().includes(searchText.toLowerCase()) ||
                row.expiryDate.includes(searchText) ||
                row.costPrice.includes(searchText) ||
                row.sellPrice.includes(searchText);
            return searchMatch;
        });
    }, [rows, searchText]);

    const columns = [
        { field: "batchId", header: "Batch ID" },
        { field: "quantity", header: "Quantity" },
        { field: "expiryDate", header: "Batch Expiry Date" },
        { field: "costPrice", header: "Cost Price" },
        { field: "sellPrice", header: "Sell Price" },
    ];

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this batch?")) {
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    const actions = [
        {
            icon: <EditIcon fontSize="small" />,
            color: "var(--color-info)",
            label: "Edit",
            onClick: (row) => {
                navigate(`/admin/inventory/batch-log/edit/${row._id}`);
            },
        },
        {
            icon: <DeleteIcon fontSize="small" />,
            color: "#f44336",
            label: "Delete",
            onClick: (row) => {
                handleDelete(row._id);
            },
        },
    ];

    return (
        <Box>
            <HeadingCard
                title={`Batch Log: ${itemName}`}
                subtitle="Track batch-wise stock, expiry, pricing, and consumption history."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    {
                        label: "Inventory", url: "/admin/inventory"
                    },
                    { label: `Batch Log - ${stockId}` },
                ]}
            />

            {/* 2 Animated Dashboard Cards */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={4}
                mb={5}
            >
                <DashboardCard
                    title="Current Total Stock"
                    count={currentStock}
                    icon={InventoryIcon}
                />

                <DashboardCard
                    title="Expired Stock"
                    count={expiredStock}
                    icon={WarningIcon}
                />
            </Stack>

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

                {/* RIGHT SIDE — Export + Add Batch Buttons */}
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="batch-log.xlsx"
                    />
                    <RedirectButton text="Add Batch" link={`/admin/inventory/batch-log/add`} />
                </div>
            </CardBorder>

            {/* Batch History Table */}
            <TableComponent
                title="Batch History"
                columns={columns}
                rows={filteredRows}
                actions={actions}
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
                showExportButton={false}
            />
        </Box>
    );
}

export default Batch_Log_View;