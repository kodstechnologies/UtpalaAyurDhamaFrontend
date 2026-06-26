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
    Paper,
} from "@mui/material";
import SubmitButton from "../../../components/buttons/SubmitButton";
import CancelButton from "../../../components/buttons/CancelButton";
import { X, Plus, Trash2, User, Stethoscope } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

// Format a date value into YYYY-MM-DD for <input type="date">
const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-CA");
};

// Empty therapy row template (per-therapy configuration)
const getEmptyTherapyRow = () => ({
    id: "", // Added to track existing plans for PATCH
    therapyId: "",
    therapistId: [],
    totalSessions: "",
    timeline: "AlternateDay",
    notes: "",
    subTherapy: "",
    duration: "",
    treatmentDescription: "",
    startDate: new Date().toLocaleDateString("en-CA"),
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
    const [subTherapies, setSubTherapies] = useState([]);
    const [isLoadingSubTherapies, setIsLoadingSubTherapies] = useState(false);

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
                setExaminations(response.data.data || []);
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

    // Fetch sub-therapies
    const fetchSubTherapies = useCallback(async () => {
        setIsLoadingSubTherapies(true);
        try {
            const response = await axios.get(
                getApiUrl("sub-therapies"),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                setSubTherapies(response.data.data || []);
            } else {
                console.error("Failed to fetch sub-therapies:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching sub-therapies:", error);
        } finally {
            setIsLoadingSubTherapies(false);
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

                // Helper to map a plan object to a form row
                const mapPlanToRow = (planObj) => {
                    // Find matching therapy by name
                    const matchedTherapy = therapies.find(
                        (t) => t.therapyName === planObj.treatmentName
                    );

                    // Resolve therapist IDs
                    let therapistIds = [];
                    if (Array.isArray(planObj.therapistId) && planObj.therapistId.length > 0) {
                        therapistIds = planObj.therapistId.map(id => id.toString());
                    } else if (planObj.therapists?.length > 0) {
                        therapistIds = planObj.therapists.map(t => {
                            if (t.user?._id) return t.user._id.toString();
                            if (t.user) return t.user.toString();
                            if (t._id) return t._id.toString();
                            return t.toString();
                        });
                    } else if (planObj.therapistId && typeof planObj.therapistId === 'string') {
                        therapistIds = [planObj.therapistId];
                    }

                    return {
                        id: planObj._id || "",
                        therapyId: matchedTherapy?._id || planObj.treatmentName || "",
                        therapistId: therapistIds,
                        totalSessions: planObj.daysOfTreatment?.toString() || "",
                        timeline: planObj.timeline || "AlternateDay",
                        notes: planObj.specialInstructions || "",
                        subTherapy: planObj.subTherapy || "",
                        duration: planObj.duration || "",
                        treatmentDescription: planObj.treatmentDescription || "",
                        startDate: formatDateForInput(planObj.startDate),
                    };
                };

                // Create rows for current plan and all related plans
                const mainRow = mapPlanToRow(plan);
                const relatedRows = (plan.relatedPlans || []).map(mapPlanToRow);

                // Set form data with all therapy rows
                setFormData((prev) => ({
                    ...prev,
                    patientId: patient?._id || "",
                    patientName: patient?.user?.name || "",
                    examinationId: examination?._id || "",
                    therapiesRows: [mainRow, ...relatedRows],
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
        fetchSubTherapies();
    }, [fetchOPDPatients, fetchTherapies, fetchTherapists, fetchSubTherapies]);

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
        if (!formData.patientId) {
            toast.error("Please select a patient.");
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
                    examinationId: formData.examinationId || undefined,
                    patientId: formData.patientId,
                    treatmentName: treatmentNameToSend,
                    daysOfTreatment: parseInt(row.totalSessions, 10),
                    timeline: row.timeline || "AlternateDay",
                    specialInstructions: row.notes.trim() || "",
                    subTherapy: row.subTherapy.trim() || "",
                    duration: row.duration.trim() || "",
                    treatmentDescription: row.treatmentDescription.trim() || "",
                    therapistId: row.therapistId,
                    startDate: row.startDate || undefined,
                };

                let response;
                if (row.id) {
                    // Update existing therapy plan
                    response = await axios.patch(
                        getApiUrl(`examinations/therapy-plans/opd/${row.id}`),
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
                    p: { xs: 2.5, md: 4 },
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-medium)",
                    mt: 3,
                }}
            >
                {/* Section: Patient Information */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 2.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "var(--color-primary-light-v)",
                            color: "var(--color-primary)",
                            flexShrink: 0,
                        }}
                    >
                        <User size={20} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            Patient Information
                        </Typography>
                        <Typography variant="body2" sx={{ color: "var(--color-text-muted)" }}>
                            Select the patient and the related examination
                        </Typography>
                    </Box>
                </Box>

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
                            Select Examination
                        </Typography>
                        <FormControl fullWidth disabled={isLoadingExaminations || !formData.patientId}>
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

                    {/* Section divider */}
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                height: "1px",
                                backgroundColor: "var(--color-border)",
                                opacity: 0.25,
                                my: 1,
                            }}
                        />
                    </Grid>

                    {/* Therapy configuration: multiple rows similar to Walk-in Hub */}
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                mb: 2.5,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "var(--color-primary-light-v)",
                                    color: "var(--color-primary)",
                                    flexShrink: 0,
                                }}
                            >
                                <Stethoscope size={20} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                    Therapy Planning <span style={{ color: "var(--color-primary)" }}>*</span>
                                </Typography>
                                <Typography variant="body2" sx={{ color: "var(--color-text-muted)" }}>
                                    Configure one or more therapies for this plan
                                </Typography>
                            </Box>
                        </Box>

                        {formData.therapiesRows.map((row, index) => (
                            <Paper
                                key={index}
                                elevation={0}
                                sx={{
                                    mb: 2.5,
                                    borderRadius: 3,
                                    border: "1px solid var(--color-border)",
                                    borderLeft: "4px solid var(--color-primary)",
                                    overflow: "hidden",
                                    transition: "box-shadow 0.2s ease, transform 0.2s ease",
                                    "&:hover": {
                                        boxShadow: "var(--shadow-medium)",
                                    },
                                }}
                            >
                                {/* Card header */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        px: 2,
                                        py: 1.25,
                                        backgroundColor: "var(--color-primary-light-v)",
                                        borderBottom: "1px solid var(--color-border)",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 26,
                                                height: 26,
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: "var(--color-primary)",
                                                color: "#fff",
                                                fontSize: "0.8rem",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {index + 1}
                                        </Box>
                                        <Typography sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                            {row.therapyId
                                                ? therapies.find((t) => t._id === row.therapyId)?.therapyName || `Therapy ${index + 1}`
                                                : `Therapy ${index + 1}`}
                                        </Typography>
                                    </Box>
                                    {formData.therapiesRows.length > 1 && (
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<Trash2 size={15} />}
                                            onClick={() => handleRemoveTherapyRow(index)}
                                            sx={{ textTransform: "none", fontWeight: 600 }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </Box>

                                <Grid container spacing={2} sx={{ p: 2.5 }}>
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
                                                {[...therapies]
                                                    .sort((a, b) =>
                                                        (a.therapyName || "").localeCompare(b.therapyName || "")
                                                    )
                                                    .map((therapy) => (
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
                                                {[...therapists]
                                                    .sort((a, b) =>
                                                        (a.name || a.user?.name || "").localeCompare(
                                                            b.name || b.user?.name || ""
                                                        )
                                                    )
                                                    .map((therapist) => (
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
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                            Sub Therapy
                                        </Typography>
                                        <FormControl fullWidth disabled={isLoadingSubTherapies}>
                                            <InputLabel>Select Sub Therapy</InputLabel>
                                            <Select
                                                value={row.subTherapy || ""}
                                                label="Select Sub Therapy"
                                                onChange={(e) =>
                                                    handleTherapyRowChange(index, "subTherapy", e.target.value)
                                                }
                                            >
                                                <MenuItem value="">
                                                    <em>None</em>
                                                </MenuItem>
                                                {[...subTherapies]
                                                    .sort((a, b) =>
                                                        (a.name || "").localeCompare(b.name || "")
                                                    )
                                                    .map((st) => (
                                                        <MenuItem key={st._id} value={st.name}>
                                                            {st.name}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Duration */}
                                    <Grid item xs={12} md={3}>
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

                                    {/* Start Date */}
                                    <Grid item xs={12} md={3}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                            Start Date
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            value={row.startDate || ""}
                                            onChange={(e) =>
                                                handleTherapyRowChange(index, "startDate", e.target.value)
                                            }
                                            InputLabelProps={{ shrink: true }}
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

                        <Box
                            onClick={handleAddTherapyRow}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                                mt: 1,
                                py: 1.5,
                                borderRadius: 3,
                                border: "1.5px dashed var(--color-primary)",
                                color: "var(--color-primary)",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "background-color 0.2s ease",
                                "&:hover": {
                                    backgroundColor: "var(--color-primary-light-v)",
                                },
                            }}
                        >
                            <Plus size={18} />
                            Add Another Therapy
                        </Box>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box
                    sx={{
                        height: "1px",
                        backgroundColor: "var(--color-border)",
                        opacity: 0.25,
                        mt: 4,
                    }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
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
