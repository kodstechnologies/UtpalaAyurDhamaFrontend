import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminUserService from '../../../../services/adminUserService';
import {
    Mail, Phone, Calendar, User, Home,
    ReceiptText, MapPin, Stethoscope, FileBadge,
    Award, BriefcaseMedical, Clock, FileText,
    ArrowLeft, Edit2, Printer, Download,
    ShieldCheck, GraduationCap
} from 'lucide-react';
import DetailsCard from '../../../../components/card/details/DetailsCard';
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';

function View_Nurs() {
    const { nurseId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [nurse, setNurse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNurseDetails = useCallback(async () => {
        setIsLoading(true);
        console.log("Fetching nurse details for ID:", nurseId);
        try {
            const response = await adminUserService.getUserById("Nurse", nurseId);
            console.log("Nurse API Response:", response);
            if (response.success) {
                setNurse(response.data);
            } else {
                console.error("API success false:", response.message);
                toast.error(response.message || "Failed to fetch nurse details");
            }
        } catch (error) {
            console.error("Error fetching nurse catch block:", error);
            toast.error(error.message || "Error fetching nurse details");
        } finally {
            setIsLoading(false);
        }
    }, [nurseId]);

    useEffect(() => {
        fetchNurseDetails();
    }, [fetchNurseDetails]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg-primary)" }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--color-btn-b)", borderBottomColor: "transparent" }}></div>
            </div>
        );
    }

    if (!nurse) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: "var(--color-bg-primary)" }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--color-text-dark)" }}>Nurse Not Found</h2>
                <button
                    onClick={() => navigate('/admin/nursing')}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl text-white font-medium transition-all"
                    style={{ backgroundColor: "var(--color-btn-b)" }}
                >
                    <ArrowLeft size={20} />
                    Back to Nurses
                </button>
            </div>
        );
    }

    // Format dates for display
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return "0";
        try {
            return new Intl.NumberFormat('en-IN').format(amount);
        } catch (e) {
            return amount;
        }
    };

    // Get Initials
    const getInitials = (name) => {
        if (!name) return "??";
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <>
            <Breadcrumb
                items={[
                    { label: "Dashboard", url: "/admin/dashboard" },
                    { label: "Nurses", url: "/admin/nursing" },
                    { label: nurse.name }
                ]}
            />
            <div className="min-h-screen p-4 md:p-6 space-y-6" style={{ backgroundColor: "var(--color-bg-primary)" }}>

                {/* Main Profile Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Avatar & Quick Info */}
                    <div
                        className="lg:col-span-1 rounded-2xl shadow-lg p-6"
                        style={{
                            backgroundColor: "var(--color-bg-card)",
                            border: "1px solid var(--color-border)"
                        }}
                    >
                        {/* Avatar */}
                        <div className="flex flex-col items-center mb-6">
                            <div
                                className="w-32 h-32 rounded-full flex items-center justify-center mb-4 relative"
                                style={{
                                    backgroundColor: "var(--color-bg-card-b)",
                                    border: "4px solid var(--color-btn-b)",
                                    overflow: "hidden"
                                }}
                            >
                                {nurse.profilePicture ? (
                                    <img
                                        src={nurse.profilePicture}
                                        alt={nurse.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span
                                        className="text-5xl font-bold"
                                        style={{ color: "var(--color-btn-dark-b)" }}
                                    >
                                        {getInitials(nurse.name)}
                                    </span>
                                )}
                                <div
                                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: "var(--color-btn-b)" }}
                                >
                                    <ShieldCheck size={20} className="text-white" />
                                </div>
                            </div>

                            <h1
                                className="text-2xl font-bold text-center mb-2 break-words overflow-wrap-anywhere max-w-full px-2"
                                style={{ color: "var(--color-text-dark)", wordBreak: "break-word" }}
                            >
                                {nurse.name}
                            </h1>

                            <div
                                className="px-4 py-1 rounded-full text-sm font-semibold mb-4"
                                style={{
                                    backgroundColor: "rgba(74, 124, 89, 0.15)",
                                    color: "var(--color-btn-dark-b)"
                                }}
                            >
                                {nurse.status || "Active"}
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-medium"
                                    style={{
                                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                                        color: "var(--color-btn-dark-b)"
                                    }}
                                >
                                    <Stethoscope size={12} className="inline mr-1" />
                                    {nurse.specialty}
                                </span>
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-medium"
                                    style={{
                                        backgroundColor: "rgba(168, 85, 247, 0.1)",
                                        color: "var(--color-text-dark)"
                                    }}
                                >
                                    <Clock size={12} className="inline mr-1" />
                                    {nurse.experience} {nurse.experience && "Years"}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-card-b)" }}>
                                <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                                    Hourly Rate
                                </span>
                                <span className="text-lg font-bold" style={{ color: "var(--color-text-dark)" }}>
                                    ₹{formatCurrency(nurse.hourlyRate)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-card-b)" }}>
                                <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                                    Shift Availability
                                </span>
                                <span className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>
                                    {nurse.shiftAvailability || "Not Specified"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Main Content */}
                    <div
                        className="lg:col-span-2 rounded-2xl shadow-lg"
                        style={{
                            backgroundColor: "var(--color-bg-card)",
                            border: "1px solid var(--color-border)"
                        }}
                    >
                        {/* Tabs */}
                        <div className="flex border-b" style={{ borderColor: "var(--color-border)" }}>
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${activeTab === "general"
                                    ? "border-b-2"
                                    : "hover:bg-gray-50"
                                    }`}
                                style={{
                                    color: activeTab === "general" ? "var(--color-btn-b)" : "var(--color-text)",
                                    borderBottomColor: activeTab === "general" ? "var(--color-btn-b)" : "transparent"
                                }}
                                onClick={() => setActiveTab("general")}
                            >
                                <Home size={20} />
                                General Info
                            </button>
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${activeTab === "professional"
                                    ? "border-b-2"
                                    : "hover:bg-gray-50"
                                    }`}
                                style={{
                                    color: activeTab === "professional" ? "var(--color-btn-b)" : "var(--color-text)",
                                    borderBottomColor: activeTab === "professional" ? "var(--color-btn-b)" : "transparent"
                                }}
                                onClick={() => setActiveTab("professional")}
                            >
                                <ReceiptText size={20} />
                                Professional Details
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === "general" && (
                                <div className="space-y-6">
                                    <h2
                                        className="text-xl font-bold mb-4"
                                        style={{ color: "var(--color-text-dark)" }}
                                    >
                                        Personal Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <DetailsCard
                                            icon={Mail}
                                            label="Email Address"
                                            value={nurse.email}
                                            iconColor="#3B82F6"
                                        />
                                        <DetailsCard
                                            icon={Phone}
                                            label="Phone Number"
                                            value={nurse.phone}
                                            iconColor="#10B981"
                                        />
                                        <DetailsCard
                                            icon={Calendar}
                                            label="Date of Birth"
                                            value={formatDate(nurse.dob)}
                                            iconColor="#8B5CF6"
                                        />
                                        <DetailsCard
                                            icon={User}
                                            label="Gender"
                                            value={nurse.gender}
                                            iconColor="#EC4899"
                                        />
                                        <DetailsCard
                                            icon={MapPin}
                                            label="Address"
                                            value={nurse.address}
                                            iconColor="#F59E0B"
                                        />
                                        <DetailsCard
                                            icon={Phone}
                                            label="Emergency Contact"
                                            value={nurse.emergencyContact}
                                            iconColor="#EF4444"
                                        />
                                    </div>

                                    {/* Languages */}
                                    {nurse.languages && nurse.languages.length > 0 && (
                                        <div className="pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
                                            <h3
                                                className="text-lg font-semibold mb-3"
                                                style={{ color: "var(--color-text-dark)" }}
                                            >
                                                Languages Spoken
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {nurse.languages.map((lang, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-4 py-2 rounded-lg font-medium"
                                                        style={{
                                                            backgroundColor: "var(--color-bg-card-b)",
                                                            color: "var(--color-text-dark)"
                                                        }}
                                                    >
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "professional" && (
                                <div className="space-y-6">
                                    <h2
                                        className="text-xl font-bold mb-4"
                                        style={{ color: "var(--color-text-dark)" }}
                                    >
                                        Professional Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <DetailsCard
                                            icon={Stethoscope}
                                            label="Nursing Specialty"
                                            value={nurse.specialty}
                                            iconColor="#3B82F6"
                                            highlight
                                        />
                                        <DetailsCard
                                            icon={BriefcaseMedical}
                                            label="Assigned Unit/Ward"
                                            value={nurse.unit}
                                            iconColor="#10B981"
                                        />
                                        <DetailsCard
                                            icon={FileBadge}
                                            label="Nursing License Number"
                                            value={nurse.licenseNumber}
                                            iconColor="#8B5CF6"
                                        />
                                        <DetailsCard
                                            icon={Calendar}
                                            label="Joining Date"
                                            value={formatDate(nurse.joiningDate)}
                                            iconColor="#F59E0B"
                                        />
                                        <DetailsCard
                                            icon={Award}
                                            label="Experience"
                                            value={`${nurse.experience} Years`}
                                            iconColor="#EC4899"
                                        />
                                        <DetailsCard
                                            icon={GraduationCap}
                                            label="Qualifications"
                                            value={nurse.qualifications}
                                            iconColor="#6366F1"
                                        />
                                    </div>

                                    {/* Certifications */}
                                    {nurse.certifications && nurse.certifications.length > 0 && (
                                        <div className="pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
                                            <h3
                                                className="text-lg font-semibold mb-3"
                                                style={{ color: "var(--color-text-dark)" }}
                                            >
                                                Certifications
                                            </h3>
                                            <div className="space-y-2">
                                                {nurse.certifications.map((cert, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-3 p-3 rounded-lg"
                                                        style={{ backgroundColor: "var(--color-bg-card-b)" }}
                                                    >
                                                        <Award size={16} style={{ color: "var(--color-btn-b)" }} />
                                                        <span style={{ color: "var(--color-text-dark)" }}>{cert}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Notes & Expertise */}
                {nurse.bio && (
                    <div className="pt-6" style={{ borderColor: "var(--color-border)" }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-10 h-10 flex items-center justify-center rounded-lg"
                                style={{
                                    backgroundColor: "rgba(74, 124, 89, 0.15)",
                                }}
                            >
                                <FileText size={20} style={{ color: "var(--color-btn-b)" }} />
                            </div>
                            <h3
                                className="text-xl font-semibold"
                                style={{ color: "var(--color-text-dark)" }}
                            >
                                Notes & Expertise
                            </h3>
                        </div>

                        <div
                            className="p-5 rounded-xl"
                            style={{
                                backgroundColor: "var(--color-bg-card-b)",
                                borderLeft: "4px solid var(--color-btn-b)"
                            }}
                        >
                            <p
                                className="leading-relaxed"
                                style={{ color: "var(--color-text-dark-b)" }}
                            >
                                {nurse.bio}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default View_Nurs;
