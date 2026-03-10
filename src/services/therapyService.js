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

    // Get all therapies
    getAllTherapies: async (options = { page: 1, limit: 100 }) => {
        try {
            const response = await axios.get(getApiUrl("therapies"), {
                headers: getAuthHeaders(),
                params: {
                    page: options.page || 1,
                    limit: options.limit || 100,
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get therapy by ID
    getTherapyById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`therapies/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create therapy
    createTherapy: async (therapyData) => {
        try {
            const response = await axios.post(getApiUrl("therapies"), therapyData, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update therapy
    updateTherapy: async (id, therapyData) => {
        try {
            const response = await axios.patch(getApiUrl(`therapies/${id}`), therapyData, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete therapy
    deleteTherapy: async (id) => {
        try {
            const response = await axios.delete(getApiUrl(`therapies/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get therapy assignments
    getTherapyAssignments: async (options = { page: 1, limit: 100 }) => {
        try {
            const response = await axios.get(getApiUrl("therapies/assignments"), {
                headers: getAuthHeaders(),
                params: {
                    page: options.page || 1,
                    limit: options.limit || 100,
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Alias for getTherapyAssignments (for backward compatibility)
    getAllAssignments: async (options = { page: 1, limit: 100 }) => {
        try {
            const response = await axios.get(getApiUrl("therapies/assignments"), {
                headers: getAuthHeaders(),
                params: {
                    page: options.page || 1,
                    limit: options.limit || 100,
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get therapy assignment by ID
    getTherapyAssignmentById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`therapies/assignments/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Alias for getTherapyAssignmentById (for backward compatibility)
    getAssignmentById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`therapies/assignments/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Assign therapy
    assignTherapy: async (assignmentData) => {
        try {
            const response = await axios.post(getApiUrl("therapies/assign"), assignmentData, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Alias for assignTherapy (for backward compatibility)
    createAssignment: async (assignmentData) => {
        try {
            const response = await axios.post(getApiUrl("therapies/assign"), assignmentData, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update therapy assignment
    updateTherapyAssignment: async (id, assignmentData) => {
        try {
            const response = await axios.patch(getApiUrl(`therapies/assignments/${id}`), assignmentData, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Alias for updateTherapyAssignment (for backward compatibility)
    updateAssignment: async (id, assignmentData) => {
        try {
            const response = await axios.patch(getApiUrl(`therapies/assignments/${id}`), assignmentData, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete therapy assignment
    deleteTherapyAssignment: async (id) => {
        try {
            const response = await axios.delete(getApiUrl(`therapies/assignments/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default therapyService;
