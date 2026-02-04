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

const getPatientDashboard = async () => {
    try {
        const response = await axios.get(
            getApiUrl(`patients/dashboard/summary`),
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getUpcomingReminders = async () => {
    try {
        const response = await axios.get(
            getApiUrl(`patients/reminders/upcoming`),
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export default {
    getPatientHistory,
    getPatientDashboard,
    getUpcomingReminders,
};

