import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, CircularProgress, Grid, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, IconButton } from "@mui/material";
import { toast } from "react-toastify";
import MessageIcon from "@mui/icons-material/Message";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupsIcon from "@mui/icons-material/Groups";
import familyMemberService from "../../../services/familyMemberService";

function ViewPatientPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");

    const [patient, setPatient] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [examinations, setExaminations] = useState([]); // For walk-in doctor assignments (OPD)
    const [ipdExaminations, setIpdExaminations] = useState([]); // For IPD examinations
    const [doctors, setDoctors] = useState([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [familyMembers, setFamilyMembers] = useState([]);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get(getApiUrl("doctors"), { headers: getAuthHeaders() });
            if (response.data.success) {
                setDoctors(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const fetchClinicalData = async (profileId) => {
        try {
            // First, check if patient has an active inpatient record
            let inpatientId = null;
            try {
                const inpatientsRes = await axios.get(
                    getApiUrl(`inpatients/patient/${profileId}`),
                    { headers: getAuthHeaders() }
                );
                if (inpatientsRes.data.success) {
                    const inpatientsList = inpatientsRes.data.data || [];
                    // Handle both array and single object responses
                    const inpatientsArray = Array.isArray(inpatientsList) ? inpatientsList : [inpatientsList].filter(Boolean);
                    const activeInpatient = inpatientsArray.find(ip => ip && (ip.status === "Admitted" || ip.status === "admitted"));
                    if (activeInpatient) {
                        inpatientId = activeInpatient._id;
                        console.log("[ViewPatient] Found active inpatient:", inpatientId);
                    } else {
                        console.log("[ViewPatient] No active inpatient found. Statuses:", inpatientsArray.map(ip => ip?.status));
                    }
                }
            } catch (inpatientErr) {
                // Patient might not have an inpatient record, which is fine
                console.log("[ViewPatient] Error checking inpatient record:", inpatientErr.message);
            }

            // Fetch OPD examinations, appointments, and sessions
            // Fetch appointments with multiple statuses (Scheduled, Confirmed, Ongoing) - backend may need to handle this
            // For now, fetch all appointments and filter on frontend
            const [apptRes, sessionRes, examRes] = await Promise.all([
                axios.get(getApiUrl(`appointments?patientId=${profileId}`), { headers: getAuthHeaders() }), // Remove status filter to get all
                axios.get(getApiUrl(`therapist-sessions?patientId=${profileId}&limit=5`), { headers: getAuthHeaders() }),
                axios.get(getApiUrl(`examinations?patientId=${profileId}&limit=5&hasInpatient=false`), { headers: getAuthHeaders() })
            ]);

            if (apptRes.data.success) {
                const allAppointments = apptRes.data.data || [];
                console.log("[ViewPatient] All appointments fetched:", allAppointments.length, allAppointments.map(a => ({
                    date: a.appointmentDate,
                    status: a.status,
                    doctor: a.doctor?.user?.name
                })));
                
                // Filter to show only upcoming appointments (future dates or today)
                const now = new Date();
                now.setHours(0, 0, 0, 0); // Start of today
                
                const upcomingAppointments = allAppointments
                    .filter(appt => {
                        if (!appt.appointmentDate) {
                            console.log("[ViewPatient] Appointment missing date:", appt);
                            return false;
                        }
                        const apptDate = new Date(appt.appointmentDate);
                        apptDate.setHours(0, 0, 0, 0);
                        const isUpcoming = apptDate >= now;
                        // Include Scheduled, Confirmed, and Ongoing statuses (exclude Completed, Cancelled, No Show)
                        const isValidStatus = ["Scheduled", "Confirmed", "Ongoing"].includes(appt.status);
                        
                        if (!isUpcoming) {
                            console.log("[ViewPatient] Appointment is in the past:", appt.appointmentDate, "vs", now);
                        }
                        if (!isValidStatus) {
                            console.log("[ViewPatient] Appointment has invalid status:", appt.status);
                        }
                        
                        return isUpcoming && isValidStatus;
                    })
                    .sort((a, b) => {
                        // Sort by date (earliest first)
                        const dateA = new Date(a.appointmentDate || 0);
                        const dateB = new Date(b.appointmentDate || 0);
                        return dateA - dateB;
                    });
                
                console.log("[ViewPatient] Upcoming appointments filtered:", upcomingAppointments.length, upcomingAppointments.map(a => ({
                    date: a.appointmentDate,
                    status: a.status,
                    doctor: a.doctor?.user?.name
                })));
                setAppointments(upcomingAppointments);
            } else {
                console.log("[ViewPatient] Failed to fetch appointments:", apptRes.data);
            }
            if (sessionRes.data.success) {
                // Filter by patient ID to ensure data accuracy (prevent backend leakage)
                const filteredSessions = (sessionRes.data.data || []).filter(s =>
                    (s.patient?._id === profileId) ||
                    (s.patient === profileId) ||
                    (s.patient?.patientId === profileId)
                );
                setSessions(filteredSessions);
            }
            if (examRes.data.success) {
                // Filter examinations by patient ID and get unbilled ones (recent walk-in visits)
                const filteredExams = (examRes.data.data || []).filter(e =>
                    ((e.patient?._id === profileId) || (e.patient === profileId)) &&
                    !e.isBilled // Only show unbilled examinations (recent walk-in visits)
                );
                setExaminations(filteredExams);
            }

            // If patient has an active inpatient record, fetch IPD examinations
            if (inpatientId) {
                try {
                    const ipdExamRes = await axios.get(
                        getApiUrl(`examinations/inpatient/${inpatientId}`),
                        { headers: getAuthHeaders() }
                    );
                    if (ipdExamRes.data.success) {
                        const ipdExams = ipdExamRes.data.data || [];
                        // Sort by date (newest first) - prioritize updatedAt for billing edits
                        const sortedIpdExams = Array.isArray(ipdExams) 
                            ? ipdExams.sort((a, b) => {
                                const dateA = new Date(a.updatedAt || a.createdAt || 0);
                                const dateB = new Date(b.updatedAt || b.createdAt || 0);
                                return dateB - dateA; // Descending order (newest first)
                            })
                            : [];
                        console.log("[ViewPatient] IPD examinations fetched:", sortedIpdExams.length, "Latest doctor:", sortedIpdExams[0]?.doctor?.user?.name || sortedIpdExams[0]?.doctor);
                        setIpdExaminations(sortedIpdExams);
                    }
                } catch (ipdExamErr) {
                    console.error("[ViewPatient] Error fetching IPD examinations:", ipdExamErr);
                    setIpdExaminations([]);
                }
            } else {
                console.log("[ViewPatient] No active inpatient record found for patient:", profileId);
                setIpdExaminations([]);
            }
        } catch (error) {
            console.error("Error fetching clinical data:", error);
        }
    };

    const fetchPatientDetails = useCallback(async () => {
        if (!patientId) {
            toast.error("Patient ID is required");
            navigate("/receptionist/appointments");
            return;
        }

        setIsLoading(true);
        const abortController = new AbortController();
        
        try {
            const response = await axios.get(
                getApiUrl(`reception-patients/${patientId}`),
                { 
                    headers: getAuthHeaders(),
                    timeout: 30000, // 30 seconds timeout
                    signal: abortController.signal
                }
            );

            if (response.data.success) {
                const patientData = response.data.data;
                setPatient(patientData);

                // Fetch clinical data using patientProfile ID if available
                if (patientData.patientProfile?._id) {
                    await fetchClinicalData(patientData.patientProfile._id);
                }

                // Fetch family members using patient's user ID
                const userId = patientData.patientProfile?.user?._id || patientData.patientProfile?.user || patientData.user?._id;
                if (userId) {
                    try {
                        const familyRes = await familyMemberService.getFamilyMembersByUserId(userId);
                        if (familyRes.success) {
                            setFamilyMembers(familyRes.data || []);
                        }
                    } catch (err) {
                        console.error("[ViewPatient] Error fetching family members:", err);
                    }
                }
            } else {
                toast.error(response.data.message || "Failed to fetch patient details");
                navigate("/receptionist/appointments");
            }
        } catch (error) {
            // Don't show error if request was cancelled
            if (axios.isCancel(error) || error.name === 'AbortError') {
                return;
            }
            
            console.error("Error fetching patient details:", error);
            
            // Better error messages
            let errorMessage = "Failed to fetch patient details";
            if (error.code === "ECONNABORTED") {
                errorMessage = "Request timeout. Please check your connection and try again.";
            } else if (!error.response) {
                errorMessage = "Network error. Please check your internet connection.";
            } else {
                errorMessage = error.response?.data?.message || error.message || errorMessage;
            }
            
            toast.error(errorMessage);
            navigate("/receptionist/appointments");
        } finally {
            setIsLoading(false);
        }
        
        // Cleanup function to cancel request if component unmounts
        return () => {
            abortController.abort();
        };
    }, [patientId, navigate]);

    useEffect(() => {
        fetchPatientDetails();
        fetchDoctors();
    }, [fetchPatientDetails]);

    const handleEditDoctor = () => {
        setSelectedDoctorId(patient.patientProfile?.primaryDoctor?._id || "");
        setEditDialogOpen(true);
    };

    const handleUpdateDoctor = async () => {
        if (!patient.patientProfile?._id) return;

        setIsUpdating(true);
        try {
            const response = await axios.patch(
                getApiUrl(`patients/${patient.patientProfile._id}`),
                { primaryDoctor: selectedDoctorId || null },
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success("Primary doctor updated successfully!");
                setEditDialogOpen(false);
                await fetchPatientDetails(); // Refresh patient data
            } else {
                throw new Error(response.data.message || "Failed to update doctor");
            }
        } catch (error) {
            console.error("Error updating doctor:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to update doctor");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteFamilyMember = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove ${name} from family members?`)) {
            return;
        }

        try {
            const res = await familyMemberService.deleteFamilyMemberByReceptionist(id);
            if (res.success) {
                toast.success(`${name} removed successfully`);
                // Update local state to reflect deletion
                setFamilyMembers(prev => prev.filter(m => m._id !== id));
            } else {
                toast.error(res.message || "Failed to remove family member");
            }
        } catch (err) {
            console.error("Error deleting family member:", err);
            toast.error(err.response?.data?.message || err.message || "Failed to remove family member");
        }
    };

    return (
        <div>
            <HeadingCard
                title="View Patient Details"
                subtitle="View and update patient information"
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "View Patient" },
                ]}
            />

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            ) : patient ? (
                <Box
                    sx={{
                        backgroundColor: "var(--color-bg-a)",
                        borderRadius: "12px",
                        p: 3,
                        mt: 2,
                        maxWidth: "800px",
                        mx: "auto",
                    }}
                >
                    {/* Basic Info Section */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField label="Patient Name" fullWidth value={patient.patientName || ""} InputProps={{ readOnly: true }} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Contact Number" fullWidth value={patient.contactNumber || ""} InputProps={{ readOnly: true }} variant="outlined" />
                        </Grid>
                        {patient.alternativeNumber && (
                            <Grid item xs={12} md={6}>
                                <TextField label="Alternative Number" fullWidth value={patient.alternativeNumber || ""} InputProps={{ readOnly: true }} variant="outlined" />
                            </Grid>
                        )}
                        <Grid item xs={12} md={6}>
                            <TextField label="Email" fullWidth value={patient.email || ""} InputProps={{ readOnly: true }} variant="outlined" />
                        </Grid>
                        {patient.age && (
                            <Grid item xs={12} md={6}>
                                <TextField label="Age" fullWidth type="number" value={patient.age || ""} InputProps={{ readOnly: true }} variant="outlined" />
                            </Grid>
                        )}
                        {patient.address && (
                            <Grid item xs={12}>
                                <TextField label="Address" fullWidth multiline rows={2} value={patient.address || ""} InputProps={{ readOnly: true }} variant="outlined" />
                            </Grid>
                        )}
                        <Grid item xs={12} md={6}>
                            <TextField label="UHID" fullWidth value={patient.patientProfile?.user?.uhid || "Not assigned"} InputProps={{ readOnly: true }} variant="outlined" />
                        </Grid>
                        {patient.patientProfile?.patientId && (
                            <Grid item xs={12} md={6}>
                                <TextField label="Patient ID" fullWidth value={patient.patientProfile.patientId || ""} InputProps={{ readOnly: true }} variant="outlined" />
                            </Grid>
                        )}
                    </Grid>

                    <hr style={{ margin: "24px 0", opacity: 0.1 }} />

                    {/* Clinical Status Section */}
                    <Typography variant="h6" sx={{ mb: 2, color: "var(--color-primary-a)", fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
                        <MedicalServicesIcon /> Clinical Status
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Primary Doctor */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: "8px", height: "100%" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                    <Typography variant="subtitle2" color="textSecondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <PersonIcon fontSize="small" /> Primary Doctor
                                    </Typography>
                                </Box>
                                {(() => {
                                    // Use the EXACT same logic as Upcoming Appointment section
                                    const primaryDoctor = patient.patientProfile?.primaryDoctor;
                                    const primaryDoctorName = primaryDoctor 
                                        ? `Dr. ${primaryDoctor.firstName} ${primaryDoctor.lastName}`
                                        : null;
                                    
                                    // Get doctor from same sources as Upcoming Appointment section
                                    // Priority: IPD exam doctor > OPD exam doctor > appointment doctor > primary doctor
                                    const ipdExamDoctor = ipdExaminations.length > 0 ? ipdExaminations[0].doctor : null;
                                    const examDoctor = examinations.length > 0 ? examinations[0].doctor : null;
                                    
                                    // Use the EXACT same logic as Upcoming Appointment section
                                    let doctorName = "None assigned";
                                    
                                    // If there's an appointment, use appointment doctor (same as Upcoming Appointment section)
                                    if (appointments.length > 0) {
                                        const appt = appointments[0];
                                        doctorName = appt.doctor?.user?.name || primaryDoctorName || "Assigned Doctor";
                                    }
                                    // Otherwise check IPD examinations
                                    else if (ipdExamDoctor) {
                                        doctorName = ipdExamDoctor?.user?.name || ipdExamDoctor?.name || primaryDoctorName || "Assigned Doctor";
                                    }
                                    // Then check OPD examinations
                                    else if (examDoctor) {
                                        doctorName = examDoctor?.user?.name || examDoctor?.name || primaryDoctorName || "Assigned Doctor";
                                    }
                                    // Finally use primary doctor
                                    else if (primaryDoctorName) {
                                        doctorName = primaryDoctorName;
                                    }
                                    
                                    // Get the doctor object for specialization
                                    const doctor = ipdExamDoctor || examDoctor || (appointments.length > 0 ? appointments[0].doctor : null) || primaryDoctor;
                                    const doctorSpecialization = doctor?.specialization;
                                    
                                    // Get examination date/time for walk-in patients (prefer IPD exam date)
                                    const examDate = ipdExaminations.length > 0 
                                        ? ipdExaminations[0].createdAt 
                                        : (examinations.length > 0 ? examinations[0].createdAt : null);
                                    
                                    return (
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {doctorName}
                                            </Typography>
                                            {doctorSpecialization && (
                                                <Typography variant="caption" color="textSecondary">
                                                    {doctorSpecialization}
                                                </Typography>
                                            )}
                                            {examDate && (
                                                <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 0.5 }}>
                                                    Walk-in: {new Date(examDate).toLocaleDateString("en-GB")}
                                                </Typography>
                                            )}
                                        </Box>
                                    );
                                })()}
                            </Box>
                        </Grid>

                        {/* Recent Appointment */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: "8px", height: "100%" }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <CalendarTodayIcon fontSize="small" /> Upcoming Appointment
                                </Typography>
                                {(() => {
                                    // Get primary doctor info for consistent display
                                    const primaryDoctor = patient.patientProfile?.primaryDoctor;
                                    const primaryDoctorName = primaryDoctor 
                                        ? `Dr. ${primaryDoctor.firstName} ${primaryDoctor.lastName}`
                                        : null;
                                    
                                    // Check for formal appointments first
                                    if (appointments.length > 0) {
                                        const appt = appointments[0];
                                        // Prefer appointment doctor (so Edit Doctor is reflected), then primary
                                        const displayDoctorName = appt.doctor?.user?.name || primaryDoctorName || "Assigned Doctor";
                                        const reminderDoctorName = appt.doctor?.user?.name || (primaryDoctor 
                                            ? `${primaryDoctor.firstName} ${primaryDoctor.lastName}`
                                            : "Doctor");
                                        
                                        return (
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {new Date(appt.appointmentDate).toLocaleDateString("en-GB")} {appt.appointmentTime ? `at ${appt.appointmentTime}` : ""}
                                                    </Typography>
                                                    <Typography variant="body2" color="primary">
                                                        {displayDoctorName}
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<MessageIcon />}
                                                    sx={{ textTransform: "none", borderRadius: "20px" }}
                                                    onClick={() => {
                                                        const params = new URLSearchParams({
                                                            patientId,
                                                            patientName: patient.patientName,
                                                            contact: patient.contactNumber,
                                                            doctorName: reminderDoctorName,
                                                            date: new Date(appt.appointmentDate).toLocaleDateString("en-GB"),
                                                            time: appt.appointmentTime || ""
                                                        });
                                                        navigate(`/receptionist/appointments/whatsapp?${params.toString()}`);
                                                    }}
                                                >
                                                    Send Reminder
                                                </Button>
                                            </Box>
                                        );
                                    }
                                    
                                    // If no formal appointments, check for walk-in examinations with doctor
                                    // Prefer IPD examinations over OPD examinations
                                    const examToUse = ipdExaminations.length > 0 ? ipdExaminations[0] : (examinations.length > 0 ? examinations[0] : null);
                                    if (examToUse) {
                                        const exam = examToUse;
                                        const examDate = exam.createdAt || exam.appointment?.appointmentDate;
                                        const examTime = exam.appointment?.appointmentTime || "";
                                        
                                        // Prefer examination doctor (so Edit Doctor in billing is reflected), then primary
                                        const primaryDoctor = patient.patientProfile?.primaryDoctor;
                                        const examDoctor = exam.doctor;
                                        
                                        let doctorName = "Assigned Doctor";
                                        if (examDoctor) {
                                            doctorName = examDoctor?.user?.name || examDoctor?.name || (examDoctor.firstName && examDoctor.lastName ? `Dr. ${examDoctor.firstName} ${examDoctor.lastName}` : "Assigned Doctor");
                                        } else if (primaryDoctor) {
                                            doctorName = `Dr. ${primaryDoctor.firstName} ${primaryDoctor.lastName}`;
                                        }
                                        
                                        return (
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {examDate ? new Date(examDate).toLocaleDateString("en-GB") : "Today"} {examTime ? `at ${examTime}` : ""}
                                                    </Typography>
                                                    <Typography variant="body2" color="primary">
                                                        {doctorName}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 0.5 }}>
                                                        Walk-in Visit
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<MessageIcon />}
                                                    sx={{ textTransform: "none", borderRadius: "20px" }}
                                                    onClick={() => {
                                                        const doctorNameForReminder = (examDoctor?.user?.name || examDoctor?.name || (examDoctor?.firstName && examDoctor?.lastName ? `${examDoctor.firstName} ${examDoctor.lastName}` : null))?.replace("Dr. ", "") 
                                                            || (primaryDoctor ? `${primaryDoctor.firstName} ${primaryDoctor.lastName}` : "Doctor");
                                                        const params = new URLSearchParams({
                                                            patientId,
                                                            patientName: patient.patientName,
                                                            contact: patient.contactNumber,
                                                            doctorName: doctorNameForReminder,
                                                            date: examDate ? new Date(examDate).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB"),
                                                            time: examTime || ""
                                                        });
                                                        navigate(`/receptionist/appointments/whatsapp?${params.toString()}`);
                                                    }}
                                                >
                                                    Send Reminder
                                                </Button>
                                            </Box>
                                        );
                                    }
                                    
                                    // No appointments or examinations
                                    return (
                                        <Typography variant="body2" color="textSecondary">No upcoming appointments</Typography>
                                    );
                                })()}
                            </Box>
                        </Grid>

                        {/* Recent Therapy */}
                        <Grid item xs={12}>
                            <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: "8px" }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <MedicalServicesIcon fontSize="small" /> Therapy / Walk-in Session
                                </Typography>
                                {sessions.length > 0 ? (
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {sessions[0].treatmentPlan?.treatmentName || "General Consultation"}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {new Date(sessions[0].sessionDate).toLocaleDateString("en-GB")} | {sessions[0].sessionTime}
                                            </Typography>
                                            <Typography variant="caption" color="primary">
                                                Therapist: {sessions[0].therapist?.user?.name || sessions[0].therapistName || "Assigned"}
                                            </Typography>
                                        </Box>
                                        <Button
                                            size="small" variant="contained" color="info" startIcon={<MessageIcon />}
                                            sx={{ textTransform: "none", borderRadius: "20px" }}
                                            onClick={() => {
                                                const s = sessions[0];
                                                const params = new URLSearchParams({
                                                    patientId, patientName: patient.patientName, contact: patient.contactNumber,
                                                    doctorName: s.therapist?.user?.name || s.therapistName || "Therapist",
                                                    date: new Date(s.sessionDate).toLocaleDateString("en-GB"),
                                                    time: s.sessionTime
                                                });
                                                navigate(`/receptionist/appointments/whatsapp?${params.toString()}`);
                                            }}
                                        >
                                            Send Reminder
                                        </Button>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">No recent therapy sessions</Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>

                    <hr style={{ margin: "24px 0", opacity: 0.1 }} />

                    {/* Family Members Section */}
                    {familyMembers.length > 0 && (
                        <>
                            <Typography variant="h6" sx={{ mb: 2, color: "var(--color-primary-a)", fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
                                <GroupsIcon /> Family Members
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                {familyMembers.map((member) => (
                                    <Grid item xs={12} key={member._id}>
                                        <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {member.fullName} ({member.relation})
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                                                    Phone: {member.phoneNumber} | UHID: {member.user?.uhid || "Not assigned"}
                                                </Typography>
                                            </Box>
                                            <IconButton 
                                                color="error" 
                                                size="small" 
                                                onClick={() => handleDeleteFamilyMember(member._id, member.fullName)}
                                                sx={{ backgroundColor: "rgba(211, 47, 47, 0.04)", "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" } }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderRadius: "8px", px: 4 }}>Back</Button>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    Patient not found
                </Box>
            )}

            {/* Edit Doctor Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Primary Doctor</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Primary Doctor</InputLabel>
                        <Select
                            value={selectedDoctorId}
                            onChange={(e) => setSelectedDoctorId(e.target.value)}
                            label="Primary Doctor"
                        >
                            <MenuItem value="">None (Unassigned)</MenuItem>
                            {doctors.map((doctor) => (
                                <MenuItem key={doctor._id} value={doctor._id}>
                                    Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} disabled={isUpdating}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateDoctor}
                        variant="contained"
                        disabled={isUpdating}
                        sx={{ backgroundColor: "var(--color-primary-a)" }}
                    >
                        {isUpdating ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                        {isUpdating ? "Updating..." : "Update"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    );
}

export default ViewPatientPage;
