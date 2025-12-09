import React from "react";
import { Card, Box, Typography, Avatar, Divider } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

function FamilyMemberCard({
    name = "maya",
    relation = "Daughter",
    phone = "1234567890",
    dob = "2022-02-23",
    gender = "Female",
}) {
    return (
        <Card
            sx={{
                padding: "20px",
                borderRadius: "14px",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-medium)",
                width: "350px",
            }}
        >
            {/* Top Section */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                    sx={{
                        width: 60,
                        height: 60,
                        background: "var(--color-primary-light)",
                        color: "var(--color-primary-dark)",
                        fontSize: 32,
                    }}
                >
                    <PersonIcon sx={{ fontSize: 32 }} />
                </Avatar>

                <Box>
                    <Typography
                        sx={{
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            color: "var(--color-text-dark)",
                        }}
                    >
                        {name}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: "0.95rem",
                            color: "var(--color-text-muted)",
                        }}
                    >
                        {relation}
                    </Typography>
                </Box>
            </Box>

            {/* Divider */}
            <Divider sx={{ my: 2, borderColor: "var(--color-border-dark)" }} />

            {/* Details Section */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 1.5 }}>
                <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                    Phone:
                </Typography>
                <Typography sx={{ color: "var(--color-text-dark)" }}>
                    {phone}
                </Typography>

                <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                    DOB:
                </Typography>
                <Typography sx={{ color: "var(--color-text-dark)" }}>
                    {dob}
                </Typography>

                <Typography sx={{ color: "var(--color-text-dark)", fontWeight: 600 }}>
                    Gender:
                </Typography>
                <Typography sx={{ color: "var(--color-text-dark)" }}>
                    {gender}
                </Typography>
            </Box>
        </Card>
    );
}

export default FamilyMemberCard;
