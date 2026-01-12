import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Tab, Tabs } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";
import invoiceService from "../../../services/invoiceService";
import paymentService from "../../../services/paymentService";

// Icons
import WalletIcon from "@mui/icons-material/Wallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

function Payments_View() {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hoveredButton, setHoveredButton] = useState(null);

    // Invoices Data
    const [invoices, setInvoices] = useState([]);
    const [invoiceSearch, setInvoiceSearch] = useState("");

    // Payments/Expenses Data
    const [payments, setPayments] = useState([]);
    const [paymentSearch, setPaymentSearch] = useState("");
    const [paymentType, setPaymentType] = useState("All");

    // Stats
    const [stats, setStats] = useState({
        totalInvoices: 0,
        totalBilled: 0,
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0
    });

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Payments" },
    ];

    const fetchInvoices = async () => {
        try {
            const params = {};
            if (invoiceSearch) params.search = invoiceSearch;

            const response = await invoiceService.getAllInvoices(params);
            console.log("Invoice API Response:", response);
            if (response && response.success) {
                const invoicesData = Array.isArray(response.data) ? response.data : [];
                setInvoices(invoicesData);
                return invoicesData;
            } else {
                console.warn("Invoice API response missing success or data:", response);
                setInvoices([]);
                return [];
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
            console.error("Error response:", error.response);
            toast.error(error.response?.data?.message || "Failed to fetch invoices");
            setInvoices([]);
            return [];
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await paymentService.getAllPayments();
            console.log("Payment API Response:", response);
            if (response && response.success) {
                const paymentsData = Array.isArray(response.data) ? response.data : [];
                setPayments(paymentsData);
                return paymentsData;
            } else {
                console.warn("Payment API response missing success or data:", response);
                setPayments([]);
                return [];
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
            console.error("Error response:", error.response);
            toast.error(error.response?.data?.message || "Failed to fetch payments");
            setPayments([]);
            return [];
        }
    };

    const loadAllData = async () => {
        setLoading(true);
        const [invData, payData] = await Promise.all([
            fetchInvoices(),
            fetchPayments()
        ]);

        // Calculate Totals
        // 1. Invoices (inherently Income)
        const billedAmount = invData.reduce((sum, inv) => sum + (inv.totalPayable || 0), 0);

        // 2. Payments (Income/Credit vs Expense/Debit)
        // Note: 'Credit' usually means Income, 'Expense' or 'Debit' means Outgoing
        let otherIncome = 0;
        let expenses = 0;

        if (payData && Array.isArray(payData)) {
            payData.forEach(p => {
                const amt = p.amount || 0;
                if (p.type === "Income" || p.type === "Credit") {
                    otherIncome += amt;
                } else if (p.type === "Expense" || p.type === "Debit") {
                    expenses += amt;
                }
            });
        }

        const totalIncome = billedAmount + otherIncome;
        const net = totalIncome - expenses;

        setStats({
            totalInvoices: invData.length,
            totalBilled: billedAmount,
            totalIncome,
            totalExpense: expenses,
            netBalance: net
        });

        setLoading(false);
    };

    useEffect(() => {
        loadAllData();
    }, [invoiceSearch, paymentType]);
    // paymentSearch filtering done client-side for now for responsiveness on simple mock-like list

    // Tabs Change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Filter Payments Client-Side (until comprehensive backend search)
    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const matchesSearch = !paymentSearch ||
                (p.description && p.description.toLowerCase().includes(paymentSearch.toLowerCase()));

            const matchesType = paymentType === "All" ||
                (paymentType === "Income" && (p.type === "Income" || p.type === "Credit")) ||
                (paymentType === "Expense" && (p.type === "Expense" || p.type === "Debit"));

            return matchesSearch && matchesType;
        });
    }, [payments, paymentSearch, paymentType]);


    // Handlers
    const handleAddTransaction = () => {
        navigate("/receptionist/payments/add");
    };

    const handleEditTransaction = (txn) => {
        const params = new URLSearchParams({
            edit: "true",
            transactionId: txn._id,
            date: txn.date,
            type: txn.type,
            description: txn.description,
            amount: txn.amount,
            paymentMethod: txn.paymentMethod
        });
        navigate(`/receptionist/payments/edit?${params.toString()}`);
    };

    const handleDeleteTransaction = (txn) => {
        const params = new URLSearchParams({
            transactionId: txn._id,
            description: txn.description,
            amount: txn.amount
        });
        navigate(`/receptionist/payments/delete?${params.toString()}`);
    };

    const handleViewInvoice = (invoice) => {
        navigate(`/receptionist/payments/invoice/${invoice._id}`);
    };

    const handleDownloadPdf = async (prescriptionId) => {
        try {
            toast.info("Downloading PDF...");
            const response = await invoiceService.downloadInvoicePdf(prescriptionId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${prescriptionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error(error);
            toast.error("Failed to download PDF");
        }
    };

    // Formatters
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
            month: "short",
            day: "numeric",
        });
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case "Cash": return <AttachMoneyIcon fontSize="small" className="me-1" />;
            case "Online": return <AccountBalanceIcon fontSize="small" className="me-1" />;
            case "Card": return <CreditCardIcon fontSize="small" className="me-1" />;
            default: return null;
        }
    };

    return (
        <Box sx={{ padding: "20px" }}>
            <Breadcrumb items={breadcrumbItems} />

            <HeadingCardingCard
                category="FINANCE MANAGEMENT"
                title="Payments & Expenses"
                subtitle="Manage patient invoices and track other clinic expenses."
                action={
                    tabValue === 1 && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleAddTransaction}
                            style={{
                                whiteSpace: "nowrap",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                backgroundColor: "var(--color-bg-table-button)"
                            }}
                        >
                            <AddIcon className="me-2" />
                            Add Expense / Income
                        </button>
                    )
                }
            />

            {/* ⭐ DASHBOARD CARDS */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(4, 1fr)",
                    },
                    gap: "15px",
                    marginTop: 3,
                }}
            >
                <DashboardCard
                    title="Total Invoices"
                    count={stats.totalInvoices}
                    icon={DescriptionIcon}
                />
                <DashboardCard
                    title="Total Income"
                    count={stats.totalIncome}
                    prefix="₹"
                    icon={TrendingUpIcon}
                />
                <DashboardCard
                    title="Total Expenses"
                    count={stats.totalExpense}
                    prefix="₹"
                    icon={TrendingDownIcon}
                />
                <DashboardCard
                    title="Net Balance"
                    count={stats.netBalance}
                    prefix="₹"
                    icon={AccountBalanceWalletIcon}
                />
            </Box>

            {/* ⭐ TABS */}
            <Box sx={{ marginTop: 4, borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="payment tabs">
                    <Tab label="Invoices (Patient Billing)" />
                    <Tab label="Other Transactions (Expenses)" />
                </Tabs>
            </Box>

            {/* ⭐ TAB CONTENT 0: INVOICES */}
            {tabValue === 0 && (
                <Box sx={{ marginTop: 3 }}>
                    {/* Filters */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="form-label">Search Invoice #</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><SearchIcon /></span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by invoice number..."
                                            value={invoiceSearch}
                                            onChange={(e) => setInvoiceSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : invoices.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Invoice #</th>
                                                <th>Patient</th>
                                                <th>Doctor</th>
                                                <th className="text-end">Amount</th>
                                                <th className="text-center">Status</th>
                                                <th className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.map((inv) => {
                                                const isPaid = (inv.amountPaid || 0) >= (inv.totalPayable || 0);
                                                const isPartiallyPaid = (inv.amountPaid || 0) > 0 && (inv.amountPaid || 0) < (inv.totalPayable || 0);
                                                const balanceDue = (inv.totalPayable || 0) - (inv.amountPaid || 0);
                                                
                                                return (
                                                    <tr key={inv._id}>
                                                        <td>{formatDate(inv.createdAt)}</td>
                                                        <td className="fw-bold text-primary">{inv.invoiceNumber}</td>
                                                        <td>{inv.patient?.user?.name || "Unknown"}</td>
                                                        <td>{inv.doctor?.user?.name || "—"}</td>
                                                        <td className="text-end fw-bold">{formatCurrency(inv.totalPayable)}</td>
                                                        <td className="text-center">
                                                            {isPaid ? (
                                                                <span className="badge bg-success" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                                                                    Paid
                                                                </span>
                                                            ) : isPartiallyPaid ? (
                                                                <span className="badge bg-warning" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                                                                    Partial
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-danger" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                                                                    Unpaid
                                                                </span>
                                                            )}
                                                            {!isPaid && (
                                                                <div className="text-muted" style={{ fontSize: "0.7rem", marginTop: "2px" }}>
                                                                    Due: {formatCurrency(balanceDue)}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => handleViewInvoice(inv)}
                                                                title="View Invoice Details"
                                                                style={{
                                                                    backgroundColor: "#1976d2",
                                                                    color: "#FFFFFF",
                                                                    border: "none",
                                                                    borderRadius: "6px",
                                                                    padding: "6px 12px",
                                                                    cursor: "pointer",
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    minWidth: "36px",
                                                                    minHeight: "36px",
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.backgroundColor = "#1565c0";
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.backgroundColor = "#1976d2";
                                                                }}
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <DescriptionIcon sx={{ fontSize: 48, color: "#ccc" }} />
                                    <p className="text-muted mt-2">No invoices found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Box>
            )}

            {/* ⭐ TAB CONTENT 1: EXPENSES / TRANSACTIONS */}
            {tabValue === 1 && (
                <Box sx={{ marginTop: 3 }}>
                    {/* Filters */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Search Description</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><SearchIcon /></span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search description..."
                                            value={paymentSearch}
                                            onChange={(e) => setPaymentSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        value={paymentType}
                                        onChange={(e) => setPaymentType(e.target.value)}
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Income">Income (Credit)</option>
                                        <option value="Expense">Expense (Debit)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : filteredPayments.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Description</th>
                                                <th>Method</th>
                                                <th>Type</th>
                                                <th className="text-end">Amount</th>
                                                <th className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPayments.map((txn) => (
                                                <tr key={txn._id}>
                                                    <td>{formatDate(txn.date)}</td>
                                                    <td className="fw-bold">{txn.description}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            {getPaymentMethodIcon(txn.paymentMethod)}
                                                            {txn.paymentMethod}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {(txn.type === 'Credit' || txn.type === 'Income') ? (
                                                            <span className="badge bg-success">Income</span>
                                                        ) : (
                                                            <span className="badge bg-danger">Expense</span>
                                                        )}
                                                    </td>
                                                    <td className="text-end fw-bold" style={{ color: (txn.type === 'Credit' || txn.type === 'Income') ? 'green' : 'red' }}>
                                                        {formatCurrency(txn.amount)}
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <button
                                                                className="btn btn-sm btn-outline-warning"
                                                                onClick={() => handleEditTransaction(txn)}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteTransaction(txn)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <WalletIcon sx={{ fontSize: 48, color: "#ccc" }} />
                                    <p className="text-muted mt-2">No transactions found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Box>
            )}

        </Box>
    );
}

export default Payments_View;
