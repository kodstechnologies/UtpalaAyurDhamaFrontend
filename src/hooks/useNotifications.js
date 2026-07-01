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

export const useNotifications = () => {
    const authState = useSelector((state) => state.auth) || {};
    const { user, role } = authState;
    const [paymentReminders, setPaymentReminders] = useState([]);
    const [dobReminders, setDobReminders] = useState([]);
    const [eventNotifications, setEventNotifications] = useState([]);
    const [missedTherapyNotifications, setMissedTherapyNotifications] = useState([]);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [showDOBPopup, setShowDOBPopup] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [fcmToken, setFcmToken] = useState(null);
    
    const staffRoles = ['admin', 'receptionist', 'doctor', 'nurse', 'therapist', 'pharmacist'];
    const userRole = role?.toLowerCase() || '';
    
    const shouldFetchPaymentReminders = userRole === 'receptionist';
    const shouldFetchDOBReminders = userRole && staffRoles.includes(userRole);
    const shouldFetchEventNotifications = Boolean(user && userRole);
    const shouldFetchMissedTherapyNotifications = userRole === 'therapist';
    const shouldInitializeFirebase = Boolean(user && userRole);

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
            return;
        }

        try {
            const response = await notificationService.getEventNotifications(30, 15);

            if (response.success && response.data) {
                setEventNotifications(response.data);
            } else {
                setEventNotifications([]);
            }
        } catch (error) {
            console.error('Error fetching event notifications:', error);
            setEventNotifications([]);
        }
    }, [shouldFetchEventNotifications]);

    const fetchMissedTherapyNotifications = useCallback(async () => {
        if (!shouldFetchMissedTherapyNotifications) {
            setMissedTherapyNotifications([]);
            return;
        }

        try {
            const response = await notificationService.getMissedTherapyNotifications(15);

            if (response.success && response.data) {
                setMissedTherapyNotifications(response.data);
            } else {
                setMissedTherapyNotifications([]);
            }
        } catch (error) {
            console.error('Error fetching missed therapy notifications:', error);
            setMissedTherapyNotifications([]);
        }
    }, [shouldFetchMissedTherapyNotifications]);

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
        if (shouldFetchMissedTherapyNotifications) {
            fetchMissedTherapyNotifications();
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
            if (shouldFetchMissedTherapyNotifications) {
                fetchMissedTherapyNotifications();
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [
        user,
        shouldFetchPaymentReminders,
        shouldFetchDOBReminders,
        shouldFetchEventNotifications,
        shouldFetchMissedTherapyNotifications,
        fetchPaymentReminders,
        fetchDOBReminders,
        fetchEventNotifications,
        fetchMissedTherapyNotifications,
    ]);

    return {
        paymentReminders,
        dobReminders,
        eventNotifications,
        missedTherapyNotifications,
        showPaymentPopup,
        showDOBPopup,
        setShowPaymentPopup,
        setShowDOBPopup,
        fetchPaymentReminders,
        fetchDOBReminders,
        fetchEventNotifications,
        fetchMissedTherapyNotifications,
        fcmToken,
        isInitialized,
    };
};
