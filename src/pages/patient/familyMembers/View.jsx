// import React, { useState } from "react";
// import {
//     Box,
//     Typography,
//     Card,
//     CardContent,
//     Chip,
//     Button,
//     Stack,
//     Avatar,
//     Grid,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     TextField,
//     MenuItem,
//     IconButton,
//     Divider,
// } from "@mui/material";
// import {
//     PeopleAlt,
//     Add,
//     Close,
//     Male,
//     Female,
//     Transgender,
// } from "@mui/icons-material";

// const Family_Members_View = () => {
//     const [familyMembers, setFamilyMembers] = useState([
//         { id: 1, name: "Rajesh Sharma", relation: "Self", age: 42, gender: "Male", avatar: "R", color: "#9CAF88" },
//         { id: 2, name: "Priya Sharma", relation: "Spouse", age: 38, gender: "Female", avatar: "P", color: "#F2E8C6" },
//         { id: 3, name: "Aarav Sharma", relation: "Son", age: 12, gender: "Male", avatar: "A", color: "#6A8E3F" },
//         { id: 4, name: "Sharavni", relation: "Daughter", age: 8, gender: "Female", avatar: "S", color: "#E8A84E" },
//     ]);

//     const [open, setOpen] = useState(false);
//     const [formData, setFormData] = useState({ name: "", relation: "", age: "", gender: "" });

//     const handleOpen = () => setOpen(true);
//     const handleClose = () => {
//         setOpen(false);
//         setFormData({ name: "", relation: "", age: "", gender: "" });
//     };

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = () => {
//         if (!formData.name || !formData.relation || !formData.age || !formData.gender) return;

//         const newMember = {
//             id: Date.now(),
//             name: formData.name,
//             relation: formData.relation,
//             age: parseInt(formData.age),
//             gender: formData.gender,
//             avatar: formData.name.charAt(0).toUpperCase(),
//             color: formData.gender === "Male" ? "#9CAF88" : formData.gender === "Female" ? "#F2E8C6" : "#E8A84E",
//         };

//         setFamilyMembers([...familyMembers, newMember]);
//         handleClose();
//     };

//     const getGenderIcon = (gender) => {
//         const iconStyle = { fontSize: 18 };
//         switch (gender) {
//             case "Male": return <Male sx={{ ...iconStyle, color: "#556B2F" }} />;
//             case "Female": return <Female sx={{ ...iconStyle, color: "#B54545" }} />;
//             default: return <Transgender sx={{ ...iconStyle, color: "#7b1fa2" }} />;
//         }
//     };

//     return (
//         <Box sx={{ minHeight: "100vh", backgroundColor: "#EFE7DA", p: { xs: 2, md: 4 } }}>
//             {/* Header */}
//             <Box sx={{ mb: 5, display: "flex", alignItems: "center", gap: 3 }}>
//                 <Chip
//                     icon={<PeopleAlt sx={{ color: "#556B2F !important" }} />}
//                     label="Total Family Members"
//                     sx={{
//                         bgcolor: "#F2E8C6",
//                         color: "#5C3D2E",
//                         fontWeight: 700,
//                         fontSize: "1.1rem",
//                         height: 48,
//                         borderRadius: 24,
//                         px: 2,
//                     }}
//                 />
//                 <Typography variant="h3" sx={{ fontWeight: 800, color: "#556B2F" }}>
//                     {familyMembers.length}
//                 </Typography>
//             </Box>

//             {/* Main Card */}
//             <Card sx={{ borderRadius: 4, boxShadow: "0 8px 30px rgba(92, 61, 46, 0.1)", border: "1px solid #D6D2C4" }}>
//                 <CardContent sx={{ p: { xs: 3, md: 5 } }}>
//                     <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
//                         <Typography variant="h5" sx={{ fontWeight: 700, color: "#5C3D2E" }}>
//                             Family Profiles
//                         </Typography>
//                         <Button
//                             variant="contained"
//                             startIcon={<Add />}
//                             onClick={handleOpen}
//                             sx={{
//                                 bgcolor: "#5C3D2E",           // ← Your requested button color
//                                 color: "white",
//                                 fontWeight: 700,
//                                 px: 4,
//                                 py: 1.5,
//                                 borderRadius: 3,
//                                 textTransform: "none",
//                                 boxShadow: "0 6px 20px rgba(92, 61, 46, 0.3)",
//                                 "&:hover": { bgcolor: "#4A3025" },
//                             }}
//                         >
//                             Add New Member
//                         </Button>
//                     </Stack>

//                     <Divider sx={{ mb: 4, borderColor: "#D6D2C4" }} />

//                     {/* Family Grid */}
//                     {familyMembers.length === 0 ? (
//                         <Box sx={{ textAlign: "center", py: 10 }}>
//                             <PeopleAlt sx={{ fontSize: 90, color: "#D6D2C4", mb: 3 }} />
//                             <Typography variant="h5" color="#857466" fontWeight={600}>
//                                 No family members added yet
//                             </Typography>
//                             <Typography color="#857466" mt={1}>
//                                 Start building your family health profile
//                             </Typography>
//                         </Box>
//                     ) : (
//                         <Grid container spacing={4}>
//                             {familyMembers.map((member) => (
//                                 <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
//                                     <Card
//                                         sx={{
//                                             p: 4,
//                                             textAlign: "center",
//                                             borderRadius: 4,
//                                             border: "2px solid #E8E2D5",
//                                             transition: "all 0.3s ease",
//                                             bgcolor: "#FFFFFF",
//                                             "&:hover": {
//                                                 borderColor: "#9CAF88",
//                                                 boxShadow: "0 12px 30px rgba(92, 61, 46, 0.15)",
//                                                 transform: "translateY(-8px)",
//                                             },
//                                         }}
//                                     >
//                                         <Avatar
//                                             sx={{
//                                                 width: 90,
//                                                 height: 90,
//                                                 mx: "auto",
//                                                 mb: 3,
//                                                 bgcolor: member.color,
//                                                 color: "#5C3D2E",
//                                                 fontSize: "2.2rem",
//                                                 fontWeight: 800,
//                                                 boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
//                                             }}
//                                         >
//                                             {member.avatar}
//                                         </Avatar>

//                                         <Typography variant="h6" sx={{ fontWeight: 700, color: "#5C3D2E", mb: 1 }}>
//                                             {member.name}
//                                         </Typography>
//                                         <Typography variant="body1" color="#857466" sx={{ fontWeight: 500, mb: 2 }}>
//                                             {member.relation}
//                                         </Typography>

//                                         <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
//                                             <Chip
//                                                 label={`${member.age} years`}
//                                                 size="medium"
//                                                 sx={{
//                                                     bgcolor: "#F4F0E5",
//                                                     color: "#5C3D2E",
//                                                     fontWeight: 600,
//                                                 }}
//                                             />
//                                             <Chip
//                                                 icon={getGenderIcon(member.gender)}
//                                                 label={member.gender}
//                                                 size="medium"
//                                                 sx={{
//                                                     bgcolor: member.gender === "Male" ? "#e8f5e9" : member.gender === "Female" ? "#fce4ec" : "#f3e5f5",
//                                                     color: "#5C3D2E",
//                                                     fontWeight: 600,
//                                                 }}
//                                             />
//                                         </Stack>
//                                     </Card>
//                                 </Grid>
//                             ))}
//                         </Grid>
//                     )}
//                 </CardContent>
//             </Card>

//             {/* Footer */}
//             <Typography variant="body2" align="center" color="#857466" sx={{ mt: 8, pb: 4 }}>
//                 © 2025 Utpala Ayurveda – All rights reserved.
//             </Typography>

//             {/* Add Member Modal */}
//             <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
//                 <DialogTitle sx={{ bgcolor: "#5C3D2E", color: "white", py: 3 }}>
//                     <Stack direction="row" justifyContent="space-between" alignItems="center">
//                         <Typography variant="h6" fontWeight={700}>
//                             Add New Family Member
//                         </Typography>
//                         <IconButton onClick={handleClose} sx={{ color: "white" }}>
//                             <Close />
//                         </IconButton>
//                     </Stack>
//                 </DialogTitle>
//                 <DialogContent sx={{ pt: 4 }}>
//                     <Grid container spacing={3}>
//                         <Grid item xs={12}>
//                             <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
//                         </Grid>
//                         <Grid item xs={12} sm={6}>
//                             <TextField fullWidth select label="Relation" name="relation" value={formData.relation} onChange={handleChange} required>
//                                 {["Self", "Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other"].map((rel) => (
//                                     <MenuItem key={rel} value={rel}>{rel}</MenuItem>
//                                 ))}
//                             </TextField>
//                         </Grid>
//                         <Grid item xs={12} sm={6}>
//                             <TextField fullWidth label="Age" name="age" type="number" value={formData.age} onChange={handleChange} required />
//                         </Grid>
//                         <Grid item xs={12}>
//                             <TextField fullWidth select label="Gender" name="gender" value={formData.gender} onChange={handleChange} required>
//                                 <MenuItem value="Male">Male</MenuItem>
//                                 <MenuItem value="Female">Female</MenuItem>
//                                 <MenuItem value="Other">Other</MenuItem>
//                             </TextField>
//                         </Grid>
//                         <Grid item xs={12}>
//                             <Button
//                                 fullWidth
//                                 variant="contained"
//                                 size="large"
//                                 onClick={handleSubmit}
//                                 sx={{
//                                     bgcolor: "#5C3D2E",           // ← Your requested button color
//                                     py: 2,
//                                     fontSize: "1.1rem",
//                                     fontWeight: 700,
//                                     borderRadius: 3,
//                                     "&:hover": { bgcolor: "#4A3025" },
//                                 }}
//                             >
//                                 Add Member
//                             </Button>
//                         </Grid>
//                     </Grid>
//                 </DialogContent>
//             </Dialog>
//         </Box>
//     );
// };

// // export default Family_Members_View;
// import React from "react";
// import HeadingCard from "../../../components/card/HeadingCard";
// import FamilyMemberCard from "../../../components/card/patientCard/FamilyMammberCard";
// import { Box, Typography } from "@mui/material";
// import RedirectButton from "../../../components/buttons/RedirectButton";

// function Family_Members_View() {
//     // Example Family Member Data — you can replace with API later
//     const familyMembers = [
//         {
//             id: 1,
//             name: "Riya",
//             relation: "Daughter",
//             phone: "1234567890",
//             dob: "2022-02-23",
//             gender: "Female",
//         },
//         {
//             id: 2,
//             name: "John",
//             relation: "Father",
//             phone: "9876543210",
//             dob: "1975-10-12",
//             gender: "Male",
//         },
//         {
//             id: 3,
//             name: "Sara",
//             relation: "Mother",
//             phone: "8975463210",
//             dob: "1980-03-18",
//             gender: "Female",
//         },
//     ];

//     return (
//         <div style={{ paddingBottom: "30px" }}>

//             {/* Heading Section */}
//             <HeadingCard
//                 title="Your Family Members"
//                 subtitle="Manage and view your registered family members easily.  
//                 Keep their details updated to help doctors provide better care."
//             />


//             <Box
//                 sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     mt: 3,
//                     mb: 2,
//                     mx: 1,
//                 }}
//             >
//                 <Typography
//                     variant="h6"
//                     sx={{
//                         fontWeight: 700,
//                         color: "var(--color-text-dark)",
//                     }}
//                 >
//                     Family Profiles
//                 </Typography>

//                 <RedirectButton
//                     text="View All"
//                     link="/patient/family-members"   // ⭐ Navigate to Family Members Page
//                     sx={{
//                         background: "var(--color-primary)",
//                         padding: "6px 16px",
//                         borderRadius: "8px",
//                     }}
//                 />
//             </Box>
//             {/* Family Member Cards Grid */}
//             <Box
//                 sx={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
//                     gap: 2,
//                 }}
//             >
//                 {familyMembers.map((member) => (
//                     <FamilyMemberCard
//                         key={member.id}
//                         name={member.name}
//                         relation={member.relation}
//                         phone={member.phone}
//                         dob={member.dob}
//                         gender={member.gender}
//                     />
//                 ))}
//             </Box>

//         </div>
//     );
// }

// export default Family_Members_View;


import React, { useState } from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import FamilyMemberCard from "../../../components/card/patientCard/FamilyMammberCard";
import RedirectButton from "../../../components/buttons/RedirectButton";

// import AddMember from "../../../components/card/patientCard/AddMember";

import { Box, Typography, Modal } from "@mui/material";
import AddMember from "../../../components/card/patientCard/AddMember";

function Family_Members_View() {
    // Popup modal state
    const [openAdd, setOpenAdd] = useState(false);

    // Example Family Member Data
    const familyMembers = [
        {
            id: 1,
            name: "Riya",
            relation: "Daughter",
            phone: "1234567890",
            dob: "2022-02-23",
            gender: "Female",
        },
        {
            id: 2,
            name: "John",
            relation: "Father",
            phone: "9876543210",
            dob: "1975-10-12",
            gender: "Male",
        },
        {
            id: 3,
            name: "Sara",
            relation: "Mother",
            phone: "8975463210",
            dob: "1980-03-18",
            gender: "Female",
        },
    ];

    return (
        <div style={{ paddingBottom: "30px" }}>

            {/* Heading Section */}
            <HeadingCard
                title="Your Family Members"
                subtitle="Manage and view your registered family members easily.  
                Keep their details updated to help doctors provide better care."
            />

            {/* Section Title with Button */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 3,
                    mb: 2,
                    mx: 1,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: "var(--color-text-dark)",
                    }}
                >
                    Family Profiles
                </Typography>

                {/* Add Member Button */}
                <RedirectButton
                    text="Add Member"
                    onClick={() => setOpenAdd(true)}
                    sx={{
                        background: "var(--color-primary)",
                        borderRadius: "8px",
                        padding: "6px 16px",
                    }}
                />
            </Box>

            {/* Family Member Cards Grid */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: 2,
                }}
            >
                {familyMembers.map((member) => (
                    <FamilyMemberCard
                        key={member.id}
                        name={member.name}
                        relation={member.relation}
                        phone={member.phone}
                        dob={member.dob}
                        gender={member.gender}
                    />
                ))}
            </Box>

            {/* Add Member Modal */}
            <Modal open={openAdd} onClose={() => setOpenAdd(false)}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        padding: 2,
                    }}
                >
                    <AddMember
                        onCancel={() => setOpenAdd(false)}
                        onSubmit={(data) => {
                            console.log("New Member Submitted:", data);
                            setOpenAdd(false);
                        }}
                    />
                </Box>
            </Modal>
        </div>
    );
}

export default Family_Members_View;
