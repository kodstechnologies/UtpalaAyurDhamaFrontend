import React from "react";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";

// ICONS
import PeopleIcon from "@mui/icons-material/People";
import LocalHospital from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import HeadingCardingCard from "../../../components/card/HeadingCard";

function All_Patients_View() {

    // TABLE COLUMNS
    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "age", header: "Age" },
        { field: "condition", header: "Condition" },
        { field: "lastVisit", header: "Last Visit" },
        { field: "status", header: "Status" },
    ];

    // SAMPLE DATA
    const rows = [
        {
            _id: "P1",
            patientName: "Amit Kumar",
            age: 32,
            condition: "Diabetes",
            lastVisit: "2025-02-12",
            status: "Active",
        },
        {
            _id: "P2",
            patientName: "Neha Sharma",
            age: 28,
            condition: "Asthma",
            lastVisit: "2025-02-10",
            status: "Inactive",
        },
        {
            _id: "P3",
            patientName: "Rohan Das",
            age: 45,
            condition: "Hypertension",
            lastVisit: "2025-02-14",
            status: "Active",
        },
    ];

    return (
        <div>

            {/* BREADCRUMB */}
            <Breadcrumb
                items={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "All Patients" }
                ]}
            />
            <HeadingCardingCard
                category="TREATMENT & THERAPY"
                title="Therapists Assignment"
                subtitle="Assign qualified therapists to individual therapies, manage their availability, and ensure smooth coordination for treatment delivery."
            />

            {/* DASHBOARD CARDS */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
                marginTop: "25px",
                marginBottom: "20px"
            }}>
                <DashboardCard
                    title="Total Patients"
                    count={rows.length}
                    icon={PeopleIcon}
                />

                <DashboardCard
                    title="Active Treatments"
                    count={2}
                    icon={LocalHospital}
                    iconColor="#2e7d32"
                />

                <DashboardCard
                    title="Completed"
                    count={15}
                    icon={CheckCircleIcon}
                    iconColor="#388e3c"
                />

                <DashboardCard
                    title="Pending"
                    count={5}
                    icon={PendingActionsIcon}
                    iconColor="#ed6c02"
                />
            </div>

            {/* TABLE DISPLAY */}
            <TableComponent
                title="All Patients List"
                columns={columns}
                rows={rows}
            />
        </div>
    );
}

export default All_Patients_View;
