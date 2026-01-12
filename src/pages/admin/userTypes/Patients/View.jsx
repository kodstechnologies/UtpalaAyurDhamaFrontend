import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Mail, Phone, Calendar, User, Home,
    ReceiptText, MapPin, Stethoscope, FileBadge,
    Award, BriefcaseMedical, Clock, FileText,
    ArrowLeft, Edit2, Printer, Download,
    ShieldCheck, GraduationCap
} from 'lucide-react';
import DetailsCard from '../../../../components/card/details/DetailsCard';
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
import { getApiUrl, getAuthHeaders } from '../../../../config/api';

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

// Helper function to format date
const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Helper function to get initials from name
const getInitials = (name) => {
    if (!name) return "NA";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

function View_Patients() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(true);
    const [patient, setPatient] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);

    useEffect(() => {
        fetchPatientData();
    }, [patientId]);

    const fetchPatientData = async () => {
        setIsLoading(true);
        try {
            // Fetch patient details
            const patientResponse = await fetch(getApiUrl(`patients/${patientId}`), {
                method: "GET",
                headers: getAuthHeaders()
            });

            if (!patientResponse.ok) {
                throw new Error("Failed to fetch patient details");
            }

            const patientData = await patientResponse.json();
            if (patientData.success && patientData.data) {
                setPatient(patientData.data);
                
                // Fetch family members
                try {
                    const familyResponse = await fetch(getApiUrl(`family-members?patient=${patientId}`), {
                        method: "GET",
                        headers: getAuthHeaders()
                    });
                    if (familyResponse.ok) {
                        const familyData = await familyResponse.json();
                        if (familyData.success && familyData.data) {
                            setFamilyMembers(Array.isArray(familyData.data) ? familyData.data : []);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching family members:", error);
                    // Don't show error for family members, just set empty array
                    setFamilyMembers([]);
                }
            } else {
                toast.error(patientData.message || "Failed to fetch patient details");
                navigate('/admin/patients');
            }
        } catch (error) {
            console.error("Error fetching patient data:", error);
            toast.error(error.message || "Failed to fetch patient data");
            navigate('/admin/patients');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen p-4 md:p-6 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
                    style={{ borderColor: "var(--color-btn-b)", borderBottomColor: "transparent" }}></div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen p-4 md:p-6 flex justify-center items-center">
                <div className="text-center">
                    <p className="text-lg" style={{ color: "var(--color-text-dark)" }}>Patient not found</p>
                    <button
                        onClick={() => navigate('/admin/patients')}
                        className="mt-4 px-4 py-2 rounded-lg"
                        style={{ backgroundColor: "var(--color-btn-b)", color: "white" }}
                    >
                        Back to Patients
                    </button>
                </div>
            </div>
        );
    }

    const user = patient.user || {};
    const age = calculateAge(patient.dateOfBirth);
    const initials = getInitials(user.name);

    // Transform patient data for display
    const patientData = {
        personalInfo: {
            name: user.name || "N/A",
            initials: initials,
            email: user.email || "N/A",
            phone: user.phone || "N/A",
            dob: formatDate(patient.dateOfBirth),
            gender: user.gender || "N/A",
            address: user.address || "N/A",
            emergencyContact: user.emergencyContact || "N/A",
            uhid: user.uhid || "N/A",
        },
        medicalInfo: {
            patientId: patient.patientId || patient._id || "N/A",
            admissionDate: formatDate(patient.admissionDate),
            admissionStatus: patient.admissionStatus || "Not Admitted",
            treatmentStatus: patient.treatmentStatus || "Not Started",
            status: patient.admissionStatus === "Not Admitted" ? "Active" : patient.admissionStatus,
            bodytype: patient.bodytype || "N/A",
            inpatient: patient.inpatient ? "Yes" : "No",
        },
        familyInfo: {
            familyMembers: familyMembers.map(member => ({
                name: member.name || "N/A",
                relation: member.relation || "N/A",
                phone: member.phone || "N/A",
                email: member.email || "N/A",
            }))
        },
        notes: `Patient ${user.name || ""} (Patient ID: ${patient.patientId || patient._id || "N/A"}) ${age !== "N/A" ? `is a ${age}-year-old` : ""} ${user.gender || ""} patient. Admission Status: ${patient.admissionStatus || "Not Admitted"}. Treatment Status: ${patient.treatmentStatus || "Not Started"}.${patient.bodytype ? ` Body Type: ${patient.bodytype}.` : ""}`
    };

    return (
        <>
            <Breadcrumb
                items={[
                    { label: "Dashboard", url: "/admin/dashboard" },
                    { label: "Patients", url: "/admin/patients" },
                    { label: patientData.personalInfo.name }
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
                                    border: "4px solid var(--color-btn-b)"
                                }}
                            >
                                <span
                                    className="text-5xl font-bold"
                                    style={{ color: "var(--color-btn-dark-b)" }}
                                >
                                    {patientData.personalInfo.initials}
                                </span>
                                <div
                                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: "var(--color-btn-b)" }}
                                >
                                    <ShieldCheck size={20} className="text-white" />
                                </div>
                            </div>

                            <h1
                                className="text-2xl font-bold text-center mb-2"
                                style={{ color: "var(--color-text-dark)" }}
                            >
                                {patientData.personalInfo.name}
                            </h1>

                            <div
                                className="px-4 py-1 rounded-full text-sm font-semibold mb-4"
                                style={{
                                    backgroundColor: "rgba(74, 124, 89, 0.15)",
                                    color: "var(--color-btn-dark-b)"
                                }}
                            >
                                {patientData.medicalInfo.status}
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
                                    {patientData.medicalInfo.admissionStatus}
                                </span>
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-medium"
                                    style={{
                                        backgroundColor: "rgba(168, 85, 247, 0.1)",
                                        color: "var(--color-text-dark)"
                                    }}
                                >
                                    <Clock size={12} className="inline mr-1" />
                                    {patientData.medicalInfo.treatmentStatus}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-card-b)" }}>
                                <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                                    Patient ID
                                </span>
                                <span className="text-lg font-bold" style={{ color: "var(--color-text-dark)" }}>
                                    {patientData.medicalInfo.patientId}
                                </span>
                            </div>

                            {patientData.personalInfo.uhid !== "N/A" && (
                                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-card-b)" }}>
                                    <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                                        UHID
                                    </span>
                                    <span className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>
                                        {patientData.personalInfo.uhid}
                                    </span>
                                </div>
                            )}

                            {patientData.medicalInfo.bodytype !== "N/A" && (
                                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-card-b)" }}>
                                    <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                                        Body Type
                                    </span>
                                    <span className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>
                                        {patientData.medicalInfo.bodytype}
                                    </span>
                                </div>
                            )}
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
                                className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${activeTab === "medical"
                                    ? "border-b-2"
                                    : "hover:bg-gray-50"
                                    }`}
                                style={{
                                    color: activeTab === "medical" ? "var(--color-btn-b)" : "var(--color-text)",
                                    borderBottomColor: activeTab === "medical" ? "var(--color-btn-b)" : "transparent"
                                }}
                                onClick={() => setActiveTab("medical")}
                            >
                                <ReceiptText size={20} />
                                Medical Details
                            </button>
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${activeTab === "family"
                                    ? "border-b-2"
                                    : "hover:bg-gray-50"
                                    }`}
                                style={{
                                    color: activeTab === "family" ? "var(--color-btn-b)" : "var(--color-text)",
                                    borderBottomColor: activeTab === "family" ? "var(--color-btn-b)" : "transparent"
                                }}
                                onClick={() => setActiveTab("family")}
                            >
                                <User size={20} />
                                Family Members
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
                                            value={patientData.personalInfo.email}
                                            iconColor="#3B82F6"
                                        />
                                        <DetailsCard
                                            icon={Phone}
                                            label="Phone Number"
                                            value={patientData.personalInfo.phone}
                                            iconColor="#10B981"
                                        />
                                        <DetailsCard
                                            icon={Calendar}
                                            label="Date of Birth"
                                            value={patientData.personalInfo.dob}
                                            iconColor="#8B5CF6"
                                        />
                                        <DetailsCard
                                            icon={User}
                                            label="Gender"
                                            value={patientData.personalInfo.gender}
                                            iconColor="#EC4899"
                                        />
                                        <DetailsCard
                                            icon={MapPin}
                                            label="Address"
                                            value={patientData.personalInfo.address}
                                            iconColor="#F59E0B"
                                        />
                                        {patientData.personalInfo.uhid !== "N/A" && (
                                            <DetailsCard
                                                icon={FileBadge}
                                                label="UHID"
                                                value={patientData.personalInfo.uhid}
                                                iconColor="#6366F1"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "medical" && (
                                <div className="space-y-6">
                                    <h2
                                        className="text-xl font-bold mb-4"
                                        style={{ color: "var(--color-text-dark)" }}
                                    >
                                        Medical Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <DetailsCard
                                            icon={FileBadge}
                                            label="Patient ID"
                                            value={patientData.medicalInfo.patientId}
                                            iconColor="#8B5CF6"
                                        />
                                        <DetailsCard
                                            icon={Calendar}
                                            label="Admission Date"
                                            value={patientData.medicalInfo.admissionDate}
                                            iconColor="#F59E0B"
                                        />
                                        <DetailsCard
                                            icon={Stethoscope}
                                            label="Admission Status"
                                            value={patientData.medicalInfo.admissionStatus}
                                            iconColor="#3B82F6"
                                            highlight
                                        />
                                        <DetailsCard
                                            icon={BriefcaseMedical}
                                            label="Treatment Status"
                                            value={patientData.medicalInfo.treatmentStatus}
                                            iconColor="#10B981"
                                        />
                                        <DetailsCard
                                            icon={User}
                                            label="Inpatient"
                                            value={patientData.medicalInfo.inpatient}
                                            iconColor="#EC4899"
                                        />
                                        {patientData.medicalInfo.bodytype !== "N/A" && (
                                            <DetailsCard
                                                icon={GraduationCap}
                                                label="Body Type"
                                                value={patientData.medicalInfo.bodytype}
                                                iconColor="#6366F1"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "family" && (
                                <div className="space-y-6">
                                    <h2
                                        className="text-xl font-bold mb-4"
                                        style={{ color: "var(--color-text-dark)" }}
                                    >
                                        Family Members
                                    </h2>

                                    {familyMembers.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {patientData.familyInfo.familyMembers.map((member, index) => (
                                                <div key={index} className="space-y-2 p-4 rounded-lg border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card-b)" }}>
                                                    <h4 className="font-semibold text-lg" style={{ color: "var(--color-text-dark)" }}>
                                                        {member.name}
                                                    </h4>
                                                    <p className="text-sm" style={{ color: "var(--color-text)" }}>
                                                        <strong>Relation:</strong> {member.relation}
                                                    </p>
                                                    <p className="text-sm" style={{ color: "var(--color-text)" }}>
                                                        <strong>Phone:</strong> {member.phone}
                                                    </p>
                                                    {member.email !== "N/A" && (
                                                        <p className="text-sm" style={{ color: "var(--color-text)" }}>
                                                            <strong>Email:</strong> {member.email}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p style={{ color: "var(--color-text)" }}>No family members registered</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Notes & Expertise */}
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
                            Patient Summary
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
                            {patientData.notes}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default View_Patients;
