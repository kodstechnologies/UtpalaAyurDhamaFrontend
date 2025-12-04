import React from "react";


// Icons
import PeopleIcon from "@mui/icons-material/People";
import LocalHospital from "@mui/icons-material/LocalHospital";
import HotelIcon from "@mui/icons-material/Hotel";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import GreetingBanner from "../../components/card/GreetingCard";
import DashboardCard from "../../components/card/DashboardCard";

function Doctor_Dashboard() {
    return (
        <div>

            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Dashboard" }
                ]}
            />

            {/* Greeting Section */}
            <GreetingBanner
                title="Good Morning"
                name="Doctor"
                subtitle="Here’s a quick overview of your today's activities & patient updates."
                image="https://cdn.pixabay.com/photo/2016/12/06/18/27/doctor-1886768_960_720.png"
            />

            {/* Dashboard Cards */}
            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    marginTop: "25px",
                    flexWrap: "wrap",
                }}
            >
                <DashboardCard
                    title="My Patients"
                    count={32}
                    icon={PeopleIcon}
                />

                <DashboardCard
                    title="Today's Appointments"
                    count={14}
                    icon={LocalHospital}
                />

                <DashboardCard
                    title="In-Patients"
                    count={8}
                    icon={HotelIcon}
                />
            </div>
        </div>
    );
}

export default Doctor_Dashboard;
