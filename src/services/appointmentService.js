import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const appointmentService = {
    // Get patient consultations (with examination data)
    getPatientConsultations: async (params = {}) => {
        try {
            const response = await axios.get(getApiUrl("appointments/patient/consultations"), {
                params,
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get appointment details
    getAppointmentDetails: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`appointments/${id}/details`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default appointmentService;

