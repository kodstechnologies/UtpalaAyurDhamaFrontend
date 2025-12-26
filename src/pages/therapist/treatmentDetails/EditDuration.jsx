import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button } from "@mui/material";

function EditDurationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientName = searchParams.get("patientName") || "";
    const therapyName = searchParams.get("therapyName") || "";
    const currentDuration = searchParams.get("duration") || "";

    const [duration, setDuration] = useState(currentDuration);

    const handleSave = () => {
        // Implement API call here
        console.log("Duration updated:", { patientName, therapyName, duration });
        navigate(-1);
    };

    return (
        <div>
            <HeadingCard
                title={`Duration for ${patientName}`}
                subtitle={`Therapy: ${therapyName}`}
                breadcrumbItems={[
                    { label: "Therapist", url: "/therapist/dashboard" },
                    { label: "Treatment Details", url: "/therapist/treatment-details" },
                    { label: "Edit Duration" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                    maxWidth: "600px",
                    mx: "auto",
                }}
            >
                <Box sx={{ mb: 3 }}>
                    <TextField
                        label="Patient"
                        fullWidth
                        value={patientName}
                        disabled
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Therapy Type"
                        fullWidth
                        value={therapyName}
                        disabled
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Duration/Time"
                        fullWidth
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g., 45 mins"
                        required
                    />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{
                            backgroundColor: "#059669",
                            "&:hover": { backgroundColor: "#047857" },
                        }}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </div>
    );
}

export default EditDurationPage;

