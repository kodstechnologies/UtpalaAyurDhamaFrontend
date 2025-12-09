// import React, { useState } from "react";
// import HeadingCard from "../../components/card/HeadingCard";
// import TableComponent from "../../components/table/TableComponent";

// // Define fields for the form modals
// const fields = [
//     { name: 'name', label: 'Name', type: 'text', required: true },
//     { name: 'age', label: 'Age', type: 'number', required: true },
//     {
//         name: 'gender', label: 'Gender', type: 'select', required: true, options: [
//             { value: 'Male', label: 'Male' },
//             { value: 'Female', label: 'Female' },
//             { value: 'Other', label: 'Other' },
//         ]
//     },
//     { name: 'mobile', label: 'Mobile', type: 'tel', required: true },
//     { name: 'email', label: 'Email', type: 'email', required: true },
// ];

// // Placeholder API functions - replace with actual API calls
// const createPatientAPI = async (data) => {
//     // Simulate API call
//     const newId = Date.now().toString();
//     const newPatient = { _id: newId, ...data };
//     console.log('Created patient:', newPatient);
//     return newPatient;
// };

// const updatePatientAPI = async (data, id) => {
//     // Simulate API call
//     console.log('Updated patient:', { _id: id, ...data });
//     return { _id: id, ...data };
// };

// const deletePatientAPI = async (id) => {
//     // Simulate API call
//     console.log('Deleted patient:', id);
// };

// function Patients() {
//     const [rows, setRows] = useState([
//         {
//             _id: "1",
//             name: "Ankit Sharma",
//             age: 34,
//             gender: "Male",
//             mobile: "+91 9876501234",
//             email: "ankit.sharma@example.com",
//         },
//         {
//             _id: "2",
//             name: "Riya Menon",
//             age: 29,
//             gender: "Female",
//             mobile: "+91 9988776655",
//             email: "riya.menon@example.com",
//         },
//         {
//             _id: "3",
//             name: "Suresh Patil",
//             age: 42,
//             gender: "Male",
//             mobile: "+91 9090909090",
//             email: "suresh.patil@example.com",
//         },
//     ]);

//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "age", header: "Age" },
//         { field: "gender", header: "Gender" },
//         { field: "mobile", header: "Mobile" },
//         { field: "email", header: "Email" },
//     ];

//     const handleCreateSubmit = async (data) => {
//         const newPatient = await createPatientAPI(data);
//         setRows(prev => [...prev, newPatient]);
//     };

//     const handleEditSubmit = async (data, row) => {
//         const updatedPatient = await updatePatientAPI(data, row._id);
//         setRows(prev => prev.map(r => r._id === row._id ? updatedPatient : r));
//     };

//     const handleDelete = (id) => {
//         if (window.confirm(`Are you sure you want to delete patient ${id}?`)) {
//             deletePatientAPI(id);
//             setRows(prev => prev.filter(r => r._id !== id));
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Patients"
//                 subtitle="View and manage all registered patients and their basic details."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Patients" }
//                 ]}
//             />

//             <TableComponent
//                 title="Patients List"
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

// export default Patients;

import React, { useState } from "react";
import HeadingCard from "../../components/card/HeadingCard";
import TableComponent from "../../components/table/TableComponent";

// ===== FORM FIELDS =====
const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'age', label: 'Age', type: 'number', required: true },

    {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' },
        ]
    },

    { name: 'mobile', label: 'Mobile', type: 'tel', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },

    // ⭐ NEW — STATUS FIELD
    {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
        ],
    },
];

// Placeholder API functions
const createPatientAPI = async (data) => {
    const newId = Date.now().toString();
    return { _id: newId, ...data };
};

const updatePatientAPI = async (data, id) => {
    return { _id: id, ...data };
};

const deletePatientAPI = async (id) => {
    console.log("Deleted patient:", id);
};

function Patients() {
    const [rows, setRows] = useState([
        {
            _id: "1",
            name: "Ankit Sharma",
            age: 34,
            gender: "Male",
            mobile: "+91 9876501234",
            email: "ankit.sharma@example.com",
            status: "Active", // ⭐ ADDED
        },
        {
            _id: "2",
            name: "Riya Menon",
            age: 29,
            gender: "Female",
            mobile: "+91 9988776655",
            email: "riya.menon@example.com",
            status: "Inactive", // ⭐ ADDED
        },
        {
            _id: "3",
            name: "Suresh Patil",
            age: 42,
            gender: "Male",
            mobile: "+91 9090909090",
            email: "suresh.patil@example.com",
            status: "Active", // ⭐ ADDED
        },
    ]);

    // ===== TABLE COLUMNS =====
    const columns = [
        { field: "name", header: "Name" },
        { field: "age", header: "Age" },
        { field: "gender", header: "Gender" },
        { field: "mobile", header: "Mobile" },
        { field: "email", header: "Email" },
        { field: "status", header: "Status" }, // ⭐ Status badge auto handled
    ];

    const handleCreateSubmit = async (data) => {
        const newPatient = await createPatientAPI(data);
        setRows(prev => [...prev, newPatient]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedPatient = await updatePatientAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedPatient : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete patient ${id}?`)) {
            deletePatientAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Patients"
                subtitle="View and manage all registered patients and their basic details."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Patients" }
                ]}
            />

            <TableComponent
                title="Patients List"
                columns={columns}
                rows={rows}

                formFields={fields}
                onCreateSubmit={handleCreateSubmit}
                onEditSubmit={handleEditSubmit}

                showView={true}
                showEdit={true}
                showDelete={true}

                onDelete={handleDelete}

                showStatusBadge={true}   // ⭐ Enables custom theme badge
                statusField="status"
            />
        </div>
    );
}

export default Patients;
