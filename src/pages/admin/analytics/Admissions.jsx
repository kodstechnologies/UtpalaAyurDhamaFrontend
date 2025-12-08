// import React from "react";
// import TableComponent from "../../../components/table/TableComponent";
// import HeadingCard from "../../../components/card/HeadingCard";

// function Admissions_View() {

//     const columns = [
//         { field: "patientId", header: "Patient ID" },
//         { field: "patientName", header: "Patient Name" },
//         { field: "mobile", header: "Mobile No" },
//         { field: "admissionDate", header: "Admission Date" },
//     ];

//     const rows = [
//         {
//             _id: "A001",
//             patientId: "P-1001",
//             patientName: "Amit Kumar",
//             mobile: "9876543210",
//             admissionDate: "2025-02-10",
//         },
//         {
//             _id: "A002",
//             patientId: "P-1002",
//             patientName: "Neha Sharma",
//             mobile: "9123456780",
//             admissionDate: "2025-02-12",
//         },
//         {
//             _id: "A003",
//             patientId: "P-1003",
//             patientName: "Rohan Das",
//             mobile: "9988776655",
//             admissionDate: "2025-02-15",
//         },
//     ];

//     return (
//         <div>
//             <HeadingCard
//                 title="Admissions List"
//                 subtitle="Monitor active and past patient admissions, track essential patient details, and maintain accurate records for smooth hospital operations and reporting."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Analytics" },
//                     { label: "Admission List" }
//                 ]}
//             />

//             <TableComponent
//                 title="Admissions List"
//                 columns={columns}
//                 rows={rows}
//             />
//         </div>
//     );
// }

// export default Admissions_View;


// import React from "react";
// import { useNavigate } from "react-router-dom";
// import TableComponent from "../../../components/table/TableComponent";
// import HeadingCard from "../../../components/card/HeadingCard";

// function Admissions_View() {
//     const navigate = useNavigate();

//     const columns = [
//         { field: "patientId", header: "Patient ID" },
//         { field: "patientName", header: "Patient Name" },
//         { field: "mobile", header: "Mobile No" },
//         { field: "admissionDate", header: "Admission Date" },
//     ];

//     const rows = [
//         {
//             _id: "A001",
//             patientId: "P-1001",
//             patientName: "Amit Kumar",
//             mobile: "9876543210",
//             admissionDate: "2025-02-10",
//         },
//         {
//             _id: "A002",
//             patientId: "P-1002",
//             patientName: "Neha Sharma",
//             mobile: "9123456780",
//             admissionDate: "2025-02-12",
//         },
//         {
//             _id: "A003",
//             patientId: "P-1003",
//             patientName: "Rohan Das",
//             mobile: "9988776655",
//             admissionDate: "2025-02-15",
//         },
//     ];

//     const handleCreate = () => {
//         navigate("/admin/analytics/admissions/create");
//     };

//     const handleDelete = (id) => {
//         // Add confirmation dialog and API call here
//         if (window.confirm(`Are you sure you want to delete admission ${id}?`)) {
//             console.log("Delete admission:", id); // Replace with API call
//             // Refresh rows after delete
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Admissions List"
//                 subtitle="Monitor active and past patient admissions, track essential patient details, and maintain accurate records for smooth hospital operations and reporting."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Analytics" },
//                     { label: "Admission List" }
//                 ]}
//             />

//             <TableComponent
//                 title="Admissions List"
//                 columns={columns}
//                 rows={rows}
//                 viewPath="/admin/analytics/admissions/view"
//                 editPath="/admin/analytics/admissions/edit"
//                 showView={true}
//                 showEdit={true}
//                 showDelete={true}
//                 onCreate={handleCreate}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Admissions_View;

import React, { useState } from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";

// Define fields for the form modals
const fields = [
    { name: 'patientId', label: 'Patient ID', type: 'text', required: true },
    { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
    { name: 'mobile', label: 'Mobile No', type: 'tel', required: true },
    { name: 'admissionDate', label: 'Admission Date', type: 'date', required: true },
];

// Placeholder API functions - replace with actual API calls
const createAdmissionAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newAdmission = { _id: newId, ...data };
    console.log('Created admission:', newAdmission);
    return newAdmission;
};

const updateAdmissionAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated admission:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deleteAdmissionAPI = async (id) => {
    // Simulate API call
    console.log('Deleted admission:', id);
};

function Admissions_View() {
    const [rows, setRows] = useState([
        {
            _id: "A001",
            patientId: "P-1001",
            patientName: "Amit Kumar",
            mobile: "9876543210",
            admissionDate: "2025-02-10",
        },
        {
            _id: "A002",
            patientId: "P-1002",
            patientName: "Neha Sharma",
            mobile: "9123456780",
            admissionDate: "2025-02-12",
        },
        {
            _id: "A003",
            patientId: "P-1003",
            patientName: "Rohan Das",
            mobile: "9988776655",
            admissionDate: "2025-02-15",
        },
    ]);

    const columns = [
        { field: "patientId", header: "Patient ID" },
        { field: "patientName", header: "Patient Name" },
        { field: "mobile", header: "Mobile No" },
        { field: "admissionDate", header: "Admission Date" },
    ];

    const handleCreateSubmit = async (data) => {
        const newAdmission = await createAdmissionAPI(data);
        setRows(prev => [...prev, newAdmission]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedAdmission = await updateAdmissionAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedAdmission : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete admission ${id}?`)) {
            deleteAdmissionAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Admissions List"
                subtitle="Monitor active and past patient admissions, track essential patient details, and maintain accurate records for smooth hospital operations and reporting."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Analytics" },
                    { label: "Admission List" }
                ]}
            />

            <TableComponent
                title="Admissions List"
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

export default Admissions_View;