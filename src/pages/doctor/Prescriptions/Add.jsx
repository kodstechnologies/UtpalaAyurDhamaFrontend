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
        suggestion: "Take in the morning and night (Before breakfast and before sleep)",
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

function PrescriptionsAddPage() {
    const navigate = useNavigate();
    const { id: prescriptionId } = useParams();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId") || "";
    const patientName = searchParams.get("patientName") || "";
    const uhidParam = searchParams.get("uhid") || "";
    const isEditMode = !!prescriptionId;
    const { user } = useSelector((state) => state.auth);

    const [opdPatients, setOpdPatients] = useState([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);
    const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);
    const [examinationId, setExaminationId] = useState(null);
    const [existingPrescriptionIds, setExistingPrescriptionIds] = useState([]);
    const [editingMedicineIndex, setEditingMedicineIndex] = useState(null);

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
            foodTime: "",
            remarks: "",
            instructions: "",
            dosageSchedule: "",
            subType: "",
            stockStatus: "",
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
                        } else {
                            const newPatient = {
                                _id: patientId,
                                user: { name: patientName, uhid: uhidParam },
                                patientId: patientId
                            };
                            setSelectedPatient(newPatient);
                            setOpdPatients((prev) => [...prev, newPatient]);
                            setFormData((prev) => ({
                                ...prev,
                                patientId: uhidParam || patientId,
                                patientName: patientName,
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
    useEffect(() => {
        const fetchPrescription = async () => {
            if (!prescriptionId) return;

            setIsLoadingPrescription(true);
            try {
                // First, get the single prescription to get examination ID
                const response = await axios.get(
                    getApiUrl(`examinations/prescriptions/detail/${prescriptionId}`),
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    const data = response.data.data;
                    const examId = data.examination?._id || data.examination;

                    // Set examination ID
                    setExaminationId(examId);

                    // Set patient information
                    const patient = data.patient || data.examination?.patient;
                    if (patient) {
                        const foundPatient = {
                            _id: patient._id,
                            patientId: patient.user?.uhid || patient.patientId || patient._id,
                            user: patient.user,
                        };
                        setSelectedPatient(foundPatient);
                        setOpdPatients((prev) => {
                            const exists = prev.some(p => p._id === foundPatient._id);
                            return exists ? prev : [...prev, foundPatient];
                        });
                        setFormData((prev) => ({
                            ...prev,
                            patientId: foundPatient.patientId || foundPatient._id,
                            patientName: foundPatient.user?.name || "",
                        }));
                    }

                    // Now fetch ALL prescriptions for this examination
                    if (examId) {
                        try {
                            const allPrescriptionsResponse = await axios.get(
                                getApiUrl(`examinations/${examId}/prescriptions`),
                                { headers: getAuthHeaders() }
                            );

                            if (allPrescriptionsResponse.data.success) {
                                const allPrescriptions = allPrescriptionsResponse.data.data || [];

                                // Store existing prescription IDs
                                const prescriptionIds = allPrescriptions.map(p => p._id);
                                setExistingPrescriptionIds(prescriptionIds);

                                // Convert all prescriptions to medicine format
                                const prescriptionMedicines = allPrescriptions.map(prescription => ({
                                    _id: prescription._id, // Store prescription ID for updates
                                    name: prescription.medication || "",
                                    dosage: prescription.dosage || "",
                                    frequency: prescription.frequency || "",
                                    duration: prescription.duration || "",
                                    foodTiming: prescription.foodTiming || "",
                                    foodTime: prescription.foodTime || "",
                                    remarks: prescription.remarks || "",
                                    instructions: prescription.notes || "",
                                    dosageSchedule: prescription.dosageSchedule || "",
                                    subType: prescription.subType || "",
                                }));

                                setFormData((prev) => ({
                                    ...prev,
                                    prescriptionDate: data.createdAt
                                        ? new Date(data.createdAt).toISOString().split("T")[0]
                                        : new Date().toISOString().split("T")[0],
                                    diagnosis: data.examination?.complaints || "",
                                    notes: data.notes || "",
                                    medicines: prescriptionMedicines,
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
                                    },
                                }));
                            }
                        } catch (error) {
                            console.error("Error fetching all prescriptions:", error);
                            // Fallback to single prescription if fetching all fails
                            const prescriptionMedicine = data.medication ? {
                                _id: data._id,
                                name: data.medication,
                                dosage: data.dosage || "",
                                frequency: data.frequency || "",
                                duration: data.duration || "",
                                foodTiming: data.foodTiming || "",
                                foodTime: data.foodTime || "",
                                remarks: data.remarks || "",
                                instructions: data.notes || "",
                                dosageSchedule: data.dosageSchedule || "",
                                subType: data.subType || "",
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
                        }
                    } else {
                        // Fallback if no examination ID
                        const prescriptionMedicine = data.medication ? {
                            _id: data._id,
                            name: data.medication,
                            dosage: data.dosage || "",
                            frequency: data.frequency || "",
                            duration: data.duration || "",
                            foodTiming: data.foodTiming || "",
                            foodTime: data.foodTime || "",
                            remarks: data.remarks || "",
                            instructions: data.notes || "",
                            dosageSchedule: data.dosageSchedule || "",
                            subType: data.subType || "",
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
                    }
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

    const emptyMedicine = () => ({
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
    });

    const handleAddMedicine = () => {
        if (!formData.currentMedicine.name) {
            toast.error("Please enter medicine name and dosage");
            return;
        }

        const medicineEntry = { ...formData.currentMedicine };

        setFormData((prev) => {
            let updatedMedicines;

            if (editingMedicineIndex !== null) {
                updatedMedicines = [...prev.medicines];
                updatedMedicines[editingMedicineIndex] = medicineEntry;
            } else {
                updatedMedicines = [...prev.medicines, medicineEntry];
            }

            return {
                ...prev,
                medicines: updatedMedicines,
                currentMedicine: emptyMedicine(),
            };
        });
        setEditingMedicineIndex(null);
    };

    const handleRemoveMedicine = (index) => {
        if (editingMedicineIndex === index) {
            setEditingMedicineIndex(null);
            setFormData((prev) => ({
                ...prev,
                medicines: prev.medicines.filter((_, i) => i !== index),
                currentMedicine: emptyMedicine(),
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index),
        }));

        if (editingMedicineIndex !== null && index < editingMedicineIndex) {
            setEditingMedicineIndex(editingMedicineIndex - 1);
        }
    };

    const handleEditMedicine = (index) => {
        const medicineToEdit = formData.medicines[index];
        setEditingMedicineIndex(index);
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
        }));
    };

    const createNewExamination = async (patientProfileId) => {
        const createExamResponse = await axios.post(
            getApiUrl("examinations"),
            {
                patient: patientProfileId,
                complaints: formData.diagnosis || "Prescription consultation",
                forceNew: true,
            },
            { headers: getAuthHeaders() }
        );

        if (createExamResponse.data.success) {
            return createExamResponse.data.data._id;
        }

        return null;
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
                // Handle multiple medicines in edit mode
                if (formData.medicines.length === 0) {
                    toast.error("Please add at least one medicine");
                    setIsSubmitting(false);
                    return;
                }

                if (!examinationId) {
                    toast.error("Examination ID not found. Please reload the page.");
                    setIsSubmitting(false);
                    return;
                }

                // Separate existing prescriptions (with _id) from new ones (without _id)
                const existingMedicines = formData.medicines.filter(m => m._id);
                const newMedicines = formData.medicines.filter(m => !m._id);

                const updatePromises = [];
                const createPromises = [];

                // Update existing prescriptions
                // Only include diagnosis in the first update to avoid multiple examination updates
                let isFirstUpdate = true;
                for (const medicine of existingMedicines) {
                    if (!medicine.name || !medicine.dosage) {
                        continue; // Skip invalid medicines
                    }

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
                        quantity: 1,
                        subType: medicine.subType || undefined,
                    };

                    // Only include diagnosis in the first prescription update
                    if (isFirstUpdate && formData.diagnosis) {
                        prescriptionData.diagnosis = formData.diagnosis;
                        isFirstUpdate = false;
                    }

                    updatePromises.push(
                        axios.patch(
                            getApiUrl(`examinations/prescriptions/${medicine._id}`),
                            prescriptionData,
                            { headers: getAuthHeaders() }
                        )
                    );
                }

                // Create new prescriptions
                for (const medicine of newMedicines) {
                    if (!medicine.name || !medicine.dosage) {
                        continue; // Skip invalid medicines
                    }

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
                        quantity: 1,
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

                // Identify medicines to delete
                const currentMedicineIds = new Set(existingMedicines.map(m => m._id));
                const deletePromises = existingPrescriptionIds
                    .filter(id => !currentMedicineIds.has(id))
                    .map(id =>
                        axios.delete(
                            getApiUrl(`examinations/prescriptions/${id}`),
                            { headers: getAuthHeaders() }
                        )
                    );

                // Execute all updates, creates, and deletions in parallel
                await Promise.all([...updatePromises, ...createPromises, ...deletePromises]);

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

                // Always create a new examination so each prescription save is a separate entry
                let examinationId;
                try {
                    examinationId = await createNewExamination(patientProfileId);
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
                        foodTime: medicine.foodTime || undefined,
                        dosageSchedule: medicine.dosageSchedule || undefined,
                        remarks: medicine.remarks || undefined,
                        notes: medicine.instructions || formData.notes || undefined,
                        quantity: 1, // Default quantity
                        subType: medicine.subType || undefined,
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
                            Add Medicines  <span style={{ color: "red" }}>*</span>
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
                                <Grid item xs={12} sm={6} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Dosage"
                                        value={formData.currentMedicine.dosage}
                                        onChange={(e) => handleMedicineFieldChange("dosage", e.target.value)}
                                        placeholder=""
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
                                            {foodTimingOptions.map((option) => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Food Time"
                                        value={formData.currentMedicine.foodTime}
                                        onChange={(e) => handleMedicineFieldChange("foodTime", e.target.value)}
                                        placeholder="Food time"
                                    />
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
                                <Grid item xs={12} sm={6} md={2}>
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
                                {/* Remarks and Instructions - Outside the box, stacked vertically */}

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
                                <Grid item xs={12} sm={6} md={1}>
                                    <Button
                                        variant="contained"
                                        onClick={handleAddMedicine}
                                        fullWidth
                                        sx={{ height: "40px" }}
                                    >
                                        {editingMedicineIndex !== null ? "Update" : "Add"}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>



                        {/* Added Medicines List */}
                        {formData.medicines.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Added Medicines:
                                </Typography>
                                {formData.medicines.map((medicine, index) => (
                                    <Box
                                        key={medicine._id || `new-${index}`}
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
                                                {medicine.foodTime && ` • Food Time: ${medicine.foodTime}`}
                                                {medicine.dosageSchedule && ` • Schedule: ${medicine.dosageSchedule}`}
                                                {medicine.subType && ` • Subtype: ${medicine.subType}`}
                                                {medicine.remarks && ` • Remarks: ${medicine.remarks}`}
                                                {medicine.instructions && ` • ${medicine.instructions}`}
                                            </Typography>
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