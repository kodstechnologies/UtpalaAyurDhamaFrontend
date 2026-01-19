import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    CircularProgress,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Checkbox,
    ListItemText,
    OutlinedInput,
    IconButton,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

function PatientTherapyDetails() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");

    const [patient, setPatient] = useState(null);
    const [therapySessions, setTherapySessions] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reallocateDialog, setReallocateDialog] = useState({ 
        open: false, 
        session: null, 
        selectedTherapists: [] 
    });

    // Fetch patient details
    const fetchPatient = useCallback(async () => {
        if (!patientId) {
            toast.error("Patient ID is missing");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                getApiUrl(`patients/${patientId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                setPatient(response.data.data);
            } else {
                toast.error(response.data.message || "Failed to fetch patient details");
            }
        } catch (error) {
            console.error("Error fetching patient:", error);
            toast.error(error.response?.data?.message || "Failed to load patient details");
        }
    }, [patientId]);

    // Fetch therapy sessions for this patient
    const fetchTherapySessions = useCallback(async () => {
        if (!patientId) return;

        try {
            const response = await axios.get(
                getApiUrl("therapist-sessions"),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                const sessions = response.data.data || [];
                // Filter sessions by patient profile ID
                const filteredSessions = sessions.filter(
                    (session) =>
                        (session.patient?._id?.toString() === patientId) ||
                        (session.patient?.toString() === patientId)
                );
                setTherapySessions(filteredSessions);
            }
        } catch (error) {
            console.error("Error fetching therapy sessions:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to load therapy sessions";
            console.error("Error details:", {
                message: errorMessage,
                status: error.response?.status,
                data: error.response?.data
            });
            toast.error(errorMessage);
        }
    }, [patientId]);

    // Fetch all therapists
    const fetchTherapists = useCallback(async () => {
        setIsLoadingTherapists(true);
        try {
            const response = await axios.get(
                getApiUrl("therapists"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000,
                    },
                }
            );

            if (response.data.success) {
                setTherapists(response.data.data || []);
            } else {
                toast.error("Failed to fetch therapists");
            }
        } catch (error) {
            console.error("Error fetching therapists:", error);
            toast.error(error.response?.data?.message || "Error fetching therapists");
        } finally {
            setIsLoadingTherapists(false);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchPatient(), fetchTherapySessions(), fetchTherapists()]);
            setIsLoading(false);
        };
        loadData();
    }, [fetchPatient, fetchTherapySessions, fetchTherapists]);

    const handleReallocate = (session) => {
        // Get all assigned therapists (from array or single therapist field)
        // Map to user IDs for the select component
        const assignedTherapistUserIds = [];
        const therapistUserIds = new Set();
        
        // Add therapists from array if exists
        if (session.therapists && Array.isArray(session.therapists)) {
            session.therapists.forEach(t => {
                if (!t) return;
                // Get user ID from therapist profile
                const therapistUserId = t.user?._id || t.user;
                if (therapistUserId) {
                    const userIdStr = therapistUserId.toString();
                    if (!therapistUserIds.has(userIdStr)) {
                        therapistUserIds.add(userIdStr);
                        assignedTherapistUserIds.push(userIdStr);
                    }
                } else if (t._id) {
                    // If user ID not populated, find it from therapists list
                    const therapistFromList = therapists.find(th => th._id === t._id);
                    if (therapistFromList?.user?._id) {
                        const userIdStr = therapistFromList.user._id.toString();
                        if (!therapistUserIds.has(userIdStr)) {
                            therapistUserIds.add(userIdStr);
                            assignedTherapistUserIds.push(userIdStr);
                        }
                    }
                }
            });
        }
        
        // Add single therapist if exists and not already in array (backward compatibility)
        if (session.therapist) {
            const therapist = session.therapist;
            const therapistUserId = therapist.user?._id || therapist.user;
            if (therapistUserId) {
                const userIdStr = therapistUserId.toString();
                if (!therapistUserIds.has(userIdStr)) {
                    therapistUserIds.add(userIdStr);
                    assignedTherapistUserIds.push(userIdStr);
                }
            } else if (therapist._id) {
                // If user ID not populated, find it from therapists list
                const therapistFromList = therapists.find(th => th._id === therapist._id);
                if (therapistFromList?.user?._id) {
                    const userIdStr = therapistFromList.user._id.toString();
                    if (!therapistUserIds.has(userIdStr)) {
                        therapistUserIds.add(userIdStr);
                        assignedTherapistUserIds.push(userIdStr);
                    }
                }
            }
        }
        
        setReallocateDialog({
            open: true,
            session,
            selectedTherapists: assignedTherapistUserIds,
        });
    };

    const handleReallocateSubmit = async () => {
        if (!reallocateDialog.selectedTherapists || reallocateDialog.selectedTherapists.length === 0) {
            toast.error("Please select at least one therapist");
            return;
        }

        if (!reallocateDialog.session?._id) {
            toast.error("Session ID is missing");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.patch(
                getApiUrl(`therapist-sessions/${reallocateDialog.session._id}/assign`),
                {
                    therapistIds: reallocateDialog.selectedTherapists,
                },
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success(
                    reallocateDialog.selectedTherapists.length > 1
                        ? `${reallocateDialog.selectedTherapists.length} therapists assigned successfully!`
                        : "Therapist assigned successfully!"
                );
                setReallocateDialog({ open: false, session: null, selectedTherapists: [] });
                // Refresh therapy sessions
                await fetchTherapySessions();
            } else {
                toast.error(response.data.message || "Failed to assign therapists");
            }
        } catch (error) {
            console.error("Error assigning therapists:", error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Error assigning therapists. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveTherapist = async (sessionId, therapistId) => {
        if (!window.confirm("Are you sure you want to remove this therapist?")) {
            return;
        }

        try {
            const response = await axios.patch(
                getApiUrl(`therapist-sessions/${sessionId}/remove-therapist`),
                {
                    therapistId: therapistId,
                },
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success("Therapist removed successfully!");
                await fetchTherapySessions();
            } else {
                toast.error(response.data.message || "Failed to remove therapist");
            }
        } catch (error) {
            console.error("Error removing therapist:", error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Error removing therapist. Please try again.";
            toast.error(errorMessage);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            Scheduled: "success",
            Ongoing: "info",
            Completed: "primary",
            Pending: "warning",
            Cancelled: "error",
        };
        return colors[status] || "default";
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!patient) {
        return (
            <Box sx={{ padding: "24px" }}>
                <Typography variant="h6" color="error">
                    Patient not found.
                </Typography>
            </Box>
        );
    }

    const patientName = patient.user?.name || "N/A";
    const patientUHID = patient.user?.uhid || "N/A";
    const patientPhone = patient.user?.phone || "N/A";
    const patientEmail = patient.user?.email || "N/A";

    return (
        <div>
            <HeadingCard
                title="Patient Therapy Details"
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Home", url: "/" },
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Treatments", url: "/receptionist/treatments" },
                    { label: "Therapy Details" },
                ]}
            />

            <Box sx={{ mt: 2 }}>
                {/* Patient Information Card */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Patient Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <PersonIcon fontSize="small" color="primary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Name
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500}>
                                            {patientName}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        UHID
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {patientUHID}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Phone
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {patientPhone}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {patientEmail}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Therapy Sessions Card */}
                <Card>
                    <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Therapy Sessions
                            </Typography>
                        </Box>

                        {therapySessions.length === 0 ? (
                            <Box sx={{ textAlign: "center", padding: "40px" }}>
                                <Typography variant="body1" color="text.secondary">
                                    No therapy sessions found for this patient.
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                {therapySessions.map((session, index) => (
                                    <Card
                                        key={session._id || index}
                                        sx={{
                                            mb: 2,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            "&:hover": {
                                                boxShadow: 2,
                                            },
                                        }}
                                    >
                                        <CardContent>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Treatment Name
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>
                                                        {session.treatmentName || "N/A"}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Status
                                                    </Typography>
                                                    <Chip
                                                        label={session.status || "N/A"}
                                                        color={getStatusColor(session.status)}
                                                        size="small"
                                                        sx={{ mb: 1 }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                                        Assigned Therapists
                                                    </Typography>
                                                    {(() => {
                                                        // Get all assigned therapists (from array or single therapist field)
                                                        const assignedTherapists = [];
                                                        const therapistIds = new Set();
                                                        
                                                        // Add therapists from array if exists
                                                        if (session.therapists && Array.isArray(session.therapists)) {
                                                            session.therapists.forEach(t => {
                                                                if (!t) return;
                                                                const therapistId = (t._id || t).toString();
                                                                if (!therapistIds.has(therapistId)) {
                                                                    therapistIds.add(therapistId);
                                                                    assignedTherapists.push(t);
                                                                }
                                                            });
                                                        }
                                                        
                                                        // Add single therapist if exists and not already in array (backward compatibility)
                                                        if (session.therapist) {
                                                            const therapist = session.therapist;
                                                            const therapistId = (therapist._id || therapist).toString();
                                                            if (!therapistIds.has(therapistId)) {
                                                                therapistIds.add(therapistId);
                                                                assignedTherapists.push(therapist);
                                                            }
                                                        }
                                                        
                                                        if (assignedTherapists.length === 0) {
                                                            return (
                                                                <Box>
                                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                        No therapists assigned by doctor
                                                                    </Typography>
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        startIcon={<AssignmentIcon />}
                                                                        onClick={() => handleReallocate(session)}
                                                                        sx={{ 
                                                                            backgroundColor: "#4CAF50",
                                                                            "&:hover": {
                                                                                backgroundColor: "#45a049",
                                                                            }
                                                                        }}
                                                                    >
                                                                        Assign Therapist
                                                                    </Button>
                                                                </Box>
                                                            );
                                                        }
                                                        
                                                        return (
                                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                                {assignedTherapists.map((therapist, idx) => {
                                                                    const therapistId = therapist._id || therapist;
                                                                    const therapistName = therapist.user?.name || therapist.name || "Unknown";
                                                                    const therapistSpeciality = therapist.speciality || therapist.specialization || "";
                                                                    // Get user ID for removal - try from populated data or find from therapists list
                                                                    let therapistUserId = therapist.user?._id || therapist.user;
                                                                    if (!therapistUserId && therapist._id) {
                                                                        const therapistFromList = therapists.find(th => th._id === therapist._id);
                                                                        therapistUserId = therapistFromList?.user?._id || therapistFromList?.user;
                                                                    }
                                                                    // Fallback to therapist profile ID if user ID not found
                                                                    if (!therapistUserId) {
                                                                        therapistUserId = therapistId;
                                                                    }
                                                                    
                                                                    return (
                                                                        <Box 
                                                                            key={therapistId?.toString() || idx}
                                                                            sx={{ 
                                                                                display: "flex", 
                                                                                alignItems: "center", 
                                                                                gap: 1,
                                                                                p: 1,
                                                                                border: "1px solid",
                                                                                borderColor: "divider",
                                                                                borderRadius: 1,
                                                                                backgroundColor: "background.paper"
                                                                            }}
                                                                        >
                                                                            <LocalHospitalIcon fontSize="small" color="primary" />
                                                                            <Box sx={{ flex: 1 }}>
                                                                                <Typography variant="body2" fontWeight={500}>
                                                                                    {therapistName}
                                                                                </Typography>
                                                                                {therapistSpeciality && (
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        {therapistSpeciality}
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                            <IconButton
                                                                                size="small"
                                                                                color="error"
                                                                                onClick={() => handleRemoveTherapist(session._id, therapistUserId)}
                                                                                sx={{ ml: 1 }}
                                                                            >
                                                                                <DeleteIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Box>
                                                                    );
                                                                })}
                                                            </Box>
                                                        );
                                                    })()}
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Days of Treatment
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>
                                                        {session.daysOfTreatment || "N/A"}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Timeline
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>
                                                        {session.timeline || "N/A"}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Doctor
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>
                                                        {session.examination?.doctor?.user?.name ||
                                                            session.examination?.doctor?.name ||
                                                            "N/A"}
                                                    </Typography>
                                                </Grid>
                                                {session.specialInstructions && (
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Special Instructions
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            {session.specialInstructions}
                                                        </Typography>
                                                    </Grid>
                                                )}
                                                {(() => {
                                                    // Check if any therapists are assigned
                                                    const hasTherapists = 
                                                        (session.therapists && Array.isArray(session.therapists) && session.therapists.length > 0) ||
                                                        session.therapist;
                                                    
                                                    // Only show "Manage Therapists" button if therapists are already assigned
                                                    if (hasTherapists) {
                                                        return (
                                                            <Grid item xs={12}>
                                                                <Divider sx={{ my: 1 }} />
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<EditIcon />}
                                                                    onClick={() => handleReallocate(session)}
                                                                    sx={{ mt: 1 }}
                                                                >
                                                                    Manage Therapists
                                                                </Button>
                                                            </Grid>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Assign/Manage Therapists Dialog */}
            <Dialog
                open={reallocateDialog.open}
                onClose={() => setReallocateDialog({ open: false, session: null, selectedTherapists: [] })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Manage Therapists
                    </Typography>
                    <Button
                        onClick={() => setReallocateDialog({ open: false, session: null, selectedTherapists: [] })}
                        sx={{ minWidth: "auto", p: 0.5 }}
                    >
                        <CloseIcon />
                    </Button>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Treatment: <strong>{reallocateDialog.session?.treatmentName || "N/A"}</strong>
                        </Typography>
                    </Box>
                    <FormControl fullWidth required>
                        <InputLabel>Select Therapists</InputLabel>
                        <Select
                            multiple
                            value={reallocateDialog.selectedTherapists}
                            onChange={(e) => {
                                const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                                setReallocateDialog({
                                    ...reallocateDialog,
                                    selectedTherapists: value,
                                });
                            }}
                            input={<OutlinedInput label="Select Therapists" />}
                            renderValue={(selected) => {
                                if (selected.length === 0) return "Select therapists";
                                return selected.map(id => {
                                    const therapist = therapists.find(t => t._id === id);
                                    return therapist ? (therapist.user?.name || therapist.name) : id;
                                }).join(", ");
                            }}
                            disabled={isLoadingTherapists}
                        >
                            {therapists.map((therapist) => {
                                const therapistUserId = therapist.user?._id || therapist.user || therapist._id;
                                return (
                                    <MenuItem key={therapist._id} value={therapistUserId}>
                                        <Checkbox checked={reallocateDialog.selectedTherapists.indexOf(therapistUserId.toString()) > -1} />
                                        <ListItemText 
                                            primary={therapist.user?.name || therapist.name}
                                            secondary={therapist.speciality || therapist.specialization || "N/A"}
                                        />
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                        You can select multiple therapists for this session.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setReallocateDialog({ open: false, session: null, selectedTherapists: [] })}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleReallocateSubmit}
                        disabled={!reallocateDialog.selectedTherapists || reallocateDialog.selectedTherapists.length === 0 || isSubmitting}
                        sx={{ backgroundColor: "#8B4513" }}
                        startIcon={isSubmitting ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
                    >
                        {isSubmitting
                            ? "Processing..."
                            : "Save Therapists"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default PatientTherapyDetails;

