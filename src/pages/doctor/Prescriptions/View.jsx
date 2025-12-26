import { useState, useMemo } from "react";
import { Box, Stack, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import RedirectButton from "../../../components/buttons/RedirectButton";

// Mock data
const mockPrescriptions = [
    {
        _id: "1",
        patientName: "Amit Kumar",
        patientId: "PAT-001",
        prescriptionDate: "2025-01-18",
        medicines: "Paracetamol, Amoxicillin",
        status: "Active",
        doctorName: "Dr. Sharma",
    },
    {
        _id: "2",
        patientName: "Sita Verma",
        patientId: "PAT-002",
        prescriptionDate: "2025-01-17",
        medicines: "Ibuprofen, Vitamin D",
        status: "Active",
        doctorName: "Dr. Sharma",
    },
    {
        _id: "3",
        patientName: "Rajesh Singh",
        patientId: "PAT-003",
        prescriptionDate: "2025-01-16",
        medicines: "Metformin, Glipizide",
        status: "Completed",
        doctorName: "Dr. Sharma",
    },
];

function Prescriptions_View() {
    const [prescriptions] = useState(mockPrescriptions);
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("All");
    const navigate = useNavigate();

    // Filter prescriptions
    const filteredPrescriptions = useMemo(() => {
        return prescriptions.filter((prescription) => {
            const searchMatch =
                searchText === "" ||
                prescription.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
                prescription.patientId.toLowerCase().includes(searchText.toLowerCase()) ||
                prescription.medicines.toLowerCase().includes(searchText.toLowerCase());

            const statusMatch = filter === "All" || prescription.status === filter;

            return searchMatch && statusMatch;
        });
    }, [prescriptions, searchText, filter]);

    // Calculate statistics
    const stats = useMemo(() => {
        return {
            total: prescriptions.length,
            active: prescriptions.filter((p) => p.status === "Active").length,
            completed: prescriptions.filter((p) => p.status === "Completed").length,
            today: prescriptions.filter((p) => {
                const today = new Date().toISOString().split("T")[0];
                return p.prescriptionDate === today;
            }).length,
        };
    }, [prescriptions]);

    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "patientId", header: "Patient ID" },
        { field: "prescriptionDate", header: "Date" },
        { field: "medicines", header: "Medicines" },
        { field: "status", header: "Status" },
    ];

    const actions = [
        {
            icon: <PersonIcon fontSize="small" />,
            color: "var(--color-primary)",
            label: "View Details",
            onClick: (row) => {
                navigate(`/doctor/prescriptions/${row._id}`);
            },
        },
    ];

    return (
        <Box>
            <HeadingCard
                title="Prescriptions"
                subtitle="Manage and view patient prescriptions"
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Prescriptions" },
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
                <DashboardCard title="Total Prescriptions" count={stats.total} icon={MedicationIcon} />
                <DashboardCard title="Today's Prescriptions" count={stats.today} icon={EventIcon} />
                <DashboardCard title="Active" count={stats.active} icon={MedicationIcon} />
                <DashboardCard title="Completed" count={stats.completed} icon={MedicationIcon} />
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
                        rows={filteredPrescriptions}
                        columns={columns}
                        fileName="prescriptions.xlsx"
                    />
                    <RedirectButton text="Create Prescription" link="/doctor/prescriptions/new" />
                </div>
            </CardBorder>

            {/* Filter Buttons */}
            <Stack direction="row" spacing={2} mb={3}>
                {["All", "Active", "Completed"].map((btn) => (
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
                title="Prescriptions"
                columns={columns}
                rows={filteredPrescriptions}
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

export default Prescriptions_View;

