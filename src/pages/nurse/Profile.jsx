import React, { useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    Stack,
    Divider,
    Button,
    TextField,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material";

import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BadgeCheck,
    Edit,
    Camera,
    Save,
    X,
    Briefcase,
    Award,
    Clock,
} from "lucide-react";

function NurseProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);

    // ⭐ Nurse profile data (clean & accurate)
    const [profileData, setProfileData] = useState({
        name: "Nurse Priya",
        email: "priya.sharma@hospital.com",
        phone: "+91 98765 11223",
        employeeId: "NUR-10234",
        joiningDate: "March 12, 2021",
        dateOfBirth: "10 August 1992",
        department: "General Medicine",
        designation: "Senior Staff Nurse",
        qualification: "BSc Nursing, GNM",
        experience: "4.5 years",
        shiftTiming: "Morning Shift (6 AM - 2 PM)",
        location: "Bengaluru, Karnataka",
        emergencyContact: "Father: +91 98100 22112",
        certifications: "ACLS, BLS, Infection Control Training",
        bio:
            "Experienced nursing professional specializing in patient monitoring, pre/post-surgery care, and medication management. Passionate about providing compassionate and holistic patient support.",
    });

    const [editData, setEditData] = useState({ ...profileData });

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({ ...profileData });
    };

    const handleSave = () => {
        setProfileData({ ...editData });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData({ ...profileData });
        setIsEditing(false);
    };

    const handleInputChange = (field) => (e) => {
        setEditData({ ...editData, [field]: e.target.value });
    };

    return (
        <Box sx={{ bgcolor: "#EFE7DA", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
            {/* Header / Hero Section */}
            <Card
                elevation={0}
                sx={{
                    mb: 4,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #5C3D2E 0%, #6d4c3a 100%)",
                    color: "#EFEAD8",
                    overflow: "hidden",
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={3}
                    >
                        <Stack direction="row" spacing={3} alignItems="center">
                            <Box sx={{ position: "relative" }}>
                                <Avatar
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        bgcolor: "#556B2F",
                                        fontSize: "2.5rem",
                                        fontWeight: 700,
                                        border: "4px solid #EFEAD8",
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                                    }}
                                >
                                    NP
                                </Avatar>
                                <IconButton
                                    onClick={() => setOpenImageDialog(true)}
                                    sx={{
                                        position: "absolute",
                                        bottom: -5,
                                        right: -5,
                                        bgcolor: "#556B2F",
                                        color: "#EFEAD8",
                                        "&:hover": { bgcolor: "#3F4F23" },
                                    }}
                                >
                                    <Camera size={18} />
                                </IconButton>
                            </Box>

                            <Box>
                                <Typography variant="h4" fontWeight={700}>
                                    {profileData.name}
                                </Typography>

                                <Stack direction="row" spacing={2} alignItems="center" mt={1}>
                                    <Chip
                                        icon={<BadgeCheck size={16} />}
                                        label={profileData.designation}
                                        sx={{
                                            bgcolor: "rgba(239,234,216,0.2)",
                                            color: "#EFEAD8",
                                            fontWeight: 600,
                                        }}
                                    />
                                </Stack>

                                <Typography variant="body2" mt={1} sx={{ opacity: 0.9 }}>
                                    Employee ID: {profileData.employeeId} • Joined {profileData.joiningDate}
                                </Typography>
                            </Box>
                        </Stack>

                        <Button
                            variant="contained"
                            startIcon={isEditing ? <Save size={18} /> : <Edit size={18} />}
                            onClick={isEditing ? handleSave : handleEdit}
                            sx={{
                                bgcolor: "#556B2F",
                                color: "#EFEAD8",
                                textTransform: "none",
                                fontWeight: 600,
                                px: 3,
                                "&:hover": { bgcolor: "#3F4F23" },
                            }}
                        >
                            {isEditing ? "Save Profile" : "Edit Profile"}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Information Grid */}
            <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { md: "1fr 1fr" } }}>

                {/* Personal Information */}
                <Card sx={{ p: 4, borderRadius: 3, border: "2px solid #D6D2C4" }}>
                    <Typography variant="h6" fontWeight={700} color="#5C3D2E">
                        Personal Information
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: "#D6D2C4" }} />

                    <Stack spacing={3}>
                        {[
                            { icon: User, label: "Full Name", field: "name" },
                            { icon: Mail, label: "Email", field: "email" },
                            { icon: Phone, label: "Phone Number", field: "phone" },
                            { icon: Calendar, label: "Date of Birth", field: "dateOfBirth" },
                            { icon: MapPin, label: "Location", field: "location" },
                        ].map(({ icon: Icon, label, field }) => (
                            <Stack direction="row" spacing={2} key={field}>
                                <Box sx={{ bgcolor: "#F4F0E5", p: 1, borderRadius: 2 }}>
                                    <Icon size={20} color="#556B2F" />
                                </Box>

                                <Box flex={1}>
                                    {isEditing ? (
                                        <TextField
                                            fullWidth
                                            label={label}
                                            value={editData[field]}
                                            onChange={handleInputChange(field)}
                                            size="small"
                                            inputProps={field === "phone" || field === "emergencyContact" ? { maxLength: 10 } : {}}
                                        />
                                    ) : (
                                        <>
                                            <Typography variant="caption" color="#857466">
                                                {label}
                                            </Typography>
                                            <Typography fontWeight={600} color="#5C3D2E">
                                                {profileData[field]}
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                </Card>

                {/* Professional Information */}
                <Card sx={{ p: 4, borderRadius: 3, border: "2px solid #D6D2C4" }}>
                    <Typography variant="h6" fontWeight={700} color="#5C3D2E">
                        Professional Information
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: "#D6D2C4" }} />

                    <Stack spacing={3}>
                        {[
                            { icon: Briefcase, label: "Department", field: "department" },
                            { icon: Award, label: "Qualification", field: "qualification" },
                            { icon: Clock, label: "Experience", field: "experience" },
                            { icon: Calendar, label: "Shift Timing", field: "shiftTiming" },
                            { icon: Phone, label: "Emergency Contact", field: "emergencyContact" },
                            { icon: Award, label: "Certifications", field: "certifications" },
                        ].map(({ icon: Icon, label, field }) => (
                            <Stack direction="row" spacing={2} key={field}>
                                <Box sx={{ bgcolor: "#F4F0E5", p: 1, borderRadius: 2 }}>
                                    <Icon size={20} color="#556B2F" />
                                </Box>

                                <Box flex={1}>
                                    {isEditing ? (
                                        <TextField
                                            fullWidth
                                            label={label}
                                            value={editData[field]}
                                            onChange={handleInputChange(field)}
                                            size="small"
                                            inputProps={field === "phone" || field === "emergencyContact" ? { maxLength: 10 } : {}}
                                        />
                                    ) : (
                                        <>
                                            <Typography variant="caption" color="#857466">
                                                {label}
                                            </Typography>
                                            <Typography fontWeight={600} color="#5C3D2E">
                                                {profileData[field]}
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                </Card>
            </Box>

            {/* Bio / Summary */}
            <Card sx={{ mt: 3, p: 4, borderRadius: 3, border: "2px solid #D6D2C4" }}>
                <Typography variant="h6" fontWeight={700} color="#5C3D2E">
                    Professional Summary
                </Typography>
                <Divider sx={{ my: 2, borderColor: "#D6D2C4" }} />

                {isEditing ? (
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={editData.bio}
                        onChange={handleInputChange("bio")}
                    />
                ) : (
                    <Typography color="#5C3D2E" lineHeight={1.8}>
                        {profileData.bio}
                    </Typography>
                )}
            </Card>

            {/* Cancel Button */}
            {isEditing && (
                <Box sx={{ textAlign: "center", mt: 3 }}>
                    <Button variant="outlined" onClick={handleCancel} sx={{ px: 4 }}>
                        Cancel
                    </Button>
                </Box>
            )}

            {/* Image Upload Dialog */}
            <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)}>
                <DialogTitle>
                    Upload New Profile Picture
                    <IconButton
                        onClick={() => setOpenImageDialog(false)}
                        sx={{ position: "absolute", right: 16, top: 16 }}
                    >
                        <X size={18} />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 4 }}>
                    <Box
                        sx={{
                            height: 180,
                            border: "2px dashed #D6D2C4",
                            borderRadius: 2,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            bgcolor: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        <Camera size={40} color="#857466" />
                    </Box>

                    <Button
                        fullWidth
                        sx={{
                            mt: 3,
                            bgcolor: "#5C3D2E",
                            color: "#EFEAD8",
                            textTransform: "none",
                        }}
                    >
                        Upload Image
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default NurseProfile;
