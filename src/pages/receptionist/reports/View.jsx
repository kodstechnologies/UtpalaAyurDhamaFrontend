import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";

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

// Mock data - will be replaced with API calls later
// Generate mock transactions for various dates including December 2025
const generateMockTransactions = () => {
    const transactions = [];
    const baseDate = new Date("2025-12-01");

    // Add transactions for December 2025
    for (let i = 0; i < 20; i++) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + i);

        const types = ["Credit", "Debit"];
        const paymentMethods = ["Cash", "Online", "Card"];
        const descriptions = [
            "Consultation Fee",
            "Room Booking Advance",
            "Medical Supplies Purchase",
            "Therapy Session Fee",
            "Equipment Maintenance",
            "Follow-up Visit",
            "Lab Test Charges",
            "Pharmacy Purchase",
            "Ward Charges",
            "Doctor Consultation",
        ];

        transactions.push({
            id: `txn-dec-${i + 1}`,
            date: date.toISOString().split("T")[0],
            description: descriptions[i % descriptions.length],
            type: types[i % 2],
            amount: Math.floor(Math.random() * 5000) + 100,
            paymentMethod: paymentMethods[i % 3],
        });
    }

    // Add some transactions from January 2025 as well
    const janTransactions = [
        {
            id: "txn-jan-1",
            date: "2025-01-20",
            description: "Consultation Fee for John Doe",
            type: "Credit",
            amount: 1500.0,
            paymentMethod: "Cash",
        },
        {
            id: "txn-jan-2",
            date: "2025-01-19",
            description: "Room Booking Advance - Amit Kumar",
            type: "Credit",
            amount: 2500.0,
            paymentMethod: "Online",
        },
        {
            id: "txn-jan-3",
            date: "2025-01-18",
            description: "Medical Supplies Purchase",
            type: "Debit",
            amount: 1500.0,
            paymentMethod: "Card",
        },
    ];

    return [...transactions, ...janTransactions];
};

const mockTransactions = generateMockTransactions();

function Reports_View() {
    const [reportData, setReportData] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);

    // Calculate totals
    const totals = useMemo(() => {
        const credit = reportData.filter((t) => t.type === "Credit").reduce((sum, t) => sum + t.amount, 0);
        const debit = reportData.filter((t) => t.type === "Debit").reduce((sum, t) => sum + t.amount, 0);
        const balance = credit - debit;
        const transactionCount = reportData.length;
        return { credit, debit, balance, transactionCount };
    }, [reportData]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
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
            // Mock API call - will be replaced with actual API call later
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Filter mock transactions by date range
            const filtered = mockTransactions.filter((txn) => {
                const txnDate = new Date(txn.date);
                txnDate.setHours(0, 0, 0, 0); // Reset time to start of day
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // Set to end of day
                return txnDate >= start && txnDate <= end;
            });

            const formattedData = filtered.map((item) => ({
                id: item.id,
                date: formatDate(item.date),
                description: item.description,
                type: item.type,
                amount: item.amount,
                paymentMethod: item.paymentMethod,
            }));

            setReportData(formattedData);
            setHasGenerated(true);
            if (formattedData.length === 0) {
                toast.success("No transactions found for the selected date range.");
            } else {
                toast.success(`Report generated successfully. Found ${formattedData.length} transaction(s).`);
            }
        } catch (error) {
            toast.error(error.message || "Failed to generate report.");
        } finally {
            setLoading(false);
        }
    };

    // Handle download Excel
    const handleDownloadExcel = () => {
        if (!startDate || !endDate) {
            toast.error("Please select a date range first.");
            return;
        }
        // Mock download - will be replaced with actual API call later
        toast.info("Excel export functionality will be available after backend integration.");
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
            default:
                return null;
        }
    };

    const getPaymentMethodColor = () => {
        return "#D4A574"; // Brown/Tan color for all payment methods
    };

    // Get type icon and color
    const getTypeIcon = (type) => {
        return type === "Credit" ? (
            <TrendingUpIcon fontSize="small" className="me-1" />
        ) : (
            <TrendingDownIcon fontSize="small" className="me-1" />
        );
    };

    const getTypeColor = (type) => {
        return type === "Credit" ? "#198754" : "#dc3545"; // Green for Credit, Red for Debit
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
                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom no-print">
                                    <div>
                                        <h5 className="card-title mb-1">Transaction Details</h5>
                                        <p className="text-muted small mb-0">
                                            Period: {formatDateDisplay(startDate)} - {formatDateDisplay(endDate)}
                                        </p>
                                    </div>
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
                                                            <span>{transaction.date}</span>
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
