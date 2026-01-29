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

function ViewPatientPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");

    const [patient, setPatient] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

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
            const [apptRes, sessionRes] = await Promise.all([
                axios.get(getApiUrl(`appointments?patientId=${profileId}&status=Scheduled`), { headers: getAuthHeaders() }),
                axios.get(getApiUrl(`therapist-sessions?patientId=${profileId}&limit=5`), { headers: getAuthHeaders() })
            ]);

            if (apptRes.data.success) setAppointments(apptRes.data.data || []);
            if (sessionRes.data.success) {
                // Filter by patient ID to ensure data accuracy (prevent backend leakage)
                const filteredSessions = (sessionRes.data.data || []).filter(s =>
                    (s.patient?._id === profileId) ||
                    (s.patient === profileId) ||
                    (s.patient?.patientId === profileId)
                );
                setSessions(filteredSessions);
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
        try {
            const response = await axios.get(
                getApiUrl(`reception-patients/${patientId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                const patientData = response.data.data;
                setPatient(patientData);

                // Fetch clinical data using patientProfile ID if available
                if (patientData.patientProfile?._id) {
                    await fetchClinicalData(patientData.patientProfile._id);
                }
            } else {
                toast.error(response.data.message || "Failed to fetch patient details");
                navigate("/receptionist/appointments");
            }
        } catch (error) {
            console.error("Error fetching patient details:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch patient details");
            navigate("/receptionist/appointments");
        } finally {
            setIsLoading(false);
        }
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
                                    <IconButton size="small" onClick={handleEditDoctor} sx={{ color: "var(--color-primary-a)" }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {patient.patientProfile?.primaryDoctor ?
                                        `Dr. ${patient.patientProfile.primaryDoctor.firstName} ${patient.patientProfile.primaryDoctor.lastName}` :
                                        (appointments.length > 0 ? (appointments[0].doctor?.user?.name || "None assigned") : "None assigned")}
                                </Typography>
                                {(patient.patientProfile?.primaryDoctor?.specialization || (appointments.length > 0 && appointments[0].doctor?.specialization)) && (
                                    <Typography variant="caption" color="textSecondary">
                                        {patient.patientProfile?.primaryDoctor?.specialization || appointments[0].doctor?.specialization}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Recent Appointment */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: "8px", height: "100%" }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <CalendarTodayIcon fontSize="small" /> Upcoming Appointment
                                </Typography>
                                {appointments.length > 0 ? (
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {new Date(appointments[0].appointmentDate).toLocaleDateString("en-GB")} at {appointments[0].appointmentTime}
                                            </Typography>
                                            <Typography variant="body2" color="primary">
                                                {appointments[0].doctor?.user?.name || "Assigned Doctor"}
                                            </Typography>
                                        </Box>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="success"
                                            startIcon={<MessageIcon />}
                                            sx={{ textTransform: "none", borderRadius: "20px" }}
                                            onClick={() => {
                                                const appt = appointments[0];
                                                const params = new URLSearchParams({
                                                    patientId,
                                                    patientName: patient.patientName,
                                                    contact: patient.contactNumber,
                                                    doctorName: appt.doctor?.user?.name || "Doctor",
                                                    date: new Date(appt.appointmentDate).toLocaleDateString("en-GB"),
                                                    time: appt.appointmentTime
                                                });
                                                navigate(`/receptionist/appointments/whatsapp?${params.toString()}`);
                                            }}
                                        >
                                            Send Reminder
                                        </Button>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">No upcoming appointments</Typography>
                                )}
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
