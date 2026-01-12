// import React from "react";
// import { Box, Typography, Button } from "@mui/material";
// import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"; // icon

// function ReportCard({
//     title = "Prescription Invoice",
//     badge = "Invoice",
//     doctor = "Dr. Anajali D",
//     consultationDate = "Nov 25, 2025",
//     uploadedDate = "Nov 25, 2025",
//     onView = () => { },
// }) {
//     return (
//         <Box
//             sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 p: 2.5,
//                 borderRadius: 3,
//                 bgcolor: "var(--color-bg-card)",
//                 boxShadow: "var(--shadow-soft)",
//                 border: "1px solid var(--color-border)",
//                 mb: 2,
//             }}
//         >
//             {/* LEFT SECTION */}
//             <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                 {/* ICON */}
//                 <Box
//                     sx={{
//                         width: 55,
//                         height: 55,
//                         borderRadius: 2,
//                         bgcolor: "#EEF3FF",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                     }}
//                 >
//                     <DescriptionOutlinedIcon
//                         sx={{ fontSize: 32, color: "var(--color-info)" }}
//                     />
//                 </Box>

//                 {/* TEXTS */}
//                 <Box>
//                     {/* Title + Badge */}
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                         <Typography
//                             variant="h6"
//                             sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}
//                         >
//                             {title}
//                         </Typography>

//                         {/* Badge */}
//                         <Box
//                             sx={{
//                                 px: 1,
//                                 py: 0.3,
//                                 borderRadius: "12px",
//                                 fontSize: "0.7rem",
//                                 bgcolor: "rgba(78, 123, 168, 0.15)",
//                                 color: "var(--color-info)",
//                                 fontWeight: 600,
//                             }}
//                         >
//                             {badge}
//                         </Box>
//                     </Box>

//                     {/* Sub info */}
//                     <Typography
//                         sx={{ color: "var(--color-text-muted)", fontSize: "0.9rem", mt: 0.5 }}
//                     >
//                         {doctor} &nbsp; • &nbsp; Consultation: {consultationDate} &nbsp; •
//                         &nbsp; Uploaded: {uploadedDate}
//                     </Typography>
//                 </Box>
//             </Box>

//             {/* VIEW BUTTON */}
//             <Button
//                 onClick={onView}
//                 variant="outlined"
//                 sx={{
//                     borderColor: "var(--color-success)",
//                     color: "var(--color-success)",
//                     textTransform: "none",
//                     fontWeight: 600,
//                     borderRadius: "10px",
//                     px: 3,
//                     "&:hover": {
//                         background: "rgba(106,142,63,0.08)",
//                         borderColor: "var(--color-success)",
//                     },
//                 }}
//                 startIcon={
//                     <span
//                         style={{
//                             display: "inline-block",
//                             width: 8,
//                             height: 8,
//                             borderRadius: "50%",
//                             background: "var(--color-success)",
//                         }}
//                     />
//                 }
//             >
//                 View
//             </Button>
//         </Box>
//     );
// }

// export default ReportCard;


// import React from "react";
// import { Box, Typography, Button } from "@mui/material";
// import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"; // 👈 Eye Icon Added

// function ReportCard({
//     title = "Prescription Invoice",
//     badge = "Invoice",
//     doctor = "Dr. Anajali D",
//     consultationDate = "Nov 25, 2025",
//     uploadedDate = "Nov 25, 2025",
//     onView = () => { },
// }) {
//     return (
//         <Box
//             sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 p: 2.5,
//                 borderRadius: 3,
//                 bgcolor: "var(--color-bg-card)",
//                 boxShadow: "var(--shadow-soft)",
//                 border: "1px solid var(--color-border)",
//                 mb: 2,
//             }}
//         >
//             {/* LEFT SECTION */}
//             <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                 {/* ICON */}
//                 <Box
//                     sx={{
//                         width: 55,
//                         height: 55,
//                         borderRadius: 2,
//                         bgcolor: "#EEF3FF",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                     }}
//                 >
//                     <DescriptionOutlinedIcon
//                         sx={{ fontSize: 32, color: "var(--color-info)" }}
//                     />
//                 </Box>

//                 {/* TEXTS */}
//                 <Box>
//                     {/* Title + Badge */}
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                         <Typography
//                             variant="h6"
//                             sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}
//                         >
//                             {title}
//                         </Typography>

//                         {/* Badge */}
//                         <Box
//                             sx={{
//                                 px: 1,
//                                 py: 0.3,
//                                 borderRadius: "12px",
//                                 fontSize: "0.7rem",
//                                 bgcolor: "rgba(78, 123, 168, 0.15)",
//                                 color: "var(--color-info)",
//                                 fontWeight: 600,
//                             }}
//                         >
//                             {badge}
//                         </Box>
//                     </Box>

//                     {/* Sub info */}
//                     <Typography
//                         sx={{ color: "var(--color-text-muted)", fontSize: "0.9rem", mt: 0.5 }}
//                     >
//                         {doctor} &nbsp; • &nbsp; Consultation: {consultationDate} &nbsp; •
//                         &nbsp; Uploaded: {uploadedDate}
//                     </Typography>
//                 </Box>
//             </Box>

//             {/* VIEW BUTTON */}
//             <Button
//                 onClick={onView}
//                 variant="outlined"
//                 sx={{
//                     borderColor: "var(--color-success)",
//                     color: "var(--color-success)",
//                     textTransform: "none",
//                     fontWeight: 600,
//                     borderRadius: "10px",
//                     px: 3,
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 1,
//                     "&:hover": {
//                         background: "rgba(106,142,63,0.08)",
//                         borderColor: "var(--color-success)",
//                     },
//                 }}
//                 startIcon={
//                     <VisibilityOutlinedIcon
//                         sx={{
//                             fontSize: 20,
//                             color: "var(--color-success)",
//                         }}
//                     />
//                 }
//             >
//                 View
//             </Button>
//         </Box>
//     );
// }

// export default ReportCard;

// import React, { useState } from 'react';
// import {
//     Box,
//     Typography,
//     Button,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     IconButton,
//     Card,
//     CardContent,
// } from "@mui/material";
// import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// import CloseIcon from "@mui/icons-material/Close";

// function ReportDetailsCard({
//     title = "Prescription Invoice",
//     badge = "Invoice",
//     doctor = "Dr. Anjali D",
//     consultationDate = "Nov 25, 2025",
//     uploadedDate = "Nov 25, 2025",
//     details = "Sample detailed content for the report. This could include full prescription, invoice breakdown, or lab results here.",
//     onClose = () => { }
// }) {
//     return (
//         <Card sx={{ borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #D6D2C4" }}>
//             <CardContent sx={{ p: 3 }}>
//                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                         <DescriptionOutlinedIcon sx={{ fontSize: 32, color: "#5C3D2E" }} />
//                         <Box>
//                             <Typography variant="h6" sx={{ fontWeight: 600, color: "#5C3D2E" }}>
//                                 {title}
//                             </Typography>
//                             <Box sx={{ px: 1, py: 0.3, borderRadius: "12px", fontSize: "0.7rem", bgcolor: "rgba(92, 61, 46, 0.15)", color: "#5C3D2E", fontWeight: 600 }}>
//                                 {badge}
//                             </Box>
//                         </Box>
//                     </Box>
//                     <IconButton onClick={onClose} sx={{ color: "#857466" }}>
//                         <CloseIcon />
//                     </IconButton>
//                 </Box>
//                 <Typography sx={{ color: "#857466", fontSize: "0.9rem", mb: 2 }}>
//                     Doctor: {doctor} • Consultation: {consultationDate} • Uploaded: {uploadedDate}
//                 </Typography>
//                 <Divider sx={{ mb: 2, borderColor: "#D6D2C4" }} />
//                 <Typography variant="body1" sx={{ lineHeight: 1.6, color: "#5C3D2E" }}>
//                     {details}
//                 </Typography>
//             </CardContent>
//         </Card>
//     );
// }

// function ReportCard({
//     title = "Prescription Invoice",
//     badge = "Invoice",
//     doctor = "Dr. Anjali D",
//     consultationDate = "Nov 25, 2025",
//     uploadedDate = "Nov 25, 2025",
//     details = "Sample detailed content for the report. This could include full prescription, invoice breakdown, or lab results here.",
// }) {
//     const [open, setOpen] = useState(false);

//     const handleView = () => {
//         setOpen(true);
//     };

//     const handleClose = () => {
//         setOpen(false);
//     };

//     return (
//         <>
//             <Box
//                 sx={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     p: 2.5,
//                     borderRadius: 3,
//                     bgcolor: "#FFFFFF",
//                     boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//                     border: "1px solid #D6D2C4",
//                     mb: 2,
//                 }}
//             >
//                 {/* LEFT SECTION */}
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                     {/* ICON */}
//                     <Box
//                         sx={{
//                             width: 55,
//                             height: 55,
//                             borderRadius: 2,
//                             bgcolor: "#EEF3FF",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                         }}
//                     >
//                         <DescriptionOutlinedIcon
//                             sx={{ fontSize: 32, color: "#4E7BA8" }}
//                         />
//                     </Box>

//                     {/* TEXTS */}
//                     <Box>
//                         {/* Title + Badge */}
//                         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                             <Typography
//                                 variant="h6"
//                                 sx={{ fontWeight: 600, color: "#5C3D2E" }}
//                             >
//                                 {title}
//                             </Typography>

//                             {/* Badge */}
//                             <Box
//                                 sx={{
//                                     px: 1,
//                                     py: 0.3,
//                                     borderRadius: "12px",
//                                     fontSize: "0.7rem",
//                                     bgcolor: "rgba(78, 123, 168, 0.15)",
//                                     color: "#4E7BA8",
//                                     fontWeight: 600,
//                                 }}
//                             >
//                                 {badge}
//                             </Box>
//                         </Box>

//                         {/* Sub info */}
//                         <Typography
//                             sx={{ color: "#857466", fontSize: "0.9rem", mt: 0.5 }}
//                         >
//                             {doctor} &nbsp; • &nbsp; Consultation: {consultationDate} &nbsp; •
//                             &nbsp; Uploaded: {uploadedDate}
//                         </Typography>
//                     </Box>
//                 </Box>

//                 {/* VIEW BUTTON */}
//                 <Button
//                     onClick={handleView}
//                     variant="outlined"
//                     sx={{
//                         borderColor: "#6A8E3F",
//                         color: "#6A8E3F",
//                         textTransform: "none",
//                         fontWeight: 600,
//                         borderRadius: "10px",
//                         px: 3,
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 1,
//                         "&:hover": {
//                             background: "rgba(106,142,63,0.08)",
//                             borderColor: "#6A8E3F",
//                         },
//                     }}
//                     startIcon={
//                         <VisibilityOutlinedIcon
//                             sx={{
//                                 fontSize: 20,
//                                 color: "#6A8E3F",
//                             }}
//                         />
//                     }
//                 >
//                     View
//                 </Button>
//             </Box>

//             {/* Details Dialog */}
//             <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
//                 <DialogTitle sx={{ fontWeight: 600, color: "#5C3D2E", pb: 1 }}>
//                     Report Details
//                 </DialogTitle>
//                 <DialogContent sx={{ p: 0 }}>
//                     <ReportDetailsCard
//                         title={title}
//                         badge={badge}
//                         doctor={doctor}
//                         consultationDate={consultationDate}
//                         uploadedDate={uploadedDate}
//                         details={details}
//                         onClose={handleClose}
//                     />
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleClose} sx={{ color: "#857466" }}>
//                         Close
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </>
//     );
// }

// export default ReportCard;

// import React from "react";
// import { Box, Typography, Button } from "@mui/material";
// import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// import { useNavigate } from "react-router-dom";

// function ReportCard({
//     id,
//     title = "Prescription Invoice",
//     badge = "Invoice",
//     doctor = "Dr. Anjali D",
//     consultationDate = "Nov 25, 2025",
//     uploadedDate = "Nov 25, 2025",
//     details = "Full report details will appear here...",
// }) {


//     const handleView = () => {
//         if (onView) {
//             onView({
//                 id,
//                 title,
//                 badge,
//                 doctor,
//                 consultationDate,
//                 uploadedDate,
//                 details,
//             });
//         }
//     };


//     return (
//         <Box
//             sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 p: 2.5,
//                 borderRadius: 3,
//                 bgcolor: "var(--color-bg-card)",
//                 boxShadow: "var(--shadow-soft)",
//                 border: "1px solid var(--color-border)",
//                 mb: 2,
//             }}
//         >
//             {/* LEFT SECTION */}
//             <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                 <Box
//                     sx={{
//                         width: 55,
//                         height: 55,
//                         borderRadius: 2,
//                         bgcolor: "#EEF3FF",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                     }}
//                 >
//                     <DescriptionOutlinedIcon sx={{ fontSize: 32, color: "var(--color-info)" }} />
//                 </Box>

//                 <Box>
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                         <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
//                             {title}
//                         </Typography>

//                         <Box
//                             sx={{
//                                 px: 1,
//                                 py: 0.3,
//                                 borderRadius: "12px",
//                                 fontSize: "0.7rem",
//                                 bgcolor: "rgba(78, 123, 168, 0.15)",
//                                 color: "var(--color-info)",
//                                 fontWeight: 600,
//                             }}
//                         >
//                             {badge}
//                         </Box>
//                     </Box>

//                     <Typography sx={{ color: "var(--color-text-muted)", fontSize: "0.9rem", mt: 0.5 }}>
//                         {doctor} • Consultation: {consultationDate} • Uploaded: {uploadedDate}
//                     </Typography>
//                 </Box>
//             </Box>

//             {/* VIEW BUTTON */}
//             <Button
//                 onClick={handleView}
//                 variant="outlined"
//                 sx={{
//                     borderColor: "var(--color-success)",
//                     color: "var(--color-success)",
//                     textTransform: "none",
//                     fontWeight: 600,
//                     borderRadius: "10px",
//                     px: 3,
//                 }}
//                 startIcon={<VisibilityOutlinedIcon sx={{ color: "var(--color-success)" }} />}
//             >
//                 View
//             </Button>
//         </Box>
//     );
// }

// export default ReportCard;


// import { Box, Typography, Button } from "@mui/material";
// import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// import ReportDetailsCard from "./ReportDetailsCard";

// function ReportCard({
//     id,
//     title = "Prescription Invoice",
//     badge = "Invoice",
//     doctor = "Dr. Anjali D",
//     consultationDate = "Nov 25, 2025",
//     uploadedDate = "Nov 25, 2025",
//     details = "Full report details will appear here...",

//     // ⭐ REQUIRED FIX
//     onView = null,
// }) {

//     const handleView = () => {
//         if (onView) {
//             onView({
//                 id,
//                 title,
//                 badge,
//                 doctor,
//                 consultationDate,
//                 uploadedDate,
//                 details,
//             });
//         }
//         <ReportDetailsCard />
//     };

//     return (
//         <Box
//             sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 p: 2.5,
//                 borderRadius: 3,
//                 bgcolor: "var(--color-bg-card)",
//                 boxShadow: "var(--shadow-soft)",
//                 border: "1px solid var(--color-border)",
//                 mb: 2,
//             }}
//         >
//             {/* LEFT SECTION */}
//             <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                 <Box
//                     sx={{
//                         width: 55,
//                         height: 55,
//                         borderRadius: 2,
//                         bgcolor: "#EEF3FF",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                     }}
//                 >
//                     <DescriptionOutlinedIcon sx={{ fontSize: 32, color: "var(--color-info)" }} />
//                 </Box>

//                 <Box>
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                         <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
//                             {title}
//                         </Typography>

//                         <Box
//                             sx={{
//                                 px: 1,
//                                 py: 0.3,
//                                 borderRadius: "12px",
//                                 fontSize: "0.7rem",
//                                 bgcolor: "rgba(78, 123, 168, 0.15)",
//                                 color: "var(--color-info)",
//                                 fontWeight: 600,
//                             }}
//                         >
//                             {badge}
//                         </Box>
//                     </Box>

//                     <Typography sx={{ color: "var(--color-text-muted)", fontSize: "0.9rem", mt: 0.5 }}>
//                         {doctor} • Consultation: {consultationDate} • Uploaded: {uploadedDate}
//                     </Typography>
//                 </Box>
//             </Box>

//             {/* VIEW BUTTON */}
//             <Button
//                 onClick={handleView}
//                 variant="outlined"
//                 sx={{
//                     borderColor: "var(--color-success)",
//                     color: "var(--color-success)",
//                     textTransform: "none",
//                     fontWeight: 600,
//                     borderRadius: "10px",
//                     px: 3,
//                 }}
//                 startIcon={<VisibilityOutlinedIcon sx={{ color: "var(--color-success)" }} />}
//             >
//                 View
//             </Button>
//         </Box>
//     );
// }

// export default ReportCard;


import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

function ReportCard({
    id,
    title = "Prescription Invoice",
    badge = "Invoice",
    doctor = "Dr. Anjali D",
    consultationDate = "Nov 25, 2025",
    uploadedDate = "Nov 25, 2025",
    details = "Full report details will appear here...",
    onView = null,
}) {
    const navigate = useNavigate();

    const handleView = () => {
        if (onView) {
            // Use provided onView handler if available
            onView();
        } else {
            // Fallback: Navigate to invoice page with default params (for backward compatibility)
            const params = new URLSearchParams({
                invoiceNumber: "INVOICE-20251125-0001",
                invoiceDate: "12/09/2025",
                patientName: "Sharavni",
                dob: "11/18/2025",
                patientId: "P-0001",
                service: "Ashwagandha Tablet",
                serviceDate: "12/09/2025",
                cost: "₹120.00",
                totalDue: "₹123.60",
                instructions: "Please make payment by 12/24/2025 via online portal, check, or credit card. For inquiries, contact us at 5465647658. Thank you!",
            });
            navigate(`/patient/reports/invoice?${params.toString()}`);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2.5,
                borderRadius: 3,
                bgcolor: "var(--color-bg-card)",
                boxShadow: "var(--shadow-soft)",
                border: "1px solid var(--color-border)",
                mb: 2,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                    sx={{
                        width: 55,
                        height: 55,
                        borderRadius: 2,
                        bgcolor: "var(--color-primary-light-v)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <DescriptionOutlinedIcon sx={{ fontSize: 32, color: "var(--color-primary)" }} />
                </Box>

                <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                            {title}
                        </Typography>

                        <Box
                            sx={{
                                px: 1,
                                py: 0.3,
                                borderRadius: "12px",
                                fontSize: "0.7rem",
                                bgcolor: "var(--color-primary-light-v)",
                                color: "var(--color-primary)",
                                fontWeight: 600,
                            }}
                        >
                            {badge}
                        </Box>
                    </Box>

                    <Typography sx={{ color: "var(--color-text-muted)", fontSize: "0.9rem", mt: 0.5 }}>
                        {doctor} • Consultation: {consultationDate} • Uploaded: {uploadedDate}
                    </Typography>
                </Box>
            </Box>

            {/* VIEW BUTTON */}
            <Button
                onClick={handleView}
                variant="outlined"
                sx={{
                    borderColor: "var(--color-success)",
                    color: "var(--color-success)",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "10px",
                    px: 3,
                }}
                startIcon={<VisibilityOutlinedIcon sx={{ color: "var(--color-success)" }} />}
            >
                View
            </Button>
        </Box>
    );
}

export default ReportCard;
