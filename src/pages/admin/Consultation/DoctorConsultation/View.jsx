// import React from 'react';
// import TableComponent from '../../../../components/table/TableComponent';
// import HeadingCard from '../../../../components/card/HeadingCard';

// function Consultation_View() {

//     // 👉 Table Columns
//     const columns = [
//         { field: "doctor", header: "Doctor" },
//         { field: "fee", header: "Consultation Fee" },
//         { field: "currency", header: "Currency" },
//         { field: "status", header: "Status" },
//         { field: "updated", header: "Updated" },
//     ];

//     // 👉 Dummy Data (Replace with API later)
//     const rows = [
//         {
//             _id: "1",
//             doctor: "Dr. Amit Sharma",
//             fee: "500",
//             currency: "INR",
//             status: "Active",
//             updated: "2025-01-12",
//         },
//         {
//             _id: "2",
//             doctor: "Dr. Neha Gupta",
//             fee: "700",
//             currency: "INR",
//             status: "Inactive",
//             updated: "2025-01-10",
//         },
//     ];

//     return (
//         <div>
//             <HeadingCard
//                 title="Consultation Fee Management"
//                 subtitle="Manage consultation fees, status, and currency for different doctors."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Slot Consultation" }
//                 ]}
//             />

//             <TableComponent
//                 title="Consultation Fee List"
//                 columns={columns}
//                 rows={rows}
//                 onCreate={() => console.log("Create Consultation Fee")}
//                 onDelete={(id) => console.log("Delete:", id)}
//             />
//         </div>
//     );
// }

// export default Consultation_View;

// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import TableComponent from '../../../../components/table/TableComponent';
// import HeadingCard from '../../../../components/card/HeadingCard';

// function Consultation_View() {
//     const navigate = useNavigate();

//     // 👉 Table Columns
//     const columns = [
//         { field: "doctor", header: "Doctor" },
//         { field: "fee", header: "Consultation Fee" },
//         { field: "currency", header: "Currency" },
//         { field: "status", header: "Status" },
//         { field: "updated", header: "Updated" },
//     ];

//     // 👉 Dummy Data (Replace with API later)
//     const rows = [
//         {
//             _id: "1",
//             doctor: "Dr. Amit Sharma",
//             fee: "500",
//             currency: "INR",
//             status: "Active",
//             updated: "2025-01-12",
//         },
//         {
//             _id: "2",
//             doctor: "Dr. Neha Gupta",
//             fee: "700",
//             currency: "INR",
//             status: "Inactive",
//             updated: "2025-01-10",
//         },
//     ];

//     const handleCreate = () => {
//         navigate("/admin/consultation/create");
//     };

//     const handleDelete = (id) => {
//         // Add confirmation dialog and API call here
//         if (window.confirm(`Are you sure you want to delete consultation fee ${id}?`)) {
//             console.log("Delete consultation fee:", id); // Replace with API call
//             // Refresh rows after delete
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Consultation Fee Management"
//                 subtitle="Manage consultation fees, status, and currency for different doctors."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Slot Consultation" }
//                 ]}
//             />

//             <TableComponent
//                 title="Consultation Fee List"
//                 columns={columns}
//                 rows={rows}
//                 viewPath="/admin/consultation/view"
//                 editPath="/admin/consultation/edit"
//                 showView={true}
//                 showEdit={true}
//                 showDelete={true}
//                 onCreate={handleCreate}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Consultation_View;

import React, { useState } from 'react';
import HeadingCard from '../../../../components/card/HeadingCard';
import TableComponent from '../../../../components/table/TableComponent';

// Define fields for the form modals
const fields = [
    { name: 'doctor', label: 'Doctor', type: 'text', required: true },
    { name: 'fee', label: 'Consultation Fee', type: 'number', required: true },
    { name: 'currency', label: 'Currency', type: 'text', required: true },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
        ],
    },
    { name: 'updated', label: 'Updated', type: 'date', required: false },
];

// Placeholder API functions - replace with actual API calls
const createConsultationFeeAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newFee = { _id: newId, ...data, updated: new Date().toISOString().split('T')[0] };
    console.log('Created consultation fee:', newFee);
    return newFee;
};

const updateConsultationFeeAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated consultation fee:', { _id: id, ...data });
    return { _id: id, ...data, updated: new Date().toISOString().split('T')[0] };
};

const deleteConsultationFeeAPI = async (id) => {
    // Simulate API call
    console.log('Deleted consultation fee:', id);
};

function Consultation_View() {
    const [rows, setRows] = useState([
        {
            _id: "1",
            doctor: "Dr. Amit Sharma",
            fee: 500,
            currency: "INR",
            status: "Active",
            updated: "2025-01-12",
        },
        {
            _id: "2",
            doctor: "Dr. Neha Gupta",
            fee: 700,
            currency: "INR",
            status: "Inactive",
            updated: "2025-01-10",
        },
    ]);

    const columns = [
        { field: "doctor", header: "Doctor" },
        { field: "fee", header: "Consultation Fee" },
        { field: "currency", header: "Currency" },
        { field: "status", header: "Status" },
        { field: "updated", header: "Updated" },
    ];

    const handleCreateSubmit = async (data) => {
        const newFee = await createConsultationFeeAPI(data);
        setRows(prev => [...prev, newFee]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedFee = await updateConsultationFeeAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedFee : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete consultation fee ${id}?`)) {
            deleteConsultationFeeAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Consultation Fee Management"
                subtitle="Manage consultation fees, status, and currency for different doctors."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Slot Consultation" }
                ]}
            />

            <TableComponent
                title="Consultation Fee List"
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

export default Consultation_View;