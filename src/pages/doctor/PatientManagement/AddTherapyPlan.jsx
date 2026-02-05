import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    TextField,
    Select,
    MenuItem,
    FormControl,
    Button,
    Box,
    Typography,
    Grid,
    Divider,
    CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function AddTherapyPlanPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inpatientId = searchParams.get("inpatientId") || "";
    const patientName = searchParams.get("patientName") || "";
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [therapists, setTherapists] = useState([]);
    const [therapies, setTherapies] = useState([]);
    const [patientData, setPatientData] = useState(null);
    const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);
    const [isLoadingTherapies, setIsLoadingTherapies] = useState(false);
    const [isLoadingPatient, setIsLoadingPatient] = useState(false);
    const [isLoadingExisting, setIsLoadingExisting] = useState(false);
    const [existingTreatmentPlanId, setExistingTreatmentPlanId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [formData, setFormData] = useState({
        patientName: "",
        patientId: "",
        therapistId: "",
        therapyType: "",
        totalSessions: "",
        assignedDate: new Date().toISOString().split("T")[0], // Default to today
        notes: "",
    });

    // Fetch patient information
    const fetchPatientData = useCallback(async () => {
        if (!inpatientId) return;

        setIsLoadingPatient(true);
        try {
            const response = await axios.get(
                getApiUrl(`inpatients/${inpatientId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success && response.data.data) {
                const inpatient = response.data.data;
                const patient = inpatient.patient?.user || {};
                const patientProfileId = inpatient.patient?._id || "";

                setPatientData(inpatient);
                setFormData((prev) => ({
                    ...prev,
                    patientName: patient.name || patientName || "",
                    patientId: patient.uhid || patientProfileId || "",
                }));
            }
        } catch (error) {
            console.error("Error fetching patient data:", error);
            // Set fallback values if fetch fails
            setFormData((prev) => ({
                ...prev,
                patientName: patientName || "",
            }));
        } finally {
            setIsLoadingPatient(false);
        }
    }, [inpatientId, patientName]);

    // Fetch therapists on component mount
    const fetchTherapists = useCallback(async () => {
        setIsLoadingTherapists(true);
        try {
            const response = await axios.get(
                getApiUrl("therapists"),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                setTherapists(response.data.data || []);
            } else {
                console.error("Failed to fetch therapists:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching therapists:", error);
        } finally {
            setIsLoadingTherapists(false);
        }
    }, []);

    // Fetch therapies for Therapy Type dropdown
    const fetchTherapies = useCallback(async () => {
        setIsLoadingTherapies(true);
        try {
            const response = await axios.get(
                getApiUrl("therapies"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000, // Get all therapies
                    }
                }
            );

            if (response.data.success) {
                setTherapies(response.data.data || []);
            } else {
                console.error("Failed to fetch therapies:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching therapies:", error);
        } finally {
            setIsLoadingTherapies(false);
        }
    }, []);

    // Fetch existing therapy plan data
    const fetchExistingTherapyPlan = useCallback(async () => {
        if (!inpatientId || therapies.length === 0 || therapists.length === 0) return;

        setIsLoadingExisting(true);
        try {
            // First, get therapy sessions for this inpatient
            const sessionsResponse = await axios.get(
                getApiUrl("therapist-sessions"),
                { headers: getAuthHeaders() }
            );

            if (sessionsResponse.data.success) {
                const allSessions = sessionsResponse.data.data || [];
                // Filter sessions by inpatient ID
                const filteredSessions = allSessions.filter(
                    session => session.inpatient?._id?.toString() === inpatientId ||
                        session.inpatient?.toString() === inpatientId
                );

                if (filteredSessions.length > 0) {
                    // Get the latest session (sorted by createdAt)
                    const latestSession = filteredSessions.sort((a, b) => {
                        const dateA = new Date(a.createdAt || 0).getTime();
                        const dateB = new Date(b.createdAt || 0).getTime();
                        return dateB - dateA;
                    })[0];

                    if (latestSession.treatmentPlan?._id || latestSession.treatmentPlan) {
                        const treatmentPlanId = latestSession.treatmentPlan?._id || latestSession.treatmentPlan;
                        setExistingTreatmentPlanId(treatmentPlanId);
                        setIsEditMode(true);

                        // Get the treatment plan details
                        const planResponse = await axios.get(
                            getApiUrl(`treatment-plans/${treatmentPlanId}`),
                            { headers: getAuthHeaders() }
                        );

                        if (planResponse.data.success && planResponse.data.data) {
                            const plan = planResponse.data.data;

                            // Find therapist user ID from the session
                            const therapistUserId = latestSession.therapist?.user?._id ||
                                latestSession.therapist?.user ||
                                (typeof latestSession.therapist === 'string' ? latestSession.therapist : null);

                            // Match therapist by user ID - therapists list contains User objects with _id
                            const matchingTherapist = therapists.find(
                                therapist => therapist._id?.toString() === therapistUserId?.toString()
                            );

                            // Find therapy by name
                            const matchingTherapy = therapies.find(
                                t => t.therapyName === plan.treatmentName
                            );

                            // Set form data
                            setFormData((prev) => ({
                                ...prev,
                                therapistId: matchingTherapist?._id || therapistUserId || "",
                                therapyType: matchingTherapy?._id || "",
                                totalSessions: plan.daysOfTreatment?.toString() || "",
                                assignedDate: plan.createdAt
                                    ? new Date(plan.createdAt).toISOString().split("T")[0]
                                    : new Date().toISOString().split("T")[0],
                                notes: plan.specialInstructions || "",
                            }));
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching existing therapy plan:", error);
            // Continue with create mode if fetch fails
        } finally {
            setIsLoadingExisting(false);
        }
    }, [inpatientId, therapies, therapists]);

    useEffect(() => {
        fetchPatientData();
        fetchTherapists();
        fetchTherapies();
    }, [fetchPatientData, fetchTherapists, fetchTherapies]);

    // Fetch existing data after therapies and therapists are loaded
    useEffect(() => {
        if (therapies.length > 0 && therapists.length > 0 && inpatientId) {
            fetchExistingTherapyPlan();
        }
    }, [therapies, therapists, inpatientId, fetchExistingTherapyPlan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.patientName || !formData.patientId || !formData.therapistId ||
            !formData.therapyType || !formData.totalSessions || !formData.assignedDate) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (!inpatientId) {
            toast.error("Invalid patient information. Please try again.");
            navigate(-1);
            return;
        }

        setIsSubmitting(true);

        try {
            // Map form data to backend API structure
            // Ensure we are sending the name, not the ID
            const selectedTherapy = therapies.find(t => t._id === formData.therapyType || t.therapyName === formData.therapyType);
            const treatmentNameToSend = selectedTherapy ? selectedTherapy.therapyName : formData.therapyType;

            const requestData = {
                treatmentName: treatmentNameToSend, // Use therapy name
                daysOfTreatment: parseInt(formData.totalSessions, 10),
                timeline: "AlternateDay", // Default timeline - can be updated if needed
                specialInstructions: formData.notes.trim() || "",
                therapistId: formData.therapistId,
            };

            let response;
            if (isEditMode && existingTreatmentPlanId) {
                // Update existing treatment plan
                response = await axios.patch(
                    getApiUrl(`treatment-plans/${existingTreatmentPlanId}`),
                    requestData,
                    { headers: getAuthHeaders() }
                );
            } else {
                // Create new therapy plan
                response = await axios.post(
                    getApiUrl(`inpatients/${inpatientId}/therapy-plans`),
                    requestData,
                    { headers: getAuthHeaders() }
                );
            }

            if (response.data.success) {
                toast.success(isEditMode ? "Therapy plan updated successfully!" : "Therapy plan added successfully!");
                setTimeout(() => {
                    navigate(-1);
                }, 1500);
            } else {
                toast.error(response.data.message || (isEditMode ? "Failed to update therapy plan" : "Failed to add therapy plan"));
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error saving therapy plan:", error);
            const errorMessage = error.response?.data?.message || error.message || (isEditMode ? "Error updating therapy plan" : "Error adding therapy plan");
            toast.error(errorMessage);
            setIsSubmitting(false);
        }
    };


    return (
        <div>
            <HeadingCard
                title={isEditMode ? "Edit Therapy Plan" : "Add Therapy Plan"}
                subtitle={`Patient: ${formData.patientName || patientName}`}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Patient Management", url: "/doctor/in-patients" },
                    { label: isEditMode ? "Edit Therapy Plan" : "Add Therapy Plan" },
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
                    <Grid container spacing={2}>
                        {/* Left Column */}
                        <Grid item xs={12} md={6}>
                            {/* Patient Name */}
                            <Field label="Patient Name">
                                <StyledTextField
                                    name="patientName"
                                    value={formData.patientName}
                                    onChange={handleChange}
                                    placeholder="Enter or select patient name"
                                    required
                                    disabled={isLoadingPatient}
                                />
                            </Field>

                            {/* Therapist */}
                            <Field label="Therapist">
                                <FormControl fullWidth>
                                    <Select
                                        name="therapistId"
                                        value={formData.therapistId}
                                        onChange={handleChange}
                                        displayEmpty
                                        disabled={isLoadingTherapists}
                                        required
                                        sx={{
                                            backgroundColor: "var(--color-bg-input)",
                                            borderRadius: "10px",
                                            height: "44px",
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
                                        <MenuItem value="">
                                            <Typography sx={{ color: "var(--color-text)" }}>
                                                Select Therapist *
                                            </Typography>
                                        </MenuItem>
                                        {therapists.map((therapist) => (
                                            <MenuItem key={therapist._id} value={therapist._id}>
                                                {therapist.name || `Therapist ${therapist._id}`}
                                                {therapist.specialization && ` - ${therapist.specialization}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Field>

                            {/* Total Sessions */}
                            <Field label="Total Sessions">
                                <StyledTextField
                                    name="totalSessions"
                                    type="number"
                                    value={formData.totalSessions}
                                    onChange={handleChange}
                                    placeholder="Enter total number of sessions"
                                    inputProps={{ min: 1 }}
                                    required
                                />
                            </Field>

                            {/* Notes */}
                            <Field label="Notes">
                                <StyledTextField
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    multiline
                                    rows={3}
                                    placeholder="Enter any additional notes or instructions"
                                />
                            </Field>
                        </Grid>

                        {/* Right Column */}
                        <Grid item xs={12} md={6}>
                            {/* Patient ID */}
                            <Field label="Patient ID">
                                <StyledTextField
                                    name="patientId"
                                    value={formData.patientId}
                                    onChange={handleChange}
                                    placeholder="Enter patient ID"
                                    required
                                    disabled={isLoadingPatient}
                                />
                            </Field>

                            {/* Therapy Type */}
                            <Field label="Therapy Type">
                                <FormControl fullWidth>
                                    <Select
                                        name="therapyType"
                                        value={formData.therapyType}
                                        onChange={handleChange}
                                        displayEmpty
                                        disabled={isLoadingTherapies}
                                        required
                                        sx={{
                                            backgroundColor: "var(--color-bg-input)",
                                            borderRadius: "10px",
                                            height: "44px",
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
                                        <MenuItem value="">
                                            <Typography sx={{ color: "var(--color-text)" }}>
                                                Select Therapy Type *
                                            </Typography>
                                        </MenuItem>
                                        {therapies.map((therapy) => (
                                            <MenuItem key={therapy._id} value={therapy._id}>
                                                {therapy.therapyName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Field>

                            {/* Assigned Date */}
                            <Field label="Assigned Date">
                                <StyledTextField
                                    name="assignedDate"
                                    type="date"
                                    value={formData.assignedDate}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        max: new Date().toISOString().split("T")[0], // Prevent future dates if needed
                                    }}
                                />
                            </Field>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2, borderColor: "var(--color-border)" }} />

                    {/* Actions */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
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
                                "&:disabled": {
                                    backgroundColor: "var(--color-btn)",
                                    opacity: 0.6,
                                },
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? "UPDATE THERAPY" : "ASSIGN THERAPY")}
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

const Field = ({ label, children }) => (
    <Box sx={{ mb: 2.5 }}>
        <Typography
            sx={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--color-text-dark)",
                mb: 0.5,
            }}
        >
            {label}
        </Typography>
        {children}
    </Box>
);

Field.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

const StyledTextField = (props) => (
    <TextField
        fullWidth
        sx={{
            "& .MuiOutlinedInput-root": {
                backgroundColor: "var(--color-bg-input)",
                borderRadius: "10px",
                "& fieldset": {
                    borderColor: "var(--color-border)",
                },
                "&:hover fieldset": {
                    borderColor: "var(--color-text-b)",
                },
                "&.Mui-focused fieldset": {
                    borderColor: "var(--color-text-dark-b)",
                    borderWidth: 2,
                },
            },
        }}
        {...props}
    />
);

export default AddTherapyPlanPage;