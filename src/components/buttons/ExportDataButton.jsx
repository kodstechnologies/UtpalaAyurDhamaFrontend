import React from "react";
import * as XLSX from "xlsx";

function ExportDataButton({ rows = [], columns = [], fileName = "data.xlsx" }) {

    const handleExport = () => {
        // Create sheet data from columns + rows
        const sheetData = [
            columns.map(col => col.header), // header row
            ...rows.map(row =>
                columns.map(col => row[col.field] ?? "")
            )
        ];

        // Create worksheet + workbook
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Trigger file download
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <button
            onClick={handleExport}
            style={{
                padding: "10px 18px",
                background: "var(--color-primary)",
                color: "#fff",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px"
            }}
        >
            Export Excel
        </button>
    );
}

export default ExportDataButton;
