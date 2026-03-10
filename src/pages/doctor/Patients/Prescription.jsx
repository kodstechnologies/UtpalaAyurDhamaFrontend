import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Grid,
    Button,
    Avatar,
    Chip,
    Stack,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import {
    Save,
    PersonOutline,
    Medication,
    LocalPharmacy,
    Healing,
    Directions,
    Schedule,
    Note,
} from "@mui/icons-material";
import SubmitButton from "../../../components/buttons/SubmitButton";

// Reusable Form Section Component
function FormSection({ title, subtitle, icon: Icon, children }) {
    return (
        <Paper
            elevation={1}
            sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                border: "1px solid var(--color-primary-light)",
                bgcolor: "white",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                },
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Icon sx={{ fontSize: 28, color: "var(--color-primary)" }} />
                    <Box>
                        <Typography variant="h6" fontWeight={700} color="var(--color-primary-dark)">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="var(--color-text-muted)">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </Stack>
            <Divider sx={{ mb: 2, borderColor: "var(--color-primary-light)" }} />
            {children}
        </Paper>
    );
}

function Prescription({ onSubmitSuccess }) {


    // Form Data
    const [formData, setFormData] = useState({
        // Diagnosis Summary
        diagnosis: "",
        // Medicines
        medicines: [
            { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
        ],
        // Additional Instructions
        generalInstructions: "",
        diet: "",
        exercise: "",
        // Follow-up
        followUpDate: "",
        nextAppointment: "",
    });

    const handleChange = (field, index = null) => (event) => {
        if (index !== null) {
            // Handle array fields like medicines
            const newMedicines = [...formData.medicines];
            newMedicines[index][field] = event.target.value;
            setFormData({ ...formData, medicines: newMedicines });
        } else {
            setFormData({ ...formData, [field]: event.target.value });
        }
    };

    const addMedicine = () => {
        setFormData({
            ...formData,
            medicines: [...formData.medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
        });
    };

    const removeMedicine = (index) => {
        const newMedicines = formData.medicines.filter((_, i) => i !== index);
        setFormData({ ...formData, medicines: newMedicines });
    };

    const handleSave = () => {
        console.log("Saving prescription data:", formData);
        // Call the onSubmitSuccess callback to advance to the next step
        if (onSubmitSuccess) {
            onSubmitSuccess();
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ p: 4 }}>


                <Grid container spacing={3}>
                    {/* Left Column */}
                    <Grid item xs={12} md={6}>
                        {/* Diagnosis Summary */}
                        <FormSection
                            title="Diagnosis Summary"
                            subtitle="Brief overview of the condition"
                            icon={Healing}
                        >
                            <TextField
                                fullWidth
                                label="Diagnosis"
                                variant="outlined"
                                multiline
                                rows={3}
                                value={formData.diagnosis}
                                onChange={handleChange("diagnosis")}
                                size="small"
                            />
                        </FormSection>

                        {/* Medicines Table */}
                        <FormSection
                            title="Prescribed Medicines"
                            subtitle="List of medications with dosages and instructions"
                            icon={Medication}
                        >
                            <TableContainer sx={{ mb: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Medicine Name</TableCell>
                                            <TableCell>Dosage</TableCell>
                                            <TableCell>Frequency</TableCell>
                                            <TableCell>Duration</TableCell>
                                            <TableCell>Instructions</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formData.medicines.map((medicine, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={medicine.name}
                                                        onChange={handleChange("name", index)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={medicine.dosage}
                                                        onChange={handleChange("dosage", index)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={medicine.frequency}
                                                        onChange={handleChange("frequency", index)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={medicine.duration}
                                                        onChange={handleChange("duration", index)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={medicine.instructions}
                                                        onChange={handleChange("instructions", index)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="small"
                                                        onClick={() => removeMedicine(index)}
                                                        color="error"
                                                    >
                                                        Remove
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button
                                variant="outlined"
                                startIcon={<Medication />}
                                onClick={addMedicine}
                                size="small"
                            >
                                Add Medicine
                            </Button>
                        </FormSection>

                        {/* General Instructions */}
                        <FormSection
                            title="General Instructions"
                            subtitle="Additional patient guidance"
                            icon={Note}
                        >
                            <TextField
                                fullWidth
                                label="General Instructions"
                                variant="outlined"
                                multiline
                                rows={4}
                                value={formData.generalInstructions}
                                onChange={handleChange("generalInstructions")}
                                size="small"
                            />
                        </FormSection>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} md={6}>
                        {/* Diet Recommendations */}
                        <FormSection
                            title="Diet Recommendations"
                            subtitle="Ayurvedic and nutritional advice"
                            icon={LocalPharmacy}
                        >
                            <TextField
                                fullWidth
                                label="Diet Plan"
                                variant="outlined"
                                multiline
                                rows={6}
                                value={formData.diet}
                                onChange={handleChange("diet")}
                                size="small"
                            />
                        </FormSection>

                        {/* Exercise and Lifestyle */}
                        <FormSection
                            title="Exercise & Lifestyle"
                            subtitle="Physical activity and daily routine suggestions"
                            icon={Directions}
                        >
                            <TextField
                                fullWidth
                                label="Exercise Recommendations"
                                variant="outlined"
                                multiline
                                rows={4}
                                value={formData.exercise}
                                onChange={handleChange("exercise")}
                                size="small"
                            />
                        </FormSection>

                        {/* Follow-up */}
                        <FormSection
                            title="Follow-up Schedule"
                            subtitle="Appointment and review details"
                            icon={Schedule}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Follow-up Date"
                                        variant="outlined"
                                        type="date"
                                        value={formData.followUpDate}
                                        onChange={handleChange("followUpDate")}
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{
                                            min: (() => {
                                                const tomorrow = new Date();
                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                return tomorrow.toISOString().split("T")[0];
                                            })()
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Next Appointment Notes"
                                        variant="outlined"
                                        multiline
                                        rows={2}
                                        value={formData.nextAppointment}
                                        onChange={handleChange("nextAppointment")}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                    </Grid>
                </Grid>

                {/* Submit Button */}
                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                    <SubmitButton onClick={handleSave} startIcon={<Save />} variant="contained" size="large">
                        Generate Prescription
                    </SubmitButton>
                </Box>
            </Box>
        </Box>
    );
}

export default Prescription;