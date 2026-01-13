
import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Typography,
    Button,
    Grid,
    IconButton,
    InputAdornment,
    CircularProgress,
    Fade,
    Slide,
    Alert
} from "@mui/material";
import {
    Phone as PhoneIcon,
    ArrowBack as ArrowBackIcon,
    Healing as HealingIcon,
    Spa as SpaIcon,
    Verified as VerifiedIcon
} from "@mui/icons-material";

import logo from "../../assets/logo/utpala_logo.png"
import bgImg from "../../assets/bg-img/bg4.jpg"
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sendOtp, verifyOtp } from "../../config/authService";
import { login } from "../../redux/slices/authSlice";

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: phone, 2: OTP
    const [phone, setPhone] = useState("");
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(300);
    const [error, setError] = useState(""); // For error messages
    const otpInputs = useRef([]);
    const timerIntervalRef = useRef(null); // Ref to store interval for cleanup

    // Timer for OTP expiry
    useEffect(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        if (step === 2 && timer > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [step, timer]);

    useEffect(() => {
        if (step === 2 && otpInputs.current[0]) {
            otpInputs.current[0].focus();
        }
    }, [step]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handlePhoneSubmit = async () => {
        if (phone.length === 10) {
            setLoading(true);
            setError("");
            try {
                await sendOtp(phone);
                setStep(2);
                setTimer(300);
            } catch (err) {
                setError(err.message || "Failed to send OTP. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            setError("Please enter a valid 10-digit phone number");
        }
    };

    const handleOtpChange = (index, value) => {
        const newOtp = [...otpDigits];
        newOtp[index] = value.slice(-1);
        setOtpDigits(newOtp);

        if (value && index < 5) {
            otpInputs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpInputs.current[index - 1].focus();
        }
    };

    const handleOtpSubmit = async () => {
        const fullOtp = otpDigits.join('');
        if (fullOtp.length === 6) {
            setLoading(true);
            setError("");
            try {
                const result = await verifyOtp(phone, fullOtp);
                dispatch(login({
                    user: result.user,
                    token: result.token,
                    role: result.user.role,
                }));

                // Log success to console (no reload happens here)
                console.log("✅ Login Successful!", {
                    phone: `+91${phone}`,
                    role: result.user.role,
                    hasToken: !!result.token,
                    redirectTo: `/ ${result.user.role?.toLowerCase()}/dashboard`
                });

                // Role-based redirect (SPA navigation, no reload)
                const userRole = result.user.role?.toLowerCase();
                if (userRole === "admin") {
                    navigate("/admin/dashboard");
                } else if (userRole === "doctor") {
                    navigate("/doctor/dashboard");
                } else if (userRole === "nurse") {
                    navigate("/nurse/dashboard");
                } else if (userRole === "receptionist") {
                    navigate("/receptionist/dashboard");
                } else if (userRole === "pharmacist") {
                    navigate("/pharmacist/dashboard");
                } else if (userRole === "therapist") {
                    navigate("/therapist/dashboard");
                } else if (userRole === "patient") {
                    navigate("/patient/dashboard");
                } else {
                    // Fallback: try to get role from localStorage or redirect to login
                    const storedRole = localStorage.getItem("role")?.toLowerCase();
                    if (storedRole) {
                        navigate(`/${storedRole}/dashboard`);
                    } else {
                        navigate("/login");
                    }
                }
            } catch (err) {
                setError(err.message || "Invalid OTP or an error occurred.");
            } finally {
                setLoading(false);
            }
        } else {
            setError("Please enter the complete 6-digit OTP");
        }
    };

    const handleBackToPhone = () => {
        setStep(1);
        setOtpDigits(['', '', '', '', '', '']);
        setError("");
    };

    const handleResendOtp = async () => {
        setError("");
        try {
            await sendOtp(phone);
            setTimer(300);
            setOtpDigits(['', '', '', '', '', '']);
            if (otpInputs.current[0]) {
                otpInputs.current[0].focus();
            }
        } catch (err) {
            setError(err.message || "Failed to resend OTP. Please try again.");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                minWidth: "100vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                p: 2,

                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${bgImg})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    opacity: 0.35,
                    zIndex: 0,
                },

                background: "linear-gradient(135deg, #faf8f5 0%, #f5f0e8 100%)",
            }}
        >

            {/* Decorative floating elements */}
            <Box
                sx={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(139, 90, 43, 0.15) 0%, transparent 70%)",
                    animation: "float 20s infinite ease-in-out",
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    bottom: -100,
                    left: -100,
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(112, 66, 20, 0.12) 0%, transparent 70%)",
                    animation: "float 25s infinite ease-in-out reverse",
                    zIndex: 0,
                }}
            />

            <Slide direction="up" in={true} timeout={800}>
                <Card
                    sx={{
                        width: "100%",
                        maxWidth: 450,
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: "0 8px 32px rgba(112, 66, 20, 0.15)",
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(139, 90, 43, 0.1)",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    {/* Header Section */}
                    <Box
                        sx={{
                            background: "linear-gradient(135deg, #8b5a2b 0%, #704214 100%)",
                            py: 4,
                            px: 3,
                            textAlign: "center",
                            position: "relative",
                        }}
                    >
                        <HealingIcon
                            sx={{
                                position: "absolute",
                                left: 20,
                                top: 20,
                                fontSize: 30,
                                color: "rgba(255, 255, 255, 0.3)",
                            }}
                        />
                        <SpaIcon
                            sx={{
                                position: "absolute",
                                right: 20,
                                bottom: 20,
                                fontSize: 30,
                                color: "rgba(255, 255, 255, 0.3)",
                            }}
                        />

                        <Box
                            sx={{
                                width: 90,
                                height: 90,
                                margin: "0 auto 16px",
                                background: "#fff",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                border: "3px solid rgba(255, 255, 255, 0.5)",
                            }}
                        >
                            <img src={logo} alt="Utpala Logo" style={{ width: 50, height: 50 }} />
                        </Box>

                        <Typography
                            variant="h4"
                            sx={{
                                color: "#fff",
                                fontWeight: 700,
                                mb: 1,
                                letterSpacing: 0.5,
                            }}
                        >
                            Utpala Ayurdhama
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: "rgba(255, 255, 255, 0.9)",
                                fontStyle: "italic",
                                fontSize: "0.95rem",
                            }}
                        >
                            Ancient Wisdom • Modern Healing
                        </Typography>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        {step === 2 && (
                            <Fade in={step === 2}>
                                <IconButton
                                    onClick={handleBackToPhone}
                                    sx={{
                                        mb: 2,
                                        color: "#704214",
                                        '&:hover': {
                                            background: "rgba(139, 90, 43, 0.08)",
                                        }
                                    }}
                                >
                                    <ArrowBackIcon />
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        Back
                                    </Typography>
                                </IconButton>
                            </Fade>
                        )}

                        {/* Error Alert */}
                        {error && (
                            <Fade in={!!error}>
                                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                                    {error}
                                </Alert>
                            </Fade>
                        )}

                        <Fade in={true} timeout={500}>
                            <Box>
                                {step === 1 ? (
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                mb: 3,
                                                color: "#704214",
                                                fontWeight: 600,
                                                textAlign: "center",
                                            }}
                                        >
                                            Welcome Back
                                        </Typography>

                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            placeholder="Enter 10-digit mobile number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && phone.length === 10) {
                                                    handlePhoneSubmit();
                                                }
                                            }}
                                            inputProps={{ maxLength: 10 }}
                                            sx={{
                                                mb: 4,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: "#8b5a2b",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: "#704214",
                                                    }
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: "#8b5a2b",
                                                    '&.Mui-focused': {
                                                        color: "#704214",
                                                    }
                                                },
                                            }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PhoneIcon sx={{ color: "#8b5a2b" }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <Button
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            onClick={handlePhoneSubmit}
                                            disabled={loading || phone.length !== 10}
                                            sx={{
                                                py: 1.5,
                                                borderRadius: 2,
                                                background: "linear-gradient(135deg, #8b5a2b 0%, #704214 100%)",
                                                fontSize: "1rem",
                                                fontWeight: 600,
                                                textTransform: "none",
                                                boxShadow: "0 4px 12px rgba(112, 66, 20, 0.3)",
                                                '&:hover': {
                                                    background: "linear-gradient(135deg, #704214 0%, #5a3410 100%)",
                                                    boxShadow: "0 6px 16px rgba(112, 66, 20, 0.4)",
                                                },
                                                '&:disabled': {
                                                    background: "#d0d0d0",
                                                    color: "#888",
                                                }
                                            }}
                                        >
                                            {loading ? (
                                                <CircularProgress size={24} sx={{ color: "#fff" }} />
                                            ) : (
                                                "Send OTP"
                                            )}
                                        </Button>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                mt: 3,
                                                textAlign: "center",
                                                color: "#8b5a2b",
                                                fontSize: "0.85rem",
                                            }}
                                        >
                                            By continuing, you agree to our Terms & Privacy Policy
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                mb: 2,
                                                color: "#704214",
                                                fontWeight: 600,
                                                textAlign: "center",
                                            }}
                                        >
                                            Enter Verification Code
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                mb: 3,
                                                color: "#8b5a2b",
                                                textAlign: "center",
                                            }}
                                        >
                                            We've sent a 6-digit code to +91 {phone}
                                        </Typography>

                                        <Grid container spacing={1.5} sx={{ mb: 3 }}>
                                            {otpDigits.map((digit, index) => (
                                                <Grid item xs={2} key={index}>
                                                    <TextField
                                                        inputRef={(el) => (otpInputs.current[index] = el)}
                                                        value={digit}
                                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                        inputProps={{
                                                            maxLength: 1,
                                                            style: {
                                                                textAlign: 'center',
                                                                fontSize: '1.3rem',
                                                                fontWeight: 600,
                                                                color: '#704214'
                                                            },
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 1.5,
                                                                height: 56,
                                                                '&.Mui-focused': {
                                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                                        borderColor: '#704214',
                                                                        borderWidth: 2,
                                                                    }
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#8b5a2b',
                                                                }
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                textAlign: "center",
                                                color: timer < 60 ? "#d32f2f" : "#8b5a2b",
                                                mb: 3,
                                                fontWeight: timer < 60 ? 600 : 400,
                                            }}
                                        >
                                            Code expires in: {formatTime(timer)}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                onClick={handleResendOtp}
                                                disabled={timer > 0 || loading}
                                                sx={{
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    borderColor: "#8b5a2b",
                                                    color: "#8b5a2b",
                                                    '&:hover': {
                                                        borderColor: "#704214",
                                                        background: "rgba(139, 90, 43, 0.08)",
                                                    },
                                                    '&:disabled': {
                                                        borderColor: "#d0d0d0",
                                                        color: "#888",
                                                    }
                                                }}
                                            >
                                                Resend OTP
                                            </Button>

                                            <Button
                                                variant="contained"
                                                fullWidth
                                                size="large"
                                                onClick={handleOtpSubmit}
                                                disabled={loading || otpDigits.some(d => d === '')}
                                                sx={{
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                                                    fontSize: "1rem",
                                                    fontWeight: 600,
                                                    textTransform: "none",
                                                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                                                    '&:hover': {
                                                        background: "linear-gradient(135deg, #1b5e20 0%, #0d3c14 100%)",
                                                        boxShadow: "0 6px 16px rgba(46, 125, 50, 0.4)",
                                                    },
                                                    '&:disabled': {
                                                        background: "#d0d0d0",
                                                        color: "#888",
                                                    }
                                                }}
                                            >
                                                {loading ? (
                                                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                                                ) : (
                                                    "Verify & Continue"
                                                )}
                                            </Button>
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                mt: 3,
                                                textAlign: "center",
                                                color: "#999",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            Didn't receive the code? Check your spam folder
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Fade>

                        <Fade in={true} timeout={2000}>
                            <Box sx={{
                                mt: 4,
                                pt: 3,
                                borderTop: "1px solid rgba(139, 90, 43, 0.2)"
                            }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        textAlign: "center",
                                        color: "#8b5a2b",
                                        fontSize: "0.8rem",
                                        mb: 1,
                                    }}
                                >
                                    Need help? Contact support@utpalAyurdhama.com
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        textAlign: "center",
                                        color: "#999",
                                    }}
                                >
                                    © 2025 Utpala Ayurdhama. Embracing ancient healing traditions.
                                </Typography>
                            </Box>
                        </Fade>
                    </CardContent>
                </Card>
            </Slide>

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(20px, -20px) rotate(120deg); }
                    66% { transform: translate(-15px, 15px) rotate(240deg); }
                }
            `}</style>
        </Box>
    );
}
