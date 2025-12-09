import { useState } from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import GreetingBanner from "../../components/card/GreetingCard";
import DashboardCard from "../../components/card/DashboardCard";

// ICONS
import PeopleIcon from "@mui/icons-material/People";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

function Nurse_Dashboard() {
    // Mock/Static data - will be replaced with API calls later
    const [summary] = useState({
        admittedPatients: 8,
        pendingAdmissions: 3,
        readyForDischarge: 2,
    });

    // Mock nurse name - will be replaced with API calls later
    const [nurseName] = useState("Nurse Priya");

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Dashboard" },
    ];

    return (
        <Box sx={{ padding: "20px" }}>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Greeting Banner */}
            <GreetingBanner
                title="Welcome"
                name={nurseName}
                subtitle="Here is a summary of your current workload. Review admissions, monitor patients, and prepare discharges with confidence."
                image="/assets/nurse-greeting.png"
            />

            {/* ⭐ DASHBOARD CARDS */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                    },
                    gap: "15px",
                    marginTop: 3,
                }}
            >
                <DashboardCard
                    title="Admitted Patients"
                    count={summary.admittedPatients}
                    icon={PeopleIcon}
                />

                <DashboardCard
                    title="Pending Admissions"
                    count={summary.pendingAdmissions}
                    icon={PersonAddAlt1Icon}
                />

                <DashboardCard
                    title="Ready for Discharge"
                    count={summary.readyForDischarge}
                    icon={ExitToAppIcon}
                />
            </Box>

            {/* ⭐ Quick Actions Section */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="card-title mb-0">Quick Actions</h5>
                        </div>
                        <div className="row g-3">
                            <div className="col-12 col-sm-6 col-lg-4">
                                <Link
                                    to="/nurse/monitoring"
                                    className="btn btn-primary w-100"
                                >
                                    <LocalHospitalIcon className="me-2" />
                                    Patient Monitoring
                                </Link>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-4">
                                <Link
                                    to="/nurse/monitoring"
                                    className="btn btn-success w-100"
                                >
                                    <PersonAddAlt1Icon className="me-2" />
                                    Review Admissions
                                </Link>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-4">
                                <Link
                                    to="/nurse/discharge-preparation"
                                    className="btn btn-warning w-100"
                                >
                                    <ExitToAppIcon className="me-2" />
                                    Prepare Discharges
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </Box>
        </Box>
    );
}

export default Nurse_Dashboard;
