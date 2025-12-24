import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import TableComponent from "../../../components/table/TableComponent";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningIcon from "@mui/icons-material/Warning";
import ChecklistIcon from "@mui/icons-material/Checklist";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

function Inventory_View_Details() {
    const navigate = useNavigate();

    /* Breadcrumb */
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist/dashboard" },
        { label: "Inventory" },
    ];

    /* Dashboard Cards */
    const dashboardData = [
        { title: "Total Items", count: 2, icon: Inventory2Icon },
        { title: "Items in Low Stock", count: 0, icon: WarningIcon },
    ];

    /* Table Columns */
    const columns = [
        { field: "stockId", header: "Stock ID" },
        { field: "itemName", header: "Item Name" },
        { field: "type", header: "Type" },
        { field: "category", header: "Category" },
        { field: "quantity", header: "Quantity" },
        { field: "status", header: "Status" },
    ];

    /* Table Rows */
    const rows = [
        {
            _id: "1",
            stockId: "STK-001",
            itemName: "Paracetamol",
            type: "Tablet",
            category: "Pain Relief",
            quantity: 120,
            status: "Available",
        },
        {
            _id: "2",
            stockId: "STK-002",
            itemName: "Cough Syrup",
            type: "Liquid",
            category: "Cold & Cough",
            quantity: 50,
            status: "Available",
        },
    ];

    /* ✅ ACTIONS (THIS IS THE FIX) */
    const actions = [
        {
            label: "Batch Log",
            icon: <ChecklistIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: (row) =>
                navigate(`/pharmacist/batch-log/${row._id}`),
        },
        {
            label: "Delete",
            icon: <DeleteOutlineIcon fontSize="small" />,
            color: "var(--color-error)",
            onClick: (row) =>
                console.log("Delete item:", row._id),
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
                subtitle="Track stock levels, identify low quantities, and ensure timely replenishment."
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
                    <DashboardCard
                        key={i}
                        title={item.title}
                        count={item.count}
                        icon={item.icon}
                    />
                ))}
            </Box>

            {/* Inventory Table */}
            <Box sx={{ mt: 5 }}>
                <TableComponent
                    columns={columns}
                    rows={rows}
                    actions={actions}
                    showStatusBadge={true}
                    statusField="status"
                />
            </Box>
        </Box>
    );
}

export default Inventory_View_Details;
