/**
 * Custom Hook for Notifications
 * 
 * Manages notification state and Firebase integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import firebaseService from '../services/firebaseService';
import notificationService from '../services/notificationService';
import { toast } from 'react-toastify';

const getSeenEventIds = (userId) => {
    if (!userId) return [];
    try {
        return JSON.parse(localStorage.getItem(`utpala_seen_event_ids_${userId}`) || '[]');
    } catch {
        return [];
    }
};

const markEventsAsSeen = (userId, eventIds) => {
    if (!userId || !eventIds?.length) return;
    const seenIds = new Set(getSeenEventIds(userId));
    eventIds.forEach((id) => seenIds.add(id));
    localStorage.setItem(`utpala_seen_event_ids_${userId}`, JSON.stringify([...seenIds]));
};

const getToastedEventIds = (userId) => {
    if (!userId) return [];
    try {
        return JSON.parse(localStorage.getItem(`utpala_toasted_event_ids_${userId}`) || '[]');
    } catch {
        return [];
    }
};

const markEventsAsToasted = (userId, eventIds) => {
    if (!userId || !eventIds?.length) return;
    const toastedIds = new Set(getToastedEventIds(userId));
    eventIds.forEach((id) => toastedIds.add(id));
    localStorage.setItem(`utpala_toasted_event_ids_${userId}`, JSON.stringify([...toastedIds]));
};

export const useNotifications = () => {
    const authState = useSelector((state) => state.auth) || {};
    const { user, role } = authState;
    const [paymentReminders, setPaymentReminders] = useState([]);
    const [dobReminders, setDobReminders] = useState([]);
    const [eventNotifications, setEventNotifications] = useState([]);
    const [unseenEventNotifications, setUnseenEventNotifications] = useState([]);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [showDOBPopup, setShowDOBPopup] = useState(false);
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [fcmToken, setFcmToken] = useState(null);
    
    const staffRoles = ['admin', 'receptionist', 'doctor', 'nurse', 'therapist', 'pharmacist'];
    const userRole = role?.toLowerCase() || '';
    
    const shouldFetchPaymentReminders = userRole === 'receptionist';
    const shouldFetchDOBReminders = userRole && staffRoles.includes(userRole);
    const shouldFetchEventNotifications = Boolean(user && userRole);
    const shouldShowEventPopup = userRole === 'receptionist';
    const shouldInitializeFirebase = Boolean(user && userRole);
    const userId = user?._id || user?.id;

    const fetchPaymentReminders = useCallback(async () => {
        if (!shouldFetchPaymentReminders) {
            setPaymentReminders([]);
            return;
        }
        
        try {
            const response = await notificationService.getPaymentReminders();
            
            if (response.success && response.data) {
                const reminders = response.data.filter(r => r.amountDue > 0);
                setPaymentReminders(reminders);
                setShowPaymentPopup(reminders.length > 0);
            } else {
                setShowPaymentPopup(false);
            }
        } catch (error) {
            console.error('Error fetching payment reminders:', error);
            setShowPaymentPopup(false);
        }
    }, [shouldFetchPaymentReminders]);

    const fetchDOBReminders = useCallback(async () => {
        if (!shouldFetchDOBReminders) {
            setDobReminders([]);
            return;
        }
        
        try {
            const response = await notificationService.getDOBReminders(7);
            
            if (response.success && response.data) {
                const reminders = response.data.filter(r => r.daysUntil <= 7);
                setDobReminders(reminders);
                setShowDOBPopup(reminders.length > 0);
            } else {
                setShowDOBPopup(false);
            }
        } catch (error) {
            console.error('Error fetching DOB reminders:', error);
            setShowDOBPopup(false);
        }
    }, [shouldFetchDOBReminders]);

    const fetchEventNotifications = useCallback(async () => {
        if (!shouldFetchEventNotifications) {
            setEventNotifications([]);
            setUnseenEventNotifications([]);
            setShowEventPopup(false);
            return;
        }

        try {
            const response = await notificationService.getEventNotifications(30);

            if (response.success && response.data) {
                const events = response.data;
                setEventNotifications(events);

                if (shouldShowEventPopup && userId) {
                    const seenIds = getSeenEventIds(userId);
                    const unseenEvents = events.filter((event) => !seenIds.includes(event.id));
                    setUnseenEventNotifications(unseenEvents);

                    if (unseenEvents.length > 0) {
                        setShowEventPopup(true);

                        const toastedIds = getToastedEventIds(userId);
                        const newlyDetected = unseenEvents.filter((event) => !toastedIds.includes(event.id));
                        if (newlyDetected.length > 0) {
                            const newestEvent = newlyDetected[0];
                            toast.info(
                                newestEvent.title
                                    ? `New Utpala Event: ${newestEvent.title}`
                                    : 'New Utpala event created',
                            );
                            markEventsAsToasted(
                                userId,
                                newlyDetected.map((event) => event.id),
                            );
                        }
                    } else {
                        setShowEventPopup(false);
                    }
                }
            } else {
                setEventNotifications([]);
                setUnseenEventNotifications([]);
                setShowEventPopup(false);
            }
        } catch (error) {
            console.error('Error fetching event notifications:', error);
            setEventNotifications([]);
            setUnseenEventNotifications([]);
            setShowEventPopup(false);
        }
    }, [shouldFetchEventNotifications, shouldShowEventPopup, userId]);

    const dismissEventNotifications = useCallback(() => {
        if (!userId) {
            setShowEventPopup(false);
            return;
        }

        const unseenIds = unseenEventNotifications.map((event) => event.id);
        markEventsAsSeen(userId, unseenIds);
        setUnseenEventNotifications([]);
        setShowEventPopup(false);
    }, [userId, unseenEventNotifications]);

    const handleForegroundMessage = useCallback((payload) => {
        const notificationType = payload.data?.type || payload.notification?.data?.type;

        switch (notificationType) {
            case 'payment_reminder':
                fetchPaymentReminders();
                toast.info(payload.notification?.title || 'Payment reminder received');
                break;
            case 'dob_reminder':
                fetchDOBReminders();
                toast.info(payload.notification?.title || 'Birthday reminder received');
                break;
            case 'utpala_event':
                fetchEventNotifications();
                toast.info(payload.notification?.title || 'New Utpala event created');
                break;
            default:
                toast.info(payload.notification?.title || 'New notification');
        }
    }, [fetchPaymentReminders, fetchDOBReminders, fetchEventNotifications]);

    useEffect(() => {
        const initializeNotifications = async () => {
            if (!shouldInitializeFirebase || isInitialized) return;

            try {
                const token = await firebaseService.initializeNotifications();
                if (token) {
                    setFcmToken(token);
                    await notificationService.registerToken(token);
                }

                const unsubscribe = firebaseService.setupForegroundListener((payload) => {
                    handleForegroundMessage(payload);
                });

                setIsInitialized(true);

                return () => {
                    if (unsubscribe) unsubscribe();
                };
            } catch (error) {
                console.error('Error initializing notifications:', error);
            }
        };

        initializeNotifications();
    }, [user, userRole, isInitialized, shouldInitializeFirebase, handleForegroundMessage]);

    useEffect(() => {
        if (!user) return;

        if (shouldFetchPaymentReminders) {
            fetchPaymentReminders();
        }
        if (shouldFetchDOBReminders) {
            fetchDOBReminders();
        }
        if (shouldFetchEventNotifications) {
            fetchEventNotifications();
        }

        const interval = setInterval(() => {
            if (shouldFetchPaymentReminders) {
                fetchPaymentReminders();
            }
            if (shouldFetchDOBReminders) {
                fetchDOBReminders();
            }
            if (shouldFetchEventNotifications) {
                fetchEventNotifications();
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [
        user,
        shouldFetchPaymentReminders,
        shouldFetchDOBReminders,
        shouldFetchEventNotifications,
        fetchPaymentReminders,
        fetchDOBReminders,
        fetchEventNotifications,
    ]);

    return {
        paymentReminders,
        dobReminders,
        eventNotifications,
        unseenEventNotifications,
        showPaymentPopup,
        showDOBPopup,
        showEventPopup,
        setShowPaymentPopup,
        setShowDOBPopup,
        setShowEventPopup,
        dismissEventNotifications,
        fetchPaymentReminders,
        fetchDOBReminders,
        fetchEventNotifications,
        fcmToken,
        isInitialized,
    };
};
