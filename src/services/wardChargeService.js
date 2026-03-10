import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const wardChargeService = {
    // Get all ward charges
    getAllWardCharges: async (params = {}) => {
        try {
            const response = await axios.get(getApiUrl("ward-charges"), {
                headers: getAuthHeaders(),
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get a single ward charge by ID
    getWardChargeById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`ward-charges/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create a new ward charge
    createWardCharge: async (wardChargeData) => {
        try {
            const response = await axios.post(
                getApiUrl("ward-charges"),
                wardChargeData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update an existing ward charge
    updateWardCharge: async (id, wardChargeData) => {
        try {
            const response = await axios.patch(
                getApiUrl(`ward-charges/${id}`),
                wardChargeData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update ward charge status
    updateWardChargeStatus: async (id, isActive) => {
        try {
            const response = await axios.patch(
                getApiUrl(`ward-charges/${id}/status`),
                { isActive },
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a ward charge
    deleteWardCharge: async (id) => {
        try {
            const response = await axios.delete(getApiUrl(`ward-charges/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default wardChargeService;

