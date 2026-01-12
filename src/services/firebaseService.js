/**
 * Firebase Service
 * 
 * Handles Firebase-related operations including:
 * - Notification token management
 * - Real-time notifications
 * - Firestore operations for notifications
 */

import { 
    collection, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs, 
    addDoc, 
    updateDoc, 
    doc,
    onSnapshot,
    Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { requestNotificationPermission, onMessageListener } from '../config/firebase';
import axios from 'axios';
import { getApiUrl, getAuthHeaders } from '../config/api';

const firebaseService = {
    /**
     * Initialize Firebase notifications
     * @returns {Promise<string|null>} FCM token
     */
    initializeNotifications: async () => {
        try {
            const token = await requestNotificationPermission();
            if (token) {
                // Save token to backend
                await firebaseService.saveTokenToBackend(token);
            }
            return token;
        } catch (error) {
            console.error('Error initializing notifications:', error);
            return null;
        }
    },

    /**
     * Save FCM token to backend
     * @param {string} token - FCM token
     */
    saveTokenToBackend: async (token) => {
        try {
            const response = await axios.post(
                getApiUrl('notifications/register-token'),
                { fcmToken: token },
                { headers: getAuthHeaders() }
            );
            console.log('Token saved to backend:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error saving token to backend:', error);
            throw error;
        }
    },

    /**
     * Listen for real-time notifications
     * @param {string} userId - User ID
     * @param {Function} callback - Callback function for new notifications
     */
    listenToNotifications: (userId, callback) => {
        if (!db) {
            console.warn('Firebase Firestore not available');
            return () => {};
        }

        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', userId),
            where('read', '==', false),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));
            callback(notifications);
        }, (error) => {
            console.error('Error listening to notifications:', error);
        });

        return unsubscribe;
    },

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     */
    markAsRead: async (notificationId) => {
        if (!db) {
            console.warn('Firebase Firestore not available');
            return;
        }

        try {
            const notificationRef = doc(db, 'notifications', notificationId);
            await updateDoc(notificationRef, {
                read: true,
                readAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    /**
     * Get unread notifications count
     * @param {string} userId - User ID
     * @returns {Promise<number>} Unread count
     */
    getUnreadCount: async (userId) => {
        if (!db) {
            return 0;
        }

        try {
            const notificationsRef = collection(db, 'notifications');
            const q = query(
                notificationsRef,
                where('userId', '==', userId),
                where('read', '==', false)
            );
            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    },

    /**
     * Setup foreground message listener
     * @param {Function} callback - Callback for foreground messages
     */
    setupForegroundListener: (callback) => {
        return onMessageListener((payload) => {
            callback(payload);
        });
    }
};

export default firebaseService;

