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

const recordPayment = async (invoiceId, paymentAmount) => {
    const response = await axios.patch(getApiUrl(`invoices/${invoiceId}/record-payment`), {
        paymentAmount
    }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export default {
    getAllInvoices,
    getInvoiceById,
    getInvoicesByUser,
    downloadInvoicePdf,
    getPatientReports,
    recordPayment
};
