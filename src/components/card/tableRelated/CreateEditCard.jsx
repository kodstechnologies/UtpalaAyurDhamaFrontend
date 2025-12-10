import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Alert,
    DialogActions,
} from "@mui/material";

function FormCard({
    fields = [],
    onSave,
    onCancel,
    payload = {},
    title = "Create Item",
    isEdit = false,
}) {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(payload || {});
    }, [payload]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors = {};
        fields.forEach((field) => {
            const val = formData[field.name];
            if (field.required && !val) newErrors[field.name] = `${field.label} is required`;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        onSave(formData);     // Save data
        if (onCancel) onCancel();  // Auto-close form
    };



    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                maxWidth: 800,
                mx: "auto",
                p: 4,
                // borderRadius: 4,
                background: "var(--color-bg-card)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                border: "1px solid var(--color-border)",
                backdropFilter: "blur(8px)",
            }}
        >
            {/* Title */}
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 700,
                    mb: 3,
                    textAlign: "center",
                    color: "var(--color-text-dark)",
                }}
            >
                {title}
            </Typography>

            {/* GRID FORM */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 3,
                }}
            >
                {fields.map((field) => (
                    <Box key={field.name}>
                        {field.type === "select" ? (
                            <FormControl fullWidth error={!!errors[field.name]}>
                                <InputLabel>{field.label}</InputLabel>
                                <Select
                                    name={field.name}
                                    label={field.label}
                                    value={
                                        formData[field.name] !== undefined && formData[field.name] !== null
                                            ? formData[field.name]
                                            : ""
                                    }

                                    onChange={handleChange}
                                    sx={{
                                        borderRadius: 2,
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "var(--color-border)",
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "var(--color-primary)",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "var(--color-primary)",
                                            borderWidth: 2,
                                        },
                                    }}
                                >
                                    {field?.options?.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors[field.name] && (
                                    <FormHelperText sx={{ color: "var(--color-error)" }}>
                                        {errors[field.name]}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        ) : (
                            <TextField
                                fullWidth
                                label={field.label}
                                name={field.name}
                                type={field.type || "text"}
                                value={formData[field.name] !== undefined ? formData[field.name] : ""}
                                onChange={handleChange}
                                error={!!errors[field.name]}
                                helperText={errors[field.name]}
                                InputLabelProps={field.type === "date" ? { shrink: true } : {}}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,
                                        backgroundColor: "var(--color-white)",
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "var(--color-border)",
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "var(--color-primary)",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "var(--color-primary)",
                                            borderWidth: 2,
                                        },
                                    },
                                }}
                            />

                        )}
                    </Box>
                ))}
            </Box>

            {/* Error Alert */}
            {Object.keys(errors).length > 0 && (
                <Alert severity="error" sx={{ mt: 3 }}>
                    Fix the highlighted errors.
                </Alert>
            )}

            {/* Buttons */}
            <DialogActions sx={{ mt: 3, justifyContent: "flex-end", gap: 2 }}>
                <Button
                    onClick={onCancel}
                    sx={{
                        textTransform: "none",
                        color: "var(--color-text-muted)",
                    }}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        px: 4,
                        py: 1,
                        borderRadius: 2,
                        fontWeight: 600,
                        backgroundColor: "var(--color-primary)",
                        "&:hover": {
                            backgroundColor: "var(--color-primary-dark)",
                        },
                    }}
                >
                    {isEdit ? "Update" : "Create"}
                </Button>
            </DialogActions>
        </Box>
    );
}

export default FormCard;