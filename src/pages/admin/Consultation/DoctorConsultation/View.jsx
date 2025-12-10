// import React, { useState } from 'react';
// import HeadingCard from '../../../../components/card/HeadingCard';
// import TableComponent from '../../../../components/table/TableComponent';

// // Define fields for the form modals
// const fields = [
//     { name: 'doctor', label: 'Doctor', type: 'text', required: true },
//     { name: 'fee', label: 'Consultation Fee', type: 'number', required: true },
//     { name: 'currency', label: 'Currency', type: 'text', required: true },
//     {
//         name: 'status',
//         label: 'Status',
//         type: 'select',
//         required: true,
//         options: [
//             { value: 'Active', label: 'Active' },
//             { value: 'Inactive', label: 'Inactive' },
//         ],
//     },
//     { name: 'updated', label: 'Updated', type: 'date', required: false },
// ];

// // Placeholder API functions - replace with actual API calls
// const createConsultationFeeAPI = async (data) => {
//     // Simulate API call
//     const newId = Date.now().toString();
//     const newFee = { _id: newId, ...data, updated: new Date().toISOString().split('T')[0] };
//     console.log('Created consultation fee:', newFee);
//     return newFee;
// };

// const updateConsultationFeeAPI = async (data, id) => {
//     // Simulate API call
//     console.log('Updated consultation fee:', { _id: id, ...data });
//     return { _id: id, ...data, updated: new Date().toISOString().split('T')[0] };
// };

// const deleteConsultationFeeAPI = async (id) => {
//     // Simulate API call
//     console.log('Deleted consultation fee:', id);
// };

// function Consultation_View() {
//     const [rows, setRows] = useState([
//         {
//             _id: "1",
//             doctor: "Dr. Amit Sharma",
//             fee: 500,
//             currency: "INR",
//             status: "Active",
//             updated: "2025-01-12",
//         },
//         {
//             _id: "2",
//             doctor: "Dr. Neha Gupta",
//             fee: 700,
//             currency: "INR",
//             status: "Inactive",
//             updated: "2025-01-10",
//         },
//     ]);

//     const columns = [
//         { field: "doctor", header: "Doctor" },
//         { field: "fee", header: "Consultation Fee" },
//         { field: "currency", header: "Currency" },
//         { field: "status", header: "Status" },
//         { field: "updated", header: "Updated" },
//     ];

//     const handleCreateSubmit = async (data) => {
//         const newFee = await createConsultationFeeAPI(data);
//         setRows(prev => [...prev, newFee]);
//     };

//     const handleEditSubmit = async (data, row) => {
//         const updatedFee = await updateConsultationFeeAPI(data, row._id);
//         setRows(prev => prev.map(r => r._id === row._id ? updatedFee : r));
//     };

//     const handleDelete = (id) => {
//         if (window.confirm(`Are you sure you want to delete consultation fee ${id}?`)) {
//             deleteConsultationFeeAPI(id);
//             setRows(prev => prev.filter(r => r._id !== id));
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

// export default Consultation_View;

import React, { useState, useMemo } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import HeadingCard from '../../../../components/card/HeadingCard';
import TableComponent from '../../../../components/table/TableComponent';
import DashboardCard from '../../../../components/card/DashboardCard'; // Your animated card

// Form fields
const fields = [
    { name: 'doctor', label: 'Doctor Name', type: 'text', required: true },
    { name: 'fee', label: 'Consultation Fee', type: 'number', required: true },
    { name: 'currency', label: 'Currency', type: 'text', required: true, placeholder: 'e.g. INR' },
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
    { name: 'updated', label: 'Last Updated', type: 'date', required: false },
];

// Mock APIs
const createConsultationFeeAPI = async (data) => {
    const newId = Date.now().toString();
    const newFee = {
        _id: newId,
        ...data,
        updated: new Date().toISOString().split('T')[0]
    };
    console.log('Created:', newFee);
    return newFee;
};

const updateConsultationFeeAPI = async (data, id) => {
    console.log('Updated:', { _id: id, ...data });
    return { _id: id, ...data, updated: new Date().toISOString().split('T')[0] };
};

const deleteConsultationFeeAPI = async (id) => {
    console.log('Deleted:', id);
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
        {
            _id: "3",
            doctor: "Dr. Rajesh Kumar",
            fee: 1599,
            currency: "INR",
            status: "Active",
            updated: "2025-01-11",
        },
    ]);

    const columns = [
        { field: "doctor", header: "Doctor" },
        { field: "fee", header: "Consultation Fee" },
        { field: "currency", header: "Currency" },
        { field: "status", header: "Status" },     // Auto shows beautiful badge!
        { field: "updated", header: "Last Updated" },
    ];

    // Live Stats
    const stats = useMemo(() => {
        const active = rows.filter(r => r.status === "Active").length;
        const inactive = rows.filter(r => r.status === "Inactive").length;
        const highest = rows.reduce((max, r) =>
            r.status === "Active" && r.fee > max ? r.fee : max, 0
        );

        return { active, inactive, highest };
    }, [rows]);

    const handleCreateSubmit = async (data) => {
        const newFee = await createConsultationFeeAPI(data);
        setRows(prev => [...prev, newFee]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedFee = await updateConsultationFeeAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedFee : r));
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this consultation fee?")) {
            deleteConsultationFeeAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <Box>
            {/* Page Header */}
            <HeadingCard
                title="Consultation Fee Management"
                subtitle="Manage consultation fees, status, and currency for different doctors."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Consultation Fees" }
                ]}
            />

            {/* Stats Cards */}
          <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={3}
    my={4}
    justifyContent="flex-start"
    sx={{
        flexWrap: { xs: "wrap", sm: "nowrap" }, // ⬅️ wrap only on mobile
    }}
>
    <DashboardCard
        title="Active Fees"
        count={stats.active}
        icon={CheckCircleIcon}
    />

    <DashboardCard
        title="Inactive Fees"
        count={stats.inactive}
        icon={CancelIcon}
    />

    <DashboardCard
        title="Highest Rate"
        count={stats.highest}
        icon={CurrencyRupeeIcon}
        overrideContent={
            <Box sx={{ mt: 1 }}>
                <Typography variant="h4" fontWeight="bold" color="var(--color-text-dark)">
                    ₹{stats.highest.toLocaleString("en-IN")}
                </Typography>
            </Box>
        }
    />
</Stack>


            {/* Table */}
            <TableComponent
                title="Consultation Fee List"
                columns={columns}
                rows={rows}
                formFields={fields}
                onCreateSubmit={handleCreateSubmit}
                onEditSubmit={handleEditSubmit}
                showView={true}
                showEdit={true}
                showDelete={true}
                onDelete={handleDelete}
            // Status badge appears automatically because column field is "status"
            />
        </Box>
    );
}

export default Consultation_View;