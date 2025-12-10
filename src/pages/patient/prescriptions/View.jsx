import React from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';

function Prescriptions_View() {
    // ============================
    // TABLE COLUMNS
    // ============================
    const columns = [
        { header: "Patient Name", field: "patientName" },
        { header: "Prescription ID", field: "prescriptionId" },
        { header: "Date", field: "date" },
        { header: "Doctor", field: "doctor" },
        { header: "Medicines Count", field: "medicinesCount" },
        { header: "Consultation ID", field: "consultationId" },
    ];

    // ============================
    // SAMPLE DATA (Replace with real API later)
    // ============================
    const rows = [
        {
            _id: "1",
            patientName: "Sharavani",
            prescriptionId: "RX-20251125-001",
            date: "Nov 25, 2025",
            doctor: "Dr. Anajali D",
            medicinesCount: 5,
            consultationId: "CONS-12541",
        },
        {
            _id: "2",
            patientName: "Riya",
            prescriptionId: "RX-20251201-002",
            date: "Dec 01, 2025",
            doctor: "Dr. Manoj",
            medicinesCount: 3,
            consultationId: "CONS-12542",
        },
    ];

    // ============================
    // PRINT ALL FUNCTION (Only Table)
    // ============================
    const handlePrintAll = () => {
        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>My Prescriptions - Print</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        h1 { text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>My Prescriptions</h1>
                    <table>
                        <thead>
                            <tr>
                                ${columns.map(col => `<th>${col.header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map((row, idx) => `
                                <tr>
                                    ${columns.map(col => `<td>${row[col.field] ?? '-'}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <script>
                        window.onload = () => {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `;
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    return (
        <div style={{ paddingBottom: "30px" }}>
            {/* Page Heading */}
            <HeadingCard
                title="My Prescriptions"
                subtitle="Access all your prescriptions, check dosage details, and view records from past consultations."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Prescriptions" },
                ]}
            />

            {/* TABLE */}
            <TableComponent
                title="Prescriptions List"
                columns={columns}
                rows={rows}

                showView={true}
                showEdit={false}
                showDelete={false}
                showAddButton={false}

                headerActions={[
                    {
                        label: "Print All",
                        icon: <LocalPrintshopIcon />,
                        onClick: handlePrintAll,
                        variant: "contained",
                        sx: {
                            background: "var(--color-primary)",
                            color: "white",
                            px: 3,
                            borderRadius: 2,
                            textTransform: "none",
                        },
                    },
                ]}
            />

        </div>
    );
}

export default Prescriptions_View;