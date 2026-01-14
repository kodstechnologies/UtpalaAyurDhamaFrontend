import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

/**
 * Service to handle User Profile API calls
 */
const profileService = {
  /**
   * Get current user's profile
   */
  getMyProfile: async () => {
    try {
      const response = await axios.get(
        getApiUrl("profile"),
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update current user's profile
   */
  updateMyProfile: async (profileData) => {
    try {
      const response = await axios.patch(
        getApiUrl("profile"),
        profileData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axios.post(
        getApiUrl("profile/picture"),
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default profileService;

