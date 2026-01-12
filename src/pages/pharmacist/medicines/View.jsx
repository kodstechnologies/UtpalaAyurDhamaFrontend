import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, CircularProgress, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import medicineService from "../../../services/medicineService";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import CardBorder from "../../../components/card/CardBorder";
import RedirectButton from "../../../components/buttons/RedirectButton";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import DeleteConfirmationModal from "../../../components/modal/DeleteConfirmationModal";

import { Eye, Edit, Trash2 } from "lucide-react";

function MedicinesView() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [stockStatusFilter, setStockStatusFilter] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        medicineId: null,
        medicineName: "",
        isDeleting: false,
    });

    const fetchMedicines = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...(searchText && { search: searchText }),
                ...(stockStatusFilter && { stockStatus: stockStatusFilter }),
            };

            const response = await medicineService.getAllMedicines(params);

            if (response && response.success) {
                const data = response.data?.medicines || [];
                setRows(Array.isArray(data) ? data : []);
                if (response.meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.meta.total || 0,
                        totalPages: response.meta.totalPages || 0,
                    }));
                }
            } else {
                toast.error(response?.message || "Failed to fetch medicines");
                setRows([]);
            }
        } catch (error) {
            console.error("Error fetching medicines:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch medicines";
            toast.error(errorMessage);
            setRows([]);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, searchText, stockStatusFilter]);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    const handleDeleteClick = useCallback((row) => {
        setDeleteModal({
            isOpen: true,
            medicineId: row._id,
            medicineName: row.medicineName || "this medicine",
            isDeleting: false,
        });
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteModal.medicineId) return;

        setDeleteModal(prev => ({ ...prev, isDeleting: true }));

        try {
            await medicineService.deleteMedicine(deleteModal.medicineId);
            toast.success("Medicine deleted successfully");
            setDeleteModal({ isOpen: false, medicineId: null, medicineName: "", isDeleting: false });
            fetchMedicines();
        } catch (error) {
            console.error("Error deleting medicine:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete medicine";
            toast.error(errorMessage);
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
        }
    }, [deleteModal.medicineId, fetchMedicines]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteModal({ isOpen: false, medicineId: null, medicineName: "", isDeleting: false });
    }, []);

    const columns = [
        { field: "medicineCode", header: "Medicine Code" },
        { field: "medicineName", header: "Medicine Name" },
        { field: "manufacturer", header: "Manufacturer" },
        { field: "type", header: "Type" },
        { field: "quantity", header: "Quantity" },
        { field: "unit", header: "Unit" },
        { field: "stockStatus", header: "Stock Status" },
        { field: "status", header: "Status" },
    ];

    const actions = [
        {
            label: "View",
            icon: <Eye size={16} />,
            color: "var(--color-icon-3)",
            onClick: (row) => navigate(`/pharmacist/medicines/view/${row._id}`),
        },
        {
            label: "Edit",
            icon: <Edit size={16} />,
            color: "var(--color-icon-2)",
            onClick: (row) => navigate(`/pharmacist/medicines/edit/${row._id}`),
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
                title="Medicine Management"
                subtitle="View and manage all medicines in the pharmacy inventory."
                breadcrumbItems={[
                    { label: "Home", url: "/" },
                    { label: "Pharmacist", url: "/pharmacist/dashboard" },
                    { label: "Medicines" },
                ]}
            />

            <CardBorder justify="between" align="center" wrap={true} padding="2rem">
                <div style={{ flex: 1, marginRight: "1rem", minWidth: "200px" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ flex: 1 }}
                        placeholder="Search medicines..."
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
                    <ExportDataButton
                        rows={rows}
                        columns={columns}
                        fileName="medicines.xlsx"
                    />
                    <RedirectButton text="Add Medicine" link="/pharmacist/medicines/add" />
                </div>
            </CardBorder>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableComponent
                    columns={columns}
                    rows={rows}
                    actions={actions}
                    showStatusBadge={true}
                    statusField="stockStatus"
                />
            )}

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Medicine"
                message={`Are you sure you want to delete ${deleteModal.medicineName}? This action cannot be undone.`}
                isDeleting={deleteModal.isDeleting}
            />
        </div>
    );
}

export default MedicinesView;

