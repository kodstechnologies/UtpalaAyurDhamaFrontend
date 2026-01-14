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

            console.log(`[adminUserService] Fetching ${userType} with ID: ${id}`);
            console.log(`[adminUserService] Endpoint: ${getApiUrl(endpoint)}`);
            
            const response = await axios.get(
                getApiUrl(endpoint),
                { headers: getAuthHeaders() }
            );
            
            console.log(`[adminUserService] Response:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`[adminUserService] Error fetching ${userType}:`, error);
            console.error(`[adminUserService] Error response:`, error.response?.data);
            // Return the error response data if available, otherwise throw
            if (error.response?.data) {
                return error.response.data;
            }
            throw error.message || "Failed to fetch user";
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
    },

    // Check Email Availability
    checkEmailAvailability: async (email, userType, excludeUserId = null) => {
        try {
            // For Patient, use a different endpoint
            if (userType === "Patient") {
                const response = await axios.get(
                    getApiUrl("patients"),
                    { headers: getAuthHeaders() }
                );
                
                if (response.data.success && response.data.data) {
                    const patients = Array.isArray(response.data.data) ? response.data.data : 
                                    (response.data.data.patients || []);
                    
                    const existingPatient = patients.find(patient => {
                        const patientEmail = patient.email || patient.user?.email;
                        const patientId = patient._id || patient.id || patient.user?._id || patient.user?.id;
                        return patientEmail?.toLowerCase() === email.toLowerCase() && 
                               (!excludeUserId || patientId !== excludeUserId);
                    });
                    
                    return { available: !existingPatient, exists: !!existingPatient };
                }
                
                return { available: true, exists: false };
            }
            
            // Get all users of the specified type
            const response = await adminUserService.getAllUsers(userType);
            
            if (response.success && response.data) {
                const users = Array.isArray(response.data) ? response.data : 
                              (response.data.users || response.data.nurses || response.data.doctors || 
                               response.data.pharmacists || response.data.receptionists || 
                               response.data.therapists || []);
                
                // Check if email exists (excluding current user if editing)
                const existingUser = users.find(user => {
                    const userEmail = user.email || user.user?.email;
                    const userId = user._id || user.id || user.user?._id || user.user?.id;
                    return userEmail?.toLowerCase() === email.toLowerCase() && 
                           (!excludeUserId || userId !== excludeUserId);
                });
                
                return { available: !existingUser, exists: !!existingUser };
            }
            
            return { available: true, exists: false };
        } catch (error) {
            console.error("Error checking email availability:", error);
            // If error, assume available to not block user
            return { available: true, exists: false };
        }
    },

    // Check Phone Availability
    checkPhoneAvailability: async (phone, userType, excludeUserId = null) => {
        try {
            // Clean phone number (remove spaces, dashes, +91, 0 prefix)
            const cleanPhone = phone.replace(/[\s-]/g, "").replace(/^(\+91|0)/, "");
            
            if (!cleanPhone || cleanPhone.length !== 10) {
                return { available: true, exists: false };
            }
            
            // For Patient, use a different endpoint
            if (userType === "Patient") {
                const response = await axios.get(
                    getApiUrl("patients"),
                    { headers: getAuthHeaders() }
                );
                
                if (response.data.success && response.data.data) {
                    const patients = Array.isArray(response.data.data) ? response.data.data : 
                                    (response.data.data.patients || []);
                    
                    const existingPatient = patients.find(patient => {
                        const patientPhone = patient.phone || patient.user?.phone;
                        const patientId = patient._id || patient.id || patient.user?._id || patient.user?.id;
                        if (!patientPhone) return false;
                        const cleanPatientPhone = patientPhone.replace(/[\s-]/g, "").replace(/^(\+91|0)/, "");
                        return cleanPatientPhone === cleanPhone && 
                               (!excludeUserId || patientId !== excludeUserId);
                    });
                    
                    return { available: !existingPatient, exists: !!existingPatient };
                }
                
                return { available: true, exists: false };
            }
            
            // Get all users of the specified type
            const response = await adminUserService.getAllUsers(userType);
            
            if (response.success && response.data) {
                const users = Array.isArray(response.data) ? response.data : 
                              (response.data.users || response.data.nurses || response.data.doctors || 
                               response.data.pharmacists || response.data.receptionists || 
                               response.data.therapists || []);
                
                // Check if phone exists (excluding current user if editing)
                const existingUser = users.find(user => {
                    const userPhone = user.phone || user.user?.phone;
                    const userId = user._id || user.id || user.user?._id || user.user?.id;
                    if (!userPhone) return false;
                    const cleanUserPhone = userPhone.replace(/[\s-]/g, "").replace(/^(\+91|0)/, "");
                    return cleanUserPhone === cleanPhone && 
                           (!excludeUserId || userId !== excludeUserId);
                });
                
                return { available: !existingUser, exists: !!existingUser };
            }
            
            return { available: true, exists: false };
        } catch (error) {
            console.error("Error checking phone availability:", error);
            // If error, assume available to not block user
            return { available: true, exists: false };
        }
    }
};

export default adminUserService;
