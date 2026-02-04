import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";

// Icons
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PeopleIcon from "@mui/icons-material/People";
import UpcomingIcon from "@mui/icons-material/Upcoming";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import MessageIcon from "@mui/icons-material/Message";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssignmentIcon from "@mui/icons-material/Assignment";


// Mock data - will be replaced with API calls later
const mockPatients = [
    {
        id: "1",
        name: "Amit Kumar",
        registeredDate: "2025-01-12",
        contact: "9876543210",
        gender: "Male",
        age: 32,
        address: "Bangalore",
        email: "amit@example.com",
        disease: "Hypertension",
        patientProfileId: "prof-1",
        lastConsultedBy: "Dr. Sharma",
        lastTreatment: "Consultation",
        preferredDate: "2025-01-20",
        preferredTime: "10:00",
    },
    {
        id: "2",
        name: "Sita Verma",
        registeredDate: "2025-01-10",
        contact: "9123456780",
        gender: "Female",
        age: 28,
        address: "Delhi",
        email: "sita@example.com",
        disease: "Migraine",
        patientProfileId: "prof-2",
        lastConsultedBy: "Dr. Patel",
        lastTreatment: "Therapy",
        preferredDate: "2025-01-18",
        preferredTime: "14:00",
    },
    {
        id: "3",
        name: "Rajesh Singh",
        registeredDate: "2025-01-08",
        contact: "9988776655",
        gender: "Male",
        age: 45,
        address: "Mumbai",
        email: "rajesh@example.com",
        disease: "Diabetes",
        patientProfileId: "prof-3",
        lastConsultedBy: "N/A",
        lastTreatment: "N/A",
        preferredDate: "2025-01-22",
        preferredTime: "11:00",
    },
];

const mockAppointments = [
    {
        id: "apt-1",
        name: "Amit Kumar",
        appointmentDateTime: "2025-01-20 10:00",
        doctor: "Dr. Sharma",
        contact: "9876543210",
        disease: "Hypertension",
        status: "Upcoming",
        patientProfileId: "prof-1",
        invoiceId: null,
        invoiceNumber: null,
    },
    {
        id: "apt-2",
        name: "Sita Verma",
        appointmentDateTime: "2025-01-18 14:00",
        doctor: "Dr. Patel",
        contact: "9123456780",
        disease: "Migraine",
        status: "Confirmed",
        patientProfileId: "prof-2",
        invoiceId: "inv-1",
        invoiceNumber: "INV-2024-001",
    },
    {
        id: "apt-3",
        name: "Rajesh Singh",
        appointmentDateTime: "2025-01-15 09:00",
        doctor: "Dr. Kumar",
        contact: "9988776655",
        disease: "Diabetes",
        status: "Completed",
        patientProfileId: "prof-3",
        invoiceId: "inv-2",
        invoiceNumber: "INV-2024-002",
    },
];


const mockDoctors = [
    { _id: "doc-1", user: { name: "Dr. Sharma" } },
    { _id: "doc-2", user: { name: "Dr. Patel" } },
    { _id: "doc-3", user: { name: "Dr. Kumar" } },
];

function Appointments_View() {
    const [activeTab, setActiveTab] = useState("allPatients");
    const [filters, setFilters] = useState({
        search: "",
        appointmentStatus: "",
    });
    const [allPatients, setAllPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
    const [walkInSessions, setWalkInSessions] = useState([]);
    const [isLoadingWalkIn, setIsLoadingWalkIn] = useState(false);

    const navigate = useNavigate();

    // Fetch reception patients from API
    const fetchReceptionPatients = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl("reception-patients"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000 // Get all patients for now
                    }
                }
            );

            if (response.data.success) {
                // Transform API response to match table structure
                const transformedPatients = (response.data.data || []).map((patient) => ({
                    id: patient._id || patient.patientProfile?._id || "",
                    name: patient.patientName || "",
                    contact: patient.contactNumber || "",
                    age: patient.age || "",
                    email: patient.email || "",
                    registeredDate: patient.createdAt
                        ? new Date(patient.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                        })
                        : "",
                    address: patient.address || "",
                    patientProfileId: patient.patientProfile?._id || "",
                    alternativeNumber: patient.alternativeNumber || "",
                    isFamilyMember: patient.isFamilyMember || false,
                    relation: patient.relation || "",
                    mainPatient: patient.mainPatient || null,
                    familyMemberId: patient.isFamilyMember ? patient._id : null,
                }));
                setAllPatients(transformedPatients);
            } else {
                toast.error(response.data.message || "Failed to fetch patients");
            }
        } catch (error) {
            console.error("Error fetching reception patients:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch patients");
        } finally {
            setIsLoading(false);
        }
    }, []);



    // Breadcrumb Data
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Receptionist", url: "/receptionist/dashboard" },
        { label: "Appointments" },
    ];

    // Calculate statistics
    const statistics = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
            totalPatients: allPatients.length,
            todayAppointments: appointments.filter((apt) => {
                const aptDate = new Date(apt.appointmentDateTime.split(" ")[0]);
                aptDate.setHours(0, 0, 0, 0);
                return (
                    aptDate.getTime() === today.getTime() &&
                    apt.status !== "Cancelled" &&
                    apt.status !== "Completed"
                );
            }).length,
            upcomingAppointments: appointments.filter((apt) => {
                const isUpcomingStatus = apt.status === "Upcoming" || apt.status === "Confirmed" || apt.status === "Scheduled";
                if (!isUpcomingStatus) return false;

                try {
                    const aptDate = new Date(apt.appointmentDateTime.split(" ")[0]);
                    aptDate.setHours(0, 0, 0, 0);
                    return aptDate >= today;
                } catch (e) {
                    return false;
                }
            }).length,
        };
    }, [allPatients, appointments]);

    // Filter patients
    const filteredPatients = useMemo(() => {
        return allPatients.filter((patient) => {
            const matchesSearch =
                !filters.search ||
                patient.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                patient.contact.includes(filters.search) ||
                patient.id.includes(filters.search);
            return matchesSearch;
        });
    }, [allPatients, filters]);

    // Fetch appointments from API
    const fetchAppointments = useCallback(async () => {
        setIsLoadingAppointments(true);
        try {
            const response = await axios.get(
                getApiUrl("appointments"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000, // Get all appointments
                    }
                }
            );

            if (response.data.success) {
                const appointmentsData = response.data.data?.appointments || response.data.data || [];

                // Transform API response to match frontend structure
                const transformedAppointments = appointmentsData.map((apt) => ({
                    id: apt._id,
                    name: apt.patient?.user?.name || apt.patientName || "Unknown",
                    appointmentDateTime: apt.appointmentDate && apt.appointmentTime
                        ? `${new Date(apt.appointmentDate).toISOString().split("T")[0]} ${apt.appointmentTime}`
                        : apt.appointmentDateTime || "N/A",
                    doctor: apt.doctor?.user?.name || apt.doctorName || "N/A",
                    doctorId: apt.doctor?._id || apt.doctor || "", // Store doctor ID for rescheduling
                    contact: apt.patient?.user?.phone || apt.contact || "N/A",
                    disease: apt.notes || apt.disease || "N/A",
                    status: apt.status || "Scheduled",
                    patientProfileId: apt.patient?._id || apt.patient || "",
                    invoiceId: apt.invoice?._id || apt.invoiceId || null,
                    invoiceNumber: apt.invoice?.invoiceNumber || apt.invoiceNumber || null,
                }));

                setAppointments(transformedAppointments);
            } else {
                toast.error(response.data.message || "Failed to fetch appointments");
                // Fallback to mock data if API fails
                setAppointments(mockAppointments);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch appointments");
            // Fallback to mock data if API fails
            setAppointments(mockAppointments);
        } finally {
            setIsLoadingAppointments(false);
        }
    }, []);

    // Fetch walk-in sessions
    const fetchWalkInSessions = useCallback(async () => {
        setIsLoadingWalkIn(true);
        try {
            const response = await axios.get(
                getApiUrl("therapist-sessions/treatment-list"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        type: "WALK_IN",
                    }
                }
            );

            if (response.data.success) {
                setWalkInSessions(response.data.data || []);
            } else {
                toast.error(response.data.message || "Failed to fetch walk-in sessions");
            }
        } catch (error) {
            console.error("Error fetching walk-in sessions:", error);
            toast.error(error.response?.data?.message || "Failed to fetch walk-in sessions");
        } finally {
            setIsLoadingWalkIn(false);
        }
    }, []);

    useEffect(() => {
        fetchReceptionPatients();
        fetchAppointments();
    }, [fetchReceptionPatients, fetchAppointments]);

    useEffect(() => {
        if (activeTab === "appointments") {
            // Already fetched by initial useEffect, but kept for clarity if tab logic requires re-fetching
        } else if (activeTab === "walkIn") {
            fetchWalkInSessions();
        }
    }, [activeTab, fetchAppointments, fetchWalkInSessions]);

    // Filter appointments - Show all future appointments by default in "Upcoming Appointments" tab
    const filteredAppointments = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // For "Upcoming Appointments" tab, show all future appointments
        if (activeTab === "appointments") {
            if (!filters.appointmentStatus) {
                // Default: Show all future appointments
                return appointments.filter((apt) => {
                    try {
                        const [dateStr, timeStr] = apt.appointmentDateTime.split(" ");
                        if (!dateStr) return false;
                        const appointmentDate = new Date(dateStr);
                        appointmentDate.setHours(0, 0, 0, 0);
                        return appointmentDate >= now && apt.status !== "Cancelled" && apt.status !== "Completed";
                    } catch {
                        return false;
                    }
                });
            }
        }

        // Apply filters if any
        if (!filters.appointmentStatus) {
            return appointments;
        }

        return appointments.filter((apt) => {
            try {
                const [dateStr] = apt.appointmentDateTime.split(" ");
                if (!dateStr) return false;
                const appointmentDate = new Date(dateStr);
                appointmentDate.setHours(0, 0, 0, 0);

                if (filters.appointmentStatus === "upcoming") {
                    return appointmentDate > now && apt.status !== "Ongoing" && apt.status !== "Completed" && apt.status !== "Cancelled";
                } else if (filters.appointmentStatus === "ongoing") {
                    return apt.status === "Ongoing" || (appointmentDate.getTime() === now.getTime() && apt.status === "Confirmed");
                } else if (filters.appointmentStatus === "completed") {
                    return apt.status === "Completed" || appointmentDate < now;
                }
                return true;
            } catch {
                return false;
            }
        });
    }, [appointments, filters.appointmentStatus, activeTab]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleScheduleAppointmentClick = (patient) => {
        // For family members, use the familyMemberId; for regular patients, use the reception patient id
        const patientId = patient.isFamilyMember ? (patient.familyMemberId || patient.id) : patient.id;
        const params = new URLSearchParams({
            patientId: patientId || "",
            patientName: patient.name || "",
            isFamilyMember: patient.isFamilyMember ? "true" : "false",
        });
        navigate(`/receptionist/appointments/schedule?${params.toString()}`);
    };

    const handleRescheduleClick = (appointment) => {
        try {
            const [date, time] = appointment.appointmentDateTime.split(" ");
            const params = new URLSearchParams({
                appointmentId: appointment.id || "",
                patientName: appointment.name || "",
                doctorId: appointment.doctorId || "", // Use doctorId from appointment data
                date: date || "",
                time: time || "",
            });
            navigate(`/receptionist/appointments/reschedule?${params.toString()}`);
        } catch (error) {
            console.error("Error handling reschedule click:", error);
            toast.error("Failed to open reschedule page. Please try again.");
        }
    };

    const handleViewPatientClick = (patient) => {
        const params = new URLSearchParams({
            patientId: patient.id || "",
        });
        navigate(`/receptionist/appointments/view-patient?${params.toString()}`);
    };

    const handleWalkInHubClick = (patient) => {
        const params = new URLSearchParams({
            patientProfileId: patient.patientProfileId || "",
            patientName: patient.name || "",
        });
        navigate(`/receptionist/walk-in-hub?${params.toString()}`);
    };

    const handleEditPatientClick = (patient) => {
        // For family members, use the familyMemberId; for regular patients, use the reception patient id
        // In the transformed data:
        // id: patient._id || patient.patientProfile?._id || "", (this is reception patient / family member ID)
        // familyMemberId: patient.isFamilyMember ? patient._id : null,

        // Let's use `patient.id` - checking transformation logic:
        // family members: id = patient._id
        // reception patients: id = patient._id (or patientProfile id fallback?)

        // In fetchReceptionPatients:
        // id: patient._id || patient.patientProfile?._id || "", 
        // Correct.

        const params = new URLSearchParams({
            patientId: patient.id || "",
            isFamilyMember: patient.isFamilyMember ? "true" : "false",
        });
        navigate(`/receptionist/appointments/edit-patient?${params.toString()}`);
    };

    const handleSendMessageClick = (data) => {
        let date = "";
        let time = "";
        let doctorName = "";

        if (data.sessionDate || data.sessionTime) {
            // It's a walk-in session
            date = data.sessionDate ? new Date(data.sessionDate).toLocaleDateString("en-GB") : ""; // DD/MM/YYYY
            time = data.sessionTime || "";
            doctorName = data.therapistName || "Therapist";
        } else if (data.appointmentDateTime) {
            // It's a regular appointment
            const [d, t] = data.appointmentDateTime.split(" ");
            date = d; // Already YYYY-MM-DD from transformation earlier, but let's see if we want to format it
            // Let's reformat to DD/MM/YYYY for consistency if it's YYYY-MM-DD
            if (date.includes("-")) {
                const [y, m, day] = date.split("-");
                if (y.length === 4) {
                    date = `${day}/${m}/${y}`;
                }
            }
            time = t || "";
            doctorName = data.doctor || "";
        }

        const params = new URLSearchParams({
            patientId: data.id || data.patient?._id || data.patient || "",
            patientName: data.name || data.patientName || "",
            contact: data.contact || data.patientPhone || "",
            doctorName: doctorName,
            date: date,
            time: time,
        });
        navigate(`/receptionist/appointments/whatsapp?${params.toString()}`);
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            Upcoming: "badge bg-info",
            Confirmed: "badge bg-success",
            Scheduled: "badge bg-primary",
            Ongoing: "badge bg-warning",
            Completed: "badge bg-secondary",
            Cancelled: "badge bg-danger",
            Pending: "badge bg-warning",
        };
        return classes[status] || "badge bg-secondary";
    };


    // --------------------------

    return (
        <Box sx={{ padding: "20px" }}>
            {/* ... previous content ... */}



            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Page Heading */}
            <HeadingCard
                category="APPOINTMENTS"
                title="Appointment Management"
                subtitle="Manage appointments, patients, and therapy sessions"
                action={
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate("/receptionist/appointments/add-patient")}
                        style={{
                            whiteSpace: "nowrap",
                            padding: "10px 18px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            backgroundColor: "var(--color-bg-table-button)",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "15px",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.25)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.15)";
                        }}
                    >
                        <AddIcon />
                        Register New Patient
                    </button>

                }
            />

            {/* Statistics Cards */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "15px",
                    marginTop: 3,
                }}
            >
                <DashboardCard title="Total Patients" count={statistics.totalPatients} icon={PeopleIcon} />
                <DashboardCard title="Today's Appointments" count={statistics.todayAppointments} icon={EventAvailableIcon} />
                <DashboardCard title="Upcoming" count={statistics.upcomingAppointments} icon={UpcomingIcon} />
            </Box>

            {/* Tabs Panel */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-header bg-white border-bottom">
                        <ul className="nav nav-tabs card-header-tabs" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === "allPatients" ? "active" : ""}`}
                                    onClick={() => setActiveTab("allPatients")}
                                >
                                    <PeopleIcon className="me-2" />
                                    All Registered Patients
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === "appointments" ? "active" : ""}`}
                                    onClick={() => setActiveTab("appointments")}
                                >
                                    <EventAvailableIcon className="me-2" />
                                    Upcoming Appointments
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === "walkIn" ? "active" : ""}`}
                                    onClick={() => setActiveTab("walkIn")}
                                >
                                    <PersonAddIcon className="me-2" />
                                    Walk-in Patients
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="card-body">
                        {/* All Patients Tab */}
                        {activeTab === "allPatients" && (
                            <>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <input
                                            type="text"
                                            name="search"
                                            className="form-control"
                                            placeholder="Search by Name/ID..."
                                            value={filters.search}
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                {isLoading ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                                        <CircularProgress />
                                    </Box>
                                ) : filteredPatients.length === 0 ? (
                                    <Box sx={{ textAlign: "center", padding: "40px", color: "#666" }}>
                                        No patients found
                                    </Box>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Sl. No.</th>
                                                    <th>Name</th>
                                                    <th>Contact</th>
                                                    <th>Age</th>
                                                    <th>Email</th>
                                                    <th>Registered On</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPatients.map((patient, index) => (
                                                    <tr key={patient.id}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                {patient.name}
                                                                {patient.isFamilyMember && (
                                                                    <span
                                                                        className="badge bg-info"
                                                                        style={{ fontSize: "10px", padding: "2px 6px" }}
                                                                        title={`Family Member - ${patient.relation || "Relation"}`}
                                                                    >
                                                                        <PersonAddIcon fontSize="small" style={{ fontSize: "12px", marginRight: "2px" }} />
                                                                        {patient.relation || "Family"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>{patient.contact}</td>
                                                        <td>{patient.age}</td>
                                                        <td>{patient.email}</td>
                                                        <td>{patient.registeredDate}</td>
                                                        <td>
                                                            <div className="d-flex gap-2" role="group">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleViewPatientClick(patient)}
                                                                    title="View Patient Details"
                                                                    style={{
                                                                        backgroundColor: "#D4A574",
                                                                        borderColor: "#D4A574",
                                                                        color: "#000",
                                                                        borderRadius: "8px",
                                                                        padding: "8px 12px",
                                                                        fontWeight: 500,
                                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                        transition: "all 0.3s ease",
                                                                        minWidth: "45px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center"
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#C8965A";
                                                                        e.currentTarget.style.transform = "translateY(-2px)";
                                                                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#D4A574";
                                                                        e.currentTarget.style.transform = "translateY(0)";
                                                                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    }}
                                                                >
                                                                    <VisibilityIcon fontSize="small" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleEditPatientClick(patient)}
                                                                    title="Edit Patient Details"
                                                                    style={{
                                                                        backgroundColor: "#87CEEB", // Sky Blue
                                                                        borderColor: "#87CEEB",
                                                                        color: "#000",
                                                                        borderRadius: "8px",
                                                                        padding: "8px 12px",
                                                                        fontWeight: 500,
                                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                        transition: "all 0.3s ease",
                                                                        minWidth: "45px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center"
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#5F9EA0";
                                                                        e.currentTarget.style.transform = "translateY(-2px)";
                                                                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#87CEEB";
                                                                        e.currentTarget.style.transform = "translateY(0)";
                                                                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleScheduleAppointmentClick(patient)}
                                                                    style={{
                                                                        backgroundColor: "#90EE90",
                                                                        borderColor: "#90EE90",
                                                                        color: "#fff",
                                                                        borderRadius: "8px",
                                                                        padding: "8px 12px",
                                                                        fontWeight: 500,
                                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                        transition: "all 0.3s ease",
                                                                        minWidth: "45px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center"
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#7ACC7A";
                                                                        e.currentTarget.style.transform = "translateY(-2px)";
                                                                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#90EE90";
                                                                        e.currentTarget.style.transform = "translateY(0)";
                                                                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    }}
                                                                    title={patient.isFamilyMember ? "Schedule Appointment & Assign Doctor" : "Schedule Appointment"}
                                                                >
                                                                    <EventAvailableIcon fontSize="small" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleWalkInHubClick(patient)}
                                                                    style={{
                                                                        backgroundColor: "#1976d2",
                                                                        borderColor: "#1976d2",
                                                                        color: "#fff",
                                                                        borderRadius: "8px",
                                                                        padding: "8px 12px",
                                                                        fontWeight: 500,
                                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                        transition: "all 0.3s ease",
                                                                        minWidth: "45px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center"
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#1565c0";
                                                                        e.currentTarget.style.transform = "translateY(-2px)";
                                                                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#1976d2";
                                                                        e.currentTarget.style.transform = "translateY(0)";
                                                                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    }}
                                                                    title="Walk-in Patient Hub (Manage Admission & Assignment)"
                                                                >
                                                                    <AssignmentIcon fontSize="small" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleSendMessageClick(patient)}
                                                                    title="Send WhatsApp Message"
                                                                    style={{
                                                                        backgroundColor: "#FFB347",
                                                                        borderColor: "#FFB347",
                                                                        color: "#000",
                                                                        borderRadius: "8px",
                                                                        padding: "8px 12px",
                                                                        fontWeight: 500,
                                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                        transition: "all 0.3s ease",
                                                                        minWidth: "45px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center"
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#FF9F33";
                                                                        e.currentTarget.style.transform = "translateY(-2px)";
                                                                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#FFB347";
                                                                        e.currentTarget.style.transform = "translateY(0)";
                                                                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    }}
                                                                >
                                                                    <MessageIcon fontSize="small" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Appointments Tab */}
                        {activeTab === "appointments" && (
                            <>
                                <div className="d-flex justify-content-end mb-4">
                                    <select
                                        name="appointmentStatus"
                                        className="form-select w-auto"
                                        value={filters.appointmentStatus}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Future Appointments</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="ongoing">Ongoing (Today)</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                {isLoadingAppointments ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                                        <CircularProgress />
                                    </Box>
                                ) : filteredAppointments.length === 0 ? (
                                    <Box sx={{ textAlign: "center", padding: "40px", color: "#666" }}>
                                        No future appointments found
                                    </Box>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Sl. No.</th>
                                                    <th>Patient Name</th>
                                                    <th>Date & Time</th>
                                                    <th>Doctor</th>
                                                    <th>Contact</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredAppointments.map((appointment, index) => (
                                                    <tr key={appointment.id}>
                                                        <td>{index + 1}</td>
                                                        <td>{appointment.name}</td>
                                                        <td>{appointment.appointmentDateTime}</td>
                                                        <td>{appointment.doctor}</td>
                                                        <td>{appointment.contact}</td>
                                                        <td>
                                                            <span className={getStatusBadgeClass(appointment.status)}>
                                                                {appointment.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="btn-group" role="group">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-primary"
                                                                    onClick={() => handleRescheduleClick(appointment)}
                                                                    title="Reschedule Appointment"
                                                                    style={{
                                                                        borderRadius: "8px",
                                                                        padding: "8px 12px",
                                                                        minWidth: "45px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        transition: "all 0.3s ease",
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.transform = "translateY(-2px)";
                                                                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.transform = "translateY(0)";
                                                                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleSendMessageClick(appointment)}
                                                                    title="Send WhatsApp Reminder"
                                                                    style={{
                                                                        backgroundColor: "#FFB347",
                                                                        borderColor: "#FFB347",
                                                                        color: "#000",
                                                                        borderRadius: "8px",
                                                                        padding: "8px 12px",
                                                                        minWidth: "45px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        transition: "all 0.3s ease",
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#FF9F33";
                                                                        e.currentTarget.style.transform = "translateY(-2px)";
                                                                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#FFB347";
                                                                        e.currentTarget.style.transform = "translateY(0)";
                                                                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    }}
                                                                >
                                                                    <MessageIcon fontSize="small" />
                                                                </button>
                                                                {appointment.invoiceNumber && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-info"
                                                                        onClick={() => toast.info(`Invoice: ${appointment.invoiceNumber}`)}
                                                                        title={`View Invoice: ${appointment.invoiceNumber}`}
                                                                    >
                                                                        View Invoice
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                        {/* Walk-in Patients Tab */}
                        {activeTab === "walkIn" && (
                            <>
                                {isLoadingWalkIn ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                                        <CircularProgress />
                                    </Box>
                                ) : walkInSessions.length === 0 ? (
                                    <Box sx={{ textAlign: "center", padding: "40px", color: "#666" }}>
                                        No walk-in patients found
                                    </Box>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Sl. No.</th>
                                                    <th>Patient Name</th>
                                                    <th>Contact</th>
                                                    <th>Therapy</th>
                                                    <th>Therapist</th>
                                                    <th>Date & Time</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {walkInSessions.map((session, index) => (
                                                    <tr key={session._id}>
                                                        <td>{index + 1}</td>
                                                        <td>{session.patientName}</td>
                                                        <td>{session.patientPhone}</td>
                                                        <td>{session.treatmentName}</td>
                                                        <td>{session.therapistName || "Not Assigned"}</td>
                                                        <td>
                                                            {session.sessionDate ? new Date(session.sessionDate).toLocaleDateString("en-GB") : ""} {session.sessionTime}
                                                        </td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm"
                                                                onClick={() => handleSendMessageClick(session)}
                                                                title="Send WhatsApp Reminder"
                                                                style={{
                                                                    backgroundColor: "#FFB347",
                                                                    borderColor: "#FFB347",
                                                                    color: "#000",
                                                                    borderRadius: "8px",
                                                                    padding: "8px 12px",
                                                                    minWidth: "45px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    transition: "all 0.3s ease",
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#FF9F33";
                                                                    e.currentTarget.style.transform = "translateY(-2px)";
                                                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#FFB347";
                                                                    e.currentTarget.style.transform = "translateY(0)";
                                                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                }}
                                                            >
                                                                <MessageIcon fontSize="small" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </div>
            </Box>
        </Box>
    );
}

export default Appointments_View;
