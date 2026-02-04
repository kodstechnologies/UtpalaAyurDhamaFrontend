import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Divider, Button, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import PrintIcon from "@mui/icons-material/Print";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HeadingCard from "../../../components/card/HeadingCard";
import invoiceService from "../../../services/invoiceService";
import logo from "../../../assets/logo/logo.webp";

function InvoicePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { id } = useParams(); // Get invoice ID from route params

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(false);

    // Initialize with defaults (for backward compatibility with URL params)
    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: searchParams.get("invoiceNumber") || "INVOICE-20251125-0001",
        invoiceDate: searchParams.get("invoiceDate") || "12/09/2025",
        patientName: searchParams.get("patientName") || "Sharavni",
        patientId: searchParams.get("patientId") || "P-0001",
        service: searchParams.get("service") || "Ashwagandha Tablet",
        serviceDate: searchParams.get("serviceDate") || "12/09/2025",
        cost: searchParams.get("cost") || "₹120.00",
        totalDue: searchParams.get("totalDue") || "₹123.60",
        items: null, // Will be set from backend or URL params
        instructions: searchParams.get("instructions") ||
            "Please make payment via online portal, check, or credit card. For inquiries, contact us at +91 72591 95959. Thank you!",
    });

    useEffect(() => {
        // If ID is provided, fetch invoice data from backend
        if (id) {
            fetchInvoiceData(id);
        }
    }, [id]);

    const fetchInvoiceData = async (invoiceId) => {
        try {
            setLoading(true);
            const response = await invoiceService.getInvoiceById(invoiceId);
            if (response && response.success && response.data) {
                const inv = response.data;
                const patientName = inv.patient?.user?.name || inv.patient?.name || "N/A";
                // Use formatted patientId, not MongoDB _id
                const patientId = inv.patient?.patientId || (inv.patient?.user?.uhid ? `UHID: ${inv.patient.user.uhid}` : "N/A");
                const invoiceDate = inv.createdAt
                    ? new Date(inv.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
                    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

                // Format items for display
                const items = inv.items || [];
                const formattedItems = items.length > 0
                    ? items.map(item => ({
                        name: item.name || "Service",
                        date: invoiceDate,
                        cost: `₹${(item.total || 0).toFixed(2)}`
                    }))
                    : [{ name: "Service", date: invoiceDate, cost: `₹${(inv.totalPayable || 0).toFixed(2)}` }];

                // Calculate discount and tax amounts
                const subtotal = inv.subtotal || 0;
                const discountRate = inv.discountRate || 0;
                const taxRate = inv.taxRate || 0;
                const discountAmount = subtotal * (discountRate / 100);
                const taxableAmount = subtotal - discountAmount;
                const taxAmount = taxableAmount * (taxRate / 100);

                setInvoice(inv);
                setInvoiceData({
                    invoiceNumber: inv.invoiceNumber || "N/A",
                    invoiceDate: invoiceDate,
                    patientName: patientName,
                    patientId: patientId,
                    items: formattedItems,
                    subtotal: subtotal,
                    discountRate: discountRate,
                    discountAmount: discountAmount,
                    taxRate: taxRate,
                    taxAmount: taxAmount,
                    totalDue: `₹${(inv.totalPayable || 0).toFixed(2)}`,
                    instructions: "Please make payment via online portal, check, or credit card. For inquiries, contact us at +91 72591 95959. Thank you!",
                });
            } else {
                toast.error("Failed to fetch invoice data.");
            }
        } catch (error) {
            console.error("Error fetching invoice:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch invoice data.");
        } finally {
            setLoading(false);
        }
    };

    // Use invoiceData state (which is either from URL params or fetched from backend)
    const { invoiceNumber, invoiceDate, patientName, patientId, service, serviceDate, cost, totalDue, instructions, subtotal, discountRate, discountAmount, taxRate, taxAmount } = invoiceData;

    const handlePrint = () => {
        window.print();
    };

    // Show loading state
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            {/* Professional Print Styles */}
            <style>
                {`
                    @media print {
                        /* Hide all navigation and UI elements */
                        body * {
                            visibility: hidden;
                        }
                        
                        /* Hide sidebar, header, breadcrumbs, and all app navigation */
                        nav, header, aside, .MuiDrawer-root, .MuiAppBar-root,
                        [class*="sidebar"], [class*="Sidebar"], [class*="header"],
                        [class*="Header"], [class*="breadcrumb"], [class*="Breadcrumb"],
                        [class*="MuiDrawer"], [class*="MuiAppBar"], [class*="MuiToolbar"] {
                            display: none !important;
                            visibility: hidden !important;
                        }
                        
                        /* Show only invoice content */
                        .invoice-print-container,
                        .invoice-print-container * {
                            visibility: visible;
                        }
                        
                        .invoice-print-container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            margin: 0;
                            padding: 0;
                            background: white;
                            box-shadow: none;
                        }
                        
                        /* Hide action buttons and navigation during print */
                        .no-print {
                            display: none !important;
                            visibility: hidden !important;
                        }
                        
                        /* Professional invoice card styling */
                        .invoice-print-container .MuiCard-root {
                            box-shadow: none !important;
                            border: 2px solid #e0e0e0 !important;
                            padding: 30px !important;
                            margin: 0 !important;
                            background: white !important;
                            page-break-inside: avoid;
                        }
                        
                        /* Professional header styling */
                        .invoice-header {
                            background: linear-gradient(135deg, #8B5A3C 0%, #6B4423 100%) !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color: white !important;
                        }
                        
                        .invoice-header * {
                            color: white !important;
                        }
                        
                        /* Professional table styling */
                        .invoice-table-header {
                            background: #f5f5f5 !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            font-weight: 700 !important;
                        }
                        
                        .invoice-table-row {
                            border-bottom: 1px solid #e0e0e0 !important;
                        }
                        
                        .invoice-table-row:nth-child(even) {
                            background: #fafafa !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        
                        /* Professional totals section */
                        .invoice-totals {
                            border-top: 2px solid #333 !important;
                            padding-top: 15px !important;
                            margin-top: 20px !important;
                        }
                        
                        .invoice-total-amount {
                            font-size: 1.3rem !important;
                            font-weight: 700 !important;
                            color: #000 !important;
                        }
                        
                        /* Page setup */
                        @page {
                            size: A4;
                            margin: 1.5cm;
                        }
                        
                        /* Ensure proper page breaks */
                        .invoice-print-container {
                            page-break-after: avoid;
                        }
                        
                        .invoice-table {
                            page-break-inside: auto;
                        }
                        
                        .invoice-table-row {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        
                        /* Print-friendly layout */
                        html, body {
                            width: 100%;
                            height: auto;
                            margin: 0;
                            padding: 0;
                            background: white;
                        }
                        
                        /* Ensure images print */
                        img {
                            max-width: 100%;
                            height: auto;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        
                        /* Professional typography */
                        .invoice-print-container {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                            color: #000 !important;
                            line-height: 1.6 !important;
                        }
                        
                        /* Remove all colored backgrounds except header */
                        .invoice-print-container [style*="background"]:not(.invoice-header) {
                            background: white !important;
                        }
                        
                        /* Ensure text is readable */
                        .invoice-print-container * {
                            color: #000 !important;
                        }
                        
                        .invoice-header * {
                            color: white !important;
                        }
                        
                        /* Professional divider */
                        .invoice-divider {
                            border-color: #ddd !important;
                            margin: 20px 0 !important;
                        }
                    }
                `}
            </style>

            <Box>
                <Box className="no-print">
                    <HeadingCard
                        title="Invoice"
                        subtitle={`Invoice details for ${patientName}`}
                        breadcrumbItems={[
                            { label: "Home", url: "/" },
                            { label: "Patient", url: "/patient/dashboard" },
                            { label: "Medical Reports", url: "/patient/reports" },
                            { label: "Invoice" },
                        ]}
                    />
                </Box>

                <Box
                    className="invoice-print-container"
                    sx={{
                        backgroundColor: "var(--color-bg-a)",
                        borderRadius: "12px",
                        p: 3,
                        mt: 2,
                    }}
                >
                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            border: "1px solid var(--color-border-dark)",
                            p: 2,
                            overflowY: "auto",
                        }}
                    >
                        {/* HEADER - Hidden in print */}
                        <Box className="no-print" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <DescriptionOutlinedIcon sx={{ fontSize: 28, color: "var(--color-info)" }} />
                                <Typography variant="h6" sx={{ color: "var(--color-text-dark)", fontWeight: 700 }}>
                                    Invoice
                                </Typography>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Button
                                    onClick={handlePrint}
                                    startIcon={<PrintIcon />}
                                    variant="contained"
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1,
                                        bgcolor: "var(--color-icon-8)",
                                        color: "white",
                                        fontWeight: 600,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                        "&:hover": {
                                            bgcolor: "var(--color-icon-8-dark)",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                            transform: "translateY(-1px)",
                                        },
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    Print Invoice
                                </Button>

                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(-1)}
                                    sx={{
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1,
                                        fontWeight: 600,
                                        borderColor: "var(--color-border-dark)",
                                        color: "var(--color-text-dark)",
                                        "&:hover": {
                                            borderColor: "var(--color-icon-8)",
                                            bgcolor: "var(--color-bg-hover)",
                                        },
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    Close
                                </Button>
                            </Box>
                        </Box>

                        {/* MAIN CARD CONTENT */}
                        <CardContent>
                            {/* PROFESSIONAL INVOICE HEADER */}
                            <Box
                                className="invoice-header"
                                sx={{
                                    bgcolor: "var(--color-bg-header)",
                                    color: "var(--color-text-header)",
                                    p: 4,
                                    borderRadius: 3,
                                    mb: 3,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                }}
                            >
                                {/* LEFT SIDE — LOGO + CLINIC INFO */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                                    {/* Logo - Professional size */}
                                    <Box
                                        component="img"
                                        src={logo}
                                        alt="Utpala Ayurdhama"
                                        sx={{
                                            height: { xs: "80px", md: "100px" },
                                            width: { xs: "80px", md: "100px" },
                                            objectFit: "contain",
                                            borderRadius: "50%",
                                            border: "3px solid rgba(255,255,255,0.4)",
                                            p: 1,
                                            bgcolor: "rgba(255,255,255,0.1)",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                        }}
                                    />

                                    {/* Clinic Info */}
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: "1.1rem",
                                                fontWeight: 700,
                                                mb: 1,
                                                letterSpacing: "0.5px"
                                            }}
                                        >
                                            Utpala Ayurdhama
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.9rem", opacity: 0.95, lineHeight: 1.6 }}>
                                            contact@utpala.com<br />
                                            +91 5465647658<br />
                                            www.utpalaayurdhama.com
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* RIGHT SIDE — INVOICE INFO */}
                                <Box sx={{ textAlign: "right", minWidth: "200px" }}>
                                    <Typography
                                        sx={{
                                            fontSize: "0.75rem",
                                            opacity: 0.9,
                                            textTransform: "uppercase",
                                            letterSpacing: "1px",
                                            mb: 0.5
                                        }}
                                    >
                                        Invoice Number
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: "1.2rem",
                                            fontWeight: 700,
                                            mb: 2,
                                            letterSpacing: "0.5px"
                                        }}
                                    >
                                        {invoiceNumber}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "0.75rem",
                                            opacity: 0.9,
                                            textTransform: "uppercase",
                                            letterSpacing: "1px",
                                            mb: 0.5
                                        }}
                                    >
                                        Date
                                    </Typography>
                                    <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                                        {invoiceDate}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Patient Information Section */}
                            <Box
                                sx={{
                                    mb: 3,
                                    p: 2.5,
                                    bgcolor: "var(--color-bg-hover)",
                                    borderRadius: 2,
                                    border: "1px solid var(--color-border)"
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--color-text-muted)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        mb: 1.5
                                    }}
                                >
                                    Patient Information
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600, minWidth: "120px" }}>
                                            Name:
                                        </Typography>
                                        <Typography sx={{ color: "var(--color-text-dark)" }}>
                                            {patientName}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600, minWidth: "120px" }}>
                                            Patient ID:
                                        </Typography>
                                        <Typography sx={{ color: "var(--color-text-dark)" }}>
                                            {patientId}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* PROFESSIONAL SERVICES TABLE */}
                            <Box
                                className="invoice-table"
                                sx={{
                                    border: "1px solid var(--color-border)",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                }}
                            >
                                {/* HEADER ROW */}
                                <Box
                                    className="invoice-table-header"
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "2fr 1fr 1fr",
                                        bgcolor: "var(--color-bg-hover)",
                                        p: 2,
                                        fontWeight: 700,
                                        color: "var(--color-text-dark)",
                                        fontSize: "0.9rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 700 }}>Service Description</Typography>
                                    <Typography sx={{ fontWeight: 700, textAlign: "center" }}>Date</Typography>
                                    <Typography sx={{ fontWeight: 700, textAlign: "right" }}>Amount (₹)</Typography>
                                </Box>

                                {/* DATA ROWS */}
                                {invoiceData.items && invoiceData.items.length > 0 ? (
                                    invoiceData.items.map((item, index) => (
                                        <Box
                                            key={index}
                                            className="invoice-table-row"
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: "2fr 1fr 1fr",
                                                p: 2,
                                                color: "var(--color-text-dark)",
                                                borderTop: index > 0 ? "1px solid var(--color-border)" : "none",
                                                bgcolor: index % 2 === 0 ? "white" : "var(--color-bg-a)",
                                                transition: "background-color 0.2s",
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: 500 }}>{item.name}</Typography>
                                            <Typography sx={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                                                {item.date}
                                            </Typography>
                                            <Typography sx={{ textAlign: "right", fontWeight: 600 }}>
                                                {item.cost}
                                            </Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Box
                                        className="invoice-table-row"
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "2fr 1fr 1fr",
                                            p: 2,
                                            color: "var(--color-text-dark)",
                                        }}
                                    >
                                        <Typography sx={{ fontWeight: 500 }}>{service}</Typography>
                                        <Typography sx={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                                            {serviceDate}
                                        </Typography>
                                        <Typography sx={{ textAlign: "right", fontWeight: 600 }}>{cost}</Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* PROFESSIONAL TOTALS BREAKDOWN */}
                            <Box
                                className="invoice-totals"
                                sx={{
                                    mt: 3,
                                    p: 2.5,
                                    bgcolor: "var(--color-bg-hover)",
                                    borderRadius: 2,
                                    border: "1px solid var(--color-border)",
                                }}
                            >
                                {subtotal !== undefined && (
                                    <>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                            <Typography sx={{ color: "var(--color-text-dark)", fontSize: "0.95rem" }}>
                                                Subtotal:
                                            </Typography>
                                            <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600, fontSize: "0.95rem" }}>
                                                ₹{subtotal.toFixed(2)}
                                            </Typography>
                                        </Box>
                                        {discountRate > 0 && discountAmount !== undefined && (
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                                <Typography sx={{ color: "var(--color-text-dark)", fontSize: "0.95rem" }}>
                                                    Discount ({discountRate}%):
                                                </Typography>
                                                <Typography sx={{ color: "#d32f2f", fontWeight: 600, fontSize: "0.95rem" }}>
                                                    - ₹{discountAmount.toFixed(2)}
                                                </Typography>
                                            </Box>
                                        )}
                                        {taxRate > 0 && taxAmount !== undefined && (
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                                <Typography sx={{ color: "var(--color-text-dark)", fontSize: "0.95rem" }}>
                                                    GST ({taxRate}%):
                                                </Typography>
                                                <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600, fontSize: "0.95rem" }}>
                                                    ₹{taxAmount.toFixed(2)}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Divider className="invoice-divider" sx={{ my: 2, borderColor: "var(--color-border-dark)" }} />
                                    </>
                                )}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        pt: 1
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color: "var(--color-text-dark)",
                                            fontSize: "1.1rem",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}
                                    >
                                        Total Amount Due:
                                    </Typography>
                                    <Typography
                                        className="invoice-total-amount"
                                        sx={{
                                            fontWeight: 700,
                                            color: "var(--color-success)",
                                            fontSize: "1.4rem",
                                            letterSpacing: "0.5px"
                                        }}
                                    >
                                        {totalDue}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* PROFESSIONAL PAYMENT INSTRUCTIONS */}
                            <Box
                                sx={{
                                    mt: 3,
                                    p: 2.5,
                                    bgcolor: "var(--color-bg-a)",
                                    borderRadius: 2,
                                    border: "1px solid var(--color-border)",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 700,
                                        color: "var(--color-text-dark)",
                                        fontSize: "0.95rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        mb: 1.5
                                    }}
                                >
                                    Payment Instructions
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "var(--color-text-muted)",
                                        fontSize: "0.9rem",
                                        lineHeight: 1.7
                                    }}
                                >
                                    {instructions}
                                </Typography>
                            </Box>

                            {/* Footer Note */}
                            <Box sx={{ mt: 3, textAlign: "center" }}>
                                <Typography
                                    sx={{
                                        color: "var(--color-text-muted)",
                                        fontSize: "0.85rem",
                                        fontStyle: "italic"
                                    }}
                                >
                                    Thank you for choosing Utpala Ayurdhama
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </>
    );
}

export default InvoicePage;

