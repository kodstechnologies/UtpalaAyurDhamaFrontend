
// import React, { useState } from "react";
// import {
//     Box,
//     Typography,
//     Paper,
//     Stack,
//     Chip,
//     Button,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     IconButton,
//     Divider,
//     Grid,
//     Card,
//     Avatar,                    // ← THIS WAS MISSING! NOW FIXED
// } from "@mui/material";
// import {
//     Description,
//     Close,
//     Print,
//     Download,
//     Visibility,
//     PictureAsPdf,
//     Assignment,
// } from "@mui/icons-material";

// const Reports_View = () => {
//     const [open, setOpen] = useState(false);
//     const [selectedReport, setSelectedReport] = useState(null);

//     const reports = [
//         {
//             id: 1,
//             type: "Prescription Invoice",
//             badge: "Invoice",
//             badgeColor: "#F2E8C6",
//             icon: <Assignment />,
//             doctor: "Dr. Anjali D",
//             consultationDate: "Nov 25, 2025",
//             uploadedDate: "Nov 25, 2025",
//             details: {
//                 title: "Prescription Invoice",
//                 patient: "Sharavni",
//                 age: 28,
//                 gender: "Female",
//                 doctor: "Dr. Anjali D",
//                 date: "November 25, 2025",
//                 medicines: [
//                     { name: "Sitopaladi Churna", dosage: "1 tsp twice daily", duration: "7 days" },
//                     { name: "Talisadi Churna", dosage: "½ tsp with honey", duration: "7 days" },
//                 ],
//                 totalAmount: "₹ 1,250",
//                 note: "Please take medicines after food. Avoid cold items.",
//             },
//         },
//         {
//             id: 2,
//             type: "Examination Report",
//             badge: "Examination",
//             badgeColor: "#e8f5e9",
//             icon: <Description />,
//             doctor: "Dr. Anjali D",
//             consultationDate: "Nov 25, 2025",
//             uploadedDate: "Nov 25, 2025",
//         },
//         {
//             id: 3,
//             type: "Invoice",
//             badge: "Invoice",
//             badgeColor: "#F2E8C6",
//             icon: <Assignment />,
//             doctor: "Dr. Anjali D",
//             consultationDate: "Nov 24, 2025",
//             uploadedDate: "Nov 24, 2025",
//         },
//         {
//             id: 4,
//             type: "Examination Report",
//             badge: "Examination",
//             badgeColor: "#e8f5e9",
//             icon: <Description />,
//             doctor: "Dr. Anjali D",
//             consultationDate: "Nov 24, 2025",
//             uploadedDate: "Nov 24, 2025",
//         },
//     ];

//     const handleView = (report) => {
//         setSelectedReport(report);
//         setOpen(true);
//     };

//     const handleClose = () => {
//         setOpen(false);
//         setSelectedReport(null);
//     };

//     return (
//         <Box sx={{ minHeight: "100vh", bgcolor: "#EFE7DA", p: { xs: 2, md: 4 } }}>
//             {/* Header */}
//             <Typography variant="h4" sx={{ fontWeight: 800, color: "#5C3D2E", mb: 6 }}>
//                 Reports & Investigations
//             </Typography>

//             {/* Reports List */}
//             <Stack spacing={4}>
//                 {reports.map((report) => (
//                     <Card
//                         key={report.id}
//                         sx={{
//                             borderRadius: 5,
//                             border: "2px solid #D6D2C4",
//                             boxShadow: "0 10px 30px rgba(92, 61, 46, 0.12)",
//                             transition: "all 0.3s ease",
//                             "&:hover": {
//                                 boxShadow: "0 20px 50px rgba(92, 61, 46, 0.18)",
//                                 transform: "translateY(-6px)",
//                                 borderColor: "#F2E8C6",
//                             },
//                         }}
//                     >
//                         <Box sx={{ p: 4 }}>
//                             <Grid container alignItems="center" spacing={4}>
//                                 <Grid item>
//                                     <Avatar
//                                         sx={{
//                                             width: 70,
//                                             height: 70,
//                                             bgcolor: report.badgeColor,
//                                             color: "#5C3D2E",
//                                             boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
//                                         }}
//                                     >
//                                         {report.icon}
//                                     </Avatar>
//                                 </Grid>

//                                 <Grid item xs>
//                                     <Stack direction="row" alignItems="center" spacing={3} flexWrap="wrap">
//                                         <Typography variant="h5" sx={{ fontWeight: 800, color: "#5C3D2E" }}>
//                                             {report.type}
//                                         </Typography>
//                                         <Chip
//                                             label={report.badge}
//                                             sx={{
//                                                 bgcolor: report.badgeColor,
//                                                 color: "#5C3D2E",
//                                                 fontWeight: 700,
//                                                 fontSize: "1rem",
//                                             }}
//                                         />
//                                     </Stack>
//                                     <Typography variant="body1" color="#857466" sx={{ mt: 1, fontWeight: 500 }}>
//                                         {report.doctor} • Consultation: {report.consultationDate} • Uploaded: {report.uploadedDate}
//                                     </Typography>
//                                 </Grid>

//                                 <Grid item>
//                                     <Button
//                                         variant="contained"
//                                         size="large"
//                                         startIcon={<Visibility />}
//                                         onClick={() => handleView(report)}
//                                         sx={{
//                                             bgcolor: "#5C3D2E",
//                                             color: "white",
//                                             fontWeight: 700,
//                                             px: 5,
//                                             py: 2,
//                                             borderRadius: 4,
//                                             boxShadow: "0 10px 30px rgba(92, 61, 46, 0.4)",
//                                             "&:hover": { bgcolor: "#4A3025" },
//                                         }}
//                                     >
//                                         View
//                                     </Button>
//                                 </Grid>
//                             </Grid>
//                         </Box>
//                     </Card>
//                 ))}
//             </Stack>

//             {/* Detail Modal */}
//             <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
//                 {selectedReport && selectedReport.details ? (
//                     <>
//                         <DialogTitle sx={{ bgcolor: "#5C3D2E", color: "white", py: 5 }}>
//                             <Stack direction="row" justifyContent="space-between" alignItems="center">
//                                 <Stack direction="row" spacing={4} alignItems="center">
//                                     <PictureAsPdf sx={{ fontSize: 50 }} />
//                                     <Box>
//                                         <Typography variant="h4" fontWeight={800}>
//                                             {selectedReport.details.title}
//                                         </Typography>
//                                         <Typography variant="h6" sx={{ opacity: 0.9 }}>
//                                             {selectedReport.details.date}
//                                         </Typography>
//                                     </Box>
//                                 </Stack>
//                                 <IconButton onClick={handleClose} sx={{ color: "white" }}>
//                                     <Close />
//                                 </IconButton>
//                             </Stack>
//                         </DialogTitle>

//                         <DialogContent sx={{ pt: 6 }}>
//                             <Grid container spacing={5} mb={5}>
//                                 <Grid item xs={12} sm={6}>
//                                     <Typography fontSize="1.1rem" color="#857466">Patient</Typography>
//                                     <Typography variant="h5" fontWeight={800} color="#5C3D2E">
//                                         {selectedReport.details.patient}
//                                     </Typography>
//                                     <Typography fontSize="1.2rem" color="#857466">
//                                         {selectedReport.details.age} years • {selectedReport.details.gender}
//                                     </Typography>
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                     <Typography fontSize="1.1rem" color="#857466">Doctor</Typography>
//                                     <Typography variant="h5" fontWeight={800} color="#5C3D2E">
//                                         {selectedReport.details.doctor}
//                                     </Typography>
//                                 </Grid>
//                             </Grid>

//                             <Divider sx={{ my: 5, borderColor: "#D6D2C4" }} />

//                             <Typography variant="h5" fontWeight={800} mb={4} color="#5C3D2E">
//                                 Prescribed Medicines
//                             </Typography>
//                             {selectedReport.details.medicines.map((med, i) => (
//                                 <Card key={i} sx={{ mb: 4, p: 4, borderRadius: 4, border: "2px solid #F4F0E5", bgcolor: "#FDFBF7" }}>
//                                     <Grid container spacing={4}>
//                                         <Grid item xs={12} sm={5}>
//                                             <Typography variant="h6" fontWeight={800} color="#5C3D2E">{med.name}</Typography>
//                                         </Grid>
//                                         <Grid item xs={12} sm={7}>
//                                             <Typography><strong>Dosage:</strong> {med.dosage}</Typography>
//                                             <Typography><strong>Duration:</strong> {med.duration}</Typography>
//                                         </Grid>
//                                     </Grid>
//                                 </Card>
//                             ))}

//                             <Divider sx={{ my: 5, borderColor: "#D6D2C4" }} />

//                             <Grid container spacing={5}>
//                                 <Grid item xs={12} sm={6}>
//                                     <Typography fontSize="1.1rem" color="#857466">Total Amount</Typography>
//                                     <Typography variant="h4" fontWeight={900} color="#5C3D2E">
//                                         {selectedReport.details.totalAmount}
//                                     </Typography>
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                     <Typography fontSize="1.1rem" color="#857466">Note</Typography>
//                                     <Typography fontSize="1.2rem" color="#5C3D2E">
//                                         {selectedReport.details.note}
//                                     </Typography>
//                                 </Grid>
//                             </Grid>

//                             <Stack direction={{ xs: "column", sm: "row" }} spacing={3} mt={8}>
//                                 <Button fullWidth size="large" variant="outlined" startIcon={<Print />}>
//                                     Print
//                                 </Button>
//                                 <Button
//                                     fullWidth
//                                     size="large"
//                                     variant="contained"
//                                     startIcon={<Download />}
//                                     sx={{
//                                         bgcolor: "#5C3D2E",
//                                         "&:hover": { bgcolor: "#4A3025" },
//                                     }}
//                                 >
//                                     Download PDF
//                                 </Button>
//                             </Stack>
//                         </DialogContent>
//                     </>
//                 ) : (
//                     <>
//                         <DialogTitle sx={{ bgcolor: "#5C3D2E", color: "white", py: 5 }}>
//                             <Stack direction="row" justifyContent="space-between" alignItems="center">
//                                 <Typography variant="h5" fontWeight={800}>Report Preview</Typography>
//                                 <IconButton onClick={handleClose} sx={{ color: "white" }}>
//                                     <Close />
//                                 </IconButton>
//                             </Stack>
//                         </DialogTitle>
//                         <DialogContent sx={{ pt: 6 }}>
//                             <Box
//                                 sx={{
//                                     height: 600,
//                                     bgcolor: "#FDFBF7",
//                                     borderRadius: 4,
//                                     border: "3px dashed #D6D2C4",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     flexDirection: "column",
//                                 }}
//                             >
//                                 <PictureAsPdf sx={{ fontSize: 100, color: "#5C3D2E", opacity: 0.6, mb: 3 }} />
//                                 <Typography variant="h5" color="#5C3D2E" fontWeight={700}>
//                                     {selectedReport?.type}
//                                 </Typography>
//                                 <Typography color="#857466" mt={1}>
//                                     Uploaded on {selectedReport?.uploadedDate}
//                                 </Typography>
//                             </Box>

//                             <Stack direction="row" spacing={3} mt={6}>
//                                 <Button fullWidth size="large" variant="outlined" startIcon={<Print />}>
//                                     Print
//                                 </Button>
//                                 <Button
//                                     fullWidth
//                                     size="large"
//                                     variant="contained"
//                                     startIcon={<Download />}
//                                     sx={{ bgcolor: "#5C3D2E", "&:hover": { bgcolor: "#4A3025" } }}
//                                 >
//                                     Download
//                                 </Button>
//                             </Stack>
//                         </DialogContent>
//                     </>
//                 )}
//             </Dialog>

//             <Typography variant="body2" align="center" color="#857466" sx={{ mt: 12, pb: 6, fontSize: "1.1rem" }}>
//                 © 2025 Utpala Ayurveda – All rights reserved.
//             </Typography>
//         </Box>
//     );
// };

// export default Reports_View;

import React from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import ReportCard from "../../../components/card/patientCard/ReportCard";

function Reports_View() {
    const reports = [
        {
            id: 1,
            title: "Prescription Invoice",
            badge: "Invoice",
            doctor: "Dr. Anajali D",
            consultationDate: "Nov 25, 2025",
            uploadedDate: "Nov 25, 2025",
        },
        {
            id: 2,
            title: "Blood Test Report",
            badge: "Lab Report",
            doctor: "Dr. Shyam Kumar",
            consultationDate: "Nov 18, 2025",
            uploadedDate: "Nov 19, 2025",
        },
        {
            id: 3,
            title: "X-Ray Chest Report",
            badge: "Radiology",
            doctor: "Dr. Priya R",
            consultationDate: "Nov 12, 2025",
            uploadedDate: "Nov 12, 2025",
        },
        {
            id: 4,
            title: "General Health Summary",
            badge: "Summary",
            doctor: "Dr. Arvind N",
            consultationDate: "Oct 30, 2025",
            uploadedDate: "Oct 30, 2025",
        }
    ];

    return (
        <div style={{ paddingBottom: 30 }}>
            <HeadingCard
                title="My Medical Reports"
                subtitle="Access and review your diagnostic test results, clinical summaries, and past medical documents all in one place. Stay informed and track your health history effortlessly."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Medical Reports" }
                ]}
            />

            {/* Reports List */}
            <div style={{ marginTop: 20 }}>
                {reports.map(report => (
                    <ReportCard
                        key={report.id}
                        title={report.title}
                        badge={report.badge}
                        doctor={report.doctor}
                        consultationDate={report.consultationDate}
                        uploadedDate={report.uploadedDate}
                        onView={() => console.log("Viewing report:", report.id)}
                    />
                ))}
            </div>
        </div>
    );
}

export default Reports_View;

