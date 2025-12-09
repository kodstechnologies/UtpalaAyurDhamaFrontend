import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PersonIcon from "@mui/icons-material/Person";
import SpaIcon from "@mui/icons-material/Spa";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

function Treatment_Details() {
    const [search, setSearch] = useState("");
    const [records, setRecords] = useState([
        {
            id: "1",
            patientName: "Sumitra Devi",
            therapyName: "Shirodhara",
            cost: 2500,
            duration: "45 mins",
        },
        {
            id: "2",
            patientName: "Rajesh Kumar",
            therapyName: "Abhyangam",
            cost: 3000,
            duration: "60 mins",
        },
        {
            id: "3",
            patientName: "Anil Gupta",
            therapyName: "Pizhichil",
            cost: 4000,
            duration: "50 mins",
        },
        {
            id: "4",
            patientName: "Meera Desai",
            therapyName: "Shirodhara",
            cost: 2500,
            duration: "45 mins",
        },
        {
            id: "5",
            patientName: "Vijay Rathod",
            therapyName: "Abhyangam",
            cost: 3000,
            duration: "60 mins",
        },
    ]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [hoveredButton, setHoveredButton] = useState(null);

    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Therapist", url: "/therapist" },
        { label: "Treatment Details" },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const filteredRecords = useMemo(() => {
        if (!search) return records;
        const searchLower = search.toLowerCase();
        return records.filter(
            (r) =>
                r.therapyName.toLowerCase().includes(searchLower) ||
                r.patientName.toLowerCase().includes(searchLower)
        );
    }, [records, search]);

    const handleEdit = (record) => {
        setEditingRecord(record);
        setIsEditModalOpen(true);
    };

    const handleDelete = (record) => {
        setRecordToDelete(record);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (recordToDelete) {
            setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
        }
        setIsDeleteModalOpen(false);
        setRecordToDelete(null);
    };

    const handleExportData = () => {
        if (filteredRecords.length === 0) return;
        // Placeholder for export functionality
        console.log("Export data:", filteredRecords);
        alert("Export functionality would be implemented here. Data prepared for export.");
    };

    const handleSaveEdit = (formData) => {
        if (editingRecord) {
            setRecords((prev) =>
                prev.map((r) =>
                    r.id === editingRecord.id
                        ? { ...r, duration: formData.duration || r.duration }
                        : r
                )
            );
            setIsEditModalOpen(false);
            setEditingRecord(null);
        }
    };

    return (
        <Box sx={{ padding: "20px" }}>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Page Heading */}
            <HeadingCardingCard
                category="TREATMENT DETAILS"
                title="Therapy Assignment Details"
                subtitle="View and manage therapy assignments, durations, and costs"
            />

            {/* Treatment Details Table */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="card-title mb-0">Therapy Assignments</h5>
                            <button
                                className="btn"
                                onClick={handleExportData}
                                disabled={filteredRecords.length === 0}
                                style={{
                                    backgroundColor: "#059669",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    fontWeight: 500,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    opacity: filteredRecords.length === 0 ? 0.5 : 1,
                                }}
                            >
                                <DownloadIcon fontSize="small" />
                                Export Data
                            </button>
                        </div>

                        {/* Search */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <SearchIcon />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search Patient or Therapy..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {filteredRecords.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th style={{ fontSize: "0.875rem" }}>Sl. No.</th>
                                            <th style={{ fontSize: "0.875rem" }}>Patient Name</th>
                                            <th style={{ fontSize: "0.875rem" }}>Therapy Type</th>
                                            <th style={{ fontSize: "0.875rem" }}>Cost</th>
                                            <th style={{ fontSize: "0.875rem" }}>Duration/Time</th>
                                            <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRecords.map((record, index) => (
                                            <tr key={record.id}>
                                                <td style={{ fontSize: "0.875rem" }}>{index + 1}</td>
                                                <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <PersonIcon fontSize="small" style={{ color: "#6c757d" }} />
                                                        {record.patientName}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <SpaIcon fontSize="small" style={{ color: "#059669" }} />
                                                        {record.therapyName}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <AttachMoneyIcon fontSize="small" style={{ color: "#059669" }} />
                                                        {formatCurrency(record.cost)}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <AccessTimeIcon fontSize="small" style={{ color: "#6c757d" }} />
                                                        {record.duration || "N/A"}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <div style={{ position: "relative", display: "inline-block" }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm"
                                                                onClick={() => handleEdit(record)}
                                                                onMouseEnter={() => setHoveredButton(`edit-${record.id}`)}
                                                                onMouseLeave={() => setHoveredButton(null)}
                                                                style={{
                                                                    backgroundColor: "#D4A574",
                                                                    borderColor: "#D4A574",
                                                                    color: "#000",
                                                                    borderRadius: "8px",
                                                                    padding: "6px 8px",
                                                                    fontWeight: 500,
                                                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                    transition: "all 0.3s ease",
                                                                    minWidth: "40px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </button>
                                                            {hoveredButton === `edit-${record.id}` && (
                                                                <div
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: "-35px",
                                                                        left: "50%",
                                                                        transform: "translateX(-50%)",
                                                                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                                                                        color: "white",
                                                                        padding: "4px 8px",
                                                                        borderRadius: "4px",
                                                                        whiteSpace: "nowrap",
                                                                        zIndex: 1000,
                                                                        pointerEvents: "none",
                                                                    }}
                                                                >
                                                                    Edit Duration
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div style={{ position: "relative", display: "inline-block" }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm"
                                                                onClick={() => handleDelete(record)}
                                                                onMouseEnter={() => setHoveredButton(`delete-${record.id}`)}
                                                                onMouseLeave={() => setHoveredButton(null)}
                                                                style={{
                                                                    backgroundColor: "#dc3545",
                                                                    borderColor: "#dc3545",
                                                                    color: "white",
                                                                    borderRadius: "8px",
                                                                    padding: "6px 8px",
                                                                    fontWeight: 500,
                                                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                    transition: "all 0.3s ease",
                                                                    minWidth: "40px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </button>
                                                            {hoveredButton === `delete-${record.id}` && (
                                                                <div
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: "-35px",
                                                                        left: "50%",
                                                                        transform: "translateX(-50%)",
                                                                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                                                                        color: "white",
                                                                        padding: "4px 8px",
                                                                        borderRadius: "4px",
                                                                        whiteSpace: "nowrap",
                                                                        zIndex: 1000,
                                                                        pointerEvents: "none",
                                                                    }}
                                                                >
                                                                    Delete
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <p className="text-muted">No treatment details found. Try adjusting your search query.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Box>

            {/* Edit Duration Modal */}
            {isEditModalOpen && editingRecord && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        overflowY: "auto",
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ margin: "auto", maxWidth: "500px" }}>
                        <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                            <div className="modal-header" style={{ flexShrink: 0 }}>
                                <h5 className="modal-title">
                                    Duration for {editingRecord.patientName}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingRecord(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                                <div className="mb-3">
                                    <label className="form-label">Patient</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingRecord.patientName}
                                        disabled
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Therapy Type</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingRecord.therapyName}
                                        disabled
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Duration/Time</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        defaultValue={editingRecord.duration}
                                        placeholder="e.g., 45 mins"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6" }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingRecord(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        const durationInput = document.querySelector('.modal-body input[type="text"]:not([disabled])');
                                        handleSaveEdit({ duration: durationInput?.value || editingRecord.duration });
                                    }}
                                    style={{
                                        backgroundColor: "#059669",
                                        borderColor: "#059669",
                                    }}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered" style={{ margin: "auto", maxWidth: "500px" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setRecordToDelete(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this treatment detail?</p>
                                {recordToDelete && (
                                    <p className="text-muted">
                                        <strong>Patient:</strong> {recordToDelete.patientName}<br />
                                        <strong>Therapy:</strong> {recordToDelete.therapyName}
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setRecordToDelete(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleConfirmDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Box>
    );
}

export default Treatment_Details;

