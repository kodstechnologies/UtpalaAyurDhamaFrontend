import React from "react";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import TableComponent from "../../components/table/TableComponent";

function Receptionists() {

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
            name: "Riya Patel",
            department: "Front Office",
            designation: "Receptionist",
            mobile: "+91 9801234567",
            email: "riya.patel@email.com",
        },
        {
            _id: "2",
            name: "Simran Kaur",
            department: "Front Office",
            designation: "Receptionist",
            mobile: "+91 9876543210",
            email: "simran.kaur@email.com",
        },
    ];

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "View Receptionists" }
                ]}
            />

            <TableComponent
                title="Receptionists List"
                columns={columns}
                rows={rows}
            />
        </div>
    );
}

export default Receptionists;
