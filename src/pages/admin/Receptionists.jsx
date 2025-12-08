// import React from "react";
// import TableComponent from "../../components/table/TableComponent";
// import HeadingCard from "../../components/card/HeadingCard";

// function Receptionists() {

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
//             name: "Riya Patel",
//             department: "Front Office",
//             designation: "Receptionist",
//             mobile: "+91 9801234567",
//             email: "riya.patel@email.com",
//         },
//         {
//             _id: "2",
//             name: "Simran Kaur",
//             department: "Front Office",
//             designation: "Receptionist",
//             mobile: "+91 9876543210",
//             email: "simran.kaur@email.com",
//         },
//     ];

//     return (
//         <div>
//             <HeadingCard
//                 title="Receptionists"
//                 subtitle="View and manage all receptionists working at the front office."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "View Receptionists" }
//                 ]}
//             />

//             <TableComponent
//                 title="Receptionists List"
//                 columns={columns}
//                 rows={rows}
//             />
//         </div>
//     );
// }

// export default Receptionists;

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import TableComponent from "../../components/table/TableComponent";
// import HeadingCard from "../../components/card/HeadingCard";

// function Receptionists() {
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
//             name: "Riya Patel",
//             department: "Front Office",
//             designation: "Receptionist",
//             mobile: "+91 9801234567",
//             email: "riya.patel@email.com",
//         },
//         {
//             _id: "2",
//             name: "Simran Kaur",
//             department: "Front Office",
//             designation: "Receptionist",
//             mobile: "+91 9876543210",
//             email: "simran.kaur@email.com",
//         },
//     ];

//     const handleCreate = () => {
//         navigate("/admin/receptionists/create");
//     };

//     const handleDelete = (id) => {
//         // Add confirmation dialog and API call here
//         if (window.confirm(`Are you sure you want to delete receptionist ${id}?`)) {
//             console.log("Delete receptionist:", id); // Replace with API call
//             // Refresh rows after delete
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Receptionists"
//                 subtitle="View and manage all receptionists working at the front office."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Receptionists" }
//                 ]}
//             />

//             <TableComponent
//                 title="Receptionists List"
//                 columns={columns}
//                 rows={rows}
//                 viewPath="/admin/receptionists/view"
//                 editPath="/admin/receptionists/edit"
//                 showView={true}
//                 showEdit={true}
//                 showDelete={true}
//                 onCreate={handleCreate}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Receptionists;

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
const createReceptionistAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newReceptionist = { _id: newId, ...data };
    console.log('Created receptionist:', newReceptionist);
    return newReceptionist;
};

const updateReceptionistAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated receptionist:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deleteReceptionistAPI = async (id) => {
    // Simulate API call
    console.log('Deleted receptionist:', id);
};

function Receptionists() {
    const [rows, setRows] = useState([
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
    ]);

    const columns = [
        { field: "name", header: "Name" },
        { field: "department", header: "Department" },
        { field: "designation", header: "Designation" },
        { field: "mobile", header: "Mobile" },
        { field: "email", header: "Email" },
    ];

    const handleCreateSubmit = async (data) => {
        const newReceptionist = await createReceptionistAPI(data);
        setRows(prev => [...prev, newReceptionist]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedReceptionist = await updateReceptionistAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedReceptionist : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete receptionist ${id}?`)) {
            deleteReceptionistAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Receptionists"
                subtitle="View and manage all receptionists working at the front office."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Receptionists" }
                ]}
            />

            <TableComponent
                title="Receptionists List"
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

export default Receptionists;