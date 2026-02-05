
import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Stack,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
} from "@mui/material";
import { CheckCircle, Cancel, Circle } from "@mui/icons-material";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import therapyService from "../../../services/therapyService";

const Therapies_View = () => {
    const [therapies, setTherapies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTherapies = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await therapyService.getPatientTherapies();

            if (response && response.success) {
                const therapiesData = Array.isArray(response.data) ? response.data : [];

                // Transform dates array to calendar format
                const transformedTherapies = therapiesData.map((therapy) => {
                    // Create a map of dates for quick lookup
                    const datesMap = new Map();
                    therapy.dates?.forEach((d) => {
                        if (d.date) {
                            // Normalize date key (YYYY-MM-DD)
                            const dateObj = new Date(d.date);
                            if (!isNaN(dateObj.getTime())) {
                                const dateKey = dateObj.toISOString().split('T')[0];
                                datesMap.set(dateKey, {
                                    ...d,
                                    date: dateKey, // Ensure normalized format
                                });
                            }
                        }
                    });

                    // Find the earliest date in therapy dates or use session date
                    let earliestDate = new Date();
                    if (therapy.dates && therapy.dates.length > 0) {
                        const validDates = therapy.dates
                            .filter(d => d.date)
                            .map(d => {
                                const dateObj = new Date(d.date);
                                return isNaN(dateObj.getTime()) ? null : dateObj;
                            })
                            .filter(d => d !== null)
                            .sort((a, b) => a - b);

                        if (validDates.length > 0) {
                            earliestDate = validDates[0];
                        }
                    } else if (therapy.sessionDate) {
                        const sessionDate = new Date(therapy.sessionDate);
                        if (!isNaN(sessionDate.getTime())) {
                            earliestDate = sessionDate;
                        }
                    }

                    // Align earliest date to Sunday (week start) - go back to the Sunday of that week
                    const dayOfWeek = earliestDate.getDay(); // 0 = Sunday
                    const calendarStartDate = new Date(earliestDate);
                    calendarStartDate.setDate(earliestDate.getDate() - dayOfWeek);
                    calendarStartDate.setHours(0, 0, 0, 0);

                    // Generate 42 calendar cells (6 weeks = 42 days) starting from the Sunday before/on the earliest date
                    const calendarDates = [];
                    for (let i = 0; i < 42; i++) {
                        const cellDate = new Date(calendarStartDate);
                        cellDate.setDate(calendarStartDate.getDate() + i);

                        // Use local date for key to avoid timezone shifts (toISOString uses UTC)
                        const year = cellDate.getFullYear();
                        const month = String(cellDate.getMonth() + 1).padStart(2, '0');
                        const day = String(cellDate.getDate()).padStart(2, '0');
                        const dateKey = `${year}-${month}-${day}`;

                        const therapyDate = datesMap.get(dateKey);

                        if (therapyDate) {
                            calendarDates.push({
                                date: dateKey,
                                status: therapyDate.status || "upcoming",
                                label: therapyDate.label || null,
                            });
                        } else {
                            // Empty cell - still store the date for display
                            calendarDates.push({
                                date: dateKey,
                                status: null,
                                label: null,
                            });
                        }
                    }

                    // Format Month Year label (e.g. "February 2026")
                    const monthYearLabel = earliestDate.toLocaleString('default', { month: 'long', year: 'numeric' });

                    return {
                        ...therapy,
                        id: therapy._id,
                        dates: calendarDates,
                        monthYearLabel,
                    };
                });

                setTherapies(transformedTherapies);
            } else {
                toast.error(response?.message || "Failed to fetch therapies");
                setTherapies([]);
            }
        } catch (error) {
            console.error("Error fetching therapies:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch therapies";
            toast.error(errorMessage);
            setTherapies([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTherapies();
    }, [fetchTherapies]);

    const total = therapies.length;
    const completed = therapies.filter(t => t.status === "completed").length;
    const inProgress = therapies.filter(t => t.status === "in-progress").length;
    const upcoming = therapies.filter(t => t.status === "upcoming").length;

    const renderCalendarCell = (therapyDate) => {
        if (!therapyDate || !therapyDate.date) {
            return <TableCell sx={{ bgcolor: "#F4F0E5", height: 70, border: "1px solid #E8E2D5" }} />;
        }

        const dateObj = new Date(therapyDate.date);
        if (isNaN(dateObj.getTime())) {
            return <TableCell sx={{ bgcolor: "#F4F0E5", height: 70, border: "1px solid #E8E2D5" }} />;
        }

        const day = dateObj.getDate();
        const cellStatus = therapyDate.status;

        // If no status, it's an empty calendar cell (not a therapy date)
        if (!cellStatus) {
            return (
                <TableCell align="center" sx={{ position: "relative", height: 70, border: "1px solid #E8E2D5", bgcolor: "#F4F0E5" }}>
                    <Typography variant="body2" sx={{ mt: 3, fontWeight: 400, color: "#999" }}>
                        {day}
                    </Typography>
                </TableCell>
            );
        }

        return (
            <TableCell align="center" sx={{ position: "relative", height: 70, border: "1px solid #E8E2D5", bgcolor: "#FDFBF7" }}>
                {cellStatus === "completed" && (
                    <CheckCircle sx={{ color: "#6A8E3F", fontSize: 32, opacity: 0.7, position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)" }} />
                )}
                {cellStatus === "absent" && (
                    <Cancel sx={{ color: "#B54545", fontSize: 28, position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)" }} />
                )}
                {cellStatus === "upcoming" && therapyDate.label && (
                    <Chip
                        label={therapyDate.label}
                        size="small"
                        sx={{
                            bgcolor: "#E8A84E",
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
                {cellStatus === "upcoming" && !therapyDate.label && (
                    <Circle sx={{ color: "#E8A84E", fontSize: 12, position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)" }} />
                )}
                {cellStatus === "in-progress" && therapyDate.label && (
                    <Chip
                        label={therapyDate.label}
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
                {cellStatus === "in-progress" && !therapyDate.label && (
                    <Circle sx={{ color: "#5C3D2E", fontSize: 12, position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)" }} />
                )}
                <Typography variant="body2" sx={{ mt: 3, fontWeight: cellStatus === "completed" ? 700 : 500, color: "#5C3D2E" }}>
                    {day}
                </Typography>
            </TableCell>
        );
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#EFE7DA", p: { xs: 2, md: 4 } }}>

            <HeadingCard
                title="My Therapies"
                subtitle="Access and review your diagnostic test results, clinical summaries, and past medical documents all in one place. Stay informed and track your health history effortlessly."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "therapies" }
                ]}
            />

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 2,
                            justifyContent: "space-between",
                            mb: 4,

                            // responsive width for each card
                            "& > div": {
                                flex: "1 1 calc(25% - 16px)",   // 4 cards in desktop
                            },

                            "@media (max-width: 1200px)": {
                                "& > div": {
                                    flex: "1 1 calc(33.33% - 16px)", // 3 per row
                                },
                            },

                            "@media (max-width: 900px)": {
                                "& > div": {
                                    flex: "1 1 calc(50% - 16px)", // 2 per row
                                },
                            },

                            "@media (max-width: 600px)": {
                                "& > div": {
                                    flex: "1 1 100%", // 1 per row
                                },
                            },
                        }}
                    >
                        <DashboardCard title="Total Therapies" count={total} />
                        <DashboardCard title="Completed" count={completed} />
                        <DashboardCard title="In Progress" count={inProgress} />
                        <DashboardCard title="Upcoming" count={upcoming} />
                    </Box>

                    {therapies.length === 0 ? (
                        <Box sx={{ textAlign: "center", padding: "40px", color: "#666" }}>
                            <Typography variant="h6" sx={{ marginBottom: 1 }}>
                                No Therapies Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                You don't have any therapies scheduled yet. Therapies will appear here once they are prescribed by a doctor.
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={5}>
                            {therapies.map((therapy) => (
                                <Grid item xs={12} key={therapy.id || therapy._id}>
                                    <Card sx={{ borderRadius: 5, overflow: "hidden", boxShadow: "0 15px 40px rgba(92, 61, 46, 0.15)", border: "2px solid #D6D2C4" }}>
                                        <Box sx={{ bgcolor: "#5C3D2E", color: "white", p: 4 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                                                <Box>
                                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                                        {therapy.name || "Unnamed Therapy"}
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                                        Prescribed by: {therapy.prescribedBy || "N/A"} • Duration: {therapy.duration || "N/A"}
                                                    </Typography>
                                                </Box>
                                                <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
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
                                            {therapy.monthYearLabel && (
                                                <Typography variant="h6" sx={{ color: "#5C3D2E", fontWeight: 700, mb: 2, textAlign: "center" }}>
                                                    {therapy.monthYearLabel}
                                                </Typography>
                                            )}
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
                                                                    const therapyDate = therapy.dates && therapy.dates[cellIndex] ? therapy.dates[cellIndex] : null;
                                                                    return renderCalendarCell(therapyDate);
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
                    )}
                </>
            )}


        </Box>
    );
};

export default Therapies_View;