import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, Grid, CircularProgress } from "@mui/material";

function AddPatientPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        patientName: "",
        contactNumber: "",
        alternativeNumber: "",
        email: "",
        gender: "",
        age: "",
        address: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Number only filtering for contact fields
        if (name === "contactNumber" || name === "alternativeNumber") {
            const numericValue = value.replace(/\D/g, "");
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
            return;
        }

        // Age validation: Only numbers and one decimal point allowed, max 2 decimal places
        if (name === "age") {
            // Allow empty value
            if (value === "") {
                setFormData((prev) => ({ ...prev, [name]: value }));
                return;
            }

            // Only allow digits and one decimal point
            if (!/^\d*\.?\d*$/.test(value)) return;

            // Enforce max 2 decimal places
            if (value.includes(".") && value.split(".")[1].length > 2) return;

            setFormData((prev) => ({ ...prev, [name]: value }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleKeyDown = (e) => {
        // Prevent scientific notation characters and other symbols in number fields
        if (e.target.type === "number" || e.target.name === "age") {
            if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.patientName || !formData.contactNumber || !formData.email) {
            toast.error("Please fill in all required fields (Patient Name, Contact Number, Email)");
            return;
        }

        // Strict Contact Validation
        const contactRegex = /^\d{10}$/;
        if (!contactRegex.test(formData.contactNumber)) {
            toast.error("Contact number must be exactly 10 digits");
            return;
        }
        if (formData.alternativeNumber && !contactRegex.test(formData.alternativeNumber)) {
            toast.error("Alternative number must be exactly 10 digits");
            return;
        }

        // Strict Age Validation
        if (formData.age) {
            const ageNum = parseFloat(formData.age);
            if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
                toast.error("Please enter a valid age between 0 and 150");
                return;
            }
        }

        setIsSubmitting(true);

        try {
            // Prepare data - generate a temporary password for the user
            // The backend expects a password field but the form doesn't have it
            // Using a default password that should be changed later
            const patientData = {
                ...formData,
                password: "TempPassword123!", // Temporary password - should be changed by user later
            };

            const response = await axios.post(
                getApiUrl("reception-patients"),
                patientData,
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success("Patient registered successfully!");
                setTimeout(() => {
                    navigate("/receptionist/appointments");
                }, 1500);
            } else {
                toast.error(response.data.message || "Failed to register patient");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error registering patient:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error registering patient";
            toast.error(errorMessage);
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <HeadingCard
                title="Add New Patient"
                subtitle="Register a new patient in the system"
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "Add Patient" },
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
                                name="patientName"
                                fullWidth
                                required
                                value={formData.patientName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Contact Number *"
                                name="contactNumber"
                                type="tel"
                                fullWidth
                                required
                                value={formData.contactNumber}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                inputProps={{ maxLength: 10 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Alternative Number"
                                name="alternativeNumber"
                                type="tel"
                                fullWidth
                                value={formData.alternativeNumber}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                inputProps={{ maxLength: 10 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                fullWidth
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    label="Gender"
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
                                label="Age"
                                name="age"
                                fullWidth
                                value={formData.age}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g. 25.5"
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
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isSubmitting ? "Adding..." : "Add Patient"}
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default AddPatientPage;

