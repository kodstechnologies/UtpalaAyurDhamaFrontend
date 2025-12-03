import React from "react";
import { Box, Typography, Button } from "@mui/material";

function HeadingCard({
    category = "TREATMENT & THERAPY",
    title = "Therapy Scheduling & Pricing",
    subtitle = "Coordinate therapy offerings, assign specialists, and keep treatment costs transparent for your front-desk and billing teams.",
}) {
    return (
        <Box
            sx={{
                width: "100%",
                borderRadius: 4,
                padding: 4,
                background: "var(--color-bg-side-bar)",
                color: "var(--color-text-dark)",
                mb: 3,
            }}
        >
            {/* Category Label */}
            <Typography
                variant="overline"
                sx={{
                    opacity: 0.8,
                    letterSpacing: 2,
                    fontWeight: 600,
                }}
            >
                {category}
            </Typography>

            {/* Title */}
            <Typography
                variant="h4"
                sx={{ fontWeight: 700, mt: 1, mb: 2 }}
            >
                {title}
            </Typography>

            {/* Subtitle */}
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: "700px" }}>
                {subtitle}
            </Typography>


        </Box>
    );
}

export default HeadingCard;
