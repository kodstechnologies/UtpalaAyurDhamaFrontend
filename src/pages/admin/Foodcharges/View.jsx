// import React from "react";
// import TableComponent from "../../../components/table/TableComponent";
// import HeadingCard from "../../../components/card/HeadingCard";

// function Food_Charges_View() {

//     // ---------- COLUMNS ----------
//     const columns = [
//         { field: "foodName", header: "Food Name" },
//         { field: "category", header: "Category" },
//         { field: "price", header: "Price" },
//         { field: "description", header: "Description" },
//         { field: "status", header: "Status" },
//         { field: "updated", header: "Last Updated" },
//     ];

//     // ---------- SAMPLE ROW DATA ----------
//     const rows = [
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
//     ];

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
//                 title="Food Charges List"
//                 columns={columns}
//                 rows={rows}
//                 enableCategoryFilter={true}
//                 enableStatusFilter={true}
//             />
//         </div>
//     );
// }

// export default Food_Charges_View;


// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import TableComponent from '../../../components/table/TableComponent';
// import HeadingCard from '../../../components/card/HeadingCard';

// function Food_Charges_View() {
//     const navigate = useNavigate();

//     // ---------- COLUMNS ----------
//     const columns = [
//         { field: "foodName", header: "Food Name" },
//         { field: "category", header: "Category" },
//         { field: "price", header: "Price" },
//         { field: "description", header: "Description" },
//         { field: "status", header: "Status" },
//         { field: "updated", header: "Last Updated" },
//     ];

//     // ---------- SAMPLE ROW DATA ----------
//     const rows = [
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
//     ];

//     const handleCreate = () => {
//         navigate("/admin/foodcharges/create");
//     };

//     const handleDelete = (id) => {
//         // Add confirmation dialog and API call here
//         if (window.confirm(`Are you sure you want to delete food charge ${id}?`)) {
//             console.log("Delete food charge:", id); // Replace with API call
//             // Refresh rows after delete
//         }
//     };

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
//                 title="Food Charges List"
//                 columns={columns}
//                 rows={rows}
//                 viewPath="/admin/foodcharges/view"
//                 editPath="/admin/foodcharges/edit"
//                 showView={true}
//                 showEdit={true}
//                 showDelete={true}
//                 onCreate={handleCreate}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Food_Charges_View;

import React, { useState } from 'react';
import HeadingCard from '../../../components/card/HeadingCard';
import TableComponent from '../../../components/table/TableComponent';

// Define fields for the form modals
const fields = [
    { name: 'foodName', label: 'Food Name', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'text', required: true },
    { name: 'price', label: 'Price', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text', required: true },
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

// Placeholder API functions - replace with actual API calls
const createFoodChargeAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newFoodCharge = { _id: newId, ...data, updated: new Date().toISOString().split('T')[0] };
    console.log('Created food charge:', newFoodCharge);
    return newFoodCharge;
};

const updateFoodChargeAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated food charge:', { _id: id, ...data });
    return { _id: id, ...data, updated: new Date().toISOString().split('T')[0] };
};

const deleteFoodChargeAPI = async (id) => {
    // Simulate API call
    console.log('Deleted food charge:', id);
};

function Food_Charges_View() {
    const [rows, setRows] = useState([
        {
            _id: "1",
            foodName: "Vegetable Soup",
            category: "Breakfast",
            price: "₹120",
            description: "Fresh veggies blended into a warm soup.",
            status: "Active",
            updated: "2025-01-16",
        },
        {
            _id: "2",
            foodName: "Special Thali",
            category: "Lunch",
            price: "₹250",
            description: "Full combo meal: rice, dal, sabji, roti.",
            status: "Inactive",
            updated: "2025-01-10",
        },
        {
            _id: "3",
            foodName: "Fruit Juice",
            category: "Juice",
            price: "₹80",
            description: "Fresh seasonal juice, no added sugar.",
            status: "Active",
            updated: "2025-01-14",
        },
    ]);

    const columns = [
        { field: "foodName", header: "Food Name" },
        { field: "category", header: "Category" },
        { field: "price", header: "Price" },
        { field: "description", header: "Description" },
        { field: "status", header: "Status" },
        { field: "updated", header: "Last Updated" },
    ];

    const handleCreateSubmit = async (data) => {
        const newFoodCharge = await createFoodChargeAPI(data);
        setRows(prev => [...prev, newFoodCharge]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedFoodCharge = await updateFoodChargeAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedFoodCharge : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete food charge ${id}?`)) {
            deleteFoodChargeAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Food Charges"
                subtitle="Manage food pricing for breakfast, lunch, dinner, and special diet plans."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Food Charges" }
                ]}
            />

            {/* TABLE COMPONENT WITH FILTERS SUPPORT */}
            <TableComponent
                title="Food Charges List"
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

export default Food_Charges_View;