// import React from "react";
// import { useParams } from "react-router-dom";
// import HeadingCard from "../../../components/card/HeadingCard";
// import TableComponent from "../../../components/table/TableComponent";

// function Batch_Log_View() {
//     const { stockId } = useParams(); // <--- IMPORTANT

//     // Dummy batch log data (replace with API later)
//     const rows = [
//         {
//             _id: "1",
//             batchId: "BATCH-001",
//             quantity: "2000 g",
//             expiryDate: "2025-06-12",
//             costPrice: "₹1200",
//             sellPrice: "₹1500",
//         },
//         {
//             _id: "2",
//             batchId: "BATCH-002",
//             quantity: "3000 g",
//             expiryDate: "2025-08-01",
//             costPrice: "₹1750",
//             sellPrice: "₹2100",
//         },
//     ];

//     const columns = [
//         { field: "batchId", header: "Batch ID" },
//         { field: "quantity", header: "Quantity" },
//         { field: "expiryDate", header: "Batch Expiry Date" },
//         { field: "costPrice", header: "Cost Price" },
//         { field: "sellPrice", header: "Sell Price" },
//     ];

//     return (
//         <div>
//             <HeadingCard
//                 title={`Batch Log for Stock ID: ${stockId}`}
//                 subtitle="View detailed batch information for this stock item."
//                 breadcrumbItems={[
//                     { label: "Inventory", url: "/inventory/view" },
//                     { label: `Batch Log - ${stockId}` }
//                 ]}
//             />

//             <TableComponent
//                 title="Batch Log"
//                 columns={columns}
//                 rows={rows}
//                 showView={true}
//                 showEdit={false}
//                 showDelete={false}
//             />
//         </div>
//     );
// }

// export default Batch_Log_View;


import React, { useState, useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard"; // Your animated card
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";

function Batch_Log_View() {
    const { stockId } = useParams();

    // Mock data
    const itemName = "Ashwagandha churna";
    const currentStock = 20000;
    const expiredStock = 0;

    const rows = [
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
    ];

    const columns = [
        { field: "batchId", header: "Batch ID" },
        { field: "quantity", header: "Quantity" },
        { field: "expiryDate", header: "Batch Expiry Date" },
        { field: "costPrice", header: "Cost Price" },
        { field: "sellPrice", header: "Sell Price" },
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
                // justifyContent="center"
                // alignItems="center"
                mb={5}
            // sx={{ maxWidth: 600, mx: "auto" }}
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
                // Optional: make red when > 0
                // iconColor={expiredStock > 0 ? "#E74C3C" : "#95A5A6"}
                />
            </Stack>

            {/* Batch History Table */}


            <TableComponent
                title=""
                columns={columns}
                rows={rows}
                showView={true}
                showEdit={false}
                showDelete={false}
                showAddButton={true}
                showExportButton={true}
            />

        </Box>
    );
}

export default Batch_Log_View;