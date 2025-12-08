// import React from "react";
// import TableComponent from "../../components/table/TableComponent";
// import HeadingCard from "../../components/card/HeadingCard";

// function Patients() {

//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "age", header: "Age" },
//         { field: "gender", header: "Gender" },
//         { field: "mobile", header: "Mobile" },
//         { field: "email", header: "Email" },
//     ];

//     const rows = [
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
//     ];

//     return (
//         <div>
//             <HeadingCard
//                 title="Patients"
//                 subtitle="View and manage all registered patients and their basic details."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "View Patients" }
//                 ]}
//             />

//             <TableComponent
//                 title="Patients List"
//                 columns={columns}
//                 rows={rows}
//             />
//         </div>
//     );
// }

// export default Patients;


// import React from "react";
// import { useNavigate } from "react-router-dom";
// import TableComponent from "../../components/table/TableComponent";
// import HeadingCard from "../../components/card/HeadingCard";

// function Patients() {
//     const navigate = useNavigate();

//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "age", header: "Age" },
//         { field: "gender", header: "Gender" },
//         { field: "mobile", header: "Mobile" },
//         { field: "email", header: "Email" },
//     ];

//     const rows = [
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
//     ];

//     const handleCreate = () => {
//         navigate("/admin/patients/create");
//     };

//     const handleDelete = (id) => {
//         // Add confirmation dialog and API call here
//         if (window.confirm(`Are you sure you want to delete patient ${id}?`)) {
//             console.log("Delete patient:", id); // Replace with API call
//             // Refresh rows after delete
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
//                 viewPath="/admin/patients/view"
//                 editPath="/admin/patients/edit"
//                 showView={true}
//                 showEdit={true}
//                 showDelete={true}
//                 onCreate={handleCreate}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Patients;

import React, { useState } from "react";
import HeadingCard from "../../components/card/HeadingCard";
import TableComponent from "../../components/table/TableComponent";

// Define fields for the form modals
const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'age', label: 'Age', type: 'number', required: true },
    {
        name: 'gender', label: 'Gender', type: 'select', required: true, options: [
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' },
        ]
    },
    { name: 'mobile', label: 'Mobile', type: 'tel', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
];

// Placeholder API functions - replace with actual API calls
const createPatientAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newPatient = { _id: newId, ...data };
    console.log('Created patient:', newPatient);
    return newPatient;
};

const updatePatientAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated patient:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deletePatientAPI = async (id) => {
    // Simulate API call
    console.log('Deleted patient:', id);
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
        },
        {
            _id: "2",
            name: "Riya Menon",
            age: 29,
            gender: "Female",
            mobile: "+91 9988776655",
            email: "riya.menon@example.com",
        },
        {
            _id: "3",
            name: "Suresh Patil",
            age: 42,
            gender: "Male",
            mobile: "+91 9090909090",
            email: "suresh.patil@example.com",
        },
    ]);

    const columns = [
        { field: "name", header: "Name" },
        { field: "age", header: "Age" },
        { field: "gender", header: "Gender" },
        { field: "mobile", header: "Mobile" },
        { field: "email", header: "Email" },
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

export default Patients;