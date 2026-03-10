import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import {
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import storeService from "../../../services/storeService";
import HeadingCard from "../../../components/card/HeadingCard";
import CardBorder from "../../../components/card/CardBorder";

const statusOptions = ["Active", "Inactive"];

function AddEditStoreItem() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(isEditMode);
    const [formData, setFormData] = useState({
        itemName: "",
        inventoryType: "Store Stock",
        category: "Others",
        unit: "",
        quantity: 0,
        price: 0,
        lowStockThreshold: 5,
        status: "Active",
        description: "",
    });

    useEffect(() => {
        if (isEditMode) {
            const fetchItem = async () => {
                setIsLoadingData(true);
                try {
                    const response = await storeService.getStoreItemById(id);
                    if (response && response.success && response.data) {
                        const item = response.data;
                        setFormData({
                            itemName: item.itemName || "",
                            inventoryType: item.inventoryType || "Store Stock",
                            category: item.category || "Others",
                            unit: item.unit || "",
                            quantity: item.quantity || 0,
                            price: item.price || 0,
                            lowStockThreshold: item.lowStockThreshold || 5,
                            status: item.status || "Active",
                            description: item.description || "",
                        });
                    }
                } catch (error) {
                    console.error("Error fetching item:", error);
                    toast.error(error?.response?.data?.message || "Failed to fetch item details");
                    navigate("/therapist/store");
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchItem();
        }
    }, [id, isEditMode, navigate]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: ['quantity', 'lowStockThreshold', 'price'].includes(name) ?
                (value === '' ? 0 : parseFloat(value)) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);
        // Validation
        if (!formData.itemName) {
            toast.error("Please fill in item name");
            setIsLoading(false);
            return;
        }

        try {
            if (isEditMode) {
                await storeService.updateStoreItem(id, formData);
                toast.success("Item updated successfully");
            } else {
                await storeService.createStoreItem(formData);
                toast.success("Item created successfully");
            }
            navigate("/therapist/store");
        } catch (error) {
            console.error("Error saving item:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to save item";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <ToastContainer />
            <HeadingCard
                title={isEditMode ? "Edit Product" : "Add New Product"}
                subtitle={isEditMode ? "Update product information" : "Add a new product to the store inventory"}
                breadcrumbItems={[
                    { label: "Home", url: "/" },
                    { label: "Therapist", url: "/therapist/dashboard" },
                    { label: "Store", url: "/therapist/store" },
                    { label: isEditMode ? "Edit" : "Add" },
                ]}
            />

            <CardBorder padding="2rem">
                <form onSubmit={handleSubmit} noValidate>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 3 }}>
                        <StyledSelect
                            label="Inventory Type"
                            name="inventoryType"
                            value={formData.inventoryType}
                            onChange={handleChange}
                            required
                        >
                            <MenuItem value="Store Stock">Store Stock</MenuItem>
                            <MenuItem value="Assets 1">Assets 1</MenuItem>
                            <MenuItem value="Medical Stock">Medical Stock</MenuItem>
                            <MenuItem value="Assets 2">Assets 2</MenuItem>
                        </StyledSelect>

                        <StyledTextField
                            label="Product Name"
                            name="itemName"
                            value={formData.itemName}
                            onChange={handleChange}
                            required
                        />

                        <StyledTextField
                            label="Unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            placeholder="e.g., kg, pcs, box"
                            helperText="Unit of measurement"
                        />

                        <StyledTextField
                            label="Quantity (Balance)"
                            name="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                            inputProps={{ min: 0 }}
                        />

                        <StyledTextField
                            label="Price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            inputProps={{ min: 0, step: "0.01" }}
                        />

                        <StyledTextField
                            label="Category / Room"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="e.g. Display Room, Private Ward"
                        />

                        <StyledTextField
                            label="Low Stock Threshold"
                            name="lowStockThreshold"
                            type="number"
                            value={formData.lowStockThreshold}
                            onChange={handleChange}
                            inputProps={{ min: 0 }}
                            helperText="Alert when stock falls below this"
                        />

                        <Box sx={{ gridColumn: "1 / -1" }}>
                            <StyledTextField
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={3}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 4 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate("/therapist/store")}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading}
                            sx={{
                                backgroundColor: "var(--color-primary)",
                                "&:hover": { backgroundColor: "var(--color-primary-dark)" },
                            }}
                        >
                            {isLoading ? <CircularProgress size={24} /> : isEditMode ? "Update Product" : "Create Product"}
                        </Button>
                    </Box>
                </form>
            </CardBorder>
        </div>
    );
}

const StyledTextField = (props) => (
    <TextField
        fullWidth
        sx={{
            "& .MuiInputLabel-root": { color: "var(--color-text)" },
            "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-text-dark-b)" },
            "& .MuiOutlinedInput-root": {
                backgroundColor: "var(--color-bg-input)",
                borderRadius: "10px",
                "& fieldset": { borderColor: "var(--color-border)" },
                "&:hover fieldset": { borderColor: "var(--color-text-b)" },
                "&.Mui-focused fieldset": {
                    borderColor: "var(--color-text-dark-b)",
                    borderWidth: 2,
                },
            },
        }}
        {...props}
    />
);

const StyledSelect = ({ label, name, value, onChange, children, required = false, ...props }) => (
    <FormControl fullWidth required={required}>
        <InputLabel>{label}</InputLabel>
        <Select
            name={name}
            value={value}
            onChange={onChange}
            label={label}
            sx={{
                backgroundColor: "var(--color-bg-input)",
                borderRadius: "10px",
                "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-border)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-text-b)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--color-text-dark-b)",
                    borderWidth: 2,
                },
            }}
            {...props}
        >
            {children}
        </Select>
    </FormControl>
);

export default AddEditStoreItem;
