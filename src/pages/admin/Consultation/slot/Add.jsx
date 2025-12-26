// import React, { useState } from "react";
// import { Box, Button, TextField, IconButton, Typography, Chip, Grid, Paper } from "@mui/material";
// import { Add as AddIcon, Delete as DeleteIcon, Search as SearchIcon } from "@mui/icons-material";
// import HeadingCard from "../../../../components/card/HeadingCard";
// import SubmitButton from "../../../../components/buttons/SubmitButton";

// const doctorsList = [
//     { id: "1", name: "Dr. Anil Kumar" },
//     { id: "2", name: "Dr. Priya Sharma" },
//     { id: "3", name: "Dr. Ravi Verma" },
//     { id: "4", name: "Dr. Sneha Das" },
// ];

// const weekDays = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
// ];

// function Slot_Add() {
//     const [search, setSearch] = useState("");
//     const [selectedDoctor, setSelectedDoctor] = useState(null);
//     const [showDropdown, setShowDropdown] = useState(false);

//     const [selectedDays, setSelectedDays] = useState([]);
//     const [daySlots, setDaySlots] = useState({}); // { day: [{startTime, endTime}, ...] }

//     // Initialize slots for a day if not present
//     const getSlotsForDay = (day) => daySlots[day] || [];

//     // 🔍 Filter doctors
//     const filteredDoctors = doctorsList.filter(doc =>
//         doc.name.toLowerCase().includes(search.toLowerCase())
//     );

//     // ✅ Select ONLY ONE doctor
//     const selectDoctor = (doctor) => {
//         setSelectedDoctor(doctor);
//         setSearch("");
//         setShowDropdown(false);
//     };

//     // Toggle weekday
//     const toggleDay = (day) => {
//         if (selectedDays.includes(day)) {
//             setSelectedDays(selectedDays.filter(d => d !== day));
//             // Optionally remove slots for deselected day
//             setDaySlots(prev => {
//                 const newSlots = { ...prev };
//                 delete newSlots[day];
//                 return newSlots;
//             });
//         } else {
//             setSelectedDays([...selectedDays, day]);
//             // Initialize empty slots for new day
//             if (!daySlots[day]) {
//                 setDaySlots(prev => ({ ...prev, [day]: [] }));
//             }
//         }
//     };

//     // Add new time slot for a specific day
//     const addTimeSlot = (day) => {
//         setDaySlots(prev => ({
//             ...prev,
//             [day]: [...(getSlotsForDay(day)), { startTime: "", endTime: "" }]
//         }));
//     };

//     // Remove time slot for a specific day and index
//     const removeTimeSlot = (day, index) => {
//         const slots = getSlotsForDay(day);
//         if (slots.length > 1) {
//             setDaySlots(prev => ({
//                 ...prev,
//                 [day]: slots.filter((_, i) => i !== index)
//             }));
//         }
//     };

//     // Update time slot for a specific day and index
//     const updateTimeSlot = (day, index, field, value) => {
//         setDaySlots(prev => ({
//             ...prev,
//             [day]: prev[day].map((slot, i) =>
//                 i === index ? { ...slot, [field]: value } : slot
//             )
//         }));
//     };

//     // Submit
//     const handleSubmit = () => {
//         if (!selectedDoctor) {
//             alert("Please select a doctor");
//             return;
//         }

//         if (!selectedDays.length) {
//             alert("Please select at least one day");
//             return;
//         }

//         // Validate each day's slots
//         for (const day of selectedDays) {
//             const slots = getSlotsForDay(day);
//             if (slots.length === 0) {
//                 alert(`Please add at least one time slot for ${day}`);
//                 return;
//             }
//             for (let i = 0; i < slots.length; i++) {
//                 const { startTime, endTime } = slots[i];
//                 if (!startTime || !endTime) {
//                     alert(`Please select start and end time for slot ${i + 1} on ${day}`);
//                     return;
//                 }
//                 if (startTime >= endTime) {
//                     alert(`End time must be greater than start time for slot ${i + 1} on ${day}`);
//                     return;
//                 }
//             }
//         }

//         const payload = {
//             doctorId: selectedDoctor.id,
//             availability: selectedDays.reduce((acc, day) => {
//                 acc[day] = getSlotsForDay(day);
//                 return acc;
//             }, {}),
//         };

//         console.log("SUBMITTED PAYLOAD 👉", payload);
//         alert("Doctor availability saved successfully");
//     };

//     return (
//         <Box sx={{ p: 3 }}>
//             {/* HEADER */}
//             <HeadingCard
//                 title="Doctor Slot Availability"
//                 subtitle="Select a doctor, choose working days, and define day-wise consultation time slots."
//                 breadcrumbItems={[
//                     { label: "Admin", path: "/admin/dashboard" },
//                     { label: "Consultation Slots", path: "/admin/consultation/slots" },
//                     { label: "Add Slot" },
//                 ]}
//             />

//             {/* MAIN CARD */}
//             <Paper
//                 elevation={3}
//                 sx={{
//                     p: 4,
//                     mt: 3,
//                     borderRadius: 2,
//                     backgroundColor: "var(--color-bg-card, #fff)",
//                 }}
//             >
//                 {/* DOCTOR SELECT */}
//                 <Box sx={{ mb: 4 }}>
//                     <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
//                         Select Doctor
//                     </Typography>

//                     <TextField
//                         fullWidth
//                         placeholder="Search doctor..."
//                         value={selectedDoctor ? selectedDoctor.name : search}
//                         onChange={(e) => {
//                             setSearch(e.target.value);
//                             setSelectedDoctor(null); // allow re-search
//                             setShowDropdown(true);
//                         }}
//                         onFocus={() => setShowDropdown(true)}
//                         InputProps={{
//                             startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
//                         }}
//                         sx={{ mb: 1 }}
//                     />

//                     {/* DROPDOWN */}
//                     {showDropdown && !selectedDoctor && (
//                         <Paper
//                             sx={{
//                                 position: "absolute",
//                                 zIndex: 1,
//                                 maxHeight: 160,
//                                 overflow: "auto",
//                                 width: "100%",
//                             }}
//                             elevation={1}
//                         >
//                             {filteredDoctors.length > 0 ? (
//                                 filteredDoctors.map(doc => (
//                                     <Box
//                                         key={doc.id}
//                                         onClick={() => selectDoctor(doc)}
//                                         sx={{
//                                             p: 2,
//                                             cursor: "pointer",
//                                             "&:hover": { bgcolor: "action.hover" },
//                                         }}
//                                     >
//                                         <Typography variant="body1">{doc.name}</Typography>
//                                     </Box>
//                                 ))
//                             ) : (
//                                 <Box sx={{ p: 2 }}>
//                                     <Typography variant="body2" color="text.secondary">
//                                         No doctors found
//                                     </Typography>
//                                 </Box>
//                             )}
//                         </Paper>
//                     )}

//                     {/* CHANGE DOCTOR */}
//                     {selectedDoctor && (
//                         <Button
//                             onClick={() => {
//                                 setSelectedDoctor(null);
//                                 setSearch("");
//                                 setShowDropdown(true);
//                             }}
//                             size="small"
//                             color="error"
//                         >
//                             Change Doctor
//                         </Button>
//                     )}
//                 </Box>

//                 {/* WEEK DAY SELECTION */}
//                 <Box sx={{ mb: 4 }}>
//                     <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
//                         Available Days
//                     </Typography>

//                     <Grid container spacing={1}>
//                         {weekDays.map(day => {
//                             const active = selectedDays.includes(day);
//                             return (
//                                 <Grid item key={day}>
//                                     <Chip
//                                         label={day}
//                                         onClick={() => toggleDay(day)}
//                                         color={active ? "success" : "default"}
//                                         variant={active ? "filled" : "outlined"}
//                                         clickable
//                                         sx={{ cursor: "pointer" }}
//                                     />
//                                 </Grid>
//                             );
//                         })}
//                     </Grid>
//                     {selectedDays.length > 0 && (
//                         <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//                             Selected: {selectedDays.join(", ")}
//                         </Typography>
//                     )}
//                 </Box>

//                 {/* DAY-WISE TIME SLOTS */}
//                 {selectedDays.length > 0 && (
//                     <Box sx={{ mb: 4 }}>
//                         <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
//                             Day-Wise Time Slots
//                         </Typography>
//                         {selectedDays.map(day => (
//                             <Paper
//                                 key={day}
//                                 elevation={2}
//                                 sx={{ p: 3, mb: 3, borderRadius: 2 }}
//                             >
//                                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//                                     <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                                         {day}
//                                     </Typography>
//                                     <Button
//                                         variant="outlined"
//                                         startIcon={<AddIcon />}
//                                         onClick={() => addTimeSlot(day)}
//                                         size="small"
//                                     >
//                                         Add Slot
//                                     </Button>
//                                 </Box>

//                                 {getSlotsForDay(day).length === 0 ? (
//                                     <Typography variant="body2" color="text.secondary">
//                                         No slots added yet. Click "Add Slot" to create one.
//                                     </Typography>
//                                 ) : (
//                                     getSlotsForDay(day).map((slot, index) => (
//                                         <Paper
//                                             key={index}
//                                             elevation={1}
//                                             sx={{ p: 2, mb: 2, borderRadius: 1 }}
//                                         >
//                                             <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//                                                 <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
//                                                     Slot {index + 1}
//                                                 </Typography>
//                                                 {getSlotsForDay(day).length > 1 && (
//                                                     <IconButton
//                                                         onClick={() => removeTimeSlot(day, index)}
//                                                         color="error"
//                                                         size="small"
//                                                     >
//                                                         <DeleteIcon />
//                                                     </IconButton>
//                                                 )}
//                                             </Box>

//                                             <Grid container spacing={2}>
//                                                 <Grid item xs={12} sm={5}>
//                                                     <TextField
//                                                         fullWidth
//                                                         label="Start Time"
//                                                         type="time"
//                                                         value={slot.startTime}
//                                                         onChange={(e) => updateTimeSlot(day, index, "startTime", e.target.value)}
//                                                         inputProps={{ step: 300 }} // 5 min intervals
//                                                     />
//                                                 </Grid>
//                                                 <Grid item xs={12} sm={5}>
//                                                     <TextField
//                                                         fullWidth
//                                                         label="End Time"
//                                                         type="time"
//                                                         value={slot.endTime}
//                                                         onChange={(e) => updateTimeSlot(day, index, "endTime", e.target.value)}
//                                                         inputProps={{ step: 300 }}
//                                                     />
//                                                 </Grid>
//                                                 <Grid item xs={12} sm={2}>
//                                                     <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
//                                                         {slot.startTime && slot.endTime && slot.startTime < slot.endTime
//                                                             ? `${slot.startTime} - ${slot.endTime}`
//                                                             : "Invalid time"}
//                                                     </Typography>
//                                                 </Grid>
//                                             </Grid>
//                                         </Paper>
//                                     ))
//                                 )}
//                             </Paper>
//                         ))}
//                     </Box>
//                 )}

//                 {/* ACTION */}
//                 <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//                     <SubmitButton
//                         text="Save Availability"
//                         onClick={handleSubmit}
//                     />
//                 </Box>
//             </Paper>
//         </Box>
//     );
// }

// export default Slot_Add;



// import React, { useState } from "react";
// import { Box, Button, IconButton, Typography, Chip, Grid, Paper, TextField } from "@mui/material";
// import { Add as AddIcon, Delete as DeleteIcon, Search as SearchIcon } from "@mui/icons-material";
// import HeadingCard from "../../../../components/card/HeadingCard";
// import SubmitButton from "../../../../components/buttons/SubmitButton";
// import DashboardCard from "../../../../components/card/DashboardCard";

// const doctorsList = [
//     { id: "1", name: "Dr. Anil Kumar" },
//     { id: "2", name: "Dr. Priya Sharma" },
//     { id: "3", name: "Dr. Ravi Verma" },
//     { id: "4", name: "Dr. Sneha Das" },
// ];

// const weekDays = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
// ];

// function Slot_Add() {
//     const [search, setSearch] = useState("");
//     const [selectedDoctor, setSelectedDoctor] = useState(null);
//     const [showDropdown, setShowDropdown] = useState(false);

//     const [selectedDays, setSelectedDays] = useState([]);
//     const [daySlots, setDaySlots] = useState({}); // { day: [{startTime, endTime}, ...] }

//     // Initialize slots for a day if not present
//     const getSlotsForDay = (day) => daySlots[day] || [];

//     const totalSlots = selectedDays.reduce((acc, day) => acc + getSlotsForDay(day).length, 0);

//     // 🔍 Filter doctors
//     const filteredDoctors = doctorsList.filter(doc =>
//         doc.name.toLowerCase().includes(search.toLowerCase())
//     );

//     // ✅ Select ONLY ONE doctor
//     const selectDoctor = (doctor) => {
//         setSelectedDoctor(doctor);
//         setSearch("");
//         setShowDropdown(false);
//     };

//     // Toggle weekday
//     const toggleDay = (day) => {
//         if (selectedDays.includes(day)) {
//             setSelectedDays(selectedDays.filter(d => d !== day));
//             // Optionally remove slots for deselected day
//             setDaySlots(prev => {
//                 const newSlots = { ...prev };
//                 delete newSlots[day];
//                 return newSlots;
//             });
//         } else {
//             setSelectedDays([...selectedDays, day]);
//             // Initialize empty slots for new day
//             if (!daySlots[day]) {
//                 setDaySlots(prev => ({ ...prev, [day]: [] }));
//             }
//         }
//     };

//     // Add new time slot for a specific day
//     const addTimeSlot = (day) => {
//         setDaySlots(prev => ({
//             ...prev,
//             [day]: [...(getSlotsForDay(day)), { startTime: "", endTime: "" }]
//         }));
//     };

//     // Remove time slot for a specific day and index
//     const removeTimeSlot = (day, index) => {
//         const slots = getSlotsForDay(day);
//         if (slots.length > 1) {
//             setDaySlots(prev => ({
//                 ...prev,
//                 [day]: slots.filter((_, i) => i !== index)
//             }));
//         }
//     };

//     // Update time slot for a specific day and index
//     const updateTimeSlot = (day, index, field, value) => {
//         setDaySlots(prev => ({
//             ...prev,
//             [day]: prev[day].map((slot, i) =>
//                 i === index ? { ...slot, [field]: value } : slot
//             )
//         }));
//     };

//     // Submit
//     const handleSubmit = () => {
//         if (!selectedDoctor) {
//             alert("Please select a doctor");
//             return;
//         }

//         if (!selectedDays.length) {
//             alert("Please select at least one day");
//             return;
//         }

//         // Validate each day's slots
//         for (const day of selectedDays) {
//             const slots = getSlotsForDay(day);
//             if (slots.length === 0) {
//                 alert(`Please add at least one time slot for ${day}`);
//                 return;
//             }
//             for (let i = 0; i < slots.length; i++) {
//                 const { startTime, endTime } = slots[i];
//                 if (!startTime || !endTime) {
//                     alert(`Please select start and end time for slot ${i + 1} on ${day}`);
//                     return;
//                 }
//                 if (startTime >= endTime) {
//                     alert(`End time must be greater than start time for slot ${i + 1} on ${day}`);
//                     return;
//                 }
//             }
//         }

//         const payload = {
//             doctorId: selectedDoctor.id,
//             availability: selectedDays.reduce((acc, day) => {
//                 acc[day] = getSlotsForDay(day);
//                 return acc;
//             }, {}),
//         };

//         console.log("SUBMITTED PAYLOAD 👉", payload);
//         alert("Doctor availability saved successfully");
//     };

//     return (
//         <Box sx={{ p: 3 }}>
//             {/* HEADER */}
//             <HeadingCard
//                 title="Doctor Slot Availability"
//                 subtitle="Select a doctor, choose working days, and define day-wise consultation time slots."
//                 breadcrumbItems={[
//                     { label: "Admin", path: "/admin/dashboard" },
//                     { label: "Consultation Slots", path: "/admin/consultation/slots" },
//                     { label: "Add Slot" },
//                 ]}
//             />

//             {/* MAIN CARD */}
//             <Paper
//                 elevation={3}
//                 sx={{
//                     p: 4,
//                     mt: 3,
//                     borderRadius: 2,
//                     backgroundColor: "var(--color-bg-card, #fff)",
//                 }}
//             >
//                 {/* DOCTOR SELECT */}
//                 <Box sx={{ mb: 4 }}>
//                     <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
//                         Select Doctor
//                     </Typography>

//                     <TextField
//                         fullWidth
//                         placeholder="Search doctor..."
//                         value={selectedDoctor ? selectedDoctor.name : search}
//                         onChange={(e) => {
//                             setSearch(e.target.value);
//                             setSelectedDoctor(null); // allow re-search
//                             setShowDropdown(true);
//                         }}
//                         onFocus={() => setShowDropdown(true)}
//                         InputProps={{
//                             startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
//                         }}
//                         sx={{ mb: 1 }}
//                     />

//                     {/* DROPDOWN */}
//                     {showDropdown && !selectedDoctor && (
//                         <Paper
//                             sx={{
//                                 position: "absolute",
//                                 zIndex: 1,
//                                 maxHeight: 160,
//                                 overflow: "auto",
//                                 width: "100%",
//                             }}
//                             elevation={1}
//                         >
//                             {filteredDoctors.length > 0 ? (
//                                 filteredDoctors.map(doc => (
//                                     <Box
//                                         key={doc.id}
//                                         onClick={() => selectDoctor(doc)}
//                                         sx={{
//                                             p: 2,
//                                             cursor: "pointer",
//                                             "&:hover": { bgcolor: "action.hover" },
//                                         }}
//                                     >
//                                         <Typography variant="body1">{doc.name}</Typography>
//                                     </Box>
//                                 ))
//                             ) : (
//                                 <Box sx={{ p: 2 }}>
//                                     <Typography variant="body2" color="text.secondary">
//                                         No doctors found
//                                     </Typography>
//                                 </Box>
//                             )}
//                         </Paper>
//                     )}

//                     {/* CHANGE DOCTOR */}
//                     {selectedDoctor && (
//                         <Button
//                             onClick={() => {
//                                 setSelectedDoctor(null);
//                                 setSearch("");
//                                 setShowDropdown(true);
//                             }}
//                             size="small"
//                             color="error"
//                         >
//                             Change Doctor
//                         </Button>
//                     )}
//                 </Box>

//                 {/* WEEK DAY SELECTION */}
//                 <Box sx={{ mb: 4 }}>
//                     <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
//                         Available Days
//                     </Typography>

//                     <Grid container spacing={1}>
//                         {weekDays.map(day => {
//                             const active = selectedDays.includes(day);
//                             return (
//                                 <Grid item key={day}>
//                                     <Chip
//                                         label={day}
//                                         onClick={() => toggleDay(day)}
//                                         color={active ? "success" : "default"}
//                                         variant={active ? "filled" : "outlined"}
//                                         clickable
//                                         sx={{ cursor: "pointer" }}
//                                     />
//                                 </Grid>
//                             );
//                         })}
//                     </Grid>
//                     {selectedDays.length > 0 && (
//                         <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//                             Selected: {selectedDays.join(", ")}
//                         </Typography>
//                     )}
//                 </Box>

//                 {/* DAY-WISE TIME SLOTS */}
//                 {selectedDays.length > 0 && (
//                     <Box sx={{ mb: 4 }}>
//                         <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
//                             Day-Wise Time Slots
//                         </Typography>
//                         {selectedDays.map(day => (
//                             <Paper
//                                 key={day}
//                                 elevation={2}
//                                 sx={{ p: 3, mb: 3, borderRadius: 2 }}
//                             >
//                                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//                                     <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                                         {day}
//                                     </Typography>
//                                     <Button
//                                         variant="outlined"
//                                         startIcon={<AddIcon />}
//                                         onClick={() => addTimeSlot(day)}
//                                         size="small"
//                                     >
//                                         Add Slot
//                                     </Button>
//                                 </Box>

//                                 {getSlotsForDay(day).length === 0 ? (
//                                     <Typography variant="body2" color="text.secondary">
//                                         No slots added yet. Click "Add Slot" to create one.
//                                     </Typography>
//                                 ) : (
//                                     getSlotsForDay(day).map((slot, index) => {
//                                         const startId = `start-${day}-${index}`;
//                                         const endId = `end-${day}-${index}`;
//                                         return (
//                                             <Paper
//                                                 key={index}
//                                                 elevation={1}
//                                                 sx={{ p: 2, mb: 2, borderRadius: 1 }}
//                                             >
//                                                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//                                                     <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
//                                                         Slot {index + 1}
//                                                     </Typography>
//                                                     {getSlotsForDay(day).length > 1 && (
//                                                         <IconButton
//                                                             onClick={() => removeTimeSlot(day, index)}
//                                                             color="error"
//                                                             size="small"
//                                                         >
//                                                             <DeleteIcon />
//                                                         </IconButton>
//                                                     )}
//                                                 </Box>

//                                                 <Grid container spacing={2}>
//                                                     <Grid item xs={12} sm={5}>
//                                                         <label htmlFor={startId} className="block text-sm font-medium text-gray-700 mb-1">
//                                                             Start Time
//                                                         </label>
//                                                         <input
//                                                             id={startId}
//                                                             type="time"
//                                                             value={slot.startTime}
//                                                             onChange={(e) => updateTimeSlot(day, index, "startTime", e.target.value)}
//                                                             step={300}
//                                                             className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                                         />
//                                                     </Grid>
//                                                     <Grid item xs={12} sm={5}>
//                                                         <label htmlFor={endId} className="block text-sm font-medium text-gray-700 mb-1">
//                                                             End Time
//                                                         </label>
//                                                         <input
//                                                             id={endId}
//                                                             type="time"
//                                                             value={slot.endTime}
//                                                             onChange={(e) => updateTimeSlot(day, index, "endTime", e.target.value)}
//                                                             step={300}
//                                                             className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                                         />
//                                                     </Grid>
//                                                     <Grid item xs={12} sm={2}>
//                                                         <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
//                                                             {slot.startTime && slot.endTime && slot.startTime < slot.endTime
//                                                                 ? `${slot.startTime} - ${slot.endTime}`
//                                                                 : "Invalid time"}
//                                                         </Typography>
//                                                     </Grid>
//                                                 </Grid>
//                                             </Paper>
//                                         );
//                                     })
//                                 )}
//                             </Paper>
//                         ))}
//                     </Box>
//                 )}

//                 {/* STATS CARDS */}
//                 {selectedDays.length > 0 && (
//                     <Grid container spacing={2} sx={{ mb: 4 }}>
//                         <Grid item xs={6}>
//                             <DashboardCard title="Selected Days" count={selectedDays.length} />
//                         </Grid>
//                         <Grid item xs={6}>
//                             <DashboardCard title="Total Slots" count={totalSlots} />
//                         </Grid>
//                     </Grid>
//                 )}

//                 {/* ACTION */}
//                 <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//                     <SubmitButton
//                         text="Save Availability"
//                         onClick={handleSubmit}
//                     />
//                 </Box>
//             </Paper>
//         </Box>
//     );
// }

// export default Slot_Add;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, IconButton, Typography, Chip, Grid, Paper, TextField } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, Search as SearchIcon, X } from "@mui/icons-material";
import HeadingCard from "../../../../components/card/HeadingCard";
import SubmitButton from "../../../../components/buttons/SubmitButton";
import DashboardCard from "../../../../components/card/DashboardCard";
import CancelButton from "../../../../components/buttons/CancelButton";

const doctorsList = [
    { id: "1", name: "Dr. Anil Kumar" },
    { id: "2", name: "Dr. Priya Sharma" },
    { id: "3", name: "Dr. Ravi Verma" },
    { id: "4", name: "Dr. Sneha Das" },
];

const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

function Slot_Add() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const [selectedDays, setSelectedDays] = useState([]);
    const [daySlots, setDaySlots] = useState({}); // { day: [{startTime, endTime}, ...] }

    // Initialize slots for a day if not present
    const getSlotsForDay = (day) => daySlots[day] || [];

    const totalSlots = selectedDays.reduce((acc, day) => acc + getSlotsForDay(day).length, 0);

    // 🔍 Filter doctors
    const filteredDoctors = doctorsList.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase())
    );

    // ✅ Select ONLY ONE doctor
    const selectDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setSearch("");
        setShowDropdown(false);
    };

    // Toggle weekday
    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
            // Optionally remove slots for deselected day
            setDaySlots(prev => {
                const newSlots = { ...prev };
                delete newSlots[day];
                return newSlots;
            });
        } else {
            setSelectedDays([...selectedDays, day]);
            // Initialize empty slots for new day
            if (!daySlots[day]) {
                setDaySlots(prev => ({ ...prev, [day]: [] }));
            }
        }
    };

    // Add new time slot for a specific day
    const addTimeSlot = (day) => {
        setDaySlots(prev => ({
            ...prev,
            [day]: [...(getSlotsForDay(day)), { startTime: "", endTime: "" }]
        }));
    };

    // Remove time slot for a specific day and index
    const removeTimeSlot = (day, index) => {
        const slots = getSlotsForDay(day);
        if (slots.length > 1) {
            setDaySlots(prev => ({
                ...prev,
                [day]: slots.filter((_, i) => i !== index)
            }));
        }
    };

    // Update time slot for a specific day and index
    const updateTimeSlot = (day, index, field, value) => {
        setDaySlots(prev => ({
            ...prev,
            [day]: prev[day].map((slot, i) =>
                i === index ? { ...slot, [field]: value } : slot
            )
        }));
    };

    // Submit
    const handleSubmit = () => {
        if (!selectedDoctor) {
            alert("Please select a doctor");
            return;
        }

        if (!selectedDays.length) {
            alert("Please select at least one day");
            return;
        }

        // Validate each day's slots
        for (const day of selectedDays) {
            const slots = getSlotsForDay(day);
            if (slots.length === 0) {
                alert(`Please add at least one time slot for ${day}`);
                return;
            }
            for (let i = 0; i < slots.length; i++) {
                const { startTime, endTime } = slots[i];
                if (!startTime || !endTime) {
                    alert(`Please select start and end time for slot ${i + 1} on ${day}`);
                    return;
                }
                if (startTime >= endTime) {
                    alert(`End time must be greater than start time for slot ${i + 1} on ${day}`);
                    return;
                }
            }
        }

        const payload = {
            doctorId: selectedDoctor.id,
            availability: selectedDays.reduce((acc, day) => {
                acc[day] = getSlotsForDay(day);
                return acc;
            }, {}),
        };

        console.log("SUBMITTED PAYLOAD 👉", payload);
        alert("Doctor availability saved successfully");
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* HEADER */}
            <HeadingCard
                title="Doctor Slot Availability"
                subtitle="Select a doctor, choose working days, and define day-wise consultation time slots."
                breadcrumbItems={[
                    { label: "Admin", path: "/admin/dashboard" },
                    { label: "Consultation Slots", path: "/admin/consultation/slots" },
                    { label: "Add Slot" },
                ]}
            />

            {/* MAIN CARD */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mt: 3,
                    borderRadius: 2,
                    backgroundColor: "var(--color-bg-card, #fff)",
                }}
            >
                {/* DOCTOR SELECT */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Select Doctor
                    </Typography>

                    <TextField
                        fullWidth
                        placeholder="Search doctor..."
                        value={selectedDoctor ? selectedDoctor.name : search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setSelectedDoctor(null); // allow re-search
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
                        }}
                        sx={{ mb: 1 }}
                    />

                    {/* DROPDOWN */}
                    {showDropdown && !selectedDoctor && (
                        <Paper
                            sx={{
                                position: "absolute",
                                zIndex: 1,
                                maxHeight: 160,
                                overflow: "auto",
                                width: "100%",
                            }}
                            elevation={1}
                        >
                            {filteredDoctors.length > 0 ? (
                                filteredDoctors.map(doc => (
                                    <Box
                                        key={doc.id}
                                        onClick={() => selectDoctor(doc)}
                                        sx={{
                                            p: 2,
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: "action.hover" },
                                        }}
                                    >
                                        <Typography variant="body1">{doc.name}</Typography>
                                    </Box>
                                ))
                            ) : (
                                <Box sx={{ p: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No doctors found
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    )}

                    {/* CHANGE DOCTOR */}
                    {selectedDoctor && (
                        <Button
                            onClick={() => {
                                setSelectedDoctor(null);
                                setSearch("");
                                setShowDropdown(true);
                            }}
                            size="small"
                            color="error"
                        >
                            Change Doctor
                        </Button>
                    )}
                </Box>

                {/* STATS CARDS - Moved to top after day selection */}
                {selectedDays.length > 0 && (
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={6}>
                            <DashboardCard title="Selected Days" count={selectedDays.length} />
                        </Grid>
                        <Grid item xs={6}>
                            <DashboardCard title="Total Slots" count={totalSlots} />
                        </Grid>
                    </Grid>
                )}

                {/* WEEK DAY SELECTION */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Available Days
                    </Typography>

                    <Grid container spacing={1}>
                        {weekDays.map(day => {
                            const active = selectedDays.includes(day);
                            return (
                                <Grid item key={day}>
                                    <Chip
                                        label={day}
                                        onClick={() => toggleDay(day)}
                                        color={active ? "success" : "default"}
                                        variant={active ? "filled" : "outlined"}
                                        clickable
                                        sx={{ cursor: "pointer" }}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>
                    {selectedDays.length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Selected: {selectedDays.join(", ")}
                        </Typography>
                    )}
                </Box>



                {/* DAY-WISE TIME SLOTS */}
                {selectedDays.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Day-Wise Time Slots
                        </Typography>
                        {selectedDays.map(day => (
                            <Paper
                                key={day}
                                elevation={2}
                                sx={{ p: 3, mb: 3, borderRadius: 2 }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {day}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => addTimeSlot(day)}
                                        size="small"
                                    >
                                        Add Slot
                                    </Button>
                                </Box>

                                {getSlotsForDay(day).length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No slots added yet. Click "Add Slot" to create one.
                                    </Typography>
                                ) : (
                                    getSlotsForDay(day).map((slot, index) => {
                                        const startId = `start-${day}-${index}`;
                                        const endId = `end-${day}-${index}`;
                                        return (
                                            <Paper
                                                key={index}
                                                elevation={1}
                                                sx={{ p: 2, mb: 2, borderRadius: 1 }}
                                            >
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                                        Slot {index + 1}
                                                    </Typography>
                                                    {getSlotsForDay(day).length > 1 && (
                                                        <IconButton
                                                            onClick={() => removeTimeSlot(day, index)}
                                                            color="error"
                                                            size="small"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                </Box>

                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={5}>
                                                        <label htmlFor={startId} className="block text-sm font-medium text-gray-700 mb-1">
                                                            Start Time
                                                        </label>
                                                        <input
                                                            id={startId}
                                                            type="time"
                                                            value={slot.startTime}
                                                            onChange={(e) => updateTimeSlot(day, index, "startTime", e.target.value)}
                                                            step={300}
                                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={5}>
                                                        <label htmlFor={endId} className="block text-sm font-medium text-gray-700 mb-1">
                                                            End Time
                                                        </label>
                                                        <input
                                                            id={endId}
                                                            type="time"
                                                            value={slot.endTime}
                                                            onChange={(e) => updateTimeSlot(day, index, "endTime", e.target.value)}
                                                            step={300}
                                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={2}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                                            {slot.startTime && slot.endTime && slot.startTime < slot.endTime
                                                                ? `${slot.startTime} - ${slot.endTime}`
                                                                : "Invalid time"}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        );
                                    })
                                )}
                            </Paper>
                        ))}
                    </Box>
                )}

                {/* ACTION */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <CancelButton onClick={() => navigate("/admin/consultation/slot/view")}>
                        <X size={16} style={{ marginRight: "8px" }} />
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        text="Save Availability"
                        onClick={handleSubmit}
                    />
                </Box>
            </Paper>
        </Box>
    );
}

export default Slot_Add;