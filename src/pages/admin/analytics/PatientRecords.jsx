// import React from "react";
// import TableComponent from "../../../components/table/TableComponent";
// import HeadingCard from "../../../components/card/HeadingCard";

// function PatientRecords() {
//     // 📌 Table Columns
//     const columns = [
//         { field: "invoice", header: "Invoice #" },
//         { field: "patientName", header: "Patient Name" },
//         { field: "doctor", header: "Doctor" },
//         { field: "amount", header: "Final Amount (Incl. GST)" },
//         { field: "date", header: "Date" },
//     ];

//     // 📌 Example Table Rows
//     const rows = [
//         {
//             _id: "1",
//             invoice: "INV-001",
//             patientName: "Amit Sharma",
//             doctor: "Dr. Rakesh",
//             amount: "₹2,500",
//             date: "2025-02-10",
//         },
//         {
//             _id: "2",
//             invoice: "INV-002",
//             patientName: "Neha Gupta",
//             doctor: "Dr. Priya",
//             amount: "₹3,200",
//             date: "2025-02-11",
//         },
//     ];

//     return (
//         <div>
//             <HeadingCard
//                 title="Patient Billing & Records"
//                 subtitle="View detailed billing history including invoices, attending doctors, GST-inclusive amounts, and generated dates."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Analytics" },
//                     { label: "Patient Records" }
//                 ]}
//             />

//             <TableComponent
//                 title="Patient Records"
//                 columns={columns}
//                 rows={rows}
//             />
//         </div>
//     );
// }

// export default PatientRecords;


// import React from "react";
// import { useNavigate } from "react-router-dom";
// import TableComponent from "../../../components/table/TableComponent";
// import HeadingCard from "../../../components/card/HeadingCard";

// function PatientRecords() {
//     const navigate = useNavigate();

//     // 📌 Table Columns
//     const columns = [
//         { field: "invoice", header: "Invoice #" },
//         { field: "patientName", header: "Patient Name" },
//         { field: "doctor", header: "Doctor" },
//         { field: "amount", header: "Final Amount (Incl. GST)" },
//         { field: "date", header: "Date" },
//     ];

//     // 📌 Example Table Rows
//     const rows = [
//         {
//             _id: "1",
//             invoice: "INV-001",
//             patientName: "Amit Sharma",
//             doctor: "Dr. Rakesh",
//             amount: "₹2,500",
//             date: "2025-02-10",
//         },
//         {
//             _id: "2",
//             invoice: "INV-002",
//             patientName: "Neha Gupta",
//             doctor: "Dr. Priya",
//             amount: "₹3,200",
//             date: "2025-02-11",
//         },
//     ];

//     const handleCreate = () => {
//         navigate("/admin/analytics/patient-records/create");
//     };

//     const handleDelete = (id) => {
//         // Add confirmation dialog and API call here
//         if (window.confirm(`Are you sure you want to delete patient record ${id}?`)) {
//             console.log("Delete patient record:", id); // Replace with API call
//             // Refresh rows after delete
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Patient Billing & Records"
//                 subtitle="View detailed billing history including invoices, attending doctors, GST-inclusive amounts, and generated dates."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Analytics" },
//                     { label: "Patient Records" }
//                 ]}
//             />

//             <TableComponent
//                 title="Patient Records"
//                 columns={columns}
//                 rows={rows}
//                 viewPath="/admin/analytics/patient-records/view"
//                 editPath="/admin/analytics/patient-records/edit"
//                 showView={true}
//                 showEdit={true}
//                 showDelete={true}
//                 onCreate={handleCreate}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default PatientRecords;

import React, { useState } from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";

// Define fields for the form modals
const fields = [
    { name: 'invoice', label: 'Invoice #', type: 'text', required: true },
    { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
    { name: 'doctor', label: 'Doctor', type: 'text', required: true },
    { name: 'amount', label: 'Final Amount (Incl. GST)', type: 'text', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
];

// Placeholder API functions - replace with actual API calls
const createPatientRecordAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newRecord = { _id: newId, ...data };
    console.log('Created patient record:', newRecord);
    return newRecord;
};

const updatePatientRecordAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated patient record:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deletePatientRecordAPI = async (id) => {
    // Simulate API call
    console.log('Deleted patient record:', id);
};

function PatientRecords() {
    const [rows, setRows] = useState([
        {
            _id: "1",
            invoice: "INV-001",
            patientName: "Amit Sharma",
            doctor: "Dr. Rakesh",
            amount: "₹2,500",
            date: "2025-02-10",
        },
        {
            _id: "2",
            invoice: "INV-002",
            patientName: "Neha Gupta",
            doctor: "Dr. Priya",
            amount: "₹3,200",
            date: "2025-02-11",
        },
    ]);

    const columns = [
        { field: "invoice", header: "Invoice #" },
        { field: "patientName", header: "Patient Name" },
        { field: "doctor", header: "Doctor" },
        { field: "amount", header: "Final Amount (Incl. GST)" },
        { field: "date", header: "Date" },
    ];

    const handleCreateSubmit = async (data) => {
        const newRecord = await createPatientRecordAPI(data);
        setRows(prev => [...prev, newRecord]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedRecord = await updatePatientRecordAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedRecord : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete patient record ${id}?`)) {
            deletePatientRecordAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Patient Billing & Records"
                subtitle="View detailed billing history including invoices, attending doctors, GST-inclusive amounts, and generated dates."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Analytics" },
                    { label: "Patient Records" }
                ]}
            />

            <TableComponent
                title="Patient Records"
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

export default PatientRecords;