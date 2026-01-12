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

// Get API base URL from environment variable or fallback
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8000/api/v1";

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
    }

    return headers;
};
