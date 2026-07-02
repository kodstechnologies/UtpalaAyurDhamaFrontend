import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    CircularProgress,
    TablePagination,
    Button
} from "@mui/material";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import SearchIcon from "@mui/icons-material/Search";
import doctorService from "../../../services/doctorService";
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
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import familyMemberService from "../../../services/familyMemberService";



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
        doctorId: "",
    });
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await doctorService.getAllDoctorProfiles();
                if (response.success) {
                    setDoctors(response.data || []);
                }
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };
        fetchDoctors();
    }, []);
    const [allPatients, setAllPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
    const [ipdWalkIns, setIpdWalkIns] = useState([]);
    const [isLoadingIpdWalkIns, setIsLoadingIpdWalkIns] = useState(false);
    const [walkInPatients, setWalkInPatients] = useState([]);
    const [isLoadingWalkInPatients, setIsLoadingWalkInPatients] = useState(false);
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 25,
        total: 0,
    });

    // Pagination state for patients table
    const [patientsPagination, setPatientsPagination] = useState({
        page: 0,
        rowsPerPage: 25,
        total: 0,
    });

    // Pagination state for walk-in patients table
    const [walkInPagination, setWalkInPagination] = useState({
        page: 0,
        rowsPerPage: 25,
        total: 0,
    });
    const [deletingPatientId, setDeletingPatientId] = useState(null);
    const [deletingAppointmentId, setDeletingAppointmentId] = useState(null);

    const handleAddFamilyMemberClick = (patient) => {
        navigate("/receptionist/appointments/add-family-member", {
            state: { primaryPatient: patient }
        });
    };

    const navigate = useNavigate();

    // Fetch reception patients from API
    const fetchReceptionPatients = useCallback(async () => {
        setIsLoading(true);
        const abortController = new AbortController();

        try {
            const params = {
                page: patientsPagination.page + 1, // Backend uses 1-based pagination
                limit: patientsPagination.rowsPerPage,
            };

            // Add search parameter if search is active
            if (filters.search && filters.search.trim() && activeTab === "allPatients") {
                params.search = filters.search.trim();
            }

            const response = await axios.get(
                getApiUrl("reception-patients"),
                {
                    headers: getAuthHeaders(),
                    params,
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
                    ageUnit: patient.ageUnit || "years",
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
                    primaryPatientName: patient.primaryPatientName || patient.mainPatient?.user?.name || null,
                    mainPatient: patient.mainPatient || null,
                    familyMemberId: patient.isFamilyMember ? patient._id : null,
                    primaryDoctorId: patient.patientProfile?.primaryDoctor?._id || patient.patientProfile?.primaryDoctor || "",
                }));
                setAllPatients(transformedPatients);

                // Update pagination metadata
                if (response.data.meta) {
                    setPatientsPagination(prev => ({
                        ...prev,
                        total: response.data.meta.total || transformedPatients.length,
                    }));
                }
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
    }, [patientsPagination.page, patientsPagination.rowsPerPage, filters.search, filters.doctorId, activeTab]);



    // Breadcrumb Data
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Receptionist", url: "/receptionist/dashboard" },
        { label: "Appointments" },
    ];

    // Calculate statistics (use pagination total for Total Patients, not current page length)
    const statistics = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
            totalPatients: patientsPagination.total ?? allPatients.length,
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
    }, [patientsPagination.total, allPatients, appointments]);

    // Filter and sort patients by registration time (most recent first)
    // Note: Server-side pagination is used, so allPatients already contains only the current page's data
    // We only need to sort and apply client-side filtering if search is NOT active (for other tabs)
    const filteredPatients = useMemo(() => {
        let currentPatients = [...allPatients];

        if (activeTab === "allPatients" && filters.doctorId) {
            currentPatients = currentPatients.filter(
                (patient) => patient.primaryDoctorId === filters.doctorId || patient.doctorId === filters.doctorId || patient.doctor?._id === filters.doctorId
            );
        }

        // For "All Registered Patients" tab, data is already paginated from server
        // Just sort by registration date (most recent first)
        if (activeTab === "allPatients") {
            return currentPatients.sort((a, b) => {
                const dateA = a.registeredDate && a.registeredDate !== "N/A"
                    ? new Date(a.registeredDate.split("/").reverse().join("-"))
                    : new Date(0);
                const dateB = b.registeredDate && b.registeredDate !== "N/A"
                    ? new Date(b.registeredDate.split("/").reverse().join("-"))
                    : new Date(0);
                return dateB - dateA; // Most recent first
            });
        }

        // For other tabs, apply client-side filtering if needed
        const filtered = allPatients.filter((patient) => {
            if (!filters.search || !filters.search.trim()) {
                return true;
            }

            const searchLower = filters.search.toLowerCase().trim();
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
    }, [allPatients, filters, activeTab]);

    // Fetch appointments from API
    const fetchAppointments = useCallback(async () => {
        setIsLoadingAppointments(true);
        const abortController = new AbortController();

        try {
            const params = {
                page: pagination.page + 1, // Backend uses 1-based pagination
                limit: pagination.rowsPerPage,
            };

            // Add search parameter if search is active
            if (filters.search && filters.search.trim() && activeTab === "appointments") {
                params.search = filters.search.trim();
            }

            // Add doctor filter if provided
            if (filters.doctorId) {
                params.doctorId = filters.doctorId;
            }

            const response = await axios.get(
                getApiUrl("appointments"),
                {
                    headers: getAuthHeaders(),
                    params,
                    timeout: 30000, // 30 seconds timeout
                    signal: abortController.signal
                }
            );

            if (response.data.success) {
                const appointmentsData = response.data.data?.appointments || response.data.data || [];

                // Transform API response to match frontend structure
                const transformedAppointments = appointmentsData.map((apt) => {
                    const doctorFromUser = apt.doctor?.user?.name;
                    const doctorFromProfile =
                        apt.doctor && (apt.doctor.name ||
                            [apt.doctor.firstName, apt.doctor.lastName].filter(Boolean).join(" ").trim());
                    const doctorName = doctorFromUser || doctorFromProfile || apt.doctorName || "N/A";

                    return ({
                        id: apt._id,
                        name: apt.patient?.user?.name || apt.patientName || "Unknown",
                        appointmentDateTime: apt.appointmentDate && apt.appointmentTime
                            ? `${new Date(apt.appointmentDate).toISOString().split("T")[0]} ${apt.appointmentTime}`
                            : apt.appointmentDateTime || "N/A",
                        doctor: doctorName,
                        doctorId: apt.doctor?._id || apt.doctor || "", // Store doctor ID for rescheduling
                        contact: apt.patient?.user?.phone || apt.contact || "N/A",
                        disease: apt.notes || apt.disease || "N/A",
                        status: apt.status || "Scheduled",
                        patientProfileId: apt.patient?._id || apt.patient || "",
                        invoiceId: apt.invoice?._id || apt.invoiceId || null,
                        invoiceNumber: apt.invoice?.invoiceNumber || apt.invoiceNumber || null,
                    });
                });

                setAppointments(transformedAppointments);

                // Update pagination metadata
                if (response.data.meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.data.meta.total || 0,
                    }));
                }
            } else {
                toast.error(response.data.message || "Failed to fetch appointments");
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
        } finally {
            setIsLoadingAppointments(false);
        }

        // Cleanup function to cancel request if component unmounts
        return () => {
            abortController.abort();
        };
    }, [pagination.page, pagination.rowsPerPage, filters.search, filters.appointmentStatus, filters.doctorId, activeTab]);


    // Fetch Walk-in patients (OPD + IPD) from dedicated API
    const fetchIpdWalkIns = useCallback(async () => {
        setIsLoadingWalkInPatients(true);
        try {
            const params = {
                page: walkInPagination.page + 1,
                limit: walkInPagination.rowsPerPage,
            };

            if (filters.search && filters.search.trim() && activeTab === "walkIn") {
                params.search = filters.search.trim();
            }

            if (filters.doctorId) {
                params.doctorId = filters.doctorId;
            }

            const response = await axios.get(getApiUrl("walk-in/patients"), {
                headers: getAuthHeaders(),
                params,
            });

            if (response.data.success) {
                const data = response.data.data || [];
                setWalkInPatients(data);

                if (response.data.meta) {
                    setWalkInPagination(prev => ({
                        ...prev,
                        total: response.data.meta.total || data.length,
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching walk-in patients:", error);
        } finally {
            setIsLoadingWalkInPatients(false);
        }
    }, [walkInPagination.page, walkInPagination.rowsPerPage, filters.search, filters.doctorId, activeTab]);

    useEffect(() => {
        fetchReceptionPatients();
        fetchAppointments();
        fetchIpdWalkIns();
    }, [fetchReceptionPatients, fetchAppointments, fetchIpdWalkIns]);

    useEffect(() => {
        if (activeTab === "appointments") {
            setPagination(prev => ({ ...prev, page: 0 }));
        }
        if (activeTab === "allPatients") {
            setPatientsPagination(prev => ({ ...prev, page: 0 }));
        }
        if (activeTab === "walkIn") {
            setWalkInPagination(prev => ({ ...prev, page: 0 }));
        }
    }, [filters.appointmentStatus, filters.search, filters.doctorId, activeTab]);

    // Filter and sort appointments by time (most recent first)
    // Note: Server-side search is now used, so this only handles client-side filtering for status
    const filteredAppointments = useMemo(() => {
        let filtered = appointments;

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (activeTab === "appointments") {
            if (!filters.appointmentStatus) {
                // Default: Show all future appointments
                filtered = filtered.filter((apt) => {
                    try {
                        const [dateStr] = apt.appointmentDateTime.split(" ");
                        if (!dateStr) return false;
                        const appointmentDate = new Date(dateStr);
                        appointmentDate.setHours(0, 0, 0, 0);
                        return appointmentDate >= now && apt.status !== "Cancelled" && apt.status !== "Completed";
                    } catch {
                        return false;
                    }
                });
            } else {
                filtered = filtered.filter((apt) => {
                    try {
                        const [dateStr] = apt.appointmentDateTime.split(" ");
                        if (!dateStr) return false;
                        const appointmentDate = new Date(dateStr);
                        appointmentDate.setHours(0, 0, 0, 0);

                        if (filters.appointmentStatus === "upcoming") {
                            return apt.status === "Scheduled" || apt.status === "Confirmed" || apt.status === "Pending";
                        } else if (filters.appointmentStatus === "ongoing") {
                            return apt.status === "Ongoing";
                        } else if (filters.appointmentStatus === "completed") {
                            return apt.status === "Completed";
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

        // Apply doctor filter
        if (filters.doctorId) {
            filtered = filtered.filter((apt) => apt.doctorId === filters.doctorId);
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
    }, [appointments, filters.appointmentStatus, filters.search, filters.doctorId, activeTab]);

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

    const handleDeletePatientClick = async (patient) => {
        const patientName = patient.name || "this patient";
        const confirmMessage = patient.isFamilyMember
            ? `Are you sure you want to remove ${patientName} from family members?`
            : `Are you sure you want to delete ${patientName}? This will remove their reception registration record.`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        const deleteId = patient.familyMemberId || patient.id;
        if (!deleteId) {
            toast.error("Patient ID not found");
            return;
        }

        try {
            setDeletingPatientId(deleteId);
            if (patient.isFamilyMember) {
                const res = await familyMemberService.deleteFamilyMemberByReceptionist(deleteId);
                if (!res.success) {
                    throw new Error(res.message || "Failed to delete family member");
                }
            } else {
                const response = await axios.delete(getApiUrl(`reception-patients/${deleteId}`), {
                    headers: getAuthHeaders(),
                });
                if (!response.data?.success) {
                    throw new Error(response.data?.message || "Failed to delete patient");
                }
            }
            toast.success(`${patientName} deleted successfully`);
            await fetchReceptionPatients();
        } catch (error) {
            console.error("Error deleting patient:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to delete patient");
        } finally {
            setDeletingPatientId(null);
        }
    };

    const handleDeleteAppointmentClick = async (appointment) => {
        if (!appointment?.id) {
            toast.error("Appointment ID not found");
            return;
        }

        if (appointment.status === "Cancelled") {
            toast.info("This appointment is already cancelled");
            return;
        }

        const confirmMessage = `Are you sure you want to delete the appointment for ${appointment.name || "this patient"} on ${formatDisplayDateTime(appointment.appointmentDateTime)}?`;
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setDeletingAppointmentId(appointment.id);
            const response = await axios.patch(
                getApiUrl(`appointments/${appointment.id}/status`),
                { status: "Cancelled" },
                { headers: getAuthHeaders() }
            );
            if (!response.data?.success) {
                throw new Error(response.data?.message || "Failed to delete appointment");
            }
            toast.success("Appointment deleted successfully");
            await fetchAppointments();
        } catch (error) {
            console.error("Error deleting appointment:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to delete appointment");
        } finally {
            setDeletingAppointmentId(null);
        }
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

                    <div className="card shadow-sm mb-4" style={{ border: 'none', borderBottom: '1px solid #ddd', borderRadius: 0 }}>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Search</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><SearchIcon /></span>
                                        <input
                                            type="text"
                                            name="search"
                                            className="form-control"
                                            placeholder="Search Name, Contact, ID..."
                                            value={filters.search}
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Doctor</label>
                                    <select
                                        name="doctorId"
                                        className="form-select"
                                        value={filters.doctorId}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Doctors</option>
                                        {doctors.map((doc) => (
                                            <option key={doc._id} value={doc._id}>
                                                {`Dr. ${doc.user?.name || doc.name || "N/A"}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-body pt-0">
                        {/* All Patients Tab */}
                        {activeTab === "allPatients" && (
                            <>
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
                                                        <td>{patientsPagination.page * patientsPagination.rowsPerPage + index + 1}</td>
                                                        <td>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                                {patient.name}
                                                                {patient.isFamilyMember && (
                                                                    <span
                                                                        className="badge"
                                                                        style={{
                                                                            fontSize: "10px",
                                                                            padding: "3px 7px",
                                                                            background: "transparent",
                                                                            border: "1px solid #9c27b0",
                                                                            color: "#9c27b0",
                                                                            borderRadius: "12px",
                                                                            whiteSpace: "nowrap",
                                                                        }}
                                                                    >
                                                                        Family member of {patient.primaryPatientName || patient.mainPatient?.user?.name || ""}
                                                                        {patient.relation ? ` (${patient.relation})` : ""}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>{patient.contact}</td>
                                                        <td>
                                                            {patient.age !== "" && patient.age != null
                                                                ? patient.ageUnit === "months"
                                                                    ? `${patient.age}m`
                                                                    : `${patient.age}y`
                                                                : ""}
                                                        </td>
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
                                                                    onClick={() => handleAddFamilyMemberClick(patient)}
                                                                    title="Add Family Member"
                                                                    style={{
                                                                        backgroundColor: "#9c27b0", // Purple
                                                                        borderColor: "#9c27b0",
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
                                                                        e.currentTarget.style.backgroundColor = "#7b1fa2";
                                                                        e.currentTarget.style.transform = "translateY(-2px)";
                                                                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#9c27b0";
                                                                        e.currentTarget.style.transform = "translateY(0)";
                                                                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    }}
                                                                >
                                                                    <GroupAddIcon fontSize="small" />
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
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleDeletePatientClick(patient)}
                                                                    disabled={deletingPatientId === (patient.familyMemberId || patient.id)}
                                                                    title={patient.isFamilyMember ? "Remove Family Member" : "Delete Patient Registration"}
                                                                    style={{
                                                                        backgroundColor: "#f44336",
                                                                        borderColor: "#f44336",
                                                                        color: "#fff",
                                                                        borderRadius: "8px",
                                                                        padding: "8px 12px",
                                                                        fontWeight: 500,
                                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                        transition: "all 0.3s ease",
                                                                        minWidth: "45px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        opacity: deletingPatientId === (patient.familyMemberId || patient.id) ? 0.6 : 1,
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (deletingPatientId !== (patient.familyMemberId || patient.id)) {
                                                                            e.currentTarget.style.backgroundColor = "#d32f2f";
                                                                            e.currentTarget.style.transform = "translateY(-2px)";
                                                                            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                        }
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#f44336";
                                                                        e.currentTarget.style.transform = "translateY(0)";
                                                                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    }}
                                                                >
                                                                    {deletingPatientId === (patient.familyMemberId || patient.id) ? (
                                                                        <CircularProgress size={18} sx={{ color: "#fff" }} />
                                                                    ) : (
                                                                        <DeleteIcon fontSize="small" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Pagination for Patients Table */}
                                {!isLoading && (filteredPatients.length > 0 || patientsPagination.total > 0) && (
                                    <TablePagination
                                        component="div"
                                        count={patientsPagination.total || filteredPatients.length}
                                        page={patientsPagination.page}
                                        rowsPerPage={patientsPagination.rowsPerPage}
                                        onPageChange={(_, newPage) => setPatientsPagination(prev => ({ ...prev, page: newPage }))}
                                        onRowsPerPageChange={(e) => {
                                            setPatientsPagination(prev => ({
                                                ...prev,
                                                rowsPerPage: parseInt(e.target.value, 10),
                                                page: 0
                                            }));
                                        }}
                                        rowsPerPageOptions={[10, 25, 50, 100]}
                                        labelRowsPerPage="Rows per page:"
                                        sx={{ mt: 2 }}
                                    />
                                )}
                            </>
                        )}

                        {/* Appointments Tab */}
                        {activeTab === "appointments" && (
                            <>
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
                                                        <td>{pagination.page * pagination.rowsPerPage + index + 1}</td>
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
                                                                {appointment.status !== "Cancelled" && appointment.status !== "Completed" && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm"
                                                                        onClick={() => handleDeleteAppointmentClick(appointment)}
                                                                        disabled={deletingAppointmentId === appointment.id}
                                                                        title="Delete Appointment"
                                                                        style={{
                                                                            backgroundColor: "#f44336",
                                                                            borderColor: "#f44336",
                                                                            color: "#fff",
                                                                            borderRadius: "8px",
                                                                            padding: "8px 12px",
                                                                            minWidth: "45px",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            transition: "all 0.3s ease",
                                                                            opacity: deletingAppointmentId === appointment.id ? 0.6 : 1,
                                                                        }}
                                                                    >
                                                                        {deletingAppointmentId === appointment.id ? (
                                                                            <CircularProgress size={18} sx={{ color: "#fff" }} />
                                                                        ) : (
                                                                            <DeleteIcon fontSize="small" />
                                                                        )}
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

                                {/* Pagination for Appointments */}
                                {!isLoadingAppointments && filteredAppointments.length > 0 && activeTab === "appointments" && (
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
                            </>
                        )}
                        {/* Walk-in Patients Tab */}
                        {activeTab === "walkIn" && (
                            <>
                                {(() => {
                                    let filteredWalkIns = walkInPatients;
                                    if (filters.search && filters.search.trim()) {
                                        const searchLower = filters.search.toLowerCase().trim();
                                        filteredWalkIns = walkInPatients.filter((walkIn) => {
                                            const name = (walkIn.name || "").toLowerCase();
                                            const contact = (walkIn.contact || "").toLowerCase();
                                            const doctor = (walkIn.doctor || "").toLowerCase();
                                            const dateTime = (walkIn.appointmentDateTime || "").toLowerCase();
                                            const status = (walkIn.status || "").toLowerCase();
                                            const roomBed = walkIn.isIpd
                                                ? `${walkIn.roomNumber || ""} ${walkIn.bedNumber || ""}`.toLowerCase()
                                                : "";
                                            return (
                                                name.includes(searchLower) ||
                                                contact.includes(searchLower) ||
                                                doctor.includes(searchLower) ||
                                                dateTime.includes(searchLower) ||
                                                status.includes(searchLower) ||
                                                roomBed.includes(searchLower)
                                            );
                                        });
                                    }

                                    if (filters.doctorId) {
                                        filteredWalkIns = filteredWalkIns.filter((walkIn) => walkIn.doctorId === filters.doctorId || walkIn.primaryDoctorId === filters.doctorId || walkIn.doctor?._id === filters.doctorId);
                                    }

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
                                                    {sortedWalkIns
                                                        .slice(
                                                            walkInPagination.page * walkInPagination.rowsPerPage,
                                                            walkInPagination.page * walkInPagination.rowsPerPage + walkInPagination.rowsPerPage
                                                        )
                                                        .map((appointment, index) => (
                                                            <tr key={appointment.id}>
                                                                <td>{walkInPagination.page * walkInPagination.rowsPerPage + index + 1}</td>
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

                                {/* Pagination for Walk-in Patients Table */}
                                {(() => {
                                    // Recalculate filteredWalkIns to get count for pagination
                                    const walkInAppointments = appointments.filter(apt =>
                                        apt.disease && apt.disease.includes("Walk-in Hub")
                                    );
                                    const allWalkIns = [...walkInAppointments, ...ipdWalkIns];
                                    const patientWalkInMap = new Map();
                                    allWalkIns.forEach(walkIn => {
                                        const patientId = walkIn.patientProfileId || walkIn.inpatientId || walkIn.id;
                                        if (!patientId) return;
                                        const existing = patientWalkInMap.get(patientId);
                                        if (!existing) {
                                            patientWalkInMap.set(patientId, walkIn);
                                        } else {
                                            try {
                                                const existingDate = new Date(existing.appointmentDateTime.split(" ")[0]);
                                                const newDate = new Date(walkIn.appointmentDateTime.split(" ")[0]);
                                                if (newDate >= existingDate) {
                                                    patientWalkInMap.set(patientId, walkIn);
                                                }
                                            } catch {
                                                // Keep existing if date parsing fails
                                            }
                                        }
                                    });
                                    const totalWalkIns = walkInPatients.length;

                                    return totalWalkIns > walkInPagination.rowsPerPage ? (
                                        <TablePagination
                                            component="div"
                                            count={totalWalkIns}
                                            page={walkInPagination.page}
                                            rowsPerPage={walkInPagination.rowsPerPage}
                                            onPageChange={(_, newPage) => setWalkInPagination(prev => ({ ...prev, page: newPage }))}
                                            onRowsPerPageChange={(e) => {
                                                setWalkInPagination(prev => ({
                                                    ...prev,
                                                    rowsPerPage: parseInt(e.target.value, 10),
                                                    page: 0
                                                }));
                                            }}
                                            rowsPerPageOptions={[10, 25, 50, 100]}
                                            labelRowsPerPage="Rows per page:"
                                            sx={{ mt: 2 }}
                                        />
                                    ) : null;
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
