import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VisibilityIcon from '@mui/icons-material/Visibility';
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import CardBorder from "../../../components/card/CardBorder";
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { Box, CircularProgress, Chip, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import prescriptionService from "../../../services/prescriptionService";
import { toast } from "react-toastify";

function Prescriptions_View() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [orderFilter, setOrderFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");

    const columns = [
        { header: "Patient Name", field: "patientName" },
        { header: "Prescription ID", field: "prescriptionId" },
        { header: "Date", field: "date" },
        { header: "Doctor", field: "doctor" },
        { header: "Medicines in Order", field: "medicinesInOrder" },
        { header: "Consultation ID", field: "consultationId" },
        {
            header: "Bill Status",
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
                                : row.paymentStatus === "Pending"
                                    ? "default"
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
            label: "View Details",
            onClick: (row) => {
                navigate(`/patient/prescriptions/${row._id}`);
            },
        },
    ];

    useEffect(() => {
        const fetchPrescriptions = async () => {
            if (!user?._id) {
                try {
                    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
                    if (!storedUser?._id) {
                        toast.error("User information not found. Please login again.");
                        setIsLoading(false);
                        return;
                    }
                    await loadPrescriptions(storedUser._id);
                } catch (error) {
                    console.error("Error getting user:", error);
                    toast.error("User information not found. Please login again.");
                    setIsLoading(false);
                }
                return;
            }
            await loadPrescriptions(user._id);
        };

        const loadPrescriptions = async (userId) => {
            setIsLoading(true);
            try {
                const response = await prescriptionService.getPrescriptionsByUserId(userId);

                if (response.success && response.data) {
                    const transformedData = response.data.map((prescription, index) => {
                        const prescriptionDate = prescription.createdAt
                            ? new Date(prescription.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })
                            : "N/A";

                        const prescriptionId = prescription._id
                            ? `RX-${prescription._id.toString().slice(-8).toUpperCase()}`
                            : `RX-${index + 1}`;

                        const consultationId = prescription.examination?._id
                            ? `CONS-${prescription.examination._id.toString().slice(-5)}`
                            : prescription.examination || "N/A";

                        return {
                            _id: prescription._id,
                            patientName: (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {prescription.patient?.user?.name || prescription.examination?.patient?.user?.name || "Unknown"}
                                    {prescription.isFamilyMember && (
                                        <Box
                                            component="span"
                                            sx={{
                                                fontSize: '0.65rem',
                                                backgroundColor: 'rgba(0, 128, 0, 0.1)',
                                                color: 'green',
                                                px: 0.8,
                                                py: 0.2,
                                                borderRadius: 1,
                                                fontWeight: 'bold',
                                                border: '1px solid rgba(0, 128, 0, 0.2)'
                                            }}
                                        >
                                            Family Member
                                        </Box>
                                    )}
                                </Box>
                            ),
                            prescriptionId,
                            date: prescriptionDate,
                            doctor: prescription.doctor?.user?.name || prescription.examination?.doctor?.user?.name || "Unknown",
                            medicinesInOrder: prescription.medicinesInOrder || 1,
                            consultationId,
                            paymentStatus: prescription.paymentStatus || "Pending",
                            examinationId: prescription.examination?._id || prescription.examination,
                        };
                    });

                    setRows(transformedData);
                } else {
                    toast.error(response.message || "Failed to fetch prescriptions");
                    setRows([]);
                }
            } catch (error) {
                console.error("Error fetching prescriptions:", error);
                toast.error(error.response?.data?.message || error.message || "Failed to fetch prescriptions");
                setRows([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrescriptions();
    }, [user]);

    const orderOptions = useMemo(() => {
        const counts = rows.reduce((acc, row) => {
            const count = row.medicinesInOrder || 1;
            acc[count] = (acc[count] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(counts)
            .map(Number)
            .sort((a, b) => a - b)
            .map((count) => ({
                value: String(count),
                label: `${count} Medicine${count > 1 ? "s" : ""} (${counts[count]} order${counts[count] > 1 ? "s" : ""})`,
            }));
    }, [rows]);

    const paymentOptions = useMemo(() => {
        const counts = rows.reduce((acc, row) => {
            const status = row.paymentStatus || "Pending";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(counts).map((status) => ({
            value: status,
            label: `${status} (${counts[status]})`,
        }));
    }, [rows]);

    const filteredRows = useMemo(() => {
        let result = rows;

        if (orderFilter !== "All") {
            const selectedCount = Number(orderFilter);
            result = result.filter((row) => (row.medicinesInOrder || 1) === selectedCount);
        }

        if (paymentFilter !== "All") {
            result = result.filter((row) => row.paymentStatus === paymentFilter);
        }

        return result;
    }, [rows, orderFilter, paymentFilter]);

    const handlePrintAll = () => {
        if (filteredRows.length === 0) {
            toast.info("No prescriptions to print");
            return;
        }

        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>My Prescriptions - Print</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        h1 { text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>My Prescriptions</h1>
                    <table>
                        <thead>
                            <tr>
                                ${columns.map(col => `<th>${col.header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredRows.map((row) => `
                                <tr>
                                    ${columns.map(col => `<td>${row[col.field] ?? '-'}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <script>
                        window.onload = () => {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `;
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

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
                title="My Prescriptions"
                subtitle="Access all your prescriptions, check dosage details, and view records from past consultations."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Prescriptions" },
                ]}
            />

            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{ width: "100%", marginBottom: "2rem" }}
            >
                <Box sx={{ display: "flex", flex: 1, gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                        <InputLabel id="order-filter-label">Orders</InputLabel>
                        <Select
                            labelId="order-filter-label"
                            value={orderFilter}
                            label="Orders"
                            onChange={(e) => setOrderFilter(e.target.value)}
                        >
                            <MenuItem value="All">All Orders ({rows.length})</MenuItem>
                            {orderOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 220 }}>
                        <InputLabel id="payment-filter-label">Bill Status</InputLabel>
                        <Select
                            labelId="payment-filter-label"
                            value={paymentFilter}
                            label="Bill Status"
                            onChange={(e) => setPaymentFilter(e.target.value)}
                        >
                            <MenuItem value="All">All Bills ({rows.length})</MenuItem>
                            {paymentOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </CardBorder>

            <TableComponent
                title="Prescriptions List"
                columns={columns}
                rows={filteredRows}
                actions={actions}
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
                headerActions={[
                    {
                        label: "Print All",
                        icon: <LocalPrintshopIcon />,
                        onClick: handlePrintAll,
                        variant: "contained",
                        sx: {
                            background: "var(--color-primary)",
                            color: "white",
                            px: 3,
                            borderRadius: 2,
                            textTransform: "none",
                        },
                    },
                ]}
            />
        </div>
    );
}

export default Prescriptions_View;
