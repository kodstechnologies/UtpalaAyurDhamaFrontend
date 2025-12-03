import React from "react";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";

function PatientRecords() {
    // 📌 Table Columns
    const columns = [
        { field: "invoice", header: "Invoice #" },
        { field: "patientName", header: "Patient Name" },
        { field: "doctor", header: "Doctor" },
        { field: "amount", header: "Final Amount (Incl. GST)" },
        { field: "date", header: "Date" },
    ];

    // 📌 Example Table Rows
    const rows = [
        {
            _id: "1",
            invoice: "INV-001",
            patientName: "Amit Sharma",
            doctor: "Dr. Rakesh",
            amount: "₹2,500",
            date: "2025-02-10",
        },
        {
            _id: "2",
            invoice: "INV-002",
            patientName: "Neha Gupta",
            doctor: "Dr. Priya",
            amount: "₹3,200",
            date: "2025-02-11",
        },
    ];

    return (
        <div>
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Analytics" },
                    { label: "Patient Records" },
                ]}
            />

            {/* Heading Card */}
            <HeadingCard
                category="PATIENT RECORDS"
                title="Patient Billing & Records"
                subtitle="View detailed billing history including invoices, attending doctors, GST-inclusive amounts, and generated dates."
            />

            {/* Table */}
            <TableComponent
                title="Patient Records"
                columns={columns}
                rows={rows}
            />
        </div>
    );
}

export default PatientRecords;
