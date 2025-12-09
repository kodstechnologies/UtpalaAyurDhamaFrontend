import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";

// Icons
import PeopleIcon from "@mui/icons-material/People";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import MessageIcon from "@mui/icons-material/Message";
import DescriptionIcon from "@mui/icons-material/Description";

// Mock data - will be replaced with API calls later
const mockPatients = [
    {
        id: "pat-1",
        name: "Amit Kumar",
        contact: "9876543210",
        gender: "Male",
        age: 32,
        disease: "Arthritis",
        lastTreatment: "Physiotherapy",
        doctorName: "Dr. Sharma",
        appointmentDate: "2025-01-25",
        appointmentTime: "10:00 AM",
    },
    {
        id: "pat-2",
        name: "Sita Verma",
        contact: "8765432109",
        gender: "Female",
        age: 28,
        disease: "Migraine",
        lastTreatment: "Panchakarma",
        doctorName: "Dr. Patel",
        appointmentDate: "2025-01-26",
        appointmentTime: "2:00 PM",
    },
    {
        id: "pat-3",
        name: "Rajesh Singh",
        contact: "9988776655",
        gender: "Male",
        age: 45,
        disease: "Diabetes",
        lastTreatment: "Diet Plan",
        doctorName: "Dr. Kumar",
        appointmentDate: "2025-01-27",
        appointmentTime: "11:00 AM",
    },
    {
        id: "pat-4",
        name: "Priya Sharma",
        contact: "7766554433",
        gender: "Female",
        age: 22,
        disease: "Hypertension",
        lastTreatment: "Yoga",
        doctorName: "Dr. Mehta",
        appointmentDate: "2025-01-28",
        appointmentTime: "3:00 PM",
    },
    {
        id: "pat-5",
        name: "Rahul Dravid",
        contact: "6655443322",
        gender: "Male",
        age: 50,
        disease: "Arthritis",
        lastTreatment: "Physiotherapy",
        doctorName: "Dr. Sharma",
        appointmentDate: "2025-01-29",
        appointmentTime: "9:00 AM",
    },
    {
        id: "pat-6",
        name: "Anjali Mehta",
        contact: "5544332211",
        gender: "Female",
        age: 35,
        disease: "Migraine",
        lastTreatment: "Panchakarma",
        doctorName: "Dr. Patel",
        appointmentDate: "2025-01-30",
        appointmentTime: "4:00 PM",
    },
];

const mockDiseases = ["Arthritis", "Migraine", "Diabetes", "Hypertension"];
const mockTreatments = ["Physiotherapy", "Panchakarma", "Diet Plan", "Yoga"];

const mockTemplates = [
    {
        id: "1",
        title: "Appointment Reminder",
        content: "Hello {{patientName}}, this is a friendly reminder for your upcoming appointment. We look forward to seeing you!",
    },
    {
        id: "2",
        title: "Promotional Offer",
        content: "Hello {{patientName}}, we are running a special 20% discount on all Panchakarma treatments this month. Book now to avail the offer!",
    },
    {
        id: "3",
        title: "Follow-up Check",
        content: "Hello {{patientName}}, we hope you are feeling better after your last treatment. Please let us know if you have any questions or need further assistance.",
    },
];

function Marketing_View() {
    const [allPatients] = useState(mockPatients);
    const [filters, setFilters] = useState({
        gender: "",
        disease: "",
        treatment: "",
    });
    const [selectedPatientIds, setSelectedPatientIds] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter patients
    const filteredPatients = useMemo(() => {
        return allPatients.filter((patient) => {
            const matchesFilters =
                (filters.gender === "" || patient.gender === filters.gender) &&
                (filters.disease === "" || patient.disease === filters.disease) &&
                (filters.treatment === "" || patient.lastTreatment === filters.treatment);
            const matchesSearch =
                searchQuery === "" ||
                patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                patient.contact.includes(searchQuery) ||
                patient.disease.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilters && matchesSearch;
        });
    }, [filters, allPatients, searchQuery]);

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
                setMessage(template.content);
            }
        } else {
            setMessage("");
        }
    };

    // Handle send message
    const handleSendMessage = () => {
        if (selectedPatientIds.length === 0) {
            toast.error("Please select at least one patient.");
            return;
        }
        if (!message.trim()) {
            toast.error("Please enter a message to send.");
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

        // For bulk sending, open WhatsApp for each patient
        if (validContacts.length === 1) {
            const phoneNumber = validContacts[0].contact.replace(/\D/g, "");
            const personalizedMessage = message.replace(/\{\{patientName\}\}/g, validContacts[0].name);
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(personalizedMessage)}`;
            window.open(whatsappUrl, "_blank");
            toast.success(`Opening WhatsApp for ${validContacts[0].name}`);
        } else {
            // For multiple patients, open the first one
            const phoneNumber = validContacts[0].contact.replace(/\D/g, "");
            const personalizedMessage = message.replace(/\{\{patientName\}\}/g, validContacts[0].name);
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
        <Box sx={{ padding: "20px" }}>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Page Heading */}
            <HeadingCardingCard
                category="WHATSAPP MARKETING"
                title="Send Personalized WhatsApp Messages"
                subtitle="Select patients, compose your message, and send instantly."
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
                                    {mockDiseases.map((d) => (
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
                                    {mockTreatments.map((t) => (
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
                                            <th style={{ fontSize: "0.875rem" }}>Name</th>
                                            <th style={{ fontSize: "0.875rem" }}>Age</th>
                                            <th style={{ fontSize: "0.875rem" }}>Complain</th>
                                            <th style={{ fontSize: "0.875rem" }}>Appointment Date</th>
                                            <th style={{ fontSize: "0.875rem" }}>Appointment Time</th>
                                            <th style={{ fontSize: "0.875rem" }}>Doctor Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPatients.map((patient) => (
                                            <tr key={patient.id}>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={selectedPatientIds.includes(patient.id)}
                                                        onChange={() => handleSelectOne(patient.id)}
                                                    />
                                                </td>
                                                <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                    {patient.name}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.age}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.disease}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.appointmentDate}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.appointmentTime}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.doctorName}</td>
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
                                Use <code className="bg-light px-2 py-1 rounded" style={{ color: "#D4A574", fontWeight: 600, fontSize: "0.875rem" }}>{'{{patientName}}'}</code> to personalize messages
                            </small>
                        </div>

                        {/* Message Input and Send Section */}
                        <div className="row g-4">
                            <div className="col-lg-8">
                                <label className="form-label">Message Content</label>
                                <textarea
                                    className="form-control"
                                    rows={8}
                                    placeholder="Enter your WhatsApp message here or select a template above..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                                <small className="form-text text-muted">Character count: {message.length}</small>
                            </div>
                            <div className="col-lg-4">
                                <div className="card bg-primary bg-opacity-10 border-primary mb-3">
                                    <div className="card-body text-center">
                                        <div className="display-4 fw-bold text-primary mb-2">{stats.selected}</div>
                                        <div className="text-muted small">
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
                                    className="btn btn-primary w-100"
                                    onClick={handleSendMessage}
                                    disabled={selectedPatientIds.length === 0 || !message.trim()}
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
