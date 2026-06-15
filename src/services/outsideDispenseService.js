import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const outsideDispenseService = {
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(getApiUrl("pharmacists/outside-dispense"), {
                headers: getAuthHeaders(),
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`pharmacists/outside-dispense/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    create: async (payload) => {
        try {
            const response = await axios.post(
                getApiUrl("pharmacists/outside-dispense"),
                payload,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    update: async (id, payload) => {
        try {
            const response = await axios.patch(
                getApiUrl(`pharmacists/outside-dispense/${id}`),
                payload,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    delete: async (id) => {
        try {
            const response = await axios.delete(getApiUrl(`pharmacists/outside-dispense/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    recordPayment: async (id, payload) => {
        try {
            const response = await axios.post(
                getApiUrl(`pharmacists/outside-dispense/${id}/payment`),
                payload,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default outsideDispenseService;
