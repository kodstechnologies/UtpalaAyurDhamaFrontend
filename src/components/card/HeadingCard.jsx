import { Box, Typography } from "@mui/material";
import Breadcrumb from "../breadcrumb/Breadcrumb";

function HeadingCard({
    title = "Therapy Scheduling & Pricing",
    subtitle = "Coordinate therapy offerings, assign specialists, and keep treatment costs transparent for your front-desk and billing teams.",
    breadcrumbItems = [],
    action = null,
}) {
    return (
        <Box sx={{ width: "100%", mb: 4 }}>

            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Main Card */}
            <Box
                sx={{
                    mt: 2,
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    background: "linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-table) 100%)",
                    boxShadow: "0px 10px 30px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 3,
                }}
            >
                {/* LEFT SIDE TEXT */}
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: "var(--color-text-dark)",
                            lineHeight: 1,
                            textShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            opacity: 0.85,
                            maxWidth: "720px",
                            lineHeight: 1.6,
                            fontSize: "1rem",
                            color: "var(--color-text-dark)",
                        }}
                    >
                        {subtitle}
                    </Typography>
                </Box>

                {/* RIGHT SIDE ACTION BUTTON */}
                {action && (
                    <Box
                        sx={{
                            alignSelf: { xs: "stretch", md: "flex-start" },
                            mt: { xs: 2, md: 0 },
                        }}
                    >
                        {action}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default HeadingCard;
