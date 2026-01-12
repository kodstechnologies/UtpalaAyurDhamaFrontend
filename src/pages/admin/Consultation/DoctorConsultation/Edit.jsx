import { useState, useEffect } from "react";
import { Box, Divider, CircularProgress, TextField, Autocomplete, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import HeadingCard from "../../../../components/card/HeadingCard";
import SubmitButton from "../../../../components/buttons/SubmitButton";
import CancelButton from "../../../../components/buttons/CancelButton";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { X } from "@mui/icons-material";
import consultationFeeService from "../../../../services/consultationFeeService";
import doctorService from "../../../../services/doctorService";

function Consultation_Edit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctor: null,
        fee: "",
        currency: "INR",
        isActive: true,
        notes: "",
    });
    const [submitLoading, setSubmitLoading] = useState(false);

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

    // Load existing consultation fee data
    useEffect(() => {
        const loadData = async () => {
            if (!id) {
                toast.error("Consultation fee ID is missing");
                navigate("/admin/consultation/view");
                return;
            }

            try {
                setIsLoading(true);
                const response = await consultationFeeService.getConsultationFeeById(id);
                
                if (response.success && response.data) {
                    const fee = response.data;
                    // Find the doctor from the doctors list
                    const doctor = doctors.find(d => {
                        const docId = d._id?.toString();
                        const feeDoctorId = fee.doctor?._id?.toString() || fee.doctor?.toString();
                        return docId === feeDoctorId;
                    });
                    
                    setFormData({
                        doctor: doctor || {
                            _id: fee.doctor?._id || fee.doctor,
                            user: fee.doctor?.user || { name: "Unknown" }
                        },
                        fee: fee.amount?.toString() || "",
                        currency: fee.currency || "INR",
                        isActive: fee.isActive ?? true,
                        notes: fee.notes || "",
                    });
                } else {
                    toast.error(response.message || "Failed to fetch consultation fee details");
                    navigate("/admin/consultation/view");
                }
            } catch (error) {
                console.error("Error fetching consultation fee:", error);
                toast.error(error.message || "Failed to fetch consultation fee details");
                navigate("/admin/consultation/view");
            } finally {
                setIsLoading(false);
            }
        };

        if (id && doctors.length > 0) {
            loadData();
        }
    }, [id, doctors, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.doctor) {
            toast.error("Please select a doctor");
            return;
        }

        if (!formData.fee || Number(formData.fee) <= 0) {
            toast.error("Please enter a valid consultation fee");
            return;
        }

        setSubmitLoading(true);
        try {
            const payload = {
                doctor: formData.doctor._id,
                amount: Number(formData.fee),
                currency: formData.currency,
                isActive: formData.isActive,
                notes: formData.notes.trim(),
            };
            
            const response = await consultationFeeService.updateConsultationFee(id, payload);
            
            if (response.success) {
                toast.success("Consultation fee updated successfully");
                navigate("/admin/consultation/view");
            } else {
                toast.error(response.message || "Failed to update consultation fee");
            }
        } catch (error) {
            console.error("Error updating consultation fee:", error);
            const errorMessage = error.message || error.response?.data?.message || "Failed to update consultation fee";
            toast.error(errorMessage);
        } finally {
            setSubmitLoading(false);
        }
    };

    if (isLoading || isLoadingDoctors) {
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
                title="Edit Consultation Fee"
                subtitle="Update the consultation fee details"
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Consultation Fees", url: "/admin/consultation/view" },
                    { label: "Edit" },
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
                    <label className="flex items-center gap-2 font-semibold mb-1">
                        <PersonOutlineIcon fontSize="small" />
                        Doctor <span className="text-red-600">*</span>
                    </label>
                    <Autocomplete
                        options={doctors}
                        getOptionLabel={(option) => option.user?.name || "Unknown"}
                        value={formData.doctor}
                        onChange={(event, newValue) => {
                            setFormData(prev => ({ ...prev, doctor: newValue }));
                        }}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Select Doctor..."
                                disabled={submitLoading}
                            />
                        )}
                        disabled={submitLoading}
                    />
                </Box>

                {/* FEE */}
                <Box sx={{ mb: 3 }}>
                    <label className="flex items-center gap-2 font-semibold mb-1">
                        <CurrencyRupeeIcon fontSize="small" />
                        Consultation Fee (₹) <span className="text-red-600">*</span>
                    </label>
                    <TextField
                        fullWidth
                        type="number"
                        placeholder="Enter fee"
                        value={formData.fee}
                        onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
                        disabled={submitLoading}
                        inputProps={{ min: 0, step: 0.01 }}
                    />
                </Box>

                {/* CURRENCY */}
                <Box sx={{ mb: 3 }}>
                    <label className="font-semibold mb-1 block">
                        Currency
                    </label>
                    <TextField
                        fullWidth
                        value={formData.currency}
                        disabled
                        sx={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}
                    />
                </Box>

                {/* STATUS */}
                <Box sx={{ mb: 3 }}>
                    <label className="font-semibold block mb-1">Status</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="w-4 h-4 accent-green-600"
                            disabled={submitLoading}
                        />
                        <span className="font-medium">Active</span>
                    </label>
                </Box>

                {/* DESCRIPTION / NOTES */}
                <Box sx={{ mb: 4 }}>
                    <label className="flex items-center gap-2 font-semibold mb-1">
                        <DescriptionOutlinedIcon fontSize="small" />
                        Notes
                    </label>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Enter notes (optional)"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        disabled={submitLoading}
                        inputProps={{ maxLength: 500 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {formData.notes.length}/500 characters
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* ACTIONS */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <CancelButton onClick={() => navigate("/admin/consultation/view")}>
                        <X size={16} style={{ marginRight: "8px" }} />
                        Cancel
                    </CancelButton>

                    <SubmitButton
                        text={submitLoading ? "Updating..." : "UPDATE CONSULTATION FEE"}
                        onClick={handleSubmit}
                        disabled={submitLoading}
                    />
                </Box>

                {/* FOOTER NOTE */}
                <p className="mt-4 text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                    <span className="text-red-500">●</span>
                    Required fields are marked with an asterisk (*). All changes will be saved upon submission.
                </p>
            </Box>
        </Box>
    );
}

export default Consultation_Edit;
