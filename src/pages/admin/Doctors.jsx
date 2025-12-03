// src/pages/Doctors.jsx
import React from "react";
import TableComponent from "../../components/table/TableComponent";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";

function Doctors() {
    const columns = [
        { field: "name", header: "Name" },
        { field: "department", header: "Department" },
        { field: "designation", header: "Designation" },
        { field: "mobile", header: "Mobile" },
        { field: "email", header: "Email" },
    ];


    const rows = [
        {
            _id: "10",
            name: "Amit Sharma",
            department: "Gynecology",
            designation: "Senior Consultant",
            mobile: "+91 9876543210",
            email: "amit.sharma@email.com",
        },
        {
            _id: "2",
            name: "Neha Gupta",
            department: "Gynecology",
            designation: "Gynecologist",
            mobile: "+91 8765432109",
            email: "neha.gupta@email.com",
        },
    ];

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    {
                        label: "View Doctor"
                    }
                ]}
            />
            <TableComponent columns={columns} rows={rows} />
        </div>
    );
}

export default Doctors;
