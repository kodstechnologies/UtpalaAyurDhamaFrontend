import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, CircularProgress, Typography, Chip, Card, CardContent, Grid } from "@mui/material";
import { Calendar, Clock, User, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function FollowUps_View() {
    const user = useSelector((state) => state.auth.user);
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

    const formatDateTime = (dateString) => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "—";
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
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
                                _id: `followup-${index}`,
                                date: item.date,
                                note: item.note || "",
                                daysUntil: daysUntil,
                                isUpcoming: isUpcoming,
                                status: item.completed ? "completed" : (isUpcoming ? "upcoming" : "past"),
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

    const getStatusColor = (status, daysUntil) => {
        if (status === "completed") return "success";
        if (status === "upcoming") {
            if (daysUntil === 0) return "error"; // Today
            if (daysUntil <= 3) return "warning"; // Within 3 days
            return "info";
        }
        return "default";
    };

    const getStatusLabel = (status, daysUntil) => {
        if (status === "completed") return "Completed";
        if (status === "upcoming") {
            if (daysUntil === 0) return "Today";
            if (daysUntil === 1) return "Tomorrow";
            return `In ${daysUntil} days`;
        }
        return "Past";
    };

    const upcomingCount = followUps.filter(fu => fu.isUpcoming).length;
    const pastCount = followUps.filter(fu => !fu.isUpcoming).length;

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
                <Grid container spacing={3}>
                    {filteredFollowUps.map((followUp) => (
                        <Grid item xs={12} sm={6} md={4} key={followUp._id}>
                            <Card
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    transition: "all 0.3s ease",
                                    border: followUp.isUpcoming && followUp.daysUntil <= 3
                                        ? "2px solid"
                                        : "1px solid",
                                    borderColor: followUp.isUpcoming && followUp.daysUntil <= 3
                                        ? "warning.main"
                                        : "divider",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 4,
                                    },
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    {/* Status Badge */}
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                        <Chip
                                            icon={
                                                followUp.status === "completed" ? (
                                                    <CheckCircle2 size={16} />
                                                ) : followUp.isUpcoming && followUp.daysUntil <= 3 ? (
                                                    <AlertCircle size={16} />
                                                ) : (
                                                    <Calendar size={16} />
                                                )
                                            }
                                            label={getStatusLabel(followUp.status, followUp.daysUntil)}
                                            color={getStatusColor(followUp.status, followUp.daysUntil)}
                                            size="small"
                                        />
                                    </Box>

                                    {/* Date */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                        <Calendar size={20} style={{ color: "var(--color-primary)" }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {formatDate(followUp.date)}
                                        </Typography>
                                    </Box>

                                    {/* Days Until / Days Ago */}
                                    {followUp.daysUntil !== null && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography
                                                variant="body2"
                                                color={
                                                    followUp.isUpcoming
                                                        ? followUp.daysUntil <= 3
                                                            ? "warning.main"
                                                            : "text.secondary"
                                                        : "text.secondary"
                                                }
                                                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                                            >
                                                <Clock size={16} />
                                                {followUp.isUpcoming
                                                    ? followUp.daysUntil === 0
                                                        ? "Today"
                                                        : followUp.daysUntil === 1
                                                        ? "Tomorrow"
                                                        : `${followUp.daysUntil} days remaining`
                                                    : `${Math.abs(followUp.daysUntil)} days ago`}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Note */}
                                    {followUp.note && (
                                        <Box
                                            sx={{
                                                mt: 2,
                                                p: 1.5,
                                                bgcolor: "action.hover",
                                                borderRadius: 1,
                                                display: "flex",
                                                gap: 1,
                                            }}
                                        >
                                            <FileText size={18} style={{ color: "var(--color-text-secondary)", flexShrink: 0, marginTop: 2 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {followUp.note}
                                            </Typography>
                                        </Box>
                                    )}

                                    {!followUp.note && (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mt: 2 }}>
                                            No additional notes
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
}

export default FollowUps_View;

