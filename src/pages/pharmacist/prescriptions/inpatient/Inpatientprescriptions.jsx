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

    // Calculate amount for a medicine based on dispense quantity and sell price
    const calculateAmount = (medicineName, dispenseQty) => {
        if (!medicineName || !dispenseQty) return 0;
        const medicine = findMedicineInMap(medicineName);
        if (!medicine || !medicine.sellPrice) return 0;

        // Try to parse dispenseQty as number, if it's a string like "10 tablets", extract the number
        let qty = 0;
        if (typeof dispenseQty === 'string') {
            // Extract first number from string (e.g., "10 tablets" -> 10)
            const match = dispenseQty.match(/\d+/);
            qty = match ? parseFloat(match[0]) : 0;
        } else {
            qty = parseFloat(dispenseQty) || 0;
        }

        return (medicine.sellPrice * qty).toFixed(2);
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

    if (!patient || prescriptions.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Box sx={{ textAlign: "center", py: 5 }}>
                    <Typography variant="h6" color="text.secondary">
                        No prescription data found
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate("/pharmacist/prescriptions/inpatient")}
                        sx={{ mt: 2 }}
                    >
                        Back to Prescriptions
                    </Button>
                </Box>
            </Container>
        );
    }

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
    const allDispensed = prescriptions.every((p) => p.status === "Dispensed");
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
                ...prev[prescriptionId],
                selected,
            },
        }));
    };

    const handleQuantityChange = (prescriptionId, quantity) => {
        // Store as string to allow text input (e.g., "10 tablets", "500ml")
        setSelectedMedicines((prev) => ({
            ...prev,
            [prescriptionId]: {
                selected: prev[prescriptionId]?.selected || false,
                quantity: quantity || "",
            },
        }));
    };

    const validateDispense = () => {
        if (prescriptions.length === 0) {
            toast.error("No prescriptions to dispense");
            return null;
        }

        // Get selected medicines
        const selectedPrescriptions = prescriptions.filter(
            (p) => p.status !== "Dispensed" && selectedMedicines[p._id]?.selected
        );

        if (selectedPrescriptions.length === 0) {
            toast.error("Please select at least one medicine to dispense");
            return null;
        }

        // Check for unavailable medicines
        const unavailableMedicines = selectedPrescriptions.filter((p) => !isMedicineAvailable(p.medication));
        if (unavailableMedicines.length > 0) {
            const unavailableNames = unavailableMedicines.map((p) => p.medication).join(", ");
            toast.error(
                `Cannot dispense unavailable medicines: ${unavailableNames}. Please unselect them or add them to the medicine collection first.`
            );
            return null;
        }

        // Validate quantities (check if quantity is entered)
        const invalidPrescriptions = selectedPrescriptions.filter((p) => {
            const selected = selectedMedicines[p._id];
            return !selected.quantity || selected.quantity.trim() === "";
        });

        if (invalidPrescriptions.length > 0) {
            toast.error("Please enter quantities for all selected medicines");
            return null;
        }

        // Check stock availability before dispensing
        const outOfStockMedicines = [];
        for (const presc of selectedPrescriptions) {
            const selected = selectedMedicines[presc._id];
            const dispensedQuantityStr = selected.quantity;
            
            // Extract numeric value from string (e.g., "10 tablets" -> 10, "500ml" -> 500)
            const numericMatch = dispensedQuantityStr.match(/(\d+(?:\.\d+)?)/);
            const dispensedQuantity = numericMatch ? parseFloat(numericMatch[1]) : 0;
            
            if (dispensedQuantity <= 0) {
                continue; // Skip invalid quantities, will be caught by empty quantity check
            }
            
            // Find the medicine
            const medicine = findMedicineInMap(presc.medication);
            if (!medicine) {
                continue; // Skip if medicine not found, will be caught by unavailable check
            }
            
            // Check stock quantity
            const currentStock = medicine.quantity || 0;
            if (currentStock <= 0) {
                outOfStockMedicines.push(presc.medication);
            } else if (currentStock < dispensedQuantity) {
                outOfStockMedicines.push(presc.medication);
            }
        }
        
        // If any medicine is out of stock, show error and prevent dispensing
        if (outOfStockMedicines.length > 0) {
            outOfStockMedicines.forEach((medicineName) => {
                toast.error(`${medicineName} is out of stock`);
            });
            return null;
        }

        return selectedPrescriptions;
    };

    const handleDispenseClick = () => {
        const validPrescriptions = validateDispense();
        if (validPrescriptions) {
            setConfirmDialogOpen(true);
        }
    };

    const handleDispenseConfirm = async () => {
        setConfirmDialogOpen(false);
        const selectedPrescriptions = validateDispense(); // Re-validate just in case, or trust state
        if (!selectedPrescriptions) return;

        setIsDispensing(true);
        try {
            // Update selected prescriptions with their quantities
            const updatePromises = selectedPrescriptions.map((presc) => {
                const selected = selectedMedicines[presc._id];
                const dispensedQuantity = selected.quantity;

                // Update the prescription with the dispensed quantity (as string)
                return axios.patch(
                    getApiUrl(`examinations/prescriptions/${presc._id}`),
                    {
                        status: "Dispensed",
                        dispensedQuantity: dispensedQuantity,
                    },
                    { headers: getAuthHeaders() }
                );
            });

            await Promise.all(updatePromises);

            // Update medicine quantities - deduct dispensed quantities from stock
            const medicineUpdatePromises = [];
            for (const presc of selectedPrescriptions) {
                const selected = selectedMedicines[presc._id];
                const dispensedQuantityStr = selected.quantity;

                // Extract numeric value from string (e.g., "10 tablets" -> 10, "500ml" -> 500)
                const numericMatch = dispensedQuantityStr.match(/(\d+(?:\.\d+)?)/);
                const dispensedQuantity = numericMatch ? parseFloat(numericMatch[1]) : 0;

                if (dispensedQuantity <= 0) {
                    console.warn(`Invalid dispensed quantity for ${presc.medication}: ${dispensedQuantityStr}`);
                    continue;
                }

                // Find the medicine using improved matching
                const medicine = findMedicineInMap(presc.medication);

                if (!medicine) {
                    console.warn(`Medicine not found in collection: ${presc.medication}`);
                    continue;
                }

                // Calculate new quantity
                const currentQuantity = medicine.quantity || 0;

                // Warn if insufficient stock
                if (currentQuantity < dispensedQuantity) {
                    toast.warning(
                        `Insufficient stock for ${presc.medication}. Available: ${currentQuantity}, Dispensing: ${dispensedQuantity}. Stock will be set to 0.`
                    );
                }

                const newQuantity = Math.max(0, currentQuantity - dispensedQuantity); // Ensure non-negative

                // Update medicine quantity
                medicineUpdatePromises.push(
                    medicineService.updateMedicine(medicine._id, {
                        quantity: newQuantity,
                    }).catch((error) => {
                        console.error(`Failed to update quantity for ${presc.medication}:`, error);
                        toast.warning(`Failed to update stock for ${presc.medication}. Please update manually.`);
                    })
                );
            }

            // Wait for all medicine updates to complete
            await Promise.all(medicineUpdatePromises);

            toast.success(`${selectedPrescriptions.length} medicine(s) dispensed successfully! Stock updated.`);

            // Refresh the data
            const response = await prescriptionService.getPrescriptionsByExamination(id);
            if (response && response.success && response.data) {
                const prescList = Array.isArray(response.data) ? response.data : [];
                setPrescriptions(prescList);

                // Reset selections
                const newSelection = {};
                prescList.forEach((presc) => {
                    if (presc.status !== "Dispensed") {
                        newSelection[presc._id] = {
                            selected: false,
                            quantity: presc.quantity || 1,
                        };
                    }
                });
                setSelectedMedicines(newSelection);
            }
        } catch (error) {
            console.error("Error dispensing prescriptions:", error);
            toast.error(error?.response?.data?.message || "Failed to dispense medicines. Please try again.");
        } finally {
            setIsDispensing(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // TODO: Implement download logic
        toast.info("Download functionality will be implemented");
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
                            <Button
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
                            </Button>
                            {status !== "Dispensed" && (
                                <Button
                                    variant="contained"
                                    startIcon={isDispensing ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                                    onClick={handleDispenseClick}
                                    disabled={isDispensing}
                                    sx={{
                                        backgroundColor: theme.palette.success.main,
                                        "&:hover": {
                                            backgroundColor: theme.palette.success.dark,
                                        },
                                        "&:disabled": {
                                            backgroundColor: alpha(theme.palette.success.main, 0.5),
                                        },
                                    }}
                                >
                                    {isDispensing ? "Dispensing..." : "Mark as Dispensed"}
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
                                                            (p) => p.status !== "Dispensed" && isMedicineAvailable(p.medication) && selectedMedicines[p._id]?.selected
                                                        ).length > 0 &&
                                                        prescriptions.filter(
                                                            (p) => p.status !== "Dispensed" && isMedicineAvailable(p.medication) && selectedMedicines[p._id]?.selected
                                                        ).length < prescriptions.filter((p) => p.status !== "Dispensed" && isMedicineAvailable(p.medication)).length
                                                    }
                                                    checked={
                                                        prescriptions.filter((p) => p.status !== "Dispensed" && isMedicineAvailable(p.medication)).length > 0 &&
                                                        prescriptions.filter(
                                                            (p) => p.status !== "Dispensed" && isMedicineAvailable(p.medication) && selectedMedicines[p._id]?.selected
                                                        ).length === prescriptions.filter((p) => p.status !== "Dispensed" && isMedicineAvailable(p.medication)).length
                                                    }
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        const pendingPrescriptions = prescriptions.filter(
                                                            (p) => p.status !== "Dispensed" && isMedicineAvailable(p.medication)
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
                                            <TableCell sx={{ minWidth: 120 }} align="center">Dispense Qty</TableCell>
                                            <TableCell sx={{ minWidth: 100 }} align="center">Amount</TableCell>
                                            <TableCell sx={{ minWidth: 150 }}>Notes</TableCell>
                                            <TableCell sx={{ minWidth: 130 }} align="center">Availability</TableCell>
                                            <TableCell sx={{ minWidth: 100 }} align="center">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {prescriptions.map((presc, idx) => {
                                            const isDispensed = presc.status === "Dispensed";
                                            const isSelected = selectedMedicines[presc._id]?.selected || false;
                                            const dispenseQuantity = selectedMedicines[presc._id]?.quantity || "";
                                            const prescribedQuantity = presc.quantity || 1;

                                            return (
                                                <TableRow
                                                    key={presc._id || idx}
                                                    sx={{
                                                        "&:last-child td": { borderBottom: 0 },
                                                        backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                                                        opacity: isDispensed ? 0.6 : 1,
                                                        "& td": {
                                                            color: isDispensed ? "text.disabled" : "text.primary",
                                                        },
                                                    }}
                                                >
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            disabled={isDispensed || !isMedicineAvailable(presc.medication)}
                                                            onChange={(e) => handleMedicineSelect(presc._id, e.target.checked)}
                                                            title={!isMedicineAvailable(presc.medication) ? "This medicine is not available in the collection" : ""}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, flexDirection: "column" }}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                                                {isDispensed && (
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
                                                        <TextField
                                                            type="text"
                                                            size="small"
                                                            value={dispenseQuantity}
                                                            onChange={(e) => handleQuantityChange(presc._id, e.target.value)}
                                                            disabled={isDispensed}
                                                            inputProps={{
                                                                style: { textAlign: "center" },
                                                            }}
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": {
                                                                    width: "120px",
                                                                },
                                                            }}
                                                            placeholder="Enter qty"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography
                                                            fontWeight={600}
                                                            color="primary"
                                                            sx={{ fontSize: "0.875rem" }}
                                                        >
                                                            ₹{calculateAmount(presc.medication, dispenseQuantity)}
                                                        </Typography>
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
                                                            
                                                            return (
                                                                <Chip
                                                                    label="Available"
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
                                                            label={presc.status || "Pending"}
                                                            size="small"
                                                            color={presc.status === "Dispensed" ? "success" : "warning"}
                                                            variant="filled"
                                                            sx={{
                                                                backgroundColor: alpha(
                                                                    presc.status === "Dispensed" ? theme.palette.success.main : theme.palette.warning.main,
                                                                    0.1
                                                                ),
                                                                color: presc.status === "Dispensed" ? theme.palette.success.dark : theme.palette.warning.dark,
                                                                fontWeight: 500,
                                                            }}
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
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        Select medicines to dispense and specify quantities. You can dispense partial quantities if needed. This is for an admitted patient.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={isDispensing ? <CircularProgress size={16} color="inherit" /> : <LocalPharmacy />}
                                        onClick={handleDispenseClick}
                                        disabled={isDispensing}
                                        fullWidth
                                        sx={{
                                            backgroundColor: theme.palette.success.main,
                                            "&:hover": {
                                                backgroundColor: theme.palette.success.dark,
                                            },
                                            "&:disabled": {
                                                backgroundColor: alpha(theme.palette.success.main, 0.5),
                                            },
                                        }}
                                    >
                                        {isDispensing ? "Dispensing..." : "Dispense All Medicines"}
                                    </Button>
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
                                        All medicines have been dispensed to the inpatient on {formatDate(prescriptions[0]?.dispensedAt)}.
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
            >
                <DialogTitle>Confirm Dispense</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to dispense {prescriptions.filter((p) => p.status !== "Dispensed" && selectedMedicines[p._id]?.selected).length} medicine(s) for {patientName}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleDispenseConfirm} variant="contained" color="primary" autoFocus>
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
