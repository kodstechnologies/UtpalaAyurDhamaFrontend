import React from "react";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import TableComponent from "../../../components/table/TableComponent";
import HeadingCard from "../../../components/card/HeadingCard";

function Admissions_View() {

    const columns = [
        { field: "patientId", header: "Patient ID" },
        { field: "patientName", header: "Patient Name" },
        { field: "mobile", header: "Mobile No" },
        { field: "admissionDate", header: "Admission Date" },
    ];

    const rows = [
        {
            _id: "A001",
            patientId: "P-1001",
            patientName: "Amit Kumar",
            mobile: "9876543210",
            admissionDate: "2025-02-10",
        },
        {
            _id: "A002",
            patientId: "P-1002",
            patientName: "Neha Sharma",
            mobile: "9123456780",
            admissionDate: "2025-02-12",
        },
        {
            _id: "A003",
            patientId: "P-1003",
            patientName: "Rohan Das",
            mobile: "9988776655",
            admissionDate: "2025-02-15",
        },
    ];

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Analytics" }
                ]}
            />
            {/* Heading Card */}
            <HeadingCard
                category="ANALYTICS"
                title="Admission List"
                subtitle="Monitor active and past patient admissions, track essential patient details, and maintain accurate records for smooth hospital operations and reporting."
            />


            <TableComponent
                title="Admissions List"
                columns={columns}
                rows={rows}
            />
        </div>
    );
}

export default Admissions_View;
