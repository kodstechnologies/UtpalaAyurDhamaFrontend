
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography, Box } from "@mui/material";

function DashboardCard({
    title = "Users",
    count = null,       // ⭐ now optional
    description = "",
    icon: Icon = null,
    prefix = "",
    onClick = null,     // ⭐ onClick handler for navigation
}) {
    const [displayValue, setDisplayValue] = useState(0);

    // ⭐ Animate only if count is provided
    useEffect(() => {
        if (count === null || count === undefined) return;

        const duration = 800;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setDisplayValue(progress * count);

            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [count]);

    return (
        <Card
            onClick={onClick || undefined}
            sx={{
                width: "100%",
                borderRadius: 4,
                padding: 1.5,
                background: "var(--color-bg-table)",
                boxShadow: "0px 4px 18px rgba(0,0,0,0.08)",
                cursor: onClick ? "pointer" : "default",
                transition: "0.2s",
                "&:hover": {
                    boxShadow: onClick ? "0px 6px 22px rgba(0,0,0,0.12)" : "0px 4px 18px rgba(0,0,0,0.08)",
                    transform: onClick ? "translateY(-3px)" : "none",
                },
            }}
        >
            <CardContent
                sx={{
                    padding: "12px !important",
                    "&:last-child": { paddingBottom: "12px" },
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                    {/* LEFT SIDE */}
                    <Box sx={{ flex: 1 }}>
                        {/* Title */}
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 600,
                                color: "var(--color-text-dark)",
                                mb: 0.5,
                                fontSize: "0.7rem",
                            }}
                        >
                            {title}
                        </Typography>

                        {/* IF COUNT EXISTS → SHOW ANIMATED VALUE */}
                        {count !== null && count !== undefined && !isNaN(count) ? (
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: "bold",
                                    color: "var(--color-text-dark)",
                                    fontSize: "1.4rem",
                                }}
                            >
                                {prefix}
                                {prefix
                                    ? new Intl.NumberFormat("en-IN", {
                                        maximumFractionDigits: 2,
                                        minimumFractionDigits: 2,
                                    }).format(displayValue)
                                    : Math.floor(displayValue)}
                                {description && description.includes("%") ? description : ""}
                            </Typography>
                        ) : (
                            /* ELSE SHOW DESCRIPTION */
                            <Typography
                                sx={{
                                    color: "var(--color-text-light)",
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                }}
                            >
                                {description || "No data available"}
                            </Typography>
                        )}
                    </Box>

                    {/* ICON ON RIGHT */}
                    {Icon && (
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1.5,
                                background: "var(--color-bg-header)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                ml: 1.5,
                                flexShrink: 0,
                            }}
                        >
                            <Icon sx={{ fontSize: 20, color: "var(--color-text-header)" }} />
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

DashboardCard.propTypes = {
    title: PropTypes.string,
    count: PropTypes.number,
    description: PropTypes.string,
    icon: PropTypes.elementType,
    prefix: PropTypes.string,
    onClick: PropTypes.func,
};

export default DashboardCard;

