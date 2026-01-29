import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const receptionistService = {
    // Get receptionist dashboard summary
    getDashboardSummary: async () => {
        try {
            const response = await axios.get(getApiUrl("receptionists/dashboard/summary"), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching receptionist dashboard summary:", error);
            throw error.response?.data || error.message;
        }
    },

    // Get patients for marketing
    getMarketingPatients: async ({ page = 1, limit = 1000 } = {}) => {
        try {
            const response = await axios.get(
                getApiUrl(`marketing/patients?page=${page}&limit=${limit}`),
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching marketing patients:", error);
            throw error.response?.data || error.message;
        }
    },
};

export default receptionistService;

