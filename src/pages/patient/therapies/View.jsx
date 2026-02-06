import React, { useState, useEffect, useCallback, useMemo } from "react";
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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    Avatar,
} from "@mui/material";
import {
    CheckCircle,
    Cancel,
    Circle,
    ChevronLeft,
    ChevronRight,
    CalendarMonth,
    AccessTime,
    Person,
    LocalHospital,
    Info,
    Visibility
} from "@mui/icons-material";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import therapyService from "../../../services/therapyService";

const Therapies_View = () => {
    const [therapiesRaw, setTherapiesRaw] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedDateSessions, setSelectedDateSessions] = useState([]);
    const [selectedDayLabel, setSelectedDayLabel] = useState("");

    const fetchTherapies = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await therapyService.getPatientTherapies();
            if (response && response.success) {
                setTherapiesRaw(Array.isArray(response.data) ? response.data : []);
            } else {
                toast.error(response?.message || "Failed to fetch therapies");
            }
        } catch (error) {
            console.error("Error fetching therapies:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch therapies");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTherapies();
    }, [fetchTherapies]);

    // Grouping logic: Create a map of YYYY-MM-DD -> Array of session details
    const sessionsByDate = useMemo(() => {
        const map = new Map();
        therapiesRaw.forEach(therapy => {
            therapy.dates?.forEach(d => {
                if (d.date) {
                    const dateObj = new Date(d.date);
                    if (!isNaN(dateObj.getTime())) {
                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const dateKey = `${year}-${month}-${day}`;

                        const existing = map.get(dateKey) || [];
                        map.set(dateKey, [...existing, {
                            ...d,
                            therapyName: therapy.name,
                            prescribedBy: therapy.prescribedBy,
                            therapistName: therapy.therapistName,
                            therapyId: therapy._id,
                            duration: therapy.duration,
                            status: d.status || "upcoming",
                            timing: therapy.sessionTime || "10:00 AM" // Fallback if no specific time per slot
                        }]);
                    }
                }
            });
        });
        return map;
    }, [therapiesRaw]);

    // Calendar generation logic
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0-6

        const days = [];

        // Previous month padding
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, prevMonthLastDay - i);
            days.push({ date: d, currentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            days.push({ date: d, currentMonth: true });
        }

        // Next month padding to complete 6 weeks (42 days)
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            const d = new Date(year, month + 1, i);
            days.push({ date: d, currentMonth: false });
        }

        return days;
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleViewDetails = (dateKey, sessions) => {
        const dateObj = new Date(dateKey);
        setSelectedDayLabel(dateObj.toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' }));
        setSelectedDateSessions(sessions);
        setDetailsModalOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return '#6A8E3F';
            case 'absent': return '#B54545';
            case 'upcoming': return '#E8A84E';
            case 'in-progress': return '#5C3D2E';
            default: return '#9e9e9e';
        }
    };

    const renderCalendarCell = (dayInfo) => {
        const year = dayInfo.date.getFullYear();
        const month = String(dayInfo.date.getMonth() + 1).padStart(2, '0');
        const day = String(dayInfo.date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        const sessions = sessionsByDate.get(dateKey) || [];

        const now = new Date();
        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const isToday = todayKey === dateKey;

        return (
            <TableCell
                key={dateKey}
                sx={{
                    height: 120,
                    width: '14.28%',
                    p: 1,
                    verticalAlign: 'top',
                    border: '1px solid #E8E2D5',
                    bgcolor: dayInfo.currentMonth ? (isToday ? "#FFF9EB" : "#FDFBF7") : "#F4F0E5",
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': dayInfo.currentMonth ? { bgcolor: '#F9F5EC' } : {}
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: isToday ? 800 : (dayInfo.currentMonth ? 600 : 400),
                            color: dayInfo.currentMonth ? (isToday ? "#E8A84E" : "#5C3D2E") : "#999",
                            fontSize: '1rem'
                        }}
                    >
                        {dayInfo.date.getDate()}
                    </Typography>
                    {isToday && (
                        <Chip label="Today" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#E8A84E', color: 'white' }} />
                    )}
                </Box>

                <Stack spacing={0.5} sx={{ overflow: 'hidden', maxHeight: 60 }}>
                    {sessions.slice(0, 2).map((s, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                bgcolor: `${getStatusColor(s.status)}15`,
                                p: 0.4,
                                borderRadius: 0.5,
                                borderLeft: `3px solid ${getStatusColor(s.status)}`
                            }}
                        >
                            <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: getStatusColor(s.status), fontSize: '0.65rem' }}>
                                {s.therapyName}
                            </Typography>
                        </Box>
                    ))}
                    {sessions.length > 2 && (
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.6rem', pl: 0.5 }}>
                            +{sessions.length - 2} more
                        </Typography>
                    )}
                </Stack>

                {sessions.length > 0 && dayInfo.currentMonth && (
                    <Button
                        size="small"
                        startIcon={<Visibility sx={{ fontSize: '0.8rem !important' }} />}
                        onClick={() => handleViewDetails(dateKey, sessions)}
                        sx={{
                            position: 'absolute',
                            bottom: 4,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            color: '#5C3D2E',
                            textTransform: 'none',
                            minWidth: 'auto',
                            p: '2px 8px',
                            '&:hover': { bgcolor: 'rgba(92, 61, 46, 0.1)' }
                        }}
                    >
                        DETAILS
                    </Button>
                )}
            </TableCell>
        );
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#EFE7DA", p: { xs: 2, md: 4 } }}>
            <HeadingCard
                title="Unified Therapy Calendar"
                subtitle="Track all your prescribed therapies in one beautiful, monthly view. Click on any day to see detailed schedules and assignments."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Therapies" }
                ]}
            />

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress sx={{ color: '#5C3D2E' }} />
                </Box>
            ) : (
                <Box sx={{ maxWidth: 1400, margin: "0 auto" }}>
                    {/* Month Controls */}
                    <Paper
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 4,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            bgcolor: '#5C3D2E',
                            color: 'white',
                            boxShadow: '0 10px 30px rgba(92, 61, 46, 0.2)'
                        }}
                    >
                        <IconButton onClick={handlePrevMonth} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                            <ChevronLeft />
                        </IconButton>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <CalendarMonth sx={{ fontSize: '2rem' }} />
                            <Typography variant="h4" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </Typography>
                        </Stack>
                        <IconButton onClick={handleNextMonth} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                            <ChevronRight />
                        </IconButton>
                    </Paper>

                    {/* Stats */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={6} md={3}>
                            <DashboardCard title="Total Plans" count={therapiesRaw.length} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <DashboardCard title="Ongoing" count={therapiesRaw.filter(t => t.status === "in-progress").length} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <DashboardCard title="Completed" count={therapiesRaw.filter(t => t.status === "completed").length} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card sx={{ p: 2, height: '100%', borderRadius: 3, bgcolor: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E8E2D5' }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                                        <Chip icon={<Circle sx={{ color: '#6A8E3F !important', fontSize: '10px' }} />} label="Completed" size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                                        <Chip icon={<Circle sx={{ color: '#E8A84E !important', fontSize: '10px' }} />} label="Upcoming" size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                                    </Box>
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Calendar Grid */}
                    <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', border: '2px solid #D6D2C4', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
                        <Table sx={{ tableLayout: 'fixed' }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#F4F0E5" }}>
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                        <TableCell key={day} align="center" sx={{ fontWeight: 800, color: "#5C3D2E", py: 2, borderBottom: '2px solid #E8E2D5' }}>
                                            {day}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[...Array(6)].map((_, weekIdx) => (
                                    <TableRow key={weekIdx}>
                                        {calendarDays.slice(weekIdx * 7, (weekIdx + 1) * 7).map(dayInfo => renderCalendarCell(dayInfo))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Details Modal */}
            <Dialog
                open={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, bgcolor: '#FDFBF7' }
                }}
            >
                <DialogTitle sx={{ bgcolor: '#5C3D2E', color: 'white', p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <CalendarMonth />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Therapies for {selectedDayLabel}</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Stack spacing={3} divider={<Divider />}>
                        {selectedDateSessions.map((session, idx) => (
                            <Box key={idx}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#5C3D2E' }}>
                                            {session.therapyName}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                            <Chip
                                                label={session.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: getStatusColor(session.status),
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: '#666' }}>
                                                <AccessTime sx={{ fontSize: '0.9rem' }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{session.timing}</Typography>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Stack>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Avatar sx={{ bgcolor: '#EFE7DA', width: 32, height: 32 }}>
                                                <LocalHospital sx={{ color: '#5C3D2E', fontSize: '1rem' }} />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>Prescribed By</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#5C3D2E' }}>{session.prescribedBy || "N/A"}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Avatar sx={{ bgcolor: '#EFE7DA', width: 32, height: 32 }}>
                                                <Person sx={{ color: '#5C3D2E', fontSize: '1rem' }} />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Therapist</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#5C3D2E' }}>{session.therapistName || "Not Assigned"}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#F4F0E5' }}>
                    <Button
                        onClick={() => setDetailsModalOpen(false)}
                        variant="contained"
                        sx={{
                            bgcolor: '#5C3D2E',
                            borderRadius: 2,
                            px: 4,
                            fontWeight: 700,
                            '&:hover': { bgcolor: '#4a3125' }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Therapies_View;
