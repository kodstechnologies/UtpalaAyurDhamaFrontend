import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const paymentService = {
    // Create a new payment record
    createPayment: async (paymentData) => {
        try {
            const response = await axios.post(getApiUrl("payments"), paymentData, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all payment records with pagination and filters
    getAllPayments: async (params = {}) => {
        try {
            const response = await axios.get(getApiUrl("payments"), {
                headers: getAuthHeaders(),
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get a single payment record by ID
    getPaymentById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`payments/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update a payment record
    updatePayment: async (id, updateData) => {
        try {
            const response = await axios.patch(getApiUrl(`payments/${id}`), updateData, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a payment record
    deletePayment: async (id) => {
        try {
            const response = await axios.delete(getApiUrl(`payments/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get payment report (summary + transactions or excel)
    getPaymentReport: async (params = {}) => {
        try {
            const config = {
                headers: getAuthHeaders(),
                params,
            };
            // If requesting excel, we need responseType blob
            if (params.format === 'excel') {
                config.responseType = 'blob';
            }

            const response = await axios.get(getApiUrl("payments/report"), config);
            // For excel, return full response for blob handling
            // For json, return data
            return params.format === 'excel' ? response : response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default paymentService;
