import React, { useState, useEffect, useMemo } from "react";
import { Stack, Box, CircularProgress, Chip } from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import HeadingCard from "../../../../components/card/HeadingCard";
import TableComponent from "../../../../components/table/TableComponent";
import DashboardCard from "../../../../components/card/DashboardCard";
import CardBorder from "../../../../components/card/CardBorder";
import Search from "../../../../components/search/Search";
import ExportDataButton from "../../../../components/buttons/ExportDataButton";
import RedirectButton from "../../../../components/buttons/RedirectButton";
import slotService from "../../../../services/slotService";

function Slot_View() {
    const [rows, setRows] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch slots from API
    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            setIsLoading(true);
            const response = await slotService.getAllSlots({ page: 1, limit: 100 });
            if (response.success && response.data) {
                // Transform data for table display
                const transformedData = response.data.map((slot, index) => ({
                    _id: slot._id,
                    slNo: index + 1,
                    doctor: slot.doctorid?.user?.name || "Unknown",
                    days: slot.days || [],
                    startTime: slot.startTime || "N/A",
                    endTime: slot.endTime || "N/A",
                    timeSlot: slot.startTime && slot.endTime 
                        ? `${slot.startTime} - ${slot.endTime}` 
                        : "N/A",
                    availability: slot.days && slot.days.length > 0 ? "Available" : "Not Available",
                }));
                setRows(transformedData);
            } else {
                toast.error(response.message || "Failed to fetch slots");
            }
        } catch (error) {
            console.error("Error fetching slots:", error);
            toast.error(error.message || "Failed to fetch slots");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this slot?")) {
            try {
                const response = await slotService.deleteSlot(id);
                if (response.success) {
                    toast.success("Slot deleted successfully");
                    fetchSlots(); // Refresh the list
                } else {
                    toast.error(response.message || "Failed to delete slot");
                }
            } catch (error) {
                console.error("Error deleting slot:", error);
                toast.error(error.message || "Failed to delete slot");
            }
        }
    };

    // Filtered rows based on search
    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const searchMatch =
                searchText === "" ||
                row.doctor.toLowerCase().includes(searchText.toLowerCase()) ||
                row.timeSlot.toLowerCase().includes(searchText.toLowerCase()) ||
                row.days.join(", ").toLowerCase().includes(searchText.toLowerCase());
            return searchMatch;
        });
    }, [rows, searchText]);

    // Real-time stats derived from rows
    const totalSlots = rows.length;
    const availableDoctors = rows.filter(slot =>
        slot.availability === "Available"
    ).length;

    const columns = [
        { field: "slNo", header: "Sl. No." },
        { field: "doctor", header: "Doctor" },
        { 
            field: "days", 
            header: "Days",
            render: (row) => {
                if (!row.days || row.days.length === 0) return "N/A";
                return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {row.days.map((day, idx) => (
                            <Chip
                                key={idx}
                                label={day}
                                size="small"
                                sx={{
                                    backgroundColor: "var(--color-bg-a)",
                                    color: "var(--color-text-dark)",
                                    fontSize: "0.75rem",
                                }}
                            />
                        ))}
                    </Box>
                );
            }
        },
        { field: "timeSlot", header: "Time" },
        { field: "availability", header: "Availability" },
    ];

    const actions = [
        {
            icon: <EditIcon fontSize="small" />,
            color: "var(--color-primary)",
            label: "Edit",
            onClick: (row) => {
                navigate(`/admin/consultation/slots/edit/${row._id}`);
            },
        },
        {
            icon: <DeleteIcon fontSize="small" />,
            color: "#f44336",
            label: "Delete",
            onClick: (row) => {
                handleDelete(row._id);
            },
        },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Heading */}
            <HeadingCard
                title="Doctor Slot Availability"
                subtitle="View and manage the availability and time slots of doctors in the hospital."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Slot Management" }
                ]}
            />

            {/* Stats Cards */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                my={4}
                justifyContent="flex-start"
            >
                <DashboardCard
                    title="Total Slots"
                    count={totalSlots}
                    icon={EventAvailableIcon}
                />

                <DashboardCard
                    title="Available Doctors"
                    count={availableDoctors}
                    icon={PeopleAltIcon}
                />
            </Stack>

            {/* SEARCH + EXPORT + CREATE */}
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
                {/* LEFT SIDE — Search */}
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ width: "100%" }}
                    />
                </div>

                {/* RIGHT SIDE — Export + Create Buttons */}
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="doctor-slots.xlsx"
                    />
                    <RedirectButton text="Create Slot" link="/admin/consultation/slots/add" />
                </div>
            </CardBorder>

            {/* Table */}
            <TableComponent
                title="Doctor Slot Availability List"
                subtitle={`${filteredRows.length} slots found`}
                columns={columns}
                rows={filteredRows.map((row) => ({
                    ...row,
                    availability: (
                        <Chip
                            label={row.availability}
                            color={row.availability === "Available" ? "success" : "default"}
                            size="small"
                        />
                    )
                }))}
                actions={actions}
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
                showStatusBadge={false}
            />
        </Box>
    );
}

export default Slot_View;
