import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import { Box, Chip, CircularProgress } from "@mui/material";
import prescriptionService from "../../../services/prescriptionService";
import { toast } from "react-toastify";

function PrescriptionOrders_View() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getUserId = () => {
        if (user?._id) return user._id;
        try {
            const storedUser = JSON.parse(localStorage.getItem("user") || "null");
            return storedUser?._id || null;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        const loadOrders = async () => {
            const userId = getUserId();
            if (!userId) {
                toast.error("User information not found. Please login again.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await prescriptionService.getPrescriptionsByUserId(userId);
                if (!response.success || !response.data) {
                    toast.error(response.message || "Failed to fetch orders");
                    setOrders([]);
                    return;
                }

                const unbilledPrescriptions = response.data.filter(
                    (prescription) => !prescription.isBilled && !prescription.pharmacyOrder
                );

                const grouped = {};
                unbilledPrescriptions.forEach((prescription) => {
                    const orderKey = prescription.examination?._id?.toString()
                        || prescription.examination?.toString()
                        || prescription._id;

                    if (!grouped[orderKey]) {
                        grouped[orderKey] = {
                            _id: orderKey,
                            orderDate: prescription.createdAt
                                ? new Date(prescription.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })
                                : "N/A",
                            doctor: prescription.doctor?.user?.name || "Unknown",
                            patientName: prescription.patient?.user?.name || "Unknown",
                            medicines: [],
                            firstPrescriptionId: prescription._id,
                            billingStatus: "Not Billed",
                        };
                    }

                    grouped[orderKey].medicines.push(prescription.medication || "N/A");
                });

                setOrders(
                    Object.values(grouped).map((order) => ({
                        ...order,
                        medicinesInOrder: order.medicines.length,
                    }))
                );
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error(error.response?.data?.message || error.message || "Failed to fetch orders");
                setOrders([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrders();
    }, [user]);

    const columns = [
        { header: "Patient Name", field: "patientName" },
        { header: "Order Date", field: "orderDate" },
        { header: "Doctor", field: "doctor" },
        { header: "Medicines in Order", field: "medicinesInOrder" },
        {
            header: "Medicines",
            field: "medicines",
            render: (row) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {row.medicines.map((medicine, index) => (
                        <Chip
                            key={index}
                            label={medicine}
                            size="small"
                            sx={{
                                backgroundColor: "var(--color-bg-a)",
                                color: "var(--color-text-dark)",
                                fontSize: "0.75rem",
                            }}
                        />
                    ))}
                </Box>
            ),
        },
        {
            header: "Billing Status",
            field: "billingStatus",
            render: (row) => (
                <Chip
                    label={row.billingStatus}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        backgroundColor: "#f5f5f5",
                        color: "#5A5044",
                    }}
                />
            ),
        },
    ];

    const actions = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            label: "View Details",
            onClick: (row) => navigate(`/patient/prescriptions/${row.firstPrescriptionId}`),
        },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div style={{ paddingBottom: "30px" }}>
            <HeadingCard
                title="My Prescription Orders"
                subtitle="View prescription orders that are not yet billed. Paid bills appear under Bills."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Prescriptions", url: "/patient/prescriptions/orders" },
                    { label: "Orders" },
                ]}
            />

            <TableComponent
                title="Prescription Orders"
                columns={columns}
                rows={orders}
                actions={actions}
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
            />
        </div>
    );
}

export default PrescriptionOrders_View;
