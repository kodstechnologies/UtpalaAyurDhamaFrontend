import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Divider, Button, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import PrintIcon from "@mui/icons-material/Print";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HeadingCard from "../../../components/card/HeadingCard";
import invoiceService from "../../../services/invoiceService";
import logo from "../../../assets/logo/LOGO.WEBP";

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
        dob: searchParams.get("dob") || "11/18/2025",
        patientId: searchParams.get("patientId") || "P-0001",
        service: searchParams.get("service") || "Ashwagandha Tablet",
        serviceDate: searchParams.get("serviceDate") || "12/09/2025",
        cost: searchParams.get("cost") || "₹120.00",
        totalDue: searchParams.get("totalDue") || "₹123.60",
        items: null, // Will be set from backend or URL params
        instructions: searchParams.get("instructions") || 
            "Please make payment by 12/24/2025 via online portal, check, or credit card. For inquiries, contact us at 5465647658. Thank you!",
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
                const patientId = inv.patient?.patientId || inv.patient?._id || "N/A";
                const dob = inv.patient?.dateOfBirth 
                    ? new Date(inv.patient.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
                    : "N/A";
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
                    dob: dob,
                    patientId: patientId,
                    items: formattedItems,
                    subtotal: subtotal,
                    discountRate: discountRate,
                    discountAmount: discountAmount,
                    taxRate: taxRate,
                    taxAmount: taxAmount,
                    totalDue: `₹${(inv.totalPayable || 0).toFixed(2)}`,
                    instructions: "Please make payment via online portal, check, or credit card. For inquiries, contact us at 5465647658. Thank you!",
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
    const { invoiceNumber, invoiceDate, patientName, dob, patientId, service, serviceDate, cost, totalDue, instructions, subtotal, discountRate, discountAmount, taxRate, taxAmount } = invoiceData;

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
            {/* Print Styles */}
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
                        
                        /* Remove shadows, borders, and padding for clean print */
                        .invoice-print-container .MuiCard-root {
                            box-shadow: none !important;
                            border: none !important;
                            padding: 20px !important;
                            margin: 0 !important;
                            background: white !important;
                        }
                        
                        .invoice-print-container .MuiBox-root {
                            background: white !important;
                        }
                        
                        /* Remove background colors that don't print well */
                        .invoice-print-container [style*="background"] {
                            background: white !important;
                        }
                        
                        /* Ensure text is black for better print quality */
                        .invoice-print-container * {
                            color: #000 !important;
                        }
                        
                        /* Keep colored elements for important info */
                        .invoice-print-container [style*="color: var(--color-success)"] {
                            color: #000 !important;
                            font-weight: bold !important;
                        }
                        
                        /* Page setup */
                        @page {
                            size: A4;
                            margin: 1.5cm;
                        }
                        
                        /* Ensure proper page breaks */
                        .invoice-print-container {
                            page-break-after: avoid;
                            page-break-inside: avoid;
                        }
                        
                        /* Print-friendly layout */
                        html, body {
                            width: 100%;
                            height: auto;
                            margin: 0;
                            padding: 0;
                        }
                        
                        /* Ensure images print */
                        img {
                            max-width: 100%;
                            height: auto;
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
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: 2,
                                        px: 2,
                                        bgcolor: "var(--color-primary-light)",
                                        color: "var(--color-text-dark)",
                                        "&:hover": {
                                            bgcolor: "var(--color-primary)",
                                            color: "white",
                                        }
                                    }}
                                >
                                    Print
                                </Button>

                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(-1)}
                                    sx={{
                                        borderRadius: "10px",
                                        px: 3,
                                        py: 1,
                                    }}
                                >
                                    Close
                                </Button>
                            </Box>
                        </Box>

                    {/* MAIN CARD CONTENT */}
                    <CardContent>
                        {/* INVOICE TOP SECTION */}
                        <Box
                            sx={{
                                bgcolor: "var(--color-bg-header)",
                                color: "var(--color-text-header)",
                                p: 3,
                                borderRadius: 2,
                                mb: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            {/* LEFT SIDE — LOGO + CLINIC INFO */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                {/* Logo - Larger size */}
                                <Box
                                    component="img"
                                    src={logo}
                                    alt="Utpalaayurdhama"
                                    sx={{
                                        height: { xs: "6rem", md: "8rem" },
                                        width: { xs: "6rem", md: "8rem" },
                                        objectFit: "contain",
                                        borderRadius: "50%",
                                        border: "2px solid rgba(255,255,255,0.3)",
                                        p: 0.5,
                                        bgcolor: "var(--color-bg-card)",
                                    }}
                                />

                                {/* Contact Info - Text only, no clinic name */}
                                <Box>
                                    <Typography sx={{ fontSize: "0.85rem", opacity: 0.9, lineHeight: 1.4 }}>
                                        contact@utpala.com <br />
                                        5465647658 • utpalaayurdhama.com
                                    </Typography>
                                </Box>
                            </Box>

                            {/* RIGHT SIDE — INVOICE INFO */}
                            <Box sx={{ textAlign: "right" }}>
                                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                                    Invoice Number:
                                </Typography>
                                <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
                                    {invoiceNumber}
                                </Typography>

                                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", mt: 1 }}>
                                    Date:
                                </Typography>
                                <Typography sx={{ fontSize: "1rem" }}>
                                    {invoiceDate}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Invoice Number + Date - Hidden in print (duplicate info) */}
                        <Box className="no-print" sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                            <Typography sx={{ color: "var(--color-text-dark)" }}>
                                <b>Invoice Number:</b> {invoiceNumber}
                            </Typography>
                            <Typography sx={{ color: "var(--color-text-dark)" }}>
                                <b>Date:</b> {invoiceDate}
                            </Typography>
                        </Box>

                        {/* Patient Information */}
                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ color: "var(--color-text-dark)" }}>
                                <b>Name:</b> {patientName}
                            </Typography>
                            <Typography sx={{ color: "var(--color-text-dark)" }}>
                                <b>Date of Birth:</b> {dob}
                            </Typography>
                            <Typography sx={{ color: "var(--color-text-dark)" }}>
                                <b>Patient ID:</b> {patientId}
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* SERVICES TABLE */}
                        <Box
                            sx={{
                                border: "1px solid var(--color-border)",
                            }}
                        >
                            {/* HEADER ROW */}
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                    bgcolor: "var(--color-bg-hover)",
                                    p: 1.5,
                                    fontWeight: 700,
                                    color: "var(--color-text-dark)",
                                }}
                            >
                                <span>Service Description</span>
                                <span>Date</span>
                                <span>Cost (INR)</span>
                            </Box>

                            {/* DATA ROWS */}
                            {invoiceData.items && invoiceData.items.length > 0 ? (
                                invoiceData.items.map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr 1fr",
                                            p: 1.5,
                                            color: "var(--color-text-dark)",
                                            borderTop: index > 0 ? "1px solid var(--color-border)" : "none",
                                        }}
                                    >
                                        <span>{item.name}</span>
                                        <span>{item.date}</span>
                                        <span>{item.cost}</span>
                                    </Box>
                                ))
                            ) : (
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr 1fr",
                                        p: 1.5,
                                        color: "var(--color-text-dark)",
                                    }}
                                >
                                    <span>{service}</span>
                                    <span>{serviceDate}</span>
                                    <span>{cost}</span>
                                </Box>
                            )}
                        </Box>

                        {/* TOTALS BREAKDOWN */}
                        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                            {subtotal !== undefined && (
                                <>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Typography sx={{ color: "var(--color-text-dark)" }}>
                                            Subtotal:
                                        </Typography>
                                        <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 500 }}>
                                            ₹{subtotal.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    {discountRate > 0 && discountAmount !== undefined && (
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography sx={{ color: "var(--color-text-dark)" }}>
                                                Discount ({discountRate}%):
                                            </Typography>
                                            <Typography sx={{ color: "var(--color-success)", fontWeight: 500 }}>
                                                - ₹{discountAmount.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    )}
                                    {taxRate > 0 && taxAmount !== undefined && (
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography sx={{ color: "var(--color-text-dark)" }}>
                                                GST ({taxRate}%):
                                            </Typography>
                                            <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 500 }}>
                                                ₹{taxAmount.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Divider sx={{ my: 1 }} />
                                </>
                            )}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography sx={{ fontWeight: 700, color: "var(--color-text-dark)" }}>
                                    Total Amount Due:
                                </Typography>
                                <Typography sx={{ fontWeight: 700, color: "var(--color-success)", fontSize: "1.1rem" }}>
                                    {totalDue}
                                </Typography>
                            </Box>
                        </Box>

                        {/* INSTRUCTIONS */}
                        <Box sx={{ mt: 3 }}>
                            <Typography sx={{ fontWeight: 600, color: "var(--color-text-dark)" }}>
                                Payment Instructions:
                            </Typography>
                            <Typography sx={{ color: "var(--color-text-muted)", mt: 0.5 }}>
                                {instructions}
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

