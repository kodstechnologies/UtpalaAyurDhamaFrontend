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

function OutpatientPrescriptions() {
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
                    navigate("/pharmacist/prescriptions/outpatient");
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
                navigate("/pharmacist/prescriptions/outpatient");
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

    const handleDownload = async () => {
        if (!patient || prescriptions.length === 0) {
            toast.error("No data available to download");
            return;
        }

        try {
            // Create a temporary div for the content
            const printContent = document.createElement("div");
            printContent.style.width = "210mm"; // A4 width
            printContent.style.padding = "20mm";
            printContent.style.fontFamily = "Arial, sans-serif";
            printContent.style.fontSize = "12px";
            printContent.style.color = "#000";
            printContent.style.backgroundColor = "#fff";
            printContent.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <h2 style="text-align: center; margin-bottom: 10px;">Outpatient Prescription</h2>
                    <p style="text-align: center; margin: 0;"><strong>Patient: ${patient?.user?.name || "Unknown"}</strong></p>
                    <p style="text-align: center; margin: 0;">UHID: ${patient?.user?.uhid || "N/A"} | Age: ${calculateAge(patient?.dateOfBirth) || 0} | Gender: ${patient?.gender || "N/A"}</p>
                    <p style="text-align: center; margin: 5px 0 0 0;">Doctor: ${prescriptions[0]?.doctor?.user?.name || "Unknown"} | Date: ${formatDate(examination?.createdAt || prescriptions[0]?.createdAt)}</p>
                    <p style="text-align: center; margin: 10px 0 0 0;"><strong>Diagnosis:</strong> ${examination?.complaints || "N/A"}</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <h3 style="margin-bottom: 10px;">Patient Information</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr><td style="border: 1px solid #000; padding: 8px;"><strong>Full Name</strong></td><td style="border: 1px solid #000; padding: 8px;">${patient?.user?.name || "N/A"}</td></tr>
                        <tr><td style="border: 1px solid #000; padding: 8px;"><strong>UHID</strong></td><td style="border: 1px solid #000; padding: 8px;">${patient?.user?.uhid || "N/A"}</td></tr>
                        <tr><td style="border: 1px solid #000; padding: 8px;"><strong>Consulting Doctor</strong></td><td style="border: 1px solid #000; padding: 8px;">${prescriptions[0]?.doctor?.user?.name || "Unknown"}</td></tr>
                        <tr><td style="border: 1px solid #000; padding: 8px;"><strong>Prescription Date</strong></td><td style="border: 1px solid #000; padding: 8px;">${formatDate(examination?.createdAt || prescriptions[0]?.createdAt)}</td></tr>
                        <tr><td style="border: 1px solid #000; padding: 8px;"><strong>Diagnosis</strong></td><td style="border: 1px solid #000; padding: 8px;">${examination?.complaints || "N/A"}</td></tr>
                    </table>
                </div>
                <div>
                    <h3 style="margin-bottom: 10px;">Prescribed Medicines</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f0f0f0;">
                                <th style="border: 1px solid #000; padding: 8px;">Medicine</th>
                                <th style="border: 1px solid #000; padding: 8px;">Dosage</th>
                                <th style="border: 1px solid #000; padding: 8px;">Frequency</th>
                                <th style="border: 1px solid #000; padding: 8px;">Duration</th>
                                
                                <th style="border: 1px solid #000; padding: 8px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${prescriptions.map((presc) => `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 8px;">${presc.medication || "N/A"}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${presc.dosage || "N/A"}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${presc.frequency || "N/A"}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${presc.duration || "N/A"}</td>
                                   
                                    <td style="border: 1px solid #000; padding: 8px;">${presc.status || "Pending"}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 20px; text-align: center; font-size: 10px; color: #666;">
                </div>
            `;

            // Append to body temporarily
            document.body.appendChild(printContent);

            // Capture with html2canvas
            const canvas = await html2canvas(printContent, {
                scale: 2,
                useCORS: true,
                width: printContent.scrollWidth,
                height: printContent.scrollHeight,
                backgroundColor: "#ffffff",
            });

            // Create PDF
            const pdf = new jsPDF("p", "mm", "a4");
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            // Add first page
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // If content overflows, add more pages
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Download PDF
            pdf.save(`Prescription_${patient?.user?.uhid || "OUTPATIENT"}.pdf`);

            // Clean up
            document.body.removeChild(printContent);

            toast.success("Prescription downloaded successfully!");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to download prescription");
        }
    };

    const handlePrint = () => {
        if (!patient || prescriptions.length === 0) {
            toast.error("No data available to print");
            return;
        }

        // Open a new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            toast.error("Please allow popups to print the prescription");
            return;
        }

        const printContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Prescription Print</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            font-size: 12px; 
                            color: #000; 
                            background-color: #fff; 
                            margin: 0; 
                            padding: 20mm; 
                            width: 210mm; 
                        }
                        h2 { text-align: center; margin-bottom: 10px; }
                        p { text-align: center; margin: 0; }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 20px; 
                        }
                        th, td { 
                            border: 1px solid #000; 
                            padding: 8px; 
                            text-align: left; 
                        }
                        th { 
                            background-color: #f0f0f0; 
                        }
                        .diagnosis { 
                            margin: 10px 0 0 0; 
                        }
                        .footer { 
                            margin-top: 20px; 
                            text-align: center; 
                            font-size: 10px; 
                            color: #666; 
                        }
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <div style="margin-bottom: 20px;">
                        <h2>Outpatient Prescription</h2>
                        <p><strong>Patient: ${patient?.user?.name || "Unknown"}</strong></p>
                        <p>UHID: ${patient?.user?.uhid || "N/A"} | Age: ${calculateAge(patient?.dateOfBirth) || 0} | Gender: ${patient?.gender || "N/A"}</p>
                        <p style="margin: 5px 0 0 0;">Doctor: ${prescriptions[0]?.doctor?.user?.name || "Unknown"} | Date: ${formatDate(examination?.createdAt || prescriptions[0]?.createdAt)}</p>
                        <p class="diagnosis"><strong>Diagnosis:</strong> ${examination?.complaints || "N/A"}</p>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h3>Patient Information</h3>
                        <table>
                            <tr><td><strong>Full Name</strong></td><td>${patient?.user?.name || "N/A"}</td></tr>
                            <tr><td><strong>UHID</strong></td><td>${patient?.user?.uhid || "N/A"}</td></tr>
                            <tr><td><strong>Consulting Doctor</strong></td><td>${prescriptions[0]?.doctor?.user?.name || "Unknown"}</td></tr>
                            <tr><td><strong>Prescription Date</strong></td><td>${formatDate(examination?.createdAt || prescriptions[0]?.createdAt)}</td></tr>
                            <tr><td><strong>Diagnosis</strong></td><td>${examination?.complaints || "N/A"}</td></tr>
                        </table>
                    </div>
                    <div>
                        <h3>Prescribed Medicines</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Dosage</th>
                                    <th>Frequency</th>
                                    <th>Duration</th>
                                    
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${prescriptions.map((presc) => `
                                    <tr>
                                        <td>${presc.medication || "N/A"}</td>
                                        <td>${presc.dosage || "N/A"}</td>
                                        <td>${presc.frequency || "N/A"}</td>
                                        <td>${presc.duration || "N/A"}</td>
                                      
                                        <td>${presc.status || "Pending"}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                    <div class="footer">
                       
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Trigger print dialog
        printWindow.focus();
        printWindow.print();

        // Close the window after printing (optional, user can cancel)
        printWindow.onafterprint = () => {
            printWindow.close();
        };

        toast.success("Print preview opened. Please print the document.");
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
                        onClick={() => navigate("/pharmacist/prescriptions/outpatient")}
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
    const diagnosis = examination?.complaints || "N/A";
    const prescriptionDate = examination?.createdAt || prescriptions[0]?.createdAt;
    // Check if all prescriptions are dispensed
    const allDispensed = prescriptions.every((p) => p.status === "Dispensed");
    const status = allDispensed ? "Dispensed" : "Pending";

    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist/dashboard" },
        { label: "Outpatient Prescriptions", url: "/pharmacist/prescriptions/outpatient" },
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

        // Get selected medicines
        let selectedPrescriptions = prescriptions.filter(
            (p) => p.status !== "Dispensed" && selectedMedicines[p._id]?.selected
        );

        console.log("Selected Prescriptions:", selectedPrescriptions);

        // If no medicines are selected, auto-select all available medicines with their prescribed quantities
        if (selectedPrescriptions.length === 0) {
            const availablePrescriptions = prescriptions.filter(
                (p) => p.status !== "Dispensed" && isMedicineAvailable(p.medication)
            );

            if (availablePrescriptions.length === 0) {
                toast.error("No available medicines to dispense");
                return;
            }

            // Auto-select all available medicines with their prescribed quantities
            const newSelection = { ...selectedMedicines };
            availablePrescriptions.forEach((presc) => {
                newSelection[presc._id] = {
                    selected: true,
                    quantity: presc.quantity || presc.dosage || "",
                };
            });
            setSelectedMedicines(newSelection);
            selectedPrescriptions = availablePrescriptions;

            // Continue with dispense after auto-selection
            console.log("Auto-selected all available medicines, proceeding with dispense...");
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
            console.log("Starting dispense process...");

            // Update selected prescriptions with their quantities
            const updatePromises = selectedPrescriptions.map((presc) => {
                const selected = selectedMedicines[presc._id];
                const dispensedQuantity = selected.quantity;

                console.log(`Updating prescription ${presc._id} with quantity: ${dispensedQuantity}`);

                // Update the prescription with the dispensed quantity (as string)
                return axios.patch(
                    getApiUrl(`examinations/prescriptions/${presc._id}`),
                    {
                        status: "Dispensed",
                        dispensedQuantity: dispensedQuantity,
                    },
                    { headers: getAuthHeaders() }
                ).then((response) => {
                    console.log(`Prescription ${presc._id} updated successfully:`, response.data);
                    return response;
                }).catch((error) => {
                    console.error(`Error updating prescription ${presc._id}:`, error);
                    throw error;
                });
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
            console.error("Error details:", {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
            });
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
                            <LocalPharmacy sx={{ color: theme.palette.primary.main }} />
                            <span>Outpatient Prescription</span>
                            <Chip
                                label={status === "Dispensed" ? "Dispensed" : "Pending"}
                                color={status === "Dispensed" ? "success" : "warning"}
                                size="small"
                                icon={status === "Dispensed" ? <CheckCircle /> : <Pending />}
                                sx={{ ml: 1 }}
                            />
                        </Box>
                    }
                    subtitle="Review patient details and dispense prescribed medicines with care."
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
                                    type="button"
                                    variant="contained"
                                    startIcon={isDispensing ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                                    onClick={(e) => {
                                        console.log("Header button clicked");
                                        handleDispense(e);
                                    }}
                                    disabled={isDispensing || status === "Dispensed"}
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
                                            <TableCell sx={{ minWidth: 180 }}>Medicine</TableCell>
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
                                                        <Tooltip title={presc.medication || "N/A"} arrow>
                                                            <Typography
                                                                fontWeight={500}
                                                                sx={{
                                                                    wordBreak: "break-word",
                                                                    overflowWrap: "break-word",
                                                                    maxWidth: "180px",
                                                                }}
                                                            >
                                                                {presc.medication || "N/A"}
                                                            </Typography>
                                                        </Tooltip>
                                                        {presc.medicineType && (
                                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                                {presc.medicineType}
                                                            </Typography>
                                                        )}
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
                                                        {isMedicineAvailable(presc.medication) ? (
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
                                                        ) : (
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
                                                        )}
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
                    <DialogContentText>
                        Are you sure you want to dispense {pendingSelectedPrescriptions.length} medicine(s) for {patientName}?
                    </DialogContentText>
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

export default OutpatientPrescriptions;