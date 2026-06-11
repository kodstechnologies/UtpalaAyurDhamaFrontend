import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const receptionistService = {
    // Get receptionist dashboard summary
    getDashboardSummary: async () => {
        try {
            const response = await axios.get(getApiUrl("receptionists/dashboard/summary"), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching receptionist dashboard summary:", error);
            throw error.response?.data || error.message;
        }
    },

    getMarketingContacts: async ({ search = null } = {}, signal = null) => {
        try {
            const config = { headers: getAuthHeaders() };
            if (signal) config.signal = signal;

            let queryString = "";
            if (search && search.trim()) {
                queryString = `?search=${encodeURIComponent(search.trim())}`;
            }

            const response = await axios.get(
                getApiUrl(`marketing/contacts${queryString}`),
                config
            );
            return response.data;
        } catch (error) {
            if (axios.isCancel(error) || error.name === "AbortError") throw error;
            console.error("Error fetching marketing contacts:", error);
            throw error.response?.data || error.message;
        }
    },

    addMarketingContact: async ({ name, contactNumber }) => {
        try {
            const response = await axios.post(
                getApiUrl("marketing/contacts"),
                { name, contactNumber },
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error("Error adding marketing contact:", error);
            throw error.response?.data || error.message;
        }
    },

    bulkAddMarketingContacts: async (contacts) => {
        try {
            const response = await axios.post(
                getApiUrl("marketing/contacts/bulk"),
                { contacts },
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error("Error bulk adding marketing contacts:", error);
            throw error.response?.data || error.message;
        }
    },

    updateMarketingContact: async (id, { name, contactNumber }) => {
        try {
            const response = await axios.put(
                getApiUrl(`marketing/contacts/${id}`),
                { name, contactNumber },
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error("Error updating marketing contact:", error);
            throw error.response?.data || error.message;
        }
    },

    deleteMarketingContact: async (id) => {
        try {
            const response = await axios.delete(
                getApiUrl(`marketing/contacts/${id}`),
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting marketing contact:", error);
            throw error.response?.data || error.message;
        }
    },

    // Get patients for marketing
    getMarketingPatients: async ({ page = 1, limit = 1000, search = null } = {}, signal = null) => {
        try {
            const config = {
                headers: getAuthHeaders(),
            };
            if (signal) {
                config.signal = signal;
            }
            
            // Build query string with search parameter if provided
            let queryString = `page=${page}&limit=${limit}`;
            if (search && search.trim()) {
                queryString += `&search=${encodeURIComponent(search.trim())}`;
            }
            
            const response = await axios.get(
                getApiUrl(`marketing/patients?${queryString}`),
                config
            );
            return response.data;
        } catch (error) {
            // Don't throw if request was cancelled
            if (axios.isCancel(error) || error.name === 'AbortError') {
                throw error;
            }
            console.error("Error fetching marketing patients:", error);
            throw error.response?.data || error.message;
        }
    },
};

export default receptionistService;

