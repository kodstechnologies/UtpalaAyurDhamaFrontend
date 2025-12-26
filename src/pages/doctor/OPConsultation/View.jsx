import { useState, useMemo } from "react";
import { Box, Stack, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";

// Mock data
const mockConsultations = [
    {
        _id: "1",
        patientName: "Amit Kumar",
        patientId: "PAT-001",
        appointmentDate: "2025-01-20",
        appointmentTime: "10:00 AM",
        chiefComplaint: "Fever and cough",
        status: "Scheduled",
        contact: "9876543210",
    },
    {
        _id: "2",
        patientName: "Sita Verma",
        patientId: "PAT-002",
        appointmentDate: "2025-01-20",
        appointmentTime: "11:00 AM",
        chiefComplaint: "Headache",
        status: "Completed",
        contact: "9123456780",
    },
    {
        _id: "3",
        patientName: "Rajesh Singh",
        patientId: "PAT-003",
        appointmentDate: "2025-01-21",
        appointmentTime: "09:00 AM",
        chiefComplaint: "Back pain",
        status: "Scheduled",
        contact: "9988776655",
    },
];

function OPConsultation_View() {
    const [consultations] = useState(mockConsultations);
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("All");
    const navigate = useNavigate();

    // Filter consultations
    const filteredConsultations = useMemo(() => {
        return consultations.filter((consultation) => {
            const searchMatch =
                searchText === "" ||
                consultation.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
                consultation.patientId.toLowerCase().includes(searchText.toLowerCase()) ||
                consultation.chiefComplaint.toLowerCase().includes(searchText.toLowerCase());

            const statusMatch = filter === "All" || consultation.status === filter;

            return searchMatch && statusMatch;
        });
    }, [consultations, searchText, filter]);

    // Calculate statistics
    const stats = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        return {
            total: consultations.length,
            today: consultations.filter((c) => c.appointmentDate === today).length,
            scheduled: consultations.filter((c) => c.status === "Scheduled").length,
            completed: consultations.filter((c) => c.status === "Completed").length,
        };
    }, [consultations]);

    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "patientId", header: "Patient ID" },
        { field: "appointmentDate", header: "Date" },
        { field: "appointmentTime", header: "Time" },
        { field: "chiefComplaint", header: "Chief Complaint" },
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

    const getStatusBadge = (status) => {
        const colors = {
            Scheduled: "info",
            Completed: "success",
            Cancelled: "error",
            Ongoing: "warning",
        };
        return <Chip label={status} color={colors[status] || "default"} size="small" />;
    };

    return (
        <Box>
            <HeadingCard
                title="OP Consultation"
                subtitle="Manage outpatient consultations and appointments"
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "OP Consultation" },
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
                <DashboardCard title="Total Consultations" count={stats.total} icon={LocalHospitalIcon} />
                <DashboardCard title="Today's Appointments" count={stats.today} icon={EventIcon} />
                <DashboardCard title="Scheduled" count={stats.scheduled} icon={EventIcon} />
                <DashboardCard title="Completed" count={stats.completed} icon={LocalHospitalIcon} />
            </Stack>

            {/* Search and Filter */}
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
                        rows={filteredConsultations}
                        columns={columns}
                        fileName="op-consultations.xlsx"
                    />
                </div>
            </CardBorder>

            {/* Filter Buttons */}
            <Stack direction="row" spacing={2} mb={3}>
                {["All", "Scheduled", "Completed", "Cancelled", "Ongoing"].map((btn) => (
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
                title="OP Consultations"
                columns={columns}
                rows={filteredConsultations.map((row) => ({
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

export default OPConsultation_View;

