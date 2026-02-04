import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import { Box, CircularProgress, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";
import appointmentService from "../../../services/appointmentService";

function Consultations_View() {
    const navigate = useNavigate();
    const [consultations, setConsultations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "—";
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (error) {
            return "—";
        }
    };

    const formatFollowUpDate = (dateString) => {
        if (!dateString) return "None Scheduled";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "None Scheduled";
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (error) {
            return "None Scheduled";
        }
    };

    const fetchConsultations = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch all consultations (with a high limit for now, can be optimized later)
            const response = await appointmentService.getPatientConsultations({
                page: 1,
                limit: 1000, // Fetch all consultations for the patient
            });

            if (response && response.success) {
                const consultationsData = Array.isArray(response.data)
                    ? response.data
                    : [];

                // Transform data to match table format
                const transformedData = consultationsData.map((consultation) => {
                    // Get appointment date and time
                    const appointmentDate = consultation.appointmentDate
                        ? new Date(consultation.appointmentDate).toISOString().split("T")[0]
                        : "";

                    // Get patient name and ID
                    const patientName = consultation.patient?.user?.name || "N/A";
                    const patientId = consultation.patient?.user?.uhid || consultation.patient?.patientId || "N/A";

                    // Get doctor name - sanitize to avoid "Dr. Dr."
                    let rawDoctorName = consultation.doctor?.user?.name || "N/A";
                    const doctorName = rawDoctorName !== "N/A"
                        ? (rawDoctorName.toLowerCase().startsWith("dr.") ? rawDoctorName : `Dr. ${rawDoctorName}`)
                        : "N/A";

                    // Get chief complaint from examination or appointment notes
                    const chiefComplaint = consultation.chiefComplaint || consultation.notes || "Not specified";

                    // Get follow-up date
                    const followUpDate = consultation.followUpDate
                        ? formatFollowUpDate(consultation.followUpDate)
                        : "None Scheduled";

                    return {
                        _id: consultation._id,
                        patientName,
                        patientId,
                        doctor: doctorName,
                        date: appointmentDate,
                        complaint: chiefComplaint,
                        followup: followUpDate,
                        appointmentDate: consultation.appointmentDate,
                        appointmentTime: consultation.appointmentTime,
                        status: consultation.status,
                        examinationId: consultation.examination?._id,
                    };
                });

                setConsultations(transformedData);
            } else {
                toast.error(response?.message || "Failed to fetch consultations");
                setConsultations([]);
            }
        } catch (error) {
            console.error("Error fetching consultations:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch consultations";
            toast.error(errorMessage);
            setConsultations([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConsultations();
    }, [fetchConsultations]);

    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "patientId", header: "ID" },
        { field: "doctor", header: "Doctor" },
        {
            field: "date",
            header: "Date",
            render: (row) => formatDate(row.date)
        },
        { field: "appointmentTime", header: "Time" },
        { field: "complaint", header: "Chief Complaint" },
        { field: "followup", header: "Follow-up" },
    ];

    const handleViewConsultation = (consultation) => {
        if (consultation.examinationId) {
            // Navigate to examination details if available
            navigate(`/patient/consultations/${consultation._id}`);
        } else {
            // Show appointment details
            navigate(`/patient/consultations/${consultation._id}`);
        }
    };

    const actions = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            onClick: handleViewConsultation,
            tooltip: "View Consultation Details",
            color: "var(--color-primary)",
        },
    ];

    return (
        <div style={{ paddingBottom: 30 }}>
            <HeadingCard
                title="My Consultations"
                subtitle="Review your past and upcoming consultations along with follow-up details."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Consultations" }
                ]}
            />

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            ) : consultations.length === 0 ? (
                <Box sx={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    <Typography variant="h6" sx={{ marginBottom: 1 }}>
                        No Consultations Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        You don't have any consultations yet. Consultations will appear here once appointments are scheduled.
                    </Typography>
                </Box>
            ) : (
                <TableComponent
                    title="My Consultations"
                    columns={columns}
                    rows={consultations}
                    actions={actions}
                    showCheckbox={false}
                    showStatusBadge={false}
                />
            )}
        </div>
    );
}

export default Consultations_View;
