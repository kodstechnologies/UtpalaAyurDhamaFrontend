import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

function Entry_Exit() {
    const [search, setSearch] = useState("");
    const [records, setRecords] = useState([
        {
            id: 1,
            patientName: "John Doe",
            therapistNames: ["Dr. Meena"],
            entryTime: "2024-05-21T10:00:00",
            exitTime: null,
            status: "Entered",
        },
        {
            id: 2,
            patientName: "Jane Smith",
            therapistNames: ["Dr. Rohan", "Dr. Priya"],
            entryTime: "2024-05-21T09:30:00",
            exitTime: "2024-05-21T10:15:00",
            status: "Exited",
        },
        {
            id: 3,
            patientName: "Peter Pan",
            therapistNames: ["Dr. Amit"],
            entryTime: "2024-05-21T11:00:00",
            exitTime: null,
            status: "Entered",
        },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [hoveredButton, setHoveredButton] = useState(null);

    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Therapist", url: "/therapist" },
        { label: "Entry & Exit" },
    ];

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredRecords = useMemo(() => {
        if (!search) return records;
        const searchLower = search.toLowerCase();
        return records.filter(
            (r) =>
                r.patientName.toLowerCase().includes(searchLower) ||
                r.therapistNames.some((name) => name.toLowerCase().includes(searchLower))
        );
    }, [records, search]);

    const handleMarkExit = (record) => {
        setRecords((prevRecords) =>
            prevRecords.map((r) =>
                r.id === record.id
                    ? { ...r, exitTime: new Date().toISOString(), status: "Exited" }
                    : r
            )
        );
    };

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

    const handleSaveEntry = (formData) => {
        if (editingRecord) {
            setRecords((prev) =>
                prev.map((r) =>
                    r.id === editingRecord.id
                        ? {
                              ...r,
                              ...formData,
                              entryTime: formData.entryTime ? new Date(formData.entryTime).toISOString() : r.entryTime,
                          }
                        : r
                )
            );
            setIsEditModalOpen(false);
            setEditingRecord(null);
        } else {
            const newRecord = {
                id: Date.now(),
                ...formData,
                entryTime: formData.entryTime ? new Date(formData.entryTime).toISOString() : new Date().toISOString(),
                status: "Entered",
            };
            setRecords((prev) => [...prev, newRecord]);
            setIsAddModalOpen(false);
        }
    };

    return (
        <Box sx={{ padding: "20px" }}>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Page Heading */}
            <HeadingCardingCard
                category="ENTRY & EXIT"
                title="Patient Entry & Exit Tracking"
                subtitle="Track patient entry and exit times for therapy sessions"
                action={
                    <button
                        className="btn"
                        onClick={() => setIsAddModalOpen(true)}
                        style={{
                            backgroundColor: "#059669",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <AddIcon fontSize="small" />
                        Add Entry
                    </button>
                }
            />

            {/* Entry/Exit Table */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="card-title mb-0">Entry & Exit Records</h5>
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
                                        placeholder="Search Patient or Therapist..."
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
                                            <th style={{ fontSize: "0.875rem" }}>Therapists</th>
                                            <th style={{ fontSize: "0.875rem" }}>Entry Time</th>
                                            <th style={{ fontSize: "0.875rem" }}>Exit Time</th>
                                            <th style={{ fontSize: "0.875rem" }}>Status</th>
                                            <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRecords.map((record, index) => (
                                            <tr key={record.id}>
                                                <td style={{ fontSize: "0.875rem" }}>{index + 1}</td>
                                                <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                    {record.patientName}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {record.therapistNames.map((name) => (
                                                            <span
                                                                key={name}
                                                                className="badge"
                                                                style={{
                                                                    backgroundColor: "#d1fae5",
                                                                    color: "#059669",
                                                                    borderRadius: "50px",
                                                                    padding: "4px 10px",
                                                                    fontSize: "0.75rem",
                                                                }}
                                                            >
                                                                {name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <AccessTimeIcon fontSize="small" />
                                                        {formatDateTime(record.entryTime)}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {record.exitTime ? (
                                                        <div className="d-flex align-items-center gap-1">
                                                            <AccessTimeIcon fontSize="small" />
                                                            {formatDateTime(record.exitTime)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <span
                                                        className={`badge ${
                                                            record.status === "Entered" ? "bg-success" : "bg-danger"
                                                        }`}
                                                        style={{
                                                            borderRadius: "50px",
                                                            padding: "4px 10px",
                                                            fontSize: "0.75rem",
                                                        }}
                                                    >
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        {record.status === "Entered" && (
                                                            <div style={{ position: "relative", display: "inline-block" }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleMarkExit(record)}
                                                                    onMouseEnter={() => setHoveredButton(`exit-${record.id}`)}
                                                                    onMouseLeave={() => setHoveredButton(null)}
                                                                    style={{
                                                                        backgroundColor: "#059669",
                                                                        borderColor: "#059669",
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
                                                                    <ExitToAppIcon fontSize="small" />
                                                                </button>
                                                                {hoveredButton === `exit-${record.id}` && (
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
                                                                        Mark Exit
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
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
                                                                    Edit
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
                                <p className="text-muted">No records found. Try adjusting your search query.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Box>

            {/* Add/Edit Entry Modal */}
            {(isAddModalOpen || isEditModalOpen) && (
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
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ margin: "auto", maxWidth: "600px" }}>
                        <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                            <div className="modal-header" style={{ flexShrink: 0 }}>
                                <h5 className="modal-title">
                                    {isEditModalOpen ? "Edit Entry" : "Add New Entry"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setIsEditModalOpen(false);
                                        setEditingRecord(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                                <p className="text-muted">Modal form implementation would go here. For now, this is a placeholder.</p>
                                <p className="text-muted">In a full implementation, this would include fields for patient selection, therapist selection, and entry time.</p>
                            </div>
                            <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6" }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
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
                                        // Placeholder save logic
                                        handleSaveEntry({});
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
                                <p>Are you sure you want to delete this entry record?</p>
                                {recordToDelete && (
                                    <p className="text-muted">
                                        <strong>Patient:</strong> {recordToDelete.patientName}
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

export default Entry_Exit;

