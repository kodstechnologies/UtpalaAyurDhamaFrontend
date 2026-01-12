import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress } from "@mui/material";

function RescheduleAppointmentPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get("appointmentId") || "";
    const patientName = searchParams.get("patientName") || "";

    const [formData, setFormData] = useState({
        doctor: searchParams.get("doctorId") || "",
        date: searchParams.get("date") || new Date().toISOString().split("T")[0],
        time: searchParams.get("time") || "",
    });

    const [doctors, setDoctors] = useState([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch all doctors from API
    const fetchDoctors = useCallback(async () => {
        setIsLoadingDoctors(true);
        try {
            const response = await axios.get(
                getApiUrl("doctors/profiles"),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                const doctorsData = response.data.data || [];
                setDoctors(doctorsData);
                
                if (doctorsData.length === 0) {
                    toast.warning("No doctors available. Please add doctors first.");
                }
            } else {
                toast.error(response.data.message || "Failed to fetch doctors");
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch doctors");
            setDoctors([]);
        } finally {
            setIsLoadingDoctors(false);
        }
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.doctor) {
            toast.error("Please select a doctor");
            return;
        }
        if (!formData.date) {
            toast.error("Please select a date");
            return;
        }
        if (!formData.time) {
            toast.error("Please select a time");
            return;
        }
        if (!appointmentId) {
            toast.error("Appointment ID is missing");
            return;
        }

        setIsSubmitting(true);
        try {
            const requestBody = {
                appointmentDate: formData.date,
                appointmentTime: formData.time,
            };
            
            // Only include doctorId if a doctor is selected (optional for reschedule)
            if (formData.doctor) {
                requestBody.doctorId = formData.doctor;
            }
            
            const response = await axios.patch(
                getApiUrl(`appointments/${appointmentId}/reschedule`),
                requestBody,
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success("Appointment rescheduled successfully!");
                navigate("/receptionist/appointments");
            } else {
                toast.error(response.data.message || "Failed to reschedule appointment");
            }
        } catch (error) {
            console.error("Error rescheduling appointment:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to reschedule appointment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <HeadingCard
                title="Reschedule Appointment"
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "Reschedule Appointment" },
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
                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            label="Patient"
                            fullWidth
                            value={patientName}
                            disabled
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth required sx={{ mb: 2 }}>
                            <InputLabel id="doctor-select-label">Doctor *</InputLabel>
                            <Select
                                name="doctor"
                                value={formData.doctor}
                                onChange={handleChange}
                                label="Doctor *"
                                labelId="doctor-select-label"
                                disabled={isLoadingDoctors}
                            >
                                <MenuItem value="">Select Doctor</MenuItem>
                                {doctors.map((d) => (
                                    <MenuItem key={d._id} value={d._id}>
                                        {d.user?.name || d.name || "Unknown"}
                                    </MenuItem>
                                ))}
                            </Select>
                            {isLoadingDoctors && (
                                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                                    <CircularProgress size={20} />
                                </Box>
                            )}
                        </FormControl>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="New Date *"
                                name="date"
                                type="date"
                                fullWidth
                                required
                                value={formData.date}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="New Time *"
                                name="time"
                                type="time"
                                fullWidth
                                required
                                value={formData.time}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button variant="outlined" onClick={() => navigate(-1)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            sx={{ backgroundColor: "#8B4513" }}
                            disabled={isSubmitting || isLoadingDoctors}
                        >
                            {isSubmitting ? "Rescheduling..." : "Reschedule Appointment"}
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default RescheduleAppointmentPage;

