/**
 * Firebase Cloud Messaging Service Worker
 * 
 * This file handles background push notifications.
 * Place this file in the public folder of your React app.
 */

/* global firebase, importScripts */

// Import Firebase scripts (will be loaded from CDN)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase (replace with your config)
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};

// Initialize Firebase - firebase is available globally after importScripts
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/logo.png', // Add your app icon
        badge: '/logo.png',
        data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

