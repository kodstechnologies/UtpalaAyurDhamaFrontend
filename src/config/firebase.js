/**
 * Firebase Configuration
 * 
 * This file contains Firebase initialization and configuration.
 * Replace the placeholder values with your actual Firebase credentials.
 * 
 * To get your Firebase config:
 * 1. Go to Firebase Console (https://console.firebase.google.com/)
 * 2. Select your project
 * 3. Go to Project Settings > General
 * 4. Scroll down to "Your apps" section
 * 5. Click on the web app icon (</>) to get the config
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - Replace with your actual config
// These values will be provided by the user
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "your-measurement-id"
};

// Initialize Firebase
let app;
let messaging;
let db;

try {
    app = initializeApp(firebaseConfig);
    messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export const requestNotificationPermission = async () => {
    if (!messaging) {
        console.warn('Firebase messaging not available');
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "your-vapid-key"
            });
            console.log('FCM Token:', token);
            return token;
        } else {
            console.warn('Notification permission denied');
            return null;
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

/**
 * Listen for foreground messages
 * @param {Function} callback - Callback function to handle messages
 */
export const onMessageListener = (callback) => {
    if (!messaging) {
        console.warn('Firebase messaging not available');
        return () => {};
    }

    return onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        callback(payload);
    });
};

export { app, messaging, db };
export default app;

