import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const getPatientHistory = async (patientId) => {
    try {
        const response = await axios.get(
            getApiUrl(`patients/${patientId}/history`),
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export default {
    getPatientHistory,
};

