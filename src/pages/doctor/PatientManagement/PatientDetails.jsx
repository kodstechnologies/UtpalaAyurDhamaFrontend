import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Box, Typography, Card, CardContent, CircularProgress, Grid, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton,
    Divider
} from "@mui/material";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { toast } from "react-toastify";
// Icons
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MedicationIcon from "@mui/icons-material/Medication";
import HealingIcon from "@mui/icons-material/Healing";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";

function PatientDetails() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [inpatient, setInpatient] = useState(null);
    const [therapySessions, setTherapySessions] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingTherapySessions, setIsLoadingTherapySessions] = useState(false);
    const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
    
    // Modal states
    const [selectedCheckup, setSelectedCheckup] = useState(null);
    const [selectedTherapySession, setSelectedTherapySession] = useState(null);
    const [openCheckupDialog, setOpenCheckupDialog] = useState(false);
    const [openTherapyDialog, setOpenTherapyDialog] = useState(false);

    // Fetch inpatient details
    const fetchInpatientDetails = useCallback(async () => {
        if (!patientId) {
            toast.error("Patient ID is missing");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl(`inpatients/${patientId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                setInpatient(response.data.data);
            } else {
                toast.error(response.data.message || "Failed to fetch inpatient details");
            }
        } catch (error) {
            console.error("Error fetching inpatient details:", error);
            toast.error(error.response?.data?.message || "Failed to load inpatient details");
        } finally {
            setIsLoading(false);
        }
    }, [patientId]);

    // Fetch therapy sessions for this inpatient
    const fetchTherapySessions = useCallback(async () => {
        if (!patientId) return;

        setIsLoadingTherapySessions(true);
        try {
            const response = await axios.get(
                getApiUrl("therapist-sessions"),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                // Filter sessions by inpatient ID
                const sessions = response.data.data || [];
                const filteredSessions = sessions.filter(
                    session => session.inpatient?._id?.toString() === patientId || 
                               session.inpatient?.toString() === patientId
                );
                setTherapySessions(filteredSessions);
            }
        } catch (error) {
            console.error("Error fetching therapy sessions:", error);
            // Don't show error toast, just log it
        } finally {
            setIsLoadingTherapySessions(false);
        }
    }, [patientId]);

    // Fetch IPD prescriptions for this inpatient
    const fetchPrescriptions = useCallback(async () => {
        if (!patientId) return;

        setIsLoadingPrescriptions(true);
        try {
            const response = await axios.get(
                getApiUrl("examinations/prescriptions/ipd/by-doctor"),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                // Filter prescriptions by inpatient ID
                const allPrescriptions = response.data.data || [];
                const filteredPrescriptions = allPrescriptions.filter(
                    prescription => {
                        const prescriptionInpatientId = prescription.examination?.inpatient?._id || 
                                                       prescription.examination?.inpatient;
                        return prescriptionInpatientId?.toString() === patientId;
                    }
                );
                setPrescriptions(filteredPrescriptions);
            }
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
            // Don't show error toast, just log it
        } finally {
            setIsLoadingPrescriptions(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchInpatientDetails();
        fetchTherapySessions();
        fetchPrescriptions();
    }, [fetchInpatientDetails, fetchTherapySessions, fetchPrescriptions]);

    // Handle view checkup details
    const handleViewCheckup = (row) => {
        // Use the original checkup data if available, otherwise use row data
        const checkup = row.originalCheckup || inpatient?.dailyCheckups?.find((c, index) => 
            (c._id && c._id.toString() === row._id) || 
            (!c._id && index.toString() === row._id)
        ) || row;
        setSelectedCheckup(checkup);
        setOpenCheckupDialog(true);
    };

    // Handle view therapy session details
    const handleViewTherapySession = (row) => {
        const session = therapySessions.find(s => s._id === row._id);
        setSelectedTherapySession(session || row);
        setOpenTherapyDialog(true);
    };

    // Helper function to render field in detail view
    const renderDetailField = (label, value) => (
        <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "var(--color-text-muted)", mb: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, color: "var(--color-text-dark)" }}>
                {value || "N/A"}
            </Typography>
        </Box>
    );

    // 👉 Daily checkup table columns
    const checkupColumns = [
        { field: "date", header: "Date & Time" },
        { field: "recordedBy", header: "Recorded By" },
        { field: "temperature", header: "Temperature" },
        { field: "bloodPressure", header: "Blood Pressure" },
        { field: "pulseRate", header: "Pulse" },
        { field: "spo2", header: "SpO₂" },
        { field: "notes", header: "Notes" },
    ];

    // Transform daily checkups for table (keep original data reference)
    const checkupRows = inpatient?.dailyCheckups?.map((checkup, index) => ({
        _id: checkup._id || `checkup-${index}`,
        date: checkup.date ? new Date(checkup.date).toLocaleString() : "N/A",
        recordedBy: checkup.recordedBy?.name || "N/A",
        temperature: checkup.temperature || "N/A",
        bloodPressure: checkup.bloodPressure || "N/A",
        pulseRate: checkup.pulseRate || "N/A",
        spo2: checkup.spo2 || "N/A",
        notes: checkup.notes || "N/A",
        originalCheckup: checkup, // Store original checkup data
    })) || [];

    // Checkup actions
    const checkupActions = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            label: "View Details",
            onClick: handleViewCheckup,
        },
    ];

    // Therapy session actions
    const therapyActions = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            label: "View Details",
            onClick: handleViewTherapySession,
        },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!inpatient) {
        return (
            <Box sx={{ padding: "24px" }}>
                <Typography variant="h6" color="error">
                    Inpatient record not found.
                </Typography>
            </Box>
        );
    }

    const patientName = inpatient.patient?.user?.name || "N/A";
    const wardCategory = inpatient.wardCategory || "N/A";
    const roomNumber = inpatient.roomNumber || "N/A";
    const bedNumber = inpatient.bedNumber || "";
    const admissionDate = inpatient.admissionDate
        ? new Date(inpatient.admissionDate).toLocaleDateString()
        : "N/A";
    const dischargeDate = inpatient.dischargeDate
        ? new Date(inpatient.dischargeDate).toLocaleDateString()
        : null;
    const status = inpatient.status || "Admitted";
    const reason = inpatient.reason || "N/A";
    const notes = inpatient.notes || "";
    const doctorName = inpatient.doctor?.user?.name || "N/A";
    const nurseName = inpatient.allocatedNurse?.user?.name || "Not Assigned";

    return (
        <Box sx={{ padding: "24px", backgroundColor: "var(--color-bg-a)" }}>

            {/* ========== PAGE HEADER ========== */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--color-primary-dark)" }}>
                    {patientName}
                </Typography>

                <Typography sx={{ mt: 1, color: "var(--color-text-muted)", fontSize: "15px" }}>
                    Ward: {wardCategory} • Room: {roomNumber}{bedNumber ? ` • Bed: ${bedNumber}` : ""} • Admitted: {admissionDate}
                    {dischargeDate ? ` • Discharged: ${dischargeDate}` : ""}
                </Typography>
                <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                        label={`Status: ${status}`}
                        color={status === "Admitted" ? "success" : status === "Discharged" ? "default" : "warning"}
                        size="small"
                    />
                    <Chip label={`Doctor: ${doctorName}`} size="small" variant="outlined" />
                    <Chip label={`Nurse: ${nurseName}`} size="small" variant="outlined" />
                </Box>
            </Box>

            {/* ========== IPD DETAILS CARD ========== */}
            <Card sx={{ mb: 4, borderRadius: "12px", backgroundColor: "var(--color-bg-card)", boxShadow: "var(--shadow-medium)" }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: "18px", mb: 2 }}>
                        IPD Details
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Reason for Admission</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{reason}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Admission Date</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{admissionDate}</Typography>
                        </Grid>
                        {dischargeDate && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Discharge Date</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{dischargeDate}</Typography>
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Ward Category</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{wardCategory}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Room Number</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{roomNumber}</Typography>
                        </Grid>
                        {bedNumber && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Bed Number</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{bedNumber}</Typography>
                            </Grid>
                        )}
                        {notes && (
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">Notes</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{notes}</Typography>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            {/* ========== TOP CARDS ========== */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mb: 4,
                    flexWrap: { xs: "wrap", sm: "wrap", md: "nowrap" },
                    width: "100%",
                }}
            >
                <DashboardCard
                    title="CHECKUPS"
                    count={checkupRows.length}
                    icon={CalendarTodayIcon}
                    sx={{ flex: 1 }}
                />

                <DashboardCard
                    title="THERAPY SESSIONS"
                    count={therapySessions.length}
                    icon={HealingIcon}
                    sx={{ flex: 1 }}
                />

                <DashboardCard
                    title="PRESCRIPTIONS"
                    count={prescriptions.length}
                    icon={MedicationIcon}
                    sx={{ flex: 1 }}
                />
            </Box>


            {/* ========== DAILY CHECKUPS (USING TableComponent) ========== */}
            <Card sx={{ mb: 4, borderRadius: "12px", backgroundColor: "var(--color-bg-card)", boxShadow: "var(--shadow-medium)" }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: "18px", mb: 2 }}>
                        Daily Checkups
                    </Typography>

                    {checkupRows.length > 0 ? (
                        <TableComponent
                            columns={checkupColumns}
                            rows={checkupRows}
                            actions={checkupActions}
                            showStatusBadge={false}
                            showCheckbox={false}
                        />
                    ) : (
                        <Typography sx={{ color: "var(--color-text-muted)", fontSize: 15 }}>
                            No daily checkups recorded yet.
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* ========== THERAPY SESSIONS SECTION ========== */}
            <Card sx={{ mb: 4, borderRadius: "12px", backgroundColor: "var(--color-bg-card)", boxShadow: "var(--shadow-medium)" }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: "18px", mb: 2 }}>
                        Therapy Sessions
                    </Typography>

                    {isLoadingTherapySessions ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : therapySessions.length > 0 ? (
                        <TableComponent
                            columns={[
                                { field: "treatmentName", header: "Treatment Name" },
                                { field: "therapist", header: "Therapist" },
                                { field: "daysOfTreatment", header: "Total Sessions" },
                                { field: "timeline", header: "Timeline" },
                                { field: "status", header: "Status" },
                                { field: "createdAt", header: "Created Date" },
                            ]}
                            rows={therapySessions.map((session) => ({
                                _id: session._id,
                                treatmentName: session.treatmentName || "N/A",
                                therapist: session.therapist?.user?.name || "Not Assigned",
                                daysOfTreatment: session.daysOfTreatment || "N/A",
                                timeline: session.timeline || "N/A",
                                status: session.status || "Pending",
                                createdAt: session.createdAt 
                                    ? new Date(session.createdAt).toLocaleDateString() 
                                    : "N/A",
                            }))}
                            actions={therapyActions}
                            showStatusBadge={false}
                            showCheckbox={false}
                        />
                    ) : (
                        <Typography sx={{ color: "var(--color-text-muted)", fontSize: 15 }}>
                            No therapy sessions found.
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* ========== PRESCRIPTIONS SECTION ========== */}
            <Card sx={{ mb: 5, borderRadius: "12px", backgroundColor: "var(--color-bg-card)", boxShadow: "var(--shadow-medium)" }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: "18px", mb: 2 }}>
                        Prescriptions
                    </Typography>

                    {isLoadingPrescriptions ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : prescriptions.length > 0 ? (
                        <TableComponent
                            columns={[
                                { field: "medication", header: "Medicine" },
                                { field: "dosage", header: "Dosage" },
                                { field: "frequency", header: "Frequency" },
                                { field: "duration", header: "Duration" },
                                { field: "status", header: "Status" },
                                { field: "createdAt", header: "Prescribed Date" },
                            ]}
                            rows={prescriptions.map((prescription) => ({
                                _id: prescription._id,
                                medication: prescription.medication || "N/A",
                                dosage: prescription.dosage || "N/A",
                                frequency: prescription.frequency || "N/A",
                                duration: prescription.duration || "N/A",
                                status: prescription.status === "Pending" ? "Active" : prescription.status === "Dispensed" ? "Completed" : prescription.status || "Active",
                                createdAt: prescription.createdAt 
                                    ? new Date(prescription.createdAt).toLocaleDateString() 
                                    : "N/A",
                                rawData: prescription,
                            }))}
                            actions={[
                                {
                                    icon: <VisibilityIcon fontSize="small" />,
                                    color: "var(--color-primary)",
                                    tooltip: "View Details",
                                    onClick: (row) => {
                                        navigate(`/doctor/ipd-prescriptions/${row._id}`);
                                    },
                                },
                                {
                                    icon: <EditIcon fontSize="small" />,
                                    color: "var(--color-warning)",
                                    tooltip: "Edit Prescription",
                                    onClick: (row) => {
                                        navigate(`/doctor/ipd-prescriptions/edit/${row._id}`);
                                    },
                                },
                            ]}
                            showStatusBadge={false}
                            showCheckbox={false}
                        />
                    ) : (
                        <Typography sx={{ color: "var(--color-text-muted)", fontSize: 15 }}>
                            No prescriptions found.
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* ========== DAILY CHECKUP DETAILS DIALOG ========== */}
            <Dialog 
                open={openCheckupDialog} 
                onClose={() => setOpenCheckupDialog(false)} 
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Daily Checkup Details
                    </Typography>
                    <IconButton onClick={() => setOpenCheckupDialog(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ mt: 2 }}>
                    {selectedCheckup && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Date & Time", selectedCheckup.date ? new Date(selectedCheckup.date).toLocaleString() : "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Recorded By", selectedCheckup.recordedBy?.name || selectedCheckup.recordedBy || "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Temperature (°F)", selectedCheckup.temperature || "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Blood Pressure (mmHg)", selectedCheckup.bloodPressure || "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Pulse Rate (bpm)", selectedCheckup.pulseRate || "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("SpO₂ (%)", selectedCheckup.spo2 || "N/A")}
                            </Grid>
                            <Grid item xs={12}>
                                {renderDetailField("Notes / Description", selectedCheckup.notes || "N/A")}
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenCheckupDialog(false)} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== THERAPY SESSION DETAILS DIALOG ========== */}
            <Dialog 
                open={openTherapyDialog} 
                onClose={() => setOpenTherapyDialog(false)} 
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Therapy Session Details
                    </Typography>
                    <IconButton onClick={() => setOpenTherapyDialog(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ mt: 2 }}>
                    {selectedTherapySession && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Treatment Name", selectedTherapySession.treatmentName || "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Therapist", selectedTherapySession.therapist?.user?.name || "Not Assigned")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Therapist Speciality", selectedTherapySession.therapist?.speciality || "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Total Sessions (Days of Treatment)", selectedTherapySession.daysOfTreatment || "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Timeline", selectedTherapySession.timeline || "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Status", selectedTherapySession.status || "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Session Date", selectedTherapySession.sessionDate ? new Date(selectedTherapySession.sessionDate).toLocaleString() : "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Session Time", selectedTherapySession.sessionTime || "N/A")}
                            </Grid>
                            <Grid item xs={12}>
                                {renderDetailField("Special Instructions", selectedTherapySession.specialInstructions || "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Created Date", selectedTherapySession.createdAt ? new Date(selectedTherapySession.createdAt).toLocaleString() : "N/A")}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderDetailField("Updated Date", selectedTherapySession.updatedAt ? new Date(selectedTherapySession.updatedAt).toLocaleString() : "N/A")}
                            </Grid>
                            {selectedTherapySession.days && selectedTherapySession.days.length > 0 && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ color: "var(--color-text-muted)", mb: 1 }}>
                                        Session Days
                                    </Typography>
                                    <Box sx={{ pl: 2 }}>
                                        {selectedTherapySession.days.map((day, index) => (
                                            <Box key={index} sx={{ mb: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    Day {index + 1}: {day.date ? new Date(day.date).toLocaleDateString() : "N/A"} 
                                                    {day.time && ` at ${day.time}`}
                                                    {day.completed !== undefined && ` - ${day.completed ? 'Completed' : 'Pending'}`}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenTherapyDialog(false)} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

export default PatientDetails;