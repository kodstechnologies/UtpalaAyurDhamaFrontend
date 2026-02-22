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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import {
    Save,
    PersonOutline,
    Group,
    Assignment,
    Schedule,
    Note,
    Healing,
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

function Therapist({ onSubmitSuccess }) {


    // Sample Therapists
    const availableTherapists = [
        { id: 1, name: "Dr. Aisha Patel", specialty: "Yoga Therapy", availability: "Mon-Fri, 9AM-5PM" },
        { id: 2, name: "Dr. Raj Kumar", specialty: "Physiotherapy", availability: "Tue-Thu, 10AM-4PM" },
        { id: 3, name: "Dr. Meera Singh", specialty: "Counseling", availability: "Wed-Sat, 2PM-7PM" },
    ];

    // Form Data
    const [formData, setFormData] = useState({
        // Primary Therapist
        primaryTherapist: "",
        // Additional Therapists
        additionalTherapists: [],
        // Session Details
        sessionType: "",
        frequency: "",
        duration: "",
        startDate: "",
        // Notes
        referralNotes: "",
        goals: "",
        // Follow-up
        followUpDate: "",
    });

    const handleChange = (field) => (event) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    const handleTherapistChange = (field, index = null) => (event) => {
        if (index !== null) {
            // Handle array fields like additional therapists
            const newTherapists = [...formData.additionalTherapists];
            newTherapists[index][field] = event.target.value;
            setFormData({ ...formData, additionalTherapists: newTherapists });
        } else {
            setFormData({ ...formData, [field]: event.target.value });
        }
    };

    const addAdditionalTherapist = () => {
        setFormData({
            ...formData,
            additionalTherapists: [...formData.additionalTherapists, { name: "", specialty: "" }],
        });
    };

    const removeAdditionalTherapist = (index) => {
        const newTherapists = formData.additionalTherapists.filter((_, i) => i !== index);
        setFormData({ ...formData, additionalTherapists: newTherapists });
    };

    const handleSave = () => {
        console.log("Saving therapist assignment data:", formData);
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
                        {/* Primary Therapist Selection */}
                        <FormSection
                            title="Primary Therapist Assignment"
                            subtitle="Select the lead therapist for the patient's care"
                            icon={Healing}
                        >
                            <FormControl fullWidth size="small">
                                <InputLabel>Primary Therapist</InputLabel>
                                <Select
                                    value={formData.primaryTherapist}
                                    label="Primary Therapist"
                                    onChange={handleChange("primaryTherapist")}
                                >
                                    {availableTherapists.map((therapist) => (
                                        <MenuItem key={therapist.id} value={therapist.id}>
                                            {therapist.name} - {therapist.specialty}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </FormSection>

                        {/* Additional Therapists Table */}
                        <FormSection
                            title="Additional Therapists"
                            subtitle="Optional co-therapists for multidisciplinary care"
                            icon={Group}
                        >
                            <TableContainer sx={{ mb: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Therapist Name</TableCell>
                                            <TableCell>Specialty</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formData.additionalTherapists.map((therapist, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel>Therapist</InputLabel>
                                                        <Select
                                                            value={therapist.name}
                                                            label="Therapist"
                                                            onChange={handleTherapistChange("name", index)}
                                                        >
                                                            {availableTherapists.map((t) => (
                                                                <MenuItem key={t.id} value={t.id}>
                                                                    {t.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={therapist.specialty}
                                                        onChange={handleTherapistChange("specialty", index)}
                                                        placeholder="Specialty"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="small"
                                                        onClick={() => removeAdditionalTherapist(index)}
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
                                startIcon={<Group />}
                                onClick={addAdditionalTherapist}
                                size="small"
                            >
                                Add Therapist
                            </Button>
                        </FormSection>

                        {/* Session Details */}
                        <FormSection
                            title="Session Details"
                            subtitle="Therapy session frequency and duration"
                            icon={Schedule}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Session Type (e.g., Individual, Group)"
                                        variant="outlined"
                                        value={formData.sessionType}
                                        onChange={handleChange("sessionType")}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Frequency (e.g., Weekly)"
                                        variant="outlined"
                                        value={formData.frequency}
                                        onChange={handleChange("frequency")}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Duration (weeks)"
                                        variant="outlined"
                                        type="number"
                                        value={formData.duration}
                                        onChange={handleChange("duration")}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Start Date"
                                        variant="outlined"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleChange("startDate")}
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} md={6}>
                        {/* Referral Notes */}
                        <FormSection
                            title="Referral Notes"
                            subtitle="Reasons for therapist referral and objectives"
                            icon={Assignment}
                        >
                            <TextField
                                fullWidth
                                label="Referral Rationale"
                                variant="outlined"
                                multiline
                                rows={4}
                                value={formData.referralNotes}
                                onChange={handleChange("referralNotes")}
                                size="small"
                            />
                        </FormSection>

                        {/* Treatment Goals */}
                        <FormSection
                            title="Treatment Goals"
                            subtitle="Specific, measurable objectives for therapy"
                            icon={Healing}
                        >
                            <TextField
                                fullWidth
                                label="Goals and Outcomes"
                                variant="outlined"
                                multiline
                                rows={6}
                                value={formData.goals}
                                onChange={handleChange("goals")}
                                size="small"
                            />
                        </FormSection>

                        {/* Follow-up */}
                        <FormSection
                            title="Follow-up & Review"
                            subtitle="Monitoring and progress evaluation schedule"
                            icon={Schedule}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Next Review Date"
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
                            </Grid>
                        </FormSection>
                    </Grid>
                </Grid>

                {/* Submit Button */}
                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                    <SubmitButton onClick={handleSave} startIcon={<Save />} variant="contained" size="large">
                        Assign Therapist & Complete
                    </SubmitButton>
                </Box>
            </Box>
        </Box>
    );
}

export default Therapist;