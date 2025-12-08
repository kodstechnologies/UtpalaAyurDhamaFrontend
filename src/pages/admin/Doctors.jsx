// // // src/pages/Doctors.jsx
// // import React from "react";
// // import TableComponent from "../../components/table/TableComponent";
// // import Breadcrumb from "../../components/breadcrumb/Breadcrumb";

// // function Doctors() {
// //     const columns = [
// //         { field: "name", header: "Name" },
// //         { field: "department", header: "Department" },
// //         { field: "designation", header: "Designation" },
// //         { field: "mobile", header: "Mobile" },
// //         { field: "email", header: "Email" },
// //     ];


// //     const rows = [
// //         {
// //             _id: "10",
// //             name: "Amit Sharma",
// //             department: "Gynecology",
// //             designation: "Senior Consultant",
// //             mobile: "+91 9876543210",
// //             email: "amit.sharma@email.com",
// //         },
// //         {
// //             _id: "2",
// //             name: "Neha Gupta",
// //             department: "Gynecology",
// //             designation: "Gynecologist",
// //             mobile: "+91 8765432109",
// //             email: "neha.gupta@email.com",
// //         },
// //     ];

// //     return (
// //         <div>
// //             <Breadcrumb
// //                 items={[
// //                     { label: "Admin", url: "/admin/dashboard" },
// //                     {
// //                         label: "View Doctor"
// //                     }
// //                 ]}
// //             />
// //             <TableComponent columns={columns} rows={rows} />
// //         </div>
// //     );
// // }

// // export default Doctors;


// // src/pages/Doctors.jsx


// // import React from "react";
// // import TableComponent from "../../components/table/TableComponent";
// // import HeadingCard from "../../components/card/HeadingCard";

// // function Doctors() {
// //     const columns = [
// //         { field: "name", header: "Name" },
// //         { field: "department", header: "Department" },
// //         { field: "designation", header: "Designation" },
// //         { field: "mobile", header: "Mobile" },
// //         { field: "email", header: "Email" },
// //     ];

// //     const rows = [
// //         {
// //             _id: "10",
// //             name: "Amit Sharma",
// //             department: "Gynecology",
// //             designation: "Senior Consultant",
// //             mobile: "+91 9876543210",
// //             email: "amit.sharma@email.com",
// //         },
// //         {
// //             _id: "2",
// //             name: "Neha Gupta",
// //             department: "Gynecology",
// //             designation: "Gynecologist",
// //             mobile: "+91 8765432109",
// //             email: "neha.gupta@email.com",
// //         },
// //     ];

// //     return (
// //         <div>
// //             <HeadingCard
// //                 title="Doctors"
// //                 subtitle="View and manage all registered doctors in the system."
// //                 breadcrumbItems={[
// //                     { label: "Admin", url: "/admin/dashboard" },
// //                     { label: "Doctors" }
// //                 ]}
// //             />

// //             <TableComponent columns={columns} rows={rows} />
// //         </div>
// //     );
// // }

// // export default Doctors;



// // import React from "react";
// // import { useNavigate } from "react-router-dom";
// // import TableComponent from "../../components/table/TableComponent";
// // import HeadingCard from "../../components/card/HeadingCard";

// // function Doctors() {
// //     const navigate = useNavigate();

// //     const columns = [
// //         { field: "name", header: "Name" },
// //         { field: "department", header: "Department" },
// //         { field: "designation", header: "Designation" },
// //         { field: "mobile", header: "Mobile" },
// //         { field: "email", header: "Email" },
// //     ];

// //     const rows = [
// //         {
// //             _id: "10",
// //             name: "Amit Sharma",
// //             department: "Gynecology",
// //             designation: "Senior Consultant",
// //             mobile: "+91 9876543210",
// //             email: "amit.sharma@email.com",
// //         },
// //         {
// //             _id: "2",
// //             name: "Neha Gupta",
// //             department: "Gynecology",
// //             designation: "Gynecologist",
// //             mobile: "+91 8765432109",
// //             email: "neha.gupta@email.com",
// //         },
// //     ];

// //     const handleCreate = () => {
// //         navigate("/admin/doctors/create");
// //     };

// //     const handleDelete = (id) => {
// //         // Add confirmation dialog and API call here
// //         if (window.confirm(`Are you sure you want to delete doctor ${id}?`)) {
// //             console.log("Delete doctor:", id); // Replace with API call
// //             // Refresh rows after delete
// //         }
// //     };

// //     return (
// //         <div>
// //             <HeadingCard
// //                 title="Doctors"
// //                 subtitle="View and manage all registered doctors in the system."
// //                 breadcrumbItems={[
// //                     { label: "Admin", url: "/admin/dashboard" },
// //                     { label: "Doctors" }
// //                 ]}
// //             />

// //             <TableComponent
// //                 columns={columns}
// //                 rows={rows}
// //                 viewPath="/admin/doctors/view"
// //                 editPath="/admin/doctors/edit"
// //                 showView={true}
// //                 showEdit={true}
// //                 showDelete={true}
// //                 onCreate={handleCreate}
// //                 onDelete={handleDelete}
// //             />
// //         </div>
// //     );
// // }

// // export default Doctors;

// // import React from "react";
// // import { useNavigate } from "react-router-dom";
// // import TableComponent from "../../components/table/TableComponent";
// // import HeadingCard from "../../components/card/HeadingCard";

// // function AdmitPatient() {
// //     const navigate = useNavigate();

// //     const columns = [
// //         { field: "patientName", header: "Patient Name" },
// //         { field: "age", header: "Age" },
// //         { field: "condition", header: "Condition" },
// //         { field: "admissionDate", header: "Admission Date" },
// //         { field: "roomNo", header: "Room No." },
// //         { field: "status", header: "Status" },
// //     ];

// //     const rows = [
// //         {
// //             _id: "1",
// //             patientName: "Amit Sharma",
// //             age: 34,
// //             condition: "Fever & Weakness",
// //             admissionDate: "2025-01-10",
// //             roomNo: "101",
// //             status: "Admitted",
// //         },
// //         {
// //             _id: "2",
// //             patientName: "Neha Gupta",
// //             age: 28,
// //             condition: "Body Pain",
// //             admissionDate: "2025-01-12",
// //             roomNo: "202",
// //             status: "Under Treatment",
// //         },
// //     ];

// //     const handleAdmitPatient = () => {
// //         navigate("/admin/admit-patient/create");
// //     };

// //     const handleDelete = (id) => {
// //         // Add confirmation dialog and API call here
// //         if (window.confirm(`Are you sure you want to discharge patient ${id}?`)) {
// //             console.log("Discharge patient:", id); // Replace with API call
// //             // Refresh rows after discharge
// //         }
// //     };

// //     return (
// //         <div>
// //             <HeadingCard
// //                 title="Admit Patient"
// //                 subtitle="View and manage patient admissions in the system."
// //                 breadcrumbItems={[
// //                     { label: "Admin", url: "/admin/dashboard" },
// //                     { label: "Admit Patient" }
// //                 ]}
// //             />

// //             <TableComponent
// //                 title="Admitted Patients List"
// //                 columns={columns}
// //                 rows={rows}
// //                 viewPath="/admin/admit-patient/view"
// //                 editPath="/admin/admit-patient/edit"
// //                 showView={true}
// //                 showEdit={true}
// //                 showDelete={true}
// //                 onCreate={handleAdmitPatient}
// //                 onDelete={handleDelete}
// //             />
// //         </div>
// //     );
// // }

// // export default AdmitPatient;


// // import React from "react";
// // import { useNavigate } from "react-router-dom";
// // import TableComponent from "../../components/table/TableComponent";
// // import HeadingCard from "../../components/card/HeadingCard";

// // function AdmitPatient() {
// //     const navigate = useNavigate();

// //     const columns = [
// //         { field: "patientName", header: "Patient Name" },
// //         { field: "age", header: "Age" },
// //         { field: "condition", header: "Condition" },
// //         { field: "admissionDate", header: "Admission Date" },
// //         { field: "roomNo", header: "Room No." },
// //         { field: "status", header: "Status" },
// //     ];

// //     const rows = [
// //         {
// //             _id: "1",
// //             patientName: "Amit Sharma",
// //             age: 34,
// //             condition: "Fever & Weakness",
// //             admissionDate: "2025-01-10",
// //             roomNo: "101",
// //             status: "Admitted",
// //         },
// //         {
// //             _id: "2",
// //             patientName: "Neha Gupta",
// //             age: 28,
// //             condition: "Body Pain",
// //             admissionDate: "2025-01-12",
// //             roomNo: "202",
// //             status: "Under Treatment",
// //         },
// //     ];

// //     const handleAdmitPatient = () => {
// //         navigate("/admin/admit-patient/create");
// //     };

// //     const handleDelete = (id) => {
// //         // Add confirmation dialog and API call here
// //         if (window.confirm(`Are you sure you want to discharge patient ${id}?`)) {
// //             console.log("Discharge patient:", id); // Replace with API call
// //             // Refresh rows after discharge
// //         }
// //     };

// //     return (
// //         <div>
// //             <HeadingCard
// //                 title="Admit Patient"
// //                 subtitle="View and manage patient admissions in the system."
// //                 breadcrumbItems={[
// //                     { label: "Admin", url: "/admin/dashboard" },
// //                     { label: "Admit Patient" }
// //                 ]}
// //             />

// //             <TableComponent
// //                 title="Admitted Patients List"
// //                 columns={columns}
// //                 rows={rows}
// //                 viewPath="/admin/admit-patient/view"
// //                 editPath="/admin/admit-patient/edit"
// //                 showView={true}
// //                 showEdit={true}
// //                 showDelete={true}
// //                 onCreate={handleAdmitPatient}
// //                 onDelete={handleDelete}
// //             />
// //         </div>
// //     );
// // }

// // export default AdmitPatient;

// import React, { useState } from "react";
// import TableComponent from "../../components/table/TableComponent";
// import HeadingCard from "../../components/card/HeadingCard";
// import CreateEditCard from "../../components/card/CreateEditCard"; // Import if needed, but since TableComponent handles it internally

// // Define fields for the form modals (same as columns but with types and options)
// const fields = [
//     { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
//     { name: 'age', label: 'Age', type: 'number', required: true },
//     { name: 'condition', label: 'Condition', type: 'text', required: true },
//     { name: 'admissionDate', label: 'Admission Date', type: 'date', required: true },
//     { name: 'roomNo', label: 'Room No.', type: 'text', required: true },
//     {
//         name: 'status',
//         label: 'Status',
//         type: 'select',
//         required: true,
//         options: [
//             { value: 'Admitted', label: 'Admitted' },
//             { value: 'Under Treatment', label: 'Under Treatment' },
//             { value: 'Discharged', label: 'Discharged' },
//         ],
//     },
// ];

// // Placeholder API functions - replace with actual API calls
// const createPatientAPI = async (data) => {
//     // Simulate API call
//     const newId = Date.now().toString();
//     const newPatient = { _id: newId, ...data };
//     console.log('Created patient:', newPatient);
//     return newPatient;
// };

// const updatePatientAPI = async (data, id) => {
//     // Simulate API call
//     console.log('Updated patient:', { _id: id, ...data });
//     return { _id: id, ...data };
// };

// const deletePatientAPI = async (id) => {
//     // Simulate API call
//     console.log('Deleted patient:', id);
// };

// function AdmitPatient() {
//     const [rows, setRows] = useState([
//         {
//             _id: "1",
//             patientName: "Amit Sharma",
//             age: 34,
//             condition: "Fever & Weakness",
//             admissionDate: "2025-01-10",
//             roomNo: "101",
//             status: "Admitted",
//         },
//         {
//             _id: "2",
//             patientName: "Neha Gupta",
//             age: 28,
//             condition: "Body Pain",
//             admissionDate: "2025-01-12",
//             roomNo: "202",
//             status: "Under Treatment",
//         },
//     ]);

//     const columns = [
//         { field: "patientName", header: "Patient Name" },
//         { field: "age", header: "Age" },
//         { field: "condition", header: "Condition" },
//         { field: "admissionDate", header: "Admission Date" },
//         { field: "roomNo", header: "Room No." },
//         { field: "status", header: "Status" },
//     ];

//     const handleCreateSubmit = async (data) => {
//         const newPatient = await createPatientAPI(data);
//         setRows(prev => [...prev, newPatient]);
//     };

//     const handleEditSubmit = async (data, row) => {
//         const updatedPatient = await updatePatientAPI(data, row._id);
//         setRows(prev => prev.map(r => r._id === row._id ? updatedPatient : r));
//     };

//     const handleDelete = (id) => {
//         if (window.confirm(`Are you sure you want to discharge patient ${id}?`)) {
//             deletePatientAPI(id);
//             setRows(prev => prev.filter(r => r._id !== id));
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Admit Patient"
//                 subtitle="View and manage patient admissions in the system."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Admit Patient" }
//                 ]}
//             />

//             <TableComponent
//                 title="Admitted Patients List"
//                 columns={columns}
//                 rows={rows}
//                 // For modals: pass formFields and submit handlers
//                 formFields={fields}
//                 onCreateSubmit={handleCreateSubmit}
//                 onEditSubmit={handleEditSubmit}
//                 // Keep view as navigation
//                 showView={true}
//                 viewPath="/admin/admit-patient/view"
//                 showEdit={true}
//                 showDelete={true}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default AdmitPatient;

// import React, { useState } from "react";
// import TableComponent from "../../components/table/TableComponent";
// import HeadingCard from "../../components/card/HeadingCard";

// // Define fields for the form modals
// const fields = [
//     { name: 'name', label: 'Name', type: 'text', required: true },
//     { name: 'department', label: 'Department', type: 'text', required: true },
//     { name: 'designation', label: 'Designation', type: 'text', required: true },
//     { name: 'mobile', label: 'Mobile', type: 'tel', required: true },
//     { name: 'email', label: 'Email', type: 'email', required: true },
// ];

// // Placeholder API functions - replace with actual API calls
// const createDoctorAPI = async (data) => {
//     // Simulate API call
//     const newId = Date.now().toString();
//     const newDoctor = { _id: newId, ...data };
//     console.log('Created doctor:', newDoctor);
//     return newDoctor;
// };

// const updateDoctorAPI = async (data, id) => {
//     // Simulate API call
//     console.log('Updated doctor:', { _id: id, ...data });
//     return { _id: id, ...data };
// };

// const deleteDoctorAPI = async (id) => {
//     // Simulate API call
//     console.log('Deleted doctor:', id);
// };

// function Doctors() {
//     const [rows, setRows] = useState([
//         {
//             _id: "10",
//             name: "Amit Sharma",
//             department: "Gynecology",
//             designation: "Senior Consultant",
//             mobile: "+91 9876543210",
//             email: "amit.sharma@email.com",
//         },
//         {
//             _id: "2",
//             name: "Neha Gupta",
//             department: "Gynecology",
//             designation: "Gynecologist",
//             mobile: "+91 8765432109",
//             email: "neha.gupta@email.com",
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
//         const newDoctor = await createDoctorAPI(data);
//         setRows(prev => [...prev, newDoctor]);
//     };

//     const handleEditSubmit = async (data, row) => {
//         const updatedDoctor = await updateDoctorAPI(data, row._id);
//         setRows(prev => prev.map(r => r._id === row._id ? updatedDoctor : r));
//     };

//     const handleDelete = (id) => {
//         if (window.confirm(`Are you sure you want to delete doctor ${id}?`)) {
//             deleteDoctorAPI(id);
//             setRows(prev => prev.filter(r => r._id !== id));
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Doctors"
//                 subtitle="View and manage doctors in the system."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Doctors" }
//                 ]}
//             />

//             <TableComponent
//                 title="Doctors List"
//                 columns={columns}
//                 rows={rows}
//                 // For modals: pass formFields and submit handlers
//                 formFields={fields}
//                 onCreateSubmit={handleCreateSubmit}
//                 onEditSubmit={handleEditSubmit}
//                 // Keep view as navigation
//                 showView={true}
//                 viewPath="/admin/doctors/view"
//                 showEdit={true}
//                 showDelete={true}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Doctors;

import React, { useState } from "react";
import TableComponent from "../../components/table/TableComponent";
import HeadingCard from "../../components/card/HeadingCard";

// Define fields for the form modals
const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'department', label: 'Department', type: 'text', required: true },
    { name: 'designation', label: 'Designation', type: 'text', required: true },
    { name: 'mobile', label: 'Mobile', type: 'tel', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
];

// Placeholder API functions - replace with actual API calls
const createDoctorAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newDoctor = { _id: newId, ...data };
    console.log('Created doctor:', newDoctor);
    return newDoctor;
};

const updateDoctorAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated doctor:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deleteDoctorAPI = async (id) => {
    // Simulate API call
    console.log('Deleted doctor:', id);
};

function Doctors() {
    const [rows, setRows] = useState([
        {
            _id: "10",
            name: "Amit Sharma",
            department: "Gynecology",
            designation: "Senior Consultant",
            mobile: "+91 9876543210",
            email: "amit.sharma@email.com",
        },
        {
            _id: "2",
            name: "Neha Gupta",
            department: "Gynecology",
            designation: "Gynecologist",
            mobile: "+91 8765432109",
            email: "neha.gupta@email.com",
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
        const newDoctor = await createDoctorAPI(data);
        setRows(prev => [...prev, newDoctor]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedDoctor = await updateDoctorAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedDoctor : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete doctor ${id}?`)) {
            deleteDoctorAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Doctors"
                subtitle="View and manage doctors in the system."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Doctors" }
                ]}
            />

            <TableComponent
                title="Doctors List"
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

export default Doctors;