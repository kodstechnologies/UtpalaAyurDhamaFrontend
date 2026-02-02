import { useState, useMemo, useEffect, useCallback } from "react";
import { Box, Stack, Button, Chip, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { toast } from "react-toastify";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";

function OPConsultation_View() {
    const [consultations, setConsultations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("All");
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // Fetch appointments from API
    const fetchAppointments = useCallback(async () => {
        if (!user?._id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl("appointments"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000, // Get all appointments for now
                        // userId is automatically used if user is Doctor (handled in backend)
                    },
                }
            );

            if (response.data.success) {
                // Transform API response to match frontend table structure
                const appointments = (response.data.data || []).filter(
                    appt => appt.status !== "Cancelled" && appt.status !== "No Show"
                );

                // Check for examinations for each appointment
                const consultationsWithExamination = await Promise.all(
                    appointments.map(async (appointment) => {
                        let hasExamination = false;
                        let examinationId = null;

                        try {
                            const examResponse = await axios.get(
                                getApiUrl(`examinations/by-appointment/${appointment._id}`),
                                { headers: getAuthHeaders() }
                            );
                            if (examResponse.data.success && examResponse.data.data) {
                                hasExamination = true;
                                examinationId = examResponse.data.data._id;
                            }
                        } catch (error) {
                            // No examination found (404) is expected, not an error
                            if (error.response?.status !== 404) {
                                console.error("Error checking examination:", error);
                            }
                        }

                        return {
                            _id: appointment._id,
                            patientName: appointment.patient?.user?.name || "N/A",
                            patientId: appointment.patient?.user?.uhid || appointment.patient?.patientId || appointment.patient?._id || "N/A",
                            appointmentDate: appointment.appointmentDate
                                ? new Date(appointment.appointmentDate).toISOString().split("T")[0]
                                : "N/A",
                            appointmentTime: appointment.appointmentTime || "N/A",
                            phoneNumber: appointment.patient?.user?.phone || appointment.receptionPatient?.contactNumber || "N/A",
                            chiefComplaint: appointment.notes || appointment.receptionPatient?.complaints || "N/A", // Keep for search functionality
                            status: appointment.status || "Scheduled",
                            contact: appointment.patient?.user?.phone || appointment.receptionPatient?.contactNumber || "N/A",
                            patientUserId: appointment.patient?.user?._id || null, // For navigation to examination
                            hasExamination, // Flag indicating if examination exists
                            examinationId, // Examination ID if exists
                            // Store full appointment object for navigation
                            fullAppointment: appointment,
                        };
                    })
                );

                setConsultations(consultationsWithExamination);
            } else {
                toast.error(response.data.message || "Failed to fetch appointments");
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch appointments");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

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
        { field: "patientId", header: "UHID" },
        { field: "appointmentDate", header: "Date" },
        { field: "appointmentTime", header: "Time" },
        { field: "phoneNumber", header: "Phone Number" },
        { field: "status", header: "Status" },
    ];

    // Dynamic actions - always show View Details button (like IPD patients)
    const getActions = (row) => {
        const actionsList = [];

        // ALWAYS show "View Details" button first (like IPD patients)
        actionsList.push({
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-info)",
            label: "View Details",
            title: row.hasExamination ? "View Examination Details" : "View Appointment Details",
            onClick: (row) => {
                if (row.hasExamination && row.examinationId) {
                    // Examination exists - navigate to examination details page
                    navigate(`/doctor/examination-details/${row.examinationId}`, {
                        state: {
                            examinationId: row.examinationId,
                            appointment: row.fullAppointment || {
                                _id: row._id,
                                appointmentDate: row.appointmentDate,
                                appointmentTime: row.appointmentTime,
                                notes: row.chiefComplaint,
                                status: row.status,
                            },
                        },
                        replace: false
                    });
                } else {
                    // No examination - navigate to add-examination page (which will show form)
                    const patientId = row.patientUserId || row.patientId;
                    if (!patientId) {
                        toast.error("Patient ID not found. Cannot navigate to examination.");
                        return;
                    }
                    const appointmentData = row.fullAppointment || {
                        _id: row._id,
                        appointmentDate: row.appointmentDate,
                        appointmentTime: row.appointmentTime,
                        notes: row.chiefComplaint,
                        status: row.status,
                    };
                    navigate(`/doctor/add-examination/${patientId}`, {
                        state: {
                            appointment: appointmentData,
                            appointmentId: row._id
                        }
                    });
                }
            },
        });

        // Add Edit/Add button based on whether examination exists
        if (row.hasExamination && row.examinationId) {
            // Examination exists - show Edit Examination button
            actionsList.push({
                icon: <EditIcon fontSize="small" />,
                color: "var(--color-warning)",
                label: "Edit Examination",
                title: "Edit Examination",
                onClick: (row) => {
                    const appointmentData = row.fullAppointment || {
                        _id: row._id,
                        appointmentDate: row.appointmentDate,
                        appointmentTime: row.appointmentTime,
                        notes: row.chiefComplaint,
                        status: row.status,
                    };
                    navigate(`/doctor/edit-examination/${row.examinationId}`, {
                        state: {
                            examinationId: row.examinationId,
                            appointment: appointmentData,
                        }
                    });
                },
            });
        } else {
            // No examination - show Add Examination button
            actionsList.push({
                icon: <PersonIcon fontSize="small" />,
                color: "var(--color-primary)",
                label: "Add Examination",
                title: "Add Examination",
                onClick: (row) => {
                    const patientId = row.patientUserId || row.patientId;
                    if (!patientId) {
                        toast.error("Patient ID not found. Cannot navigate to examination.");
                        return;
                    }
                    const appointmentData = row.fullAppointment || {
                        _id: row._id,
                        appointmentDate: row.appointmentDate,
                        appointmentTime: row.appointmentTime,
                        notes: row.chiefComplaint,
                        status: row.status,
                    };
                    navigate(`/doctor/add-examination/${patientId}`, {
                        state: {
                            appointment: appointmentData,
                            appointmentId: row._id
                        }
                    });
                },
            });
        }

        return actionsList;
    };

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
                {["All", "Scheduled", "Completed"].map((btn) => (
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
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableComponent
                    title="OP Consultations"
                    columns={columns}
                    rows={filteredConsultations.map((row) => ({
                        ...row,
                        status: getStatusBadge(row.status),
                    }))}
                    actions={getActions}
                    showView={false}
                    showEdit={false}
                    showDelete={false}
                    showAddButton={false}
                    showExportButton={false}
                    showCheckbox={false}
                />
            )}
        </Box>
    );
}

export default OPConsultation_View;

