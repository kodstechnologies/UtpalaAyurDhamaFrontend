import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const dashboardService = {
    // Get dashboard overview (staff counts, medicine stock)
    getDashboardOverview: async () => {
        try {
            const response = await axios.get(getApiUrl("dashboard/overview"), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get additional statistics
    getAdditionalStats: async () => {
        try {
            // Fetch multiple endpoints in parallel
            const [
                appointmentsRes,
                prescriptionsRes,
                invoicesRes,
                inpatientsRes,
                medicinesRes,
            ] = await Promise.allSettled([
                axios.get(getApiUrl("appointments"), {
                    headers: getAuthHeaders(),
                    params: { page: 1, limit: 1000 },
                }).catch(() => ({ data: { data: [] } })),
                axios.get(getApiUrl("examinations/prescriptions/all"), {
                    headers: getAuthHeaders(),
                }).catch(() => ({ data: { data: [] } })),
                axios.get(getApiUrl("invoices"), {
                    headers: getAuthHeaders(),
                    params: { page: 1, limit: 1000 },
                }).catch(() => ({ data: { data: [] } })),
                axios.get(getApiUrl("inpatients"), {
                    headers: getAuthHeaders(),
                    params: { page: 1, limit: 1000 },
                }).catch(() => ({ data: { data: [] } })),
                axios.get(getApiUrl("pharmacists/medicines"), {
                    headers: getAuthHeaders(),
                    params: { page: 1, limit: 1000 },
                }).catch(() => ({ data: { data: [] } })),
            ]);

            const appointments = appointmentsRes.status === "fulfilled" ? appointmentsRes.value.data : { data: [] };
            const prescriptions = prescriptionsRes.status === "fulfilled" ? prescriptionsRes.value.data : { data: [] };
            const invoices = invoicesRes.status === "fulfilled" ? invoicesRes.value.data : { data: [] };
            const inpatients = inpatientsRes.status === "fulfilled" ? inpatientsRes.value.data : { data: [] };
            const medicines = medicinesRes.status === "fulfilled" ? medicinesRes.value.data : { data: [] };

            // Process appointments
            const appointmentsList = Array.isArray(appointments.data) ? appointments.data : [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayAppointments = appointmentsList.filter((apt) => {
                const aptDate = new Date(apt.appointmentDate);
                aptDate.setHours(0, 0, 0, 0);
                return aptDate.getTime() === today.getTime();
            });

            // Process prescriptions
            const prescriptionsList = Array.isArray(prescriptions.data) ? prescriptions.data : [];
            const pendingPrescriptions = prescriptionsList.filter((p) => p?.status === "Pending" || !p?.status);

            // Process invoices
            const invoicesList = Array.isArray(invoices.data) ? invoices.data : [];
            const totalRevenue = invoicesList.reduce((sum, inv) => sum + (inv.totalPayable || 0), 0);
            const paidInvoices = invoicesList.filter((inv) => (inv.amountPaid || 0) >= (inv.totalPayable || 0));
            const pendingInvoices = invoicesList.filter((inv) => (inv.amountPaid || 0) < (inv.totalPayable || 0));

            // Process inpatients
            const inpatientsList = Array.isArray(inpatients.data) ? inpatients.data : [];
            const admittedInpatients = inpatientsList.filter((ip) => ip.status === "Admitted");
            const dischargedInpatients = inpatientsList.filter((ip) => ip.status === "Discharged");

            // Process medicines
            const medicinesList = Array.isArray(medicines.data?.medicines || medicines.data?.data || medicines.data)
                ? (medicines.data?.medicines || medicines.data?.data || medicines.data)
                : [];
            const lowStockMedicines = medicinesList.filter((m) => m.stockStatus === "Low Stock");
            const outOfStockMedicines = medicinesList.filter((m) => m.stockStatus === "Out of Stock");

            return {
                appointments: {
                    total: appointmentsList.length,
                    today: todayAppointments.length,
                },
                prescriptions: {
                    total: prescriptionsList.length,
                    pending: pendingPrescriptions.length,
                },
                invoices: {
                    total: invoicesList.length,
                    paid: paidInvoices.length,
                    pending: pendingInvoices.length,
                    totalRevenue,
                },
                inpatients: {
                    total: inpatientsList.length,
                    admitted: admittedInpatients.length,
                    discharged: dischargedInpatients.length,
                },
                medicines: {
                    total: medicinesList.length,
                    lowStock: lowStockMedicines.length,
                    outOfStock: outOfStockMedicines.length,
                },
            };
        } catch (error) {
            console.error("Error fetching additional stats:", error);
            return {
                appointments: { total: 0, today: 0 },
                prescriptions: { total: 0, pending: 0 },
                invoices: { total: 0, paid: 0, pending: 0, totalRevenue: 0 },
                inpatients: { total: 0, admitted: 0, discharged: 0 },
                medicines: { total: 0, lowStock: 0, outOfStock: 0 },
            };
        }
    },

    // Get monthly revenue data
    getMonthlyRevenue: async () => {
        try {
            const response = await axios.get(getApiUrl("dashboard/monthly-revenue"), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching monthly revenue:", error);
            throw error.response?.data || error.message;
        }
    },
};

export default dashboardService;

