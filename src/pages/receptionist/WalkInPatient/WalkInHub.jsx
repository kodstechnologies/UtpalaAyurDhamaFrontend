import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Typography,
    Divider,
    ToggleButton,
    ToggleButtonGroup,
    Autocomplete,
    Paper
} from "@mui/material";
import { User, Activity, Clipboard, Stethoscope, Clock, Thermometer } from "lucide-react";

function WalkInHub() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientProfileId = searchParams.get("patientProfileId") || "";
    const patientName = searchParams.get("patientName") || "";
    const existingDoctorId = searchParams.get("doctorId") || "";

    const [mode, setMode] = useState("OPD");
    const [formData, setFormData] = useState({
        doctorProfileId: existingDoctorId,
        nurseProfileId: "",
        appointmentTime: "",
        appointmentDate: new Date().toISOString().split("T")[0],
        therapyData: {
            treatmentName: "",
            daysOfTreatment: 1,
            timeline: "Daily",
            specialInstructions: "",
            therapistId: "",
            startDate: new Date().toISOString().split("T")[0],
        }
    });

    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [therapies, setTherapies] = useState([]);

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoadingData(true);
        try {
            const [doctorsRes, nursesRes, therapistsRes, therapiesRes] = await Promise.all([
                axios.get(getApiUrl("doctors/profiles"), { headers: getAuthHeaders() }),
                axios.get(getApiUrl("nurses"), { headers: getAuthHeaders() }),
                axios.get(getApiUrl("therapists"), { headers: getAuthHeaders() }),
                axios.get(getApiUrl("therapies?limit=100"), { headers: getAuthHeaders() }),
            ]);

            if (doctorsRes.data.success) setDoctors(doctorsRes.data.data || []);
            if (nursesRes.data.success) setNurses(nursesRes.data.data || []);
            if (therapistsRes.data.success) setTherapists(therapistsRes.data.data || []);
            if (therapiesRes.data.success) setTherapies(therapiesRes.data.data || []);

        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load required data");
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleModeChange = (event, newMode) => {
        if (newMode !== null) {
            setMode(newMode);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("therapy.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                therapyData: {
                    ...prev.therapyData,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!patientProfileId) {
            toast.error("Patient identification is missing");
            return;
        }

        const payload = {
            mode,
            patientProfileId,
            doctorProfileId: formData.doctorProfileId || undefined,
            nurseProfileId: mode === "IPD" ? (formData.nurseProfileId || undefined) : undefined,
            appointmentTime: formData.appointmentTime || undefined,
            appointmentDate: formData.appointmentDate,
            therapyData: formData.therapyData.treatmentName ? {
                ...formData.therapyData,
                therapistId: formData.therapyData.therapistId || undefined,
                startDate: formData.therapyData.startDate || undefined
            } : undefined
        };

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                getApiUrl("walk-in/hub-submit"),
                payload,
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success(response.data.message || `Walk-in ${mode} record created!`);
                navigate("/receptionist/appointments");
            }
        } catch (error) {
            console.error("Error submitting walk-in hub:", error);
            toast.error(error.response?.data?.message || "Failed to submit walk-in record");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ pb: 5 }}>
            <HeadingCard
                title="Walk-in Patient Hub"
                subtitle={`Current Patient: ${patientName || "Loading..."}`}
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "Walk-in Hub" },
                ]}
            />

            <Box sx={{ maxWidth: "900px", mx: "auto", mt: 4, px: 2 }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: "16px", border: "1px solid var(--color-border-a)" }}>
                    <form onSubmit={handleSubmit}>

                        {/* Section 1: Admission Mode */}
                        <Box sx={{ mb: 4, textAlign: "center" }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Admission Category</Typography>
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <ToggleButtonGroup
                                    value={mode}
                                    exclusive
                                    onChange={handleModeChange}
                                    size="small"
                                    sx={{
                                        gap: 2,
                                        "& .MuiToggleButton-root": {
                                            px: 4,
                                            py: 1,
                                            border: "1px solid var(--color-border-a) !important",
                                            borderRadius: "25px !important",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            color: "var(--color-text-b)",
                                            fontWeight: 600,
                                            textTransform: "none",
                                            "&.Mui-selected": {
                                                backgroundColor: mode === "OPD" ? "#2e7d32 !important" : "#1976d2 !important",
                                                color: "white !important",
                                                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                                                transform: "translateY(-2px)",
                                                "&:hover": {
                                                    opacity: 0.9,
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <ToggleButton value="OPD">
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Clock size={18} />
                                            OPD
                                        </Box>
                                    </ToggleButton>
                                    <ToggleButton value="IPD">
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Activity size={18} />
                                            IPD
                                        </Box>
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 4 }} />

                        {/* Section 2: Patient Info (Read Only) */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <User size={20} color="var(--color-primary-a)" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Patient Details</Typography>
                            </Box>
                            <TextField
                                fullWidth
                                label="Patient Name"
                                value={patientName || "N/A"}
                                disabled
                                variant="outlined"
                            />
                        </Box>

                        <Divider sx={{ mb: 4 }} />

                        {/* Section 3: Assignments */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <Stethoscope size={20} color="var(--color-primary-a)" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Assignments</Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                <FormControl sx={{ flex: 1, minWidth: "250px" }}>
                                    <InputLabel>Assign Doctor</InputLabel>
                                    <Select
                                        name="doctorProfileId"
                                        value={formData.doctorProfileId}
                                        onChange={handleChange}
                                        label="Assign Doctor"
                                        disabled={isLoadingData}
                                    >
                                        <MenuItem value="">Select Doctor</MenuItem>
                                        {doctors.map(doc => (
                                            <MenuItem key={doc._id} value={doc._id}>
                                                {doc.user?.name || "Doctor"} - {doc.specialization}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Appointment Time"
                                    type="time"
                                    name="appointmentTime"
                                    value={formData.appointmentTime}
                                    onChange={handleChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        step: 300, // 5 min
                                    }}
                                    sx={{ flex: 1, minWidth: "250px" }}
                                />

                                <TextField
                                    label="Appointment Date"
                                    type="date"
                                    name="appointmentDate"
                                    value={formData.appointmentDate}
                                    onChange={handleChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    sx={{ flex: 1, minWidth: "250px" }}
                                />

                                {mode === "IPD" && (
                                    <FormControl sx={{ flex: 1, minWidth: "250px" }}>
                                        <InputLabel>Assign Nurse</InputLabel>
                                        <Select
                                            name="nurseProfileId"
                                            value={formData.nurseProfileId}
                                            onChange={handleChange}
                                            label="Assign Nurse"
                                            disabled={isLoadingData}
                                        >
                                            <MenuItem value="">Unassigned</MenuItem>
                                            {nurses.map(nurse => (
                                                <MenuItem key={nurse._id} value={nurse._id}>
                                                    {nurse.user?.name || "Nurse"}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 4 }} />

                        {/* Section 4: Therapy (Optional) */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <Clipboard size={20} color="var(--color-primary-a)" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Initial Therapy (Optional)</Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    <FormControl sx={{ flex: 2, minWidth: "300px" }}>
                                        <InputLabel>Select Therapy</InputLabel>
                                        <Select
                                            name="therapy.treatmentName"
                                            value={formData.therapyData.treatmentName}
                                            onChange={handleChange}
                                            label="Select Therapy"
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            {therapies.map(t => (
                                                <MenuItem key={t._id} value={t.therapyName}>{t.therapyName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl sx={{ flex: 1, minWidth: "150px" }}>
                                        <InputLabel>Days</InputLabel>
                                        <Select
                                            name="therapy.daysOfTreatment"
                                            value={formData.therapyData.daysOfTreatment}
                                            onChange={handleChange}
                                            label="Days"
                                        >
                                            {[1, 2, 3, 5, 7, 10, 14, 21, 30].map(d => (
                                                <MenuItem key={d} value={d}>{d} Days</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl sx={{ flex: 1, minWidth: "150px" }}>
                                        <InputLabel>Timeline</InputLabel>
                                        <Select
                                            name="therapy.timeline"
                                            value={formData.therapyData.timeline}
                                            onChange={handleChange}
                                            label="Timeline"
                                        >
                                            <MenuItem value="Daily">Daily</MenuItem>
                                            <MenuItem value="AlternateDay">Alternate Day</MenuItem>
                                            <MenuItem value="Weekly">Weekly</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    <FormControl sx={{ flex: 1, minWidth: "250px" }}>
                                        <InputLabel>Assign Therapist</InputLabel>
                                        <Select
                                            name="therapy.therapistId"
                                            value={formData.therapyData.therapistId}
                                            onChange={handleChange}
                                            label="Assign Therapist"
                                        >
                                            <MenuItem value="">Unassigned</MenuItem>
                                            {therapists.map(th => (
                                                <MenuItem key={th._id} value={th.user?._id || th.user}>{th.user?.name || "Therapist"}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        sx={{ flex: 1, minWidth: "250px" }}
                                        label="Special Instructions"
                                        name="therapy.specialInstructions"
                                        value={formData.therapyData.specialInstructions}
                                        onChange={handleChange}
                                    />

                                    <TextField
                                        sx={{ flex: 1, minWidth: "250px" }}
                                        label="Start Date"
                                        type="date"
                                        name="therapy.startDate"
                                        value={formData.therapyData.startDate}
                                        onChange={handleChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Submit Button */}
                        <Box sx={{ mt: 5, display: "flex", justifyContent: "center", gap: 2 }}>
                            <Button
                                variant="outlined"
                                size="large"
                                sx={{
                                    px: 4,
                                    borderRadius: "8px",
                                    border: "1px solid rgba(0,0,0,0.12)",
                                    color: "var(--color-text-a)"
                                }}
                                onClick={() => navigate(-1)}
                                disabled={isSubmitting}
                            >
                                CANCEL
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{
                                    px: 6,
                                    borderRadius: "8px",
                                    backgroundColor: "#8B4513 !important",
                                    color: "white !important",
                                    fontWeight: "bold",
                                    boxShadow: "0 4px 12px rgba(139, 69, 19, 0.3)",
                                    "&:hover": {
                                        backgroundColor: "#5D2E0A !important",
                                        boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
                                    },
                                    "&.Mui-disabled": {
                                        backgroundColor: "#f5f5f5 !important",
                                        color: "#bdbdbd !important",
                                        boxShadow: "none"
                                    }
                                }}
                                disabled={isSubmitting || isLoadingData}
                            >
                                {isSubmitting ? (
                                    <>
                                        <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                                        SUBMITTING...
                                    </>
                                ) : (
                                    `SUBMIT AS ${mode}`
                                )}
                            </Button>
                        </Box>

                    </form>
                </Paper>
            </Box>
        </Box>
    );
}

export default WalkInHub;
