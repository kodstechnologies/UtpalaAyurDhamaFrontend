// // src/pages/patient/consultations/View.jsx
// import React, { useState } from "react";
// import {
//     Box,
//     Typography,
//     Paper,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     TextField,
//     InputAdornment,
//     Button,
//     Chip,
//     Stack,
//     TablePagination,
//     Grid,
//     Divider,
//     Card,
//     List,
//     ListItem,
//     ListItemText,
//     ListItemIcon,
//     IconButton,
//     Avatar,                     // ← FIXED: Avatar imported
// } from "@mui/material";
// import {
//     Search,
//     CalendarToday,
//     Visibility,
//     Person,
//     Healing,
//     Notes,
//     LocalHospital,
//     ArrowBack,
//     Print,
//     Download,
// } from "@mui/icons-material";

// const Consultations_View = () => {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [page, setPage] = useState(0);
//     const [selectedConsultation, setSelectedConsultation] = useState(null);
//     const rowsPerPage = 5;

//     // 15+ Rich & Realistic Consultations
//     const consultations = [
//         { id: 1, consultationId: "con-001", patientName: "Self", doctor: "Dr. Priya Singh", date: "May 20, 2024", chiefComplaint: "Persistent cough and cold for over a week.", followUp: { date: "Jun 5, 2024", scheduled: true }, details: { patientFull: "Rajesh Sharma (Self)", age: 42, gender: "Male", doctorSpecialty: "Ayurvedic Physician & Panchakarma Specialist", chiefComplaintFull: "Persistent cough and cold for over a week with mild fever", history: "Symptoms started 8 days ago after exposure to cold weather. No known allergies.", diagnosis: "Kapha imbalance with respiratory congestion (Pratishyaya)", medicines: [{ name: "Sitopaladi Churna", dosage: "1 tsp with honey", frequency: "3 times daily", duration: "7 days" }, { name: "Talisadi Churna", dosage: "½ tsp", frequency: "with warm water after meals", duration: "7 days" }, { name: "Laxmi Vilas Ras", dosage: "1 tablet", frequency: "twice daily", duration: "5 days" }], therapies: ["Steam inhalation with Tulsi & Eucalyptus", "Nasya therapy recommended"], diet: "Avoid cold drinks, curd, banana • Prefer warm soups, ginger tea", notes: "Patient advised rest and steam inhalation 2× daily. Responded well.", followUpDate: "Jun 5, 2024" } },
//         { id: 2, consultationId: "con-002", patientName: "Rohan Sharma", doctor: "Dr. Anjali Verma", date: "Apr 15, 2024", chiefComplaint: "General check-up and mild digestion issues.", followUp: { date: null, scheduled: false }, details: { patientFull: "Rohan Sharma (Son)", age: 12, gender: "Male", doctorSpecialty: "Pediatric Ayurveda Specialist", chiefComplaintFull: "Mild abdominal discomfort and occasional loose stools.", history: "No fever, no vomiting. Appetite reduced for last 3 days.", diagnosis: "Mild Agnimandya (low digestive fire)", medicines: [{ name: "Dadimadi Churna", dosage: "½ tsp", frequency: "twice daily with warm water", duration: "10 days" }, { name: "Kutaja Ghana Vati", dosage: "1 tablet", frequency: "twice daily", duration: "5 days" }], therapies: ["Light abdominal massage with sesame oil"], diet: "Rice water, pomegranate juice, light khichdi", notes: "Dietary changes advised. Follow-up only if symptoms persist.", followUpDate: "None" } },
//         { id: 3, consultationId: "con-003", patientName: "Self", doctor: "Dr. Priya Singh", date: "Mar 10, 2024", chiefComplaint: "Follow-up on chronic knee pain.", followUp: { date: "Apr 10, 2024", scheduled: true }, details: { patientFull: "Rajesh Sharma (Self)", age: 42, gender: "Male", doctorSpecialty: "Ayurvedic Physician & Panchakarma Specialist", chiefComplaintFull: "Chronic bilateral knee pain, worse on climbing stairs.", history: "Pain since 2 years, aggravated in winter. X-ray shows mild OA changes.", diagnosis: "Sandhigata Vata (Osteoarthritis)", medicines: [{ name: "Yogaraj Guggulu", dosage: "2 tablets", frequency: "twice daily after food", duration: "30 days" }, { name: "Maharasnadi Kwath", dosage: "20 ml", frequency: "twice daily with equal water", duration: "30 days" }, { name: "Dashmoola Oil", dosage: "Local application", frequency: "twice daily", duration: "ongoing" }], therapies: ["Janu Basti (7 days) planned next visit"], diet: "Avoid sour, cold food • Include sesame oil, garlic, dry ginger", notes: "Weight reduction advised. Pain reduced 40% since last visit.", followUpDate: "Apr 10, 2024" } },
//         { id: 4, consultationId: "con-004", patientName: "Priya Sharma", doctor: "Dr. Rohan Sharma", date: "Jun 18, 2024", chiefComplaint: "Severe headache and nausea.", followUp: { date: "Jul 1, 2024", scheduled: true }, details: { patientFull: "Priya Sharma (Spouse)", age: 38, gender: "Female", doctorSpecialty: "Neurology & Ayurveda", chiefComplaintFull: "Severe headache with nausea and photophobia for 2 days.", history: "History of migraine. Triggers – stress & lack of sleep.", diagnosis: "Ardhavabhedaka (Migraine)", medicines: [{ name: "Shirashooladi Vajra Ras", dosage: "1 tablet", frequency: "twice daily", duration: "5 days" }, { name: "Pathyadi Kwath", dosage: "20 ml", frequency: "twice daily", duration: "15 days" }], therapies: ["Shirodhara recommended"], diet: "Avoid cheese, chocolate, caffeine", notes: "Referred to neurologist for MRI if not relieved in 48 hrs.", followUpDate: "Jul 1, 2024" } },
//         { id: 5, consultationId: "con-005", patientName: "Self", doctor: "Dr. Anjali Verma", date: "Feb 1, 2024", chiefComplaint: "Annual physical examination.", followUp: { date: null, scheduled: false }, details: { patientFull: "Rajesh Sharma (Self)", age: 42, gender: "Male", doctorSpecialty: "General Ayurveda", chiefComplaintFull: "Routine annual health check-up.", history: "No complaints. Regular exercise and vegetarian diet.", diagnosis: "Healthy – Prakriti: Vata-Pitta", medicines: [], therapies: [], diet: "Continue current balanced diet", notes: "All vitals normal. Suggested yearly detoxification (Panchakarma) in spring.", followUpDate: "None" } },
//         { id: 6, consultationId: "con-006", patientName: "Aarav Sharma", doctor: "Dr. Neha Gupta", date: "Jan 20, 2024", chiefComplaint: "Recurrent cold and low immunity", followUp: { date: "Feb 15, 2024", scheduled: true }, details: { patientFull: "Aarav Sharma (Son)", age: 12, gender: "Male", doctorSpecialty: "Pediatric Ayurveda", chiefComplaintFull: "Frequent colds, cough, reduced appetite", history: "3 episodes in last 2 months. Poor appetite.", diagnosis: "Low immunity with recurrent respiratory infections", medicines: [{ name: "Sitopaladi Churna", dosage: "½ tsp", frequency: "twice daily", duration: "15 days" }, { name: "Chyawanprash", dosage: "1 tsp", frequency: "morning", duration: "ongoing" }], therapies: ["Immune-boosting Nasya"], diet: "Warm milk, fruits, avoid cold drinks", notes: "School stress noted. Immunity building advised.", followUpDate: "Feb 15, 2024" } },
//         { id: 7, consultationId: "con-007", patientName: "Priya Sharma", doctor: "Dr. Rohan Sharma", date: "Dec 10, 2024", chiefComplaint: "Irregular periods and fatigue", followUp: { date: "Jan 10, 2025", scheduled: true }, details: { patientFull: "Priya Sharma", age: 38, gender: "Female", doctorSpecialty: "Women's Health & Ayurveda", chiefComplaintFull: "Irregular cycles, fatigue, mood swings", history: "Cycles every 35-45 days. PCOD diagnosed 2 years ago.", diagnosis: "Artava Kshaya with PCOD", medicines: [{ name: "Ashokarishta", dosage: "20 ml", frequency: "twice daily after food", duration: "3 months" }, { name: "Kanchanar Guggulu", dosage: "2 tablets", frequency: "twice daily", duration: "3 months" }], therapies: ["Uttara Basti planned"], diet: "Include sesame seeds, flax seeds, avoid junk", notes: "Weight management and yoga advised.", followUpDate: "Jan 10, 2025" } },
//         { id: 8, consultationId: "con-008", patientName: "Self", doctor: "Dr. Vikram Rao", date: "Nov 5, 2024", chiefComplaint: "Lower back pain", followUp: { date: "Dec 5, 2024", scheduled: true }, details: { patientFull: "Rajesh Sharma (Self)", age: 42, gender: "Male", doctorSpecialty: "Orthopedics & Ayurveda", chiefComplaintFull: "Chronic lower back pain for 6 months", history: "Pain increases after sitting long hours at desk job.", diagnosis: "Kati Shoola (Lumbar spondylosis)", medicines: [{ name: "Trayodashang Guggulu", dosage: "2 tablets", frequency: "twice daily", duration: "45 days" }, { name: "Ksheerbala Oil", dosage: "Local application", frequency: "night", duration: "ongoing" }], therapies: ["Kati Basti recommended"], diet: "Avoid forward bending, heavy lifting", notes: "Posture correction and yoga advised.", followUpDate: "Dec 5, 2024" } },
//         // Add more realistic ones...
//     ];

//     const filtered = consultations.filter((c) =>
//         c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         c.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         c.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const displayed = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

//     const handleView = (consultation) => setSelectedConsultation(consultation);
//     const handleBack = () => setSelectedConsultation(null);

//     // DETAIL VIEW
//     if (selectedConsultation) {
//         const d = selectedConsultation.details;

//         return (
//             <Box sx={{ minHeight: "100vh", bgcolor: "#EFE7DA", p: { xs: 2, md: 4 } }}>
//                 <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ color: "#5C3D2E", fontWeight: 600, mb: 4 }}>
//                     Back to Consultations
//                 </Button>

//                 <Typography variant="h4" sx={{ fontWeight: 800, color: "#5C3D2E", mb: 2 }}>
//                     Consultation Details
//                 </Typography>
//                 <Typography variant="h6" color="#857466" mb={5}>
//                     ID: {selectedConsultation.consultationId} • {selectedConsultation.date}
//                 </Typography>

//                 <Grid container spacing={5}>
//                     <Grid item xs={12} lg={8}>
//                         <Card sx={{ borderRadius: 5, border: "2px solid #D6D2C4", p: 5, mb: 5 }}>
//                             <Grid container spacing={6}>
//                                 <Grid item xs={12} sm={6}>
//                                     <Stack direction="row" spacing={4} alignItems="center">
//                                         <Avatar sx={{ width: 80, height: 80, bgcolor: "#F2E8C6" }}>
//                                             <Person sx={{ fontSize: 40, color: "#5C3D2E" }} />
//                                         </Avatar>
//                                         <Box>
//                                             <Typography fontWeight={800} fontSize="1.5rem" color="#5C3D2E">{d.patientFull}</Typography>
//                                             <Typography color="#857466" fontSize="1.2rem">
//                                                 {d.age} years • {d.gender}
//                                             </Typography>
//                                         </Box>
//                                     </Stack>
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                     <Stack direction="row" spacing={4} alignItems="center">
//                                         <Avatar sx={{ width: 80, height: 80, bgcolor: "#9CAF88" }}>
//                                             <LocalHospital sx={{ fontSize: 40, color: "#5C3D2E" }} />
//                                         </Avatar>
//                                         <Box>
//                                             <Typography fontWeight={800} fontSize="1.5rem" color="#5C3D2E">
//                                                 {selectedConsultation.doctor}
//                                             </Typography>
//                                             <Typography color="#857466" fontSize="1.2rem">
//                                                 {d.doctorSpecialty}
//                                             </Typography>
//                                         </Box>
//                                     </Stack>
//                                 </Grid>
//                             </Grid>
//                         </Card>

//                         <Card sx={{ borderRadius: 5, p: 6, border: "2px solid #D6D2C4", mb: 5 }}>
//                             <Typography variant="h5" fontWeight={800} mb={4} color="#5C3D2E">
//                                 Diagnosis & History
//                             </Typography>
//                             <Divider sx={{ mb: 4, borderColor: "#D6D2C4" }} />
//                             <Typography paragraph sx={{ fontSize: "1.15rem", lineHeight: 1.8 }}>
//                                 <strong>Chief Complaint:</strong> {d.chiefComplaintFull}
//                             </Typography>
//                             <Typography paragraph sx={{ fontSize: "1.15rem", lineHeight: 1.8 }}>
//                                 <strong>History:</strong> {d.history}
//                             </Typography>
//                             <Typography sx={{ fontSize: "1.15rem" }}>
//                                 <strong>Diagnosis:</strong>{" "}
//                                 <Chip label={d.diagnosis} sx={{ bgcolor: "#5C3D2E", color: "white", fontWeight: 700, fontSize: "1rem" }} />
//                             </Typography>
//                         </Card>

//                         {d.medicines?.length > 0 && (
//                             <Card sx={{ borderRadius: 5, p: 6, border: "2px solid #D6D2C4" }}>
//                                 <Typography variant="h5" fontWeight={800} mb={4} color="#5C3D2E">
//                                     Prescribed Medicines
//                                 </Typography>
//                                 <Divider sx={{ mb: 4, borderColor: "#D6D2C4" }} />
//                                 <TableContainer>
//                                     <Table>
//                                         <TableHead>
//                                             <TableRow sx={{ bgcolor: "#F4F0E5" }}>
//                                                 <TableCell sx={{ fontWeight: 700, color: "#5C3D2E" }}>Medicine</TableCell>
//                                                 <TableCell sx={{ fontWeight: 700, color: "#5C3D2E" }}>Dosage</TableCell>
//                                                 <TableCell sx={{ fontWeight: 700, color: "#5C3D2E" }}>Frequency</TableCell>
//                                                 <TableCell sx={{ fontWeight: 700, color: "#5C3D2E" }}>Duration</TableCell>
//                                             </TableRow>
//                                         </TableHead>
//                                         <TableBody>
//                                             {d.medicines.map((m, i) => (
//                                                 <TableRow key={i} sx={{ "&:hover": { bgcolor: "#FDFBF7" } }}>
//                                                     <TableCell sx={{ fontWeight: 600, fontSize: "1.1rem" }}>{m.name}</TableCell>
//                                                     <TableCell>{m.dosage}</TableCell>
//                                                     <TableCell>{m.frequency}</TableCell>
//                                                     <TableCell>{m.duration}</TableCell>
//                                                 </TableRow>
//                                             ))}
//                                         </TableBody>
//                                     </Table>
//                                 </TableContainer>
//                             </Card>
//                         )}
//                     </Grid>

//                     <Grid item xs={12} lg={4}>
//                         <Card sx={{ borderRadius: 5, p: 6, border: "2px solid #D6D2C4", height: "fit-content" }}>
//                             <Typography variant="h5" fontWeight={800} mb={4} color="#5C3D2E">Summary</Typography>
//                             <List>
//                                 <ListItem>
//                                     <ListItemIcon><CalendarToday sx={{ color: "#5C3D2E" }} /></ListItemIcon>
//                                     <ListItemText primary="Next Follow-up" secondary={d.followUpDate || "None scheduled"} />
//                                 </ListItem>
//                                 {d.therapies?.length > 0 && (
//                                     <ListItem>
//                                         <ListItemIcon><Healing sx={{ color: "#6A8E3F" }} /></ListItemIcon>
//                                         <ListItemText primary="Therapies" secondary={d.therapies.join(" • ")} />
//                                     </ListItem>
//                                 )}
//                                 <ListItem>
//                                     <ListItemIcon><Notes sx={{ color: "#5C3D2E" }} /></ListItemIcon>
//                                     <ListItemText primary="Doctor's Notes" secondary={d.notes} />
//                                 </ListItem>
//                             </List>
//                             <Divider sx={{ my: 4, borderColor: "#D6D2C4" }} />
//                             <Typography variant="h6" fontWeight={700} mb={3} color="#5C3D2E">Diet & Lifestyle</Typography>
//                             <Paper sx={{ p: 4, bgcolor: "#F8FFF8", borderRadius: 4 }}>
//                                 <Typography fontSize="1.1rem">{d.diet}</Typography>
//                             </Paper>
//                         </Card>

//                         <Stack direction="row" spacing={3} mt={5}>
//                             <Button fullWidth size="large" variant="outlined" startIcon={<Print />}>
//                                 Print
//                             </Button>
//                             <Button
//                                 fullWidth
//                                 size="large"
//                                 variant="contained"
//                                 startIcon={<Download />}
//                                 sx={{ bgcolor: "#5C3D2E", "&:hover": { bgcolor: "#4A3025" } }}
//                             >
//                                 Download PDF
//                             </Button>
//                         </Stack>
//                     </Grid>
//                 </Grid>

//                 <Typography variant="body2" align="center" color="#857466" sx={{ mt: 12, pb: 6 }}>
//                     © 2025 Utpala Ayurveda. All rights reserved.
//                 </Typography>
//             </Box>
//         );
//     }

//     // LIST VIEW
//     return (
//         <Box sx={{ minHeight: "100vh", bgcolor: "#EFE7DA", p: { xs: 2, md: 4 } }}>
//             <Box sx={{ mb: 6 }}>
//                 <Typography variant="h4" sx={{ fontWeight: 800, color: "#5C3D2E", mb: 3 }}>
//                     My Consultations
//                 </Typography>
//                 <TextField
//                     fullWidth
//                     placeholder="Search consultations..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     sx={{
//                         maxWidth: 600,
//                         "& .MuiOutlinedInput-root": {
//                             borderRadius: 4,
//                             bgcolor: "white",
//                             border: "2px solid #D6D2C4",
//                         },
//                     }}
//                     InputProps={{
//                         startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
//                     }}
//                 />
//             </Box>

//             <Paper sx={{ borderRadius: 5, overflow: "hidden", boxShadow: "0 15px 40px rgba(92, 61, 46, 0.15)", border: "2px solid #D6D2C4" }}>
//                 <TableContainer>
//                     <Table>
//                         <TableHead>
//                             <TableRow sx={{ bgcolor: "#F4F0E5" }}>
//                                 {["PATIENT NAME", "ID", "DOCTOR", "DATE", "CHIEF COMPLAINT", "FOLLOW-UP", "ACTIONS"].map((h) => (
//                                     <TableCell key={h} sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#5C3D2E", py: 3 }}>
//                                         {h}
//                                     </TableCell>
//                                 ))}
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {displayed.map((row) => (
//                                 <TableRow key={row.id} hover sx={{ "&:hover": { bgcolor: "#FDFBF7" } }}>
//                                     <TableCell><Typography fontWeight={700} fontSize="1.1rem" color="#5C3D2E">{row.patientName}</Typography></TableCell>
//                                     <TableCell>
//                                         <Chip label={row.consultationId} sx={{ bgcolor: "#5C3D2E", color: "white", fontWeight: 700 }} />
//                                     </TableCell>
//                                     <TableCell><Typography fontWeight={600}>{row.doctor}</Typography></TableCell>
//                                     <TableCell>{row.date}</TableCell>
//                                     <TableCell>
//                                         <Typography sx={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                             {row.chiefComplaint}
//                                         </Typography>
//                                     </TableCell>
//                                     <TableCell>
//                                         {row.followUp.scheduled ? (
//                                             <Chip icon={<CalendarToday fontSize="small" />} label={row.followUp.date} sx={{ bgcolor: "#E8A84E", color: "white" }} />
//                                         ) : (
//                                             <Typography color="#857466" fontStyle="italic">None Scheduled</Typography>
//                                         )}
//                                     </TableCell>
//                                     <TableCell>
//                                         <IconButton
//                                             onClick={() => handleView(row)}
//                                             sx={{
//                                                 bgcolor: "#5C3D2E",
//                                                 color: "white",
//                                                 "&:hover": { bgcolor: "#4A3025" },
//                                             }}
//                                         >
//                                             <Visibility />
//                                         </IconButton>

//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>

//                 <Box sx={{ p: 4, bgcolor: "#FDFBF7", borderTop: "2px solid #D6D2C4" }}>
//                     <Stack direction="row" justifyContent="space-between" alignItems="center">
//                         <Typography color="#857466" fontWeight={600}>
//                             Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filtered.length)} of {filtered.length} results
//                         </Typography>
//                         <TablePagination
//                             component="div"
//                             count={filtered.length}
//                             page={page}
//                             onPageChange={(_, p) => setPage(p)}
//                             rowsPerPage={rowsPerPage}
//                             rowsPerPageOptions={[5]}
//                         />
//                     </Stack>
//                 </Box>
//             </Paper>

//             <Typography variant="body2" align="center" color="#857466" sx={{ mt: 12, pb: 6 }}>
//                 © 2025 Utpala Ayurveda. All rights reserved.
//             </Typography>
//         </Box>
//     );
// };

import React from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";

function Consultations_View() {
    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "patientId", header: "ID" },
        { field: "doctor", header: "Doctor" },
        { field: "date", header: "Date" },
        { field: "complaint", header: "Chief Complaint" },
        { field: "followup", header: "Follow-up" },
    ];

    const rows = [
        {
            _id: 1,
            patientName: "Riya",
            patientId: "P001",
            doctor: "Dr. Kumar",
            date: "2025-12-12",
            complaint: "Persistent cough and cold for over a week.",
            followup: "Jun 5, 2024",
        },
        {
            _id: 2,
            patientName: "Arjun",
            patientId: "P002",
            doctor: "Dr. Anjali",
            date: "2025-12-10",
            complaint: "Severe headache and nausea. ",
            followup: "None Scheduled",
        },
    ];

    return (
        <div style={{ paddingBottom: 30 }}>
            <HeadingCard
                title="My Consultations"
                subtitle="Review your past and upcoming consultations along with follow-up details."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Consultations" }
                ]}
            />

            <TableComponent
                title="My Consultations"

                /* Table Data */
                columns={columns}
                rows={rows}

                /* Actions disabled */
                showEdit={false}
                showDelete={false}

                /* Only View button enabled */
                showView={true}

                /* Disable Add Button */
                showAddButton={false}

                /* Disable Export button */
                showExportButton={false}
            />
        </div>
    );
}

export default Consultations_View;
