import React, { useState, useCallback, useEffect } from "react";
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

function Nursing() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        nurseId: null,
        nurseName: "",
        isDeleting: false
    });

    const fetchNurses = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await adminUserService.getAllUsers("Nurse");
            
            if (response && response.success) {
                // Handle the actual response structure: { data: { nurses: [...], total, page, limit, totalPages } }
                let data = response.data;
                
                // If data is an object with a 'nurses' property, extract the nurses array
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    if (data.nurses && Array.isArray(data.nurses)) {
                        data = data.nurses;
                    } else if (data.data && Array.isArray(data.data)) {
                        // Fallback for other paginated structures
                        data = data.data;
                    }
                }
                
                // Ensure data is always an array
                const rowsData = Array.isArray(data) ? data : [];
                setRows(rowsData);
            } else {
                toast.error(response?.message || "Failed to fetch nurses");
                setRows([]); // Set empty array on error
            }
        } catch (error) {
            console.error("Error fetching nurses:", error);
            
            // Handle different error structures
            let errorMessage = "Failed to fetch nurses";
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.response?.data) {
                // If error.response.data is the ApiResponse object
                if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                }
            }
            
            toast.error(errorMessage);
            setRows([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNurses();
    }, [fetchNurses]);

    // DELETE FUNCTION
    const handleDeleteClick = useCallback((row) => {
        setDeleteModal({
            isOpen: true,
            nurseId: row._id,
            nurseName: row.name || "this nurse",
            isDeleting: false
        });
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteModal.nurseId) return;

        setDeleteModal(prev => ({ ...prev, isDeleting: true }));

        try {
            const response = await adminUserService.deleteUser("Nurse", deleteModal.nurseId);
            
            if (response.success) {
                setRows(prev => prev.filter(row => row._id !== deleteModal.nurseId));
                toast.success("Nurse deleted successfully!");
                setDeleteModal({ isOpen: false, nurseId: null, nurseName: "", isDeleting: false });
            } else {
                toast.error(response.message || "Failed to delete nurse");
                setDeleteModal(prev => ({ ...prev, isDeleting: false }));
            }
        } catch (error) {
            console.error("Error deleting nurse:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error deleting nurse";
            toast.error(errorMessage);
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
        }
    }, [deleteModal.nurseId]);

    const handleDeleteClose = useCallback(() => {
        if (!deleteModal.isDeleting) {
            setDeleteModal({ isOpen: false, nurseId: null, nurseName: "", isDeleting: false });
        }
    }, [deleteModal.isDeleting]);

    const columns = [
        { field: "name", header: "Name" },
        { field: "specialty", header: "Specialty" },
        { field: "department", header: "Unit/Ward" }, // Changed from "unit" to "department"
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
            onClick: (row) => navigate(`/admin/nursing/view/${row._id}`)
        },
        {
            label: "Edit",
            icon: <Edit />,
            color: "var(--color-icon-2)",
            onClick: (row) => navigate(`/admin/nursing/edit/${row._id}`)
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
                title="Nursing Staff"
                subtitle="View and manage all nurses working across different departments."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Nursing" }
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
                        fileName="nursing.xlsx"
                    />
                    <RedirectButton text="create" link="/admin/nursing/add" />
                </div>
            </CardBorder>

            {isLoading ? (
                <div className="flex justify-center items-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
                        style={{ borderColor: "var(--color-btn-b)", borderBottomColor: "transparent" }}></div>
                </div>
            ) : rows.length === 0 ? (
                <div className="flex flex-col justify-center items-center p-20">
                    <p style={{ fontSize: "1.1rem", color: "var(--color-text-b)", marginBottom: "1rem" }}>
                        No nurses found
                    </p>
                    <RedirectButton text="Create First Nurse" link="/admin/nursing/add" />
                </div>
            ) : (
                <TableComponent
                    columns={columns}
                    rows={rows}
                    actions={actions}
                    showStatusBadge={true}
                    statusField="status"
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteClose}
                onConfirm={handleDeleteConfirm}
                title={deleteModal.nurseName}
                itemType="nurse"
                isLoading={deleteModal.isDeleting}
            />
        </div>
    );
}

export default Nursing;
