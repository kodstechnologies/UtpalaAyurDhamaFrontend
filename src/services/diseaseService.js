import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const diseaseService = {
  getAllDiseases: async (params = {}) => {
    try {
      const response = await axios.get(getApiUrl("diseases"), {
        headers: getAuthHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDiseaseById: async (id) => {
    try {
      const response = await axios.get(getApiUrl(`diseases/${id}`), {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createDisease: async (data) => {
    try {
      const response = await axios.post(getApiUrl("diseases"), data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateDisease: async (id, data) => {
    try {
      const response = await axios.patch(getApiUrl(`diseases/${id}`), data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateDiseaseStatus: async (id, isActive) => {
    try {
      const response = await axios.patch(
        getApiUrl(`diseases/${id}/status`),
        { isActive },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteDisease: async (id) => {
    try {
      const response = await axios.delete(getApiUrl(`diseases/${id}`), {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default diseaseService;

