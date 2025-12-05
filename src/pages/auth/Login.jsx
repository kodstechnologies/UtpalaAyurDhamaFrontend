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
    Slide
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

export default function Login() {
    const [step, setStep] = useState(1); // 1: phone, 2: OTP
    const [phone, setPhone] = useState("");
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(300);
    const otpInputs = useRef([]);

    // Timer for OTP expiry
    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
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
            // Simulate API call
            setTimeout(() => {
                setLoading(false);
                setStep(2);
                setTimer(300);
            }, 1500);
        } else {
            alert("Please enter a valid 10-digit phone number");
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

    const handleOtpSubmit = () => {
        const fullOtp = otpDigits.join('');
        if (fullOtp.length === 6) {
            setLoading(true);
            // Simulate API call to verify OTP and get user role
            setTimeout(() => {
                // Mock role-based redirect
                const userRole = 'admin'; // This would come from API response

                if (userRole === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else if (userRole === 'doctor') {
                    window.location.href = '/doctor/dashboard';
                } else if (userRole === 'patient') {
                    window.location.href = '/patient/dashboard';
                } else {
                    window.location.href = '/dashboard';
                }
            }, 1000);
        } else {
            alert("Please enter the complete 6-digit OTP");
        }
    };

    const handleBackToPhone = () => {
        setStep(1);
        setOtpDigits(['', '', '', '', '', '']);
    };

    const handleResendOtp = () => {
        setTimer(300);
        setOtpDigits(['', '', '', '', '', '']);
        if (otpInputs.current[0]) {
            otpInputs.current[0].focus();
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
                    backgroundSize: "cover",       // ✅ apply here
                    backgroundRepeat: "no-repeat", // ✅ apply here
                    backgroundPosition: "center",  // ✅ apply here
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
                            {/* <SpaIcon sx={{ fontSize: 50, color: "#8b5a2b" }} /> */}
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
                            Utpal Ayurveda
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
                                                disabled={timer > 0}
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
                                    Need help? Contact support@utpalayurveda.com
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        textAlign: "center",
                                        color: "#999",
                                    }}
                                >
                                    © 2025 Utpal Ayurveda. Embracing ancient healing traditions.
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