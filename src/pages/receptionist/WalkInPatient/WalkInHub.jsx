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
    Chip,
    IconButton,
    InputAdornment
} from "@mui/material";
import { User, Activity, Clipboard, Stethoscope, Clock, Thermometer, Plus, Trash2 } from "lucide-react";

function WalkInHub() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientProfileId = searchParams.get("patientProfileId") || "";
    const patientName = searchParams.get("patientName") || "";
    const existingDoctorId = searchParams.get("doctorId") || "";

    // Empty therapy object template
    const getEmptyTherapy = (initialDate = "") => ({
        treatmentName: "",
        subTherapy: "",
        daysOfTreatment: "",
        timeline: "Daily",
        duration: "",
        treatmentDescription: "",
        therapistId: [],
        specialInstructions: "",
        startDate: initialDate || new Date().toLocaleDateString("en-CA"),
    });

    // Initial empty form state
    const getEmptyFormState = () => {
        const today = new Date().toLocaleDateString("en-CA");
        return {
            doctorProfileId: "",
            nurseProfileId: "",
            appointmentTime: "",
            appointmentDate: today,
            wardCategory: "General",
            roomNumber: "",
            bedNumber: "",
            therapies: [getEmptyTherapy(today)]
        };
    };

    const [mode, setMode] = useState("OPD");
    const [formData, setFormData] = useState(getEmptyFormState());

    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [therapiesList, setTherapiesList] = useState([]); // Renamed from 'therapies' to avoid confusion

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
                setNurses(nursesData);
            }
            if (therapistsRes.data.success) setTherapists(therapistsRes.data.data || []);
            if (therapiesRes.data.success) setTherapiesList(therapiesRes.data.data || []);

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

                // Check active admission status first
                let hasActiveAdmission = false;
                let inpatientsList = [];
                try {
                    const inpatientsRes = await axios.get(
                        getApiUrl(`inpatients/patient/${patientProfileId}`),
                        { headers: getAuthHeaders() }
                    );
                    inpatientsList = inpatientsRes.data.success
                        ? (Array.isArray(inpatientsRes.data.data) ? inpatientsRes.data.data : [inpatientsRes.data.data].filter(Boolean))
                        : [];
                    hasActiveAdmission = inpatientsList.some(ip => ip && ip.status === "Admitted");
                } catch (e) {
                    console.warn("Error checking inpatient status:", e);
                }

                // Check if patient is discharged - if so, show empty form for fresh re-appointment
                let isDischarged = false;
                try {
                    if (patient.admissionStatus === "In-patient" || patient.inpatient === true || hasActiveAdmission) {
                        // IPD context: discharged = no active admission
                        if (!hasActiveAdmission) {
                            isDischarged = true;
                        }
                    } else {
                        // OPD check
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
                    setMode("OPD");
                    setFormData(getEmptyFormState());
                    setIsLoadingExistingData(false);
                    return;
                }

                let currentInpatientId = null;

                // Determine mode based on admission status - Check ALL indicators
                if (patient.admissionStatus === "In-patient" || patient.inpatient === true || hasActiveAdmission) {
                    setMode("IPD");

                    try {
                        const inpatientsRes = await axios.get(
                            getApiUrl(`inpatients/patient/${patientProfileId}`),
                            { headers: getAuthHeaders() }
                        );

                        if (inpatientsRes.data.success) {
                            const inpatient = Array.isArray(inpatientsRes.data.data)
                                ? inpatientsRes.data.data.find(ip => ip.status === "Admitted") || inpatientsRes.data.data[0]
                                : inpatientsRes.data.data;

                            if (!inpatient) return;

                            currentInpatientId = inpatient._id;

                            // Fetch latest IPD examination
                            let latestIpdExamDoctorId = "";
                            try {
                                const ipdExamsRes = await axios.get(
                                    getApiUrl(`examinations/inpatient/${inpatient._id}`),
                                    { headers: getAuthHeaders() }
                                );
                                const ipdExams = ipdExamsRes.data?.success && ipdExamsRes.data?.data
                                    ? (Array.isArray(ipdExamsRes.data.data) ? ipdExamsRes.data.data : [])
                                    : [];

                                const sortedIpdExams = ipdExams.sort((a, b) => {
                                    const dateA = new Date(a.updatedAt || a.createdAt || 0);
                                    const dateB = new Date(b.updatedAt || b.createdAt || 0);
                                    return dateB - dateA;
                                });
                                const latestIpdExam = sortedIpdExams[0];
                                if (latestIpdExam?.doctor) {
                                    latestIpdExamDoctorId = typeof latestIpdExam.doctor === "object"
                                        ? (latestIpdExam.doctor._id || latestIpdExam.doctor)?.toString?.()
                                        : String(latestIpdExam.doctor);
                                }
                            } catch (e) {
                                console.warn("[WalkInHub] Error fetching IPD examinations:", e);
                            }

                            const formatDateForInput = (date) => {
                                if (!date) return new Date().toLocaleDateString("en-CA");
                                const d = new Date(date);
                                return d.toLocaleDateString("en-CA");
                            };

                            let nurseId = "";
                            if (inpatient.allocatedNurse) {
                                if (typeof inpatient.allocatedNurse === 'object' && inpatient.allocatedNurse._id) {
                                    nurseId = inpatient.allocatedNurse._id.toString();
                                } else {
                                    nurseId = inpatient.allocatedNurse.toString();
                                }
                            } else if (patient.allocatedNurse) {
                                if (typeof patient.allocatedNurse === 'object' && patient.allocatedNurse._id) {
                                    nurseId = patient.allocatedNurse._id.toString();
                                } else {
                                    nurseId = patient.allocatedNurse.toString();
                                }
                            }

                            setFormData(prev => ({
                                ...prev,
                                doctorProfileId: latestIpdExamDoctorId || existingDoctorId || patient.primaryDoctor?._id || inpatient.doctor?._id || "",
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

                    // Fetch latest OPD examination
                    let latestExamDoctorId = "";
                    try {
                        const examsRes = await axios.get(
                            getApiUrl(`examinations?patientId=${patientProfileId}&limit=1&hasInpatient=false`),
                            { headers: getAuthHeaders() }
                        );
                        const examsData = examsRes.data.success && examsRes.data.data
                            ? (Array.isArray(examsRes.data.data) ? examsRes.data.data : examsRes.data.data?.data || [])
                            : [];
                        const latestExam = examsData[0];
                        if (latestExam?.doctor) {
                            latestExamDoctorId = typeof latestExam.doctor === "object" ? (latestExam.doctor._id || latestExam.doctor)?.toString?.() : String(latestExam.doctor);
                        }
                    } catch (e) {
                        console.warn("[WalkInHub] Error fetching latest examination:", e);
                    }

                    // Fetch latest appointment
                    try {
                        const appointmentsRes = await axios.get(
                            getApiUrl(`appointments?patientId=${patientProfileId}&limit=1`),
                            { headers: getAuthHeaders() }
                        );

                        if (appointmentsRes.data.success && appointmentsRes.data.data?.length > 0) {
                            const appointment = appointmentsRes.data.data[0];

                            const formatTimeForInput = (timeStr) => {
                                if (!timeStr) return "";
                                if (timeStr.match(/^\d{2}:\d{2}$/)) return timeStr;
                                const d = new Date(timeStr);
                                return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                            };

                            const formatDateForInput = (date) => {
                                if (!date) return new Date().toLocaleDateString("en-CA");
                                const d = new Date(date);
                                return d.toLocaleDateString("en-CA");
                            };

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
                                doctorProfileId: latestExamDoctorId || existingDoctorId || patient.primaryDoctor?._id || appointment.doctor?._id || "",
                                nurseProfileId: nurseId,
                                appointmentTime: formatTimeForInput(appointment.appointmentTime),
                                appointmentDate: formatDateForInput(appointment.appointmentDate),
                            }));
                        } else {
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
                                doctorProfileId: latestExamDoctorId || existingDoctorId || patient.primaryDoctor?._id || "",
                                nurseProfileId: nurseId,
                            }));
                        }
                    } catch (err) {
                        console.error("Error fetching appointment data:", err);
                        let nurseId = "";
                        if (patient.allocatedNurse) {
                            nurseId = patient.allocatedNurse._id || patient.allocatedNurse || "";
                        }

                        setFormData(prev => ({
                            ...prev,
                            doctorProfileId: latestExamDoctorId || existingDoctorId || patient.primaryDoctor?._id || "",
                            nurseProfileId: nurseId,
                        }));
                    }
                }

                // Load therapy data
                try {
                    const plansRes = await axios.get(
                        getApiUrl(`examinations/therapy-plans/patient/${patientProfileId}`),
                        { headers: getAuthHeaders() }
                    );

                    if (plansRes.data.success && plansRes.data.data?.length > 0) {
                        const plans = plansRes.data.data;

                        // Map all plans to the therapy array structure
                        // We need to fetch assigned therapists for each plan ideally
                        // For optimization, we might just assume basic structure or fetch details if needed
                        // Here we map basic details.

                        const mappedTherapies = await Promise.all(plans.map(async (plan) => {
                            let assignedTherapistIds = [];
                            if (plan.sessionId) {
                                try {
                                    const sessionRes = await axios.get(getApiUrl(`therapist-sessions/${plan.sessionId}`), { headers: getAuthHeaders() });
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
                                    // ignore
                                }
                            } else if (plan.therapistId) {
                                // If stored directly
                                assignedTherapistIds = Array.isArray(plan.therapistId) ? plan.therapistId : [plan.therapistId];
                            }

                            const formatDateForInput = (date) => {
                                if (!date) return new Date().toLocaleDateString("en-CA");
                                const d = new Date(date);
                                return d.toLocaleDateString("en-CA");
                            };

                            return {
                                _id: plan._id, // vital for preventing duplication
                                treatmentName: Array.isArray(plan.treatmentName) ? (plan.treatmentName[0] || "") : (plan.treatmentName || ""),
                                daysOfTreatment: plan.daysOfTreatment || 0,
                                timeline: plan.timeline || "Daily",
                                specialInstructions: plan.specialInstructions || "",
                                subTherapy: plan.subTherapy || "",
                                duration: plan.duration || "",
                                treatmentDescription: plan.treatmentDescription || "",
                                therapistId: assignedTherapistIds,
                                startDate: formatDateForInput(plan.startDate),
                            };
                        }));

                        setFormData(prev => ({
                            ...prev,
                            therapies: mappedTherapies.length > 0 ? mappedTherapies : [getEmptyTherapy(prev.appointmentDate)]
                        }));
                    } else if (patient.assignedTherapy) {
                        // Fallback to patient profile data
                        const formatDateForInput = (date) => {
                            if (!date) return new Date().toLocaleDateString("en-CA");
                            const d = new Date(date);
                            return d.toLocaleDateString("en-CA");
                        };

                        setFormData(prev => ({
                            ...prev,
                            therapies: [{
                                treatmentName: patient.assignedTherapy?.therapyName || patient.assignedTherapy || "",
                                daysOfTreatment: patient.therapyDurationDays || 0,
                                timeline: patient.therapyTimeline || "Daily",
                                specialInstructions: patient.therapyInstructions || "",
                                subTherapy: patient.subTherapy || "",
                                duration: patient.duration || "",
                                treatmentDescription: patient.treatmentDescription || "",
                                therapistId: patient.primaryTherapist ? [patient.primaryTherapist._id || patient.primaryTherapist] : [],
                                startDate: formatDateForInput(patient.therapyStartDate),
                            }]
                        }));
                    }
                } catch (planErr) {
                    console.error("Error loading treatment plans:", planErr);
                }
            }
        } catch (error) {
            console.error("Error loading existing assignments:", error);
        } finally {
            setIsLoadingExistingData(false);
        }
    }, [patientProfileId, existingDoctorId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (patientProfileId && !isLoadingData) {
            loadExistingAssignments();
        }
    }, [patientProfileId, isLoadingData, loadExistingAssignments]);


    const handleModeChange = (event, newMode) => {
        if (newMode !== null) {
            setMode(newMode);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            // When appointment date changes, sync therapy Start Dates that are still "today" to the new date
            if (name === "appointmentDate" && value) {
                const todayStr = new Date().toLocaleDateString("en-CA");
                next.therapies = prev.therapies.map((t) =>
                    t.startDate === todayStr ? { ...t, startDate: value } : t
                );
            }
            return next;
        });
    };

    const handleTherapyChange = (index, field, value) => {
        setFormData(prev => {
            const updatedTherapies = [...prev.therapies];
            updatedTherapies[index] = {
                ...updatedTherapies[index],
                [field]: value
            };
            return { ...prev, therapies: updatedTherapies };
        });
    };

    const handleAddTherapy = () => {
        setFormData(prev => ({
            ...prev,
            therapies: [...prev.therapies, getEmptyTherapy(prev.appointmentDate)]
        }));
    };

    const handleRemoveTherapy = (index) => {
        setFormData(prev => ({
            ...prev,
            therapies: prev.therapies.filter((_, i) => i !== index)
        }));
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
            // Filter out existing therapies (have _id) and empty ones to prevent duplication
            therapies: formData.therapies.filter(t => {
                const hasId = !!t._id;
                const hasName = t.treatmentName && (typeof t.treatmentName === 'string' ? t.treatmentName.trim().length > 0 : Array.isArray(t.treatmentName) && t.treatmentName.length > 0);
                return !hasId && hasName;
            }),
            // Persist Start Date changes for existing therapy rows (those with _id)
            therapyUpdates: formData.therapies
                .filter(t => t._id && t.startDate != null)
                .map(t => ({ planId: t._id, startDate: t.startDate }))
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
                                                let nurseProfileId = "";
                                                if (nurse.profileId) {
                                                    nurseProfileId = nurse.profileId.toString();
                                                } else if (nurse._id && typeof nurse._id === 'object' && nurse._id.toString) {
                                                    nurseProfileId = nurse._id.toString();
                                                } else if (nurse._id) {
                                                    nurseProfileId = nurse._id.toString();
                                                }

                                                const nurseName = nurse.user?.name || nurse.name || "Nurse";

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
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Clipboard size={20} color="var(--color-primary-a)" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Therapy Planning</Typography>
                                </Box>
                            </Box>

                            {formData.therapies.map((therapy, index) => (
                                <Paper
                                    key={index}
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        mb: 3,
                                        borderRadius: '12px',
                                        border: '1px solid var(--color-border-a)',
                                        backgroundColor: '#fafafa',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Remove Button for index > 0 or if you want to allow removing the first one too */}
                                    {formData.therapies.length > 1 && (
                                        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveTherapy(index)}
                                                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                                            >
                                                <Trash2 size={18} />
                                            </IconButton>
                                        </Box>
                                    )}

                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                        {/* Row 1: Select Therapy and Sub Therapy */}
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                            <FormControl sx={{ flex: 2, minWidth: "300px" }}>
                                                <InputLabel>Select Therapy</InputLabel>
                                                <Select
                                                    value={therapy.treatmentName}
                                                    onChange={(e) => handleTherapyChange(index, 'treatmentName', e.target.value)}
                                                    label="Select Therapy"
                                                >
                                                    {therapiesList.map((t) => (
                                                        <MenuItem key={t._id} value={t.therapyName}>
                                                            <ListItemText primary={t.therapyName} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            <TextField
                                                sx={{ flex: 1, minWidth: "250px" }}
                                                label="Sub Therapy"
                                                value={therapy.subTherapy}
                                                onChange={(e) => handleTherapyChange(index, 'subTherapy', e.target.value)}
                                                placeholder="e.g. Oil Type, Specific Medicines"
                                            />
                                        </Box>

                                        {/* Row 2: Session, Timeline, Duration */}
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                            <TextField
                                                label="Session"
                                                type="number"
                                                value={therapy.daysOfTreatment}
                                                onChange={(e) => handleTherapyChange(index, 'daysOfTreatment', e.target.value)}
                                                sx={{ flex: 1, minWidth: "150px" }}
                                                inputProps={{ min: 0 }}
                                            />

                                            <FormControl sx={{ flex: 1, minWidth: "150px" }}>
                                                <InputLabel>Timeline</InputLabel>
                                                <Select
                                                    value={therapy.timeline}
                                                    onChange={(e) => handleTherapyChange(index, 'timeline', e.target.value)}
                                                    label="Timeline"
                                                >
                                                    <MenuItem value="Daily">Daily</MenuItem>
                                                    <MenuItem value="AlternateDay">Alternate Days</MenuItem>
                                                    <MenuItem value="Weekly">Weekly</MenuItem>
                                                    <MenuItem value="Monthly">Monthly</MenuItem>
                                                </Select>
                                            </FormControl>

                                            <TextField
                                                sx={{ flex: 1, minWidth: "200px" }}
                                                label="Duration"
                                                type="number"
                                                value={therapy.duration}
                                                onChange={(e) => handleTherapyChange(index, 'duration', e.target.value)}
                                                placeholder="e.g. 45"
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">min</InputAdornment>,
                                                    inputProps: { min: 0 }
                                                }}
                                            />
                                        </Box>

                                        {/* Row 3: Treatment Description */}
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                            <TextField
                                                sx={{ flex: 1, minWidth: "100%" }}
                                                label="Treatment Description"
                                                value={therapy.treatmentDescription}
                                                onChange={(e) => handleTherapyChange(index, 'treatmentDescription', e.target.value)}
                                                multiline
                                                rows={3}
                                                placeholder="Enter detailed description of the treatment..."
                                            />
                                        </Box>

                                        {/* Row 4: Assign Therapist, Special Instructions, Start Date */}
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                            <FormControl sx={{ flex: 1, minWidth: "250px" }}>
                                                <InputLabel>Assign Therapist</InputLabel>
                                                <Select
                                                    multiple
                                                    value={therapy.therapistId}
                                                    onChange={(e) => handleTherapyChange(index, 'therapistId', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
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
                                                                <Checkbox checked={therapy.therapistId.indexOf(thId) > -1} />
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
                                                label="Special Instructions"
                                                value={therapy.specialInstructions}
                                                onChange={(e) => handleTherapyChange(index, 'specialInstructions', e.target.value)}
                                            />

                                            <TextField
                                                sx={{ flex: 1, minWidth: "250px" }}
                                                label="Start Date"
                                                type="date"
                                                value={therapy.startDate}
                                                onChange={(e) => handleTherapyChange(index, 'startDate', e.target.value)}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}

                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                                <Button
                                    startIcon={<Plus size={18} />}
                                    variant="outlined"
                                    size="small"
                                    onClick={handleAddTherapy}
                                    sx={{
                                        borderColor: 'var(--color-primary-a)',
                                        color: 'var(--color-primary-a)',
                                        '&:hover': {
                                            borderColor: 'var(--color-primary-a)',
                                            backgroundColor: 'rgba(139, 69, 19, 0.04)'
                                        }
                                    }}
                                >
                                    Add Another Therapy
                                </Button>
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
