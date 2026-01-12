/**
 * Test Notification Utilities
 * 
 * Helper functions to test Firebase notifications
 */

import notificationService from '../services/notificationService';
import firebaseService from '../services/firebaseService';

/**
 * Test payment reminders API
 */
export const testPaymentReminders = async () => {
    try {
        console.log('Testing payment reminders...');
        const response = await notificationService.getPaymentReminders();
        console.log('Payment reminders response:', response);
        return response;
    } catch (error) {
        console.error('Error testing payment reminders:', error);
        throw error;
    }
};

/**
 * Test DOB reminders API
 */
export const testDOBReminders = async (daysAhead = 7) => {
    try {
        console.log('Testing DOB reminders...');
        const response = await notificationService.getDOBReminders(daysAhead);
        console.log('DOB reminders response:', response);
        return response;
    } catch (error) {
        console.error('Error testing DOB reminders:', error);
        throw error;
    }
};

/**
 * Test FCM token registration
 */
export const testTokenRegistration = async () => {
    try {
        console.log('Testing FCM token registration...');
        const token = await firebaseService.initializeNotifications();
        if (token) {
            console.log('FCM Token:', token);
            await notificationService.registerToken(token);
            console.log('Token registered successfully');
            return token;
        } else {
            console.warn('No FCM token generated');
            return null;
        }
    } catch (error) {
        console.error('Error testing token registration:', error);
        throw error;
    }
};

/**
 * Test sending a notification
 */
export const testSendNotification = async (title = 'Test Notification', body = 'This is a test') => {
    try {
        console.log('Testing send notification...');
        const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/notifications/test`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, body }),
            }
        );
        const data = await response.json();
        console.log('Test notification response:', data);
        return data;
    } catch (error) {
        console.error('Error testing send notification:', error);
        throw error;
    }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
    console.log('=== Starting Notification Tests ===');
    
    try {
        // Test 1: Token Registration
        console.log('\n1. Testing FCM Token Registration...');
        await testTokenRegistration();
        
        // Test 2: Payment Reminders
        console.log('\n2. Testing Payment Reminders...');
        await testPaymentReminders();
        
        // Test 3: DOB Reminders
        console.log('\n3. Testing DOB Reminders...');
        await testDOBReminders();
        
        // Test 4: Send Test Notification
        console.log('\n4. Testing Send Notification...');
        await testSendNotification();
        
        console.log('\n=== All Tests Completed ===');
    } catch (error) {
        console.error('\n=== Test Failed ===', error);
    }
};

// Make functions available in browser console
if (typeof window !== 'undefined') {
    window.testNotifications = {
        testPaymentReminders,
        testDOBReminders,
        testTokenRegistration,
        testSendNotification,
        runAllTests,
    };
    
    console.log('Test utilities available! Use: window.testNotifications.runAllTests()');
}

