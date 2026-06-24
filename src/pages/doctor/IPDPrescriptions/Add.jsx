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

const foodTimingOptions = [
    "Early Morning",
    "After Breakfast",
    "Before Food",
    "After Lunch",
    "After Dinner",
    "Empty Stomach",
    "Before Bed",
];

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
        value: "1-0-1",
        label: "1-0-1",
        suggestion: "Take in the morning and at night",
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

const subtypeOptions = ["Oil", "Ghee", "Internal", "External usage"];

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
    const [examinationId, setExaminationId] = useState(null);
    const [existingPrescriptionIds, setExistingPrescriptionIds] = useState([]);

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
            foodTime: "",
            remarks: "",
            instructions: "",
            medicineType: "",
            administration: "",
            quantity: "",
            dosageSchedule: "",
            subType: "",
            stockStatus: "",
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
                    const activeMedicines = medicinesList
                        .filter(m => m.status === "Active")
                        .sort((a, b) =>
                            (a.medicineName || "").localeCompare(b.medicineName || "", undefined, { sensitivity: "base" })
                        );
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
            // First, get the single prescription to get examination details
            const response = await axios.get(
                getApiUrl(`examinations/prescriptions/detail/${prescriptionId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success && response.data.data) {
                const data = response.data.data;
                const exam = data.examination;
                const examId = exam?._id || exam;

                setExaminationId(examId);

                const inpatient = exam?.inpatient;
                const patient = data.patient || exam?.patient;

                // Find inpatient in the list
                let foundInpatient = null;
                if (inpatient) {
                    const inpatientIdVal = inpatient._id || inpatient;
                    foundInpatient = inpatients.find(
                        ip => ip._id?.toString() === inpatientIdVal?.toString()
                    );
                }

                if (!foundInpatient && patient?._id) {
                    foundInpatient = inpatients.find(
                        ip => (ip.patient?._id || ip.patient)?.toString() === patient._id?.toString()
                    );
                }

                if (foundInpatient) {
                    setSelectedInpatient(foundInpatient);
                }

                // Now fetch ALL prescriptions for this examination to allow editing all at once
                if (examId) {
                    try {
                        const allPrescriptionsResponse = await axios.get(
                            getApiUrl(`examinations/${examId}/prescriptions`),
                            { headers: getAuthHeaders() }
                        );

                        if (allPrescriptionsResponse.data.success) {
                            const allPresc = allPrescriptionsResponse.data.data || [];

                            // Store existing IDs for deletion tracking
                            setExistingPrescriptionIds(allPresc.map(p => p._id));

                            // Map all to medicine format
                            const mappedMedicines = allPresc.map(p => ({
                                _id: p._id,
                                name: p.medication || "",
                                dosage: p.dosage || "",
                                frequency: p.frequency || "",
                                duration: p.duration || "",
                                foodTiming: p.foodTiming || "",
                                foodTime: p.foodTime || "",
                                remarks: p.remarks || "",
                                instructions: p.notes || "",
                                medicineType: p.medicineType || "",
                                administration: p.administration || "",
                                quantity: p.quantity?.toString() || "1",
                                dosageSchedule: p.dosageSchedule || "",
                                subType: p.subType || "",
                            }));

                            setFormData((prev) => ({
                                ...prev,
                                inpatientId: foundInpatient?._id || inpatient?._id || "",
                                patientName: patient?.user?.name || "",
                                prescriptionDate: data.createdAt
                                    ? new Date(data.createdAt).toISOString().split("T")[0]
                                    : new Date().toISOString().split("T")[0],
                                diagnosis: exam?.complaints || "",
                                notes: data.notes || "",
                                medicines: mappedMedicines,
                            }));
                        }
                    } catch (err) {
                        console.error("Error fetching all prescriptions:", err);
                        // Fallback to single prescription
                        setFormData((prev) => ({
                            ...prev,
                            inpatientId: foundInpatient?._id || inpatient?._id || "",
                            patientName: patient?.user?.name || "",
                            prescriptionDate: data.createdAt
                                ? new Date(data.createdAt).toISOString().split("T")[0]
                                : new Date().toISOString().split("T")[0],
                            diagnosis: exam?.complaints || "",
                            notes: data.notes || "",
                            medicines: [{
                                _id: data._id,
                                name: data.medication,
                                dosage: data.dosage || "",
                                frequency: data.frequency || "",
                                duration: data.duration || "",
                                foodTiming: data.foodTiming || "",
                                foodTime: data.foodTime || "",
                                remarks: data.remarks || "",
                                instructions: data.notes || "",
                                medicineType: data.medicineType || "",
                                administration: data.administration || "",
                                quantity: data.quantity?.toString() || "1",
                                dosageSchedule: data.dosageSchedule || "",
                                subType: data.subType || "",
                            }],
                        }));
                    }
                }
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
        if (!formData.currentMedicine.name) {
            toast.error("Please enter medicine name ");
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
                foodTime: "",
                remarks: "",
                instructions: "",
                dosageSchedule: "",
                subType: "",
                stockStatus: "",
            },
        }));
    };

    const handleRemoveMedicine = (index) => {
        setFormData((prev) => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index),
        }));
    };

    // const handleEditMedicine = (index) => {
    //     const medicineToEdit = formData.medicines[index];
    //     setFormData((prev) => ({
    //         ...prev,
    //         currentMedicine: {
    //             name: medicineToEdit.name,
    //             dosage: medicineToEdit.dosage,
    //             frequency: medicineToEdit.frequency,
    //             duration: medicineToEdit.duration,
    //             foodTiming: medicineToEdit.foodTiming,
    //             remarks: medicineToEdit.remarks,
    //             instructions: medicineToEdit.instructions,
    //             medicineType: medicineToEdit.medicineType,
    //             administration: medicineToEdit.administration,
    //             quantity: medicineToEdit.quantity,
    //             dosageSchedule: medicineToEdit.dosageSchedule,
    //             _id: medicineToEdit._id, // Keep the ID if it's an existing prescription
    //         },
    //         medicines: prev.medicines.filter((_, i) => i !== index),
    //     }));
    // };

    const handleEditMedicine = (index) => {
        const medicineToEdit = formData.medicines[index];
        console.log("Editing medicine:", medicineToEdit); // Debug log
        setFormData((prev) => ({
            ...prev,
            currentMedicine: {
                name: medicineToEdit.name || "",
                dosage: medicineToEdit.dosage || "",
                frequency: medicineToEdit.frequency || "",
                duration: medicineToEdit.duration || "",
                foodTiming: medicineToEdit.foodTiming || "",
                foodTime: medicineToEdit.foodTime || "",
                remarks: medicineToEdit.remarks || "",
                instructions: medicineToEdit.instructions || "",
                medicineType: medicineToEdit.medicineType || "",
                administration: medicineToEdit.administration || "",
                quantity: medicineToEdit.quantity || "",
                dosageSchedule: medicineToEdit.dosageSchedule || "",
                subType: medicineToEdit.subType || "",
                stockStatus: medicineToEdit.stockStatus || "",
                _id: medicineToEdit._id,
            },
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
                // Update existing prescriptions, create new ones, and delete removed ones
                if (formData.medicines.length === 0) {
                    toast.error("Please add at least one medicine");
                    setIsSubmitting(false);
                    return;
                }

                // Separate existing prescriptions (with _id) from new ones (without _id)
                const existingMedicines = formData.medicines.filter(m => m._id);
                const newMedicines = formData.medicines.filter(m => !m._id);

                const updatePromises = [];
                const createPromises = [];

                // Update existing
                for (const medicine of existingMedicines) {
                    const prescriptionData = {
                        medication: medicine.name,
                        dosage: medicine.dosage,
                        frequency: medicine.frequency || "As needed",
                        duration: medicine.duration || undefined,
                        foodTiming: medicine.foodTiming || undefined,
                        foodTime: medicine.foodTime || undefined,
                        dosageSchedule: medicine.dosageSchedule || undefined,
                        remarks: medicine.remarks || undefined,
                        notes: medicine.instructions || formData.notes || undefined,
                        quantity: medicine.quantity ? parseInt(medicine.quantity, 10) : 1,
                        medicineType: medicine.medicineType || undefined,
                        administration: medicine.administration || undefined,
                        diagnosis: formData.diagnosis || undefined,
                        subType: medicine.subType || undefined,
                    };

                    updatePromises.push(
                        axios.patch(
                            getApiUrl(`examinations/prescriptions/${medicine._id}`),
                            prescriptionData,
                            { headers: getAuthHeaders() }
                        )
                    );
                }

                // Create new
                if (examinationId) {
                    for (const medicine of newMedicines) {
                        const prescriptionData = {
                            medication: medicine.name,
                            dosage: medicine.dosage,
                            frequency: medicine.frequency || "As needed",
                            duration: medicine.duration || undefined,
                            foodTiming: medicine.foodTiming || undefined,
                            foodTime: medicine.foodTime || undefined,
                            dosageSchedule: medicine.dosageSchedule || undefined,
                            remarks: medicine.remarks || undefined,
                            notes: medicine.instructions || formData.notes || undefined,
                            quantity: medicine.quantity ? parseInt(medicine.quantity, 10) : 1,
                            medicineType: medicine.medicineType || undefined,
                            administration: medicine.administration || undefined,
                            isInpatient: true,
                            billOnDischarge: true,
                            subType: medicine.subType || undefined,
                        };

                        createPromises.push(
                            axios.post(
                                getApiUrl(`examinations/${examinationId}/prescriptions`),
                                prescriptionData,
                                { headers: getAuthHeaders() }
                            )
                        );
                    }
                }

                // Identify removed medicines to delete
                const currentMedicineIds = new Set(existingMedicines.map(m => m._id));
                const deletePromises = existingPrescriptionIds
                    .filter(id => !currentMedicineIds.has(id))
                    .map(id =>
                        axios.delete(
                            getApiUrl(`examinations/prescriptions/${id}`),
                            { headers: getAuthHeaders() }
                        )
                    );

                await Promise.all([...updatePromises, ...createPromises, ...deletePromises]);

                toast.success("IPD Prescription updated successfully!");
                setTimeout(() => {
                    navigate("/doctor/ipd-prescriptions");
                }, 1500);
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
                        foodTime: medicine.foodTime || undefined,
                        dosageSchedule: medicine.dosageSchedule || undefined,
                        remarks: medicine.remarks || undefined,
                        notes: medicine.instructions || formData.notes || undefined,
                        quantity: medicine.quantity ? parseInt(medicine.quantity, 10) : 1,
                        medicineType: medicine.medicineType || undefined,
                        administration: medicine.administration || undefined,
                        isInpatient: true, // Mark as IPD prescription
                        billOnDischarge: true, // Bill on discharge for inpatients
                        subType: medicine.subType || undefined,
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
                title={isEditMode ? "Edit IPD Prescription" : "Create IPD Prescription "}
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
                                        label="Select Inpatient"
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
                                label="Prescription Date"
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
                                Medicines
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box>
                                {/* Medicine Input Form */}
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    {/* First Row: Medicine Name, Dosage, Frequency, Duration, Food Timing, Add Button */}
                                    <Grid item xs={12} md={3}>
                                        <Autocomplete
                                            options={medicines}
                                            getOptionLabel={(option) => typeof option === 'string' ? option : option.medicineName || ""}
                                            value={medicines.find(m => m.medicineName === formData.currentMedicine.name) || null}
                                            onChange={(event, newValue) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    currentMedicine: {
                                                        ...prev.currentMedicine,
                                                        name: newValue ? newValue.medicineName : "",
                                                        stockStatus: newValue ? newValue.stockStatus : "",
                                                    },
                                                }));
                                            }}
                                            loading={isLoadingMedicines}
                                            size="small"
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Medicine Name"
                                                    placeholder="Select medicine"
                                                    required={formData.medicines.length === 0}
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.medicineName === value.medicineName}
                                        />
                                        {formData.currentMedicine.stockStatus && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    mt: 0.5,
                                                    display: "block",
                                                    fontWeight: 600,
                                                    color:
                                                        formData.currentMedicine.stockStatus === "In Stock"
                                                            ? "success.main"
                                                            : formData.currentMedicine.stockStatus === "Low Stock"
                                                                ? "warning.main"
                                                                : "error.main",
                                                }}
                                            >
                                                Stock Status: {formData.currentMedicine.stockStatus}
                                            </Typography>
                                        )}
                                    </Grid>
                                    {/* <Grid item xs={12} md={2}>
                                            <TextField
                                                fullWidth
                                                label="Dosage"
                                                value={formData.currentMedicine.dosage}
                                                onChange={(e) => handleMedicineFieldChange("dosage", e.target.value)}
                                                size="small"
                                                required={formData.medicines.length === 0}
                                            />
                                        </Grid> */}
                                    <Grid item xs={12} md={2}>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            label="Dosage"
                                            value={formData.currentMedicine.dosage}
                                            onChange={(e) => handleMedicineFieldChange("dosage", e.target.value)}
                                            size="small"
                                            inputProps={{ min: 1 }}
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
                                                {foodTimingOptions.map((option) => (
                                                    <MenuItem key={option} value={option}>
                                                        {option}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Food Time"
                                            value={formData.currentMedicine.foodTime}
                                            onChange={(e) => handleMedicineFieldChange("foodTime", e.target.value)}
                                            placeholder="Food time"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Dosage Schedule</InputLabel>
                                            <Select
                                                value={formData.currentMedicine.dosageSchedule}
                                                onChange={(e) => handleMedicineFieldChange("dosageSchedule", e.target.value)}
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
                                    <Grid item xs={12} md={2}>
                                        <Autocomplete
                                            freeSolo
                                            options={subtypeOptions}
                                            value={formData.currentMedicine.subType || ""}
                                            onInputChange={(event, newValue) => {
                                                handleMedicineFieldChange("subType", newValue);
                                            }}
                                            onChange={(event, newValue) => {
                                                handleMedicineFieldChange("subType", newValue || "");
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Subtypes"
                                                    placeholder="Select or enter subtype"
                                                    size="small"
                                                />
                                            )}
                                        />
                                    </Grid>
                                    {/* Remarks and Special Instructions - Outside the box, stacked vertically */}
                                    <Grid container spacing={2} sx={{ mt: 2, mx: 0 }}>
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

                                    <Grid item xs={12} md={1}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={handleAddMedicine}
                                            size="small"
                                            sx={{ height: "40px" }}
                                        >
                                            {formData.currentMedicine._id ? "Update" : "Add"}
                                        </Button>
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
                                                        {medicine.foodTime && ` - Food Time: ${medicine.foodTime}`}
                                                        {medicine.dosageSchedule && ` - Schedule: ${medicine.dosageSchedule}`}
                                                        {medicine.subType && ` - Subtype: ${medicine.subType}`}
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
                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleEditMedicine(index)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRemoveMedicine(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
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

