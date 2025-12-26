import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

    const navigate = useNavigate();

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
        const params = new URLSearchParams({
            patientId: patient.id || "",
            patientName: patient.name || "",
        });
        navigate(`/receptionist/appointments/schedule?${params.toString()}`);
    };

    const handleRescheduleClick = (appointment) => {
        const [date, time] = appointment.appointmentDateTime.split(" ");
        const currentDoctor = doctors.find((d) => d.user.name === appointment.doctor);
        const params = new URLSearchParams({
            appointmentId: appointment.id || "",
            patientName: appointment.patientName || appointment.name || "",
            doctorId: currentDoctor?._id || "",
            date: date || "",
            time: time || "",
        });
        navigate(`/receptionist/appointments/reschedule?${params.toString()}`);
    };

    const handleViewPatientClick = (patient) => {
        const params = new URLSearchParams({
            patientId: patient.id || "",
            patientName: patient.name || "",
            contact: patient.contact || "",
            email: patient.email || "",
            gender: patient.gender || "",
            age: (patient.age || "").toString(),
            address: patient.address || "",
            registeredDate: patient.registeredDate || "",
            disease: patient.disease || "",
        });
        navigate(`/receptionist/appointments/view-patient?${params.toString()}`);
    };

    const handleSendMessageClick = (patient) => {
        const params = new URLSearchParams({
            patientId: patient.id || "",
            patientName: patient.name || "",
            contact: patient.contact || "",
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
                                        onClick={() => navigate("/receptionist/appointments/schedule-therapy")}
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
        </Box>
    );
}

export default Appointments_View;
