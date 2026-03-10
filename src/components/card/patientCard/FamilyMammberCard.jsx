// import React from "react";
// import { Card, Box, Typography, Avatar, Divider } from "@mui/material";
// import PersonIcon from "@mui/icons-material/Person";

// function FamilyMemberCard({
//     name = "maya",
//     relation = "Daughter",
//     phone = "1234567890",
//     dob = "2022-02-23",
//     gender = "Female",
// }) {
//     return (
//         <Card
//             sx={{
//                 padding: "20px",
//                 borderRadius: "14px",
//                 background: "var(--color-bg-card)",
//                 border: "1px solid var(--color-border)",
//                 boxShadow: "var(--shadow-medium)",
//                 width: "350px",
//             }}
//         >
//             {/* Top Section */}
//             <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                 <Avatar
//                     sx={{
//                         width: 60,
//                         height: 60,
//                         background: "var(--color-primary-light)",
//                         color: "var(--color-primary-dark)",
//                         fontSize: 32,
//                     }}
//                 >
//                     <PersonIcon sx={{ fontSize: 32 }} />
//                 </Avatar>

//                 <Box>
//                     <Typography
//                         sx={{
//                             fontSize: "1.2rem",
//                             fontWeight: 700,
//                             color: "var(--color-text-dark)",
//                         }}
//                     >
//                         {name}
//                     </Typography>

//                     <Typography
//                         sx={{
//                             fontSize: "0.95rem",
//                             color: "var(--color-text-muted)",
//                         }}
//                     >
//                         {relation}
//                     </Typography>
//                 </Box>
//             </Box>

//             {/* Divider */}
//             <Divider sx={{ my: 2, borderColor: "var(--color-border-dark)" }} />

//             {/* Details Section */}
//             <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 1.5 }}>
//                 <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
//                     Phone:
//                 </Typography>
//                 <Typography sx={{ color: "var(--color-text-dark)" }}>
//                     {phone}
//                 </Typography>

//                 <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
//                     DOB:
//                 </Typography>
//                 <Typography sx={{ color: "var(--color-text-dark)" }}>
//                     {dob}
//                 </Typography>

//                 <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
//                     Gender:
//                 </Typography>
//                 <Typography sx={{ color: "var(--color-text-dark)" }}>
//                     {gender}
//                 </Typography>
//             </Box>
//         </Card>
//     );
// }

// export default FamilyMemberCard;
import React from "react";
import { Card, Box, Typography, Avatar, Divider, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from "framer-motion";

function FamilyMemberCard({
    name = "Maya",
    relation = "Daughter",
    phone = "1234567890",
    dob = "2022-02-23",
    gender = "Female",
    uhid = "Not assigned",
    id,
    onEdit,
    onDelete,
}) {
    // Animation variants
    const cardVariants = {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        },
        whileHover: {
            y: -2,
            boxShadow: "var(--shadow-large)",
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        },
    };

    const textVariants = {
        initial: { opacity: 0, x: -10 },
        animate: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.4,
                delay: 0.2
            }
        },
    };

    // Generate initials for avatar
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="whileHover"
        >
            <Card
                sx={{
                    padding: "24px", // Increased padding for better breathing room
                    borderRadius: "16px", // Softer radius
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-medium)",
                    width: "350px",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": { // Subtle gradient overlay for depth
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background: "linear-gradient(90deg, var(--color-icon-2-light), var(--color-icon-3-light))",
                    },
                    transition: "all 0.3s ease", // Smooth transition for hover states
                }}
            >
                {/* Top Section */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <motion.div variants={textVariants} initial="initial" animate="animate">
                        <Avatar
                            sx={{
                                width: 68, // Slightly larger
                                height: 68,
                                background: "linear-gradient(135deg, var(--color-primary-light), var(--color-icon-2-light))",
                                color: "var(--color-primary-dark)",
                                fontSize: 28,
                                fontWeight: 700,
                                border: "2px solid var(--color-light)", // Subtle border
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // Soft shadow
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                                },
                            }}
                        >
                            {initials} {/* Use initials instead of icon for personalization */}
                        </Avatar>
                    </motion.div>

                    <motion.div variants={textVariants} initial="initial" animate="animate">
                        <Box>
                            <Typography
                                sx={{
                                    fontSize: "1.3rem", // Slightly larger
                                    fontWeight: 700,
                                    color: "var(--color-text-dark)",
                                    lineHeight: 1.2,
                                }}
                            >
                                {name}
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: "1rem",
                                    color: "var(--color-text-muted)",
                                    fontWeight: 500,
                                    mt: 0.5,
                                    background: "linear-gradient(135deg, var(--color-icon-2), var(--color-icon-3))",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                {relation}
                            </Typography>
                        </Box>
                    </motion.div>
                </Box>

                {/* Divider with enhanced styling */}
                <Divider
                    sx={{
                        my: 3,
                        borderColor: "var(--color-border-dark)",
                        background: "linear-gradient(to right, transparent, var(--color-border), transparent)",
                        height: "1px",
                    }}
                />

                {/* Details Section */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 2, columnGap: 2 }}>
                    <motion.div variants={textVariants} initial="initial" animate="animate">
                        <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600, fontSize: "0.9rem" }}>
                            Phone:
                        </Typography>
                    </motion.div>
                    <motion.div variants={textVariants} initial="initial" animate="animate">
                        <Typography sx={{ color: "var(--color-text-dark)", fontSize: "0.9rem" }}>
                            {phone}
                        </Typography>
                    </motion.div>

                    <motion.div variants={textVariants} initial="initial" animate="animate">
                        <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600, fontSize: "0.9rem" }}>
                            DOB:
                        </Typography>
                    </motion.div>
                    <motion.div variants={textVariants} initial="initial" animate="animate">
                        <Typography sx={{ color: "var(--color-text-dark)", fontSize: "0.9rem" }}>
                            {new Date(dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </Typography>
                    </motion.div>

                    <motion.div variants={textVariants} initial="initial" animate="animate">
                        <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600, fontSize: "0.9rem" }}>
                            Gender:
                        </Typography>
                    </motion.div>
                    <motion.div variants={textVariants} initial="initial" animate="animate">
                        <Typography sx={{ color: "var(--color-text-dark)", fontSize: "0.9rem" }}>
                            {gender}
                        </Typography>
                    </motion.div>

                    <motion.div variants={textVariants} initial="initial" animate="animate">
                        <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600, fontSize: "0.9rem" }}>
                            UHID:
                        </Typography>
                    </motion.div>
                    <motion.div variants={textVariants} initial="initial" animate="animate">
                        <Typography sx={{ color: "var(--color-text-dark)", fontSize: "0.9rem", fontWeight: 500 }}>
                            {uhid}
                        </Typography>
                    </motion.div>
                </Box>

                {/* Action Buttons */}
                {(onEdit || onDelete) && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                            mt: 3,
                            pt: 2,
                            borderTop: "1px solid var(--color-border)",
                        }}
                    >
                        {onEdit && (
                            <Tooltip title="Edit Family Member">
                                <IconButton
                                    onClick={() => onEdit(id)}
                                    sx={{
                                        backgroundColor: "var(--color-primary-light)",
                                        color: "var(--color-primary)",
                                        "&:hover": {
                                            backgroundColor: "var(--color-primary)",
                                            color: "#fff",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {onDelete && (
                            <Tooltip title="Delete Family Member">
                                <IconButton
                                    onClick={() => onDelete(id, name)}
                                    sx={{
                                        backgroundColor: "#ffebee",
                                        color: "#d32f2f",
                                        "&:hover": {
                                            backgroundColor: "#d32f2f",
                                            color: "#fff",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                )}
            </Card>
        </motion.div>
    );
}

export default FamilyMemberCard;