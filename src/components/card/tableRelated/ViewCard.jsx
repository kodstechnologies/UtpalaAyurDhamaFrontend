
// import React, { useState } from "react";
// import {
//     Box,
//     Typography,
//     Card,
//     CardContent,
//     Divider,
//     IconButton,
//     Collapse,
//     Tooltip,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

// function ViewCard({ data = {}, fields = [], title = "Details", onClose }) {
//     // If parent doesn't control close, use internal state
//     const [open, setOpen] = useState(true);

//     const handleClose = () => {
//         if (typeof onClose === "function") {
//             onClose(); // let parent handle it
//         } else {
//             setOpen(false); // self-close
//         }
//     };

//     return (
//         <Collapse in={open}>
//             <Card
//                 sx={{
//                     maxWidth: 650,
//                     mx: "auto",
//                     borderRadius: 3,
//                     boxShadow: "var(--shadow-soft)",
//                     backgroundColor: "var(--color-bg-card)",
//                     p: 1,
//                     position: "relative", // needed for absolute button
//                     overflow: "visible",
//                 }}
//                 elevation={0}
//             >
//                 {/* Close button (top-right) */}
//                 <Tooltip title="Close">
//                     <IconButton
//                         aria-label="close"
//                         onClick={handleClose}
//                         size="small"
//                         sx={{
//                             position: "absolute",
//                             top: 8,
//                             right: 8,
//                             bgcolor: "transparent",
//                             borderRadius: 1,
//                             "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
//                         }}
//                     >
//                         <CloseIcon fontSize="small" />
//                     </IconButton>
//                 </Tooltip>

//                 <CardContent sx={{ pt: 2 }}>
//                     {/* Title */}
//                     <Typography
//                         variant="h5"
//                         sx={{
//                             fontWeight: 700,
//                             color: "var(--color-text-dark)",
//                             mb: 1,
//                         }}
//                     >
//                         {title}
//                     </Typography>

//                     <Divider sx={{ mb: 2 }} />

//                     {/* TWO-COLUMN KEY-VALUE LAYOUT */}
//                     <Box
//                         sx={{
//                             display: "grid",
//                             gridTemplateColumns: "1fr 1fr",
//                             gap: 2,
//                         }}
//                     >
//                         {fields.map((field) => {
//                             const value = data[field.name] ?? "N/A";

//                             return (
//                                 <Box
//                                     key={field.name}
//                                     sx={{
//                                         display: "flex",
//                                         flexDirection: "column",
//                                         backgroundColor: "var(--color-background)",
//                                         borderRadius: 2,
//                                         p: 1.5,
//                                         position: "relative",
//                                     }}
//                                 >
//                                     <Typography
//                                         sx={{
//                                             fontSize: "0.75rem",
//                                             color: "var(--color-text-muted)",
//                                             fontWeight: 600,
//                                             textTransform: "uppercase",
//                                             letterSpacing: 0.5,
//                                             mb: 0.5,
//                                         }}
//                                     >
//                                         {field.label}
//                                     </Typography>

//                                     {/* STATUS BADGE (Auto-detect if field label = Status) */}
//                                     {field.label.toLowerCase() === "status" ? (
//                                         <Box
//                                             sx={{
//                                                 display: "inline-flex",
//                                                 alignItems: "center",
//                                                 gap: 1,
//                                                 px: 1.5,
//                                                 py: 0.5,
//                                                 borderRadius: 2,
//                                                 fontSize: "0.75rem",
//                                                 fontWeight: 700,
//                                                 width: "fit-content",
//                                                 backgroundColor:
//                                                     value === "Active"
//                                                         ? "rgba(34,197,94,0.16)"
//                                                         : "rgba(239,68,68,0.16)",
//                                                 color:
//                                                     value === "Active"
//                                                         ? "var(--color-success)"
//                                                         : "var(--color-error)",
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     width: 8,
//                                                     height: 8,
//                                                     borderRadius: "50%",
//                                                     bgcolor:
//                                                         value === "Active"
//                                                             ? "var(--color-success)"
//                                                             : "var(--color-error)",
//                                                 }}
//                                             />
//                                             {value}
//                                         </Box>
//                                     ) : (
//                                         <Typography
//                                             sx={{
//                                                 fontSize: "1rem",
//                                                 fontWeight: 500,
//                                                 color: "var(--color-text-dark)",
//                                                 wordBreak: "break-word",
//                                             }}
//                                         >
//                                             {value}
//                                         </Typography>
//                                     )}
//                                 </Box>
//                             );
//                         })}
//                     </Box>
//                 </CardContent>
//             </Card>
//         </Collapse>
//     );
// }

// export default ViewCard;


// import React, { useState } from "react";
// import {
//     Box,
//     Typography,
//     Card,
//     CardContent,
//     Divider,
//     IconButton,
//     Collapse,
//     Tooltip,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

// function ViewCard({ data = {}, fields = [], title = "Details", onClose }) {
//     // If parent doesn't control close, use internal state
//     const [open, setOpen] = useState(true);

//     const handleClose = () => {
//         if (typeof onClose === "function") {
//             onClose(); // let parent handle it
//         } else {
//             setOpen(false); // self-close
//         }
//     };

//     return (
//         <Collapse in={open}>
//             <Card
//                 sx={{
//                     maxWidth: 650,
//                     mx: "auto",
//                     borderRadius: 3,
//                     boxShadow: "var(--shadow-soft)",
//                     backgroundColor: "var(--color-bg-card)",
//                     p: 1,
//                     position: "relative", // needed for absolute button
//                     overflow: "visible",
//                     // backgroundColor: "red"
//                 }}
//                 elevation={0}
//             >
//                 {/* Close button (top-right) */}
//                 <Tooltip title="Close">
//                     <IconButton
//                         aria-label="close"
//                         onClick={handleClose}
//                         size="small"
//                         sx={{
//                             position: "absolute",
//                             top: 8,
//                             right: 8,
//                             bgcolor: "transparent",
//                             borderRadius: 1,
//                             "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
//                         }}
//                     >
//                         <CloseIcon fontSize="small" />
//                     </IconButton>
//                 </Tooltip>

//                 <CardContent sx={{ pt: 2 }}>
//                     {/* Title */}
//                     <Typography
//                         variant="h5"
//                         sx={{
//                             fontWeight: 700,
//                             color: "var(--color-text-dark)",
//                             mb: 1,
//                         }}
//                     >
//                         {title}
//                     </Typography>

//                     <Divider sx={{ mb: 2 }} />

//                     {/* TWO-COLUMN KEY-VALUE LAYOUT */}
//                     <Box
//                         sx={{
//                             display: "grid",
//                             gridTemplateColumns: "1fr 1fr",
//                             gap: 2,
//                         }}
//                     >
//                         {fields.map((field) => {
//                             const value = data[field.name] ?? "N/A";

//                             return (
//                                 <Box
//                                     key={field.name}
//                                     sx={{
//                                         display: "flex",
//                                         flexDirection: "column",
//                                         // backgroundColor: "var(--color-background)",
//                                         borderRadius: 2,
//                                         p: 1.5,
//                                         position: "relative",
//                                     }}
//                                 >
//                                     <Typography
//                                         sx={{
//                                             fontSize: "0.75rem",
//                                             color: "var(--color-text-muted)",
//                                             fontWeight: 600,
//                                             textTransform: "uppercase",
//                                             letterSpacing: 0.5,
//                                             mb: 0.5,
//                                         }}
//                                     >

//                                         {field.label}
//                                     </Typography>

//                                     {/* STATUS BADGE (Auto-detect if field label = Status) */}
//                                     {field.label.toLowerCase() === "status" ? (
//                                         <Box
//                                             sx={{
//                                                 display: "inline-flex",
//                                                 alignItems: "center",
//                                                 gap: 1,
//                                                 px: 1.5,
//                                                 py: 0.5,
//                                                 borderRadius: 2,
//                                                 fontSize: "0.75rem",
//                                                 fontWeight: 700,
//                                                 width: "fit-content",
//                                                 backgroundColor:
//                                                     value === "Active"
//                                                         ? "rgba(34,197,94,0.16)"
//                                                         : "rgba(239,68,68,0.16)",
//                                                 color:
//                                                     value === "Active"
//                                                         ? "var(--color-success)"
//                                                         : "var(--color-error)",
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     width: 8,
//                                                     height: 8,
//                                                     borderRadius: "50%",
//                                                     bgcolor:
//                                                         value === "Active"
//                                                             ? "var(--color-success)"
//                                                             : "var(--color-error)",
//                                                 }}
//                                             />

//                                             {value}
//                                         </Box>
//                                     ) : (
//                                         <Typography
//                                             sx={{
//                                                 fontSize: "1rem",
//                                                 fontWeight: 500,
//                                                 color: "var(--color-text-dark)",
//                                                 wordBreak: "break-word",
//                                             }}
//                                         >
//                                             {value}
//                                         </Typography>
//                                     )}
//                                 </Box>
//                             );
//                         })}
//                     </Box>
//                 </CardContent>
//             </Card>
//         </Collapse>
//     );
// }

// export default ViewCard;

import React, { useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Divider,
    IconButton,
    Collapse,
    Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function ViewCard({ data = {}, fields = [], title = "Details", onClose }) {
    const [open, setOpen] = useState(true);

    const handleClose = () => {
        if (typeof onClose === "function") onClose();
        else setOpen(false);
    };

    return (
        <Collapse in={open}>
            <Card
                sx={{
                    maxWidth: 650,
                    mx: "auto",
                    borderRadius: 3,
                    boxShadow: "var(--shadow-soft)",
                    backgroundColor: "var(--color-bg-card)",
                    p: 1,
                    position: "relative",
                }}
                elevation={0}
            >
                {/* Close Button */}
                <Tooltip title="Close">
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "transparent",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <CardContent sx={{ pt: 2 }}>
                    {/* Title */}
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: "var(--color-text-dark)",
                            mb: 1,
                        }}
                    >
                        {title}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    {/* TWO-COLUMN LAYOUT */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 2,
                        }}
                    >
                        {fields.map((field) => {
                            const value = data[field.name] ?? "N/A";
                            const isStatus = field.label.toLowerCase() === "status";

                            return (
                                <Box
                                    key={field.name}
                                    sx={{
                                        backgroundColor: "var(--color-background)",
                                        p: 1.5,
                                        borderRadius: 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.5,
                                        border: "1px solid var(--color-border-light)",
                                    }}
                                >
                                    {/* LABEL : VALUE FORMAT */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography
                                            sx={{
                                                fontSize: "0.9rem",
                                                fontWeight: 600,
                                                color: "var(--color-text-dark)",
                                                minWidth: "90px",
                                                textTransform: "capitalize",
                                            }}
                                        >
                                            {field.label} :
                                        </Typography>

                                        {/* STATUS BADGE */}
                                        {isStatus ? (
                                            <Box
                                                sx={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    px: 1.2,
                                                    py: 0.4,
                                                    borderRadius: 2,
                                                    fontSize: "0.75rem",
                                                    fontWeight: 700,
                                                    backgroundColor:
                                                        value === "Active"
                                                            ? "rgba(34,197,94,0.16)"
                                                            : "rgba(239,68,68,0.16)",
                                                    color:
                                                        value === "Active"
                                                            ? "var(--color-success)"
                                                            : "var(--color-error)",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: "50%",
                                                        bgcolor:
                                                            value === "Active"
                                                                ? "var(--color-success)"
                                                                : "var(--color-error)",
                                                    }}
                                                />
                                                {value}
                                            </Box>
                                        ) : (
                                            <Typography
                                                sx={{
                                                    fontSize: "1rem",
                                                    fontWeight: 500,
                                                    color: "var(--color-text-dark)",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {value}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </CardContent>
            </Card>
        </Collapse>
    );
}

export default ViewCard;
