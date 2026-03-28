import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PersonIcon from "@mui/icons-material/Person";
import ScaleIcon from "@mui/icons-material/Scale";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import KitchenIcon from "@mui/icons-material/Kitchen";
import InventoryIcon from "@mui/icons-material/Inventory";
import StraightenIcon from "@mui/icons-material/Straighten";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TodayIcon from "@mui/icons-material/Today";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import expenseService from "../../../services/expenseService";

function CreateExpense() {
  const navigate = useNavigate();
  const typeDropdownRef = useRef(null);

  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state for new expense
  const [newExpense, setNewExpense] = useState({
    name: "",
    type: "General",
    paymentMethod: "Cash",
    count: 1,
    cost: 0,
    approvedBy: "",
    transactionId: "",
    lastFourDigits: ""
  });
  
  const [editingId, setEditingId] = useState(null);
  
  // Product name search states
  const [productNames, setProductNames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Type dropdown states
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [typeSearchTerm, setTypeSearchTerm] = useState("");
  
  // Type options with icons and display names
  const typeOptions = [
    { value: "General", label: "General", icon: <CategoryIcon style={{ fontSize: "18px" }} />, category: "Basic" },
    { value: "kg", label: "Kilogram (kg)", icon: <ScaleIcon style={{ fontSize: "18px" }} />, category: "Weight" },
    { value: "gram", label: "Gram (g)", icon: <ScaleIcon style={{ fontSize: "18px" }} />, category: "Weight" },
    { value: "liter", label: "Liter (L)", icon: <LocalDrinkIcon style={{ fontSize: "18px" }} />, category: "Volume" },
    { value: "ml", label: "Milliliter (ml)", icon: <LocalDrinkIcon style={{ fontSize: "18px" }} />, category: "Volume" },
    { value: "pieces", label: "Pieces (pcs)", icon: <InventoryIcon style={{ fontSize: "18px" }} />, category: "Count" },
    { value: "dozen", label: "Dozen (dz)", icon: <InventoryIcon style={{ fontSize: "18px" }} />, category: "Count" },
    { value: "packet", label: "Packet (pkt)", icon: <KitchenIcon style={{ fontSize: "18px" }} />, category: "Package" },
    { value: "bottle", label: "Bottle", icon: <LocalDrinkIcon style={{ fontSize: "18px" }} />, category: "Container" },
    { value: "box", label: "Box", icon: <KitchenIcon style={{ fontSize: "18px" }} />, category: "Container" },
    { value: "meter", label: "Meter (m)", icon: <StraightenIcon style={{ fontSize: "18px" }} />, category: "Length" },
    { value: "feet", label: "Feet (ft)", icon: <StraightenIcon style={{ fontSize: "18px" }} />, category: "Length" },
    { value: "hour", label: "Hour (hr)", icon: <AccessTimeIcon style={{ fontSize: "18px" }} />, category: "Time" },
    { value: "day", label: "Day", icon: <TodayIcon style={{ fontSize: "18px" }} />, category: "Time" },
    { value: "month", label: "Month", icon: <CalendarMonthIcon style={{ fontSize: "18px" }} />, category: "Time" },
    { value: "service", label: "Service", icon: <MiscellaneousServicesIcon style={{ fontSize: "18px" }} />, category: "Service" }
  ];

  // Group type options by category
  const groupedTypeOptions = typeOptions.reduce((groups, option) => {
    const category = option.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(option);
    return groups;
  }, {});

  // Filtered type options based on search
  const filteredTypeOptions = typeSearchTerm
    ? typeOptions.filter(option => 
        option.label.toLowerCase().includes(typeSearchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(typeSearchTerm.toLowerCase())
      )
    : typeOptions;

  // Group filtered options
  const filteredGroupedOptions = filteredTypeOptions.reduce((groups, option) => {
    const category = option.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(option);
    return groups;
  }, {});

  // ✅ Date Object
  const dateObj = new Date();

  // ✅ UI format (DD-MM-YYYY)
  const displayDate = `${String(dateObj.getDate()).padStart(2, "0")}-${String(
    dateObj.getMonth() + 1
  ).padStart(2, "0")}-${dateObj.getFullYear()}`;

  const breadcrumbItems = [
    { label: "Home", url: "/" },
    { label: "Create Expense" },
  ];

  // ✅ Click outside to close type dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch Today Expenses
  const fetchTodayExpenses = async () => {
    try {
      setLoading(true);
      const res = await expenseService.getExpensesByDate(displayDate);
      console.log("API Response:", res);
      setExpenses(Array.isArray(res?.data?.expenses) ? res.data.expenses : []);
      setTotal(res?.data?.total || 0);
    } catch (err) {
      console.error("Error fetching expenses", err);
      setExpenses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Product Names with search
  const fetchProductNames = async (search = "") => {
    try {
      setLoadingProducts(true);
      const params = search ? { search } : {};
      const response = await expenseService.getProductNames(params);
      console.log("Product Names Response:", response);
      
      const products = response?.data?.products || response?.products || response?.data || [];
      setProductNames(Array.isArray(products) ? products : []);
    } catch (err) {
      console.error("Error fetching product names", err);
      setProductNames([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        fetchProductNames(searchTerm);
      } else {
        fetchProductNames();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Initial fetch of product names
  useEffect(() => {
    fetchProductNames();
  }, []);

  useEffect(() => {
    fetchTodayExpenses();
  }, []);

  // ✅ Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "name") {
      setSearchTerm(value);
      setShowSuggestions(true);
    }
    
    if (name === "type") {
      setNewExpense(prev => ({
        ...prev,
        type: value
      }));
      setTypeSearchTerm(value);
    } else {
      setNewExpense(prev => ({
        ...prev,
        [name]: name === "count" || name === "cost" ? parseFloat(value) || 0 : value
      }));
    }
  };

  // ✅ Handle type selection from dropdown
  const handleTypeSelect = (type) => {
    setNewExpense(prev => ({
      ...prev,
      type: type.value
    }));
    setTypeSearchTerm(type.label);
    setShowTypeDropdown(false);
  };

  // ✅ Handle product selection from suggestions
  const handleSelectProduct = (product) => {
    const productName = typeof product === 'string' ? product : product.name || product;
    setNewExpense(prev => ({
      ...prev,
      name: productName
    }));
    setSearchTerm(productName);
    setShowSuggestions(false);
  };

  // ✅ Reset form
  const resetForm = () => {
    setNewExpense({
      name: "",
      type: "General",
      paymentMethod: "Cash",
      count: 1,
      cost: 0,
      approvedBy: "",
      transactionId: "",
      lastFourDigits: ""
    });
    setTypeSearchTerm("");
    setSearchTerm("");
    setEditingId(null);
    setShowSuggestions(false);
    setShowTypeDropdown(false);
  };

  // ✅ Create or Update expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newExpense.name.trim()) {
      alert("Please enter expense name");
      return;
    }

    // Validation for payment method specific fields
    if (["Card", "Online", "Bank Transfer"].includes(newExpense.paymentMethod)) {
      if (!newExpense.transactionId.trim()) {
        alert("Please enter Transaction/Reference ID");
        return;
      }
    }

    if (newExpense.paymentMethod === "Card") {
      if (!newExpense.lastFourDigits.trim()) {
        alert("Please enter Last 4 Digits");
        return;
      }
      if (newExpense.lastFourDigits.length !== 4) {
        alert("Last 4 digits must be exactly 4 digits");
        return;
      }
    }

    try {
      setSubmitting(true);
      
      const expenseData = {
        name: newExpense.name.trim(),
        type: newExpense.type.trim() || "General",
        paymentMethod: newExpense.paymentMethod,
        count: newExpense.count || 1,
        cost: newExpense.cost || 0,
        approvedBy: newExpense.approvedBy?.trim() || "",
        transactionId: newExpense.transactionId?.trim() || "",
        lastFourDigits: newExpense.lastFourDigits?.trim() || "",
        date: displayDate
      };

      if (editingId) {
        await expenseService.updateExpenseItem(editingId, expenseData);
      } else {
        await expenseService.createExpenseItem(expenseData);
      }
      
      await fetchTodayExpenses();
      resetForm();
    } catch (err) {
      console.error("Error saving expense", err);
      alert(err.message || "Failed to save expense");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Edit expense
  const handleEdit = (expense) => {
    const expenseType = expense.type || "General";
    const typeOption = typeOptions.find(opt => opt.value === expenseType);
    setNewExpense({
      name: expense.name || "",
      type: expenseType,
      paymentMethod: expense.method || "Cash",
      count: expense.count || 1,
      cost: expense.cost || 0,
      approvedBy: expense.approvedBy || expense.expenseRouter || "",
      transactionId: expense.transactionId || "",
      lastFourDigits: expense.lastFourDigits || ""
    });
    setTypeSearchTerm(typeOption?.label || expenseType);
    setSearchTerm(expense.name || "");
    setEditingId(expense._id);
    setShowSuggestions(false);
    setShowTypeDropdown(false);
    document.getElementById("expense-form")?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Delete expense
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await expenseService.deleteExpenseItem(id);
        await fetchTodayExpenses();
      } catch (err) {
        console.error("Error deleting expense", err);
        alert(err.message || "Failed to delete expense");
      }
    }
  };

  // Get current type display
  const getCurrentTypeDisplay = () => {
    const currentOption = typeOptions.find(opt => opt.value === newExpense.type);
    if (currentOption) {
      return currentOption.label;
    }
    return newExpense.type || "General";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ 
      background: "var(--color-bg-a)", 
      minHeight: "100vh",
      paddingBottom: "40px"
    }}>
      <Breadcrumb items={breadcrumbItems} />

      <HeadingCard
        category="EXPENSE MANAGEMENT"
        title="Create Expense"
        subtitle="Add and manage daily expense records"
        action={
          <button
            type="button"
            className="btn btn-primary"/*  */
            onClick={() => navigate("/receptionist/expenses/add-expenses-name", {
              state: { expenseDate: displayDate },
            })}
            style={{
              whiteSpace: "nowrap",
              padding: "10px 20px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "var(--color-bg-table-button)",
              color: "white",
              fontWeight: "600",
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            <AddIcon style={{ fontSize: "20px" }} />
            Add Expense Name
          </button>
        }
      />

      <div style={{
        // maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 24px",
        marginTop: "24px"
      }}>
        {/* Date & Total Summary Card */}
        <div style={{
          background: "var(--color-bg-card)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          marginBottom: "24px",
          border: "1px solid var(--color-border)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <div style={{
                background: "var(--color-bg-input)",
                padding: "12px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <ReceiptIcon style={{ color: "var(--color-icon-2)", fontSize: "28px" }} />
              </div>
              <div>
                <p style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  fontWeight: "500",
                  letterSpacing: "0.5px"
                }}>
                  EXPENSE DATE
                </p>
                <h3 style={{
                  margin: "4px 0 0 0",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "var(--color-text-dark)"
                }}>
                  {displayDate}
                </h3>
              </div>
            </div>

            <div style={{
              width: "1px",
              height: "50px",
              background: "var(--color-border)",
              opacity: 0.3
            }} />

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <div>
                <p style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  fontWeight: "500",
                  letterSpacing: "0.5px"
                }}>
                  TOTAL EXPENSES
                </p>
                <h3 style={{
                  margin: "4px 0 0 0",
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "var(--color-success)"
                }}>
                  {formatCurrency(total)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Always Visible Form */}
        <div
          id="expense-form"
          style={{
            background: "var(--color-bg-card)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "32px",
            border: `2px solid ${editingId ? "var(--color-warning)" : "var(--color-success)"}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease"
          }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "12px",
            borderBottom: "1px solid var(--color-border)"
          }}>
            <h3 style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              color: "var(--color-text-dark)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              {editingId ? (
                <>
                  <EditIcon style={{ fontSize: "20px", color: "var(--color-warning)" }} />
                  Edit Expense
                </>
              ) : (
                <>
                  <AddIcon style={{ fontSize: "20px", color: "var(--color-success)" }} />
                  Add New Expense
                </>
              )}
            </h3>
            {editingId && (
              <button
                onClick={resetForm}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-bg-input)";
                  e.currentTarget.style.color = "var(--color-error)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                <CancelIcon style={{ fontSize: "16px" }} />
                Cancel Edit
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.8fr 1.2fr 1.2fr 0.7fr 0.7fr 1.2fr",
              gap: "16px",
              alignItems: "start"
            }}>
              {/* Name Field with Search Suggestions */}
              <div style={{ position: "relative" }}>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--color-text-muted)",
                  marginBottom: "8px",
                  letterSpacing: "0.5px"
                }}>
                  EXPENSE NAME <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    name="name"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      setShowSuggestions(true);
                      e.target.style.borderColor = "var(--color-success)";
                    }}
                    placeholder="Search or enter expense name..."
                    style={{
                      width: "100%",
                      padding: "12px 40px 12px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg-input)",
                      fontSize: "14px",
                      outline: "none",
                      transition: "all 0.2s ease"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--color-border)";
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                  />
                  <SearchIcon style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-muted)",
                    fontSize: "18px",
                    pointerEvents: "none"
                  }} />
                </div>
                
                {showSuggestions && (searchTerm || productNames.length > 0) && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "10px",
                    marginTop: "4px",
                    maxHeight: "250px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}>
                    {loadingProducts ? (
                      <div style={{ padding: "12px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        Loading...
                      </div>
                    ) : productNames.length > 0 ? (
                      productNames.map((product, index) => {
                        const productName = typeof product === 'string' ? product : product.name || product;
                        return (
                          <div
                            key={index}
                            onClick={() => handleSelectProduct(product)}
                            style={{
                              padding: "10px 14px",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              borderBottom: index < productNames.length - 1 ? "1px solid var(--color-border)" : "none",
                              fontSize: "14px",
                              color: "var(--color-text-dark)"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-bg-input)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            {productName}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: "12px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        No products found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Type Field with Enhanced Dropdown */}
              <div style={{ position: "relative" }} ref={typeDropdownRef}>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--color-text-muted)",
                  marginBottom: "8px",
                  letterSpacing: "0.5px"
                }}>
                  TYPE
                </label>
                <div 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: `1px solid ${showTypeDropdown ? "var(--color-success)" : "var(--color-border)"}`,
                    background: "var(--color-bg-input)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                >
                  <CategoryIcon style={{ fontSize: "18px", color: "var(--color-text-muted)" }} />
                  <span style={{ flex: 1, fontSize: "14px", color: "var(--color-text-dark)" }}>
                    {getCurrentTypeDisplay()}
                  </span>
                  <ArrowDropDownIcon style={{ color: "var(--color-text-muted)" }} />
                </div>
                
                {/* Enhanced Type Dropdown */}
                {showTypeDropdown && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "12px",
                    marginTop: "8px",
                    maxHeight: "400px",
                    overflow: "hidden",
                    zIndex: 1000,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
                  }}>
                    {/* Search Input */}
                    <div style={{ padding: "12px", borderBottom: "1px solid var(--color-border)" }}>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          placeholder="Search type..."
                          value={typeSearchTerm}
                          onChange={(e) => setTypeSearchTerm(e.target.value)}
                          autoFocus
                          style={{
                            width: "100%",
                            padding: "8px 32px 8px 12px",
                            borderRadius: "8px",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-bg-input)",
                            fontSize: "13px",
                            outline: "none"
                          }}
                        />
                        <SearchIcon style={{
                          position: "absolute",
                          right: "8px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "var(--color-text-muted)",
                          fontSize: "16px"
                        }} />
                      </div>
                    </div>

                    {/* Options List */}
                    <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                      {Object.keys(filteredGroupedOptions).length > 0 ? (
                        Object.entries(filteredGroupedOptions).map(([category, options]) => (
                          <div key={category}>
                            <div style={{
                              padding: "8px 12px",
                              background: "var(--color-bg-input)",
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "var(--color-text-muted)",
                              letterSpacing: "0.5px",
                              textTransform: "uppercase"
                            }}>
                              {category}
                            </div>
                            {options.map((option, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleTypeSelect(option)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "10px 12px",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  background: newExpense.type === option.value ? "var(--color-bg-input)" : "transparent",
                                  borderLeft: newExpense.type === option.value ? `3px solid var(--color-success)` : "3px solid transparent"
                                }}
                                onMouseEnter={(e) => {
                                  if (newExpense.type !== option.value) {
                                    e.currentTarget.style.background = "var(--color-bg-input)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (newExpense.type !== option.value) {
                                    e.currentTarget.style.background = "transparent";
                                  }
                                }}
                              >
                                <span style={{ color: "var(--color-icon-2)" }}>{option.icon}</span>
                                <span style={{ flex: 1, fontSize: "14px", color: "var(--color-text-dark)" }}>
                                  {option.label}
                                </span>
                                {newExpense.type === option.value && (
                                  <span style={{ fontSize: "12px", color: "var(--color-success)" }}>✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "var(--color-text-muted)"
                        }}>
                          No matching types found
                        </div>
                      )}
                    </div>

                    {/* Custom Value Option */}
                    {typeSearchTerm && !typeOptions.some(opt => opt.value === typeSearchTerm || opt.label === typeSearchTerm) && (
                      <div style={{
                        padding: "12px",
                        borderTop: "1px solid var(--color-border)",
                        background: "var(--color-bg-input)"
                      }}>
                        <button
                          type="button"
                          onClick={() => {
                            setNewExpense(prev => ({ ...prev, type: typeSearchTerm }));
                            setShowTypeDropdown(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "1px dashed var(--color-success)",
                            background: "transparent",
                            color: "var(--color-success)",
                            fontSize: "13px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--color-bg-input)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <AddIcon style={{ fontSize: "16px" }} />
                          Use "{typeSearchTerm}" as custom type
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method Field */}
              <div style={{ position: "relative" }}>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--color-text-muted)",
                  marginBottom: "8px",
                  letterSpacing: "0.5px"
                }}>
                  PAYMENT METHOD
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    name="paymentMethod"
                    value={newExpense.paymentMethod}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg-input)",
                      fontSize: "14px",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      transition: "all 0.2s ease"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--color-success)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Online">Online</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                  <ArrowDropDownIcon style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-muted)",
                    fontSize: "20px",
                    pointerEvents: "none"
                  }} />
                </div>
              </div>

              {/* Count Field */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--color-text-muted)",
                  marginBottom: "8px",
                  letterSpacing: "0.5px"
                }}>
                  QUANTITY
                </label>
                <input
                  type="number"
                  name="count"
                  value={newExpense.count}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  placeholder="1"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg-input)",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-success)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                />
              </div>

              {/* Cost Field */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--color-text-muted)",
                  marginBottom: "8px",
                  letterSpacing: "0.5px"
                }}>
                  COST (₹)
                </label>
                <input
                  type="number"
                  name="cost"
                  value={newExpense.cost}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  placeholder="0"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg-input)",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-success)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                />
              </div>

              {/* Approved By Field */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--color-text-muted)",
                  marginBottom: "8px",
                  letterSpacing: "0.5px"
                }}>
                  APPROVED BY
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    name="approvedBy"
                    value={newExpense.approvedBy}
                    onChange={handleInputChange}
                    placeholder="Enter approver name..."
                    style={{
                      width: "100%",
                      padding: "12px 40px 12px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg-input)",
                      fontSize: "14px",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--color-success)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                  />
                  <PersonIcon style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-muted)",
                    fontSize: "18px",
                    pointerEvents: "none"
                  }} />
                </div>
              </div>

              {/* Conditional Field: Transaction/Reference ID */}
              {(newExpense.paymentMethod === "Card" || newExpense.paymentMethod === "Online" || newExpense.paymentMethod === "Bank Transfer") && (
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--color-text-muted)",
                    marginBottom: "8px",
                    letterSpacing: "0.5px"
                  }}>
                    TRANSACTION/REFERENCE ID <span style={{ color: "var(--color-error)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={newExpense.transactionId}
                    onChange={handleInputChange}
                    placeholder="Enter transaction ID..."
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg-input)",
                      fontSize: "14px",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--color-success)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                  />
                </div>
              )}

              {/* Conditional Field: Last 4 Digits (Only for Card) */}
              {newExpense.paymentMethod === "Card" && (
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--color-text-muted)",
                    marginBottom: "8px",
                    letterSpacing: "0.5px"
                  }}>
                    LAST 4 DIGITS <span style={{ color: "var(--color-error)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="lastFourDigits"
                    value={newExpense.lastFourDigits}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setNewExpense(prev => ({ ...prev, lastFourDigits: value }));
                    }}
                    placeholder="1234"
                    maxLength={4}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg-input)",
                      fontSize: "14px",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--color-success)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "none",
                    background: editingId ? "var(--color-warning)" : "var(--color-success)",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                    opacity: submitting ? 0.6 : 1,
                    marginTop: "24px"
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <SaveIcon style={{ fontSize: "18px" }} />
                  {submitting ? "Saving..." : editingId ? "Update Expense" : "Save Expense"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Expense List - Keep existing code */}
        {loading ? (
          <div style={{
            background: "var(--color-bg-card)",
            borderRadius: "16px",
            padding: "60px",
            textAlign: "center",
            border: "1px solid var(--color-border)"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid var(--color-bg-input)",
              borderTopColor: "var(--color-btn-b)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto"
            }} />
            <p style={{ marginTop: "16px", color: "var(--color-text-muted)" }}>
              Loading expenses...
            </p>
          </div>
        ) : expenses.length === 0 ? (
          <div style={{
            background: "var(--color-bg-card)",
            borderRadius: "16px",
            padding: "60px",
            textAlign: "center",
            border: "1px solid var(--color-border)"
          }}>
            <div style={{
              background: "var(--color-bg-input)",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              <ShoppingCartIcon style={{ fontSize: "40px", color: "var(--color-text-muted)" }} />
            </div>
            <h4 style={{ color: "var(--color-text-dark)", marginBottom: "8px" }}>
              No expenses for today
            </h4>
            <p style={{ color: "var(--color-text-muted)" }}>
              Fill out the form above to add your first expense
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto 1.5fr 1fr 1fr 0.8fr 1fr auto",
              gap: "16px",
              padding: "12px 20px",
              background: "var(--color-bg-input)",
              borderRadius: "12px",
              marginBottom: "12px",
              fontWeight: "600",
              color: "var(--color-text-dark)",
              fontSize: "13px",
              letterSpacing: "0.5px"
            }}>
              <div style={{ width: "40px" }}>#</div>
              <div>EXPENSE NAME</div>
              <div>TYPE</div>
              <div>METHOD</div>
              <div style={{ textAlign: "center" }}>QTY</div>
              <div style={{ textAlign: "right" }}>AMOUNT</div>
              <div style={{ textAlign: "center", width: "80px" }}>ACTIONS</div>
            </div>

            {expenses.map((item, index) => (
              <div
                key={item._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1.5fr 1fr 1fr 0.8fr 1fr auto",
                  gap: "16px",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "var(--color-bg-card)",
                  borderRadius: "12px",
                  marginBottom: "8px",
                  border: `1px solid ${editingId === item._id ? "var(--color-warning)" : "var(--color-border)"}`,
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "var(--color-icon-2-light)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "none";
                  if (editingId !== item._id) {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }
                }}
              >
                <div style={{
                  width: "40px",
                  fontWeight: "600",
                  color: "var(--color-text-muted)"
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div>
                  <div style={{
                    fontWeight: "600",
                    fontSize: "15px",
                    color: "var(--color-text-dark)"
                  }}>
                    {item.name}
                  </div>
                  {item.approvedBy && (
                    <div style={{
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                      marginTop: "2px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <PersonIcon style={{ fontSize: "10px" }} />
                      Approved by: {item.approvedBy}
                    </div>
                  )}
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <CategoryIcon style={{ fontSize: "14px", color: "var(--color-text-muted)" }} />
                  <span style={{ fontSize: "14px", color: "var(--color-text-dark)" }}>
                    {item.type || "General"}
                  </span>
                </div>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  justifyContent: "center"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <span style={{ fontSize: "14px", color: "var(--color-text-dark)" }}>
                      {item.method || "Cash"}
                    </span>
                  </div>
                  {item.transactionId && (
                    <div style={{
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <span style={{ fontWeight: "600" }}>ID:</span> {item.transactionId}
                    </div>
                  )}
                  {item.lastFourDigits && (
                    <div style={{
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <span style={{ fontWeight: "600" }}>Card:</span> ****{item.lastFourDigits}
                    </div>
                  )}
                </div>

                <div style={{
                  textAlign: "center",
                  fontWeight: "500",
                  color: "var(--color-text-dark)"
                }}>
                  <span style={{
                    background: "var(--color-bg-input)",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    display: "inline-block",
                    fontSize: "13px"
                  }}>
                    × {item.count}
                  </span>
                </div>

                <div style={{
                  textAlign: "right",
                  fontWeight: "700",
                  fontSize: "16px",
                  color: "var(--color-success)"
                }}>
                  {formatCurrency(item.cost)}
                </div>

                <div style={{
                  display: "flex",
                  gap: "6px",
                  justifyContent: "center"
                }}>
                  <button
                    onClick={() => handleEdit(item)}
                    style={{
                      background: editingId === item._id ? "var(--color-bg-input)" : "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "6px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      color: editingId === item._id ? "var(--color-warning)" : "var(--color-icon-3)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--color-bg-input)";
                      e.currentTarget.style.color = "var(--color-icon-3-dark)";
                    }}
                    onMouseLeave={(e) => {
                      if (editingId !== item._id) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--color-icon-3)";
                      }
                    }}
                  >
                    <EditIcon style={{ fontSize: "18px" }} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "6px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      color: "var(--color-icon-1)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(181, 69, 69, 0.1)";
                      e.currentTarget.style.color = "var(--color-error)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--color-icon-1)";
                    }}
                  >
                    <DeleteIcon style={{ fontSize: "18px" }} />
                  </button>
                </div>
              </div>
            ))}

            <div style={{
              marginTop: "20px",
              padding: "20px",
              background: "var(--color-bg-input)",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "13px" }}>
                  Total Items
                </p>
                <strong style={{ fontSize: "20px", color: "var(--color-text-dark)" }}>
                  {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                </strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "13px" }}>
                  Grand Total
                </p>
                <strong style={{ fontSize: "24px", color: "var(--color-success)" }}>
                  {formatCurrency(total)}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default CreateExpense;