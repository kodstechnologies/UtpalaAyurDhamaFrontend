import { useState, useMemo } from "react";
import { Box, Typography, TablePagination } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";
import paymentService from "../../../services/paymentService";
import logo from "../../../assets/logo/logo2.png";

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
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { handlePrint } from "./ReportsGenerator";

function Reports_View() {
    const [reportData, setReportData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 25,
        total: 0,
    });

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

    // Safe date parser helper
    const safeParseDate = (dateString) => {
        if (!dateString) return null;
        
        let date;
        // Handle DD-MM-YYYY format (e.g., "28-03-2026")
        if (typeof dateString === 'string' && /^\d{2}-\d{2}-\d{4}/.test(dateString)) {
            const [day, month, year] = dateString.split('-');
            // Re-order to YYYY-MM-DD for reliable parsing
            date = new Date(`${year}-${month}-${day}`);
        } else {
            // Fallback for ISO or other standard formats
            date = new Date(dateString);
        }
        
        return isNaN(date.getTime()) ? null : date;
    };

    // Format date
    const formatDate = (dateString) => {
        const date = safeParseDate(dateString);
        if (!date) return "N/A";
        
        return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Format date for display
    const formatDateDisplay = (dateString) => {
        const date = safeParseDate(dateString);
        if (!date) return "N/A";

        return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Handle generate report
    const handleGenerateReport = async (pageOverride = null, rowsPerPageOverride = null) => {
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

            const currentPage = pageOverride !== null ? pageOverride : pagination.page;
            const currentRowsPerPage = rowsPerPageOverride !== null ? rowsPerPageOverride : pagination.rowsPerPage;

            const response = await paymentService.getPaymentReport({
                startDate: startDateISO,
                endDate: endDateISO,
                format: "json",
                page: currentPage + 1, // Backend uses 1-based pagination
                limit: currentRowsPerPage,
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
                
                // Update pagination metadata
                let totalCount = 0;
                if (response.meta && response.meta.total !== undefined && response.meta.total !== null) {
                    const metaTotal = Number(response.meta.total);
                    if (!isNaN(metaTotal) && metaTotal >= 0) {
                        totalCount = metaTotal;
                    } else {
                        // Fallback to transactions length if meta.total is invalid
                        totalCount = formattedTransactions.length || 0;
                    }
                } else {
                    // Fallback: use transactions length if meta is not available
                    totalCount = formattedTransactions.length || 0;
                }
                
                setPagination(prev => ({
                    ...prev,
                    total: totalCount,
                    page: pageOverride !== null ? pageOverride : prev.page,
                    rowsPerPage: rowsPerPageOverride !== null ? rowsPerPageOverride : prev.rowsPerPage,
                }));

                if (formattedTransactions.length === 0) {
                    toast.info("No transactions found for the selected date range.");
                } else {
                    toast.success(`Report generated successfully. Found ${response.meta?.total || formattedTransactions.length} transaction(s).`);
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
    
    // Reset pagination when date range changes
    const handleDateChange = () => {
        setPagination(prev => ({ ...prev, page: 0 }));
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

 
    // Get payment method icon and color (₹ for Cash to match INR amounts)
    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case "Cash":
                return (
                    <span className="me-1" style={{ fontSize: "1rem", fontWeight: 600 }} aria-label="Rupee">
                        ₹
                    </span>
                );
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
                    @page {
                        margin: 0;
                        size: A4;
                    }
                    @media print {
                        /* Remove browser print headers and footers */
                        @page {
                            margin: 0;
                            size: A4;
                        }
                        /* Try to hide browser print headers/footers using CSS */
                        @page {
                            margin: 0;
                        }
                        /* Hide any browser-generated print elements */
                        body::before,
                        body::after {
                            display: none !important;
                        }
                        /* Hide browser print headers/footers */
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
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
                            padding: 0 20px !important;
                            padding-top: 0 !important;
                            margin: 0 !important;
                            margin-top: 0 !important;
                        }
                        #printable-area .card {
                            margin: 0 !important;
                            padding: 0 !important;
                            box-shadow: none !important;
                            border: none !important;
                        }
                        #printable-area .card-body {
                            padding: 0 !important;
                        }
                        #printable-area .card-body > div:first-child {
                            margin-top: 0 !important;
                            margin-bottom: 0 !important;
                            padding-top: 0 !important;
                            padding-bottom: 0 !important;
                        }
                        #printable-area .card-body > div:first-child .MuiBox-root {
                            margin-bottom: 0 !important;
                            padding-bottom: 0 !important;
                            margin-top: 0 !important;
                            padding-top: 0 !important;
                        }
                        #printable-area .MuiBox-root[class*="MuiBox-root"] {
                            margin-top: 0 !important;
                        }
                        #printable-area img {
                            height: 150px !important;
                        }
                        #printable-area h4 {
                            font-size: 1.5rem !important;
                            margin-bottom: 2px !important;
                        }
                        #printable-area h6 {
                            font-size: 1rem !important;
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
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            handleDateChange();
                                        }}
                                        max={endDate || undefined}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            handleDateChange();
                                        }}
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
                    <Box sx={{ marginTop: 4, "@media print": { marginTop: "0 !important" } }} id="printable-area">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                {/* Header Section with Logo and Title */}
                                {/* Header Section with Logo and Period */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 3,
                                        pb: 3,
                                        borderBottom: "2px solid #e0e0e0",
                                        "@media print": {
                                            marginTop: "0 !important",
                                            paddingTop: "0 !important",
                                            marginBottom: "5px !important",
                                            paddingBottom: "0 !important",
                                        },
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={logo}
                                        alt="Utpala Ayurdhama"
                                        sx={{
                                            height: { xs: "100px", md: "120px" },
                                            width: "auto",
                                            objectFit: "contain",
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#666", fontWeight: 500, textAlign: "right" }}
                                    >
                                        Period: {formatDateDisplay(startDate)} - {formatDateDisplay(endDate)}
                                    </Typography>
                                </Box>

                                {/* Title and Actions Section */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 4,
                                        flexWrap: "wrap",
                                        gap: 2,
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#2d2d2d",
                                            mb: 0,
                                            fontSize: { xs: "1.5rem", md: "2rem" },
                                        }}
                                    >
                                        Transaction Details
                                    </Typography>
                                    <Box className="no-print d-flex gap-2">
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
                                            onClick={() => handlePrint(startDate, endDate)}
                                        >
                                            <PrintIcon className="me-2" />
                                            Print / PDF
                                        </button>
                                    </Box>
                                </Box>

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
                                        <tfoot style={{ borderTop: "2px solid #e0e0e0" }}>
                                            <tr>
                                                <td colSpan="4" style={{ fontSize: "0.875rem", fontWeight: 600, textAlign: "right", paddingTop: "12px" }}>
                                                    Total Credit:
                                                </td>
                                                <td style={{ fontSize: "0.875rem", fontWeight: 600, textAlign: "right", color: "#198754", paddingTop: "12px" }}>
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
                                
                                {/* Pagination */}
                                {!loading && reportData.length > 0 && (
                                    <TablePagination
                                        component="div"
                                        count={typeof pagination.total === 'number' && !isNaN(pagination.total) ? pagination.total : reportData.length}
                                        page={typeof pagination.page === 'number' && !isNaN(pagination.page) ? pagination.page : 0}
                                        rowsPerPage={typeof pagination.rowsPerPage === 'number' && !isNaN(pagination.rowsPerPage) ? pagination.rowsPerPage : 25}
                                        onPageChange={(_, newPage) => {
                                            setPagination(prev => ({ ...prev, page: newPage }));
                                            // Refetch report with new page after state update
                                            setTimeout(() => {
                                                if (hasGenerated && startDate && endDate) {
                                                    handleGenerateReport(newPage, pagination.rowsPerPage);
                                                }
                                            }, 0);
                                        }}
                                        onRowsPerPageChange={(e) => {
                                            const newRowsPerPage = parseInt(e.target.value, 10);
                                            setPagination(prev => ({
                                                ...prev,
                                                rowsPerPage: newRowsPerPage,
                                                page: 0
                                            }));
                                            // Refetch report with new rows per page after state update
                                            setTimeout(() => {
                                                if (hasGenerated && startDate && endDate) {
                                                    handleGenerateReport(0, newRowsPerPage);
                                                }
                                            }, 0);
                                        }}
                                        rowsPerPageOptions={[10, 25, 50, 100]}
                                        labelRowsPerPage="Rows per page:"
                                    />
                                )}
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
