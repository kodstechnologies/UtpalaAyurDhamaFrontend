// // import React, { useState } from 'react';
// // import {
// //     Box,
// //     Typography,
// //     Card,
// //     CardContent,
// //     Grid,
// //     Avatar,
// //     Stack,
// //     Divider,
// //     Button,
// //     TextField,
// //     IconButton,
// //     Chip,
// //     Dialog,
// //     DialogTitle,
// //     DialogContent,
// // } from '@mui/material';
// // import {
// //     User,
// //     Mail,
// //     Phone,
// //     MapPin,
// //     Calendar,
// //     Shield,
// //     Edit,
// //     Camera,
// //     Save,
// //     X,
// //     Briefcase,
// //     Clock,
// //     Award,
// // } from 'lucide-react';

// // function AdminProfile() {
// //     const [isEditing, setIsEditing] = useState(false);
// //     const [openImageDialog, setOpenImageDialog] = useState(false);

// //     const [profileData, setProfileData] = useState({
// //         name: 'Dr. Rajesh Kumar',
// //         email: 'rajesh.kumar@ayurveda.com',
// //         phone: '+91 98765 43210',
// //         role: 'Administrator',
// //         department: 'Operations',
// //         location: 'Mumbai, Maharashtra',
// //         joinDate: 'January 15, 2020',
// //         experience: '5 Years',
// //         certifications: 'BAMS, MD (Ayurveda)',
// //         bio: 'Experienced Ayurvedic practitioner with expertise in traditional medicine and modern healthcare management. Passionate about integrating ancient wisdom with contemporary practices.',
// //     });

// //     const [editData, setEditData] = useState({ ...profileData });

// //     const handleEdit = () => {
// //         setIsEditing(true);
// //         setEditData({ ...profileData });
// //     };

// //     const handleSave = () => {
// //         setProfileData({ ...editData });
// //         setIsEditing(false);
// //     };

// //     const handleCancel = () => {
// //         setEditData({ ...profileData });
// //         setIsEditing(false);
// //     };

// //     const handleInputChange = (field) => (e) => {
// //         setEditData({ ...editData, [field]: e.target.value });
// //     };

// //     const stats = [
// //         { label: 'Patients Managed', value: '1,250+', icon: User, color: '#556B2F' },
// //         { label: 'Active Cases', value: '48', icon: Briefcase, color: '#6A8E3F' },
// //         { label: 'Response Time', value: '< 2hrs', icon: Clock, color: '#E8A84E' },
// //         { label: 'Certifications', value: '4', icon: Award, color: '#4E7BA8' },
// //     ];

// //     return (
// //         <Box sx={{ bgcolor: '#EFE7DA', minHeight: '100vh', p: 4 }}>
// //             {/* Header Card */}
// //             <Card
// //                 elevation={0}
// //                 sx={{
// //                     mb: 4,
// //                     borderRadius: 3,
// //                     background: 'linear-gradient(135deg, #5C3D2E 0%, #6d4c3a 100%)',
// //                     color: '#EFEAD8',
// //                     overflow: 'hidden',
// //                     position: 'relative',
// //                     '&::before': {
// //                         content: '""',
// //                         position: 'absolute',
// //                         top: 0,
// //                         right: 0,
// //                         width: '400px',
// //                         height: '400px',
// //                         background: 'radial-gradient(circle, rgba(239,234,216,0.15) 0%, transparent 70%)',
// //                         borderRadius: '50%',
// //                         transform: 'translate(30%, -30%)',
// //                     },
// //                 }}
// //             >
// //                 <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
// //                     <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
// //                         <Stack direction="row" spacing={3} alignItems="center">
// //                             <Box sx={{ position: 'relative' }}>
// //                                 <Avatar
// //                                     sx={{
// //                                         width: 100,
// //                                         height: 100,
// //                                         bgcolor: '#556B2F',
// //                                         fontSize: '2.5rem',
// //                                         fontWeight: 700,
// //                                         border: '4px solid #EFEAD8',
// //                                         boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
// //                                     }}
// //                                 >
// //                                     RK
// //                                 </Avatar>
// //                                 <IconButton
// //                                     onClick={() => setOpenImageDialog(true)}
// //                                     sx={{
// //                                         position: 'absolute',
// //                                         bottom: -5,
// //                                         right: -5,
// //                                         bgcolor: '#556B2F',
// //                                         color: '#EFEAD8',
// //                                         width: 36,
// //                                         height: 36,
// //                                         '&:hover': {
// //                                             bgcolor: '#3F4F23',
// //                                         },
// //                                         boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
// //                                     }}
// //                                 >
// //                                     <Camera size={18} />
// //                                 </IconButton>
// //                             </Box>
// //                             <Box>
// //                                 <Typography variant="h4" fontWeight={700} gutterBottom>
// //                                     {profileData.name}
// //                                 </Typography>
// //                                 <Stack direction="row" spacing={2} alignItems="center">
// //                                     <Chip
// //                                         icon={<Shield size={16} />}
// //                                         label={profileData.role}
// //                                         sx={{
// //                                             bgcolor: 'rgba(239, 234, 216, 0.2)',
// //                                             color: '#EFEAD8',
// //                                             fontWeight: 600,
// //                                             border: '1px solid rgba(239, 234, 216, 0.3)',
// //                                         }}
// //                                     />
// //                                     <Typography variant="body2" sx={{ opacity: 0.9 }}>
// //                                         {profileData.department} • Member since {profileData.joinDate}
// //                                     </Typography>
// //                                 </Stack>
// //                             </Box>
// //                         </Stack>
// //                         <Button
// //                             variant="contained"
// //                             startIcon={isEditing ? <Save size={18} /> : <Edit size={18} />}
// //                             onClick={isEditing ? handleSave : handleEdit}
// //                             sx={{
// //                                 bgcolor: '#556B2F',
// //                                 color: '#EFEAD8',
// //                                 textTransform: 'none',
// //                                 fontWeight: 600,
// //                                 px: 3,
// //                                 borderRadius: 2,
// //                                 '&:hover': {
// //                                     bgcolor: '#3F4F23',
// //                                 },
// //                             }}
// //                         >
// //                             {isEditing ? 'Save Profile' : 'Edit Profile'}
// //                         </Button>
// //                     </Stack>
// //                 </CardContent>
// //             </Card>



// //             {/* Main Content Grid */}
// //             <Grid container spacing={3}>
// //                 {/* Personal Information */}
// //                 <Grid item xs={12} md={6}>
// //                     <Card
// //                         elevation={0}
// //                         sx={{
// //                             borderRadius: 3,
// //                             bgcolor: '#FFFFFF',
// //                             border: '2px solid #D6D2C4',
// //                             height: '100%',
// //                         }}
// //                     >
// //                         <CardContent sx={{ p: 4 }}>
// //                             <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
// //                                 Personal Information
// //                             </Typography>
// //                             <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

// //                             <Stack spacing={3}>
// //                                 <Stack direction="row" spacing={2} alignItems="center">
// //                                     <Box
// //                                         sx={{
// //                                             bgcolor: '#F4F0E5',
// //                                             p: 1,
// //                                             borderRadius: 2,
// //                                             display: 'flex',
// //                                             alignItems: 'center',
// //                                         }}
// //                                     >
// //                                         <User size={20} color="#556B2F" />
// //                                     </Box>
// //                                     <Box flex={1}>
// //                                         {isEditing ? (
// //                                             <TextField
// //                                                 fullWidth
// //                                                 label="Full Name"
// //                                                 value={editData.name}
// //                                                 onChange={handleInputChange('name')}
// //                                                 size="small"
// //                                                 sx={{
// //                                                     '& .MuiOutlinedInput-root': {
// //                                                         '&:hover fieldset': { borderColor: '#556B2F' },
// //                                                         '&.Mui-focused fieldset': { borderColor: '#556B2F' },
// //                                                     },
// //                                                     '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
// //                                                 }}
// //                                             />
// //                                         ) : (
// //                                             <>
// //                                                 <Typography variant="caption" color="#857466">
// //                                                     Full Name
// //                                                 </Typography>
// //                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">
// //                                                     {profileData.name}
// //                                                 </Typography>
// //                                             </>
// //                                         )}
// //                                     </Box>
// //                                 </Stack>

// //                                 <Stack direction="row" spacing={2} alignItems="center">
// //                                     <Box
// //                                         sx={{
// //                                             bgcolor: '#F4F0E5',
// //                                             p: 1,
// //                                             borderRadius: 2,
// //                                             display: 'flex',
// //                                             alignItems: 'center',
// //                                         }}
// //                                     >
// //                                         <Mail size={20} color="#556B2F" />
// //                                     </Box>
// //                                     <Box flex={1}>
// //                                         {isEditing ? (
// //                                             <TextField
// //                                                 fullWidth
// //                                                 label="Email Address"
// //                                                 value={editData.email}
// //                                                 onChange={handleInputChange('email')}
// //                                                 size="small"
// //                                                 sx={{
// //                                                     '& .MuiOutlinedInput-root': {
// //                                                         '&:hover fieldset': { borderColor: '#556B2F' },
// //                                                         '&.Mui-focused fieldset': { borderColor: '#556B2F' },
// //                                                     },
// //                                                     '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
// //                                                 }}
// //                                             />
// //                                         ) : (
// //                                             <>
// //                                                 <Typography variant="caption" color="#857466">
// //                                                     Email Address
// //                                                 </Typography>
// //                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">
// //                                                     {profileData.email}
// //                                                 </Typography>
// //                                             </>
// //                                         )}
// //                                     </Box>
// //                                 </Stack>

// //                                 <Stack direction="row" spacing={2} alignItems="center">
// //                                     <Box
// //                                         sx={{
// //                                             bgcolor: '#F4F0E5',
// //                                             p: 1,
// //                                             borderRadius: 2,
// //                                             display: 'flex',
// //                                             alignItems: 'center',
// //                                         }}
// //                                     >
// //                                         <Phone size={20} color="#556B2F" />
// //                                     </Box>
// //                                     <Box flex={1}>
// //                                         {isEditing ? (
// //                                             <TextField
// //                                                 fullWidth
// //                                                 label="Phone Number"
// //                                                 value={editData.phone}
// //                                                 onChange={handleInputChange('phone')}
// //                                                 size="small"
// //                                                 sx={{
// //                                                     '& .MuiOutlinedInput-root': {
// //                                                         '&:hover fieldset': { borderColor: '#556B2F' },
// //                                                         '&.Mui-focused fieldset': { borderColor: '#556B2F' },
// //                                                     },
// //                                                     '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
// //                                                 }}
// //                                             />
// //                                         ) : (
// //                                             <>
// //                                                 <Typography variant="caption" color="#857466">
// //                                                     Phone Number
// //                                                 </Typography>
// //                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">
// //                                                     {profileData.phone}
// //                                                 </Typography>
// //                                             </>
// //                                         )}
// //                                     </Box>
// //                                 </Stack>

// //                                 <Stack direction="row" spacing={2} alignItems="center">
// //                                     <Box
// //                                         sx={{
// //                                             bgcolor: '#F4F0E5',
// //                                             p: 1,
// //                                             borderRadius: 2,
// //                                             display: 'flex',
// //                                             alignItems: 'center',
// //                                         }}
// //                                     >
// //                                         <MapPin size={20} color="#556B2F" />
// //                                     </Box>
// //                                     <Box flex={1}>
// //                                         {isEditing ? (
// //                                             <TextField
// //                                                 fullWidth
// //                                                 label="Location"
// //                                                 value={editData.location}
// //                                                 onChange={handleInputChange('location')}
// //                                                 size="small"
// //                                                 sx={{
// //                                                     '& .MuiOutlinedInput-root': {
// //                                                         '&:hover fieldset': { borderColor: '#556B2F' },
// //                                                         '&.Mui-focused fieldset': { borderColor: '#556B2F' },
// //                                                     },
// //                                                     '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
// //                                                 }}
// //                                             />
// //                                         ) : (
// //                                             <>
// //                                                 <Typography variant="caption" color="#857466">
// //                                                     Location
// //                                                 </Typography>
// //                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">
// //                                                     {profileData.location}
// //                                                 </Typography>
// //                                             </>
// //                                         )}
// //                                     </Box>
// //                                 </Stack>
// //                             </Stack>
// //                         </CardContent>
// //                     </Card>
// //                 </Grid>

// //                 {/* Professional Information */}
// //                 <Grid item xs={12} md={6}>
// //                     <Card
// //                         elevation={0}
// //                         sx={{
// //                             borderRadius: 3,
// //                             bgcolor: '#FFFFFF',
// //                             border: '2px solid #D6D2C4',
// //                             height: '100%',
// //                         }}
// //                     >
// //                         <CardContent sx={{ p: 4 }}>
// //                             <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
// //                                 Professional Details
// //                             </Typography>
// //                             <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

// //                             <Stack spacing={3}>
// //                                 <Stack direction="row" spacing={2} alignItems="center">
// //                                     <Box
// //                                         sx={{
// //                                             bgcolor: '#F4F0E5',
// //                                             p: 1,
// //                                             borderRadius: 2,
// //                                             display: 'flex',
// //                                             alignItems: 'center',
// //                                         }}
// //                                     >
// //                                         <Briefcase size={20} color="#556B2F" />
// //                                     </Box>
// //                                     <Box flex={1}>
// //                                         {isEditing ? (
// //                                             <TextField
// //                                                 fullWidth
// //                                                 label="Department"
// //                                                 value={editData.department}
// //                                                 onChange={handleInputChange('department')}
// //                                                 size="small"
// //                                                 sx={{
// //                                                     '& .MuiOutlinedInput-root': {
// //                                                         '&:hover fieldset': { borderColor: '#556B2F' },
// //                                                         '&.Mui-focused fieldset': { borderColor: '#556B2F' },
// //                                                     },
// //                                                     '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
// //                                                 }}
// //                                             />
// //                                         ) : (
// //                                             <>
// //                                                 <Typography variant="caption" color="#857466">
// //                                                     Department
// //                                                 </Typography>
// //                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">
// //                                                     {profileData.department}
// //                                                 </Typography>
// //                                             </>
// //                                         )}
// //                                     </Box>
// //                                 </Stack>

// //                                 <Stack direction="row" spacing={2} alignItems="center">
// //                                     <Box
// //                                         sx={{
// //                                             bgcolor: '#F4F0E5',
// //                                             p: 1,
// //                                             borderRadius: 2,
// //                                             display: 'flex',
// //                                             alignItems: 'center',
// //                                         }}
// //                                     >
// //                                         <Calendar size={20} color="#556B2F" />
// //                                     </Box>
// //                                     <Box flex={1}>
// //                                         <Typography variant="caption" color="#857466">
// //                                             Join Date
// //                                         </Typography>
// //                                         <Typography variant="body1" fontWeight={600} color="#5C3D2E">
// //                                             {profileData.joinDate}
// //                                         </Typography>
// //                                     </Box>
// //                                 </Stack>

// //                                 <Stack direction="row" spacing={2} alignItems="center">
// //                                     <Box
// //                                         sx={{
// //                                             bgcolor: '#F4F0E5',
// //                                             p: 1,
// //                                             borderRadius: 2,
// //                                             display: 'flex',
// //                                             alignItems: 'center',
// //                                         }}
// //                                     >
// //                                         <Clock size={20} color="#556B2F" />
// //                                     </Box>
// //                                     <Box flex={1}>
// //                                         {isEditing ? (
// //                                             <TextField
// //                                                 fullWidth
// //                                                 label="Experience"
// //                                                 value={editData.experience}
// //                                                 onChange={handleInputChange('experience')}
// //                                                 size="small"
// //                                                 sx={{
// //                                                     '& .MuiOutlinedInput-root': {
// //                                                         '&:hover fieldset': { borderColor: '#556B2F' },
// //                                                         '&.Mui-focused fieldset': { borderColor: '#556B2F' },
// //                                                     },
// //                                                     '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
// //                                                 }}
// //                                             />
// //                                         ) : (
// //                                             <>
// //                                                 <Typography variant="caption" color="#857466">
// //                                                     Experience
// //                                                 </Typography>
// //                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">
// //                                                     {profileData.experience}
// //                                                 </Typography>
// //                                             </>
// //                                         )}
// //                                     </Box>
// //                                 </Stack>

// //                                 <Stack direction="row" spacing={2} alignItems="center">
// //                                     <Box
// //                                         sx={{
// //                                             bgcolor: '#F4F0E5',
// //                                             p: 1,
// //                                             borderRadius: 2,
// //                                             display: 'flex',
// //                                             alignItems: 'center',
// //                                         }}
// //                                     >
// //                                         <Award size={20} color="#556B2F" />
// //                                     </Box>
// //                                     <Box flex={1}>
// //                                         {isEditing ? (
// //                                             <TextField
// //                                                 fullWidth
// //                                                 label="Certifications"
// //                                                 value={editData.certifications}
// //                                                 onChange={handleInputChange('certifications')}
// //                                                 size="small"
// //                                                 sx={{
// //                                                     '& .MuiOutlinedInput-root': {
// //                                                         '&:hover fieldset': { borderColor: '#556B2F' },
// //                                                         '&.Mui-focused fieldset': { borderColor: '#556B2F' },
// //                                                     },
// //                                                     '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
// //                                                 }}
// //                                             />
// //                                         ) : (
// //                                             <>
// //                                                 <Typography variant="caption" color="#857466">
// //                                                     Certifications
// //                                                 </Typography>
// //                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">
// //                                                     {profileData.certifications}
// //                                                 </Typography>
// //                                             </>
// //                                         )}
// //                                     </Box>
// //                                 </Stack>
// //                             </Stack>
// //                         </CardContent>
// //                     </Card>
// //                 </Grid>

// //                 {/* Bio Section */}
// //                 <Grid item xs={12}>
// //                     <Card
// //                         elevation={0}
// //                         sx={{
// //                             borderRadius: 3,
// //                             bgcolor: '#FFFFFF',
// //                             border: '2px solid #D6D2C4',
// //                         }}
// //                     >
// //                         <CardContent sx={{ p: 4 }}>
// //                             <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
// //                                 Professional Bio
// //                             </Typography>
// //                             <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

// //                             {isEditing ? (
// //                                 <TextField
// //                                     fullWidth
// //                                     multiline
// //                                     rows={4}
// //                                     value={editData.bio}
// //                                     onChange={handleInputChange('bio')}
// //                                     placeholder="Write your professional bio..."
// //                                     sx={{
// //                                         '& .MuiOutlinedInput-root': {
// //                                             '&:hover fieldset': { borderColor: '#556B2F' },
// //                                             '&.Mui-focused fieldset': { borderColor: '#556B2F' },
// //                                         },
// //                                         '& .MuiInputLabel-root.Mui-focused': { color: '#556B2F' },
// //                                     }}
// //                                 />
// //                             ) : (
// //                                 <Typography variant="body1" color="#5C3D2E" lineHeight={1.8}>
// //                                     {profileData.bio}
// //                                 </Typography>
// //                             )}
// //                         </CardContent>
// //                     </Card>
// //                 </Grid>
// //             </Grid>

// //             {/* Cancel Button when Editing */}
// //             {isEditing && (
// //                 <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
// //                     <Button
// //                         variant="outlined"
// //                         onClick={handleCancel}
// //                         sx={{
// //                             color: '#5C3D2E',
// //                             borderColor: '#D6D2C4',
// //                             textTransform: 'none',
// //                             fontWeight: 600,
// //                             px: 4,
// //                             '&:hover': {
// //                                 borderColor: '#5C3D2E',
// //                                 bgcolor: '#F4F0E5',
// //                             },
// //                         }}
// //                     >
// //                         Cancel Changes
// //                     </Button>
// //                 </Box>
// //             )}

// //             {/* Image Upload Dialog */}
// //             <Dialog
// //                 open={openImageDialog}
// //                 onClose={() => setOpenImageDialog(false)}
// //                 maxWidth="xs"
// //                 fullWidth
// //                 PaperProps={{
// //                     sx: {
// //                         borderRadius: 3,
// //                         border: '2px solid #D6D2C4',
// //                     },
// //                 }}
// //             >
// //                 <DialogTitle
// //                     sx={{
// //                         fontWeight: 700,
// //                         bgcolor: '#5C3D2E',
// //                         color: '#EFEAD8',
// //                         position: 'relative',
// //                         py: 2.5,
// //                     }}
// //                 >
// //                     Update Profile Picture
// //                     <IconButton
// //                         onClick={() => setOpenImageDialog(false)}
// //                         sx={{
// //                             position: 'absolute',
// //                             right: 16,
// //                             top: 16,
// //                             color: '#EFEAD8',
// //                             '&:hover': {
// //                                 bgcolor: 'rgba(239, 234, 216, 0.1)',
// //                             },
// //                         }}
// //                     >
// //                         <X size={20} />
// //                     </IconButton>
// //                 </DialogTitle>
// //                 <DialogContent sx={{ bgcolor: '#EFE7DA', p: 4 }}>
// //                     <Stack spacing={3} alignItems="center">
// //                         <Box
// //                             sx={{
// //                                 width: '100%',
// //                                 height: 200,
// //                                 border: '2px dashed #D6D2C4',
// //                                 borderRadius: 2,
// //                                 display: 'flex',
// //                                 flexDirection: 'column',
// //                                 alignItems: 'center',
// //                                 justifyContent: 'center',
// //                                 bgcolor: '#FFFFFF',
// //                                 cursor: 'pointer',
// //                                 transition: 'all 0.3s ease',
// //                                 '&:hover': {
// //                                     borderColor: '#556B2F',
// //                                     bgcolor: '#F4F0E5',
// //                                 },
// //                             }}
// //                         >
// //                             <Camera size={48} color="#857466" />
// //                             <Typography variant="body2" color="#857466" mt={2}>
// //                                 Click to upload or drag and drop
// //                             </Typography>
// //                             <Typography variant="caption" color="#857466">
// //                                 PNG, JPG up to 5MB
// //                             </Typography>
// //                         </Box>
// //                         <Button
// //                             variant="contained"
// //                             fullWidth
// //                             sx={{
// //                                 bgcolor: '#5C3D2E',
// //                                 color: '#EFEAD8',
// //                                 textTransform: 'none',
// //                                 fontWeight: 600,
// //                                 py: 1.5,
// //                                 '&:hover': {
// //                                     bgcolor: '#3F4F23',
// //                                 },
// //                             }}
// //                         >
// //                             Upload Image
// //                         </Button>
// //                     </Stack>
// //                 </DialogContent>
// //             </Dialog>
// //         </Box>
// //     );
// // }

// // export default AdminProfile;

// import React, { useState } from "react";
// import {
//     Box,
//     Typography,
//     Card,
//     CardContent,
//     Grid,
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

// function AdminProfile() {
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
//                     <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "center", md: "flex-start" }} spacing={3}>
//                         <Stack direction="row" spacing={3} alignItems="center" sx={{ textAlign: { xs: "center", md: "left" } }}>
//                             <Box sx={{ position: 'relative' }}>
//                                 <Avatar
//                                     sx={{
//                                         width: 120,
//                                         height: 120,
//                                         bgcolor: '#556B2F',
//                                         fontSize: '3rem',
//                                         fontWeight: 700,
//                                         border: '5px solid #EFEAD8',
//                                         boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
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
//                                         width: 40,
//                                         height: 40,
//                                         '&:hover': { bgcolor: '#3F4F23' },
//                                         boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//                                     }}
//                                 >
//                                     <Camera size={20} />
//                                 </IconButton>
//                             </Box>
//                             <Box>
//                                 <Typography variant="h4" fontWeight={700} gutterBottom>
//                                     {profileData.name}
//                                 </Typography>
//                                 <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
//                                     <Chip
//                                         icon={<Shield size={18} />}
//                                         label={profileData.role}
//                                         sx={{
//                                             bgcolor: 'rgba(239, 234, 216, 0.2)',
//                                             color: '#EFEAD8',
//                                             fontWeight: 600,
//                                             border: '1px solid rgba(239, 234, 216, 0.3)',
//                                         }}
//                                     />
//                                     <Typography variant="body1" sx={{ opacity: 0.9 }}>
//                                         {profileData.department} • Since {profileData.joinDate}
//                                     </Typography>
//                                 </Stack>
//                             </Box>
//                         </Stack>
//                         <Button
//                             variant="contained"
//                             startIcon={isEditing ? <Save size={20} /> : <Edit size={20} />}
//                             onClick={isEditing ? handleSave : handleEdit}
//                             sx={{
//                                 bgcolor: '#556B2F',
//                                 color: '#EFEAD8',
//                                 textTransform: 'none',
//                                 fontWeight: 600,
//                                 px: 4,
//                                 py: 1.5,
//                                 borderRadius: 3,
//                                 '&:hover': { bgcolor: '#3F4F23' },
//                             }}
//                         >
//                             {isEditing ? 'Save Profile' : 'Edit Profile'}
//                         </Button>
//                     </Stack>
//                 </CardContent>
//             </Card>

//             {/* 2-Column Grid Layout */}
//             <Grid container spacing={4}>
//                 {/* Left Column: Personal Information */}
//                 <Grid item xs={12} md={6}>
//                     <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#FFFFFF', border: '2px solid #D6D2C4', height: '100%' }}>
//                         <CardContent sx={{ p: 4 }}>
//                             <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
//                                 Personal Information
//                             </Typography>
//                             <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

//                             <Stack spacing={3}>
//                                 {/* Name */}
//                                 <Stack direction="row" spacing={2} alignItems="center">
//                                     <Box sx={{ bgcolor: '#F4F0E5', p: 1.5, borderRadius: 2 }}>
//                                         <User size={22} color="#556B2F" />
//                                     </Box>
//                                     <Box flex={1}>
//                                         {isEditing ? (
//                                             <TextField fullWidth label="Full Name" value={editData.name} onChange={handleInputChange('name')} size="small" />
//                                         ) : (
//                                             <>
//                                                 <Typography variant="caption" color="#857466">Full Name</Typography>
//                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">{profileData.name}</Typography>
//                                             </>
//                                         )}
//                                     </Box>
//                                 </Stack>

//                                 {/* Email */}
//                                 <Stack direction="row" spacing={2} alignItems="center">
//                                     <Box sx={{ bgcolor: '#F4F0E5', p: 1.5, borderRadius: 2 }}>
//                                         <Mail size={22} color="#556B2F" />
//                                     </Box>
//                                     <Box flex={1}>
//                                         {isEditing ? (
//                                             <TextField fullWidth label="Email" value={editData.email} onChange={handleInputChange('email')} size="small" />
//                                         ) : (
//                                             <>
//                                                 <Typography variant="caption" color="#857466">Email Address</Typography>
//                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">{profileData.email}</Typography>
//                                             </>
//                                         )}
//                                     </Box>
//                                 </Stack>

//                                 {/* Phone */}
//                                 <Stack direction="row" spacing={2} alignItems="center">
//                                     <Box sx={{ bgcolor: '#F4F0E5', p: 1.5, borderRadius: 2 }}>
//                                         <Phone size={22} color="#556B2F" />
//                                     </Box>
//                                     <Box flex={1}>
//                                         {isEditing ? (
//                                             <TextField fullWidth label="Phone" value={editData.phone} onChange={handleInputChange('phone')} size="small" />
//                                         ) : (
//                                             <>
//                                                 <Typography variant="caption" color="#857466">Phone Number</Typography>
//                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">{profileData.phone}</Typography>
//                                             </>
//                                         )}
//                                     </Box>
//                                 </Stack>

//                                 {/* Location */}
//                                 <Stack direction="row" spacing={2} alignItems="center">
//                                     <Box sx={{ bgcolor: '#F4F0E5', p: 1.5, borderRadius: 2 }}>
//                                         <MapPin size={22} color="#556B2F" />
//                                     </Box>
//                                     <Box flex={1}>
//                                         {isEditing ? (
//                                             <TextField fullWidth label="Location" value={editData.location} onChange={handleInputChange('location')} size="small" />
//                                         ) : (
//                                             <>
//                                                 <Typography variant="caption" color="#857466">Location</Typography>
//                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">{profileData.location}</Typography>
//                                             </>
//                                         )}
//                                     </Box>
//                                 </Stack>
//                             </Stack>
//                         </CardContent>
//                     </Card>
//                 </Grid>

//                 {/* Right Column: Professional Details */}
//                 <Grid item xs={12} md={6}>
//                     <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#FFFFFF', border: '2px solid #D6D2C4', height: '100%' }}>
//                         <CardContent sx={{ p: 4 }}>
//                             <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
//                                 Professional Details
//                             </Typography>
//                             <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

//                             <Stack spacing={3}>
//                                 {/* Department */}
//                                 <Stack direction="row" spacing={2} alignItems="center">
//                                     <Box sx={{ bgcolor: '#F4F0E5', p: 1.5, borderRadius: 2 }}>
//                                         <Briefcase size={22} color="#556B2F" />
//                                     </Box>
//                                     <Box flex={1}>
//                                         {isEditing ? (
//                                             <TextField fullWidth label="Department" value={editData.department} onChange={handleInputChange('department')} size="small" />
//                                         ) : (
//                                             <>
//                                                 <Typography variant="caption" color="#857466">Department</Typography>
//                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">{profileData.department}</Typography>
//                                             </>
//                                         )}
//                                     </Box>
//                                 </Stack>

//                                 {/* Join Date */}
//                                 <Stack direction="row" spacing={2} alignItems="center">
//                                     <Box sx={{ bgcolor: '#F4F0E5', p: 1.5, borderRadius: 2 }}>
//                                         <Calendar size={22} color="#556B2F" />
//                                     </Box>
//                                     <Box flex={1}>
//                                         <Typography variant="caption" color="#857466">Join Date</Typography>
//                                         <Typography variant="body1" fontWeight={600} color="#5C3D2E">{profileData.joinDate}</Typography>
//                                     </Box>
//                                 </Stack>

//                                 {/* Experience */}
//                                 <Stack direction="row" spacing={2} alignItems="center">
//                                     <Box sx={{ bgcolor: '#F4F0E5', p: 1.5, borderRadius: 2 }}>
//                                         <Clock size={22} color="#556B2F" />
//                                     </Box>
//                                     <Box flex={1}>
//                                         {isEditing ? (
//                                             <TextField fullWidth label="Experience" value={editData.experience} onChange={handleInputChange('experience')} size="small" />
//                                         ) : (
//                                             <>
//                                                 <Typography variant="caption" color="#857466">Experience</Typography>
//                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">{profileData.experience}</Typography>
//                                             </>
//                                         )}
//                                     </Box>
//                                 </Stack>

//                                 {/* Certifications */}
//                                 <Stack direction="row" spacing={2} alignItems="center">
//                                     <Box sx={{ bgcolor: '#F4F0E5', p: 1.5, borderRadius: 2 }}>
//                                         <Award size={22} color="#556B2F" />
//                                     </Box>
//                                     <Box flex={1}>
//                                         {isEditing ? (
//                                             <TextField fullWidth label="Certifications" value={editData.certifications} onChange={handleInputChange('certifications')} size="small" />
//                                         ) : (
//                                             <>
//                                                 <Typography variant="caption" color="#857466">Certifications</Typography>
//                                                 <Typography variant="body1" fontWeight={600} color="#5C3D2E">{profileData.certifications}</Typography>
//                                             </>
//                                         )}
//                                     </Box>
//                                 </Stack>
//                             </Stack>
//                         </CardContent>
//                     </Card>
//                 </Grid>

//                 {/* Full Width Bio */}
//                 <Grid item xs={12}>
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
//                                     sx={{ mt: 2 }}
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
//                 <Box sx={{ textAlign: "center", mt: 4 }}>
//                     <Button
//                         variant="outlined"
//                         onClick={handleCancel}
//                         sx={{
//                             color: '#5C3D2E',
//                             borderColor: '#D6D2C4',
//                             textTransform: 'none',
//                             fontWeight: 600,
//                             px: 5,
//                             py: 1.5,
//                             '&:hover': { borderColor: '#5C3D2E', bgcolor: '#F4F0E5' },
//                         }}
//                     >
//                         Cancel Changes
//                     </Button>
//                 </Box>
//             )}

//             {/* Image Upload Dialog */}
//             <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="xs" fullWidth>
//                 <DialogTitle sx={{ bgcolor: '#5C3D2E', color: '#EFEAD8', fontWeight: 700 }}>
//                     Update Profile Picture
//                     <IconButton onClick={() => setOpenImageDialog(false)} sx={{ position: 'absolute', right: 8, top: 8, color: '#EFEAD8' }}>
//                         <X />
//                     </IconButton>
//                 </DialogTitle>
//                 <DialogContent sx={{ bgcolor: '#EFE7DA', p: 4 }}>
//                     <Stack spacing={3} alignItems="center">
//                         <Box
//                             sx={{
//                                 width: '100%',
//                                 height: 200,
//                                 border: '3px dashed #D6D2C4',
//                                 borderRadius: 3,
//                                 bgcolor: 'white',
//                                 display: 'flex',
//                                 flexDirection: 'column',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 cursor: 'pointer',
//                                 transition: '0.3s',
//                                 '&:hover': { borderColor: '#556B2F', bgcolor: '#F4F0E5' },
//                             }}
//                         >
//                             <Camera size={50} color="#857466" />
//                             <Typography variant="body1" color="#857466" mt={2}>Click to upload</Typography>
//                             <Typography variant="caption" color="#857466">PNG, JPG up to 5MB</Typography>
//                         </Box>
//                         <Button fullWidth variant="contained" sx={{ bgcolor: '#5C3D2E', py: 1.5 }}>
//                             Upload Image
//                         </Button>
//                     </Stack>
//                 </DialogContent>
//             </Dialog>
//         </Box>
//     );
// }

// export default AdminProfile;

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
} from "lucide-react";
import { toast } from "react-toastify";
import profileService from "../../services/profileService";

function AdminProfile() {
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
        department: "",
        address: "",
        location: "",
        joinDate: "",
        experience: "",
        certifications: "",
        bio: "",
        profilePicture: "",
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
                    department: data.department || "",
                    address: data.address || "",
                    location: data.address || "",
                    joinDate: formatDate(data.joiningDate),
                    experience: data.experience ? `${data.experience} Years` : "",
                    certifications: Array.isArray(data.certifications) ? data.certifications.join(", ") : (data.certifications || ""),
                    bio: data.bio || "",
                    profilePicture: data.profilePicture || "",
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
                department: editData.department,
                experience: editData.experience ? parseInt(editData.experience) : undefined,
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

    const stats = [
        { label: 'Patients Managed', value: '1,250+', icon: User, color: '#556B2F' },
        { label: 'Active Cases', value: '48', icon: Briefcase, color: '#6A8E3F' },
        { label: 'Response Time', value: '< 2hrs', icon: Clock, color: '#E8A84E' },
        { label: 'Certifications', value: '4', icon: Award, color: '#4E7BA8' },
    ];

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
                                        icon={<Shield size={16} />}
                                        label={profileData.role}
                                        sx={{
                                            bgcolor: 'rgba(239, 234, 216, 0.2)',
                                            color: '#EFEAD8',
                                            fontWeight: 600,
                                            border: '1px solid rgba(239, 234, 216, 0.3)',
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

                {/* Professional Information */}
                <Grid2 size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#FFFFFF', border: '2px solid #D6D2C4', height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight={700} color="#5C3D2E" gutterBottom>
                                Professional Details
                            </Typography>
                            <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

                            <Stack spacing={3}>
                                {[
                                    { icon: Briefcase, label: "Department", field: "department" },
                                    { icon: Calendar, label: "Join Date", field: "joinDate", editable: false },
                                    { icon: Clock, label: "Experience", field: "experience" },
                                    { icon: Award, label: "Certifications", field: "certifications" },
                                ].map(({ icon: Icon, label, field, editable = true }) => (
                                    <Stack key={field} direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ bgcolor: '#F4F0E5', p: 1, borderRadius: 2 }}>
                                            <Icon size={20} color="#556B2F" />
                                        </Box>
                                        <Box flex={1}>
                                            {isEditing && editable ? (
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
                                Professional Bio
                            </Typography>
                            <Divider sx={{ my: 2, borderColor: '#D6D2C4' }} />

                            {isEditing ? (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={editData.bio}
                                    onChange={handleInputChange('bio')}
                                    placeholder="Write your professional bio..."
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

export default AdminProfile;