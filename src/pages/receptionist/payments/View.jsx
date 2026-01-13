import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import { toast } from "react-toastify";
import invoiceService from "../../../services/invoiceService";

// Icons
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";

function Payments_View() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Invoices Data
    const [invoices, setInvoices] = useState([]);
    const [invoiceSearch, setInvoiceSearch] = useState("");

    // Stats
    const [stats, setStats] = useState({
        totalInvoices: 0,
        totalIncome: 0,
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

    const loadAllData = async () => {
        setLoading(true);
        const invData = await fetchInvoices();

        // Calculate Totals from Invoices only
        const totalIncome = invData.reduce((sum, inv) => sum + (inv.totalPayable || 0), 0);

        setStats({
            totalInvoices: invData.length,
            totalIncome,
            netBalance: totalIncome
        });

        setLoading(false);
    };

    useEffect(() => {
        loadAllData();
    }, [invoiceSearch]);

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


    return (
        <Box sx={{ padding: "20px" }}>
            <Breadcrumb items={breadcrumbItems} />

            <HeadingCardingCard
                category="FINANCE MANAGEMENT"
                title="Payments"
                subtitle="Manage patient invoices and track payments."
            />

            {/* ⭐ DASHBOARD CARDS */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
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
                    title="Net Balance"
                    count={stats.netBalance}
                    prefix="₹"
                    icon={AccountBalanceWalletIcon}
                />
            </Box>

            {/* ⭐ INVOICES TABLE */}
            <Box sx={{ marginTop: 4 }}>
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
            </Box>

        </Box>
    );
}

export default Payments_View;
