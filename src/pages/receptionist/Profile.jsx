
// import React, { useState } from "react";
// import {
//     Box,
//     Typography,
//     Grid,           // ← Fixed: Grid instead of Grid2
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

// function ReceptionistProfile() {
//     const [isEditing, setIsEditing] = useState(false);
//     const [openImageDialog, setOpenImageDialog] = useState(false);

//     const [profileData, setProfileData] = useState({
//         name: "Dr. Rajesh Kumar",
//         email: "rajesh.kumar@ayurveda.com",
//         phone: "+91 98765 43210",
//         role: "Administrator",
//         department: "Operations",
//         location: "Mumbai, Maharashtra",
//         joinDate: "January 15, 2020",
//         experience: "5 Years",
//         certifications: "BAMS, MD (Ayurveda)",
//         bio: "Experienced Ayurvedic practitioner with expertise in traditional medicine and modern healthcare management. Passionate about integrating ancient wisdom with contemporary practices.",
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

//     return (
//         <Box sx={{ bgcolor: "#EFE7DA", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
//             {/* Header Card */}
//             <Card
//                 elevation={0}
//                 sx={{
//                     mb: 4,
//                     borderRadius: 3,
//                     background: "linear-gradient(135deg, #5C3D2E 0%, #6d4c3a 100%)",
//                     color: "#EFEAD8",
//                     overflow: "hidden",
//                     position: "relative",
//                     "&::before": {
//                         content: '""',
//                         position: "absolute",
//                         top: 0,
//                         right: 0,
//                         width: "400px",
//                         height: "400px",
//                         background: "radial-gradient(circle, rgba(239,234,216,0.15) 0%, transparent 70%)",
//                         borderRadius: "50%",
//                         transform: "translate(30%, -30%)",
//                     },
//                 }}
//             >
//                 <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
//                     <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={3}>
//                         <Stack direction="row" spacing={3} alignItems="center">
//                             <Box sx={{ position: "relative" }}>
//                                 <Avatar
//                                     sx={{
//                                         width: 100,
//                                         height: 100,
//                                         bgcolor: "#556B2F",
//                                         fontSize: "2.5rem",
//                                         fontWeight: 700,
//                                         border: "4px solid #EFEAD8",
//                                         boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
//                                     }}
//                                 >
//                                     RK
//                                 </Avatar>
//                                 <IconButton
//                                     onClick={() => setOpenImageDialog(true)}
//                                     sx={{
//                                         position: "absolute",
//                                         bottom: -5,
//                                         right: -5,
//                                         bgcolor: "#556B2F",
//                                         color: "#EFEAD8",
//                                         width: 36,
//                                         height: 36,
//                                         "&:hover": { bgcolor: "#3F4F23" },
//                                         boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
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
//                                             bgcolor: "rgba(239, 234, 216, 0.2)",
//                                             color: "#EFEAD8",
//                                             fontWeight: 600,
//                                             border: "1px solid rgba(239, 234, 216, 0.3)",
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
//                                 bgcolor: "#556B2F",
//                                 color: "#EFEAD8",
//                                 textTransform: "none",
//                                 fontWeight: 600,
//                                 px: 3,
//                                 borderRadius: 2,
//                                 "&:hover": { bgcolor: "#3F4F23" },
//                             }}
//                         >
//                             {isEditing ? "Save Profile" : "Edit Profile"}
//                         </Button>
//                     </Stack>
//                 </CardContent>
//             </Card>

//             {/* Main Content - 2 Column Grid */}
//             <Grid container spacing={3}>
//                 {/* Personal Information */}
//                 <Grid item xs={12} md={6}>
//                     <Card elevation={0} sx={{ borderRadius: 3, bgcolor: "#FFFFFF", border: "2px solid #D6D2C4", height: "100%" }}>
//                         <CardContent sx={{ p: 4 }}>
//                             <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
//                                 Personal Information
//                             </Typography>
//                             <Divider sx={{ my: 2, borderColor: "#D6D2C4" }} />

//                             <Stack spacing={3}>
//                                 {[
//                                     { icon: User, label: "Full Name", field: "name" },
//                                     { icon: Mail, label: "Email Address", field: "email" },
//                                     { icon: Phone, label: "Phone Number", field: "phone" },
//                                     { icon: MapPin, label: "Location", field: "location" },
//                                 ].map(({ icon: Icon, label, field }) => (
//                                     <Stack key={field} direction="row" spacing={2} alignItems="center">
//                                         <Box sx={{ bgcolor: "#F4F0E5", p: 1, borderRadius: 2 }}>
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
//                                                         "& .MuiOutlinedInput-root": {
//                                                             "&:hover fieldset": { borderColor: "#556B2F" },
//                                                             "&.Mui-focused fieldset": { borderColor: "#556B2F" },
//                                                         },
//                                                         "& .MuiInputLabel-root.Mui-focused": { color: "#556B2F" },
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
//                 </Grid>

//                 {/* Professional Information */}
//                 <Grid item xs={12} md={6}>
//                     <Card elevation={0} sx={{ borderRadius: 3, bgcolor: "#FFFFFF", border: "2px solid #D6D2C4", height: "100%" }}>
//                         <CardContent sx={{ p: 4 }}>
//                             <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
//                                 Professional Details
//                             </Typography>
//                             <Divider sx={{ my: 2, borderColor: "#D6D2C4" }} />

//                             <Stack spacing={3}>
//                                 {[
//                                     { icon: Briefcase, label: "Department", field: "department" },
//                                     { icon: Calendar, label: "Join Date", field: "joinDate", editable: false },
//                                     { icon: Clock, label: "Experience", field: "experience" },
//                                     { icon: Award, label: "Certifications", field: "certifications" },
//                                 ].map(({ icon: Icon, label, field, editable = true }) => (
//                                     <Stack key={field} direction="row" spacing={2} alignItems="center">
//                                         <Box sx={{ bgcolor: "#F4F0E5", p: 1, borderRadius: 2 }}>
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
//                                                         "& .MuiOutlinedInput-root": {
//                                                             "&:hover fieldset": { borderColor: "#556B2F" },
//                                                             "&.Mui-focused fieldset": { borderColor: "#556B2F" },
//                                                         },
//                                                         "& .MuiInputLabel-root.Mui-focused": { color: "#556B2F" },
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
//                 </Grid>

//                 {/* Bio Section - Full Width */}
//                 <Grid item xs={12}>
//                     <Card elevation={0} sx={{ borderRadius: 3, bgcolor: "#FFFFFF", border: "2px solid #D6D2C4" }}>
//                         <CardContent sx={{ p: 4 }}>
//                             <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
//                                 Professional Bio
//                             </Typography>
//                             <Divider sx={{ my: 2, borderColor: "#D6D2C4" }} />

//                             {isEditing ? (
//                                 <TextField
//                                     fullWidth
//                                     multiline
//                                     rows={4}
//                                     value={editData.bio}
//                                     onChange={handleInputChange("bio")}
//                                     placeholder="Write your professional bio..."
//                                     sx={{
//                                         "& .MuiOutlinedInput-root": {
//                                             "&:hover fieldset": { borderColor: "#556B2F" },
//                                             "&.Mui-focused fieldset": { borderColor: "#556B2F" },
//                                         },
//                                         "& .MuiInputLabel-root.Mui-focused": { color: "#556B2F" },
//                                     }}
//                                 />
//                             ) : (
//                                 <Typography variant="body1" color="#5C3D2E" lineHeight={1.8}>
//                                     {profileData.bio}
//                                 </Typography>
//                             )}
//                         </CardContent>
//                     </Card>
//                 </Grid>
//             </Grid>

//             {/* Cancel Button */}
//             {isEditing && (
//                 <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
//                     <Button
//                         variant="outlined"
//                         onClick={handleCancel}
//                         sx={{
//                             color: "#5C3D2E",
//                             borderColor: "#D6D2C4",
//                             textTransform: "none",
//                             fontWeight: 600,
//                             px: 4,
//                             "&:hover": { borderColor: "#5C3D2E", bgcolor: "#F4F0E5" },
//                         }}
//                     >
//                         Cancel Changes
//                     </Button>
//                 </Box>
//             )}

//             {/* Image Upload Dialog */}
//             <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="xs" fullWidth>
//                 <DialogTitle sx={{ fontWeight: 700, bgcolor: "#5C3D2E", color: "#EFEAD8", py: 2.5 }}>
//                     Update Profile Picture
//                     <IconButton onClick={() => setOpenImageDialog(false)} sx={{ position: "absolute", right: 16, top: 16, color: "#EFEAD8" }}>
//                         <X size={20} />
//                     </IconButton>
//                 </DialogTitle>
//                 <DialogContent sx={{ bgcolor: "#EFE7DA", p: 4 }}>
//                     <Stack spacing={3} alignItems="center">
//                         <Box
//                             sx={{
//                                 width: "100%",
//                                 height: 200,
//                                 border: "2px dashed #D6D2C4",
//                                 borderRadius: 2,
//                                 display: "flex",
//                                 flexDirection: "column",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 bgcolor: "#FFFFFF",
//                                 cursor: "pointer",
//                                 transition: "all 0.3s ease",
//                                 "&:hover": { borderColor: "#556B2F", bgcolor: "#F4F0E5" },
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
//                                 bgcolor: "#5C3D2E",
//                                 color: "#EFEAD8",
//                                 textTransform: "none",
//                                 fontWeight: 600,
//                                 py: 1.5,
//                                 "&:hover": { bgcolor: "#3F4F23" },
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

// export default ReceptionistProfile;

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

function ReceptionistProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);

    // ⭐ Receptionist REAL-WORLD accurate data
    const [profileData, setProfileData] = useState({
        name: "Priya Sharma",
        email: "priya.sharma@utpalaayur.com",
        phone: "+91 98765 44210",
        role: "Receptionist",
        department: "Front Desk & Patient Coordination",
        location: "Bengaluru, Karnataka",
        joinDate: "March 10, 2022",
        experience: "2.8 Years",
        shift: "Morning Shift (8:00 AM - 4:00 PM)",
        skills: "Patient Registration, Appointment Handling, Queue Management",
        certifications: "Customer Service Training, Hospital Front-Desk Operations",
        bio:
            "Dedicated and professional receptionist ensuring smooth patient flow, appointment scheduling, and hospitality at the front desk. Skilled in handling patient queries, coordinating with doctors, and maintaining a calm and welcoming environment.",
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
                                    <Box sx={{ p: 1, bgcolor: "#F4F0E5", borderRadius: 2 }}>
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
                                    <Box sx={{ p: 1, bgcolor: "#F4F0E5", borderRadius: 2 }}>
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

export default ReceptionistProfile;
