
import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
} from "@mui/material";
import { CheckCircle, Cancel, Circle } from "@mui/icons-material";

const Therapies_View = () => {
    const [selectedMember, setSelectedMember] = useState("Self");

    const familyMembers = ["Self", "Sharavni", "Rajesh Sharma", "Priya Sharma"];

    const therapies = [
        {
            id: 1,
            name: "Cardiology",
            prescribedBy: "Dr. Anjali D",
            duration: "1 day",
            status: "completed",
            dates: [{ date: "2025-11-25", status: "completed", label: "Day 1" }],
        },
        {
            id: 2,
            name: "Cardiology",
            prescribedBy: "Dr. Anjali D",
            duration: "2 days",
            status: "in-progress",
            dates: [
                { date: "2025-12-02", status: "completed", label: "1" },
                { date: "2025-12-03", status: "upcoming", label: null },
            ],
        },
        {
            id: 3,
            name: "Panchakarma - Virechana",
            prescribedBy: "Dr. Priya Singh",
            duration: "5 days",
            status: "upcoming",
            dates: [
                { date: "2025-12-10", status: "upcoming" },
                { date: "2025-12-11", status: "upcoming" },
                { date: "2025-12-12", status: "upcoming" },
                { date: "2025-12-13", status: "upcoming" },
                { date: "2025-12-14", status: "upcoming" },
            ],
        },
    ];

    const total = therapies.length;
    const completed = therapies.filter(t => t.status === "completed").length;
    const inProgress = therapies.filter(t => t.status === "in-progress").length;
    const upcoming = therapies.filter(t => t.status === "upcoming").length;

    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "#6A8E3F";     // Herbal Green
            case "in-progress": return "#5C3D2E";   // Deep Brown
            case "upcoming": return "#E8A84E";      // Golden Amber
            case "absent": return "#B54545";        // Muted Red
            default: return "#857466";
        }
    };

    const renderCalendarCell = (date, status, label) => {
        if (!date) return <TableCell sx={{ bgcolor: "#F4F0E5" }} />;

        const day = new Date(date).getDate();

        return (
            <TableCell align="center" sx={{ position: "relative", height: 70, border: "1px solid #E8E2D5" }}>
                {status === "completed" && (
                    <CheckCircle sx={{ color: "#6A8E3F", fontSize: 32, opacity: 0.7, position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)" }} />
                )}
                {status === "absent" && (
                    <Cancel sx={{ color: "#B54545", fontSize: 28, position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)" }} />
                )}
                {status === "upcoming" && (
                    <Circle sx={{ color: "#E8A84E", fontSize: 12, position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)" }} />
                )}
                {status === "in-progress" && label && (
                    <Chip
                        label={label}
                        size="small"
                        sx={{
                            bgcolor: "#5C3D2E",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            height: 28,
                            position: "absolute",
                            top: 8,
                            left: "50%",
                            transform: "translateX(-50%)",
                        }}
                    />
                )}
                <Typography variant="body2" sx={{ mt: 3, fontWeight: status === "completed" ? 700 : 500, color: "#5C3D2E" }}>
                    {day}
                </Typography>
            </TableCell>
        );
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#EFE7DA", p: { xs: 2, md: 4 } }}>
            {/* Header */}
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" mb={6} gap={3}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#5C3D2E" }}>
                    My Therapies
                </Typography>

                <FormControl sx={{ minWidth: 240 }}>
                    <InputLabel sx={{ color: "#5C3D2E", fontWeight: 600 }}>Showing therapies for:</InputLabel>
                    <Select
                        value={selectedMember}
                        label="Showing therapies for:"
                        onChange={(e) => setSelectedMember(e.target.value)}
                        sx={{
                            bgcolor: "white",
                            borderRadius: 3,
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D6D2C4" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#5C3D2E" },
                        }}
                    >
                        {familyMembers.map((member) => (
                            <MenuItem key={member} value={member} sx={{ fontWeight: 500 }}>
                                {member}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            {/* Summary Cards */}
            <Grid container spacing={4} mb={6}>
                {[
                    { label: "Total Therapies", value: total, color: "#5C3D2E" },
                    { label: "Completed", value: completed, color: "#6A8E3F" },
                    { label: "In Progress", value: inProgress, color: "#5C3D2E" },
                    { label: "Upcoming", value: upcoming, color: "#E8A84E" },
                ].map((item, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                        <Card sx={{ p: 4, textAlign: "center", borderRadius: 4, border: "2px solid #D6D2C4", bgcolor: "#FFFFFF", boxShadow: "0 8px 25px rgba(92, 61, 46, 0.1)" }}>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: item.color, mb: 1 }}>
                                {item.value}
                            </Typography>
                            <Typography variant="h6" color="#857466" fontWeight={600}>
                                {item.label}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Therapy Cards */}
            <Grid container spacing={5}>
                {therapies.map((therapy) => (
                    <Grid item xs={12} key={therapy.id}>
                        <Card sx={{ borderRadius: 5, overflow: "hidden", boxShadow: "0 15px 40px rgba(92, 61, 46, 0.15)", border: "2px solid #D6D2C4" }}>
                            <Box sx={{ bgcolor: "#5C3D2E", color: "white", p: 4 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                            {therapy.name}
                                        </Typography>
                                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                            Prescribed by: {therapy.prescribedBy} • Duration: {therapy.duration}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={3} alignItems="center">
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Circle sx={{ color: "#6A8E3F", fontSize: 14 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>Completed</Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Circle sx={{ color: "#B54545", fontSize: 14 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>Absent</Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Circle sx={{ color: "#E8A84E", fontSize: 14 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>Upcoming</Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Box>

                            <Box sx={{ p: 4, bgcolor: "#FDFBF7" }}>
                                <TableContainer>
                                    <Table size="medium">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: "#F4F0E5" }}>
                                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                                    <TableCell key={day} align="center" sx={{ fontWeight: 700, color: "#5C3D2E", fontSize: "1rem" }}>
                                                        {day}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {[...Array(6)].map((_, weekIndex) => (
                                                <TableRow key={weekIndex}>
                                                    {[...Array(7)].map((_, dayIndex) => {
                                                        const cellIndex = weekIndex * 7 + dayIndex;
                                                        const therapyDate = therapy.dates[cellIndex];
                                                        return renderCalendarCell(
                                                            therapyDate?.date,
                                                            therapyDate?.status,
                                                            therapyDate?.label
                                                        );
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Footer */}
            <Typography variant="body2" align="center" color="#857466" sx={{ mt: 10, pb: 6, fontSize: "1.1rem" }}>
                © 2025 Utpala Ayurveda – All rights reserved.
            </Typography>
        </Box>
    );
};

export default Therapies_View;