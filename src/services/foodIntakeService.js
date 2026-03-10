import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const foodIntakeService = {
    // Get all food intakes with filters
    getAllFoodIntakes: async (params = {}) => {
        try {
            const response = await axios.get(getApiUrl("food-intakes"), {
                headers: getAuthHeaders(),
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get food intakes by inpatient and date
    getFoodIntakesByInpatientAndDate: async (inpatientId, date) => {
        try {
            const response = await axios.get(
                getApiUrl(`food-intakes/inpatient/${inpatientId}/date/${date}`),
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create a new food intake
    createFoodIntake: async (intakeData) => {
        try {
            const response = await axios.post(
                getApiUrl("food-intakes"),
                intakeData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update a food intake
    updateFoodIntake: async (id, intakeData) => {
        try {
            const response = await axios.patch(
                getApiUrl(`food-intakes/${id}`),
                intakeData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a food intake
    deleteFoodIntake: async (id) => {
        try {
            const response = await axios.delete(getApiUrl(`food-intakes/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default foodIntakeService;

