import React from "react";
import TableComponent3 from "../../../components/table/nurse/TableComponent3";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

function Patient_Monitoring() {
    const columns = [
        { field: "patientId", header: "Patient ID" },
        { field: "patientName", header: "Patient Name" },
        { field: "ward", header: "Ward/Bed" },
        { field: "admissionDate", header: "Admission Date" },
        { field: "doctor", header: "Consulting Doctor" },
    ];

    const rows = [
        {
            _id: "1",
            patientId: "P-001",
            patientName: "Ramesh Kumar",
            ward: "Ward 3 / Bed 12",
            admissionDate: "2025-01-04",
            doctor: "Dr. Anil Singh",
        },
        {
            _id: "2",
            patientId: "P-002",
            patientName: "Sita Devi",
            ward: "Ward 1 / Bed 05",
            admissionDate: "2025-01-02",
            doctor: "Dr. Priya Sharma",
        },
    ];

    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Monitoring" },
    ];

    return (
        <div>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            <HeadingCardingCard
                category="TREATMENT & THERAPY"
                title="Therapists Assignment"
                subtitle="Assign qualified therapists to individual therapies, manage their availability, and ensure smooth coordination for treatment delivery."
            />
            <TableComponent3
                title="Patient Monitoring"
                columns={columns}
                rows={rows}
                onCreate={() => console.log("Create clicked")}
                onDelete={(id) => console.log("Delete", id)}
            />
        </div>
    );
}

export default Patient_Monitoring;
