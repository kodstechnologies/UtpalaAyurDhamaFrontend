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
} from '@mui/material';

function AddTherapyPlan({ open, onClose, patientName, onAdd }) {
    const [formData, setFormData] = useState({
        treatmentName: '',
        daysOfTreatment: '',
        treatmentTimeline: '',
        specialInstructions: '',
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

    const timelines = ['Morning', 'Afternoon', 'Evening', 'Full Day']; // Sample options for timeline select

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Therapy Plan</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="success.main" gutterBottom>
                            Adding therapy for {patientName}
                        </Typography>
                        <TextField
                            fullWidth
                            label="Treatment Name *"
                            name="treatmentName"
                            value={formData.treatmentName}
                            onChange={handleChange}
                            placeholder="Start typing treatment name..."
                            required
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                label="Days of Treatment *"
                                name="daysOfTreatment"
                                type="number"
                                value={formData.daysOfTreatment}
                                onChange={handleChange}
                                required
                                sx={{ flex: 1 }}
                            />
                            <FormControl fullWidth required sx={{ flex: 1 }}>
                                <InputLabel>Treatment Timeline *</InputLabel>
                                <Select
                                    name="treatmentTimeline"
                                    value={formData.treatmentTimeline}
                                    onChange={handleChange}
                                    label="Treatment Timeline *"
                                >
                                    <MenuItem value="">Select Treatment Timeline...</MenuItem>
                                    {timelines.map((timeline) => (
                                        <MenuItem key={timeline} value={timeline}>
                                            {timeline}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <TextField
                            fullWidth
                            label="Special Instructions *"
                            name="specialInstructions"
                            value={formData.specialInstructions}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            required
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

export default AddTherapyPlan;