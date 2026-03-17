import { useState, useEffect, useCallback } from "react";
import { Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import { toast } from "react-toastify";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import SpaIcon from "@mui/icons-material/Spa";

// ────────────────────────────────────────────────────────────────────────────────
// Delete Confirmation Modal
// ────────────────────────────────────────────────────────────────────────────────
function DeleteModal({ item, onConfirm, onCancel, isDeleting }) {
  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.45)" }}
      onClick={onCancel}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content" style={{ borderRadius: "16px" }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-danger">Delete Sub Therapy</h5>
            <button className="btn-close" onClick={onCancel} disabled={isDeleting} />
          </div>
          <div className="modal-body">
            <p>Are you sure you want to delete <strong>{item?.name}</strong>? This action cannot be undone.</p>
          </div>
          <div className="modal-footer border-0">
            <button className="btn btn-outline-secondary" onClick={onCancel} disabled={isDeleting}>Cancel</button>
            <button className="btn btn-danger" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting ? <span className="spinner-border spinner-border-sm me-1" /> : <DeleteIcon fontSize="small" className="me-1" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Add / Edit Modal  (only Name + Description)
// ────────────────────────────────────────────────────────────────────────────────
function SubTherapyFormModal({ mode, initialData, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    onSave(form);
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.45)" }}
      onClick={onCancel}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content" style={{ borderRadius: "16px" }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {mode === "add" ? "Add Sub Therapy" : "Edit Sub Therapy"}
            </h5>
            <button className="btn-close" onClick={onCancel} disabled={isSaving} />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Nasyam"
                  disabled={isSaving}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief description of this sub-therapy"
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={isSaving}>Cancel</button>
              <button
                type="submit"
                className="btn"
                style={{ backgroundColor: "var(--color-bg-table-button, #8B4513)", color: "white", fontWeight: 600 }}
                disabled={isSaving}
              >
                {isSaving && <span className="spinner-border spinner-border-sm me-1" />}
                {mode === "add" ? "Create" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────────────
function SubTherapyView() {
  const [subTherapies, setSubTherapies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ type: null, item: null });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const breadcrumbItems = [
    { label: "Home", url: "/" },
    { label: "Receptionist", url: "/receptionist/dashboard" },
    { label: "Sub Therapies" },
  ];

  const fetchSubTherapies = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(getApiUrl("sub-therapies"), {
        headers: getAuthHeaders(),
        params: { search, limit: 200 },
      });
      if (res.data?.success) setSubTherapies(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load sub-therapies");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchSubTherapies(); }, [fetchSubTherapies]);

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      if (modal.type === "add") {
        const res = await axios.post(getApiUrl("sub-therapies"), formData, { headers: getAuthHeaders() });
        if (res.data?.success) {
          toast.success("Sub-therapy created!");
          setModal({ type: null, item: null });
          fetchSubTherapies();
        }
      } else {
        const res = await axios.patch(getApiUrl(`sub-therapies/${modal.item._id}`), formData, { headers: getAuthHeaders() });
        if (res.data?.success) {
          toast.success("Sub-therapy updated!");
          setModal({ type: null, item: null });
          fetchSubTherapies();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save sub-therapy");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await axios.delete(getApiUrl(`sub-therapies/${modal.item._id}`), { headers: getAuthHeaders() });
      if (res.data?.success) {
        toast.success("Sub-therapy deleted!");
        setModal({ type: null, item: null });
        fetchSubTherapies();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete sub-therapy");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ padding: "20px" }}>
      {(modal.type === "add" || modal.type === "edit") && (
        <SubTherapyFormModal
          mode={modal.type}
          initialData={modal.item}
          onSave={handleSave}
          onCancel={() => !isSaving && setModal({ type: null, item: null })}
          isSaving={isSaving}
        />
      )}
      {modal.type === "delete" && (
        <DeleteModal
          item={modal.item}
          onConfirm={handleDelete}
          onCancel={() => !isDeleting && setModal({ type: null, item: null })}
          isDeleting={isDeleting}
        />
      )}

      <Breadcrumb items={breadcrumbItems} />

      <HeadingCard
        category="MASTER DATA"
        title="Sub Therapy Management"
        subtitle="Add, edit and manage sub-therapies"
        action={
          <button
            type="button"
            className="btn"
            onClick={() => setModal({ type: "add", item: null })}
            style={{
              whiteSpace: "nowrap",
              padding: "10px 18px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "var(--color-bg-table-button, #8B4513)",
              color: "white",
              fontWeight: "600",
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            }}
          >
            <AddIcon /> Add Sub Therapy
          </button>
        }
      />

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-3">
          <div className="card shadow-sm text-center p-3" style={{ borderRadius: "12px" }}>
            <SpaIcon sx={{ fontSize: 32, color: "#8B4513", mb: 1 }} />
            <h4 className="mb-0 fw-bold">{subTherapies.length}</h4>
            <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>Total Sub Therapies</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-header d-flex justify-content-between align-items-center" style={{ padding: "14px 20px" }}>
          <h5 className="mb-0 fw-bold">All Sub Therapies</h5>
          <div className="position-relative" style={{ minWidth: "260px" }}>
            <SearchIcon sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: "36px", borderRadius: "8px" }}
              placeholder="Search sub therapies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th style={{ fontSize: "0.82rem", padding: "12px 16px" }}>#</th>
                    <th style={{ fontSize: "0.82rem", padding: "12px 16px" }}>NAME</th>
                    <th style={{ fontSize: "0.82rem", padding: "12px 16px" }}>DESCRIPTION</th>
                    <th style={{ fontSize: "0.82rem", padding: "12px 16px", textAlign: "center" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {subTherapies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-5">
                        {search
                          ? "No sub-therapies match your search."
                          : "No sub-therapies added yet. Click 'Add Sub Therapy' to get started."}
                      </td>
                    </tr>
                  ) : (
                    subTherapies.map((st, idx) => (
                      <tr key={st._id}>
                        <td style={{ padding: "12px 16px", color: "#888", fontSize: "0.82rem" }}>{idx + 1}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>{st.name}</td>
                        <td style={{ padding: "12px 16px", fontSize: "0.875rem", maxWidth: 320 }}>
                          <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {st.description || <span className="text-muted">—</span>}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm"
                              onClick={() => setModal({ type: "edit", item: st })}
                              title="Edit"
                              style={{ backgroundColor: "#D4A574", color: "#000", borderRadius: "8px", padding: "5px 10px" }}
                            >
                              <EditIcon fontSize="small" />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => setModal({ type: "delete", item: st })}
                              title="Delete"
                              style={{ borderRadius: "8px", padding: "5px 10px" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Box>
  );
}

export default SubTherapyView;
