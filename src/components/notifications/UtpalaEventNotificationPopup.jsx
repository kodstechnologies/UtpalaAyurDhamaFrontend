import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Alert,
    Card,
    CardContent,
} from "@mui/material";
import {
    Close as CloseIcon,
    Event as EventIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const getEventCalendarPath = (role) => {
    const roleKey = role?.toLowerCase() || "";
    if (roleKey === "receptionist") return "/receptionist/swarna-bindu-events/calendar";
    if (roleKey === "therapist") return "/therapist/swarna-bindu-events/calendar";
    if (roleKey === "admin") return "/admin/swarna-bindu-events/calendar";
    return "/admin/swarna-bindu-events/calendar";
};

function UtpalaEventNotificationPopup({ open, onClose, events = [] }) {
    const navigate = useNavigate();
    const role = useSelector((state) => state.auth.role);
    const [selectedEvents, setSelectedEvents] = useState([]);

    useEffect(() => {
        if (open && events.length > 0) {
            setSelectedEvents(events);
        }
    }, [open, events]);

    const handleDismissAll = () => {
        setSelectedEvents([]);
        onClose();
    };

    const handleViewCalendar = () => {
        onClose();
        navigate(getEventCalendarPath(role));
    };

    if (!open || selectedEvents.length === 0) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onClose={handleDismissAll}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "primary.light",
                    color: "white",
                    pb: 1,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EventIcon />
                    <Typography variant="h6" component="div">
                        New Utpala Events
                    </Typography>
                </Box>
                <IconButton onClick={handleDismissAll} sx={{ color: "white" }} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    {selectedEvents.length} new Utpala event
                    {selectedEvents.length > 1 ? "s have" : " has"} been added.
                </Alert>

                <List>
                    {selectedEvents.map((event, index) => (
                        <Card
                            key={event.id || index}
                            sx={{
                                mb: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                "&:hover": { boxShadow: 3 },
                            }}
                        >
                            <CardContent>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: "warning.main", width: 48, height: 48 }}>
                                            <EventIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6" fontWeight={600}>
                                                {event.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {event.description}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            </CardContent>
                        </Card>
                    ))}
                </List>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleDismissAll} color="inherit">
                    Dismiss
                </Button>
                <Button onClick={handleViewCalendar} variant="contained" color="primary">
                    View Calendar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default UtpalaEventNotificationPopup;
