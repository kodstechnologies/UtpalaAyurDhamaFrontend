import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, Trash2 } from "lucide-react";

import HeadingCard from "../../components/card/HeadingCard";
import TableComponent from "../../components/table/TableComponent";
import CardBorder from "../../components/card/CardBorder";
import Search from "../../components/search/Search";
import ExportDataButton from "../../components/buttons/ExportDataButton";
import DeleteConfirmationModal from "../../components/modal/DeleteConfirmationModal";
import { getApiUrl, getAuthHeaders } from "../../config/api";

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

function Patients() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        patientId: null,
        patientName: "",
        isDeleting: false
    });

    // Fetch patients from backend
    const fetchPatients = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(getApiUrl("patients"), {
                method: "GET",
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error("Failed to fetch patients");
            }

            const data = await response.json();
            if (data.success && data.data) {
                // Transform the data to match table structure
                const transformedPatients = data.data.profiles?.map((profile) => ({
                    _id: profile._id,
                    name: profile.user?.name || "N/A",
                    age: calculateAge(profile.dateOfBirth),
                    mobile: profile.user?.phone || "N/A",
                    email: profile.user?.email || "N/A",
                    status: profile.admissionStatus === "Not Admitted" ? "Active" : profile.admissionStatus || "Active",
                    patientId: profile.patientId,
                    dateOfBirth: profile.dateOfBirth,
                    admissionStatus: profile.admissionStatus,
                    treatmentStatus: profile.treatmentStatus,
                })) || [];
                setRows(transformedPatients);
            } else {
                toast.error(data.message || "Failed to fetch patients");
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
            toast.error(error.message || "Failed to fetch patients");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // ===== TABLE COLUMNS =====
    const columns = [
        { field: "name", header: "Name" },
        { field: "age", header: "Age" },
        { field: "mobile", header: "Mobile" },
        { field: "email", header: "Email" },
        { field: "status", header: "Status" },
    ];

    // ===== DELETE HANDLERS =====
    const handleDeleteClick = useCallback((row) => {
        setDeleteModal({
            isOpen: true,
            patientId: row._id,
            patientName: row.name || "this patient",
            isDeleting: false
        });
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteModal.patientId) return;

        setDeleteModal(prev => ({ ...prev, isDeleting: true }));

        try {
            const response = await fetch(getApiUrl(`patients/${deleteModal.patientId}`), {
                method: "DELETE",
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to delete patient");
            }

            const data = await response.json();
            if (data.success) {
                setRows(prev => prev.filter(row => row._id !== deleteModal.patientId));
                toast.success("Patient deleted successfully!");
                setDeleteModal({ isOpen: false, patientId: null, patientName: "", isDeleting: false });
            } else {
                toast.error(data.message || "Failed to delete patient");
                setDeleteModal(prev => ({ ...prev, isDeleting: false }));
            }
        } catch (error) {
            console.error("Error deleting patient:", error);
            toast.error(error.message || "Failed to delete patient");
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
        }
    }, [deleteModal.patientId, deleteModal.patientName]);

    const handleDeleteClose = useCallback(() => {
        if (!deleteModal.isDeleting) {
            setDeleteModal({ isOpen: false, patientId: null, patientName: "", isDeleting: false });
        }
    }, [deleteModal.isDeleting]);

    // ===== ACTION BUTTONS =====
    const actions = [
        {
            label: "View",
            icon: <Eye />,
            color: "var(--color-icon-3)",
            onClick: (row) => navigate(`/admin/patients/view/${row._id}`)
        },
        {
            label: "Delete",
            icon: <Trash2 />,
            color: "var(--color-icon-1)",
            onClick: (row) => handleDeleteClick(row)
        }
    ];

    // Filter rows based on search text
    const filteredRows = rows.filter((row) => {
        if (!searchText) return true;
        const searchLower = searchText.toLowerCase();
        return (
            row.name?.toLowerCase().includes(searchLower) ||
            row.email?.toLowerCase().includes(searchLower) ||
            row.mobile?.toLowerCase().includes(searchLower) ||
            row.patientId?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6 p-6">
            <HeadingCard
                title="Patients"
                subtitle="View and manage all registered patients and their basic details."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Patients" }
                ]}
            />

            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
            >
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
                        fileName="patients.xlsx"
                    />
                </div>
            </CardBorder>

            {isLoading ? (
                <div className="flex justify-center items-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
                        style={{ borderColor: "var(--color-btn-b)", borderBottomColor: "transparent" }}></div>
                </div>
            ) : (
                <TableComponent
                    columns={columns}
                    rows={filteredRows}
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
                title={deleteModal.patientName}
                itemType="patient"
                isLoading={deleteModal.isDeleting}
            />
        </div>
    );
}

export default Patients;
