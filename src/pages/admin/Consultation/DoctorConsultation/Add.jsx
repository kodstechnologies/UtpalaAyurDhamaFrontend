import { useState, useEffect } from "react";
import { Box, Divider, CircularProgress, TextField, Autocomplete, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import HeadingCard from "../../../../components/card/HeadingCard";
import SubmitButton from "../../../../components/buttons/SubmitButton";
import CancelButton from "../../../../components/buttons/CancelButton";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import consultationFeeService from "../../../../services/consultationFeeService";
import doctorService from "../../../../services/doctorService";

function Consultation_Add() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [fee, setFee] = useState("");
    const [currency] = useState("INR");
    const [isActive, setIsActive] = useState(true);
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);

    // Fetch doctors from backend
    useEffect(() => {
        const fetchDoctors = async () => {
            setIsLoadingDoctors(true);
            try {
                const response = await doctorService.getAllDoctorProfiles({ page: 1, limit: 100 });
                if (response.success && response.data) {
                    setDoctors(response.data);
                } else {
                    toast.error(response.message || "Failed to fetch doctors");
                }
            } catch (error) {
                console.error("Error fetching doctors:", error);
                toast.error(error.message || "Failed to fetch doctors");
            } finally {
                setIsLoadingDoctors(false);
            }
        };

        fetchDoctors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedDoctor) {
            toast.error("Please select a doctor");
            return;
        }

        if (!fee || Number(fee) <= 0) {
            toast.error("Please enter a valid consultation fee");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                doctor: selectedDoctor._id,
                amount: Number(fee),
                currency: currency,
                isActive: isActive,
                notes: notes.trim(),
            };
            
            const response = await consultationFeeService.createConsultationFee(payload);
            
            if (response.success) {
                toast.success("Consultation fee created successfully");
                navigate("/admin/consultation/view");
            } else {
                toast.error(response.message || "Failed to create consultation fee");
            }
        } catch (error) {
            console.error("Error creating consultation fee:", error);
            const errorMessage = error.message || error.response?.data?.message || "Failed to create consultation fee";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingDoctors) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* PAGE HEADER */}
            <HeadingCard
                title="Add Consultation Fee"
                subtitle="Add a new consultation fee to the system"
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Consultation Fees", url: "/admin/consultation/view" },
                    { label: "Add" },
                ]}
            />

            {/* MAIN LAYOUT - FULL WIDTH FORM */}
            <Box
                sx={{
                    backgroundColor: "var(--color-bg-card)",
                    borderRadius: 4,
                    p: 4,
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-medium)",
                }}
            >
                {/* DOCTOR */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <PersonOutlineIcon fontSize="small" />
                        <Typography variant="body1" fontWeight="semibold">
                            Doctor <span style={{ color: "red" }}>*</span>
                        </Typography>
                    </Box>
                    <Autocomplete
                        options={doctors}
                        getOptionLabel={(option) => option.user?.name || "Unknown"}
                        value={selectedDoctor}
                        onChange={(event, newValue) => {
                            setSelectedDoctor(newValue);
                        }}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Select Doctor..."
                                disabled={isLoading}
                            />
                        )}
                        disabled={isLoading}
                    />
                </Box>

                {/* FEE */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <CurrencyRupeeIcon fontSize="small" />
                        <Typography variant="body1" fontWeight="semibold">
                            Consultation Fee (₹) <span style={{ color: "red" }}>*</span>
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        type="number"
                        placeholder="Enter fee"
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                        disabled={isLoading}
                        inputProps={{ min: 0, step: 0.01 }}
                    />
                </Box>

                {/* CURRENCY */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" fontWeight="semibold" sx={{ mb: 1 }}>
                        Currency
                    </Typography>
                    <TextField
                        fullWidth
                        value={currency}
                        disabled
                        sx={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}
                    />
                </Box>

                {/* STATUS */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" fontWeight="semibold" sx={{ mb: 1 }}>
                        Status
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            disabled={isLoading}
                            style={{ width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                            Active
                        </Typography>
                    </Box>
                </Box>

                {/* DESCRIPTION / NOTES */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <DescriptionOutlinedIcon fontSize="small" />
                        <Typography variant="body1" fontWeight="semibold">
                            Notes
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Enter notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={isLoading}
                        inputProps={{ maxLength: 500 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {notes.length}/500 characters
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* ACTIONS */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <CancelButton onClick={() => navigate("/admin/consultation/view")} />

                    <SubmitButton
                        text={isLoading ? "Adding..." : "ADD CONSULTATION FEE"}
                        onClick={handleSubmit}
                        disabled={isLoading}
                    />
                </Box>

                {/* FOOTER NOTE */}
                <Typography variant="caption" sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                    <span style={{ color: "red" }}>●</span>
                    Required fields are marked with an asterisk (*). All changes will be saved upon submission.
                </Typography>
            </Box>
        </Box>
    );
}

export default Consultation_Add;
