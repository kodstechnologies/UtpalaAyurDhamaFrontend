import React, { useState } from "react";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import TableComponent from "../../../components/table/TableComponent";


function Inventory_View() {

    // ========== TABLE COLUMNS ==========
    const columns = [
        { field: "stockId", header: "Stock ID" },
        { field: "itemName", header: "Item Name" },
        { field: "type", header: "Type" },
        { field: "category", header: "Category" },
        { field: "quantity", header: "Quantity" },
        { field: "status", header: "Status" },
    ];

    // ========== ALL INVENTORY ROWS ==========
    const allRows = [
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
    ];

    // Filter State
    const [filter, setFilter] = useState("All Items");

    // Filter Logic
    const filteredRows =
        filter === "All Items"
            ? allRows
            : allRows.filter((item) => item.type === filter);

    return (
        <div>
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Inventory" }
                ]}
            />

            {/* FILTER BUTTONS */}
            <div style={{ marginBottom: "15px", display: "flex", gap: "12px" }}>
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
            />
        </div>
    );
}

export default Inventory_View;
