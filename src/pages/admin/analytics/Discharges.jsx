import React from "react";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";


function Discharges() {
    // ⭐ Table Columns
    const columns = [
        { field: "uhid", header: "UHID / Patient ID" },
        { field: "patientName", header: "Patient Name" },
        { field: "doctor", header: "Doctor" },
        { field: "admissionDate", header: "Admission Date" },
        { field: "dischargeDate", header: "Discharge Date" },
        { field: "amount", header: "Final Amount (₹)" },
        { field: "status", header: "Status" },
    ];

    // ⭐ Dummy Rows
    const rows = [
        {
            _id: "1",
            uhid: "UHID-1001",
            patientName: "Amit Verma",
            doctor: "Dr. Sharma",
            admissionDate: "12 Jan 2025",
            dischargeDate: "18 Jan 2025",
            amount: "₹ 12,500",
            status: "Completed",
        },
        {
            _id: "2",
            uhid: "UHID-1005",
            patientName: "Neha Gupta",
            doctor: "Dr. Rao",
            admissionDate: "10 Jan 2025",
            dischargeDate: "15 Jan 2025",
            amount: "₹ 9,200",
            status: "Completed",
        },
    ];

    return (
        <div>
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Discharge Records" }
                ]}
            />

            {/* Heading Card */}
            <HeadingCard
                category="PATIENT MANAGEMENT"
                title="Discharge Records"
                subtitle="View patient discharge summaries, track payments, and review doctor-wise discharge details for accurate record keeping."
            />

            {/* Table */}
            <TableComponent
                title="Discharge List"
                columns={columns}
                rows={rows}
                onDelete={(id) => console.log("Delete ID:", id)}
            />
        </div>
    );
}

export default Discharges;
