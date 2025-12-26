import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

function ScheduleAppointmentPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId") || "";
    const patientName = searchParams.get("patientName") || "";

    const [formData, setFormData] = useState({
        doctor: searchParams.get("doctorId") || "",
        date: searchParams.get("date") || new Date().toISOString().split("T")[0],
        time: searchParams.get("time") || "",
    });

    // Mock data - in real app, fetch from API
    const mockDoctors = [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement API call here
        console.log("Appointment scheduled:", { patientId, patientName, ...formData });
        navigate(-1);
    };

    return (
        <div>
            <HeadingCard
                title="Schedule Appointment"
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "Schedule Appointment" },
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
                            <InputLabel>Doctor *</InputLabel>
                            <Select
                                name="doctor"
                                value={formData.doctor}
                                onChange={handleChange}
                                label="Doctor *"
                            >
                                <MenuItem value="">Select Doctor</MenuItem>
                                {mockDoctors.map((d) => (
                                    <MenuItem key={d._id} value={d._id}>
                                        {d.name || d.user?.name}
                                    </MenuItem>
                                ))}
                            </Select>
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
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: "#8B4513" }}>
                            Schedule Appointment
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default ScheduleAppointmentPage;

