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


import React from "react";
import { Box, Typography, Button } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"; // 👈 Eye Icon Added

function ReportCard({
    title = "Prescription Invoice",
    badge = "Invoice",
    doctor = "Dr. Anajali D",
    consultationDate = "Nov 25, 2025",
    uploadedDate = "Nov 25, 2025",
    onView = () => { },
}) {
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
            {/* LEFT SECTION */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* ICON */}
                <Box
                    sx={{
                        width: 55,
                        height: 55,
                        borderRadius: 2,
                        bgcolor: "#EEF3FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <DescriptionOutlinedIcon
                        sx={{ fontSize: 32, color: "var(--color-info)" }}
                    />
                </Box>

                {/* TEXTS */}
                <Box>
                    {/* Title + Badge */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}
                        >
                            {title}
                        </Typography>

                        {/* Badge */}
                        <Box
                            sx={{
                                px: 1,
                                py: 0.3,
                                borderRadius: "12px",
                                fontSize: "0.7rem",
                                bgcolor: "rgba(78, 123, 168, 0.15)",
                                color: "var(--color-info)",
                                fontWeight: 600,
                            }}
                        >
                            {badge}
                        </Box>
                    </Box>

                    {/* Sub info */}
                    <Typography
                        sx={{ color: "var(--color-text-muted)", fontSize: "0.9rem", mt: 0.5 }}
                    >
                        {doctor} &nbsp; • &nbsp; Consultation: {consultationDate} &nbsp; •
                        &nbsp; Uploaded: {uploadedDate}
                    </Typography>
                </Box>
            </Box>

            {/* VIEW BUTTON */}
            <Button
                onClick={onView}
                variant="outlined"
                sx={{
                    borderColor: "var(--color-success)",
                    color: "var(--color-success)",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "10px",
                    px: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&:hover": {
                        background: "rgba(106,142,63,0.08)",
                        borderColor: "var(--color-success)",
                    },
                }}
                startIcon={
                    <VisibilityOutlinedIcon
                        sx={{
                            fontSize: 20,
                            color: "var(--color-success)",
                        }}
                    />
                }
            >
                View
            </Button>
        </Box>
    );
}

export default ReportCard;
