// import React, { useState } from "react";
// import {
//     Card,
//     Typography,
//     TextField,
//     Box,
//     MenuItem,
//     Button,
// } from "@mui/material";

// function AddMember({ onCancel = () => { }, onSubmit = () => { } }) {
//     const [formData, setFormData] = useState({
//         fullName: "",
//         relation: "",
//         phone: "",
//         dob: "",
//         gender: "",
//     });

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const handleSubmit = () => {
//         onSubmit(formData);
//     };

//     return (
//         <Card
//             sx={{
//                 width: "600px",
//                 padding: 4,
//                 borderRadius: "20px",
//                 background: "var(--color-bg-card)",
//                 boxShadow: "var(--shadow-medium)",
//                 border: "1px solid var(--color-border)",
//             }}
//         >
//             {/* Heading */}
//             <Typography
//                 variant="h6"
//                 sx={{
//                     fontWeight: 700,
//                     mb: 3,
//                     color: "var(--color-text-dark)",
//                 }}
//             >
//                 Add New Family Member
//             </Typography>

//             {/* Form Grid */}
//             <Box
//                 sx={{
//                     display: "grid",
//                     gridTemplateColumns: "1fr 1fr",
//                     gap: 3,
//                 }}
//             >
//                 {/* Full Name */}
//                 <TextField
//                     label="Full Name"
//                     name="fullName"
//                     value={formData.fullName}
//                     onChange={handleChange}
//                     fullWidth
//                     size="small"
//                     sx={{
//                         "& .MuiOutlinedInput-root": {
//                             background: "var(--color-white)",
//                         },
//                     }}
//                 />

//                 {/* Relation */}
//                 <TextField
//                     select
//                     label="Relation"
//                     name="relation"
//                     value={formData.relation}
//                     onChange={handleChange}
//                     fullWidth
//                     size="small"
//                 >
//                     <MenuItem value="Spouse">Spouse</MenuItem>
//                     <MenuItem value="Father">Father</MenuItem>
//                     <MenuItem value="Mother">Mother</MenuItem>
//                     <MenuItem value="Daughter">Daughter</MenuItem>
//                     <MenuItem value="Son">Son</MenuItem>
//                 </TextField>

//                 {/* Phone Number */}
//                 <TextField
//                     label="Phone Number"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     fullWidth
//                     size="small"
//                 />

//                 {/* Date of Birth */}
//                 <TextField
//                     label="Date of Birth"
//                     name="dob"
//                     type="date"
//                     value={formData.dob}
//                     onChange={handleChange}
//                     fullWidth
//                     size="small"
//                     InputLabelProps={{ shrink: true }}
//                 />

//                 {/* Gender */}
//                 <TextField
//                     select
//                     label="Gender"
//                     name="gender"
//                     value={formData.gender}
//                     onChange={handleChange}
//                     fullWidth
//                     size="small"
//                     sx={{ gridColumn: "span 2" }}
//                 >
//                     <MenuItem value="Male">Male</MenuItem>
//                     <MenuItem value="Female">Female</MenuItem>
//                     <MenuItem value="Other">Other</MenuItem>
//                 </TextField>
//             </Box>

//             {/* Buttons */}
//             <Box
//                 sx={{
//                     display: "flex",
//                     justifyContent: "flex-end",
//                     gap: 2,
//                     mt: 4,
//                 }}
//             >
//                 <Button
//                     variant="outlined"
//                     onClick={onCancel}
//                     sx={{
//                         color: "var(--color-error)",
//                         borderColor: "var(--color-error)",
//                         textTransform: "none",
//                         "&:hover": {
//                             borderColor: "var(--color-error)",
//                             background: "rgba(181,69,69,0.06)",
//                         },
//                     }}
//                 >
//                     Cancel
//                 </Button>

//                 <Button
//                     variant="contained"
//                     onClick={handleSubmit}
//                     sx={{
//                         textTransform: "none",
//                         background: "var(--color-success)",
//                         "&:hover": {
//                             background: "var(--color-primary-dark)",
//                         },
//                     }}
//                 >
//                     Add Member
//                 </Button>
//             </Box>
//         </Card>
//     );
// }

// export default AddMember;


import React, { useState } from "react";
import {
    Card,
    Typography,
    TextField,
    Box,
    MenuItem,
    Button,
} from "@mui/material";

function AddMember({ onCancel = () => { }, onSubmit = () => { } }) {
    const [formData, setFormData] = useState({
        fullName: "",
        relation: "",
        phone: "",
        dob: "",
        gender: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <Card
            sx={{
                width: "600px",
                padding: 4,
                borderRadius: "20px",
                background: "var(--color-bg-card)",
                boxShadow: "var(--shadow-medium)",
                border: "1px solid var(--color-border)",
            }}
        >
            {/* Heading */}
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    mb: 3,
                    color: "var(--color-text-dark)",
                }}
            >
                Add New Family Member
            </Typography>

            {/* Form Grid */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 3,
                }}
            >
                <TextField
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    size="small"
                />

                <TextField
                    select
                    label="Relation"
                    name="relation"
                    value={formData.relation}
                    onChange={handleChange}
                    size="small"
                >
                    <MenuItem value="Spouse">Spouse</MenuItem>
                    <MenuItem value="Father">Father</MenuItem>
                    <MenuItem value="Mother">Mother</MenuItem>
                    <MenuItem value="Daughter">Daughter</MenuItem>
                    <MenuItem value="Son">Son</MenuItem>
                </TextField>

                <TextField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    size="small"
                />

                <TextField
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    select
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    size="small"
                    sx={{ gridColumn: "span 2" }}
                >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </TextField>
            </Box>

            {/* Buttons */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 4,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={onCancel}
                    sx={{
                        color: "var(--color-error)",
                        borderColor: "var(--color-error)",
                        textTransform: "none",
                        "&:hover": {
                            background: "rgba(181,69,69,0.06)",
                            borderColor: "var(--color-error)",
                        },
                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={() => onSubmit(formData)}
                    sx={{
                        textTransform: "none",
                        background: "var(--color-success)",
                        "&:hover": { background: "var(--color-primary-dark)" },
                    }}
                >
                    Add Member
                </Button>
            </Box>
        </Card>
    );
}

export default AddMember;
