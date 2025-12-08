// import React from "react";
// import TableComponent from "../../../components/table/TableComponent";
// import HeadingCard from "../../../components/card/HeadingCard";

// function Discharges() {

//     // ⭐ Table Columns
//     const columns = [
//         { field: "uhid", header: "UHID / Patient ID" },
//         { field: "patientName", header: "Patient Name" },
//         { field: "doctor", header: "Doctor" },
//         { field: "admissionDate", header: "Admission Date" },
//         { field: "dischargeDate", header: "Discharge Date" },
//         { field: "amount", header: "Final Amount (₹)" },
//         { field: "status", header: "Status" },
//     ];

//     // ⭐ Dummy Rows
//     const rows = [
//         {
//             _id: "1",
//             uhid: "UHID-1001",
//             patientName: "Amit Verma",
//             doctor: "Dr. Sharma",
//             admissionDate: "12 Jan 2025",
//             dischargeDate: "18 Jan 2025",
//             amount: "₹ 12,500",
//             status: "Completed",
//         },
//         {
//             _id: "2",
//             uhid: "UHID-1005",
//             patientName: "Neha Gupta",
//             doctor: "Dr. Rao",
//             admissionDate: "10 Jan 2025",
//             dischargeDate: "15 Jan 2025",
//             amount: "₹ 9,200",
//             status: "Completed",
//         },
//     ];

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
//                 onDelete={(id) => console.log("Delete ID:", id)}
//             />
//         </div>
//     );
// }

// export default Discharges;


// import React from "react";
// import { useNavigate } from "react-router-dom";
// import TableComponent from "../../../components/table/TableComponent";
// import HeadingCard from "../../../components/card/HeadingCard";

// function Discharges() {
//     const navigate = useNavigate();

//     // ⭐ Table Columns
//     const columns = [
//         { field: "uhid", header: "UHID / Patient ID" },
//         { field: "patientName", header: "Patient Name" },
//         { field: "doctor", header: "Doctor" },
//         { field: "admissionDate", header: "Admission Date" },
//         { field: "dischargeDate", header: "Discharge Date" },
//         { field: "amount", header: "Final Amount (₹)" },
//         { field: "status", header: "Status" },
//     ];

//     // ⭐ Dummy Rows
//     const rows = [
//         {
//             _id: "1",
//             uhid: "UHID-1001",
//             patientName: "Amit Verma",
//             doctor: "Dr. Sharma",
//             admissionDate: "12 Jan 2025",
//             dischargeDate: "18 Jan 2025",
//             amount: "₹ 12,500",
//             status: "Completed",
//         },
//         {
//             _id: "2",
//             uhid: "UHID-1005",
//             patientName: "Neha Gupta",
//             doctor: "Dr. Rao",
//             admissionDate: "10 Jan 2025",
//             dischargeDate: "15 Jan 2025",
//             amount: "₹ 9,200",
//             status: "Completed",
//         },
//     ];

//     const handleCreate = () => {
//         navigate("/admin/discharges/create");
//     };

//     const handleDelete = (id) => {
//         // Add confirmation dialog and API call here
//         if (window.confirm(`Are you sure you want to delete discharge record ${id}?`)) {
//             console.log("Delete discharge record:", id); // Replace with API call
//             // Refresh rows after delete
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
//                 viewPath="/admin/discharges/view"
//                 editPath="/admin/discharges/edit"
//                 showView={true}
//                 showEdit={true}
//                 showDelete={true}
//                 onCreate={handleCreate}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Discharges;

import React, { useState } from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";

// Define fields for the form modals
const fields = [
    { name: 'uhid', label: 'UHID / Patient ID', type: 'text', required: true },
    { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
    { name: 'doctor', label: 'Doctor', type: 'text', required: true },
    { name: 'admissionDate', label: 'Admission Date', type: 'date', required: true },
    { name: 'dischargeDate', label: 'Discharge Date', type: 'date', required: true },
    { name: 'amount', label: 'Final Amount (₹)', type: 'text', required: true },
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

// Placeholder API functions - replace with actual API calls
const createDischargeAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newDischarge = { _id: newId, ...data };
    console.log('Created discharge record:', newDischarge);
    return newDischarge;
};

const updateDischargeAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated discharge record:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deleteDischargeAPI = async (id) => {
    // Simulate API call
    console.log('Deleted discharge record:', id);
};

function Discharges() {
    const [rows, setRows] = useState([
        {
            _id: "1",
            uhid: "UHID-1001",
            patientName: "Amit Verma",
            doctor: "Dr. Sharma",
            admissionDate: "2025-01-12",
            dischargeDate: "2025-01-18",
            amount: "₹ 12,500",
            status: "Completed",
        },
        {
            _id: "2",
            uhid: "UHID-1005",
            patientName: "Neha Gupta",
            doctor: "Dr. Rao",
            admissionDate: "2025-01-10",
            dischargeDate: "2025-01-15",
            amount: "₹ 9,200",
            status: "Completed",
        },
    ]);

    const columns = [
        { field: "uhid", header: "UHID / Patient ID" },
        { field: "patientName", header: "Patient Name" },
        { field: "doctor", header: "Doctor" },
        { field: "admissionDate", header: "Admission Date" },
        { field: "dischargeDate", header: "Discharge Date" },
        { field: "amount", header: "Final Amount (₹)" },
        { field: "status", header: "Status" },
    ];

    const handleCreateSubmit = async (data) => {
        const newDischarge = await createDischargeAPI(data);
        setRows(prev => [...prev, newDischarge]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedDischarge = await updateDischargeAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedDischarge : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete discharge record ${id}?`)) {
            deleteDischargeAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

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

            {/* Table */}
            <TableComponent
                title="Discharge List"
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

export default Discharges;