import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const getAllInvoices = async (params) => {
    const response = await axios.get(getApiUrl("invoices"), {
        headers: getAuthHeaders(),
        params
    });
    return response.data;
};

const getInvoiceById = async (id) => {
    const response = await axios.get(getApiUrl(`invoices/${id}`), {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getInvoicesByUser = async (userId) => {
    const response = await axios.get(getApiUrl(`invoices/by-user/${userId}`), {
        headers: getAuthHeaders()
    });
    return response.data;
};

const downloadInvoicePdf = async (prescriptionId) => {
    const response = await axios.get(getApiUrl(`invoices/pdf/${prescriptionId}`), {
        headers: getAuthHeaders(),
        responseType: 'blob'
    });
    return response;
};

const getPatientReports = async () => {
    const response = await axios.get(getApiUrl("invoices/patient/reports"), {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getAdminInvoiceView = async (id) => {
    const response = await axios.get(getApiUrl(`invoices/${id}/admin-view`), {
        headers: getAuthHeaders(),
    });
    return response.data;
};

const saveAdminInvoiceDisplay = async (id, payload) => {
    const response = await axios.put(getApiUrl(`invoices/${id}/admin-display`), payload, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

const resetAdminInvoiceDisplay = async (id) => {
    const response = await axios.delete(getApiUrl(`invoices/${id}/admin-display`), {
        headers: getAuthHeaders(),
    });
    return response.data;
};

const recordPayment = async (invoiceId, paymentAmount, paymentMethod, transactionId, cardLastFourDigits) => {
    const response = await axios.patch(getApiUrl(`invoices/${invoiceId}/record-payment`), {
        paymentAmount,
        paymentMethod,
        transactionId,
        cardLastFourDigits
    }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export default {
    getAllInvoices,
    getInvoiceById,
    getAdminInvoiceView,
    saveAdminInvoiceDisplay,
    resetAdminInvoiceDisplay,
    getInvoicesByUser,
    downloadInvoicePdf,
    getPatientReports,
    recordPayment
};
