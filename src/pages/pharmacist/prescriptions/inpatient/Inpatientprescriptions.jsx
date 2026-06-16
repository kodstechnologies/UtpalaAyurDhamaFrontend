import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Typography,
    Grid,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Divider,
    Paper,
    Chip,
    Stack,
    alpha,
    useTheme,
    Container,
    Card,
    CardContent,
    CircularProgress,
    Tooltip,
    TableContainer,
    Checkbox,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import {
    LocalPharmacy,
    ArrowBack,
    Print,
    Download,
    CheckCircle,
    Pending,
    Medication,
    Person,
    CalendarToday,
    Female,
    Male,
    LocalHotel,
    LocalHospital,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";

import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../../components/card/HeadingCard";
import prescriptionService from "../../../../services/prescriptionService";
import medicineService from "../../../../services/medicineService";
import { getApiUrl, getAuthHeaders } from "../../../../config/api";
import {
    getPrescribedQuantity,
    getRemainingPrescriptionQuantity,
    isPrescriptionFullyDispensed,
    parsePrescriptionNumeric,
} from "../../../../utils/prescriptionQuantity";

function Inpatientprescriptions() {
    const { id } = useParams(); // examinationId
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const navigate = useNavigate();
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [isDispensing, setIsDispensing] = useState(false);
    const [prescriptions, setPrescriptions] = useState([]);
    const [patient, setPatient] = useState(null);
    const [examination, setExamination] = useState(null);
    const [inpatient, setInpatient] = useState(null);
    // State for selected medicines and quantities
    const [selectedMedicines, setSelectedMedicines] = useState({}); // { prescriptionId: { selected: boolean, quantity: number } }
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingSelectedPrescriptions, setPendingSelectedPrescriptions] = useState([]);
    const [pendingDispenseSelection, setPendingDispenseSelection] = useState({});
    const [gst, setGst] = useState(0);
    // State for available medicines
    const [availableMedicines, setAvailableMedicines] = useState([]); // Array of medicine names from medicine collection
    const [medicinesMap, setMedicinesMap] = useState({}); // Map of medicine name to medicine object (for getting sellPrice)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch prescriptions and medicines in parallel
                const [prescriptionResponse, medicinesResponse] = await Promise.all([
                    prescriptionService.getPrescriptionsByExamination(id),
                    medicineService.getAllMedicines({ page: 1, limit: 1000 }), // Fetch all medicines
                ]);

                if (prescriptionResponse && prescriptionResponse.success && prescriptionResponse.data) {
                    const prescList = Array.isArray(prescriptionResponse.data) ? prescriptionResponse.data : [];
                    setPrescriptions(prescList);

                    if (prescList.length > 0) {
                        const firstPresc = prescList[0];
                        setPatient(firstPresc.patient);
                        setExamination(firstPresc.examination);
                        // For inpatient, check if examination has inpatient data
                        if (firstPresc.examination?.inpatient) {
                            // Backend now populates inpatient with roomNumber, wardCategory, etc.
                            const inpatientData = firstPresc.examination.inpatient;
                            if (typeof inpatientData === 'object' && inpatientData._id) {
                                // It's a populated object - use it directly
                                setInpatient(inpatientData);
                            } else {
                                // Fallback: If not populated (shouldn't happen with backend fix), try to fetch separately
                                console.warn("Inpatient data is not populated, fetching separately...");
                                if (firstPresc.patient?._id) {
                                    try {
                                        const inpatientRes = await axios.get(
                                            getApiUrl(`inpatients/patient/${firstPresc.patient._id}`),
                                            { headers: getAuthHeaders() }
                                        );
                                        if (inpatientRes.data.success) {
                                            const inpatients = Array.isArray(inpatientRes.data.data)
                                                ? inpatientRes.data.data
                                                : [inpatientRes.data.data];
                                            const activeInpatient = inpatients.find(ip => ip.status === "Admitted") || inpatients[0];
                                            if (activeInpatient) {
                                                setInpatient(activeInpatient);
                                            }
                                        }
                                    } catch (err) {
                                        console.error("Error fetching inpatient data:", err);
                                    }
                                }
                            }
                        }

                        // Initialize selected medicines state for all prescriptions (including dispensed ones for display)
                        const initialSelection = {};
                        prescList.forEach((presc) => {
                            initialSelection[presc._id] = {
                                selected: presc.status !== "Dispensed" ? false : false,
                                quantity: "", // Start with empty string - pharmacist will fill it
                            };
                        });
                        setSelectedMedicines(initialSelection);
                    }
                } else {
                    toast.error("Failed to fetch prescription details");
                    navigate("/pharmacist/prescriptions/inpatient");
                }

                // Store available medicines
                if (medicinesResponse && medicinesResponse.success && medicinesResponse.data) {
                    const medicines = Array.isArray(medicinesResponse.data.medicines)
                        ? medicinesResponse.data.medicines
                        : Array.isArray(medicinesResponse.data.data)
                            ? medicinesResponse.data.data
                            : [];
                    // Create a map of medicine names (case-insensitive)
                    const medicineNames = medicines.map((med) => med.medicineName?.toLowerCase().trim()).filter(Boolean);
                    setAvailableMedicines(medicineNames);

                    // Create a map of medicine name to medicine object for quick lookup
                    // Use normalized names to handle case and space variations
                    const medicinesMapObj = {};
                    medicines.forEach((med) => {
                        if (med.medicineName) {
                            const normalizedName = med.medicineName.toLowerCase().trim().replace(/\s+/g, " ");
                            medicinesMapObj[normalizedName] = med;
                            // Also store original name mapping for fallback
                            medicinesMapObj[med.medicineName.toLowerCase().trim()] = med;
                        }
                    });
                    setMedicinesMap(medicinesMapObj);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error(error?.response?.data?.message || "Failed to fetch prescription details");
                navigate("/pharmacist/prescriptions/inpatient");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, navigate]);

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        const dob = new Date(dateOfBirth);
        const diff = Date.now() - dob.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Normalize medicine name for comparison (handles case, spaces, special chars)
    const normalizeMedicineName = (name) => {
        if (!name) return "";
        // Convert to lowercase, trim, and remove extra spaces
        return name.toLowerCase().trim().replace(/\s+/g, " ");
    };

    // Check if a medicine is available (handles case mismatch and spaces)
    const isMedicineAvailable = (medicineName) => {
        if (!medicineName) return false;
        const normalizedPrescribed = normalizeMedicineName(medicineName);

        // Check exact match first
        if (availableMedicines.includes(normalizedPrescribed)) {
            return true;
        }

        // Check if any available medicine matches (handles partial matches and variations)
        return availableMedicines.some((availableName) => {
            // Exact match after normalization
            if (normalizedPrescribed === availableName) return true;

            // Check if prescribed name contains available name or vice versa (for partial matches)
            // e.g., "Paracetamol 500mg" matches "Paracetamol"
            const prescribedWords = normalizedPrescribed.split(/\s+/);
            const availableWords = availableName.split(/\s+/);

            // If one is a subset of the other, consider it a match
            const allPrescribedWordsInAvailable = prescribedWords.every(word =>
                availableWords.some(aw => aw.includes(word) || word.includes(aw))
            );
            const allAvailableWordsInPrescribed = availableWords.every(word =>
                prescribedWords.some(pw => pw.includes(word) || word.includes(pw))
            );

            return allPrescribedWordsInAvailable || allAvailableWordsInPrescribed;
        });
    };

    // Find medicine in map (handles case mismatch and spaces)
    const findMedicineInMap = (medicineName) => {
        if (!medicineName) return null;
        const normalizedPrescribed = normalizeMedicineName(medicineName);

        // Try exact match first
        if (medicinesMap[normalizedPrescribed]) {
            return medicinesMap[normalizedPrescribed];
        }

        // Try to find by matching keys
        for (const [key, medicine] of Object.entries(medicinesMap)) {
            const normalizedKey = normalizeMedicineName(key);
            if (normalizedPrescribed === normalizedKey) {
                return medicine;
            }

            // Check for partial matches
            const prescribedWords = normalizedPrescribed.split(/\s+/);
            const keyWords = normalizedKey.split(/\s+/);

            // If medicine name words match, consider it a match
            const allPrescribedWordsInKey = prescribedWords.every(word =>
                keyWords.some(kw => kw.includes(word) || word.includes(kw))
            );
            const allKeyWordsInPrescribed = keyWords.every(word =>
                prescribedWords.some(pw => pw.includes(word) || word.includes(pw))
            );

            if (allPrescribedWordsInKey || allKeyWordsInPrescribed) {
                return medicine;
            }
        }

        return null;
    };

    const parseQuantity = parsePrescriptionNumeric;

    const getRemainingQuantity = getRemainingPrescriptionQuantity;

    const getMaxDispenseQty = (presc) => {
        const remaining = getRemainingQuantity(presc);
        const medicine = findMedicineInMap(presc.medication);
        const stock = Number(medicine?.quantity) || 0;
        return Math.min(remaining, stock);
    };

    const getSellPrice = (medicineName, presc) => {
        const medicine = findMedicineInMap(medicineName);
        if (medicine?.sellPrice) return Number(medicine.sellPrice);
        if (presc?.unitPrice) return Number(presc.unitPrice);
        return 0;
    };

    const calculateAmount = (medicineName, dispenseQty, presc) => {
        if (!medicineName || !dispenseQty) return "0.00";
        const price = getSellPrice(medicineName, presc);
        if (!price) return "0.00";
        const qty = parseQuantity(dispenseQty);
        return (price * qty).toFixed(2);
    };

    const getSelectedDispenseTotal = (selection = selectedMedicines) => {
        return prescriptions.reduce((sum, presc) => {
            const selected = selection[presc._id];
            if (!selected?.selected || getRemainingQuantity(presc) <= 0) return sum;
            const qty = selected.quantity;
            if (!qty || String(qty).trim() === "") return sum;
            return sum + (parseFloat(calculateAmount(presc.medication, qty, presc)) || 0);
        }, 0);
    };

    const calculateConfirmTotals = (selection = pendingDispenseSelection) => {
        const subtotal = getSelectedDispenseTotal(selection);
        const gstAmount = (subtotal * gst) / 100;
        const total = subtotal + gstAmount;
        return {
            subtotal: subtotal.toFixed(2),
            gstAmount: gstAmount.toFixed(2),
            total: total.toFixed(2),
        };
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    // if (!patient || prescriptions.length === 0) {
    //     return (
    //         <Container maxWidth="lg" sx={{ py: 3 }}>
    //             <Box sx={{ textAlign: "center", py: 5 }}>
    //                 <Typography variant="h6" color="text.secondary">
    //                     No prescription data found
    //                 </Typography>
    //                 <Button
    //                     variant="outlined"
    //                     onClick={() => navigate("/pharmacist/prescriptions/inpatient")}
    //                     sx={{ mt: 2 }}
    //                 >
    //                     Back to Prescriptions
    //                 </Button>
    //             </Box>
    //         </Container>
    //     );
    // }

    const patientName = patient?.user?.name || "Unknown";
    const patientAge = calculateAge(patient?.dateOfBirth) || 0;
    const patientGender = patient?.gender || "N/A";
    const doctorName = prescriptions[0]?.doctor?.user?.name || "Unknown";
    // Get diagnosis - prefer diagnoses array, fallback to complaints
    const diagnosis = examination?.diagnoses?.length > 0
        ? examination.diagnoses.join(", ")
        : examination?.complaints || "N/A";
    const prescriptionDate = examination?.createdAt || prescriptions[0]?.createdAt;
    // Check if all prescriptions are dispensed
    const allDispensed = prescriptions.every(isPrescriptionFullyDispensed);
    const status = allDispensed ? "Dispensed" : "Pending";
    const roomNumber = inpatient?.roomNumber || "N/A";
    const wardCategory = inpatient?.wardCategory || "N/A";
    const admissionDate = inpatient?.admissionDate;

    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist/dashboard" },
        { label: "Inpatient Prescriptions", url: "/pharmacist/prescriptions/inpatient" },
        { label: patientName },
    ];

    const handleMedicineSelect = (prescriptionId, selected) => {
        setSelectedMedicines((prev) => ({
            ...prev,
            [prescriptionId]: {
                selected,
                quantity: selected ? (prev[prescriptionId]?.quantity || "") : "",
            },
        }));
    };

    const handleQuantityChange = (prescriptionId, quantity) => {
        const presc = prescriptions.find((p) => p._id === prescriptionId);
        const remaining = getRemainingQuantity(presc);
        const requestedQty = parseQuantity(quantity);

        if (requestedQty > remaining) {
            toast.error(`Dispense quantity cannot exceed remaining quantity (${remaining})`);
            return;
        }

        const maxQty = getMaxDispenseQty(presc);
        if (requestedQty > 0 && maxQty > 0 && requestedQty > maxQty) {
            toast.warning(`Only ${maxQty} available in stock. Quantity adjusted.`);
            setSelectedMedicines((prev) => ({
                ...prev,
                [prescriptionId]: {
                    selected: prev[prescriptionId]?.selected || false,
                    quantity: String(maxQty),
                },
            }));
            return;
        }

        setSelectedMedicines((prev) => ({
            ...prev,
            [prescriptionId]: {
                selected: prev[prescriptionId]?.selected || false,
                quantity: quantity || "",
            },
        }));
    };

    const handleDispense = async (e, options = {}) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        let workingSelection = { ...selectedMedicines };

        if (options.dispenseAll) {
            const pendingPrescriptions = prescriptions.filter(
                (p) => getRemainingQuantity(p) > 0 && isMedicineAvailable(p.medication)
            );
            pendingPrescriptions.forEach((p) => {
                workingSelection[p._id] = {
                    selected: true,
                    quantity: String(getMaxDispenseQty(p)),
                };
            });
            setSelectedMedicines(workingSelection);
        }

        if (prescriptions.length === 0) {
            toast.error("No prescriptions to dispense");
            return;
        }

        const selectedPrescriptions = prescriptions.filter((p) => {
            return getRemainingQuantity(p) > 0 && workingSelection[p._id]?.selected;
        });

        if (selectedPrescriptions.length === 0) {
            toast.error(
                options.dispenseAll
                    ? "No remaining medicines available to dispense."
                    : "Please select the medicines you want to dispense by checking the checkbox for each one."
            );
            return;
        }

        const unavailableMedicines = selectedPrescriptions.filter((p) => !isMedicineAvailable(p.medication));
        if (unavailableMedicines.length > 0) {
            const unavailableNames = unavailableMedicines.map((p) => p.medication).join(", ");
            toast.error(
                `Cannot dispense unavailable medicines: ${unavailableNames}. Please unselect them or add them to the medicine collection first.`
            );
            return;
        }

        const newSelection = { ...workingSelection };
        const invalidQuantityMedicines = [];

        selectedPrescriptions.forEach((p) => {
            const selected = newSelection[p._id];
            const qty = parseQuantity(selected?.quantity);
            if (!selected?.quantity || String(selected.quantity).trim() === "" || qty <= 0) {
                invalidQuantityMedicines.push(p.medication);
            }
        });

        if (invalidQuantityMedicines.length > 0) {
            toast.error(
                `Enter how many units to dispense now (e.g. 2 or 3) for: ${invalidQuantityMedicines.join(", ")}`
            );
            return;
        }

        const cappedMedicines = [];
        const zeroQuantityMedicines = [];
        for (const presc of selectedPrescriptions) {
            const selected = newSelection[presc._id];
            const requestedQty = parseQuantity(selected.quantity);
            const maxQty = getMaxDispenseQty(presc);

            if (maxQty <= 0) {
                cappedMedicines.push(presc.medication);
                continue;
            }

            const actualQty = Math.min(requestedQty, maxQty);
            if (actualQty <= 0) {
                zeroQuantityMedicines.push(presc.medication);
                continue;
            }

            if (actualQty < requestedQty) {
                toast.info(`${presc.medication}: dispensing ${actualQty} (limited by stock/remaining)`);
            }

            newSelection[presc._id] = {
                ...selected,
                quantity: String(actualQty),
            };
        }

        if (zeroQuantityMedicines.length > 0) {
            toast.error(`Dispense quantity must be greater than 0 for: ${zeroQuantityMedicines.join(", ")}`);
            return;
        }

        if (cappedMedicines.length > 0) {
            cappedMedicines.forEach((medicineName) => {
                toast.error(`${medicineName} has no remaining stock to dispense`);
            });
            return;
        }

        setSelectedMedicines(newSelection);
        setPendingDispenseSelection(newSelection);
        setPendingSelectedPrescriptions(selectedPrescriptions);
        setConfirmDialogOpen(true);
    };

    const refreshPrescriptions = async () => {
        const response = await prescriptionService.getPrescriptionsByExamination(id);
        if (response && response.success && response.data) {
            const prescList = Array.isArray(response.data) ? response.data : [];
            setPrescriptions(prescList);

            const newSelection = {};
            prescList.forEach((presc) => {
                if (getRemainingQuantity(presc) > 0) {
                    newSelection[presc._id] = {
                        selected: false,
                        quantity: "",
                    };
                }
            });
            setSelectedMedicines(newSelection);
        }
    };

   const handleDispenseConfirm = async () => {
    setConfirmDialogOpen(false);

    const selectedPrescriptions = pendingSelectedPrescriptions;

    if (!selectedPrescriptions || selectedPrescriptions.length === 0) return;

    setIsDispensing(true);

    try {
        const updates = selectedPrescriptions.map((presc) => {
            const selected = pendingDispenseSelection[presc._id] || selectedMedicines[presc._id];
            return {
                prescriptionId: presc._id,
                dispensedQuantity: selected.quantity,
                gst,
            };
        });

        const response = await axios.post(
            getApiUrl("examinations/prescriptions/bulk-dispense"),
            { updates },
            { headers: getAuthHeaders() }
        );

        const billId = response?.data?.data?._id;
        const displayPatientId = patient?.patientId || patientId;

        toast.success(
            `${selectedPrescriptions.length} medicine(s) dispensed. Redirecting to bill for payment.`
        );

        if (billId) {
            navigate(
                `/pharmacist/prescriptions/list/${billId}?patientId=${encodeURIComponent(displayPatientId || "")}`
            );
        } else {
            await refreshPrescriptions();
        }
    } catch (error) {
        console.error("Error dispensing prescriptions:", error);
        toast.error(
            error?.response?.data?.message ||
            error?.message ||
            "Failed to dispense medicines. Please try again."
        );
    } finally {
        setIsDispensing(false);
    }
};

 

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Breadcrumb items={breadcrumbItems} />
            </Box>

            <Box sx={{ mb: 4 }}>
                <HeadingCard
                    title={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <LocalHospital sx={{ color: theme.palette.primary.main }} />
                            <span>Inpatient Prescription</span>
                            <Chip
                                label={status === "Dispensed" ? "Dispensed" : "Pending"}
                                color={status === "Dispensed" ? "success" : "warning"}
                                size="small"
                                icon={status === "Dispensed" ? <CheckCircle /> : <Pending />}
                                sx={{ ml: 1 }}
                            />
                        </Box>
                    }
                    subtitle="Review inpatient details and dispense prescribed medicines. Patient is currently admitted."
                    action={
                        <Stack direction="row" spacing={1}>
                            {/* <Button
                                variant="outlined"
                                startIcon={<Print />}
                                onClick={handlePrint}
                                sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                            >
                                Print
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={handleDownload}
                                sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                            >
                                Download
                            </Button> */}
                            {status !== "Dispensed" && (
                                <Button
                                    variant="outlined"
                                    startIcon={<ArrowBack />}
                                    onClick={() => navigate("/pharmacist/prescriptions/inpatient")}
                                    sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                                >
                                    Back
                                </Button>
                            )}
                        </Stack>
                    }
                    sx={{
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: 2,
                    }}
                />
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Person fontSize="small" />
                                Inpatient Information
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Full Name" value={patientName} icon={<Person fontSize="small" />} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard
                                        label="UHID"
                                        value={patient?.user?.uhid || "N/A"}
                                        sx={{
                                            backgroundColor: alpha(theme.palette.info.main, 0.05),
                                            borderLeft: `3px solid ${theme.palette.info.main}`,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard
                                        label="Room No"
                                        value={roomNumber}
                                        icon={<LocalHotel fontSize="small" />}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard
                                        label="Ward"
                                        value={wardCategory}
                                        icon={<LocalHospital fontSize="small" />}
                                    />
                                </Grid>
                                {admissionDate && (
                                    <Grid item xs={12} sm={6} md={4}>
                                        <DetailCard
                                            label="Admission Date"
                                            value={formatDate(admissionDate)}
                                            icon={<CalendarToday fontSize="small" />}
                                        />
                                    </Grid>
                                )}
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Consulting Doctor" value={doctorName} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Prescription Date" value={formatDate(prescriptionDate)} icon={<CalendarToday fontSize="small" />} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1,
                                            backgroundColor: alpha(theme.palette.warning.main, 0.05),
                                            borderLeft: `3px solid ${theme.palette.warning.main}`,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                            Diagnosis
                                        </Typography>
                                        <Typography
                                            fontWeight={600}
                                            fontSize="0.95rem"
                                            sx={{
                                                wordBreak: "break-word",
                                                overflowWrap: "break-word",
                                                whiteSpace: "normal",
                                                maxWidth: "100%",
                                            }}
                                        >
                                            {diagnosis || "N/A"}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                                <Typography variant="h6" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Medication fontSize="small" />
                                    Prescribed Medicines
                                </Typography>
                                <Chip label={`${prescriptions.length} medicine${prescriptions.length !== 1 ? "s" : ""}`} size="small" variant="outlined" />
                            </Box>

                            <TableContainer sx={{ maxHeight: 600, overflowX: "auto" }}>
                                <Table
                                    stickyHeader
                                    sx={{
                                        "& .MuiTableCell-head": {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                            fontWeight: 600,
                                            fontSize: "0.875rem",
                                            whiteSpace: "nowrap",
                                        },
                                        "& .MuiTableCell-body": {
                                            wordBreak: "break-word",
                                            overflowWrap: "break-word",
                                            whiteSpace: "normal",
                                            maxWidth: "200px",
                                        },
                                        "& .MuiTableRow-root:hover": {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                        },
                                    }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ minWidth: 50 }} padding="checkbox">
                                                <Checkbox
                                                    indeterminate={
                                                        prescriptions.filter(
                                                            (p) => getRemainingQuantity(p) > 0 && isMedicineAvailable(p.medication) && selectedMedicines[p._id]?.selected
                                                        ).length > 0 &&
                                                        prescriptions.filter(
                                                            (p) => getRemainingQuantity(p) > 0 && isMedicineAvailable(p.medication) && selectedMedicines[p._id]?.selected
                                                        ).length < prescriptions.filter((p) => getRemainingQuantity(p) > 0 && isMedicineAvailable(p.medication)).length
                                                    }
                                                    checked={
                                                        prescriptions.filter((p) => getRemainingQuantity(p) > 0 && isMedicineAvailable(p.medication)).length > 0 &&
                                                        prescriptions.filter(
                                                            (p) => getRemainingQuantity(p) > 0 && isMedicineAvailable(p.medication) && selectedMedicines[p._id]?.selected
                                                        ).length === prescriptions.filter((p) => getRemainingQuantity(p) > 0 && isMedicineAvailable(p.medication)).length
                                                    }
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        const pendingPrescriptions = prescriptions.filter(
                                                            (p) => getRemainingQuantity(p) > 0 && isMedicineAvailable(p.medication)
                                                        );
                                                        const newSelection = { ...selectedMedicines };
                                                        pendingPrescriptions.forEach((presc) => {
                                                            newSelection[presc._id] = {
                                                                ...newSelection[presc._id],
                                                                selected: isChecked,
                                                            };
                                                        });
                                                        setSelectedMedicines(newSelection);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 250 }}>Medicine</TableCell>
                                            <TableCell sx={{ minWidth: 100 }}>Dosage</TableCell>
                                            <TableCell sx={{ minWidth: 120 }}>Frequency</TableCell>
                                            <TableCell sx={{ minWidth: 100 }}>Duration</TableCell>
                                            <TableCell sx={{ minWidth: 90 }} align="center">Prescribed</TableCell>
                                            <TableCell sx={{ minWidth: 90 }} align="center">Dispensed</TableCell>
                                            <TableCell sx={{ minWidth: 90 }} align="center">Remaining</TableCell>
                                            <TableCell sx={{ minWidth: 120 }} align="center">Dispense Qty</TableCell>
                                            <TableCell sx={{ minWidth: 100 }} align="center">Amount</TableCell>
                                            <TableCell sx={{ minWidth: 150 }}>Notes</TableCell>
                                            <TableCell sx={{ minWidth: 130 }} align="center">Availability</TableCell>
                                            <TableCell sx={{ minWidth: 100 }} align="center">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {prescriptions.map((presc, idx) => {
                                            const dispensedQty = Number(presc.dispensedQuantity || 0);
                                            const prescribedQuantity = getPrescribedQuantity(presc);
                                            const remainingQuantity = getRemainingQuantity(presc);
                                            const isFullyDispensed = remainingQuantity <= 0;
                                            const isPartiallyDispensed = dispensedQty > 0 && remainingQuantity > 0;
                                            const isSelected = selectedMedicines[presc._id]?.selected || false;
                                            const dispenseQuantity = selectedMedicines[presc._id]?.quantity || "";

                                            return (
                                                <TableRow
                                                    key={presc._id || idx}
                                                    sx={{
                                                        "&:last-child td": { borderBottom: 0 },
                                                        backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                                                        opacity: isFullyDispensed ? 0.6 : 1,
                                                        "& td": {
                                                            color: isFullyDispensed ? "text.disabled" : "text.primary",
                                                        },
                                                    }}
                                                >
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            disabled={isFullyDispensed || !isMedicineAvailable(presc.medication)}
                                                            onChange={(e) => handleMedicineSelect(presc._id, e.target.checked)}
                                                            title={!isMedicineAvailable(presc.medication) ? "This medicine is not available in the collection" : ""}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, flexDirection: "column" }}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                                                {isPartiallyDispensed && (
                                                                    <Chip
                                                                        label="Partial"
                                                                        size="small"
                                                                        color="warning"
                                                                        variant="filled"
                                                                        sx={{ fontSize: "0.7rem", height: "20px", fontWeight: 600 }}
                                                                    />
                                                                )}
                                                                {isFullyDispensed && (
                                                                    <Chip
                                                                        label="Dispensed"
                                                                        size="small"
                                                                        color="success"
                                                                        variant="filled"
                                                                        sx={{
                                                                            fontSize: "0.7rem",
                                                                            height: "20px",
                                                                            backgroundColor: theme.palette.success.main,
                                                                            color: "white",
                                                                            fontWeight: 600,
                                                                        }}
                                                                    />
                                                                )}
                                                                <Tooltip title={presc.medication || "N/A"} arrow>
                                                                    <Typography
                                                                        fontWeight={500}
                                                                        sx={{
                                                                            wordBreak: "break-word",
                                                                            overflowWrap: "break-word",
                                                                        }}
                                                                    >
                                                                        {presc.medication || "N/A"}
                                                                    </Typography>
                                                                </Tooltip>
                                                            </Box>
                                                            {presc.medicineType && (
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    {presc.medicineType}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={presc.dosage || "N/A"} arrow>
                                                            <Box>
                                                                <Chip
                                                                    label={presc.dosage || "N/A"}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="primary"
                                                                    sx={{
                                                                        maxWidth: "100px",
                                                                        "& .MuiChip-label": {
                                                                            overflow: "hidden",
                                                                            textOverflow: "ellipsis",
                                                                            whiteSpace: "nowrap",
                                                                        },
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={presc.frequency || "N/A"} arrow>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    wordBreak: "break-word",
                                                                    overflowWrap: "break-word",
                                                                    maxWidth: "120px",
                                                                }}
                                                            >
                                                                {presc.frequency || "N/A"}
                                                            </Typography>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={presc.duration || "Ongoing"} arrow>
                                                            <Box>
                                                                <Chip
                                                                    label={presc.duration || "Ongoing"}
                                                                    size="small"
                                                                    color="info"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        maxWidth: "100px",
                                                                        "& .MuiChip-label": {
                                                                            overflow: "hidden",
                                                                            textOverflow: "ellipsis",
                                                                            whiteSpace: "nowrap",
                                                                        },
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography fontWeight={600}>{prescribedQuantity}</Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography fontWeight={600} color={dispensedQty > 0 ? "success.main" : "text.secondary"}>
                                                            {dispensedQty}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography
                                                            fontWeight={600}
                                                            color={remainingQuantity > 0 ? "warning.main" : "text.secondary"}
                                                        >
                                                            {remainingQuantity}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        

                                                             <TextField
                                                                                                               type="number"
                                                                                                               size="small"
                                                                                                               value={dispenseQuantity}
                                                                                                               onChange={(e) => handleQuantityChange(presc._id, e.target.value)}
                                                                                                               disabled={isFullyDispensed}
                                                                                                               onKeyDown={(e) => {
                                                                                                                   if (e.key === "-" || e.key === "e") {
                                                                                                                       e.preventDefault();
                                                                                                                   }
                                                                                                               }}
                                                                                                               inputProps={{
                                                                                                                   min: 0,
                                                                                                                   max: getMaxDispenseQty(presc) || undefined,
                                                                                                                   style: { textAlign: "center" },
                                                                                                               }}
                                                                                                               sx={{
                                                                                                                   "& .MuiOutlinedInput-root": {
                                                                                                                       width: "120px",
                                                                                                                   },
                                                                                                               }}
                                                                                                               placeholder={`Max ${getMaxDispenseQty(presc)}`}
                                                                                                           />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {(() => {
                                                            if (!dispenseQuantity) {
                                                                return (
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        —
                                                                    </Typography>
                                                                );
                                                            }
                                                            return (
                                                                <Typography
                                                                    fontWeight={600}
                                                                    color="primary"
                                                                    sx={{ fontSize: "0.875rem" }}
                                                                >
                                                                    ₹{calculateAmount(presc.medication, dispenseQuantity, presc)}
                                                                </Typography>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={presc.notes || "-"} arrow>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{
                                                                    wordBreak: "break-word",
                                                                    overflowWrap: "break-word",
                                                                    maxWidth: "150px",
                                                                    display: "block",
                                                                }}
                                                            >
                                                                {presc.notes || "-"}
                                                            </Typography>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {(() => {
                                                            // First check if medicine exists in collection
                                                            if (!isMedicineAvailable(presc.medication)) {
                                                                return (
                                                                    <Chip
                                                                        label="Not Available"
                                                                        size="small"
                                                                        color="error"
                                                                        variant="filled"
                                                                        sx={{
                                                                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                                            color: theme.palette.error.dark,
                                                                            fontWeight: 500,
                                                                        }}
                                                                    />
                                                                );
                                                            }

                                                            // Check actual stock quantity
                                                            const medicine = findMedicineInMap(presc.medication);
                                                            const stockQuantity = medicine?.quantity || 0;

                                                            if (stockQuantity <= 0) {
                                                                return (
                                                                    <Chip
                                                                        label="Out of Stock"
                                                                        size="small"
                                                                        color="error"
                                                                        variant="filled"
                                                                        sx={{
                                                                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                                            color: theme.palette.error.dark,
                                                                            fontWeight: 500,
                                                                        }}
                                                                    />
                                                                );
                                                            }

                                                            const maxDispense = getMaxDispenseQty(presc);
                                                            if (maxDispense < remainingQuantity) {
                                                                return (
                                                                    <Chip
                                                                        label={`${stockQuantity} in stock`}
                                                                        size="small"
                                                                        color="warning"
                                                                        variant="filled"
                                                                        sx={{
                                                                            backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                                                            color: theme.palette.warning.dark,
                                                                            fontWeight: 500,
                                                                        }}
                                                                    />
                                                                );
                                                            }

                                                            return (
                                                                <Chip
                                                                    label={`${stockQuantity} in stock`}
                                                                    size="small"
                                                                    color="success"
                                                                    variant="filled"
                                                                    sx={{
                                                                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                                                                        color: theme.palette.success.dark,
                                                                        fontWeight: 500,
                                                                    }}
                                                                />
                                                            );
                                                        })()}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={
                                                                isFullyDispensed
                                                                    ? "Dispensed"
                                                                    : isPartiallyDispensed
                                                                        ? "Partial"
                                                                        : "Pending"
                                                            }
                                                            size="small"
                                                            color={
                                                                isFullyDispensed
                                                                    ? "success"
                                                                    : isPartiallyDispensed
                                                                        ? "info"
                                                                        : "warning"
                                                            }
                                                            variant="filled"
                                                            sx={{ fontWeight: 500 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {status !== "Dispensed" && (
                                <Box
                                    sx={{
                                        mt: 3,
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: alpha(theme.palette.warning.main, 0.05),
                                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                        Select medicine(s), enter how many the patient takes now (e.g. 2 or 3 — not the full remaining). Only that amount is dispensed and billed. When the patient returns for more, dispense again and a new bill is generated. Unpaid bills are in List Prescriptions.
                                    </Typography>
                                    {getSelectedDispenseTotal() > 0 && (
                                        <Box
                                            sx={{
                                                mb: 2,
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: alpha(theme.palette.primary.main, 0.06),
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                Bill amount for selected medicines (before GST)
                                            </Typography>
                                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                                ₹{getSelectedDispenseTotal().toFixed(2)}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                        <Button
                                            type="button"
                                            variant="contained"
                                            startIcon={isDispensing ? <CircularProgress size={16} color="inherit" /> : <LocalPharmacy />}
                                            onClick={(e) => handleDispense(e)}
                                            disabled={isDispensing || allDispensed}
                                            fullWidth
                                            sx={{
                                                backgroundColor: theme.palette.success.main,
                                                "&:hover": { backgroundColor: theme.palette.success.dark },
                                                "&:disabled": { backgroundColor: alpha(theme.palette.success.main, 0.5) },
                                            }}
                                        >
                                            {isDispensing ? "Dispensing..." : "Dispense Selected"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            startIcon={<LocalPharmacy />}
                                            onClick={(e) => handleDispense(e, { dispenseAll: true })}
                                            disabled={isDispensing || allDispensed}
                                            fullWidth
                                            sx={{
                                                borderColor: theme.palette.success.main,
                                                color: theme.palette.success.dark,
                                            }}
                                        >
                                            Dispense All Remaining
                                        </Button>
                                    </Stack>
                                </Box>
                            )}

                           {status === "Dispensed" && (
                                                 <Box
                                                     sx={{
                                                         mt: 3,
                                                         p: 2,
                                                         borderRadius: 2,
                                                         backgroundColor: alpha(theme.palette.success.main, 0.05),
                                                         border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                                     }}
                                                 >
                                                     <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                         <CheckCircle color="success" />
                                                         <Typography fontWeight={600} color="success.dark">
                                                             Prescription Dispensed
                                                         </Typography>
                                                     </Box>
                                                     <Typography variant="body2" color="text.secondary">
                                                         All medicines have been dispensed to the patient on {formatDate(prescriptions[0]?.dispensedAt)}.
                                                     </Typography>
                                                 </Box>
                                             )}
                                         </CardContent>
                                     </Card>
                                 </Grid>
                             </Grid>
                 
                             {/* Confirmation Dialog */}
                             <Dialog
                                 open={confirmDialogOpen}
                                 onClose={() => setConfirmDialogOpen(false)}
                                 maxWidth="sm"
                                 fullWidth
                             >
                                 <DialogTitle sx={{
                                     backgroundColor: theme.palette.primary.main,
                                     color: theme.palette.primary.contrastText,
                                     fontWeight: 600
                                 }}>
                                     Confirm Dispense
                                 </DialogTitle>
                                 <DialogContent sx={{ mt: 2 }}>
                                    <DialogContentText sx={{ mb: 2 }}>
                                        Dispense the following for <b>{patientName}</b>. A separate bill will be created for this quantity only.
                                    </DialogContentText>

                                     <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                                         {pendingSelectedPrescriptions.map((presc) => {
                                             const qty = pendingDispenseSelection[presc._id]?.quantity
                                                 || selectedMedicines[presc._id]?.quantity
                                                 || "0";
                                             const lineAmount = calculateAmount(presc.medication, qty, presc);
                                             const remainingAfter = Math.max(
                                                 0,
                                                 getRemainingQuantity(presc) - parseQuantity(qty)
                                             );
                                             return (
                                                 <Box
                                                     key={presc._id}
                                                     sx={{
                                                         p: 1.5,
                                                         borderRadius: 1,
                                                         bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                         border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                                                     }}
                                                 >
                                                     <Typography variant="body2" fontWeight={600}>
                                                         {presc.medication}
                                                     </Typography>
                                                     <Typography variant="body2" color="text.secondary">
                                                         Dispensing now: <b>{qty}</b> · Remaining after: <b>{remainingAfter}</b> · Amount: <b>₹{lineAmount}</b>
                                                     </Typography>
                                                 </Box>
                                             );
                                         })}
                                     </Box>

                                     <TextField
                                         label="GST (%)"
                                         type="number"
                                         fullWidth
                                         value={gst}
                                         onChange={(e) => setGst(Math.max(0, Number(e.target.value) || 0))}
                                         sx={{ mb: 2 }}
                                         inputProps={{ min: 0 }}
                                     />

                                     {pendingSelectedPrescriptions.length > 0 && (() => {
                                         const totals = calculateConfirmTotals();
                                         return (
                                             <Box
                                                 sx={{
                                                     p: 1.5,
                                                     borderRadius: 1,
                                                     bgcolor: alpha(theme.palette.success.main, 0.08),
                                                     border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
                                                 }}
                                             >
                                                 <Typography variant="body2" color="text.secondary">
                                                     Subtotal: ₹{totals.subtotal}
                                                 </Typography>
                                                 <Typography variant="body2" color="text.secondary">
                                                     GST ({gst}%): ₹{totals.gstAmount}
                                                 </Typography>
                                                <Typography variant="subtitle1" fontWeight={700} color="success.dark" sx={{ mt: 0.5 }}>
                                                    Total bill amount: ₹{totals.total}
                                                </Typography>
                                             </Box>
                                         );
                                     })()}
                                 </DialogContent>
                                 <DialogActions sx={{ p: 2, gap: 1 }}>
                                     <Button
                                         onClick={() => setConfirmDialogOpen(false)}
                                         variant="outlined"
                                         color="inherit"
                                         sx={{
                                             borderColor: theme.palette.grey[400],
                                             color: theme.palette.text.primary,
                                             "&:hover": {
                                                 borderColor: theme.palette.grey[600],
                                                 backgroundColor: theme.palette.grey[50],
                                             }
                                         }}
                                     >
                                         Cancel
                                     </Button>
                                     <Button
                                         onClick={handleDispenseConfirm}
                                         variant="contained"
                                         color="primary"
                                         autoFocus
                                         sx={{
                                             backgroundColor: theme.palette.primary.main,
                                             "&:hover": {
                                                 backgroundColor: theme.palette.primary.dark,
                                             }
                                         }}
                                     >
                                         Confirm
                                     </Button>
                                 </DialogActions>
                             </Dialog>
                         </Container>
    );
}

const DetailCard = ({ label, value, icon, sx = {}, fullWidth = false }) => (
    <Box
        sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: "background.default",
            border: `1px solid ${alpha(useTheme().palette.divider, 0.1)}`,
            width: fullWidth ? "100%" : "auto",
            height: "100%",
            ...sx,
        }}
    >
        <Typography variant="caption" color="text.secondary" display="block" mb={0.3} sx={{ fontSize: "0.7rem" }}>
            {icon && <Box component="span" sx={{ mr: 0.5, verticalAlign: "middle", fontSize: "0.9rem" }}>{icon}</Box>}
            {label}
        </Typography>
        <Typography
            fontWeight={600}
            fontSize="0.875rem"
            sx={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "normal",
                maxWidth: "100%",
            }}
        >
            {value || "N/A"}
        </Typography>
    </Box>
);

export default Inpatientprescriptions;
