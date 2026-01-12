import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const therapistService = {
    // Get all therapists with pagination
    getAllTherapists: async (params = {}) => {
        try {
            const response = await axios.get(getApiUrl("therapists"), {
                headers: getAuthHeaders(),
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get a single therapist by ID
    getTherapistById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`therapists/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default therapistService;

