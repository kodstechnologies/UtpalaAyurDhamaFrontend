import React, { useState, useEffect, useMemo } from 'react';
import { TextField, MenuItem, Box, Typography, Chip, CircularProgress } from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PowerSettingsNew as ToggleIcon,
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import HeadingCard from '../../../components/card/HeadingCard';
import TableComponent from '../../../components/table/TableComponent';
import CardBorder from '../../../components/card/CardBorder';
import Search from '../../../components/search/Search';
import ExportDataButton from '../../../components/buttons/ExportDataButton';
import RedirectButton from '../../../components/buttons/RedirectButton';
import foodChargeService from '../../../services/foodChargeService';

// Category options (backend uses lowercase, frontend displays capitalized)
const CATEGORY_OPTIONS = [
    { value: "All", label: "All Categories" },
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "juice", label: "Juice" },
];

// Helper to capitalize category for display
const capitalizeCategory = (category) => {
    if (!category) return category;
    return category.charAt(0).toUpperCase() + category.slice(1);
};

function Food_Charges_View() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");

    // Fetch food charges from API
    useEffect(() => {
        fetchFoodCharges();
    }, []);

    const fetchFoodCharges = async () => {
        try {
            setIsLoading(true);
            const params = {
                page: 1,
                limit: 100,
            };
            
            if (category !== "All") {
                params.category = category;
            }
            
            if (status !== "All") {
                params.isActive = status === "Active";
            }
            
            if (searchText) {
                params.search = searchText;
            }

            const response = await foodChargeService.getAllFoodCharges(params);
            
            if (response.success && response.data) {
                // Transform data for table display
                const transformedData = response.data.map((charge, index) => ({
                    _id: charge._id,
                    slNo: index + 1,
                    foodName: charge.name || "N/A",
                    category: capitalizeCategory(charge.category),
                    categoryValue: charge.category, // Keep original for filtering
                    price: charge.price || 0,
                    description: charge.description || "",
                    status: charge.isActive ? "Active" : "Inactive",
                    isActive: charge.isActive,
                    updated: charge.updatedAt ? new Date(charge.updatedAt).toLocaleDateString() : "N/A",
                }));
                setRows(transformedData);
            } else {
                toast.error(response.message || "Failed to fetch food charges");
            }
        } catch (error) {
            console.error("Error fetching food charges:", error);
            toast.error(error.message || "Failed to fetch food charges");
        } finally {
            setIsLoading(false);
        }
    };

    // Refetch when filters change
    useEffect(() => {
        fetchFoodCharges();
    }, [category, status]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this food charge?')) {
            try {
                const response = await foodChargeService.deleteFoodCharge(id);
                if (response.success) {
                    toast.success("Food charge deleted successfully");
                    fetchFoodCharges(); // Refresh the list
                } else {
                    toast.error(response.message || "Failed to delete food charge");
                }
            } catch (error) {
                console.error("Error deleting food charge:", error);
                toast.error(error.message || "Failed to delete food charge");
            }
        }
    };

    const handleToggleStatus = async (row) => {
        try {
            const newStatus = !row.isActive;
            const response = await foodChargeService.updateFoodChargeStatus(row._id, newStatus);
            
            if (response.success) {
                toast.success(`Food charge ${newStatus ? "activated" : "deactivated"} successfully`);
                fetchFoodCharges(); // Refresh the list
            } else {
                toast.error(response.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error(error.message || "Failed to update status");
        }
    };

    // Filtered rows based on search (client-side filtering for search only)
    const filteredRows = useMemo(() => {
        if (!searchText) return rows;
        return rows.filter(item => {
            const searchMatch = 
                item.foodName.toLowerCase().includes(searchText.toLowerCase()) ||
                item.description.toLowerCase().includes(searchText.toLowerCase());
            return searchMatch;
        });
    }, [rows, searchText]);

    // Columns with ₹ formatting
    const columns = [
        { field: "slNo", header: "Sl. No." },
        { field: "foodName", header: "Food Name" },
        { field: "category", header: "Category" },
        {
            field: "price",
            header: "Price",
            render: (row) => (
                <Typography variant="body2" fontWeight="medium">
                    ₹{row.price.toLocaleString("en-IN")}
                </Typography>
            ),
        },
        { 
            field: "description", 
            header: "Description",
            render: (row) => (
                <Typography variant="body2" sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.description || "N/A"}
                </Typography>
            ),
        },
        { field: "status", header: "Status" },
        { field: "updated", header: "Last Updated" },
    ];

    const actions = [
        {
            label: "Edit",
            icon: <EditIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: (row) => navigate(`/admin/food-charges/edit/${row._id}`)
        },
        {
            icon: <ToggleIcon fontSize="small" />,
            label: 'Toggle Status',
            color: 'default',
            onClick: (row) => handleToggleStatus(row),
        },
        {
            label: "Delete",
            icon: <DeleteIcon fontSize="small" />,
            color: "#f44336",
            onClick: (row) => handleDelete(row._id)
        }
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Food Charges"
                subtitle="Manage food pricing for breakfast, lunch, dinner, and special diet plans."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Food Charges" }
                ]}
            />

            {/* SEARCH + FILTERS + EXPORT */}
            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{ width: "100%", marginBottom: "2rem" }}
            >
                {/* LEFT SIDE — Search + Filters */}
                <Box sx={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ width: "200px" }}
                    />
                    <TextField
                        select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        sx={{ minWidth: 180 }}
                        variant="outlined"
                        size="small"
                    >
                        {CATEGORY_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        sx={{ minWidth: 150 }}
                        variant="outlined"
                        size="small"
                    >
                        <MenuItem value="All">All Status</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </TextField>
                </Box>

                {/* RIGHT SIDE — Export + Create */}
                <Box sx={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="food-charges.xlsx"
                    />
                    <RedirectButton text="Create" link="/admin/food-charges/add" />
                </Box>
            </CardBorder>

            <TableComponent
                title="Food Charges List"
                subtitle={`${filteredRows.length} charges found`}
                columns={columns}
                rows={filteredRows.map((row) => ({
                    ...row,
                    status: (
                        <Chip
                            label={row.status}
                            color={row.status === "Active" ? "success" : "default"}
                            size="small"
                        />
                    )
                }))}
                actions={actions}
                showAddButton={false}
                showExportButton={false}
                showView={false}
                showEdit={false}
                showDelete={false}
                showStatusBadge={false}
            />
        </Box>
    );
}

export default Food_Charges_View;
