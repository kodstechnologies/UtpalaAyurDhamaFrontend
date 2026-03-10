import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

// Helper function to format date
const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

function Discharges() {
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    const fetchDischarges = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch discharged inpatients
            const response = await fetch(getApiUrl("inpatients?status=Discharged&limit=1000"), {
                method: "GET",
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error("Failed to fetch discharges");
            }

            const data = await response.json();
            if (data.success && data.data) {
                // Fetch all invoices to match with inpatients (more efficient than multiple calls)
                let invoicesMap = new Map();
                try {
                    const invoiceResponse = await fetch(getApiUrl("invoices?limit=1000"), {
                        method: "GET",
                        headers: getAuthHeaders()
                    });
                    if (invoiceResponse.ok) {
                        const invoiceData = await invoiceResponse.json();
                        if (invoiceData.success && invoiceData.data) {
                            // Create a map of inpatient ID to invoice
                            invoiceData.data.forEach(invoice => {
                                if (invoice.inpatient && invoice.inpatient._id) {
                                    const inpatientId = invoice.inpatient._id.toString();
                                    // Keep the most recent invoice if multiple exist
                                    if (!invoicesMap.has(inpatientId) || 
                                        new Date(invoice.createdAt) > new Date(invoicesMap.get(inpatientId).createdAt)) {
                                        invoicesMap.set(inpatientId, invoice);
                                    }
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching invoices:", error);
                }

                // Transform the data to match table structure
                const transformedDischarges = data.data.map((inpatient) => {
                    const invoice = invoicesMap.get(inpatient._id.toString());
                    const amount = invoice ? (invoice.totalPayable || 0) : 0;
                    const invoiceNumber = invoice ? (invoice.invoiceNumber || "N/A") : "N/A";

                    return {
                        _id: inpatient._id,
                        uhid: inpatient.patient?.uhid || inpatient.patient?.patientId || inpatient.patient?._id || "N/A",
                        patientId: inpatient.patient?.patientId || inpatient.patient?._id || "N/A",
                        patientName: inpatient.patient?.user?.name || "N/A",
                        doctor: inpatient.doctor?.user?.name ? `Dr. ${inpatient.doctor.user.name}` : "N/A",
                        admissionDate: formatDate(inpatient.admissionDate),
                        dischargeDate: formatDate(inpatient.dischargeDate),
                        dischargeDateRaw: inpatient.dischargeDate, // For sorting
                        amount: amount,
                        invoiceNumber: invoiceNumber,
                        status: "Completed", // All discharged patients are "Completed"
                    };
                });

                // Sort by discharge date (newest first)
                transformedDischarges.sort((a, b) => {
                    const dateA = new Date(a.dischargeDateRaw || 0);
                    const dateB = new Date(b.dischargeDateRaw || 0);
                    return dateB - dateA;
                });

                setRows(transformedDischarges);
            } else {
                toast.error(data.message || "Failed to fetch discharges");
            }
        } catch (error) {
            console.error("Error fetching discharges:", error);
            toast.error(error.message || "Failed to fetch discharges");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDischarges();
    }, [fetchDischarges]);

    // Form fields (used only for View modal)
    const fields = [
        { name: 'uhid', label: 'UHID / Patient ID', type: 'text', required: true },
        { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
        { name: 'doctor', label: 'Doctor', type: 'text', required: true },
        { name: 'admissionDate', label: 'Admission Date', type: 'date', required: true },
        { name: 'dischargeDate', label: 'Discharge Date', type: 'date', required: true },
        { name: 'amount', label: 'Final Amount (₹)', type: 'number', required: true },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
                { value: 'Completed', label: 'Completed' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Cancelled', label: 'Cancelled' },
            ],
        },
    ];

    const columns = [
        { field: "uhid", header: "UHID / Patient ID" },
        { field: "patientName", header: "Patient Name" },
        { field: "doctor", header: "Doctor" },
        { field: "admissionDate", header: "Admission Date" },
        { field: "dischargeDate", header: "Discharge Date" },
        {
            field: "amount",
            header: "Final Amount (₹)",
            render: (row) => `₹${row.amount.toLocaleString('en-IN')}`,
        },
        { field: "status", header: "Status" },
    ];

    // Filter rows based on search text (search in patientName and uhid)
    const filteredRows = rows.filter(row =>
        row.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
        row.uhid.toLowerCase().includes(searchText.toLowerCase()) ||
        row.patientId.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <HeadingCard
                title="Discharge Records"
                subtitle="View and manage patient discharge summaries, track billing details, and ensure accurate hospital record keeping."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Analytics" },
                    { label: "Discharge Records" }
                ]}
            />

            {/* SEARCH + EXPORT */}
            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{ width: "100%" }}
            >
                {/* LEFT SIDE — Search */}
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ width: "100%" }}
                    />
                </div>

                {/* RIGHT SIDE — Export Button */}
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="discharges.xlsx"
                    />
                </div>
            </CardBorder>

            {isLoading ? (
                <div className="flex justify-center items-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
                        style={{ borderColor: "var(--color-btn-b)", borderBottomColor: "transparent" }}></div>
                </div>
            ) : (
                <TableComponent
                    title="Discharge Records List"
                    columns={columns}
                    rows={filteredRows}
                    formFields={fields}
                    showStatusBadge={true}
                    statusField="status"
                    showView={true}
                    showEdit={false}
                    showDelete={false}
                    showAddButton={false}
                    showExportButton={true}
                />
            )}
        </div>
    );
}

export default Discharges;
