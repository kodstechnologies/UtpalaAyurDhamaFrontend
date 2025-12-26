import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

function AdmitPatientPage() {
    const navigate = useNavigate();
    const [patientSearchTerm, setPatientSearchTerm] = useState("");
    const [patientSearchResults, setPatientSearchResults] = useState([]);
    const [selectedPatientForAdmission, setSelectedPatientForAdmission] = useState(null);

    const [admitForm, setAdmitForm] = useState({
        patientId: "",
        doctorId: "",
        allocatedNurse: "",
        wardCategory: "",
        roomNumber: "",
        bedNumber: "",
        admissionDate: new Date().toISOString().split("T")[0],
        reason: "",
    });

    // Mock data - in real app, fetch from API
    const mockDoctors = [];
    const mockNurses = [];

    const handlePatientSearch = (value) => {
        setPatientSearchTerm(value);
        // In real app, search patients via API
        setPatientSearchResults([]);
    };

    const handleSelectPatientForAdmission = (patient) => {
        if (!patient.inpatient) {
            setSelectedPatientForAdmission(patient);
            setAdmitForm((prev) => ({ ...prev, patientId: patient._id || "" }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement API call here
        console.log("Patient admitted:", { ...admitForm, patient: selectedPatientForAdmission });
        navigate(-1);
    };

    return (
        <div>
            <HeadingCard
                title="Admit Patient"
                subtitle="Admit a new patient to the hospital"
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Inpatients", url: "/receptionist/inpatient" },
                    { label: "Admit Patient" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                    maxWidth: "800px",
                    mx: "auto",
                }}
            >
                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            label="Search Patient *"
                            fullWidth
                            value={patientSearchTerm}
                            onChange={(e) => handlePatientSearch(e.target.value)}
                            placeholder="Type patient name to search..."
                            sx={{ mb: 2 }}
                        />
                        {patientSearchResults.length > 0 && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    zIndex: 1000,
                                    maxHeight: 200,
                                    overflowY: "auto",
                                    bgcolor: "white",
                                    border: 1,
                                    borderColor: "divider",
                                    borderRadius: 1,
                                    mt: 0.5,
                                }}
                            >
                                {patientSearchResults.map((patient) => (
                                    <Box
                                        key={patient._id}
                                        onClick={() => handleSelectPatientForAdmission(patient)}
                                        sx={{
                                            p: 2,
                                            borderBottom: 1,
                                            borderColor: "divider",
                                            cursor: patient.inpatient ? "not-allowed" : "pointer",
                                            opacity: patient.inpatient ? 0.5 : 1,
                                            bgcolor: patient.inpatient ? "#f8f9fa" : "white",
                                        }}
                                    >
                                        <Box fontWeight={600}>{patient.name}</Box>
                                        <Box variant="caption" color="text.secondary">
                                            {patient.email} • {patient.phone}
                                        </Box>
                                        {patient.inpatient && (
                                            <Box variant="caption" color="error">
                                                Already admitted
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        )}

                        <TextField
                            label="Selected Patient"
                            fullWidth
                            value={
                                selectedPatientForAdmission
                                    ? `${selectedPatientForAdmission.name} (${selectedPatientForAdmission.patientId})`
                                    : ""
                            }
                            placeholder="Select a patient from search results"
                            InputProps={{ readOnly: true }}
                            sx={{ mb: 2 }}
                        />

                        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                            <FormControl fullWidth required>
                                <InputLabel>Assign Doctor *</InputLabel>
                                <Select
                                    value={admitForm.doctorId}
                                    onChange={(e) => setAdmitForm({ ...admitForm, doctorId: e.target.value })}
                                    label="Assign Doctor *"
                                >
                                    <MenuItem value="">Select Doctor</MenuItem>
                                    {mockDoctors.map((d) => (
                                        <MenuItem key={d._id} value={d._id}>
                                            {d.user?.name || d.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth required>
                                <InputLabel>Allocate Nurse *</InputLabel>
                                <Select
                                    value={admitForm.allocatedNurse}
                                    onChange={(e) => setAdmitForm({ ...admitForm, allocatedNurse: e.target.value })}
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
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                            <FormControl fullWidth required>
                                <InputLabel>Ward Category *</InputLabel>
                                <Select
                                    value={admitForm.wardCategory}
                                    onChange={(e) => setAdmitForm({ ...admitForm, wardCategory: e.target.value })}
                                    label="Ward Category *"
                                >
                                    <MenuItem value="">Select Ward Category</MenuItem>
                                    <MenuItem value="General">General</MenuItem>
                                    <MenuItem value="Duplex">Duplex</MenuItem>
                                    <MenuItem value="Special">Special</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Room No. *"
                                fullWidth
                                required
                                value={admitForm.roomNumber}
                                onChange={(e) => setAdmitForm({ ...admitForm, roomNumber: e.target.value })}
                                placeholder="Enter room number"
                            />
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                            <TextField
                                label="Bed No."
                                fullWidth
                                value={admitForm.bedNumber}
                                onChange={(e) => setAdmitForm({ ...admitForm, bedNumber: e.target.value })}
                                placeholder="Optional"
                            />

                            <TextField
                                label="Admission Date *"
                                type="date"
                                fullWidth
                                required
                                value={admitForm.admissionDate}
                                onChange={(e) => setAdmitForm({ ...admitForm, admissionDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>

                        <TextField
                            label="Reason for Admission"
                            fullWidth
                            multiline
                            rows={3}
                            value={admitForm.reason}
                            onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })}
                            placeholder="Enter reason for admission"
                        />
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: "#8B4513" }}>
                            Admit Patient
                        </Button>
                    </Box>
                </form>
            </Box>
        </div>
    );
}

export default AdmitPatientPage;

