import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, Grid } from "@mui/material";
import { toast } from "react-toastify";

function ViewPatientPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [editingPatient, setEditingPatient] = useState({
        patientId: searchParams.get("patientId") || "",
        name: searchParams.get("patientName") || "",
        contact: searchParams.get("contact") || "",
        email: searchParams.get("email") || "",
        dateOfBirth: searchParams.get("dateOfBirth") || "",
        gender: searchParams.get("gender") || "",
        age: searchParams.get("age") || "",
        address: searchParams.get("address") || "",
        preferredDate: searchParams.get("preferredDate") || "",
        preferredTime: searchParams.get("preferredTime") || "",
        disease: searchParams.get("disease") || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditingPatient((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement API call here
        toast.success(`Patient ${editingPatient.name} details updated successfully!`);
        navigate(-1);
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
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Patient Name *"
                                name="name"
                                fullWidth
                                required
                                value={editingPatient.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Contact Number *"
                                name="contact"
                                fullWidth
                                required
                                value={editingPatient.contact}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Email *"
                                name="email"
                                type="email"
                                fullWidth
                                required
                                value={editingPatient.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Date of Birth *"
                                name="dateOfBirth"
                                type="date"
                                fullWidth
                                required
                                value={editingPatient.dateOfBirth}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Gender *</InputLabel>
                                <Select
                                    name="gender"
                                    value={editingPatient.gender}
                                    onChange={handleChange}
                                    label="Gender *"
                                >
                                    <MenuItem value="">Select Gender</MenuItem>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Age *"
                                name="age"
                                type="number"
                                fullWidth
                                required
                                value={editingPatient.age}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Address *"
                                name="address"
                                fullWidth
                                required
                                value={editingPatient.address}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Preferred Date *"
                                name="preferredDate"
                                type="date"
                                fullWidth
                                required
                                value={editingPatient.preferredDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Preferred Time *"
                                name="preferredTime"
                                type="time"
                                fullWidth
                                required
                                value={editingPatient.preferredTime}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Complaints / Disease"
                                name="disease"
                                fullWidth
                                multiline
                                rows={3}
                                value={editingPatient.disease}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: "#28a745" }}>
                            Save Changes
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default ViewPatientPage;
