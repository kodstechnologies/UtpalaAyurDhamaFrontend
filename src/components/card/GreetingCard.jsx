import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

export default function GreetingBanner({
    title = "Good Morning",
    name = "Admin",
    subtitle = "Have a nice day at work",
    image = "/assets/greeting.png" // default image if you want
}) {
    return (
        <Card
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 3,
                padding: 3,
                backgroundColor: "var(--color-bg-table)",
                boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
                height: "13rem",
                overflow: "hidden",
            }}
        >
            {/* LEFT SIDE */}
            <CardContent sx={{ flex: 1 }}>
                <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "var(--color-text-dark)", mb: 1 }}
                >
                    {title},{" "}
                    <span style={{ color: "var(--color-icons)" }}>
                        {name}
                    </span>
                </Typography>

                <Typography variant="body1" sx={{ color: "var(--color-text-dark)" }}>
                    {subtitle}
                </Typography>
            </CardContent>

            {/* RIGHT SIDE IMAGE (optional) */}
            {image && (
                <Box
                    component="img"
                    src={image}
                    alt="illustration"
                    sx={{
                        width: 260,
                        height: "auto",
                        objectFit: "contain",
                        ml: 2,
                    }}
                />
            )}
        </Card>
    );
}
