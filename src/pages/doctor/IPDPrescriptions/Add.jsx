import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
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
    Autocomplete,
    Divider,
    CircularProgress,
} from "@mui/material";
import SubmitButton from "../../../components/buttons/SubmitButton";
import CancelButton from "../../../components/buttons/CancelButton";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import medicineService from "../../../services/medicineService";

function IPDPrescriptionsAddPage() {
    const navigate = useNavigate();
    const { id: prescriptionId } = useParams();
    const [searchParams] = useSearchParams();
    const inpatientId = searchParams.get("inpatientId") || "";
    const patientName = searchParams.get("patientName") || "";
    const isEditMode = !!prescriptionId;

    const [inpatients, setInpatients] = useState([]);
    const [isLoadingInpatients, setIsLoadingInpatients] = useState(false);
    const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedInpatient, setSelectedInpatient] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);

    const [formData, setFormData] = useState({
        inpatientId: inpatientId,
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
            medicineType: "",
            administration: "",
            quantity: "",
        },
        diagnosis: "",
        notes: "",
    });

    // Fetch inpatients
    useEffect(() => {
        const fetchInpatients = async () => {
            setIsLoadingInpatients(true);
            try {
                const response = await axios.get(
                    getApiUrl("inpatients"),
                    {
                        headers: getAuthHeaders(),
                        params: {
                            page: 1,
                            limit: 1000,
                        }
                    }
                );

                if (response.data.success) {
                    const inpatientsData = response.data.data || [];
                    // In edit mode, include all inpatients (admitted and discharged)
                    // In create mode, filter only admitted patients
                    const filteredInpatients = isEditMode
                        ? inpatientsData
                        : inpatientsData.filter(ip => ip.status === "Admitted");
                    setInpatients(filteredInpatients);

                    // If inpatientId or patientName is provided in URL, find and select that inpatient
                    if (inpatientId || patientName) {
                        const foundInpatient = filteredInpatients.find(
                            (ip) => ip._id === inpatientId || ip.patient?.user?.name === patientName
                        );
                        if (foundInpatient) {
                            setSelectedInpatient(foundInpatient);
                            setFormData((prev) => ({
                                ...prev,
                                inpatientId: foundInpatient._id,
                                patientName: foundInpatient.patient?.user?.name || patientName,
                            }));
                        }
                    }
                } else {
                    toast.error("Failed to fetch inpatients");
                }
            } catch (error) {
                console.error("Error fetching inpatients:", error);
                toast.error(error.response?.data?.message || "Error fetching inpatients");
            } finally {
                setIsLoadingInpatients(false);
            }
        };

        fetchInpatients();
    }, [inpatientId, patientName, isEditMode]);

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
    const fetchPrescription = useCallback(async () => {
        if (!prescriptionId || !isEditMode) return;

        setIsLoadingPrescription(true);
        try {
            const response = await axios.get(
                getApiUrl(`examinations/prescriptions/detail/${prescriptionId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success && response.data.data) {
                const prescription = response.data.data;
                const examination = prescription.examination;
                const inpatient = examination?.inpatient;
                const patient = prescription.patient || examination?.patient;

                // Find inpatient in the list - check both _id and the patient reference
                let foundInpatient = null;

                // First, try to find by inpatient _id from examination
                if (inpatient) {
                    const inpatientId = inpatient._id || inpatient;
                    foundInpatient = inpatients.find(
                        ip => ip._id?.toString() === inpatientId?.toString()
                    );
                }

                // If not found, try to find by patient reference
                if (!foundInpatient && patient?._id) {
                    foundInpatient = inpatients.find(
                        ip => {
                            const ipPatientId = ip.patient?._id || ip.patient;
                            return ipPatientId?.toString() === patient._id?.toString();
                        }
                    );
                }

                // If still not found, try to find by patient user ID
                if (!foundInpatient && patient?.user?._id) {
                    foundInpatient = inpatients.find(
                        ip => {
                            const ipUserId = ip.patient?.user?._id || ip.patient?.user;
                            return ipUserId?.toString() === patient.user._id?.toString();
                        }
                    );
                }

                if (foundInpatient) {
                    setSelectedInpatient(foundInpatient);
                }

                // Set form data - for edit mode, we edit a single prescription
                setFormData((prev) => ({
                    ...prev,
                    inpatientId: foundInpatient?._id || inpatient?._id || "",
                    patientName: patient?.user?.name || "",
                    prescriptionDate: prescription.createdAt
                        ? new Date(prescription.createdAt).toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0],
                    diagnosis: examination?.complaints || "",
                    notes: prescription.notes || "",
                    medicines: prescription.medication ? [{
                        name: prescription.medication,
                        dosage: prescription.dosage || "",
                        frequency: prescription.frequency || "",
                        duration: prescription.duration || "",
                        foodTiming: prescription.foodTiming || "",
                        remarks: prescription.remarks || "",
                        instructions: prescription.notes || "",
                        medicineType: prescription.medicineType || "",
                        administration: prescription.administration || "",
                        quantity: prescription.quantity?.toString() || "",
                    }] : [],
                }));
            }
        } catch (error) {
            console.error("Error fetching prescription:", error);
            toast.error(error.response?.data?.message || "Failed to load prescription");
        } finally {
            setIsLoadingPrescription(false);
        }
    }, [prescriptionId, isEditMode, inpatients]);

    // Fetch prescription when in edit mode and inpatients are loaded
    useEffect(() => {
        if (isEditMode && inpatients.length > 0) {
            fetchPrescription();
        }
    }, [isEditMode, inpatients.length, fetchPrescription]);

    // Handle inpatient selection
    const handleInpatientSelect = (event, newValue) => {
        setSelectedInpatient(newValue);
        if (newValue) {
            setFormData((prev) => ({
                ...prev,
                inpatientId: newValue._id,
                patientName: newValue.patient?.user?.name || "",
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                inpatientId: "",
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
            },
        }));
    };

    const handleRemoveMedicine = (index) => {
        setFormData((prev) => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditMode) {
            // In edit mode, validate medicine data
            if (formData.medicines.length === 0) {
                toast.error("No medicine data found. Please reload the page.");
                return;
            }
            if (!formData.medicines[0].name || !formData.medicines[0].dosage) {
                toast.error("Please fill medicine name and dosage");
                return;
            }
        } else {
            // In create mode, validate all fields
            if (!formData.inpatientId || !formData.patientName || formData.medicines.length === 0) {
                toast.error("Please fill all required fields and add at least one medicine");
                return;
            }
        }

        setIsSubmitting(true);

        try {
            if (isEditMode) {
                // Update existing prescription
                const medicine = formData.medicines[0]; // In edit mode, we edit a single prescription

                if (!medicine || !medicine.name || !medicine.dosage) {
                    toast.error("Medicine name and dosage are required");
                    setIsSubmitting(false);
                    return;
                }

                const prescriptionData = {
                    medication: medicine.name,
                    dosage: medicine.dosage,
                    frequency: medicine.frequency || "As needed",
                    duration: medicine.duration || undefined,
                    foodTiming: medicine.foodTiming || undefined,
                    remarks: medicine.remarks || undefined,
                    notes: medicine.instructions || formData.notes || undefined,
                    quantity: medicine.quantity ? parseInt(medicine.quantity, 10) : 1,
                    medicineType: medicine.medicineType || undefined,
                    administration: medicine.administration || undefined,
                    diagnosis: formData.diagnosis || undefined,
                };

                const response = await axios.patch(
                    getApiUrl(`examinations/prescriptions/${prescriptionId}`),
                    prescriptionData,
                    { headers: getAuthHeaders() }
                );

                if (response.data && response.data.success) {
                    toast.success("IPD Prescription updated successfully!");
                    setTimeout(() => {
                        navigate("/doctor/ipd-prescriptions");
                    }, 1500);
                } else {
                    toast.error(response.data?.message || "Failed to update prescription");
                    setIsSubmitting(false);
                }
            } else {
                // Create new prescription(s)
                // Get existing examination for this inpatient
                let examinationId = null;

                try {
                    const examResponse = await axios.get(
                        getApiUrl(`examinations/inpatient/${formData.inpatientId}`),
                        { headers: getAuthHeaders() }
                    );

                    if (examResponse.data.success && examResponse.data.data && examResponse.data.data.length > 0) {
                        // Use the latest examination (already sorted by createdAt -1)
                        examinationId = examResponse.data.data[0]._id;
                    }
                } catch (err) {
                    console.error("Error fetching examinations:", err);
                }

                // If no examination exists, create one
                if (!examinationId) {
                    try {
                        const createExamResponse = await axios.post(
                            getApiUrl(`examinations/inpatient/${formData.inpatientId}`),
                            { complaints: formData.diagnosis || "Prescription consultation" },
                            { headers: getAuthHeaders() }
                        );
                        if (createExamResponse.data.success && createExamResponse.data.data) {
                            examinationId = createExamResponse.data.data._id;
                        }
                    } catch (createErr) {
                        console.error("Error creating examination:", createErr);
                        const errorMsg = createErr.response?.data?.message || "Failed to create examination";
                        toast.error(errorMsg);
                        setIsSubmitting(false);
                        return;
                    }
                }

                if (!examinationId) {
                    toast.error("Unable to find or create examination for this patient.");
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
                        remarks: medicine.remarks || undefined,
                        notes: medicine.instructions || formData.notes || undefined,
                        quantity: medicine.quantity ? parseInt(medicine.quantity, 10) : 1,
                        medicineType: medicine.medicineType || undefined,
                        administration: medicine.administration || undefined,
                        isInpatient: true, // Mark as IPD prescription
                        billOnDischarge: true, // Bill on discharge for inpatients
                    };

                    return axios.post(
                        getApiUrl(`examinations/${examinationId}/prescriptions`),
                        prescriptionData,
                        { headers: getAuthHeaders() }
                    );
                });

                await Promise.all(prescriptionPromises);

                toast.success("IPD Prescription created successfully!");
                setTimeout(() => {
                    navigate("/doctor/ipd-prescriptions");
                }, 1500);
            }
        } catch (error) {
            console.error("Error saving prescription:", error);
            toast.error(error.response?.data?.message || (isEditMode ? "Error updating prescription" : "Error creating prescription"));
            setIsSubmitting(false);
        }
    };

    if (isLoadingPrescription) {
        return (
            <div className="mx-[2rem]">
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            </div>
        );
    }

    return (
        <div className="mx-[2rem]">
            <HeadingCard
                title={isEditMode ? "Edit IPD Prescription" : "Create IPD Prescription"}
                subtitle={formData.patientName ? `Prescription for ${formData.patientName}` : (isEditMode ? "Edit IPD prescription" : "Create a new IPD prescription")}
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "In Patients", url: "/doctor/in-patients" },
                    { label: "IPD Prescriptions", url: "/doctor/ipd-prescriptions" },
                    { label: isEditMode ? "Edit Prescription" : "Create Prescription" },
                ]}
            />

            <Box sx={{ p: 4, bgcolor: "background.default", minHeight: "100vh" }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Inpatient Selection */}
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={inpatients}
                                getOptionLabel={(option) =>
                                    `${option.patient?.user?.name || "Unknown"} - Room: ${option.roomNumber || "N/A"}`
                                }
                                loading={isLoadingInpatients}
                                value={selectedInpatient}
                                onChange={handleInpatientSelect}
                                disabled={isEditMode}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Inpatient *"
                                        variant="outlined"
                                        required
                                    />
                                )}
                            />
                        </Grid>

                        {/* Prescription Date */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Prescription Date *"
                                name="prescriptionDate"
                                type="date"
                                value={formData.prescriptionDate}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                required
                            />
                        </Grid>

                        {/* Diagnosis */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Diagnosis"
                                name="diagnosis"
                                value={formData.diagnosis}
                                onChange={handleChange}
                                placeholder="Enter diagnosis or chief complaint"
                            />
                        </Grid>

                        {/* Medicines Section */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                {isEditMode ? "Medicine Details" : "Medicines"}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {isEditMode ? (
                                // Edit mode: Show single medicine form
                                formData.medicines.length > 0 ? (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <Autocomplete
                                                options={medicines}
                                                getOptionLabel={(option) => typeof option === 'string' ? option : option.medicineName || ""}
                                                value={medicines.find(m => m.medicineName === formData.medicines[0]?.name) || null}
                                                onChange={(event, newValue) => {
                                                    const updatedMedicines = [...formData.medicines];
                                                    updatedMedicines[0].name = newValue ? newValue.medicineName : "";
                                                    setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
                                                }}
                                                loading={isLoadingMedicines}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Medicine Name *"
                                                        placeholder="Select medicine"
                                                        required
                                                    />
                                                )}
                                                isOptionEqualToValue={(option, value) => option.medicineName === value.medicineName}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                label="Dosage *"
                                                value={formData.medicines[0].dosage || ""}
                                                onChange={(e) => {
                                                    const updatedMedicines = [...formData.medicines];
                                                    updatedMedicines[0].dosage = e.target.value;
                                                    setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
                                                }}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth>
                                                <InputLabel>Frequency</InputLabel>
                                                <Select
                                                    value={formData.medicines[0].frequency || ""}
                                                    onChange={(e) => {
                                                        const updatedMedicines = [...formData.medicines];
                                                        updatedMedicines[0].frequency = e.target.value;
                                                        setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
                                                    }}
                                                    label="Frequency"
                                                >
                                                    {frequencyOptions.map((freq) => (
                                                        <MenuItem key={freq} value={freq}>
                                                            {freq}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Duration"
                                                value={formData.medicines[0].duration || ""}
                                                onChange={(e) => {
                                                    const updatedMedicines = [...formData.medicines];
                                                    updatedMedicines[0].duration = e.target.value;
                                                    setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
                                                }}
                                                placeholder="e.g., 5 days"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth>
                                                <InputLabel>Food Timing</InputLabel>
                                                <Select
                                                    value={formData.medicines[0].foodTiming || ""}
                                                    onChange={(e) => {
                                                        const updatedMedicines = [...formData.medicines];
                                                        updatedMedicines[0].foodTiming = e.target.value;
                                                        setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
                                                    }}
                                                    label="Food Timing"
                                                >
                                                    <MenuItem value="">Select</MenuItem>
                                                    <MenuItem value="Before Food">Before Food</MenuItem>
                                                    <MenuItem value="After Food">After Food</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Quantity"
                                                type="number"
                                                value={formData.medicines[0].quantity || ""}
                                                onChange={(e) => {
                                                    const updatedMedicines = [...formData.medicines];
                                                    updatedMedicines[0].quantity = e.target.value;
                                                    setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Remarks"
                                                value={formData.medicines[0].remarks || ""}
                                                onChange={(e) => {
                                                    const updatedMedicines = [...formData.medicines];
                                                    updatedMedicines[0].remarks = e.target.value;
                                                    setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
                                                }}
                                                placeholder="Enter remarks"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Special Instructions"
                                                value={formData.medicines[0].instructions || ""}
                                                onChange={(e) => {
                                                    const updatedMedicines = [...formData.medicines];
                                                    updatedMedicines[0].instructions = e.target.value;
                                                    setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
                                                }}
                                                multiline
                                                rows={3}
                                            />
                                        </Grid>
                                    </Grid>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Loading medicine details...
                                    </Typography>
                                )
                            ) : (
                                <>
                                    {/* Current Medicine Form */}
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        {/* First Row: Medicine Name, Dosage, Frequency, Duration, Food Timing, Add Button */}
                                        <Grid item xs={12} md={3}>
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
                                                        label="Medicine Name *"
                                                        placeholder="Select medicine"
                                                        required={formData.medicines.length === 0}
                                                    />
                                                )}
                                                isOptionEqualToValue={(option, value) => option.medicineName === value.medicineName}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                            <TextField
                                                fullWidth
                                                label="Dosage *"
                                                value={formData.currentMedicine.dosage}
                                                onChange={(e) => handleMedicineFieldChange("dosage", e.target.value)}
                                                size="small"
                                                required={formData.medicines.length === 0}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Frequency</InputLabel>
                                                <Select
                                                    value={formData.currentMedicine.frequency}
                                                    onChange={(e) => handleMedicineFieldChange("frequency", e.target.value)}
                                                    label="Frequency"
                                                >
                                                    {frequencyOptions.map((freq) => (
                                                        <MenuItem key={freq} value={freq}>
                                                            {freq}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Duration"
                                                value={formData.currentMedicine.duration}
                                                onChange={(e) => handleMedicineFieldChange("duration", e.target.value)}
                                                placeholder="e.g., 5 days"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
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
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={1}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={handleAddMedicine}
                                                size="small"
                                                sx={{ height: "40px" }}
                                            >
                                                Add
                                            </Button>
                                        </Grid>
                                    </Grid>

                                    {/* Remarks and Special Instructions - Outside the box, stacked vertically */}
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
                                            <Typography variant="subtitle2" gutterBottom>
                                                Added Medicines:
                                            </Typography>
                                            {formData.medicines.map((medicine, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        p: 2,
                                                        mb: 1,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography variant="body1" fontWeight={600}>
                                                            {medicine.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {medicine.dosage} - {medicine.frequency} - {medicine.duration}
                                                            {medicine.foodTiming && ` - ${medicine.foodTiming}`}
                                                        </Typography>
                                                        {medicine.remarks && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                Remarks: {medicine.remarks}
                                                            </Typography>
                                                        )}
                                                        {medicine.instructions && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                Instructions: {medicine.instructions}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRemoveMedicine(index)}
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </>
                            )}
                        </Grid>

                        {/* Notes */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Additional Notes"
                                name="notes"
                                multiline
                                rows={4}
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Enter any additional notes or instructions..."
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                        <CancelButton onClick={() => navigate("/doctor/ipd-prescriptions")}>
                            <X size={16} style={{ marginRight: "8px" }} />
                            Cancel
                        </CancelButton>
                        <SubmitButton
                            text={isEditMode ? "Update IPD Prescription" : "Create IPD Prescription"}
                            type="submit"
                            disabled={isSubmitting}
                        />
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default IPDPrescriptionsAddPage;

