// import React, { useState } from "react";
// import HeadingCard from "../../components/card/HeadingCard";
// import TableComponent from "../../components/table/TableComponent";

// // Define fields for the form modals
// const fields = [
//     { name: 'name', label: 'Name', type: 'text', required: true },
//     { name: 'department', label: 'Department', type: 'text', required: true },
//     { name: 'designation', label: 'Designation', type: 'text', required: true },
//     { name: 'mobile', label: 'Mobile', type: 'tel', required: true },
//     { name: 'email', label: 'Email', type: 'email', required: true },
// ];

// // Placeholder API functions - replace with actual API calls
// const createTherapistAPI = async (data) => {
//     // Simulate API call
//     const newId = Date.now().toString();
//     const newTherapist = { _id: newId, ...data };
//     console.log('Created therapist:', newTherapist);
//     return newTherapist;
// };

// const updateTherapistAPI = async (data, id) => {
//     // Simulate API call
//     console.log('Updated therapist:', { _id: id, ...data });
//     return { _id: id, ...data };
// };

// const deleteTherapistAPI = async (id) => {
//     // Simulate API call
//     console.log('Deleted therapist:', id);
// };

// function Therapists() {
//     const [rows, setRows] = useState([
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
//     ]);

//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "department", header: "Department" },
//         { field: "designation", header: "Designation" },
//         { field: "mobile", header: "Mobile" },
//         { field: "email", header: "Email" },
//     ];

//     const handleCreateSubmit = async (data) => {
//         const newTherapist = await createTherapistAPI(data);
//         setRows(prev => [...prev, newTherapist]);
//     };

//     const handleEditSubmit = async (data, row) => {
//         const updatedTherapist = await updateTherapistAPI(data, row._id);
//         setRows(prev => prev.map(r => r._id === row._id ? updatedTherapist : r));
//     };

//     const handleDelete = (id) => {
//         if (window.confirm(`Are you sure you want to delete therapist ${id}?`)) {
//             deleteTherapistAPI(id);
//             setRows(prev => prev.filter(r => r._id !== id));
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
//                 // For modals: pass formFields and submit handlers
//                 formFields={fields}
//                 onCreateSubmit={handleCreateSubmit}
//                 onEditSubmit={handleEditSubmit}
//                 showView={true} // Opens modal with ViewCard
//                 // viewPath removed - modal handles view
//                 showEdit={true}
//                 showDelete={true}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Therapists;

import React, { useState } from "react";
import HeadingCard from "../../components/card/HeadingCard";
import TableComponent from "../../components/table/TableComponent";

// ===== FORM FIELDS =====
const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'department', label: 'Department', type: 'text', required: true },
    { name: 'designation', label: 'Designation', type: 'text', required: true },
    { name: 'mobile', label: 'Mobile', type: 'tel', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },

    // ⭐ NEW — STATUS field
    {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" }
        ]
    }
];

// Placeholder API functions — replace with real API
const createTherapistAPI = async (data) => {
    const newId = Date.now().toString();
    return { _id: newId, ...data };
};

const updateTherapistAPI = async (data, id) => {
    return { _id: id, ...data };
};

const deleteTherapistAPI = async (id) => {
    console.log("Deleted therapist:", id);
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
            status: "Active",   // ⭐ NEW
        },
        {
            _id: "2",
            name: "Priya Nair",
            department: "Ayurvedic Therapy",
            designation: "Therapist",
            mobile: "+91 8765432199",
            email: "priya.nair@example.com",
            status: "Inactive", // ⭐ NEW
        },
    ]);

    // ===== TABLE COLUMNS =====
    const columns = [
        { field: "name", header: "Name" },
        { field: "department", header: "Department" },
        { field: "designation", header: "Designation" },
        { field: "mobile", header: "Mobile" },
        { field: "email", header: "Email" },
        { field: "status", header: "Status" }, // ⭐ Show status badge
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

                formFields={fields}
                onCreateSubmit={handleCreateSubmit}
                onEditSubmit={handleEditSubmit}

                showView={true}
                showEdit={true}
                showDelete={true}

                onDelete={handleDelete}

                showStatusBadge={true}   // ⭐ Uses your theme colors
                statusField="status"     // ⭐ Uses correct status field
            />
        </div>
    );
}

export default Therapists;
