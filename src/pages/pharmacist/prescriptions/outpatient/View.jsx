import React, { useState, useMemo } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";

import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../../components/card/HeadingCard";
import TableComponent from "../../../../components/table/TableComponent";
import CardBorder from "../../../../components/card/CardBorder";
import Search from "../../../../components/search/Search";
import ExportDataButton from "../../../../components/buttons/ExportDataButton";

function Outpatient_View() {
    const navigate = useNavigate();

    const columns = [
        { field: "name", header: "Name" },
        { field: "age", header: "Age" },
        { field: "gender", header: "Gender" },
        { field: "doctor", header: "Doctor" },
        { field: "diagnosis", header: "Diagnosis" },
        { field: "prescriptions", header: "Prescriptions" },
    ];

    const rows = [
        {
            _id: "1",
            name: "Amit Kumar",
            age: 32,
            gender: "Male",
            doctor: "Dr. Sharma",
            diagnosis: "Fever",
            prescriptions: "Paracetamol 500mg",
        },
    ];

    const [searchText, setSearchText] = useState("");

    const filteredRows = useMemo(() => {
        if (!searchText) return rows;
        const q = searchText.toLowerCase();
        return rows.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.doctor.toLowerCase().includes(q) ||
                r.diagnosis.toLowerCase().includes(q)
        );
    }, [searchText, rows]);

    const actions = [
        {
            label: "View Prescriptions",
            icon: <VisibilityIcon fontSize="small" />,
            onClick: (row) =>
                navigate(`/pharmacist/prescriptions/outpatient/${row._id}`),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Outpatient Prescriptions"
                subtitle="View and manage outpatient prescriptions."
            />

            <CardBorder className="mb-[2rem]">
                <Search value={searchText} onChange={setSearchText} />
                <ExportDataButton
                    rows={filteredRows}
                    columns={columns}
                    fileName="outpatient-prescriptions.xlsx"
                />
            </CardBorder>

            <TableComponent
                columns={columns}
                rows={filteredRows}
                actions={actions}
            />
        </Box>
    );
}

export default Outpatient_View;
