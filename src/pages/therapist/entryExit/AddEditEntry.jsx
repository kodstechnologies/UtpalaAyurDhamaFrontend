import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem } from "@mui/material";

function AddEditEntryPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEdit = searchParams.get("edit") === "true";
    const entryId = searchParams.get("entryId") || "";

    const [formData, setFormData] = useState({
        patientName: searchParams.get("patientName") || "",
        therapistName: searchParams.get("therapistName") || "",
        entryTime: searchParams.get("entryTime") || new Date().toISOString().slice(0, 16),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        // Implement API call here
        console.log(isEdit ? "Entry updated:" : "Entry added:", formData);
        navigate(-1);
    };

    return (
        <div>
            <HeadingCard
                title={isEdit ? "Edit Entry" : "Add New Entry"}
                subtitle="Record patient entry and exit information"
                breadcrumbItems={[
                    { label: "Therapist", url: "/therapist/dashboard" },
                    { label: "Entry & Exit", url: "/therapist/entry-exit" },
                    { label: isEdit ? "Edit Entry" : "Add Entry" },
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
                        label="Patient Name"
                        name="patientName"
                        fullWidth
                        value={formData.patientName}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Therapist Name"
                        name="therapistName"
                        fullWidth
                        value={formData.therapistName}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Entry Time"
                        name="entryTime"
                        type="datetime-local"
                        fullWidth
                        value={formData.entryTime}
                        onChange={handleChange}
                        required
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
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

export default AddEditEntryPage;

