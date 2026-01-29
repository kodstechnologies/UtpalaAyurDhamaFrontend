import { useState, useMemo, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import HeadingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";
import receptionistService from "../../../services/receptionistService";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

// Icons
import PeopleIcon from "@mui/icons-material/People";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const mockTemplates = [
    {
        id: "2",
        title: "Promotional Offer",
        content: "Hello {{patientName}}, we are running a special 20% discount on all Panchakarma treatments this month. Book now to avail the offer!",
    },
    {
        id: "3",
        title: "Follow-up Check",
        content: "Hello {{1}}, We hope you are feeling better after your recent treatment at Utpala Ayurdhama. Please let us know if you have any questions or require further assistance.",
    },
];

function Marketing_View() {
    const [allPatients, setAllPatients] = useState([]);
    const [diseases, setDiseases] = useState([]);
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        gender: "",
        disease: "",
        treatment: "",
    });
    const [selectedPatientIds, setSelectedPatientIds] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;
    const [discountText, setDiscountText] = useState("");
    const [offerDateText, setOfferDateText] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Fetch patients from backend
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await receptionistService.getMarketingPatients({ page: 1, limit: 1000 });
                console.log("Marketing API Response:", response);
                if (response && response.success) {
                    setAllPatients(response.data || []);
                    setDiseases(response.meta?.diseases || []);
                    setTreatments(response.meta?.treatments || []);
                } else {
                    console.error("Failed to fetch marketing data:", response);
                    toast.error("Failed to fetch marketing data");
                    setAllPatients([]);
                }
            } catch (error) {
                console.error("Marketing Error:", error);
                toast.error(error?.message || "An error occurred while fetching marketing data");
                setAllPatients([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter patients
    const filteredPatients = useMemo(() => {
        const result = allPatients.filter((patient) => {
            const matchesFilters =
                (filters.gender === "" || patient.gender === filters.gender) &&
                (filters.disease === "" || patient.disease === filters.disease) &&
                (filters.treatment === "" || patient.lastTreatment === filters.treatment);
            const matchesSearch =
                searchQuery === "" ||
                (patient.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (patient.contact?.includes(searchQuery)) ||
                (patient.uhid?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (patient.disease?.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesFilters && matchesSearch;
        });

        // Reset to first page whenever filters or search change
        setCurrentPage(1);
        return result;
    }, [filters, allPatients, searchQuery]);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(filteredPatients.length / pageSize)),
        [filteredPatients.length]
    );

    const paginatedPatients = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPatients.slice(start, start + pageSize);
    }, [filteredPatients, currentPage]);

    // Calculate stats
    const stats = useMemo(() => {
        return {
            total: allPatients.length,
            filtered: filteredPatients.length,
            selected: selectedPatientIds.length,
            withValidContact: filteredPatients.filter(
                (p) => p.contact && p.contact !== "N/A" && p.contact.replace(/\D/g, "").length >= 10
            ).length,
        };
    }, [allPatients, filteredPatients, selectedPatientIds]);

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Handle select all
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedPatientIds(filteredPatients.map((p) => p.id));
        } else {
            setSelectedPatientIds([]);
        }
    };

    // Handle select one
    const handleSelectOne = (patientId) => {
        setSelectedPatientIds((prev) =>
            prev.includes(patientId) ? prev.filter((id) => id !== patientId) : [...prev, patientId]
        );
    };

    // Handle template change
    const handleTemplateChange = (e) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);
        if (templateId) {
            const template = mockTemplates.find((t) => t.id === templateId);
            if (template) {
                // For templates that use WhatsApp API (Promotional Offer "2" and Follow-up Check "3"), clear message
                if (templateId === "2" || templateId === "3") {
                    setMessage("");
                } else {
                    // For other templates, prefill message body
                    setMessage(template.content);
                }
            }
        } else {
            setMessage("");
        }

        // Reset promotional inputs when switching away from promotional template
        if (templateId !== "2") {
            setDiscountText("");
            setOfferDateText("");
            setSelectedImage(null);
            setImagePreview(null);
            setImageUrl(null);
        }
    };

    // Handle image selection
    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setSelectedImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload image immediately
        setIsUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            // Get auth token for Authorization header
            const token = localStorage.getItem("token") || localStorage.getItem("authToken") || 
                         JSON.parse(localStorage.getItem("user") || "{}")?.token;

            const headers = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            // Don't set Content-Type - let browser set it with boundary for FormData

            const response = await fetch(getApiUrl("upload"), {
                method: "POST",
                headers: headers,
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success && data.data?.url) {
                setImageUrl(data.data.url);
                toast.success("Image uploaded successfully");
            } else {
                toast.error(data.message || "Failed to upload image");
                setSelectedImage(null);
                setImagePreview(null);
            }
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error("An error occurred while uploading image");
            setSelectedImage(null);
            setImagePreview(null);
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Handle send message
    const handleSendMessage = async () => {
        if (selectedPatientIds.length === 0) {
            toast.error("Please select at least one patient.");
            return;
        }

        const selectedPatients = allPatients.filter((p) => selectedPatientIds.includes(p.id));
        const validContacts = selectedPatients.filter(
            (p) => p.contact && p.contact !== "N/A" && p.contact.replace(/\D/g, "").length >= 10
        );

        if (validContacts.length === 0) {
            toast.error("No valid contact numbers found for selected patients.");
            return;
        }

        // If Promotional Offer template is selected, call WhatsApp API for template campaign
        if (selectedTemplateId === "2") {
            if (!discountText.trim()) {
                toast.error("Please enter discount details (e.g. 20%).");
                return;
            }
            if (!offerDateText.trim()) {
                toast.error("Please enter the therapy name.");
                return;
            }
            if (!imageUrl) {
                toast.error("Please upload a promotional image.");
                return;
            }

            try {
                const response = await fetch(getApiUrl("whatsapp/send-therapy-promotional-offer"), {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        patients: validContacts.map((p) => ({
                            name: p.name,
                            contact: p.contact,
                        })),
                        discountText: discountText.trim(),
                        dateText: offerDateText.trim(),
                        imageUrl: imageUrl,
                    }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    toast.success(`Promotional WhatsApp sent to ${data.data?.sentTo || validContacts.length} patient(s).`);
                    setSelectedPatientIds([]);
                    // Reset promotional inputs after successful send
                    setDiscountText("");
                    setOfferDateText("");
                    setSelectedImage(null);
                    setImagePreview(null);
                    setImageUrl(null);
                } else {
                    toast.error(data.message || "Failed to send promotional messages via WhatsApp");
                }
            } catch (error) {
                console.error("WhatsApp Promotional Error:", error);
                toast.error("An error occurred while sending promotional messages");
            }

            return;
        }

        // If Follow-up Check template is selected, call WhatsApp API for template campaign
        if (selectedTemplateId === "3") {
            try {
                const response = await fetch(getApiUrl("whatsapp/send-follow-up-appointment"), {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        patients: validContacts.map((p) => ({
                            name: p.name,
                            contact: p.contact,
                        })),
                    }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    toast.success(`Follow-up WhatsApp sent to ${data.data?.sentTo || validContacts.length} patient(s).`);
                    setSelectedPatientIds([]);
                    setSelectedTemplateId("");
                    setMessage("");
                } else {
                    toast.error(data.message || "Failed to send follow-up messages via WhatsApp");
                }
            } catch (error) {
                console.error("WhatsApp Follow-up Error:", error);
                toast.error("An error occurred while sending follow-up messages");
            }

            return;
        }

        // Default behaviour: open WhatsApp with custom text
        if (!message.trim()) {
            toast.error("Please enter a message to send.");
            return;
        }

        // For bulk sending, open WhatsApp for each patient
        if (validContacts.length === 1) {
            const phoneNumber = validContacts[0].contact.replace(/\D/g, "");
            const personalizedMessage = message
                .replace(/\{\{patientName\}\}/g, validContacts[0].name)
                .replace(/\{\{doctorName\}\}/g, validContacts[0].doctorName || "Dr. Vijay")
                .replace(/\{\{date\}\}/g, validContacts[0].appointmentDate || "today")
                .replace(/\{\{time\}\}/g, validContacts[0].appointmentTime || "your scheduled time");
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(personalizedMessage)}`;
            window.open(whatsappUrl, "_blank");
            toast.success(`Opening WhatsApp for ${validContacts[0].name}`);
        } else {
            // For multiple patients, open the first one
            const phoneNumber = validContacts[0].contact.replace(/\D/g, "");
            const personalizedMessage = message
                .replace(/\{\{patientName\}\}/g, validContacts[0].name)
                .replace(/\{\{doctorName\}\}/g, validContacts[0].doctorName || "Dr. Vijay")
                .replace(/\{\{date\}\}/g, validContacts[0].appointmentDate || "today")
                .replace(/\{\{time\}\}/g, validContacts[0].appointmentTime || "your scheduled time");
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(personalizedMessage)}`;
            window.open(whatsappUrl, "_blank");
            toast.success(`Opening WhatsApp for ${validContacts[0].name}. ${validContacts.length - 1} more patient(s) selected.`);
        }

        // Clear selection after sending
        setSelectedPatientIds([]);
    };

    // Breadcrumb Items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Marketing" },
    ];

    // Debug: Log component render
    console.log("Marketing_View rendering, loading:", loading, "patients:", allPatients.length);

    return (
        <Box sx={{ padding: "20px", position: "relative", minHeight: "100vh" }}>
            {loading && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        zIndex: 10,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "400px"
                    }}
                >
                    <CircularProgress sx={{ color: "var(--color-primary)" }} />
                </Box>
            )}

            {/* ⭐ Page Heading */}
            <HeadingCard
                title="Send Personalized WhatsApp Messages"
                subtitle="Select patients and send them personalized WhatsApp messages for marketing, follow-ups, and promotional offers."
                breadcrumbItems={breadcrumbItems}
            />

            {/* ⭐ DASHBOARD CARDS */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(4, 1fr)",
                    },
                    gap: "15px",
                    marginTop: 3,
                }}
            >
                <DashboardCard title="Total Patients" count={stats.total} icon={PeopleIcon} />
                <DashboardCard title="Filtered Results" count={stats.filtered} icon={FilterAltIcon} />
                <DashboardCard title="Selected" count={stats.selected} icon={PersonAddAlt1Icon} />
                <DashboardCard title="Valid Contacts" count={stats.withValidContact} icon={CheckCircleIcon} />
            </Box>

            {/* ⭐ Filters and Search Section */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <FilterAltIcon sx={{ color: "#D4A574" }} />
                            <h5 className="card-title mb-0">Filter & Search Patients</h5>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <SearchIcon />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name, contact, or disease..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filter Dropdowns */}
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Gender</label>
                                <select
                                    name="gender"
                                    className="form-select"
                                    value={filters.gender}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Genders</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Disease/Complaint</label>
                                <select
                                    name="disease"
                                    className="form-select"
                                    value={filters.disease}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Diseases</option>
                                    {diseases.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Treatment</label>
                                <select
                                    name="treatment"
                                    className="form-select"
                                    value={filters.treatment}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Treatments</option>
                                    {treatments.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </Box>

            {/* ⭐ Patient Table */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="card-title mb-0">Patient List</h5>
                            {selectedPatientIds.length > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => setSelectedPatientIds([])}
                                >
                                    Clear Selection ({selectedPatientIds.length})
                                </button>
                            )}
                        </div>

                        {filteredPatients.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th style={{ fontSize: "0.875rem", width: "50px" }}>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    onChange={handleSelectAll}
                                                    checked={
                                                        selectedPatientIds.length === filteredPatients.length &&
                                                        filteredPatients.length > 0
                                                    }
                                                    ref={(input) => {
                                                        if (input)
                                                            input.indeterminate =
                                                                selectedPatientIds.length > 0 &&
                                                                selectedPatientIds.length < filteredPatients.length;
                                                    }}
                                                />
                                            </th>
                                            <th style={{ fontSize: "0.875rem" }}>UHID</th>
                                            <th style={{ fontSize: "0.875rem" }}>Name</th>
                                            <th style={{ fontSize: "0.875rem" }}>Contact Number</th>
                                            <th style={{ fontSize: "0.875rem" }}>Gender</th>
                                            <th style={{ fontSize: "0.875rem" }}>Last Appointment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedPatients.map((patient) => (
                                            <tr key={patient.id}>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={selectedPatientIds.includes(patient.id)}
                                                        onChange={() => handleSelectOne(patient.id)}
                                                    />
                                                </td>
                                                <td style={{ fontSize: "0.875rem", color: "#666" }}>
                                                    {patient.uhid}
                                                </td>
                                                <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                    {patient.name}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.contact}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.gender}</td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {patient.appointmentDate !== "N/A" ? patient.appointmentDate : <span className="text-muted">No appointments</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <div className="mb-3">
                                    <PeopleIcon sx={{ fontSize: 64, color: "#6c757d" }} />
                                </div>
                                <h5 className="mb-2">No Patients Found</h5>
                                <p className="text-muted mb-3">Try adjusting your filters or search query.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredPatients.length > pageSize && (
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <small className="text-muted">
                                    Showing{" "}
                                    {Math.min((currentPage - 1) * pageSize + 1, filteredPatients.length)}-
                                    {Math.min(currentPage * pageSize, filteredPatients.length)} of {filteredPatients.length} patients
                                </small>
                                <nav>
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                            >
                                                Previous
                                            </button>
                                        </li>
                                        {Array.from({ length: totalPages }).map((_, index) => {
                                            const page = index + 1;
                                            return (
                                                <li
                                                    key={page}
                                                    className={`page-item ${currentPage === page ? "active" : ""}`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                            >
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </Box>

            {/* ⭐ Message Composition Section */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <DescriptionIcon sx={{ color: "#D4A574" }} />
                            <h5 className="card-title mb-0">Compose Message</h5>
                        </div>

                        {/* Template Selection */}
                        <div className="mb-4">
                            <label className="form-label">Message Template (Optional)</label>
                            <select
                                className="form-select"
                                value={selectedTemplateId}
                                onChange={handleTemplateChange}
                            >
                                <option value="">-- Custom Message --</option>
                                {mockTemplates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.title}
                                    </option>
                                ))}
                            </select>
                            <small className="form-text text-muted d-block mt-2">
                                Use <code className="bg-light px-2 py-1 rounded" style={{ color: "#D4A574", fontWeight: 600, fontSize: "0.875rem" }}>{'patientName'}</code> to personalize messages
                            </small>
                        </div>

                        {/* Promotional Offer Template Specific Inputs */}
                        {selectedTemplateId === "2" && (
                            <>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Discount Details
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. 20%"
                                            value={discountText}
                                            onChange={(e) => setDiscountText(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Therapy
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Panchakarma, Abhyanga"
                                            value={offerDateText}
                                            onChange={(e) => setOfferDateText(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        <ImageIcon className="me-2" style={{ verticalAlign: "middle", fontSize: "1.2rem", color: "#D4A574" }} />
                                        Promotional Image <span className="text-danger">*</span>
                                    </label>
                                    <div 
                                        className="border rounded p-4" 
                                        style={{ 
                                            backgroundColor: "#fff",
                                            border: "2px dashed #D4A574",
                                            borderColor: imageUrl ? "#28a745" : "#D4A574",
                                            transition: "all 0.3s ease",
                                            minHeight: "200px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        {imagePreview ? (
                                            <div className="text-center w-100">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    style={{
                                                        maxWidth: "100%",
                                                        maxHeight: "300px",
                                                        objectFit: "contain",
                                                        borderRadius: "8px",
                                                        marginBottom: "15px",
                                                        border: "2px solid #28a745",
                                                        padding: "5px"
                                                    }}
                                                />
                                                <div className="d-flex gap-2 justify-content-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => {
                                                            setSelectedImage(null);
                                                            setImagePreview(null);
                                                            setImageUrl(null);
                                                        }}
                                                    >
                                                        Remove Image
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center w-100">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    className="d-none"
                                                    id="promotional-image-upload"
                                                    disabled={isUploadingImage}
                                                />
                                                <div className="mb-3">
                                                    <ImageIcon 
                                                        sx={{ 
                                                            fontSize: 48, 
                                                            color: "#D4A574",
                                                            marginBottom: "10px"
                                                        }} 
                                                    />
                                                </div>
                                                <label
                                                    htmlFor="promotional-image-upload"
                                                    className="btn d-inline-flex align-items-center"
                                                    style={{ 
                                                        cursor: isUploadingImage ? "not-allowed" : "pointer",
                                                        userSelect: "none",
                                                        backgroundColor: "#D4A574",
                                                        color: "white",
                                                        border: "none",
                                                        padding: "12px 24px",
                                                        fontSize: "1rem",
                                                        fontWeight: "600",
                                                        borderRadius: "8px",
                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isUploadingImage) {
                                                            e.target.style.backgroundColor = "#c49563";
                                                            e.target.style.transform = "scale(1.05)";
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isUploadingImage) {
                                                            e.target.style.backgroundColor = "#D4A574";
                                                            e.target.style.transform = "scale(1)";
                                                        }
                                                    }}
                                                >
                                                    {isUploadingImage ? (
                                                        <>
                                                            <CircularProgress size={20} className="me-2" style={{ color: "white" }} />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CloudUploadIcon className="me-2" />
                                                            Click to Upload Promotional Image
                                                        </>
                                                    )}
                                                </label>
                                                <p className="text-muted small mt-3 mb-0">
                                                    <strong>Supported formats:</strong> JPG, PNG, GIF, WebP | <strong>Max size:</strong> 5MB
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Message Input and Send Section */}
                        <div className="row g-4">
                            <div className="col-lg-8">
                                <label className="form-label">Message Content</label>
                                <textarea
                                    className="form-control"
                                    rows={8}
                                    placeholder={
                                        selectedTemplateId === "2" || selectedTemplateId === "3"
                                            ? "Message will be auto-generated from the WhatsApp template."
                                            : "Enter your WhatsApp message here or select a template above..."
                                    }
                                    value={selectedTemplateId === "2" || selectedTemplateId === "3" ? "" : message}
                                    onChange={(e) => {
                                        if (selectedTemplateId !== "2" && selectedTemplateId !== "3") {
                                            setMessage(e.target.value);
                                        }
                                    }}
                                    disabled={selectedTemplateId === "2" || selectedTemplateId === "3"}
                                ></textarea>
                                <small className="form-text text-muted">
                                    Character count: {selectedTemplateId === "2" || selectedTemplateId === "3" ? 0 : message.length}
                                </small>
                            </div>
                            <div className="col-lg-4">
                                <div className="card bg-primary bg-opacity-10 border-primary mb-3">
                                    <div className="card-body text-center">
                                        <div className="display-4 fw-bold text-white mb-2">{stats.selected}</div>
                                        <div className=" small text-white">
                                            Patient{stats.selected !== 1 ? "s" : ""} Selected
                                        </div>
                                    </div>
                                </div>
                                <div className="card mb-3">
                                    <div className="card-body">
                                        <div className="small text-muted mb-2">Quick Stats</div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Total Patients:</span>
                                            <strong>{stats.total}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Filtered:</span>
                                            <strong>{stats.filtered}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span>Valid Contacts:</span>
                                            <strong className="text-success">{stats.withValidContact}</strong>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn w-100"
                                    style={{
                                        backgroundColor: "var(--color-btn-bg)",
                                        color: "white"
                                    }}
                                    onClick={handleSendMessage}
                                    disabled={
                                        selectedPatientIds.length === 0 ||
                                        (selectedTemplateId !== "2" && selectedTemplateId !== "3" && !message.trim()) ||
                                        (selectedTemplateId === "2" && !imageUrl) ||
                                        isUploadingImage
                                    }
                                >
                                    <SendIcon className="me-2" />
                                    Send to {stats.selected} Patient{stats.selected !== 1 ? "s" : ""}
                                </button>
                                {selectedPatientIds.length === 0 && (
                                    <p className="text-muted small text-center mt-2">
                                        Select patients from the table above
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Box>
        </Box>
    );
}

export default Marketing_View;
