import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function AllocateResourcesPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inpatientId = searchParams.get("inpatientId") || "";
    const patientName = searchParams.get("patientName") || "";

    const [allocationForm, setAllocationForm] = useState({
        allocatedNurse: searchParams.get("allocatedNurse") || "",
        wardCategory: searchParams.get("wardCategory") || "",
        roomNo: searchParams.get("roomNo") || "",
        bedNumber: searchParams.get("bedNumber") || "",
    });

    const [nurses, setNurses] = useState([]);
    const [isLoadingNurses, setIsLoadingNurses] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch nurses from API
    const fetchNurses = useCallback(async () => {
        setIsLoadingNurses(true);
        try {
            const response = await axios.get(
                getApiUrl("nurses"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000, // Get all nurses
                    },
                }
            );

            if (response.data.success) {
                setNurses(response.data.data || []);
            } else {
                toast.error("Failed to fetch nurses");
            }
        } catch (error) {
            console.error("Error fetching nurses:", error);
            toast.error(error.response?.data?.message || "Error fetching nurses");
        } finally {
            setIsLoadingNurses(false);
        }
    }, []);

    useEffect(() => {
        fetchNurses();
    }, [fetchNurses]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAllocationForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!allocationForm.allocatedNurse || !allocationForm.wardCategory || !allocationForm.roomNo) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!inpatientId) {
            toast.error("Invalid inpatient ID");
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare update data
            const updateData = {
                allocatedNurse: allocationForm.allocatedNurse,
                wardCategory: allocationForm.wardCategory,
                roomNumber: allocationForm.roomNo,
                bedNumber: allocationForm.bedNumber || undefined,
            };

            // Set status to "Admitted" for new allocations
            updateData.status = "Admitted";

            // Update inpatient record
            const response = await axios.patch(
                getApiUrl(`inpatients/${inpatientId}`),
                updateData,
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success("Nurse allocated successfully!");
                setTimeout(() => {
                    navigate("/receptionist/inpatient");
                }, 1500);
            } else {
                toast.error(response.data.message || "Failed to allocate nurse");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error allocating resources:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error allocating nurse";
            toast.error(errorMessage);
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <HeadingCard
                title="Allocate Nurse"
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Inpatients", url: "/receptionist/inpatient" },
                    { label: "Allocate Nurse" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                    maxWidth: "600px",
                    mx: "auto",
                }}
            >
                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                        <FormControl fullWidth required sx={{ mb: 2 }} disabled={isLoadingNurses}>
                            <InputLabel>Allocate Nurse *</InputLabel>
                            <Select
                                name="allocatedNurse"
                                value={allocationForm.allocatedNurse}
                                onChange={handleChange}
                                label="Allocate Nurse *"
                            >
                                <MenuItem value="">Select Nurse</MenuItem>
                                {nurses.map((n) => (
                                    <MenuItem key={n._id} value={n._id}>
                                        {n.name || "Unknown"} {n.licenseNumber ? `(${n.licenseNumber})` : ""}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required sx={{ mb: 2 }}>
                            <InputLabel>Ward Category *</InputLabel>
                            <Select
                                name="wardCategory"
                                value={allocationForm.wardCategory}
                                onChange={handleChange}
                                label="Ward Category *"
                            >
                                <MenuItem value="">Select Ward Category</MenuItem>
                                <MenuItem value="General">General</MenuItem>
                                <MenuItem value="Duplex">Duplex</MenuItem>
                                <MenuItem value="Special">Special</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Room No. *"
                                name="roomNo"
                                fullWidth
                                required
                                value={allocationForm.roomNo}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Bed Number"
                                name="bedNumber"
                                fullWidth
                                value={allocationForm.bedNumber}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate(-1)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            sx={{ backgroundColor: "#8B4513" }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                                    Allocating...
                                </>
                            ) : (
                                "Allocate Nurse"
                            )}
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default AllocateResourcesPage;

