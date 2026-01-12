import { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";
import paymentService from "../../../services/paymentService";
import logo from "../../../assets/logo/logo.webp";

// Icons
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

function Reports_View() {
    const [reportData, setReportData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);

    // Calculate totals from report data (as fallback)
    const totals = useMemo(() => {
        if (summaryData) {
            // Use backend summary data
            return {
                credit: summaryData.totalIncome || 0,
                debit: summaryData.totalExpense || 0,
                balance: summaryData.netTotal || 0,
                transactionCount: reportData.length,
            };
        }
        // Fallback: calculate from report data
        const credit = reportData.filter((t) => t.type === "Credit" || t.type === "Income").reduce((sum, t) => sum + (t.amount || 0), 0);
        const debit = reportData.filter((t) => t.type === "Debit" || t.type === "Expense").reduce((sum, t) => sum + (t.amount || 0), 0);
        const balance = credit - debit;
        const transactionCount = reportData.length;
        return { credit, debit, balance, transactionCount };
    }, [reportData, summaryData]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Format date for display
    const formatDateDisplay = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Handle generate report
    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            toast.error("Please select both a start and end date.");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            toast.error("Start date cannot be after end date.");
            return;
        }
        try {
            setLoading(true);
            
            // Convert dates to ISO strings for API (YYYY-MM-DD format is fine, API will convert)
            // The backend validation expects ISO 8601 format
            const startDateObj = new Date(startDate);
            startDateObj.setHours(0, 0, 0, 0); // Set to start of day in local time
            const endDateObj = new Date(endDate);
            endDateObj.setHours(23, 59, 59, 999); // Set to end of day in local time
            
            const startDateISO = startDateObj.toISOString();
            const endDateISO = endDateObj.toISOString();

            console.log("Fetching report with dates:", { startDateISO, endDateISO });

            const response = await paymentService.getPaymentReport({
                startDate: startDateISO,
                endDate: endDateISO,
                format: "json",
            });

            console.log("Report API response:", response);

            if (response && response.success && response.data) {
                const { summary, transactions } = response.data;

                console.log("Report data:", { summary, transactionsCount: transactions?.length });

                // Map backend data to frontend format
                const formattedTransactions = (transactions || []).map((payment, index) => ({
                    id: payment._id || `payment-${index}`,
                    date: payment.date || payment.createdAt,
                    description: payment.description || "N/A",
                    type: payment.type === "Income" ? "Credit" : payment.type === "Expense" ? "Debit" : payment.type,
                    amount: payment.amount || 0,
                    paymentMethod: payment.paymentMethod || "N/A",
                    originalType: payment.type, // Keep original for reference
                }));

                setReportData(formattedTransactions);
                setSummaryData(summary || null);
                setHasGenerated(true);

                if (formattedTransactions.length === 0) {
                    toast.info("No transactions found for the selected date range.");
                } else {
                    toast.success(`Report generated successfully. Found ${formattedTransactions.length} transaction(s).`);
                }
            } else {
                console.error("Invalid response structure:", response);
                toast.error(response?.message || "Failed to generate report. Invalid response from server.");
            }
        } catch (error) {
            console.error("Error generating report:", error);
            console.error("Error details:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to generate report.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle download Excel
    const handleDownloadExcel = async () => {
        if (!startDate || !endDate) {
            toast.error("Please select a date range first.");
            return;
        }
        try {
            // Convert dates to ISO strings for API
            const startDateISO = new Date(startDate).toISOString();
            const endDateISO = new Date(endDate).toISOString();

            const response = await paymentService.getPaymentReport({
                startDate: startDateISO,
                endDate: endDateISO,
                format: "excel",
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            const formattedStartDate = startDate.replace(/-/g, '');
            const formattedEndDate = endDate.replace(/-/g, '');
            const fileName = `payment_report_${formattedStartDate}_to_${formattedEndDate}.xlsx`;
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Excel file downloaded successfully!");
        } catch (error) {
            console.error("Error downloading Excel:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to download Excel file.");
        }
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Get payment method icon and color
    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case "Cash":
                return <AttachMoneyIcon fontSize="small" className="me-1" />;
            case "Online":
                return <AccountBalanceWalletIcon fontSize="small" className="me-1" />;
            case "Card":
                return <CreditScoreIcon fontSize="small" className="me-1" />;
            case "Bank Transfer":
                return <AccountBalanceWalletIcon fontSize="small" className="me-1" />;
            default:
                return null;
        }
    };

    const getPaymentMethodColor = () => {
        return "#D4A574"; // Brown/Tan color for all payment methods
    };

    // Get type icon and color
    const getTypeIcon = (type) => {
        return type === "Credit" || type === "Income" ? (
            <TrendingUpIcon fontSize="small" className="me-1" />
        ) : (
            <TrendingDownIcon fontSize="small" className="me-1" />
        );
    };

    const getTypeColor = (type) => {
        return type === "Credit" || type === "Income" ? "#198754" : "#dc3545"; // Green for Credit/Income, Red for Debit/Expense
    };

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Reports" },
    ];

    return (
        <>
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #printable-area, #printable-area * {
                            visibility: visible;
                        }
                        #printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>

            <Box sx={{ padding: "20px" }}>
                {/* ⭐ Breadcrumb */}
                <Breadcrumb items={breadcrumbItems} />

                {/* ⭐ Page Heading */}
                <HeadingCardingCard
                    category="FINANCIAL REPORTS"
                    title="Generate & Analyze Payment Reports"
                    subtitle="Generate and analyze payment transactions with detailed debit-credit reports"
                />

                {/* ⭐ Date Filter Section */}
                <Box sx={{ marginTop: 4 }}>
                    <div className="card shadow-sm no-print">
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <CalendarTodayIcon sx={{ color: "#D4A574" }} />
                                <h5 className="card-title mb-0">Select Date Range</h5>
                            </div>
                            <div className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        max={endDate || undefined}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate || undefined}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <button
                                        type="button"
                                        className="btn w-100"
                                        style={{
                                            backgroundColor: "var(--color-btn-bg)",
                                            color: "white"
                                        }}
                                        onClick={handleGenerateReport}
                                        disabled={loading || !startDate || !endDate}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <DescriptionIcon className="me-2" />
                                                Generate Report
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Box>

                {/* ⭐ Summary Cards */}
                {hasGenerated && reportData.length > 0 && (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                md: "repeat(4, 1fr)",
                            },
                            gap: "15px",
                            marginTop: 4,
                        }}
                        className="no-print"
                    >
                        <DashboardCard
                            title="Total Credit"
                            count={totals.credit}
                            prefix="₹"
                            icon={CreditScoreIcon}
                        />
                        <DashboardCard
                            title="Total Debit"
                            count={totals.debit}
                            prefix="₹"
                            icon={MoneyOffIcon}
                        />
                        <DashboardCard
                            title="Net Balance"
                            count={totals.balance}
                            prefix="₹"
                            icon={AccountBalanceIcon}
                        />
                        <DashboardCard
                            title="Total Transactions"
                            count={totals.transactionCount}
                            icon={ReceiptLongIcon}
                        />
                    </Box>
                )}

                {/* ⭐ Report Table Section */}
                {hasGenerated && reportData.length > 0 && (
                    <Box sx={{ marginTop: 4 }} id="printable-area">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                {/* Header Section with Logo and Title */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 4,
                                        pb: 3,
                                        borderBottom: "2px solid #e0e0e0",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Box
                                            component="img"
                                            src={logo}
                                            alt="Utpala Ayurdham"
                                            sx={{
                                                height: { xs: "60px", md: "80px" },
                                                width: "auto",
                                                objectFit: "contain",
                                            }}
                                        />
                                        <Box>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: "#2d2d2d",
                                                    mb: 0.5,
                                                    fontSize: { xs: "1.5rem", md: "2rem" },
                                                }}
                                            >
                                                Utpala Ayurdham
                                            </Typography>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "#666",
                                                    fontSize: { xs: "1rem", md: "1.25rem" },
                                                }}
                                            >
                                                Transaction Details
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box
                                        className="no-print"
                                        sx={{
                                            display: { xs: "none", md: "flex" },
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#666", fontWeight: 500 }}
                                        >
                                            Period: {formatDateDisplay(startDate)} - {formatDateDisplay(endDate)}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Period info for mobile/print */}
                                <Box
                                    sx={{
                                        mb: 3,
                                        pb: 2,
                                        borderBottom: "1px solid #e0e0e0",
                                        display: { xs: "block", md: "none" },
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                                        Period: {formatDateDisplay(startDate)} - {formatDateDisplay(endDate)}
                                    </Typography>
                                </Box>

                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom no-print">
                                    <div className="d-flex gap-2 mt-3 mt-md-0">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={handleDownloadExcel}
                                        >
                                            <DownloadIcon className="me-2" />
                                            Export Excel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={handlePrint}
                                        >
                                            <PrintIcon className="me-2" />
                                            Print / PDF
                                        </button>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th style={{ fontSize: "0.875rem" }}>Date</th>
                                                <th style={{ fontSize: "0.875rem" }}>Description</th>
                                                <th style={{ fontSize: "0.875rem" }}>Payment Method</th>
                                                <th style={{ fontSize: "0.875rem" }}>Type</th>
                                                <th style={{ fontSize: "0.875rem", textAlign: "right" }}>Amount (INR)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.map((transaction) => (
                                                <tr key={transaction.id}>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <CalendarTodayIcon fontSize="small" sx={{ color: "#6c757d" }} />
                                                            <span>{formatDate(transaction.date)}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        <strong>{transaction.description}</strong>
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        <div className="d-flex align-items-center" style={{ color: getPaymentMethodColor() }}>
                                                            {getPaymentMethodIcon(transaction.paymentMethod)}
                                                            <span style={{ fontWeight: 500 }}>
                                                                {transaction.paymentMethod}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem" }}>
                                                        <div className="d-flex align-items-center" style={{ color: getTypeColor(transaction.type) }}>
                                                            {getTypeIcon(transaction.type)}
                                                            <span style={{ fontWeight: 500 }}>
                                                                {transaction.type}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 600 }}>
                                                        {formatCurrency(transaction.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="4" style={{ fontSize: "0.875rem", fontWeight: 600, textAlign: "right" }}>
                                                    Total Credit:
                                                </td>
                                                <td style={{ fontSize: "0.875rem", fontWeight: 600, textAlign: "right", color: "#198754" }}>
                                                    {formatCurrency(totals.credit)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan="4" style={{ fontSize: "0.875rem", fontWeight: 600, textAlign: "right" }}>
                                                    Total Debit:
                                                </td>
                                                <td style={{ fontSize: "0.875rem", fontWeight: 600, textAlign: "right", color: "#dc3545" }}>
                                                    {formatCurrency(totals.debit)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan="4" style={{ fontSize: "0.875rem", fontWeight: 700, textAlign: "right" }}>
                                                    Net Balance:
                                                </td>
                                                <td
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: 700,
                                                        textAlign: "right",
                                                        color: totals.balance >= 0 ? "#198754" : "#dc3545",
                                                    }}
                                                >
                                                    {formatCurrency(totals.balance)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </Box>
                )}

                {/* ⭐ Empty State */}
                {hasGenerated && reportData.length === 0 && (
                    <Box sx={{ marginTop: 4 }}>
                        <div className="card shadow-sm">
                            <div className="card-body text-center py-5">
                                <div className="mb-3">
                                    <DescriptionIcon sx={{ fontSize: 64, color: "#6c757d" }} />
                                </div>
                                <h5 className="mb-2">No Transactions Found</h5>
                                <p className="text-muted mb-4">
                                    No payment transactions were found for the selected date range. Please try a different period.
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setStartDate("");
                                        setEndDate("");
                                        setHasGenerated(false);
                                        setReportData([]);
                                        setSummaryData(null);
                                    }}
                                >
                                    Select New Date Range
                                </button>
                            </div>
                        </div>
                    </Box>
                )}

                {/* ⭐ Initial State */}
                {!hasGenerated && (
                    <Box sx={{ marginTop: 4 }}>
                        <div className="card shadow-sm border-2 border-dashed">
                            <div className="card-body text-center py-5">
                                <div className="mb-3">
                                    <CalendarTodayIcon sx={{ fontSize: 64, color: "#D4A574" }} />
                                </div>
                                <h5 className="mb-2">Ready to Generate Report</h5>
                                <p className="text-muted">
                                    Select a date range above and click "Generate Report" to view payment transactions.
                                </p>
                            </div>
                        </div>
                    </Box>
                )}
            </Box>
        </>
    );
}

export default Reports_View;
