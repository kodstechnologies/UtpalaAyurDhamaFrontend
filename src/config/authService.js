import { API_BASE_URL } from '../config/api';

export const sendOtp = async (phone) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login/request-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone }),
            credentials: 'include',
        });

        // Check if response is ok
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: `Server error: ${response.status} ${response.statusText}` };
            }
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        // Check if response has content
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.warn('Non-JSON response:', text);
            throw new Error('Invalid response format from server');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        // Log the full error for debugging
        console.error('sendOtp error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // If it's already an Error object with a message, rethrow it
        if (error instanceof Error) {
            throw error;
        }
        
        // Otherwise, wrap it in an Error
        throw new Error(error.message || 'Failed to send OTP. Please check your connection and try again.');
    }
};


export const verifyOtp = async (phone, otp) => {
    const response = await fetch(`${API_BASE_URL}/users/login/verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Invalid OTP or an error occurred.' }));
        throw new Error(errorData.message);
    }

    const result = await response.json();

    // The API returns the token and user data nested under a `data` property
    if (result.success && result.data && result.data.accessToken) {
        return {
            ...result,
            token: result.data.accessToken, // Extract the token
            user: result.data.user,
        };
    }
    // Return a structure that matches the Promise type on failure
    return { ...result, token: '', user: { role: '' } };
};
export const logout = async () => {
    const response = await fetch(`${API_BASE_URL}/users/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Logout failed. Please try again.' }));
        // Even if logout fails on the server, we should probably log the user out on the client.
        // For now, we'll throw an error as per the existing pattern.
        throw new Error(errorData.message);
    }

    return response.json();
};
