import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const nurseService = {
    /**
     * Get nurse dashboard summary
     */
    getDashboardSummary: async () => {
        try {
            const response = await axios.get(
                getApiUrl("nurses/dashboard/summary"),
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    /**
     * Get outpatients allocated to a specific nurse
     */
    getOutpatientsByNurse: async (nurseId) => {
        try {
            const response = await axios.get(
                getApiUrl(`patients/nurse/${nurseId}/outpatients`),
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching outpatients by nurse:", error);
            throw error.response?.data || error.message;
        }
    },
};

export default nurseService;

