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
    Autocomplete,
    CircularProgress,
} from "@mui/material";
import SubmitButton from "../../../components/buttons/SubmitButton";
import CancelButton from "../../../components/buttons/CancelButton";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

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
        therapistId: "",
        therapyType: "",
        totalSessions: "",
        assignedDate: new Date().toISOString().split("T")[0],
        timeline: "AlternateDay",
        notes: "",
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

                // Find matching therapy
                const matchingTherapy = therapies.find(
                    t => t.therapyName === plan.treatmentName
                );

                // Set form data
                setFormData((prev) => ({
                    ...prev,
                    inpatientId: inpatient?._id || "",
                    patientName: patient?.user?.name || "",
                    therapistId: plan.therapistId || "",
                    therapyType: matchingTherapy?._id || "",
                    totalSessions: plan.daysOfTreatment?.toString() || "",
                    assignedDate: plan.createdAt
                        ? new Date(plan.createdAt).toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0],
                    timeline: plan.timeline || "AlternateDay",
                    notes: plan.specialInstructions || "",
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.inpatientId || !formData.therapistId || !formData.therapyType || !formData.totalSessions) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Map form data to backend API structure
            const selectedTherapy = therapies.find(t => t._id === formData.therapyType);
            const requestData = {
                treatmentName: selectedTherapy?.therapyName || formData.therapyType,
                daysOfTreatment: parseInt(formData.totalSessions, 10),
                timeline: formData.timeline || "AlternateDay",
                specialInstructions: formData.notes.trim() || "",
                therapistId: formData.therapistId || null,
            };

            let response;
            if (isEditMode) {
                // Update existing therapy plan
                response = await axios.patch(
                    getApiUrl(`examinations/therapy-plans/ipd/${therapyPlanId}`),
                    requestData,
                    { headers: getAuthHeaders() }
                );
            } else {
            // Create therapy plan for inpatient
                response = await axios.post(
                getApiUrl(`inpatients/${formData.inpatientId}/therapy-plans`),
                requestData,
                { headers: getAuthHeaders() }
            );
            }

            if (response.data.success) {
                toast.success(isEditMode ? "IPD Therapy plan updated successfully!" : "IPD Therapy plan added successfully!");
                setTimeout(() => {
                    navigate("/doctor/assign-therapy");
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

                    {/* Therapist */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Therapist <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <FormControl fullWidth required disabled={isLoadingTherapists}>
                            <InputLabel>Select Therapist</InputLabel>
                            <Select
                                name="therapistId"
                                value={formData.therapistId}
                                label="Select Therapist"
                                onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>Select Therapist...</em>
                                </MenuItem>
                                {therapists.map((therapist) => {
                                    // Get therapist name from user object or fallback
                                    const therapistName = therapist.user?.name || therapist.name || "Unknown";
                                    // Get speciality (note: backend uses 'speciality', not 'specialization')
                                    const therapistSpeciality = therapist.speciality || therapist.specialization || "N/A";
                                    // Use user._id for the value (needed for assignment)
                                    const therapistUserId = therapist.user?._id || therapist.user || therapist._id;
                                    
                                    return (
                                        <MenuItem key={therapist._id} value={therapistUserId}>
                                            {therapistName} - {therapistSpeciality}
                                        </MenuItem>
                                    );
                                })}
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
                                value={formData.therapyType}
                                label="Select Therapy Type"
                                onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>Select Therapy Type...</em>
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
                                <MenuItem value="AlternateDay">Alternate Day</MenuItem>
                                <MenuItem value="Weekly">Weekly</MenuItem>
                                <MenuItem value="Daily">Daily</MenuItem>
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

                    {/* Notes */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Notes
                        </Typography>
                        <TextField
                            fullWidth
                            name="notes"
                            multiline
                            rows={4}
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Enter any additional notes or instructions"
                        />
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





