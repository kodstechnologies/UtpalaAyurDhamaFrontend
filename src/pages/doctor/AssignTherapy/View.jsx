import { useState, useMemo } from "react";
import { Box, Stack, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HealingIcon from "@mui/icons-material/Healing";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import RedirectButton from "../../../components/buttons/RedirectButton";

// Mock data
const mockTherapyAssignments = [
    {
        _id: "1",
        patientName: "Amit Kumar",
        patientId: "PAT-001",
        therapistName: "Dr. Aisha Patel",
        therapyType: "Yoga Therapy",
        assignedDate: "2025-01-15",
        status: "Active",
        sessionsCompleted: 5,
        totalSessions: 10,
    },
    {
        _id: "2",
        patientName: "Sita Verma",
        patientId: "PAT-002",
        therapistName: "Dr. Raj Kumar",
        therapyType: "Physiotherapy",
        assignedDate: "2025-01-10",
        status: "Active",
        sessionsCompleted: 8,
        totalSessions: 12,
    },
    {
        _id: "3",
        patientName: "Rajesh Singh",
        patientId: "PAT-003",
        therapistName: "Dr. Meera Singh",
        therapyType: "Counseling",
        assignedDate: "2025-01-12",
        status: "Completed",
        sessionsCompleted: 10,
        totalSessions: 10,
    },
];

function AssignTherapy_View() {
    const [assignments] = useState(mockTherapyAssignments);
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("All");
    const navigate = useNavigate();

    // Filter assignments
    const filteredAssignments = useMemo(() => {
        return assignments.filter((assignment) => {
            const searchMatch =
                searchText === "" ||
                assignment.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
                assignment.patientId.toLowerCase().includes(searchText.toLowerCase()) ||
                assignment.therapistName.toLowerCase().includes(searchText.toLowerCase()) ||
                assignment.therapyType.toLowerCase().includes(searchText.toLowerCase());

            const statusMatch = filter === "All" || assignment.status === filter;

            return searchMatch && statusMatch;
        });
    }, [assignments, searchText, filter]);

    // Calculate statistics
    const stats = useMemo(() => {
        return {
            total: assignments.length,
            active: assignments.filter((a) => a.status === "Active").length,
            completed: assignments.filter((a) => a.status === "Completed").length,
            pending: assignments.filter((a) => a.status === "Pending").length,
        };
    }, [assignments]);

    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "patientId", header: "Patient ID" },
        { field: "therapistName", header: "Therapist" },
        { field: "therapyType", header: "Therapy Type" },
        { field: "assignedDate", header: "Assigned Date" },
        { field: "sessionsCompleted", header: "Sessions" },
        { field: "status", header: "Status" },
    ];

    const actions = [
        {
            icon: <PersonIcon fontSize="small" />,
            color: "var(--color-primary)",
            label: "View Details",
            onClick: (row) => {
                navigate(`/doctor/examination/${row.patientId}`);
            },
        },
    ];

    return (
        <Box>
            <HeadingCard
                title="Assign Therapy"
                subtitle="Manage therapy assignments for patients"
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Assign Therapy" },
                ]}
            />

            {/* Statistics Cards */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                my={4}
                justifyContent="flex-start"
                sx={{
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
            >
                <DashboardCard title="Total Assignments" count={stats.total} icon={AssignmentIcon} />
                <DashboardCard title="Active" count={stats.active} icon={HealingIcon} />
                <DashboardCard title="Completed" count={stats.completed} icon={HealingIcon} />
                <DashboardCard title="Pending" count={stats.pending} icon={AssignmentIcon} />
            </Stack>

            {/* Search and Actions */}
            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{
                    width: "100%",
                    marginBottom: "2rem",
                }}
            >
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredAssignments}
                        columns={columns}
                        fileName="therapy-assignments.xlsx"
                    />
                    <RedirectButton text="Assign New Therapy" link="/doctor/assign-therapy/new" />
                </div>
            </CardBorder>

            {/* Filter Buttons */}
            <Stack direction="row" spacing={2} mb={3}>
                {["All", "Active", "Completed", "Pending"].map((btn) => (
                    <Button
                        key={btn}
                        onClick={() => setFilter(btn)}
                        variant={filter === btn ? "contained" : "outlined"}
                        sx={{
                            px: 3,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: filter === btn ? "var(--color-primary)" : "transparent",
                            color: filter === btn ? "white" : "var(--color-text-dark)",
                            borderColor: "var(--color-border)",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": {
                                bgcolor: filter === btn ? "var(--color-primary-dark)" : "var(--color-bg-hover)",
                            },
                        }}
                    >
                        {btn}
                    </Button>
                ))}
            </Stack>

            {/* Table */}
            <TableComponent
                title="Therapy Assignments"
                columns={columns}
                rows={filteredAssignments.map((row) => ({
                    ...row,
                    sessionsCompleted: `${row.sessionsCompleted}/${row.totalSessions}`,
                }))}
                actions={actions}
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
                showExportButton={false}
            />
        </Box>
    );
}

export default AssignTherapy_View;

