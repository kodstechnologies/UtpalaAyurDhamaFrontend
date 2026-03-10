import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const pharmacistService = {
    getDashboardSummary: async () => {
        try {
            const response = await axios.get(getApiUrl("pharmacists/dashboard/summary"), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default pharmacistService;

