import React from "react";
import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
import TableComponent from "../../../../components/table/TableComponent";

function Slot_View() {
    // TABLE COLUMNS
    const columns = [
        { field: "doctor", header: "Doctor" },
        { field: "availability", header: "Availability" },
        { field: "time", header: "Time" },
        { field: "date", header: "Date" },
    ];

    // SAMPLE ROW DATA
    const rows = [
        {
            _id: "1",
            doctor: "Dr. Amit Sharma",
            availability: "Available",
            time: "10:00 AM - 1:00 PM",
            date: "2025-01-05",
        },
        {
            _id: "2",
            doctor: "Dr. Neha Gupta",
            availability: "Not Available",
            time: "-",
            date: "2025-01-06",
        },
    ];

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Slot Management" }
                ]}
            />

            <TableComponent
                title="Doctor Slot Availability"
                columns={columns}
                rows={rows}
            />
        </div>
    );
}

export default Slot_View;
