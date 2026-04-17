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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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
    Payments,
    AccountBalance,
    CreditCard,
    Smartphone,
} from "@mui/icons-material";

import { toast } from "react-toastify";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../../components/card/HeadingCard";
import prescriptionService from "../../../../services/prescriptionService";
import medicineService from "../../../../services/medicineService";
import { getApiUrl, getAuthHeaders } from "../../../../config/api";
import { handlePrint } from "../components/PrescriptionGenerator";
import { handleDownload } from "../components/PrescriptionDownload";

/** Matches PharmaciesPrescription enum; used as pharmacy-payment body.paymentStatus. */
function derivePaymentStatusForPayload(totalAmountWithGst, padeamountAfterPayment) {
    const totalCents = Math.round((Number(totalAmountWithGst) || 0) * 100);
    const paidCents = Math.round((Number(padeamountAfterPayment) || 0) * 100);
    if (totalCents <= 0) {
        return paidCents > 0 ? "Paid" : "Unpaid";
    }
    if (paidCents >= totalCents) return "Paid";
    if (paidCents > 0) return "Partially Paid";
    return "Unpaid";
}

function ListPrescriptions() {
    const { id } = useParams(); // examinationId
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const navigate = useNavigate();
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [isDispensing, setIsDispensing] = useState(false);
    const [prescriptions, setPrescriptions] = useState([]);
    const [billingSummary, setBillingSummary] = useState({
        subtotal: 0,
        gst: 0,
        gstAmount: 0,
        total: 0,
        medicineCount: 0,
    });
    const [patient, setPatient] = useState(null);
    const [gst, setGst] = useState(0);
    const [examination, setExamination] = useState(null);
    const [invoiceId, setInvoiceId] = useState(null);
    const [padeamount, setPadeamount] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState("Unpaid");

    const [paymentHistory, setPaymentHistory] = useState([]);


    // Payment Dialog State
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        amount: (parseFloat(billingSummary.total) - padeamount).toFixed(2),
        method: "Cash",
        transactionId: "",
        cardDigits: "",
    });
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    function calculateTotalWithGST() {
        let subtotal = 0;

        prescriptions.forEach((presc) => {
            // To ensure the amount isn't 0 out by default, default to prescribedQuantity if dispenseQty not set yet.
            const prescribedQuantity = presc.quantity || 1;
            const qty = selectedMedicines[presc._id]?.quantity || presc.dispensedQuantity || prescribedQuantity;

            const amount = parseFloat(calculateAmount(presc.medication, qty)) || 0;
            subtotal += amount;
        });

        // Use backend GST rate for dispensed prescriptions, otherwise use local gst state
        const appliedGst = status === "Dispensed" ? (billingSummary.gst || 0) : gst;
        const gstAmount = (subtotal * appliedGst) / 100;
        const totalWithGst = subtotal + gstAmount;

        return {
            subtotal: subtotal.toFixed(2),
            gstPercentage: appliedGst,
            gstAmount: gstAmount.toFixed(2),
            totalWithoutGst: subtotal.toFixed(2),
            total: totalWithGst.toFixed(2),
        };
    }
    // State for selected medicines and quantities
    const [selectedMedicines, setSelectedMedicines] = useState({}); // { prescriptionId: { selected: boolean, quantity: number } }
    // State for available medicines
    const [availableMedicines, setAvailableMedicines] = useState([]); // Array of medicine names from medicine collection
    const [medicinesMap, setMedicinesMap] = useState({}); // Map of medicine name to medicine object (for getting sellPrice)
    // State for confirmation dialog
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingSelectedPrescriptions, setPendingSelectedPrescriptions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch prescriptions and medicines in parallel
                const [prescriptionResponse, medicinesResponse] = await Promise.all([
                    prescriptionService.getPrescriptionsByExaminationList(id),
                    medicineService.getAllMedicines({ page: 1, limit: 1000 }), // Fetch all medicines
                ]);

                if (prescriptionResponse && prescriptionResponse.success && prescriptionResponse.data) {
                    const prescData = prescriptionResponse.data;
                    const prescList = Array.isArray(prescData.prescriptions) ? prescData.prescriptions : [];
                    setPrescriptions(prescList);

                    // Set billing summary (totals and medicine count) from backend
                    setBillingSummary({
                        subtotal: prescData.subtotal || 0,
                        gst: prescData.gst || 0,
                        gstAmount: prescData.gstAmount || 0,
                        total: prescData.total || 0,
                        medicineCount: prescData.medicineCount || prescList.length,
                    });
                    setInvoiceId(prescData.invoiceId || null);
                    setPadeamount(prescData.padeamount || 0);
                    setPaymentStatus(prescData.paymentStatus || "Unpaid");

                    setPaymentHistory(prescData.payments || []);



                    if (prescList.length > 0) {
                        const firstPresc = prescList[0];
                        setPatient(firstPresc.patient);
                        setExamination(firstPresc.examination);

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
                    navigate("/pharmacist/prescriptions/list");
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
                navigate("/pharmacist/prescriptions/list");
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
    function normalizeMedicineName(name) {
        if (!name) return "";
        // Convert to lowercase, trim, and remove extra spaces
        return name.toLowerCase().trim().replace(/\s+/g, " ");
    }

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
    function findMedicineInMap(medicineName) {
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
    }

    // Calculate amount for a medicine based on dispense quantity and sell price
    function calculateAmount(medicineName, dispenseQty) {
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
    }
    const calculateRemainingDosage = (dosage, dispenseQty) => {
        if (!dosage || !dispenseQty) return dosage;

        const parts = dosage.split("-").map(Number);
        const qty = parseInt(dispenseQty) || 0;

        if (parts.length !== 3) return dosage;

        const totalDosage = parts.reduce((a, b) => a + b, 0);
        const remaining = totalDosage - qty;

        if (remaining < 0) {
            alert("Dispense quantity cannot be greater than dosage");
            return dosage;
        }

        return remaining;
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
    //                     onClick={() => navigate("/pharmacist/prescriptions/outpatient")}
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
    // const allDispensed = prescriptions.every((p) => p.status === "Dispensed");
    const allDispensed = prescriptions.every(
        (p) => Number(p.dispensedQuantity || 0) >= Number(p.quantity || 0)
    );
    const status = allDispensed ? "Dispensed" : "Pending";

    // FALLBACK: If backend hasn't provided a total (e.g. before dispensing), 
    // use the locally calculated estimated total.
    const localTotals = calculateTotalWithGST();
    const totalAmount = Number(billingSummary.total) > 0 ? Number(billingSummary.total) : (Number(localTotals.total) || 0);
    const paidAmount = Number(padeamount) || 0;
    const balanceDue = Math.max(0, Math.round((totalAmount - paidAmount) * 100) / 100);
    const billingSnapshot = {
        subtotal: Number(localTotals.subtotal) || 0,
        gst: Number(localTotals.gstPercentage) || 0,
        gstAmount: Number(localTotals.gstAmount) || 0,
        totalWithGst: totalAmount,
        totalPaid: paidAmount,
        balanceDue,
        paymentStatus,
    };

    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist/dashboard" },
        { label: "List Prescriptions", url: "/pharmacist/prescriptions/list" },
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

        const presc = prescriptions.find(p => p._id === prescriptionId);

        if (presc?.dosage) {
            const total = presc.dosage.split("-").map(Number).reduce((a, b) => a + b, 0);

            if (parseInt(quantity) > total) {
                toast.error("Dispense quantity cannot be greater than dosage");
                return;
            }
        }
        // Store as string to allow text input (e.g., "10 tablets", "500ml")
        setSelectedMedicines((prev) => ({
            ...prev,
            [prescriptionId]: {
                selected: prev[prescriptionId]?.selected || false,
                quantity: quantity || "",
            },
        }));
    };

    const handleDispense = async (e) => {
        // Prevent any form submission if button is inside a form
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        console.log("Dispense button clicked");
        console.log("Prescriptions:", prescriptions);
        console.log("Selected Medicines:", selectedMedicines);

        if (prescriptions.length === 0) {
            toast.error("No prescriptions to dispense");
            return;
        }

        // Get selected medicines (only those explicitly checked by the user)
        // const selectedPrescriptions = prescriptions.filter(
        //     (p) => p.status !== "Dispensed" && selectedMedicines[p._id]?.selected
        // );
        const selectedPrescriptions = prescriptions.filter((p) => {
            const prescribed = Number(p.quantity || 0);
            const dispensed = Number(p.dispensedQuantity || 0);

            return dispensed < prescribed && selectedMedicines[p._id]?.selected;
        });
        console.log("Selected Prescriptions:", selectedPrescriptions);

        if (selectedPrescriptions.length === 0) {
            toast.error("Please select the medicines you want to dispense by checking the checkbox for each one.");
            return;
        }

        // Check for unavailable medicines
        const unavailableMedicines = selectedPrescriptions.filter((p) => !isMedicineAvailable(p.medication));
        if (unavailableMedicines.length > 0) {
            const unavailableNames = unavailableMedicines.map((p) => p.medication).join(", ");
            toast.error(
                `Cannot dispense unavailable medicines: ${unavailableNames}. Please unselect them or add them to the medicine collection first.`
            );
            return;
        }

        // Ensure all selected prescriptions have quantities (use prescribed quantity if not entered)
        const newSelection = { ...selectedMedicines };
        let hasEmptyQuantity = false;

        selectedPrescriptions.forEach((p) => {
            const selected = newSelection[p._id];
            if (!selected.quantity || selected.quantity.trim() === "") {
                // Use prescription's quantity or dosage as fallback
                const fallbackQuantity = p.quantity || p.dosage || "";
                if (fallbackQuantity) {
                    newSelection[p._id] = {
                        ...selected,
                        quantity: fallbackQuantity,
                    };
                } else {
                    hasEmptyQuantity = true;
                }
            }
        });

        if (hasEmptyQuantity) {
            toast.error("Please enter quantities for all selected medicines");
            return;
        }

        // Check stock availability before dispensing
        const outOfStockMedicines = [];
        for (const presc of selectedPrescriptions) {
            const selected = newSelection[presc._id];
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
            return;
        }

        // Update selection state if we modified any quantities
        setSelectedMedicines(newSelection);

        // Store selected prescriptions and open confirmation dialog
        setPendingSelectedPrescriptions(selectedPrescriptions);
        setConfirmDialogOpen(true);
    };

    const handleDispenseConfirm = async () => {
        setConfirmDialogOpen(false);
        const selectedPrescriptions = pendingSelectedPrescriptions;

        if (!selectedPrescriptions || selectedPrescriptions.length === 0) {
            return;
        }

        setIsDispensing(true);
        try {
            console.log("Starting bulk dispense process...");

            // Prepare bulk updates
            const updates = selectedPrescriptions.map((presc) => {
                const selected = selectedMedicines[presc._id];
                return {
                    prescriptionId: presc._id,
                    dispensedQuantity: selected.quantity,
                    gst: gst
                };
            });

            // Call bulk dispense endpoint
            await axios.post(
                getApiUrl("examinations/prescriptions/bulk-dispense"),
                { updates },
                { headers: getAuthHeaders() }
            );

            toast.success(`${selectedPrescriptions.length} medicine(s) dispensed successfully!`);

            // Refresh the data
            const response = await prescriptionService.getPrescriptionsByExaminationList(id);
            if (response && response.success && response.data) {
                const prescData = response.data;
                const prescList = Array.isArray(prescData.prescriptions) ? prescData.prescriptions : [];
                setPrescriptions(prescList);

                // Update billing summary
                setBillingSummary({
                    subtotal: prescData.subtotal || 0,
                    gst: prescData.gst || 0,
                    gstAmount: prescData.gstAmount || 0,
                    total: prescData.total || 0,
                    medicineCount: prescData.medicineCount || prescList.length,
                });
                setInvoiceId(prescData.invoiceId || null);
                setPadeamount(prescData.padeamount || 0);
                setPaymentStatus(prescData.paymentStatus || "Unpaid");

                // Reset selections
                const newSelection = {};
                prescList.forEach((presc) => {
                    if (Number(presc.dispensedQuantity || 0) < Number(presc.quantity || 0)) {
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
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to dispense medicines. Please try again."
            );
        } finally {
            setIsDispensing(false);
        }
    };

    const handleRecordPayment = async () => {
        const paymentAmount = Number(paymentDetails.amount);
        if (!paymentDetails.amount || Number.isNaN(paymentAmount) || paymentAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (balanceDue <= 0) {
            toast.info("This bill is already fully paid");
            return;
        }
        if (paymentAmount > balanceDue) {
            toast.error(`Payment amount cannot exceed balance due (Max: ₹${balanceDue})`);
            return;
        }

        if (paymentDetails.method === "Card") {
            if (!paymentDetails.cardDigits || paymentDetails.cardDigits.length !== 4) {
                toast.error("Please enter exactly 4 digits for the card number");
                return;
            }
            if (!paymentDetails.transactionId) {
                toast.error("Please enter a reference number or transaction ID");
                return;
            }
        } else if (paymentDetails.method !== "Cash" && !paymentDetails.transactionId) {
            toast.error("Please enter a transaction ID");
            return;
        }

        setIsSubmittingPayment(true);
        const payload = {
            paymentAmount,
            paymentMethod: paymentDetails.method,
            paymentStatus: derivePaymentStatusForPayload(totalAmount, paidAmount + paymentAmount),
        };

        if (paymentDetails.method !== "Cash") {
            if (paymentDetails.transactionId) {
                payload.transactionId = paymentDetails.transactionId;
            }
            if (paymentDetails.method === "Card" && paymentDetails.cardDigits) {
                payload.cardLastFourDigits = paymentDetails.cardDigits;
            }
        }

        try {
            const response = await axios.post(
                getApiUrl(`invoices/pharmacy-payment/${id}`),
                payload,
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success("Payment recorded successfully");
                setShowPaymentDialog(false);
                setPaymentDetails({ amount: "", method: "Cash", transactionId: "", cardDigits: "" });

                // Refresh data to update amountPaid and invoiceId
                const prescriptionResponse = await prescriptionService.getPrescriptionsByExaminationList(id);
                if (prescriptionResponse && prescriptionResponse.success) {
                    setInvoiceId(prescriptionResponse.data.invoiceId);
                    setPadeamount(prescriptionResponse.data.padeamount);
                    setPaymentStatus(prescriptionResponse.data.paymentStatus);
                    setPaymentHistory(prescriptionResponse.data.payments);



                    // Also update billingSummary to reflect current state
                    const prescData = prescriptionResponse.data;
                    setBillingSummary({
                        subtotal: prescData.subtotal || 0,
                        gst: prescData.gst || 0,
                        gstAmount: prescData.gstAmount || 0,
                        total: prescData.total || 0,
                        medicineCount: prescData.prescriptions?.length || 0,
                    });
                }
            }
        } catch (error) {
            console.error("Error recording payment:", error);
            toast.error(error.response?.data?.message || "Failed to record payment");
        } finally {
            setIsSubmittingPayment(false);
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
                            <LocalPharmacy sx={{ color: theme.palette.primary.main }} />
                            <span>Listprescription Prescription</span>
                            <Chip
                                label={status === "Dispensed" ? "Dispensed" : "Pending"}
                                color={status === "Dispensed" ? "success" : "warning"}
                                size="small"
                                icon={status === "Dispensed" ? <CheckCircle /> : <Pending />}
                                sx={{ ml: 1 }}
                            />
                        </Box>
                    }
                    subtitle="View and manage all patient prescriptions with accurate medication details."
                    action={
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={<Print />}
                                onClick={() => handlePrint(id, billingSnapshot)}
                                sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                            >
                                Print
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() => handleDownload(id, billingSnapshot)}
                                sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                            >
                                Download
                            </Button>
                            {status !== "Dispensed" && (
                                <Button
                                    type="button"
                                    variant="contained"
                                    startIcon={isDispensing ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                                    onClick={(e) => {
                                        console.log("Header button clicked");
                                        handleDispense(e);
                                    }}
                                    // disabled={isDispensing || status === "Dispensed"}
                                    disabled={isDispensing || allDispensed}
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
                            <Button
                                variant="contained"
                                startIcon={<Payments />}
                                onClick={() => {
                                    setPaymentDetails(prev => ({
                                        ...prev,
                                        amount: balanceDue > 0 ? balanceDue.toFixed(2) : "",
                                    }));
                                    setShowPaymentDialog(true);
                                }}
                                disabled={balanceDue <= 0}

                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    "&:hover": {
                                        backgroundColor: theme.palette.primary.dark,
                                    },
                                }}
                            >
                                Record Payment
                            </Button>
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
                                Patient Information
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Full Name" value={patientName} icon={<Person fontSize="small" />} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="UHID" value={patient?.user?.uhid || "N/A"} />
                                </Grid>
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
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                        label={`${billingSummary.medicineCount || prescriptions.length} item${(billingSummary.medicineCount || prescriptions.length) !== 1 ? "s" : ""}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={
                                            billingSummary.gst
                                                ? `GST ${billingSummary.gst}%`
                                                : "GST 0%"
                                        }
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Stack>
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
                                                            (p) => Number(p.dispensedQuantity || 0) < Number(p.quantity || 0) && isMedicineAvailable(p.medication) && selectedMedicines[p._id]?.selected
                                                        ).length > 0 &&
                                                        prescriptions.filter(
                                                            (p) => Number(p.dispensedQuantity || 0) < Number(p.quantity || 0) && isMedicineAvailable(p.medication) && selectedMedicines[p._id]?.selected
                                                        ).length < prescriptions.filter((p) => Number(p.dispensedQuantity || 0) < Number(p.quantity || 0) && isMedicineAvailable(p.medication)).length
                                                    }
                                                    checked={
                                                        prescriptions.filter((p) => Number(p.dispensedQuantity || 0) < Number(p.quantity || 0) && isMedicineAvailable(p.medication)).length > 0 &&
                                                        prescriptions.filter(
                                                            (p) => Number(p.dispensedQuantity || 0) < Number(p.quantity || 0) && isMedicineAvailable(p.medication) && selectedMedicines[p._id]?.selected
                                                        ).length === prescriptions.filter((p) => Number(p.dispensedQuantity || 0) < Number(p.quantity || 0) && isMedicineAvailable(p.medication)).length
                                                    }
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        const pendingPrescriptions = prescriptions.filter(
                                                            (p) => Number(p.dispensedQuantity || 0) < Number(p.quantity || 0) && isMedicineAvailable(p.medication)
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
                                            // const isFullyDispensed = presc.status === "Dispensed";


                                            const dispensedQty = presc.dispensedQuantity || 0;
                                            const prescribedQuantity = presc.quantity || 1;
                                            const isFullyDispensed = dispensedQty >= prescribedQuantity;
                                            const isPartiallyDispensed =
                                                dispensedQty > 0 && dispensedQty < prescribedQuantity;
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
                                                        <Tooltip title={presc.duration || "N/A"} arrow>
                                                            <Box>
                                                                <Chip
                                                                    label={presc.duration || "N/A"}
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
                                                        {isFullyDispensed ? (
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ fontWeight: 600 }}
                                                            >
                                                                {dispensedQty}
                                                            </Typography>
                                                        ) : (
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                value={dispenseQuantity}
                                                                onChange={(e) => handleQuantityChange(presc._id, e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "-" || e.key === "e") {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                inputProps={{
                                                                    min: 0,
                                                                    style: { textAlign: "center" },
                                                                }}
                                                                sx={{
                                                                    "& .MuiOutlinedInput-root": {
                                                                        width: "120px",
                                                                    },
                                                                }}
                                                                placeholder="Enter qty"
                                                            />
                                                        )}
                                                    </TableCell>

                                                    <TableCell align="center">
                                                        {(() => {
                                                            const qtyForAmount =
                                                                dispenseQuantity ||
                                                                dispensedQty ||
                                                                prescribedQuantity;
                                                            return (
                                                                <Typography
                                                                    fontWeight={600}
                                                                    color="primary"
                                                                    sx={{ fontSize: "0.875rem" }}
                                                                >
                                                                    ₹{calculateAmount(presc.medication, qtyForAmount)}
                                                                </Typography>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={presc.notes || presc.remarks || "-"} arrow>
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
                                                                {presc.notes || presc.remarks || "-"}
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
                                                            // label={presc.status || "Pending"}
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
                                                            } variant="filled"
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

                            <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", mt: 3, mb: 1 }}>
                                {(() => {
                                    const totals = calculateTotalWithGST();
                                    const hasHistory = paymentHistory.length > 0;
                                    return (
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                width: { xs: "100%", sm: hasHistory ? 640 : 380 },
                                                maxWidth: "100%",
                                                minWidth: 0,
                                                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                                borderRadius: 2,
                                            }}
                                        >
                                            <CardContent sx={{ pb: "16px !important", p: 2 }}>
                                                {!hasHistory && (
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                                        <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                                                            Billing Summary
                                                        </Typography>
                                                        <Chip
                                                            label={paymentStatus}
                                                            size="small"
                                                            color={
                                                                paymentStatus === "Paid"
                                                                    ? "success"
                                                                    : paymentStatus === "Partially Paid"
                                                                        ? "info"
                                                                        : "warning"
                                                            }
                                                            sx={{ fontWeight: 600, fontSize: "0.75rem", height: "24px" }}
                                                        />
                                                    </Box>
                                                )}

                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: { xs: "column", sm: "row" },
                                                        justifyContent: { sm: "space-between" },
                                                        alignItems: { xs: "stretch", sm: "flex-start" },
                                                        gap: { xs: 2, sm: 0 },
                                                    }}
                                                >
                                                    {hasHistory && (
                                                        <Box
                                                            sx={{
                                                                order: 1,
                                                                alignSelf: { xs: "flex-start", sm: "stretch" },
                                                                textAlign: "left",
                                                                flex: { sm: "1 1 0" },
                                                                minWidth: 0,
                                                                width: { xs: "100%", sm: "auto" },
                                                                pr: { sm: 2 },
                                                                borderRight: { sm: `1px dashed ${theme.palette.divider}` },
                                                                borderBottom: { xs: `1px dashed ${theme.palette.divider}`, sm: "none" },
                                                                pb: { xs: 2, sm: 0 },
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                fontWeight={600}
                                                                display="block"
                                                                sx={{ mb: 1, textTransform: "uppercase", letterSpacing: "0.5px" }}
                                                            >
                                                                Payment History
                                                            </Typography>
                                                            <Stack spacing={1}>
                                                                {paymentHistory.map((payment, index) => (
                                                                    <Box
                                                                        key={index}
                                                                        sx={{
                                                                            p: 1,
                                                                            borderRadius: 1.5,
                                                                            backgroundColor: alpha(theme.palette.background.default, 0.8),
                                                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                                                ₹{payment.amount}
                                                                            </Typography>
                                                                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "10px" }}>
                                                                                {new Date(payment.paidAt).toLocaleDateString()}{" "}
                                                                                {new Date(payment.paidAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                                                                            <Chip
                                                                                label={payment.method}
                                                                                size="small"
                                                                                variant="outlined"
                                                                                sx={{ height: "18px", fontSize: "9px", fontWeight: 500 }}
                                                                            />
                                                                            {(payment.transactionId || payment.cardDigits) && (
                                                                                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "9px" }}>
                                                                                    {payment.method === "Card"
                                                                                        ? `Card ending in ${payment.cardDigits || "XXXX"}`
                                                                                        : payment.transactionId}
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                ))}
                                                            </Stack>
                                                        </Box>
                                                    )}

                                                    <Box
                                                        sx={{
                                                            order: 2,
                                                            alignSelf: hasHistory ? { xs: "flex-end", sm: "stretch" } : "stretch",
                                                            textAlign: "right",
                                                            flex: hasHistory ? { sm: "0 0 auto" } : undefined,
                                                            minWidth: hasHistory ? { xs: 260, sm: 260 } : 0,
                                                            maxWidth: hasHistory ? { xs: "100%", sm: 360 } : "100%",
                                                            width: hasHistory ? { xs: "auto", sm: "auto" } : "100%",
                                                            pl: { sm: hasHistory ? 2 : 0 },
                                                        }}
                                                    >
                                                        {hasHistory && (
                                                            <Box
                                                                sx={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center",
                                                                    mb: 1.5,
                                                                    gap: 1,
                                                                }}
                                                            >
                                                                <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600, textAlign: "left" }}>
                                                                    Billing Summary
                                                                </Typography>
                                                                <Chip
                                                                    label={paymentStatus}
                                                                    size="small"
                                                                    color={
                                                                        paymentStatus === "Paid"
                                                                            ? "success"
                                                                            : paymentStatus === "Partially Paid"
                                                                                ? "info"
                                                                                : "warning"
                                                                    }
                                                                    sx={{ fontWeight: 600, fontSize: "0.75rem", height: "24px", flexShrink: 0 }}
                                                                />
                                                            </Box>
                                                        )}
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1 }}>
                                                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left" }}>
                                                                Cost (without GST):
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={500} sx={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                                                ₹{totals.subtotal}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1 }}>
                                                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left" }}>
                                                                GST ({totals.gstPercentage}%):
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={500} sx={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                                                ₹{totals.gstAmount}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ borderBottom: 1, borderColor: "divider", my: 1.5 }} />
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center" }}>
                                                            <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ textAlign: "left" }}>
                                                                Total (with GST):
                                                            </Typography>
                                                            <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                                                ₹{totals.total}
                                                            </Typography>
                                                        </Box>
                                                        {padeamount > 0 && (
                                                            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 1 }}>
                                                                <Typography variant="body2" color="success.main" fontWeight={500} sx={{ textAlign: "left" }}>
                                                                    Total Paid:
                                                                </Typography>
                                                                <Typography variant="body2" color="success.main" fontWeight={600} sx={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                                                    ₹{paidAmount.toFixed(2)}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {balanceDue > 0 && (
                                                            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 0.5 }}>
                                                                <Typography variant="body2" color="error.main" fontWeight={500} sx={{ textAlign: "left" }}>
                                                                    Balance Due:
                                                                </Typography>
                                                                <Typography variant="body2" color="error.main" fontWeight={600} sx={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                                                    ₹{balanceDue.toFixed(2)}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    );
                                })()}
                            </Box>

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
                                        Select medicines to dispense and specify quantities. You can dispense partial quantities if needed.
                                    </Typography>
                                    <Button
                                        type="button"
                                        variant="contained"
                                        startIcon={isDispensing ? <CircularProgress size={16} color="inherit" /> : <LocalPharmacy />}
                                        onClick={(e) => {
                                            console.log("Button clicked");
                                            handleDispense(e);
                                        }}
                                        disabled={isDispensing || status === "Dispensed"}
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
                        Are you sure you want to dispense {pendingSelectedPrescriptions.length} medicine(s) for {patientName}?
                    </DialogContentText>

                    <TextField
                        label="GST (%)"
                        type="number"
                        fullWidth
                        value={gst}
                        onChange={(e) => setGst(Number(e.target.value))}
                        sx={{ mb: 2 }}
                        inputProps={{ min: 0 }}
                    />

                    {(() => {
                        const totals = calculateTotalWithGST();
                        return (
                            <Box>
                                <Typography variant="body2">
                                    Subtotal: ₹{totals.subtotal}
                                </Typography>
                                <Typography variant="body2">
                                    GST ({gst}%): ₹{totals.gstAmount}
                                </Typography>
                                <Typography variant="h6" fontWeight={600}>
                                    Total: ₹{totals.total}
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

            {/* Payment Dialog */}
            <Dialog
                open={showPaymentDialog}
                onClose={() => setShowPaymentDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{ pb: 1, pt: 3 }}>
                    <Typography variant="h5" fontWeight={700} textAlign="center">
                        Record Payment
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Payment Amount"
                            type="number"
                            fullWidth
                            value={paymentDetails.amount}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: e.target.value })}
                            sx={{ mb: 2.5 }}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography>,
                            }}
                        />

                        <FormControl fullWidth sx={{ mb: 2.5 }}>
                            <InputLabel id="payment-method-label">Payment Method</InputLabel>
                            <Select
                                labelId="payment-method-label"
                                value={paymentDetails.method}
                                label="Payment Method"
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, method: e.target.value })}
                            >
                                <MenuItem value="Cash">
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Payments fontSize="small" /> Cash
                                    </Box>
                                </MenuItem>
                                <MenuItem value="Card">
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CreditCard fontSize="small" /> Card
                                    </Box>
                                </MenuItem>
                                <MenuItem value="Online">
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Smartphone fontSize="small" /> Online
                                    </Box>
                                </MenuItem>
                                <MenuItem value="Bank Transfer">
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <AccountBalance fontSize="small" /> Bank Transfer
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>


                        {(paymentDetails.method === "Online" || paymentDetails.method === "Bank Transfer" || paymentDetails.method === "Card") && (
                            <TextField
                                label={paymentDetails.method === "Card" ? "Reference Number" : "Transaction ID"}
                                fullWidth
                                variant="outlined"
                                value={paymentDetails.transactionId}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })}
                                sx={{ mb: 2.5 }}
                                placeholder="Enter reference number"
                            />
                        )}

                        {paymentDetails.method === "Card" && (
                            <TextField
                                label="Card Last 4 Digits"
                                fullWidth
                                variant="outlined"
                                value={paymentDetails.cardDigits}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setPaymentDetails({ ...paymentDetails, cardDigits: val });
                                }}
                                placeholder="XXXX"
                                sx={{ mb: 2.5 }}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={() => setShowPaymentDialog(false)}
                        sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleRecordPayment}
                        disabled={isSubmittingPayment}
                        sx={{
                            px: 4,
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: 1.5,
                            minWidth: 120
                        }}
                    >
                        {isSubmittingPayment ? <CircularProgress size={24} color="inherit" /> : "Confirm Payment"}
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

export default ListPrescriptions;