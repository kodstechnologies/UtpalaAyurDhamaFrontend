import { useState, useMemo } from "react";
import { Box, Stack, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ReplayIcon from "@mui/icons-material/Replay";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import WarningIcon from "@mui/icons-material/Warning";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";

// Mock data
const mockFollowUps = [
    {
        _id: "1",
        patientName: "Amit Kumar",
        patientId: "PAT-001",
        followUpDate: "2025-01-22",
        followUpTime: "10:00 AM",
        reason: "Review medication effectiveness",
        status: "Upcoming",
        daysUntil: 2,
    },
    {
        _id: "2",
        patientName: "Sita Verma",
        patientId: "PAT-002",
        followUpDate: "2025-01-21",
        followUpTime: "11:00 AM",
        reason: "Post-treatment checkup",
        status: "Upcoming",
        daysUntil: 1,
    },
    {
        _id: "3",
        patientName: "Rajesh Singh",
        patientId: "PAT-003",
        followUpDate: "2025-01-20",
        followUpTime: "09:00 AM",
        reason: "Blood test results review",
        status: "Today",
        daysUntil: 0,
    },
    {
        _id: "4",
        patientName: "Priya Sharma",
        patientId: "PAT-004",
        followUpDate: "2025-01-19",
        followUpTime: "02:00 PM",
        reason: "Routine checkup",
        status: "Overdue",
        daysUntil: -1,
    },
];

function FollowUps_View() {
    const [followUps] = useState(mockFollowUps);
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("All");
    const navigate = useNavigate();

    // Filter follow-ups
    const filteredFollowUps = useMemo(() => {
        return followUps.filter((followUp) => {
            const searchMatch =
                searchText === "" ||
                followUp.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
                followUp.patientId.toLowerCase().includes(searchText.toLowerCase()) ||
                followUp.reason.toLowerCase().includes(searchText.toLowerCase());

            const statusMatch = filter === "All" || followUp.status === filter;

            return searchMatch && statusMatch;
        });
    }, [followUps, searchText, filter]);

    // Calculate statistics
    const stats = useMemo(() => {
        return {
            total: followUps.length,
            today: followUps.filter((f) => f.status === "Today").length,
            upcoming: followUps.filter((f) => f.status === "Upcoming").length,
            overdue: followUps.filter((f) => f.status === "Overdue").length,
        };
    }, [followUps]);

    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "patientId", header: "Patient ID" },
        { field: "followUpDate", header: "Date" },
        { field: "followUpTime", header: "Time" },
        { field: "reason", header: "Reason" },
        { field: "status", header: "Status" },
    ];

    const actions = [
        {
            icon: <PersonIcon fontSize="small" />,
            color: "var(--color-primary)",
            label: "View Patient",
            onClick: (row) => {
                navigate(`/doctor/examination/${row.patientId}`);
            },
        },
    ];

    const getStatusBadge = (status) => {
        const colors = {
            Today: "warning",
            Upcoming: "info",
            Overdue: "error",
            Completed: "success",
        };
        return <Chip label={status} color={colors[status] || "default"} size="small" />;
    };

    return (
        <Box>
            <HeadingCard
                title="Follow-ups"
                subtitle="Manage and track patient follow-up appointments"
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Follow-ups" },
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
                <DashboardCard title="Total Follow-ups" count={stats.total} icon={ReplayIcon} />
                <DashboardCard title="Today" count={stats.today} icon={EventIcon} />
                <DashboardCard title="Upcoming" count={stats.upcoming} icon={EventIcon} />
                <DashboardCard title="Overdue" count={stats.overdue} icon={WarningIcon} />
            </Stack>

            {/* Search */}
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
                        rows={filteredFollowUps}
                        columns={columns}
                        fileName="follow-ups.xlsx"
                    />
                </div>
            </CardBorder>

            {/* Filter Buttons */}
            <Stack direction="row" spacing={2} mb={3}>
                {["All", "Today", "Upcoming", "Overdue", "Completed"].map((btn) => (
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
                title="Follow-ups"
                columns={columns}
                rows={filteredFollowUps.map((row) => ({
                    ...row,
                    status: getStatusBadge(row.status),
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

export default FollowUps_View;

