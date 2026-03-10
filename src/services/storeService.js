import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const storeService = {
    createStoreItem: async (data) => {
        try {
            const response = await axios.post(
                getApiUrl("store-inventory"),
                data,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getAllStoreItems: async (params = {}) => {
        try {
            const response = await axios.get(
                getApiUrl("store-inventory"),
                {
                    headers: getAuthHeaders(),
                    params,
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getStoreItemById: async (id) => {
        try {
            const response = await axios.get(
                getApiUrl(`store-inventory/${id}`),
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateStoreItem: async (id, data) => {
        try {
            const response = await axios.patch(
                getApiUrl(`store-inventory/${id}`),
                data,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteStoreItem: async (id) => {
        try {
            const response = await axios.delete(
                getApiUrl(`store-inventory/${id}`),
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getCategories: async () => {
        try {
            const response = await axios.get(
                getApiUrl("store-inventory/categories"),
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default storeService;
