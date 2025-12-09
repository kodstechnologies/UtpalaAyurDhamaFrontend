import React from "react";
import { Box, Typography } from "@mui/material";
import Breadcrumb from "../breadcrumb/Breadcrumb";

function HeadingCard({
    category = "TREATMENT & THERAPY",
    title = "Therapy Scheduling & Pricing",
    subtitle = "Coordinate therapy offerings, assign specialists, and keep treatment costs transparent for your front-desk and billing teams.",
    breadcrumbItems = [], // 👈 Accept breadcrumb items
    action = null, // 👈 Optional action button/element
}) {
    return (
        <Box
            sx={{
                width: "100%",
                borderRadius: 4,
                padding: 4,
                background: "var(--color-bg-card)",
                color: "var(--color-text-dark)",
                mb: 3,
            }}
        >
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Title and Action Row */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mt: 1 }}>
                <Box sx={{ flex: 1 }}>
                    {/* Title */}
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, mb: 2 }}
                    >
                        {title}
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        variant="body1"
                        sx={{ opacity: 0.9, maxWidth: "700px" }}
                    >
                        {subtitle}
                    </Typography>
                </Box>
                
                {/* Action Button */}
                {action && (
                    <Box sx={{ ml: 3, alignSelf: "flex-start" }}>
                        {action}
                    </Box>
                )}
            </Box>

        </Box>
    );
}

export default HeadingCard;
