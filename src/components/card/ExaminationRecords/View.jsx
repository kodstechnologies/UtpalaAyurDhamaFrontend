// import React, { useState } from "react";
// import {
//     Box,
//     Typography,
//     Paper,
//     Chip,
//     Stack,
//     Divider,
//     IconButton,
//     Collapse,
//     Table,
//     TableHead,
//     TableRow,
//     TableCell,
//     TableBody,
//     Button,
// } from "@mui/material";
// import {
//     CalendarToday,
//     Healing,
//     Notes,
//     HealthAndSafety,
//     ExpandMore,
//     ExpandLess,
//     LocalHospital,
//     Description,
//     Assignment,
//     MonitorWeight,
//     Bloodtype,
//     Thermostat,
//     Favorite,
// } from "@mui/icons-material";

// function ExaminationRecordsView() {
//     const [expanded, setExpanded] = useState({});

//     const toggleExpand = (id) => {
//         setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
//     };

//     // Sample examination history
//     const examinations = [
//         {
//             id: 1,
//             date: "November 25, 2025",
//             chiefComplaint: "Irregular periods, weight gain, acne",
//             diagnosis: "Polycystic Ovarian Syndrome (PCOS) - Kapha-Pitta aggravation",
//             prakriti: "Kapha-Pitta Prakriti",
//             prescription: "Kanchanar Guggulu, Triphala, Kumaryasava",
//             therapy: "Udvartana, Virechana advised after 3 months",
//             notes: "Patient advised low glycemic diet, yoga (Surya Namaskar), and stress management",
//             status: "Follow-up scheduled",
//             vitals: { height: 162, weight: 68, bmi: 25.9, bp: "118/76", hr: 78, spo2: 98 },
//         },
//         {
//             id: 2,
//             date: "October 10, 2025",
//             chiefComplaint: "Hair fall, fatigue, cold intolerance",
//             diagnosis: "Hypothyroidism with Vata imbalance",
//             prakriti: "Vata-Kapha Prakriti",
//             prescription: "Kanchanar Guggulu, Ashwagandha, Shirodhara oil",
//             therapy: "Nasya + Abhyanga (weekly)",
//             notes: "Thyroid profile improved. Patient feeling more energetic.",
//             status: "Improved",
//             vitals: { height: 162, weight: 65, bmi: 24.8, bp: "110/70", hr: 72, spo2: 99 },
//         },
//     ];

//     return (
//         <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#FAF9F6", minHeight: "100vh" }}>
//             <Box sx={{ mb: 5 }}>
//                 <Typography variant="h4" fontWeight={700} color="var(--color-text-dark)">
//                     Examination Records
//                 </Typography>
//                 <Typography variant="body1" color="var(--color-text-muted)" mt={1}>
//                     Complete clinical history with Ayurvedic insights
//                 </Typography>
//             </Box>

//             <Stack spacing={4}>
//                 {examinations.map((exam) => (
//                     <Paper
//                         key={exam.id}
//                         elevation={0}
//                         sx={{
//                             borderRadius: 4,
//                             overflow: "hidden",
//                             border: "2px solid var(--color-primary-light)",
//                             bgcolor: "white",
//                             boxShadow: "var(--shadow-medium)",
//                             transition: "all 0.3s",
//                             "&:hover": { boxShadow: "0 12px 35px rgba(0,0,0,0.12)" },
//                         }}
//                     >
//                         {/* Date & Status Header */}
//                         <Box
//                             sx={{
//                                 bgcolor: "var(--color-primary)",
//                                 color: "white",
//                                 p: 3,
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 2,
//                             }}
//                         >
//                             <CalendarToday sx={{ fontSize: 28 }} />
//                             <Typography variant="h5" fontWeight={700}>
//                                 {exam.date}
//                             </Typography>
//                             <Chip
//                                 label={exam.status}
//                                 size="medium"
//                                 sx={{
//                                     ml: "auto",
//                                     bgcolor: exam.status.includes("Improved")
//                                         ? "var(--color-success)"
//                                         : "rgba(255,255,255,0.3)",
//                                     color: "white",
//                                     fontWeight: 600,
//                                     borderRadius: 2,
//                                 }}
//                             />
//                         </Box>

//                         <Box sx={{ p: 4 }}>
//                             <Stack spacing={3.5}>
//                                 {/* Prakriti & Chief Complaint */}
//                                 <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
//                                     <Box flex={1}>
//                                         <Typography variant="subtitle2" color="var(--color-text-muted)" gutterBottom>
//                                             Prakriti Assessment
//                                         </Typography>
//                                         <Typography variant="h6" fontWeight={600} color="var(--color-primary-dark)">
//                                             {exam.prakriti}
//                                         </Typography>
//                                     </Box>
//                                     <Box flex={2}>
//                                         <Typography variant="subtitle2" color="var(--color-text-muted)" gutterBottom>
//                                             Chief Complaint
//                                         </Typography>
//                                         <Typography variant="body1" fontWeight={500} color="#333">
//                                             {exam.chiefComplaint}
//                                         </Typography>
//                                     </Box>
//                                 </Stack>

//                                 <Divider sx={{ borderColor: "var(--color-border)" }} />

//                                 {/* Diagnosis */}
//                                 <Box>
//                                     <Typography variant="subtitle2" color="var(--color-text-muted)" gutterBottom>
//                                         <LocalHospital sx={{ fontSize: 18, verticalAlign: "middle", mr: 0.5 }} />
//                                         Diagnosis (Roga Nidanam)
//                                     </Typography>
//                                     <Typography variant="h6" fontWeight={600} color="var(--color-error)">
//                                         {exam.diagnosis}
//                                     </Typography>
//                                 </Box>

//                                 <Divider sx={{ borderColor: "var(--color-border)" }} />

//                                 {/* Vitals */}
//                                 <Box>
//                                     <Box
//                                         sx={{
//                                             display: "flex",
//                                             alignItems: "center",
//                                             gap: 1,
//                                             mb: 1.5,
//                                             cursor: "pointer",
//                                         }}
//                                         onClick={() => toggleExpand(`vitals-${exam.id}`)}
//                                     >
//                                         <MonitorWeight sx={{ color: "var(--color-primary)" }} />
//                                         <Typography variant="subtitle1" fontWeight={600} color="var(--color-text-dark)">
//                                             Vitals & Anthropometry
//                                         </Typography>
//                                         <IconButton size="small" sx={{ ml: "auto" }}>
//                                             {expanded[`vitals-${exam.id}`] ? <ExpandLess /> : <ExpandMore />}
//                                         </IconButton>
//                                     </Box>
//                                     <Collapse in={expanded[`vitals-${exam.id}`]}>
//                                         <Box sx={{ pl: 4, bgcolor: "#fdfdf9", p: 3, borderRadius: 3, border: "1px dashed var(--color-border)" }}>
//                                             <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
//                                                 <Box><strong>Height:</strong> {exam.vitals.height} cm</Box>
//                                                 <Box><strong>Weight:</strong> {exam.vitals.weight} kg</Box>
//                                                 <Box><strong>BMI:</strong> {exam.vitals.bmi}</Box>
//                                                 <Box><strong>BP:</strong> {exam.vitals.bp} mmHg</Box>
//                                                 <Box><strong>Heart Rate:</strong> {exam.vitals.hr} bpm</Box>
//                                                 <Box><strong>SpO2:</strong> {exam.vitals.spo2}%</Box>
//                                             </Stack>
//                                         </Box>
//                                     </Collapse>
//                                 </Box>

//                                 <Divider sx={{ borderColor: "var(--color-border)" }} />

//                                 {/* Prescription & Therapy */}
//                                 <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
//                                     <Box flex={1}>
//                                         <Stack direction="row" spacing={1} alignItems="center" mb={1}>
//                                             <Description sx={{ color: "#8E714F" }} />
//                                             <Typography variant="subtitle2" color="var(--color-text-muted)">
//                                                 Prescription (Aushadhi)
//                                             </Typography>
//                                         </Stack>
//                                         <Typography variant="body1" fontWeight={600} color="var(--color-primary-dark)">
//                                             {exam.prescription}
//                                         </Typography>
//                                     </Box>

//                                     <Box flex={1}>
//                                         <Stack direction="row" spacing={1} alignItems="center" mb={1}>
//                                             <Healing sx={{ color: "#6A8E3F" }} />
//                                             <Typography variant="subtitle2" color="var(--color-text-muted)">
//                                                 Recommended Therapy (Chikitsa)
//                                             </Typography>
//                                         </Stack>
//                                         <Typography variant="body1" fontWeight={600} color="#5D4037">
//                                             {exam.therapy}
//                                         </Typography>
//                                     </Box>
//                                 </Stack>

//                                 <Divider sx={{ borderColor: "var(--color-border)" }} />

//                                 {/* Doctor's Notes */}
//                                 <Box>
//                                     <Stack direction="row" spacing={1} alignItems="center" mb={1}>
//                                         <Notes sx={{ color: "var(--color-warning)" }} />
//                                         <Typography variant="subtitle2" color="var(--color-text-muted)">
//                                             Doctor's Notes & Lifestyle Advice
//                                         </Typography>
//                                     </Stack>
//                                     <Typography variant="body1" color="#424242" lineHeight={1.7}>
//                                         {exam.notes}
//                                     </Typography>
//                                 </Box>
//                             </Stack>
//                         </Box>
//                     </Paper>
//                 ))}
//             </Stack>

//             {/* Empty State */}
//             {examinations.length === 0 && (
//                 <Paper
//                     sx={{
//                         textAlign: "center",
//                         py: 12,
//                         borderRadius: 4,
//                         border: "2px dashed var(--color-border)",
//                         bgcolor: "#fdfdf9",
//                     }}
//                 >
//                     <HealthAndSafety sx={{ fontSize: 90, color: "#ccc", mb: 3 }} />
//                     <Typography variant="h5" color="var(--color-text-muted)" fontWeight={600}>
//                         No Examination Records Yet
//                     </Typography>
//                     <Typography variant="body1" color="var(--color-text-muted)" mt={1}>
//                         Patient’s treatment journey will appear here once examinations begin.
//                     </Typography>
//                     <Button
//                         variant="contained"
//                         size="large"
//                         sx={{
//                             mt: 4,
//                             bgcolor: "var(--color-primary)",
//                             textTransform: "none",
//                             fontWeight: 600,
//                             px: 5,
//                         }}
//                     >
//                         Add First Examination
//                     </Button>
//                 </Paper>
//             )}
//         </Box>
//     );
// }

// export default ExaminationRecordsView;

import React, { useState } from "react";
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
    IconButton,
} from "@mui/material";
import {
    CalendarToday,
    Person,
    Edit,
    Save,
    Close,
} from "@mui/icons-material";

function ExaminationRecordsFormView() {
    const [isEditing, setIsEditing] = useState(false);

    // Patient Info
    const patient = {
        name: "Sharavni",
        age: 22,
        gender: "Female",
        avatar: "S",
        visitDate: "November 2024",
    };

    // Form Data
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

        // Diagnosis & Recommendations
        diagnosis: "",
        treatment: "",
        lifestyle: "",
        followUp: "",
    });

    const handleChange = (field) => (event) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    const handleSave = () => {
        console.log("Saving form data:", formData);
        setIsEditing(false);
    };

    return (
        <Box sx={{ bgcolor: "#FAF9F6", minHeight: "100vh" }}>
            {/* Header */}
            <Box
                sx={{
                    bgcolor: "white",
                    p: 3,
                    borderBottom: "2px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h5" fontWeight={700} color="var(--color-text-dark)">
                    Examination Records
                </Typography>
                <IconButton onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? <Close /> : <Edit />}
                </IconButton>
            </Box>

            <Box sx={{ p: 4 }}>
                {/* Patient Card */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 3,
                        border: "2px solid var(--color-primary-light)",
                        bgcolor: "white",
                    }}
                >
                    <Stack direction="row" spacing={3} alignItems="center">
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                bgcolor: "var(--color-primary)",
                                fontSize: 28,
                                fontWeight: 700,
                            }}
                        >
                            {patient.avatar}
                        </Avatar>
                        <Box flex={1}>
                            <Typography variant="h6" fontWeight={700} color="var(--color-text-dark)">
                                {patient.name}
                            </Typography>
                            <Stack direction="row" spacing={2} mt={0.5}>
                                <Typography variant="body2" color="var(--color-text-muted)">
                                    {patient.age} years, {patient.gender}
                                </Typography>
                            </Stack>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarToday sx={{ fontSize: 18, color: "var(--color-primary)" }} />
                            <Typography variant="body2" fontWeight={600} color="var(--color-text-dark)">
                                {patient.visitDate}
                            </Typography>
                        </Stack>
                        <Chip
                            label="Active"
                            size="small"
                            sx={{
                                bgcolor: "var(--color-success)",
                                color: "white",
                                fontWeight: 600,
                            }}
                        />
                    </Stack>
                </Paper>

                <Grid container spacing={3}>
                    {/* Left Column */}
                    <Grid item xs={12} md={6}>
                        {/* Prakriti Assessment */}
                        <FormSection title="Prakriti Assessment">
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Vata"
                                        variant="outlined"
                                        value={formData.vata}
                                        onChange={handleChange("vata")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Pitta"
                                        variant="outlined"
                                        value={formData.pitta}
                                        onChange={handleChange("pitta")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Kapha"
                                        variant="outlined"
                                        value={formData.kapha}
                                        onChange={handleChange("kapha")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>

                        {/* Complaints */}
                        <FormSection title="Complaints">
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
                                        label="Severity"
                                        variant="outlined"
                                        value={formData.severity}
                                        onChange={handleChange("severity")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>

                        {/* History of Patient Illness */}
                        <FormSection title="History of Patient Illness">
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
                        <FormSection title="Ongoing Medications">
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
                        <FormSection title="Physical Investigations">
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
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} md={6}>
                        {/* Clinical Examination */}
                        <FormSection title="Clinical Examination">
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
                        <FormSection title="General Medical History">
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Past Illness / Surgeries"
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
                                        label="Current Medications"
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
                        <FormSection title="AAHP Examination">
                            <Typography variant="subtitle2" color="var(--color-text-muted)" mb={2}>
                                Vitals
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Height (cm)"
                                        variant="outlined"
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
                                        value={formData.weight}
                                        onChange={handleChange("weight")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Blood Pressure"
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
                                        label="Heart Rate"
                                        variant="outlined"
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
                                        value={formData.spo2}
                                        onChange={handleChange("spo2")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="BMI"
                                        variant="outlined"
                                        value={formData.bmi}
                                        onChange={handleChange("bmi")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Respiratory Rate"
                                        variant="outlined"
                                        value={formData.respiratoryRate}
                                        onChange={handleChange("respiratoryRate")}
                                        disabled={!isEditing}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>

                            <Typography variant="subtitle2" color="var(--color-text-muted)" mt={3} mb={2}>
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
                        <FormSection title="Diagnosis & Recommendations">
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
                    </Grid>
                </Grid>

                {/* Save Button */}
                {isEditing && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Save />}
                            onClick={handleSave}
                            sx={{
                                bgcolor: "var(--color-primary)",
                                textTransform: "none",
                                fontWeight: 600,
                                px: 6,
                                py: 1.5,
                                borderRadius: 3,
                                "&:hover": {
                                    bgcolor: "var(--color-primary-dark)",
                                },
                            }}
                        >
                            Save Examination Record
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

// Reusable Form Section Component
function FormSection({ title, children }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                border: "2px solid var(--color-primary-light)",
                bgcolor: "white",
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight={700} color="var(--color-primary-dark)">
                    {title}
                </Typography>
            </Stack>
            {children}
        </Paper>
    );
}

export default ExaminationRecordsFormView;