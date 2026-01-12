import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Grid,
    Button,
    Avatar,
    Chip,
    Stack,
    Divider,
    FormControlLabel,
    Switch,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
} from "@mui/material";
import {
    CalendarToday,
    Save,
    PersonOutline,
    MedicalInformation,
    Assessment,
    History,
    Medication,
    MonitorHeart,
    TrackChanges,
    LocalHospital,
    Healing,
} from "@mui/icons-material";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";

// Reusable Form Section Component
function FormSection({ title, subtitle, icon: Icon, children }) {
    return (
        <Paper
            elevation={1}
            sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                border: "1px solid var(--color-primary-light)",
                bgcolor: "white",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                },
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Icon sx={{ fontSize: 28, color: "var(--color-primary)" }} />
                    <Box>
                        <Typography variant="h6" fontWeight={700} color="var(--color-primary-dark)">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="var(--color-text-muted)">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </Stack>
            <Divider sx={{ mb: 2, borderColor: "var(--color-primary-light)" }} />
            {children}
        </Paper>
    );
}

function ExaminationRecordsFormView({ patient, appointmentId, appointmentData, onSubmitSuccess, examinationId, examinationData, isEditMode = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useParams();
    const { user } = useSelector((state) => state.auth);
    const [isEditing] = useState(true);
    const [admitPatient, setAdmitPatient] = useState(false);
    const [inpatientFormData, setInpatientFormData] = useState({
        roomNumber: "",
        bedNumber: "",
        wardCategory: "",
        reason: "",
        notes: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Generate localStorage key based on appointment ID
    const storageKey = appointmentId ? `examination_${appointmentId}` : null;
    const savedKey = appointmentId ? `examination_saved_${appointmentId}` : null;

    // Form Data - initial state
    const [formData, setFormData] = useState({
        // Prakriti Assessment
        vata: "",
        pitta: "",
        kapha: "",
        // Clinical Examination
        pulse: "",
        tongue: "",
        skin: "",
        nails: "",
        eyes: "",
        appetite: "",
        digestion: "",
        bowel: "",
        urine: "",
        sleep: "",
        // Complaints
        chiefComplaint: "",
        duration: "",
        severity: "",
        // General Medical History
        pastIllness: "",
        surgeries: "",
        allergies: "",
        medications: "",
        // History of Patient Illness
        onset: "",
        progression: "",
        aggravatingFactors: "",
        relievingFactors: "",
        // Ongoing Medications
        currentMedications: "",
        // AAHP Examination
        // Vitals
        height: "",
        weight: "",
        bmi: "",
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        spo2: "",
        respiratoryRate: "",
        // Systemic Examination
        cardiovascular: "",
        respiratory: "",
        gastrointestinal: "",
        musculoskeletal: "",
        neurological: "",
        // Physical Investigations
        investigation: "",
        result: "",
        date: "",
        // Laboratory Investigation
        laboratoryInvestigation: "",
        // Diagnosis & Recommendations
        diagnosis: "",
        treatment: "",
        lifestyle: "",
        followUp: "",
    });

    // Load examination data when in edit mode
    useEffect(() => {
        const fetchData = async () => {
            if (isEditMode && examinationData) {
                try {
                    // Parse prakriti assessment
                    const prakriti = examinationData.prakritiAssessment || "";
                    const vataMatch = prakriti.match(/Vata:\s*([^,]*)/);
                    const pittaMatch = prakriti.match(/Pitta:\s*([^,]*)/);
                    const kaphaMatch = prakriti.match(/Kapha:\s*([^,]*)/);

                    // Parse customFields (clinical and systemic examination)
                    const customFields = examinationData.customFields || [];
                    const customFieldsMap = {};
                    customFields.forEach(field => {
                        if (field.label && field.value) {
                            customFieldsMap[field.label] = field.value;
                        }
                    });

                    // Parse vitals
                    const vitals = examinationData.vitals?.[0] || {};

                    // Parse history of patient illness
                    const history = examinationData.historyOfPatientIllness || "";
                    const onsetMatch = history.match(/Onset:\s*([^.]*)/);
                    const progressionMatch = history.match(/Progression:\s*([^.]*)/);
                    const aggMatch = history.match(/Aggravating Factors:\s*([^.]*)/);
                    const relMatch = history.match(/Relieving Factors:\s*([^.]*)/);
                    const durationMatch = history.match(/Duration:\s*([^.]*)/);
                    const severityMatch = history.match(/Severity:\s*([^/]*)/);

                    // Parse medical history
                    const medHistory = examinationData.medicalSurgicalHistory || "";
                    const pastIllnessMatch = medHistory.match(/Past Illness:\s*([^.]*)/);
                    const surgeriesMatch = medHistory.match(/Surgeries:\s*([^.]*)/);
                    const allergiesMatch = medHistory.match(/Allergies:\s*([^.]*)/);
                    const medicationsMatch = medHistory.match(/Past Medications:\s*([^.]*)/);

                    // Parse examination notes
                    const notes = examinationData.examinationNotes || "";
                    const treatmentMatch = notes.match(/Treatment Plan:\s*([^.]*)/);
                    const lifestyleMatch = notes.match(/Lifestyle Recommendations:\s*([^.]*)/);

                    // Parse diagnoses
                    const diagnosis = examinationData.diagnoses?.[0] || "";

                    // Parse previous investigations
                    const prevInvest = examinationData.previousInvestigations || "";
                    const investDateMatch = prevInvest.match(/\(Date:\s*([^)]*)\)/);
                    const investigation = investDateMatch ? prevInvest.replace(/\s*\(Date:.*\)/, "").trim() : prevInvest;

                    // Set form data
                    setFormData({
                        vata: (vataMatch?.[1] || "").trim(),
                        pitta: (pittaMatch?.[1] || "").trim(),
                        kapha: (kaphaMatch?.[1] || "").trim(),
                        pulse: customFieldsMap["Pulse (Nadi)"] || "",
                        tongue: customFieldsMap["Tongue (Jivha)"] || "",
                        skin: customFieldsMap["Skin (Tvak)"] || "",
                        nails: customFieldsMap["Nails (Nakha)"] || "",
                        eyes: customFieldsMap["Eyes (Netra)"] || "",
                        appetite: customFieldsMap["Appetite (Agni)"] || "",
                        digestion: customFieldsMap["Digestion"] || "",
                        bowel: customFieldsMap["Bowel Movement"] || "",
                        urine: customFieldsMap["Urine (Mutra)"] || "",
                        sleep: customFieldsMap["Sleep (Nidra)"] || "",
                        chiefComplaint: examinationData.complaints || "",
                        duration: (durationMatch?.[1] || "").trim(),
                        severity: (severityMatch?.[1] || "").trim(),
                        pastIllness: (pastIllnessMatch?.[1] || "").trim(),
                        surgeries: (surgeriesMatch?.[1] || "").trim(),
                        allergies: (allergiesMatch?.[1] || "").trim(),
                        medications: (medicationsMatch?.[1] || "").trim(),
                        onset: (onsetMatch?.[1] || "").trim(),
                        progression: (progressionMatch?.[1] || "").trim(),
                        aggravatingFactors: (aggMatch?.[1] || "").trim(),
                        relievingFactors: (relMatch?.[1] || "").trim(),
                        currentMedications: examinationData.ongoingMedications || "",
                        height: vitals.height || "",
                        weight: vitals.weight || "",
                        bmi: vitals.bmi || "",
                        bloodPressure: vitals.bloodPressure || "",
                        heartRate: vitals.heartRate || "",
                        temperature: vitals.temperature || "",
                        spo2: vitals.spo2 || "",
                        respiratoryRate: vitals.respiratoryRate || "",
                        cardiovascular: customFieldsMap["Cardiovascular"] || "",
                        respiratory: customFieldsMap["Respiratory"] || "",
                        gastrointestinal: customFieldsMap["Gastrointestinal"] || "",
                        musculoskeletal: customFieldsMap["Musculoskeletal"] || "",
                        neurological: customFieldsMap["Neurological"] || "",
                        investigation: investigation || "",
                        result: examinationData.presentInvestigations || "",
                        date: investDateMatch?.[1] || "",
                        laboratoryInvestigation: examinationData.laboratoryInvestigation || "",
                        diagnosis: diagnosis,
                        treatment: (treatmentMatch?.[1] || "").trim(),
                        lifestyle: (lifestyleMatch?.[1] || "").trim(),
                        followUp: examinationData.followUps?.[0]?.date ? new Date(examinationData.followUps[0].date).toISOString().split("T")[0] : "",
                    });

                    // Set inpatient data if exists
                    if (examinationData.inpatient) {
                        setAdmitPatient(true);
                        // Fetch full inpatient details if available
                        if (examinationData.inpatient._id || typeof examinationData.inpatient === 'string') {
                            const inpatientId = examinationData.inpatient._id || examinationData.inpatient;
                            try {
                                const inpatientResponse = await axios.get(
                                    getApiUrl(`inpatients/${inpatientId}`),
                                    { headers: getAuthHeaders() }
                                );
                                if (inpatientResponse.data.success && inpatientResponse.data.data) {
                                    const inpatient = inpatientResponse.data.data;
                                    setInpatientFormData({
                                        roomNumber: inpatient.roomNumber || "",
                                        bedNumber: inpatient.bedNumber || "",
                                        wardCategory: inpatient.wardCategory || "",
                                        reason: inpatient.reason || "",
                                        notes: inpatient.notes || "",
                                    });
                                }
                            } catch (error) {
                                console.error("Error fetching inpatient details:", error);
                                // Set empty values if fetch fails
                                setInpatientFormData({
                                    roomNumber: "",
                                    bedNumber: "",
                                    wardCategory: "",
                                    reason: "",
                                    notes: "",
                                });
                            }
                        } else {
                            // If inpatient is populated object
                            setInpatientFormData({
                                roomNumber: examinationData.inpatient.roomNumber || "",
                                bedNumber: examinationData.inpatient.bedNumber || "",
                                wardCategory: examinationData.inpatient.wardCategory || "",
                                reason: examinationData.inpatient.reason || "",
                                notes: examinationData.inpatient.notes || "",
                            });
                        }
                    } else {
                        // If no inpatient, ensure toggle is off
                        setAdmitPatient(false);
                        setInpatientFormData({
                            roomNumber: "",
                            bedNumber: "",
                            wardCategory: "",
                            reason: "",
                            notes: "",
                        });
                    }
                } catch (error) {
                    console.error("Error parsing examination data:", error);
                    toast.error("Error loading examination data for editing");
                }
            }
        };
        fetchData();
    }, [isEditMode, examinationData]);

    // Load from localStorage on mount (only if not in edit mode)
    useEffect(() => {
        if (!isEditMode && storageKey) {
            try {
                const saved = localStorage.getItem(storageKey);
                const savedInpatient = localStorage.getItem(`${storageKey}_inpatient`);
                const savedAdmit = localStorage.getItem(`${storageKey}_admit`);
                const savedFlag = localStorage.getItem(savedKey);

                if (saved) {
                    setFormData(JSON.parse(saved));
                }
                if (savedInpatient) {
                    setInpatientFormData(JSON.parse(savedInpatient));
                }
                if (savedAdmit) {
                    setAdmitPatient(JSON.parse(savedAdmit));
                }
                if (savedFlag === 'true') {
                    setIsSaved(true);
                }
            } catch (error) {
                console.error("Error loading from localStorage:", error);
            }
        }
    }, [storageKey, savedKey, isEditMode]);

    // Save to localStorage whenever formData changes
    useEffect(() => {
        if (storageKey && !isSaved) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(formData));
            } catch (error) {
                console.error("Error saving to localStorage:", error);
            }
        }
    }, [formData, storageKey, isSaved]);

    // Save inpatientFormData to localStorage
    useEffect(() => {
        if (storageKey && !isSaved) {
            try {
                const key = `${storageKey}_inpatient`;
                localStorage.setItem(key, JSON.stringify(inpatientFormData));
            } catch (error) {
                console.error("Error saving inpatient data to localStorage:", error);
            }
        }
    }, [inpatientFormData, storageKey, isSaved]);

    // Save admitPatient flag to localStorage
    useEffect(() => {
        if (storageKey && !isSaved) {
            try {
                const key = `${storageKey}_admit`;
                localStorage.setItem(key, JSON.stringify(admitPatient));
            } catch (error) {
                console.error("Error saving admit flag to localStorage:", error);
            }
        }
    }, [admitPatient, storageKey, isSaved]);

    const handleChange = (field) => (event) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    const handleInpatientChange = (field) => (event) => {
        setInpatientFormData({ ...inpatientFormData, [field]: event.target.value });
    };

    const handleSave = async () => {
        if (!user?._id) {
            toast.error("User not authenticated. Please log in again.");
            return;
        }

        // For new examinations, we need either appointmentId OR patient (from userId)
        if (!isEditMode && !appointmentId && !patient?._id) {
            toast.error("Patient information is missing. Cannot create examination.");
            return;
        }

        if (isEditMode && !examinationId) {
            toast.error("Examination ID is missing. Cannot update examination.");
            return;
        }

        // Prevent duplicate saves
        if (isSaved) {
            toast.info("Examination already saved. Proceeding to next step.");
            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare examination data with ALL form fields
            // Include appointment only if it exists, otherwise use patient directly
            const examinationData = {
                ...(appointmentId ? { appointment: appointmentId } : { patient: patient._id }),
                // Chief Complaint (with duration and severity)
                complaints: formData.chiefComplaint || "",
                // Build comprehensive history with all fields
                historyOfPatientIllness: [
                    formData.onset && `Onset: ${formData.onset}`,
                    formData.progression && `Progression: ${formData.progression}`,
                    formData.aggravatingFactors && `Aggravating Factors: ${formData.aggravatingFactors}`,
                    formData.relievingFactors && `Relieving Factors: ${formData.relievingFactors}`,
                    formData.duration && `Duration: ${formData.duration}`,
                    formData.severity && `Severity: ${formData.severity}/10`
                ].filter(Boolean).join(". ") || "",
                // Medications
                ongoingMedications: formData.currentMedications || formData.medications || "",
                // Investigations
                previousInvestigations: formData.investigation ?
                    `${formData.investigation}${formData.date ? ` (Date: ${formData.date})` : ""}` : "",
                presentInvestigations: formData.result || "",
                laboratoryInvestigation: formData.laboratoryInvestigation || "",
                // Medical History (including allergies and medications)
                medicalSurgicalHistory: [
                    formData.pastIllness && `Past Illness: ${formData.pastIllness}`,
                    formData.surgeries && `Surgeries: ${formData.surgeries}`,
                    formData.allergies && `Allergies: ${formData.allergies}`,
                    formData.medications && `Past Medications: ${formData.medications}`
                ].filter(Boolean).join(". ") || "",
                // Prakriti Assessment
                prakritiAssessment: `Vata: ${formData.vata || ""}, Pitta: ${formData.pitta || ""}, Kapha: ${formData.kapha || ""}`,
                // Vitals
                vitals: [{
                    temperature: formData.temperature || "",
                    bloodPressure: formData.bloodPressure || "",
                    heartRate: formData.heartRate || "",
                    spo2: formData.spo2 || "",
                    respiratoryRate: formData.respiratoryRate || "",
                    weight: formData.weight || "",
                    height: formData.height || "",
                    bmi: formData.bmi || "",
                }],
                // Diagnoses
                diagnoses: formData.diagnosis ? [formData.diagnosis] : [],
                // Examination Notes (treatment and lifestyle)
                examinationNotes: [
                    formData.treatment && `Treatment Plan: ${formData.treatment}`,
                    formData.lifestyle && `Lifestyle Recommendations: ${formData.lifestyle}`
                ].filter(Boolean).join(". ") || "",
                // Clinical Examination Fields (using customFields for additional data)
                customFields: [
                    // Clinical Examination (Ayurvedic)
                    formData.pulse && { label: "Pulse (Nadi)", value: formData.pulse },
                    formData.tongue && { label: "Tongue (Jivha)", value: formData.tongue },
                    formData.skin && { label: "Skin (Tvak)", value: formData.skin },
                    formData.nails && { label: "Nails (Nakha)", value: formData.nails },
                    formData.eyes && { label: "Eyes (Netra)", value: formData.eyes },
                    formData.appetite && { label: "Appetite (Agni)", value: formData.appetite },
                    formData.digestion && { label: "Digestion", value: formData.digestion },
                    formData.bowel && { label: "Bowel Movement", value: formData.bowel },
                    formData.urine && { label: "Urine (Mutra)", value: formData.urine },
                    formData.sleep && { label: "Sleep (Nidra)", value: formData.sleep },
                    // Systemic Examination
                    formData.cardiovascular && { label: "Cardiovascular", value: formData.cardiovascular },
                    formData.respiratory && { label: "Respiratory", value: formData.respiratory },
                    formData.gastrointestinal && { label: "Gastrointestinal", value: formData.gastrointestinal },
                    formData.musculoskeletal && { label: "Musculoskeletal", value: formData.musculoskeletal },
                    formData.neurological && { label: "Neurological", value: formData.neurological }
                ].filter(Boolean),
                // Follow-up information
                followUps: formData.followUp ? [{
                    date: new Date(formData.followUp),
                    note: formData.lifestyle || "Follow-up scheduled"
                }] : []
            };

            // If doctor wants to admit patient, add admission data
            if (admitPatient) {
                examinationData.admitPatient = true;
                examinationData.inpatientData = {
                    roomNumber: inpatientFormData.roomNumber || null,
                    bedNumber: inpatientFormData.bedNumber || null,
                    wardCategory: inpatientFormData.wardCategory || null,
                    reason: inpatientFormData.reason || formData.chiefComplaint || "Admitted after consultation",
                    notes: inpatientFormData.notes || null,
                };
            }

            let response;
            if (isEditMode) {
                // Update existing examination using PATCH
                response = await axios.patch(
                    getApiUrl(`examinations/${examinationId}`),
                    examinationData,
                    { headers: getAuthHeaders() }
                );
            } else {
                // Create new examination using POST
                response = await axios.post(
                    getApiUrl("examinations"),
                    examinationData,
                    { headers: getAuthHeaders() }
                );
            }

            if (response.data.success) {
                const savedExamination = response.data.data;
                const newExaminationId = savedExamination?._id;

                console.log("Examination saved successfully:", savedExamination);
                console.log("Examination ID:", newExaminationId);
                console.log("User ID from params:", userId);

                if (isEditMode) {
                    toast.success("Examination updated successfully!");
                } else {
                    if (admitPatient) {
                        toast.success("Examination recorded and patient admitted successfully!");
                    } else {
                        toast.success("Examination recorded successfully!");
                    }
                }

                // Clear localStorage and mark as saved (only for new examinations)
                if (!isEditMode && storageKey) {
                    try {
                        localStorage.removeItem(storageKey);
                        localStorage.removeItem(`${storageKey}_inpatient`);
                        localStorage.removeItem(`${storageKey}_admit`);
                        if (savedKey) {
                            localStorage.setItem(savedKey, 'true');
                        }
                    } catch (error) {
                        console.error("Error clearing localStorage:", error);
                    }
                }
                setIsSaved(true);

                // Navigate to examination details page after a short delay to show success message
                if (newExaminationId && userId) {
                    setTimeout(() => {
                        console.log("Navigating to examination details page...");
                        navigate(`/doctor/examination-details/${userId}`, {
                            state: {
                                examinationId: newExaminationId,
                                appointment: appointmentData || null,
                            },
                            replace: true
                        });
                    }, 500);
                } else {
                    console.warn("Cannot navigate: missing examinationId or userId", {
                        examinationId: newExaminationId,
                        userId
                    });
                    if (onSubmitSuccess) {
                        // Fallback to callback if navigation params are missing
                        onSubmitSuccess(savedExamination);
                    }
                }
            } else {
                toast.error(response.data.message || (isEditMode ? "Failed to update examination" : "Failed to save examination"));
            }
        } catch (error) {
            console.error("Error saving examination:", error);
            console.error("Error response:", error.response?.data);
            toast.error(error.response?.data?.message || error.message || "Failed to save examination");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ p: 4 }}>

                {/* Patient Card */}

                <Grid container spacing={3}>
                    {/* Left Column */}
                    <Grid item xs={12} md={6}>
                        {/* Prakriti Assessment */}
                        <FormSection
                            title="Prakriti Assessment"
                            subtitle="Ayurvedic constitutional evaluation"
                            icon={Assessment}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Vata Dosha"
                                        variant="outlined"
                                        value={formData.vata}
                                        onChange={handleChange("vata")}
                                        disabled={!isEditing}
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <Assessment sx={{ color: "var(--color-primary-light)", mr: 1, fontSize: 18 }} />
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Pitta Dosha"
                                        variant="outlined"
                                        value={formData.pitta}
                                        onChange={handleChange("pitta")}
                                        disabled={!isEditing}
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <Assessment sx={{ color: "var(--color-primary-light)", mr: 1, fontSize: 18 }} />
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Kapha Dosha"
                                        variant="outlined"
                                        value={formData.kapha}
                                        onChange={handleChange("kapha")}
                                        disabled={!isEditing}
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <Assessment sx={{ color: "var(--color-primary-light)", mr: 1, fontSize: 18 }} />
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                        {/* Complaints */}
                        <FormSection
                            title="Chief Complaints"
                            subtitle="Primary symptoms and associated details"
                            icon={MedicalInformation}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Chief Complaint"
                                        variant="outlined"
                                        multiline
                                        rows={3}
                                        value={formData.chiefComplaint}
                                        onChange={handleChange("chiefComplaint")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Duration"
                                        variant="outlined"
                                        value={formData.duration}
                                        onChange={handleChange("duration")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Severity (1-10)"
                                        variant="outlined"
                                        type="number"
                                        inputProps={{ min: 1, max: 10 }}
                                        value={formData.severity}
                                        onChange={handleChange("severity")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                        {/* History of Patient Illness */}
                        <FormSection
                            title="Illness History"
                            subtitle="Onset, progression, and influencing factors"
                            icon={History}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Onset"
                                        variant="outlined"
                                        multiline
                                        rows={2}
                                        value={formData.onset}
                                        onChange={handleChange("onset")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Progression"
                                        variant="outlined"
                                        multiline
                                        rows={2}
                                        value={formData.progression}
                                        onChange={handleChange("progression")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Aggravating Factors"
                                        variant="outlined"
                                        value={formData.aggravatingFactors}
                                        onChange={handleChange("aggravatingFactors")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Relieving Factors"
                                        variant="outlined"
                                        value={formData.relievingFactors}
                                        onChange={handleChange("relievingFactors")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                        {/* Ongoing Medications */}
                        <FormSection
                            title="Ongoing Medications"
                            subtitle="Current prescriptions and dosages"
                            icon={Medication}
                        >
                            <TextField
                                fullWidth
                                label="Current Medications"
                                variant="outlined"
                                multiline
                                rows={4}
                                value={formData.currentMedications}
                                onChange={handleChange("currentMedications")}
                                disabled={!isEditing}
                                size="small"
                            />
                        </FormSection>
                        {/* Physical Investigations */}
                        <FormSection
                            title="Physical Investigations"
                            subtitle="Lab tests and diagnostic results"
                            icon={MonitorHeart}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Investigation Name"
                                        variant="outlined"
                                        value={formData.investigation}
                                        onChange={handleChange("investigation")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Result"
                                        variant="outlined"
                                        multiline
                                        rows={2}
                                        value={formData.result}
                                        onChange={handleChange("result")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Date"
                                        variant="outlined"
                                        type="date"
                                        value={formData.date}
                                        onChange={handleChange("date")}
                                        disabled={!isEditing}
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                        {/* Laboratory Investigation */}
                        <FormSection
                            title="Laboratory Investigation"
                            subtitle="Detailed laboratory test results and findings"
                            icon={MonitorHeart}
                        >
                            <TextField
                                fullWidth
                                label="Laboratory Investigation"
                                variant="outlined"
                                multiline
                                rows={4}
                                value={formData.laboratoryInvestigation}
                                onChange={handleChange("laboratoryInvestigation")}
                                disabled={!isEditing}
                                size="small"
                                placeholder="Enter detailed laboratory investigation results, test findings, and observations..."
                            />
                        </FormSection>
                    </Grid>
                    {/* Right Column */}
                    <Grid item xs={12} md={6}>
                        {/* Clinical Examination */}
                        <FormSection
                            title="Clinical Examination"
                            subtitle="Ayurvedic and general observations"
                            icon={TrackChanges}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Pulse (Nadi)"
                                        variant="outlined"
                                        value={formData.pulse}
                                        onChange={handleChange("pulse")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Tongue (Jivha)"
                                        variant="outlined"
                                        value={formData.tongue}
                                        onChange={handleChange("tongue")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Skin (Tvak)"
                                        variant="outlined"
                                        value={formData.skin}
                                        onChange={handleChange("skin")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Nails (Nakha)"
                                        variant="outlined"
                                        value={formData.nails}
                                        onChange={handleChange("nails")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Eyes (Netra)"
                                        variant="outlined"
                                        value={formData.eyes}
                                        onChange={handleChange("eyes")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Appetite (Agni)"
                                        variant="outlined"
                                        value={formData.appetite}
                                        onChange={handleChange("appetite")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Digestion"
                                        variant="outlined"
                                        value={formData.digestion}
                                        onChange={handleChange("digestion")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Bowel Movement"
                                        variant="outlined"
                                        value={formData.bowel}
                                        onChange={handleChange("bowel")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Urine (Mutra)"
                                        variant="outlined"
                                        value={formData.urine}
                                        onChange={handleChange("urine")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Sleep (Nidra)"
                                        variant="outlined"
                                        value={formData.sleep}
                                        onChange={handleChange("sleep")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                        {/* General Medical History */}
                        <FormSection
                            title="General Medical History"
                            subtitle="Past conditions and interventions"
                            icon={History}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Past Illness"
                                        variant="outlined"
                                        multiline
                                        rows={2}
                                        value={formData.pastIllness}
                                        onChange={handleChange("pastIllness")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Surgeries"
                                        variant="outlined"
                                        multiline
                                        rows={2}
                                        value={formData.surgeries}
                                        onChange={handleChange("surgeries")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Allergies"
                                        variant="outlined"
                                        value={formData.allergies}
                                        onChange={handleChange("allergies")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Past Medications"
                                        variant="outlined"
                                        multiline
                                        rows={2}
                                        value={formData.medications}
                                        onChange={handleChange("medications")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                        {/* AAHP Examination - Vitals */}
                        <FormSection
                            title="AAHP Examination"
                            subtitle="Allopathy, Ayurveda, Homeopathy, Physiotherapy integrated vitals and systems"
                            icon={LocalHospital}
                        >
                            <Typography variant="subtitle2" color="var(--color-text-muted)" mb={2} fontWeight={600}>
                                Vitals
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Height (cm)"
                                        variant="outlined"
                                        type="number"
                                        value={formData.height}
                                        onChange={handleChange("height")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Weight (kg)"
                                        variant="outlined"
                                        type="number"
                                        value={formData.weight}
                                        onChange={handleChange("weight")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="BMI"
                                        variant="outlined"
                                        type="number"
                                        step={0.1}
                                        value={formData.bmi}
                                        onChange={handleChange("bmi")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Blood Pressure (mmHg)"
                                        variant="outlined"
                                        value={formData.bloodPressure}
                                        onChange={handleChange("bloodPressure")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Heart Rate (bpm)"
                                        variant="outlined"
                                        type="number"
                                        value={formData.heartRate}
                                        onChange={handleChange("heartRate")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Temperature (°F)"
                                        variant="outlined"
                                        type="number"
                                        step={0.1}
                                        value={formData.temperature}
                                        onChange={handleChange("temperature")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="SpO2 (%)"
                                        variant="outlined"
                                        type="number"
                                        value={formData.spo2}
                                        onChange={handleChange("spo2")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Respiratory Rate (bpm)"
                                        variant="outlined"
                                        type="number"
                                        value={formData.respiratoryRate}
                                        onChange={handleChange("respiratoryRate")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                            <Typography variant="subtitle2" color="var(--color-text-muted)" mt={3} mb={2} fontWeight={600}>
                                Systemic Examination
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Cardiovascular"
                                        variant="outlined"
                                        value={formData.cardiovascular}
                                        onChange={handleChange("cardiovascular")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Respiratory"
                                        variant="outlined"
                                        value={formData.respiratory}
                                        onChange={handleChange("respiratory")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Gastrointestinal"
                                        variant="outlined"
                                        value={formData.gastrointestinal}
                                        onChange={handleChange("gastrointestinal")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Musculoskeletal"
                                        variant="outlined"
                                        value={formData.musculoskeletal}
                                        onChange={handleChange("musculoskeletal")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Neurological"
                                        variant="outlined"
                                        value={formData.neurological}
                                        onChange={handleChange("neurological")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                        {/* Diagnosis & Recommendations */}
                        <FormSection
                            title="Diagnosis & Recommendations"
                            subtitle="Integrated treatment and follow-up plan"
                            icon={Healing}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Diagnosis (Roga Nidana)"
                                        variant="outlined"
                                        multiline
                                        rows={2}
                                        value={formData.diagnosis}
                                        onChange={handleChange("diagnosis")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Treatment Plan (Chikitsa)"
                                        variant="outlined"
                                        multiline
                                        rows={3}
                                        value={formData.treatment}
                                        onChange={handleChange("treatment")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Lifestyle Recommendations"
                                        variant="outlined"
                                        multiline
                                        rows={2}
                                        value={formData.lifestyle}
                                        onChange={handleChange("lifestyle")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Follow-up Date"
                                        variant="outlined"
                                        type="date"
                                        value={formData.followUp}
                                        onChange={handleChange("followUp")}
                                        disabled={!isEditing}
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                        {/* Admission Decision Section */}
                        <FormSection
                            title="Admission Decision"
                            subtitle="Decide if patient requires admission (IPD)"
                            icon={LocalHospital}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={admitPatient}
                                                onChange={(e) => setAdmitPatient(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Typography variant="body1" fontWeight={600}>
                                                Admit Patient (IPD)
                                            </Typography>
                                        }
                                    />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
                                        {admitPatient
                                            ? "Patient will be admitted and marked as IPD. Examination will be linked to inpatient record."
                                            : "Patient will remain as OPD (Outpatient Department). Examination will be linked only to appointment."}
                                    </Typography>
                                </Grid>
                                {admitPatient && (
                                    <>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                label="Room Number"
                                                variant="outlined"
                                                value={inpatientFormData.roomNumber}
                                                onChange={handleInpatientChange("roomNumber")}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                label="Bed Number"
                                                variant="outlined"
                                                value={inpatientFormData.bedNumber}
                                                onChange={handleInpatientChange("bedNumber")}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Ward Category</InputLabel>
                                                <Select
                                                    value={inpatientFormData.wardCategory}
                                                    onChange={handleInpatientChange("wardCategory")}
                                                    label="Ward Category"
                                                >
                                                    <MenuItem value="">Select Ward</MenuItem>
                                                    <MenuItem value="General">General</MenuItem>
                                                    <MenuItem value="Duplex">Duplex</MenuItem>
                                                    <MenuItem value="Special">Special</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Reason for Admission"
                                                variant="outlined"
                                                multiline
                                                rows={2}
                                                value={inpatientFormData.reason}
                                                onChange={handleInpatientChange("reason")}
                                                size="small"
                                                placeholder="Enter reason for admission (e.g., requires observation, needs therapy sessions, etc.)"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Admission Notes (Optional)"
                                                variant="outlined"
                                                multiline
                                                rows={2}
                                                value={inpatientFormData.notes}
                                                onChange={handleInpatientChange("notes")}
                                                size="small"
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </FormSection>
                    </Grid>
                </Grid>
                {/* Submit Button */}
                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                        variant="contained"
                        size="large"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? (isEditMode ? "Updating..." : "Saving...")
                            : isEditMode
                                ? "Update Examination"
                                : admitPatient
                                    ? "Save Examination & Admit Patient"
                                    : "Save Examination (OPD)"}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}


export default ExaminationRecordsFormView;
