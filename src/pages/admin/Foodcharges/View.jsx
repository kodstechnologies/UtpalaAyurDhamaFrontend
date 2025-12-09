// import React, { useState } from 'react';
// import HeadingCard from '../../../components/card/HeadingCard';
// import TableComponent from '../../../components/table/TableComponent';

// // Define fields for the form modals
// const fields = [
//     { name: 'foodName', label: 'Food Name', type: 'text', required: true },
//     { name: 'category', label: 'Category', type: 'text', required: true },
//     { name: 'price', label: 'Price', type: 'text', required: true },
//     { name: 'description', label: 'Description', type: 'text', required: true },
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
//     { name: 'updated', label: 'Last Updated', type: 'date', required: false },
// ];




// // Placeholder API functions - replace with actual API calls
// const createFoodChargeAPI = async (data) => {
//     // Simulate API call
//     const newId = Date.now().toString();
//     const newFoodCharge = { _id: newId, ...data, updated: new Date().toISOString().split('T')[0] };
//     console.log('Created food charge:', newFoodCharge);
//     return newFoodCharge;
// };

// const updateFoodChargeAPI = async (data, id) => {
//     // Simulate API call
//     console.log('Updated food charge:', { _id: id, ...data });
//     return { _id: id, ...data, updated: new Date().toISOString().split('T')[0] };
// };

// const deleteFoodChargeAPI = async (id) => {
//     // Simulate API call
//     console.log('Deleted food charge:', id);
// };

// function Food_Charges_View() {
//     const [rows, setRows] = useState([
//         {
//             _id: "1",
//             foodName: "Vegetable Soup",
//             category: "Breakfast",
//             price: "₹120",
//             description: "Fresh veggies blended into a warm soup.",
//             status: "Active",
//             updated: "2025-01-16",
//         },
//         {
//             _id: "2",
//             foodName: "Special Thali",
//             category: "Lunch",
//             price: "₹250",
//             description: "Full combo meal: rice, dal, sabji, roti.",
//             status: "Inactive",
//             updated: "2025-01-10",
//         },
//         {
//             _id: "3",
//             foodName: "Fruit Juice",
//             category: "Juice",
//             price: "₹80",
//             description: "Fresh seasonal juice, no added sugar.",
//             status: "Active",
//             updated: "2025-01-14",
//         },
//     ]);

//     const columns = [
//         { field: "foodName", header: "Food Name" },
//         { field: "category", header: "Category" },
//         { field: "price", header: "Price" },
//         { field: "description", header: "Description" },
//         { field: "status", header: "Status" },
//         { field: "updated", header: "Last Updated" },
//     ];

//     const handleCreateSubmit = async (data) => {
//         const newFoodCharge = await createFoodChargeAPI(data);
//         setRows(prev => [...prev, newFoodCharge]);
//     };

//     const handleEditSubmit = async (data, row) => {
//         const updatedFoodCharge = await updateFoodChargeAPI(data, row._id);
//         setRows(prev => prev.map(r => r._id === row._id ? updatedFoodCharge : r));
//     };

//     const handleDelete = (id) => {
//         if (window.confirm(`Are you sure you want to delete food charge ${id}?`)) {
//             deleteFoodChargeAPI(id);
//             setRows(prev => prev.filter(r => r._id !== id));
//         }
//     };

//     const [category, setCategory] = useState("All");
//     const [status, setStatus] = useState("All");
//     const extraFilters = (
//         <>
//             <TextField select value={category} onChange={e => setCategory(e.target.value)} sx={{ minWidth: 180 }}>
//                 <MenuItem value="All">All Categories</MenuItem>
//                 <MenuItem value="Breakfast">Breakfast</MenuItem>
//                 {/* ... */}
//             </TextField>

//             <TextField select value={status} onChange={e => setStatus(e.target.value)} sx={{ minWidth: 150 }}>
//                 <MenuItem value="All">All Status</MenuItem>
//                 <MenuItem value="Active">Active</MenuItem>
//                 <MenuItem value="Inactive">Inactive</MenuItem>
//             </TextField>
//         </>
//     );

//     return (
//         <div>
//             <HeadingCard
//                 title="Food Charges"
//                 subtitle="Manage food pricing for breakfast, lunch, dinner, and special diet plans."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Food Charges" }
//                 ]}
//             />

//             {/* TABLE COMPONENT WITH FILTERS SUPPORT */}
//             <TableComponent
//                 title="Food Charges"
//                 columns={columns}
//                 rows={filteredRows}
//                 formFields={fields}
//                 onCreateSubmit={handleCreate}
//                 onEditSubmit={handleEdit}
//                 onDelete={handleDelete}
//                 showAddButton={true}
//                 showExportButton={true}
//                 extraFilters={extraFilters}  // ← Now it works!
//             />
//         </div>
//     );
// }

// export default Food_Charges_View;

import React, { useState, useMemo } from 'react';
import { TextField, MenuItem, Box } from '@mui/material';

import HeadingCard from '../../../components/card/HeadingCard';
import TableComponent from '../../../components/table/TableComponent';

// Form fields
const fields = [
    { name: 'foodName', label: 'Food Name', type: 'text', required: true },
    {
        name: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: [
            { value: 'Breakfast', label: 'Breakfast' },
            { value: 'Lunch', label: 'Lunch' },
            { value: 'Dinner', label: 'Dinner' },
            { value: 'Juice', label: 'Juice' },
            { value: 'Snacks', label: 'Snacks' },
        ],
    },
    { name: 'price', label: 'Price (₹)', type: 'number', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
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
];

// Mock APIs
const createFoodChargeAPI = async (data) => {
    const newId = Date.now().toString();
    return {
        _id: newId,
        ...data,
        price: Number(data.price),
        updated: new Date().toISOString().split('T')[0],
    };
};

const updateFoodChargeAPI = async (data, id) => {
    return {
        _id: id,
        ...data,
        price: Number(data.price),
        updated: new Date().toISOString().split('T')[0],
    };
};

function Food_Charges_View() {
    const [rows, setRows] = useState([
        {
            _id: "1",
            foodName: "Vegetable Soup",
            category: "Breakfast",
            price: 120,
            description: "Fresh veggies blended into a warm soup.",
            status: "Active",
            updated: "2025-01-16",
        },
        {
            _id: "2",
            foodName: "Special Thali",
            category: "Lunch",
            price: 250,
            description: "Full combo meal: rice, dal, sabji, roti.",
            status: "Inactive",
            updated: "2025-01-10",
        },
        {
            _id: "3",
            foodName: "Fruit Juice",
            category: "Juice",
            price: 80,
            description: "Fresh seasonal juice, no added sugar.",
            status: "Active",
            updated: "2025-01-14",
        },
    ]);

    // Filter states
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");

    // Columns with ₹ formatting
    const columns = [
        { field: "foodName", header: "Food Name" },
        { field: "category", header: "Category" },
        {
            field: "price",
            header: "Price",
            render: (row) => `₹${row.price}`,
        },
        { field: "description", header: "Description" },
        { field: "status", header: "Status" }, // Auto shows badge
        { field: "updated", header: "Last Updated" },
    ];

    // Filtered rows
    const filteredRows = useMemo(() => {
        return rows.filter(item => {
            const catMatch = category === "All" || item.category === category;
            const statusMatch = status === "All" || item.status === status;
            return catMatch && statusMatch;
        });
    }, [rows, category, status]);

    // Handlers
    const handleCreate = async (data) => {
        const newItem = await createFoodChargeAPI(data);
        setRows(prev => [...prev, newItem]);
    };

    const handleEdit = async (data, row) => {
        const updated = await updateFoodChargeAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updated : r));
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this food item?')) {
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    // Extra Filters (Category + Status)
    const extraFilters = (
        <>
            <TextField
                select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{ minWidth: 180 }}
                variant="outlined"
                size="small"
            >
                <MenuItem value="All">All Categories</MenuItem>
                <MenuItem value="Breakfast">Breakfast</MenuItem>
                <MenuItem value="Lunch">Lunch</MenuItem>
                <MenuItem value="Dinner">Dinner</MenuItem>
                <MenuItem value="Juice">Juice</MenuItem>
                <MenuItem value="Snacks">Snacks</MenuItem>
            </TextField>

            <TextField
                select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{ minWidth: 150 }}
                variant="outlined"
                size="small"
            >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
        </>
    );

    return (
        <Box>
            <HeadingCard
                title="Food Charges"
                subtitle="Manage food pricing for breakfast, lunch, dinner, and special diet plans."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Food Charges" }
                ]}
            />

            <TableComponent
                title="Food Charges List"
                columns={columns}
                rows={filteredRows}
                formFields={fields}
                onCreateSubmit={handleCreate}
                onEditSubmit={handleEdit}
                onDelete={handleDelete}

                showAddButton={true}
                showExportButton={true}
                showView={true}
                showEdit={true}
                showDelete={true}

                extraFilters={extraFilters}  // Now works!
            />
        </Box>
    );
}

export default Food_Charges_View;