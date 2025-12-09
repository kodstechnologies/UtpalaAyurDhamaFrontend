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
// const createPharmacistAPI = async (data) => {
//     // Simulate API call
//     const newId = Date.now().toString();
//     const newPharmacist = { _id: newId, ...data };
//     console.log('Created pharmacist:', newPharmacist);
//     return newPharmacist;
// };

// const updatePharmacistAPI = async (data, id) => {
//     // Simulate API call
//     console.log('Updated pharmacist:', { _id: id, ...data });
//     return { _id: id, ...data };
// };

// const deletePharmacistAPI = async (id) => {
//     // Simulate API call
//     console.log('Deleted pharmacist:', id);
// };

// function Pharmacists() {
//     const [rows, setRows] = useState([
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
//     ]);

//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "department", header: "Department" },
//         { field: "designation", header: "Designation" },
//         { field: "mobile", header: "Mobile" },
//         { field: "email", header: "Email" },
//     ];

//     const handleCreateSubmit = async (data) => {
//         const newPharmacist = await createPharmacistAPI(data);
//         setRows(prev => [...prev, newPharmacist]);
//     };

//     const handleEditSubmit = async (data, row) => {
//         const updatedPharmacist = await updatePharmacistAPI(data, row._id);
//         setRows(prev => prev.map(r => r._id === row._id ? updatedPharmacist : r));
//     };

//     const handleDelete = (id) => {
//         if (window.confirm(`Are you sure you want to delete pharmacist ${id}?`)) {
//             deletePharmacistAPI(id);
//             setRows(prev => prev.filter(r => r._id !== id));
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

// export default Pharmacists;

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

    // ⭐ NEW — STATUS FIELD (Active / Inactive)
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

// ===== Placeholder API =====
const createPharmacistAPI = async (data) => {
    const newId = Date.now().toString();
    return { _id: newId, ...data };
};

const updatePharmacistAPI = async (data, id) => {
    return { _id: id, ...data };
};

const deletePharmacistAPI = async (id) => {
    console.log("Deleted pharmacist:", id);
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
            status: "Active",   // ⭐ NEW
        },
        {
            _id: "2",
            name: "Priya Singh",
            department: "Pharmacy",
            designation: "Pharmacist",
            mobile: "+91 8765432109",
            email: "priya.singh@email.com",
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
        { field: "status", header: "Status" }, // ⭐ Enable status badge
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

                formFields={fields}
                onCreateSubmit={handleCreateSubmit}
                onEditSubmit={handleEditSubmit}

                showView={true}
                showEdit={true}
                showDelete={true}
                onDelete={handleDelete}

                showStatusBadge={true}    // ⭐ Force use of your olive/brown theme badge
                statusField="status"      // ⭐ Tell table which field is the status
            />
        </div>
    );
}

export default Pharmacists;
