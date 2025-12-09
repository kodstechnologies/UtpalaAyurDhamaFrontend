import { useState } from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import GreetingBanner from "../../components/card/GreetingCard";
import DashboardCard from "../../components/card/DashboardCard";

// ICONS
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PeopleIcon from "@mui/icons-material/People";
import SpaIcon from "@mui/icons-material/Spa";
import DescriptionIcon from "@mui/icons-material/Description";

function Receptionist_Dashboard() {
    // Mock/Static data - will be replaced with API calls later
    const [summary] = useState({
        todayAppointments: 18,
        todayTherapySessions: 12,
        totalPatients: 245,
    });
    
    // Mock recent invoice data - will be replaced with API calls later
    const [recentInvoice] = useState({
        _id: "inv-001",
        invoiceNumber: "INV-2024-001",
        patient: {
            user: {
                name: "John Doe"
            }
        },
        totalPayable: 2500.00,
        prescription: {
            _id: "pres-001"
        },
        createdAt: new Date().toISOString()
    });

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Dashboard" },
    ];

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <Box sx={{ padding: "20px" }}>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Greeting Banner */}
            <GreetingBanner
                title="Good Morning"
                name="Receptionist"
                subtitle="Here is your dashboard overview. Manage appointments, patient flow, and payments efficiently."
                image="/assets/receptionist-greeting.png"
            />

            {/* ⭐ DASHBOARD CARDS */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "15px",
                    marginTop: 3,
                }}
            >
                <DashboardCard
                    title="Today's Appointments"
                    count={summary.todayAppointments}
                    icon={EventAvailableIcon}
                />

                <DashboardCard
                    title="Total Patients"
                    count={summary.totalPatients}
                    icon={PeopleIcon}
                />

                <DashboardCard
                    title="Therapy Sessions Today"
                    count={summary.todayTherapySessions}
                    icon={SpaIcon}
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
                                    to="/receptionist/appointments"
                                    className="btn btn-primary w-100"
                                >
                                    Manage Appointments
                                </Link>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-4">
                                <Link
                                    to="/receptionist/inpatient"
                                    className="btn btn-secondary w-100"
                                >
                                    In-Patients
                                </Link>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-4">
                                <Link
                                    to="/receptionist/reports"
                                    className="btn btn-info w-100"
                                >
                                    View Reports
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </Box>

            {/* ⭐ Recent Invoice Section */}
            {recentInvoice && recentInvoice.invoiceNumber && (
                <Box sx={{ marginTop: 4 }}>
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="card-title mb-0">Recent Invoice</h5>
                                <Link
                                    to="/receptionist/reports"
                                    className="btn btn-sm btn-outline-primary"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                                <div className="d-flex align-items-center gap-3">
                                    <DescriptionIcon
                                        sx={{ fontSize: 28, color: "#0d6efd" }}
                                    />
                                    <div>
                                        <p className="mb-1 fw-semibold">
                                            Invoice #{recentInvoice.invoiceNumber}
                                        </p>
                                        <p className="mb-0 text-muted small">
                                            Patient:{" "}
                                            {recentInvoice.patient?.user?.name ||
                                                "N/A"}{" "}
                                            • Amount: ₹
                                            {recentInvoice.totalPayable?.toFixed(2) ||
                                                "0.00"}{" "}
                                            • {formatDate(recentInvoice.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/receptionist/reports"
                                    className="btn btn-sm btn-primary"
                                >
                                    View Invoice
                                </Link>
                            </div>
                        </div>
                    </div>
                </Box>
            )}
        </Box>
    );
}

export default Receptionist_Dashboard;
