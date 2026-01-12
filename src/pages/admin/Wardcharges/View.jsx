import React, { useState, useEffect, useMemo } from 'react';
import { TextField, MenuItem, Box, Typography, Chip, CircularProgress } from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PowerSettingsNew as ToggleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import HeadingCard from '../../../components/card/HeadingCard';
import TableComponent from '../../../components/table/TableComponent';
import CardBorder from '../../../components/card/CardBorder';
import Search from '../../../components/search/Search';
import ExportDataButton from '../../../components/buttons/ExportDataButton';
import RedirectButton from '../../../components/buttons/RedirectButton';
import wardChargeService from '../../../services/wardChargeService';

// Ward category options
const WARD_CATEGORY_OPTIONS = [
    { value: "All", label: "All Categories" },
    { value: "General", label: "General" },
    { value: "Duplex", label: "Duplex" },
    { value: "Special", label: "Special" },
];

function Ward_Charges_View() {
    const navigate = useNavigate();
    const location = useLocation();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");

    // Fetch ward charges from API
    useEffect(() => {
        fetchWardCharges();
    }, []);

    // Refresh when navigating back from add/edit
    useEffect(() => {
        if (location.state?.refresh) {
            fetchWardCharges();
            // Clear the refresh flag
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    const fetchWardCharges = async () => {
        try {
            setIsLoading(true);
            const params = {
                page: 1,
                limit: 100,
            };
            
            if (category !== "All") {
                params.wardCategory = category;
            }
            
            if (status !== "All") {
                params.isActive = status === "Active";
            }
            
            if (searchText) {
                params.search = searchText;
            }

            const response = await wardChargeService.getAllWardCharges(params);
            
            if (response.success && response.data) {
                // Transform data for table display
                const transformedData = response.data.map((charge, index) => ({
                    _id: charge._id,
                    slNo: index + 1,
                    wardCategory: charge.wardCategory || "N/A",
                    dailyRate: charge.dailyRate || 0,
                    description: charge.description || "",
                    status: charge.isActive ? "Active" : "Inactive",
                    isActive: charge.isActive,
                    updated: charge.updatedAt ? new Date(charge.updatedAt).toLocaleDateString() : "N/A",
                }));
                setRows(transformedData);
            } else {
                toast.error(response.message || "Failed to fetch ward charges");
            }
        } catch (error) {
            console.error("Error fetching ward charges:", error);
            toast.error(error.message || "Failed to fetch ward charges");
        } finally {
            setIsLoading(false);
        }
    };

    // Refetch when filters change
    useEffect(() => {
        fetchWardCharges();
    }, [category, status]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this ward charge?')) {
            try {
                const response = await wardChargeService.deleteWardCharge(id);
                if (response.success) {
                    toast.success("Ward charge deleted successfully");
                    fetchWardCharges(); // Refresh the list
                } else {
                    toast.error(response.message || "Failed to delete ward charge");
                }
            } catch (error) {
                console.error("Error deleting ward charge:", error);
                toast.error(error.message || "Failed to delete ward charge");
            }
        }
    };

    const handleToggleStatus = async (row) => {
        try {
            const newStatus = !row.isActive;
            const response = await wardChargeService.updateWardChargeStatus(row._id, newStatus);
            
            if (response.success) {
                toast.success(`Ward charge ${newStatus ? "activated" : "deactivated"} successfully`);
                fetchWardCharges(); // Refresh the list
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
                item.wardCategory.toLowerCase().includes(searchText.toLowerCase()) ||
                item.description.toLowerCase().includes(searchText.toLowerCase());
            return searchMatch;
        });
    }, [rows, searchText]);

    // Columns with ₹ formatting
    const columns = [
        { field: "slNo", header: "Sl. No." },
        { field: "wardCategory", header: "Ward Category" },
        {
            field: "dailyRate",
            header: "Daily Rate",
            render: (row) => (
                <Typography variant="body2" fontWeight="medium">
                    ₹{row.dailyRate.toLocaleString("en-IN")}
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
            onClick: (row) => navigate(`/admin/ward-charges/edit/${row._id}`)
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
                title="Ward Charges"
                subtitle="Manage daily rates for different ward categories (General, Duplex, Special)."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Ward Charges" }
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
                        {WARD_CATEGORY_OPTIONS.map((option) => (
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
                        fileName="ward-charges.xlsx"
                    />
                    <RedirectButton text="Create" link="/admin/ward-charges/add" />
                </Box>
            </CardBorder>

            <TableComponent
                title="Ward Charges List"
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

export default Ward_Charges_View;

