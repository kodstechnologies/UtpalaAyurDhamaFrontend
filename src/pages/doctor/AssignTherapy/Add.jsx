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
    Autocomplete,
    CircularProgress,
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

// Per-therapy row template (same structure as OPD Therapy Plan)
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

function AssignTherapyAddPage() {
    const navigate = useNavigate();
    const { id: therapyPlanId } = useParams();
    const [searchParams] = useSearchParams();
    const inpatientId = searchParams.get("inpatientId") || "";
    const patientName = searchParams.get("patientName") || "";
    const isEditMode = !!therapyPlanId;

    const [inpatients, setInpatients] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [therapies, setTherapies] = useState([]);
    const [isLoadingInpatients, setIsLoadingInpatients] = useState(false);
    const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);
    const [isLoadingTherapies, setIsLoadingTherapies] = useState(false);
    const [isLoadingExisting, setIsLoadingExisting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedInpatient, setSelectedInpatient] = useState(null);

    const [formData, setFormData] = useState({
        inpatientId: inpatientId,
        patientName: patientName,
        assignedDate: new Date().toISOString().split("T")[0],
        therapiesRows: [getEmptyTherapyRow()],
    });

    // Fetch inpatients
    const fetchInpatients = useCallback(async () => {
        setIsLoadingInpatients(true);
        try {
            const response = await axios.get(
                getApiUrl("inpatients"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000,
                    }
                }
            );

            if (response.data.success) {
                const inpatientsData = response.data.data || [];
                // Filter only admitted patients
                const admittedInpatients = inpatientsData.filter(
                    ip => ip.status === "Admitted"
                );
                setInpatients(admittedInpatients);

                // If inpatientId or patientName is provided in URL, find and select that inpatient
                if (inpatientId || patientName) {
                    const foundInpatient = admittedInpatients.find(
                        (ip) => ip._id === inpatientId || ip.patient?.user?.name === patientName
                    );
                    if (foundInpatient) {
                        setSelectedInpatient(foundInpatient);
                        setFormData((prev) => ({
                            ...prev,
                            inpatientId: foundInpatient._id,
                            patientName: foundInpatient.patient?.user?.name || patientName,
                        }));
                    }
                }
            } else {
                toast.error("Failed to fetch inpatients");
            }
        } catch (error) {
            console.error("Error fetching inpatients:", error);
            toast.error(error.response?.data?.message || "Error fetching inpatients");
        } finally {
            setIsLoadingInpatients(false);
        }
    }, [inpatientId, patientName]);

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
            } else {
                console.error("Failed to fetch therapists:", response.data.message);
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
            } else {
                console.error("Failed to fetch therapies:", response.data.message);
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
                getApiUrl(`examinations/therapy-plans/ipd/${therapyPlanId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success && response.data.data) {
                const plan = response.data.data;
                const examination = plan.examination;
                const inpatient = examination?.inpatient;
                const patient = examination?.patient;

                // Find inpatient in the list
                if (inpatient) {
                    const foundInpatient = inpatients.find(
                        ip => ip._id === inpatient._id || ip._id === inpatient._id?.toString()
                    );
                    if (foundInpatient) {
                        setSelectedInpatient(foundInpatient);
                    }
                }

                // Resolve therapists
                let assignedTherapistIds = [];
                if (plan.therapists?.length > 0) {
                    assignedTherapistIds = plan.therapists.map(t => t.user?._id || t.user || t);
                } else if (plan.therapistId) {
                    assignedTherapistIds = [plan.therapistId];
                }

                // Primary plan as single row (edit mode supports one plan from this screen)
                const primaryTherapy = therapies.find(
                    (t) => t.therapyName === plan.treatmentName
                );

                setFormData((prev) => ({
                    ...prev,
                    inpatientId: inpatient?._id || "",
                    patientName: patient?.user?.name || "",
                    assignedDate: plan.startDate
                        ? new Date(plan.startDate).toISOString().split("T")[0]
                        : (plan.createdAt
                            ? new Date(plan.createdAt).toISOString().split("T")[0]
                            : new Date().toISOString().split("T")[0]),
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
    }, [therapyPlanId, isEditMode, inpatients, therapies]);

    useEffect(() => {
        fetchInpatients();
        fetchTherapists();
        fetchTherapies();
    }, [fetchInpatients, fetchTherapists, fetchTherapies]);

    // Fetch existing data when in edit mode and dependencies are ready
    useEffect(() => {
        if (isEditMode && inpatients.length > 0 && therapies.length > 0) {
            fetchExistingTherapyPlan();
        }
    }, [isEditMode, inpatients.length, therapies.length, fetchExistingTherapyPlan]);

    // Handle inpatient selection
    const handleInpatientSelect = (event, newValue) => {
        setSelectedInpatient(newValue);
        if (newValue) {
            setFormData((prev) => ({
                ...prev,
                inpatientId: newValue._id,
                patientName: newValue.patient?.user?.name || "",
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                inpatientId: "",
                patientName: "",
            }));
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

        if (!formData.inpatientId) {
            toast.error("Please select an inpatient.");
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
                    treatmentName: treatmentNameToSend,
                    daysOfTreatment: parseInt(row.totalSessions, 10),
                    timeline: row.timeline || "AlternateDay",
                    specialInstructions: row.notes.trim() || "",
                    subTherapy: row.subTherapy.trim() || "",
                    duration: row.duration.trim() || "",
                    treatmentDescription: row.treatmentDescription.trim() || "",
                    therapistId: row.therapistId,
                    startDate: formData.assignedDate ? new Date(formData.assignedDate).toISOString() : undefined,
                };

                let response;
                if (isEditMode) {
                    response = await axios.patch(
                        getApiUrl(`examinations/therapy-plans/ipd/${therapyPlanId}`),
                        requestData,
                        { headers: getAuthHeaders() }
                    );
                    results.push(response.data.success);
                    break; // Edit mode: only one plan
                } else {
                    response = await axios.post(
                        getApiUrl(`inpatients/${formData.inpatientId}/therapy-plans`),
                        requestData,
                        { headers: getAuthHeaders() }
                    );
                    results.push(response.data.success);
                }
            }

            if (results.every(r => r)) {
                toast.success(isEditMode ? "IPD Therapy plan updated successfully!" : "IPD Therapy plans created successfully!");
                setTimeout(() => {
                    navigate("/doctor/assign-therapy");
                }, 1500);
            } else {
                toast.error(isEditMode ? "Failed to update IPD therapy plan" : "Failed to create some IPD therapy plans");
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

    return (
        <div className="mx-[2rem]">
            {isLoadingExisting ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <HeadingCard
                        title={isEditMode ? "Edit IPD Therapy Plan" : "Assign New IPD Therapy"}
                        subtitle={formData.patientName ? `Therapy plan for ${formData.patientName}` : (isEditMode ? "Edit IPD therapy plan" : "Assign IPD therapy to an inpatient")}
                        breadcrumbItems={[
                            { label: "Doctor", url: "/doctor/dashboard" },
                            { label: "In Patients", url: "/doctor/in-patients" },
                            { label: "IPD Therapies", url: "/doctor/assign-therapy" },
                            { label: isEditMode ? "Edit Therapy Plan" : "New Assignment" },
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
                            {/* Inpatient Selection */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                                    Select Inpatient <span style={{ color: "red" }}>*</span>
                                </Typography>
                                <Autocomplete
                                    options={inpatients}
                                    getOptionLabel={(option) => {
                                        const patientName = option.patient?.user?.name || "Unknown";
                                        const roomNumber = option.roomNumber || "N/A";
                                        const bedNumber = option.bedNumber ? `Bed: ${option.bedNumber}` : "";
                                        return `${patientName} - Room: ${roomNumber}${bedNumber ? `, ${bedNumber}` : ""}`;
                                    }}
                                    value={selectedInpatient}
                                    onChange={handleInpatientSelect}
                                    loading={isLoadingInpatients}
                                    disabled={isLoadingInpatients || isEditMode}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select inpatient"
                                            required
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {isLoadingInpatients ? <CircularProgress size={20} /> : null}
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
                                                    {option.patient?.user?.name || "Unknown"}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Room: {option.roomNumber || "N/A"}
                                                    {option.bedNumber && ` | Bed: ${option.bedNumber}`}
                                                    {option.patient?.user?.uhid && ` | UHID: ${option.patient.user.uhid}`}
                                                </Typography>
                                            </Box>
                                        </li>
                                    )}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            backgroundColor: "var(--color-bg-input)",
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Assigned Date (form-level, applies to all rows in create) */}
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

                            {/* Therapy Planning: multiple rows (same as OPD) */}
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
                                                                    const therapist = therapists.find(
                                                                        (t) => (t.user?._id || t.user || t._id) === value
                                                                    );
                                                                    const name =
                                                                        therapist?.user?.name ||
                                                                        therapist?.name ||
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
                                                        {therapists.map((therapist) => {
                                                            const therapistUserId = therapist.user?._id || therapist.user || therapist._id;
                                                            return (
                                                                <MenuItem key={therapist._id} value={therapistUserId}>
                                                                    <Checkbox
                                                                        checked={row.therapistId.indexOf(therapistUserId) > -1}
                                                                    />
                                                                    <Typography>
                                                                        {therapist.user?.name || therapist.name || "Unknown"}
                                                                        {(therapist.speciality || therapist.specialization) &&
                                                                            ` - ${therapist.speciality || therapist.specialization}`}
                                                                    </Typography>
                                                                </MenuItem>
                                                            );
                                                        })}
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
                            <CancelButton onClick={() => navigate("/doctor/assign-therapy")}>
                                <X size={16} style={{ marginRight: "8px" }} />
                                Cancel
                            </CancelButton>
                            <SubmitButton
                                text={isEditMode ? "Update IPD Therapy Plan" : "Assign IPD Therapy"}
                                type="submit"
                                disabled={isSubmitting}
                            />
                        </Box>
                    </Box>
                </>
            )}
        </div>
    );
}

export default AssignTherapyAddPage;





