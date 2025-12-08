// import React, { useState } from "react";
// import TableComponent from "../../../components/table/TableComponent";
// import HeadingCard from "../../../components/card/HeadingCard";

// function Inventory_View() {

//     // ========== TABLE COLUMNS ==========
//     const columns = [
//         { field: "stockId", header: "Stock ID" },
//         { field: "itemName", header: "Item Name" },
//         { field: "type", header: "Type" },
//         { field: "category", header: "Category" },
//         { field: "quantity", header: "Quantity" },
//         { field: "status", header: "Status" },
//     ];

//     // ========== ALL INVENTORY ROWS ==========
//     const allRows = [
//         {
//             _id: "1",
//             stockId: "STK-101",
//             itemName: "Paracetamol",
//             type: "Internal Medicine",
//             category: "Pain Relief",
//             quantity: 120,
//             status: "Available",
//         },
//         {
//             _id: "2",
//             stockId: "STK-202",
//             itemName: "Bandage Roll",
//             type: "External Medicine",
//             category: "First Aid",
//             quantity: 50,
//             status: "Low Stock",
//         },
//         {
//             _id: "3",
//             stockId: "STK-303",
//             itemName: "Amoxicillin",
//             type: "Internal Medicine",
//             category: "Antibiotic",
//             quantity: 200,
//             status: "Available",
//         },
//     ];

//     // Filter State
//     const [filter, setFilter] = useState("All Items");

//     // Filter Logic
//     const filteredRows =
//         filter === "All Items"
//             ? allRows
//             : allRows.filter((item) => item.type === filter);

//     return (
//         <div>
//             <HeadingCard
//                 title="Inventory Management"
//                 subtitle="Monitor and manage the stock of medicines and essential supplies."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Inventory" }
//                 ]}
//             />

//             {/* FILTER BUTTONS */}
//             <div
//                 style={{
//                     marginBottom: "15px",
//                     display: "flex",
//                     gap: "12px",
//                 }}
//             >
//                 {["All Items", "Internal Medicine", "External Medicine"].map(
//                     (btn) => (
//                         <button
//                             key={btn}
//                             onClick={() => setFilter(btn)}
//                             style={{
//                                 padding: "6px 16px",
//                                 borderRadius: "6px",
//                                 cursor: "pointer",
//                                 border:
//                                     filter === btn
//                                         ? "2px solid var(--color-primary)"
//                                         : "1px solid var(--color-border)",
//                                 background:
//                                     filter === btn
//                                         ? "var(--color-primary-light)"
//                                         : "var(--color-bg-card)",
//                                 color: "var(--color-text-dark)",
//                                 fontWeight: 600,
//                                 transition: "0.2s ease",
//                             }}
//                         >
//                             {btn}
//                         </button>
//                     )
//                 )}
//             </div>

//             {/* TABLE */}
//             <TableComponent
//                 title="Inventory List"
//                 columns={columns}
//                 rows={filteredRows}
//             />
//         </div>
//     );
// }

// export default Inventory_View;


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import TableComponent from "../../../components/table/TableComponent";
// import HeadingCard from "../../../components/card/HeadingCard";

// function Inventory_View() {
//     const navigate = useNavigate();

//     // ========== TABLE COLUMNS ==========
//     const columns = [
//         { field: "stockId", header: "Stock ID" },
//         { field: "itemName", header: "Item Name" },
//         { field: "type", header: "Type" },
//         { field: "category", header: "Category" },
//         { field: "quantity", header: "Quantity" },
//         { field: "status", header: "Status" },
//     ];

//     // ========== ALL INVENTORY ROWS ==========
//     const allRows = [
//         {
//             _id: "1",
//             stockId: "STK-101",
//             itemName: "Paracetamol",
//             type: "Internal Medicine",
//             category: "Pain Relief",
//             quantity: 120,
//             status: "Available",
//         },
//         {
//             _id: "2",
//             stockId: "STK-202",
//             itemName: "Bandage Roll",
//             type: "External Medicine",
//             category: "First Aid",
//             quantity: 50,
//             status: "Low Stock",
//         },
//         {
//             _id: "3",
//             stockId: "STK-303",
//             itemName: "Amoxicillin",
//             type: "Internal Medicine",
//             category: "Antibiotic",
//             quantity: 200,
//             status: "Available",
//         },
//     ];

//     // Filter State
//     const [filter, setFilter] = useState("All Items");

//     // Filter Logic
//     const filteredRows =
//         filter === "All Items"
//             ? allRows
//             : allRows.filter((item) => item.type === filter);

//     const handleCreate = () => {
//         navigate("/admin/inventory/create");
//     };

//     const handleDelete = (id) => {
//         // Add confirmation dialog and API call here
//         if (window.confirm(`Are you sure you want to delete inventory item ${id}?`)) {
//             console.log("Delete inventory item:", id); // Replace with API call
//             // Refresh rows after delete
//         }
//     };

//     return (
//         <div>
//             <HeadingCard
//                 title="Inventory Management"
//                 subtitle="Monitor and manage the stock of medicines and essential supplies."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Inventory" }
//                 ]}
//             />

//             {/* FILTER BUTTONS */}
//             <div
//                 style={{
//                     marginBottom: "15px",
//                     display: "flex",
//                     gap: "12px",
//                 }}
//             >
//                 {["All Items", "Internal Medicine", "External Medicine"].map(
//                     (btn) => (
//                         <button
//                             key={btn}
//                             onClick={() => setFilter(btn)}
//                             style={{
//                                 padding: "6px 16px",
//                                 borderRadius: "6px",
//                                 cursor: "pointer",
//                                 border:
//                                     filter === btn
//                                         ? "2px solid var(--color-primary)"
//                                         : "1px solid var(--color-border)",
//                                 background:
//                                     filter === btn
//                                         ? "var(--color-primary-light)"
//                                         : "var(--color-bg-card)",
//                                 color: "var(--color-text-dark)",
//                                 fontWeight: 600,
//                                 transition: "0.2s ease",
//                             }}
//                         >
//                             {btn}
//                         </button>
//                     )
//                 )}
//             </div>

//             {/* TABLE */}
//             <TableComponent
//                 title="Inventory List"
//                 columns={columns}
//                 rows={filteredRows}
//                 viewPath="/admin/inventory/view"
//                 editPath="/admin/inventory/edit"
//                 showView={true}
//                 showEdit={true}
//                 showDelete={true}
//                 onCreate={handleCreate}
//                 onDelete={handleDelete}
//             />
//         </div>
//     );
// }

// export default Inventory_View;

import React, { useState } from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";

// Define fields for the form modals
const fields = [
    { name: 'stockId', label: 'Stock ID', type: 'text', required: true },
    { name: 'itemName', label: 'Item Name', type: 'text', required: true },
    {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
            { value: 'Internal Medicine', label: 'Internal Medicine' },
            { value: 'External Medicine', label: 'External Medicine' },
        ],
    },
    { name: 'category', label: 'Category', type: 'text', required: true },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
            { value: 'Available', label: 'Available' },
            { value: 'Low Stock', label: 'Low Stock' },
            { value: 'Out of Stock', label: 'Out of Stock' },
        ],
    },
];

// Placeholder API functions - replace with actual API calls
const createInventoryAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newItem = { _id: newId, ...data };
    console.log('Created inventory item:', newItem);
    return newItem;
};

const updateInventoryAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated inventory item:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deleteInventoryAPI = async (id) => {
    // Simulate API call
    console.log('Deleted inventory item:', id);
};

function Inventory_View() {
    const [rows, setRows] = useState([
        {
            _id: "1",
            stockId: "STK-101",
            itemName: "Paracetamol",
            type: "Internal Medicine",
            category: "Pain Relief",
            quantity: 120,
            status: "Available",
        },
        {
            _id: "2",
            stockId: "STK-202",
            itemName: "Bandage Roll",
            type: "External Medicine",
            category: "First Aid",
            quantity: 50,
            status: "Low Stock",
        },
        {
            _id: "3",
            stockId: "STK-303",
            itemName: "Amoxicillin",
            type: "Internal Medicine",
            category: "Antibiotic",
            quantity: 200,
            status: "Available",
        },
    ]);

    // Filter State
    const [filter, setFilter] = useState("All Items");

    // Filter Logic
    const filteredRows =
        filter === "All Items"
            ? rows
            : rows.filter((item) => item.type === filter);

    const columns = [
        { field: "stockId", header: "Stock ID" },
        { field: "itemName", header: "Item Name" },
        { field: "type", header: "Type" },
        { field: "category", header: "Category" },
        { field: "quantity", header: "Quantity" },
        { field: "status", header: "Status" },
    ];

    const handleCreateSubmit = async (data) => {
        const newItem = await createInventoryAPI(data);
        setRows(prev => [...prev, newItem]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedItem = await updateInventoryAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedItem : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete inventory item ${id}?`)) {
            deleteInventoryAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    return (
        <div>
            <HeadingCard
                title="Inventory Management"
                subtitle="Monitor and manage the stock of medicines and essential supplies."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Inventory" }
                ]}
            />

            {/* FILTER BUTTONS */}
            <div
                style={{
                    marginBottom: "15px",
                    display: "flex",
                    gap: "12px",
                }}
            >
                {["All Items", "Internal Medicine", "External Medicine"].map(
                    (btn) => (
                        <button
                            key={btn}
                            onClick={() => setFilter(btn)}
                            style={{
                                padding: "6px 16px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                border:
                                    filter === btn
                                        ? "2px solid var(--color-primary)"
                                        : "1px solid var(--color-border)",
                                background:
                                    filter === btn
                                        ? "var(--color-primary-light)"
                                        : "var(--color-bg-card)",
                                color: "var(--color-text-dark)",
                                fontWeight: 600,
                                transition: "0.2s ease",
                            }}
                        >
                            {btn}
                        </button>
                    )
                )}
            </div>

            {/* TABLE */}
            <TableComponent
                title="Inventory List"
                columns={columns}
                rows={filteredRows}
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

export default Inventory_View;