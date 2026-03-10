// import React, { useState } from "react";
// import {
//     Box,
//     Avatar,
//     Typography,
//     Chip,
//     Button,
//     Dialog,
//     DialogContent,
// } from "@mui/material";
// import {
//     Female,
//     CalendarToday,
//     Favorite,
//     Description,
// } from "@mui/icons-material";

// import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
// import ExaminationRecordsView from "./ExaminationRecords/View";

// function PatientsCard({
//     /* ✅ NEW */
//     breadcrumbItems = [],

//     name = "Sharavni",
//     age = 22,
//     gender = "Female",
//     lastVisit = "Nov 25, 2025",
//     condition = "PCOS & Irregular Cycles",
//     active = true,
//     patientId = "1",
// }) {
//     const [openExamDialog, setOpenExamDialog] = useState(false);

//     const patientInitial = name?.charAt(0)?.toUpperCase() || "P";

//     return (
//         <>
//             {/* ================= BREADCRUMB ================= */}
//             {breadcrumbItems.length > 0 && (
//                 <Breadcrumb items={breadcrumbItems} />
//             )}

//             {/* ================= Patient Header Card ================= */}
//             <Box sx={{ width: "100%", mb: 4 }}>
//                 <Box
//                     sx={{
//                         p: 4,
//                         borderRadius: 4,
//                         background: "var(--color-bg-card-hover-b)",
//                         color: "white",
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         boxShadow: "var(--shadow-medium)",
//                         flexWrap: "wrap",
//                         gap: 3,
//                     }}
//                 >
//                     {/* LEFT */}
//                     <Box sx={{ display: "flex", gap: 4, alignItems: "center" }}>
//                         <Avatar
//                             sx={{
//                                 width: 110,
//                                 height: 110,
//                                 bgcolor: "rgba(255,255,255,0.2)",
//                                 fontSize: "3rem",
//                                 fontWeight: "bold",
//                                 border: "4px solid white",
//                             }}
//                         >
//                             {patientInitial}
//                         </Avatar>

//                         <Box>
//                             <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                                 <Typography variant="h4" fontWeight={700}>
//                                     {name}
//                                 </Typography>

//                                 {active && (
//                                     <Chip
//                                         label="Active"
//                                         size="small"
//                                         sx={{
//                                             bgcolor: "var(--color-success)",
//                                             color: "white",
//                                             fontWeight: 600,
//                                         }}
//                                     />
//                                 )}
//                             </Box>

//                             <Box
//                                 sx={{
//                                     display: "flex",
//                                     gap: 4,
//                                     mt: 2,
//                                     opacity: 0.95,
//                                     flexWrap: "wrap",
//                                 }}
//                             >
//                                 <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                                     <Female fontSize="small" />
//                                     {gender}, {age} years
//                                 </Typography>

//                                 <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                                     <CalendarToday fontSize="small" />
//                                     Last Visit: {lastVisit}
//                                 </Typography>

//                                 <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                                     <Favorite fontSize="small" sx={{ color: "#E8A84E" }} />
//                                     {condition}
//                                 </Typography>
//                             </Box>
//                         </Box>
//                     </Box>

//                     {/* RIGHT */}
//                     <Button
//                         variant="outlined"
//                         startIcon={<Description />}
//                         onClick={() => setOpenExamDialog(true)}
//                         sx={{
//                             color: "white",
//                             borderColor: "white",
//                             backgroundColor: "var(--color-btn-b)",
//                             textTransform: "none",
//                             fontWeight: 600,
//                             px: 4,
//                             py: 1.5,
//                             borderRadius: 3,
//                             "&:hover": {
//                                 bgcolor: "var(--color-btn-dark-b)",
//                                 borderColor: "white",
//                             },
//                         }}
//                     >
//                         View Examination
//                     </Button>
//                 </Box>
//             </Box>

//             {/* ================= Examination Dialog ================= */}
//             <Dialog
//                 open={openExamDialog}
//                 onClose={() => setOpenExamDialog(false)}
//                 maxWidth="lg"
//                 fullWidth
//                 PaperProps={{ sx: { borderRadius: 3 } }}
//             >
//                 <DialogContent dividers sx={{ p: 0 }}>
//                     <ExaminationRecordsView
//                         patientId={patientId}
//                         name={name}
//                         onClose={() => setOpenExamDialog(false)}
//                     />
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }

// export default PatientsCard;


import React from "react";
import {
    Box,
    Avatar,
    Typography,
    Chip,
    Button,
} from "@mui/material";
import {
    Female,
    CalendarToday,
    Favorite,
    Description,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import Breadcrumb from "../../components/breadcrumb/Breadcrumb";

function PatientsCard({
    breadcrumbItems = [],
    name = "Sharavni",
    age = 22,
    gender = "Female",
    lastVisit = "Nov 25, 2025",
    condition = "PCOS & Irregular Cycles",
    active = true,
    patientId, // ✅ REQUIRED
}) {
    const navigate = useNavigate();

    const patientInitial = name?.charAt(0)?.toUpperCase() || "P";

    const handleViewExamination = () => {
        navigate(`/doctor/examination/${patientId}`);
    };

    return (
        <>
            {/* ================= BREADCRUMB ================= */}
            {breadcrumbItems.length > 0 && (
                <Breadcrumb items={breadcrumbItems} />
            )}

            {/* ================= Patient Header Card ================= */}
            <Box sx={{ width: "100%", mb: 4 }}>
                <Box
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        background: "var(--color-bg-card-hover-b)",
                        color: "white",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "var(--shadow-medium)",
                        flexWrap: "wrap",
                        gap: 3,
                    }}
                >
                    {/* LEFT */}
                    <Box sx={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <Avatar
                            sx={{
                                width: 110,
                                height: 110,
                                bgcolor: "rgba(255,255,255,0.2)",
                                fontSize: "3rem",
                                fontWeight: "bold",
                                border: "4px solid white",
                            }}
                        >
                            {patientInitial}
                        </Avatar>

                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography variant="h4" fontWeight={700}>
                                    {name}
                                </Typography>

                                {active && (
                                    <Chip
                                        label="Active"
                                        size="small"
                                        sx={{
                                            bgcolor: "var(--color-success)",
                                            color: "white",
                                            fontWeight: 600,
                                        }}
                                    />
                                )}
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 4,
                                    mt: 2,
                                    opacity: 0.95,
                                    flexWrap: "wrap",
                                }}
                            >
                                <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Female fontSize="small" />
                                    {gender}, {age} years
                                </Typography>

                                <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <CalendarToday fontSize="small" />
                                    Last Visit: {lastVisit}
                                </Typography>

                                <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Favorite fontSize="small" sx={{ color: "var(--color-warning)" }} />
                                    {condition}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* RIGHT */}
                    <Button
                        variant="contained"
                        startIcon={<Description />}
                        onClick={handleViewExamination}
                        sx={{
                            backgroundColor: "var(--color-btn-b)",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            "&:hover": {
                                bgcolor: "var(--color-btn-dark-b)",
                            },
                        }}
                    >
                        Patient Calendar
                    </Button>
                </Box>
            </Box>
        </>
    );
}

export default PatientsCard;
