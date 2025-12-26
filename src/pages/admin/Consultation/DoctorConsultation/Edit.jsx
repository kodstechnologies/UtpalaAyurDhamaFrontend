import { useState, useEffect } from "react";
import { Box, Divider } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import HeadingCard from "../../../../components/card/HeadingCard";
import SubmitButton from "../../../../components/buttons/SubmitButton";

// Icons (MUI)
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

// Mock data and API
const mockRows = [
    {
        _id: "1",
        doctor: "Dr. Amit Sharma",
        fee: 500,
        currency: "INR",
        status: "Active",
        notes: "Standard consultation fee",
        updated: "2025-01-12",
    },
    {
        _id: "2",
        doctor: "Dr. Neha Gupta",
        fee: 700,
        currency: "INR",
        status: "Inactive",
        notes: "Specialist fee - on hold",
        updated: "2025-01-10",
    },
    {
        _id: "3",
        doctor: "Dr. Rajesh Kumar",
        fee: 1599,
        currency: "INR",
        status: "Active",
        notes: "Premium consultation",
        updated: "2025-01-11",
    },
];

const updateConsultationFeeAPI = async (data, id) => {
    console.log('Updated:', { _id: id, ...data });
    return { _id: id, ...data, updated: new Date().toISOString().split('T')[0] };
};

const doctorsList = [
    { id: "1", name: "Dr. Amit Sharma" },
    { id: "2", name: "Dr. Neha Gupta" },
    { id: "3", name: "Dr. Rajesh Kumar" },
];

function Consultation_Edit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        doctor: "",
        fee: "",
        currency: "INR",
        isActive: true,
        notes: "",
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    // Load data on mount
    useEffect(() => {
        const loadData = () => {
            const row = mockRows.find(r => r._id === id);
            if (row) {
                setFormData({
                    doctor: row.doctor,
                    fee: row.fee.toString(),
                    currency: row.currency,
                    isActive: row.status === "Active",
                    notes: row.notes || "",
                });
            } else {
                alert("Consultation fee not found");
                navigate("/admin/consultation/view");
            }
            setIsLoading(false);
        };

        if (id) {
            loadData();
        }
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async () => {
        if (!formData.doctor || !formData.fee) {
            alert("Please fill all required fields");
            return;
        }

        setSubmitLoading(true);
        try {
            const payload = {
                doctor: formData.doctor,
                fee: Number(formData.fee),
                currency: formData.currency,
                status: formData.isActive ? "Active" : "Inactive",
                notes: formData.notes,
            };
            await updateConsultationFeeAPI(payload, id);
            alert("Consultation fee updated successfully");
            navigate("/admin/consultation/view");
        } catch (error) {
            console.error("Error updating consultation fee:", error);
            alert("Failed to update consultation fee. Please try again.");
        } finally {
            setSubmitLoading(false);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Box sx={{ p: 3 }}>

            {/* PAGE HEADER */}
            <HeadingCard
                title="Edit Consultation Fee"
                subtitle="Update the consultation fee details"
                breadcrumbItems={[
                    { label: "Admin", path: "/admin/dashboard" },
                    { label: "Consultation Fees", path: "/admin/consultation/view" },
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
                    <select
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg"
                        disabled={submitLoading}
                    >
                        <option value="">Select Doctor...</option>
                        {doctorsList.map((doc) => (
                            <option key={doc.id} value={doc.name}>
                                {doc.name}
                            </option>
                        ))}
                    </select>
                </Box>

                {/* FEE */}
                <Box sx={{ mb: 3 }}>
                    <label className="flex items-center gap-2 font-semibold mb-1">
                        <CurrencyRupeeIcon fontSize="small" />
                        Consultation Fee (₹) <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="number"
                        name="fee"
                        placeholder="Enter fee"
                        value={formData.fee}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg"
                        disabled={submitLoading}
                    />
                </Box>

                {/* CURRENCY */}
                <Box sx={{ mb: 3 }}>
                    <label className="font-semibold mb-1 block">
                        Currency
                    </label>
                    <input
                        value={formData.currency}
                        disabled
                        className="w-full p-3 border rounded-lg bg-gray-100"
                    />
                </Box>

                {/* STATUS */}
                <Box sx={{ mb: 3 }}>
                    <label className="font-semibold block mb-1">Status</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
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
                    <textarea
                        name="notes"
                        rows={4}
                        placeholder="Enter notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg resize-none"
                        disabled={submitLoading}
                    />
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* ACTIONS */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                        onClick={() => navigate("/admin/consultation/view")}
                        className="px-6 py-2 border rounded-lg font-semibold flex items-center gap-2"
                        disabled={submitLoading}
                    >
                        ✕ Cancel
                    </button>

                    <SubmitButton
                        text={submitLoading ? "Updating..." : "UPDATE CONSULTATION"}
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