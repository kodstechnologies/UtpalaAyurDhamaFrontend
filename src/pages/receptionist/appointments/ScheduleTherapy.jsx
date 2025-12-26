import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { toast } from "react-toastify";

function ScheduleTherapyPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId") || "";
    const patientName = searchParams.get("patientName") || "";

    const [formData, setFormData] = useState({
        patientId: patientId,
        therapistName: "",
        treatment: "",
        date: "",
        time: "",
    });

    // Mock data - in real app, fetch from API
    const mockTherapists = [];
    const treatments = ["Physiotherapy", "Panchakarma", "Ayurvedic Consultation", "Yoga Therapy"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement API call here
        toast.success(`Therapy session scheduled for ${patientName || "patient"}.`);
        navigate(-1);
    };

    return (
        <div>
            <HeadingCard
                title="Schedule Therapy Session"
                subtitle={patientName ? `Patient: ${patientName}` : "Schedule a new therapy session"}
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "Schedule Therapy" },
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
                        {patientName && (
                            <TextField
                                label="Patient"
                                fullWidth
                                value={patientName}
                                disabled
                                sx={{ mb: 2 }}
                            />
                        )}
                        {!patientId && (
                            <FormControl fullWidth required sx={{ mb: 2 }}>
                                <InputLabel>Patient *</InputLabel>
                                <Select
                                    name="patientId"
                                    value={formData.patientId}
                                    onChange={handleChange}
                                    label="Patient *"
                                >
                                    <MenuItem value="">Select Patient</MenuItem>
                                    {/* In real app, map through patients from API */}
                                </Select>
                            </FormControl>
                        )}
                        <FormControl fullWidth required sx={{ mb: 2 }}>
                            <InputLabel>Therapist *</InputLabel>
                            <Select
                                name="therapistName"
                                value={formData.therapistName}
                                onChange={handleChange}
                                label="Therapist *"
                            >
                                <MenuItem value="">Select Therapist</MenuItem>
                                {mockTherapists.map((t) => (
                                    <MenuItem key={t._id} value={t.user?.name || t.name}>
                                        {t.user?.name || t.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required sx={{ mb: 2 }}>
                            <InputLabel>Treatment *</InputLabel>
                            <Select
                                name="treatment"
                                value={formData.treatment}
                                onChange={handleChange}
                                label="Treatment *"
                            >
                                <MenuItem value="">Select Treatment</MenuItem>
                                {treatments.map((treatment) => (
                                    <MenuItem key={treatment} value={treatment}>
                                        {treatment}
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
                            Schedule
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default ScheduleTherapyPage;

