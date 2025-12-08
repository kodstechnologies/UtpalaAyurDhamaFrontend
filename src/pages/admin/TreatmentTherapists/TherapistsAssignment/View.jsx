// import React from 'react';
// import TableComponent from '../../../../components/table/TableComponent';
// import HeadingCard from '../../../../components/card/HeadingCard';

// function Therapists_Assignment_View() {

//     // TABLE COLUMNS
//     const columns = [
//         { field: "therapyType", header: "Therapy Type" },
//         { field: "therapist", header: "Therapist" },
//         { field: "cost", header: "Cost" },
//     ];

//     // SAMPLE ROWS
//     const rows = [
//         {
//             _id: "1",
//             therapyType: "Abhyanga",
//             therapist: "Rahul Verma",
//             cost: "₹1,200"
//         },
//         {
//             _id: "2",
//             therapyType: "Shirodhara",
//             therapist: "Meera Nair",
//             cost: "₹1,500"
//         },
//         {
//             _id: "3",
//             therapyType: "Pizhichil",
//             therapist: "Arun Kumar",
//             cost: "₹2,000"
//         }
//     ];

//     return (
//         <div>
//             <HeadingCard
//                 title="Therapists Assignment"
//                 subtitle="Assign trained therapists to treatments and manage their service costs efficiently."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Therapists Assignment" }
//                 ]}
//             />

//             {/* TABLE */}
//             <TableComponent
//                 title="Therapists Assignment List"
//                 columns={columns}
//                 rows={rows}
//             />
//         </div>
//     );
// }

// export default Therapists_Assignment_View;


// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import TableComponent from '../../../../components/table/TableComponent';
// import HeadingCard from '../../../../components/card/HeadingCard';

// function Therapists_Assignment_View() {
//     const navigate = useNavigate();

//     // TABLE COLUMNS
//     const columns = [
//         { field: "therapyType", header: "Therapy Type" },
//         { field: "therapist", header: "Therapist" },
//         { field: "cost", header: "Cost" },
//     ];

//     // SAMPLE ROWS
//     const rows = [
//         {
//             _id: "1",
//             therapyType: "Abhyanga",
//             therapist: "Rahul Verma",
//             cost: "₹1,200"
//         },
//         {
//             _id: "2",
//             therapyType: "Shirodhara",
//             therapist: "Meera Nair",
//             cost: "₹1,500"
//         },
//         {
//             _id: "3",
//             therapyType: "Pizhichil",
//             therapist: "Arun Kumar",
//             cost: "₹2,000"
//         }
//     ];

//     const handleCreate = () => {
//         navigate("/admin/therapists/assignment/create");
//     };

//     const handleDelete = (id) => {
//         // Add confirmation dialog and API call here
//         if (window.confirm(`Are you sure you want to delete assignment ${id}?`)) {
//             console.log("Delete assignment:", id); // Replace with API call
//             // Refresh rows after delete
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Therapists Assignment"
//                 subtitle="Assign trained therapists to treatments and manage their service costs efficiently."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Therapists Assignment" }
//                 ]}
//             />

//             {/* TABLE */}
//             <TableComponent
//                 title="Therapists Assignment List"
//                 columns={columns}
//                 rows={rows}
//                 viewPath="/admin/therapists/assignment/view"
//                 editPath="/admin/therapists/assignment/edit"
//                 showView={true}
//                 showEdit={true}
//                 showDelete={true}
//                 onCreate={handleCreate}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Therapists_Assignment_View;

import React, { useState } from 'react';
import HeadingCard from '../../../../components/card/HeadingCard';
import TableComponent from '../../../../components/table/TableComponent';

// Define fields for the form modals
const fields = [
    { name: 'therapyType', label: 'Therapy Type', type: 'text', required: true },
    { name: 'therapist', label: 'Therapist', type: 'text', required: true },
    { name: 'cost', label: 'Cost', type: 'text', required: true },
];

// Placeholder API functions - replace with actual API calls
const createAssignmentAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newAssignment = { _id: newId, ...data };
    console.log('Created assignment:', newAssignment);
    return newAssignment;
};

const updateAssignmentAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated assignment:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deleteAssignmentAPI = async (id) => {
    // Simulate API call
    console.log('Deleted assignment:', id);
};

function Therapists_Assignment_View() {
    const [rows, setRows] = useState([
        {
            _id: "1",
            therapyType: "Abhyanga",
            therapist: "Rahul Verma",
            cost: "₹1,200"
        },
        {
            _id: "2",
            therapyType: "Shirodhara",
            therapist: "Meera Nair",
            cost: "₹1,500"
        },
        {
            _id: "3",
            therapyType: "Pizhichil",
            therapist: "Arun Kumar",
            cost: "₹2,000"
        }
    ]);

    const columns = [
        { field: "therapyType", header: "Therapy Type" },
        { field: "therapist", header: "Therapist" },
        { field: "cost", header: "Cost" },
    ];

    const handleCreateSubmit = async (data) => {
        const newAssignment = await createAssignmentAPI(data);
        setRows(prev => [...prev, newAssignment]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedAssignment = await updateAssignmentAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedAssignment : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete assignment ${id}?`)) {
            deleteAssignmentAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Therapists Assignment"
                subtitle="Assign trained therapists to treatments and manage their service costs efficiently."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Therapists Assignment" }
                ]}
            />

            {/* TABLE */}
            <TableComponent
                title="Therapists Assignment List"
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

export default Therapists_Assignment_View;