import { useState, useMemo, useEffect, useCallback } from "react";
import { Box, Stack, Chip, CircularProgress, TextField, MenuItem } from "@mui/material";
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
import MedicationIcon from "@mui/icons-material/Medication";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import prescriptionService from "../../../services/prescriptionService";

function OPConsultation_View() {
    const [consultations, setConsultations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("All");
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 25,
        total: 0,
    });
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // Fetch appointments from API (server-side pagination, search, status)
    const fetchAppointments = useCallback(async () => {
        if (!user?._id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const params = {
                page: pagination.page + 1,
                limit: pagination.rowsPerPage,
            };
            if (searchText && searchText.trim()) params.search = searchText.trim();
            if (filter && filter !== "All") params.status = filter;

            const response = await axios.get(
                getApiUrl("appointments"),
                {
                    headers: getAuthHeaders(),
                    params,
                }
            );

            if (response.data.success) {
                const rawData = response.data.data || [];
                const total = response.data.meta?.total ?? rawData.length;
                // Exclude cancelled / no-show from display only (backend may still return them)
                const appointments = rawData.filter(
                    appt => appt.status !== "Cancelled" && appt.status !== "No Show"
                );

                console.log("Fetched Appointments:", appointments); // Debug log to inspect structure

                // Check for examinations for each appointment; exclude patients converted to IPD
                const consultationsWithExamination = await Promise.all(
                    appointments.map(async (appointment) => {
                        let hasExamination = false;
                        let examinationId = null;
                        let isAdmitted = false;

                        try {
                            const examResponse = await axios.get(
                                getApiUrl(`examinations/by-appointment/${appointment._id}`),
                                { headers: getAuthHeaders() }
                            );
                            if (examResponse.data.success && examResponse.data.data) {
                                const exam = examResponse.data.data;
                                // Exclude if patient was converted to IPD (examination linked to inpatient)
                                if (exam.inpatient && exam.inpatient.status !== "ConvertedToOPD") {
                                    isAdmitted = true;
                                }
                                else {
                                    hasExamination = true;
                                    examinationId = exam._id;
                                }
                            }
                        } catch (error) {
                            // No examination found (404) is expected, not an error
                            if (error.response?.status !== 404) {
                                console.error("Error checking examination:", error);
                            }
                        }

                        return {
                            _id: appointment._id,
                            patientName: appointment.patient?.user?.name || appointment.receptionPatient?.patientName || "N/A",
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
                            isFamilyMember: appointment.isFamilyMember || false,
                            familyMemberOf: appointment.familyMemberOf || null,
                            relation: appointment.relation || null,
                            // Store full appointment object for navigation
                            fullAppointment: appointment,
                            isAdmitted, // Initial check based on examination link
                        };
                    })
                );

                // For patients marked as inpatient but without an examination link, verify their active status
                const finalConsultations = await Promise.all(
                    consultationsWithExamination.map(async (c) => {
                        let activelyAdmitted = c.isAdmitted;

                        // If they weren't admitted via examination, but their profile says they are an inpatient
                        if (!activelyAdmitted && c.fullAppointment?.patient?.inpatient === true) {
                            try {
                                const patientId = c.fullAppointment.patient._id || c.fullAppointment.patient;
                                const inpatientResponse = await axios.get(
                                    getApiUrl(`inpatients/patient/${patientId}`),
                                    { headers: getAuthHeaders() }
                                );

                                if (inpatientResponse.data.success && inpatientResponse.data.data?.length > 0) {
                                    // Check if they have an active admission (not discharged, not converted)
                                    const activeRecords = inpatientResponse.data.data.filter(
                                        record => record.status !== "Discharged" && record.status !== "ConvertedToOPD"
                                    );

                                    if (activeRecords.length > 0) {
                                        activelyAdmitted = true;
                                    }
                                }
                            } catch (e) {
                                console.error("Error verifying inpatient status:", e);
                            }
                        }

                        return { ...c, isAdmitted: activelyAdmitted };
                    })
                );

                // Exclude patients converted to IPD (should appear in In Patients, not OP Consultation)
                const opdOnly = finalConsultations.filter((c) => !c.isAdmitted);

                setConsultations(opdOnly);
                setPagination((prev) => ({ ...prev, total }));
            } else {
                toast.error(response.data.message || "Failed to fetch appointments");
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch appointments");
        } finally {
            setIsLoading(false);
        }
    }, [user, pagination.page, pagination.rowsPerPage, searchText, filter]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };
    const handleRowsPerPageChange = (newRowsPerPage) => {
        setPagination((prev) => ({ ...prev, rowsPerPage: newRowsPerPage, page: 0 }));
    };

    // Reset to first page when search or filter changes
    const onSearchChange = (val) => {
        setSearchText(val);
        setPagination((prev) => ({ ...prev, page: 0 }));
    };
    const onFilterChange = (btn) => {
        setFilter(btn);
        setPagination((prev) => ({ ...prev, page: 0 }));
    };

    // Display rows (search/status applied on server)
    const displayedConsultations = consultations;

    // Stats from current page data (for cards)
    const stats = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        return {
            total: pagination.total,
            today: consultations.filter((c) => c.appointmentDate === today).length,
            scheduled: consultations.filter((c) => c.status === "Scheduled").length,
            completed: consultations.filter((c) => c.status === "Completed").length,
        };
    }, [consultations, pagination.total]);

    const columns = [
        {
            field: "patientName",
            header: "Patient Name",
            render: (rowData) => {
                const name = rowData.patientName || rowData.fullAppointment?.patient?.user?.name || "N/A";
                const isFamilyMember = rowData.isFamilyMember || rowData.fullAppointment?.isFamilyMember;
                const familyMemberOf = rowData.familyMemberOf || rowData.fullAppointment?.familyMemberOf;

                return (
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <span>{name}</span>
                            {isFamilyMember && familyMemberOf && (
                                <Chip
                                    label={`Family member of ${familyMemberOf}${rowData.relation ? ` (${rowData.relation})` : ``}`}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                    sx={{ fontSize: "0.7rem", height: "20px" }}
                                />
                            )}
                        </Stack>
                    </Box>
                );
            }
        },
        { field: "patientId", header: "UHID" },
        { field: "appointmentDate", header: "Date" },
        { field: "appointmentTime", header: "Time" },
        { field: "phoneNumber", header: "Phone Number" },
    ];

    const handleOpenPrescription = async (row) => {
        if (!row.hasExamination || !row.examinationId) {
            toast.error("Please add an examination before opening prescription.");
            return;
        }

        try {
            const response = await prescriptionService.getPrescriptionsByExamination(row.examinationId);
            const prescriptions = response?.data || [];

            if (response?.success && prescriptions.length > 0) {
                navigate(`/doctor/prescriptions/edit/${prescriptions[0]._id}`);
                return;
            }

            const patientProfileId = row.fullAppointment?.patient?._id;
            const name = row.patientName || "";
            if (!patientProfileId) {
                toast.error("Patient profile not found.");
                return;
            }

            navigate(
                `/doctor/prescriptions/new?patientId=${patientProfileId}&patientName=${encodeURIComponent(name)}`
            );
        } catch (error) {
            console.error("Error opening prescription:", error);
            toast.error(error?.message || error.response?.data?.message || "Failed to open prescription");
        }
    };

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

        actionsList.push({
            icon: <MedicationIcon fontSize="small" />,
            color: "var(--color-success)",
            label: "Prescription",
            title: "Open Prescription",
            onClick: handleOpenPrescription,
        });

        return actionsList;
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
                        onChange={onSearchChange}
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <ExportDataButton
                        rows={displayedConsultations}
                        columns={columns}
                        fileName="op-consultations.xlsx"
                    />
                    <TextField
                        select
                        value={filter}
                        onChange={(e) => onFilterChange(e.target.value)}
                        sx={{
                            width: { xs: "100%", sm: 220 },
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                bgcolor: "white",
                                height: 46,
                            },
                        }}
                        size="small"
                    >
                        <MenuItem value="All">All Status</MenuItem>
                        <MenuItem value="Scheduled">Scheduled</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                    </TextField>
                </div>
            </CardBorder>

            {/* Table - server-side pagination same as in-patients */}
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableComponent
                    title="OP Consultations"
                    columns={columns}
                    rows={displayedConsultations}
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
            )}
        </Box>
    );
}

export default OPConsultation_View;

