import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, CircularProgress, MenuItem, Select, FormControl, InputLabel, Tabs, Tab, Typography } from "@mui/material";
import storeService from "../../../services/storeService";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import CardBorder from "../../../components/card/CardBorder";
import RedirectButton from "../../../components/buttons/RedirectButton";
import Search from "../../../components/search/Search";
import DeleteConfirmationModal from "../../../components/modal/DeleteConfirmationModal";

import { Edit, Trash2 } from "lucide-react";

function StoreView() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [stockStatusFilter, setStockStatusFilter] = useState("");
    const [currentTab, setCurrentTab] = useState("Store Stock");

    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 25,
        total: 0,
    });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        itemId: null,
        itemName: "",
        isDeleting: false,
    });

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                page: pagination.page + 1, // Backend uses 1-based pagination
                limit: pagination.rowsPerPage,
                ...(searchText && { search: searchText }),
                ...(stockStatusFilter && { stockStatus: stockStatusFilter }),
                inventoryType: currentTab,
            };

            const response = await storeService.getAllStoreItems(params);

            if (response && response.success) {
                let data = response.data?.items || [];
                setRows(Array.isArray(data) ? data : []);
                if (response.data?.meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.data.meta.total || 0,
                    }));
                }
            } else {
                toast.error(response?.message || "Failed to fetch store items");
                setRows([]);
            }
        } catch (error) {
            console.error("Error fetching store items:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch store items";
            toast.error(errorMessage);
            setRows([]);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.rowsPerPage, searchText, stockStatusFilter, currentTab]);
    
    // Reset to first page when search, filter, or tab changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 0 }));
    }, [searchText, stockStatusFilter, currentTab]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleDeleteClick = useCallback((row) => {
        setDeleteModal({
            isOpen: true,
            itemId: row._id,
            itemName: row.itemName || "this item",
            isDeleting: false,
        });
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteModal.itemId) return;

        setDeleteModal(prev => ({ ...prev, isDeleting: true }));

        try {
            await storeService.deleteStoreItem(deleteModal.itemId);
            toast.success("Item deleted successfully");
            setDeleteModal({ isOpen: false, itemId: null, itemName: "", isDeleting: false });
            fetchItems();
        } catch (error) {
            console.error("Error deleting item:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete item";
            toast.error(errorMessage);
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
        }
    }, [deleteModal.itemId, fetchItems]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteModal({ isOpen: false, itemId: null, itemName: "", isDeleting: false });
    }, []);

    const columns = [
        { field: "itemCode", header: "Code" },
        { field: "itemName", header: "Product" },
        { field: "category", header: "Category" },
        {
            field: "price",
            header: "Price",
            render: (row) => row.price ? `₹${row.price}` : "₹0"
        },
        {
            field: "quantity",
            header: "Balance",
            render: (row) => `${row.quantity} ${row.unit}`
        },
        { field: "stockStatus", header: "Status" },
    ];

    const actions = [
        {
            label: "Edit",
            icon: <Edit size={16} />,
            color: "var(--color-icon-2)",
            onClick: (row) => navigate(`/therapist/store/edit/${row._id}`),
        },
        {
            label: "Delete",
            icon: <Trash2 size={16} />,
            color: "var(--color-icon-1)",
            onClick: handleDeleteClick,
        },
    ];

    return (
        <div className="space-y-6 p-6">
            <HeadingCard
                title="Store Management"
                subtitle="Manage housekeeping inventory and supplies."
                breadcrumbItems={[
                    { label: "Home", url: "/" },
                    { label: "Therapist", url: "/therapist/dashboard" },
                    { label: "Store" },
                ]}
            />

            <CardBorder justify="between" align="center" wrap={true} padding="2rem">
                <div style={{ flex: 1, marginRight: "1rem", minWidth: "200px" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ flex: 1 }}
                        placeholder="Search products..."
                    />
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <FormControl size="small" style={{ minWidth: 150 }}>
                        <InputLabel>Stock Status</InputLabel>
                        <Select
                            value={stockStatusFilter}
                            label="Stock Status"
                            onChange={(e) => setStockStatusFilter(e.target.value)}
                        >
                            <MenuItem value="">All Stock</MenuItem>
                            <MenuItem value="In Stock">In Stock</MenuItem>
                            <MenuItem value="Low Stock">Low Stock</MenuItem>
                            <MenuItem value="Out of Stock">Out of Stock</MenuItem>
                        </Select>
                    </FormControl>
                    <RedirectButton text="Add Product" link="/therapist/store/add" />
                </div>
            </CardBorder>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs value={currentTab} onChange={(e, val) => { setCurrentTab(val); setPagination(prev => ({ ...prev, page: 1 })); }}>
                    <Tab label="Store Stock" value="Store Stock" />
                    <Tab label="Assets 1" value="Assets 1" />
                    <Tab label="Assets 2" value="Assets 2" />
                    <Tab label="Medical Stock" value="Medical Stock" />
                </Tabs>
            </Box>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    {(() => {
                        // Group rows by category
                        const groupedRows = rows.reduce((acc, row) => {
                            const cat = row.category || "General";
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(row);
                            return acc;
                        }, {});

                        const categories = Object.keys(groupedRows).sort();

                        if (categories.length === 0) {
                            return <div style={{ textAlign: "center", padding: "20px" }}>No items found</div>;
                        }

                        // If current tab is Store Stock, show a single flat table
                        if (currentTab === "Store Stock") {
                            return (
                                <TableComponent
                                    columns={columns}
                                    rows={rows}
                                    actions={actions}
                                    showStatusBadge={true}
                                    statusField="stockStatus"
                                    serverSidePagination={true}
                                    totalCount={pagination.total}
                                    page={pagination.page}
                                    rowsPerPage={pagination.rowsPerPage}
                                    onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                                    onRowsPerPageChange={(newRowsPerPage) => setPagination(prev => ({ ...prev, rowsPerPage: newRowsPerPage, page: 0 }))}
                                />
                            );
                        }

                        // For other tabs, keep grouping by category
                        return categories.map(cat => (
                            <Box key={cat} sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "var(--color-text-dark-b)" }}>
                                    {cat.toUpperCase()}
                                </Typography>
                                <TableComponent
                                    columns={columns}
                                    rows={groupedRows[cat]}
                                    actions={actions}
                                    showStatusBadge={true}
                                    statusField="stockStatus"
                                />
                            </Box>
                        ));
                    })()}
                </Box>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Product"
                message={`Are you sure you want to delete ${deleteModal.itemName}?`}
                isDeleting={deleteModal.isDeleting}
            />
        </div >
    );
}

export default StoreView;
