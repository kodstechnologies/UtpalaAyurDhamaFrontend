import React from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Divider,
    Button,
    IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import logo from "../../../assets/logo/logo.webp";
function ReportDetailsCard({
    onClose = () => { },

    // Patient & Invoice Info
    invoiceNumber = "INVOICE-20251125-0001",
    invoiceDate = "12/09/2025",
    patientName = "Sharavni",
    dob = "11/18/2025",
    patientId = "P-0001",

    // Table Data
    service = "Ashwagandha Tablet",
    serviceDate = "12/09/2025",
    cost = "₹120.00",

    totalDue = "₹123.60",

    instructions = "Please make payment via online portal, check, or credit card. For inquiries, contact us at +91 72591 95959. Thank you!"
}) {

    const handlePrint = () => {
        window.print();
    };

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                border: "1px solid var(--color-border-dark)",
                p: 2,
                overflowY: "auto",
            }}
        >
            {/* HEADER */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

                    <IconButton onClick={onClose} sx={{ color: "var(--color-error)" }}>
                        <CloseIcon />
                    </IconButton>
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
                        {/* Logo */}
                        <Box
                            component="img"
                            src={logo}
                            alt="Clinic Logo"
                            sx={{
                                height: "3.2rem",
                                width: "3.2rem",
                                objectFit: "contain",
                                borderRadius: "50%",
                                border: "2px solid rgba(255,255,255,0.3)",
                                p: 0.5,
                                bgcolor: "var(--color-bg-card)",
                            }}
                        />

                        {/* Text */}
                        <Box>
                            <Typography sx={{ fontSize: "1.25rem", fontWeight: 700 }}>
                                Utpalaayurdhama
                            </Typography>

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


                {/* Invoice Number + Date */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
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

                    {/* DATA ROW */}
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
                </Box>

                {/* TOTAL */}
                <Typography sx={{ mt: 2, fontWeight: 700, color: "var(--color-text-dark)" }}>
                    Total Amount Due: <span style={{ color: "var(--color-success)" }}>{totalDue}</span>
                </Typography>

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
    );
}

export default ReportDetailsCard;
