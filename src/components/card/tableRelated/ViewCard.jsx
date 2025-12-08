// Updated ViewCard component to display all data values in a single card layout
// Uses key-value pairs for read-only display. All values shown in one cohesive card.
// Modified to use 2-column layout with Box and flexbox (no Grid component).
// Added dynamic title prop for reusability across different entities (e.g., Patient, Doctor).

import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Divider,
} from '@mui/material';

function ViewCard({ data = {}, fields = [], title = "Details" }) {
    return (
        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    {title}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {fields.map((field) => (
                        <Box key={field.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ minWidth: '50%', textAlign: 'left' }}>
                                {field.label}:
                            </Typography>
                            <Typography variant="body1" sx={{ minWidth: '50%', textAlign: 'right' }}>
                                {data[field.name] || 'N/A'}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}

export default ViewCard;