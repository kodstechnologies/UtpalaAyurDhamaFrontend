import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function RedirectCard({
    title,
    subtitle,
    link,
    icon,
    action,
    breadcrumbItems = [],
}) {
    const navigate = useNavigate();

    return (
        <Box sx={{ width: "100%", mb: 4 }}>
            {/* Main Card */}
            <Box
                onClick={() => navigate(link)} // ✅ Redirect on click
                sx={{
                    mt: 2,
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    background:
                        "linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-table) 100%)",
                    boxShadow: "0px 10px 30px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 3,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0px 15px 40px rgba(0,0,0,0.08)",
                    },
                }}
            >
                {/* LEFT SIDE */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                    {icon && (
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                backgroundColor: "var(--color-bg-card-b)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--color-text-dark)",
                            }}
                        >
                            {icon}
                        </Box>
                    )}

                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                color: "var(--color-text-dark)",
                                lineHeight: 1.2,
                            }}
                        >
                            {title}
                        </Typography>

                        {subtitle && (
                            <Typography
                                variant="body2"
                                sx={{
                                    opacity: 0.8,
                                    color: "var(--color-text-dark)",
                                    mt: 0.5,
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* RIGHT SIDE ACTION (optional) */}
                {action && <Box>{action}</Box>}
            </Box>
        </Box>
    );
}

export default RedirectCard;
