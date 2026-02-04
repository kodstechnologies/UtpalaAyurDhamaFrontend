
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, Grid, CircularProgress } from "@mui/material";
import familyMemberService from "../../../services/familyMemberService";

function EditPatientPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const isFamilyMember = searchParams.get("isFamilyMember") === "true";

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [doctors, setDoctors] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [availableTherapies, setAvailableTherapies] = useState([]);

    const [formData, setFormData] = useState({
        patientName: "", // Maps to fullName for family member
        contactNumber: "", // Maps to phoneNumber for family member
        alternativeNumber: "", // Maps to alternatePhoneNumber for family member
        email: "",
        gender: "",
        age: "",
        address: "",
        dateOfBirth: "", // Used for age calculation/storage
        primaryDoctor: "",
        primaryTherapist: "",
        doctorAssignedDate: "",
        therapistAssignedDate: "",
        assignedTherapy: "",
        therapyDurationDays: "",
        therapyTimeline: "Daily",
        therapyInstructions: "",
        therapyStartDate: "",
    });

    useEffect(() => {
        if (patientId) {
            fetchPatientDetails();
            fetchProviders();
        } else {
            toast.error("Invalid Patient ID");
            navigate("/receptionist/appointments");
        }
    }, [patientId]);

    const fetchProviders = async () => {
        try {
            const [doctorsRes, therapistsRes, therapiesRes] = await Promise.all([
                axios.get(getApiUrl("doctors/profiles"), { headers: getAuthHeaders() }),
                axios.get(getApiUrl("therapists"), { headers: getAuthHeaders() }),
                axios.get(getApiUrl("therapies"), { headers: getAuthHeaders() })
            ]);

            if (doctorsRes.data.success) {
                setDoctors(doctorsRes.data.data);
            }
            if (therapistsRes.data.success) {
                setTherapists(therapistsRes.data.data);
            }
            if (therapiesRes.data.success) {
                setAvailableTherapies(therapiesRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching providers/therapies:", error);
            // Don't block editing if providers fail to load, just maybe show toast?
            toast.error("Failed to load list of Doctors/Therapists/Therapies");
        }
    };

    const fetchPatientDetails = async () => {
        setIsLoading(true);
        try {
            let data;
            if (isFamilyMember) {
                const response = await familyMemberService.getFamilyMemberByIdForReceptionist(patientId);
                data = response.data;
                // Transform family member data to form structure
                // Family Member structure: { fullName, phoneNumber, alternatePhoneNumber, email, gender, dateOfBirth, ... }
                // Calculate age from DOB if age not directly available (usually not stored, calculated)
                let age = "";
                if (data.dateOfBirth) {
                    const dob = new Date(data.dateOfBirth);
                    const diffMs = Date.now() - dob.getTime();
                    const ageDt = new Date(diffMs);
                    age = Math.abs(ageDt.getUTCFullYear() - 1970).toString();
                }

                setFormData({
                    patientName: data.fullName || "",
                    contactNumber: data.phoneNumber || "",
                    alternativeNumber: data.alternatePhoneNumber || "",
                    email: data.email || "",
                    gender: data.gender || "",
                    age: age,
                    address: data.address || "",
                    dateOfBirth: data.dateOfBirth || "",
                    primaryDoctor: data.patientProfile?.primaryDoctor?._id || data.patientProfile?.primaryDoctor || "",
                    primaryTherapist: data.patientProfile?.primaryTherapist?._id || data.patientProfile?.primaryTherapist || "",
                    doctorAssignedDate: data.patientProfile?.doctorAssignedDate
                        ? new Date(data.patientProfile.doctorAssignedDate).toISOString().slice(0, 16)
                        : "",
                    therapistAssignedDate: data.patientProfile?.therapistAssignedDate
                        ? new Date(data.patientProfile.therapistAssignedDate).toISOString().slice(0, 16)
                        : "",
                    assignedTherapy: data.patientProfile?.assignedTherapy?._id || data.patientProfile?.assignedTherapy || "",
                    therapyDurationDays: data.patientProfile?.therapyDurationDays || "",
                    therapyTimeline: data.patientProfile?.therapyTimeline || "Daily",
                    therapyInstructions: data.patientProfile?.therapyInstructions || "",
                    therapyStartDate: data.patientProfile?.therapyStartDate
                        ? new Date(data.patientProfile.therapyStartDate).toISOString().slice(0, 10)
                        : "",
                });

            } else {
                // Regular Reception Patient
                const response = await axios.get(getApiUrl(`reception-patients/${patientId}`), {
                    headers: getAuthHeaders(),
                });
                data = response.data.data;
                // Reception Patient structure: { patientName, contactNumber, alternativeNumber, email, gender, age, address, ... }
                setFormData({
                    patientName: data.patientName || "",
                    contactNumber: data.contactNumber || "",
                    alternativeNumber: data.alternativeNumber || "",
                    email: data.email || "",
                    gender: data.gender || "",
                    age: data.age ? String(data.age) : "",
                    address: data.address || "",
                    dateOfBirth: "", // Reception patients usually store Age directly, but might vary
                    primaryDoctor: data.patientProfile?.primaryDoctor?._id || data.patientProfile?.primaryDoctor || "",
                    primaryTherapist: data.patientProfile?.primaryTherapist?._id || data.patientProfile?.primaryTherapist || "",
                    doctorAssignedDate: data.patientProfile?.doctorAssignedDate
                        ? new Date(data.patientProfile.doctorAssignedDate).toISOString().slice(0, 16)
                        : "",
                    therapistAssignedDate: data.patientProfile?.therapistAssignedDate
                        ? new Date(data.patientProfile.therapistAssignedDate).toISOString().slice(0, 16)
                        : "",
                    assignedTherapy: data.patientProfile?.assignedTherapy?._id || data.patientProfile?.assignedTherapy || "",
                    therapyDurationDays: data.patientProfile?.therapyDurationDays || "",
                    therapyTimeline: data.patientProfile?.therapyTimeline || "Daily",
                    therapyInstructions: data.patientProfile?.therapyInstructions || "",
                    therapyStartDate: data.patientProfile?.therapyStartDate
                        ? new Date(data.patientProfile.therapyStartDate).toISOString().slice(0, 10)
                        : "",
                });
            }
        } catch (error) {
            console.error("Error fetching patient details:", error);
            toast.error("Failed to fetch patient details");
            navigate("/receptionist/appointments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Number only filtering for contact fields
        if (name === "contactNumber" || name === "alternativeNumber") {
            const numericValue = value.replace(/\D/g, "");
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
            return;
        }

        // Age validation
        if (name === "age") {
            if (value === "") {
                setFormData((prev) => ({ ...prev, [name]: value }));
                return;
            }
            if (!/^\d*\.?\d*$/.test(value)) return;
            // Enforce max 2 decimal places
            if (value.includes(".") && value.split(".")[1].length > 2) return;
            setFormData((prev) => ({ ...prev, [name]: value }));
            return;
        }

        if (name === "primaryDoctor") {
            // Update assigned date to now if doctor changes to a valid ID
            // If cleared (value === ""), maybe clear date? Or keep it? Let's keep it simple: update to now if selecting.
            // Actually better to just set it to now if value is truthy.
            const now = value ? new Date().toISOString().slice(0, 16) : formData.doctorAssignedDate;
            setFormData((prev) => ({ ...prev, [name]: value, doctorAssignedDate: now }));
            return;
        }

        if (name === "primaryTherapist") {
            const now = value ? new Date().toISOString().slice(0, 16) : formData.therapistAssignedDate;
            setFormData((prev) => ({ ...prev, [name]: value, therapistAssignedDate: now }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleKeyDown = (e) => {
        if (e.target.type === "number" || e.target.name === "age") {
            if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.patientName || !formData.contactNumber) {
            toast.error("Please fill in required fields (Name, Contact Number)");
            return;
        }

        const contactRegex = /^\d{10}$/;
        if (!contactRegex.test(formData.contactNumber)) {
            toast.error("Contact number must be exactly 10 digits");
            return;
        }
        if (formData.alternativeNumber && !contactRegex.test(formData.alternativeNumber)) {
            toast.error("Alternative number must be exactly 10 digits");
            return;
        }

        setIsSubmitting(true);

        try {
            if (isFamilyMember) {
                // Prepare update for Family Member
                // Need to convert Age back to DOB if changed, or just send DOB if we have logic correctly
                // The service we updated (updateFamilyMemberForReceptionist) expects:
                // fullName, relation, dateOfBirth, gender, alternatePhoneNumber, email, address
                // We don't have relation editing here (maybe should default or keep existing?)
                // We will only send fields we are editing.

                // Calculate DOB from Age if Age is present
                // Note: Simplified logic. For accurate updates, ideally we edit DOB directly.
                // But Receptionist usually asks Age.
                // If Age is provided, we estimate DOB (Today - Age years).
                // Or if we have original DOB and Age hasn't "changed" drastically, keep it?
                // For simplicity, let's recalculate DOB based on Age if provided.

                let dateOfBirth = formData.dateOfBirth;
                if (formData.age) {
                    const ageNum = parseFloat(formData.age);
                    const today = new Date();
                    const birthYear = today.getFullYear() - ageNum;
                    // Set to Jan 1st of calculated year or preserve month/day if we had previous logic?
                    // Let's use current logic: create a date.
                    // A simple approach: Date(Current - Age)
                    const birthDate = new Date(today.setFullYear(today.getFullYear() - Math.floor(ageNum)));
                    dateOfBirth = birthDate.toISOString();
                }

                const updateData = {
                    fullName: formData.patientName,
                    phoneNumber: formData.contactNumber,
                    alternatePhoneNumber: formData.alternativeNumber,
                    email: formData.email,
                    gender: formData.gender,
                    address: formData.address,
                    dateOfBirth: dateOfBirth,
                    // Including assignment details for family members as well
                    primaryDoctor: formData.primaryDoctor,
                    primaryTherapist: formData.primaryTherapist,
                    doctorAssignedDate: formData.doctorAssignedDate,
                    therapistAssignedDate: formData.therapistAssignedDate,
                    assignedTherapy: formData.assignedTherapy,
                    therapyDurationDays: formData.therapyDurationDays,
                    therapyTimeline: formData.therapyTimeline,
                    therapyInstructions: formData.therapyInstructions,
                    therapyStartDate: formData.therapyStartDate,
                };

                await familyMemberService.updateFamilyMemberForReceptionist(patientId, updateData);

            } else {
                // Regular Reception Patient
                const updateData = {
                    patientName: formData.patientName,
                    contactNumber: formData.contactNumber,
                    alternativeNumber: formData.alternativeNumber,
                    email: formData.email,
                    gender: formData.gender,
                    age: formData.age,
                    address: formData.address,
                    primaryDoctor: formData.primaryDoctor,
                    primaryTherapist: formData.primaryTherapist,
                    doctorAssignedDate: formData.doctorAssignedDate,
                    therapistAssignedDate: formData.therapistAssignedDate,
                    assignedTherapy: formData.assignedTherapy,
                    therapyDurationDays: formData.therapyDurationDays,
                    therapyTimeline: formData.therapyTimeline,
                    therapyInstructions: formData.therapyInstructions,
                    therapyStartDate: formData.therapyStartDate,
                };

                await axios.patch(getApiUrl(`reception-patients/${patientId}`), updateData, {
                    headers: getAuthHeaders(),
                });
            }

            toast.success("Patient details updated successfully!");
            setTimeout(() => {
                navigate("/receptionist/appointments");
            }, 1000);

        } catch (error) {
            console.error("Error updating patient:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to update patient";
            toast.error(errorMessage);
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <HeadingCard
                title="Edit Patient Details"
                subtitle="Update patient information"
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "Edit Patient" },
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
                                helperText={isFamilyMember ? "Updates linked User account too" : ""}
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
                                helperText={isFamilyMember ? "Updates linked User account too" : ""}
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
                                placeholder="e.g. 25"
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


                        {/* Doctor Section */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                                <strong>Doctor Details</strong>
                            </Box>
                        </Grid>

                        {/* Doctor Assignment Section */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Primary Doctor</InputLabel>
                                <Select
                                    name="primaryDoctor"
                                    value={formData.primaryDoctor || ""}
                                    onChange={handleChange}
                                    label="Primary Doctor"
                                >
                                    <MenuItem value="">Select Doctor</MenuItem>
                                    {doctors.map((doc) => (
                                        <MenuItem key={doc._id} value={doc._id}>
                                            {doc.firstName} {doc.lastName} ({doc.specialization})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Doctor Assigned Date"
                                name="doctorAssignedDate"
                                type="datetime-local"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.doctorAssignedDate || ""}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* Therapy Section */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                                <strong>Therapy Details</strong>
                            </Box>
                        </Grid>

                        {/* Row 1: Therapy, Days, Timeline */}
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Select Therapy</InputLabel>
                                <Select
                                    name="assignedTherapy"
                                    value={formData.assignedTherapy || ""}
                                    onChange={handleChange}
                                    label="Select Therapy"
                                >
                                    <MenuItem value="">Select Therapy</MenuItem>
                                    {availableTherapies.map((therapy) => (
                                        <MenuItem key={therapy._id} value={therapy._id}>
                                            {therapy.therapyName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Days</InputLabel>
                                <Select
                                    name="therapyDurationDays"
                                    value={formData.therapyDurationDays || ""}
                                    onChange={handleChange}
                                    label="Days"
                                >
                                    <MenuItem value="">Select Days</MenuItem>
                                    {[1, 3, 5, 7, 10, 14, 21, 28, 30].map((day) => (
                                        <MenuItem key={day} value={day}>{day} Days</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Timeline</InputLabel>
                                <Select
                                    name="therapyTimeline"
                                    value={formData.therapyTimeline || "Daily"}
                                    onChange={handleChange}
                                    label="Timeline"
                                >
                                    <MenuItem value="Daily">Daily</MenuItem>
                                    <MenuItem value="Alternate Days">Alternate Days</MenuItem>
                                    <MenuItem value="Weekly">Weekly</MenuItem>
                                    <MenuItem value="Once">Once</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Row 2: Therapist and Assigned Date (To match Doctor Row) */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Assign Therapist</InputLabel>
                                <Select
                                    name="primaryTherapist"
                                    value={formData.primaryTherapist || ""}
                                    onChange={handleChange}
                                    label="Assign Therapist"
                                >
                                    <MenuItem value="">Select Therapist</MenuItem>
                                    {therapists.map((therapist) => (
                                        <MenuItem key={therapist._id} value={therapist._id}>
                                            {therapist.name || (therapist.user?.name) || "Unknown Therapist"} ({therapist.specialization || therapist.speciality || "General"})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Therapist Assigned Date"
                                name="therapistAssignedDate"
                                type="datetime-local"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.therapistAssignedDate || ""}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* Row 3: Instructions and Start Date */}
                        <Grid item xs={12} md={8}>
                            <TextField
                                label="Special Instructions"
                                name="therapyInstructions"
                                fullWidth
                                value={formData.therapyInstructions || ""}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Start Date"
                                name="therapyStartDate"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.therapyStartDate || ""}
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
                            {isSubmitting ? "Update Details" : "Update Details"}
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default EditPatientPage;
