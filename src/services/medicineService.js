import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

/**
 * Service to handle Medicine Management API calls
 */
const medicineService = {
  /**
   * Create a new medicine
   */
  createMedicine: async (medicineData) => {
    try {
      const response = await axios.post(
        getApiUrl("pharmacists/medicines"),
        medicineData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all medicines with pagination and filters
   */
  getAllMedicines: async (params = {}) => {
    try {
      const response = await axios.get(
        getApiUrl("pharmacists/medicines"),
        {
          headers: getAuthHeaders(),
          params,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get medicine by ID
   */
  getMedicineById: async (id) => {
    try {
      const response = await axios.get(
        getApiUrl(`pharmacists/medicines/${id}`),
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update medicine
   */
  updateMedicine: async (id, medicineData) => {
    try {
      const response = await axios.patch(
        getApiUrl(`pharmacists/medicines/${id}`),
        medicineData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete medicine
   */
  deleteMedicine: async (id) => {
    try {
      const response = await axios.delete(
        getApiUrl(`pharmacists/medicines/${id}`),
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all medicine types
   */
  getTypes: async () => {
    try {
      const response = await axios.get(
        getApiUrl("pharmacists/medicines/types"),
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default medicineService;

