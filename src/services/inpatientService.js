import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const getAllInpatients = async (params) => {
    const response = await axios.get(getApiUrl("inpatients"), { headers: getAuthHeaders(), params });
    return response.data;
};

const getInpatientById = async (id) => {
    const response = await axios.get(getApiUrl(`inpatients/${id}`), { headers: getAuthHeaders() });
    return response.data;
};

const createInpatient = async (data) => {
    const response = await axios.post(getApiUrl("inpatients"), data, { headers: getAuthHeaders() });
    return response.data;
};

const updateInpatient = async (id, data) => {
    const response = await axios.patch(getApiUrl(`inpatients/${id}`), data, { headers: getAuthHeaders() });
    return response.data;
};

const dischargeInpatient = async (id, data) => {
    // legacy discharge, might not produce invoice immediately like finalize
    const response = await axios.patch(getApiUrl(`inpatients/${id}/discharge`), data, { headers: getAuthHeaders() });
    return response.data;
};

const getDischargeSummary = async (id) => {
    const response = await axios.get(getApiUrl(`inpatients/${id}/discharge-summary`), { headers: getAuthHeaders() });
    return response.data;
};

const getUnifiedBillingSummary = async (patientId) => {
    const response = await axios.get(getApiUrl(`inpatients/patient/${patientId}/billing`), { headers: getAuthHeaders() });
    return response.data;
};

const getOutpatientBillingSummary = async (patientId) => {
    const response = await axios.get(getApiUrl(`inpatients/patient/${patientId}/billing/outpatient`), { headers: getAuthHeaders() });
    return response.data;
};

const finalizeDischarge = async (id, data) => {
    const response = await axios.patch(getApiUrl(`inpatients/${id}/discharge`), data, { headers: getAuthHeaders() });
    return response.data;
};

const finalizeOutpatientBilling = async (patientId, data) => {
    const response = await axios.post(getApiUrl(`inpatients/patient/${patientId}/billing/outpatient/finalize`), data, { headers: getAuthHeaders() });
    return response.data;
};

const downloadDischargeReport = async (id) => {
    const response = await axios.get(getApiUrl(`inpatients/${id}/discharge-report`), {
        headers: getAuthHeaders(),
        responseType: 'blob', // Important for PDF download
    });
    return response;
};

const downloadOutpatientBillingReport = async (patientId) => {
    const response = await axios.get(getApiUrl(`inpatients/patient/${patientId}/billing/outpatient/report`), {
        headers: getAuthHeaders(),
        responseType: 'blob', // Important for PDF download
    });
    return response;
};

const getInpatientTimeline = async (id) => {
    const response = await axios.get(getApiUrl(`inpatients/${id}/timeline`), { headers: getAuthHeaders() });
    return response.data;
};

const updateDailyCheckupCharge = async (id, checkupId, price) => {
    const response = await axios.patch(
        getApiUrl(`inpatients/${id}/checkups/${checkupId}/charge`),
        { price },
        { headers: getAuthHeaders() }
    );
    return response.data;
};

export default {
    getAllInpatients,
    getInpatientById,
    createInpatient,
    updateInpatient,
    dischargeInpatient,
    getDischargeSummary,
    getUnifiedBillingSummary,
    getOutpatientBillingSummary,
    finalizeDischarge,
    finalizeOutpatientBilling,
    downloadDischargeReport,
    downloadOutpatientBillingReport,
    getInpatientTimeline,
    updateDailyCheckupCharge,
};
