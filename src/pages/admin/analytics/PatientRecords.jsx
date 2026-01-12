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

function PatientRecords() {
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    const fetchPatientRecords = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch all invoices (billing records)
            const response = await fetch(getApiUrl("invoices?limit=1000"), {
                method: "GET",
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error("Failed to fetch patient records");
            }

            const data = await response.json();
            if (data.success && data.data) {
                // Transform the data to match table structure
                const transformedRecords = data.data.map((invoice) => ({
                    _id: invoice._id,
                    invoice: invoice.invoiceNumber || "N/A",
                    patientName: invoice.patient?.user?.name || invoice.patient?.name || "N/A",
                    doctor: invoice.doctor?.user?.name 
                        ? `Dr. ${invoice.doctor.user.name}` 
                        : invoice.doctor?.name 
                        ? `Dr. ${invoice.doctor.name}` 
                        : "N/A",
                    amount: invoice.totalPayable || 0,
                    date: formatDate(invoice.createdAt || invoice.date),
                    dateRaw: invoice.createdAt || invoice.date, // For sorting
                }));

                // Sort by date (newest first)
                transformedRecords.sort((a, b) => {
                    const dateA = new Date(a.dateRaw || 0);
                    const dateB = new Date(b.dateRaw || 0);
                    return dateB - dateA;
                });

                setRows(transformedRecords);
            } else {
                toast.error(data.message || "Failed to fetch patient records");
            }
        } catch (error) {
            console.error("Error fetching patient records:", error);
            toast.error(error.message || "Failed to fetch patient records");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatientRecords();
    }, [fetchPatientRecords]);

    // Form fields (only used for View modal)
    const fields = [
        { name: 'invoice', label: 'Invoice #', type: 'text', required: true },
        { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
        { name: 'doctor', label: 'Doctor', type: 'text', required: true },
        { name: 'amount', label: 'Final Amount (Incl. GST)', type: 'number', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
    ];

    const columns = [
        { field: "invoice", header: "Invoice #" },
        { field: "patientName", header: "Patient Name" },
        { field: "doctor", header: "Doctor" },
        {
            field: "amount",
            header: "Final Amount (Incl. GST)",
            render: (row) => `₹${row.amount.toLocaleString('en-IN')}`,
        },
        { field: "date", header: "Date" },
    ];

    // Filter rows based on search text (search in patientName and invoice)
    const filteredRows = rows.filter(row =>
        row.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
        row.invoice.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <HeadingCard
                title="Patient Billing & Records"
                subtitle="View detailed billing history including invoices, attending doctors, GST-inclusive amounts, and generated dates."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Analytics" },
                    { label: "Patient Records" }
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
                        fileName="patient-billing-records.xlsx"
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
                    title="Patient Billing Records"
                    columns={columns}
                    rows={filteredRows}
                    formFields={fields}
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

export default PatientRecords;
