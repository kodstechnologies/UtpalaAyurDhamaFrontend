import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    BookOpen,
    Menu,
    ReceiptIndianRupee,
    X,
    CheckCircle,
    AlertCircle,
    Save,
    FileText
} from "lucide-react";

import CardBorder from "../../../components/card/CardBorder";
import CancelButton from "../../../components/buttons/CancelButton";
import SubmitButton from "../../../components/buttons/SubmitButton";

function Food_Charges_Edit() {
    const navigate = useNavigate();
    const { id } = useParams(); // Assuming route is /edit/:id

    const [foodName, setFoodName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    // Example dropdown data — replace with API
    const categoryOptions = ["Breakfast", "Lunch", "Dinner", "Juice", "Snacks"];

    // Simulate fetching existing data based on id with dummy data pre-filled
    useEffect(() => {
        const fetchData = async () => {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 500));
            // Dummy data for demonstration — replace with real API
            const dummyData = {
                foodName: "Special Thali",
                category: "Lunch",
                price: "250",
                description: "Full combo meal: rice, dal, sabji, roti.",
                status: "Inactive", // Pre-filled as inactive for checkbox demo
            };
            setFoodName(dummyData.foodName);
            setCategory(dummyData.category);
            setPrice(dummyData.price);
            setDescription(dummyData.description);
            setIsActive(dummyData.status === "Active");
        };
        if (id) {
            fetchData();
        }
    }, [id]);

    const validateForm = () => {
        const newErrors = {};

        if (!foodName) newErrors.foodName = "Food name is required";
        if (!category) newErrors.category = "Category is required";
        if (!price || parseFloat(price) <= 0) newErrors.price = "Valid price is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API

        const payload = {
            id, // Include ID for update
            foodName,
            category,
            price: parseFloat(price),
            description,
            status: isActive ? "Active" : "Inactive",
        };

        console.log("Updated:", payload);

        setIsSubmitting(false);
        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
            navigate("/admin/foodcharges/view");
        }, 2000);
    };

    return (
        <CardBorder padding="2rem">
            {/* Header */}
            <div className="mb-8 pb-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 rounded bg-[var(--color-primary)]" />
                    <h2 className="text-2xl font-semibold text-[var(--color-text-dark)]">
                        Edit Food Charge
                    </h2>
                </div>

                <p className="text-sm mt-2 text-[var(--color-text)]">
                    Update food charge details
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
                                Food Charge Updated Successfully
                            </p>
                            <p className="text-sm text-[var(--color-text)]">
                                Redirecting to food charges list...
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
                    {/* Food Name Field */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-sm flex items-center gap-1 text-[var(--color-text-dark)]">
                            <div className="flex gap-2">
                                <BookOpen size={18} className="text-[var(--color-icon-2)]" />
                                Food Name <span className="text-[var(--color-icon-1-light)]">*</span>
                            </div>
                        </label>

                        <div
                            className="flex items-center gap-3 p-3 rounded-xl border group hover:shadow-sm focus-within:shadow-md focus-within:border-[var(--color-btn-b)]"
                            style={{ borderColor: "var(--color-text)" }}
                        >
                            <BookOpen size={18} className="text-[var(--color-icon-2)]" />
                            <input
                                type="text"
                                placeholder="Enter food name"
                                value={foodName}
                                onChange={(e) => setFoodName(e.target.value)}
                                className="w-full bg-transparent outline-none"
                                style={{ color: "var(--color-text-dark)" }}
                            />
                        </div>

                        {errors.foodName && (
                            <p className="text-xs flex items-center gap-1 text-[var(--color-icon-1)]">
                                <AlertCircle size={12} />
                                {errors.foodName}
                            </p>
                        )}
                    </div>

                    {/* Category Field */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-sm flex items-center gap-1 text-[var(--color-text-dark)]">
                            <div className="flex gap-2">
                                <Menu size={18} className="text-[var(--color-icon-2)]" />
                                Category <span className="text-[var(--color-icon-1-light)]">*</span>
                            </div>
                        </label>

                        <div
                            className="flex items-center gap-3 p-3 rounded-xl border group hover:shadow-sm focus-within:shadow-md focus-within:border-[var(--color-btn-b)] relative"
                            style={{ borderColor: "var(--color-text)" }}
                        >
                            <Menu size={18} className="text-[var(--color-icon-2)]" />
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-transparent outline-none pr-8 cursor-pointer"
                                style={{ color: "var(--color-text-dark)" }}
                            >
                                <option value="" disabled>Select Category</option>
                                {categoryOptions.map((cat, i) => (
                                    <option key={i} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text)]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {errors.category && (
                            <p className="text-xs flex items-center gap-1 text-[var(--color-icon-1)]">
                                <AlertCircle size={12} />
                                {errors.category}
                            </p>
                        )}
                    </div>

                    {/* Price Field */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-sm flex items-center gap-1 text-[var(--color-text-dark)]">
                            <div className="flex gap-2">
                                <ReceiptIndianRupee size={18} className="text-[var(--color-icon-2)]" />
                                Price (₹) <span className="text-[var(--color-icon-1-light)]">*</span>
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
                                placeholder="Enter price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-transparent outline-none"
                                style={{ color: "var(--color-text-dark)" }}
                            />
                        </div>

                        {errors.price && (
                            <p className="text-xs flex items-center gap-1 text-[var(--color-icon-1)]">
                                <AlertCircle size={12} />
                                {errors.price}
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

                    {/* Status Checkbox */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="markAsActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 text-[var(--color-btn-b)] bg-[var(--color-bg-card)] border-[var(--color-text)] rounded focus:ring-[var(--color-btn-b)] focus:ring-2 cursor-pointer"
                        />
                        <label htmlFor="markAsActive" className="text-sm font-medium text-[var(--color-text-dark)] cursor-pointer select-none">
                            Mark as Active
                        </label>
                    </div>
                </div>

                {/* Form Footer */}
                <div className="p-6 border-t-2 border-[var(--color-text)] mt-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <CancelButton onClick={() => navigate("/admin/foodcharges/view")}>
                            <X size={16} style={{ marginRight: "8px" }} />
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
                                        Save Changes
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

export default Food_Charges_Edit;