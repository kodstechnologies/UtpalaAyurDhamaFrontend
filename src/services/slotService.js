import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const slotService = {
    // Get all slots with pagination
    getAllSlots: async (params = {}) => {
        try {
            const response = await axios.get(getApiUrl("slots"), {
                headers: getAuthHeaders(),
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get a single slot by ID
    getSlotById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`slots/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create a new slot
    createSlot: async (slotData) => {
        try {
            const response = await axios.post(
                getApiUrl("slots"),
                slotData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update an existing slot
    updateSlot: async (id, slotData) => {
        try {
            const response = await axios.patch(
                getApiUrl(`slots/${id}`),
                slotData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a slot
    deleteSlot: async (id) => {
        try {
            const response = await axios.delete(getApiUrl(`slots/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default slotService;

