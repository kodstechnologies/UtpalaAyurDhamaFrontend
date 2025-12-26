import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    ReceiptIndianRupee,
    X,
    CheckCircle,
    AlertCircle,
    Save,
    FileText
} from "lucide-react";
import CardBorder from "../../../../components/card/CardBorder";
import CancelButton from "../../../../components/buttons/CancelButton";
import SubmitButton from "../../../../components/buttons/SubmitButton";

function Add_TherapyManagement() {
    const navigate = useNavigate();

    const [therapyName, setTherapyName] = useState("");
    const [cost, setCost] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!therapyName) newErrors.therapyName = "Therapy name is required";
        if (!cost || parseFloat(cost) <= 0) newErrors.cost = "Valid cost is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API

        const payload = {
            therapyName,
            cost: parseFloat(cost),
            description,
        };

        console.log("Submitted:", payload);

        setIsSubmitting(false);
        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
            navigate("/admin/treatment-therapy");
        }, 2000);
    };

    return (
        <CardBorder padding="2rem">
            {/* Header */}
            <div className="mb-8 pb-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 rounded bg-[var(--color-primary)]" />
                    <h2 className="text-2xl font-semibold text-[var(--color-text-dark)]">
                        Add Therapy
                    </h2>
                </div>

                <p className="text-sm mt-2 text-[var(--color-text)]">
                    Add and configure a new therapy for patient management.
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
                                Therapy Created Successfully
                            </p>
                            <p className="text-sm text-[var(--color-text)]">
                                Redirecting to therapies list...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Container */}
            <div
                className="rounded-2xl shadow-lg overflow-hidden border hover:shadow-[var(--shadow-medium)] transition-all duration-300"
                style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-text)" }}
            >
                <div className="p-6 space-y-6">
                    {/* Therapy Name Field */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-sm flex items-center gap-1 text-[var(--color-text-dark)]">
                            <div className="flex gap-2">
                                <BookOpen size={18} className="text-[var(--color-icon-2)]" />
                                Therapy Name <span className="text-[var(--color-icon-1-light)]">*</span>
                            </div>
                        </label>

                        <div
                            className="flex items-center gap-3 p-3 rounded-xl border group hover:shadow-sm focus-within:shadow-md focus-within:border-[var(--color-btn-b)]"
                            style={{ borderColor: "var(--color-text)" }}
                        >
                            <BookOpen size={18} className="text-[var(--color-icon-2)]" />
                            <input
                                type="text"
                                placeholder="Enter therapy name"
                                value={therapyName}
                                onChange={(e) => setTherapyName(e.target.value)}
                                className="w-full bg-transparent outline-none"
                                style={{ color: "var(--color-text-dark)" }}
                            />
                        </div>

                        {errors.therapyName && (
                            <p className="text-xs flex items-center gap-1 text-[var(--color-icon-1)]">
                                <AlertCircle size={12} />
                                {errors.therapyName}
                            </p>
                        )}
                    </div>

                    {/* Cost Field */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-sm flex items-center gap-1 text-[var(--color-text-dark)]">
                            <div className="flex gap-2">
                                <ReceiptIndianRupee size={18} className="text-[var(--color-icon-2)]" />
                                Cost (INR) <span className="text-[var(--color-icon-1-light)]">*</span>
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
                            />
                        </div>

                        {errors.cost && (
                            <p className="text-xs flex items-center gap-1 text-[var(--color-icon-1)]">
                                <AlertCircle size={12} />
                                {errors.cost}
                            </p>
                        )}
                    </div>

                    {/* Description Field */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-sm flex items-center gap-1 text-[var(--color-text-dark)]">
                            <div className="flex gap-2">
                                <FileText size={18} className="text-[var(--color-icon-2)]" />
                                Description
                            </div>
                        </label>

                        <div
                            className="flex items-center gap-3 p-3 rounded-xl border group hover:shadow-sm focus-within:shadow-md focus-within:border-[var(--color-btn-b)]"
                            style={{ borderColor: "var(--color-text)" }}
                        >
                            <FileText size={18} className="text-[var(--color-icon-2)]" />
                            <textarea
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full bg-transparent outline-none resize-none"
                                style={{ color: "var(--color-text-dark)" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Footer */}
                <div className="p-6 border-t-2 border-[var(--color-text)] mt-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <CancelButton onClick={() => navigate("/admin/treatment-therapy")}>
                            <X size={16} className="mr-2" />
                            Cancel
                        </CancelButton>

                        <SubmitButton
                            text={
                                isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-[var(--color-light)] border-t-transparent rounded-full animate-spin mr-2" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} className="mr-2" />
                                        Add Therapy
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
        </CardBorder>
    );
}

export default Add_TherapyManagement;