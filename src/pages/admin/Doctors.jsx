// import React, { useState } from "react";
// import TableComponent from "../../components/table/TableComponent";
// import HeadingCard from "../../components/card/HeadingCard";

// // Define fields for the form modals
// // const fields = [
// //     { name: 'name', label: 'Name', type: 'text', required: true },
// //     { name: 'department', label: 'Department', type: 'text', required: true },
// //     { name: 'designation', label: 'Designation', type: 'text', required: true },
// //     { name: 'mobile', label: 'Mobile', type: 'tel', required: true },
// //     { name: 'email', label: 'Email', type: 'email', required: true },
// // ];

// const fields = [
//     { name: 'firstName', label: 'First Name', type: 'text', required: true },
//     { name: 'lastName', label: 'Last Name', type: 'text', required: true },
//     { name: 'email', label: 'Email', type: 'email', required: true },
//     { name: 'phone', label: 'Phone', type: 'tel', required: true },

//     {
//         name: 'gender',
//         label: 'Gender',
//         type: 'select',
//         required: true,
//         options: ['Male', 'Female', 'Other']
//     },

//     { name: 'dob', label: 'Date of Birth', type: 'date', required: false },

//     { name: 'specialization', label: 'Specialization', type: 'text', required: true },

//     { name: 'licenseNumber', label: 'License Number', type: 'text', required: true },

//     {
//         name: 'department',
//         label: 'Department',
//         type: 'select',
//         required: false,
//         options: ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics']
//     },

//     { name: 'joiningDate', label: 'Joining Date', type: 'date', required: false },
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
//             status: "Active",        // ⭐ NEW
//         },
//         {
//             _id: "2",
//             name: "Neha Gupta",
//             department: "Gynecology",
//             designation: "Gynecologist",
//             mobile: "+91 8765432109",
//             email: "neha.gupta@email.com",
//             status: "Inactive",      // ⭐ NEW
//         },
//     ]);


//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "department", header: "Department" },
//         { field: "designation", header: "Designation" },
//         { field: "mobile", header: "Mobile" },
//         { field: "email", header: "Email" },
//         { field: "status", header: "Status" }
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
//                 showView={true} // Opens modal with ViewCard
//                 // viewPath removed - modal handles view
//                 showEdit={true}
//                 showDelete={true}
//                 onDelete={handleDelete}
//                 showStatusBadge={true}
//                 statusField="status"
//             />
//         </div>
//     );
// }

// export default Doctors;

import React, { useState, useCallback } from "react";
import TableComponent from "../../components/table/TableComponent";
import HeadingCard from "../../components/card/HeadingCard";
import { toast } from "react-toastify"; // Assuming you have react-toastify for notifications; install if needed

// Enhanced fields for doctor form modals with better validation hints and status
const fields = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Enter first name' },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter last name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'example@hospital.com' },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+91 9876543210' },
    {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' }
        ]
    },
    {
        name: 'dob',
        label: 'Date of Birth',
        type: 'date',
        required: false,
        max: new Date().toISOString().split('T')[0] // Prevent future dates
    },
    { name: 'specialization', label: 'Specialization', type: 'text', required: true, placeholder: 'e.g., Cardiology' },
    { name: 'licenseNumber', label: 'License Number', type: 'text', required: true, placeholder: 'Enter license number' },
    {
        name: 'department',
        label: 'Department',
        type: 'select',
        required: true, // Made required for better data integrity
        options: [
            { value: 'Cardiology', label: 'Cardiology' },
            { value: 'Neurology', label: 'Neurology' },
            { value: 'Orthopedics', label: 'Orthopedics' },
            { value: 'General Medicine', label: 'General Medicine' },
            { value: 'Pediatrics', label: 'Pediatrics' },
            { value: 'Gynecology', label: 'Gynecology' } // Added to match sample data
        ]
    },
    {
        name: 'joiningDate',
        label: 'Joining Date',
        type: 'date',
        required: true, // Made required
        min: "2020-01-01" // Reasonable min date
    },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' }
        ]
    }
];

// Enhanced API functions with error handling and loading simulation
const createDoctorAPI = async (data) => {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newId = Date.now().toString();
        const newDoctor = { _id: newId, ...data, name: `${data.firstName} ${data.lastName}` }; // Compute full name
        console.log('Created doctor:', newDoctor);
        return { success: true, data: newDoctor };
    } catch (error) {
        throw new Error('Failed to create doctor');
    }
};

const updateDoctorAPI = async (data, id) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const updatedDoctor = { _id: id, ...data, name: `${data.firstName} ${data.lastName}` };
        console.log('Updated doctor:', updatedDoctor);
        return { success: true, data: updatedDoctor };
    } catch (error) {
        throw new Error('Failed to update doctor');
    }
};

const deleteDoctorAPI = async (id) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Deleted doctor:', id);
        return { success: true };
    } catch (error) {
        throw new Error('Failed to delete doctor');
    }
};

function Doctors() {
    const [rows, setRows] = useState([
        {
            _id: "10",
            firstName: "Amit",
            lastName: "Sharma",
            name: "Amit Sharma", // Computed for table display
            department: "Gynecology",
            specialization: "Gynecology",
            phone: "+91 9876543210",
            email: "amit.sharma@email.com",
            status: "Active",
            gender: "Male",
            dob: "1985-05-15",
            licenseNumber: "LIC123456",
            joiningDate: "2023-01-10"
        },
        {
            _id: "2",
            firstName: "Neha",
            lastName: "Gupta",
            name: "Neha Gupta",
            department: "Gynecology",
            specialization: "Obstetrics",
            phone: "+91 8765432109",
            email: "neha.gupta@email.com",
            status: "Inactive",
            gender: "Female",
            dob: "1990-08-22",
            licenseNumber: "LIC789012",
            joiningDate: "2022-06-05"
        }
    ]);
    const [loading, setLoading] = useState(false);

    const columns = [
        { field: "name", header: "Name", sortable: true }, // Added sortable hint (assume TableComponent supports)
        { field: "department", header: "Department", sortable: true },
        { field: "specialization", header: "Specialization", sortable: true }, // Added for better info
        { field: "phone", header: "Phone" },
        { field: "email", header: "Email" },
        { field: "status", header: "Status", badge: true } // Hint for badge styling
    ];

    const handleCreateSubmit = useCallback(async (data) => {
        setLoading(true);
        try {
            const result = await createDoctorAPI(data);
            if (result.success) {
                setRows(prev => [...prev, result.data]);
                toast.success('Doctor created successfully!');
            }
        } catch (error) {
            toast.error(error.message || 'Creation failed');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleEditSubmit = useCallback(async (data, row) => {
        setLoading(true);
        try {
            const result = await updateDoctorAPI(data, row._id);
            if (result.success) {
                setRows(prev => prev.map(r => r._id === row._id ? result.data : r));
                toast.success('Doctor updated successfully!');
            }
        } catch (error) {
            toast.error(error.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDelete = useCallback(async (id) => {
        if (window.confirm(`Are you sure you want to delete this doctor? This action cannot be undone.`)) {
            setLoading(true);
            try {
                const result = await deleteDoctorAPI(id);
                if (result.success) {
                    setRows(prev => prev.filter(r => r._id !== id));
                    toast.success('Doctor deleted successfully!');
                }
            } catch (error) {
                toast.error(error.message || 'Deletion failed');
            } finally {
                setLoading(false);
            }
        }
    }, []);

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen"> {/* Added basic Tailwind for better spacing/layout; customize as needed */}
            <HeadingCard
                title="Doctors Management"
                subtitle="View, add, edit, and manage doctor profiles efficiently."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Doctors" }
                ]}
                actions={[
                    { label: "Export to CSV", onClick: () => console.log('Export triggered') }, // Suggested action for better UX
                    { label: "Import Doctors", onClick: () => console.log('Import triggered') }
                ]}
            />

            <div className="bg-white rounded-lg shadow-md overflow-hidden"> {/* Card-like wrapper for table */}
                <TableComponent
                    title="Doctors Directory"
                    subtitle="All registered doctors with key details."
                    columns={columns}
                    rows={rows}
                    formFields={fields}
                    onCreateSubmit={handleCreateSubmit}
                    onEditSubmit={handleEditSubmit}
                    showView={true}
                    showEdit={true}
                    showDelete={true}
                    onDelete={handleDelete}
                    showStatusBadge={true}
                    statusField="status"
                    loading={loading} // Pass loading state for spinners
                    searchable={true} // Assume TableComponent supports search
                    paginated={true} // Assume supports pagination
                    // Additional props for better design
                    emptyState={{
                        title: "No Doctors Found",
                        message: "Get started by adding your first doctor.",
                        action: "Add Doctor" // Triggers create modal
                    }}
                />
            </div>
        </div>
    );
}

export default Doctors;