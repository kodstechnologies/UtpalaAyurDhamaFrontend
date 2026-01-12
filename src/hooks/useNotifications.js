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
    const { user, role } = useSelector((state) => state.auth);
    const [paymentReminders, setPaymentReminders] = useState([]);
    const [dobReminders, setDobReminders] = useState([]);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [showDOBPopup, setShowDOBPopup] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [fcmToken, setFcmToken] = useState(null);
    
    // Only fetch notifications for Receptionist role
    const shouldFetchNotifications = role?.toLowerCase() === 'receptionist';

    // Initialize Firebase notifications
    useEffect(() => {
        const initializeNotifications = async () => {
            if (!user || isInitialized) return;

            try {
                // Request notification permission and get token
                const token = await firebaseService.initializeNotifications();
                if (token) {
                    setFcmToken(token);
                    // Save token to backend
                    await notificationService.registerToken(token);
                }

                // Setup foreground message listener
                const unsubscribe = firebaseService.setupForegroundListener((payload) => {
                    console.log('Foreground message received:', payload);
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
    }, [user, isInitialized]);

    // Fetch payment reminders
    const fetchPaymentReminders = useCallback(async () => {
        if (!shouldFetchNotifications) {
            setPaymentReminders([]);
            return;
        }
        
        try {
            console.log('📊 Fetching payment reminders...');
            const response = await notificationService.getPaymentReminders();
            console.log('📊 Payment reminders response:', response);
            
            if (response.success && response.data) {
                const reminders = response.data.filter(r => r.amountDue > 0);
                console.log('💰 Payment reminders found:', reminders.length, reminders);
                setPaymentReminders(reminders);
                
                // Show popup if there are reminders
                if (reminders.length > 0) {
                    console.log('✅ Showing payment reminder popup');
                    setShowPaymentPopup(true);
                } else {
                    console.log('ℹ️ No payment reminders, hiding popup');
                    setShowPaymentPopup(false);
                }
            } else {
                console.log('⚠️ Payment reminders response not successful:', response);
                setShowPaymentPopup(false);
            }
        } catch (error) {
            console.error('❌ Error fetching payment reminders:', error);
            setShowPaymentPopup(false);
        }
    }, [shouldFetchNotifications]);

    // Fetch DOB reminders
    const fetchDOBReminders = useCallback(async () => {
        if (!shouldFetchNotifications) {
            setDobReminders([]);
            return;
        }
        
        try {
            console.log('🎂 Fetching DOB reminders...');
            const response = await notificationService.getDOBReminders(7);
            console.log('🎂 DOB reminders response:', response);
            
            if (response.success && response.data) {
                const reminders = response.data.filter(r => r.daysUntil <= 7);
                console.log('🎉 DOB reminders found:', reminders.length, reminders);
                setDobReminders(reminders);
                
                // Show popup if there are reminders
                if (reminders.length > 0) {
                    console.log('✅ Showing DOB reminder popup');
                    setShowDOBPopup(true);
                } else {
                    console.log('ℹ️ No DOB reminders, hiding popup');
                    setShowDOBPopup(false);
                }
            } else {
                console.log('⚠️ DOB reminders response not successful:', response);
                setShowDOBPopup(false);
            }
        } catch (error) {
            console.error('❌ Error fetching DOB reminders:', error);
            setShowDOBPopup(false);
        }
    }, [shouldFetchNotifications]);

    // Handle foreground messages
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
            default:
                toast.info(payload.notification?.title || 'New notification');
        }
    }, [fetchPaymentReminders, fetchDOBReminders]);

    // Fetch reminders on mount and periodically
    // Note: Don't wait for Firebase initialization - popups work independently
    useEffect(() => {
        if (!user || !shouldFetchNotifications) {
            console.log('⏸️ No user or not authorized role, skipping notification fetch');
            return;
        }

        console.log('🚀 Starting notification interval (1 minute)');
        
        // Initial fetch immediately
        console.log('🔄 Initial fetch...');
        fetchPaymentReminders();
        fetchDOBReminders();

        // Set up periodic refresh (every 1 minute)
        const interval = setInterval(() => {
            console.log('🔄 Periodic refresh at', new Date().toLocaleTimeString());
            fetchPaymentReminders();
            fetchDOBReminders();
        }, 60 * 1000); // 1 minute (60 seconds)

        console.log('✅ Notification interval started');

        return () => {
            console.log('🛑 Clearing notification interval');
            clearInterval(interval);
        };
    }, [user, shouldFetchNotifications, fetchPaymentReminders, fetchDOBReminders]);

    return {
        paymentReminders,
        dobReminders,
        showPaymentPopup,
        showDOBPopup,
        setShowPaymentPopup,
        setShowDOBPopup,
        fetchPaymentReminders,
        fetchDOBReminders,
        fcmToken,
        isInitialized,
    };
};

