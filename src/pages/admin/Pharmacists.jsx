import React from 'react';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import TableComponent from '../../components/table/TableComponent';

function Pharmacists() {

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
            name: "Rohan Verma",
            department: "Pharmacy",
            designation: "Chief Pharmacist",
            mobile: "+91 9876543210",
            email: "rohan.verma@email.com",
        },
        {
            _id: "2",
            name: "Priya Singh",
            department: "Pharmacy",
            designation: "Pharmacist",
            mobile: "+91 8765432109",
            email: "priya.singh@email.com",
        },
    ];

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "View Pharmacists" }
                ]}
            />

            <TableComponent
                title="Pharmacists List"
                columns={columns}
                rows={rows}
            />
        </div>
    );
}

export default Pharmacists;
