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
    Typography,
    CircularProgress,
    Switch,
    FormControlLabel,
} from "@mui/material";
import medicineService from "../../../services/medicineService";
import HeadingCard from "../../../components/card/HeadingCard";
import CardBorder from "../../../components/card/CardBorder";

// Comprehensive list of medicine types extracted from pharmacy stock list (400+ medicines)
// Sorted alphabetically with "Other" at the end
const medicineTypes = [
    "Arishta",
    "Arishtam",
    "Asava",
    "Asavam",
    "Avaleha",
    "Avanakkenna",
    "Baby Cream",
    "Baby Lotion",
    "Baby Oil",
    "Baby Powder",
    "Baby Shampoo",
    "Baby Soap",
    "Baby Wash",
    "Baby Wipes",
    "Bhasma",
    "CAP",
    "Capsule",
    "Candy",
    "Churna",
    "Choorna",
    "Cream",
    "Drop",
    "Eye Drop",
    "Face Wash",
    "Gel",
    "Ghrita",
    "Gift Set",
    "Granules",
    "Gritham",
    "Gummies",
    "Gutika",
    "Hair Care",
    "Hair Oil",
    "Honey",
    "Kalpa",
    "Kashaya",
    "Kashayam",
    "Kera",
    "Keram",
    "Kwatha",
    "Lehyam",
    "Liniment",
    "Lepa",
    "Moisturizer",
    "Nasal Drop",
    "Oil",
    "Ointment",
    "Paste",
    "Powder",
    "Rasa",
    "Rasayana",
    "Shampoo",
    "Soap",
    "Spray",
    "Syrup",
    "TAB",
    "Tablet",
    "Taila",
    "Tailam",
    "Tooth Paste",
    "Tooth Powder",
    "Topical",
    "Vati",
    "Other"
];
const statusOptions = ["Active", "Inactive", "Discontinued"];

function AddEditMedicine() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(isEditMode);
    const [formData, setFormData] = useState({
        medicineName: "",
        manufacturer: "",
        composition: "",
        type: "Vati",
        strength: "",
        unit: "",
        quantity: 0,
        costPrice: 0,
        sellPrice: 0,
        mfgDate: "",
        expiryDate: "",
        lowStockThreshold: 10,
        status: "Active",
        description: "",
        storageConditions: "",
        prescriptionRequired: false,
    });

    useEffect(() => {
        if (isEditMode) {
            const fetchMedicine = async () => {
                setIsLoadingData(true);
                try {
                    const response = await medicineService.getMedicineById(id);
                    if (response && response.success && response.data) {
                        const medicine = response.data;
                        setFormData({
                            medicineName: medicine.medicineName || "",
                            manufacturer: medicine.manufacturer || "",
                            composition: medicine.composition || "",
                            type: medicine.type || "Vati",
                            strength: medicine.strength || "",
                            unit: medicine.unit || "",
                            quantity: medicine.quantity || 0,
                            costPrice: medicine.costPrice || 0,
                            sellPrice: medicine.sellPrice || 0,
                            mfgDate: medicine.mfgDate ? medicine.mfgDate.split("T")[0] : "",
                            expiryDate: medicine.expiryDate ? medicine.expiryDate.split("T")[0] : "",
                            lowStockThreshold: medicine.lowStockThreshold || 10,
                            status: medicine.status || "Active",
                            description: medicine.description || "",
                            storageConditions: medicine.storageConditions || "",
                            prescriptionRequired: medicine.prescriptionRequired || false,
                        });
                    }
                } catch (error) {
                    console.error("Error fetching medicine:", error);
                    toast.error(error?.response?.data?.message || "Failed to fetch medicine details");
                    navigate("/pharmacist/medicines");
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchMedicine();
        }
    }, [id, isEditMode, navigate]);

    // const handleChange = (e) => {
    //     const { name, value, type, checked } = e.target;
    //     setFormData((prev) => ({
    //         ...prev,
    //         [name]: type === "checkbox" ? checked : value,
    //     }));
    // };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked :
                (['quantity', 'costPrice', 'sellPrice', 'lowStockThreshold'].includes(name) ?
                    (value === '' ? 0 : parseFloat(value)) : value),  // Parse numbers, default empty to 0
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Form submitted with data:", formData);
        console.log("Form validation check:", {
            medicineName: formData.medicineName,
            manufacturer: formData.manufacturer,
            unit: formData.unit,
        });
        setIsLoading(true);
        // Validation
        if (!formData.medicineName || !formData.manufacturer || !formData.unit) {
            toast.error("Please fill in all required fields");
            setIsLoading(false);
            return;
        }

        if (formData.costPrice > formData.sellPrice) {
            toast.error("Sell price cannot be less than cost price");
            setIsLoading(false);
            return;
        }

        console.log("fjfj")
        try {
            console.log("Submitting medicine data:", formData);
            if (isEditMode) {
                const response = await medicineService.updateMedicine(id, formData);
                console.log("Update response:", response);
                toast.success("Medicine updated successfully");
            } else {
                const response = await medicineService.createMedicine(formData);
                console.log("Create response:", response);
                toast.success("Medicine created successfully");
            }
            navigate("/pharmacist/medicines");
        } catch (error) {
            console.error("Error saving medicine:", error);
            console.error("Error details:", {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
            });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to save medicine";
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
                title={isEditMode ? "Edit Medicine" : "Add New Medicine"}
                subtitle={isEditMode ? "Update medicine information" : "Add a new medicine to the pharmacy inventory"}
                breadcrumbItems={[
                    { label: "Home", url: "/" },
                    { label: "Pharmacist", url: "/pharmacist/dashboard" },
                    { label: "Medicines", url: "/pharmacist/medicines" },
                    { label: isEditMode ? "Edit" : "Add" },
                ]}
            />

            <CardBorder padding="2rem">
                <form onSubmit={handleSubmit} noValidate>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 3 }}>
                        <StyledTextField
                            label="Medicine Name"
                            name="medicineName"
                            value={formData.medicineName}
                            onChange={handleChange}
                            required
                        />

                        <StyledTextField
                            label="Manufacturer"
                            name="manufacturer"
                            value={formData.manufacturer}
                            onChange={handleChange}
                            required
                        />

                        <StyledTextField
                            label="Composition"
                            name="composition"
                            value={formData.composition}
                            onChange={handleChange}
                            multiline
                            rows={2}
                        />

                        <StyledSelect
                            label="Type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                        >
                            {medicineTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </StyledSelect>

                        <StyledTextField
                            label="Strength"
                            name="strength"
                            value={formData.strength}
                            onChange={handleChange}
                            placeholder="e.g., 500mg, 10ml"
                            helperText="Medicine potency/concentration (e.g., 500mg per tablet, 10ml per bottle)"
                        />

                        <StyledTextField
                            label="Unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            required
                            placeholder="e.g., pcs, box, strip, ml"
                            helperText="Packaging unit for pricing (e.g., per piece, per box, per strip)"
                        />

                        <StyledTextField
                            label="Quantity"
                            name="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                            inputProps={{ min: 0 }}
                        />

                        <StyledTextField
                            label="Cost Price (per unit)"
                            name="costPrice"
                            type="number"
                            value={formData.costPrice}
                            onChange={handleChange}
                            required
                            inputProps={{ min: 0, step: 0.01 }}
                            helperText={`Cost price per ${formData.unit || "unit"} (e.g., if unit is "pcs", this is price per piece)`}
                        />

                        <StyledTextField
                            label="Sell Price (per unit)"
                            name="sellPrice"
                            type="number"
                            value={formData.sellPrice}
                            onChange={handleChange}
                            required
                            inputProps={{ min: 0, step: 0.01 }}
                            helperText={`Selling price per ${formData.unit || "unit"} (e.g., if unit is "pcs", this is price per piece)`}
                        />

                        <StyledTextField
                            label="Low Stock Threshold"
                            name="lowStockThreshold"
                            type="number"
                            value={formData.lowStockThreshold}
                            onChange={handleChange}
                            inputProps={{ min: 0 }}
                        />

                        <StyledTextField
                            label="Manufacturing Date"
                            name="mfgDate"
                            type="date"
                            value={formData.mfgDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />

                        <StyledTextField
                            label="Expiry Date"
                            name="expiryDate"
                            type="date"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />

                        <StyledSelect
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            {statusOptions.map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                        </StyledSelect>

                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.prescriptionRequired}
                                        onChange={handleChange}
                                        name="prescriptionRequired"
                                    />
                                }
                                label="Prescription Required"
                            />
                        </Box>

                        <StyledTextField
                            label="Storage Conditions"
                            name="storageConditions"
                            value={formData.storageConditions}
                            onChange={handleChange}
                            placeholder="e.g., Store in a cool, dry place"
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
                            onClick={() => navigate("/pharmacist/medicines")}
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
                            {isLoading ? <CircularProgress size={24} /> : isEditMode ? "Update Medicine" : "Create Medicine"}
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

export default AddEditMedicine;

