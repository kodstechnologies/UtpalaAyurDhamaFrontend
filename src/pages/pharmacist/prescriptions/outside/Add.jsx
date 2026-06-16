import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    TextField,
    Autocomplete,
    Grid,
    IconButton,
    Stack,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Chip,
    Container,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

import HeadingCard from "../../../../components/card/HeadingCard";
import SubmitButton from "../../../../components/buttons/SubmitButton";
import CancelButton from "../../../../components/buttons/CancelButton";
import outsideDispenseService from "../../../../services/outsideDispenseService";
import medicineService from "../../../../services/medicineService";

const LIST_PATH = "/pharmacist/prescriptions/outside";

const dosageOptions = [
    { value: "0-1-0", label: "0-1-0" },
    { value: "1-0-0", label: "1-0-0" },
    { value: "1-0-1", label: "1-0-1" },
    { value: "1-1-1", label: "1-1-1" },
    { value: "0-0-1", label: "0-0-1" },
];

const subtypeOptions = ["Oil", "Ghee", "Internal", "External usage"];
const frequencyOptions = ["Once daily", "Twice daily", "Thrice daily", "Four times daily", "As needed"];

const emptyMedicineLine = () => ({
    medicine: "",
    medicineName: "",
    frequency: "",
    duration: "",
    foodTiming: "",
    foodTime: "",
    dosageSchedule: "",
    subType: "",
    dispensedQuantity: "",
    amount: "",
    notes: "",
});

const sortMedicinesAsc = (list) =>
    [...list].sort((a, b) =>
        (a.medicineName || "").localeCompare(b.medicineName || "", undefined, { sensitivity: "base" })
    );

const parseMedicinesResponse = (response) => {
    if (!response?.success) return [];
    const data = response.data;
    let medicines = [];
    if (Array.isArray(data?.medicines)) medicines = data.medicines;
    else if (Array.isArray(data?.data)) medicines = data.data;
    else if (Array.isArray(data)) medicines = data;
    return sortMedicinesAsc(medicines);
};

function SectionHeader({ icon, title, subtitle, action }) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                mb: 3,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                    }}
                >
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Box>
            {action}
        </Box>
    );
}

function OutsideDispense_Add() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [medicines, setMedicines] = useState([]);
    const [isLoadingMedicines, setIsLoadingMedicines] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gst, setGst] = useState(0);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        alternativePhone: "",
        address: "",
        age: "",
        disease: "",
        medicines: [emptyMedicineLine()],
    });

    const fetchMedicines = useCallback(async () => {
        setIsLoadingMedicines(true);
        try {
            const response = await medicineService.getAllMedicines({ page: 1, limit: 1000, status: "Active" });
            setMedicines(parseMedicinesResponse(response));
        } catch (error) {
            toast.error("Failed to load medicines");
        } finally {
            setIsLoadingMedicines(false);
        }
    }, []);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleMedicineChange = (index, field, value) => {
        setForm((prev) => {
            const updated = [...prev.medicines];
            updated[index] = { ...updated[index], [field]: value };

            if (field === "medicine") {
                const selected = medicines.find((m) => m._id === value);
                if (selected) {
                    updated[index].medicineName = selected.medicineName;
                    const qty = Number(updated[index].dispensedQuantity) || 0;
                    if (qty > 0) {
                        updated[index].amount = (selected.sellPrice || 0) * qty;
                    }
                }
            }

            if (field === "dispensedQuantity") {
                const selected = medicines.find((m) => m._id === updated[index].medicine);
                if (selected) {
                    const qty = Number(value) || 0;
                    updated[index].amount = (selected.sellPrice || 0) * qty;
                }
            }

            return { ...prev, medicines: updated };
        });
    };

    const addMedicineLine = () => {
        setForm((prev) => ({
            ...prev,
            medicines: [...prev.medicines, emptyMedicineLine()],
        }));
    };

    const removeMedicineLine = (index) => {
        setForm((prev) => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index),
        }));
    };

    const getMedicineById = (medicineId) => {
        if (!medicineId) return null;
        return medicines.find((m) => String(m._id) === String(medicineId)) || null;
    };

    const getStockInfo = (line) => {
        const selected = getMedicineById(line.medicine);
        if (!selected) return null;

        const available = Number(selected.quantity) || 0;
        const requested = Number(line.dispensedQuantity) || 0;
        const unit = selected.unit || "pcs";
        const lowThreshold = Number(selected.lowStockThreshold) || 10;
        const stockStatus =
            selected.stockStatus ||
            (available <= 0 ? "Out of Stock" : available <= lowThreshold ? "Low Stock" : "In Stock");

        return {
            available,
            unit,
            stockStatus,
            lowThreshold,
            isOverStock: requested > 0 && requested > available,
        };
    };

    const getStockColor = (stockInfo) => {
        if (!stockInfo) return "text.secondary";
        if (stockInfo.available <= 0) return "error.main";
        if (stockInfo.available <= stockInfo.lowThreshold) return "warning.main";
        return "success.main";
    };

    const hasOverStock = form.medicines.some((line) => getStockInfo(line)?.isOverStock);

    const totalAmount = useMemo(
        () =>
            form.medicines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0),
        [form.medicines]
    );
    const gstAmount = useMemo(() => (totalAmount * gst) / 100, [totalAmount, gst]);
    const totalWithGst = useMemo(() => totalAmount + gstAmount, [totalAmount, gstAmount]);

    const validMedicineCount = useMemo(
        () => form.medicines.filter((m) => m.medicine && Number(m.dispensedQuantity) > 0).length,
        [form.medicines]
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        const validMedicines = form.medicines.filter(
            (m) => m.medicine && Number(m.dispensedQuantity) > 0
        );

        if (validMedicines.length === 0) {
            toast.error("Please add at least one medicine with dispense quantity.");
            return;
        }

        const overStockLine = form.medicines.find((line) => getStockInfo(line)?.isOverStock);
        if (overStockLine) {
            const stock = getStockInfo(overStockLine);
            toast.error(
                `${overStockLine.medicineName} is out of stock. Only ${stock.available} ${stock.unit} available.`
            );
            return;
        }

        setConfirmDialogOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setConfirmDialogOpen(false);

        const validMedicines = form.medicines.filter(
            (m) => m.medicine && Number(m.dispensedQuantity) > 0
        );

        setIsSubmitting(true);
        try {
            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                alternativePhone: form.alternativePhone.trim(),
                address: form.address.trim(),
                age: form.age ? Number(form.age) : undefined,
                disease: form.disease.trim(),
                gst,
                medicines: validMedicines.map((m) => ({
                    medicine: m.medicine,
                    medicineName: m.medicineName,
                    frequency: m.frequency,
                    duration: m.duration,
                    foodTiming: m.foodTiming,
                    foodTime: m.foodTime,
                    dosageSchedule: m.dosageSchedule,
                    subType: m.subType,
                    dispensedQuantity: Number(m.dispensedQuantity),
                    amount: Number(m.amount) || 0,
                    notes: m.notes,
                })),
            };

            const response = await outsideDispenseService.create(payload);
            if (response?.success) {
                toast.success("Medicine dispensed successfully. Store stock updated.");
                navigate(LIST_PATH);
            } else {
                toast.error(response?.message || "Failed to dispense medicine");
            }
        } catch (error) {
            toast.error(error?.message || "Failed to dispense medicine");
        } finally {
            setIsSubmitting(false);
        }
    };

    const cardSx = {
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        mb: 3,
    };

    if (isLoadingMedicines) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <HeadingCard
                title={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <LocalPharmacyOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                        <span>Add Outside Dispense</span>
                    </Box>
                }
                subtitle="Register walk-in customer details and dispense medicines from pharmacy stock."
                breadcrumbItems={[
                    { label: "Pharmacist", url: "/pharmacist/dashboard" },
                    { label: "Outside", url: LIST_PATH },
                    { label: "Add" },
                ]}
            />

            <Box component="form" onSubmit={handleSubmit}>
                <Card sx={cardSx}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionHeader
                            icon={<PersonOutlineIcon />}
                            title="Customer Details"
                            subtitle="All fields are optional"
                        />

                        <Grid container spacing={2.5}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={form.name}
                                    onChange={(e) => handleFormChange("name", e.target.value)}
                                    placeholder="Enter customer name"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Age"
                                    type="number"
                                    value={form.age}
                                    onChange={(e) => handleFormChange("age", e.target.value)}
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Disease"
                                    value={form.disease}
                                    onChange={(e) => handleFormChange("disease", e.target.value)}
                                    placeholder="e.g. Fever, Cold"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={form.phone}
                                    onChange={(e) => handleFormChange("phone", e.target.value)}
                                    placeholder="Primary contact"
                                    InputProps={{
                                        startAdornment: (
                                            <PhoneOutlinedIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Alternative No."
                                    value={form.alternativePhone}
                                    onChange={(e) => handleFormChange("alternativePhone", e.target.value)}
                                    placeholder="Secondary contact"
                                    InputProps={{
                                        startAdornment: (
                                            <PhoneOutlinedIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleFormChange("email", e.target.value)}
                                    placeholder="customer@email.com"
                                    InputProps={{
                                        startAdornment: (
                                            <EmailOutlinedIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    value={form.address}
                                    onChange={(e) => handleFormChange("address", e.target.value)}
                                    multiline
                                    minRows={2}
                                    placeholder="House no, street, city, pincode"
                                    InputProps={{
                                        startAdornment: (
                                            <HomeOutlinedIcon
                                                sx={{
                                                    mr: 1,
                                                    color: "text.secondary",
                                                    fontSize: 20,
                                                    alignSelf: "flex-start",
                                                    mt: 1.2,
                                                }}
                                            />
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card sx={cardSx}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionHeader
                            icon={<MedicationOutlinedIcon />}
                            title="Medicines to Dispense"
                            subtitle="Add one or more medicines with quantity and dosage details"
                            action={
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={addMedicineLine}
                                    type="button"
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: 600,
                                        boxShadow: "none",
                                    }}
                                >
                                    Add Medicine
                                </Button>
                            }
                        />

                        <Stack spacing={2.5}>
                            {form.medicines.map((line, index) => {
                                const stockInfo = getStockInfo(line);
                                const stockLabel = stockInfo
                                    ? `Available: ${stockInfo.available} ${stockInfo.unit} • ${stockInfo.stockStatus}`
                                    : "";

                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: { xs: 2, md: 2.5 },
                                            borderRadius: 2.5,
                                            border: `1px solid ${
                                                stockInfo?.isOverStock
                                                    ? alpha(theme.palette.error.main, 0.4)
                                                    : alpha(theme.palette.divider, 0.15)
                                            }`,
                                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 2,
                                            }}
                                        >
                                            <Chip
                                                label={`Medicine ${index + 1}`}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: theme.palette.primary.main,
                                                }}
                                            />
                                            {form.medicines.length > 1 && (
                                                <Tooltip title="Remove medicine">
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => removeMedicineLine(index)}
                                                        type="button"
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.error.main, 0.08),
                                                            "&:hover": {
                                                                bgcolor: alpha(theme.palette.error.main, 0.15),
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={7}>
                                                <Autocomplete
                                                    options={medicines}
                                                    getOptionLabel={(option) => option.medicineName || ""}
                                                    value={getMedicineById(line.medicine) || null}
                                                    onChange={(_, newValue) =>
                                                        handleMedicineChange(index, "medicine", newValue?._id || "")
                                                    }
                                                    isOptionEqualToValue={(option, value) =>
                                                        String(option._id) === String(value?._id)
                                                    }
                                                    noOptionsText="No medicine found"
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Medicine"
                                                            placeholder="Search medicine..."
                                                            required
                                                            helperText={stockLabel}
                                                            FormHelperTextProps={{
                                                                sx: {
                                                                    color: getStockColor(stockInfo),
                                                                    fontWeight: 600,
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                    renderOption={(props, option) => (
                                                        <li {...props} key={option._id}>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    {option.medicineName}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Stock: {option.quantity || 0}{" "}
                                                                    {option.unit || "pcs"} —{" "}
                                                                    {option.stockStatus || "In Stock"}
                                                                </Typography>
                                                            </Box>
                                                        </li>
                                                    )}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <TextField
                                                    fullWidth
                                                    label="Dispense Qty"
                                                    type="number"
                                                    value={line.dispensedQuantity}
                                                    onChange={(e) =>
                                                        handleMedicineChange(index, "dispensedQuantity", e.target.value)
                                                    }
                                                    required
                                                    inputProps={{ min: 1 }}
                                                    error={Boolean(stockInfo?.isOverStock)}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={2}>
                                                <TextField
                                                    fullWidth
                                                    label="Amount (₹)"
                                                    type="number"
                                                    value={line.amount}
                                                    onChange={(e) =>
                                                        handleMedicineChange(index, "amount", e.target.value)
                                                    }
                                                    helperText="Auto price"
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    fontWeight={600}
                                                    sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                                                >
                                                    Dosage Details
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={3}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Frequency</InputLabel>
                                                    <Select
                                                        value={line.frequency}
                                                        onChange={(e) =>
                                                            handleMedicineChange(index, "frequency", e.target.value)
                                                        }
                                                        label="Frequency"
                                                    >
                                                        <MenuItem value="">Select</MenuItem>
                                                        {frequencyOptions.map((freq) => (
                                                            <MenuItem key={freq} value={freq}>
                                                                {freq}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Duration"
                                                    value={line.duration}
                                                    onChange={(e) =>
                                                        handleMedicineChange(index, "duration", e.target.value)
                                                    }
                                                    placeholder="e.g. 5 days"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Food Timing</InputLabel>
                                                    <Select
                                                        value={line.foodTiming}
                                                        onChange={(e) =>
                                                            handleMedicineChange(index, "foodTiming", e.target.value)
                                                        }
                                                        label="Food Timing"
                                                    >
                                                        <MenuItem value="">Select</MenuItem>
                                                        <MenuItem value="Early Morning">Early Morning</MenuItem>
                                                        <MenuItem value="After Breakfast">After Breakfast</MenuItem>
                                                        <MenuItem value="Afternoon">Afternoon</MenuItem>
                                                        <MenuItem value="After Dinner">After Dinner</MenuItem>
                                                        <MenuItem value="Empty Stomach">Empty Stomach</MenuItem>
                                                        <MenuItem value="Before Bed">Before Bed</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Food Time"
                                                    value={line.foodTime}
                                                    onChange={(e) =>
                                                        handleMedicineChange(index, "foodTime", e.target.value)
                                                    }
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Dosage Schedule</InputLabel>
                                                    <Select
                                                        value={line.dosageSchedule}
                                                        onChange={(e) =>
                                                            handleMedicineChange(index, "dosageSchedule", e.target.value)
                                                        }
                                                        label="Dosage Schedule"
                                                    >
                                                        <MenuItem value="">Select</MenuItem>
                                                        {dosageOptions.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Autocomplete
                                                    freeSolo
                                                    size="small"
                                                    options={subtypeOptions}
                                                    value={line.subType || ""}
                                                    onInputChange={(_, newValue) =>
                                                        handleMedicineChange(index, "subType", newValue)
                                                    }
                                                    onChange={(_, newValue) =>
                                                        handleMedicineChange(index, "subType", newValue || "")
                                                    }
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Subtype"
                                                            placeholder="Oil, Ghee..."
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Notes"
                                                    value={line.notes}
                                                    onChange={(e) =>
                                                        handleMedicineChange(index, "notes", e.target.value)
                                                    }
                                                    placeholder="Additional instructions"
                                                />
                                            </Grid>
                                        </Grid>

                                        {stockInfo?.isOverStock && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: "block",
                                                    mt: 1.5,
                                                    color: "error.main",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Out of stock — only {stockInfo.available} {stockInfo.unit} available.
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            })}
                        </Stack>
                    </CardContent>
                </Card>

                <Card
                    sx={{
                        ...cardSx,
                        mb: 0,
                        position: { md: "sticky" },
                        bottom: { md: 16 },
                        zIndex: 2,
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", md: "row" },
                                justifyContent: "space-between",
                                alignItems: { xs: "stretch", md: "center" },
                                gap: 2,
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Summary (before GST)
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="baseline" flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                                    <Typography variant="h5" fontWeight={800} color="primary.main">
                                        ₹{totalAmount.toFixed(2)}
                                    </Typography>
                                    <Chip
                                        label={`${validMedicineCount} medicine${validMedicineCount !== 1 ? "s" : ""}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                    GST is entered when you confirm dispense
                                </Typography>
                            </Box>

                            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                                <CancelButton onClick={() => navigate(LIST_PATH)}>Cancel</CancelButton>
                                <SubmitButton
                                    type="submit"
                                    text={isSubmitting ? "Submitting..." : "Submit & Dispense"}
                                    disabled={isSubmitting || hasOverStock || validMedicineCount === 0}
                                />
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Confirm Dispense
                </DialogTitle>
                <DialogContent sx={{ mt: 1 }}>
                    <DialogContentText sx={{ mb: 2 }}>
                        Enter GST and confirm dispense for this outside customer.
                    </DialogContentText>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                        {form.medicines
                            .filter((m) => m.medicine && Number(m.dispensedQuantity) > 0)
                            .map((m, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 1,
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={600}>
                                        {m.medicineName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Qty: <b>{m.dispensedQuantity}</b> · Amount: <b>₹{Number(m.amount || 0).toFixed(2)}</b>
                                    </Typography>
                                </Box>
                            ))}
                    </Box>

                    <TextField
                        label="GST (%)"
                        type="number"
                        fullWidth
                        value={gst}
                        onChange={(e) => setGst(Math.max(0, Number(e.target.value) || 0))}
                        sx={{ mb: 2 }}
                        inputProps={{ min: 0 }}
                        autoFocus
                    />

                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.success.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Subtotal: ₹{totalAmount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            GST ({gst}%): ₹{gstAmount.toFixed(2)}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={700} color="success.dark" sx={{ mt: 0.5 }}>
                            Total bill amount: ₹{totalWithGst.toFixed(2)}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setConfirmDialogOpen(false)} variant="outlined" color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmSubmit}
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                            backgroundColor: theme.palette.success.main,
                            "&:hover": { backgroundColor: theme.palette.success.dark },
                        }}
                    >
                        {isSubmitting ? "Submitting..." : "Confirm & Dispense"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default OutsideDispense_Add;
