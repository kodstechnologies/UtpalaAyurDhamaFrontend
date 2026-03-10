// NotificationDrawer.jsx - Separate Component File
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaymentIcon from '@mui/icons-material/Payment';
import CakeIcon from '@mui/icons-material/Cake';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function NotificationDrawer({ open, onClose, paymentReminders = [], dobReminders = [] }) {
    const navigate = useNavigate();
    
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };
    
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };
    
    // Combine and format notifications
    const allNotifications = [
        ...paymentReminders.map((reminder) => ({
            id: `payment-${reminder.id}`,
            type: 'payment',
            title: `Payment Due: ${reminder.patientName}`,
            description: `Invoice #${reminder.invoiceNumber} - Amount Due: ${formatCurrency(reminder.amountDue)}`,
            time: formatDate(reminder.createdAt),
            unread: true,
            data: reminder,
        })),
        ...dobReminders.map((reminder) => ({
            id: `dob-${reminder.id}`,
            type: 'dob',
            title: reminder.daysUntil === 0 ? `🎉 Birthday Today!` : `Upcoming Birthday`,
            description: `${reminder.name} (${reminder.role}) - ${reminder.daysUntil === 0 ? 'Today!' : `in ${reminder.daysUntil} day${reminder.daysUntil > 1 ? 's' : ''}`}`,
            time: formatDate(reminder.dateOfBirth),
            unread: true,
            data: reminder,
        })),
    ];
    
    const totalNotifications = allNotifications.length;

    const handleNotificationClick = (notification) => {
        if (notification.type === 'payment' && notification.data?.invoiceId) {
            navigate(`/receptionist/payments/invoice/${notification.data.invoiceId}`);
        }
        onClose(); // Close drawer after interaction
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: 360,
                    maxWidth: '92vw',
                    height: '70%',
                    borderRadius: '12px 0 0 12px',
                    overflow: 'hidden',
                    boxShadow: '-4px 0 20px rgba(0,0,0,0.12)',
                    marginTop: '5rem',
                    marginRight: '.9rem',
                },
            }}
        >
            <Box sx={{ p: 2, bgcolor: "var(--color-primary)", color: "var(--color-text-white)" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Notifications ({totalNotifications})
                </Typography>
            </Box>

            <Divider />

            <List sx={{ p: 0, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
                {allNotifications.map((notification) => (
                    <ListItem
                        key={notification.id}
                        button
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                            alignItems: 'flex-start',
                            px: 2,
                            py: 1.5,
                            borderBottom: `1px solid var(--color-border)`,
                            bgcolor: notification.unread ? "rgba(205,152,125,0.12)" : "transparent",
                            transition: "background 0.25s ease",
                            '&:hover': { bgcolor: "rgba(205,152,125,0.22)" },
                            '&:last-child': { borderBottom: 'none' },
                            cursor: notification.type === 'payment' ? 'pointer' : 'default',
                        }}
                    >
                        <ListItemAvatar sx={{ minWidth: 42 }}>
                            {notification.type === 'payment' ? (
                                <PaymentIcon sx={{ color: "#f44336", fontSize: "1.5rem", mt: 0.5 }} />
                            ) : (
                                <CakeIcon sx={{ color: "#ff9800", fontSize: "1.5rem", mt: 0.5 }} />
                            )}
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                    {notification.title}
                                </Typography>
                            }
                            secondary={
                                <Box sx={{ mt: 0.5 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: "var(--color-text-muted)", display: "block", fontSize: "0.77rem" }}
                                    >
                                        {notification.description}
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                                        <AccessTimeIcon fontSize="inherit" sx={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }} />
                                        <Typography variant="caption" sx={{ color: "var(--color-text-muted)", fontSize: "0.75rem", fontWeight: 500 }}>
                                            {notification.time}
                                        </Typography>
                                    </Box>
                                </Box>
                            }
                        />
                    </ListItem>
                ))}

                {allNotifications.length === 0 && (
                    <ListItem sx={{ justifyContent: "center", py: 3 }}>
                        <ListItemText
                            primary="No notifications"
                            secondary="You're all caught up!"
                            sx={{ textAlign: "center", color: "var(--color-text-muted)" }}
                        />
                    </ListItem>
                )}
            </List>
        </Drawer>
    );
}

NotificationDrawer.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    paymentReminders: PropTypes.array,
    dobReminders: PropTypes.array,
};

export default NotificationDrawer;