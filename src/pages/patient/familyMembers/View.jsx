import React from "react";
import HeadingCard from "../../../components/card/HeadingCard";
import FamilyMemberCard from "../../../components/card/patientCard/FamilyMammberCard";
import RedirectButton from "../../../components/buttons/RedirectButton";

import { Box, Typography } from "@mui/material";

function Family_Members_View() {

    // Example Family Member Data (replace with API later)
    const familyMembers = [
        {
            id: 1,
            name: "Riya",
            relation: "Daughter",
            phone: "1234567890",
            dob: "2022-02-23",
            gender: "Female",
        },
        {
            id: 2,
            name: "John",
            relation: "Father",
            phone: "9876543210",
            dob: "1975-10-12",
            gender: "Male",
        },
        {
            id: 3,
            name: "Sara",
            relation: "Mother",
            phone: "8975463210",
            dob: "1980-03-18",
            gender: "Female",
        },
    ];

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
                        name={member.name}
                        relation={member.relation}
                        phone={member.phone}
                        dob={member.dob}
                        gender={member.gender}
                    />
                ))}
            </Box>
        </div>
    );
}

export default Family_Members_View;
