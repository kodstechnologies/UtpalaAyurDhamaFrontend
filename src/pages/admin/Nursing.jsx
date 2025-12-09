import React, { useState } from "react";
import HeadingCard from "../../components/card/HeadingCard";
import TableComponent from "../../components/table/TableComponent";

// Define fields for the form modals
const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'department', label: 'Department', type: 'text', required: true },
    { name: 'designation', label: 'Designation', type: 'text', required: true },
    { name: 'mobile', label: 'Mobile', type: 'tel', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
];

// Placeholder API functions - replace with actual API calls
const createNurseAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newNurse = { _id: newId, ...data };
    console.log('Created nurse:', newNurse);
    return newNurse;
};

const updateNurseAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated nurse:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deleteNurseAPI = async (id) => {
    // Simulate API call
    console.log('Deleted nurse:', id);
};

function Nursing() {
    const [rows, setRows] = useState([
        {
            _id: "1",
            name: "Priya Nair",
            department: "General Ward",
            designation: "Senior Nurse",
            mobile: "+91 9876501234",
            email: "priya.nair@hospital.com",
            status: "Active",   // ⭐ Add
        },
        {
            _id: "2",
            name: "Rohan Verma",
            department: "ICU",
            designation: "Staff Nurse",
            mobile: "+91 9823456780",
            email: "rohan.verma@hospital.com",
            status: "Inactive", // ⭐ Add
        },
        {
            _id: "3",
            name: "Sangeeta Patil",
            department: "Emergency",
            designation: "Registered Nurse",
            mobile: "+91 9988776655",
            email: "sangeeta.patil@hospital.com",
            status: "Active",   // ⭐ Add
        },
        {
            _id: "4",
            name: "Meena Rao",
            department: "Pediatrics",
            designation: "Nurse Supervisor",
            mobile: "+91 9090908080",
            email: "meena.rao@hospital.com",
            status: "Inactive", // ⭐ Add
        },
        {
            _id: "5",
            name: "Arun Das",
            department: "Surgery",
            designation: "Operating Room Nurse",
            mobile: "+91 9811223344",
            email: "arun.das@hospital.com",
            status: "Active",   // ⭐ Add
        },
    ]);


    const columns = [
        { field: "name", header: "Name" },
        { field: "department", header: "Department" },
        { field: "designation", header: "Designation" },
        { field: "mobile", header: "Mobile" },
        { field: "email", header: "Email" },
        { field: "status", header: "Status" },
    ];

    const handleCreateSubmit = async (data) => {
        const newNurse = await createNurseAPI(data);
        setRows(prev => [...prev, newNurse]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedNurse = await updateNurseAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedNurse : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete nurse ${id}?`)) {
            deleteNurseAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Nursing Staff"
                subtitle="View and manage all nurses working across different departments."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Nursing" }
                ]}
            />

            <TableComponent
                title="Nursing Staff List"
                columns={columns}
                rows={rows}
                // For modals: pass formFields and submit handlers
                formFields={fields}
                onCreateSubmit={handleCreateSubmit}
                onEditSubmit={handleEditSubmit}
                showView={true} // Opens modal with ViewCard
                // viewPath removed - modal handles view
                showEdit={true}
                showDelete={true}
                onDelete={handleDelete}
                showStatusBadge={true}    // OPTIONAL: forces status badge
                statusField="status"
            />
        </div>
    );
}

export default Nursing;