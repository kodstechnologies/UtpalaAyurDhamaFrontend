import { useState } from "react";
import { Link } from "react-router-dom";
import { Box, Grid, Card, CardContent, Typography, Button } from "@mui/material";
import { useSelector } from "react-redux";

import GreetingBanner from "../../components/card/GreetingCard";
import DashboardCard from "../../components/card/DashboardCard";
import RedirectCard from "../../components/card/RedirectCard"; // Assuming path based on context; adjust as needed

import PeopleIcon from "@mui/icons-material/People";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

import GreetingsImg from "../../assets/greeting/nurse.png";

function Nurse_Dashboard() {
    const { user } = useSelector((state) => state.auth);
    const nurseName = user?.name || "Nurse";
    
    const [summary] = useState({
        admittedPatients: 8,
        pendingAdmissions: 3,
        readyForDischarge: 2,
    });

    return (
        <Box sx={{ paddingBottom: 3 }}>

            {/* ⭐ Greeting Banner */}
            <GreetingBanner
                title="Namaste"
                name={nurseName}
                subtitle="Here is a summary of your current workload. Review admissions, monitor patients, and prepare discharges with confidence."
                image={GreetingsImg}
                breadcrumbItems={[
                    { label: "Nurse", url: "/nurse/dashboard" },
                    { label: "Dashboard" }
                ]}
            />

            {/* ⭐ Summary Cards */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard
                        title="Admitted Patients"
                        count={summary.admittedPatients}
                        icon={PeopleIcon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard
                        title="Pending Admissions"
                        count={summary.pendingAdmissions}
                        icon={PersonAddAlt1Icon}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <DashboardCard
                        title="Ready for Discharge"
                        count={summary.readyForDischarge}
                        icon={ExitToAppIcon}
                    />
                </Grid>
            </Grid>

            {/* ⭐ Quick Actions Section */}

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    color: "var(--color-text-dark)",
                    mt: 2,
                }}
            >
                Quick Actions
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <RedirectCard
                        title="Patient Monitoring"
                        link="/nurse/monitoring"
                        icon={<LocalHospitalIcon />}
                    />
                </Grid>

                {/* <Grid item xs={12} sm={6} md={4}>
                    <RedirectCard
                        title="Review Admissions"
                        link="/nurse/review-admissions"
                        icon={<PersonAddAlt1Icon />}
                    />
                </Grid> */}

                <Grid item xs={12} sm={6} md={4}>
                    <RedirectCard
                        title="Prepare Discharges"
                        link="/nurse/discharge-preparation"
                        icon={<ExitToAppIcon />}
                    />
                </Grid>
            </Grid>


        </Box>
    );
}

export default Nurse_Dashboard;