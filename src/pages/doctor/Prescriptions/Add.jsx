// import { useState, useEffect } from "react";
// import { useNavigate, useSearchParams, useParams } from "react-router-dom";
// import HeadingCard from "../../../components/card/HeadingCard";
// import {
//     TextField,
//     Select,
//     MenuItem,
//     FormControl,
//     InputLabel,
//     Box,
//     Typography,
//     Grid,
//     Button,
//     CircularProgress,
//     Autocomplete,
// } from "@mui/material";
// import SubmitButton from "../../../components/buttons/SubmitButton";
// import CancelButton from "../../../components/buttons/CancelButton";
// import { X } from "lucide-react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { getApiUrl, getAuthHeaders } from "../../../config/api";
// import medicineService from "../../../services/medicineService";
// const dosageOptions = [
//     {
//         value: "0-1-0",
//         label: "0-1-0",
//         suggestion: "Take once in the afternoon (After food)",
//     },
//     {
//         value: "1-0-0",
//         label: "1-0-0",
//         suggestion: "Take once in the morning (Before breakfast)",
//     },
//     {
//         value: "1-1-1",
//         label: "1-1-1",
//         suggestion: "Take morning, afternoon, and night (After food)",
//     },
//     {
//         value: "0-0-1",
//         label: "0-0-1",
//         suggestion: "Take once at night (Before sleep)",
//     },
// ];

// function PrescriptionsAddPage() {
//     const navigate = useNavigate();
//     const { id: prescriptionId } = useParams();
//     const [searchParams] = useSearchParams();
//     const patientId = searchParams.get("patientId") || "";
//     const patientName = searchParams.get("patientName") || "";
//     const isEditMode = !!prescriptionId;

//     const [opdPatients, setOpdPatients] = useState([]);
//     const [isLoadingPatients, setIsLoadingPatients] = useState(false);
//     const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [selectedPatient, setSelectedPatient] = useState(null);
//     const [medicines, setMedicines] = useState([]);
//     const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);

//     const [formData, setFormData] = useState({
//         patientId: patientId,
//         patientName: patientName,
//         prescriptionDate: new Date().toISOString().split("T")[0],
//         medicines: [],
//         currentMedicine: {
//             name: "",
//             dosage: "",
//             frequency: "",
//             duration: "",
//             foodTiming: "",
//             remarks: "",
//             instructions: "",
//         },
//         diagnosis: "",
//         notes: "",
//     });

//     // Fetch OPD patients
//     useEffect(() => {
//         const fetchOPDPatients = async () => {
//             setIsLoadingPatients(true);
//             try {
//                 const response = await axios.get(
//                     getApiUrl("patients/opd"),
//                     { headers: getAuthHeaders() }
//                 );

//                 if (response.data.success) {
//                     const patients = response.data.data || [];
//                     // Double filter: Remove any patients marked as inpatients or with inpatient flag
//                     const opdOnlyPatients = patients.filter(
//                         p => {
//                             // Check if patient has inpatient flag set to true
//                             const isNotInpatient = !p.inpatient || p.inpatient === false;
//                             return isNotInpatient;
//                         }
//                     );
//                     setOpdPatients(opdOnlyPatients);

//                     // If patientId or patientName is provided in URL, find and select that patient
//                     if (patientId || patientName) {
//                         const foundPatient = patients.find(
//                             (p) => p._id === patientId || p.user?.name === patientName
//                         );
//                         if (foundPatient) {
//                             setSelectedPatient(foundPatient);
//                             setFormData((prev) => ({
//                                 ...prev,
//                                 patientId: foundPatient.user?.uhid || foundPatient.patientId || foundPatient._id,
//                                 patientName: foundPatient.user?.name || patientName,
//                             }));
//                         }
//                     }
//                 } else {
//                     toast.error("Failed to fetch patients");
//                 }
//             } catch (error) {
//                 console.error("Error fetching OPD patients:", error);
//                 toast.error(error.response?.data?.message || "Error fetching patients");
//             } finally {
//                 setIsLoadingPatients(false);
//             }
//         };

//         fetchOPDPatients();
//     }, [patientId, patientName]);

//     // Fetch available medicines
//     useEffect(() => {
//         const fetchMedicines = async () => {
//             setIsLoadingMedicines(true);
//             try {
//                 const response = await medicineService.getAllMedicines({ page: 1, limit: 1000 });
//                 console.log("Medicines API Response:", response);
//                 if (response && response.success && response.data) {
//                     const medicinesList = Array.isArray(response.data.medicines || response.data.data || response.data)
//                         ? (response.data.medicines || response.data.data || response.data)
//                         : [];
//                     console.log("Medicines List:", medicinesList);
//                     // Filter only active medicines (remove stockStatus filter to show all active medicines)
//                     const activeMedicines = medicinesList.filter(m => m.status === "Active");
//                     console.log("Active Medicines:", activeMedicines);
//                     setMedicines(activeMedicines);
//                 } else {
//                     console.error("Invalid response structure:", response);
//                 }
//             } catch (error) {
//                 console.error("Error fetching medicines:", error);
//                 console.error("Error details:", error.response?.data || error.message);
//                 toast.error(error.response?.data?.message || "Failed to fetch medicines");
//             } finally {
//                 setIsLoadingMedicines(false);
//             }
//         };

//         fetchMedicines();
//     }, []);

//     // Fetch prescription data when in edit mode
//     useEffect(() => {
//         const fetchPrescription = async () => {
//             if (!prescriptionId) return;

//             setIsLoadingPrescription(true);
//             try {
//                 const response = await axios.get(
//                     getApiUrl(`examinations/prescriptions/detail/${prescriptionId}`),
//                     { headers: getAuthHeaders() }
//                 );

//                 if (response.data.success) {
//                     const data = response.data.data;

//                     // Set patient information
//                     const patient = data.patient || data.examination?.patient;
//                     if (patient) {
//                         const foundPatient = {
//                             _id: patient._id,
//                             patientId: patient.user?.uhid || patient.patientId || patient._id,
//                             user: patient.user,
//                         };
//                         setSelectedPatient(foundPatient);
//                         setFormData((prev) => ({
//                             ...prev,
//                             patientId: foundPatient.patientId || foundPatient._id,
//                             patientName: foundPatient.user?.name || "",
//                         }));
//                     }

//                     // Set prescription data
//                     const prescriptionMedicine = data.medication ? {
//                         name: data.medication,
//                         dosage: data.dosage || "",
//                         frequency: data.frequency || "",
//                         duration: data.duration || "",
//                         foodTiming: data.foodTiming || "",
//                         remarks: data.remarks || "",
//                         instructions: data.notes || "",
//                     } : null;

//                     setFormData((prev) => ({
//                         ...prev,
//                         prescriptionDate: data.createdAt
//                             ? new Date(data.createdAt).toISOString().split("T")[0]
//                             : new Date().toISOString().split("T")[0],
//                         diagnosis: data.examination?.complaints || "",
//                         notes: data.notes || "",
//                         medicines: prescriptionMedicine ? [prescriptionMedicine] : [],
//                         currentMedicine: prescriptionMedicine || prev.currentMedicine,
//                     }));
//                 } else {
//                     toast.error(response.data.message || "Failed to fetch prescription");
//                 }
//             } catch (error) {
//                 console.error("Error fetching prescription:", error);
//                 toast.error(error.response?.data?.message || "Error fetching prescription");
//             } finally {
//                 setIsLoadingPrescription(false);
//             }
//         };

//         fetchPrescription();
//     }, [prescriptionId]);

//     // Handle patient selection
//     const handlePatientSelect = (event, newValue) => {
//         setSelectedPatient(newValue);
//         if (newValue) {
//             setFormData((prev) => ({
//                 ...prev,
//                 patientId: newValue.user?.uhid || newValue.patientId || newValue._id,
//                 patientName: newValue.user?.name || "",
//             }));
//         } else {
//             setSelectedPatient(null);
//             setFormData((prev) => ({
//                 ...prev,
//                 patientId: "",
//                 patientName: "",
//             }));
//         }
//     };

//     const frequencyOptions = ["Once daily", "Twice daily", "Thrice daily", "Four times daily", "As needed"];
//     const durationOptions = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "Ongoing"];

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleMedicineFieldChange = (field, value) => {
//         setFormData((prev) => ({
//             ...prev,
//             currentMedicine: { ...prev.currentMedicine, [field]: value },
//         }));
//     };

//     const handleAddMedicine = () => {
//         if (!formData.currentMedicine.name || !formData.currentMedicine.dosage) {
//             toast.error("Please enter medicine name and dosage");
//             return;
//         }
//         setFormData((prev) => ({
//             ...prev,
//             medicines: [...prev.medicines, { ...prev.currentMedicine }],
//             currentMedicine: {
//                 name: "",
//                 dosage: "",
//                 frequency: "",
//                 duration: "",
//                 foodTiming: "",
//                 remarks: "",
//                 instructions: "",
//             },
//         }));
//     };

//     const handleRemoveMedicine = (index) => {
//         setFormData((prev) => ({
//             ...prev,
//             medicines: prev.medicines.filter((_, i) => i !== index),
//         }));
//     };

//     // Get or create examination for the patient
//     const getOrCreateExamination = async (patientProfileId) => {
//         try {
//             // Always create a new examination for each prescription to ensure correct patient association
//             // This prevents issues with reusing old examinations
//             const createExamResponse = await axios.post(
//                 getApiUrl("examinations"),
//                 {
//                     patient: patientProfileId,
//                     complaints: formData.diagnosis || "Prescription consultation",
//                 },
//                 { headers: getAuthHeaders() }
//             );

//             if (createExamResponse.data.success) {
//                 return createExamResponse.data.data._id;
//             }

//             return null;
//         } catch (error) {
//             console.error("Error creating examination:", error);
//             throw error;
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!formData.patientId || !formData.patientName || formData.medicines.length === 0) {
//             toast.error("Please fill all required fields and add at least one medicine");
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             if (isEditMode && prescriptionId) {
//                 // Update existing prescription
//                 // If currentMedicine has a name, use it (it might be newly typed)
//                 // Otherwise use the first item in medicines list
//                 const medicine = formData.currentMedicine.name
//                     ? formData.currentMedicine
//                     : formData.medicines[0];

//                 if (!medicine || !medicine.name) {
//                     toast.error("Medicine name is required");
//                     setIsSubmitting(false);
//                     return;
//                 }

//                 const prescriptionData = {
//                     medication: medicine.name,
//                     dosage: medicine.dosage,
//                     frequency: medicine.frequency || "As needed",
//                     duration: medicine.duration || undefined,
//                     foodTiming: medicine.foodTiming || undefined,
//                     remarks: medicine.remarks || undefined,
//                     notes: medicine.instructions || formData.notes || undefined,
//                     diagnosis: formData.diagnosis, // Include diagnosis for backend to update examination
//                     quantity: 1,
//                 };

//                 await axios.patch(
//                     getApiUrl(`examinations/prescriptions/${prescriptionId}`),
//                     prescriptionData,
//                     { headers: getAuthHeaders() }
//                 );

//                 toast.success("Prescription updated successfully!");
//                 setTimeout(() => {
//                     navigate("/doctor/prescriptions", { state: { refresh: true } });
//                 }, 1500);
//             } else {
//                 // Create new prescription
//                 // Get patient profile ID - use selectedPatient from state, not formData
//                 const patientProfileId = selectedPatient?._id;

//                 if (!patientProfileId || !selectedPatient) {
//                     toast.error("Please select a patient");
//                     setIsSubmitting(false);
//                     return;
//                 }

//                 // Get or create examination
//                 let examinationId;
//                 try {
//                     examinationId = await getOrCreateExamination(patientProfileId);
//                     if (!examinationId) {
//                         toast.error("Failed to create examination for this patient");
//                         setIsSubmitting(false);
//                         return;
//                     }
//                 } catch (examError) {
//                     console.error("Error creating examination:", examError);
//                     toast.error("Failed to create examination. Please try again.");
//                     setIsSubmitting(false);
//                     return;
//                 }

//                 // Create prescriptions for each medicine
//                 const prescriptionPromises = formData.medicines.map((medicine) => {
//                     const prescriptionData = {
//                         medication: medicine.name,
//                         dosage: medicine.dosage,
//                         frequency: medicine.frequency || "As needed",
//                         duration: medicine.duration || undefined,
//                         foodTiming: medicine.foodTiming || undefined,
//                         remarks: medicine.remarks || undefined,
//                         notes: medicine.instructions || formData.notes || undefined,
//                         quantity: 1, // Default quantity
//                     };

//                     return axios.post(
//                         getApiUrl(`examinations/${examinationId}/prescriptions`),
//                         prescriptionData,
//                         { headers: getAuthHeaders() }
//                     );
//                 });

//                 await Promise.all(prescriptionPromises);

//                 toast.success("Prescription created successfully!");
//                 setTimeout(() => {
//                     navigate("/doctor/prescriptions", { state: { refresh: true } });
//                 }, 1500);
//             }
//         } catch (error) {
//             console.error(`Error ${isEditMode ? 'updating' : 'creating'} prescription:`, error);
//             toast.error(error.response?.data?.message || `Error ${isEditMode ? 'updating' : 'creating'} prescription`);
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <Box sx={{ p: 3 }}>
//             <HeadingCard
//                 title={isEditMode ? "Edit Prescription" : "Create Prescription"}
//                 subtitle={isEditMode
//                     ? "Update prescription information"
//                     : patientName ? `Create prescription for ${patientName}` : "Create a new prescription"}
//                 breadcrumbItems={[
//                     { label: "Doctor", url: "/doctor/dashboard" },
//                     { label: "OPD Prescriptions", url: "/doctor/prescriptions" },
//                     { label: isEditMode ? "Edit Prescription" : "New Prescription" },
//                 ]}
//             />

//             <Box
//                 component="form"
//                 onSubmit={handleSubmit}
//                 sx={{
//                     backgroundColor: "var(--color-bg-card)",
//                     borderRadius: 4,
//                     p: 4,
//                     border: "1px solid var(--color-border)",
//                     boxShadow: "var(--shadow-medium)",
//                     mt: 3,
//                 }}
//             >
//                 <Grid container spacing={3}>
//                     {/* Patient Name - Dropdown */}
//                     <Grid item xs={12} md={6}>
//                         <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
//                             Patient Name <span style={{ color: "red" }}>*</span>
//                         </Typography>
//                         <Autocomplete
//                             options={opdPatients}
//                             getOptionLabel={(option) => option.user?.name || ""}
//                             value={selectedPatient}
//                             onChange={handlePatientSelect}
//                             loading={isLoadingPatients}
//                             disabled={isLoadingPatients}
//                             isOptionEqualToValue={(option, value) =>
//                                 option._id?.toString() === value?._id?.toString()
//                             }
//                             renderInput={(params) => (
//                                 <TextField
//                                     {...params}
//                                     placeholder="Select patient name"
//                                     required
//                                     InputProps={{
//                                         ...params.InputProps,
//                                         endAdornment: (
//                                             <>
//                                                 {isLoadingPatients ? <CircularProgress size={20} /> : null}
//                                                 {params.InputProps.endAdornment}
//                                             </>
//                                         ),
//                                     }}
//                                 />
//                             )}
//                             renderOption={(props, option) => (
//                                 <li {...props} key={option._id}>
//                                     <Box>
//                                         <Typography variant="body1">
//                                             {option.user?.name || "Unknown"}
//                                         </Typography>
//                                         {option.user?.uhid && (
//                                             <Typography variant="caption" color="text.secondary">
//                                                 UHID: {option.user.uhid}
//                                             </Typography>
//                                         )}
//                                         {option.user?.phone && (
//                                             <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
//                                                 Phone: {option.user.phone}
//                                             </Typography>
//                                         )}
//                                     </Box>
//                                 </li>
//                             )}
//                             sx={{
//                                 "& .MuiOutlinedInput-root": {
//                                     backgroundColor: "var(--color-bg-input)",
//                                 },
//                             }}
//                         />
//                     </Grid>

//                     {/* UHID - Auto-filled */}
//                     <Grid item xs={12} md={6}>
//                         <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
//                             UHID <span style={{ color: "red" }}>*</span>
//                         </Typography>
//                         <TextField
//                             fullWidth
//                             name="patientId"
//                             value={formData.patientId}
//                             placeholder="UHID will be auto-filled"
//                             disabled
//                             required
//                             sx={{
//                                 "& .MuiInputBase-input.Mui-disabled": {
//                                     backgroundColor: "var(--color-bg-input)",
//                                     WebkitTextFillColor: "var(--color-text-dark)",
//                                 },
//                             }}
//                         />
//                     </Grid>

//                     {/* Prescription Date */}
//                     <Grid item xs={12} md={6}>
//                         <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
//                             Prescription Date <span style={{ color: "red" }}>*</span>
//                         </Typography>
//                         <TextField
//                             fullWidth
//                             name="prescriptionDate"
//                             type="date"
//                             value={formData.prescriptionDate}
//                             onChange={handleChange}
//                             InputLabelProps={{ shrink: true }}
//                             required
//                         />
//                     </Grid>

//                     {/* Diagnosis */}
//                     <Grid item xs={12} md={6}>
//                         <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
//                             Diagnosis
//                         </Typography>
//                         <TextField
//                             fullWidth
//                             name="diagnosis"
//                             value={formData.diagnosis}
//                             onChange={handleChange}
//                             placeholder="Enter diagnosis"
//                         />
//                     </Grid>

//                     {/* Add Medicine Section */}
//                     <Grid item xs={12}>
//                         <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
//                             Add Medicines <span style={{ color: "red" }}>*</span>
//                         </Typography>
//                         <Box
//                             sx={{
//                                 border: "1px solid var(--color-border)",
//                                 borderRadius: 2,
//                                 p: 2,
//                                 mb: 2,
//                                 backgroundColor: "var(--color-bg-a)",
//                             }}
//                         >
//                             <Grid container spacing={2}>
//                                 {/* First Row: Medicine Name, Dosage, Frequency, Duration, Food Timing, Add Button */}
//                                 <Grid item xs={12} sm={6} md={3}>
//                                     <Autocomplete
//                                         options={medicines}
//                                         getOptionLabel={(option) => typeof option === 'string' ? option : option.medicineName || ""}
//                                         value={medicines.find(m => m.medicineName === formData.currentMedicine.name) || null}
//                                         onChange={(event, newValue) => {
//                                             handleMedicineFieldChange("name", newValue ? newValue.medicineName : "");
//                                         }}
//                                         loading={isLoadingMedicines}
//                                         size="small"
//                                         renderInput={(params) => (
//                                             <TextField
//                                                 {...params}
//                                                 label="Medicine Name"
//                                                 placeholder="Select medicine"
//                                             />
//                                         )}
//                                         isOptionEqualToValue={(option, value) => option.medicineName === value.medicineName}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6} md={2}>
//                                     <TextField
//                                         fullWidth
//                                         label="Dosage"
//                                         value={formData.currentMedicine.dosage}
//                                         onChange={(e) => handleMedicineFieldChange("dosage", e.target.value)}
//                                         placeholder="e.g., 500mg"
//                                         size="small"
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6} md={2}>
//                                     <FormControl fullWidth size="small">
//                                         <InputLabel>Frequency</InputLabel>
//                                         <Select
//                                             value={formData.currentMedicine.frequency}
//                                             onChange={(e) => handleMedicineFieldChange("frequency", e.target.value)}
//                                             label="Frequency"
//                                         >
//                                             <MenuItem value="">Select</MenuItem>
//                                             {frequencyOptions.map((freq) => (
//                                                 <MenuItem key={freq} value={freq}>
//                                                     {freq}
//                                                 </MenuItem>
//                                             ))}
//                                         </Select>
//                                     </FormControl>
//                                 </Grid>
//                                 <Grid item xs={12} sm={6} md={2}>
//                                     <FormControl fullWidth size="small">
//                                         <InputLabel>Duration</InputLabel>
//                                         <Select
//                                             value={formData.currentMedicine.duration}
//                                             onChange={(e) => handleMedicineFieldChange("duration", e.target.value)}
//                                             label="Duration"
//                                         >
//                                             <MenuItem value="">Select</MenuItem>
//                                             {durationOptions.map((dur) => (
//                                                 <MenuItem key={dur} value={dur}>
//                                                     {dur}
//                                                 </MenuItem>
//                                             ))}
//                                         </Select>
//                                     </FormControl>
//                                 </Grid>
//                                 <Grid item xs={12} sm={6} md={2}>
//                                     <FormControl fullWidth size="small">
//                                         <InputLabel>Food Timing</InputLabel>
//                                         <Select
//                                             value={formData.currentMedicine.foodTiming}
//                                             onChange={(e) => handleMedicineFieldChange("foodTiming", e.target.value)}
//                                             label="Food Timing"
//                                         >
//                                             <MenuItem value="">Select</MenuItem>
//                                             <MenuItem value="Before Food">Before Food</MenuItem>
//                                             <MenuItem value="After Food">After Food</MenuItem>
//                                             <MenuItem value="After Food">With Food</MenuItem>
//                                             <MenuItem value="After Food">Empty Stomach</MenuItem>
//                                             <MenuItem value="After Food">Bedtime</MenuItem>
//                                         </Select>
//                                     </FormControl>
//                                 </Grid>
//                                 <Grid item xs={12} sm={6} md={2}>
//                                     <FormControl fullWidth size="small">
//                                         <InputLabel>Dosage Schedule</InputLabel>

//                                         <Select
//                                             value={formData.currentMedicine.dosage}
//                                             onChange={(e) =>
//                                                 handleMedicineFieldChange("dosage", e.target.value)
//                                             }
//                                             label="Dosage Schedule"
//                                         >
//                                             <MenuItem value="">Select</MenuItem>

//                                             {dosageOptions.map((option) => (
//                                                 <MenuItem key={option.value} value={option.value}>
//                                                     {option.label}
//                                                 </MenuItem>
//                                             ))}
//                                         </Select>
//                                     </FormControl>
//                                 </Grid>

//                                 <Grid item xs={12} sm={6} md={1}>
//                                     <Button
//                                         variant="contained"
//                                         onClick={handleAddMedicine}
//                                         fullWidth
//                                         sx={{ height: "40px" }}
//                                     >
//                                         Add
//                                     </Button>
//                                 </Grid>
//                             </Grid>
//                         </Box>

//                         {/* Remarks and Instructions - Outside the box, stacked vertically */}
//                         <Grid container spacing={2} sx={{ mt: 2 }}>
//                             <Grid item xs={12}>
//                                 <TextField
//                                     fullWidth
//                                     label="Remarks"
//                                     value={formData.currentMedicine.remarks}
//                                     onChange={(e) => handleMedicineFieldChange("remarks", e.target.value)}
//                                     placeholder="Enter remarks (optional)"
//                                 />
//                             </Grid>
//                             <Grid item xs={12}>
//                                 <TextField
//                                     fullWidth
//                                     label="Special Instructions"
//                                     value={formData.currentMedicine.instructions}
//                                     onChange={(e) => handleMedicineFieldChange("instructions", e.target.value)}
//                                     placeholder="Special instructions (optional)"
//                                     multiline
//                                     rows={3}
//                                 />
//                             </Grid>
//                         </Grid>

//                         {/* Added Medicines List */}
//                         {formData.medicines.length > 0 && (
//                             <Box sx={{ mt: 2 }}>
//                                 <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
//                                     Added Medicines:
//                                 </Typography>
//                                 {formData.medicines.map((medicine, index) => (
//                                     <Box
//                                         key={index}
//                                         sx={{
//                                             border: "1px solid var(--color-border)",
//                                             borderRadius: 1,
//                                             p: 1.5,
//                                             mb: 1,
//                                             display: "flex",
//                                             justifyContent: "space-between",
//                                             alignItems: "center",
//                                             backgroundColor: "white",
//                                         }}
//                                     >
//                                         <Box>
//                                             <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                                                 {medicine.name} - {medicine.dosage}
//                                             </Typography>
//                                             <Typography variant="caption" color="text.secondary">
//                                                 {medicine.frequency} • {medicine.duration}
//                                                 {medicine.foodTiming && ` • ${medicine.foodTiming}`}
//                                                 {medicine.remarks && ` • Remarks: ${medicine.remarks}`}
//                                                 {medicine.instructions && ` • ${medicine.instructions}`}
//                                             </Typography>
//                                         </Box>
//                                         <Button
//                                             size="small"
//                                             color="error"
//                                             onClick={() => handleRemoveMedicine(index)}
//                                         >
//                                             Remove
//                                         </Button>
//                                     </Box>
//                                 ))}
//                             </Box>
//                         )}
//                     </Grid>

//                     {/* Notes */}
//                     <Grid item xs={12}>
//                         <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
//                             Additional Notes
//                         </Typography>
//                         <TextField
//                             fullWidth
//                             name="notes"
//                             multiline
//                             rows={4}
//                             value={formData.notes}
//                             onChange={handleChange}
//                             placeholder="Enter any additional notes or instructions"
//                         />
//                     </Grid>
//                 </Grid>

//                 {/* Action Buttons */}
//                 <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
//                     <CancelButton onClick={() => navigate("/doctor/prescriptions")} disabled={isSubmitting}>
//                         <X size={16} style={{ marginRight: "8px" }} />
//                         Cancel
//                     </CancelButton>
//                     <Button
//                         type="submit"
//                         variant="contained"
//                         disabled={isSubmitting}
//                         sx={{
//                             backgroundColor: "var(--color-primary)",
//                             color: "white",
//                             px: 3,
//                             py: 1,
//                             "&:hover": {
//                                 backgroundColor: "var(--color-primary-dark)",
//                             },
//                             "&:disabled": {
//                                 backgroundColor: "var(--color-primary)",
//                                 opacity: 0.6,
//                             },
//                         }}
//                     >
//                         {isSubmitting ? (
//                             <>
//                                 <CircularProgress size={20} sx={{ mr: 1 }} />
//                                 {isEditMode ? "Updating..." : "Creating..."}
//                             </>
//                         ) : (
//                             isEditMode ? "Update Prescription" : "Create Prescription"
//                         )}
//                     </Button>
//                 </Box>
//             </Box>
//         </Box>
//     );
// }

// export default PrescriptionsAddPage;


import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import HeadingCard from "../../../components/card/HeadingCard";
import {
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography,
    Grid,
    Button,
    CircularProgress,
    Autocomplete,
} from "@mui/material";
import SubmitButton from "../../../components/buttons/SubmitButton";
import CancelButton from "../../../components/buttons/CancelButton";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import medicineService from "../../../services/medicineService";
const dosageOptions = [
    {
        value: "0-1-0",
        label: "0-1-0",
        suggestion: "Take once in the afternoon (After food)",
    },
    {
        value: "1-0-0",
        label: "1-0-0",
        suggestion: "Take once in the morning (Before breakfast)",
    },
    {
        value: "1-1-1",
        label: "1-1-1",
        suggestion: "Take morning, afternoon, and night (After food)",
    },
    {
        value: "0-0-1",
        label: "0-0-1",
        suggestion: "Take once at night (Before sleep)",
    },
];

function PrescriptionsAddPage() {
    const navigate = useNavigate();
    const { id: prescriptionId } = useParams();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId") || "";
    const patientName = searchParams.get("patientName") || "";
    const isEditMode = !!prescriptionId;
    const { user } = useSelector((state) => state.auth);

    const [opdPatients, setOpdPatients] = useState([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);
    const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);

    const [formData, setFormData] = useState({
        patientId: patientId,
        patientName: patientName,
        prescriptionDate: new Date().toISOString().split("T")[0],
        medicines: [],
        currentMedicine: {
            name: "",
            dosage: "",
            frequency: "",
            duration: "",
            foodTiming: "",
            remarks: "",
            instructions: "",
            dosageSchedule: "",
        },
        diagnosis: "",
        notes: "",
    });


    // Fetch OPD patients assigned to this doctor (from appointments, same as OP Consultation)
    useEffect(() => {
        const fetchOPDPatients = async () => {
            if (!user?._id) return;

            setIsLoadingPatients(true);
            try {
                // Fetch appointments for this doctor (backend automatically filters by logged-in doctor)
                const appointmentsResponse = await axios.get(
                    getApiUrl("appointments"),
                    {
                        headers: getAuthHeaders(),
                        params: {
                            page: 1,
                            limit: 1000 // Get all appointments
                        }
                    }
                );

                // Fetch active inpatients to exclude them
                let activeInpatientPatientIds = new Set();
                try {
                    const inpatientsResponse = await axios.get(
                        getApiUrl("inpatients"),
                        {
                            headers: getAuthHeaders(),
                            params: {
                                page: 1,
                                limit: 1000,
                                status: "Admitted" // Only get currently admitted patients
                            }
                        }
                    );
                    if (inpatientsResponse.data.success) {
                        const inpatients = inpatientsResponse.data.data?.inpatients || inpatientsResponse.data.data || [];
                        activeInpatientPatientIds = new Set(
                            inpatients
                                .filter(ip => ip.status === "Admitted" && ip.patient?._id)
                                .map(ip => ip.patient._id.toString())
                        );
                        console.log("Active inpatients to exclude:", activeInpatientPatientIds.size);
                    }
                } catch (inpatientError) {
                    console.warn("Error fetching inpatients (will continue without filtering):", inpatientError);
                }

                if (appointmentsResponse.data.success) {
                    const appointments = appointmentsResponse.data.data || [];
                    console.log("Appointments fetched:", appointments.length);

                    // Extract unique patients from appointments
                    const patientMap = new Map();
                    appointments.forEach(appointment => {
                        if (appointment.patient?._id) {
                            const patientId = appointment.patient._id.toString();
                            if (!patientMap.has(patientId)) {
                                // Check if patient is marked as inpatient in profile
                                const isNotInpatientProfile = !appointment.patient.inpatient || appointment.patient.inpatient === false;
                                // Check if patient is currently admitted (has active inpatient record)
                                const isNotCurrentlyAdmitted = !activeInpatientPatientIds.has(patientId);

                                // Only include OPD patients (not inpatients)
                                if (isNotInpatientProfile && isNotCurrentlyAdmitted) {
                                    patientMap.set(patientId, {
                                        _id: appointment.patient._id,
                                        user: appointment.patient.user,
                                        patientId: appointment.patient.patientId,
                                        inpatient: appointment.patient.inpatient || false,
                                    });
                                }
                            }
                        }
                    });

                    const uniquePatients = Array.from(patientMap.values());
                    console.log("Unique OPD patients from appointments (after filtering IPD):", uniquePatients.length);
                    setOpdPatients(uniquePatients);

                    // If no assigned patients found, show a message
                    if (uniquePatients.length === 0) {
                        console.warn("No assigned patients found for this doctor");
                    }

                    // If patientId or patientName is provided in URL, find and select that patient
                    if (patientId || patientName) {
                        const foundPatient = uniquePatients.find(
                            (p) => p._id === patientId || p.user?.name === patientName
                        );
                        if (foundPatient) {
                            setSelectedPatient(foundPatient);
                            setFormData((prev) => ({
                                ...prev,
                                patientId: foundPatient.user?.uhid || foundPatient.patientId || foundPatient._id,
                                patientName: foundPatient.user?.name || patientName,
                            }));
                        }
                    }
                } else {
                    toast.error("Failed to fetch patients");
                }
            } catch (error) {
                console.error("Error fetching doctor's patients:", error);
                toast.error(error.response?.data?.message || "Error fetching patients");
            } finally {
                setIsLoadingPatients(false);
            }
        };

        fetchOPDPatients();
    }, [user?._id, patientId, patientName]);

    // Fetch available medicines
    useEffect(() => {
        const fetchMedicines = async () => {
            setIsLoadingMedicines(true);
            try {
                const response = await medicineService.getAllMedicines({ page: 1, limit: 1000 });
                console.log("Medicines API Response:", response);
                if (response && response.success && response.data) {
                    const medicinesList = Array.isArray(response.data.medicines || response.data.data || response.data)
                        ? (response.data.medicines || response.data.data || response.data)
                        : [];
                    console.log("Medicines List:", medicinesList);
                    // Filter only active medicines (remove stockStatus filter to show all active medicines)
                    const activeMedicines = medicinesList.filter(m => m.status === "Active");
                    console.log("Active Medicines:", activeMedicines);
                    setMedicines(activeMedicines);
                } else {
                    console.error("Invalid response structure:", response);
                }
            } catch (error) {
                console.error("Error fetching medicines:", error);
                console.error("Error details:", error.response?.data || error.message);
                toast.error(error.response?.data?.message || "Failed to fetch medicines");
            } finally {
                setIsLoadingMedicines(false);
            }
        };

        fetchMedicines();
    }, []);

    // Fetch prescription data when in edit mode
    useEffect(() => {
        const fetchPrescription = async () => {
            if (!prescriptionId) return;

            setIsLoadingPrescription(true);
            try {
                const response = await axios.get(
                    getApiUrl(`examinations/prescriptions/detail/${prescriptionId}`),
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    const data = response.data.data;

                    // Set patient information
                    const patient = data.patient || data.examination?.patient;
                    if (patient) {
                        const foundPatient = {
                            _id: patient._id,
                            patientId: patient.user?.uhid || patient.patientId || patient._id,
                            user: patient.user,
                        };
                        setSelectedPatient(foundPatient);
                        setFormData((prev) => ({
                            ...prev,
                            patientId: foundPatient.patientId || foundPatient._id,
                            patientName: foundPatient.user?.name || "",
                        }));
                    }

                    // Set prescription data
                    const prescriptionMedicine = data.medication ? {
                        name: data.medication,
                        dosage: data.dosage || "",
                        frequency: data.frequency || "",
                        duration: data.duration || "",
                        foodTiming: data.foodTiming || "",
                        remarks: data.remarks || "",
                        instructions: data.notes || "",
                        dosageSchedule: data.dosageSchedule || "",
                    } : null;

                    setFormData((prev) => ({
                        ...prev,
                        prescriptionDate: data.createdAt
                            ? new Date(data.createdAt).toISOString().split("T")[0]
                            : new Date().toISOString().split("T")[0],
                        diagnosis: data.examination?.complaints || "",
                        notes: data.notes || "",
                        medicines: prescriptionMedicine ? [prescriptionMedicine] : [],
                        currentMedicine: prescriptionMedicine || prev.currentMedicine,
                    }));
                } else {
                    toast.error(response.data.message || "Failed to fetch prescription");
                }
            } catch (error) {
                console.error("Error fetching prescription:", error);
                toast.error(error.response?.data?.message || "Error fetching prescription");
            } finally {
                setIsLoadingPrescription(false);
            }
        };

        fetchPrescription();
    }, [prescriptionId]);

    // Handle patient selection
    const handlePatientSelect = (event, newValue) => {
        setSelectedPatient(newValue);
        if (newValue) {
            setFormData((prev) => ({
                ...prev,
                patientId: newValue.user?.uhid || newValue.patientId || newValue._id,
                patientName: newValue.user?.name || "",
            }));
        } else {
            setSelectedPatient(null);
            setFormData((prev) => ({
                ...prev,
                patientId: "",
                patientName: "",
            }));
        }
    };

    const frequencyOptions = ["Once daily", "Twice daily", "Thrice daily", "Four times daily", "As needed"];


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMedicineFieldChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            currentMedicine: { ...prev.currentMedicine, [field]: value },
        }));
    };

    const handleAddMedicine = () => {
        if (!formData.currentMedicine.name || !formData.currentMedicine.dosage) {
            toast.error("Please enter medicine name and dosage");
            return;
        }
        setFormData((prev) => ({
            ...prev,
            medicines: [...prev.medicines, { ...prev.currentMedicine }],
            currentMedicine: {
                name: "",
                dosage: "",
                frequency: "",
                duration: "",
                foodTiming: "",
                remarks: "",
                instructions: "",
                dosageSchedule: "",
            },
        }));
    };

    const handleRemoveMedicine = (index) => {
        setFormData((prev) => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index),
        }));
    };

    // Get or create examination for the patient
    const getOrCreateExamination = async (patientProfileId) => {
        try {
            // First, check if an examination already exists for this patient today
            // This prevents duplicates when walk-in hub has already created an examination
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            try {
                const existingExamsResponse = await axios.get(
                    getApiUrl("examinations"),
                    {
                        headers: getAuthHeaders(),
                        params: {
                            patientId: patientProfileId,
                            startDate: today.toISOString(),
                            endDate: tomorrow.toISOString(),
                        }
                    }
                );

                if (existingExamsResponse.data.success && existingExamsResponse.data.data) {
                    // Filter for OPD examinations (no inpatient) and get the most recent one
                    const opdExams = existingExamsResponse.data.data
                        .filter(exam => !exam.inpatient)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    if (opdExams.length > 0) {
                        console.log("Found existing examination for today, reusing it:", opdExams[0]._id);
                        return opdExams[0]._id;
                    }
                }
            } catch (checkError) {
                // If check fails, continue to create new examination
                console.warn("Error checking for existing examination:", checkError);
            }

            // No existing examination found, create a new one
            // The backend will also check and prevent duplicates, but frontend check provides better UX
            const createExamResponse = await axios.post(
                getApiUrl("examinations"),
                {
                    patient: patientProfileId,
                    complaints: formData.diagnosis || "Prescription consultation",
                },
                { headers: getAuthHeaders() }
            );

            if (createExamResponse.data.success) {
                return createExamResponse.data.data._id;
            }

            return null;
        } catch (error) {
            console.error("Error creating examination:", error);
            // If it's a duplicate error from backend, try to get the existing examination
            if (error.response?.status === 409 || error.response?.data?.message?.includes("already exists")) {
                try {
                    const existingExamsResponse = await axios.get(
                        getApiUrl("examinations"),
                        {
                            headers: getAuthHeaders(),
                            params: { patientId: patientProfileId }
                        }
                    );
                    if (existingExamsResponse.data.success && existingExamsResponse.data.data) {
                        const opdExams = existingExamsResponse.data.data
                            .filter(exam => !exam.inpatient)
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        if (opdExams.length > 0) {
                            return opdExams[0]._id;
                        }
                    }
                } catch (retryError) {
                    console.error("Error fetching existing examination:", retryError);
                }
            }
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.patientId || !formData.patientName || formData.medicines.length === 0) {
            toast.error("Please fill all required fields and add at least one medicine");
            return;
        }

        setIsSubmitting(true);

        try {
            if (isEditMode && prescriptionId) {
                // Update existing prescription
                // If currentMedicine has a name, use it (it might be newly typed)
                // Otherwise use the first item in medicines list
                const medicine = formData.currentMedicine.name
                    ? formData.currentMedicine
                    : formData.medicines[0];

                if (!medicine || !medicine.name) {
                    toast.error("Medicine name is required");
                    setIsSubmitting(false);
                    return;
                }

                const prescriptionData = {
                    medication: medicine.name,
                    dosage: medicine.dosage,
                    frequency: medicine.frequency || "As needed",
                    duration: medicine.duration || undefined,
                    foodTiming: medicine.foodTiming || undefined,
                    dosageSchedule: medicine.dosageSchedule || undefined,
                    remarks: medicine.remarks || undefined,
                    notes: medicine.instructions || formData.notes || undefined,
                    diagnosis: formData.diagnosis, // Include diagnosis for backend to update examination
                    quantity: 1,
                };

                await axios.patch(
                    getApiUrl(`examinations/prescriptions/${prescriptionId}`),
                    prescriptionData,
                    { headers: getAuthHeaders() }
                );

                toast.success("Prescription updated successfully!");
                setTimeout(() => {
                    navigate("/doctor/prescriptions", { state: { refresh: true } });
                }, 1500);
            } else {
                // Create new prescription
                // Get patient profile ID - use selectedPatient from state, not formData
                const patientProfileId = selectedPatient?._id;

                if (!patientProfileId || !selectedPatient) {
                    toast.error("Please select a patient");
                    setIsSubmitting(false);
                    return;
                }

                // Get or create examination
                let examinationId;
                try {
                    examinationId = await getOrCreateExamination(patientProfileId);
                    if (!examinationId) {
                        toast.error("Failed to create examination for this patient");
                        setIsSubmitting(false);
                        return;
                    }
                } catch (examError) {
                    console.error("Error creating examination:", examError);
                    toast.error("Failed to create examination. Please try again.");
                    setIsSubmitting(false);
                    return;
                }

                // Create prescriptions for each medicine
                const prescriptionPromises = formData.medicines.map((medicine) => {
                    const prescriptionData = {
                        medication: medicine.name,
                        dosage: medicine.dosage,
                        frequency: medicine.frequency || "As needed",
                        duration: medicine.duration || undefined,
                        foodTiming: medicine.foodTiming || undefined,
                        dosageSchedule: medicine.dosageSchedule || undefined,
                        remarks: medicine.remarks || undefined,
                        notes: medicine.instructions || formData.notes || undefined,
                        quantity: 1, // Default quantity
                    };

                    return axios.post(
                        getApiUrl(`examinations/${examinationId}/prescriptions`),
                        prescriptionData,
                        { headers: getAuthHeaders() }
                    );
                });

                await Promise.all(prescriptionPromises);

                toast.success("Prescription created successfully!");
                setTimeout(() => {
                    navigate("/doctor/prescriptions", { state: { refresh: true } });
                }, 1500);
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} prescription:`, error);
            toast.error(error.response?.data?.message || `Error ${isEditMode ? 'updating' : 'creating'} prescription`);
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title={isEditMode ? "Edit Prescription" : "Create Prescription"}
                subtitle={isEditMode
                    ? "Update prescription information"
                    : patientName ? `Create prescription for ${patientName}` : "Create a new prescription"}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "OPD Prescriptions", url: "/doctor/prescriptions" },
                    { label: isEditMode ? "Edit Prescription" : "New Prescription" },
                ]}
            />

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    backgroundColor: "var(--color-bg-card)",
                    borderRadius: 4,
                    p: 4,
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-medium)",
                    mt: 3,
                }}
            >
                <Grid container spacing={3}>
                    {/* Patient Name - Dropdown */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Patient Name <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Autocomplete
                            options={opdPatients}
                            getOptionLabel={(option) => option.user?.name || ""}
                            value={selectedPatient}
                            onChange={handlePatientSelect}
                            loading={isLoadingPatients}
                            disabled={isLoadingPatients}
                            isOptionEqualToValue={(option, value) =>
                                option._id?.toString() === value?._id?.toString()
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select patient name"
                                    required
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {isLoadingPatients ? <CircularProgress size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option._id}>
                                    <Box>
                                        <Typography variant="body1">
                                            {option.user?.name || "Unknown"}
                                        </Typography>
                                        {option.user?.uhid && (
                                            <Typography variant="caption" color="text.secondary">
                                                UHID: {option.user.uhid}
                                            </Typography>
                                        )}
                                        {option.user?.phone && (
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                Phone: {option.user.phone}
                                            </Typography>
                                        )}
                                    </Box>
                                </li>
                            )}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    backgroundColor: "var(--color-bg-input)",
                                },
                            }}
                        />
                    </Grid>

                    {/* UHID - Auto-filled */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            UHID <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="patientId"
                            value={formData.patientId}
                            placeholder="UHID will be auto-filled"
                            disabled
                            required
                            sx={{
                                "& .MuiInputBase-input.Mui-disabled": {
                                    backgroundColor: "var(--color-bg-input)",
                                    WebkitTextFillColor: "var(--color-text-dark)",
                                },
                            }}
                        />
                    </Grid>

                    {/* Prescription Date */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Prescription Date <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="prescriptionDate"
                            type="date"
                            value={formData.prescriptionDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    {/* Diagnosis */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Diagnosis
                        </Typography>
                        <TextField
                            fullWidth
                            name="diagnosis"
                            value={formData.diagnosis}
                            onChange={handleChange}
                            placeholder="Enter diagnosis"
                        />
                    </Grid>

                    {/* Add Medicine Section */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Add Medicines <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Box
                            sx={{
                                border: "1px solid var(--color-border)",
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                                backgroundColor: "var(--color-bg-a)",
                            }}
                        >
                            <Grid container spacing={2}>
                                {/* First Row: Medicine Name, Dosage, Frequency, Duration, Food Timing, Add Button */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Autocomplete
                                        options={medicines}
                                        getOptionLabel={(option) => typeof option === 'string' ? option : option.medicineName || ""}
                                        value={medicines.find(m => m.medicineName === formData.currentMedicine.name) || null}
                                        onChange={(event, newValue) => {
                                            handleMedicineFieldChange("name", newValue ? newValue.medicineName : "");
                                        }}
                                        loading={isLoadingMedicines}
                                        size="small"
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Medicine Name"
                                                placeholder="Select medicine"
                                            />
                                        )}
                                        isOptionEqualToValue={(option, value) => option.medicineName === value.medicineName}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Dosage"
                                        value={formData.currentMedicine.dosage}
                                        onChange={(e) => handleMedicineFieldChange("dosage", e.target.value)}
                                        placeholder="e.g., 500mg"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Frequency</InputLabel>
                                        <Select
                                            value={formData.currentMedicine.frequency}
                                            onChange={(e) => handleMedicineFieldChange("frequency", e.target.value)}
                                            label="Frequency"
                                        >
                                            <MenuItem value="">Select</MenuItem>
                                            {frequencyOptions.map((freq) => (
                                                <MenuItem key={freq} value={freq}>
                                                    {freq}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Duration"
                                        value={formData.currentMedicine.duration}
                                        onChange={(e) => handleMedicineFieldChange("duration", e.target.value)}
                                        placeholder="e.g., 5 days"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Food Timing</InputLabel>
                                        <Select
                                            value={formData.currentMedicine.foodTiming}
                                            onChange={(e) => handleMedicineFieldChange("foodTiming", e.target.value)}
                                            label="Food Timing"
                                        >
                                            <MenuItem value="">Select</MenuItem>
                                            <MenuItem value="Before Food">Before Food</MenuItem>
                                            <MenuItem value="After Food">After Food</MenuItem>
                                            <MenuItem value="With Food">With Food</MenuItem>
                                            <MenuItem value="Empty Stomach">Empty Stomach</MenuItem>
                                            <MenuItem value="Bedtime">Bedtime</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Dosage Schedule</InputLabel>

                                        <Select
                                            value={formData.currentMedicine.dosageSchedule}
                                            onChange={(e) =>
                                                handleMedicineFieldChange("dosageSchedule", e.target.value)
                                            }
                                            label="Dosage Schedule"
                                        >
                                            <MenuItem value="">Select</MenuItem>

                                            {dosageOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={1}>
                                    <Button
                                        variant="contained"
                                        onClick={handleAddMedicine}
                                        fullWidth
                                        sx={{ height: "40px" }}
                                    >
                                        Add
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Remarks and Instructions - Outside the box, stacked vertically */}
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Remarks"
                                    value={formData.currentMedicine.remarks}
                                    onChange={(e) => handleMedicineFieldChange("remarks", e.target.value)}
                                    placeholder="Enter remarks (optional)"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Special Instructions"
                                    value={formData.currentMedicine.instructions}
                                    onChange={(e) => handleMedicineFieldChange("instructions", e.target.value)}
                                    placeholder="Special instructions (optional)"
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                        </Grid>

                        {/* Added Medicines List */}
                        {formData.medicines.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Added Medicines:
                                </Typography>
                                {formData.medicines.map((medicine, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            border: "1px solid var(--color-border)",
                                            borderRadius: 1,
                                            p: 1.5,
                                            mb: 1,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            backgroundColor: "white",
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {medicine.name} - {medicine.dosage}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {medicine.frequency} • {medicine.duration}
                                                {medicine.foodTiming && ` • ${medicine.foodTiming}`}
                                                {medicine.dosageSchedule && ` • Schedule: ${medicine.dosageSchedule}`}
                                                {medicine.remarks && ` • Remarks: ${medicine.remarks}`}
                                                {medicine.instructions && ` • ${medicine.instructions}`}
                                            </Typography>
                                        </Box>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoveMedicine(index)}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Grid>

                    {/* Notes */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Additional Notes
                        </Typography>
                        <TextField
                            fullWidth
                            name="notes"
                            multiline
                            rows={4}
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Enter any additional notes or instructions"
                        />
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                    <CancelButton onClick={() => navigate("/doctor/prescriptions")} disabled={isSubmitting}>
                        <X size={16} style={{ marginRight: "8px" }} />
                        Cancel
                    </CancelButton>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                            backgroundColor: "var(--color-primary)",
                            color: "white",
                            px: 3,
                            py: 1,
                            "&:hover": {
                                backgroundColor: "var(--color-primary-dark)",
                            },
                            "&:disabled": {
                                backgroundColor: "var(--color-primary)",
                                opacity: 0.6,
                            },
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                {isEditMode ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            isEditMode ? "Update Prescription" : "Create Prescription"
                        )}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default PrescriptionsAddPage;