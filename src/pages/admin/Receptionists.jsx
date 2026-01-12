import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import adminUserService from "../../services/adminUserService";

import HeadingCard from "../../components/card/HeadingCard";
import TableComponent from "../../components/table/TableComponent";
import CardBorder from "../../components/card/CardBorder";
import Search from "../../components/search/Search";
import RedirectButton from "../../components/buttons/RedirectButton";
import ExportDataButton from "../../components/buttons/ExportDataButton";
import DeleteConfirmationModal from "../../components/modal/DeleteConfirmationModal";

import { Eye, Edit, Trash2 } from "lucide-react";

function Receptionists() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        receptionistId: null,
        receptionistName: "",
        isDeleting: false
    });

    const fetchReceptionists = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await adminUserService.getAllUsers("Receptionist");
            if (response.success) {
                setRows(response.data || []);
            } else {
                toast.error(response.message || "Failed to fetch receptionists");
            }
        } catch (error) {
            console.error("Error fetching receptionists:", error);
            toast.error(error.message || "Failed to fetch receptionists");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReceptionists();
    }, [fetchReceptionists]);

    // DELETE FUNCTION
    const handleDeleteClick = useCallback((row) => {
        setDeleteModal({
            isOpen: true,
            receptionistId: row._id,
            receptionistName: row.name || "this receptionist",
            isDeleting: false
        });
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteModal.receptionistId) return;

        setDeleteModal(prev => ({ ...prev, isDeleting: true }));

        try {
            const response = await adminUserService.deleteUser("Receptionist", deleteModal.receptionistId);
            
            if (response.success) {
                setRows(prev => prev.filter(row => row._id !== deleteModal.receptionistId));
                toast.success("Receptionist deleted successfully!");
                setDeleteModal({ isOpen: false, receptionistId: null, receptionistName: "", isDeleting: false });
            } else {
                toast.error(response.message || "Failed to delete receptionist");
                setDeleteModal(prev => ({ ...prev, isDeleting: false }));
            }
        } catch (error) {
            console.error("Error deleting receptionist:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error deleting receptionist";
            toast.error(errorMessage);
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
        }
    }, [deleteModal.receptionistId]);

    const handleDeleteClose = useCallback(() => {
        if (!deleteModal.isDeleting) {
            setDeleteModal({ isOpen: false, receptionistId: null, receptionistName: "", isDeleting: false });
        }
    }, [deleteModal.isDeleting]);

    // ===== TABLE COLUMNS =====
    const columns = [
        { field: "name", header: "Name" },
        { field: "position", header: "Position" },
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
            onClick: (row) => navigate(`/admin/receptionists/view/${row._id}`)
        },
        {
            label: "Edit",
            icon: <Edit />,
            color: "var(--color-icon-2)",
            onClick: (row) => navigate(`/admin/receptionists/edit/${row._id}`)
        },
        {
            label: "Delete",
            icon: <Trash2 />,
            color: "var(--color-icon-1)",
            onClick: (row) => handleDeleteClick(row)
        }
    ];

    const [searchText, setSearchText] = useState("");

    return (
        <div className="space-y-6 p-6">
            <HeadingCard
                title="Receptionists"
                subtitle="View and manage all receptionists working at the front office."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Receptionists" }
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
                        rows={rows}
                        columns={columns}
                        fileName="receptionists.xlsx"
                    />
                    <RedirectButton text="Create" link="/admin/receptionists/add" />
                </div>
            </CardBorder>

            <TableComponent
                columns={columns}
                rows={rows}
                actions={actions}
                showStatusBadge={true}
                statusField="status"
                isLoading={isLoading}
            />

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteClose}
                onConfirm={handleDeleteConfirm}
                title="Delete Receptionist"
                message={`Are you sure you want to delete ${deleteModal.receptionistName}? This action cannot be undone.`}
                isDeleting={deleteModal.isDeleting}
            />
        </div>
    );
}

export default Receptionists;
