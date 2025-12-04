import React from "react";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";

// ICONS
import PeopleIcon from "@mui/icons-material/People";
import LocalHospital from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import TableComponent2 from "../../../components/table/doctor/TableComponent2";

function Patient_Management_View() {

    // 👉 TABLE COLUMNS
    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "roomNo", header: "Room No." },
        { field: "admittedOn", header: "Admitted On" },
        { field: "reason", header: "Reason" },
        { field: "status", header: "Status" }
    ];

    // 👉 SAMPLE DATA (replace with API later)
    const rows = [
        {
            _id: "1",
            patientName: "Rakesh Mohanty",
            roomNo: "101",
            admittedOn: "2025-01-10",
            reason: "Fever & Weakness",
            status: "Admitted"
        },
        {
            _id: "2",
            patientName: "Priya Sharma",
            roomNo: "202",
            admittedOn: "2025-01-12",
            reason: "Body Pain",
            status: "Under Treatment"
        },
        {
            _id: "3",
            patientName: "Arun Das",
            roomNo: "305",
            admittedOn: "2025-01-14",
            reason: "Accident Injury",
            status: "Recovery"
        },
        {
            _id: "4",
            patientName: "Sneha Patnaik",
            roomNo: "115",
            admittedOn: "2025-01-08",
            reason: "High BP",
            status: "Discharged"
        },
        {
            _id: "5",
            patientName: "John Abraham",
            roomNo: "410",
            admittedOn: "2025-01-18",
            reason: "Chest Pain",
            status: "Critical"
        }
    ];

    // --------------- UI ---------------
    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "All Patients" },
                ]}
            />

            <HeadingCardingCard
                category="TREATMENT & THERAPY"
                title="Therapists Assignment"
                subtitle="Assign qualified therapists to individual therapies, manage their availability, and ensure smooth coordination for treatment delivery."
            />

            {/* DASHBOARD CARDS */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "20px",
                    marginTop: "25px",
                    marginBottom: "20px",
                }}
            >
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

            {/* TABLE SECTION */}
            <TableComponent2
                title="All Patients List"
                columns={columns}
                rows={rows}
            />
        </div>
    );
}

export default Patient_Management_View;
