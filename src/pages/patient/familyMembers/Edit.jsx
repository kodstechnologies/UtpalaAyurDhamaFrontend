import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
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

function EditMemberPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        relation: "",
        phone: "",
        alternatePhoneNumber: "",
        email: "",
        age: "",
        gender: "",
        address: "",
    });

    // Fetch existing family member data
    useEffect(() => {
        const fetchFamilyMember = async () => {
            if (!id) {
                toast.error("Invalid family member ID");
                navigate("/patient/family");
                return;
            }

            setIsLoading(true);
            try {
                const response = await familyMemberService.getFamilyMemberById(id);

                if (response && response.success && response.data) {
                    const member = response.data;

                    // Calculate Age from DOB
                    let calculatedAge = "";
                    if (member.dateOfBirth) {
                        const dob = new Date(member.dateOfBirth);
                        const today = new Date();
                        let age = today.getFullYear() - dob.getFullYear();
                        const m = today.getMonth() - dob.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                            age--;
                        }
                        calculatedAge = age.toString();
                    }

                    setFormData({
                        fullName: member.fullName || "",
                        relation: member.relation || "",
                        phone: member.phoneNumber || member.user?.phone || "",
                        alternatePhoneNumber: member.alternatePhoneNumber || "",
                        email: member.email || member.user?.email || "",
                        age: calculatedAge,
                        gender: member.gender || "",
                        address: member.address || "",
                    });
                } else {
                    toast.error(response.message || "Failed to load family member");
                    navigate("/patient/family");
                }
            } catch (error) {
                console.error("Error fetching family member:", error);
                const errorMessage = error.response?.data?.message || error.message || "Failed to load family member";
                toast.error(errorMessage);
                navigate("/patient/family");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFamilyMember();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.fullName || !formData.phone || !formData.gender || !formData.age) {
            toast.error("Please fill in all required fields (Name, Phone, Gender, Age).");
            return;
        }

        if (formData.phone.length < 10) {
            toast.error("Please enter a valid contact number (10 digits).");
            return;
        }

        setIsSubmitting(true);

        try {
            // Calculate DOB from Age
            const age = parseInt(formData.age, 10);
            const today = new Date();
            const birthYear = today.getFullYear() - age;
            const dateOfBirth = new Date(birthYear, 0, 1).toISOString(); // Jan 1st of that year

            const requestData = {
                fullName: formData.fullName,
                relation: formData.relation,
                dateOfBirth: dateOfBirth,
                gender: formData.gender,
                phoneNumber: formData.phone,
                alternatePhoneNumber: formData.alternatePhoneNumber,
                email: formData.email,
                address: formData.address,
            };

            const response = await familyMemberService.updateFamilyMember(id, requestData);

            if (response && response.success) {
                toast.success("Family member updated successfully!");
                setTimeout(() => {
                    navigate("/patient/family", { state: { refresh: true } });
                }, 1500);
            } else {
                toast.error(response.message || "Failed to update family member");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error updating family member:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error updating family member";
            toast.error(errorMessage);
            setIsSubmitting(false);
        }
    };

    const relationOptions = ["Spouse", "Father", "Mother", "Daughter", "Son", "Brother", "Sister", "Other"];
    const genderOptions = ["Male", "Female", "Other"];

    if (isLoading) {
        return (
            <div>
                <HeadingCard
                    title="Edit Family Member"
                    subtitle="Update family member information"
                    breadcrumbItems={[
                        { label: "Home", url: "/" },
                        { label: "Patient", url: "/patient/dashboard" },
                        { label: "Family Members", url: "/patient/family" },
                        { label: "Edit Member" },
                    ]}
                />
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            </div>
        );
    }

    return (
        <div>
            <HeadingCard
                title="Edit Family Member"
                subtitle="Update family member information"
                breadcrumbItems={[
                    { label: "Home", url: "/" },
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Family Members", url: "/patient/family" },
                    { label: "Edit Member" },
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
                        {/* Patient Name */}
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
                                    Patient Name <span style={{ color: "var(--color-error)" }}>*</span>
                                </Typography>
                                <StyledTextField
                                    placeholder="Enter patient name"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </Box>
                        </Grid>

                        {/* Contact Number */}
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
                                    Contact Number <span style={{ color: "var(--color-error)" }}>*</span>
                                </Typography>
                                <StyledTextField
                                    placeholder="Enter contact number"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    inputProps={{ maxLength: 10 }}
                                    required
                                />
                            </Box>
                        </Grid>

                        {/* Alternative Number */}
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
                                    Alternative Number
                                </Typography>
                                <StyledTextField
                                    placeholder="Enter alternative number"
                                    name="alternatePhoneNumber"
                                    type="tel"
                                    value={formData.alternatePhoneNumber}
                                    onChange={handleChange}
                                    inputProps={{ maxLength: 10 }}
                                />
                            </Box>
                        </Grid>

                        {/* Email */}
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
                                    Email
                                </Typography>
                                <StyledTextField
                                    placeholder="Enter email address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
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

                        {/* Age */}
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
                                    Age <span style={{ color: "var(--color-error)" }}>*</span>
                                </Typography>
                                <StyledTextField
                                    placeholder="Enter age"
                                    name="age"
                                    type="number"
                                    value={formData.age}
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

                        {/* Address */}
                        <Grid item xs={12}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-dark)",
                                        mb: 0.5,
                                    }}
                                >
                                    Address
                                </Typography>
                                <StyledTextField
                                    placeholder="Enter address"
                                    name="address"
                                    multiline
                                    rows={3}
                                    value={formData.address}
                                    onChange={handleChange}
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
                            disabled={isSubmitting}
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
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Update Member"}
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

export default EditMemberPage;

