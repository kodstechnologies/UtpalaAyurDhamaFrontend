import { useState } from "react";
import { Box, TextField, Select, MenuItem, FormControl, InputLabel, Button, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import SubmitButton from "../../../components/buttons/SubmitButton";

function Inventory_Add() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        itemName: "",
        stockId: "",
        category: "",
        type: "",
        initialQuantity: "",
        unit: "",
        costPrice: "",
        sellPrice: "",
        expiryDate: "",
    });

    const categories = ["Oil", "Tablet", "Powder"];
    const types = ["Internal", "External"];
    const units = ["g", "ml", "units"];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.itemName || !formData.stockId || !formData.category || !formData.type || !formData.initialQuantity || !formData.unit || !formData.costPrice || !formData.sellPrice || !formData.expiryDate) {
            alert("Please fill all required fields");
            return;
        }

        console.log("SUBMITTED PAYLOAD 👉", formData);
        alert("Inventory item added successfully");
        navigate("/admin/inventory/view");
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* HEADER */}
            <HeadingCard
                title="Add New Inventory Item"
                subtitle="Add a new inventory item to the system."
                breadcrumbItems={[
                    { label: "Admin", path: "/admin/dashboard" },
                    { label: "Inventory", path: "/admin/inventory/view" },
                    { label: "Add" },
                ]}
            />

            {/* MAIN FORM */}
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    backgroundColor: "var(--color-bg-card)",
                    borderRadius: 4,
                    p: 4,
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-medium)",
                    mt: 3,
                }}
            >
                <Grid container spacing={3}>
                    {/* Item Name */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Item Name <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="itemName"
                            value={formData.itemName}
                            onChange={handleInputChange}
                            placeholder="Enter item name"
                            required
                        />
                    </Grid>

                    {/* Stock ID */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Stock ID <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="stockId"
                            value={formData.stockId}
                            onChange={handleInputChange}
                            placeholder="Enter stock ID"
                            required
                        />
                    </Grid>

                    {/* Category */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Category <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <FormControl fullWidth required>
                            <InputLabel>Select Category</InputLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                label="Select Category"
                                onChange={handleInputChange}
                            >
                                <MenuItem value="">
                                    <em>Select Category...</em>
                                </MenuItem>
                                {categories.map(cat => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Type */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Type <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <FormControl fullWidth required>
                            <InputLabel>Select Type</InputLabel>
                            <Select
                                name="type"
                                value={formData.type}
                                label="Select Type"
                                onChange={handleInputChange}
                            >
                                <MenuItem value="">
                                    <em>Select Type...</em>
                                </MenuItem>
                                {types.map(typ => (
                                    <MenuItem key={typ} value={typ}>{typ}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Initial Quantity */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Initial Quantity <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="initialQuantity"
                            type="number"
                            value={formData.initialQuantity}
                            onChange={handleInputChange}
                            placeholder="Enter initial quantity"
                            inputProps={{ min: 0 }}
                            required
                        />
                    </Grid>

                    {/* Unit */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Unit <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <FormControl fullWidth required>
                            <InputLabel>Select Unit</InputLabel>
                            <Select
                                name="unit"
                                value={formData.unit}
                                label="Select Unit"
                                onChange={handleInputChange}
                            >
                                <MenuItem value="">
                                    <em>Select Unit...</em>
                                </MenuItem>
                                {units.map(unit => (
                                    <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Cost Price */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Cost Price <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="costPrice"
                            type="number"
                            value={formData.costPrice}
                            onChange={handleInputChange}
                            placeholder="Enter cost price"
                            inputProps={{ min: 0, step: "0.01" }}
                            required
                        />
                    </Grid>

                    {/* Sell Price */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Sell Price <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="sellPrice"
                            type="number"
                            value={formData.sellPrice}
                            onChange={handleInputChange}
                            placeholder="Enter sell price"
                            inputProps={{ min: 0, step: "0.01" }}
                            required
                        />
                    </Grid>

                    {/* Initial Expiry Date */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Initial Expiry Date <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="expiryDate"
                            type="date"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                </Grid>

                {/* ACTIONS */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate("/admin/inventory/view")}
                        sx={{ mr: 2 }}
                    >
                        Cancel
                    </Button>
                    <SubmitButton
                        text="Add"
                        type="submit"
                    />
                </Box>
            </Box>
        </Box>
    );
}

export default Inventory_Add;