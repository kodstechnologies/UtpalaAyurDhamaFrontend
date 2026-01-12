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

function Doctors() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        doctorId: null,
        doctorName: "",
        isDeleting: false
    });

    const fetchDoctors = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await adminUserService.getAllUsers("Doctor");
            if (response.success) {
                setRows(response.data || []);
            } else {
                toast.error(response.message || "Failed to fetch doctors");
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
            toast.error(error.message || "Failed to fetch doctors");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    // DELETE FUNCTION
    const handleDeleteClick = useCallback((row) => {
        setDeleteModal({
            isOpen: true,
            doctorId: row._id,
            doctorName: row.name || "this doctor",
            isDeleting: false
        });
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteModal.doctorId) return;

        setDeleteModal(prev => ({ ...prev, isDeleting: true }));

        try {
            const response = await adminUserService.deleteUser("Doctor", deleteModal.doctorId);
            
            if (response.success) {
                setRows(prev => prev.filter(row => row._id !== deleteModal.doctorId));
                toast.success("Doctor deleted successfully!");
                setDeleteModal({ isOpen: false, doctorId: null, doctorName: "", isDeleting: false });
            } else {
                toast.error(response.message || "Failed to delete doctor");
                setDeleteModal(prev => ({ ...prev, isDeleting: false }));
            }
        } catch (error) {
            console.error("Error deleting doctor:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error deleting doctor";
            toast.error(errorMessage);
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
        }
    }, [deleteModal.doctorId]);

    const handleDeleteClose = useCallback(() => {
        if (!deleteModal.isDeleting) {
            setDeleteModal({ isOpen: false, doctorId: null, doctorName: "", isDeleting: false });
        }
    }, [deleteModal.isDeleting]);

    // TABLE COLUMNS
    const columns = [
        { field: "name", header: "Doctor Name" },
        { field: "email", header: "Email" },
        { field: "specialization", header: "Specialization" },
        { field: "status", header: "Status" }
    ];

    // ACTION BUTTONS
    const actions = [
        {
            label: "View",
            icon: <Eye />,
            color: "var(--color-icon-3)",
            onClick: (row) => navigate(`/admin/doctors/view/${row._id}`)
        },
        {
            label: "Edit",
            icon: <Edit />,
            color: "var(--color-icon-2)",
            onClick: (row) => navigate(`/admin/doctors/edit/${row._id}`)
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
                title="Doctors Management"
                subtitle="Manage all registered doctors"
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Doctors" }
                ]}
            />

            {/* SEARCH + EXPORT + CREATE */}
            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{ width: "100%" }}
            >

                {/* LEFT SIDE — Search */}
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ width: "100%" }}
                    />
                </div>

                {/* RIGHT SIDE — Export + Create Buttons */}
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={rows}
                        columns={columns}
                        fileName="doctors.xlsx"
                    />
                    <RedirectButton text="Create" link="/admin/doctors/add" />
                </div>

            </CardBorder>

            {/* DOCTORS TABLE */}
            {isLoading ? (
                <div className="flex justify-center items-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
                        style={{ borderColor: "var(--color-btn-b)", borderBottomColor: "transparent" }}></div>
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
                title={deleteModal.doctorName}
                itemType="doctor"
                isLoading={deleteModal.isDeleting}
            />
        </div>
    );
}

export default Doctors;
