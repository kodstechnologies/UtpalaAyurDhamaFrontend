import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Grid,
    CircularProgress,
    Typography,
    Divider
} from "@mui/material";
import HeadingCard from "../../../components/card/HeadingCard";
import familyMemberService from "../../../services/familyMemberService";

function AddFamilyMemberPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { primaryPatient } = location.state || {};

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        relation: "",
        phoneNumber: primaryPatient?.contact || "",
        alternatePhoneNumber: primaryPatient?.alternativeNumber || "",
        email: "",
        age: "",
        gender: "",
        address: primaryPatient?.address || "",
    });

    if (!primaryPatient) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" color="error">
                    No primary patient selected. Please go back and select a patient.
                </Typography>
                <Button variant="contained" onClick={() => navigate("/receptionist/appointments")} sx={{ mt: 2 }}>
                    Go to Appointments
                </Button>
            </Box>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.relation || !formData.gender || !formData.age) {
            toast.error("Please fill in all required fields (Name, Relation, Gender, Age)");
            return;
        }

        setIsSubmitting(true);
        try {
            // Calculate DOB from Age
            const ageNum = parseInt(formData.age, 10);
            const today = new Date();
            const birthYear = today.getFullYear() - ageNum;
            const dateOfBirth = new Date(birthYear, 0, 1).toISOString();

            const payload = {
                ...formData,
                dateOfBirth,
                primaryPatientProfileId: primaryPatient.patientProfileId || primaryPatient.id,
            };

            const response = await familyMemberService.createFamilyMemberForReceptionist(payload);
            if (response.success) {
                toast.success("Family member added successfully!");
                setTimeout(() => {
                    navigate("/receptionist/appointments");
                }, 1500);
            } else {
                toast.error(response.message || "Failed to add family member");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error adding family member:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to add family member");
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <HeadingCard
                title={`Add Family Member for ${primaryPatient.name}`}
                subtitle={`Link a new family member to ${primaryPatient.name}'s profile`}
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "Add Family Member" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 4,
                    mt: 2,
                    maxWidth: "900px",
                    mx: "auto",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
                }}
            >
                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" sx={{ mb: 3, color: "#8B4513", fontWeight: 600 }}>
                        Family Member Details
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Full Name"
                                name="fullName"
                                fullWidth
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Relation</InputLabel>
                                <Select
                                    name="relation"
                                    value={formData.relation}
                                    onChange={handleChange}
                                    label="Relation"
                                >
                                    <MenuItem value="Father">Father</MenuItem>
                                    <MenuItem value="Mother">Mother</MenuItem>
                                    <MenuItem value="Spouse">Spouse</MenuItem>
                                    <MenuItem value="Son">Son</MenuItem>
                                    <MenuItem value="Daughter">Daughter</MenuItem>
                                    <MenuItem value="Brother">Brother</MenuItem>
                                    <MenuItem value="Sister">Sister</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Phone Number"
                                name="phoneNumber"
                                fullWidth
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Alternate Phone Number"
                                name="alternatePhoneNumber"
                                fullWidth
                                value={formData.alternatePhoneNumber}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Age"
                                name="age"
                                type="number"
                                fullWidth
                                required
                                value={formData.age}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth required>
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    label="Gender"
                                >
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Email (Optional)"
                                name="email"
                                type="email"
                                fullWidth
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Address"
                                name="address"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            disabled={isSubmitting}
                            sx={{ px: 4, borderRadius: "8px" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                backgroundColor: "#8B4513",
                                px: 4,
                                borderRadius: "8px",
                                "&:hover": { backgroundColor: "#6F370F" }
                            }}
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isSubmitting ? "Adding..." : "Add Family Member"}
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default AddFamilyMemberPage;
