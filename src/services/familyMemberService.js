import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const familyMemberService = {
    // Get all family members for current user
    getAllFamilyMembers: async () => {
        try {
            const response = await axios.get(getApiUrl("family-members"), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get a single family member by ID
    getFamilyMemberById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`family-members/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create a new family member
    createFamilyMember: async (data) => {
        try {
            const response = await axios.post(getApiUrl("family-members"), data, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update an existing family member
    updateFamilyMember: async (id, data) => {
        try {
            const response = await axios.patch(getApiUrl(`family-members/${id}`), data, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a family member
    deleteFamilyMember: async (id) => {
        try {
            const response = await axios.delete(getApiUrl(`family-members/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default familyMemberService;

