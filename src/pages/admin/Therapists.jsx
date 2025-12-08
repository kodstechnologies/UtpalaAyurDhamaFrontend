// import React from "react";
// import TableComponent from "../../components/table/TableComponent";
// import HeadingCard from "../../components/card/HeadingCard";

// function Therapists() {
//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "department", header: "Department" },
//         { field: "designation", header: "Designation" },
//         { field: "mobile", header: "Mobile" },
//         { field: "email", header: "Email" },
//     ];

//     const rows = [
//         {
//             _id: "1",
//             name: "Rahul Verma",
//             department: "Physiotherapy",
//             designation: "Senior Therapist",
//             mobile: "+91 9876543211",
//             email: "rahul.verma@example.com",
//         },
//         {
//             _id: "2",
//             name: "Priya Nair",
//             department: "Ayurvedic Therapy",
//             designation: "Therapist",
//             mobile: "+91 8765432199",
//             email: "priya.nair@example.com",
//         },
//     ];

//     return (
//         <div>
//             <HeadingCard
//                 title="Therapists"
//                 subtitle="View and manage all therapy specialists across different departments."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "View Therapists" }
//                 ]}
//             />

//             <TableComponent
//                 title="Therapists List"
//                 columns={columns}
//                 rows={rows}
//             />
//         </div>
//     );
// }

// export default Therapists;


// import React from "react";
// import { useNavigate } from "react-router-dom";
// import TableComponent from "../../components/table/TableComponent";
// import HeadingCard from "../../components/card/HeadingCard";

// function Therapists() {
//     const navigate = useNavigate();

//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "department", header: "Department" },
//         { field: "designation", header: "Designation" },
//         { field: "mobile", header: "Mobile" },
//         { field: "email", header: "Email" },
//     ];

//     const rows = [
//         {
//             _id: "1",
//             name: "Rahul Verma",
//             department: "Physiotherapy",
//             designation: "Senior Therapist",
//             mobile: "+91 9876543211",
//             email: "rahul.verma@example.com",
//         },
//         {
//             _id: "2",
//             name: "Priya Nair",
//             department: "Ayurvedic Therapy",
//             designation: "Therapist",
//             mobile: "+91 8765432199",
//             email: "priya.nair@example.com",
//         },
//     ];

//     const handleCreate = () => {
//         navigate("/admin/therapists/create");
//     };

//     const handleDelete = (id) => {
//         // Add confirmation dialog and API call here
//         if (window.confirm(`Are you sure you want to delete therapist ${id}?`)) {
//             console.log("Delete therapist:", id); // Replace with API call
//             // Refresh rows after delete
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Therapists"
//                 subtitle="View and manage all therapy specialists across different departments."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Therapists" }
//                 ]}
//             />

//             <TableComponent
//                 title="Therapists List"
//                 columns={columns}
//                 rows={rows}
//                 viewPath="/admin/therapists/view"
//                 editPath="/admin/therapists/edit"
//                 showView={true}
//                 showEdit={true}
//                 showDelete={true}
//                 onCreate={handleCreate}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Therapists;

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
const createTherapistAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newTherapist = { _id: newId, ...data };
    console.log('Created therapist:', newTherapist);
    return newTherapist;
};

const updateTherapistAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated therapist:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deleteTherapistAPI = async (id) => {
    // Simulate API call
    console.log('Deleted therapist:', id);
};

function Therapists() {
    const [rows, setRows] = useState([
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
    ]);

    const columns = [
        { field: "name", header: "Name" },
        { field: "department", header: "Department" },
        { field: "designation", header: "Designation" },
        { field: "mobile", header: "Mobile" },
        { field: "email", header: "Email" },
    ];

    const handleCreateSubmit = async (data) => {
        const newTherapist = await createTherapistAPI(data);
        setRows(prev => [...prev, newTherapist]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedTherapist = await updateTherapistAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedTherapist : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete therapist ${id}?`)) {
            deleteTherapistAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Therapists"
                subtitle="View and manage all therapy specialists across different departments."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Therapists" }
                ]}
            />

            <TableComponent
                title="Therapists List"
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
            />
        </div>
    );
}

export default Therapists;