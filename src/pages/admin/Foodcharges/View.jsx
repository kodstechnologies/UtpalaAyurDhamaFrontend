import React, { useState } from "react";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import TableComponent from "../../../components/table/TableComponent";

function Food_Charges_View() {

    // ---------- COLUMNS ----------
    const columns = [
        { field: "foodName", header: "Food Name" },
        { field: "category", header: "Category" },
        { field: "price", header: "Price" },
        { field: "description", header: "Description" },
        { field: "status", header: "Status" },
        { field: "updated", header: "Last Updated" },
    ];

    // ---------- SAMPLE ROW DATA ----------
    const rows = [
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
    ];

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Food Charges" }
                ]}
            />

            {/* TABLE COMPONENT WITH FILTERS SUPPORT */}
            <TableComponent
                title="Food Charges List"
                columns={columns}
                rows={rows}
                enableCategoryFilter={true}
                enableStatusFilter={true}
            />
        </div>
    );
}

export default Food_Charges_View;
