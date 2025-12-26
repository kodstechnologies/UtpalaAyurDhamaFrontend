import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, Typography, Button } from "@mui/material";

function DeleteConfirmationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientName = searchParams.get("patientName") || "";
    const therapyName = searchParams.get("therapyName") || "";
    const recordId = searchParams.get("recordId") || "";

    const handleDelete = () => {
        // Implement API call here
        console.log("Record deleted:", recordId);
        navigate(-1);
    };

    return (
        <div>
            <HeadingCard
                title="Confirm Delete"
                subtitle="Are you sure you want to delete this treatment detail?"
                breadcrumbItems={[
                    { label: "Therapist", url: "/therapist/dashboard" },
                    { label: "Treatment Details", url: "/therapist/treatment-details" },
                    { label: "Delete Confirmation" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                    maxWidth: "500px",
                    mx: "auto",
                }}
            >
                <Typography sx={{ mb: 2 }}>
                    Are you sure you want to delete this treatment detail?
                </Typography>
                {patientName && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: "var(--color-bg-card-b)", borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Patient:</strong> {patientName}
                        </Typography>
                        {therapyName && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>Therapy:</strong> {therapyName}
                            </Typography>
                        )}
                    </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>
        </div>
    );
}

export default DeleteConfirmationPage;

