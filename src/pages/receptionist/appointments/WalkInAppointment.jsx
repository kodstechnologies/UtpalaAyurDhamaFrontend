import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress } from "@mui/material";

function WalkInAppointmentPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId") || "";
    const patientName = searchParams.get("patientName") || "";

    const [formData, setFormData] = useState({
        patientId: patientId,
        therapistId: "",
        treatmentName: "",
        daysOfTreatment: 1,
        timeline: "Daily",
        specialInstructions: "",
        sessionDate: new Date().toISOString().split("T")[0],
        sessionTime: "",
    });

    const [sessionId, setSessionId] = useState(null);
    const [therapists, setTherapists] = useState([]);
    const [therapies, setTherapies] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoadingData(true);
        try {
            const [therapistsRes, therapiesRes, existingSessionRes] = await Promise.all([
                axios.get(getApiUrl("therapists"), { headers: getAuthHeaders() }),
                axios.get(getApiUrl("therapies?limit=100"), { headers: getAuthHeaders() }),
                (patientId && patientId !== "null") ? axios.get(getApiUrl(`therapist-sessions/walk-in/${patientId}`), { headers: getAuthHeaders() }) : Promise.resolve({ data: { success: false } })
            ]);

            if (therapistsRes.data.success) {
                setTherapists(therapistsRes.data.data || []);
            }
            if (therapiesRes.data.success) {
                setTherapies(therapiesRes.data.data || []);
            }

            if (existingSessionRes.data?.success && existingSessionRes.data.data) {
                const session = existingSessionRes.data.data;
                setSessionId(session._id);
                setFormData(prev => ({
                    ...prev,
                    therapistId: session.therapist?.user?._id || session.therapist?._id || session.therapist || "",
                    treatmentName: session.treatmentName || "",
                    daysOfTreatment: session.treatmentPlan?.daysOfTreatment || session.daysOfTreatment || 1,
                    timeline: session.treatmentPlan?.timeline || session.timeline || "Daily",
                    specialInstructions: session.specialInstructions || "",
                    sessionDate: session.sessionDate ? new Date(session.sessionDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                    sessionTime: session.sessionTime || "",
                }));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load therapists or therapies");
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.treatmentName) {
            toast.error("Please select a therapy");
            return;
        }
        if (!formData.daysOfTreatment || formData.daysOfTreatment < 1) {
            toast.error("Please enter a valid number of days");
            return;
        }
        if (!formData.timeline) {
            toast.error("Please select a timeline");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = sessionId
                ? await axios.patch(getApiUrl(`therapist-sessions/walk-in/${sessionId}`), formData, { headers: getAuthHeaders() })
                : await axios.post(getApiUrl("therapist-sessions/walk-in"), formData, { headers: getAuthHeaders() });

            if (response.data.success) {
                toast.success("Walk-in therapy session assigned successfully!");
                navigate("/receptionist/appointments");
            } else {
                throw new Error(response.data.message || "Failed to assign therapy");
            }
        } catch (error) {
            console.error("Error creating walk-in session:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to create walk-in session");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <HeadingCard
                title="Walk-in Appointment (Direct Therapist Assignment)"
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "Walk-in" },
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
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            label="Patient"
                            fullWidth
                            value={patientName}
                            disabled
                            sx={{ mb: 2 }}
                        />

                        <div className="row g-3">
                            <div className="col-md-6">
                                <FormControl fullWidth required>
                                    <InputLabel>Therapy *</InputLabel>
                                    <Select
                                        name="treatmentName"
                                        value={formData.treatmentName}
                                        onChange={handleChange}
                                        label="Therapy *"
                                        disabled={isLoadingData}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 300,
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value="">Select Therapy</MenuItem>
                                        {therapies.map((therapy) => (
                                            <MenuItem key={therapy._id} value={therapy.therapyName}>
                                                {therapy.therapyName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="col-md-6">
                                <FormControl fullWidth>
                                    <InputLabel>Therapist (Optional)</InputLabel>
                                    <Select
                                        name="therapistId"
                                        value={formData.therapistId}
                                        onChange={handleChange}
                                        label="Therapist (Optional)"
                                        disabled={isLoadingData}
                                    >
                                        <MenuItem value="">Unassigned (Assign Later)</MenuItem>
                                        {therapists.map((therapist) => (
                                            <MenuItem key={therapist._id} value={therapist.user?._id || therapist.user}>
                                                {therapist.user?.name || "Therapist"} ({therapist.speciality})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>

                            <div className="col-md-6">
                                <TextField
                                    label="Start Date *"
                                    name="sessionDate"
                                    type="date"
                                    fullWidth
                                    required
                                    value={formData.sessionDate}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </div>
                            <div className="col-md-6">
                                <TextField
                                    label="Time"
                                    name="sessionTime"
                                    type="time"
                                    fullWidth
                                    value={formData.sessionTime}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </div>

                            <div className="col-12">
                                <TextField
                                    label="Special Instructions"
                                    name="specialInstructions"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={formData.specialInstructions}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </Box>

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
                            disabled={isSubmitting || isLoadingData}
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                                    {sessionId ? "Updating..." : "Assigning..."}
                                </>
                            ) : (
                                sessionId ? "Update Appointment" : "Assign Therapy"
                            )}
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default WalkInAppointmentPage;
