import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
} from '@mui/material';

function AddDailyCheckup({ open, onClose, onAdd, initialDate = '2025-12-08' }) {
    const [formData, setFormData] = useState({
        date: initialDate,
        temperature: '',
        bloodPressure: '',
        pulseRate: '',
        spo2: '',
        notes: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onAdd) {
            onAdd(formData);
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Daily Checkup / Description</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Date"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Temperature"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Pulse Rate (bpm)"
                                name="pulseRate"
                                type="number"
                                value={formData.pulseRate}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Blood Pressure"
                                name="bloodPressure"
                                value={formData.bloodPressure}
                                onChange={handleChange}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="SpO2 (%)"
                                name="spo2"
                                type="number"
                                value={formData.spo2}
                                onChange={handleChange}
                                inputProps={{ min: 0, max: 100, step: 0.1 }}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        <TextField
                            label="Notes / Description"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            fullWidth
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

export default AddDailyCheckup;