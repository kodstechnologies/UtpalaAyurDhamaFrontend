// import React, { useState } from "react";
// import HeadingCard from "../../../../components/card/HeadingCard";
// import TableComponent from "../../../../components/table/TableComponent";

// // Define fields for the form modals
// const fields = [
//     { name: 'doctor', label: 'Doctor', type: 'text', required: true },
//     {
//         name: 'availability',
//         label: 'Availability',
//         type: 'select',
//         required: true,
//         options: [
//             { value: 'Available', label: 'Available' },
//             { value: 'Not Available', label: 'Not Available' },
//         ],
//     },
//     { name: 'time', label: 'Time', type: 'text', required: true },
//     { name: 'date', label: 'Date', type: 'date', required: true },
// ];

// // Placeholder API functions - replace with actual API calls
// const createSlotAPI = async (data) => {
//     // Simulate API call
//     const newId = Date.now().toString();
//     const newSlot = { _id: newId, ...data };
//     console.log('Created slot:', newSlot);
//     return newSlot;
// };

// const updateSlotAPI = async (data, id) => {
//     // Simulate API call
//     console.log('Updated slot:', { _id: id, ...data });
//     return { _id: id, ...data };
// };

// const deleteSlotAPI = async (id) => {
//     // Simulate API call
//     console.log('Deleted slot:', id);
// };

// function Slot_View() {
//     const [rows, setRows] = useState([
//         {
//             _id: "1",
//             doctor: "Dr. Amit Sharma",
//             availability: "Available",
//             time: "10:00 AM - 1:00 PM",
//             date: "2025-01-05",
//         },
//         {
//             _id: "2",
//             doctor: "Dr. Neha Gupta",
//             availability: "Not Available",
//             time: "-",
//             date: "2025-01-06",
//         },
//     ]);

//     const columns = [
//         { field: "doctor", header: "Doctor" },
//         { field: "availability", header: "Availability" },
//         { field: "time", header: "Time" },
//         { field: "date", header: "Date" },
//     ];

//     const handleCreateSubmit = async (data) => {
//         const newSlot = await createSlotAPI(data);
//         setRows(prev => [...prev, newSlot]);
//     };

//     const handleEditSubmit = async (data, row) => {
//         const updatedSlot = await updateSlotAPI(data, row._id);
//         setRows(prev => prev.map(r => r._id === row._id ? updatedSlot : r));
//     };

//     const handleDelete = (id) => {
//         if (window.confirm(`Are you sure you want to delete slot ${id}?`)) {
//             deleteSlotAPI(id);
//             setRows(prev => prev.filter(r => r._id !== id));
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Doctor Slot Availability"
//                 subtitle="View and manage the availability and time slots of doctors in the hospital."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Slot Management" }
//                 ]}
//             />

//             <TableComponent
//                 title="Doctor Slot Availability"
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

// export default Slot_View;

import React, { useState, useMemo } from "react";
import { Stack, Box } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

import HeadingCard from "../../../../components/card/HeadingCard";
import TableComponent from "../../../../components/table/TableComponent";
import DashboardCard from "../../../../components/card/DashboardCard"; // Your animated card

// Form fields for Create/Edit modal
const fields = [
    { name: 'doctor', label: 'Doctor Name', type: 'text', required: true },
    {
        name: 'availability',
        label: 'Availability',
        type: 'select',
        required: true,
        options: [
            { value: 'Available', label: 'Available' },
            { value: 'Not Available', label: 'Not Available' },
        ],
    },
    { name: 'time', label: 'Time Slot', type: 'text', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
];

// Mock API functions
const createSlotAPI = async (data) => {
    const newId = Date.now().toString();
    const newSlot = { _id: newId, ...data };
    console.log('Created slot:', newSlot);
    return newSlot;
};

const updateSlotAPI = async (data, id) => {
    console.log('Updated slot:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deleteSlotAPI = async (id) => {
    console.log('Deleted slot:', id);
};

function Slot_View() {
    const [rows, setRows] = useState([
        {
            _id: "1",
            doctor: "Dr. Amit Sharma",
            availability: "Available",
            time: "10:00 AM - 1:00 PM",
            date: "2025-01-05",
        },
        {
            _id: "2",
            doctor: "Dr. Neha Gupta",
            availability: "Not Available",
            time: "-",
            date: "2025-01-06",
        },
        {
            _id: "3",
            doctor: "Dr. Rajesh Kumar",
            availability: "Available",
            time: "2:00 PM - 5:00 PM",
            date: "2025-01-07",
        },
    ]);

    const columns = [
        { field: "doctor", header: "Doctor" },
        { field: "availability", header: "Availability" },
        { field: "time", header: "Time" },
        { field: "date", header: "Date" },
    ];

    // Real-time stats derived from rows
    const totalSlots = rows.length;
    const availableDoctors = rows.filter(slot =>
        slot.availability === "Available"
    ).length;

    const handleCreateSubmit = async (data) => {
        const newSlot = createSlotAPI(data);
        setRows(prev => [...prev, newSlot]);
    };

    const handleEditSubmit = async (data, row) => {
        const updated = await updateSlotAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updated : r));
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this slot?")) {
            deleteSlotAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <Box>
            {/* Heading */}
            <HeadingCard
                title="Doctor Slot Availability"
                subtitle="View and manage the availability and time slots of doctors in the hospital."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Slot Management" }
                ]}
            />

            {/* Stats Cards */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                my={4}
                justifyContent="flex-start"
            >
                <DashboardCard
                    title="Total Slots"
                    count={totalSlots}
                    icon={EventAvailableIcon}
                />

                <DashboardCard
                    title="Available Doctors"
                    count={availableDoctors}
                    icon={PeopleAltIcon}
                />
            </Stack>

            {/* Table */}
            <TableComponent
                title="Doctor Slot Availability List"
                columns={columns}
                rows={rows}
                formFields={fields}
                onCreateSubmit={handleCreateSubmit}
                onEditSubmit={handleEditSubmit}
                showView={true}
                showEdit={true}
                showDelete={true}
                onDelete={handleDelete}
            // Optional: force status badge if you add a 'status' field later
            />
        </Box>
    );
}

export default Slot_View;