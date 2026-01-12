import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
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
    Divider,
    CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import familyMemberService from "../../../services/familyMemberService";

function AddMemberPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        relation: "",
        phone: "",
        dob: "",
        gender: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation (phone is optional - if not provided or same, will use main patient's phone)
        if (!formData.fullName || !formData.relation || !formData.dob || !formData.gender) {
            toast.error("Please fill in all required fields.");
            return;
        }

        // Phone validation (if provided, must be valid)
        if (formData.phone && formData.phone.length < 10) {
            toast.error("Please enter a valid phone number (10 digits).");
            return;
        }

        setIsSubmitting(true);

        try {
            // Format date for API (ISO format)
            const dateOfBirth = new Date(formData.dob).toISOString();

            const requestData = {
                fullName: formData.fullName,
                relation: formData.relation,
                dateOfBirth: dateOfBirth,
                gender: formData.gender,
            };

            // Include phoneNumber only if provided (optional field)
            if (formData.phone && formData.phone.trim()) {
                requestData.phoneNumber = formData.phone.trim();
            }

            const response = await familyMemberService.createFamilyMember(requestData);

            if (response && response.success) {
                toast.success("Family member added successfully!");
                setTimeout(() => {
                    navigate("/patient/family", { state: { refresh: true } });
                }, 1500);
            } else {
                toast.error(response?.message || "Failed to add family member");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error adding family member:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error adding family member";
            toast.error(errorMessage);
            setIsSubmitting(false);
        }
    };

    const relationOptions = ["Spouse", "Father", "Mother", "Daughter", "Son", "Brother", "Sister", "Other"];
    const genderOptions = ["Male", "Female", "Other"];

    return (
        <div>
            <HeadingCard
                title="Add New Family Member"
                subtitle="Add a new family member to your profile for better healthcare management"
                breadcrumbItems={[
                    { label: "Home", url: "/" },
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Family Members", url: "/patient/family" },
                    { label: "Add Member" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                }}
            >
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Full Name */}
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-dark)",
                                        mb: 0.5,
                                    }}
                                >
                                    Full Name <span style={{ color: "var(--color-error)" }}>*</span>
                                </Typography>
                                <StyledTextField
                                    placeholder="Enter full name"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </Box>
                        </Grid>

                        {/* Relation */}
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-dark)",
                                        mb: 0.5,
                                    }}
                                >
                                    Relation <span style={{ color: "var(--color-error)" }}>*</span>
                                </Typography>
                                <StyledSelect
                                    name="relation"
                                    value={formData.relation}
                                    onChange={handleChange}
                                    options={relationOptions}
                                    placeholder="Select relation"
                                />
                            </Box>
                        </Grid>

                        {/* Phone Number (Optional) */}
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-dark)",
                                        mb: 0.5,
                                    }}
                                >
                                    Phone Number <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", fontWeight: 400 }}>(Optional - will use your phone if not provided)</span>
                                </Typography>
                                <StyledTextField
                                    placeholder="Enter phone number (optional)"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    inputProps={{ maxLength: 10 }}
                                />
                            </Box>
                        </Grid>

                        {/* Date of Birth */}
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-dark)",
                                        mb: 0.5,
                                    }}
                                >
                                    Date of Birth <span style={{ color: "var(--color-error)" }}>*</span>
                                </Typography>
                                <StyledTextField
                                    name="dob"
                                    type="date"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Box>
                        </Grid>

                        {/* Gender */}
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-dark)",
                                        mb: 0.5,
                                    }}
                                >
                                    Gender <span style={{ color: "var(--color-error)" }}>*</span>
                                </Typography>
                                <StyledSelect
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    options={genderOptions}
                                    placeholder="Select gender"
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2, borderColor: "var(--color-border)" }} />

                    {/* Actions */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            sx={{
                                borderRadius: "10px",
                                px: 4,
                                py: 1.2,
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                backgroundColor: "var(--color-btn)",
                                color: "var(--color-text-light)",
                                fontWeight: 700,
                                borderRadius: "10px",
                                px: 4,
                                py: 1.2,
                                "&:hover": {
                                    backgroundColor: "var(--color-btn-dark)",
                                },
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Add Member"}
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

const StyledTextField = (props) => (
    <TextField
        fullWidth
        sx={{
            mb: 2,
            "& .MuiInputLabel-root": { color: "var(--color-text)" },
            "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-text-dark-b)" },
            "& .MuiOutlinedInput-root": {
                backgroundColor: "var(--color-bg-input)",
                borderRadius: "10px",
                "& fieldset": { borderColor: "var(--color-border)" },
                "&:hover fieldset": { borderColor: "var(--color-text-b)" },
                "&.Mui-focused fieldset": {
                    borderColor: "var(--color-text-dark-b)",
                    borderWidth: 2,
                },
            },
        }}
        {...props}
    />
);

const StyledSelect = ({ label, options, placeholder, ...props }) => (
    <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: "var(--color-text)" }}>{label || placeholder}</InputLabel>
        <Select
            {...props}
            label={label || placeholder}
            sx={{
                backgroundColor: "var(--color-bg-input)",
                borderRadius: "10px",
                "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-border)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-text-b)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-text-dark-b)",
                    borderWidth: 2,
                },
            }}
        >
            <MenuItem value="">Select {placeholder || "Option"}</MenuItem>
            {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                    {opt}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
);

StyledSelect.propTypes = {
    label: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    placeholder: PropTypes.string,
};

export default AddMemberPage;

