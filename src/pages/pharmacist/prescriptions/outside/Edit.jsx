import { useState, useEffect, useCallback, useMemo } from "react";
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

    const totalAmount = Number(record?.totalAmountWithGst ?? record?.totalAmount ?? 0);
    const paidAmount = Number(record?.paidAmount || 0);
    return paidAmount >= totalAmount && totalAmount > 0 ? "Paid" : "Unpaid";
};

const sanitizePhoneInput = (value) => String(value || "").replace(/\D/g, "").slice(0, 10);

const validatePhoneFields = (phone, alternativePhone) => {
    const phoneDigits = sanitizePhoneInput(phone);
    const altDigits = sanitizePhoneInput(alternativePhone);

    if (phoneDigits && phoneDigits.length !== 10) {
        return "Phone number must be exactly 10 digits.";
    }
    if (altDigits && altDigits.length !== 10) {
        return "Alternative number must be exactly 10 digits.";
    }
    return null;
};

function OutsideDispense_Edit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [medicines, setMedicines] = useState([]);
    const [originalMedicines, setOriginalMedicines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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
            setGst(Number(record.gst) || 0);
            setForm({
                name: record.name || "",
                email: record.email || "",
                phone: sanitizePhoneInput(record.phone),
                alternativePhone: sanitizePhoneInput(record.alternativePhone),
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
        const nextValue =
            field === "phone" || field === "alternativePhone"
                ? sanitizePhoneInput(value)
                : value;
        setForm((prev) => ({ ...prev, [field]: nextValue }));
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

    const subtotal = useMemo(
        () => form.medicines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0),
        [form.medicines]
    );
    const gstAmount = useMemo(() => (subtotal * gst) / 100, [subtotal, gst]);
    const totalWithGst = useMemo(() => subtotal + gstAmount, [subtotal, gstAmount]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const validMedicines = form.medicines.filter(
            (m) => m.medicine && Number(m.dispensedQuantity) > 0
        );

        if (validMedicines.length === 0) {
            toast.error("Please add at least one medicine with dispense quantity.");
            return;
        }

        const phoneError = validatePhoneFields(form.phone, form.alternativePhone);
        if (phoneError) {
            toast.error(phoneError);
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
                        <TextField
                            fullWidth
                            label="Phone"
                            value={form.phone}
                            onChange={(e) => handleFormChange("phone", e.target.value)}
                            placeholder="10-digit number"
                            inputProps={{ maxLength: 10, inputMode: "numeric" }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Alternative No."
                            value={form.alternativePhone}
                            onChange={(e) => handleFormChange("alternativePhone", e.target.value)}
                            placeholder="10-digit number"
                            inputProps={{ maxLength: 10, inputMode: "numeric" }}
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
                                            <MenuItem value="Before Food">Before Food</MenuItem>
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

                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid var(--color-border)",
                        bgcolor: "background.default",
                    }}
                >
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                        Billing Summary (before GST)
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                        ₹{subtotal.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        GST is entered when you save changes
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
                    <CancelButton onClick={() => navigate(LIST_PATH)}>Cancel</CancelButton>
                    <SubmitButton
                        type="submit"
                        text={isSubmitting ? "Saving..." : "Save Changes"}
                        disabled={isSubmitting || hasOverStock}
                    />
                </Box>
            </Box>

            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Confirm Save
                </DialogTitle>
                <DialogContent sx={{ mt: 1 }}>
                    <DialogContentText sx={{ mb: 2 }}>
                        Enter GST and confirm changes for this outside dispense.
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
                            Subtotal: ₹{subtotal.toFixed(2)}
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
                    >
                        {isSubmitting ? "Saving..." : "Confirm & Save"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default OutsideDispense_Edit;
