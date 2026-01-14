import axios from 'axios';
import { getApiUrl, getAuthHeaders } from '../config/api';

const patientDocumentService = {
    /**
     * Upload PDF document for a patient
     */
    uploadDocument: async (patientId, file, description = '', category = 'other') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        formData.append('category', category);

        const response = await axios.post(
            getApiUrl(`patient-documents/${patientId}/upload`),
            formData,
            {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    },

    /**
     * Get all documents for a patient
     */
    getPatientDocuments: async (patientId) => {
        const response = await axios.get(
            getApiUrl(`patient-documents/${patientId}`),
            { headers: getAuthHeaders() }
        );

        return response.data;
    },

    /**
     * Get presigned URL for viewing document
     */
    getDocumentViewUrl: async (documentId) => {
        const response = await axios.get(
            getApiUrl(`patient-documents/view/${documentId}`),
            { headers: getAuthHeaders() }
        );

        return response.data;
    },

    /**
     * Delete a document
     */
    deleteDocument: async (documentId) => {
        const response = await axios.delete(
            getApiUrl(`patient-documents/${documentId}`),
            { headers: getAuthHeaders() }
        );

        return response.data;
    },
};

export default patientDocumentService;

