import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

function AllocateResourcesPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inpatientId = searchParams.get("inpatientId") || "";
    const patientName = searchParams.get("patientName") || "";
    const isReallocation = searchParams.get("reallocate") === "true";

    const [allocationForm, setAllocationForm] = useState({
        allocatedNurse: searchParams.get("allocatedNurse") || "",
        wardCategory: searchParams.get("wardCategory") || "",
        roomNo: searchParams.get("roomNo") || "",
        bedNumber: searchParams.get("bedNumber") || "",
    });

    // Mock data - in real app, fetch from API
    const mockNurses = [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAllocationForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement API call here
        console.log(isReallocation ? "Resources re-allocated:" : "Resources allocated:", allocationForm);
        navigate(-1);
    };

    return (
        <div>
            <HeadingCard
                title={isReallocation ? "Re-allocate Resources" : "Allocate Resources"}
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Inpatients", url: "/receptionist/inpatient" },
                    { label: isReallocation ? "Re-allocate Resources" : "Allocate Resources" },
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
                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                        <FormControl fullWidth required sx={{ mb: 2 }}>
                            <InputLabel>Allocate Nurse *</InputLabel>
                            <Select
                                name="allocatedNurse"
                                value={allocationForm.allocatedNurse}
                                onChange={handleChange}
                                label="Allocate Nurse *"
                            >
                                <MenuItem value="">Select Nurse</MenuItem>
                                {mockNurses.map((n) => (
                                    <MenuItem key={n._id} value={n._id}>
                                        {n.user?.name || n.name} {n.nurseId ? `(${n.nurseId})` : ""}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required sx={{ mb: 2 }}>
                            <InputLabel>Ward Category *</InputLabel>
                            <Select
                                name="wardCategory"
                                value={allocationForm.wardCategory}
                                onChange={handleChange}
                                label="Ward Category *"
                            >
                                <MenuItem value="">Select Ward Category</MenuItem>
                                <MenuItem value="General">General</MenuItem>
                                <MenuItem value="Duplex">Duplex</MenuItem>
                                <MenuItem value="Special">Special</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Room No. *"
                                name="roomNo"
                                fullWidth
                                required
                                value={allocationForm.roomNo}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Bed Number"
                                name="bedNumber"
                                fullWidth
                                value={allocationForm.bedNumber}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: "#8B4513" }}>
                            {isReallocation ? "Re-allocate" : "Allocate"}
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default AllocateResourcesPage;

