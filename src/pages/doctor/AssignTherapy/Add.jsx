import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Box,
    Typography,
    Grid,
} from "@mui/material";
import SubmitButton from "../../../components/buttons/SubmitButton";
import CancelButton from "../../../components/buttons/CancelButton";
import { X } from "lucide-react";

function AssignTherapyAddPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId") || "";
    const patientName = searchParams.get("patientName") || "";

    const [formData, setFormData] = useState({
        patientId: patientId,
        patientName: patientName,
        therapistId: "",
        therapistName: "",
        therapyType: "",
        totalSessions: "",
        assignedDate: new Date().toISOString().split("T")[0],
        notes: "",
    });

    // Mock data - replace with API calls
    const mockTherapists = [
        { id: "1", name: "Dr. Aisha Patel", specialty: "Yoga Therapy" },
        { id: "2", name: "Dr. Raj Kumar", specialty: "Physiotherapy" },
        { id: "3", name: "Dr. Meera Singh", specialty: "Counseling" },
        { id: "4", name: "Dr. Priya Sharma", specialty: "Ayurvedic Massage" },
    ];

    const therapyTypes = [
        "Yoga Therapy",
        "Physiotherapy",
        "Counseling",
        "Ayurvedic Massage",
        "Panchakarma",
        "Shirodhara",
        "Abhyanga",
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-fill therapist name when therapist is selected
        if (name === "therapistId") {
            const selectedTherapist = mockTherapists.find((t) => t.id === value);
            if (selectedTherapist) {
                setFormData((prev) => ({ ...prev, therapistName: selectedTherapist.name }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.patientId || !formData.therapistId || !formData.therapyType || !formData.totalSessions) {
            alert("Please fill all required fields");
            return;
        }

        console.log("Therapy assignment created:", formData);
        // Implement API call here
        alert("Therapy assigned successfully");
        navigate("/doctor/assign-therapy");
    };

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Assign New Therapy"
                subtitle={patientName ? `Assign therapy for ${patientName}` : "Assign therapy to a patient"}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Assign Therapy", url: "/doctor/assign-therapy" },
                    { label: "New Assignment" },
                ]}
            />

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    backgroundColor: "var(--color-bg-card)",
                    borderRadius: 4,
                    p: 4,
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-medium)",
                    mt: 3,
                }}
            >
                <Grid container spacing={3}>
                    {/* Patient Name */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Patient Name <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="patientName"
                            value={formData.patientName}
                            onChange={handleChange}
                            placeholder="Enter or select patient name"
                            required
                        />
                    </Grid>

                    {/* Patient ID */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Patient ID <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleChange}
                            placeholder="Enter patient ID"
                            required
                        />
                    </Grid>

                    {/* Therapist */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Therapist <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <FormControl fullWidth required>
                            <InputLabel>Select Therapist</InputLabel>
                            <Select
                                name="therapistId"
                                value={formData.therapistId}
                                label="Select Therapist"
                                onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>Select Therapist...</em>
                                </MenuItem>
                                {mockTherapists.map((therapist) => (
                                    <MenuItem key={therapist.id} value={therapist.id}>
                                        {therapist.name} - {therapist.specialty}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Therapy Type */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Therapy Type <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <FormControl fullWidth required>
                            <InputLabel>Select Therapy Type</InputLabel>
                            <Select
                                name="therapyType"
                                value={formData.therapyType}
                                label="Select Therapy Type"
                                onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>Select Therapy Type...</em>
                                </MenuItem>
                                {therapyTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Total Sessions */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Total Sessions <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="totalSessions"
                            type="number"
                            value={formData.totalSessions}
                            onChange={handleChange}
                            placeholder="Enter total number of sessions"
                            inputProps={{ min: 1 }}
                            required
                        />
                    </Grid>

                    {/* Assigned Date */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Assigned Date <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="assignedDate"
                            type="date"
                            value={formData.assignedDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    {/* Notes */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Notes
                        </Typography>
                        <TextField
                            fullWidth
                            name="notes"
                            multiline
                            rows={4}
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Enter any additional notes or instructions"
                        />
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                    <CancelButton onClick={() => navigate("/doctor/assign-therapy")}>
                        <X size={16} style={{ marginRight: "8px" }} />
                        Cancel
                    </CancelButton>
                    <SubmitButton text="Assign Therapy" type="submit" />
                </Box>
            </Box>
        </Box>
    );
}

export default AssignTherapyAddPage;

