

import React from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";

function Consultations_View() {
    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "patientId", header: "ID" },
        { field: "doctor", header: "Doctor" },
        { field: "date", header: "Date" },
        { field: "complaint", header: "Chief Complaint" },
        { field: "followup", header: "Follow-up" },
    ];

    const rows = [
        {
            _id: 1,
            patientName: "Riya",
            patientId: "P001",
            doctor: "Dr. Kumar",
            date: "2025-12-12",
            complaint: "Persistent cough and cold for over a week.",
            followup: "Jun 5, 2024",
        },
        {
            _id: 2,
            patientName: "Arjun",
            patientId: "P002",
            doctor: "Dr. Anjali",
            date: "2025-12-10",
            complaint: "Severe headache and nausea. ",
            followup: "None Scheduled",
        },
    ];

    return (
        <div style={{ paddingBottom: 30 }}>
            <HeadingCard
                title="My Consultations"
                subtitle="Review your past and upcoming consultations along with follow-up details."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Consultations" }
                ]}
            />

            <TableComponent
                title="My Consultations"

                /* Table Data */
                columns={columns}
                rows={rows}

                /* Actions disabled */
                showEdit={false}
                showDelete={false}

                /* Only View button enabled */
                showView={true}

                /* Disable Add Button */
                showAddButton={false}

                /* Disable Export button */
                showExportButton={false}
            />
        </div>
    );
}

export default Consultations_View;
