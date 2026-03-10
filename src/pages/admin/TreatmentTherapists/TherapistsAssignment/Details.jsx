import React, { useState } from 'react';
import HeadingCard from '../../../../components/card/HeadingCard';
import TableComponent from '../../../../components/table/TableComponent';
import CardBorder from '../../../../components/card/CardBorder';
import Search from '../../../../components/search/Search';
import ExportDataButton from '../../../../components/buttons/ExportDataButton';
import RedirectButton from '../../../../components/buttons/RedirectButton';

import { Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Placeholder API functions
const deleteAssignmentAPI = async (id) => {
    console.log("Deleted assignment:", id);
};

function Therapists_Assignment_View() {
    const navigate = useNavigate()
    const [rows, setRows] = useState([
        {
            _id: "1",
            therapyType: "Abhyanga",
            therapist: "Rahul Verma",
            cost: "₹1,200"
        },
        {
            _id: "2",
            therapyType: "Shirodhara",
            therapist: "Meera Nair",
            cost: "₹1,500"
        },
        {
            _id: "3",
            therapyType: "Pizhichil",
            therapist: "Arun Kumar",
            cost: "₹2,000"
        }
    ]);

    const columns = [
        { field: "therapyType", header: "Therapy Type" },
        { field: "therapist", header: "Therapist" },
        { field: "cost", header: "Cost" },
    ];

    const [searchText, setSearchText] = useState("");

    // 🔍 FILTERED ROWS (Fix)
    const filteredRows = rows.filter((r) =>
        r.therapyType.toLowerCase().includes(searchText.toLowerCase()) ||
        r.therapist.toLowerCase().includes(searchText.toLowerCase()) ||
        r.cost.toLowerCase().includes(searchText.toLowerCase())
    );

    // ACTIONS
    const actions = [
        // {
        //     label: "View",
        //     icon: <Eye />,
        //     color: "var(--color-icon-3)",
        //     onClick: (row) => navigate(`/admin/treatment-assignments/view/${row._id}`)
        // },
        {
            label: "Edit",
            icon: <Edit />,
            color: "var(--color-icon-2)",
            onClick: (row) => navigate(`/admin/treatment-assignments/edit/${row._id}`)
        },
        {
            label: "Delete",
            icon: <Trash2 />,
            color: "var(--color-icon-1)",
            onClick: (row) => {
                if (window.confirm("Are you sure you want to delete this therapy assignment?")) {
                    deleteAssignmentAPI(row._id);
                    setRows(prev => prev.filter(r => r._id !== row._id));
                }
            },
        },
    ];

    return (
        <div className="space-y-6 p-6">
            <HeadingCard
                title="Therapists Assignment"
                subtitle="Assign trained therapists to treatments and manage their service costs efficiently."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Therapists Assignment" }
                ]}
            />

            {/* Top Controls */}
            <CardBorder justify="between" align="center" wrap={true} padding="2rem">
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={setSearchText}
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="therapist_assignments.xlsx"
                    />
                    <RedirectButton text="Create" link="/admin/treatment-assignments/add" />
                </div>
            </CardBorder>

            {/* TABLE */}
            <TableComponent
                columns={columns}
                rows={filteredRows}
                actions={actions}
                showStatusBadge={false}
            />
        </div>
    );
}

export default Therapists_Assignment_View;
