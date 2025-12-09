

// import React, { useState } from "react";
// import HeadingCard from "../../../components/card/HeadingCard";
// import TableComponent from "../../../components/table/TableComponent";

// // Define fields for the form modals
// const fields = [
//     { name: 'uhid', label: 'UHID / Patient ID', type: 'text', required: true },
//     { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
//     { name: 'doctor', label: 'Doctor', type: 'text', required: true },
//     { name: 'admissionDate', label: 'Admission Date', type: 'date', required: true },
//     { name: 'dischargeDate', label: 'Discharge Date', type: 'date', required: true },
//     { name: 'amount', label: 'Final Amount (₹)', type: 'text', required: true },
//     {
//         name: 'status',
//         label: 'Status',
//         type: 'select',
//         required: true,
//         options: [
//             { value: 'Completed', label: 'Completed' },
//             { value: 'Pending', label: 'Pending' },
//             { value: 'Cancelled', label: 'Cancelled' },
//         ],
//     },
// ];

// // Placeholder API functions - replace with actual API calls
// const createDischargeAPI = async (data) => {
//     // Simulate API call
//     const newId = Date.now().toString();
//     const newDischarge = { _id: newId, ...data };
//     console.log('Created discharge record:', newDischarge);
//     return newDischarge;
// };

// const updateDischargeAPI = async (data, id) => {
//     // Simulate API call
//     console.log('Updated discharge record:', { _id: id, ...data });
//     return { _id: id, ...data };
// };

// const deleteDischargeAPI = async (id) => {
//     // Simulate API call
//     console.log('Deleted discharge record:', id);
// };

// function Discharges() {
//     const [rows, setRows] = useState([
//         {
//             _id: "1",
//             uhid: "UHID-1001",
//             patientName: "Amit Verma",
//             doctor: "Dr. Sharma",
//             admissionDate: "2025-01-12",
//             dischargeDate: "2025-01-18",
//             amount: "₹ 12,500",
//             status: "Completed",
//         },
//         {
//             _id: "2",
//             uhid: "UHID-1005",
//             patientName: "Neha Gupta",
//             doctor: "Dr. Rao",
//             admissionDate: "2025-01-10",
//             dischargeDate: "2025-01-15",
//             amount: "₹ 9,200",
//             status: "Completed",
//         },
//     ]);

//     const columns = [
//         { field: "uhid", header: "UHID / Patient ID" },
//         { field: "patientName", header: "Patient Name" },
//         { field: "doctor", header: "Doctor" },
//         { field: "admissionDate", header: "Admission Date" },
//         { field: "dischargeDate", header: "Discharge Date" },
//         { field: "amount", header: "Final Amount (₹)" },
//         { field: "status", header: "Status" },
//     ];

//     const handleCreateSubmit = async (data) => {
//         const newDischarge = await createDischargeAPI(data);
//         setRows(prev => [...prev, newDischarge]);
//     };

//     const handleEditSubmit = async (data, row) => {
//         const updatedDischarge = await updateDischargeAPI(data, row._id);
//         setRows(prev => prev.map(r => r._id === row._id ? updatedDischarge : r));
//     };

//     const handleDelete = (id) => {
//         if (window.confirm(`Are you sure you want to delete discharge record ${id}?`)) {
//             deleteDischargeAPI(id);
//             setRows(prev => prev.filter(r => r._id !== id));
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Discharge Records"
//                 subtitle="View and manage patient discharge summaries, track billing details, and ensure accurate hospital record keeping."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Discharge Records" }
//                 ]}
//             />

//             {/* Table */}
//             <TableComponent
//                 title="Discharge List"
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

// export default Discharges;

import React, { useState } from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";

// Form fields (used only for View modal)
const fields = [
    { name: 'uhid', label: 'UHID / Patient ID', type: 'text', required: true },
    { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
    { name: 'doctor', label: 'Doctor', type: 'text', required: true },
    { name: 'admissionDate', label: 'Admission Date', type: 'date', required: true },
    { name: 'dischargeDate', label: 'Discharge Date', type: 'date', required: true },
    { name: 'amount', label: 'Final Amount (₹)', type: 'number', required: true },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
            { value: 'Completed', label: 'Completed' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Cancelled', label: 'Cancelled' },
        ],
    },
];

function Discharges() {
    const [rows, setRows] = useState([
        {
            _id: "1",
            uhid: "UHID-1001",
            patientName: "Amit Verma",
            doctor: "Dr. Sharma",
            admissionDate: "2025-01-12",
            dischargeDate: "2025-01-18",
            amount: 12500,
            status: "Completed",
        },
        {
            _id: "2",
            uhid: "UHID-1005",
            patientName: "Neha Gupta",
            doctor: "Dr. Rao",
            admissionDate: "2025-01-10",
            dischargeDate: "2025-01-15",
            amount: 9200,
            status: "Completed",
        },
        {
            _id: "3",
            uhid: "UHID-1010",
            patientName: "Rohan Das",
            doctor: "Dr. Patel",
            admissionDate: "2025-01-20",
            dischargeDate: "2025-01-25",
            amount: 18500,
            status: "Pending",
        },
    ]);

    const columns = [
        { field: "uhid", header: "UHID / Patient ID" },
        { field: "patientName", header: "Patient Name" },
        { field: "doctor", header: "Doctor" },
        { field: "admissionDate", header: "Admission Date" },
        { field: "dischargeDate", header: "Discharge Date" },
        {
            field: "amount",
            header: "Final Amount (₹)",
            render: (row) => `₹${row.amount.toLocaleString('en-IN')}`,
        },
        { field: "status", header: "Status" }, // Auto shows badge!
    ];

    return (
        <div>
            <HeadingCard
                title="Discharge Records"
                subtitle="View and manage patient discharge summaries, track billing details, and ensure accurate hospital record keeping."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Discharge Records" }
                ]}
            />

            <TableComponent
                title="Discharge Records List"
                columns={columns}
                rows={rows}
                formFields={fields} // For View modal

                // Only show what you want
                showView={true}           // View modal ON
                showEdit={false}          // Edit button OFF
                showDelete={false}        // Delete button OFF
                showAddButton={false}  // Create button OFF
                showExportButton={true} // Export Excel ON

            // No need to pass handlers since no edit/delete/create
            />
        </div>
    );
}

export default Discharges;