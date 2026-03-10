import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, Typography, Chip, Grid, Paper, TextField, CircularProgress } from "@mui/material";
import { Search as SearchIcon, X } from "@mui/icons-material";
import HeadingCard from "../../../../components/card/HeadingCard";
import SubmitButton from "../../../../components/buttons/SubmitButton";
import DashboardCard from "../../../../components/card/DashboardCard";
import CancelButton from "../../../../components/buttons/CancelButton";
import slotService from "../../../../services/slotService";
import doctorService from "../../../../services/doctorService";

const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

function Slot_Add() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [selectedDays, setSelectedDays] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Fetch doctors from backend
    useEffect(() => {
        const fetchDoctors = async () => {
            setIsLoading(true);
            try {
                const response = await doctorService.getAllDoctorProfiles({ page: 1, limit: 100 });
                if (response.success && response.data) {
                    setDoctors(response.data);
                } else {
                    toast.error(response.message || "Failed to fetch doctors");
                }
            } catch (error) {
                console.error("Error fetching doctors:", error);
                toast.error(error.message || "Failed to fetch doctors");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    // Filter doctors
    const filteredDoctors = doctors.filter(doc =>
        doc.user?.name?.toLowerCase().includes(search.toLowerCase())
    );

    // Select doctor
    const selectDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setSearch("");
        setShowDropdown(false);
    };

    // Toggle weekday
    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedDoctor) {
            toast.error("Please select a doctor");
            return;
        }

        if (!selectedDays.length) {
            toast.error("Please select at least one day");
            return;
        }

                if (!startTime || !endTime) {
            toast.error("Please select start and end time");
                    return;
                }

                if (startTime >= endTime) {
            toast.error("End time must be greater than start time");
                    return;
                }

        setIsSubmitting(true);
        try {
            const payload = {
                doctorid: selectedDoctor._id,
                days: selectedDays,
                startTime: startTime,
                endTime: endTime,
            };

            const response = await slotService.createSlot(payload);
            
            if (response.success) {
                toast.success("Slot created successfully");
                navigate("/admin/consultation/slot/view");
            } else {
                toast.error(response.message || "Failed to create slot");
            }
        } catch (error) {
            console.error("Error creating slot:", error);
            const errorMessage = error.message || error.response?.data?.message || "Failed to create slot";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* HEADER */}
            <HeadingCard
                title="Doctor Slot Availability"
                subtitle="Select a doctor, choose working days, and define consultation time slots."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Consultation Slots", url: "/admin/consultation/slot/view" },
                    { label: "Add Slot" },
                ]}
            />

            {/* MAIN CARD */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mt: 3,
                    borderRadius: 2,
                    backgroundColor: "var(--color-bg-card, #fff)",
                }}
            >
                {/* DOCTOR SELECT */}
                <Box sx={{ mb: 4, position: "relative" }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Select Doctor <span style={{ color: "var(--color-icon-1-light)" }}>*</span>
                    </Typography>

                    <TextField
                        fullWidth
                        placeholder="Search doctor..."
                        value={selectedDoctor ? selectedDoctor.user?.name : search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setSelectedDoctor(null);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
                        }}
                        sx={{ mb: 1 }}
                    />

                    {/* DROPDOWN */}
                    {showDropdown && !selectedDoctor && (
                        <Paper
                            sx={{
                                position: "absolute",
                                zIndex: 1000,
                                maxHeight: 160,
                                overflow: "auto",
                                width: "100%",
                                mt: 0.5,
                            }}
                            elevation={3}
                        >
                            {filteredDoctors.length > 0 ? (
                                filteredDoctors.map(doc => (
                                    <Box
                                        key={doc._id}
                                        onClick={() => selectDoctor(doc)}
                                        sx={{
                                            p: 2,
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: "action.hover" },
                                        }}
                                    >
                                        <Typography variant="body1">{doc.user?.name || "Unknown"}</Typography>
                                    </Box>
                                ))
                            ) : (
                                <Box sx={{ p: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No doctors found
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    )}

                    {/* CHANGE DOCTOR */}
                    {selectedDoctor && (
                        <Button
                            onClick={() => {
                                setSelectedDoctor(null);
                                setSearch("");
                                setShowDropdown(true);
                            }}
                            size="small"
                            color="error"
                        >
                            Change Doctor
                        </Button>
                    )}
                </Box>

                {/* STATS CARDS */}
                {selectedDays.length > 0 && (
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={6}>
                            <DashboardCard title="Selected Days" count={selectedDays.length} />
                        </Grid>
                    </Grid>
                )}

                {/* WEEK DAY SELECTION */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Available Days <span style={{ color: "var(--color-icon-1-light)" }}>*</span>
                    </Typography>

                    <Grid container spacing={1}>
                        {weekDays.map(day => {
                            const active = selectedDays.includes(day);
                            return (
                                <Grid item key={day}>
                                    <Chip
                                        label={day}
                                        onClick={() => toggleDay(day)}
                                        color={active ? "success" : "default"}
                                        variant={active ? "filled" : "outlined"}
                                        clickable
                                        sx={{ cursor: "pointer" }}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>
                    {selectedDays.length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Selected: {selectedDays.join(", ")}
                        </Typography>
                    )}
                </Box>

                {/* TIME SLOTS */}
                {selectedDays.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Time Slot <span style={{ color: "var(--color-icon-1-light)" }}>*</span>
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Start Time"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 300 }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="End Time"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 300 }}
                                    required
                                />
                            </Grid>
                            {startTime && endTime && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Time Range: {startTime} - {endTime}
                                        {startTime >= endTime && (
                                            <span style={{ color: "red", marginLeft: "8px" }}>
                                                (Invalid: End time must be after start time)
                                            </span>
                                        )}
                                    </Typography>
                                </Grid>
                            )}
                                                </Grid>
                    </Box>
                )}

                {/* ACTION */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <CancelButton onClick={() => navigate("/admin/consultation/slot/view")}>
                        <X size={16} style={{ marginRight: "8px" }} />
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        text={isSubmitting ? "Creating..." : "Save Availability"}
                        onClick={handleSubmit}
                    />
                </Box>
            </Paper>
        </Box>
    );
}

export default Slot_Add;
