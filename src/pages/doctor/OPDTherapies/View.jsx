import { useState, useMemo, useEffect } from "react";
import { Box, Stack, Button, CircularProgress, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HealingIcon from "@mui/icons-material/Healing";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import axios from "axios";
import { toast } from "react-toastify";
import PsychologyIcon from "@mui/icons-material/Psychology";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import RedirectButton from "../../../components/buttons/RedirectButton";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function OPDTherapies_View() {
    const [therapies, setTherapies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("All");
    const navigate = useNavigate();

    // Fetch OPD therapy plans from backend
    useEffect(() => {
        const fetchTherapies = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    getApiUrl("examinations/therapy-plans/opd"),
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    const therapyData = response.data.data || [];

                    // Group therapies by patient
                    const groupedByPatient = {};
                    
                    therapyData.forEach((therapy) => {
                        const patientId = therapy.examination?.patient?._id?.toString() || therapy.examination?.patient?.toString();
                        const patientUhid = therapy.examination?.patient?.user?.uhid || therapy.examination?.patient?.patientId || "N/A";
                        const key = patientId || patientUhid;
                        
                        if (!groupedByPatient[key]) {
                            groupedByPatient[key] = {
                                _id: key, // Use patient ID as the row ID
                                patientName: therapy.examination?.patient?.user?.name || "Unknown",
                                patientUhid: patientUhid,
                                patientId: patientId,
                                therapyDate: therapy.createdAt
                            ? new Date(therapy.createdAt).toISOString().split("T")[0]
                                    : new Date().toISOString().split("T")[0],
                                therapies: [], // Array to store all therapies for this patient
                            };
                        }
                        
                        // Add this therapy to the patient's list
                        groupedByPatient[key].therapies.push({
                            _id: therapy._id,
                            treatmentName: therapy.treatmentName || "N/A",
                            daysOfTreatment: therapy.daysOfTreatment || 0,
                            timeline: therapy.timeline || "AlternateDay",
                            specialInstructions: therapy.specialInstructions || "",
                            examinationId: therapy.examination?._id || null,
                            sessionId: therapy.sessionId || null,
                            createdAt: therapy.createdAt,
                            rawData: therapy,
                        });
                        
                        // Update date to the latest therapy date
                        if (therapy.createdAt) {
                            const therapyDate = new Date(therapy.createdAt).toISOString().split("T")[0];
                            if (therapyDate > groupedByPatient[key].therapyDate) {
                                groupedByPatient[key].therapyDate = therapyDate;
                            }
                        }
                    });
                    
                    // Convert grouped object to array
                    const groupedTherapies = Object.values(groupedByPatient);

                    setTherapies(groupedTherapies);
                } else {
                    toast.error(response.data.message || "Failed to fetch therapy plans");
                }
            } catch (error) {
                console.error("Error fetching therapy plans:", error);
                toast.error(error.response?.data?.message || "Error fetching therapy plans");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTherapies();
    }, []);

    // Filter therapies
    const filteredTherapies = useMemo(() => {
        return therapies.filter((therapy) => {
            // Check if any treatment in the therapies array matches search
            const treatmentsMatch = therapy.therapies?.some(t => 
                t.treatmentName?.toLowerCase().includes(searchText.toLowerCase())
            ) || false;
            
            const searchMatch =
                searchText === "" ||
                therapy.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
                therapy.patientUhid.toLowerCase().includes(searchText.toLowerCase()) ||
                treatmentsMatch;

            return searchMatch;
        });
    }, [therapies, searchText]);

    // Calculate statistics
    const stats = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        // Count total therapies (not grouped rows)
        const totalTherapies = therapies.reduce((sum, t) => sum + (t.therapies?.length || 0), 0);
        return {
            total: totalTherapies,
            today: therapies.filter((t) => t.therapyDate === today).length,
            alternateDay: therapies.reduce((sum, t) => sum + (t.therapies?.filter(th => th.timeline === "AlternateDay").length || 0), 0),
            weekly: therapies.reduce((sum, t) => sum + (t.therapies?.filter(th => th.timeline === "Weekly").length || 0), 0),
        };
    }, [therapies]);

    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "patientUhid", header: "UHID" },
        { field: "therapyDate", header: "Date" },
        { 
            field: "treatmentName", 
            header: "Treatments",
            render: (row) => {
                if (!row.therapies || row.therapies.length === 0) {
                    return "N/A";
                }
                return (
                    <Box sx={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(4, max-content)",
                        gap: 0.5,
                        maxWidth: "100%",
                    }}>
                        {row.therapies.map((therapy, idx) => (
                            <Chip
                                key={idx}
                                label={therapy.treatmentName}
                                size="small"
                                sx={{
                                    backgroundColor: "var(--color-bg-a)",
                                    color: "var(--color-text-dark)",
                                    fontSize: "0.75rem",
                                    maxWidth: "fit-content",
                                }}
                            />
                        ))}
                    </Box>
                );
            }
        },
        { 
            field: "daysOfTreatment", 
            header: "Total Days",
            render: (row) => {
                if (!row.therapies || row.therapies.length === 0) {
                    return "N/A";
                }
                const totalDays = row.therapies.reduce((sum, t) => sum + (t.daysOfTreatment || 0), 0);
                return totalDays;
            }
        },
    ];

    const getActions = (row) => {
        const actions = [
            {
                icon: <VisibilityIcon fontSize="small" />,
                color: "var(--color-info)",
                tooltip: "View Details",
                onClick: (row) => {
                    // Navigate to view page showing all therapies for this patient
                    // Use the first therapy ID to view details
                    if (row.therapies && row.therapies.length > 0) {
                        navigate(`/doctor/opd-therapies/${row.therapies[0]._id}`);
                    } else {
                        toast.info("No therapies found for this patient");
                    }
                },
            },
            {
                icon: <EditIcon fontSize="small" />,
                color: "var(--color-warning)",
                tooltip: "Edit Therapy",
                onClick: (row) => {
                    // Navigate to edit page for the first therapy
                    if (row.therapies && row.therapies.length > 0) {
                        navigate(`/doctor/opd-therapies/edit/${row.therapies[0]._id}`, {
                            state: { therapyData: row.therapies[0].rawData }
                        });
                    } else {
                        toast.info("No therapies found for this patient");
                    }
                },
            },
        ];

        // Add progress tracker button if sessionId exists
        if (row.therapies && row.therapies.length > 0) {
            const firstTherapy = row.therapies[0];
            if (firstTherapy.sessionId) {
                actions.push({
                    icon: <PersonIcon fontSize="small" />,
                    color: "var(--color-success)",
                    tooltip: "Track Progress",
                    onClick: (row) => {
                        navigate(`/doctor/therapy-execution/${firstTherapy.sessionId}`);
                    },
                });
            }
        }

        return actions;
    };

    const getTimelineBadge = (timeline) => {
        const colors = {
            AlternateDay: "info",
            Weekly: "success",
        };
        return <Chip label={timeline} color={colors[timeline] || "default"} size="small" />;
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <HeadingCard
                title="OPD Therapies"
                subtitle="Manage and view OPD patient therapy plans"
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "OP Consultation", url: "/doctor/op-consultation" },
                    { label: "OPD Therapies" },
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
                <DashboardCard title="Total Therapies" count={stats.total} icon={HealingIcon} />
                <DashboardCard title="Today's Therapies" count={stats.today} icon={EventIcon} />
                <DashboardCard title="Alternate Day" count={stats.alternateDay} icon={HealingIcon} />
                <DashboardCard title="Weekly" count={stats.weekly} icon={HealingIcon} />
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
                        rows={filteredTherapies}
                        columns={columns}
                        fileName="opd-therapies.xlsx"
                    />
                    <RedirectButton text="Add Therapy Plan" link="/doctor/opd-therapies/new" />
                </div>
            </CardBorder>

            {/* Table */}
            <TableComponent
                title="OPD Therapy Plans"
                columns={columns}
                rows={filteredTherapies.map((row) => ({
                    ...row,
                    timeline: getTimelineBadge(row.timeline),
                }))}
                actions={getActions}
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
                showExportButton={false}
                showCheckbox={false}
            />
        </Box>
    );
}

export default OPDTherapies_View;


