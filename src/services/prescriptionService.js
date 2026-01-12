import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

/**
 * Service to handle Prescription API calls
 */
const prescriptionService = {
  /**
   * Get pending outpatient prescriptions
   */
  getPendingPrescriptions: async () => {
    try {
      const response = await axios.get(
        getApiUrl("examinations/prescriptions/pending"),
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get pending inpatient prescriptions
   */
  getPendingInpatientPrescriptions: async () => {
    try {
      const response = await axios.get(
        getApiUrl("examinations/prescriptions/pending/inpatient"),
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get prescription by ID
   */
  getPrescriptionById: async (id) => {
    try {
      const response = await axios.get(
        getApiUrl(`examinations/prescriptions/detail/${id}`),
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all prescriptions for an examination
   */
  getPrescriptionsByExamination: async (examinationId) => {
    try {
      const response = await axios.get(
        getApiUrl(`examinations/${examinationId}/prescriptions`),
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default prescriptionService;

