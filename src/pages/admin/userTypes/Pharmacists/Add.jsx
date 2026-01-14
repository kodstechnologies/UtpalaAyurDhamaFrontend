import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Mail, Phone, Calendar, User, Stethoscope, FileBadge,
    BriefcaseMedical, Award, GraduationCap, MapPin, Clock,
    ShieldCheck, BookOpen, Building, FileText, ArrowLeft,
    X, Save, AlertCircle, CheckCircle, Upload
} from "lucide-react";
import HeadingCard from "../../../../components/card/HeadingCard";
import InputDialogModal from "../../../../components/modal/InputDialogModal";
import adminUserService from "../../../../services/adminUserService";

function Add_Pharmacists() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeSection, setActiveSection] = useState("personal");
    const [languageModal, setLanguageModal] = useState(false);
    const [certificationModal, setCertificationModal] = useState(false);

    // Initial empty pharmacist data for creation
    const [pharmacist, setPharmacist] = useState({
        // Personal Info
        name: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        address: "",
        emergencyContact: "",
        languages: [],
        profilePicture: "",

        // Professional Info
        specialization: "",
        department: "",
        licenseNumber: "",
        joiningDate: "",
        experience: "",
        qualifications: "",
        status: "Active",
        salary: "",
        workingHours: "",

        // Additional Info
        bio: "",
        certifications: []
    });

    // Handle Image Upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 2 * 1024 * 1024) { // 2MB
            toast.error("File size should be less than 2MB");
            return;
        }

        setIsUploading(true);
        try {
            const response = await adminUserService.uploadImage(file);
            if (response.success) {
                setPharmacist(prev => ({ ...prev, profilePicture: response.data.url }));
                toast.success("Image uploaded successfully!");
            }
        } catch (error) {
            console.error("Upload failed", error);
            const errorMessage = error?.message || error?.response?.data?.message || "Failed to upload image";
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };
    const getMaxDob = () => {
        const today = new Date();
        today.setFullYear(today.getFullYear() - 18);
        return today.toISOString().split("T")[0]; // yyyy-mm-dd
    };

    // Handle Input Change
    const updateField = (field, value) => {
        setPharmacist((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddLanguage = () => {
        setLanguageModal(true);
    };

    const handleLanguageConfirm = (language) => {
        if (language && !pharmacist.languages.includes(language)) {
            setPharmacist(prev => ({
                ...prev,
                languages: [...prev.languages, language]
            }));
            toast.success("Language added successfully!");
        } else if (pharmacist.languages.includes(language)) {
            toast.error("This language is already added");
        }
    };

    const handleRemoveLanguage = (index) => {
        setPharmacist(prev => ({
            ...prev,
            languages: prev.languages.filter((_, i) => i !== index)
        }));
    };

    const handleAddCertification = () => {
        setCertificationModal(true);
    };

    const handleCertificationConfirm = (certification) => {
        if (certification && !pharmacist.certifications.includes(certification)) {
            setPharmacist(prev => ({
                ...prev,
                certifications: [...prev.certifications, certification]
            }));
            toast.success("Certification added successfully!");
        } else if (pharmacist.certifications.includes(certification)) {
            toast.error("This certification is already added");
        }
    };

    const handleRemoveCertification = (index) => {
        setPharmacist(prev => ({
            ...prev,
            certifications: prev.certifications.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        // Basic validation
        if (!pharmacist.name || !pharmacist.email || !pharmacist.specialization || !pharmacist.licenseNumber) {
            toast.error("Please fill in the required fields (Name, Email, Specialization, License Number).");
            return;
        }

        setIsSaving(true);

        try {
            // Prepare data - convert strings to numbers and dates where needed
            const pharmacistData = {
                ...pharmacist,
                experience: pharmacist.experience ? Number(pharmacist.experience) : undefined,
                salary: pharmacist.salary ? Number(pharmacist.salary) : undefined,
                dateOfBirth: pharmacist.dob ? new Date(pharmacist.dob).toISOString() : undefined,
                joiningDate: pharmacist.joiningDate ? new Date(pharmacist.joiningDate).toISOString() : undefined
            };

            const response = await adminUserService.createUser("Pharmacist", pharmacistData);

            if (response.success) {
                setShowSuccess(true);
                toast.success("Pharmacist created successfully!");
                setTimeout(() => {
                    setShowSuccess(false);
                    navigate("/admin/pharmacists");
                }, 2000);
            } else {
                toast.error(response.message || "Failed to create pharmacist");
                setIsSaving(false);
            }
        } catch (error) {
            console.error("Error creating pharmacist:", error);
            toast.error(error.message || "Error creating pharmacist");
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
        { label: "Pharmacists", url: "/admin/pharmacists" },
        { label: "Add Pharmacist" }
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
                                Pharmacist Created Successfully
                            </p>
                            <p className="text-sm" style={{ color: "var(--color-text)" }}>
                                Redirecting to pharmacists list...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <HeadingCard
                breadcrumbItems={breadcrumbItems}
                title="Add New Pharmacist"
                subtitle="Create a new pharmacist profile with complete information"
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

                            {/* Quick Preview Placeholder (for new pharmacist) */}
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
                                            New Pharmacist Profile
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
                                    Fill in the information below to create the new pharmacist profile
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
                                                value={pharmacist.name}
                                                onChange={(e) => updateField("name", e.target.value)}
                                                required
                                            />
                                            <FormInput
                                                label="Email Address"
                                                icon={Mail}
                                                type="email"
                                                value={pharmacist.email}
                                                onChange={(e) => updateField("email", e.target.value)}
                                                required
                                            />
                                            <FormInput
                                                label="Phone Number"
                                                icon={Phone}
                                                type="tel"
                                                value={pharmacist.phone}
                                                onChange={(e) => updateField("phone", e.target.value)}
                                                maxLength={10}
                                            />
                                            <FormInput
                                                label="Emergency Contact"
                                                icon={Phone}
                                                type="tel"
                                                value={pharmacist.emergencyContact}
                                                onChange={(e) => updateField("emergencyContact", e.target.value)}
                                                maxLength={10}
                                            />
                                            {/* <FormInput
                                                label="Date of Birth"
                                                icon={Calendar}
                                                type="date"
                                                value={pharmacist.dob}
                                                onChange={(e) => updateField("dob", e.target.value)}
                                            /> */}
                                            <FormInput
                                                label="Date of Birth"
                                                icon={Calendar}
                                                type="date"
                                                value={pharmacist.dob}
                                                max={getMaxDob()}   // 👈 IMPORTANT
                                                onChange={(e) => updateField("dob", e.target.value)}
                                            />

                                            <FormSelect
                                                label="Gender"
                                                icon={User}
                                                value={pharmacist.gender}
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
                                                value={pharmacist.address}
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
                                                {pharmacist.languages.map((lang, index) => (
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
                                                label="Pharmacy Specialization"
                                                icon={Stethoscope}
                                                value={pharmacist.specialization}
                                                onChange={(e) => updateField("specialization", e.target.value)}
                                                required
                                                placeholder="e.g., Clinical, Community, Hospital"
                                            />
                                            <FormInput
                                                label="Department"
                                                icon={Building}
                                                value={pharmacist.department}
                                                onChange={(e) => updateField("department", e.target.value)}
                                                placeholder="e.g., Inpatient Pharmacy, Outpatient"
                                            />
                                            <FormInput
                                                label="License Number"
                                                icon={FileBadge}
                                                value={pharmacist.licenseNumber}
                                                onChange={(e) => updateField("licenseNumber", e.target.value)}
                                                required
                                            />
                                            <FormInput
                                                label="Years of Experience"
                                                icon={Award}
                                                type="number"
                                                value={pharmacist.experience}
                                                onChange={(e) => updateField("experience", e.target.value)}
                                            />
                                            <FormInput
                                                label="Joining Date"
                                                icon={Calendar}
                                                type="date"
                                                value={pharmacist.joiningDate}
                                                onChange={(e) => updateField("joiningDate", e.target.value)}
                                            />
                                            <FormSelect
                                                label="Status"
                                                icon={ShieldCheck}
                                                value={pharmacist.status}
                                                onChange={(e) => updateField("status", e.target.value)}
                                                options={["Active", "On Leave", "Inactive", "Retired"]}
                                            />
                                            <FormInput
                                                label="Monthly Salary ($)"
                                                icon={BookOpen}
                                                type="number"
                                                value={pharmacist.salary}
                                                onChange={(e) => updateField("salary", e.target.value)}
                                            />
                                            <FormInput
                                                label="Working Hours"
                                                icon={Clock}
                                                value={pharmacist.workingHours}
                                                onChange={(e) => updateField("workingHours", e.target.value)}
                                                placeholder="e.g., Mon-Fri: 9AM-6PM"
                                            />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-text-dark)" }}>
                                                <GraduationCap size={18} style={{ color: "var(--color-icon-3)" }} />
                                                Qualifications
                                            </h3>
                                            <FormTextArea
                                                label="Pharmacy Degrees & Training"
                                                icon={GraduationCap}
                                                value={pharmacist.qualifications}
                                                onChange={(e) => updateField("qualifications", e.target.value)}
                                                rows={3}
                                                placeholder="Enter degrees and training separated by commas, e.g., PharmD, BPharm, Clinical Pharmacy Certification"
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
                                                label="Pharmacist Biography"
                                                icon={FileText}
                                                value={pharmacist.bio}
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
                                                {pharmacist.certifications.map((cert, index) => (
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
                                                    {pharmacist.profilePicture ? (
                                                        <img
                                                            src={pharmacist.profilePicture}
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
                                                        id="profile-upload-pharmacist"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('profile-upload-pharmacist').click()}
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
                                                Create Pharmacist
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
                    if (pharmacist.languages.includes(value)) {
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
                    if (pharmacist.certifications.includes(value)) {
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

function FormInput({ label, icon: Icon, type = "text", value, onChange, required = false, placeholder = "", ...props }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="font-medium text-sm flex items-center gap-1" style={{ color: "var(--color-text-dark)" }}>
                {label}
                {required && <span style={{ color: "var(--color-icon-1-light)" }}>*</span>}
            </label>
            <div
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ease-in-out hover:shadow-sm focus-within:shadow-md focus-within:border-[var(--color-btn-b)]"
                style={{
                    backgroundColor: "var(--color-bg-card)",
                    border: "1px solid var(--color-text)",
                }}
            >
                {Icon && <Icon size={18} style={{ color: "var(--color-icon-2)" }} />}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-transparent outline-none placeholder-[var(--color-text)] transition-colors"
                    style={{ color: "var(--color-text-dark)" }}
                    required={required}
                    {...props}
                />
            </div>
        </div>
    );
}

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

export default Add_Pharmacists;