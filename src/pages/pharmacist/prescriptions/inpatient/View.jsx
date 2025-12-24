import React, { useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../../components/card/HeadingCard";
import TableComponent from "../../../../components/table/TableComponent";
import CardBorder from "../../../../components/card/CardBorder";
import Search from "../../../../components/search/Search";
import ExportDataButton from "../../../../components/buttons/ExportDataButton";

function Inpatient_View() {
    const navigate = useNavigate();

    /* =======================
       Breadcrumb
    ======================= */
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist/dashboard" },
        { label: "Inpatient Prescriptions" },
    ];

    /* =======================
       Table Columns
    ======================= */
    const columns = [
        { field: "name", header: "Name" },
        { field: "age", header: "Age" },
        { field: "gender", header: "Gender" },
        { field: "doctor", header: "Doctor" },
        { field: "diagnosis", header: "Diagnosis" },
    ];

    /* =======================
       Table Data
    ======================= */
    const rows = [
        {
            _id: "101",
            name: "Rohit Verma",
            age: 45,
            gender: "Male",
            doctor: "Dr. Mehta",
            diagnosis: "Diabetes Management",
        },
        {
            _id: "102",
            name: "Anusha Reddy",
            age: 33,
            gender: "Female",
            doctor: "Dr. Iyer",
            diagnosis: "Post-Surgery Medication",
        },
    ];

    const [searchText, setSearchText] = useState("");

    const filteredRows = rows.filter((row) =>
        row.name.toLowerCase().includes(searchText.toLowerCase()) ||
        row.diagnosis.toLowerCase().includes(searchText.toLowerCase()) ||
        row.doctor.toLowerCase().includes(searchText.toLowerCase())
    );

    /* =======================
       Actions
    ======================= */
    const actions = [
        {
            label: "View Prescriptions",
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: (row) =>
                navigate(`/pharmacist/prescriptions/inpatient/${row._id}`),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <HeadingCard
                title="Inpatient Prescriptions"
                subtitle="Manage and dispense medications prescribed for admitted patients."
            />

            {/* Search and Export */}
            <CardBorder justify="between" align="center" wrap={true} padding="2rem" className="mb-[2rem]">
                <Box sx={{ flex: 1, mr: 1 }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        sx={{ flex: 1 }}
                    />
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <ExportDataButton
                        rows={rows}
                        columns={columns}
                        fileName="inpatient-prescriptions.xlsx"
                    />
                </Box>
            </CardBorder>

            {/* Table */}
            <TableComponent
                columns={columns}
                rows={filteredRows}
                actions={actions}
                showStatusBadge={false}
            />
        </Box>
    );
}

export default Inpatient_View;