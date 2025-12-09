import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";

// Icons
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PeopleIcon from "@mui/icons-material/People";
import UpcomingIcon from "@mui/icons-material/Upcoming";
import SpaIcon from "@mui/icons-material/Spa";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import MessageIcon from "@mui/icons-material/Message";

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

const mockTherapySessions = [
    {
        id: "th-1",
        patientName: "Amit Kumar",
        therapistName: "Mr. Anand",
        treatment: "Physiotherapy",
        sessionDateTime: "2025-01-20 10:00",
        status: "Scheduled",
        patientUserId: "user-1",
    },
    {
        id: "th-2",
        patientName: "Sita Verma",
        therapistName: "Not Assigned",
        treatment: "Panchakarma",
        sessionDateTime: "Not Scheduled",
        status: "Pending",
        patientUserId: "user-2",
    },
];

const mockDoctors = [
    { _id: "doc-1", user: { name: "Dr. Sharma" } },
    { _id: "doc-2", user: { name: "Dr. Patel" } },
    { _id: "doc-3", user: { name: "Dr. Kumar" } },
];

const mockTherapists = [
    { _id: "th-1", user: { name: "Mr. Anand" } },
    { _id: "th-2", user: { name: "Ms. Geeta" } },
    { _id: "th-3", user: { name: "Dr. Suresh" } },
];

function Appointments_View() {
    const [activeTab, setActiveTab] = useState("allPatients");
    const [filters, setFilters] = useState({
        search: "",
        appointmentStatus: "",
        gender: "",
    });
    const [allPatients] = useState(mockPatients);
    const [appointments] = useState(mockAppointments);
    const [therapySessions] = useState(mockTherapySessions);
    const [doctors] = useState(mockDoctors);
    const [therapists] = useState(mockTherapists);

    // Modal states
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [isScheduleAppointmentModalOpen, setIsScheduleAppointmentModalOpen] = useState(false);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [isViewPatientModalOpen, setIsViewPatientModalOpen] = useState(false);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [isScheduleTherapyModalOpen, setIsScheduleTherapyModalOpen] = useState(false);

    // Form states
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientToSchedule, setPatientToSchedule] = useState(null);
    const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
    const [patientToView, setPatientToView] = useState(null);
    const [editingPatient, setEditingPatient] = useState(null);
    const [newAppointment, setNewAppointment] = useState({ doctor: "", date: "", time: "" });
    const [rescheduleData, setRescheduleData] = useState({ doctor: "", date: "", time: "" });
    const [newTherapySession, setNewTherapySession] = useState({
        patientId: "",
        therapistName: "",
        treatment: "",
        date: "",
        time: "",
    });
    const [newPatient, setNewPatient] = useState({
        patientName: "",
        contactNumber: "",
        email: "",
        dateOfBirth: "",
        gender: "",
        age: "",
        address: "",
        preferredDate: "",
        preferredTime: "",
        complaints: "",
    });

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
            upcomingAppointments: appointments.filter(
                (apt) => apt.status === "Upcoming" || apt.status === "Confirmed" || apt.status === "Scheduled"
            ).length,
            therapySessions: therapySessions.length,
        };
    }, [allPatients, appointments, therapySessions]);

    // Filter patients
    const filteredPatients = useMemo(() => {
        return allPatients.filter((patient) => {
            const matchesSearch =
                !filters.search ||
                patient.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                patient.contact.includes(filters.search) ||
                patient.id.includes(filters.search);
            const matchesGender = !filters.gender || patient.gender === filters.gender;
            return matchesSearch && matchesGender;
        });
    }, [allPatients, filters]);

    // Filter appointments
    const filteredAppointments = useMemo(() => {
        if (!filters.appointmentStatus) {
            return appointments;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return appointments.filter((apt) => {
            const appointmentDate = new Date(apt.appointmentDateTime.split(" ")[0]);
            appointmentDate.setHours(0, 0, 0, 0);
            if (filters.appointmentStatus === "upcoming") {
                return apt.status === "Upcoming" || (appointmentDate > today && apt.status !== "Ongoing" && apt.status !== "Completed");
            } else if (filters.appointmentStatus === "ongoing") {
                return apt.status === "Ongoing" || (appointmentDate.getTime() === today.getTime() && apt.status === "Confirmed");
            } else if (filters.appointmentStatus === "completed") {
                return apt.status === "Completed" || appointmentDate < today;
            }
            return true;
        });
    }, [appointments, filters.appointmentStatus]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleScheduleAppointmentClick = (patient) => {
        setPatientToSchedule(patient);
        setIsScheduleAppointmentModalOpen(true);
    };

    const handleRescheduleClick = (appointment) => {
        setAppointmentToReschedule(appointment);
        const [date, time] = appointment.appointmentDateTime.split(" ");
        const currentDoctor = doctors.find((d) => d.user.name === appointment.doctor);
        setRescheduleData({ doctor: currentDoctor?._id || "", date, time });
        setIsRescheduleModalOpen(true);
    };

    const handleViewPatientClick = (patient) => {
        setPatientToView(patient);
        setEditingPatient({ ...patient });
        setIsViewPatientModalOpen(true);
    };

    const handleUpdatePatient = (e) => {
        e.preventDefault();
        if (!editingPatient) return;
        toast.success(`Patient ${editingPatient.name} details updated successfully!`);
        // In real implementation, this would update the patient via API call
        // const updatedPatients = allPatients.map((p) =>
        //     p.id === editingPatient.id ? editingPatient : p
        // );
        setIsViewPatientModalOpen(false);
        setEditingPatient(null);
    };

    const handleSendMessageClick = (patient) => {
        setSelectedPatient(patient);
        setIsWhatsAppModalOpen(true);
    };

    const handleSendWhatsApp = (type) => {
        if (!selectedPatient) return;
        const phoneNumber = selectedPatient.contact.replace(/\D/g, "");
        let message = "";
        if (type === "form") {
            const formUrl = `${window.location.origin}/patient-registration-form`;
            message = `Hello ${selectedPatient.name}, please fill out your registration form here: ${formUrl}`;
        } else {
            message = `Hello ${selectedPatient.name}, this is a reminder for your upcoming appointment.`;
        }
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        setIsWhatsAppModalOpen(false);
    };

    const handleScheduleAppointmentSubmit = (e) => {
        e.preventDefault();
        if (!patientToSchedule || !newAppointment.doctor || !newAppointment.date || !newAppointment.time) {
            toast.error("Please fill all fields.");
            return;
        }
        toast.success(`Appointment scheduled for ${patientToSchedule.name}.`);
        setIsScheduleAppointmentModalOpen(false);
        setNewAppointment({ doctor: "", date: "", time: "" });
    };

    const handleRescheduleSubmit = (e) => {
        e.preventDefault();
        if (!appointmentToReschedule || !rescheduleData.date || !rescheduleData.time) {
            toast.error("Please select a new date and time.");
            return;
        }
        toast.success(`Appointment for ${appointmentToReschedule.name} has been rescheduled.`);
        setIsRescheduleModalOpen(false);
        setRescheduleData({ doctor: "", date: "", time: "" });
    };

    const handleSaveNewPatient = (e) => {
        e.preventDefault();
        toast.success(`Patient ${newPatient.patientName} has been registered successfully!`);
        setIsAddPatientModalOpen(false);
        setNewPatient({
            patientName: "",
            contactNumber: "",
            email: "",
            dateOfBirth: "",
            gender: "",
            age: "",
            address: "",
            preferredDate: "",
            preferredTime: "",
            complaints: "",
        });
    };

    const handleScheduleTherapySubmit = (e) => {
        e.preventDefault();
        const patient = allPatients.find((p) => p.id === newTherapySession.patientId);
        if (!patient) {
            toast.error("Patient not found");
            return;
        }
        toast.success(`Therapy session scheduled for ${patient.name}.`);
        setIsScheduleTherapyModalOpen(false);
        setNewTherapySession({ patientId: "", therapistName: "", treatment: "", date: "", time: "" });
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

    return (
        <Box sx={{ padding: "20px" }}>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Page Heading */}
            <HeadingCardingCard
                category="APPOINTMENTS"
                title="Appointment Management"
                subtitle="Manage appointments, patients, and therapy sessions"
                action={
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setIsAddPatientModalOpen(true)}
                        style={{
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                    >
                        <AddIcon className="me-2" />
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
                <DashboardCard title="Therapy Sessions" count={statistics.therapySessions} icon={SpaIcon} />
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
                                    className={`nav-link ${activeTab === "therapists" ? "active" : ""}`}
                                    onClick={() => setActiveTab("therapists")}
                                >
                                    <SpaIcon className="me-2" />
                                    Therapist Sessions
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
                                    <div className="col-md-4">
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
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Sl. No.</th>
                                                <th>Name</th>
                                                <th>Contact</th>
                                                <th>Gender</th>
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
                                                    <td>{patient.name}</td>
                                                    <td>{patient.contact}</td>
                                                    <td>{patient.gender}</td>
                                                    <td>{patient.age}</td>
                                                    <td>{patient.email}</td>
                                                    <td>{patient.registeredDate}</td>
                                                    <td>
                                                        <div className="d-flex gap-2" role="group">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm"
                                                                onClick={() => handleViewPatientClick(patient)}
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
                                                            >
                                                                <EventAvailableIcon fontSize="small" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm"
                                                                onClick={() => handleSendMessageClick(patient)}
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
                                        <option value="">All Appointments</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="ongoing">Ongoing (Today)</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
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
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </button>
                                                            {appointment.invoiceNumber && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-info"
                                                                    onClick={() => toast.info(`Invoice: ${appointment.invoiceNumber}`)}
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
                            </>
                        )}

                        {/* Therapist Sessions Tab */}
                        {activeTab === "therapists" && (
                            <>
                                <div className="d-flex justify-content-end mb-4">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => setIsScheduleTherapyModalOpen(true)}
                                    >
                                        <AddIcon className="me-2" />
                                        Schedule Therapy
                                    </button>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Sl. No.</th>
                                                <th>Patient Name</th>
                                                <th>Therapist</th>
                                                <th>Treatment</th>
                                                <th>Date & Time</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {therapySessions.map((session, index) => (
                                                <tr key={session.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{session.patientName}</td>
                                                    <td>{session.therapistName}</td>
                                                    <td>{session.treatment}</td>
                                                    <td>{session.sessionDateTime}</td>
                                                    <td>
                                                        <span className={getStatusBadgeClass(session.status)}>
                                                            {session.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {session.status === "Pending" && session.therapistName === "Not Assigned" ? (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => toast.info("Assign therapist functionality")}
                                                            >
                                                                Assign Therapist
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-info"
                                                                onClick={() => toast.info("View progress functionality")}
                                                            >
                                                                View
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Box>

            {/* Add Patient Modal */}
            {isAddPatientModalOpen && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: "auto", padding: "20px 0" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ margin: "auto", maxWidth: "800px" }}>
                        <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                            <div className="modal-header" style={{ flexShrink: 0 }}>
                                <h5 className="modal-title">Add Patient</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsAddPatientModalOpen(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleSaveNewPatient} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                                <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Patient Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                value={newPatient.patientName}
                                                onChange={(e) => setNewPatient({ ...newPatient, patientName: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Contact Number *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                value={newPatient.contactNumber}
                                                onChange={(e) => setNewPatient({ ...newPatient, contactNumber: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                required
                                                value={newPatient.email}
                                                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Date of Birth *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                required
                                                value={newPatient.dateOfBirth}
                                                onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Gender *</label>
                                            <select
                                                className="form-select"
                                                required
                                                value={newPatient.gender}
                                                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Age *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                required
                                                value={newPatient.age}
                                                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Address *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                value={newPatient.address}
                                                onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Preferred Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                required
                                                value={newPatient.preferredDate}
                                                onChange={(e) => setNewPatient({ ...newPatient, preferredDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Preferred Time *</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                required
                                                value={newPatient.preferredTime}
                                                onChange={(e) => setNewPatient({ ...newPatient, preferredTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Complaints</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={newPatient.complaints}
                                                onChange={(e) => setNewPatient({ ...newPatient, complaints: e.target.value })}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6", padding: "15px" }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsAddPatientModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#8B4513", borderColor: "#8B4513" }}>
                                        Register New Patient
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Appointment Modal */}
            {isScheduleAppointmentModalOpen && patientToSchedule && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: "auto" }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Schedule Appointment for {patientToSchedule.name}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsScheduleAppointmentModalOpen(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleScheduleAppointmentSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Doctor *</label>
                                        <select
                                            className="form-select"
                                            required
                                            value={newAppointment.doctor}
                                            onChange={(e) => setNewAppointment({ ...newAppointment, doctor: e.target.value })}
                                        >
                                            <option value="">Select Doctor</option>
                                            {doctors.map((d) => (
                                                <option key={d._id} value={d._id}>
                                                    {d.user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                required
                                                value={newAppointment.date}
                                                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Time *</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                required
                                                value={newAppointment.time}
                                                onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsScheduleAppointmentModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Schedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {isRescheduleModalOpen && appointmentToReschedule && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: "auto" }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reschedule Appointment for {appointmentToReschedule.name}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsRescheduleModalOpen(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleRescheduleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Doctor</label>
                                        <select
                                            className="form-select"
                                            value={rescheduleData.doctor}
                                            onChange={(e) => setRescheduleData({ ...rescheduleData, doctor: e.target.value })}
                                        >
                                            <option value="">Select Doctor (or keep current)</option>
                                            {doctors.map((d) => (
                                                <option key={d._id} value={d._id}>
                                                    {d.user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">New Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                required
                                                value={rescheduleData.date}
                                                onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">New Time *</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                required
                                                value={rescheduleData.time}
                                                onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsRescheduleModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Reschedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Patient Modal */}
            {isViewPatientModalOpen && patientToView && editingPatient && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: "auto", padding: "20px 0" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ margin: "auto", maxWidth: "800px" }}>
                        <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                            <div className="modal-header" style={{ flexShrink: 0 }}>
                                <h5 className="modal-title">View Patient Details</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setIsViewPatientModalOpen(false);
                                        setEditingPatient(null);
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleUpdatePatient} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                                <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Patient Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                value={editingPatient.name || ""}
                                                onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Contact Number *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                value={editingPatient.contact || ""}
                                                onChange={(e) => setEditingPatient({ ...editingPatient, contact: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                required
                                                value={editingPatient.email || ""}
                                                onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Date of Birth *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                required
                                                value={editingPatient.dateOfBirth || ""}
                                                onChange={(e) => setEditingPatient({ ...editingPatient, dateOfBirth: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Gender *</label>
                                            <select
                                                className="form-select"
                                                required
                                                value={editingPatient.gender || ""}
                                                onChange={(e) => setEditingPatient({ ...editingPatient, gender: e.target.value })}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Age *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                required
                                                value={editingPatient.age || ""}
                                                onChange={(e) => setEditingPatient({ ...editingPatient, age: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Address *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                value={editingPatient.address || ""}
                                                onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Preferred Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                required
                                                value={editingPatient.preferredDate || ""}
                                                onChange={(e) => setEditingPatient({ ...editingPatient, preferredDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Preferred Time *</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                required
                                                value={editingPatient.preferredTime || ""}
                                                onChange={(e) => setEditingPatient({ ...editingPatient, preferredTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Complaints</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={editingPatient.disease || editingPatient.complaints || ""}
                                                onChange={(e) => setEditingPatient({ ...editingPatient, disease: e.target.value, complaints: e.target.value })}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6", padding: "15px" }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setIsViewPatientModalOpen(false);
                                            setEditingPatient(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* WhatsApp Modal */}
            {isWhatsAppModalOpen && selectedPatient && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: "auto" }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Send Message via WhatsApp</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsWhatsAppModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Send a message to <strong>{selectedPatient.name}</strong>. You can send a data collection form link or an appointment reminder.
                                </p>
                                <div className="mb-3">
                                    <label className="form-label">WhatsApp Number</label>
                                    <input type="text" className="form-control" value={selectedPatient.contact || ""} readOnly />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsWhatsAppModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => handleSendWhatsApp("form")}
                                >
                                    Send Form Link
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-info"
                                    onClick={() => handleSendWhatsApp("reminder")}
                                >
                                    Send Reminder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Therapy Modal */}
            {isScheduleTherapyModalOpen && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: "auto" }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Schedule Therapy Session</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsScheduleTherapyModalOpen(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleScheduleTherapySubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Patient *</label>
                                        <select
                                            className="form-select"
                                            required
                                            value={newTherapySession.patientId}
                                            onChange={(e) => setNewTherapySession({ ...newTherapySession, patientId: e.target.value })}
                                        >
                                            <option value="">Select Patient</option>
                                            {allPatients.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Therapist *</label>
                                        <select
                                            className="form-select"
                                            required
                                            value={newTherapySession.therapistName}
                                            onChange={(e) => setNewTherapySession({ ...newTherapySession, therapistName: e.target.value })}
                                        >
                                            <option value="">Select Therapist</option>
                                            {therapists.map((t) => (
                                                <option key={t._id} value={t.user.name}>
                                                    {t.user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Treatment *</label>
                                        <select
                                            className="form-select"
                                            required
                                            value={newTherapySession.treatment}
                                            onChange={(e) => setNewTherapySession({ ...newTherapySession, treatment: e.target.value })}
                                        >
                                            <option value="">Select Treatment</option>
                                            <option value="Physiotherapy">Physiotherapy</option>
                                            <option value="Panchakarma">Panchakarma</option>
                                            <option value="Ayurvedic Consultation">Ayurvedic Consultation</option>
                                            <option value="Yoga Therapy">Yoga Therapy</option>
                                        </select>
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                required
                                                value={newTherapySession.date}
                                                onChange={(e) => setNewTherapySession({ ...newTherapySession, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Time *</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                required
                                                value={newTherapySession.time}
                                                onChange={(e) => setNewTherapySession({ ...newTherapySession, time: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsScheduleTherapyModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Schedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Box>
    );
}

export default Appointments_View;
