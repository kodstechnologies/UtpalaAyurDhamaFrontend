import React from "react";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import TableComponent from "../../components/table/TableComponent";

function Patients() {

    // ⭐ Nurse-related columns
    const columns = [
        { field: "name", header: "Name" },
        { field: "department", header: "Department" },
        { field: "designation", header: "Designation" },
        { field: "mobile", header: "Mobile" },
        { field: "email", header: "Email" },
    ];

    // ⭐ Nurse-related rows
    const rows = [
        {
            _id: "1",
            name: "Anjali Das",
            department: "Nursing",
            designation: "Senior Nurse",
            mobile: "+91 9876501234",
            email: "anjali.das@example.com",
        },
        {
            _id: "2",
            name: "Priya Menon",
            department: "Nursing",
            designation: "Staff Nurse",
            mobile: "+91 9988776655",
            email: "priya.menon@example.com",
        },
        {
            _id: "3",
            name: "Rohini Patil",
            department: "Nursing",
            designation: "Junior Nurse",
            mobile: "+91 9090909090",
            email: "rohini.patil@example.com",
        },
    ];

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "View Nurse" }
                ]}
            />

            {/* Pass columns + rows correctly */}
            <TableComponent
                title="Nurse List"
                columns={columns}
                rows={rows}
            />
        </div>
    );
}

export default Patients;
