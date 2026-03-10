import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, Typography, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { toast } from "react-toastify";

function WhatsAppPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const patientName = searchParams.get("patientName") || "";
    const contact = searchParams.get("contact") || "";
    const [doctorName, setDoctorName] = useState(searchParams.get("doctorName") || "");
    const [appointmentDate, setAppointmentDate] = useState(searchParams.get("date") || "");
    const [appointmentTime, setAppointmentTime] = useState(searchParams.get("time") || "");
    const [fetchingData, setFetchingData] = useState(false);

    useEffect(() => {
        const fetchLatestAppointment = async () => {
            const patientId = searchParams.get("patientId");
            // If we already have data from URL, or no patientId, don't fetch
            if ((doctorName && appointmentDate && appointmentTime) || !patientId) return;

            setFetchingData(true);
            try {
                // Fetch both Appointments and Walk-in Sessions
                const [apptResponse, sessionResponse] = await Promise.all([
                    fetch(getApiUrl(`appointments?patientId=${patientId}&status=Scheduled`), { headers: getAuthHeaders() }),
                    fetch(getApiUrl(`therapist-sessions?patientId=${patientId}&sort=-sessionDate`), { headers: getAuthHeaders() })
                ]);

                const apptData = await apptResponse.json();
                const sessionData = await sessionResponse.json();

                let latestAppt = null;
                let latestSession = null;

                // Process Appointments
                if (apptData.success && apptData.data && apptData.data.length > 0) {
                    // Filter for future or today
                    const validAppts = apptData.data.filter(a => new Date(a.appointmentDate) >= new Date(new Date().setHours(0, 0, 0, 0)));
                    if (validAppts.length > 0) {
                        // Sort by date ascending (nearest future)
                        validAppts.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
                        latestAppt = validAppts[0];
                    }
                }

                // Process Sessions (Walk-ins)
                if (sessionData.success && sessionData.data && sessionData.data.length > 0) {
                    // Filter by patient ID first (since backend might return all sessions)
                    const patientSessions = sessionData.data.filter(s =>
                        (s.patient?._id === patientId) ||
                        (s.patient === patientId) ||
                        (s.patient?.patientId === patientId) // Handle populated/unpopulated variations
                    );

                    // Walk-ins are usually for today. Find today's session.
                    const today = new Date().toISOString().split("T")[0];
                    const todaySession = patientSessions.find(s => s.sessionDate && s.sessionDate.startsWith(today));
                    if (todaySession) latestSession = todaySession;
                }

                // Decide which to use.
                // If we have a walk-in for TODAY, prioritize it as it's likely immediate.
                // Otherwise use the nearest upcoming appointment.
                if (latestSession) {
                    setDoctorName(latestSession.therapist?.user?.name || latestSession.therapistName || "Therapist");
                    setAppointmentDate(new Date(latestSession.sessionDate).toLocaleDateString("en-GB"));
                    setAppointmentTime(latestSession.sessionTime || "");
                    toast.info("Loaded today's walk-in session details.");
                } else if (latestAppt) {
                    setDoctorName(latestAppt.doctor?.user?.name || latestAppt.doctorName || "Doctor");
                    // Format date to DD/MM/YYYY
                    const d = new Date(latestAppt.appointmentDate);
                    setAppointmentDate(d.toLocaleDateString("en-GB"));
                    setAppointmentTime(latestAppt.appointmentTime || "");
                    toast.info("Loaded upcoming appointment details.");
                } else {
                    // Fallbacks if nothing found - use generic terms or catch existing state
                    if (!doctorName) setDoctorName("[Doctor/Therapist Name]");
                    if (!appointmentDate) setAppointmentDate("[Date]");
                    if (!appointmentTime) setAppointmentTime("[Time]");
                    toast.warning("No upcoming appointment found. Please verify details.");
                }

            } catch (error) {
                console.error("Error fetching patient details:", error);
                // Fallbacks for error case
                if (!doctorName) setDoctorName("[Doctor/Therapist Name]");
                if (!appointmentDate) setAppointmentDate("[Date]");
                if (!appointmentTime) setAppointmentTime("[Time]");
            } finally {
                setFetchingData(false);
            }
        };

        fetchLatestAppointment();
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSendWhatsApp = async (type) => {
        if (type === "form") {
            setLoading(true);
            try {
                const response = await fetch(getApiUrl("whatsapp/send-feedback-request"), {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        patientName,
                        contact
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success("Feedback request sent successfully via WhatsApp!");
                    navigate(-1);
                } else {
                    toast.error(data.message || "Failed to send feedback request");
                }
            } catch (error) {
                console.error("WhatsApp Feedback Error:", error);
                toast.error("An error occurred while sending WhatsApp message");
            } finally {
                setLoading(false);
            }
            return;
        }

        if (type === "reminder") {
            setLoading(true);
            try {
                const response = await fetch(getApiUrl("whatsapp/send-reminder"), {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        patientName,
                        contact,
                        doctorName,
                        date: appointmentDate,
                        time: appointmentTime
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success("WhatsApp reminder sent successfully!");
                    navigate(-1);
                } else {
                    toast.error(data.message || "Failed to send WhatsApp reminder");
                }
            } catch (error) {
                console.error("WhatsApp Error:", error);
                toast.error("An error occurred while sending WhatsApp message");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div>
            <HeadingCard
                title="Send Message via WhatsApp"
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "WhatsApp Message" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                    maxWidth: "600px",
                    mx: "auto",
                }}
            >
                <Typography sx={{ mb: 2 }}>
                    Send a message to <strong>{patientName}</strong>. You can send a data collection form link or an appointment reminder.
                </Typography>

                <TextField
                    label="WhatsApp Number"
                    fullWidth
                    value={contact}
                    disabled
                    sx={{ mb: 3 }}
                />

                <Box sx={{ mb: 4, p: 2, border: "1px dashed #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                    <Typography variant="subtitle2" sx={{ color: "#666", mb: 1, fontWeight: "bold" }}>
                        Preview: Appointment Reminder Template
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: "white", borderRadius: "4px", border: "1px solid #eee", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        {fetchingData ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
                                <CircularProgress size={16} />
                                <Typography variant="body2" color="textSecondary">Fetching latest clinical data...</Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" sx={{ color: "#333", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                                Hello <strong>{patientName}</strong>, your appointment with <strong>{doctorName}</strong> is scheduled on <strong>{appointmentDate}</strong> at <strong>{appointmentTime}</strong>.{"\n"}
                                Please reach the clinic 10 minutes early.{"\n"}
                                For any assistance, contact us at <strong>+917259195959</strong> anytime.
                            </Typography>
                        )}
                    </Box>
                    <Typography variant="caption" sx={{ color: "#888", mt: 1, display: "block" }}>
                        * This message will be sent as an official WhatsApp template.
                    </Typography>
                </Box>

                <Box sx={{ mb: 4, p: 2, border: "1px dashed #ccc", borderRadius: "8px", backgroundColor: "#f0f8ff" }}>
                    <Typography variant="subtitle2" sx={{ color: "#666", mb: 1, fontWeight: "bold" }}>
                        Preview: Feedback Request Template
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: "white", borderRadius: "4px", border: "1px solid #eee", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        <Typography variant="body2" sx={{ color: "#333", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                            Hello <strong>{patientName}</strong>,{"\n"}
                            {"\n"}
                            Thank you for visiting Utpala Ayurdhama today.{"\n"}
                            We hope you had a great experience.{"\n"}
                            {"\n"}
                            Your feedback helps us serve you better.{"\n"}
                            Please tap the button below to share your feedback.{"\n"}
                            <strong>[Give Feedback Button]</strong>
                        </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: "#888", mt: 1, display: "block" }}>
                        * This message will be sent as an official WhatsApp template with a "Give Feedback" button.
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleSendWhatsApp("form")}
                        disabled={loading}
                    >
                        Send Form Link
                    </Button>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={() => handleSendWhatsApp("reminder")}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loading ? "Sending..." : "Send Reminder"}
                    </Button>
                </Box>
            </Box>
        </div>
    );
}

export default WhatsAppPage;

