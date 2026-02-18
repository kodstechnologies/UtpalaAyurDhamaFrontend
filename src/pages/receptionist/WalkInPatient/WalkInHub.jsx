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
    Paper,
    Checkbox,
    ListItemText,
    OutlinedInput,
    Chip
} from "@mui/material";
import { User, Activity, Clipboard, Stethoscope, Clock, Thermometer } from "lucide-react";

function WalkInHub() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientProfileId = searchParams.get("patientProfileId") || "";
    const patientName = searchParams.get("patientName") || "";
    const existingDoctorId = searchParams.get("doctorId") || "";

    // Initial empty form state - used when patient is discharged (re-appointment = fresh form)
    const getEmptyFormState = () => ({
        doctorProfileId: "",
        nurseProfileId: "",
        appointmentTime: "",
        appointmentDate: new Date().toLocaleDateString("en-CA"),
        wardCategory: "General",
        roomNumber: "",
        bedNumber: "",
        therapyData: {
            treatmentName: [],
            daysOfTreatment: 0,
            timeline: "Daily",
            specialInstructions: "",
            subTherapy: "",
            therapistId: [],
            startDate: new Date().toLocaleDateString("en-CA"),
        }
    });

    const [mode, setMode] = useState("OPD");
    const [formData, setFormData] = useState(getEmptyFormState());

    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [therapies, setTherapies] = useState([]);

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoadingData(true);
        try {
            const [doctorsRes, nursesRes, therapistsRes, therapiesRes] = await Promise.all([
                axios.get(getApiUrl("doctors/profiles"), { headers: getAuthHeaders() }),
                axios.get(getApiUrl("nurses?limit=1000"), { headers: getAuthHeaders() }), // Fetch all nurses
                axios.get(getApiUrl("therapists"), { headers: getAuthHeaders() }),
                axios.get(getApiUrl("therapies?limit=100"), { headers: getAuthHeaders() }),
            ]);

            if (doctorsRes.data.success) setDoctors(doctorsRes.data.data || []);
            if (nursesRes.data.success) {
                const nursesData = nursesRes.data.data || [];
                console.log("[WalkInHub] Fetched nurses:", nursesData);
                console.log("[WalkInHub] Sample nurse structure:", nursesData[0]);
                setNurses(nursesData);
            }
            if (therapistsRes.data.success) setTherapists(therapistsRes.data.data || []);
            if (therapiesRes.data.success) setTherapies(therapiesRes.data.data || []);

        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load required data");
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    // Fetch existing patient assignments
    const loadExistingAssignments = useCallback(async () => {
        if (!patientProfileId) return;

        setIsLoadingExistingData(true);
        try {
            // Fetch patient profile
            const patientRes = await axios.get(
                getApiUrl(`patients/${patientProfileId}`),
                { headers: getAuthHeaders() }
            );

            if (patientRes.data.success && patientRes.data.data) {
                const patient = patientRes.data.data;
                console.log("[WalkInHub] Patient profile loaded:", patient);
                console.log("[WalkInHub] Patient allocatedNurse:", patient.allocatedNurse);

                // Check if patient is discharged - if so, show empty form for fresh re-appointment
                let isDischarged = false;
                try {
                    // IPD: check if there is an active admission
                    const inpatientsRes = await axios.get(
                        getApiUrl(`inpatients/patient/${patientProfileId}`),
                        { headers: getAuthHeaders() }
                    );
                    const inpatientsList = inpatientsRes.data.success
                        ? (Array.isArray(inpatientsRes.data.data) ? inpatientsRes.data.data : [inpatientsRes.data.data].filter(Boolean))
                        : [];
                    const hasActiveAdmission = inpatientsList.some(ip => ip && ip.status === "Admitted");

                    if (patient.admissionStatus === "In-patient" || inpatientsList.length > 0) {
                        // IPD context: discharged = no active admission
                        if (!hasActiveAdmission) {
                            isDischarged = true;
                        }
                    } else {
                        // OPD: check if latest examination is billed and fully paid
                        const examsRes = await axios.get(
                            getApiUrl(`examinations?patientId=${patientProfileId}&limit=1&hasInpatient=false`),
                            { headers: getAuthHeaders() }
                        );
                        const exams = examsRes.data.success && examsRes.data.data
                            ? (Array.isArray(examsRes.data.data) ? examsRes.data.data : examsRes.data.data?.data || [])
                            : [];
                        const latestExam = exams[0];
                        if (latestExam && latestExam.isBilled) {
                            const invRes = await axios.get(
                                getApiUrl("invoices"),
                                { headers: getAuthHeaders(), params: { page: 1, limit: 500 } }
                            ).catch(() => ({ data: { success: false, data: [] } }));
                            const invoices = invRes.data.success
                                ? (Array.isArray(invRes.data.data) ? invRes.data.data : invRes.data.data?.data || [])
                                : [];
                            const invoiceForExam = invoices.find(
                                inv => (inv.examination?._id || inv.examination)?.toString() === (latestExam._id || latestExam).toString()
                            );
                            if (invoiceForExam) {
                                const paid = (invoiceForExam.amountPaid || 0) >= (invoiceForExam.totalPayable || 0);
                                if (paid && (invoiceForExam.totalPayable || 0) > 0) {
                                    isDischarged = true;
                                }
                            }
                        }
                    }
                } catch (dischargeErr) {
                    console.warn("[WalkInHub] Error checking discharge status:", dischargeErr);
                }

                if (isDischarged) {
                    // Patient is discharged - re-appointment = fresh form, all fields empty
                    setMode("OPD");
                    setFormData(getEmptyFormState());
                    setIsLoadingExistingData(false);
                    return;
                }

                let currentInpatientId = null; // Store inpatient ID for therapist lookup

                // Determine mode based on admission status
                if (patient.admissionStatus === "In-patient") {
                    setMode("IPD");

                    // Fetch latest inpatient record
                    try {
                        const inpatientsRes = await axios.get(
                            getApiUrl(`inpatients/patient/${patientProfileId}`),
                            { headers: getAuthHeaders() }
                        );

                        if (inpatientsRes.data.success) {
                            // Handle both array and single object responses
                            const inpatient = Array.isArray(inpatientsRes.data.data)
                                ? inpatientsRes.data.data.find(ip => ip.status === "Admitted") || inpatientsRes.data.data[0]
                                : inpatientsRes.data.data;

                            if (!inpatient) return;

                            currentInpatientId = inpatient._id; // Store for therapist lookup

                            // Format date for input
                            const formatDateForInput = (date) => {
                                if (!date) return new Date().toLocaleDateString("en-CA");
                                const d = new Date(date);
                                return d.toLocaleDateString("en-CA");
                            };

                            // Extract nurse ID - handle both populated object and ObjectId string
                            // PatientProfile stores NurseProfile ID, so we need to extract that
                            let nurseId = "";
                            console.log("[WalkInHub] Inpatient allocatedNurse:", inpatient.allocatedNurse);
                            console.log("[WalkInHub] Patient allocatedNurse:", patient.allocatedNurse);

                            if (inpatient.allocatedNurse) {
                                // Inpatient record has allocatedNurse - could be populated object or ObjectId
                                if (typeof inpatient.allocatedNurse === 'object' && inpatient.allocatedNurse._id) {
                                    nurseId = inpatient.allocatedNurse._id.toString();
                                    console.log("[WalkInHub] Extracted nurse ID from inpatient (object):", nurseId);
                                } else {
                                    nurseId = inpatient.allocatedNurse.toString();
                                    console.log("[WalkInHub] Extracted nurse ID from inpatient (string):", nurseId);
                                }
                            } else if (patient.allocatedNurse) {
                                // PatientProfile has allocatedNurse - could be populated object or ObjectId
                                if (typeof patient.allocatedNurse === 'object' && patient.allocatedNurse._id) {
                                    nurseId = patient.allocatedNurse._id.toString();
                                    console.log("[WalkInHub] Extracted nurse ID from patient (object):", nurseId);
                                } else {
                                    nurseId = patient.allocatedNurse.toString();
                                    console.log("[WalkInHub] Extracted nurse ID from patient (string):", nurseId);
                                }
                            }

                            console.log("[WalkInHub] Final nurseId to set:", nurseId);

                            setFormData(prev => ({
                                ...prev,
                                // Always prioritize primary doctor from patient profile
                                doctorProfileId: patient.primaryDoctor?._id || inpatient.doctor?._id || "",
                                nurseProfileId: nurseId,
                                wardCategory: inpatient.wardCategory || "General",
                                roomNumber: inpatient.roomNumber || "",
                                bedNumber: inpatient.bedNumber || "",
                                appointmentDate: formatDateForInput(inpatient.admissionDate),
                            }));
                        }
                    } catch (err) {
                        console.error("Error fetching inpatient data:", err);
                    }
                } else {
                    setMode("OPD");

                    // Fetch latest appointment for OPD
                    try {
                        const appointmentsRes = await axios.get(
                            getApiUrl(`appointments?patientId=${patientProfileId}&limit=1`),
                            { headers: getAuthHeaders() }
                        );

                        if (appointmentsRes.data.success && appointmentsRes.data.data?.length > 0) {
                            // Get the most recent appointment (already sorted by appointmentDate desc)
                            const appointment = appointmentsRes.data.data[0];

                            // Format time for input (HH:MM)
                            const formatTimeForInput = (timeStr) => {
                                if (!timeStr) return "";
                                // If time is in HH:MM format, return as is
                                if (timeStr.match(/^\d{2}:\d{2}$/)) return timeStr;
                                // If it's a Date object or ISO string, extract time
                                const d = new Date(timeStr);
                                return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                            };

                            // Format date for input
                            const formatDateForInput = (date) => {
                                if (!date) return new Date().toLocaleDateString("en-CA");
                                const d = new Date(date);
                                return d.toLocaleDateString("en-CA");
                            };

                            // Extract nurse ID - handle both populated object and ObjectId string
                            // PatientProfile stores NurseProfile ID, so we need to extract that
                            let nurseId = "";
                            if (patient.allocatedNurse) {
                                if (typeof patient.allocatedNurse === 'object' && patient.allocatedNurse._id) {
                                    nurseId = patient.allocatedNurse._id.toString();
                                } else {
                                    nurseId = patient.allocatedNurse.toString();
                                }
                            }

                            setFormData(prev => ({
                                ...prev,
                                // Always prioritize primary doctor from patient profile
                                doctorProfileId: patient.primaryDoctor?._id || appointment.doctor?._id || "",
                                nurseProfileId: nurseId, // Load nurse assignment for OPD patients
                                appointmentTime: formatTimeForInput(appointment.appointmentTime),
                                appointmentDate: formatDateForInput(appointment.appointmentDate),
                            }));
                        } else {
                            // No appointment found, use patient profile data
                            // Extract nurse ID - handle both populated object and ObjectId string
                            // PatientProfile stores NurseProfile ID, so we need to extract that
                            let nurseId = "";
                            if (patient.allocatedNurse) {
                                if (typeof patient.allocatedNurse === 'object' && patient.allocatedNurse._id) {
                                    nurseId = patient.allocatedNurse._id.toString();
                                } else {
                                    nurseId = patient.allocatedNurse.toString();
                                }
                            }

                            setFormData(prev => ({
                                ...prev,
                                // Always use primary doctor from patient profile, ignore URL parameter
                                doctorProfileId: patient.primaryDoctor?._id || "",
                                nurseProfileId: nurseId, // Load nurse assignment for OPD patients
                            }));
                        }
                    } catch (err) {
                        console.error("Error fetching appointment data:", err);
                        // Fallback to patient profile data
                        // Extract nurse ID - handle both populated object and ObjectId string
                        let nurseId = "";
                        if (patient.allocatedNurse) {
                            nurseId = patient.allocatedNurse._id || patient.allocatedNurse || "";
                        }

                        setFormData(prev => ({
                            ...prev,
                            // Always prioritize primary doctor from patient profile, ignore URL parameter
                            doctorProfileId: patient.primaryDoctor?._id || "",
                            nurseProfileId: nurseId, // Load nurse assignment for OPD patients
                        }));
                    }
                }

                // Load therapy data from treatment plans instead of just patient profile
                try {
                    const plansUrl = mode === "OPD"
                        ? getApiUrl(`examinations/therapy-plans/opd`) // This might need a query param
                        : getApiUrl(`examinations/therapy-plans`); // Generic lookup

                    // Actually, let's fetch by patient profile ID to be safe
                    const plansRes = await axios.get(
                        getApiUrl(`examinations/therapy-plans/patient/${patientProfileId}`),
                        { headers: getAuthHeaders() }
                    );

                    if (plansRes.data.success && plansRes.data.data?.length > 0) {
                        const plans = plansRes.data.data;
                        const firstPlan = plans[0];

                        let assignedTherapistIds = [];
                        if (firstPlan.sessionId) {
                            try {
                                const sessionRes = await axios.get(getApiUrl(`therapist-sessions/${firstPlan.sessionId}`), { headers: getAuthHeaders() });
                                if (sessionRes.data.success && sessionRes.data.data) {
                                    const session = sessionRes.data.data;
                                    if (session.therapists?.length > 0) {
                                        assignedTherapistIds = session.therapists.map(t => t.user?._id || t.user || t);
                                    } else if (session.therapist) {
                                        const legacyId = session.therapist.user?._id || session.therapist.user || session.therapist || "";
                                        if (legacyId) assignedTherapistIds = [legacyId];
                                    }
                                }
                            } catch (e) {
                                console.error("Error fetching session for therapists:", e);
                            }
                        }

                        const formatDateForInput = (date) => {
                            if (!date) return new Date().toLocaleDateString("en-CA");
                            const d = new Date(date);
                            return d.toLocaleDateString("en-CA");
                        };

                        setFormData(prev => ({
                            ...prev,
                            therapyData: {
                                treatmentName: plans.map(p => p.treatmentName),
                                daysOfTreatment: firstPlan.daysOfTreatment || 0,
                                timeline: firstPlan.timeline || "Daily",
                                specialInstructions: firstPlan.specialInstructions || "",
                                subTherapy: firstPlan.subTherapy || "",
                                therapistId: assignedTherapistIds,
                                startDate: formatDateForInput(firstPlan.startDate),
                            }
                        }));
                    } else if (patient.assignedTherapy) {
                        // Fallback to patient profile if no plans found
                        const formatDateForInput = (date) => {
                            if (!date) return new Date().toLocaleDateString("en-CA");
                            const d = new Date(date);
                            return d.toLocaleDateString("en-CA");
                        };

                        setFormData(prev => ({
                            ...prev,
                            therapyData: {
                                ...prev.therapyData,
                                treatmentName: [patient.assignedTherapy?.therapyName || patient.assignedTherapy || ""],
                                daysOfTreatment: patient.therapyDurationDays || 0,
                                timeline: patient.therapyTimeline || "Daily",
                                specialInstructions: patient.therapyInstructions || "",
                                subTherapy: patient.subTherapy || "",
                                therapistId: patient.primaryTherapist ? [patient.primaryTherapist._id || patient.primaryTherapist] : [],
                                startDate: formatDateForInput(patient.therapyStartDate),
                            }
                        }));
                    }
                } catch (planErr) {
                    console.error("Error loading treatment plans:", planErr);
                }
            }
        } catch (error) {
            console.error("Error loading existing assignments:", error);
            // Don't show error toast - just silently fail and let user fill manually
        } finally {
            setIsLoadingExistingData(false);
        }
    }, [patientProfileId]); // Removed existingDoctorId dependency - always load from patient profile

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Load existing assignments when patientProfileId is available
    useEffect(() => {
        if (patientProfileId && !isLoadingData) {
            loadExistingAssignments();
        }
    }, [patientProfileId, isLoadingData, loadExistingAssignments]);

    // Debug: Log formData changes
    useEffect(() => {
        console.log("[WalkInHub] formData.nurseProfileId changed:", formData.nurseProfileId);
        console.log("[WalkInHub] Available nurses:", nurses.map(n => ({
            id: n.profileId || n._id,
            name: n.user?.name || n.name,
            profileId: n.profileId,
            _id: n._id
        })));
    }, [formData.nurseProfileId, nurses]);

    const handleModeChange = (event, newMode) => {
        if (newMode !== null) {
            setMode(newMode);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "therapy.treatmentName") {
            setFormData(prev => ({
                ...prev,
                therapyData: {
                    ...prev.therapyData,
                    treatmentName: typeof value === 'string' ? value.split(',') : value,
                }
            }));
        } else if (name === "therapy.therapistId") {
            setFormData(prev => ({
                ...prev,
                therapyData: {
                    ...prev.therapyData,
                    therapistId: typeof value === 'string' ? value.split(',') : value,
                }
            }));
        } else if (name.startsWith("therapy.")) {
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
            wardCategory: mode === "IPD" ? formData.wardCategory : undefined,
            roomNumber: mode === "IPD" ? formData.roomNumber : undefined,
            bedNumber: mode === "IPD" ? formData.bedNumber : undefined,
            appointmentTime: formData.appointmentTime || undefined,
            appointmentDate: formData.appointmentDate,
            therapyData: formData.therapyData.treatmentName?.length > 0 ? {
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
                    {isLoadingExistingData && (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 3 }}>
                            <CircularProgress size={24} sx={{ mr: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                                Loading existing assignments...
                            </Typography>
                        </Box>
                    )}
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
                                            {nurses.map(nurse => {
                                                // Nurses API returns _id as User ID and profileId as NurseProfile ID
                                                // PatientProfile stores NurseProfile ID in allocatedNurse field
                                                // We need to match using profileId since PatientProfile stores NurseProfile ID

                                                // Try to get profileId - it might be in different places
                                                let nurseProfileId = "";
                                                if (nurse.profileId) {
                                                    nurseProfileId = nurse.profileId.toString();
                                                } else if (nurse._id && typeof nurse._id === 'object' && nurse._id.toString) {
                                                    // If _id is an ObjectId, it might be the profile ID in some cases
                                                    nurseProfileId = nurse._id.toString();
                                                } else if (nurse._id) {
                                                    // Fallback: use _id as string
                                                    nurseProfileId = nurse._id.toString();
                                                }

                                                const nurseName = nurse.user?.name || nurse.name || "Nurse";

                                                // Debug logging for matching
                                                if (nurseProfileId && formData.nurseProfileId &&
                                                    nurseProfileId === formData.nurseProfileId.toString()) {
                                                    console.log("[WalkInHub] ✓ Matching nurse found:", nurseName, "ProfileID:", nurseProfileId, "FormValue:", formData.nurseProfileId);
                                                }

                                                return (
                                                    <MenuItem key={nurseProfileId || nurse._id} value={nurseProfileId}>
                                                        {nurseName}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                )}
                            </Box>

                            {mode === "IPD" && (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 3 }}>
                                    <FormControl sx={{ flex: 1, minWidth: "250px" }}>
                                        <InputLabel>Ward Category</InputLabel>
                                        <Select
                                            name="wardCategory"
                                            value={formData.wardCategory}
                                            onChange={handleChange}
                                            label="Ward Category"
                                        >
                                            <MenuItem value="General">General</MenuItem>
                                            <MenuItem value="Duplex">Duplex</MenuItem>
                                            <MenuItem value="Special">Special</MenuItem>
                                            <MenuItem value="Semi Special">Semi Special</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Room Number"
                                        name="roomNumber"
                                        value={formData.roomNumber}
                                        onChange={handleChange}
                                        sx={{ flex: 1, minWidth: "250px" }}
                                    />

                                    <TextField
                                        label="Bed Number"
                                        name="bedNumber"
                                        value={formData.bedNumber}
                                        onChange={handleChange}
                                        sx={{ flex: 1, minWidth: "250px" }}
                                    />
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ mb: 4 }} />

                        {/* Section 4: Therapy (Optional) */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                <Clipboard size={20} color="var(--color-primary-a)" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Initial Therapy</Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    <FormControl sx={{ flex: 2, minWidth: "300px" }}>
                                        <InputLabel>Select Therapy</InputLabel>
                                        <Select
                                            name="therapy.treatmentName"
                                            multiple
                                            value={formData.therapyData.treatmentName}
                                            onChange={handleChange}
                                            input={<OutlinedInput label="Select Therapy" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => {
                                                        const therapy = therapies.find(t => t._id === value || t.therapyName === value);
                                                        return (
                                                            <Chip key={value} label={therapy?.therapyName || value} size="small" />
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                        >
                                            {therapies.map((t) => (
                                                <MenuItem key={t._id} value={t.therapyName}>
                                                    <Checkbox checked={formData.therapyData.treatmentName.indexOf(t.therapyName) > -1} />
                                                    <ListItemText primary={t.therapyName} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Session"
                                        type="number"
                                        name="therapy.daysOfTreatment"
                                        value={formData.therapyData.daysOfTreatment}
                                        onChange={handleChange}
                                        sx={{ flex: 1, minWidth: "150px" }}
                                        inputProps={{ min: 0 }}
                                    />

                                    <FormControl sx={{ flex: 1, minWidth: "150px" }}>
                                        <InputLabel>Timeline</InputLabel>
                                        <Select
                                            name="therapy.timeline"
                                            value={formData.therapyData.timeline}
                                            onChange={handleChange}
                                            label="Timeline"
                                        >
                                            <MenuItem value="Daily">Daily</MenuItem>
                                            <MenuItem value="AlternateDay">Alternate Days</MenuItem>
                                            <MenuItem value="Weekly">Weekly</MenuItem>
                                            <MenuItem value="Monthly">Monthly</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    <FormControl sx={{ flex: 1, minWidth: "250px" }}>
                                        <InputLabel>Assign Therapist</InputLabel>
                                        <Select
                                            name="therapy.therapistId"
                                            multiple
                                            value={formData.therapyData.therapistId}
                                            onChange={handleChange}
                                            input={<OutlinedInput label="Assign Therapist" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => {
                                                        const therapist = therapists.find(th => (th.user?._id || th._id) === value);
                                                        return (
                                                            <Chip key={value} label={therapist?.user?.name || "Therapist"} size="small" />
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                        >
                                            {therapists.map((th) => {
                                                const thId = th.user?._id || th._id;
                                                return (
                                                    <MenuItem key={thId} value={thId}>
                                                        <Checkbox checked={formData.therapyData.therapistId.indexOf(thId) > -1} />
                                                        <ListItemText
                                                            primary={th.user?.name || "Therapist"}
                                                            secondary={th.specialization || th.speciality || "General"}
                                                        />
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        sx={{ flex: 1, minWidth: "250px" }}
                                        label="Sub Therapy"
                                        name="therapy.subTherapy"
                                        value={formData.therapyData.subTherapy}
                                        onChange={handleChange}
                                        placeholder="e.g. Oil Type, Specific Medicines"
                                    />

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
