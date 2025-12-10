// PatientsCard.jsx
import React, { useState } from "react";
import {
    Box,
    Avatar,
    Typography,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
} from "@mui/material";
import { Close, Female, CalendarToday, Favorite, Description } from "@mui/icons-material";
import ExaminationRecordsView from "./ExaminationRecords/View";

// Import the ExaminationRecordsView component (make sure path is correct)
// import ExaminationRecordsView from "../examination/ExaminationRecordsView";
// adjust the import path above if your file lives in a different folder

function PatientsCard({
    breadcrumbItems = [],
    name = "Sharavni",
    age = 22,
    gender = "Female",
    lastVisit = "Nov 25, 2025",
    condition = "PCOS & Irregular Cycles",
    active = true,
    patientId = "1",
}) {
    const [openExamDialog, setOpenExamDialog] = useState(false);

    return (
        <>
            {/* Main Patient Header Card - Herbal Theme */}
            <Box sx={{ width: "100%", mb: 4 }}>
                <Box
                    sx={{
                        width: "100%",
                        p: 4,
                        borderRadius: 4,
                        background:
                            "linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))",
                        color: "white",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "var(--shadow-medium)",
                    }}
                >
                    <Box sx={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <Avatar
                            sx={{
                                width: 110,
                                height: 110,
                                bgcolor: "rgba(255,255,255,0.2)",
                                fontSize: "3rem",
                                fontWeight: "bold",
                                border: "4px solid white",
                                color: "white",
                            }}
                        >
                            {name[0] ?? "P"}
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

                            <Box sx={{ display: "flex", gap: 4, mt: 2, opacity: 0.95, flexWrap: "wrap" }}>
                                <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Female fontSize="small" /> {gender}, {age} years
                                </Typography>
                                <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <CalendarToday fontSize="small" /> Last Visit: {lastVisit}
                                </Typography>
                                <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Favorite fontSize="small" sx={{ color: "#E8A84E" }} /> {condition}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<Description />}
                        onClick={() => setOpenExamDialog(true)}
                        sx={{
                            color: "white",
                            borderColor: "white",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            "&:hover": {
                                bgcolor: "rgba(255,255,255,0.15)",
                                borderColor: "white",
                            },
                        }}
                    >
                        View Examination
                    </Button>
                </Box>
            </Box>

            {/* Dialog that renders ExaminationRecordsView (no redirect) */}
            <Dialog
                open={openExamDialog}
                onClose={() => setOpenExamDialog(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {/* <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Examination Records — {name}
                    </Typography>

                    <IconButton onClick={() => setOpenExamDialog(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle> */}

                <DialogContent dividers sx={{ p: 0 }}>
                    {/* render the ExaminationRecordsView component here */}
                    {/* pass patientId or any props if needed */}
                    <ExaminationRecordsView patientId={patientId} name={name} />
                </DialogContent>
            </Dialog>
        </>
    );
}

export default PatientsCard;
