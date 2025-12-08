import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    Radio,
    RadioGroup,
} from '@mui/material';

function AddPrescription({ open, onClose, patientName, onAdd }) {
    const [formData, setFormData] = useState({
        medicineType: '',
        medicineName: '',
        frequencyTiming: '',
        dosageTimes: { morning: false, afternoon: false, evening: false },
        administrationRoute: 'Internal',
        quantity: '',
        specialInstructions: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDosageChange = (timing) => {
        setFormData(prev => ({
            ...prev,
            dosageTimes: {
                ...prev.dosageTimes,
                [timing]: !prev.dosageTimes[timing],
            },
        }));
    };

    const handleRouteChange = (e) => {
        setFormData(prev => ({ ...prev, administrationRoute: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onAdd) {
            onAdd(formData);
        }
        onClose();
    };

    const medicineTypes = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment']; // Sample options
    const frequencyTimings = ['Before Meal', 'After Meal', 'With Meal', 'As Needed']; // Sample options

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Prescription</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="warning.main" gutterBottom>
                            Adding prescription for {patientName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <FormControl fullWidth required sx={{ flex: 1 }}>
                                <InputLabel>Medicine Type *</InputLabel>
                                <Select
                                    name="medicineType"
                                    value={formData.medicineType}
                                    onChange={handleChange}
                                    label="Medicine Type *"
                                >
                                    <MenuItem value="">Select Type</MenuItem>
                                    {medicineTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                label="Medicine Name *"
                                name="medicineName"
                                value={formData.medicineName}
                                onChange={handleChange}
                                placeholder="Start typing medicine name..."
                                required
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <FormControl fullWidth required sx={{ flex: 1 }}>
                                <InputLabel>Frequency/Intake Timing *</InputLabel>
                                <Select
                                    name="frequencyTiming"
                                    value={formData.frequencyTiming}
                                    onChange={handleChange}
                                    label="Frequency/Intake Timing *"
                                >
                                    <MenuItem value="">Select intake time</MenuItem>
                                    {frequencyTimings.map((timing) => (
                                        <MenuItem key={timing} value={timing}>
                                            {timing}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Dosage Times
                                </Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.dosageTimes.morning} onChange={() => handleDosageChange('morning')} />}
                                    label="Morning"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={formData.dosageTimes.afternoon} onChange={() => handleDosageChange('afternoon')} />}
                                    label="Afternoon"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={formData.dosageTimes.evening} onChange={() => handleDosageChange('evening')} />}
                                    label="Evening"
                                />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <FormControl sx={{ flex: 1 }}>
                                <RadioGroup
                                    value={formData.administrationRoute}
                                    onChange={handleRouteChange}
                                >
                                    <FormControlLabel value="Internal" control={<Radio />} label="Internal" />
                                    <FormControlLabel value="External" control={<Radio />} label="External" />
                                </RadioGroup>
                            </FormControl>
                            <TextField
                                label="Quantity"
                                name="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleChange}
                                sx={{ flex: 1 }}
                                inputProps={{ min: 1 }}
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="Special Instructions"
                            name="specialInstructions"
                            value={formData.specialInstructions}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            sx={{ mb: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} variant="outlined">
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="success">
                        Add
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default AddPrescription;