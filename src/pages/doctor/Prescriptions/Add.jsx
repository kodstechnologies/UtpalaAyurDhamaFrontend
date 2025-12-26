import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography,
    Grid,
    Button,
} from "@mui/material";
import SubmitButton from "../../../components/buttons/SubmitButton";
import CancelButton from "../../../components/buttons/CancelButton";
import { X } from "lucide-react";

function PrescriptionsAddPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId") || "";
    const patientName = searchParams.get("patientName") || "";

    const [formData, setFormData] = useState({
        patientId: patientId,
        patientName: patientName,
        prescriptionDate: new Date().toISOString().split("T")[0],
        medicines: [],
        currentMedicine: {
            name: "",
            dosage: "",
            frequency: "",
            duration: "",
            instructions: "",
        },
        diagnosis: "",
        notes: "",
    });

    const frequencyOptions = ["Once daily", "Twice daily", "Thrice daily", "Four times daily", "As needed"];
    const durationOptions = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "Ongoing"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMedicineFieldChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            currentMedicine: { ...prev.currentMedicine, [field]: value },
        }));
    };

    const handleAddMedicine = () => {
        if (!formData.currentMedicine.name || !formData.currentMedicine.dosage) {
            alert("Please enter medicine name and dosage");
            return;
        }
        setFormData((prev) => ({
            ...prev,
            medicines: [...prev.medicines, { ...prev.currentMedicine }],
            currentMedicine: {
                name: "",
                dosage: "",
                frequency: "",
                duration: "",
                instructions: "",
            },
        }));
    };

    const handleRemoveMedicine = (index) => {
        setFormData((prev) => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.patientId || !formData.patientName || formData.medicines.length === 0) {
            alert("Please fill all required fields and add at least one medicine");
            return;
        }

        const prescriptionData = {
            ...formData,
            medicines: formData.medicines,
        };

        console.log("Prescription created:", prescriptionData);
        // Implement API call here
        alert("Prescription created successfully");
        navigate("/doctor/prescriptions");
    };

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Create Prescription"
                subtitle={patientName ? `Create prescription for ${patientName}` : "Create a new prescription"}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Prescriptions", url: "/doctor/prescriptions" },
                    { label: "New Prescription" },
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

                    {/* Prescription Date */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Prescription Date <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="prescriptionDate"
                            type="date"
                            value={formData.prescriptionDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    {/* Diagnosis */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Diagnosis
                        </Typography>
                        <TextField
                            fullWidth
                            name="diagnosis"
                            value={formData.diagnosis}
                            onChange={handleChange}
                            placeholder="Enter diagnosis"
                        />
                    </Grid>

                    {/* Add Medicine Section */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Add Medicines <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Box
                            sx={{
                                border: "1px solid var(--color-border)",
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                                backgroundColor: "var(--color-bg-a)",
                            }}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Medicine Name"
                                        value={formData.currentMedicine.name}
                                        onChange={(e) => handleMedicineFieldChange("name", e.target.value)}
                                        placeholder="Enter medicine name"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Dosage"
                                        value={formData.currentMedicine.dosage}
                                        onChange={(e) => handleMedicineFieldChange("dosage", e.target.value)}
                                        placeholder="e.g., 500mg"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Frequency</InputLabel>
                                        <Select
                                            value={formData.currentMedicine.frequency}
                                            onChange={(e) => handleMedicineFieldChange("frequency", e.target.value)}
                                            label="Frequency"
                                        >
                                            <MenuItem value="">Select</MenuItem>
                                            {frequencyOptions.map((freq) => (
                                                <MenuItem key={freq} value={freq}>
                                                    {freq}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Duration</InputLabel>
                                        <Select
                                            value={formData.currentMedicine.duration}
                                            onChange={(e) => handleMedicineFieldChange("duration", e.target.value)}
                                            label="Duration"
                                        >
                                            <MenuItem value="">Select</MenuItem>
                                            {durationOptions.map((dur) => (
                                                <MenuItem key={dur} value={dur}>
                                                    {dur}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Button
                                        variant="contained"
                                        onClick={handleAddMedicine}
                                        fullWidth
                                        sx={{ height: "40px" }}
                                    >
                                        Add
                                    </Button>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Instructions"
                                    value={formData.currentMedicine.instructions}
                                    onChange={(e) => handleMedicineFieldChange("instructions", e.target.value)}
                                    placeholder="Special instructions (optional)"
                                    size="small"
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                        </Box>

                        {/* Added Medicines List */}
                        {formData.medicines.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Added Medicines:
                                </Typography>
                                {formData.medicines.map((medicine, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            border: "1px solid var(--color-border)",
                                            borderRadius: 1,
                                            p: 1.5,
                                            mb: 1,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            backgroundColor: "white",
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {medicine.name} - {medicine.dosage}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {medicine.frequency} • {medicine.duration}
                                                {medicine.instructions && ` • ${medicine.instructions}`}
                                            </Typography>
                                        </Box>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoveMedicine(index)}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Grid>

                    {/* Notes */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Additional Notes
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
                    <CancelButton onClick={() => navigate("/doctor/prescriptions")}>
                        <X size={16} style={{ marginRight: "8px" }} />
                        Cancel
                    </CancelButton>
                    <SubmitButton text="Create Prescription" type="submit" />
                </Box>
            </Box>
        </Box>
    );
}

export default PrescriptionsAddPage;

