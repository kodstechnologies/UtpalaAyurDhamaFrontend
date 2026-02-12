/**
 * Centralized API Configuration
 * 
 * This file contains the base URL for all API calls.
 * When deploying to production, update the VITE_API_BASE_URL environment variable
 * or modify the default value below.
 * 
 * Usage:
 *   import { API_BASE_URL, getApiUrl, getAuthHeaders } from '@/config/api';
 *   const response = await fetch(getApiUrl('users/login'), { headers: getAuthHeaders() });
 */

// Get API base URL from environment variable or auto-detect based on hostname
const getApiBaseUrl = () => {
    // If explicitly set via environment variable, use it
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Auto-detect production vs development
    const hostname = window.location.hostname;
    
    // Production domain
    if (hostname === 'hms.utpalaayurdhama.com' || hostname.includes('utpalaayurdhama.com')) {
        // Production backend URL
        return "https://api.utpalaayurdhama.com/api/v1";
    }
    
    // Development/localhost
    return "http://localhost:8000/api/v1";
};

export const API_BASE_URL = getApiBaseUrl();

// Debug logging (remove in production if needed)
if (typeof window !== 'undefined') {
    console.log('API Configuration:', {
        hostname: window.location.hostname,
        apiBaseUrl: API_BASE_URL,
        envVar: import.meta.env.VITE_API_BASE_URL
    });
}

/**
 * Helper function to get the full API URL for an endpoint
 * @param {string} endpoint - The API endpoint (e.g., "/patients/dashboard")
 * @returns {string} The full URL
 */
export const getApiUrl = (endpoint) => {
    const cleanEndpoint = endpoint.startsWith("/")
        ? endpoint.slice(1)
        : endpoint;

    return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const getAuthToken = () => {
    try {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        if (token) return token;

        const user = JSON.parse(localStorage.getItem("user") || "null");
        const userToken = user?.token || user?.accessToken || null;

        return userToken;
    } catch {
        return null;
    }
};

/**
 * Helper function to create headers with authentication
 * @param {Object} additionalHeaders - Additional custom headers
 * @returns {Object} Headers object with Content-Type + Authorization
 */
export const getAuthHeaders = (additionalHeaders = {}) => {
    const headers = {
        "Content-Type": "application/json",
        ...additionalHeaders,
    };

    const token = getAuthToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    } else {
        console.warn("No auth token found in localStorage for request headers");
        console.warn("Available localStorage keys:", Object.keys(localStorage));
    }

    return headers;
};

/**
 * Get axios configuration with timeout and error handling
 * @param {Object} options - Additional axios options
 * @returns {Object} Axios configuration object
 */
export const getAxiosConfig = (options = {}) => {
    return {
        timeout: 30000, // 30 seconds timeout
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {}),
        },
    };
};

/**
 * Handle axios errors with better error messages
 * @param {Error} error - Axios error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
    if (!error) return "An unexpected error occurred";

    // Network error (no response from server)
    if (error.code === "ECONNABORTED" || error.message === "Network Error" || !error.response) {
        if (error.code === "ECONNABORTED") {
            return "Request timeout. Please check your connection and try again.";
        }
        return "Network error. Please check your internet connection and ensure the server is running.";
    }

    // HTTP error responses
    if (error.response) {
        const status = error.response.status;
        const message = error.response?.data?.message || error.response?.data?.error;

        if (status === 401) {
            return "Session expired. Please login again.";
        }
        if (status === 403) {
            return "You don't have permission to perform this action.";
        }
        if (status === 404) {
            return "Resource not found.";
        }
        if (status === 409) {
            return message || "Conflict: This resource already exists.";
        }
        if (status >= 500) {
            return "Server error. Please try again later.";
        }

        return message || `Error ${status}: ${error.response.statusText}`;
    }

    return error.message || "An unexpected error occurred";
};