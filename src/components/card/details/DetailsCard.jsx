import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Box, Typography } from "@mui/material";

function DetailsCard({ icon: Icon, label, value }) {
    return (
        <Card
            elevation={0}
            sx={{
                width: "100%",
                flex: "1 1 calc(25% - 1rem)",   // 4 cards per row (desktop)
                maxWidth: "350px",               // prevents oversized cards
                minWidth: "250px",               // nice minimum size
                borderRadius: "12px",
                background: "#F9FAFB",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
                backgroundColor: "var(--color-bg-hover)",

                // ⭐ Responsive breakpoints:
                "@media (max-width: 1200px)": {
                    flex: "1 1 calc(33.3% - 1rem)",  // 3 per row
                },
                "@media (max-width: 900px)": {
                    flex: "1 1 calc(50% - 1rem)",    // 2 per row
                },
                "@media (max-width: 600px)": {
                    flex: "1 1 100%",                // 1 per row
                },
            }}
        >

            <CardContent sx={{ p: "18px !important" }}>
                <Box display="flex" flexDirection="column" gap={1}>

                    {/* LABEL + ICON (Top Row) */}
                    <Box display="flex" alignItems="center" gap={1}>
                        {Icon && (
                            <Box
                                sx={{
                                    width: 20,
                                    height: 20,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--color-icon-2)", // green
                                }}
                            >
                                <Icon size={16} strokeWidth={2} />
                            </Box>
                        )}

                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 600,
                                color: "#6B7280", // muted label gray
                                letterSpacing: 0.6,
                                fontSize: "0.72rem",
                            }}
                        >
                            {label?.toUpperCase()}
                        </Typography>
                    </Box>

                    {/* VALUE */}
                    <Typography
                        variant="body1"
                        sx={{
                            fontWeight: 600,
                            color: "#111827", // strong dark
                            fontSize: "1rem",
                            whiteSpace: "pre-line",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            maxWidth: "100%",
                        }}
                    >
                        {value || "N/A"}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

DetailsCard.propTypes = {
    icon: PropTypes.elementType,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DetailsCard;
