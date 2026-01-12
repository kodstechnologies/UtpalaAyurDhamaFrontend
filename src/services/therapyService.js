import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const therapyService = {
    // Get patient therapies (formatted for UI)
    getPatientTherapies: async () => {
        try {
            const response = await axios.get(getApiUrl("therapist-sessions/patient/my-therapies"), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default therapyService;
