import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, TextField, Typography, CircularProgress } from "@mui/material";
import HeadingCard from "../../../components/card/HeadingCard";
import SubmitButton from "../../../components/buttons/SubmitButton";
import CancelButton from "../../../components/buttons/CancelButton";
import TitleIcon from "@mui/icons-material/Title";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import swarnaBinduEventService from "../../../services/swarnaBinduEventService";

function SwarnaBinduEvents_Add() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!title || title.trim().length < 2) {
            newErrors.title = "Event title is required (min 2 characters)";
        }
        if (!eventDate) {
            newErrors.eventDate = "Event date is required";
        }
        if (description && description.length > 1000) {
            newErrors.description = "Description must be 1000 characters or less";
        }
        if (location && location.length > 200) {
            newErrors.location = "Location must be 200 characters or less";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                eventDate: eventDate,
                startTime: startTime.trim() || "",
                endTime: endTime.trim() || "",
                location: location.trim() || "",
                isActive: isActive,
            };
            
            const response = await swarnaBinduEventService.createEvent(payload);
            
            if (response.success) {
                toast.success("Swarna Bindu event created successfully");
                navigate("/admin/swarna-bindu-events/view");
            } else {
                toast.error(response.message || "Failed to create event");
            }
        } catch (error) {
            console.error("Error creating event:", error);
            const errorMessage = error.message || error.response?.data?.message || "Failed to create event";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Add Swarna Bindu Event"
                subtitle="Create a new Swarna Bindu event."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Swarna Bindu Events", url: "/admin/swarna-bindu-events/view" },
                    { label: "Add" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-card)",
                    borderRadius: 4,
                    p: 4,
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-medium)",
                    mt: 3,
                }}
            >
                <form onSubmit={handleSubmit}>
                    {/* Title Field */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <TitleIcon fontSize="small" />
                            <Typography variant="body1" fontWeight="semibold">
                                Event Title <span style={{ color: "red" }}>*</span>
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            placeholder="Enter event title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isSubmitting}
                            error={!!errors.title}
                            helperText={errors.title}
                            inputProps={{ maxLength: 200 }}
                        />
                    </Box>

                    {/* Event Date Field */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <CalendarTodayIcon fontSize="small" />
                            <Typography variant="body1" fontWeight="semibold">
                                Event Date <span style={{ color: "red" }}>*</span>
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            disabled={isSubmitting}
                            error={!!errors.eventDate}
                            helperText={errors.eventDate}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    {/* Start Time Field */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="body1" fontWeight="semibold">
                                Start Time
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            disabled={isSubmitting}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                        />
                    </Box>

                    {/* End Time Field */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="body1" fontWeight="semibold">
                                End Time
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            disabled={isSubmitting}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                        />
                    </Box>

                    {/* Location Field */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <LocationOnIcon fontSize="small" />
                            <Typography variant="body1" fontWeight="semibold">
                                Location
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            placeholder="Enter event location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            disabled={isSubmitting}
                            error={!!errors.location}
                            helperText={errors.location}
                            inputProps={{ maxLength: 200 }}
                        />
                    </Box>

                    {/* Description Field */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <DescriptionIcon fontSize="small" />
                            <Typography variant="body1" fontWeight="semibold">
                                Description
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Enter event description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSubmitting}
                            error={!!errors.description}
                            helperText={errors.description}
                            inputProps={{ maxLength: 1000 }}
                        />
                    </Box>

                    {/* Submit and Cancel Buttons */}
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 4 }}>
                        <CancelButton
                            onClick={() => navigate("/admin/swarna-bindu-events/view")}
                            disabled={isSubmitting}
                        />
                        <SubmitButton
                            type="submit"
                            disabled={isSubmitting}
                            loading={isSubmitting}
                        />
                    </Box>
                </form>
            </Box>
        </Box>
    );
}

export default SwarnaBinduEvents_Add;

