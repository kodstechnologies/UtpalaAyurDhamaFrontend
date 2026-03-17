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
    IconButton,
    Paper,
} from "@mui/material";
import SubmitButton from "../../../components/buttons/SubmitButton";
import CancelButton from "../../../components/buttons/CancelButton";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

// Empty therapy row template (per-therapy configuration)
const getEmptyTherapyRow = () => ({
    therapyId: "",
    therapistId: [],
    totalSessions: "",
    timeline: "AlternateDay",
    notes: "",
    subTherapy: "",
    duration: "",
    treatmentDescription: "",
});

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
        therapiesRows: [getEmptyTherapyRow()],
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

                // Find matching therapy for the primary plan
                const primaryTherapy = therapies.find(
                    (t) => t.therapyName === plan.treatmentName
                );

                // Set form data (single editable therapy row for now)
                setFormData((prev) => ({
                    ...prev,
                    patientId: patient?._id || "",
                    patientName: patient?.user?.name || "",
                    examinationId: examination?._id || "",
                    therapiesRows: [
                        {
                            therapyId: primaryTherapy?._id || "",
                            therapistId: assignedTherapistIds,
                            totalSessions: plan.daysOfTreatment?.toString() || "",
                            timeline: plan.timeline || "AlternateDay",
                            notes: plan.specialInstructions || "",
                            subTherapy: plan.subTherapy || "",
                            duration: plan.duration || "",
                            treatmentDescription: plan.treatmentDescription || "",
                        },
                    ],
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

    const handleTherapyRowChange = (index, field, value) => {
        setFormData((prev) => {
            const updated = [...prev.therapiesRows];
            updated[index] = {
                ...updated[index],
                [field]: value,
            };
            return { ...prev, therapiesRows: updated };
        });
    };

    const handleAddTherapyRow = () => {
        setFormData((prev) => ({
            ...prev,
            therapiesRows: [...prev.therapiesRows, getEmptyTherapyRow()],
        }));
    };

    const handleRemoveTherapyRow = (index) => {
        setFormData((prev) => ({
            ...prev,
            therapiesRows: prev.therapiesRows.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.patientId || !formData.examinationId) {
            toast.error("Please select a patient and examination.");
            return;
        }

        const validTherapies = formData.therapiesRows.filter(
            (row) =>
                row.therapyId &&
                row.therapistId?.length > 0 &&
                row.totalSessions
        );

        if (validTherapies.length === 0) {
            toast.error("Please configure at least one therapy with therapist and sessions.");
            return;
        }

        setIsSubmitting(true);

        try {
            const results = [];

            for (const row of validTherapies) {
                const selectedTherapy = therapies.find(
                    (t) => t._id === row.therapyId || t.therapyName === row.therapyId
                );
                const treatmentNameToSend = selectedTherapy
                    ? selectedTherapy.therapyName
                    : row.therapyId;

                const requestData = {
                    examinationId: formData.examinationId,
                    treatmentName: treatmentNameToSend,
                    daysOfTreatment: parseInt(row.totalSessions, 10),
                    timeline: row.timeline || "AlternateDay",
                    specialInstructions: row.notes.trim() || "",
                    subTherapy: row.subTherapy.trim() || "",
                    duration: row.duration.trim() || "",
                    treatmentDescription: row.treatmentDescription.trim() || "",
                    therapistId: row.therapistId,
                };

                let response;
                if (isEditMode) {
                    // Update existing therapy plan (primary plan only)
                    response = await axios.patch(
                        getApiUrl(`examinations/therapy-plans/opd/${therapyPlanId}`),
                        requestData,
                        { headers: getAuthHeaders() }
                    );
                    // In edit mode we only support updating one plan from this screen
                    results.push(response.data.success);
                    break;
                } else {
                    // Create new therapy plan for each configured therapy
                    response = await axios.post(
                        getApiUrl("examinations/therapy-plans/opd"),
                        requestData,
                        { headers: getAuthHeaders() }
                    );
                    results.push(response.data.success);
                }
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

                    {/* Therapy configuration: multiple rows similar to Walk-in Hub */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Therapy Planning <span style={{ color: "red" }}>*</span>
                        </Typography>

                        {formData.therapiesRows.map((row, index) => (
                            <Paper
                                key={index}
                                elevation={0}
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    border: "1px solid var(--color-border)",
                                    position: "relative",
                                }}
                            >
                                {formData.therapiesRows.length > 1 && (
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveTherapyRow(index)}
                                        sx={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                        }}
                                    >
                                        <X size={14} />
                                    </IconButton>
                                )}

                                <Grid container spacing={2}>
                                    {/* Therapy Type */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                            Therapy Type <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <FormControl fullWidth required disabled={isLoadingTherapies}>
                                            <InputLabel>Select Therapy</InputLabel>
                                            <Select
                                                value={row.therapyId}
                                                label="Select Therapy"
                                                onChange={(e) =>
                                                    handleTherapyRowChange(index, "therapyId", e.target.value)
                                                }
                                            >
                                                <MenuItem value="">
                                                    <em>Select Therapy...</em>
                                                </MenuItem>
                                                {therapies.map((therapy) => (
                                                    <MenuItem key={therapy._id} value={therapy._id}>
                                                        {therapy.therapyName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Total Sessions */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                            Total Sessions <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            value={row.totalSessions}
                                            onChange={(e) =>
                                                handleTherapyRowChange(index, "totalSessions", e.target.value)
                                            }
                                            placeholder="Enter total number of sessions"
                                            inputProps={{ min: 1 }}
                                            required
                                        />
                                    </Grid>

                                    {/* Therapist Selection */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                            Therapists <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <FormControl fullWidth required disabled={isLoadingTherapists}>
                                            <InputLabel>Select Therapist</InputLabel>
                                            <Select
                                                multiple
                                                value={row.therapistId}
                                                label="Select Therapist"
                                                onChange={(e) =>
                                                    handleTherapyRowChange(
                                                        index,
                                                        "therapistId",
                                                        typeof e.target.value === "string"
                                                            ? e.target.value.split(",")
                                                            : e.target.value
                                                    )
                                                }
                                                input={<OutlinedInput label="Select Therapist" />}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                                        {selected.map((value) => {
                                                            const therapist = therapists.find((t) => t._id === value);
                                                            const name =
                                                                therapist?.name ||
                                                                therapist?.user?.name ||
                                                                value;
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
                                                        <Checkbox
                                                            checked={row.therapistId.indexOf(therapist._id) > -1}
                                                        />
                                                        <Typography>
                                                            {therapist.name ||
                                                                therapist.user?.name ||
                                                                `Therapist ${therapist._id}`}
                                                            {therapist.specialization &&
                                                                ` - ${therapist.specialization}`}
                                                        </Typography>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Timeline */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                            Timeline
                                        </Typography>
                                        <FormControl fullWidth>
                                            <InputLabel>Select Timeline</InputLabel>
                                            <Select
                                                value={row.timeline}
                                                label="Select Timeline"
                                                onChange={(e) =>
                                                    handleTherapyRowChange(index, "timeline", e.target.value)
                                                }
                                            >
                                                {timelineOptions.map((timeline) => (
                                                    <MenuItem key={timeline} value={timeline}>
                                                        {timeline === "AlternateDay"
                                                            ? "Alternate Day"
                                                            : timeline}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Sub Therapy */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                            Sub Therapy
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            value={row.subTherapy}
                                            onChange={(e) =>
                                                handleTherapyRowChange(index, "subTherapy", e.target.value)
                                            }
                                            placeholder="Enter sub therapy details (e.g. oil type, special additions)"
                                        />
                                    </Grid>

                                    {/* Duration */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                            Duration
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            value={row.duration}
                                            onChange={(e) =>
                                                handleTherapyRowChange(index, "duration", e.target.value)
                                            }
                                            placeholder="e.g. 45 mins, 1 hour"
                                        />
                                    </Grid>

                                    {/* Treatment Description */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                            Treatment Description
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            value={row.treatmentDescription}
                                            onChange={(e) =>
                                                handleTherapyRowChange(
                                                    index,
                                                    "treatmentDescription",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter detailed description of the treatment..."
                                        />
                                    </Grid>

                                    {/* Notes */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                            Special Instructions
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            value={row.notes}
                                            onChange={(e) =>
                                                handleTherapyRowChange(index, "notes", e.target.value)
                                            }
                                            placeholder="Enter any special instructions or notes"
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleAddTherapyRow}
                            >
                                Add Another Therapy
                            </Button>
                        </Box>
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
