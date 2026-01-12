import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import FamilyMemberCard from "../../../components/card/patientCard/FamilyMammberCard";
import RedirectButton from "../../../components/buttons/RedirectButton";
import { Box, Typography, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import familyMemberService from "../../../services/familyMemberService";

function Family_Members_View() {
    const navigate = useNavigate();
    const location = useLocation();
    const [familyMembers, setFamilyMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFamilyMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await familyMemberService.getAllFamilyMembers();

            if (response && response.success) {
                const transformedMembers = (response.data || []).map((member) => ({
                    id: member._id,
                    name: member.fullName || "",
                    relation: member.relation || "",
                    phone: member.phoneNumber || member.user?.phone || "",
                    dob: member.dateOfBirth 
                        ? new Date(member.dateOfBirth).toISOString().split('T')[0]
                        : "",
                    gender: member.gender || "",
                    uhid: member.user?.uhid || "Not assigned",
                }));
                setFamilyMembers(transformedMembers);
            } else {
                toast.error(response?.message || "Failed to fetch family members");
            }
        } catch (error) {
            console.error("Error fetching family members:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch family members");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFamilyMembers();
    }, [fetchFamilyMembers]);

    // Refresh when navigating back from edit/add pages
    useEffect(() => {
        if (location.state?.refresh) {
            fetchFamilyMembers();
            // Clear the refresh state
            window.history.replaceState({}, document.title);
        }
    }, [location.state, fetchFamilyMembers]);

    const handleEdit = (id) => {
        navigate(`/patient/family/edit/${id}`, { state: { from: "view" } });
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name} from your family members? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await familyMemberService.deleteFamilyMember(id);
            
            if (response && response.success) {
                toast.success(`${name} has been removed from your family members.`);
                // Refresh the list
                fetchFamilyMembers();
            } else {
                toast.error(response?.message || "Failed to delete family member");
            }
        } catch (error) {
            console.error("Error deleting family member:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete family member";
            toast.error(errorMessage);
        }
    };

    return (
        <div style={{ paddingBottom: "30px" }}>

            {/* Heading */}
            <HeadingCard
                title="Your Family Members"
                subtitle="Manage your registered family members easily. Keep their profile updated to help doctors provide better care."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "Family Members" }
                ]}
            />

            {/* Title + Add Button */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 3,
                    mb: 2,
                    mx: 1,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: "var(--color-text-dark)",
                    }}
                >
                    Family Profiles
                </Typography>

                <RedirectButton
                    text="Add Member"
                    link="/patient/family/add"
                    sx={{
                        background: "var(--color-primary)",
                        padding: "7px 18px",
                        borderRadius: "8px",
                    }}
                />
            </Box>

            {/* Family Member Cards */}
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                    <CircularProgress />
                </Box>
            ) : familyMembers.length === 0 ? (
                <Box sx={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    No family members found. Add your first family member to get started.
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: 2,
                    }}
                >
                    {familyMembers.map((member) => (
                        <FamilyMemberCard
                            key={member.id}
                            id={member.id}
                            name={member.name}
                            relation={member.relation}
                            phone={member.phone}
                            dob={member.dob}
                            gender={member.gender}
                            uhid={member.uhid}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </Box>
            )}
        </div>
    );
}

export default Family_Members_View;
