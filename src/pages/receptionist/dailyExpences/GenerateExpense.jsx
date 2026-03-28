import React, { useEffect, useState } from "react";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import expenseService from "../../../services/expenseService";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  CurrencyRupee as RupeeIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";
import { handlePrint } from "./ExpenceGenerator";
import { handleDownload } from "./ExpenceDownload";

function GenerateExpense() {
  const [selectedDate, setSelectedDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const breadcrumbItems = [
    { label: "Home", url: "/receptionist/dashboard" },
    { label: "Expense Management", url: "/receptionist/expenses" },
    { label: "Generate Expense Report" },
  ];

  // Convert YYYY-MM-DD → DD-MM-YYYY (for API)
  const formatDateForAPI = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  // Format date for display (DD-MM-YYYY)
  const formatDateForDisplay = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  // Calculate total cost from expenses array
  const calculateTotal = (expensesList) => {
    return expensesList.reduce((sum, item) => sum + (item.cost || 0), 0);
  };

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch (method) {
      case "Cash":
        return <RupeeIcon sx={{ fontSize: 14, color: "var(--color-success)" }} />;
      case "Card":
        return <CreditCardIcon sx={{ fontSize: 14, color: "var(--color-primary)" }} />;
      case "Online":
        return <PaymentIcon sx={{ fontSize: 14, color: "var(--color-info)" }} />;
      case "Bank Transfer":
        return <AccountBalanceIcon sx={{ fontSize: 14, color: "var(--color-warning)" }} />;
      default:
        return <PaymentIcon sx={{ fontSize: 14, color: "var(--color-text-muted)" }} />;
    }
  };

  // Fetch expenses by selected date
  const fetchExpenses = async (date) => {
    if (!date) {
      setError("Please select a date");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formattedDate = formatDateForAPI(date);
      const res = await expenseService.getExpensesByDate(formattedDate);

      console.log("API Response:", res);

      const expensesData = res?.data?.expenses || [];
      const totalAmount = res?.data?.total || calculateTotal(expensesData);

      setExpenses(expensesData);
      setTotal(totalAmount);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError(err.response?.data?.message || "Failed to fetch expenses");
      setExpenses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when date changes
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (newDate) {
      fetchExpenses(newDate);
    }
  };

  // Load today by default
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchExpenses(today);
  }, []);




  return (
    <Container maxWidth={false} disableGutters sx={{ bgcolor: "var(--color-bg-a)", minHeight: "100vh", px: { xs: 2, sm: 3, md: 4 }, pb: 4 }}>
      <Breadcrumb items={breadcrumbItems} />

      <HeadingCard
        category="EXPENSE MANAGEMENT"
        title="Generate Expense Report"
        subtitle="View, filter, and generate daily expense reports"
      />

      {/* Date Filter Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CalendarIcon sx={{ color: "var(--color-primary)" }} />
          <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 500 }}>
            Filter by Date:
          </Typography>
          <TextField
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            size="small"
            sx={{
              width: 180,
              "& .MuiOutlinedInput-root": {
                bgcolor: "var(--color-bg-input)",
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Print Report">
            <Button
              size="small"
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => handlePrint(selectedDate)}
              disabled={expenses.length === 0}
              sx={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-dark)",
                "&:hover": {
                  borderColor: "var(--color-primary)",
                  bgcolor: "var(--color-bg-hover)",
                },
                textTransform: "none"
              }}
            >
              Print
            </Button>
          </Tooltip>
          <Tooltip title="Download as JSON">
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(selectedDate)}
              disabled={expenses.length === 0}
              sx={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-dark)",
                "&:hover": {
                  borderColor: "var(--color-primary)",
                  bgcolor: "var(--color-bg-hover)",
                },
                textTransform: "none"
              }}
            >
              Download
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            bgcolor: "var(--color-error)",
            color: "white",
            "& .MuiAlert-icon": {
              color: "white"
            }
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Report Summary Cards */}
      {!loading && expenses.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{
              bgcolor: "var(--color-primary-light-v)",
              border: "1px solid var(--color-primary)",
              borderRadius: 2,
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" sx={{ color: "var(--color-primary-dark)", opacity: 0.8 }}>
                  Selected Date
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "var(--color-primary-dark)" }}>
                  {formatDateForDisplay(selectedDate)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{
              bgcolor: "var(--color-bg-card-b)",
              border: "1px solid var(--color-btn-b)",
              borderRadius: 2,
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" sx={{ color: "var(--color-text-dark)", opacity: 0.8 }}>
                  Total Expenses
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 0.5, color: "var(--color-btn-dark-b)" }}>
                  <RupeeIcon sx={{ fontSize: 20 }} /> {total.toLocaleString('en-IN')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{
              bgcolor: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 2,
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" sx={{ color: "var(--color-text-muted)", opacity: 0.8 }}>
                  Total Items
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 0.5, color: "var(--color-text-dark)" }}>
                  <CartIcon sx={{ fontSize: 20 }} /> {expenses.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Expense List Table */}
      <Paper
        elevation={0}
        sx={{
          overflowX: "auto",
          bgcolor: "var(--color-bg-table)",
          border: "1px solid var(--color-border)",
          borderRadius: 2
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress sx={{ color: "var(--color-primary)" }} />
          </Box>
        ) : expenses.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <ReceiptIcon sx={{ fontSize: 64, color: "var(--color-text-muted)", mb: 2 }} />
            <Typography color="var(--color-text-muted)">
              No expenses found for {selectedDate ? formatDateForDisplay(selectedDate) : "this date"}
            </Typography>
            <Typography variant="caption" color="var(--color-text-muted)" display="block" sx={{ mt: 1 }}>
              Please select a different date or add expenses
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: "var(--color-primary-light-v)" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "var(--color-primary-dark)" }}>S.No</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "var(--color-primary-dark)" }}>Product Name</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "var(--color-primary-dark)" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center", color: "var(--color-primary-dark)" }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "right", color: "var(--color-primary-dark)" }}>Cost (₹)</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "var(--color-primary-dark)" }}>Payment Method</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "var(--color-primary-dark)" }}>Approved By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((item, index) => (
                <TableRow
                  key={item._id}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: "var(--color-bg-hover)"
                    }
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: "var(--color-text-dark)" }}>
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.type || "General"}
                      size="small"
                      sx={{
                        bgcolor: item.type === "Food" ? "var(--color-warning)" : "var(--color-primary-light-v)",
                        color: item.type === "Food" ? "white" : "var(--color-primary-dark)",
                        border: "none",
                        fontSize: "0.7rem"
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>{item.count || 1}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--color-btn-dark-b)" }}>
                    ₹{item.cost?.toLocaleString('en-IN') || 0}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {getPaymentIcon(item.method)}
                        <Typography variant="body2" sx={{ color: "var(--color-text-dark)" }}>
                          {item.method || "Cash"}
                        </Typography>
                      </Box>
                      {item.transactionId && (
                        <Typography variant="caption" sx={{ color: "var(--color-text-muted)", fontSize: "0.7rem", ml: 3 }}>
                          ID: {item.transactionId}
                        </Typography>
                      )}
                      {item.lastFourDigits && (
                        <Typography variant="caption" sx={{ color: "var(--color-text-muted)", fontSize: "0.7rem", ml: 3 }}>
                          Card: ****{item.lastFourDigits}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: "var(--color-primary-light-v)" }}>
                        <PersonIcon sx={{ fontSize: 14, color: "var(--color-primary-dark)" }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ color: "var(--color-text-dark)" }}>
                        {item.approvedBy || "receptionist"}
                      </Typography>
                      {item.approvedBy && (
                        <CheckCircleIcon sx={{ fontSize: 14, color: "var(--color-success)" }} />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {/* Total Row */}
              <TableRow sx={{ bgcolor: "var(--color-bg-hover)" }}>
                <TableCell colSpan={6} align="right" sx={{ fontWeight: "bold", color: "var(--color-text-dark)" }}>
                  Grand Total
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", fontSize: "1rem", color: "var(--color-btn-dark-b)" }}>
                  ₹{total.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .MuiContainer-root,
          .MuiContainer-root * {
            visibility: visible;
          }
          .MuiContainer-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .MuiButton-root,
          .MuiPaper-root > .MuiBox-root:first-of-type,
          .MuiGrid-container {
            display: none !important;
          }
          .MuiTableContainer-root {
            box-shadow: none !important;
          }
        }
      `}</style>
    </Container>
  );
}

export default GenerateExpense;