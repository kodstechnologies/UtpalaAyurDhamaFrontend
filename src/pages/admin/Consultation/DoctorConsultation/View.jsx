import React from 'react';
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
import TableComponent from '../../../../components/table/TableComponent';

function Consultation_View() {

    // 👉 Table Columns
    const columns = [
        { field: "doctor", header: "Doctor" },
        { field: "fee", header: "Consultation Fee" },
        { field: "currency", header: "Currency" },
        { field: "status", header: "Status" },
        { field: "updated", header: "Updated" },
    ];

    // 👉 Dummy Data (Replace with API later)
    const rows = [
        {
            _id: "1",
            doctor: "Dr. Amit Sharma",
            fee: "500",
            currency: "INR",
            status: "Active",
            updated: "2025-01-12",
        },
        {
            _id: "2",
            doctor: "Dr. Neha Gupta",
            fee: "700",
            currency: "INR",
            status: "Inactive",
            updated: "2025-01-10",
        },
    ];

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Slot Consultation" }
                ]}
            />

            <TableComponent
                title="Consultation Fee List"
                columns={columns}
                rows={rows}
                onCreate={() => console.log("Create Consultation Fee")}
                onDelete={(id) => console.log("Delete:", id)}
            />
        </div>
    );
}

export default Consultation_View;
