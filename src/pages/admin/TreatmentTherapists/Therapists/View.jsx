import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Activity, IndianRupee, FileText, ArrowLeft } from "lucide-react";
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

    return (
        <div className="space-y-6">
            <HeadingCard
                title="Therapy Details"
                subtitle="View complete information about the therapy"
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Therapy Scheduling & Pricing", url: "/admin/treatment-therapy" },
                    { label: "Therapy Details" }
                ]}
            />

            <CardBorder padding="2rem">
                <div className="bg-white shadow rounded-xl p-6 space-y-6 border border-gray-200">
                    {/* Therapy Name */}
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Activity className="text-[var(--color-icon-2)]" size={18} />
                            Therapy Name
                        </label>
                        <div className="text-lg font-semibold text-gray-900">
                            {therapy.therapyName || "N/A"}
                        </div>
                    </div>

                    {/* Therapy ID */}
                    {therapy.therapyId && (
                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Activity className="text-[var(--color-icon-2)]" size={18} />
                                Therapy ID
                            </label>
                            <div className="text-lg font-semibold text-gray-900">
                                {therapy.therapyId}
                            </div>
                        </div>
                    )}

                    {/* Cost */}
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <IndianRupee className="text-[var(--color-icon-2)]" size={18} />
                            Cost
                        </label>
                        <div className="text-lg font-semibold text-gray-900">
                            ₹{therapy.cost || 0}
                        </div>
                    </div>

                    {/* Description */}
                    {therapy.description && (
                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <FileText className="text-[var(--color-icon-2)]" size={18} />
                                Description
                            </label>
                            <div className="text-base text-gray-700 whitespace-pre-wrap">
                                {therapy.description}
                            </div>
                        </div>
                    )}

                    {/* Created/Updated Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        {therapy.createdAt && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">
                                    Created At
                                </label>
                                <div className="text-sm text-gray-700">
                                    {new Date(therapy.createdAt).toLocaleString()}
                                </div>
                            </div>
                        )}
                        {therapy.updatedAt && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">
                                    Last Updated
                                </label>
                                <div className="text-sm text-gray-700">
                                    {new Date(therapy.updatedAt).toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end pt-4 gap-3">
                        <RedirectButton
                            text="Back to List"
                            link="/admin/treatment-therapy"
                        />
                    </div>
                </div>
            </CardBorder>
        </div>
    );
}

export default View_TherapyManagement;
