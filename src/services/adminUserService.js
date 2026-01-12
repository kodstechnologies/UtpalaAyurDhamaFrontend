import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

/**
 * Service to handle Admin User Management API calls
 */
const adminUserService = {
    // Generic Create Function
    createUser: async (userType, userData) => {
        try {
            const endpoint = (() => {
                switch (userType) {
                    case "Doctor": return "admins/doctors";
                    case "Nurse": return "admins/nurses";
                    case "Pharmacist": return "admins/pharmacists";
                    case "Receptionist": return "admins/receptionists";
                    case "Therapist": return "admins/therapists";
                    case "Admin": return "admins";
                    default: throw new Error("Invalid user type");
                }
            })();

            const response = await axios.post(
                getApiUrl(endpoint),
                userData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Generic Delete Function
    deleteUser: async (userType, id) => {
        try {
            const endpoint = (() => {
                switch (userType) {
                    case "Doctor": return `admins/doctors/${id}`;
                    case "Nurse": return `admins/nurses/${id}`;
                    case "Pharmacist": return `admins/pharmacists/${id}`;
                    case "Receptionist": return `admins/receptionists/${id}`;
                    case "Therapist": return `admins/therapists/${id}`;
                    default: throw new Error("Invalid user type");
                }
            })();

            const response = await axios.delete(
                getApiUrl(endpoint),
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Generic Get By ID Function
    getUserById: async (userType, id) => {
        try {
            const endpoint = (() => {
                switch (userType) {
                    case "Doctor": return `admins/doctors/${id}`;
                    case "Nurse": return `admins/nurses/${id}`;
                    case "Pharmacist": return `admins/pharmacists/${id}`;
                    case "Receptionist": return `admins/receptionists/${id}`;
                    case "Therapist": return `admins/therapists/${id}`;
                    default: throw new Error("Invalid user type");
                }
            })();

            const response = await axios.get(
                getApiUrl(endpoint),
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Generic Get All Function
    getAllUsers: async (userType, params = {}) => {
        try {
            const endpoint = (() => {
                switch (userType) {
                    case "Doctor": return "admins/doctors";
                    case "Nurse": return "admins/nurses";
                    case "Pharmacist": return "admins/pharmacists";
                    case "Receptionist": return "admins/receptionists";
                    case "Therapist": return "admins/therapists";
                    case "Admin": return "admins";
                    default: throw new Error("Invalid user type");
                }
            })();

            const response = await axios.get(
                getApiUrl(endpoint),
                {
                    headers: getAuthHeaders(),
                    params
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Generic Update Function
    updateUser: async (userType, id, userData) => {
        try {
            const endpoint = (() => {
                switch (userType) {
                    case "Doctor": return `admins/doctors/${id}`;
                    case "Nurse": return `admins/nurses/${id}`;
                    case "Pharmacist": return `admins/pharmacists/${id}`;
                    case "Receptionist": return `admins/receptionists/${id}`;
                    case "Therapist": return `admins/therapists/${id}`;
                    default: throw new Error("Invalid user type");
                }
            })();

            const response = await axios.patch(
                getApiUrl(endpoint),
                userData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Upload Image Function
    uploadImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append("image", file);

            const url = getApiUrl("upload");
            console.log("Uploading image to:", url);
            const response = await axios.post(
                url,
                formData,
                {
                    headers: {
                        ...getAuthHeaders(),
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data; // Expected { success: true, data: { url: "..." } }
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default adminUserService;
