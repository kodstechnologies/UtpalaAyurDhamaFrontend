import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Mail, Phone, Calendar, User, Stethoscope, FileBadge,
    BriefcaseMedical, Award, GraduationCap, MapPin, Clock,
    ShieldCheck, Building, FileText, ArrowLeft,
    X, Save, AlertCircle, CheckCircle, Upload, IndianRupee
} from "lucide-react";
import HeadingCard from "../../../../components/card/HeadingCard";
import InputDialogModal from "../../../../components/modal/InputDialogModal";
import adminUserService from "../../../../services/adminUserService";

function Add_Doctors() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeSection, setActiveSection] = useState("personal");
    const [languageModal, setLanguageModal] = useState(false);
    const [certificationModal, setCertificationModal] = useState(false);
    const [errors, setErrors] = useState({
        email: "",
        phone: "",
        emergencyContact: ""
    });
    const emailCheckTimeoutRef = useRef(null);
    const phoneCheckTimeoutRef = useRef(null);

    // Initial empty doctor data for creation
    const [doctor, setDoctor] = useState({
        // Personal Info
        name: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        address: "",
        emergencyContact: "",
        languages: [],

        // Professional Info
        specialization: "",
        department: "",
        licenseNumber: "",
        joiningDate: "",
        experience: "",
        qualifications: "",
        status: "Active",
        consultationFee: "",
        availability: "",

        // Additional Info
        bio: "",
        certifications: [],
        profilePicture: ""
    });
    const getMaxDob = () => {
        const today = new Date();
        today.setFullYear(today.getFullYear() - 18);
        return today.toISOString().split("T")[0]; // yyyy-mm-dd
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 2 * 1024 * 1024) { // 2MB
            alert("File size should be less than 2MB");
            return;
        }

        setIsUploading(true);
        try {
            const response = await adminUserService.uploadImage(file);
            if (response.success) {
                setDoctor(prev => ({ ...prev, profilePicture: response.data.url }));
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    // Validation functions
    const validateEmail = (email) => {
        if (!email) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address";
        }
        return "";
    };

    // Check email availability (debounced)
    const checkEmailAvailability = async (email) => {
        if (!email || !validateEmail(email)) return;
        
        // Clear previous timeout
        if (emailCheckTimeoutRef.current) {
            clearTimeout(emailCheckTimeoutRef.current);
        }
        
        // Set new timeout for debouncing
        emailCheckTimeoutRef.current = setTimeout(async () => {
            try {
                const checkResult = await adminUserService.checkEmailAvailability(email, "Doctor");
                if (checkResult.exists) {
                    toast.error("This email is already registered. Please use a different email.");
                    setErrors((prev) => ({ ...prev, email: "This email is already registered" }));
                } else {
                    // Clear error if email is available
                    setErrors((prev) => ({ ...prev, email: "" }));
                }
            } catch (error) {
                console.error("Error checking email:", error);
                // Don't show error on check failure
            }
        }, 800); // 800ms debounce
    };

    const validatePhone = (phone) => {
        if (!phone) return "Phone number is required";
        // Indian phone number validation: 10 digits, can start with +91 or 0
        const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
        const cleanPhone = phone.replace(/[\s-]/g, ""); // Remove spaces and dashes
        if (!phoneRegex.test(cleanPhone)) {
            return "Please enter a valid 10-digit mobile number";
        }
        return "";
    };

    // Check phone availability (debounced)
    const checkPhoneAvailability = async (phone) => {
        const phoneError = validatePhone(phone);
        if (!phone || phoneError) return;
        
        // Clear previous timeout
        if (phoneCheckTimeoutRef.current) {
            clearTimeout(phoneCheckTimeoutRef.current);
        }
        
        // Set new timeout for debouncing
        phoneCheckTimeoutRef.current = setTimeout(async () => {
            try {
                const checkResult = await adminUserService.checkPhoneAvailability(phone, "Doctor");
                if (checkResult.exists) {
                    toast.error("This phone number is already registered. Please use a different phone number.");
                    setErrors((prev) => ({ ...prev, phone: "This phone number is already registered" }));
                } else {
                    // Clear error if phone is available
                    setErrors((prev) => ({ ...prev, phone: "" }));
                }
            } catch (error) {
                console.error("Error checking phone:", error);
                // Don't show error on check failure
            }
        }, 800); // 800ms debounce
    };

    // Handle Input Change with validation
    const updateField = (field, value) => {
        setDoctor((prev) => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }

        // Real-time validation for email and phone
        if (field === "email") {
            const error = validateEmail(value);
            setErrors((prev) => ({ ...prev, email: error }));
            // Check email availability if format is valid
            if (!error && value) {
                checkEmailAvailability(value);
            }
        } else if (field === "phone") {
            const error = validatePhone(value);
            setErrors((prev) => ({ ...prev, phone: error }));
            // Check phone availability if format is valid
            if (!error && value) {
                checkPhoneAvailability(value);
            }
        } else if (field === "emergencyContact" && value) {
            const error = validatePhone(value);
            setErrors((prev) => ({ ...prev, emergencyContact: error }));
        }
    };

    const handleAddLanguage = () => {
        setLanguageModal(true);
    };

    const handleLanguageConfirm = (language) => {
        if (language && !doctor.languages.includes(language)) {
            setDoctor(prev => ({
                ...prev,
                languages: [...prev.languages, language]
            }));
            toast.success("Language added successfully!");
        } else if (doctor.languages.includes(language)) {
            toast.error("This language is already added");
        }
    };

    const handleRemoveLanguage = (index) => {
        setDoctor(prev => ({
            ...prev,
            languages: prev.languages.filter((_, i) => i !== index)
        }));
    };

    const handleAddCertification = () => {
        setCertificationModal(true);
    };
    const isAtLeast18 = (dob) => {
        if (!dob) return false;

        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age >= 18;
    };

    const handleCertificationConfirm = (certification) => {
        if (certification && !doctor.certifications.includes(certification)) {
            setDoctor(prev => ({
                ...prev,
                certifications: [...prev.certifications, certification]
            }));
            toast.success("Certification added successfully!");
        } else if (doctor.certifications.includes(certification)) {
            toast.error("This certification is already added");
        }
    };

    const handleRemoveCertification = (index) => {
        setDoctor(prev => ({
            ...prev,
            certifications: prev.certifications.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        if (!doctor.name || !doctor.email || !doctor.specialization || !doctor.licenseNumber) {
            toast.error("Please fill in the required fields (Name, Email, Specialization, License Number).");
            return;
        }

        // Validate email and phone
        const emailError = validateEmail(doctor.email);
        const phoneError = validatePhone(doctor.phone);
        const emergencyContactError = doctor.emergencyContact ? validatePhone(doctor.emergencyContact) : "";

        // Check email availability before saving
        if (!emailError && doctor.email) {
            try {
                const checkResult = await adminUserService.checkEmailAvailability(doctor.email, "Doctor");
                if (checkResult.exists) {
                    toast.error("This email is already registered. Please use a different email.");
                    setErrors((prev) => ({ ...prev, email: "This email is already registered" }));
                    return;
                }
            } catch (error) {
                console.error("Error checking email:", error);
            }
        }

        // Check phone availability before saving
        if (!phoneError && doctor.phone) {
            try {
                const checkResult = await adminUserService.checkPhoneAvailability(doctor.phone, "Doctor");
                if (checkResult.exists) {
                    toast.error("This phone number is already registered. Please use a different phone number.");
                    setErrors((prev) => ({ ...prev, phone: "This phone number is already registered" }));
                    return;
                }
            } catch (error) {
                console.error("Error checking phone:", error);
            }
        }

        if (emailError || phoneError || emergencyContactError) {
            setErrors({
                email: emailError,
                phone: phoneError,
                emergencyContact: emergencyContactError
            });
            toast.error("Please fix the validation errors before saving.");
            return;
        }

        setIsSaving(true);

        try {
            await adminUserService.createUser("Doctor", doctor);
            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                navigate("/admin/doctors");
            }, 2000);
        } catch (error) {
            toast.error("Failed to create doctor");
        } finally {
            setIsSaving(false);
        }
    };


    const sections = [
        { id: "personal", label: "Personal Info", icon: User },
        { id: "professional", label: "Professional", icon: BriefcaseMedical },
        { id: "additional", label: "Additional", icon: FileText }
    ];

    const breadcrumbItems = [
        { label: "Dashboard", url: "/admin/dashboard" },
        { label: "Doctors", url: "/admin/doctors" },
        { label: "Add Doctor" }
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-a)" }}>
            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div
                        className="flex items-center gap-3 p-4 rounded-xl shadow-lg"
                        style={{
                            backgroundColor: "var(--color-bg-card)",
                            border: "2px solid var(--color-btn-b)"
                        }}
                    >
                        <CheckCircle size={24} style={{ color: "var(--color-btn-b)" }} />
                        <div>
                            <p className="font-semibold" style={{ color: "var(--color-text-dark)" }}>
                                Doctor Created Successfully
                            </p>
                            <p className="text-sm" style={{ color: "var(--color-text)" }}>
                                Redirecting to doctors list...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <HeadingCard
                breadcrumbItems={breadcrumbItems}
                title="Add New Doctor"
                subtitle="Create a new doctor profile with complete information"
            />

            <div className="max-w-7xl mx-auto p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Sidebar - Navigation */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-3">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                const isActive = activeSection === section.id;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 ease-in-out group ${isActive ? "shadow-md" : "hover:shadow-sm"}`}
                                        style={{
                                            backgroundColor: isActive ? "var(--color-bg-card)" : "var(--color-bg-hover)",
                                            border: `1px solid ${isActive ? "var(--color-btn-b)" : "var(--color-text)"}`,
                                            color: isActive ? "var(--color-btn-b)" : "var(--color-text-dark)"
                                        }}
                                    >
                                        <Icon size={20} style={{ color: isActive ? "var(--color-btn-b)" : "var(--color-text)" }} />
                                        <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                                            {section.label}
                                        </span>
                                        <div
                                            className={`ml-auto w-2 h-2 rounded-full transition-all duration-200 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
                                            style={{ backgroundColor: "var(--color-btn-b)" }}
                                        />
                                    </button>
                                );
                            })}

                            {/* Quick Preview Placeholder (for new doctor) */}
                            <div
                                className="p-4 rounded-xl mt-6 border"
                                style={{
                                    backgroundColor: "var(--color-bg-card)",
                                    borderColor: "var(--color-text)"
                                }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: "var(--color-icon-2-light)" }}
                                    >
                                        <User size={24} style={{ color: "var(--color-icon-2)" }} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                                            New Doctor Profile
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--color-text)" }}>
                                            Fill in details to create
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <p style={{ color: "var(--color-text)" }}>License: To be assigned</p>
                                    <p style={{ color: "var(--color-text)" }}>Joined: Today</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Form */}
                    <div className="lg:col-span-3">
                        <div
                            className="rounded-2xl shadow-lg overflow-hidden border"
                            style={{
                                backgroundColor: "var(--color-bg-card)",
                                borderColor: "var(--color-text)"
                            }}
                        >
                            {/* Form Header */}
                            <div className="p-6 border-b" style={{ borderColor: "var(--color-text)" }}>
                                <div className="flex items-center gap-3">
                                    {sections.find(s => s.id === activeSection)?.icon &&
                                        React.createElement(sections.find(s => s.id === activeSection).icon, {
                                            size: 24,
                                            style: { color: "var(--color-btn-b)" }
                                        })
                                    }
                                    <h2 className="text-xl font-bold" style={{ color: "var(--color-text-dark)" }}>
                                        {sections.find(s => s.id === activeSection)?.label}
                                    </h2>
                                </div>
                                <p className="text-sm mt-1" style={{ color: "var(--color-text)" }}>
                                    Fill in the information below to create the new doctor profile
                                </p>
                            </div>

                            {/* Form Content */}
                            <div className="p-6">
                                {activeSection === "personal" && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-text-dark)" }}>
                                            <User size={18} style={{ color: "var(--color-icon-2)" }} />
                                            Basic Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormInput
                                                label="Full Name"
                                                icon={User}
                                                value={doctor.name}
                                                onChange={(e) => updateField("name", e.target.value)}
                                                required
                                            />
                                            <FormInput
                                                label="Email Address"
                                                icon={Mail}
                                                type="email"
                                                value={doctor.email}
                                                onChange={(e) => updateField("email", e.target.value)}
                                                onBlur={async () => {
                                                    const emailError = validateEmail(doctor.email);
                                                    if (doctor.email && !emailError) {
                                                        try {
                                                            const checkResult = await adminUserService.checkEmailAvailability(doctor.email, "Doctor");
                                                            if (checkResult && checkResult.exists) {
                                                                toast.error("This email is already registered. Please use a different email.");
                                                                setErrors((prev) => ({ ...prev, email: "This email is already registered" }));
                                                            }
                                                        } catch (error) {
                                                            console.error("Error checking email on blur:", error);
                                                        }
                                                    }
                                                }}
                                                required
                                                error={errors.email}
                                            />
                                            <FormInput
                                                label="Phone Number"
                                                icon={Phone}
                                                type="tel"
                                                value={doctor.phone}
                                                onChange={(e) => updateField("phone", e.target.value)}
                                                onBlur={async () => {
                                                    const phoneError = validatePhone(doctor.phone);
                                                    if (doctor.phone && !phoneError) {
                                                        try {
                                                            const checkResult = await adminUserService.checkPhoneAvailability(doctor.phone, "Doctor");
                                                            if (checkResult && checkResult.exists) {
                                                                toast.error("This phone number is already registered. Please use a different phone number.");
                                                                setErrors((prev) => ({ ...prev, phone: "This phone number is already registered" }));
                                                            }
                                                        } catch (error) {
                                                            console.error("Error checking phone on blur:", error);
                                                        }
                                                    }
                                                }}
                                                required
                                                error={errors.phone}
                                                maxLength={10}
                                            />
                                            <FormInput
                                                label="Emergency Contact"
                                                icon={Phone}
                                                type="tel"
                                                value={doctor.emergencyContact}
                                                onChange={(e) => updateField("emergencyContact", e.target.value)}
                                                error={errors.emergencyContact}
                                                maxLength={10}
                                            />
                                            {/* <FormInput
                                                label="Date of Birth"
                                                icon={Calendar}
                                                type="date"
                                                value={doctor.dob}
                                                max={getMaxDob()}   // 👈 prevents selecting < 18 years
                                                onChange={(e) => updateField("dob", e.target.value)}
                                            /> */}

                                            <FormInput
                                                label="Date of Birth"
                                                icon={Calendar}
                                                type="date"
                                                value={doctor.dob}
                                                max={getMaxDob()}   // blocks selecting <18 in calendar
                                                onChange={(e) => updateField("dob", e.target.value)}
                                            />




                                            <FormSelect
                                                label="Gender"
                                                icon={User}
                                                value={doctor.gender}
                                                onChange={(e) => updateField("gender", e.target.value)}
                                                options={["Male", "Female", "Other", "Prefer not to say"]}
                                            />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-text-dark)" }}>
                                                <MapPin size={18} style={{ color: "var(--color-icon-3)" }} />
                                                Address
                                            </h3>
                                            <FormTextArea
                                                label="Full Address"
                                                icon={MapPin}
                                                value={doctor.address}
                                                onChange={(e) => updateField("address", e.target.value)}
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--color-text-dark)" }}>
                                                    <Award size={18} style={{ color: "var(--color-icon-1)" }} />
                                                    Languages Spoken
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={handleAddLanguage}
                                                    className="text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                                                    style={{
                                                        color: "var(--color-text-light)",
                                                        backgroundColor: "var(--color-icon-2-light)"
                                                    }}
                                                >
                                                    + Add Language
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {doctor.languages.map((lang, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                                                        style={{
                                                            backgroundColor: "var(--color-icon-6-light)",
                                                            border: "1px solid var(--color-icon-6)"
                                                        }}
                                                    >
                                                        <span style={{ color: "var(--color-text-dark)" }}>{lang}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveLanguage(index)}
                                                            className="p-1 hover:bg-[var(--color-icon-6-dark)] rounded transition-colors"
                                                            style={{ color: "var(--color-text)" }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === "professional" && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormInput
                                                label="Specialization"
                                                icon={Stethoscope}
                                                value={doctor.specialization}
                                                onChange={(e) => updateField("specialization", e.target.value)}
                                                required
                                            />
                                            <FormInput
                                                label="Department"
                                                icon={Building}
                                                value={doctor.department}
                                                onChange={(e) => updateField("department", e.target.value)}
                                            />
                                            <FormInput
                                                label="License Number"
                                                icon={FileBadge}
                                                value={doctor.licenseNumber}
                                                onChange={(e) => updateField("licenseNumber", e.target.value)}
                                                required
                                            />
                                            <FormInput
                                                label="Years of Experience"
                                                icon={Award}
                                                type="number"
                                                value={doctor.experience}
                                                onChange={(e) => updateField("experience", e.target.value)}
                                            />
                                            <FormInput
                                                label="Joining Date"
                                                icon={Calendar}
                                                type="date"
                                                value={doctor.joiningDate}
                                                onChange={(e) => updateField("joiningDate", e.target.value)}
                                            />
                                            <FormSelect
                                                label="Status"
                                                icon={ShieldCheck}
                                                value={doctor.status}
                                                onChange={(e) => updateField("status", e.target.value)}
                                                options={["Active", "On Leave", "Inactive", "Retired"]}
                                            />
                                            <FormInput
                                                label="Consultation Fee (₹)"
                                                icon={IndianRupee}
                                                type="number"
                                                value={doctor.consultationFee}
                                                onChange={(e) => updateField("consultationFee", e.target.value)}
                                            />
                                            <FormInput
                                                label="Availability"
                                                icon={Clock}
                                                value={doctor.availability}
                                                onChange={(e) => updateField("availability", e.target.value)}
                                                placeholder="e.g., Mon-Fri: 9AM-5PM"
                                            />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-text-dark)" }}>
                                                <GraduationCap size={18} style={{ color: "var(--color-icon-3)" }} />
                                                Qualifications
                                            </h3>
                                            <FormTextArea
                                                label="Degrees & Certifications"
                                                icon={GraduationCap}
                                                value={doctor.qualifications}
                                                onChange={(e) => updateField("qualifications", e.target.value)}
                                                rows={3}
                                                placeholder="Enter degrees separated by commas"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeSection === "additional" && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-text-dark)" }}>
                                                <FileText size={18} style={{ color: "var(--color-icon-4)" }} />
                                                Professional Bio
                                            </h3>
                                            <FormTextArea
                                                label="Doctor Biography"
                                                icon={FileText}
                                                value={doctor.bio}
                                                onChange={(e) => updateField("bio", e.target.value)}
                                                rows={6}
                                                placeholder="Write a brief professional biography..."
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--color-text-dark)" }}>
                                                    <Award size={18} style={{ color: "var(--color-icon-1)" }} />
                                                    Certifications
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={handleAddCertification}
                                                    className="text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                                                    style={{
                                                        color: "var(--color-text-light)",
                                                        backgroundColor: "var(--color-icon-2-light)"
                                                    }}
                                                >
                                                    + Add Certification
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {doctor.certifications.map((cert, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:scale-105"
                                                        style={{
                                                            backgroundColor: "var(--color-icon-6-light)",
                                                            border: "1px solid var(--color-icon-6)"
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Award size={16} style={{ color: "var(--color-icon-1)" }} />
                                                            <span style={{ color: "var(--color-text-dark)" }}>{cert}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCertification(index)}
                                                            className="p-1 hover:bg-[var(--color-icon-6-dark)] rounded transition-colors"
                                                            style={{ color: "var(--color-text)" }}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-text-dark)" }}>
                                                <User size={18} style={{ color: "var(--color-icon-5)" }} />
                                                Profile Picture
                                            </h3>
                                            <div className="flex items-center gap-4 p-4 rounded-xl border" style={{
                                                backgroundColor: "var(--color-bg-hover)",
                                                borderColor: "var(--color-text)"
                                            }}>
                                                <div
                                                    className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden relative"
                                                    style={{
                                                        backgroundColor: "var(--color-icon-5-light)",
                                                        border: "2px dashed var(--color-icon-5)",
                                                        color: "var(--color-icon-5)"
                                                    }}
                                                >
                                                    {doctor.profilePicture ? (
                                                        <img
                                                            src={doctor.profilePicture}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User size={32} />
                                                    )}

                                                    {isUploading && (
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <input
                                                        type="file"
                                                        id="profile-upload"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('profile-upload').click()}
                                                        disabled={isUploading}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
                                                        style={{
                                                            backgroundColor: "var(--color-btn-b)",
                                                            color: "var(--color-light)"
                                                        }}
                                                    >
                                                        <Upload size={16} />
                                                        {isUploading ? "Uploading..." : "Upload New Photo"}
                                                    </button>
                                                    <p className="text-sm mt-2" style={{ color: "var(--color-text)" }}>
                                                        JPG, PNG or GIF, max 2MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="p-6 border-t" style={{ borderColor: "var(--color-text)" }}>
                                <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="w-full sm:w-auto px-5 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                                        style={{
                                            border: `1px solid var(--color-text)`,
                                            color: "var(--color-text-dark)",
                                            backgroundColor: "var(--color-bg-card)"
                                        }}
                                    >
                                        <ArrowLeft size={18} className="inline mr-2" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                        style={{
                                            backgroundColor: "var(--color-btn-b)",
                                            color: "var(--color-light)",
                                            boxShadow: "0 4px 14px 0 rgba(74, 124, 89, 0.4)"
                                        }}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div
                                                    className="w-4 h-4 border-2 border-[var(--color-light)] border-t-transparent rounded-full animate-spin"
                                                    style={{ animationDuration: '0.8s' }}
                                                />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Create Doctor
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs mt-4 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                                    <AlertCircle size={12} style={{ color: "var(--color-icon-1-light)" }} />
                                    Required fields are marked with an asterisk (*). All changes will be saved upon creation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Language Input Modal */}
            <InputDialogModal
                isOpen={languageModal}
                onClose={() => setLanguageModal(false)}
                onConfirm={handleLanguageConfirm}
                title="Add Language"
                label="Language"
                placeholder="e.g., English, Spanish, French"
                confirmText="Add Language"
                validate={(value) => {
                    if (doctor.languages.includes(value)) {
                        return "This language is already added";
                    }
                    return null;
                }}
            />

            {/* Certification Input Modal */}
            <InputDialogModal
                isOpen={certificationModal}
                onClose={() => setCertificationModal(false)}
                onConfirm={handleCertificationConfirm}
                title="Add Certification"
                label="Certification"
                placeholder="e.g., BLS Certified, ACLS Certified"
                confirmText="Add Certification"
                validate={(value) => {
                    if (doctor.certifications.includes(value)) {
                        return "This certification is already added";
                    }
                    return null;
                }}
            />
        </div>
    );
}

/* -----------------------
   REUSABLE FORM COMPONENTS (same as Edit)
------------------------*/

function FormInput({ label, icon: Icon, type = "text", value, onChange, required = false, placeholder = "", error = "", maxLength, ...props }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="font-medium text-sm flex items-center gap-1" style={{ color: "var(--color-text-dark)" }}>
                {label}
                {required && <span style={{ color: "var(--color-icon-1-light)" }}>*</span>}
            </label>
            <div
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ease-in-out hover:shadow-sm focus-within:shadow-md"
                style={{
                    backgroundColor: "var(--color-bg-card)",
                    border: `1px solid ${error ? "var(--color-icon-1)" : "var(--color-text)"}`,
                }}
            >
                {Icon && <Icon size={18} style={{ color: error ? "var(--color-icon-1)" : "var(--color-icon-2)" }} />}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-transparent outline-none placeholder-[var(--color-text)] transition-colors"
                    style={{ color: "var(--color-text-dark)" }}
                    required={required}
                    maxLength={maxLength}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-icon-1)" }}>
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}
        </div>
    );
}

FormInput.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    type: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    maxLength: PropTypes.number,
};

function FormSelect({ label, icon: Icon, value, onChange, options, required = false }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="font-medium text-sm flex items-center gap-1" style={{ color: "var(--color-text-dark)" }}>
                {label}
                {required && <span style={{ color: "var(--color-icon-1-light)" }}>*</span>}
            </label>
            <div
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ease-in-out hover:shadow-sm focus-within:shadow-md focus-within:border-[var(--color-btn-b)] relative"
                style={{
                    backgroundColor: "var(--color-bg-card)",
                    border: "1px solid var(--color-text)",
                }}
            >
                {Icon && <Icon size={18} style={{ color: "var(--color-icon-2)" }} />}
                <select
                    value={value}
                    onChange={onChange}
                    className="w-full bg-transparent outline-none appearance-none cursor-pointer"
                    style={{ color: "var(--color-text-dark)" }}
                    required={required}
                >
                    <option value="" disabled>Select {label.toLowerCase()}</option>
                    {options.map((opt, i) => (
                        <option key={i} value={opt} style={{ backgroundColor: "var(--color-bg-card)", color: "var(--color-text-dark)" }}>
                            {opt}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text)]">
                    ▼
                </div>
            </div>
        </div>
    );
}

FormSelect.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    required: PropTypes.bool,
};

function FormTextArea({ label, icon: Icon, value, onChange, rows = 4, placeholder = "", required = false }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="font-medium text-sm flex items-center gap-1" style={{ color: "var(--color-text-dark)" }}>
                {label}
                {required && <span style={{ color: "var(--color-icon-1-light)" }}>*</span>}
            </label>
            <div
                className="flex gap-3 p-3 rounded-xl transition-all duration-200 ease-in-out hover:shadow-sm focus-within:shadow-md focus-within:border-[var(--color-btn-b)]"
                style={{
                    backgroundColor: "var(--color-bg-card)",
                    border: "1px solid var(--color-text)",
                }}
            >
                {Icon && <Icon size={18} className="mt-1" style={{ color: "var(--color-icon-2)" }} />}
                <textarea
                    value={value}
                    onChange={onChange}
                    rows={rows}
                    placeholder={placeholder}
                    className="w-full bg-transparent outline-none placeholder-[var(--color-text)] resize-none transition-colors"
                    style={{ color: "var(--color-text-dark)" }}
                    required={required}
                />
            </div>
        </div>
    );
}

FormTextArea.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    rows: PropTypes.number,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
};

export default Add_Doctors;