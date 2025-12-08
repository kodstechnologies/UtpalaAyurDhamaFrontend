// import React from 'react';
// import TableComponent from '../../../../components/table/TableComponent';
// import HeadingCard from '../../../../components/card/HeadingCard';

// function Therapists_View() {

//     const columns = [
//         { field: "therapyName", header: "Therapy Name" },
//         { field: "cost", header: "Cost" },
//         { field: "description", header: "Description" },
//     ];

//     const rows = [
//         {
//             _id: "1",
//             therapyName: "Abhyanga Massage",
//             cost: "₹1500",
//             description: "Full-body warm oil massage therapy",
//         },
//         {
//             _id: "2",
//             therapyName: "Shirodhara",
//             cost: "₹2000",
//             description: "Warm oil therapy for stress relief",
//         },
//     ];

//     return (
//         <div>
//             <HeadingCard
//                 title="Therapy Scheduling & Pricing"
//                 subtitle="Manage therapy schedules, assign specialists, and maintain transparent pricing for patient care and billing."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Therapy Scheduling & Pricing" }
//                 ]}
//             />

//             <TableComponent
//                 title="Therapy List"
//                 columns={columns}
//                 rows={rows}
//             />
//         </div>
//     );
// }

// export default Therapists_View;

// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import TableComponent from '../../../../components/table/TableComponent';
// import HeadingCard from '../../../../components/card/HeadingCard';

// function Therapists_View() {
//     const navigate = useNavigate();

//     const columns = [
//         { field: "therapyName", header: "Therapy Name" },
//         { field: "cost", header: "Cost" },
//         { field: "description", header: "Description" },
//     ];

//     const rows = [
//         {
//             _id: "1",
//             therapyName: "Abhyanga Massage",
//             cost: "₹1500",
//             description: "Full-body warm oil massage therapy",
//         },
//         {
//             _id: "2",
//             therapyName: "Shirodhara",
//             cost: "₹2000",
//             description: "Warm oil therapy for stress relief",
//         },
//     ];

//     const handleCreate = () => {
//         navigate("/admin/therapy/create");
//     };

//     const handleDelete = (id) => {
//         // Add confirmation dialog and API call here
//         if (window.confirm(`Are you sure you want to delete therapy ${id}?`)) {
//             console.log("Delete therapy:", id); // Replace with API call
//             // Refresh rows after delete
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Therapy Scheduling & Pricing"
//                 subtitle="Manage therapy schedules, assign specialists, and maintain transparent pricing for patient care and billing."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Therapy Scheduling & Pricing" }
//                 ]}
//             />

//             <TableComponent
//                 title="Therapy List"
//                 columns={columns}
//                 rows={rows}
//                 viewPath="/admin/therapy/view"
//                 editPath="/admin/therapy/edit"
//                 showView={true}
//                 showEdit={true}
//                 showDelete={true}
//                 onCreate={handleCreate}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Therapists_View;

import React, { useState } from 'react';
import HeadingCard from '../../../../components/card/HeadingCard';
import TableComponent from '../../../../components/table/TableComponent';

// Define fields for the form modals
const fields = [
    { name: 'therapyName', label: 'Therapy Name', type: 'text', required: true },
    { name: 'cost', label: 'Cost', type: 'number', required: true },
    { name: 'description', label: 'Description', type: 'text', required: true },
];

// Placeholder API functions - replace with actual API calls
const createTherapyAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newTherapy = { _id: newId, ...data };
    console.log('Created therapy:', newTherapy);
    return newTherapy;
};

const updateTherapyAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated therapy:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deleteTherapyAPI = async (id) => {
    // Simulate API call
    console.log('Deleted therapy:', id);
};

function TherapyManagement() {
    const [rows, setRows] = useState([
        {
            _id: "1",
            therapyName: "Abhyanga Massage",
            cost: "1500",
            description: "Full-body warm oil massage therapy",
        },
        {
            _id: "2",
            therapyName: "Shirodhara",
            cost: "2000",
            description: "Warm oil therapy for stress relief",
        },
    ]);

    const columns = [
        { field: "therapyName", header: "Therapy Name" },
        { field: "cost", header: "Cost" },
        { field: "description", header: "Description" },
    ];

    const handleCreateSubmit = async (data) => {
        const newTherapy = await createTherapyAPI(data);
        setRows(prev => [...prev, newTherapy]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedTherapy = await updateTherapyAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedTherapy : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete therapy ${id}?`)) {
            deleteTherapyAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Therapy Scheduling & Pricing"
                subtitle="Manage therapy schedules, assign specialists, and maintain transparent pricing for patient care and billing."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Therapy Scheduling & Pricing" }
                ]}
            />

            <TableComponent
                title="Therapy List"
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

export default TherapyManagement;