
import React, { useState } from "react";
import {
    Box,
    Typography,
    Grid,
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
    Shield,
    Edit,
    Camera,
    Save,
    X,
    Briefcase,
    Clock,
    Award,
} from "lucide-react";

function TherapistProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);

    // ⭐ Receptionist REAL-WORLD accurate data
    const [profileData, setProfileData] = useState({
        name: "Meera Shankar",
        email: "meera.shankar@utpalaayur.com",
        phone: "+91 98452 11230",
        role: "Therapist",
        department: "Therapy & Wellness",
        location: "Bengaluru, Karnataka",
        joinDate: "March 10, 2020",
        experience: "6.1 Years",
        shift: "Therapy Shift (8:00 AM - 5:00 PM)",
        skills:
            "Abhyanga Massage, Shirodhara, Kizhi Therapy, Panchakarma Assistance, Relaxation Techniques, Pain Relief Therapy, Body Detox Procedures, Stress Management",
        certifications:
            "Diploma in Ayurvedic Therapy, Certified Panchakarma Assistant, Wellness & Bodywork Certification",
        bio:
            "Dedicated wellness therapist specializing in Ayurvedic body therapies, personalized treatment routines, and patient relaxation techniques. Skilled in Abhyanga, Shirodhara, Kizhi, and Panchakarma support therapies. Focused on improving patient comfort, reducing stress, and promoting natural healing through holistic treatment methods.",
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

            {/* Header */}
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
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={3}>

                        <Stack direction="row" spacing={3}>
                            <Box sx={{ position: "relative" }}>
                                <Avatar
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        bgcolor: "#556B2F",
                                        fontSize: "2.5rem",
                                        fontWeight: 700,
                                        border: "4px solid #EFEAD8",
                                    }}
                                >
                                    PS
                                </Avatar>

                                <IconButton
                                    onClick={() => setOpenImageDialog(true)}
                                    sx={{
                                        position: "absolute",
                                        bottom: -5,
                                        right: -5,
                                        bgcolor: "#556B2F",
                                        color: "#EFEAD8",
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
                                        icon={<Shield size={16} />}
                                        label={profileData.role}
                                        sx={{
                                            bgcolor: "rgba(239,234,216,0.2)",
                                            color: "#EFEAD8",
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        {profileData.department} • Since {profileData.joinDate}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>

                        <Button
                            variant="contained"
                            startIcon={isEditing ? <Save size={18} /> : <Edit size={18} />}
                            onClick={isEditing ? handleSave : handleEdit}
                            sx={{
                                bgcolor: "#556B2F",
                                color: "#EFEAD8",
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 3,
                            }}
                        >
                            {isEditing ? "Save Profile" : "Edit Profile"}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Content Grid */}
            <Grid container spacing={3}>

                {/* Personal Info */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 4, borderRadius: 3, border: "2px solid #D6D2C4" }}>
                        <Typography variant="h6" fontWeight={700} color="#5C3D2E">
                            Personal Information
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={3}>
                            {[
                                { icon: User, label: "Full Name", field: "name" },
                                { icon: Mail, label: "Email Address", field: "email" },
                                { icon: Phone, label: "Phone Number", field: "phone" },
                                { icon: MapPin, label: "Location", field: "location" },
                            ].map(({ icon: Icon, label, field }) => (
                                <Stack key={field} direction="row" spacing={2}>
                                    <Box sx={{ p: 1, height: "40px", bgcolor: "#F4F0E5", borderRadius: 2 }}>
                                        <Icon size={20} color="#556B2F" />
                                    </Box>

                                    <Box flex={1}>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                label={label}
                                                size="small"
                                                value={editData[field]}
                                                onChange={handleInputChange(field)}
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
                </Grid>

                {/* Professional Info */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 4, borderRadius: 3, border: "2px solid #D6D2C4" }}>
                        <Typography variant="h6" fontWeight={700} color="#5C3D2E">
                            Professional Details
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={3}>
                            {[
                                { icon: Briefcase, label: "Department", field: "department" },
                                { icon: Clock, label: "Shift Timing", field: "shift" },
                                { icon: Calendar, label: "Join Date", field: "joinDate", editable: false },
                                { icon: Award, label: "Experience", field: "experience" },
                                { icon: Award, label: "Key Skills", field: "skills" },
                                { icon: Award, label: "Certifications", field: "certifications" },
                            ].map(({ icon: Icon, label, field, editable = true }) => (
                                <Stack key={field} direction="row" spacing={2}>
                                    <Box sx={{ p: 1, height: "40px", bgcolor: "#F4F0E5", borderRadius: 2 }}>
                                        <Icon size={20} color="#556B2F" />
                                    </Box>

                                    <Box flex={1}>
                                        {isEditing && editable ? (
                                            <TextField
                                                fullWidth
                                                label={label}
                                                size="small"
                                                value={editData[field]}
                                                onChange={handleInputChange(field)}
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
                </Grid>

                {/* Bio */}
                <Grid item xs={12}>
                    <Card sx={{ p: 4, borderRadius: 3, border: "2px solid #D6D2C4" }}>
                        <Typography variant="h6" fontWeight={700} color="#5C3D2E">
                            Professional Bio
                        </Typography>

                        <Divider sx={{ my: 2 }} />

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
                </Grid>
            </Grid>

            {/* Cancel Button */}
            {isEditing && (
                <Box sx={{ textAlign: "center", mt: 3 }}>
                    <Button variant="outlined" onClick={handleCancel} sx={{ px: 4 }}>
                        Cancel
                    </Button>
                </Box>
            )}

            {/* Upload Image Modal */}
            <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)}>
                <DialogTitle>
                    Update Profile Picture
                    <IconButton onClick={() => setOpenImageDialog(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
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
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "#fff",
                        }}
                    >
                        <Camera size={40} color="#857466" />
                    </Box>

                    <Button fullWidth sx={{ mt: 3, bgcolor: "#5C3D2E", color: "#EFEAD8" }}>
                        Upload Image
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default TherapistProfile;