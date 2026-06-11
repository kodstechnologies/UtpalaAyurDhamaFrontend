import { useState, useMemo, useEffect, useCallback } from "react";
import { Box, CircularProgress, TextField, MenuItem, TablePagination } from "@mui/material";
import HeadingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";
import receptionistService from "../../../services/receptionistService";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import * as XLSX from "xlsx";

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
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

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
    {
        id: "4",
        title: "Utpala Campaign Message",
        content: "Greetings from Utpala Ayurdhama {{1}}"
    }

];

const parseContactRows = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    return rows
        .map((row) => {
            if (!row || typeof row !== "object") return null;

            const entries = Object.entries(row);
            let name = "";
            let phone = "";

            entries.forEach(([key, value]) => {
                const normalizedKey = String(key).toLowerCase().trim();
                const strValue = value != null ? String(value).trim() : "";
                if (!strValue) return;

                if (!name && (normalizedKey.includes("name") || normalizedKey === "patient")) {
                    name = strValue;
                }
                if (!phone && (normalizedKey.includes("phone") || normalizedKey.includes("contact") || normalizedKey.includes("mobile"))) {
                    phone = strValue;
                }
            });

            if (!name && entries[0]?.[1]) name = String(entries[0][1]).trim();
            if (!phone && entries[1]?.[1]) phone = String(entries[1][1]).trim();

            const phoneDigits = phone.replace(/\D/g, "");
            if (!name || phoneDigits.length !== 10) return null;
            return { name, contactNumber: phoneDigits };
        })
        .filter(Boolean);
};

function Marketing_View() {
    const [allPatients, setAllPatients] = useState([]);
    const [manualContacts, setManualContacts] = useState([]);
    const [diseases, setDiseases] = useState([]);
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newContactName, setNewContactName] = useState("");
    const [newContactPhone, setNewContactPhone] = useState("");
    const [isAddingContact, setIsAddingContact] = useState(false);
    const [isUploadingContacts, setIsUploadingContacts] = useState(false);
    const [editingContactId, setEditingContactId] = useState(null);
    const [editContactName, setEditContactName] = useState("");
    const [editContactPhone, setEditContactPhone] = useState("");
    const [isUpdatingContact, setIsUpdatingContact] = useState(false);
    const [filters, setFilters] = useState({
        gender: "",
        disease: "",
        treatment: "",
    });
    const [selectedPatientIds, setSelectedPatientIds] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 25,
        total: 0,
    });
    const [discountText, setDiscountText] = useState("");
    const [offerDateText, setOfferDateText] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [campaignText, setCampaignText] = useState("");

    const fetchManualContacts = useCallback(async (signal) => {
        const search = searchQuery?.trim() || null;
        const response = await receptionistService.getMarketingContacts({ search }, signal);
        if (response?.success) {
            setManualContacts(response.data || []);
        } else {
            setManualContacts([]);
        }
    }, [searchQuery]);

    // Fetch patients and manual contacts from backend
    useEffect(() => {
        const abortController = new AbortController();
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                const params = {
                    page: pagination.page + 1,
                    limit: pagination.rowsPerPage
                };

                if (searchQuery && searchQuery.trim()) {
                    params.search = searchQuery.trim();
                }

                const [patientsResponse] = await Promise.all([
                    receptionistService.getMarketingPatients(params, abortController.signal),
                    fetchManualContacts(abortController.signal),
                ]);

                if (!isMounted) return;

                if (patientsResponse && patientsResponse.success) {
                    setAllPatients(patientsResponse.data || []);
                    setDiseases(patientsResponse.meta?.diseases || []);
                    setTreatments(patientsResponse.meta?.treatments || []);

                    if (patientsResponse.meta?.total !== undefined) {
                        setPagination(prev => ({
                            ...prev,
                            total: patientsResponse.meta.total || 0,
                        }));
                    }
                } else {
                    if (isMounted) {
                        toast.error("Failed to fetch marketing data");
                        setAllPatients([]);
                    }
                }
            } catch (error) {
                if (error.name === 'AbortError' || error.name === 'CanceledError' || error.message === 'canceled') {
                    return;
                }

                if (isMounted) {
                    toast.error(error?.message || "An error occurred while fetching marketing data");
                    setAllPatients([]);
                    setManualContacts([]);
                    setDiseases([]);
                    setTreatments([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [pagination.page, pagination.rowsPerPage, searchQuery, fetchManualContacts]);

    const allRecipients = useMemo(
        () => [...manualContacts, ...allPatients],
        [manualContacts, allPatients]
    );

    // Reset to first page when filters or search change
    useEffect(() => {
        // Only reset if not already on page 0 to avoid unnecessary re-renders
        setPagination(prev => {
            if (prev.page === 0) return prev;
            return { ...prev, page: 0 };
        });
    }, [filters.gender, filters.disease, filters.treatment, searchQuery]);

    // Filter recipients (manual contacts skip disease/treatment/gender filters)
    const filteredPatients = useMemo(() => {
        if (!Array.isArray(allRecipients)) {
            return [];
        }
        const result = allRecipients.filter((patient) => {
            if (patient.source === "manual") {
                return true;
            }
            const matchesFilters =
                (filters.gender === "" || patient.gender === filters.gender) &&
                (filters.disease === "" || patient.disease === filters.disease) &&
                (filters.treatment === "" || patient.lastTreatment === filters.treatment);
            return matchesFilters;
        });

        // Sort by last appointment date (most recent first)
        const sorted = result.sort((a, b) => {
            const dateA = a.appointmentDate && a.appointmentDate !== "N/A" ? new Date(a.appointmentDate) : null;
            const dateB = b.appointmentDate && b.appointmentDate !== "N/A" ? new Date(b.appointmentDate) : null;

            // If both have dates, sort descending (most recent first)
            if (dateA && dateB) {
                return dateB.getTime() - dateA.getTime();
            }
            // If only one has a date, prioritize it
            if (dateA && !dateB) return -1;
            if (!dateA && dateB) return 1;
            // If neither has a date, maintain original order
            return 0;
        });

        return sorted;
    }, [filters, allRecipients, searchQuery]);

    // Note: Since filters are applied client-side, we display filteredPatients directly
    // Server-side pagination fetches the base data, then we filter and display
    // Ensure paginatedPatients is always an array
    const paginatedPatients = Array.isArray(filteredPatients) ? filteredPatients : [];

    // Calculate stats: total from server (all pages), filtered/selected/validContact from current data
    const stats = useMemo(() => {
        return {
            total: pagination.total + manualContacts.length,
            registered: pagination.total,
            manual: manualContacts.length,
            filtered: filteredPatients.length,
            selected: selectedPatientIds.length,
            withValidContact: filteredPatients.filter(
                (p) => p.contact && p.contact !== "N/A" && p.contact.replace(/\D/g, "").length >= 10
            ).length,
        };
    }, [filteredPatients, selectedPatientIds, pagination.total, manualContacts.length]);

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Handle select all
    const getRecipientId = (patient) => String(patient.id);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedPatientIds(filteredPatients.map((p) => getRecipientId(p)));
        } else {
            setSelectedPatientIds([]);
        }
    };

    const handleSelectAllManual = (e) => {
        const manualIds = manualContacts.map((p) => getRecipientId(p));
        if (e.target.checked) {
            setSelectedPatientIds((prev) => [...new Set([...prev, ...manualIds])]);
        } else {
            setSelectedPatientIds((prev) => prev.filter((id) => !manualIds.includes(id)));
        }
    };

    // Handle select one
    const handleSelectOne = (patientId) => {
        const id = String(patientId);
        setSelectedPatientIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleAddManualContact = async () => {
        const name = newContactName.trim();
        const phone = newContactPhone.trim();

        if (!name) {
            toast.error("Please enter a name.");
            return;
        }
        const phoneDigits = phone.replace(/\D/g, "");
        if (phoneDigits.length !== 10) {
            toast.error("Phone number must be exactly 10 digits.");
            return;
        }

        setIsAddingContact(true);
        try {
            const response = await receptionistService.addMarketingContact({
                name,
                contactNumber: phoneDigits,
            });
            if (response?.success) {
                toast.success("Contact added successfully.");
                setNewContactName("");
                setNewContactPhone("");
                await fetchManualContacts();
            } else {
                toast.error(response?.message || "Failed to add contact.");
            }
        } catch (error) {
            toast.error(error?.message || "Failed to add contact.");
        } finally {
            setIsAddingContact(false);
        }
    };

    const handleContactsFileUpload = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        const validTypes = [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        const isValidExt = /\.(csv|xlsx|xls)$/i.test(file.name);
        if (!validTypes.includes(file.type) && !isValidExt) {
            toast.error("Please upload a CSV or Excel file (.csv, .xlsx, .xls).");
            return;
        }

        setIsUploadingContacts(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            const contacts = parseContactRows(rows);

            if (contacts.length === 0) {
                toast.error("No valid contacts found. Use Name and Phone (exactly 10 digits).");
                return;
            }

            const response = await receptionistService.bulkAddMarketingContacts(contacts);
            if (response?.success) {
                const { successful = 0, failed = 0 } = response.data || {};
                toast.success(`Uploaded ${successful} contact(s).${failed > 0 ? ` ${failed} row(s) skipped.` : ""}`);
                await fetchManualContacts();
            } else {
                toast.error(response?.message || "Failed to upload contacts.");
            }
        } catch (error) {
            toast.error(error?.message || "Failed to parse upload file.");
        } finally {
            setIsUploadingContacts(false);
        }
    };

    const handleStartEditContact = (contact) => {
        setEditingContactId(getRecipientId(contact));
        setEditContactName(contact.name || "");
        setEditContactPhone(contact.contact || "");
    };

    const handleCancelEditContact = () => {
        setEditingContactId(null);
        setEditContactName("");
        setEditContactPhone("");
    };

    const handleSaveEditContact = async () => {
        const name = editContactName.trim();
        const phoneDigits = editContactPhone.replace(/\D/g, "");

        if (!name) {
            toast.error("Please enter a name.");
            return;
        }
        if (phoneDigits.length !== 10) {
            toast.error("Phone number must be exactly 10 digits.");
            return;
        }

        setIsUpdatingContact(true);
        try {
            const response = await receptionistService.updateMarketingContact(editingContactId, {
                name,
                contactNumber: phoneDigits,
            });
            if (response?.success) {
                toast.success("Contact updated successfully.");
                handleCancelEditContact();
                await fetchManualContacts();
            } else {
                toast.error(response?.message || "Failed to update contact.");
            }
        } catch (error) {
            toast.error(error?.message || "Failed to update contact.");
        } finally {
            setIsUpdatingContact(false);
        }
    };

    const handleDeleteManualContact = async (contactId) => {
        try {
            const response = await receptionistService.deleteMarketingContact(contactId);
            if (response?.success) {
                toast.success("Contact removed.");
                if (editingContactId === contactId) {
                    handleCancelEditContact();
                }
                setSelectedPatientIds((prev) => prev.filter((id) => id !== contactId));
                await fetchManualContacts();
            } else {
                toast.error(response?.message || "Failed to remove contact.");
            }
        } catch (error) {
            toast.error(error?.message || "Failed to remove contact.");
        }
    };

    const renderManualContactActions = (contact) => {
        const contactId = getRecipientId(contact);
        const isEditing = editingContactId === contactId;

        if (isEditing) {
            return (
                <div className="d-flex gap-1">
                    <button
                        type="button"
                        className="btn btn-sm btn-link text-success p-0"
                        title="Save"
                        onClick={handleSaveEditContact}
                        disabled={isUpdatingContact}
                    >
                        <CheckIcon fontSize="small" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-link text-secondary p-0"
                        title="Cancel"
                        onClick={handleCancelEditContact}
                        disabled={isUpdatingContact}
                    >
                        <CloseIcon fontSize="small" />
                    </button>
                </div>
            );
        }

        return (
            <div className="d-flex gap-1">
                <button
                    type="button"
                    className="btn btn-sm btn-link p-0"
                    style={{ color: "#D4A574" }}
                    title="Edit contact"
                    onClick={() => handleStartEditContact(contact)}
                >
                    <EditOutlinedIcon fontSize="small" />
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-link text-danger p-0"
                    title="Remove contact"
                    onClick={() => handleDeleteManualContact(contactId)}
                >
                    <DeleteOutlineIcon fontSize="small" />
                </button>
            </div>
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

        // Reset campaign text when switching
        if (templateId !== "4") {
            setCampaignText("");
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

        const selectedPatients = allRecipients.filter((p) => selectedPatientIds.includes(getRecipientId(p)));
        const validContacts = selectedPatients.filter(
            (p) => p.contact && p.contact !== "N/A" && p.contact.replace(/\D/g, "").length >= 10
        );

        if (validContacts.length === 0) {
            toast.error("No valid contact numbers found for selected patients.");
            return;
        }

        // If Promotional Offer template is selected, call WhatsApp API for template campaign
        if (selectedTemplateId === "2") {
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

        if (selectedTemplateId === "4") {
            try {
                const response = await fetch(getApiUrl("whatsapp/send-utpala-campaign"), {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        patients: validContacts.map((p) => ({
                            name: p.name,
                            contact: p.contact,
                        })),
                        campaignText: campaignText.trim(),
                        imageUrl: imageUrl,
                    }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    toast.success(`Campaign WhatsApp sent to ${data.data?.sentTo || validContacts.length} patient(s).`);
                    setSelectedPatientIds([]);
                    setSelectedTemplateId("");
                    setCampaignText("");
                } else {
                    toast.error(data.message || "Failed to send campaign messages");
                }
            } catch (error) {
                console.error("WhatsApp Campaign Error:", error);
                toast.error("Error sending campaign messages");
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
                subtitle="Select registered patients and manually added contacts to send WhatsApp marketing messages, follow-ups, and promotional offers."
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
                <DashboardCard title="Total Recipients" count={stats.total} icon={PeopleIcon} />
                <DashboardCard title="Filtered Results" count={stats.filtered} icon={FilterAltIcon} />
                <DashboardCard title="Selected" count={stats.selected} icon={PersonAddAlt1Icon} />
                <DashboardCard title="Valid Contacts" count={stats.withValidContact} icon={CheckCircleIcon} />
            </Box>

            {/* ⭐ Manual Contacts Section */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <ContactPhoneIcon sx={{ color: "#D4A574" }} />
                            <h5 className="card-title mb-0">Add Contacts Manually</h5>
                        </div>
                        <p className="text-muted small mb-3">
                            Add name and phone one by one, or upload a CSV/Excel file. Manual contacts appear in the list below and receive the same advertisements as registered patients.
                        </p>

                        <div className="row g-3 align-items-end mb-3">
                            <div className="col-md-4">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Contact name"
                                    value={newContactName}
                                    onChange={(e) => setNewContactName(e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Phone Number (10 digits)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. 9876543210"
                                    value={newContactPhone}
                                    maxLength={10}
                                    inputMode="numeric"
                                    onChange={(e) => setNewContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                />
                            </div>
                            <div className="col-md-4">
                                <button
                                    type="button"
                                    className="btn w-100"
                                    style={{ backgroundColor: "var(--color-btn-bg)", color: "white" }}
                                    onClick={handleAddManualContact}
                                    disabled={isAddingContact}
                                >
                                    {isAddingContact ? "Adding..." : "Add Contact"}
                                </button>
                            </div>
                        </div>

                        <div
                            className="border rounded p-4 text-center"
                            style={{ borderStyle: "dashed", cursor: "pointer", backgroundColor: "#fcfcfc" }}
                            onClick={() => !isUploadingContacts && document.getElementById("contactsFileInput").click()}
                        >
                            <input
                                type="file"
                                id="contactsFileInput"
                                className="d-none"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleContactsFileUpload}
                            />
                            {isUploadingContacts ? (
                                <div>
                                    <CircularProgress size={24} sx={{ color: "#D4A574" }} />
                                    <p className="mb-0 mt-2 text-muted">Uploading contacts...</p>
                                </div>
                            ) : (
                                <div>
                                    <CloudUploadIcon sx={{ fontSize: 40, color: "#D4A574", mb: 1 }} />
                                    <p className="mb-0">Upload CSV or Excel file</p>
                                    <p className="small text-muted mb-0">Columns: Name, Phone (exactly 10 digits)</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">Manual Contacts ({manualContacts.length})</h6>
                                {manualContacts.length > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => {
                                            const manualIds = manualContacts.map((p) => getRecipientId(p));
                                            setSelectedPatientIds((prev) => [...new Set([...prev, ...manualIds])]);
                                        }}
                                    >
                                        Select All Manual
                                    </button>
                                )}
                            </div>

                            {manualContacts.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-sm table-bordered table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ fontSize: "0.875rem", width: "50px" }}>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        onChange={handleSelectAllManual}
                                                        checked={
                                                            manualContacts.length > 0 &&
                                                            manualContacts.every((p) =>
                                                                selectedPatientIds.includes(getRecipientId(p))
                                                            )
                                                        }
                                                        ref={(input) => {
                                                            if (input) {
                                                                const selectedCount = manualContacts.filter((p) =>
                                                                    selectedPatientIds.includes(getRecipientId(p))
                                                                ).length;
                                                                input.indeterminate =
                                                                    selectedCount > 0 && selectedCount < manualContacts.length;
                                                            }
                                                        }}
                                                    />
                                                </th>
                                                <th style={{ fontSize: "0.875rem" }}>#</th>
                                                <th style={{ fontSize: "0.875rem" }}>Name</th>
                                                <th style={{ fontSize: "0.875rem" }}>Phone</th>
                                                <th style={{ fontSize: "0.875rem", width: "80px" }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {manualContacts.map((contact, index) => {
                                                const contactId = getRecipientId(contact);
                                                const isEditing = editingContactId === contactId;

                                                return (
                                                <tr key={contactId}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={selectedPatientIds.includes(contactId)}
                                                            onChange={() => handleSelectOne(contactId)}
                                                            disabled={isEditing}
                                                        />
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem" }}>{index + 1}</td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={editContactName}
                                                                onChange={(e) => setEditContactName(e.target.value)}
                                                            />
                                                        ) : (
                                                            <span style={{ fontWeight: 600 }}>{contact.name}</span>
                                                        )}
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={editContactPhone}
                                                                maxLength={10}
                                                                inputMode="numeric"
                                                                onChange={(e) => setEditContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                            />
                                                        ) : (
                                                            contact.contact
                                                        )}
                                                    </td>
                                                    <td>{renderManualContactActions(contact)}</td>
                                                </tr>
                                            );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted small mb-0">
                                    No manual contacts yet. Add name and phone above or upload a file.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
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
                                <label className="form-label">Therapies</label>
                                <TextField
                                    select
                                    name="treatment"
                                    value={filters.treatment}
                                    onChange={handleFilterChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ backgroundColor: "white" }}
                                    SelectProps={{
                                        displayEmpty: true,
                                        MenuProps: {
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 250,
                                                },
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>All Therapies</em>
                                    </MenuItem>
                                    {treatments.map((t) => (
                                        <MenuItem key={t} value={t}>
                                            {t}
                                        </MenuItem>
                                    ))}
                                </TextField>
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
                            <h5 className="card-title mb-0">Recipients List</h5>
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
                                            <th style={{ fontSize: "0.875rem" }}>Source</th>
                                            <th style={{ fontSize: "0.875rem" }}>UHID</th>
                                            <th style={{ fontSize: "0.875rem" }}>Name</th>
                                            <th style={{ fontSize: "0.875rem" }}>Contact Number</th>
                                            <th style={{ fontSize: "0.875rem" }}>Gender</th>
                                            <th style={{ fontSize: "0.875rem" }}>Last Appointment</th>
                                            <th style={{ fontSize: "0.875rem", width: "60px" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedPatients.map((patient) => {
                                            const patientId = getRecipientId(patient);
                                            const isEditing = patient.source === "manual" && editingContactId === patientId;

                                            return (
                                            <tr key={patientId}>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={selectedPatientIds.includes(patientId)}
                                                        onChange={() => handleSelectOne(patientId)}
                                                        disabled={isEditing}
                                                    />
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {patient.source === "manual" ? (
                                                        <span className="badge bg-info text-dark">Manual</span>
                                                    ) : (
                                                        <span className="badge bg-secondary">Registered</span>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: "0.875rem", color: "#666" }}>
                                                    {patient.uhid}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={editContactName}
                                                            onChange={(e) => setEditContactName(e.target.value)}
                                                        />
                                                    ) : (
                                                        <span style={{ fontWeight: 600 }}>{patient.name}</span>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={editContactPhone}
                                                            maxLength={10}
                                                            inputMode="numeric"
                                                            onChange={(e) => setEditContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                        />
                                                    ) : (
                                                        patient.contact
                                                    )}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.gender}</td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {patient.appointmentDate !== "N/A" ? patient.appointmentDate : <span className="text-muted">No appointments</span>}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {patient.source === "manual" && renderManualContactActions(patient)}
                                                </td>
                                            </tr>
                                        );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <div className="mb-3">
                                    <PeopleIcon sx={{ fontSize: 64, color: "#6c757d" }} />
                                </div>
                                <h5 className="mb-2">No Recipients Found</h5>
                                <p className="text-muted mb-3">Try adjusting your filters or search query.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && paginatedPatients.length > 0 && (
                            <TablePagination
                                component="div"
                                count={pagination.total}
                                page={pagination.page}
                                rowsPerPage={pagination.rowsPerPage}
                                onPageChange={(_, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                                onRowsPerPageChange={(e) => {
                                    setPagination(prev => ({
                                        ...prev,
                                        rowsPerPage: parseInt(e.target.value, 10),
                                        page: 0
                                    }));
                                }}
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                labelRowsPerPage="Rows per page:"
                            />
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
                                            Discount Details (Optional)
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
                                        className="border rounded p-4 text-center"
                                        style={{ borderStyle: "dashed !important", cursor: "pointer", backgroundColor: "#fcfcfc" }}
                                        onClick={() => document.getElementById("imageInput").click()}
                                    >
                                        <input
                                            type="file"
                                            id="imageInput"
                                            className="d-none"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                        />
                                        {imagePreview ? (
                                            <div className="position-relative d-inline-block">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: "200px" }}
                                                />
                                                <div className="mt-2 text-muted small">Click to change image</div>
                                            </div>
                                        ) : (
                                            <div className="py-2">
                                                <CloudUploadIcon sx={{ fontSize: 48, color: "#D4A574", mb: 1 }} />
                                                <p className="mb-0 text-muted">Click to upload promotional image</p>
                                                <p className="small text-muted mb-0">Max size: 5MB (JPG, PNG)</p>
                                            </div>
                                        )}
                                        {isUploadingImage && (
                                            <div className="mt-2">
                                                <CircularProgress size={20} sx={{ color: "#D4A574" }} />
                                                <span className="ms-2 small">Uploading...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Utpala Campaign Template Specific Inputs */}
                        {selectedTemplateId === "4" && (
                            <>
                                <div className="mb-4">
                                <label className="form-label fw-bold">
                                    <DescriptionIcon className="me-2" style={{ verticalAlign: "middle", fontSize: "1.2rem", color: "#D4A574" }} />
                                    Campaign Message Text <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Enter the text that will replace $FirstName in the template..."
                                    value={campaignText}
                                    onChange={(e) => setCampaignText(e.target.value)}
                                    style={{ fontSize: "0.9rem" }}
                                ></textarea>
                                <small className="form-text text-muted">
                                    This text will be sent as part of the personalized WhatsApp message.
                                </small>
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold">
                                    <ImageIcon className="me-2" style={{ verticalAlign: "middle", fontSize: "1.2rem", color: "#D4A574" }} />
                                    Campaign Image <span className="text-danger">*</span>
                                </label>
                                <div
                                    className="border rounded p-4 text-center"
                                    style={{ borderStyle: "dashed !important", cursor: "pointer", backgroundColor: "#fcfcfc" }}
                                    onClick={() => document.getElementById("campaignImageInput").click()}
                                >
                                    <input
                                        type="file"
                                        id="campaignImageInput"
                                        className="d-none"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                    />
                                    {imagePreview ? (
                                        <div className="position-relative d-inline-block">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="img-fluid rounded"
                                                style={{ maxHeight: "200px" }}
                                            />
                                            <div className="mt-2 text-muted small">Click to change image</div>
                                        </div>
                                    ) : (
                                        <div className="py-2">
                                            <CloudUploadIcon sx={{ fontSize: 48, color: "#D4A574", mb: 1 }} />
                                            <p className="mb-0 text-muted">Click to upload campaign image</p>
                                            <p className="small text-muted mb-0">Max size: 5MB (JPG, PNG)</p>
                                        </div>
                                    )}
                                    {isUploadingImage && (
                                        <div className="mt-2">
                                            <CircularProgress size={20} sx={{ color: "#D4A574" }} />
                                            <span className="ms-2 small">Uploading...</span>
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
                                        selectedTemplateId === "2" || selectedTemplateId === "3" || selectedTemplateId === "4"
                                            ? "Message will be auto-generated from the WhatsApp template."
                                            : "Enter your WhatsApp message here or select a template above..."
                                    }
                                    value={selectedTemplateId === "2" || selectedTemplateId === "3" || selectedTemplateId === "4" ? "" : message}
                                    onChange={(e) => {
                                        if (selectedTemplateId !== "2" && selectedTemplateId !== "3" && selectedTemplateId !== "4") {
                                            setMessage(e.target.value);
                                        }
                                    }}
                                    disabled={selectedTemplateId === "2" || selectedTemplateId === "3" || selectedTemplateId === "4"}
                                ></textarea>
                                <small className="form-text text-muted">
                                    Character count: {selectedTemplateId === "2" || selectedTemplateId === "3" || selectedTemplateId === "4" ? 0 : message.length}
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
                                            <span>Registered:</span>
                                            <strong>{stats.registered}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Manual:</span>
                                            <strong>{stats.manual}</strong>
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
                                        (selectedTemplateId !== "2" && selectedTemplateId !== "3" && selectedTemplateId !== "4" && !message.trim()) ||
                                        (selectedTemplateId === "2" && !imageUrl) ||
                                        (selectedTemplateId === "4" && (!campaignText.trim() || !imageUrl)) ||
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
