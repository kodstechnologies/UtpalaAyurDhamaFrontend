import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const doctorService = {
    // Get all doctors with pagination
    getAllDoctors: async (params = {}) => {
        try {
            const response = await axios.get(getApiUrl("doctors"), {
                headers: getAuthHeaders(),
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all doctor profiles (with user info populated)
    getAllDoctorProfiles: async (params = {}) => {
        try {
            const response = await axios.get(getApiUrl("doctors/profiles"), {
                headers: getAuthHeaders(),
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get a single doctor by ID
    getDoctorById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`doctors/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default doctorService;

