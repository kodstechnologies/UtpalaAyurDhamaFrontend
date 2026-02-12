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
    const [ipdWalkIns, setIpdWalkIns] = useState([]);
    const [isLoadingIpdWalkIns, setIsLoadingIpdWalkIns] = useState(false);

    const navigate = useNavigate();

    // Fetch reception patients from API
    const fetchReceptionPatients = useCallback(async () => {
        setIsLoading(true);
        const abortController = new AbortController();
        
        try {
            const response = await axios.get(
                getApiUrl("reception-patients"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000 // Get all patients for now
                    },
                    timeout: 30000, // 30 seconds timeout
                    signal: abortController.signal
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
                    primaryDoctorId: patient.patientProfile?.primaryDoctor?._id || patient.patientProfile?.primaryDoctor || "",
                }));
                setAllPatients(transformedPatients);
            } else {
                toast.error(response.data.message || "Failed to fetch patients");
            }
        } catch (error) {
            // Don't show error if request was cancelled
            if (axios.isCancel(error) || error.name === 'AbortError') {
                return;
            }
            
            console.error("Error fetching reception patients:", error);
            
            // Better error messages
            let errorMessage = "Failed to fetch patients";
            if (error.code === "ECONNABORTED") {
                errorMessage = "Request timeout. Please check your connection and try again.";
            } else if (!error.response) {
                errorMessage = "Network error. Please check your internet connection.";
            } else {
                errorMessage = error.response?.data?.message || error.message || errorMessage;
            }
            
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
        
        // Cleanup function to cancel request if component unmounts
        return () => {
            abortController.abort();
        };
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

    // Filter and sort patients by registration time (most recent first)
    const filteredPatients = useMemo(() => {
        const filtered = allPatients.filter((patient) => {
            if (!filters.search || !filters.search.trim()) {
                return true;
            }
            
            const searchLower = filters.search.toLowerCase().trim();
            // Search across all columns: name, contact, ID, email, age, registered date
            const name = (patient.name || "").toLowerCase();
            const contact = (patient.contact || "").toLowerCase();
            const id = (patient.id || "").toLowerCase();
            const email = (patient.email || "").toLowerCase();
            const age = (patient.age || "").toString().toLowerCase();
            const registeredDate = (patient.registeredDate || "").toLowerCase();
            const address = (patient.address || "").toLowerCase();
            
            return name.includes(searchLower) ||
                   contact.includes(searchLower) ||
                   id.includes(searchLower) ||
                   email.includes(searchLower) ||
                   age.includes(searchLower) ||
                   registeredDate.includes(searchLower) ||
                   address.includes(searchLower);
        });
        
        // Sort by registration date (most recent first)
        return filtered.sort((a, b) => {
            const dateA = a.registeredDate && a.registeredDate !== "N/A" 
                ? new Date(a.registeredDate.split("/").reverse().join("-")) 
                : new Date(0);
            const dateB = b.registeredDate && b.registeredDate !== "N/A" 
                ? new Date(b.registeredDate.split("/").reverse().join("-")) 
                : new Date(0);
            return dateB - dateA; // Most recent first
        });
    }, [allPatients, filters]);

    // Fetch appointments from API
    const fetchAppointments = useCallback(async () => {
        setIsLoadingAppointments(true);
        const abortController = new AbortController();
        
        try {
            const response = await axios.get(
                getApiUrl("appointments"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000, // Get all appointments
                    },
                    timeout: 30000, // 30 seconds timeout
                    signal: abortController.signal
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
            // Don't show error if request was cancelled
            if (axios.isCancel(error) || error.name === 'AbortError') {
                return;
            }
            
            console.error("Error fetching appointments:", error);
            
            // Better error messages
            let errorMessage = "Failed to fetch appointments";
            if (error.code === "ECONNABORTED") {
                errorMessage = "Request timeout. Please check your connection and try again.";
            } else if (!error.response) {
                errorMessage = "Network error. Please check your internet connection.";
            } else {
                errorMessage = error.response?.data?.message || error.message || errorMessage;
            }
            
            toast.error(errorMessage);
            // Fallback to mock data if API fails
            setAppointments(mockAppointments);
        } finally {
            setIsLoadingAppointments(false);
        }
        
        // Cleanup function to cancel request if component unmounts
        return () => {
            abortController.abort();
        };
    }, []);


    // Fetch IPD walk-in patients (inpatient records created via Walk-in Hub)
    const fetchIpdWalkIns = useCallback(async () => {
        setIsLoadingIpdWalkIns(true);
        try {
            const response = await axios.get(
                getApiUrl("inpatients"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000, // Get all inpatients
                        status: "Admitted" // Only show currently admitted patients
                    }
                }
            );

            if (response.data.success) {
                const inpatientsData = response.data.data?.data || response.data.data || [];
                
                // Filter only walk-in inpatients (those with reason containing "Walk-in Hub")
                const walkInInpatients = inpatientsData.filter(ip => 
                    ip.reason && ip.reason.includes("Walk-in Hub")
                );

                // Transform IPD walk-ins to match appointment structure for display
                const transformedIpdWalkIns = walkInInpatients.map((ip) => ({
                    id: `ipd-${ip._id}`, // Prefix to distinguish from appointments
                    name: ip.patient?.user?.name || "Unknown",
                    appointmentDateTime: ip.admissionDate
                        ? `${new Date(ip.admissionDate).toISOString().split("T")[0]} ${new Date(ip.admissionDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}`
                        : "N/A",
                    doctor: ip.doctor?.user?.name || "N/A",
                    doctorId: ip.doctor?._id || ip.doctor || "",
                    contact: ip.patient?.user?.phone || "N/A",
                    disease: ip.reason || "Admitted via Walk-in Hub",
                    status: ip.status === "Admitted" ? "Admitted" : ip.status || "Admitted",
                    patientProfileId: ip.patient?._id || ip.patient || "",
                    invoiceId: null,
                    invoiceNumber: null,
                    isIpd: true, // Flag to identify IPD walk-ins
                    inpatientId: ip._id, // Store inpatient ID
                    roomNumber: ip.roomNumber || null,
                    bedNumber: ip.bedNumber || null,
                    wardCategory: ip.wardCategory || null,
                }));

                setIpdWalkIns(transformedIpdWalkIns);
            }
        } catch (error) {
            console.error("Error fetching IPD walk-ins:", error);
            // Don't show error toast as this is optional data
        } finally {
            setIsLoadingIpdWalkIns(false);
        }
    }, []);

    useEffect(() => {
        fetchReceptionPatients();
        fetchAppointments();
        fetchIpdWalkIns();
    }, [fetchReceptionPatients, fetchAppointments, fetchIpdWalkIns]);

    useEffect(() => {
        if (activeTab === "appointments") {
            // Already fetched by initial useEffect, but kept for clarity if tab logic requires re-fetching
        }
    }, [activeTab, fetchAppointments]);

    // Filter and sort appointments by time (most recent first)
    const filteredAppointments = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let filtered = [];

        // For "Upcoming Appointments" tab, show all future appointments
        if (activeTab === "appointments") {
            if (!filters.appointmentStatus) {
                // Default: Show all future appointments
                filtered = appointments.filter((apt) => {
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
        if (filtered.length === 0) {
            if (!filters.appointmentStatus) {
                filtered = appointments;
            } else {
                filtered = appointments.filter((apt) => {
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
            }
        }

        // Apply search filter if search text is provided
        if (filters.search && filters.search.trim()) {
            const searchLower = filters.search.toLowerCase().trim();
            filtered = filtered.filter((apt) => {
                // Search across all columns: name, contact, doctor, date/time, status, disease/notes
                const name = (apt.name || "").toLowerCase();
                const contact = (apt.contact || "").toLowerCase();
                const doctor = (apt.doctor || "").toLowerCase();
                const dateTime = (apt.appointmentDateTime || "").toLowerCase();
                const status = (apt.status || "").toLowerCase();
                const disease = (apt.disease || "").toLowerCase();
                
                return name.includes(searchLower) ||
                       contact.includes(searchLower) ||
                       doctor.includes(searchLower) ||
                       dateTime.includes(searchLower) ||
                       status.includes(searchLower) ||
                       disease.includes(searchLower);
            });
        }

        // Sort by appointment date/time (most recent first)
        return filtered.sort((a, b) => {
            try {
                const dateA = new Date(a.appointmentDateTime);
                const dateB = new Date(b.appointmentDateTime);
                return dateB - dateA; // Most recent first
            } catch {
                return 0;
            }
        });
    }, [appointments, filters.appointmentStatus, filters.search, activeTab]);

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
            // If it's an IPD walk-in, redirect to walk-in hub instead
            if (appointment.isIpd) {
                const params = new URLSearchParams({
                    patientProfileId: appointment.patientProfileId || "",
                    patientName: appointment.name || "",
                    mode: "IPD",
                });
                navigate(`/receptionist/walk-in-hub?${params.toString()}`);
                return;
            }

            // For OPD appointments, use the reschedule page
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
            doctorId: patient.primaryDoctorId || "",
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

    const formatDisplayDateTime = (dateTimeStr) => {
        if (!dateTimeStr || dateTimeStr === "N/A") return dateTimeStr;
        try {
            const [datePart, timePart] = dateTimeStr.split(" ");
            if (!datePart || !timePart) return dateTimeStr;

            let [hours, minutes] = timePart.split(":").map(Number);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const strTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ' ' + ampm;

            return `${datePart} ${strTime}`;
        } catch (e) {
            return dateTimeStr;
        }
    };

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
                                            placeholder="Search by Name, Contact, ID, Email, Age, Date..."
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
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            name="search"
                                            className="form-control"
                                            placeholder="Search by Name, Contact, Doctor, Date, Status..."
                                            value={filters.search}
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                    <div className="col-md-6 d-flex justify-content-end">
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
                                                        <td>{formatDisplayDateTime(appointment.appointmentDateTime)}</td>
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
                                <div className="row g-3 mb-4">
                                    <div className="col-md-12">
                                        <input
                                            type="text"
                                            name="search"
                                            className="form-control"
                                            placeholder="Search by Name, Contact, Doctor, Date, Status, Room/Bed..."
                                            value={filters.search}
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                {(() => {
                                    // Filter OPD walk-in appointments (those with notes containing "Walk-in Hub")
                                    const walkInAppointments = appointments.filter(apt =>
                                        apt.disease && apt.disease.includes("Walk-in Hub")
                                    );

                                    // Combine OPD walk-in appointments with IPD walk-in inpatient records
                                    const allWalkIns = [...walkInAppointments, ...ipdWalkIns];

                                    // Deduplicate by patient ID - show only the most recent walk-in per patient
                                    const patientWalkInMap = new Map();
                                    allWalkIns.forEach(walkIn => {
                                        const patientId = walkIn.patientProfileId || walkIn.inpatientId || walkIn.id;
                                        if (!patientId) return;
                                        
                                        const existing = patientWalkInMap.get(patientId);
                                        if (!existing) {
                                            patientWalkInMap.set(patientId, walkIn);
                                        } else {
                                            // Keep the most recent one (compare by date/time)
                                            try {
                                                const existingDate = new Date(existing.appointmentDateTime.split(" ")[0]);
                                                const newDate = new Date(walkIn.appointmentDateTime.split(" ")[0]);
                                                if (newDate >= existingDate) {
                                                    // Also prefer the one with the current primary doctor if available
                                                    // For now, just keep the most recent
                                                    patientWalkInMap.set(patientId, walkIn);
                                                }
                                            } catch {
                                                // If date parsing fails, keep existing
                                            }
                                        }
                                    });

                                    // Convert map back to array
                                    const deduplicatedWalkIns = Array.from(patientWalkInMap.values());

                                    // Apply search filter if search text is provided
                                    let filteredWalkIns = deduplicatedWalkIns;
                                    if (filters.search && filters.search.trim()) {
                                        const searchLower = filters.search.toLowerCase().trim();
                                        filteredWalkIns = deduplicatedWalkIns.filter((walkIn) => {
                                            // Search across all columns: name, contact, doctor, date/time, status, room/bed
                                            const name = (walkIn.name || "").toLowerCase();
                                            const contact = (walkIn.contact || "").toLowerCase();
                                            const doctor = (walkIn.doctor || "").toLowerCase();
                                            const dateTime = (walkIn.appointmentDateTime || "").toLowerCase();
                                            const status = (walkIn.status || "").toLowerCase();
                                            const roomBed = walkIn.isIpd 
                                                ? `${walkIn.roomNumber || ""} ${walkIn.bedNumber || ""}`.toLowerCase()
                                                : "";
                                            
                                            return name.includes(searchLower) ||
                                                   contact.includes(searchLower) ||
                                                   doctor.includes(searchLower) ||
                                                   dateTime.includes(searchLower) ||
                                                   status.includes(searchLower) ||
                                                   roomBed.includes(searchLower);
                                        });
                                    }

                                    // Sort by date/time (most recent first)
                                    const sortedWalkIns = filteredWalkIns.sort((a, b) => {
                                        try {
                                            const dateA = new Date(a.appointmentDateTime.split(" ")[0]);
                                            const dateB = new Date(b.appointmentDateTime.split(" ")[0]);
                                            return dateB - dateA; // Most recent first
                                        } catch {
                                            return 0;
                                        }
                                    });

                                    return sortedWalkIns.length === 0 ? (
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
                                                        <th>Date & Time</th>
                                                        <th>Doctor</th>
                                                        <th>Contact</th>
                                                        <th>Status</th>
                                                        {sortedWalkIns.some(w => w.isIpd) && <th>Room/Bed</th>}
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedWalkIns.map((appointment, index) => (
                                                        <tr key={appointment.id}>
                                                            <td>{index + 1}</td>
                                                            <td>{appointment.name}</td>
                                                            <td>{formatDisplayDateTime(appointment.appointmentDateTime)}</td>
                                                            <td>{appointment.doctor}</td>
                                                            <td>{appointment.contact}</td>
                                                            <td>
                                                                <span className={getStatusBadgeClass(appointment.status)}>
                                                                    {appointment.status}
                                                                </span>
                                                            </td>
                                                            {sortedWalkIns.some(w => w.isIpd) && (
                                                                <td>
                                                                    {appointment.isIpd ? (
                                                                        appointment.roomNumber || appointment.bedNumber ? (
                                                                            `${appointment.roomNumber ? `Room ${appointment.roomNumber}` : ''}${appointment.roomNumber && appointment.bedNumber ? ' / ' : ''}${appointment.bedNumber ? `Bed ${appointment.bedNumber}` : ''}`
                                                                        ) : (
                                                                            'N/A'
                                                                        )
                                                                    ) : (
                                                                        '-'
                                                                    )}
                                                                </td>
                                                            )}
                                                            <td>
                                                                <div className="btn-group" role="group">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-primary"
                                                                        onClick={() => handleRescheduleClick(appointment)}
                                                                        title={appointment.isIpd ? "Edit Walk-in Admission" : "Reschedule Appointment"}
                                                                        style={{
                                                                            borderRadius: "8px",
                                                                            padding: "8px 12px",
                                                                            minWidth: "45px",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            transition: "all 0.3s ease",
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
                                    );
                                })()}
                            </>
                        )}

                    </div>
                </div>
            </Box>
        </Box>
    );
}

export default Appointments_View;
