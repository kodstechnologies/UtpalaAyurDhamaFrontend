import { useState, useEffect, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Divider, Table, TableBody, TableCell, TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import invoiceService from "../../../services/invoiceService";
import inpatientService from "../../../services/inpatientService";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PaymentIcon from "@mui/icons-material/Payment";

function InvoiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [invoice, setInvoice] = useState(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [isRecordingPayment, setIsRecordingPayment] = useState(false);
    const [downloadingReport, setDownloadingReport] = useState(false);
    const [printingReport, setPrintingReport] = useState(false);

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Payments", url: "/receptionist/payments" },
        { label: "Invoice Details" },
    ];

    const fetchInvoiceDetails = async () => {
        if (!id) return;
        
        try {
            setLoading(true);
            const response = await invoiceService.getInvoiceById(id);
            
            if (response && response.success && response.data) {
                setInvoice(response.data);
            } else {
                toast.error("Failed to load invoice details");
                navigate("/receptionist/payments");
            }
        } catch (error) {
            console.error("Error fetching invoice details:", error);
            toast.error(error.response?.data?.message || "Failed to load invoice details");
            navigate("/receptionist/payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoiceDetails();
    }, [id, navigate]);

    const handleOpenPaymentDialog = () => {
        const balanceDue = (invoice?.totalPayable || 0) - (invoice?.amountPaid || 0);
        setPaymentAmount(balanceDue > 0 ? balanceDue.toString() : "");
        setPaymentDialogOpen(true);
    };

    const handleClosePaymentDialog = () => {
        setPaymentDialogOpen(false);
        setPaymentAmount("");
    };

    const handleRecordPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            toast.error("Please enter a valid payment amount");
            return;
        }

        const balanceDue = (invoice?.totalPayable || 0) - (invoice?.amountPaid || 0);
        const paymentValue = parseFloat(paymentAmount);

        if (paymentValue > balanceDue) {
            toast.error(`Payment amount cannot exceed balance due of ${formatCurrency(balanceDue)}`);
            return;
        }

        try {
            setIsRecordingPayment(true);
            const response = await invoiceService.recordPayment(id, paymentValue);
            
            if (response && response.success) {
                toast.success("Payment recorded successfully!");
                setPaymentDialogOpen(false);
                setPaymentAmount("");
                // Refresh invoice data
                await fetchInvoiceDetails();
            } else {
                toast.error(response?.message || "Failed to record payment");
            }
        } catch (error) {
            console.error("Error recording payment:", error);
            toast.error(error.response?.data?.message || "Failed to record payment");
        } finally {
            setIsRecordingPayment(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Categorize invoice items - use category field if available, otherwise use name-based categorization
    const categorizeItem = (item) => {
        // If item has a category field, use it (with proper formatting)
        if (item.category) {
            const categoryMap = {
                "consultation": "Doctor Consultation",
                "therapy": "Therapy",
                "pharmacy": "Medicines",
                "food": "Food Charges",
                "ward": "Bed Charges",
            };
            return categoryMap[item.category] || item.category.charAt(0).toUpperCase() + item.category.slice(1);
        }
        
        // Fallback to name-based categorization
        const itemName = item.name || "";
        if (!itemName) return "Other";
        const name = itemName.toLowerCase().trim();
        
        // Doctor Consultation - Check FIRST (most specific patterns first)
        // Also check if it has doctor-related fields or is from consultation charges
        if (name.includes("consultation") || 
            name.includes("opd consultation") || 
            name.includes("ipd consultation") ||
            name.includes("consultation charge") ||
            name.includes("examination") ||
            (name.includes("doctor") && (name.includes("fee") || name.includes("charge"))) ||
            name === "opd consultation" ||
            // Check if item has consultation-related metadata (for old invoices)
            (item.description && (item.description.toLowerCase().includes("consultation") || item.description.toLowerCase().includes("examination"))) ||
            // If it's a single item with high amount and no medicine details, likely consultation
            (!item.dosage && !item.frequency && !item.duration && item.quantity === 1 && item.unitPrice > 100)) {
            return "Doctor Consultation";
        }
        
        // Therapy - Check before medicine (specific therapy patterns)
        // Check common therapy names like Cardiology, Physiotherapy, etc.
        if (name.includes("therapy") || 
            name.includes("therapy charge") ||
            name.includes("opd therapy") || 
            name.includes("ipd therapy") ||
            name.includes("therapeutic") ||
            name.includes("treatment session") ||
            (name.includes("treatment") && (name.includes("charge") || name.includes("session"))) ||
            name === "opd therapy charge" ||
            name === "therapy charge" ||
            // Common therapy names
            name.includes("cardiology") ||
            name.includes("physiotherapy") ||
            name.includes("acupuncture") ||
            name.includes("massage") ||
            name.includes("yoga") ||
            name.includes("panchakarma") ||
            name.includes("shirodhara") ||
            name.includes("abhyanga") ||
            // Check if item has therapy-related metadata
            (item.description && item.description.toLowerCase().includes("therapy"))) {
            return "Therapy";
        }
        
        // Medicine/Pharmacy - Check after therapy/consultation
        // If it has medicine details (dosage, frequency, etc.), it's definitely a medicine
        if (item.dosage || item.frequency || item.duration || item.foodTiming) {
            return "Medicines";
        }
        
        if (name.includes("medicine") || 
            name.includes("medication") || 
            name.includes("tablet") || 
            name.includes("capsule") || 
            name.includes("syrup") || 
            name.includes("injection") ||
            name.includes("drops") || 
            name.includes("ointment") || 
            name.includes("cream") ||
            name.includes("drug") || 
            name.includes("pill")) {
            return "Medicines";
        }
        
        // Food - Check before ward/bed
        if (name.includes("food") || 
            name.includes("food charge") || 
            name.includes("meal") || 
            name.includes("breakfast") || 
            name.includes("lunch") || 
            name.includes("dinner") || 
            name.includes("snack")) {
            return "Food Charges";
        }
        
        // Ward/Bed - Check last
        if (name.includes("ward") || 
            name.includes("ward charge") || 
            name.includes("bed") || 
            name.includes("bed charge") || 
            name.includes("room charge") ||
            name.includes("accommodation") ||
            name.includes("one bed")) {
            return "Bed Charges";
        }
        
        // Default to "Other"
        return "Other";
    };

    // Group items by category
    const groupItemsByCategory = (items) => {
        if (!items || !Array.isArray(items)) return {};
        
        const grouped = {};
        items.forEach((item, index) => {
            const category = categorizeItem(item); // Pass the whole item, not just name
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push({ ...item, originalIndex: index });
        });
        
        return grouped;
    };

    // Get category order for display
    const getCategoryOrder = () => {
        return ["Doctor Consultation", "Therapy", "Medicines", "Food Charges", "Bed Charges", "Other"];
    };

    const handleDownloadPdf = async () => {
        if (invoice?.prescription) {
            try {
                const response = await invoiceService.downloadInvoicePdf(invoice.prescription._id || invoice.prescription);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `Invoice_${invoice.invoiceNumber}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success("Invoice PDF downloaded successfully");
            } catch (error) {
                console.error("Download error:", error);
                toast.error("Failed to download invoice PDF");
            }
        } else {
            toast.info("PDF download not available for this invoice");
        }
    };

    const handlePrint = async () => {
        if (!invoice || (!invoice.inpatient && !invoice.patient)) {
            toast.error("Unable to determine invoice type for printing discharge report");
            return;
        }

        try {
            setPrintingReport(true);
            let response;

            // Check if it's an inpatient invoice
            if (invoice.inpatient) {
                const inpatientId = invoice.inpatient._id || invoice.inpatient;
                if (!inpatientId) {
                    toast.error("Invalid inpatient ID");
                    return;
                }
                response = await inpatientService.downloadDischargeReport(inpatientId);
            } else if (invoice.patient) {
                // Outpatient invoice
                const patientId = invoice.patient._id || invoice.patient;
                if (!patientId) {
                    toast.error("Invalid patient ID");
                    return;
                }
                response = await inpatientService.downloadOutpatientBillingReport(patientId);
            } else {
                toast.error("Unable to determine invoice type for printing discharge report");
                return;
            }

            // Check if response is valid
            if (!response || !response.data) {
                toast.error("Invalid response from server");
                return;
            }

            // response.data is already a Blob when responseType is 'blob'
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const printWindow = window.open(url, '_blank');
            
            if (printWindow) {
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                        // Clean up the URL after a delay
                        setTimeout(() => {
                            window.URL.revokeObjectURL(url);
                        }, 1000);
                    }, 500);
                };
            } else {
                toast.error("Please allow popups to print the discharge report");
                window.URL.revokeObjectURL(url);
            }

            toast.success("Opening discharge report for printing...");
        } catch (error) {
            console.error("Print error:", error);
            let errorMessage = "Failed to print discharge report.";
            
            // Handle blob error responses
            if (error.response && error.response.data instanceof Blob) {
                try {
                    const errorText = await error.response.data.text();
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (parseError) {
                    errorMessage = error.response.statusText || `Server error: ${error.response.status}`;
                }
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setPrintingReport(false);
        }
    };

    const handleDownloadDischargeReport = async () => {
        if (!invoice || (!invoice.inpatient && !invoice.patient)) {
            toast.error("Unable to determine invoice type for report download");
            return;
        }

        try {
            setDownloadingReport(true);
            let response;
            let fileName;

            // Check if it's an inpatient invoice
            if (invoice.inpatient) {
                const inpatientId = invoice.inpatient._id || invoice.inpatient;
                if (!inpatientId) {
                    toast.error("Invalid inpatient ID");
                    return;
                }
                response = await inpatientService.downloadDischargeReport(inpatientId);
                fileName = `Discharge_${invoice.patient?.user?.name || 'Report'}.pdf`;
            } else if (invoice.patient) {
                // Outpatient invoice
                const patientId = invoice.patient._id || invoice.patient;
                if (!patientId) {
                    toast.error("Invalid patient ID");
                    return;
                }
                response = await inpatientService.downloadOutpatientBillingReport(patientId);
                fileName = `Discharge_${invoice.patient?.user?.name || 'Report'}.pdf`;
            } else {
                toast.error("Unable to determine invoice type for report download");
                return;
            }

            // Check if response is valid
            if (!response || !response.data) {
                toast.error("Invalid response from server");
                return;
            }

            // response.data is already a Blob when responseType is 'blob'
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
            link.remove();
                window.URL.revokeObjectURL(url);
            }, 100);

            toast.success("Discharge report downloaded successfully!");
        } catch (error) {
            console.error("Download error:", error);
            let errorMessage = "Failed to download discharge report.";
            
            // Handle blob error responses
            if (error.response && error.response.data instanceof Blob) {
                try {
                    const errorText = await error.response.data.text();
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (parseError) {
                    errorMessage = error.response.statusText || `Server error: ${error.response.status}`;
                }
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setDownloadingReport(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Box>
        );
    }

    if (!invoice) {
        return (
            <Box sx={{ padding: "20px" }}>
                <div className="alert alert-danger">Invoice not found.</div>
            </Box>
        );
    }

    const discountAmount = invoice.subtotal * ((invoice.discountRate || 0) / 100);
    const taxableAmount = invoice.subtotal - discountAmount;
    const taxAmount = taxableAmount * ((invoice.taxRate || 0) / 100);

    return (
        <Box sx={{ padding: "20px" }} className="invoice-details-page">
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Page Heading */}
            <HeadingCardingCard
                category="INVOICE DETAILS"
                title={`Invoice #${invoice.invoiceNumber}`}
                subtitle="View complete invoice information and details"
            />

            {/* ⭐ Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, marginBottom: 3, flexWrap: "wrap" }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/receptionist/payments")}
                    sx={{
                        borderColor: "#D4A574",
                        color: "#D4A574",
                        "&:hover": {
                            borderColor: "#B8935A",
                            backgroundColor: "rgba(212, 165, 116, 0.1)",
                        },
                    }}
                >
                    Back to Payments
                </Button>
                {(invoice.totalPayable - (invoice.amountPaid || 0)) > 0 && (
                    <Button
                        variant="contained"
                        startIcon={<PaymentIcon />}
                        onClick={handleOpenPaymentDialog}
                        sx={{
                            backgroundColor: "#ff9800",
                            "&:hover": {
                                backgroundColor: "#f57c00",
                            },
                        }}
                    >
                        Record Payment
                    </Button>
                )}
                {invoice.prescription && (
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadPdf}
                        sx={{
                            borderColor: "#1976d2",
                            color: "#1976d2",
                            "&:hover": {
                                borderColor: "#1565c0",
                                backgroundColor: "rgba(25, 118, 210, 0.1)",
                            },
                        }}
                    >
                        Download PDF
                    </Button>
                )}
                {(invoice.inpatient || invoice.patient) && (
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadDischargeReport}
                        disabled={downloadingReport}
                        sx={{
                            backgroundColor: "#1976d2",
                            "&:hover": {
                                backgroundColor: "#1565c0",
                            },
                        }}
                    >
                        {downloadingReport ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Preparing PDF...
                            </>
                        ) : (
                            <>
                                Download Discharge Report
                            </>
                        )}
                    </Button>
                )}
                {(invoice.inpatient || invoice.patient) && (
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        disabled={printingReport}
                        sx={{
                            backgroundColor: "#4CAF50",
                            "&:hover": {
                                backgroundColor: "#45a049",
                            },
                        }}
                    >
                        {printingReport ? (
                            <>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                Preparing...
                            </>
                        ) : (
                            <>
                                Print Discharge Report
                            </>
                        )}
                    </Button>
                )}
            </Box>

            {/* ⭐ Invoice Card */}
            <Card sx={{ boxShadow: 3, borderRadius: 2, marginBottom: 3 }}>
                <CardContent sx={{ padding: 4 }}>
                    {/* Header Section */}
                    <Box sx={{ marginBottom: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a1a1a", marginBottom: 1 }}>
                            Utpala Ayurdhama
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666", marginBottom: 0.5 }}>
                            Healthcare & Wellness Center
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                            Invoice # {invoice.invoiceNumber}
                        </Typography>
                    </Box>

                    <Divider sx={{ marginY: 3 }} />

                    {/* Patient & Invoice Info Section */}
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4, marginBottom: 4 }}>
                        {/* Patient Information */}
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2, color: "#1a1a1a", display: "flex", alignItems: "center", gap: 1 }}>
                                <PersonIcon sx={{ fontSize: "1.5rem", color: "#D4A574" }} />
                                Patient Information
                            </Typography>
                            <Box sx={{ backgroundColor: "#f8f9fa", padding: 2, borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                    <strong>Name:</strong> {invoice.patient?.user?.name || "N/A"}
                                </Typography>
                                {invoice.patient?.uhid && (
                                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                        <strong>UHID:</strong> {invoice.patient.uhid}
                                    </Typography>
                                )}
                                {invoice.patient?.user?.email && (
                                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                        <strong>Email:</strong> {invoice.patient.user.email}
                                    </Typography>
                                )}
                                {invoice.patient?.user?.phone && (
                                    <Typography variant="body2">
                                        <strong>Phone:</strong> {invoice.patient.user.phone}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Invoice Information */}
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2, color: "#1a1a1a", display: "flex", alignItems: "center", gap: 1 }}>
                                <ReceiptIcon sx={{ fontSize: "1.5rem", color: "#D4A574" }} />
                                Invoice Information
                            </Typography>
                            <Box sx={{ backgroundColor: "#f8f9fa", padding: 2, borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ marginBottom: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                    <CalendarTodayIcon sx={{ fontSize: "1rem", color: "#666" }} />
                                    <strong>Date:</strong> {formatDate(invoice.createdAt)}
                                </Typography>
                                {invoice.doctor?.user?.name && (
                                    <Typography variant="body2" sx={{ marginBottom: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                        <LocalHospitalIcon sx={{ fontSize: "1rem", color: "#666" }} />
                                        <strong>Doctor:</strong> {invoice.doctor.user.name}
                                    </Typography>
                                )}
                                {invoice.inpatient && (
                                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                        <strong>Type:</strong> <Chip label="Inpatient" size="small" color="info" sx={{ marginLeft: 1 }} />
                                    </Typography>
                                )}
                                {invoice.prescription && (
                                    <Typography variant="body2">
                                        <strong>Prescription:</strong> {
                                            typeof invoice.prescription === 'object' && invoice.prescription.createdAt
                                                ? `Prescription dated ${formatDate(invoice.prescription.createdAt)}`
                                                : typeof invoice.prescription === 'object' && invoice.prescription._id
                                                ? `Prescription #${invoice.prescription._id.toString().slice(-8).toUpperCase()}`
                                                : typeof invoice.prescription === 'string'
                                                ? `Prescription #${invoice.prescription.slice(-8).toUpperCase()}`
                                                : 'Prescription'
                                        }
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ marginY: 3 }} />

                    {/* Items Table */}
                    <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2, color: "#1a1a1a" }}>
                        Invoice Items
                    </Typography>
                    {(() => {
                        const groupedItems = groupItemsByCategory(invoice.items || []);
                        const categoryOrder = getCategoryOrder();
                        let itemCounter = 0;

                        return (
                            <Paper sx={{ overflow: "hidden", marginBottom: 4 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                                            <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>#</TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Item Name</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Quantity</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Unit Price</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {invoice.items && invoice.items.length > 0 ? (
                                            categoryOrder.map((category) => {
                                                const categoryItems = groupedItems[category];
                                                if (!categoryItems || categoryItems.length === 0) return null;

                                                const categoryTotal = categoryItems.reduce((sum, item) => sum + (item.total || 0), 0);

                                                return (
                                                    <Fragment key={category}>
                                                        {/* Category Header */}
                                                        <TableRow sx={{ backgroundColor: "#e8f4f8" }}>
                                                            <TableCell
                                                                colSpan={4}
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    fontSize: "0.95rem",
                                                                    color: "#1a1a1a",
                                                                    borderBottom: "2px solid #dee2e6",
                                                                }}
                                                            >
                                                                {category}
                                                            </TableCell>
                                                            <TableCell
                                                                align="right"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    fontSize: "0.95rem",
                                                                    color: "#1a1a1a",
                                                                    borderBottom: "2px solid #dee2e6",
                                                                }}
                                                            >
                                                                {formatCurrency(categoryTotal)}
                                                            </TableCell>
                                                        </TableRow>
                                                        {/* Category Items - Show different columns based on category */}
                                                        {categoryItems.map((item) => {
                                                            itemCounter++;
                                                            const isMedicine = item.category === "pharmacy" || category === "Medicines";
                                                            
                                                            // For medicines, show expanded table with medicine details
                                                            if (isMedicine) {
                                                                return (
                                                                    <Fragment key={`${category}-${item.originalIndex}`}>
                                                                        {/* Medicine row with details */}
                                                                        <TableRow hover>
                                                                            <TableCell sx={{ fontSize: "0.875rem" }}>{itemCounter}</TableCell>
                                                                            <TableCell sx={{ fontSize: "0.875rem", fontWeight: 500, paddingLeft: 3 }}>
                                                                                {item.name}
                                                                                {item.remarks && (
                                                                                    <Typography variant="caption" sx={{ display: "block", color: "#666", fontStyle: "italic", marginTop: 0.5 }}>
                                                                                        <strong>Remarks:</strong> {item.remarks}
                                                                                    </Typography>
                                                                                )}
                                                                            </TableCell>
                                                                            <TableCell align="center" sx={{ fontSize: "0.875rem" }}>
                                                                                {item.dispensedQuantity !== undefined ? item.dispensedQuantity : (item.quantity || 0)}
                                                                            </TableCell>
                                                                            <TableCell align="right" sx={{ fontSize: "0.875rem" }}>
                                                                                {formatCurrency(item.unitPrice)}
                                                                            </TableCell>
                                                                            <TableCell align="right" sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                                                {formatCurrency(item.total)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        {/* Medicine details row */}
                                                                        {(item.dosage || item.frequency || item.duration || item.foodTiming) && (
                                                                            <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                                                                                <TableCell></TableCell>
                                                                                <TableCell colSpan={4} sx={{ fontSize: "0.75rem", paddingLeft: 5, paddingTop: 0.5, paddingBottom: 0.5 }}>
                                                                                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                                                                        {item.dosage && (
                                                                                            <Typography component="span" sx={{ fontSize: "0.75rem" }}>
                                                                                                <strong>Dosage:</strong> {item.dosage}
                                                                                            </Typography>
                                                                                        )}
                                                                                        {item.frequency && (
                                                                                            <Typography component="span" sx={{ fontSize: "0.75rem" }}>
                                                                                                <strong>Frequency:</strong> {item.frequency}
                                                                                            </Typography>
                                                                                        )}
                                                                                        {item.duration && (
                                                                                            <Typography component="span" sx={{ fontSize: "0.75rem" }}>
                                                                                                <strong>Duration:</strong> {item.duration}
                                                                                            </Typography>
                                                                                        )}
                                                                                        {item.foodTiming && (
                                                                                            <Chip 
                                                                                                label={item.foodTiming} 
                                                                                                size="small" 
                                                                                                color={item.foodTiming === "Before Food" ? "warning" : "info"}
                                                                                                sx={{ fontSize: "0.65rem", height: "18px" }}
                                                                                            />
                                                                                        )}
                                                                                    </Box>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        )}
                                                                    </Fragment>
                                                                );
                                                            }
                                                            
                                                            // For non-medicine items, show simple row
                                                            return (
                                                                <TableRow key={`${category}-${item.originalIndex}`} hover>
                                                                    <TableCell sx={{ fontSize: "0.875rem" }}>{itemCounter}</TableCell>
                                                                    <TableCell sx={{ fontSize: "0.875rem", fontWeight: 500, paddingLeft: 3 }}>
                                                                        {item.name}
                                                                        {item.remarks && (
                                                                            <Typography variant="caption" sx={{ display: "block", color: "#666", fontStyle: "italic", marginTop: 0.5 }}>
                                                                                <strong>Remarks:</strong> {item.remarks}
                                                                            </Typography>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell align="center" sx={{ fontSize: "0.875rem" }}>
                                                                        {item.dispensedQuantity !== undefined ? item.dispensedQuantity : (item.quantity || 0)}
                                                                    </TableCell>
                                                                    <TableCell align="right" sx={{ fontSize: "0.875rem" }}>
                                                                        {formatCurrency(item.unitPrice)}
                                                                    </TableCell>
                                                                    <TableCell align="right" sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                                        {formatCurrency(item.total)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </Fragment>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ padding: 4, color: "#999" }}>
                                                    No items found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Paper>
                        );
                    })()}

                    {/* Summary Section */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", marginBottom: 3 }}>
                        <Box sx={{ minWidth: "300px" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
                                <Typography variant="body1" sx={{ color: "#666" }}>Subtotal:</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.subtotal)}</Typography>
                            </Box>
                            {invoice.discountRate > 0 && (
                                <>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
                                        <Typography variant="body1" sx={{ color: "#666" }}>
                                            Discount ({invoice.discountRate}%):
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 500, color: "#4CAF50" }}>
                                            -{formatCurrency(discountAmount)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
                                        <Typography variant="body1" sx={{ color: "#666" }}>Taxable Amount:</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{formatCurrency(taxableAmount)}</Typography>
                                    </Box>
                                </>
                            )}
                            {invoice.taxRate > 0 && (
                                <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
                                    <Typography variant="body1" sx={{ color: "#666" }}>
                                        GST ({invoice.taxRate}%):
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{formatCurrency(taxAmount)}</Typography>
                                </Box>
                            )}
                            <Divider sx={{ marginY: 2 }} />
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                                    Total Payable:
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#4CAF50",
                                        backgroundColor: "#f1f8f4",
                                        padding: "8px 16px",
                                        borderRadius: 1,
                                    }}
                                >
                                    {formatCurrency(invoice.totalPayable)}
                                </Typography>
                            </Box>
                            
                            {/* Payment Status - Always Show */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2, padding: "12px", backgroundColor: invoice.amountPaid >= invoice.totalPayable ? "#f1f8f4" : "#fff3e0", borderRadius: 1, border: `1px solid ${invoice.amountPaid >= invoice.totalPayable ? "#4CAF50" : "#ff9800"}` }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, color: "#666" }}>
                                    Payment Status:
                                </Typography>
                                <Chip
                                    label={invoice.amountPaid >= invoice.totalPayable ? "PAID" : invoice.amountPaid > 0 ? "PARTIALLY PAID" : "UNPAID"}
                                    color={invoice.amountPaid >= invoice.totalPayable ? "success" : invoice.amountPaid > 0 ? "warning" : "error"}
                                    sx={{ fontWeight: 700, fontSize: "0.875rem" }}
                                />
                            </Box>

                            {/* Amount Paid - Always Show */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
                                <Typography variant="body1" sx={{ color: "#666" }}>Amount Paid:</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: invoice.amountPaid > 0 ? "#4CAF50" : "#999" }}>
                                    {formatCurrency(invoice.amountPaid || 0)}
                                </Typography>
                            </Box>

                            {/* Balance Due - Always Show */}
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body1" sx={{ color: "#666", fontWeight: 600 }}>Balance Due:</Typography>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        fontWeight: 700, 
                                        color: (invoice.totalPayable - (invoice.amountPaid || 0)) > 0 ? "#f57c00" : "#4CAF50",
                                        fontSize: "1.1rem"
                                    }}
                                >
                                    {formatCurrency(invoice.totalPayable - (invoice.amountPaid || 0))}
                                </Typography>
                            </Box>
                            
                            {/* Payment Status Note */}
                            {(invoice.totalPayable - (invoice.amountPaid || 0)) > 0 && (
                                <Box sx={{ marginTop: 2, padding: "8px 12px", backgroundColor: "#fff3e0", borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ color: "#f57c00", fontStyle: "italic" }}>
                                        ⚠️ This invoice has an unpaid balance and will appear in payment reminders.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Footer Note */}
                    <Box sx={{ marginTop: 4, padding: 2, backgroundColor: "#f8f9fa", borderRadius: 1, textAlign: "center" }}>
                        <Typography variant="body2" sx={{ color: "#666", fontStyle: "italic" }}>
                            Thank you for choosing Utpala Ayurdhama. For any queries, please contact our reception.
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Payment Dialog */}
            <Dialog open={paymentDialogOpen} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PaymentIcon sx={{ color: "#ff9800" }} />
                    Record Payment
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Invoice Number: <strong>{invoice?.invoiceNumber}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Patient: <strong>{invoice?.patient?.user?.name || "N/A"}</strong>
                        </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            <strong>Total Payable:</strong> {formatCurrency(invoice?.totalPayable || 0)}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Amount Paid:</strong> {formatCurrency(invoice?.amountPaid || 0)}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 2, color: "#f57c00", fontWeight: 700 }}>
                            Balance Due: {formatCurrency((invoice?.totalPayable || 0) - (invoice?.amountPaid || 0))}
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        label="Payment Amount"
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        variant="outlined"
                        sx={{ mt: 2 }}
                        inputProps={{ min: 0, step: 0.01 }}
                        helperText={`Maximum: ${formatCurrency((invoice?.totalPayable || 0) - (invoice?.amountPaid || 0))}`}
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePaymentDialog} disabled={isRecordingPayment}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRecordPayment}
                        variant="contained"
                        disabled={isRecordingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
                        sx={{
                            backgroundColor: "#ff9800",
                            "&:hover": {
                                backgroundColor: "#f57c00",
                            },
                        }}
                    >
                        {isRecordingPayment ? "Recording..." : "Record Payment"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .invoice-details-page {
                        padding: 0 !important;
                    }
                    .MuiBox-root:first-of-type,
                    .MuiCard-root button {
                        display: none !important;
                    }
                    .MuiCard-root {
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </Box>
    );
}

export default InvoiceDetails;

