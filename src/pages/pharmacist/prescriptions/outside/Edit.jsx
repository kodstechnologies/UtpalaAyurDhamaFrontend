import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Typography,
    TextField,
    Autocomplete,
    Grid,
    IconButton,
    Divider,
    Stack,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

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

const derivePaymentStatus = (record) => {
    const normalizedStatus = (record?.paymentStatus || "").toLowerCase();
    if (normalizedStatus === "paid") return "Paid";
    if (normalizedStatus === "partially paid") return "Unpaid";
    if (normalizedStatus === "unpaid") return "Unpaid";

    const totalAmount = Number(record?.totalAmount || 0);
    const paidAmount = Number(record?.paidAmount || 0);
    return paidAmount >= totalAmount && totalAmount > 0 ? "Paid" : "Unpaid";
};

function OutsideDispense_Edit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [originalMedicines, setOriginalMedicines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [medicinesRes, recordRes] = await Promise.all([
                medicineService.getAllMedicines({ page: 1, limit: 1000, status: "Active" }),
                outsideDispenseService.getById(id),
            ]);

            setMedicines(parseMedicinesResponse(medicinesRes));

            if (!recordRes?.success) {
                toast.error(recordRes?.message || "Failed to load record");
                navigate(LIST_PATH);
                return;
            }

            const record = recordRes.data;
            if (derivePaymentStatus(record) === "Paid") {
                toast.info("Paid records cannot be edited");
                navigate(LIST_PATH);
                return;
            }

            const recordMedicines = record.medicines || [];
            setOriginalMedicines(recordMedicines);
            setForm({
                name: record.name || "",
                email: record.email || "",
                phone: record.phone || "",
                alternativePhone: record.alternativePhone || "",
                address: record.address || "",
                age: record.age ?? "",
                disease: record.disease || "",
                medicines:
                    recordMedicines.length > 0
                        ? recordMedicines.map((m) => ({
                              medicine: m.medicine?._id || m.medicine || "",
                              medicineName: m.medicineName || "",
                              frequency: m.frequency || "",
                              duration: m.duration || "",
                              foodTiming: m.foodTiming || "",
                              foodTime: m.foodTime || "",
                              dosageSchedule: m.dosageSchedule || "",
                              subType: m.subType || "",
                              dispensedQuantity: m.dispensedQuantity ?? "",
                              amount: m.amount ?? "",
                              notes: m.notes || "",
                          }))
                        : [emptyMedicineLine()],
            });
        } catch (error) {
            toast.error(error?.message || "Failed to load record");
            navigate(LIST_PATH);
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (id) loadData();
    }, [id, loadData]);

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

    const getPreviouslyDispensed = (medicineId) => {
        if (!medicineId) return 0;
        return originalMedicines
            .filter((m) => String(m.medicine?._id || m.medicine) === String(medicineId))
            .reduce((sum, m) => sum + (Number(m.dispensedQuantity) || 0), 0);
    };

    const getStockInfo = (line) => {
        const selected = getMedicineById(line.medicine);
        if (!selected) return null;

        const currentStock = Number(selected.quantity) || 0;
        const previouslyDispensed = getPreviouslyDispensed(line.medicine);
        const available = currentStock + previouslyDispensed;
        const requested = Number(line.dispensedQuantity) || 0;
        const unit = selected.unit || "pcs";
        const lowThreshold = Number(selected.lowStockThreshold) || 10;
        const stockStatus =
            available <= 0 ? "Out of Stock" : available <= lowThreshold ? "Low Stock" : "In Stock";

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

    const handleSubmit = async (e) => {
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

            const response = await outsideDispenseService.update(id, payload);
            if (response?.success) {
                toast.success("Outside dispense updated. Store stock adjusted.");
                navigate(LIST_PATH);
            } else {
                toast.error(response?.message || "Failed to update record");
            }
        } catch (error) {
            toast.error(error?.message || "Failed to update record");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Edit Outside Dispense"
                subtitle="Update walk-in customer dispense details and medicines."
                breadcrumbItems={[
                    { label: "Pharmacist", url: "/pharmacist/dashboard" },
                    { label: "Outside", url: LIST_PATH },
                    { label: "Edit" },
                ]}
            />

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    mt: 2,
                    p: 4,
                    borderRadius: 4,
                    bgcolor: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                }}
            >
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Customer Details
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Name" value={form.name} onChange={(e) => handleFormChange("name", e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => handleFormChange("phone", e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Alternative No."
                            value={form.alternativePhone}
                            onChange={(e) => handleFormChange("alternativePhone", e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => handleFormChange("email", e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Age" type="number" value={form.age} onChange={(e) => handleFormChange("age", e.target.value)} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Address"
                            value={form.address}
                            onChange={(e) => handleFormChange("address", e.target.value)}
                            multiline
                            minRows={2}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Disease" value={form.disease} onChange={(e) => handleFormChange("disease", e.target.value)} />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>Medicines</Typography>
                    <Button startIcon={<AddIcon />} onClick={addMedicineLine} type="button">
                        Add Medicine
                    </Button>
                </Stack>

                {form.medicines.map((line, index) => {
                    const stockInfo = getStockInfo(line);
                    const stockLabel = stockInfo
                        ? `Available stock: ${stockInfo.available} ${stockInfo.unit} (${stockInfo.stockStatus})`
                        : "";

                    return (
                        <Box
                            key={index}
                            sx={{
                                p: 2,
                                mb: 2,
                                border: "1px solid var(--color-border)",
                                borderRadius: 2,
                                bgcolor: "var(--color-bg-hover)",
                            }}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
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
                                                        mt: 0.5,
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Dispense Qty"
                                        type="number"
                                        value={line.dispensedQuantity}
                                        onChange={(e) => handleMedicineChange(index, "dispensedQuantity", e.target.value)}
                                        required
                                        inputProps={{ min: 1 }}
                                        error={Boolean(stockInfo?.isOverStock)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Frequency</InputLabel>
                                        <Select
                                            value={line.frequency}
                                            onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
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
                                <Grid item xs={12} sm={4} md={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Duration"
                                        value={line.duration}
                                        onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                                        placeholder="e.g., 5 days"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Food Timing</InputLabel>
                                        <Select
                                            value={line.foodTiming}
                                            onChange={(e) => handleMedicineChange(index, "foodTiming", e.target.value)}
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
                                <Grid item xs={12} sm={4} md={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Food Time"
                                        value={line.foodTime}
                                        onChange={(e) => handleMedicineChange(index, "foodTime", e.target.value)}
                                        placeholder="Food time"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Dosage Schedule</InputLabel>
                                        <Select
                                            value={line.dosageSchedule}
                                            onChange={(e) => handleMedicineChange(index, "dosageSchedule", e.target.value)}
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
                                <Grid item xs={12} sm={4} md={2}>
                                    <Autocomplete
                                        freeSolo
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
                                                label="Subtypes"
                                                placeholder="Select or enter subtype"
                                                size="small"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4} md={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Amount (₹)"
                                        type="number"
                                        value={line.amount}
                                        onChange={(e) => handleMedicineChange(index, "amount", e.target.value)}
                                        helperText="Auto-filled from store price"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Notes" value={line.notes} onChange={(e) => handleMedicineChange(index, "notes", e.target.value)} />
                                </Grid>
                            </Grid>

                            {stockInfo?.isOverStock && (
                                <Typography variant="caption" sx={{ display: "block", mt: 1, color: "error.main", fontWeight: 600 }}>
                                    Out of stock — only {stockInfo.available} {stockInfo.unit} available.
                                </Typography>
                            )}

                            {form.medicines.length > 1 && (
                                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                                    <IconButton color="error" onClick={() => removeMedicineLine(index)} type="button">
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    );
                })}

                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
                    <CancelButton onClick={() => navigate(LIST_PATH)}>Cancel</CancelButton>
                    <SubmitButton
                        type="submit"
                        text={isSubmitting ? "Saving..." : "Save Changes"}
                        disabled={isSubmitting || hasOverStock}
                    />
                </Box>
            </Box>
        </Box>
    );
}

export default OutsideDispense_Edit;
