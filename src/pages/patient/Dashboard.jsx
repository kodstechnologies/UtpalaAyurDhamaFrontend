import { useState, useEffect } from "react";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import MedicationIcon from "@mui/icons-material/Medication";

import GreetingBanner from "../../components/card/GreetingCard";
import DashboardCard from "../../components/card/DashboardCard";
import PatientDashboardCard from "../../components/card/patientCard/Patient_DashboardCard";

import GreetingsImg from "../../assets/greeting/patient.png";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import patientService from "../../services/patientService";

function Patient_Dashboard() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [dashboardData, setDashboardData] = useState(null);
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    const patientName = user?.name || "User";

    useEffect(() => {
        const fetchDashboardInfo = async () => {
            try {
                setLoading(true);
                const [summaryRes, remindersRes] = await Promise.all([
                    patientService.getPatientDashboard(),
                    patientService.getUpcomingReminders()
                ]);

                if (summaryRes.success) {
                    setDashboardData(summaryRes.data);
                }
                if (remindersRes.success) {
                    setReminders(remindersRes.data.reminders || []);
                }
            } catch (error) {
                console.error("Error fetching patient dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardInfo();
        }
    }, [user]);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getReminderWindowText = () => {
        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);

        return `Upcoming Reminders (${formatDate(today)} - ${formatDate(threeDaysLater)})`;
    };

    return (
        <div style={{ paddingBottom: 50 }}>

            {/* ⭐ Greeting + Breadcrumb Inside */}
            <GreetingBanner
                title="Namaste"
                name={dashboardData?.patientName || patientName}
                subtitle="Here's a quick overview of your health updates and upcoming activities."
                image={GreetingsImg}
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Dashboard" }
                ]}
            />

            {/* ⭐ TOP SMALL CARDS */}
            <div
                style={{
                    display: "flex",
                    gap: 25,
                    marginTop: 30,
                    flexWrap: "nowrap",       // ⭐ prevent line break
                    overflowX: "auto",        // ⭐ allows horizontal scroll if window small
                    paddingBottom: 10,
                }}
            >
                <DashboardCard
                    title="Upcoming Appointment"
                    description={
                        dashboardData?.upcomingAppointment
                            ? `${dashboardData.upcomingAppointment.doctorName || "Doctor"} - ${formatDate(dashboardData.upcomingAppointment.date)}${dashboardData.upcomingAppointment.time ? ` at ${dashboardData.upcomingAppointment.time}` : ""}`
                            : "No follow-ups scheduled. Your next appointment will appear here."
                    }
                    icon={LocalHospitalIcon}
                />

                <DashboardCard
                    title="Family Profiles"
                    count={dashboardData?.familyMembers ?? 0}
                    icon={PeopleIcon}
                />

                <DashboardCard
                    title="Prescriptions"
                    description={
                        dashboardData?.newPrescriptions > 0
                            ? `You have ${dashboardData.newPrescriptions} pending prescription(s).`
                            : "All caught up. No new prescriptions available."
                    }
                    icon={MedicationIcon}
                />
            </div>


            {/* ⭐ NEW PATIENT DASHBOARD CARDS */}
            <div
                style={{
                    marginTop: 35,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                    gap: 25,
                }}
            >
                <PatientDashboardCard
                    title="Ongoing Therapy"
                    icon={FavoriteBorderIcon}
                    mainText={dashboardData?.ongoingTherapy?.name || "No Ongoing Therapy"}
                    subText={
                        dashboardData?.ongoingTherapy
                            ? `Day ${dashboardData.ongoingTherapy.currentDay} of ${dashboardData.ongoingTherapy.totalDays} · ${dashboardData.ongoingTherapy.status}`
                            : "You don't have any active therapy sessions scheduled."
                    }
                    showButton={true}
                    buttonText="View All"
                    onButtonClick={() => navigate("/patient/therapies")}
                />

                <PatientDashboardCard
                    title={getReminderWindowText()}
                    subText={
                        reminders.length > 0
                            ? `${reminders[0].type}: ${reminders[0].doctorName || reminders[0].treatmentName || ""} on ${formatDate(reminders[0].date)}`
                            : "No appointments or therapies scheduled in the next three days."
                    }
                />

                <PatientDashboardCard
                    title="Recent Reports"
                    icon={DescriptionIcon}
                    mainText={dashboardData?.recentReport?.title || "No Recent Reports"}
                    subText={
                        dashboardData?.recentReport
                            ? `Uploaded on ${formatDate(dashboardData.recentReport.createdAt)}`
                            : "Your diagnostic and clinical reports will appear here."
                    }
                    showButton={true}
                    buttonText="View All"
                    onButtonClick={() => navigate("/patient/reports")}
                />
            </div>

        </div>
    );
}

export default Patient_Dashboard;
