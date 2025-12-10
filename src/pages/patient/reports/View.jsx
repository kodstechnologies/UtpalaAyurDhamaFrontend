import React from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import ReportCard from "../../../components/card/patientCard/ReportCard";

function Reports_View() {
    const reports = [
        {
            id: 1,
            title: "Prescription Invoice",
            badge: "Invoice",
            doctor: "Dr. Anajali D",
            consultationDate: "Nov 25, 2025",
            uploadedDate: "Nov 25, 2025",
        },
        {
            id: 2,
            title: "Blood Test Report",
            badge: "Lab Report",
            doctor: "Dr. Shyam Kumar",
            consultationDate: "Nov 18, 2025",
            uploadedDate: "Nov 19, 2025",
        },
        {
            id: 3,
            title: "X-Ray Chest Report",
            badge: "Radiology",
            doctor: "Dr. Priya R",
            consultationDate: "Nov 12, 2025",
            uploadedDate: "Nov 12, 2025",
        },
        {
            id: 4,
            title: "General Health Summary",
            badge: "Summary",
            doctor: "Dr. Arvind N",
            consultationDate: "Oct 30, 2025",
            uploadedDate: "Oct 30, 2025",
        }
    ];

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

            {/* Reports List */}
            <div style={{ marginTop: 20 }}>
                {reports.map(report => (
                    <ReportCard
                        key={report.id}
                        title={report.title}
                        badge={report.badge}
                        doctor={report.doctor}
                        consultationDate={report.consultationDate}
                        uploadedDate={report.uploadedDate}
                        onView={() => console.log("Viewing report:", report.id)}
                    />
                ))}
            </div>
        </div>
    );
}

export default Reports_View;

