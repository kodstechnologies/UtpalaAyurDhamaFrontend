import React from "react";
import { Box, Typography } from "@mui/material";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Calendar({
    month,
    year,
    completedDays = [],
    absentDays = [],
    upcomingDays = [],
}) {
    // ----------------------------------------------------
    // Generate calendar dates
    // ----------------------------------------------------
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const totalCells = firstDay + daysInMonth;
    const rows = Math.ceil(totalCells / 7);

    const getStatus = (day) => {
        if (completedDays.includes(day)) return "completed";
        if (absentDays.includes(day)) return "absent";
        if (upcomingDays.includes(day)) return "upcoming";
        return "none";
    };

    const getColor = (status) => {
        switch (status) {
            case "completed":
                return { bg: "#22c55e33", color: "#22c55e" }; // green
            case "absent":
                return { bg: "#ef444433", color: "#ef4444" }; // red
            case "upcoming":
                return { bg: "#6366f133", color: "#6366f1" }; // purple
            default:
                return { bg: "transparent", color: "inherit" };
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                overflow: "hidden",
            }}
        >
            {/* Week Header */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    background: "#fafafa",
                    borderBottom: "1px solid #e5e7eb",
                    padding: "10px 0",
                }}
            >
                {weekDays.map((d) => (
                    <Typography
                        key={d}
                        align="center"
                        sx={{ fontWeight: 600, color: "#6b7280" }}
                    >
                        {d}
                    </Typography>
                ))}
            </Box>

            {/* Dates */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    minHeight: "300px",
                }}
            >
                {/* Empty slots at start */}
                {[...Array(firstDay)].map((_, i) => (
                    <Box key={i} sx={{ border: "1px solid #e5e7eb", background: "#f3f4f6" }} />
                ))}

                {/* Month Dates */}
                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const status = getStatus(day);
                    const color = getColor(status);

                    return (
                        <Box
                            key={day}
                            sx={{
                                border: "1px solid #e5e7eb",
                                padding: "6px",
                                textAlign: "center",
                                cursor: status !== "none" ? "pointer" : "default",
                            }}
                        >
                            <Typography
                                sx={{
                                    display: "inline-block",
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: "8px",
                                    background: color.bg,
                                    color: color.color,
                                    fontWeight: status !== "none" ? 600 : 400,
                                    transition: "0.2s",
                                }}
                            >
                                {day}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

export default Calendar;
