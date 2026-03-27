import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Typography,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import expenseService from "../../../services/expenseService";

function AddDailyExpenseProduct() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const breadcrumbItems = [
    { label: "Home", url: "/receptionist/dashboard" },
    { label: "Expense Management", url: "/receptionist/expenses/create-expense" },
    { label: "Add Expense Product" },
  ];

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await expenseService.getProductNames();
      const data = res.data || [];
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to fetch products",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a product name",
        severity: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      if (editId) {
        await expenseService.updateProductName(editId, { name });
        setSnackbar({
          open: true,
          message: "Product updated successfully",
          severity: "success",
        });
      } else {
        await expenseService.createProductName({ name });
        setSnackbar({
          open: true,
          message: "Product added successfully",
          severity: "success",
        });
      }

      setName("");
      setEditId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Operation failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (item) => {
    setName(item.name);
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete confirmation
  const handleDeleteClick = (item) => {
    setProductToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setLoading(true);
    try {
      await expenseService.deleteProductName(productToDelete._id);
      setSnackbar({
        open: true,
        message: "Product deleted successfully",
        severity: "success",
      });
      fetchProducts();
      
      // Clear edit form if the deleted product was being edited
      if (editId === productToDelete._id) {
        setName("");
        setEditId(null);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to delete product",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleClearForm = () => {
    setName("");
    setEditId(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Breadcrumb items={breadcrumbItems} />

      <HeadingCard
        category="EXPENSE MANAGEMENT"
        title="Add Expense Product"
        subtitle="Manage products for daily expenses"
      />

      {/* Form Section */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, mx: { xs: 0, sm: 2, md: 4 } }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          {editId ? "Edit Product" : "Add New Product"}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Product Name"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              variant="outlined"
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AddIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Stack direction="row" spacing={1}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={editId ? <EditIcon /> : <AddIcon />}
                sx={{ minWidth: 100 }}
              >
                {editId ? "Update" : "Add"}
              </Button>
              
              {editId && (
                <Button
                  variant="outlined"
                  onClick={handleClearForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </Stack>
          </Stack>
        </form>
      </Paper>

      {/* Search and Stats */}
      <Box 
        sx={{ 
          mb: 2, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          flexWrap: "wrap", 
          gap: 2,
          mx: { xs: 0, sm: 2, md: 4 }
        }}
      >
        <Typography variant="body2" color="textSecondary">
          Total Products: <Chip label={products.length} size="small" color="primary" />
        </Typography>
        
        <TextField
          size="small"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: 250 } }}
        />
      </Box>

      {/* Products Table */}
      <TableContainer 
        component={Paper} 
        elevation={2} 
        sx={{
          mx: { xs: 0, sm: 2, md: 4 },
          mt: 2,
          overflowX: "auto"
        }}
      >
        <Table sx={{ minWidth: 500 }}>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "70%", py: 2 }}>
                Product Name
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center", py: 2 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading && filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                  <Typography color="textSecondary">
                    {searchTerm ? "No matching products found" : "No products added yet"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((item) => (
                <TableRow 
                  key={item._id}
                  sx={{ 
                    '&:hover': { bgcolor: 'grey.50' },
                    bgcolor: editId === item._id ? 'action.hover' : 'inherit'
                  }}
                >
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography variant="body1">{item.name}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5 }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(item)}
                      size="small"
                      title="Edit"
                      sx={{ mr: 0.5 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(item)}
                      size="small"
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle sx={{ pb: 1 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the product "{productToDelete?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AddDailyExpenseProduct;