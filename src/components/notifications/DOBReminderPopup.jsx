/**
 * Staff DOB Reminder Popup Component
 * 
 * Displays a popup notification for staff birthday reminders
 */

import { useState, useEffect } from 'react';
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
    Chip,
    IconButton,
    Divider,
    Alert,
    Card,
    CardContent
} from '@mui/material';
import {
    Close as CloseIcon,
    Cake as CakeIcon,
    Celebration as CelebrationIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

function DOBReminderPopup({ open, onClose, reminders = [] }) {
    const [selectedReminders, setSelectedReminders] = useState([]);

    useEffect(() => {
        if (open && reminders.length > 0) {
            setSelectedReminders(reminders);
        }
    }, [open, reminders]);

    const handleDismiss = (reminderId) => {
        setSelectedReminders(prev => prev.filter(r => r.id !== reminderId));
        if (selectedReminders.length === 1) {
            onClose();
        }
    };

    const handleDismissAll = () => {
        setSelectedReminders([]);
        onClose();
    };

    const getDaysUntilBirthday = (dob) => {
        const today = new Date();
        const birthday = new Date(dob);
        birthday.setFullYear(today.getFullYear());
        
        if (birthday < today) {
            birthday.setFullYear(today.getFullYear() + 1);
        }
        
        const diffTime = birthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getReminderType = (dob) => {
        const daysUntil = getDaysUntilBirthday(dob);
        if (daysUntil === 0) {
            return { type: 'today', label: 'Today', color: 'success' };
        } else if (daysUntil <= 7) {
            return { type: 'upcoming', label: `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`, color: 'warning' };
        }
        return null;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!open || selectedReminders.length === 0) {
        return null;
    }

    // Sort reminders: today first, then upcoming
    const sortedReminders = [...selectedReminders].sort((a, b) => {
        const daysA = getDaysUntilBirthday(a.dateOfBirth);
        const daysB = getDaysUntilBirthday(b.dateOfBirth);
        return daysA - daysB;
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                bgcolor: 'primary.light',
                color: 'white',
                pb: 1
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CelebrationIcon />
                    <Typography variant="h6" component="div">
                        Birthday Reminders
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ color: 'white' }}
                    size="small"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    {sortedReminders.length} staff member{sortedReminders.length > 1 ? 's' : ''} {sortedReminders.length > 1 ? 'have' : 'has'} birthday{sortedReminders.length > 1 ? 's' : ''} coming up!
                </Alert>

                <List>
                    {sortedReminders.map((reminder, index) => {
                        const reminderInfo = getReminderType(reminder.dateOfBirth);
                        const isToday = reminderInfo?.type === 'today';

                        return (
                            <Box key={reminder.id || index}>
                                <Card
                                    sx={{
                                        mb: 2,
                                        bgcolor: isToday ? 'success.lighter' : 'background.paper',
                                        border: isToday ? '2px solid' : '1px solid',
                                        borderColor: isToday ? 'success.main' : 'divider',
                                        '&:hover': {
                                            boxShadow: 3,
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemAvatar>
                                                <Avatar 
                                                    sx={{ 
                                                        bgcolor: isToday ? 'success.main' : 'primary.main',
                                                        width: 56,
                                                        height: 56
                                                    }}
                                                >
                                                    {isToday ? <CelebrationIcon /> : <CakeIcon />}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <Typography variant="h6" fontWeight={600}>
                                                            {reminder.name || 'Unknown Staff'}
                                                        </Typography>
                                                        {reminderInfo && (
                                                            <Chip
                                                                label={reminderInfo.label}
                                                                color={reminderInfo.color}
                                                                size="small"
                                                                icon={isToday ? <CelebrationIcon /> : <CakeIcon />}
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {reminder.designation || reminder.role || 'Staff Member'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Birthday: {formatDate(reminder.dateOfBirth)}
                                                        </Typography>
                                                        {reminder.department && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                Department: {reminder.department}
                                                            </Typography>
                                                        )}
                                                        {isToday && (
                                                            <Typography variant="body2" color="success.main" fontWeight={600} sx={{ mt: 0.5 }}>
                                                                🎉 Happy Birthday! 🎉
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    </CardContent>
                                </Card>
                                {index < sortedReminders.length - 1 && <Divider sx={{ my: 1 }} />}
                            </Box>
                        );
                    })}
                </List>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleDismissAll} color="inherit">
                    Dismiss All
                </Button>
                <Button onClick={onClose} variant="contained" color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DOBReminderPopup;

