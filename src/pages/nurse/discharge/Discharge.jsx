import React from 'react';
import HeadingCardingCard from '../../../components/card/HeadingCard';
import TableComponent4 from '../../../components/table/nurse/TableComponent4';
import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';

function Discharge_Preparation() {

    // TABLE COLUMNS
    const columns = [
        { field: "patientId", header: "Patient ID" },
        { field: "patientName", header: "Patient Name" },
        { field: "wardBed", header: "Ward/Bed" },
        { field: "admissionDate", header: "Admission Date" },
        { field: "consultingDoctor", header: "Consulting Doctor" },
    ];

    // SAMPLE TABLE ROWS (remove when API comes)
    const rows = [
        {
            _id: "1",
            patientId: "P-001",
            patientName: "Rahul Mehta",
            wardBed: "Ward 2 / Bed 08",
            admissionDate: "2025-01-03",
            consultingDoctor: "Dr. Anil Sharma",
        },
        {
            _id: "2",
            patientId: "P-002",
            patientName: "Sneha Singh",
            wardBed: "Ward 1 / Bed 03",
            admissionDate: "2025-01-05",
            consultingDoctor: "Dr. Priya Verma",
        }
    ];
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Patients" },
    ];

    return (
        <div>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            <HeadingCardingCard
                category="TREATMENT & THERAPY"
                title="Discharge Preparation"
                subtitle="Manage documentation, finalize reports, and prepare patients for discharge."
            />

            <TableComponent4
                title="Discharge Preparation"
                columns={columns}
                rows={rows}
                onCreate={() => console.log("Prepare new discharge")}
            />
        </div>
    );
}

export default Discharge_Preparation;
