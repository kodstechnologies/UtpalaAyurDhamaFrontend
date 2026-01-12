import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Tabs, Tab, Chip, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import { toast } from "react-toastify";

// Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HotelIcon from "@mui/icons-material/Hotel";
import SearchIcon from "@mui/icons-material/Search";

function Treatments_View() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all"); // "all", "opd", "ipd"
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: "",
        search: "",
    });
    const [hoveredButton, setHoveredButton] = useState(null);

    // Fetch all patients from API
    const fetchPatients = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch patients
            const patientsResponse = await axios.get(
                getApiUrl("patients"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000, // Get all patients
                    },
                }
            );

            // Fetch therapist sessions
            const therapistSessionsResponse = await axios.get(
                getApiUrl("therapist-sessions"),
                { headers: getAuthHeaders() }
            );

            // Fetch inpatients for nurse allocation
            const inpatientsResponse = await axios.get(
                getApiUrl("inpatients"),
                {
                    headers: getAuthHeaders(),
                    params: {
                        page: 1,
                        limit: 1000,
                    },
                }
            );

            if (patientsResponse.data.success) {
                const patientsData = patientsResponse.data.data?.profiles || patientsResponse.data.data || [];
                const therapistSessions = therapistSessionsResponse.data.success
                    ? (therapistSessionsResponse.data.data || [])
                    : [];
                const inpatients = inpatientsResponse.data.success
                    ? (inpatientsResponse.data.data?.data || inpatientsResponse.data.data || [])
                    : [];

                // Create maps for quick lookup
                const therapistMap = new Map();
                therapistSessions.forEach((session) => {
                    const patientId = session.patient?._id?.toString() || session.patient?.toString();
                    if (patientId && session.therapist?.user?.name) {
                        // If multiple therapists, keep the most recent one
                        if (!therapistMap.has(patientId) ||
                            new Date(session.createdAt) > new Date(therapistMap.get(patientId).createdAt)) {
                            therapistMap.set(patientId, {
                                name: session.therapist.user.name,
                                createdAt: session.createdAt
                            });
                        }
                    }
                });

                const nurseMap = new Map();
                inpatients.forEach((inpatient) => {
                    const patientId = inpatient.patient?._id?.toString() || inpatient.patient?.toString();
                    if (patientId && inpatient.allocatedNurse?.user?.name) {
                        nurseMap.set(patientId, inpatient.allocatedNurse.user.name);
                    }
                });

                // Transform API response to match frontend table structure
                const transformedPatients = patientsData.map((patient) => {
                    const patientId = patient._id?.toString();
                    // Get allocated nurse - check patient profile first (for OPD), then inpatient (for IPD)
                    let allocatedNurseName = "N/A";
                    if (patient.allocatedNurse?.user?.name) {
                        // Patient profile has allocatedNurse (for OPD patients)
                        allocatedNurseName = patient.allocatedNurse.user.name;
                    } else if (patient.inpatient) {
                        // For inpatients, check the inpatient's allocatedNurse
                        allocatedNurseName = nurseMap.get(patientId) || "N/A";
                    }
                    
                    return {
                        _id: patient._id,
                        patientName: patient.user?.name || "Unknown",
                        uhid: patient.user?.uhid || "N/A",
                        phone: patient.user?.phone || "N/A",
                        email: patient.user?.email || "N/A",
                        gender: patient.user?.gender || patient.gender || "N/A",
                        dateOfBirth: patient.user?.dob || patient.dateOfBirth || "N/A",
                        isInpatient: patient.inpatient || false,
                        allocatedNurse: allocatedNurseName,
                        therapist: therapistMap.get(patientId)?.name || "N/A",
                        createdAt: patient.createdAt || new Date(),
                    };
                });

                setPatients(transformedPatients);
            } else {
                toast.error(patientsResponse.data.message || "Failed to fetch patients");
                setPatients([]);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch patients");
            setPatients([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const filteredPatients = useMemo(() => {
        let filtered = patients;

        // Filter by tab (OPD / IPD)
        if (activeTab === "opd") {
            filtered = filtered.filter(p => !p.isInpatient);
        } else if (activeTab === "ipd") {
            filtered = filtered.filter(p => p.isInpatient);
        }

        // Filter by search term (patient name, UHID, phone, email)
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter((patient) => {
                return (
                    patient.patientName?.toLowerCase().includes(searchTerm) ||
                    patient.uhid?.toLowerCase().includes(searchTerm) ||
                    patient.phone?.includes(searchTerm) ||
                    patient.email?.toLowerCase().includes(searchTerm)
                );
            });
        }

        return filtered;
    }, [patients, filters.search, activeTab]);

    const getTypeBadge = (isInpatient) => {
        if (isInpatient) {
            return <Chip label="IPD" size="small" color="error" sx={{ fontWeight: 600 }} />;
        }
        return <Chip label="OPD" size="small" color="primary" sx={{ fontWeight: 600 }} />;
    };

    const handleViewPatient = (patient) => {
        if (patient._id) {
            navigate(`/receptionist/treatments/therapy-details?patientId=${patient._id}`);
        }
    };

    return (
        <div>
            <HeadingCard
                title="Patient List"
                subtitle="View and manage all patients (OPD and IPD)"
                breadcrumbItems={[
                    { label: "Home", url: "/" },
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Treatments" },
                ]}
            />

            <Box
                sx={{
                    mt: 2,
                }}
            >
                <div className="card shadow-sm">
                    <div className="card-body">
                        {/* Tabs */}
                        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                            <Tabs
                                value={activeTab}
                                onChange={(e, newValue) => setActiveTab(newValue)}
                                sx={{
                                    "& .MuiTab-root": {
                                        textTransform: "none",
                                        fontSize: "1rem",
                                        fontWeight: 500,
                                    },
                                }}
                            >
                                <Tab label={`All Patients (${patients.length})`} value="all" />
                                <Tab
                                    label={`OPD (${patients.filter((p) => !p.isInpatient).length})`}
                                    value="opd"
                                />
                                <Tab
                                    label={`IPD (${patients.filter((p) => p.isInpatient).length})`}
                                    value="ipd"
                                />
                            </Tabs>
                        </Box>

                        {/* Search and Filters */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-12">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <SearchIcon />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by patient name, UHID, phone, or email..."
                                        value={filters.search}
                                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                                <CircularProgress />
                            </Box>
                        ) : filteredPatients.length === 0 ? (
                            <Box sx={{ textAlign: "center", padding: "40px", color: "#666" }}>
                                No patients found. {filters.search ? "Try adjusting your search." : ""}
                            </Box>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover" style={{ fontSize: "0.875rem" }}>
                                    <thead>
                                        <tr>
                                            <th style={{ fontSize: "0.875rem" }}>Sl. No.</th>
                                            <th style={{ fontSize: "0.875rem" }}>Patient Name</th>
                                            <th style={{ fontSize: "0.875rem" }}>UHID</th>
                                            <th style={{ fontSize: "0.875rem" }}>Phone</th>
                                            <th style={{ fontSize: "0.875rem" }}>Email</th>
                                            <th style={{ fontSize: "0.875rem" }}>Type</th>
                                            <th style={{ fontSize: "0.875rem" }}>Allocated Nurse</th>
                                            <th style={{ fontSize: "0.875rem" }}>Therapist</th>
                                            <th style={{ fontSize: "0.875rem" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPatients.map((patient, index) => (
                                            <tr key={patient._id}>
                                                <td style={{ fontSize: "0.875rem" }}>{index + 1}</td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <PersonIcon fontSize="small" color="primary" />
                                                        <strong>{patient.patientName}</strong>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.uhid}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.phone}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.email}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{getTypeBadge(patient.isInpatient)}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.allocatedNurse}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.therapist}</td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div style={{ position: "relative", display: "inline-block" }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm"
                                                            onClick={() => handleViewPatient(patient)}
                                                            style={{
                                                                backgroundColor: "#D4A574",
                                                                borderColor: "#D4A574",
                                                                color: "#000",
                                                                borderRadius: "8px",
                                                                padding: "6px 8px",
                                                                fontWeight: 500,
                                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                transition: "all 0.3s ease",
                                                                minWidth: "40px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = "#C8965A";
                                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                                                                setHoveredButton(`view-${patient._id}`);
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = "#D4A574";
                                                                e.currentTarget.style.transform = "translateY(0)";
                                                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                                                setHoveredButton(null);
                                                            }}
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </button>
                                                        {hoveredButton === `view-${patient._id}` && (
                                                            <span
                                                                style={{
                                                                    position: "absolute",
                                                                    bottom: "100%",
                                                                    left: "50%",
                                                                    transform: "translateX(-50%)",
                                                                    marginBottom: "5px",
                                                                    padding: "4px 8px",
                                                                    backgroundColor: "#333",
                                                                    color: "#fff",
                                                                    fontSize: "0.75rem",
                                                                    borderRadius: "4px",
                                                                    whiteSpace: "nowrap",
                                                                    zIndex: 1000,
                                                                    pointerEvents: "none",
                                                                }}
                                                            >
                                                                View Therapy Details
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </Box>
        </div>
    );
}

export default Treatments_View;
