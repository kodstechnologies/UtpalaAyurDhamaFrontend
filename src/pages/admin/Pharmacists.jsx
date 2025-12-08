// // import React from "react";
// import TableComponent from "../../components/table/TableComponent";
// import HeadingCard from "../../components/card/HeadingCard";

// function Pharmacists() {
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
//             name: "Rohan Verma",
//             department: "Pharmacy",
//             designation: "Chief Pharmacist",
//             mobile: "+91 9876543210",
//             email: "rohan.verma@email.com",
//         },
//         {
//             _id: "2",
//             name: "Priya Singh",
//             department: "Pharmacy",
//             designation: "Pharmacist",
//             mobile: "+91 8765432109",
//             email: "priya.singh@email.com",
//         },
//     ];

//     return (
//         <div>
//             <HeadingCard
//                 title="Pharmacists"
//                 subtitle="View and manage all pharmacists working in the pharmacy department."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "View Pharmacists" }
//                 ]}
//             />

//             <TableComponent
//                 title="Pharmacists List"
//                 columns={columns}
//                 rows={rows}
//             />
//         </div>
//     );
// }

// export default Pharmacists;


// import React from "react";
// import { useNavigate } from "react-router-dom";
// import TableComponent from "../../components/table/TableComponent";
// import HeadingCard from "../../components/card/HeadingCard";

// function Pharmacists() {
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
//             name: "Rohan Verma",
//             department: "Pharmacy",
//             designation: "Chief Pharmacist",
//             mobile: "+91 9876543210",
//             email: "rohan.verma@email.com",
//         },
//         {
//             _id: "2",
//             name: "Priya Singh",
//             department: "Pharmacy",
//             designation: "Pharmacist",
//             mobile: "+91 8765432109",
//             email: "priya.singh@email.com",
//         },
//     ];

//     const handleCreate = () => {
//         navigate("/admin/pharmacists/create");
//     };

//     const handleDelete = (id) => {
//         // Add confirmation dialog and API call here
//         if (window.confirm(`Are you sure you want to delete pharmacist ${id}?`)) {
//             console.log("Delete pharmacist:", id); // Replace with API call
//             // Refresh rows after delete
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Pharmacists"
//                 subtitle="View and manage all pharmacists working in the pharmacy department."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Pharmacists" }
//                 ]}
//             />

//             <TableComponent
//                 title="Pharmacists List"
//                 columns={columns}
//                 rows={rows}
//                 viewPath="/admin/pharmacists/view"
//                 editPath="/admin/pharmacists/edit"
//                 showView={true}
//                 showEdit={true}
//                 showDelete={true}
//                 onCreate={handleCreate}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Pharmacists;

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
const createPharmacistAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newPharmacist = { _id: newId, ...data };
    console.log('Created pharmacist:', newPharmacist);
    return newPharmacist;
};

const updatePharmacistAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated pharmacist:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deletePharmacistAPI = async (id) => {
    // Simulate API call
    console.log('Deleted pharmacist:', id);
};

function Pharmacists() {
    const [rows, setRows] = useState([
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
    ]);

    const columns = [
        { field: "name", header: "Name" },
        { field: "department", header: "Department" },
        { field: "designation", header: "Designation" },
        { field: "mobile", header: "Mobile" },
        { field: "email", header: "Email" },
    ];

    const handleCreateSubmit = async (data) => {
        const newPharmacist = await createPharmacistAPI(data);
        setRows(prev => [...prev, newPharmacist]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedPharmacist = await updatePharmacistAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedPharmacist : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete pharmacist ${id}?`)) {
            deletePharmacistAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Pharmacists"
                subtitle="View and manage all pharmacists working in the pharmacy department."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Pharmacists" }
                ]}
            />

            <TableComponent
                title="Pharmacists List"
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

export default Pharmacists;