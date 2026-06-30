import { useState, useMemo, useEffect, useCallback } from "react";
import { Box, Stack, Button, CircularProgress, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HealingIcon from "@mui/icons-material/Healing";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import DeleteIcon from "@mui/icons-material/Delete";
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
    const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 25, total: 0 });
    const navigate = useNavigate();

    const fetchTherapies = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = { page: pagination.page + 1, limit: pagination.rowsPerPage };
            if (searchText && searchText.trim()) params.search = searchText.trim();

            const response = await axios.get(
                getApiUrl("examinations/therapy-plans/opd"),
                { headers: getAuthHeaders(), params }
            );

            if (response.data.success) {
                const therapyData = response.data.data || [];
                const total = response.data.meta?.total ?? 0;
                setPagination((prev) => ({ ...prev, total }));

                const groupedByExamination = {};

                therapyData.forEach((therapy) => {
                    const patientId = therapy.examination?.patient?._id?.toString() || therapy.examination?.patient?.toString();
                    const patientUhid = therapy.examination?.patient?.user?.uhid || therapy.examination?.patient?.patientId || "N/A";
                    // Group by the specific examination (visit) so a patient with multiple
                    // visits on the same day appears as separate rows. Fall back to patient
                    // (or therapy id) for legacy plans without an examination link.
                    const examinationId = therapy.examination?._id?.toString() || therapy.examination?.toString();
                    const key = examinationId || patientId || therapy._id;

                    if (!groupedByExamination[key]) {
                        groupedByExamination[key] = {
                            _id: key, // Use examination ID as the row ID
                            examinationId: examinationId || null,
                            patientName: therapy.examination?.patient?.user?.name || "Unknown",
                            patientUhid: patientUhid,
                            patientId: patientId,
                            isFamilyMember: therapy.examination?.patient?.isFamilyMember || false,
                            primaryPatientName: therapy.examination?.patient?.primaryPatientName || null,
                            relation: therapy.examination?.patient?.relation || null,
                            therapyDate: therapy.createdAt
                                ? new Date(therapy.createdAt).toISOString().split("T")[0]
                                : new Date().toISOString().split("T")[0],
                            therapies: [], // Array to store all therapies for this visit
                        };
                    }

                    // Add this therapy to the visit's list
                    groupedByExamination[key].therapies.push({
                        _id: therapy._id,
                        treatmentName: therapy.treatmentName || "N/A",
                        daysOfTreatment: therapy.daysOfTreatment || 0,
                        therapistName: (therapy.therapists && therapy.therapists.length > 0)
                            ? therapy.therapists.map(t => t.user?.name || t.name || "Unknown").join(", ")
                            : therapy.therapist?.user?.name || "Not Assigned",
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
                        if (therapyDate > groupedByExamination[key].therapyDate) {
                            groupedByExamination[key].therapyDate = therapyDate;
                        }
                    }
                });

                // Convert grouped object to array
                const groupedTherapies = Object.values(groupedByExamination);

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
    }, [pagination.page, pagination.rowsPerPage, searchText]);

    useEffect(() => {
        fetchTherapies();
    }, [fetchTherapies]);

    const handlePageChange = (newPage) => setPagination((prev) => ({ ...prev, page: newPage }));
    const handleRowsPerPageChange = (newRowsPerPage) =>
        setPagination((prev) => ({ ...prev, rowsPerPage: newRowsPerPage, page: 0 }));
    const onSearchChange = (val) => {
        setSearchText(val);
        setPagination((prev) => ({ ...prev, page: 0 }));
    };

    const displayedTherapies = therapies;

    // Calculate statistics
    const stats = useMemo(() => {
        const totalTherapies = therapies.reduce((sum, t) => sum + (t.therapies?.length || 0), 0);
        return {
            total: pagination.total,
            alternateDay: therapies.reduce((sum, t) => sum + (t.therapies?.filter(th => th.timeline === "AlternateDay").length || 0), 0),
            weekly: therapies.reduce((sum, t) => sum + (t.therapies?.filter(th => th.timeline === "Weekly").length || 0), 0),
            daily: therapies.reduce((sum, t) => sum + (t.therapies?.filter(th => th.timeline === "Daily").length || 0), 0),
        };
    }, [therapies, pagination.total]);

    const columns = [
        {
            field: "patientName",
            header: "Patient Name",
            render: (row) => (
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <span>{row.patientName}</span>
                        {row.isFamilyMember && row.primaryPatientName && (
                            <Chip
                                label={`Family member of ${row.primaryPatientName}${row.relation ? ` (${row.relation})` : ``}`}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem", height: "20px" }}
                            />
                        )}
                    </Stack>
                </Box>
            ),
        },
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
                        {[...row.therapies]
                            .sort((a, b) =>
                                (a.treatmentName || "").localeCompare(b.treatmentName || "")
                            )
                            .map((therapy, idx) => (
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
            {
                icon: <DeleteIcon fontSize="small" />,
                color: "#d32f2f",
                tooltip: "Delete Therapy",
                onClick: async (row) => {
                    if (!row.therapies || row.therapies.length === 0) {
                        toast.info("No therapies found for this patient");
                        return;
                    }

                    const therapyCount = row.therapies.length;
                    const confirmMessage = therapyCount > 1
                        ? `Delete all ${therapyCount} therapy plans for ${row.patientName}? This cannot be undone.`
                        : `Delete this therapy plan for ${row.patientName}? This cannot be undone.`;

                    const confirmed = window.confirm(confirmMessage);
                    if (!confirmed) return;

                    try {
                        await Promise.all(
                            row.therapies.map((therapy) =>
                                axios.delete(
                                    getApiUrl(`examinations/therapy-plans/opd/${therapy._id}`),
                                    { headers: getAuthHeaders() }
                                )
                            )
                        );

                        toast.success(
                            therapyCount > 1
                                ? `${therapyCount} therapy plans deleted successfully`
                                : "Therapy plan deleted successfully"
                        );
                        fetchTherapies();
                    } catch (error) {
                        console.error("Error deleting therapy plan(s):", error);
                        toast.error(error.response?.data?.message || "Failed to delete therapy plan");
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
            Daily: "warning",
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
                <DashboardCard title="Alternate Day" count={stats.alternateDay} icon={HealingIcon} />
                <DashboardCard title="Weekly" count={stats.weekly} icon={HealingIcon} />
                <DashboardCard title="Daily" count={stats.daily} icon={HealingIcon} />
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
                    <Search value={searchText} onChange={onSearchChange} style={{ width: "100%" }} />
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <ExportDataButton
                        rows={displayedTherapies}
                        columns={columns}
                        fileName="opd-therapies.xlsx"
                    />
                    <RedirectButton text="Add Therapy Plan" link="/doctor/opd-therapies/new" />
                </div>
            </CardBorder>

            {/* Table - client-side pagination same as in-patients */}
            <TableComponent
                title="OPD Therapy Plans"
                columns={columns}
                rows={displayedTherapies.map((row) => ({
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
                serverSidePagination={true}
                totalCount={pagination.total}
                page={pagination.page}
                rowsPerPage={pagination.rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
            />
        </Box>
    );
}

export default OPDTherapies_View;


