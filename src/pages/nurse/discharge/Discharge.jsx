import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import TableComponent from "../../../components/table/TableComponent";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

function Discharge() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");

    const columns = [
        { field: "patientId", header: "Patient ID" },
        { field: "patientName", header: "Patient Name" },
        { field: "wardBed", header: "Ward / Bed" },
        { field: "admissionDate", header: "Admission Date" },
        { field: "doctor", header: "Consulting Doctor" },
    ];

    const rows = [
        {
            _id: "1",
            patientId: "PAT-105",
            patientName: "Geeta Kapoor",
            wardBed: "Private Room / 102-B",
            admissionDate: "2024-05-20",
            doctor: "Dr. Priya Singh",
        },
        {
            _id: "2",
            patientId: "PAT-108",
            patientName: "Vijay Rathod",
            wardBed: "General Ward / GW-05",
            admissionDate: "2024-05-22",
            doctor: "Dr. Anjali Verma",
        },
    ];

    const handleOpen = (row) => {
        const params = new URLSearchParams({
            patientId: row._id || row.patientId || "",
            patientName: row.patientName || "",
        });
        navigate(`/nurse/discharge-preparation/prepare?${params.toString()}`);
    };

    const actions = [
        {
            label: "Prepare Discharge",
            icon: <AssignmentTurnedInIcon />,
            color: "var(--color-success)",
            variant: "contained",
            onClick: handleOpen,
        },
    ];

    return (
        <>
            <HeadingCard
                title="Discharge Preparation"
                subtitle="Prepare patient discharge summaries, instructions, and follow-up details."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Discharge Preparation" },
                ]}
            />

            {/* Search & Export */}
            <CardBorder
                justify="between"
                align="center"
                wrap
                padding="2rem"
                className="mb-[2rem]"
            >
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={setSearchText}
                    />
                </div>

                <ExportDataButton
                    rows={rows}
                    columns={columns}
                    fileName="discharge-patients.xlsx"
                />
            </CardBorder>

            {/* Table */}
            <TableComponent
                columns={columns}
                rows={rows}
                actions={actions}
            />
        </>
    );
}

export default Discharge;
