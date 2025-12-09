// // Updated ViewCard component to display all data values in a single card layout
// // Uses key-value pairs for read-only display. All values shown in one cohesive card.
// // Modified to use 2-column layout with Box and flexbox (no Grid component).
// // Added dynamic title prop for reusability across different entities (e.g., Patient, Doctor).

// import React from 'react';
// import {
//     Box,
//     Typography,
//     Card,
//     CardContent,
//     Divider,
// } from '@mui/material';

// function ViewCard({ data = {}, fields = [], title = "Details" }) {
//     return (
//         <Card sx={{ maxWidth: 600, mx: 'auto' }}>
//             <CardContent>
//                 <Typography variant="h5" gutterBottom>
//                     {title}
//                 </Typography>
//                 <Divider sx={{ my: 2 }} />
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                     {fields.map((field) => (
//                         <Box key={field.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                             <Typography variant="subtitle2" color="textSecondary" sx={{ minWidth: '50%', textAlign: 'left' }}>
//                                 {field.label}:
//                             </Typography>
//                             <Typography variant="body1" sx={{ minWidth: '50%', textAlign: 'right' }}>
//                                 {data[field.name] || 'N/A'}
//                             </Typography>
//                         </Box>
//                     ))}
//                 </Box>
//             </CardContent>
//         </Card>
//     );
// }

// export default ViewCard;

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
        <Card
            sx={{
                maxWidth: 650,
                mx: "auto",
                borderRadius: 3,
                boxShadow: "var(--shadow-soft)",
                backgroundColor: "var(--color-bg-card)",
                p: 1,
            }}
        >
            <CardContent>
                {/* Title */}
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: "var(--color-text-dark)",
                        mb: 1,
                    }}
                >
                    {title}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {/* TWO-COLUMN KEY-VALUE LAYOUT */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                    }}
                >
                    {fields.map((field) => {
                        const value = data[field.name] ?? "N/A";

                        return (
                            <Box
                                key={field.name}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    backgroundColor: "var(--color-background)",
                                    borderRadius: 2,
                                    p: 1.5,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "0.75rem",
                                        color: "var(--color-text-muted)",
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        mb: 0.5,
                                    }}
                                >
                                    {field.label}
                                </Typography>

                                {/* STATUS BADGE (Auto-detect if field label = Status) */}
                                {field.label.toLowerCase() === "status" ? (
                                    <Box
                                        sx={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 1,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 2,
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            width: "fit-content",
                                            backgroundColor:
                                                value === "Active"
                                                    ? "rgba(34,197,94,0.16)"
                                                    : "rgba(239,68,68,0.16)",
                                            color:
                                                value === "Active"
                                                    ? "var(--color-success)"
                                                    : "var(--color-error)",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                bgcolor:
                                                    value === "Active"
                                                        ? "var(--color-success)"
                                                        : "var(--color-error)",
                                            }}
                                        ></Box>
                                        {value}
                                    </Box>
                                ) : (
                                    <Typography
                                        sx={{
                                            fontSize: "1rem",
                                            fontWeight: 500,
                                            color: "var(--color-text-dark)",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {value}
                                    </Typography>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </CardContent>
        </Card>
    );
}

export default ViewCard;
