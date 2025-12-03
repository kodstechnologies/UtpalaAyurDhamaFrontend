import React from 'react';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import TableComponent from '../../components/table/TableComponent';

function Therapists() {

    const columns = [
        { field: "name", header: "Name" },
        { field: "department", header: "Department" },
        { field: "designation", header: "Designation" },
        { field: "mobile", header: "Mobile" },
        { field: "email", header: "Email" },
    ];

    const rows = [
        {
            _id: "1",
            name: "Rahul Verma",
            department: "Physiotherapy",
            designation: "Senior Therapist",
            mobile: "+91 9876543211",
            email: "rahul.verma@example.com",
        },
        {
            _id: "2",
            name: "Priya Nair",
            department: "Ayurvedic Therapy",
            designation: "Therapist",
            mobile: "+91 8765432199",
            email: "priya.nair@example.com",
        },
    ];

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "View Therapists" }
                ]}
            />

            <TableComponent
                title="Therapists List"
                columns={columns}
                rows={rows}
            />
        </div>
    );
}

export default Therapists;
