import { Box, Typography, alpha, useTheme } from "@mui/material";

function DisplayInfoCard({ label, value, icon, sx = {} }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: 1,
                backgroundColor: "background.default",
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: "100%",
                ...sx,
            }}
        >
            <Typography variant="caption" color="text.secondary" display="block" mb={0.3} sx={{ fontSize: "0.7rem" }}>
                {icon && (
                    <Box component="span" sx={{ mr: 0.5, verticalAlign: "middle", fontSize: "0.9rem" }}>
                        {icon}
                    </Box>
                )}
                {label}
            </Typography>
            <Typography
                fontWeight={600}
                fontSize="0.95rem"
                sx={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                }}
            >
                {value ?? "N/A"}
            </Typography>
        </Box>
    );
}

export default DisplayInfoCard;
