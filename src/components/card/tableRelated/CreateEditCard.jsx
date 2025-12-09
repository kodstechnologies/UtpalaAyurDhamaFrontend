// import React, { useState } from 'react';
// import {
//     TextField,
//     Button,
//     Box,
//     Typography,
//     FormControl,
//     InputLabel,
//     Select,
//     MenuItem,
//     FormHelperText,
//     Alert,
//     DialogActions,
// } from '@mui/material';
// // Simple toast notification (assuming react-toastify is installed; otherwise, use alert or custom)
// import { toast } from 'react-toastify'; // Import if using react-toastify; else, replace with console/alert

// function CreateEditCard({
//     fields = [], // Array of { name: string, label: string, type: 'text' | 'email' | 'number' | 'date' | 'select', required: boolean, options?: array for select }
//     onSave,
//     onCancel,
//     payload = {}, // Initial payload values if any
//     title = "Create New Item", // Dynamic title prop
//     showToast = true, // Whether to show toast notifications
//     isEdit = false // Flag to distinguish create vs edit for messages
// }) {
//     const [formData, setFormData] = useState(payload || {});
//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//         if (errors[name]) {
//             setErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
//         }
//     };

//     const handleSelectChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//         if (errors[name]) {
//             setErrors(prev => ({ ...prev, [name]: '' }));
//         }
//     };

//     const validateForm = () => {
//         const newErrors = {};
//         fields.forEach(field => {
//             if (field.required && !formData[field.name]) {
//                 newErrors[field.name] = `${field.label} is required`;
//             }
//             // Add more validation as needed (e.g., email format, age > 0)
//             if (field.type === 'email' && formData[field.name] && !/\S+@\S+\.\S+/.test(formData[field.name])) {
//                 newErrors[field.name] = 'Invalid email format';
//             }
//             if (field.name === 'age' && formData[field.name] && (isNaN(formData[field.name]) || formData[field.name] < 0)) {
//                 newErrors[field.name] = 'Age must be a positive number';
//             }
//         });
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validateForm()) return;

//         setLoading(true);
//         try {
//             // Call onSave with formData (API call handled in parent)
//             await onSave(formData);
//             if (showToast) {
//                 const action = isEdit ? 'updated' : 'created';
//                 toast.success(`Patient ${action} successfully!`);
//             }
//             onCancel(); // Close modal or navigate back
//         } catch (error) {
//             console.error('Save error:', error);
//             if (showToast) {
//                 toast.error(`Failed to ${isEdit ? 'update' : 'create'} patient. Please try again.`);
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
//             <Typography variant="h6" gutterBottom>
//                 {title}
//             </Typography>

//             {/* Dynamic Fields - display based on fields array */}
//             {fields.map((field) => (
//                 <Box key={field.name} sx={{ mb: 2 }}>
//                     {field.type === 'select' ? (
//                         <FormControl fullWidth error={!!errors[field.name]} required={field.required}>
//                             <InputLabel>{field.label}</InputLabel>
//                             <Select
//                                 name={field.name}
//                                 value={formData[field.name] || ''}
//                                 onChange={handleSelectChange}
//                                 label={field.label}
//                                 required={field.required}
//                             >
//                                 {field.options?.map((option) => (
//                                     <MenuItem key={option.value} value={option.value}>
//                                         {option.label}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                             {errors[field.name] && <FormHelperText>{errors[field.name]}</FormHelperText>}
//                         </FormControl>
//                     ) : (
//                         <TextField
//                             fullWidth
//                             label={field.label}
//                             name={field.name}
//                             type={field.type}
//                             value={formData[field.name] || ''}
//                             onChange={handleInputChange}
//                             required={field.required}
//                             error={!!errors[field.name]}
//                             helperText={errors[field.name]}
//                             sx={{ mb: 2 }}
//                             InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
//                         />
//                     )}
//                 </Box>
//             ))}

//             {/* Error Alert if any */}
//             {Object.keys(errors).length > 0 && (
//                 <Alert severity="error" sx={{ mb: 2 }}>
//                     Please fix the errors above.
//                 </Alert>
//             )}

//             <DialogActions>
//                 <Button onClick={onCancel} disabled={loading}>
//                     Cancel
//                 </Button>
//                 <Button type="submit" variant="contained" disabled={loading}>
//                     {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
//                 </Button>
//             </DialogActions>
//         </Box>
//     );
// }

// export default CreateEditCard;
import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Alert,
    DialogActions,
} from '@mui/material';
import { toast } from 'react-toastify';

function CreateEditCard({
    fields = [],
    onSave,
    onCancel,
    payload = {},
    title = "Create New Item",
    showToast = true,
    isEdit = false
}) {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Load payload for edit mode
    useEffect(() => {
        setFormData(payload || {});
    }, [payload]);

    // Detect status field among fields
    const statusFieldName = fields.find(
        f => f.name.toLowerCase() === "status" || f.name.toLowerCase() === "isactive"
    )?.name;

    // If status exists but no options provided → add default values
    const enhancedFields = fields.map(field => {
        if (field.name === statusFieldName && !field.options) {
            return {
                ...field,
                type: "select",
                options: [
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" }
                ]
            };
        }
        return field;
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validation
    const validate = () => {
        const newErrors = {};

        enhancedFields.forEach(field => {
            const value = formData[field.name];

            if (field.required && !value) {
                newErrors[field.name] = `${field.label} is required`;
            }

            if (field.type === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
                newErrors[field.name] = "Invalid email format";
            }

            if (field.type === "number" && value && isNaN(value)) {
                newErrors[field.name] = "Must be a number";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        try {
            await onSave(formData);

            if (showToast) {
                toast.success(`${isEdit ? "Updated" : "Created"} successfully!`);
            }

            onCancel();
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                {title}
            </Typography>

            {/* Dynamic fields */}
            {enhancedFields.map(field => (
                <Box key={field.name} sx={{ mb: 2 }}>
                    {field.type === "select" ? (
                        <FormControl fullWidth error={!!errors[field.name]} required={field.required}>
                            <InputLabel>{field.label}</InputLabel>
                            <Select
                                name={field.name}
                                value={formData[field.name] || ""}
                                label={field.label}
                                onChange={handleChange}
                            >
                                {field.options?.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors[field.name] && (
                                <FormHelperText>{errors[field.name]}</FormHelperText>
                            )}
                        </FormControl>
                    ) : (
                        <TextField
                            fullWidth
                            label={field.label}
                            name={field.name}
                            type={field.type}
                            value={formData[field.name] || ""}
                            onChange={handleChange}
                            required={field.required}
                            error={!!errors[field.name]}
                            helperText={errors[field.name]}
                            InputLabelProps={
                                field.type === "date" ? { shrink: true } : {}
                            }
                        />
                    )}
                </Box>
            ))}

            {/* Error Alert */}
            {Object.keys(errors).length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Fix the errors above.
                </Alert>
            )}

            {/* Action Buttons */}
            <DialogActions>
                <Button onClick={onCancel} disabled={loading}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Saving..." : isEdit ? "Update" : "Create"}
                </Button>
            </DialogActions>
        </Box>
    );
}

export default CreateEditCard;
