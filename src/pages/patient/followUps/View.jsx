import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, CircularProgress, Typography, Chip, Button } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import TableComponent from "../../../components/table/TableComponent";

function FollowUps_View() {
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [followUps, setFollowUps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // "all", "upcoming", "past"

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "—";
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch (error) {
            return "—";
        }
    };

    const getDaysUntil = (dateString) => {
        if (!dateString) return null;
        try {
            const followUpDate = new Date(dateString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            followUpDate.setHours(0, 0, 0, 0);

            const diffTime = followUpDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            return null;
        }
    };

    const fetchFollowUps = useCallback(async () => {
        // Get user ID from Redux or localStorage
        const userId = user?._id || JSON.parse(localStorage.getItem("user") || "{}")?._id;

        if (!userId) {
            setIsLoading(false);
            toast.error("User information not found. Please log in again.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                getApiUrl(`examinations/followups/by-user/${userId}`),
                {
                    method: "GET",
                    headers: getAuthHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch follow-ups");
            }

            const data = await response.json();
            if (data.success && data.data) {
                // Transform follow-ups to include all necessary info
                const allFollowUps = [];

                // Process items array
                if (data.data.items && Array.isArray(data.data.items)) {
                    data.data.items.forEach((item, index) => {
                        if (item.date) {
                            const daysUntil = getDaysUntil(item.date);
                            const isUpcoming = daysUntil !== null && daysUntil >= 0;

                            allFollowUps.push({
                                _id: item._id || `followup-${index}`,
                                followUpId: item.followUpId || null,
                                examinationId: item.examinationId || null,
                                date: item.date,
                                note: item.note || "",
                                daysUntil: daysUntil,
                                isUpcoming: isUpcoming,
                                status: item.completed ? "completed" : (isUpcoming ? "upcoming" : "past"),
                                patientName: item.patientName || "",
                                isFamilyMember: item.isFamilyMember || false,
                                completed: Boolean(item.completed),
                            });
                        }
                    });
                }

                // Sort by date (latest first for past, earliest first for upcoming)
                allFollowUps.sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // If both are upcoming, sort earliest first
                    if (a.isUpcoming && b.isUpcoming) {
                        return dateA - dateB;
                    }
                    // If both are past, sort latest first
                    if (!a.isUpcoming && !b.isUpcoming) {
                        return dateB - dateA;
                    }
                    // Upcoming comes before past
                    return a.isUpcoming ? -1 : 1;
                });

                setFollowUps(allFollowUps);
            } else {
                toast.error(data.message || "Failed to fetch follow-ups");
                setFollowUps([]);
            }
        } catch (error) {
            console.error("Error fetching follow-ups:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch follow-ups";
            toast.error(errorMessage);
            setFollowUps([]);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchFollowUps();
    }, [fetchFollowUps]);

    // Filter follow-ups based on selected filter
    const filteredFollowUps = useMemo(() => {
        if (filter === "all") return followUps;
        if (filter === "upcoming") return followUps.filter(fu => fu.isUpcoming);
        if (filter === "past") return followUps.filter(fu => !fu.isUpcoming);
        return followUps;
    }, [followUps, filter]);

    const getStatusColor = (status, daysUntil, completed) => {
        if (completed || status === "completed") return "success";
        if (status === "upcoming") {
            if (daysUntil === 0) return "error"; // Today
            if (daysUntil <= 3) return "warning"; // Within 3 days
            return "info";
        }
        return "default";
    };

    const getStatusLabel = (status, daysUntil, completed) => {
        if (completed || status === "completed") return "Completed";
        if (status === "upcoming") {
            if (daysUntil === 0) return "Today";
            if (daysUntil === 1) return "Tomorrow";
            return `In ${daysUntil} days`;
        }
        return "Past";
    };

    const upcomingCount = followUps.filter(fu => fu.isUpcoming).length;
    const pastCount = followUps.filter(fu => !fu.isUpcoming).length;

    const getTimelineDisplay = (daysUntil) => {
        if (daysUntil === null || daysUntil === undefined) return "—";
        if (daysUntil === 0) return "Today";
        if (daysUntil === 1) return "Tomorrow";
        if (daysUntil > 1) return `${daysUntil} days remaining`;
        return `${Math.abs(daysUntil)} days ago`;
    };

    const columns = [
        {
            field: "date",
            header: "Follow-up Date",
            render: (row) => formatDate(row.date),
        },
        {
            field: "patientName",
            header: "Patient",
            render: (row) => row.patientName || "Primary User",
        },
        {
            field: "status",
            header: "Status",
            render: (row) => (
                <Chip
                    label={getStatusLabel(row.status, row.daysUntil, row.completed)}
                    color={getStatusColor(row.status, row.daysUntil, row.completed)}
                    size="small"
                />
            ),
        },
        {
            field: "timeline",
            header: "Timeline",
            render: (row) => (
                <Chip
                    icon={<AccessTimeIcon fontSize="small" />}
                    label={getTimelineDisplay(row.daysUntil)}
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            field: "note",
            header: "Note",
            render: (row) => row.note?.trim() || "No additional notes",
        },
    ];

    const actions = [
        {
            render: (row) => (
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                        if (!row.examinationId || !row.followUpId) {
                            toast.error("Details are not available for this follow-up.");
                            return;
                        }
                        navigate(`/patient/follow-ups/${row.examinationId}/${row.followUpId}`);
                    }}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div style={{ paddingBottom: 30 }}>
            <HeadingCard
                title="My Follow Ups"
                subtitle="View all follow-up dates scheduled by your doctors. Stay on track with your health appointments."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "My Follow Ups" }
                ]}
            />

            {/* Filter Chips */}
            <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip
                    label={`All (${followUps.length})`}
                    onClick={() => setFilter("all")}
                    color={filter === "all" ? "primary" : "default"}
                    variant={filter === "all" ? "filled" : "outlined"}
                    sx={{ cursor: "pointer" }}
                />
                <Chip
                    label={`Upcoming (${upcomingCount})`}
                    onClick={() => setFilter("upcoming")}
                    color={filter === "upcoming" ? "primary" : "default"}
                    variant={filter === "upcoming" ? "filled" : "outlined"}
                    sx={{ cursor: "pointer" }}
                />
                <Chip
                    label={`Past (${pastCount})`}
                    onClick={() => setFilter("past")}
                    color={filter === "past" ? "primary" : "default"}
                    variant={filter === "past" ? "filled" : "outlined"}
                    sx={{ cursor: "pointer" }}
                />
            </Box>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            ) : filteredFollowUps.length === 0 ? (
                <Box sx={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    <Typography variant="h6" sx={{ marginBottom: 1 }}>
                        No Follow-ups Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filter === "upcoming"
                            ? "You don't have any upcoming follow-ups scheduled."
                            : filter === "past"
                                ? "You don't have any past follow-ups."
                                : "You don't have any follow-ups scheduled yet. Follow-ups will appear here once your doctors schedule them."}
                    </Typography>
                </Box>
            ) : (
                <TableComponent
                    columns={columns}
                    rows={filteredFollowUps}
                    actions={actions}
                    showCheckbox={false}
                />
            )}
        </div>
    );
}

export default FollowUps_View;

