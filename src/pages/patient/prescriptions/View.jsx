import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VisibilityIcon from '@mui/icons-material/Visibility';
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { Box, CircularProgress } from "@mui/material";
import prescriptionService from "../../../services/prescriptionService";
import { toast } from "react-toastify";

function Prescriptions_View() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ============================
    // TABLE COLUMNS
    // ============================
    const columns = [
        { header: "Patient Name", field: "patientName" },
        { header: "Prescription ID", field: "prescriptionId" },
        { header: "Date", field: "date" },
        { header: "Doctor", field: "doctor" },
        { header: "Medicines Count", field: "medicinesCount" },
        { header: "Consultation ID", field: "consultationId" },
    ];

    // ============================
    // ACTION BUTTONS
    // ============================
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

    // ============================
    // FETCH PRESCRIPTIONS FROM API
    // ============================
    useEffect(() => {
        const fetchPrescriptions = async () => {
            if (!user?._id) {
                // Try to get user from localStorage if Redux doesn't have it
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
                    // Transform the prescription data for table display
                    const transformedData = response.data.map((prescription, index) => {
                        const prescriptionDate = prescription.createdAt 
                            ? new Date(prescription.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })
                            : "N/A";
                        
                        // Generate prescription ID from _id
                        const prescriptionId = prescription._id 
                            ? `RX-${prescription._id.toString().slice(-8).toUpperCase()}`
                            : `RX-${index + 1}`;
                        
                        // Get consultation/examination ID
                        const consultationId = prescription.examination?._id 
                            ? `CONS-${prescription.examination._id.toString().slice(-5)}`
                            : prescription.examination || "N/A";
                        
                        return {
                            _id: prescription._id, // Use real MongoDB _id
                            patientName: prescription.patient?.user?.name || prescription.examination?.patient?.user?.name || "Unknown",
                            prescriptionId: prescriptionId,
                            date: prescriptionDate,
                            doctor: prescription.doctor?.user?.name || prescription.examination?.doctor?.user?.name || "Unknown",
                            medicinesCount: 1, // Each prescription is one medicine, but we can count if there are multiple
                            consultationId: consultationId,
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

    // ============================
    // PRINT ALL FUNCTION (Only Table)
    // ============================
    const handlePrintAll = () => {
        if (rows.length === 0) {
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
                            ${rows.map((row, idx) => `
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
            {/* Page Heading */}
            <HeadingCard
                title="My Prescriptions"
                subtitle="Access all your prescriptions, check dosage details, and view records from past consultations."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Prescriptions" },
                ]}
            />

            {/* TABLE */}
            <TableComponent
                title="Prescriptions List"
                columns={columns}
                rows={rows}
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