import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, CircularProgress, Grid, Typography } from "@mui/material";
import { toast } from "react-toastify";

function ViewPatientPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    
    const [patient, setPatient] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPatientDetails = useCallback(async () => {
        if (!patientId) {
            toast.error("Patient ID is required");
            navigate("/receptionist/appointments");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(
                getApiUrl(`reception-patients/${patientId}`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                setPatient(response.data.data);
            } else {
                toast.error(response.data.message || "Failed to fetch patient details");
                navigate("/receptionist/appointments");
            }
        } catch (error) {
            console.error("Error fetching patient details:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch patient details");
            navigate("/receptionist/appointments");
        } finally {
            setIsLoading(false);
        }
    }, [patientId, navigate]);

    useEffect(() => {
        fetchPatientDetails();
    }, [fetchPatientDetails]);

    return (
        <div>
            <HeadingCard
                title="View Patient Details"
                subtitle="View and update patient information"
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "View Patient" },
                ]}
            />

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            ) : patient ? (
                <Box
                    sx={{
                        backgroundColor: "var(--color-bg-a)",
                        borderRadius: "12px",
                        p: 3,
                        mt: 2,
                        maxWidth: "800px",
                        mx: "auto",
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Patient Name"
                                fullWidth
                                value={patient.patientName || ""}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Contact Number"
                                fullWidth
                                value={patient.contactNumber || ""}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        </Grid>
                        {patient.alternativeNumber && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Alternative Number"
                                    fullWidth
                                    value={patient.alternativeNumber || ""}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Email"
                                fullWidth
                                value={patient.email || ""}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        </Grid>
                        {patient.gender && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Gender"
                                    fullWidth
                                    value={patient.gender || ""}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                        )}
                        {patient.age && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Age"
                                    fullWidth
                                    type="number"
                                    value={patient.age || ""}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                        )}
                        {patient.address && (
                            <Grid item xs={12}>
                                <TextField
                                    label="Address"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={patient.address || ""}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="UHID"
                                fullWidth
                                value={patient.patientProfile?.user?.uhid || "Not assigned"}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        </Grid>
                        {patient.patientProfile?.patientId && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Patient ID"
                                    fullWidth
                                    value={patient.patientProfile.patientId || ""}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                        )}
                        {patient.status && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Status"
                                    fullWidth
                                    value={patient.status || ""}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                        )}
                        {patient.createdAt && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Registered Date"
                                    fullWidth
                                    value={new Date(patient.createdAt).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                        )}
                    </Grid>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                        <Box 
                            component="button"
                            onClick={() => navigate(-1)}
                            sx={{
                                padding: "10px 20px",
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                "&:hover": {
                                    backgroundColor: "#5a6268"
                                }
                            }}
                        >
                            Back
                        </Box>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    Patient not found
                </Box>
            )}
        </div>
    );
}

export default ViewPatientPage;
