import { useState } from "react";
import { Box, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeadingCard from "../../../../components/card/HeadingCard";
import SubmitButton from "../../../../components/buttons/SubmitButton";

// Icons (MUI)
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

// Mock API
const createConsultationFeeAPI = async (data) => {
    console.log("Created:", data);
    return true;
};

const doctorsList = [
    { id: "1", name: "Dr. Amit Sharma" },
    { id: "2", name: "Dr. Neha Gupta" },
    { id: "3", name: "Dr. Rajesh Kumar" },
];

function Consultation_Add() {
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState("");
    const [fee, setFee] = useState("");
    const [currency] = useState("INR");
    const [isActive, setIsActive] = useState(true);
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!doctor || !fee) {
            alert("Please fill all required fields");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                doctor,
                fee: Number(fee),
                currency,
                status: isActive ? "Active" : "Inactive",
                notes,
            };
            await createConsultationFeeAPI(payload);
            navigate("/admin/consultation/view");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>

            {/* PAGE HEADER */}
            <HeadingCard
                title="Add Consultation Fee"
                subtitle="Add a new consultation fee to the system"
                breadcrumbItems={[
                    { label: "Admin", path: "/admin/dashboard" },
                    { label: "Consultation Fees", path: "/admin/consultation/view" },
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
                    <label className="flex items-center gap-2 font-semibold mb-1">
                        <PersonOutlineIcon fontSize="small" />
                        Doctor <span className="text-red-600">*</span>
                    </label>
                    <select
                        value={doctor}
                        onChange={(e) => setDoctor(e.target.value)}
                        className="w-full p-3 border rounded-lg"
                        disabled={isLoading}
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
                        placeholder="Enter fee"
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                        className="w-full p-3 border rounded-lg"
                        disabled={isLoading}
                    />
                </Box>

                {/* CURRENCY */}
                <Box sx={{ mb: 3 }}>
                    <label className="font-semibold mb-1 block">
                        Currency
                    </label>
                    <input
                        value={currency}
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
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 accent-green-600"
                            disabled={isLoading}
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
                        rows={4}
                        placeholder="Enter notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 border rounded-lg resize-none"
                        disabled={isLoading}
                    />
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* ACTIONS */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                        onClick={() => navigate("/admin/consultation/view")}
                        className="px-6 py-2 border rounded-lg font-semibold flex items-center gap-2"
                        disabled={isLoading}
                    >
                        ✕ Cancel
                    </button>

                    <SubmitButton
                        text={isLoading ? "Adding..." : "ADD CONSULTATION"}
                        onClick={handleSubmit}
                        disabled={isLoading}
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

export default Consultation_Add;