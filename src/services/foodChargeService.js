import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const foodChargeService = {
    // Get all food charges with pagination and filters
    getAllFoodCharges: async (params = {}) => {
        try {
            const response = await axios.get(getApiUrl("food-charges"), {
                headers: getAuthHeaders(),
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get a single food charge by ID
    getFoodChargeById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`food-charges/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create a new food charge
    createFoodCharge: async (chargeData) => {
        try {
            const response = await axios.post(
                getApiUrl("food-charges"),
                chargeData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update an existing food charge
    updateFoodCharge: async (id, chargeData) => {
        try {
            const response = await axios.patch(
                getApiUrl(`food-charges/${id}`),
                chargeData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update food charge status
    updateFoodChargeStatus: async (id, isActive) => {
        try {
            const response = await axios.patch(
                getApiUrl(`food-charges/${id}/status`),
                { isActive },
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a food charge
    deleteFoodCharge: async (id) => {
        try {
            const response = await axios.delete(getApiUrl(`food-charges/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default foodChargeService;

