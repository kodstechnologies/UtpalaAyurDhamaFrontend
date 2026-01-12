import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";
import ReportCard from "../../../components/card/patientCard/ReportCard";
import invoiceService from "../../../services/invoiceService";

function Reports_View() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await invoiceService.getPatientReports();
            if (response && response.success && response.data) {
                const formattedReports = response.data.map((report) => {
                    // Format dates
                    const consultationDate = report.consultationDate
                        ? new Date(report.consultationDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })
                        : "N/A";
                    const uploadedDate = report.uploadedDate
                        ? new Date(report.uploadedDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })
                        : "N/A";

                    return {
                        ...report,
                        consultationDate,
                        uploadedDate,
                    };
                });
                setReports(formattedReports);
            } else {
                setReports([]);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch reports.");
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewReport = (report) => {
        // Navigate to appropriate detail page based on report type
        if (report.type === "invoice") {
            // Navigate to patient invoice detail page with ID
            navigate(`/patient/reports/invoice/${report._id}`);
        } else if (report.type === "prescription") {
            // Navigate to consultation details using examination ID
            if (report.examinationId) {
                navigate(`/patient/consultations/${report.examinationId}`);
            } else {
                // If no examination ID, navigate to consultations list
                navigate(`/patient/consultations`);
            }
        } else if (report.type === "examination") {
            // Navigate to consultation details
            navigate(`/patient/consultations/${report.examinationId || report._id}`);
        } else {
            // Default: navigate to invoice detail if invoice number exists
            if (report.invoiceNumber) {
                navigate(`/patient/reports/invoice/${report._id}`);
            }
        }
    };

    return (
        <div style={{ paddingBottom: 30 }}>
            <HeadingCard
                title="My Medical Reports"
                subtitle="Access and review your diagnostic test results, clinical summaries, and past medical documents all in one place. Stay informed and track your health history effortlessly."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Medical Reports" }
                ]}
            />

            {/* Loading State */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Reports List */}
            {!loading && (
                <div style={{ marginTop: 20 }}>
                    {reports.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: "center", bgcolor: "var(--color-bg-card)", borderRadius: 2, border: "1px solid var(--color-border)" }}>
                            <Typography sx={{ color: "var(--color-text-muted)" }}>
                                No medical reports found. Reports will appear here once they are generated.
                            </Typography>
                        </Box>
                    ) : (
                        reports.map((report) => (
                            <ReportCard
                                key={report._id}
                                id={report._id}
                                title={report.title}
                                badge={report.badge}
                                doctor={report.doctor}
                                consultationDate={report.consultationDate}
                                uploadedDate={report.uploadedDate}
                                onView={() => handleViewReport(report)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Reports_View;

