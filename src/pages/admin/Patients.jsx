import { useState, useEffect, useCallback, useRef } from "react";
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

const SEARCH_DEBOUNCE_MS = 350;

function Patients() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [searchInput, setSearchInput] = useState(""); // immediate input value
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 25,
        total: 0,
    });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        patientId: null,
        patientName: "",
        isDeleting: false
    });
    const lastSearchRef = useRef(searchText);

    // Debounce search input -> searchText (used for API)
    useEffect(() => {
        const t = setTimeout(() => {
            setSearchText(searchInput.trim());
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Fetch patients from backend with server-side pagination and search
    const fetchPatients = useCallback(async (pageOverride = null) => {
        setIsLoading(true);
        const page = pageOverride !== null ? pageOverride : pagination.page;
        try {
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: pagination.rowsPerPage.toString(),
            });
            if (searchText) {
                params.append("search", searchText);
            }

            const url = getApiUrl(`patients?${params.toString()}`);
            const response = await fetch(url, {
                method: "GET",
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error("Failed to fetch patients");
            }

            const data = await response.json();
            if (data.success && data.data) {
                let transformedPatients = data.data.profiles?.map((profile) => ({
                    _id: profile._id,
                    name: profile.user?.name || "N/A",
                    mobile: profile.user?.phone || "N/A",
                    email: profile.user?.email || "N/A",
                    status: profile.admissionStatus === "Not Admitted" ? "Active" : profile.admissionStatus || "Active",
                    patientId: profile.patientId,
                    dateOfBirth: profile.dateOfBirth,
                    admissionStatus: profile.admissionStatus,
                    treatmentStatus: profile.treatmentStatus,
                    createdAt: profile.createdAt || profile.user?.createdAt || new Date(),
                    updatedAt: profile.updatedAt || profile.user?.updatedAt || new Date(),
                })) || [];

                setRows(transformedPatients);
                setPagination(prev => ({
                    ...prev,
                    page,
                    total: data.data.total ?? transformedPatients.length,
                }));
            } else {
                toast.error(data.message || "Failed to fetch patients");
                setRows([]);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
            toast.error(error.message || "Failed to fetch patients");
            setRows([]);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.rowsPerPage, searchText]);

    // When searchText or pagination changes: if search just changed, reset to page 0 and fetch immediately; else fetch with current page
    useEffect(() => {
        if (lastSearchRef.current !== searchText) {
            lastSearchRef.current = searchText;
            setPagination(prev => ({ ...prev, page: 0 }));
            fetchPatients(0);
            return;
        }
        fetchPatients();
    }, [searchText, pagination.page, pagination.rowsPerPage, fetchPatients]);

    // ===== TABLE COLUMNS =====
    const columns = [
        { field: "name", header: "Name" },
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
                toast.success("Patient deleted successfully!");
                setDeleteModal({ isOpen: false, patientId: null, patientName: "", isDeleting: false });
                // Refresh current page data
                fetchPatients();
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

    // Handle pagination changes
    const handlePageChange = useCallback((newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    }, []);

    const handleRowsPerPageChange = useCallback((newRowsPerPage) => {
        setPagination(prev => ({ ...prev, rowsPerPage: newRowsPerPage, page: 0 }));
    }, []);

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
                        value={searchInput}
                        onChange={(val) => setSearchInput(val)}
                        placeholder="Search by name, mobile, email..."
                        style={{ flex: 1 }}
                    />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={rows}
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
                    rows={rows}
                    actions={actions}
                    showStatusBadge={true}
                    statusField="status"
                    serverSidePagination={true}
                    totalCount={pagination.total}
                    page={pagination.page}
                    rowsPerPage={pagination.rowsPerPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
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
