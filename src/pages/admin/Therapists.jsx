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

function Therapists() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        therapistId: null,
        therapistName: "",
        isDeleting: false
    });

    const fetchTherapists = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await adminUserService.getAllUsers("Therapist");
            
            if (response && response.success) {
                // Handle the actual response structure
                let data = response.data;
                
                // If data is an object with a 'therapists' property, extract the therapists array
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    if (data.therapists && Array.isArray(data.therapists)) {
                        data = data.therapists;
                    } else if (data.data && Array.isArray(data.data)) {
                        // Fallback for other paginated structures
                        data = data.data;
                    }
                }
                
                // Ensure data is always an array and normalize the structure
                const rowsData = Array.isArray(data) ? data : [];
                
                // Normalize data structure - ensure _id exists and flatten user data if needed
                const normalizedRows = rowsData.map((row) => {
                    // If user data is nested, flatten it
                    if (row.user && typeof row.user === 'object') {
                        return {
                            ...row,
                            _id: row._id || row.id || row.user._id || row.user.id,
                            name: row.name || row.user.name || '',
                            email: row.email || row.user.email || '',
                            phone: row.phone || row.user.phone || '',
                            specialization: row.specialization || row.speciality || '',
                            department: row.department || '',
                            status: row.status || row.user?.status || 'Active',
                            // Keep other fields as they are
                        };
                    }
                    // Ensure _id exists and map fields correctly
                    return {
                        ...row,
                        _id: row._id || row.id,
                        name: row.name || '',
                        email: row.email || '',
                        phone: row.phone || '',
                        specialization: row.specialization || row.speciality || '',
                        department: row.department || '',
                        status: row.status || 'Active',
                    };
                });
                
                setRows(normalizedRows);
            } else {
                toast.error(response?.message || "Failed to fetch therapists");
                setRows([]); // Set empty array on error
            }
        } catch (error) {
            console.error("Error fetching therapists:", error);
            
            // Handle different error structures
            let errorMessage = "Failed to fetch therapists";
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            toast.error(errorMessage);
            setRows([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTherapists();
    }, [fetchTherapists]);

    // DELETE FUNCTION
    const handleDeleteClick = useCallback((row) => {
        setDeleteModal({
            isOpen: true,
            therapistId: row._id,
            therapistName: row.name || "this therapist",
            isDeleting: false
        });
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteModal.therapistId) return;

        setDeleteModal(prev => ({ ...prev, isDeleting: true }));

        try {
            const response = await adminUserService.deleteUser("Therapist", deleteModal.therapistId);
            
            if (response.success) {
                setRows(prev => prev.filter(row => row._id !== deleteModal.therapistId));
                toast.success("Therapist deleted successfully!");
                setDeleteModal({ isOpen: false, therapistId: null, therapistName: "", isDeleting: false });
            } else {
                toast.error(response.message || "Failed to delete therapist");
                setDeleteModal(prev => ({ ...prev, isDeleting: false }));
            }
        } catch (error) {
            console.error("Error deleting therapist:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error deleting therapist";
            toast.error(errorMessage);
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
        }
    }, [deleteModal.therapistId]);

    const handleDeleteClose = useCallback(() => {
        if (!deleteModal.isDeleting) {
            setDeleteModal({ isOpen: false, therapistId: null, therapistName: "", isDeleting: false });
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
            onClick: (row) => navigate(`/admin/therapists/view/${row._id}`)
        },
        {
            label: "Edit",
            icon: <Edit />,
            color: "var(--color-icon-2)",
            onClick: (row) => navigate(`/admin/therapists/edit/${row._id}`)
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
                title="Therapists"
                subtitle="View and manage all therapy specialists across different departments."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Therapists" }
                ]}
            />

            <CardBorder justify="between" align="center" wrap={true} padding="2rem">
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={setSearchText}
                        style={{ flex: 1 }}
                    />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="therapists.xlsx"
                    />
                    <RedirectButton text="Create" link="/admin/therapists/add" />
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
                title="Delete Therapist"
                message={`Are you sure you want to delete ${deleteModal.therapistName}? This action cannot be undone.`}
                isDeleting={deleteModal.isDeleting}
            />
        </div>
    );
}

export default Therapists;

            label: "Delete",
            icon: <Trash2 />,
            color: "var(--color-icon-1)",
            onClick: (row) => handleDeleteClick(row)
        }
    ];

    return (
        <div className="space-y-6 p-6">
            <HeadingCard
                title="Therapists"
                subtitle="View and manage all therapy specialists across different departments."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Therapists" }
                ]}
            />

            <CardBorder justify="between" align="center" wrap={true} padding="2rem">
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={setSearchText}
                        style={{ flex: 1 }}
                    />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="therapists.xlsx"
                    />
                    <RedirectButton text="Create" link="/admin/therapists/add" />
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
                title="Delete Therapist"
                message={`Are you sure you want to delete ${deleteModal.therapistName}? This action cannot be undone.`}
                isDeleting={deleteModal.isDeleting}
            />
        </div>
    );
}

export default Therapists;
