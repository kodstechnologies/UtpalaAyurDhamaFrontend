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
// const createReceptionistAPI = async (data) => {
//     // Simulate API call
//     const newId = Date.now().toString();
//     const newReceptionist = { _id: newId, ...data };
//     console.log('Created receptionist:', newReceptionist);
//     return newReceptionist;
// };

// const updateReceptionistAPI = async (data, id) => {
//     // Simulate API call
//     console.log('Updated receptionist:', { _id: id, ...data });
//     return { _id: id, ...data };
// };

// const deleteReceptionistAPI = async (id) => {
//     // Simulate API call
//     console.log('Deleted receptionist:', id);
// };

// function Receptionists() {
//     const [rows, setRows] = useState([
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
//     ]);

//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "department", header: "Department" },
//         { field: "designation", header: "Designation" },
//         { field: "mobile", header: "Mobile" },
//         { field: "email", header: "Email" },
//     ];

//     const handleCreateSubmit = async (data) => {
//         const newReceptionist = await createReceptionistAPI(data);
//         setRows(prev => [...prev, newReceptionist]);
//     };

//     const handleEditSubmit = async (data, row) => {
//         const updatedReceptionist = await updateReceptionistAPI(data, row._id);
//         setRows(prev => prev.map(r => r._id === row._id ? updatedReceptionist : r));
//     };

//     const handleDelete = (id) => {
//         if (window.confirm(`Are you sure you want to delete receptionist ${id}?`)) {
//             deleteReceptionistAPI(id);
//             setRows(prev => prev.filter(r => r._id !== id));
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

// export default Receptionists;

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

    // ⭐ NEW — STATUS FIELD (auto dropdown)
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
const createReceptionistAPI = async (data) => {
    const newId = Date.now().toString();
    return { _id: newId, ...data };
};

const updateReceptionistAPI = async (data, id) => {
    return { _id: id, ...data };
};

const deleteReceptionistAPI = async (id) => {
    console.log("Deleted:", id);
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
            status: "Active",   // ⭐ NEW
        },
        {
            _id: "2",
            name: "Simran Kaur",
            department: "Front Office",
            designation: "Receptionist",
            mobile: "+91 9876543210",
            email: "simran.kaur@email.com",
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
        { field: "status", header: "Status" }, // ⭐ NEW → auto badge
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

                formFields={fields}
                onCreateSubmit={handleCreateSubmit}
                onEditSubmit={handleEditSubmit}

                showView={true}
                showEdit={true}
                showDelete={true}

                onDelete={handleDelete}

                showStatusBadge={true}     // ⭐ Auto brown-theme badge
                statusField="status"       // ⭐ Use status column
            />
        </div>
    );
}

export default Receptionists;
