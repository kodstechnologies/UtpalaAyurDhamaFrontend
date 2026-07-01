/**
 * Notification Service
 * 
 * Frontend service for notification-related API calls
 */

import axios from 'axios';
import { getApiUrl, getAuthHeaders } from '../config/api';

const notificationService = {
    /**
     * Register FCM token
     */
    registerToken: async (fcmToken) => {
        try {
            const response = await axios.post(
                getApiUrl('notifications/register-token'),
                { fcmToken },
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error registering token:', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get payment reminders
     */
    getPaymentReminders: async () => {
        try {
            const response = await axios.get(
                getApiUrl('notifications/payment-reminders'),
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching payment reminders:', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get DOB reminders
     */
    getDOBReminders: async (daysAhead = 7) => {
        try {
            const response = await axios.get(
                getApiUrl(`notifications/dob-reminders?daysAhead=${daysAhead}`),
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching DOB reminders:', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get Utpala event notifications
     */
    getEventNotifications: async (daysBack = 30) => {
        try {
            const response = await axios.get(
                getApiUrl(`notifications/event-notifications?daysBack=${daysBack}`),
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching event notifications:', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get missed therapy session notifications (therapist only)
     */
    getMissedTherapyNotifications: async (limit = 15) => {
        try {
            const response = await axios.get(
                getApiUrl(`notifications/missed-therapy-sessions?limit=${limit}`),
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching missed therapy notifications:', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Deactivate FCM token
     */
    deactivateToken: async (fcmToken) => {
        try {
            const response = await axios.post(
                getApiUrl('notifications/deactivate-token'),
                { fcmToken },
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error deactivating token:', error);
            throw error.response?.data || error.message;
        }
    },
};

export default notificationService;

