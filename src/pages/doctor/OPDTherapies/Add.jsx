import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
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
    CircularProgress,
    Autocomplete,
    Checkbox,
    Chip,
    OutlinedInput,
} from "@mui/material";
import SubmitButton from "../../../components/buttons/SubmitButton";
import CancelButton from "../../../components/buttons/CancelButton";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function OPDTherapiesAddPage() {
    const navigate = useNavigate();
    const { id: therapyPlanId } = useParams();
    const [searchParams] = useSearchParams();
    const isEditMode = !!therapyPlanId;

    const [opdPatients, setOpdPatients] = useState([]);
    const [examinations, setExaminations] = useState([]);
    const [therapies, setTherapies] = useState([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);
    const [isLoadingExaminations, setIsLoadingExaminations] = useState(false);
    const [isLoadingTherapies, setIsLoadingTherapies] = useState(false);
    const [isLoadingExisting, setIsLoadingExisting] = useState(false);
    const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [therapists, setTherapists] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [formData, setFormData] = useState({
        patientId: "",
        patientName: "",
        examinationId: "",
        therapistId: [], // Array for multi-selection
        therapyType: [], // Array for multi-selection
        totalSessions: "",
        assignedDate: new Date().toISOString().split("T")[0],
        timeline: "AlternateDay",
        notes: "",
        subTherapy: "",
        duration: "",
        treatmentDescription: "",
    });

    // Fetch OPD patients
    const fetchOPDPatients = useCallback(async () => {
        setIsLoadingPatients(true);
        try {
            const response = await axios.get(
                getApiUrl("patients/opd"),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                setOpdPatients(response.data.data || []);
            } else {
                toast.error("Failed to fetch patients");
            }
        } catch (error) {
            console.error("Error fetching OPD patients:", error);
            toast.error(error.response?.data?.message || "Error fetching patients");
        } finally {
            setIsLoadingPatients(false);
        }
    }, []);

    // Fetch examinations for selected patient
    const fetchExaminations = useCallback(async (patientProfileId) => {
        if (!patientProfileId) {
            setExaminations([]);
            return;
        }

        setIsLoadingExaminations(true);
        try {
            const response = await axios.get(
                getApiUrl("examinations"),
                {
                    headers: getAuthHeaders(),
                    params: { patientId: patientProfileId }
                }
            );

            if (response.data.success) {
                // Filter OPD examinations (no inpatient)
                const opdExams = (response.data.data || []).filter(exam => !exam.inpatient);
                setExaminations(opdExams);
            }
        } catch (error) {
            console.error("Error fetching examinations:", error);
        } finally {
            setIsLoadingExaminations(false);
        }
    }, []);

    // Fetch therapists
    const fetchTherapists = useCallback(async () => {
        setIsLoadingTherapists(true);
        try {
            const response = await axios.get(
                getApiUrl("therapists"),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                setTherapists(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching therapists:", error);
        } finally {
            setIsLoadingTherapists(false);
        }
    }, []);

    // Fetch therapies
    const fetchTherapies = useCallback(async () => {
        setIsLoadingTherapies(true);
        try {
            const response = await axios.get(
                getApiUrl("therapies"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000,
                    }
                }
            );

            if (response.data.success) {
                setTherapies(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching therapies:", error);
        } finally {
            setIsLoadingTherapies(false);
        }
    }, []);

    // Fetch existing therapy plan data in edit mode
    const fetchExistingTherapyPlan = useCallback(async () => {
        if (!therapyPlanId || !isEditMode) return;

        setIsLoadingExisting(true);
        try {
            const response = await axios.get(
                getApiUrl(`examinations/therapy-plans/opd/${therapyPlanId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success && response.data.data) {
                const plan = response.data.data;
                const examination = plan.examination;
                const patient = examination?.patient;

                // Find patient in the list
                if (patient) {
                    const foundPatient = opdPatients.find(
                        p => p._id === patient._id || p._id === patient._id?.toString()
                    );
                    if (foundPatient) {
                        setSelectedPatient(foundPatient);
                        await fetchExaminations(patient._id);
                    }
                }

                // Resolve therapists
                let assignedTherapistIds = [];
                if (plan.therapists?.length > 0) {
                    assignedTherapistIds = plan.therapists.map(t => t.user?._id || t.user || t);
                } else if (plan.therapistId) {
                    assignedTherapistIds = [plan.therapistId];
                }

                // Find matching therapies for all related plans
                const relatedPlans = plan.relatedPlans || [];
                const allTherapyNames = [plan.treatmentName, ...relatedPlans.map(rp => rp.treatmentName)];
                const assignedTherapyIds = therapies
                    .filter(t => allTherapyNames.includes(t.therapyName))
                    .map(t => t._id);

                // Set form data
                setFormData((prev) => ({
                    ...prev,
                    patientId: patient?._id || "",
                    patientName: patient?.user?.name || "",
                    examinationId: examination?._id || "",
                    therapistId: assignedTherapistIds,
                    therapyType: assignedTherapyIds,
                    totalSessions: plan.daysOfTreatment?.toString() || "",
                    assignedDate: plan.createdAt
                        ? new Date(plan.createdAt).toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0],
                    timeline: plan.timeline || "AlternateDay",
                    notes: plan.specialInstructions || "",
                    subTherapy: plan.subTherapy || "",
                    duration: plan.duration || "",
                    treatmentDescription: plan.treatmentDescription || "",
                }));
            }
        } catch (error) {
            console.error("Error fetching existing therapy plan:", error);
            toast.error(error.response?.data?.message || "Failed to load therapy plan");
        } finally {
            setIsLoadingExisting(false);
        }
    }, [therapyPlanId, isEditMode, opdPatients, therapies, fetchExaminations]);

    useEffect(() => {
        fetchOPDPatients();
        fetchTherapies();
        fetchTherapists();
    }, [fetchOPDPatients, fetchTherapies, fetchTherapists]);

    // Fetch existing data when in edit mode and dependencies are ready
    useEffect(() => {
        if (isEditMode && opdPatients.length > 0 && therapies.length > 0) {
            fetchExistingTherapyPlan();
        }
    }, [isEditMode, opdPatients.length, therapies.length, fetchExistingTherapyPlan]);

    // Handle patient selection
    const handlePatientSelect = (event, newValue) => {
        setSelectedPatient(newValue);
        if (newValue) {
            const patientProfileId = newValue._id;
            setFormData((prev) => ({
                ...prev,
                patientId: patientProfileId,
                patientName: newValue.user?.name || "",
                examinationId: "", // Reset examination when patient changes
            }));
            fetchExaminations(patientProfileId);
        } else {
            setFormData((prev) => ({
                ...prev,
                patientId: "",
                patientName: "",
                examinationId: "",
            }));
            setExaminations([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.patientId || !formData.examinationId || formData.therapyType.length === 0 || formData.therapistId.length === 0 || !formData.totalSessions) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            const results = [];
            for (const therapyId of formData.therapyType) {
                const selectedTherapy = therapies.find(t => t._id === therapyId || t.therapyName === therapyId);
                const treatmentNameToSend = selectedTherapy ? selectedTherapy.therapyName : therapyId;

                const requestData = {
                    examinationId: formData.examinationId,
                    treatmentName: treatmentNameToSend,
                    daysOfTreatment: parseInt(formData.totalSessions, 10),
                    timeline: formData.timeline || "AlternateDay",
                    specialInstructions: formData.notes.trim() || "",
                    subTherapy: formData.subTherapy.trim() || "",
                    duration: formData.duration.trim() || "",
                    treatmentDescription: formData.treatmentDescription.trim() || "",
                    therapistId: formData.therapistId, // Pass the array
                };

                let response;
                if (isEditMode) {
                    // Update existing therapy plan
                    response = await axios.patch(
                        getApiUrl(`examinations/therapy-plans/opd/${therapyPlanId}`),
                        requestData,
                        { headers: getAuthHeaders() }
                    );
                } else {
                    // Create new therapy plan
                    response = await axios.post(
                        getApiUrl("examinations/therapy-plans/opd"),
                        requestData,
                        { headers: getAuthHeaders() }
                    );
                }
                results.push(response.data.success);
            }

            if (results.every(r => r)) {
                toast.success(isEditMode ? "OPD Therapy plan updated successfully!" : "OPD Therapy plans created successfully!");
                setTimeout(() => {
                    navigate("/doctor/opd-therapies");
                }, 1500);
            } else {
                toast.error(isEditMode ? "Failed to update OPD therapy plan" : "Failed to create some OPD therapy plans");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error saving therapy plan:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error saving therapy plan";
            toast.error(errorMessage);
            setIsSubmitting(false);
        }
    };

    const timelineOptions = ["AlternateDay", "Weekly", "Daily", "Monthly"];

    if (isLoadingExisting) {
        return (
            <div className="mx-[2rem]">
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            </div>
        );
    }

    return (
        <div className="mx-[2rem]">
            <HeadingCard
                title={isEditMode ? "Edit OPD Therapy Plan" : "Create OPD Therapy Plan"}
                subtitle={formData.patientName ? `Therapy plan for ${formData.patientName}` : "Create a new OPD therapy plan"}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "OP Consultation", url: "/doctor/op-consultation" },
                    { label: "OPD Therapies", url: "/doctor/opd-therapies" },
                    { label: isEditMode ? "Edit Therapy Plan" : "New Therapy Plan" },
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
                    {/* Patient Selection */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Select Patient <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Autocomplete
                            options={opdPatients}
                            getOptionLabel={(option) => {
                                const name = option.user?.name || "Unknown";
                                const uhid = option.user?.uhid || option.patientId || "";
                                return `${name}${uhid ? ` - UHID: ${uhid}` : ""}`;
                            }}
                            value={selectedPatient}
                            onChange={handlePatientSelect}
                            loading={isLoadingPatients}
                            disabled={isLoadingPatients || isEditMode}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select OPD patient"
                                    required
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {isLoadingPatients ? <CircularProgress size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option._id}>
                                    <Box>
                                        <Typography variant="body1" fontWeight={600}>
                                            {option.user?.name || "Unknown"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            UHID: {option.user?.uhid || option.patientId || "N/A"}
                                            {option.user?.phone && ` | Phone: ${option.user.phone}`}
                                        </Typography>
                                    </Box>
                                </li>
                            )}
                        />
                    </Grid>

                    {/* Examination Selection */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Select Examination <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <FormControl fullWidth required disabled={isLoadingExaminations || !formData.patientId}>
                            <InputLabel>Select Examination</InputLabel>
                            <Select
                                name="examinationId"
                                value={formData.examinationId}
                                label="Select Examination"
                                onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>Select Examination...</em>
                                </MenuItem>
                                {examinations.map((exam) => (
                                    <MenuItem key={exam._id} value={exam._id}>
                                        {exam.complaints || "Examination"} - {exam.createdAt
                                            ? new Date(exam.createdAt).toLocaleDateString()
                                            : "N/A"}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Therapy Type */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Therapy Type <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <FormControl fullWidth required disabled={isLoadingTherapies}>
                            <InputLabel>Select Therapy Type</InputLabel>
                            <Select
                                name="therapyType"
                                multiple
                                value={formData.therapyType}
                                label="Select Therapy Type"
                                onChange={handleChange}
                                input={<OutlinedInput label="Select Therapy Type" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const therapy = therapies.find(t => t._id === value);
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={therapy ? therapy.therapyName : value}
                                                    size="small"
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {therapies.map((therapy) => (
                                    <MenuItem key={therapy._id} value={therapy._id}>
                                        <Checkbox checked={formData.therapyType.indexOf(therapy._id) > -1} />
                                        <Typography>
                                            {therapy.therapyName}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Total Sessions */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Total Sessions <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="totalSessions"
                            type="number"
                            value={formData.totalSessions}
                            onChange={handleChange}
                            placeholder="Enter total number of sessions"
                            inputProps={{ min: 1 }}
                            required
                        />
                    </Grid>

                    {/* Therapist Selection */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Select Therapist <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <FormControl fullWidth required disabled={isLoadingTherapists}>
                            <InputLabel>Select Therapist</InputLabel>
                            <Select
                                name="therapistId"
                                multiple
                                value={formData.therapistId}
                                label="Select Therapist"
                                onChange={handleChange}
                                input={<OutlinedInput label="Select Therapist" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const therapist = therapists.find(t => t._id === value);
                                            const name = therapist?.name || (therapist?.user?.name) || value;
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={name}
                                                    size="small"
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {therapists.map((therapist) => (
                                    <MenuItem key={therapist._id} value={therapist._id}>
                                        <Checkbox checked={formData.therapistId.indexOf(therapist._id) > -1} />
                                        <Typography>
                                            {therapist.name || (therapist.user?.name) || `Therapist ${therapist._id}`}
                                            {therapist.specialization && ` - ${therapist.specialization}`}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Timeline */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Timeline
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>Select Timeline</InputLabel>
                            <Select
                                name="timeline"
                                value={formData.timeline}
                                label="Select Timeline"
                                onChange={handleChange}
                            >
                                {timelineOptions.map((timeline) => (
                                    <MenuItem key={timeline} value={timeline}>
                                        {timeline === "AlternateDay" ? "Alternate Day" : timeline === "Weekly" ? "Weekly" : timeline === "Daily" ? "Daily" : timeline}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Assigned Date */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Assigned Date <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="assignedDate"
                            type="date"
                            value={formData.assignedDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    {/* Sub Therapy */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Sub Therapy
                        </Typography>
                        <TextField
                            fullWidth
                            name="subTherapy"
                            value={formData.subTherapy}
                            onChange={handleChange}
                            placeholder="Enter sub therapy details (e.g. oil type, special additions)"
                        />
                    </Grid>

                    {/* Duration */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Duration
                        </Typography>
                        <TextField
                            fullWidth
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="e.g. 45 mins, 1 hour"
                        />
                    </Grid>

                    {/* Treatment Description */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Treatment Description
                        </Typography>
                        <TextField
                            fullWidth
                            name="treatmentDescription"
                            value={formData.treatmentDescription}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            placeholder="Enter detailed description of the treatment..."
                        />
                    </Grid>

                    {/* Notes */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Special Instructions
                        </Typography>
                        <TextField
                            fullWidth
                            name="notes"
                            multiline
                            rows={4}
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Enter any special instructions or notes"
                        />
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                    <CancelButton onClick={() => navigate("/doctor/opd-therapies")}>
                        <X size={16} style={{ marginRight: "8px" }} />
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        text={isEditMode ? "Update OPD Therapy Plan" : "Create OPD Therapy Plan"}
                        type="submit"
                        disabled={isSubmitting}
                    />
                </Box>
            </Box>
        </div>
    );
}

export default OPDTherapiesAddPage;
