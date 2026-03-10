import React, { useState, useEffect, useMemo } from 'react';
import { TextField, MenuItem, Box, Typography, Chip, CircularProgress } from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PowerSettingsNew as ToggleIcon,
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import HeadingCard from '../../../components/card/HeadingCard';
import TableComponent from '../../../components/table/TableComponent';
import CardBorder from '../../../components/card/CardBorder';
import Search from '../../../components/search/Search';
import ExportDataButton from '../../../components/buttons/ExportDataButton';
import RedirectButton from '../../../components/buttons/RedirectButton';
import swarnaBinduEventService from '../../../services/swarnaBinduEventService';

function SwarnaBinduEvents_View() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [status, setStatus] = useState("All");

    // Fetch events from API
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const params = {
                page: 1,
                limit: 100,
            };
            
            if (status !== "All") {
                params.isActive = status === "Active";
            }
            
            if (searchText) {
                params.search = searchText;
            }

            const response = await swarnaBinduEventService.getAllEvents(params);
            
            if (response.success && response.data) {
                // Transform data for table display
                const transformedData = response.data.map((event, index) => ({
                    _id: event._id,
                    slNo: index + 1,
                    title: event.title || "N/A",
                    description: event.description || "",
                    eventDate: event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "N/A",
                    startTime: event.startTime || "N/A",
                    endTime: event.endTime || "N/A",
                    location: event.location || "N/A",
                    status: event.isActive ? "Active" : "Inactive",
                    isActive: event.isActive,
                    updated: event.updatedAt ? new Date(event.updatedAt).toLocaleDateString() : "N/A",
                }));
                setRows(transformedData);
            } else {
                toast.error(response.message || "Failed to fetch events");
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error(error.message || "Failed to fetch events");
        } finally {
            setIsLoading(false);
        }
    };

    // Refetch when filters change
    useEffect(() => {
        fetchEvents();
    }, [status]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const response = await swarnaBinduEventService.deleteEvent(id);
                if (response.success) {
                    toast.success("Event deleted successfully");
                    fetchEvents(); // Refresh the list
                } else {
                    toast.error(response.message || "Failed to delete event");
                }
            } catch (error) {
                console.error("Error deleting event:", error);
                toast.error(error.message || "Failed to delete event");
            }
        }
    };

    const handleToggleStatus = async (row) => {
        try {
            const newStatus = !row.isActive;
            const response = await swarnaBinduEventService.updateEventStatus(row._id, newStatus);
            
            if (response.success) {
                toast.success(`Event ${newStatus ? "activated" : "deactivated"} successfully`);
                fetchEvents(); // Refresh the list
            } else {
                toast.error(response.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error(error.message || "Failed to update status");
        }
    };

    // Filtered rows based on search (client-side filtering for search only)
    const filteredRows = useMemo(() => {
        if (!searchText) return rows;
        return rows.filter(item => {
            const searchMatch = 
                item.title.toLowerCase().includes(searchText.toLowerCase()) ||
                item.description.toLowerCase().includes(searchText.toLowerCase()) ||
                item.location.toLowerCase().includes(searchText.toLowerCase());
            return searchMatch;
        });
    }, [rows, searchText]);

    // Columns
    const columns = [
        { field: "slNo", header: "Sl. No." },
        { field: "title", header: "Title" },
        { 
            field: "description", 
            header: "Description",
            render: (row) => (
                <Typography variant="body2" sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.description || "N/A"}
                </Typography>
            ),
        },
        { field: "eventDate", header: "Date" },
        { field: "startTime", header: "Start Time" },
        { field: "endTime", header: "End Time" },
        { field: "location", header: "Location" },
        { field: "status", header: "Status" },
        { field: "updated", header: "Last Updated" },
    ];

    const actions = [
        {
            label: "Edit",
            icon: <EditIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: (row) => navigate(`/admin/swarna-bindu-events/edit/${row._id}`)
        },
        {
            icon: <ToggleIcon fontSize="small" />,
            label: 'Toggle Status',
            color: 'default',
            onClick: (row) => handleToggleStatus(row),
        },
        {
            label: "Delete",
            icon: <DeleteIcon fontSize="small" />,
            color: "#f44336",
            onClick: (row) => handleDelete(row._id)
        }
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Swarna Bindu Events"
                subtitle="Manage Swarna Bindu events and activities."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Swarna Bindu Events" }
                ]}
            />

            {/* SEARCH + FILTERS + EXPORT */}
            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{ width: "100%", marginBottom: "2rem" }}
            >
                {/* LEFT SIDE — Search + Filters */}
                <Box sx={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ width: "200px" }}
                    />
                    <TextField
                        select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        sx={{ minWidth: 150 }}
                        variant="outlined"
                        size="small"
                    >
                        <MenuItem value="All">All Status</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </TextField>
                </Box>

                {/* RIGHT SIDE — Export + Create */}
                <Box sx={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="swarna-bindu-events.xlsx"
                    />
                    <RedirectButton text="Create Event" link="/admin/swarna-bindu-events/add" />
                </Box>
            </CardBorder>

            <TableComponent
                title="Swarna Bindu Events List"
                subtitle={`${filteredRows.length} events found`}
                columns={columns}
                rows={filteredRows.map((row) => ({
                    ...row,
                    status: (
                        <Chip
                            label={row.status}
                            color={row.status === "Active" ? "success" : "default"}
                            size="small"
                        />
                    )
                }))}
                actions={actions}
                showAddButton={false}
                showExportButton={false}
                showView={false}
                showEdit={false}
                showDelete={false}
                showStatusBadge={false}
            />
        </Box>
    );
}

export default SwarnaBinduEvents_View;

