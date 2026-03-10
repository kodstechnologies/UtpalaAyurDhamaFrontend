/**
 * Payment Reminder Popup Component
 * 
 * Displays a popup notification for payment due/pending reminders
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
    Alert
} from '@mui/material';
import {
    Close as CloseIcon,
    Payment as PaymentIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function PaymentReminderPopup({ open, onClose, reminders = [] }) {
    const navigate = useNavigate();
    const [selectedReminders, setSelectedReminders] = useState([]);

    useEffect(() => {
        if (open && reminders.length > 0) {
            setSelectedReminders(reminders);
        }
    }, [open, reminders]);

    const handleViewDetails = (reminder) => {
        onClose();
        if (reminder.type === 'inpatient') {
            navigate(`/receptionist/inpatient-billing/${reminder.patientId}`);
        } else {
            navigate(`/receptionist/outpatient-billing/${reminder.patientId}`);
        }
    };

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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getReminderTypeColor = (type) => {
        return type === 'due' ? 'error' : 'warning';
    };

    const getReminderTypeLabel = (type) => {
        return type === 'due' ? 'Payment Due' : 'Payment Pending';
    };

    if (!open || selectedReminders.length === 0) {
        return null;
    }

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
                bgcolor: 'error.light',
                color: 'white',
                pb: 1
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentIcon />
                    <Typography variant="h6" component="div">
                        Payment Reminders
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
                    You have {selectedReminders.length} payment reminder{selectedReminders.length > 1 ? 's' : ''} that require attention.
                </Alert>

                <List>
                    {selectedReminders.map((reminder, index) => (
                        <Box key={reminder.id || index}>
                            <ListItem
                                sx={{
                                    bgcolor: reminder.type === 'due' ? 'error.lighter' : 'warning.lighter',
                                    borderRadius: 1,
                                    mb: 1,
                                    '&:hover': {
                                        bgcolor: reminder.type === 'due' ? 'error.light' : 'warning.light',
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: reminder.type === 'due' ? 'error.main' : 'warning.main' }}>
                                        {reminder.type === 'due' ? <WarningIcon /> : <PaymentIcon />}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {reminder.patientName || 'Unknown Patient'}
                                            </Typography>
                                            <Chip
                                                label={getReminderTypeLabel(reminder.type)}
                                                color={getReminderTypeColor(reminder.type)}
                                                size="small"
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Invoice: {reminder.invoiceNumber || 'N/A'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Amount Due: {formatCurrency(reminder.amountDue)}
                                            </Typography>
                                            {reminder.dueDate && (
                                                <Typography variant="body2" color="text.secondary">
                                                    Due Date: {new Date(reminder.dueDate).toLocaleDateString()}
                                                </Typography>
                                            )}
                                            {reminder.daysOverdue && (
                                                <Typography variant="body2" color="error">
                                                    {reminder.daysOverdue} day{reminder.daysOverdue > 1 ? 's' : ''} overdue
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleViewDetails(reminder)}
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        size="small"
                                        onClick={() => handleDismiss(reminder.id || index)}
                                    >
                                        Dismiss
                                    </Button>
                                </Box>
                            </ListItem>
                            {index < selectedReminders.length - 1 && <Divider sx={{ my: 1 }} />}
                        </Box>
                    ))}
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

export default PaymentReminderPopup;

