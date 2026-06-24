import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import { Box, Chip, CircularProgress } from "@mui/material";
import prescriptionService from "../../../services/prescriptionService";
import { toast } from "react-toastify";

function PrescriptionBills_View() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [bills, setBills] = useState([]);
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
        const loadBills = async () => {
            const userId = getUserId();
            if (!userId) {
                toast.error("User information not found. Please login again.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await prescriptionService.getPharmacyBillsByUserId(userId);
                if (!response.success || !response.data) {
                    toast.error(response.message || "Failed to fetch bills");
                    setBills([]);
                    return;
                }

                const transformed = response.data.map((bill) => {
                    const total = bill.totalAmountWithGst || bill.totalAmount || 0;
                    const paid = bill.padeamount || 0;
                    const medicines = (bill.prescriptions || []).map((p) => p.medication).filter(Boolean);

                    return {
                        _id: bill._id,
                        billId: `BILL-${bill._id.toString().slice(-8).toUpperCase()}`,
                        billDate: bill.createdAt
                            ? new Date(bill.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })
                            : "N/A",
                        patientName: bill.patient?.user?.name || "Unknown",
                        doctor: bill.doctor || "Unknown",
                        medicineCount: bill.medicineCount || medicines.length,
                        medicines,
                        totalAmount: total.toFixed(2),
                        paidAmount: paid.toFixed(2),
                        balance: (bill.balance ?? Math.max(0, total - paid)).toFixed(2),
                        paymentStatus: bill.paymentStatus || (paid > 0 ? "Partially Paid" : "Unpaid"),
                        firstPrescriptionId: bill.prescriptions?.[0]?._id,
                    };
                });

                setBills(transformed);
            } catch (error) {
                console.error("Error fetching bills:", error);
                toast.error(error.response?.data?.message || error.message || "Failed to fetch bills");
                setBills([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadBills();
    }, [user]);

    const columns = [
        { header: "Bill ID", field: "billId" },
        { header: "Bill Date", field: "billDate" },
        { header: "Patient Name", field: "patientName" },
        { header: "Doctor", field: "doctor" },
        { header: "Medicines", field: "medicineCount" },
        {
            header: "Medicine List",
            field: "medicines",
            render: (row) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(row.medicines || []).map((medicine, index) => (
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
        { header: "Total", field: "totalAmount" },
        { header: "Paid", field: "paidAmount" },
        { header: "Balance", field: "balance" },
        {
            header: "Payment Status",
            field: "paymentStatus",
            render: (row) => (
                <Chip
                    label={row.paymentStatus}
                    size="small"
                    color={
                        row.paymentStatus === "Paid"
                            ? "success"
                            : row.paymentStatus === "Partially Paid"
                                ? "info"
                                : "warning"
                    }
                    sx={{ fontWeight: 500 }}
                />
            ),
        },
    ];

    const actions = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            label: "View Bill",
            onClick: (row) => {
                if (row.firstPrescriptionId) {
                    navigate(`/patient/prescriptions/${row.firstPrescriptionId}`);
                } else {
                    toast.info("Bill details not available");
                }
            },
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
                title="My Prescription Bills"
                subtitle="View prescription bills that have been generated. Paid bills are shown here."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Prescriptions", url: "/patient/prescriptions/orders" },
                    { label: "Bills" },
                ]}
            />

            <TableComponent
                title="Prescription Bills"
                columns={columns}
                rows={bills}
                actions={actions}
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
            />
        </div>
    );
}

export default PrescriptionBills_View;
