import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import adminUserService from "../../services/adminUserService";

import HeadingCard from "../../components/card/HeadingCard";
import TableComponent from "../../components/table/TableComponent";
import CardBorder from "../../components/card/CardBorder";
import RedirectButton from "../../components/buttons/RedirectButton";
import Search from "../../components/search/Search";
import ExportDataButton from "../../components/buttons/ExportDataButton";
import DeleteConfirmationModal from "../../components/modal/DeleteConfirmationModal";

import { Eye, Edit, Trash2 } from "lucide-react";

function Pharmacists() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        pharmacistId: null,
        pharmacistName: "",
        isDeleting: false
    });

    const fetchPharmacists = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await adminUserService.getAllUsers("Pharmacist");
            if (response.success) {
                setRows(response.data || []);
            } else {
                toast.error(response.message || "Failed to fetch pharmacists");
            }
        } catch (error) {
            console.error("Error fetching pharmacists:", error);
            toast.error(error.message || "Failed to fetch pharmacists");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPharmacists();
    }, [fetchPharmacists]);

    // DELETE FUNCTION
    const handleDeleteClick = useCallback((row) => {
        setDeleteModal({
            isOpen: true,
            pharmacistId: row._id,
            pharmacistName: row.name || "this pharmacist",
            isDeleting: false
        });
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteModal.pharmacistId) return;

        setDeleteModal(prev => ({ ...prev, isDeleting: true }));

        try {
            const response = await adminUserService.deleteUser("Pharmacist", deleteModal.pharmacistId);
            
            if (response.success) {
                setRows(prev => prev.filter(row => row._id !== deleteModal.pharmacistId));
                toast.success("Pharmacist deleted successfully!");
                setDeleteModal({ isOpen: false, pharmacistId: null, pharmacistName: "", isDeleting: false });
            } else {
                toast.error(response.message || "Failed to delete pharmacist");
                setDeleteModal(prev => ({ ...prev, isDeleting: false }));
            }
        } catch (error) {
            console.error("Error deleting pharmacist:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error deleting pharmacist";
            toast.error(errorMessage);
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
        }
    }, [deleteModal.pharmacistId]);

    const handleDeleteClose = useCallback(() => {
        if (!deleteModal.isDeleting) {
            setDeleteModal({ isOpen: false, pharmacistId: null, pharmacistName: "", isDeleting: false });
        }
    }, [deleteModal.isDeleting]);

    const [searchText, setSearchText] = useState("");

    // Filter rows based on search text (client-side filtering)
    const filteredRows = useMemo(() => {
        if (!searchText) return rows;
        const searchLower = searchText.toLowerCase();
        return rows.filter(row => 
            row.name?.toLowerCase().includes(searchLower) ||
            row.email?.toLowerCase().includes(searchLower) ||
            row.phone?.toLowerCase().includes(searchLower) ||
            row.specialization?.toLowerCase().includes(searchLower) ||
            row.department?.toLowerCase().includes(searchLower) ||
            row.status?.toLowerCase().includes(searchLower)
        );
    }, [rows, searchText]);

    // ===== TABLE COLUMNS =====
    const columns = [
        { field: "name", header: "Name" },
        { field: "specialization", header: "Specialization" },
        { field: "department", header: "Department" },
        { field: "phone", header: "Phone" },
        { field: "email", header: "Email" },
        { field: "status", header: "Status" },
    ];
    // ACTION BUTTONS
    const actions = [
        {
            label: "View",
            icon: <Eye />,
            color: "var(--color-icon-3)",
            onClick: (row) => navigate(`/admin/pharmacists/view/${row._id}`)
        },
        {
            label: "Edit",
            icon: <Edit />,
            color: "var(--color-icon-2)",
            onClick: (row) => navigate(`/admin/pharmacists/edit/${row._id}`)
        },
        {
            label: "Delete",
            icon: <Trash2 />,
            color: "var(--color-icon-1)",
            onClick: (row) => handleDeleteClick(row)
        }
    ];

    return (
        <div className="space-y-6 p-6">
            <HeadingCard
                title="Pharmacists"
                subtitle="View and manage all pharmacists working in the pharmacy department."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Pharmacists" }
                ]}
            />

            <CardBorder justify="between" align="center" wrap={true} padding="2rem">
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ flex: 1 }}
                    />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="pharmacists.xlsx"
                    />
                    <RedirectButton text="create" link="/admin/pharmacists/add" />
                </div>
            </CardBorder>

            <TableComponent
                columns={columns}
                rows={filteredRows}
                actions={actions}
                showStatusBadge={true}
                statusField="status"
                isLoading={isLoading}
            />

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteClose}
                onConfirm={handleDeleteConfirm}
                title="Delete Pharmacist"
                message={`Are you sure you want to delete ${deleteModal.pharmacistName}? This action cannot be undone.`}
                isDeleting={deleteModal.isDeleting}
            />
        </div>
    );
}

export default Pharmacists;