import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Activity,
    User,
    X,
    CheckCircle,
    AlertCircle,
    Save,
    ReceiptIndianRupee
} from "lucide-react";
import { Box, CircularProgress } from "@mui/material";
import CardBorder from "../../../../components/card/CardBorder";
import CancelButton from "../../../../components/buttons/CancelButton";
import SubmitButton from "../../../../components/buttons/SubmitButton";
import therapyService from "../../../../services/therapyService";
import therapistService from "../../../../services/therapistService";

function Edit_TherapyAssignment() {
    const navigate = useNavigate();
    const { nurseId } = useParams(); // Route uses nurseId but it's actually assignmentId
    const id = nurseId; // Use nurseId as the assignment ID

    const [therapyId, setTherapyId] = useState("");
    const [cost, setCost] = useState("");
    const [therapistId, setTherapistId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [therapies, setTherapies] = useState([]);
    const [therapists, setTherapists] = useState([]);

    // Fetch therapies and therapists from backend
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [therapiesResponse, therapistsResponse] = await Promise.all([
                    therapyService.getAllTherapies({ page: 1, limit: 100 }),
                    therapistService.getAllTherapists({ page: 1, limit: 100 })
                ]);

                // Handle therapies response
                if (therapiesResponse.success) {
                    // Handle different response structures (array or paginated)
                    const therapiesData = Array.isArray(therapiesResponse.data)
                        ? therapiesResponse.data
                        : (therapiesResponse.data?.data || []);
                    setTherapies(therapiesData);
                } else {
                    toast.error(therapiesResponse.message || "Failed to fetch therapies");
                }

                // Handle therapists response
                if (therapistsResponse.success) {
                    // Handle different response structures (array or paginated)
                    const therapistsData = Array.isArray(therapistsResponse.data)
                        ? therapistsResponse.data
                        : (therapistsResponse.data?.data || []);
                    setTherapists(therapistsData);
                } else {
                    toast.error(therapistsResponse.message || "Failed to fetch therapists");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error(error.message || "Failed to fetch data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch existing assignment data
    useEffect(() => {
        const fetchAssignment = async () => {
            if (!id) {
                toast.error("Assignment ID is missing");
                navigate("/admin/treatment-assignments");
                return;
            }

            try {
                setIsLoadingData(true);
                const response = await therapyService.getAssignmentById(id);
                
                if (response.success && response.data) {
                    const assignment = response.data;
                    
                    // Set therapy ID
                    setTherapyId(assignment.therapy?._id || assignment.therapy || "");
                    
                    // Set cost
                    setCost(assignment.cost?.toString() || "");
                    
                    // Set therapist ID - need to get the User ID from TherapistProfile.user
                    // The assignment.therapist is a TherapistProfile, and therapist.user is the User
                    const therapistUserId = assignment.therapist?.user?._id 
                        || assignment.therapist?.user 
                        || null;
                    setTherapistId(therapistUserId || "");
                } else {
                    toast.error(response.message || "Failed to fetch assignment details");
                    navigate("/admin/treatment-assignments");
                }
            } catch (error) {
                console.error("Error fetching assignment:", error);
                toast.error(error.response?.data?.message || error.message || "Failed to fetch assignment details");
                navigate("/admin/treatment-assignments");
            } finally {
                setIsLoadingData(false);
            }
        };

        if (id) {
            fetchAssignment();
        }
    }, [id, navigate]);

    const validateForm = () => {
        const newErrors = {};

        if (!therapyId) newErrors.therapyId = "Therapy type is required";
        if (!cost || parseFloat(cost) <= 0) newErrors.cost = "Valid cost is required";
        if (!therapistId) newErrors.therapistId = "Therapist is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                therapyId: therapyId,
                therapistId: therapistId,
                cost: parseFloat(cost),
            };

            const response = await therapyService.updateAssignment(id, payload);
            
            if (response.success) {
                setShowSuccess(true);
                toast.success("Assignment updated successfully");
                setTimeout(() => {
                    setShowSuccess(false);
                    navigate("/admin/treatment-assignments", { state: { refresh: true } });
                }, 2000);
            } else {
                toast.error(response.message || "Failed to update assignment");
            }
        } catch (error) {
            console.error("Error updating assignment:", error);
            const errorMessage = error.message || error.response?.data?.message || "Failed to update assignment";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || isLoadingData) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <CardBorder padding="2rem">
            {/* Header */}
            <div className="mb-8 pb-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 rounded bg-[var(--color-primary)]" />
                    <h2 className="text-2xl font-semibold text-[var(--color-text-dark)]">
                        Edit Therapist Assignment
                    </h2>
                </div>

                <p className="text-sm mt-2 text-[var(--color-text)]">
                    Modify existing therapist-to-therapy assignments for better coordination.
                </p>
            </div>

            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 animate-slideInRight">
                    <div
                        className="flex items-center gap-3 p-4 rounded-xl shadow-[var(--shadow-medium)] border-2"
                        style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-btn-b)" }}
                    >
                        <CheckCircle size={24} className="text-[var(--color-btn-b)]" />
                        <div>
                            <p className="font-semibold text-[var(--color-text-dark)]">
                                Assignment Updated Successfully
                            </p>
                            <p className="text-sm text-[var(--color-text)]">
                                Redirecting to assignments list...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Container */}
            <form onSubmit={handleSubmit}>
            <div
                className="rounded-2xl shadow-lg overflow-hidden border hover:shadow-[var(--shadow-medium)] transition-all duration-300"
                style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-text)" }}
            >
                <div className="p-6 space-y-6">
                    {/* Therapy Type Field */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-sm flex items-center gap-1 text-[var(--color-text-dark)]">
                            <div className="flex gap-2">
                                <Activity size={18} className="text-[var(--color-icon-2)]" />
                                Therapy Type <span className="text-[var(--color-icon-1-light)]">*</span>
                            </div>
                        </label>

                        <div
                            className="flex items-center gap-3 p-3 rounded-xl border group hover:shadow-sm focus-within:shadow-md focus-within:border-[var(--color-btn-b)] relative"
                            style={{ borderColor: "var(--color-text)" }}
                        >
                            <Activity size={18} className="text-[var(--color-icon-2)]" />
                            <select
                                value={therapyId}
                                onChange={(e) => setTherapyId(e.target.value)}
                                className="w-full bg-transparent outline-none pr-8 cursor-pointer"
                                style={{ color: "var(--color-text-dark)" }}
                                required
                            >
                                <option value="" disabled>Select Therapy Type</option>
                                {therapies.map((therapy) => (
                                    <option key={therapy._id} value={therapy._id}>
                                        {therapy.therapyName}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text)]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {errors.therapyId && (
                            <p className="text-xs flex items-center gap-1 text-[var(--color-icon-1)]">
                                <AlertCircle size={12} />
                                {errors.therapyId}
                            </p>
                        )}
                    </div>

                    {/* Cost Field */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-sm flex items-center gap-1 text-[var(--color-text-dark)]">
                            <div className="flex gap-2">
                                <ReceiptIndianRupee size={18} className="text-[var(--color-icon-2)]" />
                                Cost (₹) <span className="text-[var(--color-icon-1-light)]">*</span>
                            </div>
                        </label>

                        <div
                            className="flex items-center gap-3 p-3 rounded-xl border group hover:shadow-sm focus-within:shadow-md focus-within:border-[var(--color-btn-b)]"
                            style={{ borderColor: "var(--color-text)" }}
                        >
                            <ReceiptIndianRupee size={18} className="text-[var(--color-icon-2)]" />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter cost"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                className="w-full bg-transparent outline-none"
                                style={{ color: "var(--color-text-dark)" }}
                                required
                            />
                        </div>

                        {errors.cost && (
                            <p className="text-xs flex items-center gap-1 text-[var(--color-icon-1)]">
                                <AlertCircle size={12} />
                                {errors.cost}
                            </p>
                        )}
                    </div>

                    {/* Therapist Field */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-sm flex items-center gap-1 text-[var(--color-text-dark)]">
                            <div className="flex gap-2">
                                <User size={18} className="text-[var(--color-icon-2)]" />
                                Therapist <span className="text-[var(--color-icon-1-light)]">*</span>
                            </div>
                        </label>

                        <div
                            className="flex items-center gap-3 p-3 rounded-xl border group hover:shadow-sm focus-within:shadow-md focus-within:border-[var(--color-btn-b)] relative"
                            style={{ borderColor: "var(--color-text)" }}
                        >
                            <User size={18} className="text-[var(--color-icon-2)]" />
                            <select
                                value={therapistId}
                                onChange={(e) => setTherapistId(e.target.value)}
                                className="w-full bg-transparent outline-none pr-8 cursor-pointer"
                                style={{ color: "var(--color-text-dark)" }}
                                required
                            >
                                <option value="" disabled>Select Therapist</option>
                                {therapists.map((therapist) => (
                                    <option key={therapist._id} value={therapist._id}>
                                        {therapist.name || therapist.firstName || "Unknown"}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text)]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {errors.therapistId && (
                            <p className="text-xs flex items-center gap-1 text-[var(--color-icon-1)]">
                                <AlertCircle size={12} />
                                {errors.therapistId}
                            </p>
                        )}
                    </div>
                </div>

                {/* Form Footer */}
                <div className="p-6 border-t-2 border-[var(--color-text)] mt-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <CancelButton onClick={() => navigate("/admin/treatment-assignments")}>
                            <X size={16} className="mr-2" />
                            Cancel
                        </CancelButton>

                        <SubmitButton
                            text={
                                isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-[var(--color-light)] border-t-transparent rounded-full animate-spin mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} className="mr-2" />
                                        Update Assignment
                                    </>
                                )
                            }
                            onClick={handleSubmit}
                        />
                    </div>

                    <p className="text-xs mt-4 flex items-center gap-2 text-[var(--color-text)]">
                        <AlertCircle size={12} className="text-[var(--color-icon-1-light)]" />
                        Required fields are marked with an asterisk (*). All changes will be saved upon submission.
                    </p>
                </div>
            </div>
            </form>
        </CardBorder>
    );
}

export default Edit_TherapyAssignment;
