import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Typography,
    Button,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2"; // NEW GRID
import { useNavigate } from "react-router-dom";

// ==========logo ==================
import logo from "../../assets/logo/utpala_logo.png"

export default function Login() {
    const navigate = useNavigate();

    const [phone, setPhone] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState("");

    const handlePhoneSubmit = () => {
        if (phone.length === 10) {
            setShowOtp(true);
        } else {
            alert("Enter valid phone number");
        }
    };

    const handleOtpSubmit = () => {
        if (otp.length === 6) {
            navigate("/admin/dashboard");
        } else {
            alert("Enter valid 6-digit OTP");
        }
    };

    return (
        <Grid2
            container
            sx={{ height: "100vh" }}
        >
            {/* LEFT IMAGE */}
            <Grid2
                size={{ xs: 12, md: 6 }}
                sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
                <img src={logo} alt="Ut Pala Logo" />
            </Grid2>

            {/* RIGHT LOGIN CARD */}
            <Grid2
                size={{ xs: 12, md: 6 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{ background: "var(--color-background)" }}
            >
                <Card sx={{ width: "80%", maxWidth: 420, p: 3 }}>
                    <CardContent>
                        {/* Heading */}
                        <Typography
                            variant="h4"
                            sx={{ mb: 2, fontWeight: 700, color: "var(--color-primary)" }}
                        >
                            Welcome Back
                        </Typography>

                        {/* Phone Input */}
                        {!showOtp && (
                            <>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    Enter your phone number
                                </Typography>

                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    variant="outlined"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    inputProps={{ maxLength: 10 }}
                                />

                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{ mt: 2, background: "var(--color-primary)" }}
                                    onClick={handlePhoneSubmit}
                                >
                                    Send OTP
                                </Button>
                            </>
                        )}

                        {/* OTP Input */}
                        {showOtp && (
                            <>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    Enter 6 digit OTP
                                </Typography>

                                <TextField
                                    fullWidth
                                    label="OTP"
                                    variant="outlined"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    inputProps={{ maxLength: 6 }}
                                />

                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{ mt: 2, background: "var(--color-primary)" }}
                                    onClick={handleOtpSubmit}
                                >
                                    Verify OTP
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Grid2>
        </Grid2>
    );
}