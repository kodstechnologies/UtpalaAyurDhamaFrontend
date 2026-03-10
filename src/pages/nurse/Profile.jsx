import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slices/authSlice";
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
    CircularProgress,
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
import { toast } from "react-toastify";
import profileService from "../../services/profileService";

function NurseProfile() {
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        specialty: "",
        address: "",
        location: "",
        joinDate: "",
        dob: "",
        dateOfBirth: "",
        experience: "",
        shiftAvailability: "",
        shiftTiming: "",
        emergencyContact: "",
        certifications: "",
        bio: "",
        profilePicture: "",
        licenseNumber: "",
        qualifications: "",
    });

    const [editData, setEditData] = useState({ ...profileData });

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        } catch {
            return dateString;
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await profileService.getMyProfile();
            if (response.success && response.data) {
                const data = response.data;
                const formattedData = {
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    role: data.role || "",
                    specialty: data.specialty || "",
                    address: data.address || "",
                    location: data.address || "",
                    joinDate: formatDate(data.joiningDate),
                    dob: formatDate(data.dob),
                    dateOfBirth: formatDate(data.dob),
                    experience: data.experience ? `${data.experience} Years` : "",
                    shiftAvailability: data.shiftAvailability || "",
                    shiftTiming: data.shiftAvailability || "",
                    emergencyContact: data.emergencyContact || "",
                    certifications: Array.isArray(data.certifications) ? data.certifications.join(", ") : (data.certifications || ""),
                    bio: data.bio || "",
                    profilePicture: data.profilePicture || "",
                    licenseNumber: data.licenseNumber || "",
                    qualifications: data.qualifications || "",
                };
                setProfileData(formattedData);
                setEditData(formattedData);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error(error.message || "Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({ ...profileData });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updateData = {
                name: editData.name,
                phone: editData.phone,
                address: editData.address || editData.location,
                specialty: editData.specialty,
                licenseNumber: editData.licenseNumber,
                experience: editData.experience ? parseInt(editData.experience) : undefined,
                qualifications: editData.qualifications,
                shiftAvailability: editData.shiftAvailability || editData.shiftTiming,
                emergencyContact: editData.emergencyContact,
                certifications: editData.certifications ? editData.certifications.split(",").map(c => c.trim()) : [],
                bio: editData.bio,
            };

            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined || updateData[key] === "") {
                    delete updateData[key];
                }
            });

            const response = await profileService.updateMyProfile(updateData);
            if (response.success) {
                // Update Redux store with new user data
                if (response.data) {
                    dispatch(updateUser({
                        name: response.data.name || editData.name,
                        phone: response.data.phone || editData.phone,
                        email: response.data.email || editData.email,
                        profilePicture: response.data.profilePicture || profileData.profilePicture,
                    }));
                }
                toast.success("Profile updated successfully!");
                await fetchProfile();
                setIsEditing(false);
            } else {
                toast.error(response.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditData({ ...profileData });
        setIsEditing(false);
    };

    const handleInputChange = (field) => (e) => {
        setEditData({ ...editData, [field]: e.target.value });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size should be less than 5MB");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUploadPicture = async () => {
        if (!selectedFile) {
            toast.error("Please select a file");
            return;
        }

        setIsUploading(true);
        try {
            const response = await profileService.uploadProfilePicture(selectedFile);
            if (response.success) {
                // Update Redux store with new profile picture
                if (response.data?.url) {
                    dispatch(updateUser({
                        profilePicture: response.data.url,
                    }));
                }
                toast.success("Profile picture updated successfully!");
                await fetchProfile();
                setOpenImageDialog(false);
                setSelectedFile(null);
            } else {
                toast.error(response.message || "Failed to upload picture");
            }
        } catch (error) {
            console.error("Error uploading picture:", error);
            toast.error(error.message || "Failed to upload picture");
        } finally {
            setIsUploading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    }

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
                                    src={profileData.profilePicture}
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
                                    {getInitials(profileData.name)}
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
                            startIcon={isEditing ? (isSaving ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />) : <Edit size={18} />}
                            onClick={isEditing ? handleSave : handleEdit}
                            disabled={isSaving}
                            sx={{
                                bgcolor: "#556B2F",
                                color: "#EFEAD8",
                                textTransform: "none",
                                fontWeight: 600,
                                px: 3,
                                "&:hover": { bgcolor: "#3F4F23" },
                            }}
                        >
                            {isEditing ? (isSaving ? "Saving..." : "Save Profile") : "Edit Profile"}
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
                    <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="profile-picture-upload"
                        type="file"
                        onChange={handleFileSelect}
                    />
                    <label htmlFor="profile-picture-upload">
                        <Box
                            component="span"
                            sx={{
                                height: 180,
                                border: "2px dashed #D6D2C4",
                                borderRadius: 2,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                bgcolor: "#fff",
                                cursor: "pointer",
                                width: "100%",
                            }}
                        >
                            <Camera size={40} color="#857466" />
                            <Typography variant="body2" color="#857466" mt={2}>
                                Click to upload or drag and drop
                            </Typography>
                            <Typography variant="caption" color="#857466">
                                PNG, JPG up to 5MB
                            </Typography>
                            {selectedFile && (
                                <Typography variant="caption" color="#556B2F" mt={1}>
                                    Selected: {selectedFile.name}
                                </Typography>
                            )}
                        </Box>
                    </label>

                    <Button
                        fullWidth
                        onClick={handleUploadPicture}
                        disabled={!selectedFile || isUploading}
                        sx={{
                            mt: 3,
                            bgcolor: "#5C3D2E",
                            color: "#EFEAD8",
                            textTransform: "none",
                        }}
                    >
                        {isUploading ? "Uploading..." : "Upload Image"}
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default NurseProfile;
