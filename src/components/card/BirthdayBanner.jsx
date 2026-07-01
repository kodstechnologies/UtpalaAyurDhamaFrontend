import PropTypes from "prop-types";
import { Card, Box, Typography } from "@mui/material";
import { Cake as CakeIcon, Celebration as CelebrationIcon } from "@mui/icons-material";

export default function BirthdayBanner({ name = "there" }) {
    return (
        <Card
            sx={{
                borderRadius: 4,
                p: 3,
                mb: 3,
                background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #fbc2eb 100%)",
                color: "#5C3D2E",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 140,
                    height: 140,
                    background: "rgba(255,255,255,0.35)",
                    borderRadius: "50%",
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    bottom: -40,
                    left: -20,
                    width: 120,
                    height: 120,
                    background: "rgba(255,255,255,0.25)",
                    borderRadius: "50%",
                }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, position: "relative", zIndex: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.6)",
                    }}
                >
                    <CakeIcon sx={{ fontSize: 36, color: "#d6336c" }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: "-0.5px" }}>
                        Happy Birthday, {name}! <CelebrationIcon sx={{ fontSize: 28, verticalAlign: "middle" }} />
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Wishing you a joyful day and a healthy year ahead from all of us at Utpala.
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
}

BirthdayBanner.propTypes = {
    name: PropTypes.string,
};
