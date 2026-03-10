import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const consultationFeeService = {
    // Get all consultation fees with pagination and filters
    getAllConsultationFees: async (params = {}) => {
        try {
            const response = await axios.get(getApiUrl("doctor-consultation-fees"), {
                headers: getAuthHeaders(),
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get a single consultation fee by ID
    getConsultationFeeById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`doctor-consultation-fees/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create a new consultation fee
    createConsultationFee: async (feeData) => {
        try {
            const response = await axios.post(
                getApiUrl("doctor-consultation-fees"),
                feeData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update an existing consultation fee
    updateConsultationFee: async (id, feeData) => {
        try {
            const response = await axios.patch(
                getApiUrl(`doctor-consultation-fees/${id}`),
                feeData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a consultation fee
    deleteConsultationFee: async (id) => {
        try {
            const response = await axios.delete(getApiUrl(`doctor-consultation-fees/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default consultationFeeService;

