import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const subTherapyService = {
    // Get all sub-therapies
    getAllSubTherapies: async (params = { page: 1, limit: 100 }) => {
        try {
            const response = await axios.get(getApiUrl("sub-therapies"), {
                headers: getAuthHeaders(),
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get sub-therapy by ID
    getSubTherapyById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`sub-therapies/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default subTherapyService;
