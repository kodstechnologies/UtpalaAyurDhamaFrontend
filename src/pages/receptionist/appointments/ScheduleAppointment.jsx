import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress } from "@mui/material";

function ScheduleAppointmentPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId") || "";
    const patientName = searchParams.get("patientName") || "";
    const isFamilyMember = searchParams.get("isFamilyMember") === "true";

    const [formData, setFormData] = useState({
        doctor: searchParams.get("doctorId") || "",
        date: searchParams.get("date") || new Date().toISOString().split("T")[0],
        time: searchParams.get("time") || "",
    });

    const [doctors, setDoctors] = useState([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingExistingAppointment, setIsLoadingExistingAppointment] = useState(false);

    // Fetch existing appointment data if available
    const fetchExistingAppointment = useCallback(async () => {
        if (!patientId) return;
        
        setIsLoadingExistingAppointment(true);
        try {
            // Fetch appointments for this patient to get existing doctor assignment
            const response = await axios.get(
                getApiUrl(`appointments?patientId=${patientId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success && response.data.data && response.data.data.length > 0) {
                const latestAppointment = response.data.data[0]; // Get the latest appointment
                
                if (latestAppointment.doctor) {
                    const doctorId = latestAppointment.doctor._id || latestAppointment.doctor;
                    const appointmentDate = latestAppointment.appointmentDate ? 
                        new Date(latestAppointment.appointmentDate).toISOString().split('T')[0] : 
                        formData.date;
                    const appointmentTime = latestAppointment.appointmentTime || formData.time;
                    
                    console.log("Pre-filling form with existing appointment data:", {
                        doctorId,
                        appointmentDate,
                        appointmentTime
                    });
                    
                    setFormData((prev) => ({
                        ...prev,
                        doctor: doctorId,
                        date: appointmentDate,
                        time: appointmentTime,
                    }));
                }
            }
        } catch (error) {
            console.log("No existing appointments found or error fetching them:", error.message);
            // This is not an error - patient just doesn't have appointments yet
        } finally {
            setIsLoadingExistingAppointment(false);
        }
    }, [patientId, formData.date, formData.time]);

    // Fetch all doctors from API
    const fetchDoctors = useCallback(async () => {
        setIsLoadingDoctors(true);
        try {
            console.log("Fetching doctors from:", getApiUrl("doctors/profiles"));
            const response = await axios.get(
                getApiUrl("doctors/profiles"),
                { headers: getAuthHeaders() }
            );

            console.log("Doctors API Response:", response.data);

            if (response.data.success) {
                const doctorsData = response.data.data || [];
                console.log("Setting doctors:", doctorsData);
                setDoctors(doctorsData);

                if (doctorsData.length === 0) {
                    console.warn("No doctors found in the database");
                    toast.warning("No doctors available. Please add doctors first.");
                }
            } else {
                console.error("API returned success=false:", response.data);
                toast.error(response.data.message || "Failed to fetch doctors");
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
            console.error("Error response:", error.response?.data);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch doctors");
            setDoctors([]); // Clear doctors on error
        } finally {
            setIsLoadingDoctors(false);
        }
    }, []);

    useEffect(() => {
        fetchDoctors();
        fetchExistingAppointment();
    }, [fetchDoctors, fetchExistingAppointment]);

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
        if (!patientId) {
            toast.error("Patient ID is missing");
            return;
        }

        setIsSubmitting(true);
        try {
            let patientProfileId;

            if (isFamilyMember) {
                // For family members, fetch the family member to get their patient profile
                // Use the receptionist endpoint which doesn't require Patient role
                const familyMemberResponse = await axios.get(
                    getApiUrl(`family-members/${patientId}/receptionist`),
                    { headers: getAuthHeaders() }
                );

                if (!familyMemberResponse.data.success) {
                    throw new Error(familyMemberResponse.data.message || "Failed to fetch family member details");
                }

                const familyMember = familyMemberResponse.data.data;
                // Get the family member's user ID and find their patient profile
                const familyMemberUserId = familyMember.user?._id || familyMember.user;

                if (!familyMemberUserId) {
                    throw new Error("Family member user not found.");
                }

                // Fetch the patient profile for the family member
                const patientProfileResponse = await axios.get(
                    getApiUrl(`patients/by-user/${familyMemberUserId}`),
                    { headers: getAuthHeaders() }
                );

                if (!patientProfileResponse.data.success || !patientProfileResponse.data.data) {
                    throw new Error("Patient profile not found for family member. Please ensure the family member is properly registered.");
                }

                patientProfileId = patientProfileResponse.data.data._id;
            } else {
                // For regular patients, fetch reception patient to get PatientProfile ID
                const receptionPatientResponse = await axios.get(
                    getApiUrl(`reception-patients/${patientId}`),
                    { headers: getAuthHeaders() }
                );

                if (!receptionPatientResponse.data.success) {
                    throw new Error(receptionPatientResponse.data.message || "Failed to fetch patient details");
                }

                const receptionPatient = receptionPatientResponse.data.data;
                patientProfileId = receptionPatient.patientProfile?._id;

                if (!patientProfileId) {
                    throw new Error("Patient profile not found. Please ensure the patient is properly registered.");
                }
            }

            // Step 2: Create the appointment
            const appointmentData = {
                doctorId: formData.doctor, // This is the DoctorProfile ID
                patientId: patientProfileId, // This is the PatientProfile ID
                appointmentDate: formData.date,
                appointmentTime: formData.time,
            };

            console.log("Creating appointment with data:", appointmentData);

            const appointmentResponse = await axios.post(
                getApiUrl("appointments"),
                appointmentData,
                { headers: getAuthHeaders() }
            );

            if (appointmentResponse.data.success) {
                // If it's a family member, also assign the doctor to their patient profile
                if (isFamilyMember) {
                    try {
                        await axios.patch(
                            getApiUrl(`family-members/${patientId}/assign-doctor`),
                            { doctorId: formData.doctor },
                            { headers: getAuthHeaders() }
                        );
                    } catch (assignError) {
                        console.warn("Failed to assign doctor to family member:", assignError);
                        // Don't fail the whole operation if doctor assignment fails
                        toast.warning("Appointment scheduled, but failed to assign doctor to family member profile.");
                    }
                }

                toast.success("Appointment scheduled successfully!");
                navigate(-1); // Go back to previous page
            } else {
                throw new Error(appointmentResponse.data.message || "Failed to schedule appointment");
            }
        } catch (error) {
            console.error("Error scheduling appointment:", error);
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to schedule appointment. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <HeadingCard
                title="Schedule Appointment"
                subtitle={`Patient: ${patientName}${formData.doctor ? " - Edit Mode" : ""}`}
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "Schedule Appointment" },
                ]}
            />

            {isLoadingExistingAppointment ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
                    <CircularProgress />
                </Box>
            ) : (
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
                    {formData.doctor && (
                        <Box sx={{ mb: 3, p: 2, backgroundColor: "#e8f5e9", borderRadius: "8px", border: "1px solid #4caf50" }}>
                            <p style={{ margin: 0, color: "#2e7d32", fontSize: "14px" }}>
                                ✓ Doctor already assigned. You can edit the appointment details below.
                            </p>
                        </Box>
                    )}
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
                            <InputLabel id="doctor-select-label" shrink={!!formData.doctor}>Doctor *</InputLabel>
                            <Select
                                labelId="doctor-select-label"
                                name="doctor"
                                value={formData.doctor}
                                onChange={handleChange}
                                label="Doctor *"
                                disabled={isLoadingDoctors}
                                displayEmpty={false}
                                notched={!!formData.doctor}
                            >
                                {isLoadingDoctors ? (
                                    <MenuItem value="" disabled>
                                        Loading doctors...
                                    </MenuItem>
                                ) : doctors.length === 0 ? (
                                    <MenuItem value="" disabled>
                                        No doctors available
                                    </MenuItem>
                                ) : (
                                    doctors.map((doctor) => {
                                        console.log("Rendering doctor:", doctor);
                                        const doctorName = doctor.user?.name ||
                                            `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() ||
                                            "Doctor";
                                        const displayName = doctor.specialization
                                            ? `${doctorName} - ${doctor.specialization}`
                                            : doctorName;
                                        return (
                                            <MenuItem key={doctor._id || doctor.id} value={doctor._id || doctor.id}>
                                                {displayName}
                                            </MenuItem>
                                        );
                                    })
                                )}
                            </Select>
                            {isLoadingDoctors && (
                                <CircularProgress size={24} sx={{ position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)" }} />
                            )}
                        </FormControl>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Date *"
                                name="date"
                                type="date"
                                fullWidth
                                required
                                value={formData.date}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Time *"
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
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ backgroundColor: "#8B4513" }}
                            disabled={isSubmitting || isLoadingDoctors}
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                                    Scheduling...
                                </>
                            ) : (
                                formData.doctor ? "Update Appointment" : "Schedule Appointment"
                            )}
                        </Button>
                    </Box>
                </form>
            </Box>
            )}
        </div>
    );
}

export default ScheduleAppointmentPage;

