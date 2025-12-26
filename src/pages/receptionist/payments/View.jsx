import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";

// Icons
import WalletIcon from "@mui/icons-material/Wallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

// Mock data - will be replaced with API calls later
const mockTransactions = [
    {
        id: "txn-1",
        date: "2025-01-20",
        description: "Consultation Fee for John Doe",
        type: "Credit",
        amount: 500.00,
        paymentMethod: "Cash",
    },
    {
        id: "txn-2",
        date: "2025-01-19",
        description: "Room Booking Advance - Amit Kumar",
        type: "Credit",
        amount: 2500.00,
        paymentMethod: "Online",
    },
    {
        id: "txn-3",
        date: "2025-01-18",
        description: "Medical Supplies Purchase",
        type: "Debit",
        amount: 1500.00,
        paymentMethod: "Card",
    },
    {
        id: "txn-4",
        date: "2025-01-17",
        description: "Therapy Session Fee - Sita Verma",
        type: "Credit",
        amount: 800.00,
        paymentMethod: "Cash",
    },
    {
        id: "txn-5",
        date: "2025-01-16",
        description: "Equipment Maintenance",
        type: "Debit",
        amount: 2000.00,
        paymentMethod: "Card",
    },
];

const paymentMethods = ['Cash', 'Online', 'Card'];

function Payments_View() {
    const [transactions] = useState(mockTransactions);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [filterPaymentMethod, setFilterPaymentMethod] = useState("All");
    const navigate = useNavigate();
    const [hoveredButton, setHoveredButton] = useState(null);

    const [newTransaction, setNewTransaction] = useState({
        date: new Date().toISOString().split("T")[0],
        description: "",
        type: "Credit",
        amount: "",
        paymentMethod: "Cash",
    });

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Payments" },
    ];

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            const matchesSearch =
                searchQuery === "" ||
                transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === "All" || transaction.type === filterType;
            const matchesPaymentMethod =
                filterPaymentMethod === "All" || transaction.paymentMethod === filterPaymentMethod;
            return matchesSearch && matchesType && matchesPaymentMethod;
        });
    }, [transactions, searchQuery, filterType, filterPaymentMethod]);

    // Calculate statistics
    const stats = useMemo(() => {
        const credit = filteredTransactions
            .filter((t) => t.type === "Credit")
            .reduce((sum, t) => sum + t.amount, 0);
        const debit = filteredTransactions
            .filter((t) => t.type === "Debit")
            .reduce((sum, t) => sum + t.amount, 0);
        const balance = credit - debit;
        return {
            total: filteredTransactions.length,
            credit,
            debit,
            balance,
        };
    }, [filteredTransactions]);

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

    // Handle add transaction
    const handleAddClick = () => {
        navigate("/receptionist/payments/add");
    };

    // Handle edit transaction
    const handleEditClick = (transaction) => {
        const params = new URLSearchParams({
            edit: "true",
            transactionId: transaction._id || "",
            date: transaction.date || "",
            type: transaction.type || "",
            description: transaction.description || "",
            amount: (transaction.amount || "").toString(),
            paymentMethod: transaction.paymentMethod || "",
        });
        navigate(`/receptionist/payments/edit?${params.toString()}`);
    };

    // Handle delete transaction
    const handleDeleteClick = (transaction) => {
        const params = new URLSearchParams({
            transactionId: transaction._id || "",
            description: transaction.description || "",
            amount: (transaction.amount || "").toString(),
        });
        navigate(`/receptionist/payments/delete?${params.toString()}`);
    };

    // Handle confirm delete
    const handleConfirmDelete = () => {
        if (transactionToDelete) {
            // Mock delete - will be replaced with API call later
            toast.success("Transaction deleted successfully!");
        }
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
    };

    // Handle save transaction
    const handleSaveTransaction = (e) => {
        e.preventDefault();
        // Mock save - will be replaced with API call later
        if (editingTransaction) {
            toast.success("Transaction updated successfully!");
        } else {
            toast.success("Transaction added successfully!");
        }
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction((prev) => ({ ...prev, [name]: value }));
    };

    // Get payment method icon and color
    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case "Cash":
                return <AttachMoneyIcon fontSize="small" className="me-1" />;
            case "Online":
                return <AccountBalanceIcon fontSize="small" className="me-1" />;
            case "Card":
                return <CreditCardIcon fontSize="small" className="me-1" />;
            default:
                return null;
        }
    };

    const getPaymentMethodColor = (method) => {
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

    return (
        <Box sx={{ padding: "20px" }}>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Page Heading */}
            <HeadingCardingCard
                category="PAYMENT MANAGEMENT"
                title="Record & Manage Transactions"
                subtitle="Record and manage all financial transactions including credits and debits"
                action={
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddClick}
                        style={{
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            backgroundColor: "var(--color-bg-table-button)"
                        }}
                    >
                        <AddIcon className="me-2" />
                        Add Transaction
                    </button>
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
                    title="Total Transactions"
                    count={stats.total}
                    icon={WalletIcon}
                />
                <DashboardCard
                    title="Total Credit"
                    count={stats.credit}
                    prefix="₹"
                    icon={TrendingUpIcon}
                />
                <DashboardCard
                    title="Total Debit"
                    count={stats.debit}
                    prefix="₹"
                    icon={TrendingDownIcon}
                />
                <DashboardCard
                    title="Net Balance"
                    count={stats.balance}
                    prefix="₹"
                    icon={AccountBalanceWalletIcon}
                />
            </Box>

            {/* ⭐ Filters Section */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <FilterListIcon sx={{ color: "#0d6efd" }} />
                            <h5 className="card-title mb-0">Filter & Search</h5>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Search</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <SearchIcon />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by description or payment method..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Transaction Type</label>
                                <select
                                    className="form-select"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="All">All Types</option>
                                    <option value="Credit">Credit</option>
                                    <option value="Debit">Debit</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Payment Method</label>
                                <select
                                    className="form-select"
                                    value={filterPaymentMethod}
                                    onChange={(e) => setFilterPaymentMethod(e.target.value)}
                                >
                                    <option value="All">All Methods</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Online">Online</option>
                                    <option value="Card">Card</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </Box>

            {/* ⭐ Transactions Table */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="card-title mb-0">Transactions</h5>
                            <span className="text-muted small">
                                Showing {filteredTransactions.length} of {transactions.length} transaction(s)
                            </span>
                        </div>

                        {filteredTransactions.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th style={{ fontSize: "0.875rem" }}>Date</th>
                                            <th style={{ fontSize: "0.875rem" }}>Description / Reason</th>
                                            <th style={{ fontSize: "0.875rem" }}>Payment Method</th>
                                            <th style={{ fontSize: "0.875rem" }}>Type</th>
                                            <th style={{ fontSize: "0.875rem", textAlign: "right" }}>Amount (INR)</th>
                                            <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.map((transaction) => (
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
                                                    <div className="d-flex align-items-center" style={{ color: getPaymentMethodColor(transaction.paymentMethod) }}>
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
                                                <td style={{ fontSize: "0.875rem", textAlign: "right" }}>
                                                    <strong>{formatCurrency(transaction.amount)}</strong>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <div style={{ position: "relative", display: "inline-block" }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm"
                                                                onClick={() => handleEditClick(transaction)}
                                                                style={{
                                                                    backgroundColor: "#D4A574",
                                                                    borderColor: "#D4A574",
                                                                    color: "#000",
                                                                    borderRadius: "8px",
                                                                    padding: "6px 8px",
                                                                    fontWeight: 500,
                                                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                    transition: "all 0.3s ease",
                                                                    minWidth: "40px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#C8965A";
                                                                    e.currentTarget.style.transform = "translateY(-2px)";
                                                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                    setHoveredButton(`edit-${transaction.id}`);
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#D4A574";
                                                                    e.currentTarget.style.transform = "translateY(0)";
                                                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    setHoveredButton(null);
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </button>
                                                            {hoveredButton === `edit-${transaction.id}` && (
                                                                <span
                                                                    style={{
                                                                        position: "absolute",
                                                                        bottom: "100%",
                                                                        left: "50%",
                                                                        transform: "translateX(-50%)",
                                                                        marginBottom: "5px",
                                                                        padding: "4px 8px",
                                                                        backgroundColor: "#333",
                                                                        color: "#fff",
                                                                        fontSize: "0.75rem",
                                                                        borderRadius: "4px",
                                                                        whiteSpace: "nowrap",
                                                                        zIndex: 1000,
                                                                        pointerEvents: "none",
                                                                    }}
                                                                >
                                                                    Edit Transaction
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ position: "relative", display: "inline-block" }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm"
                                                                onClick={() => handleDeleteClick(transaction)}
                                                                style={{
                                                                    backgroundColor: "#dc3545",
                                                                    borderColor: "#dc3545",
                                                                    color: "#fff",
                                                                    borderRadius: "8px",
                                                                    padding: "6px 8px",
                                                                    fontWeight: 500,
                                                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                    transition: "all 0.3s ease",
                                                                    minWidth: "40px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#bb2d3b";
                                                                    e.currentTarget.style.transform = "translateY(-2px)";
                                                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                    setHoveredButton(`delete-${transaction.id}`);
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#dc3545";
                                                                    e.currentTarget.style.transform = "translateY(0)";
                                                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                    setHoveredButton(null);
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </button>
                                                            {hoveredButton === `delete-${transaction.id}` && (
                                                                <span
                                                                    style={{
                                                                        position: "absolute",
                                                                        bottom: "100%",
                                                                        left: "50%",
                                                                        transform: "translateX(-50%)",
                                                                        marginBottom: "5px",
                                                                        padding: "4px 8px",
                                                                        backgroundColor: "#333",
                                                                        color: "#fff",
                                                                        fontSize: "0.75rem",
                                                                        borderRadius: "4px",
                                                                        whiteSpace: "nowrap",
                                                                        zIndex: 1000,
                                                                        pointerEvents: "none",
                                                                    }}
                                                                >
                                                                    Delete Transaction
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <div className="mb-3">
                                    <WalletIcon sx={{ fontSize: 64, color: "#6c757d" }} />
                                </div>
                                <h5 className="mb-2">No Transactions Found</h5>
                                <p className="text-muted mb-3">
                                    {transactions.length === 0
                                        ? "Get started by adding your first transaction."
                                        : "Try adjusting your filters or search query."}
                                </p>
                                {transactions.length === 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleAddClick}
                                    >
                                        <AddIcon className="me-2" />
                                        Add First Transaction
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Box>

        </Box>
    );
}

export default Payments_View;
