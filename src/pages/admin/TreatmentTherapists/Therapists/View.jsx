import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
    FileText, 
    ArrowLeft, 
    Calendar,
    Clock,
    Tag,
    Edit,
    Trash2
} from "lucide-react";
import { Box, CircularProgress } from "@mui/material";
import CardBorder from "../../../../components/card/CardBorder";
import RedirectButton from "../../../../components/buttons/RedirectButton";
import therapyService from "../../../../services/therapyService";
import HeadingCard from "../../../../components/card/HeadingCard";

function View_TherapyManagement() {
    const { therapyId } = useParams();
    const navigate = useNavigate();
    const [therapy, setTherapy] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTherapy = async () => {
            if (!therapyId) {
                toast.error("Therapy ID is missing");
                navigate("/admin/treatment-therapy");
                return;
            }

            try {
                setIsLoading(true);
                const response = await therapyService.getTherapyById(therapyId);
                
                if (response.success && response.data) {
                    setTherapy(response.data);
                } else {
                    toast.error(response.message || "Failed to fetch therapy details");
                    navigate("/admin/treatment-therapy");
                }
            } catch (error) {
                console.error("Error fetching therapy:", error);
                toast.error(error.message || "Failed to fetch therapy details");
                navigate("/admin/treatment-therapy");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTherapy();
    }, [therapyId, navigate]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this therapy?")) {
            try {
                const response = await therapyService.deleteTherapy(therapyId);
                if (response.success) {
                    toast.success("Therapy deleted successfully");
                    navigate("/admin/treatment-therapy");
                } else {
                    toast.error(response.message || "Failed to delete therapy");
                }
            } catch (error) {
                console.error("Error deleting therapy:", error);
                toast.error(error.message || "Failed to delete therapy");
            }
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!therapy) {
        return null;
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="space-y-6 p-6">
            <HeadingCard
                title="Therapy Details"
                subtitle="Complete information about the therapy treatment"
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Therapy Scheduling & Pricing", url: "/admin/treatment-therapy" },
                    { label: "Therapy Details" }
                ]}
            />

            {/* Therapy Info Header */}
            <CardBorder padding="2rem">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            {therapy.therapyName || "N/A"}
                        </h1>
                        {therapy.therapyId && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Tag size={16} />
                                <span className="text-sm font-medium">{therapy.therapyId}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Cost:</span>
                        <span className="text-2xl font-bold text-gray-800">
                            ₹{therapy.cost || 0}
                        </span>
                    </div>
                </div>
            </CardBorder>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Description */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description Card */}
                    <CardBorder padding="2rem">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                                    <FileText className="text-white" size={20} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">Description</h2>
                            </div>
                            {therapy.description ? (
                                <div 
                                    className="text-gray-700 leading-relaxed text-base"
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "normal",
                                        overflowWrap: "break-word",
                                        wordWrap: "break-word",
                                        maxWidth: "100%"
                                    }}
                                >
                                    {therapy.description}
                                </div>
                            ) : (
                                <div className="text-gray-400 italic text-center py-8">
                                    No description available
                                </div>
                            )}
                        </div>
                    </CardBorder>

                </div>

                {/* Right Column - Metadata & Actions */}
                <div className="space-y-6">
                    {/* Quick Info Card */}
                    <CardBorder padding="2rem">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                                    <Clock className="text-white" size={20} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">Timeline</h2>
                            </div>
                            <div className="space-y-4">
                                {therapy.createdAt && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            Created At
                                        </label>
                                        <div className="text-base text-gray-800 font-medium">
                                            {formatDate(therapy.createdAt)}
                                        </div>
                                    </div>
                                )}
                                {therapy.updatedAt && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                            <Clock size={16} className="text-gray-400" />
                                            Last Updated
                                        </label>
                                        <div className="text-base text-gray-800 font-medium">
                                            {formatDate(therapy.updatedAt)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardBorder>

                    {/* Actions Card */}
                    <CardBorder padding="2rem">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800 pb-4 border-b border-gray-200">
                                Actions
                            </h2>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => navigate(`/admin/treatment-therapy/edit/${therapyId}`)}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Edit size={16} />
                                    Edit Therapy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Trash2 size={16} />
                                    Delete Therapy
                                </button>
                                <button
                                    onClick={() => navigate("/admin/treatment-therapy")}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all duration-200"
                                >
                                    <ArrowLeft size={16} />
                                    Back to List
                                </button>
                            </div>
                        </div>
                    </CardBorder>

                </div>
            </div>
        </div>
    );
}

export default View_TherapyManagement;
