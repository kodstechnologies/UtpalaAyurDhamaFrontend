import React, { useState } from "react";
import TableComponent from "../../components/table/TableComponent";
import HeadingCard from "../../components/card/HeadingCard";

// Define fields for the form modals
const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'department', label: 'Department', type: 'text', required: true },
    { name: 'designation', label: 'Designation', type: 'text', required: true },
    { name: 'mobile', label: 'Mobile', type: 'tel', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
];

// Placeholder API functions - replace with actual API calls
const createDoctorAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newDoctor = { _id: newId, ...data };
    console.log('Created doctor:', newDoctor);
    return newDoctor;
};

const updateDoctorAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated doctor:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deleteDoctorAPI = async (id) => {
    // Simulate API call
    console.log('Deleted doctor:', id);
};

function Doctors() {
    const [rows, setRows] = useState([
        {
            _id: "10",
            name: "Amit Sharma",
            department: "Gynecology",
            designation: "Senior Consultant",
            mobile: "+91 9876543210",
            email: "amit.sharma@email.com",
            status: "Active",        // ⭐ NEW
        },
        {
            _id: "2",
            name: "Neha Gupta",
            department: "Gynecology",
            designation: "Gynecologist",
            mobile: "+91 8765432109",
            email: "neha.gupta@email.com",
            status: "Inactive",      // ⭐ NEW
        },
    ]);


    const columns = [
        { field: "name", header: "Name" },
        { field: "department", header: "Department" },
        { field: "designation", header: "Designation" },
        { field: "mobile", header: "Mobile" },
        { field: "email", header: "Email" },
        { field: "status", header: "Status" }
    ];

    const handleCreateSubmit = async (data) => {
        const newDoctor = await createDoctorAPI(data);
        setRows(prev => [...prev, newDoctor]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedDoctor = await updateDoctorAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedDoctor : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete doctor ${id}?`)) {
            deleteDoctorAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Doctors"
                subtitle="View and manage doctors in the system."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Doctors" }
                ]}
            />

            <TableComponent
                title="Doctors List"
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
                showStatusBadge={true}
                statusField="status"
            />
        </div>
    );
}

export default Doctors;