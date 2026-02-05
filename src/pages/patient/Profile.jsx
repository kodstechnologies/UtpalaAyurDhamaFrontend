
// import React, { useState } from "react";
// import {
//     Box,
//     Typography,
//     Grid2, // ← Grid 2
//     Card,
//     CardContent,
//     Avatar,
//     Stack,
//     Divider,
//     Button,
//     TextField,
//     IconButton,
//     Chip,
//     Dialog,
//     DialogTitle,
//     DialogContent,
// } from "@mui/material";
// import {
//     User,
//     Mail,
//     Phone,
//     MapPin,
//     Calendar,
//     Shield,
//     Edit,
//     Camera,
//     Save,
//     X,
//     Briefcase,
//     Clock,
//     Award,
// } from "lucide-react";

// function PatientProfile() {
//     const [isEditing, setIsEditing] = useState(false);
//     const [openImageDialog, setOpenImageDialog] = useState(false);

//     const [profileData, setProfileData] = useState({
//         name: 'Dr. Rajesh Kumar',
//         email: 'rajesh.kumar@ayurveda.com',
//         phone: '+91 98765 43210',
//         role: 'Administrator',
//         department: 'Operations',
//         location: 'Mumbai, Maharashtra',
//         joinDate: 'January 15, 2020',
//         experience: '5 Years',
//         certifications: 'BAMS, MD (Ayurveda)',
//         bio: 'Experienced Ayurvedic practitioner with expertise in traditional medicine and modern healthcare management. Passionate about integrating ancient wisdom with contemporary practices.',
//     });

//     const [editData, setEditData] = useState({ ...profileData });

//     const handleEdit = () => {
//         setIsEditing(true);
//         setEditData({ ...profileData });
//     };

//     const handleSave = () => {
//         setProfileData({ ...editData });
//         setIsEditing(false);
//     };

//     const handleCancel = () => {
//         setEditData({ ...profileData });
//         setIsEditing(false);
//     };

//     const handleInputChange = (field) => (e) => {
//         setEditData({ ...editData, [field]: e.target.value });
//     };

//     const stats = [
//         { label: 'Patients Managed', value: '1,250+', icon: User, color: '#556B2F' },
//         { label: 'Active Cases', value: '48', icon: Briefcase, color: '#6A8E3F' },
//         { label: 'Response Time', value: '< 2hrs', icon: Clock, color: '#E8A84E' },
//         { label: 'Certifications', value: '4', icon: Award, color: '#4E7BA8' },
//     ];

//     return (
//         <Box sx={{ bgcolor: '#EFE7DA', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
//             {/* Header Card */}
//             <Card
//                 elevation={0}
//                 sx={{
//                     mb: 4,
//                     borderRadius: 3,
//                     background: 'linear-gradient(135deg, #5C3D2E 0%, #6d4c3a 100%)',
//                     color: '#EFEAD8',
//                     overflow: 'hidden',
//                     position: 'relative',
//                     '&::before': {
//                         content: '""',
//                         position: 'absolute',
//                         top: 0,
//                         right: 0,
//                         width: '400px',
//                         height: '400px',
//                         background: 'radial-gradient(circle, rgba(239,234,216,0.15) 0%, transparent 70%)',
//                         borderRadius: '50%',
//                         transform: 'translate(30%, -30%)',
//                     },
//                 }}
//             >
//                 <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
//                     <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={3}>
//                         <Stack direction="row" spacing={3} alignItems="center">
//                             <Box sx={{ position: 'relative' }}>
//                                 <Avatar
//                                     sx={{
//                                         width: 100,
//                                         height: 100,
//                                         bgcolor: '#556B2F',
//                                         fontSize: '2.5rem',
//                                         fontWeight: 700,
//                                         border: '4px solid #EFEAD8',
//                                         boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
//                                     }}
//                                 >
//                                     RK
//                                 </Avatar>
//                                 <IconButton
//                                     onClick={() => setOpenImageDialog(true)}
//                                     sx={{
//                                         position: 'absolute',
//                                         bottom: -5,
//                                         right: -5,
//                                         bgcolor: '#556B2F',
//                                         color: '#EFEAD8',
//                                         width: 36,
//                                         height: 36,
//                                         '&:hover': { bgcolor: '#3F4F23' },
//                                         boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//                                     }}
//                                 >
//                                     <Camera size={18} />
//                                 </IconButton>
//                             </Box>
//                             <Box>
//                                 <Typography variant="h4" fontWeight={700} gutterBottom>
//                                     {profileData.name}
//                                 </Typography>
//                                 <Stack direction="row" spacing={2} alignItems="center">
//                                     <Chip
//                                         icon={<Shield size={16} />}
//                                         label={profileData.role}
//                                         sx={{
//                                             bgcolor: 'rgba(239, 234, 216, 0.2)',
//                                             color: '#EFEAD8',
//                                             fontWeight: 600,
//                                             border: '1px solid rgba(239, 234, 216, 0.3)',
//                                         }}
//                                     />
//                                     <Typography variant="body2" sx={{ opacity: 0.9 }}>
//                                         {profileData.department} • Since {profileData.joinDate}
//                                     </Typography>
//                                 </Stack>
//                             </Box>
//                         </Stack>
//                         <Button
//                             variant="contained"
//                             startIcon={isEditing ? <Save size={18} /> : <Edit size={18} />}
//                             onClick={isEditing ? handleSave : handleEdit}
//                             sx={{
//                                 bgcolor: '#556B2F',
//                                 color: '#EFEAD8',
//                                 textTransform: 'none',
//                                 fontWeight: 600,
//                                 px: 3,
//                                 borderRadius: 2,
//                                 '&:hover': { bgcolor: '#3F4F23' },
//                             }}
//                         >
//                             {isEditing ? 'Save Profile' : 'Edit Profile'}
//                         </Button>
//                     </Stack>
//                 </CardContent>
//             </Card>

//             {/* Main Content - Grid 2 */}
//             <Grid2 container spacing={3}>
//                 {/* Personal Information */}
//                 <Grid2 size={{ xs: 12, md: 6 }}>
//                     <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#FFFFFF', border: '2px solid #D6D2C4', height: '100%' }}>
//                         <CardContent sx={{ p: 4 }}>
//                             <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
//                                 Personal Information
//                             </Typography>
//                             <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

//                             <Stack spacing={3}>
//                                 {[
//                                     { icon: User, label: "Full Name", field: "name" },
//                                     { icon: Mail, label: "Email Address", field: "email" },
//                                     { icon: Phone, label: "Phone Number", field: "phone" },
//                                     { icon: MapPin, label: "Location", field: "location" },
//                                 ].map(({ icon: Icon, label, field }) => (
//                                     <Stack key={field} direction="row" spacing={2} alignItems="center">
//                                         <Box sx={{ bgcolor: '#F4F0E5', p: 1, borderRadius: 2 }}>
//                                             <Icon size={20} color="#556B2F" />
//                                         </Box>
//                                         <Box flex={1}>
//                                             {isEditing ? (
//                                                 <TextField
//                                                     fullWidth
//                                                     label={label}
//                                                     value={editData[field]}
//                                                     onChange={handleInputChange(field)}
//                                                     size="small"
//                                                     sx={{
//                                                         '& .MuiOutlinedInput-root': {
//                                                             '&:hover fieldset': { borderColor: '#556B2F' },
//                                                             '&.Mui-focused fieldset': { borderColor: '#556B2F' },
//                                                         },
//                                                         '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
//                                                     }}
//                                                 />
//                                             ) : (
//                                                 <>
//                                                     <Typography variant="caption" color="#857466">{label}</Typography>
//                                                     <Typography variant="body1" fontWeight={600} color="#5C3D2E">
//                                                         {profileData[field]}
//                                                     </Typography>
//                                                 </>
//                                             )}
//                                         </Box>
//                                     </Stack>
//                                 ))}
//                             </Stack>
//                         </CardContent>
//                     </Card>
//                 </Grid2>

//                 {/* Professional Information */}
//                 <Grid2 size={{ xs: 12, md: 6 }}>
//                     <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#FFFFFF', border: '2px solid #D6D2C4', height: '100%' }}>
//                         <CardContent sx={{ p: 4 }}>
//                             <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
//                                 Professional Details
//                             </Typography>
//                             <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

//                             <Stack spacing={3}>
//                                 {[
//                                     { icon: Briefcase, label: "Department", field: "department" },
//                                     { icon: Calendar, label: "Join Date", field: "joinDate", editable: false },
//                                     { icon: Clock, label: "Experience", field: "experience" },
//                                     { icon: Award, label: "Certifications", field: "certifications" },
//                                 ].map(({ icon: Icon, label, field, editable = true }) => (
//                                     <Stack key={field} direction="row" spacing={2} alignItems="center">
//                                         <Box sx={{ bgcolor: '#F4F0E5', p: 1, borderRadius: 2 }}>
//                                             <Icon size={20} color="#556B2F" />
//                                         </Box>
//                                         <Box flex={1}>
//                                             {isEditing && editable ? (
//                                                 <TextField
//                                                     fullWidth
//                                                     label={label}
//                                                     value={editData[field]}
//                                                     onChange={handleInputChange(field)}
//                                                     size="small"
//                                                     sx={{
//                                                         '& .MuiOutlinedInput-root': {
//                                                             '&:hover fieldset': { borderColor: '#556B2F' },
//                                                             '&.Mui-focused fieldset': { borderColor: '#556B2F' },
//                                                         },
//                                                         '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
//                                                     }}
//                                                 />
//                                             ) : (
//                                                 <>
//                                                     <Typography variant="caption" color="#857466">{label}</Typography>
//                                                     <Typography variant="body1" fontWeight={600} color="#5C3D2E">
//                                                         {profileData[field]}
//                                                     </Typography>
//                                                 </>
//                                             )}
//                                         </Box>
//                                     </Stack>
//                                 ))}
//                             </Stack>
//                         </CardContent>
//                     </Card>
//                 </Grid2>

//                 {/* Bio Section - Full Width */}
//                 <Grid2 size={12}>
//                     <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#FFFFFF', border: '2px solid #D6D2C4' }}>
//                         <CardContent sx={{ p: 4 }}>
//                             <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
//                                 Professional Bio
//                             </Typography>
//                             <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

//                             {isEditing ? (
//                                 <TextField
//                                     fullWidth
//                                     multiline
//                                     rows={4}
//                                     value={editData.bio}
//                                     onChange={handleInputChange('bio')}
//                                     placeholder="Write your professional bio..."
//                                     sx={{
//                                         '& .MuiOutlinedInput-root': {
//                                             '&:hover fieldset': { borderColor: '#556B2F' },
//                                             '&.Mui-focused fieldset': { borderColor: '#556B2F' },
//                                         },
//                                         '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
//                                     }}
//                                 />
//                             ) : (
//                                 <Typography variant="body1" color="#5C3D2E" lineHeight={1.8}>
//                                     {profileData.bio}
//                                 </Typography>
//                             )}
//                         </CardContent>
//                     </Card>
//                 </Grid2>
//             </Grid2>

//             {/* Cancel Button */}
//             {isEditing && (
//                 <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
//                     <Button
//                         variant="outlined"
//                         onClick={handleCancel}
//                         sx={{
//                             color: '#5C3D2E',
//                             borderColor: '#D6D2C4',
//                             textTransform: 'none',
//                             fontWeight: 600,
//                             px: 4,
//                             '&:hover': { borderColor: '#5C3D2E', bgcolor: '#F4F0E5' },
//                         }}
//                     >
//                         Cancel Changes
//                     </Button>
//                 </Box>
//             )}

//             {/* Image Upload Dialog */}
//             <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="xs" fullWidth>
//                 <DialogTitle sx={{ fontWeight: 700, bgcolor: '#5C3D2E', color: '#EFEAD8', py: 2.5 }}>
//                     Update Profile Picture
//                     <IconButton onClick={() => setOpenImageDialog(false)} sx={{ position: 'absolute', right: 16, top: 16, color: '#EFEAD8' }}>
//                         <X size={20} />
//                     </IconButton>
//                 </DialogTitle>
//                 <DialogContent sx={{ bgcolor: '#EFE7DA', p: 4 }}>
//                     <Stack spacing={3} alignItems="center">
//                         <Box
//                             sx={{
//                                 width: '100%',
//                                 height: 200,
//                                 border: '2px dashed #D6D2C4',
//                                 borderRadius: 2,
//                                 display: 'flex',
//                                 flexDirection: 'column',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 bgcolor: '#FFFFFF',
//                                 cursor: 'pointer',
//                                 transition: 'all 0.3s ease',
//                                 '&:hover': { borderColor: '#556B2F', bgcolor: '#F4F0E5' },
//                             }}
//                         >
//                             <Camera size={48} color="#857466" />
//                             <Typography variant="body2" color="#857466" mt={2}>
//                                 Click to upload or drag and drop
//                             </Typography>
//                             <Typography variant="caption" color="#857466">
//                                 PNG, JPG up to 5MB
//                             </Typography>
//                         </Box>
//                         <Button
//                             variant="contained"
//                             fullWidth
//                             sx={{
//                                 bgcolor: '#5C3D2E',
//                                 color: '#EFEAD8',
//                                 textTransform: 'none',
//                                 fontWeight: 600,
//                                 py: 1.5,
//                                 '&:hover': { bgcolor: '#3F4F23' },
//                             }}
//                         >
//                             Upload Image
//                         </Button>
//                     </Stack>
//                 </DialogContent>
//             </Dialog>
//         </Box>
//     );
// }

// export default PatientProfile;

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slices/authSlice";
import {
    Box,
    Typography,
    Grid2,
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
    Shield,
    Edit,
    Camera,
    Save,
    X,
    Briefcase,
    Clock,
    Award,
    AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import profileService from "../../services/profileService";

function PatientProfile() {
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
        patientId: "",
        uhid: "",
        registrationDate: "",
        dateOfBirth: "",
        dob: "",
        bloodGroup: "",
        address: "",
        location: "",
        allergies: "",
        emergencyContact: "",
        bio: "",
        profilePicture: "",
        gender: "",
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

    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toISOString().split("T")[0];
        } catch {
            return "";
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
                    patientId: data.uhid || data.patientId || "",
                    uhid: data.uhid || "",
                    registrationDate: formatDate(data.createdAt),
                    dateOfBirth: formatDate(data.dob),
                    dob: formatDateForInput(data.dob),
                    bloodGroup: data.bloodGroup || "",
                    address: data.address || "",
                    location: data.address || "",
                    allergies: data.allergies || "",
                    emergencyContact: data.emergencyContact || "",
                    bio: data.bio || "",
                    profilePicture: data.profilePicture || "",
                    gender: data.gender || "",
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
                dob: editData.dob ? new Date(editData.dob).toISOString() : undefined,
                bloodGroup: editData.bloodGroup,
                allergies: editData.allergies,
                gender: editData.gender,
                emergencyContact: editData.emergencyContact,
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
        <Box sx={{ bgcolor: '#EFE7DA', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
            {/* Header Card */}
            <Card
                elevation={0}
                sx={{
                    mb: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #5C3D2E 0%, #6d4c3a 100%)',
                    color: '#EFEAD8',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(239,234,216,0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                        transform: 'translate(30%, -30%)',
                    },
                }}
            >
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={3}>
                        <Stack direction="row" spacing={3} alignItems="center">
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={profileData.profilePicture}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        bgcolor: '#556B2F',
                                        fontSize: '2.5rem',
                                        fontWeight: 700,
                                        border: '4px solid #EFEAD8',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    {getInitials(profileData.name)}
                                </Avatar>
                                <IconButton
                                    onClick={() => setOpenImageDialog(true)}
                                    sx={{
                                        position: 'absolute',
                                        bottom: -5,
                                        right: -5,
                                        bgcolor: '#556B2F',
                                        color: '#EFEAD8',
                                        width: 36,
                                        height: 36,
                                        '&:hover': { bgcolor: '#3F4F23' },
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    }}
                                >
                                    <Camera size={18} />
                                </IconButton>
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight={700} gutterBottom>
                                    {profileData.name}
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Chip
                                        icon={<User size={16} />}
                                        label={profileData.role}
                                        sx={{
                                            bgcolor: 'rgba(239, 234, 216, 0.2)',
                                            color: '#EFEAD8',
                                            fontWeight: 600,
                                            border: '1px solid rgba(239, 234, 216, 0.3)',
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        ID: {profileData.patientId} • Registered {profileData.registrationDate}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                        <Button
                            variant="contained"
                            startIcon={isEditing ? (isSaving ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />) : <Edit size={18} />}
                            onClick={isEditing ? handleSave : handleEdit}
                            disabled={isSaving}
                            sx={{
                                bgcolor: '#556B2F',
                                color: '#EFEAD8',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                borderRadius: 2,
                                '&:hover': { bgcolor: '#3F4F23' },
                            }}
                        >
                            {isEditing ? (isSaving ? 'Saving...' : 'Save Profile') : 'Edit Profile'}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Main Content - Grid 2 */}
            <Grid2 container spacing={3}>
                {/* Personal Information */}
                <Grid2 size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#FFFFFF', border: '2px solid #D6D2C4', height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
                                Personal Information
                            </Typography>
                            <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

                            <Stack spacing={3}>
                                {[
                                    { icon: User, label: "Full Name", field: "name" },
                                    { icon: Mail, label: "Email Address", field: "email" },
                                    { icon: Phone, label: "Phone Number", field: "phone" },
                                    { icon: MapPin, label: "Location", field: "location" },
                                    { icon: Calendar, label: "Date of Birth", field: "dateOfBirth", editField: "dob", inputType: "date" },
                                ].map(({ icon: Icon, label, field, editField, inputType }) => (
                                    <Stack key={field} direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ bgcolor: '#F4F0E5', p: 1, borderRadius: 2 }}>
                                            <Icon size={20} color="#556B2F" />
                                        </Box>
                                        <Box flex={1}>
                                            {isEditing ? (
                                                <TextField
                                                    fullWidth
                                                    label={label}
                                                    type={inputType || "text"}
                                                    value={editData[editField || field]}
                                                    onChange={handleInputChange(editField || field)}
                                                    size="small"
                                                    InputLabelProps={inputType === "date" ? { shrink: true } : {}}
                                                    inputProps={field === "phone" || field === "emergencyContact" ? { maxLength: 10 } : {}}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '&:hover fieldset': { borderColor: '#556B2F' },
                                                            '&.Mui-focused fieldset': { borderColor: '#556B2F' },
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
                                                    }}
                                                />
                                            ) : (
                                                <>
                                                    <Typography variant="caption" color="#857466">{label}</Typography>
                                                    <Typography variant="body1" fontWeight={600} color="#5C3D2E">
                                                        {profileData[field] || "Not specified"}
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>
                                    </Stack>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid2>

                {/* Medical Information */}
                <Grid2 size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#FFFFFF', border: '2px solid #D6D2C4', height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
                                Medical Information
                            </Typography>
                            <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

                            <Stack spacing={3}>
                                {[
                                    { icon: Shield, label: "Blood Group", field: "bloodGroup" },
                                    { icon: AlertCircle, label: "Allergies", field: "allergies" },
                                    { icon: Phone, label: "Emergency Contact", field: "emergencyContact" },
                                ].map(({ icon: Icon, label, field }) => (
                                    <Stack key={field} direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ bgcolor: '#F4F0E5', p: 1, borderRadius: 2 }}>
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
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '&:hover fieldset': { borderColor: '#556B2F' },
                                                            '&.Mui-focused fieldset': { borderColor: '#556B2F' },
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
                                                    }}
                                                />
                                            ) : (
                                                <>
                                                    <Typography variant="caption" color="#857466">{label}</Typography>
                                                    <Typography variant="body1" fontWeight={600} color="#5C3D2E">
                                                        {profileData[field]}
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>
                                    </Stack>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid2>

                {/* Bio Section - Full Width */}
                <Grid2 size={12}>
                    <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#FFFFFF', border: '2px solid #D6D2C4' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
                                Patient Summary
                            </Typography>
                            <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

                            {isEditing ? (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={editData.bio}
                                    onChange={handleInputChange('bio')}
                                    placeholder="Write a summary of your health history or notes..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': { borderColor: '#556B2F' },
                                            '&.Mui-focused fieldset': { borderColor: '#556B2F' },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
                                    }}
                                />
                            ) : (
                                <Typography variant="body1" color="#5C3D2E" lineHeight={1.8}>
                                    {profileData.bio}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>

            {/* Cancel Button */}
            {isEditing && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={handleCancel}
                        sx={{
                            color: '#5C3D2E',
                            borderColor: '#D6D2C4',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4,
                            '&:hover': { borderColor: '#5C3D2E', bgcolor: '#F4F0E5' },
                        }}
                    >
                        Cancel Changes
                    </Button>
                </Box>
            )}

            {/* Image Upload Dialog */}
            <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, bgcolor: '#5C3D2E', color: '#EFEAD8', py: 2.5 }}>
                    Update Profile Picture
                    <IconButton onClick={() => setOpenImageDialog(false)} sx={{ position: 'absolute', right: 16, top: 16, color: '#EFEAD8' }}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ bgcolor: '#EFE7DA', p: 4 }}>
                    <Stack spacing={3} alignItems="center">
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
                                    width: '100%',
                                    height: 200,
                                    border: '2px dashed #D6D2C4',
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: '#FFFFFF',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { borderColor: '#556B2F', bgcolor: '#F4F0E5' },
                                }}
                            >
                                <Camera size={48} color="#857466" />
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
                            variant="contained"
                            fullWidth
                            onClick={handleUploadPicture}
                            disabled={!selectedFile || isUploading}
                            sx={{
                                bgcolor: '#5C3D2E',
                                color: '#EFEAD8',
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 1.5,
                                '&:hover': { bgcolor: '#3F4F23' },
                            }}
                        >
                            {isUploading ? "Uploading..." : "Upload Image"}
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default PatientProfile;