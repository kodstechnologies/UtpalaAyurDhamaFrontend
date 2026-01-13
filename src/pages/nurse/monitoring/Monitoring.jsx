import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import nurseService from "../../../services/nurseService";

function Monitoring() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAllPatients();
    }, []);

    const fetchAllPatients = async () => {
        setIsLoading(true);
        try {
            // Fetch both inpatients and outpatients in parallel
            const [inpatientsResponse, outpatientsResponse] = await Promise.all([
                axios.get(
                    getApiUrl("inpatients?status=Admitted&limit=100"),
                    { headers: getAuthHeaders() }
                ).catch(err => {
                    console.error("Error fetching inpatients:", err);
                    return { data: { success: false, data: [] } };
                }),
                axios.get(
                    getApiUrl("patients/nurse/outpatients"),
                    { headers: getAuthHeaders() }
                ).catch(err => {
                    console.error("Error fetching outpatients:", err);
                    return { data: { success: false, data: [] } };
                })
            ]);

            console.log("Inpatients API Response:", inpatientsResponse.data);
            console.log("Outpatients API Response:", outpatientsResponse.data);

            const allPatients = [];

            // Process inpatients
            if (inpatientsResponse.data.success) {
                const inpatientsData = Array.isArray(inpatientsResponse.data.data) 
                    ? inpatientsResponse.data.data 
                    : (inpatientsResponse.data.data?.data || []);

                const transformedInpatients = inpatientsData.map((inpatient) => {
                    const wardCategory = inpatient.wardCategory || "N/A";
                    const roomNumber = inpatient.roomNumber || "";
                    const bedNumber = inpatient.bedNumber || "N/A";
                    const wardBed = roomNumber 
                        ? `${wardCategory} / Room ${roomNumber} / Bed ${bedNumber}`
                        : `${wardCategory} / Bed ${bedNumber}`;

                    return {
                        _id: inpatient._id,
                        patientId: inpatient.patient?.user?.uhid || inpatient.patient?.patientId || "N/A",
                        patientName: inpatient.patient?.user?.name || "Unknown",
                        wardBed: wardBed,
                        admissionDate: inpatient.admissionDate
                            ? new Date(inpatient.admissionDate).toLocaleDateString("en-GB")
                            : "N/A",
                        doctor: inpatient.doctor?.user?.name || "Not Assigned",
                        patientType: "Inpatient",
                        rawData: inpatient,
                    };
                });
                allPatients.push(...transformedInpatients);
            }

            // Process outpatients
            if (outpatientsResponse.data.success) {
                const outpatientsData = outpatientsResponse.data.data || [];

                const transformedOutpatients = outpatientsData.map((outpatient) => {
                    return {
                        _id: outpatient._id,
                        patientId: outpatient.user?.uhid || outpatient.patientId || "N/A",
                        patientName: outpatient.user?.name || "Unknown",
                        wardBed: "Outpatient",
                        admissionDate: outpatient.createdAt
                            ? new Date(outpatient.createdAt).toLocaleDateString("en-GB")
                            : "N/A",
                        doctor: outpatient.primaryDoctor?.user?.name || "Not Assigned",
                        patientType: "Outpatient",
                        rawData: outpatient,
                    };
                });
                allPatients.push(...transformedOutpatients);
            }
            
            console.log("All patients (inpatients + outpatients):", allPatients);
            setPatients(allPatients);
        } catch (error) {
            console.error("Error fetching patients:", error);
            console.error("Error details:", error.response?.data);
            const errorMessage = error.response?.data?.message || error.message || "Error fetching patients";
            toast.error(errorMessage);
            setPatients([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = (type, row) => {
        const params = new URLSearchParams({
            patientId: row._id || "",
            inpatientId: row._id || "",
            patientName: row.patientName || "",
        });
        if (type === "food") {
            navigate(`/nurse/monitoring/log-food?${params.toString()}`);
        } else if (type === "vitals") {
            navigate(`/nurse/monitoring/update-vitals?${params.toString()}`);
        } else if (type === "view") {
            navigate(`/nurse/monitoring/patient-details?${params.toString()}`);
        }
    };

    const filteredPatients = patients.filter((patient) => {
        const searchLower = searchText.toLowerCase();
        return (
            patient.patientName.toLowerCase().includes(searchLower) ||
            patient.patientId.toLowerCase().includes(searchLower) ||
            patient.doctor.toLowerCase().includes(searchLower) ||
            patient.wardBed.toLowerCase().includes(searchLower)
        );
    });

    const columns = [
        { field: "patientId", header: "Patient ID" },
        { field: "patientName", header: "Patient Name" },
        { field: "patientType", header: "Type" },
        { field: "wardBed", header: "Ward / Bed" },
        { field: "admissionDate", header: "Admission Date" },
        { field: "doctor", header: "Consulting Doctor" },
    ];

    // Actions that should be shown for all patients
    const getActions = (row) => {
        const baseActions = [
            {
                label: "View",
                icon: <VisibilityIcon />,
                color: "var(--color-text-b)",
                variant: "outlined",
                onClick: () => handleOpen("view", row),
            },
        ];

        // Only show food and vitals actions for inpatients
        if (row.patientType === "Inpatient") {
            baseActions.push(
                {
                    label: "Log Food",
                    icon: <RestaurantIcon />,
                    color: "var(--color-icon-3)",
                    variant: "outlined",
                    onClick: () => handleOpen("food", row),
                },
                {
                    label: "Update Vitals",
                    icon: <MonitorHeartIcon />,
                    color: "var(--color-success)",
                    variant: "contained",
                    onClick: () => handleOpen("vitals", row),
                }
            );
        }

        return baseActions;
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <HeadingCard
                title="Patient Monitoring"
                subtitle="Monitor inpatients and outpatients, log food intake, and update vital signs."
                breadcrumbItems={[
                    { label: "Nurse", url: "/nurse/dashboard" },
                    { label: "Monitoring" },
                ]}
            />
            <CardBorder justify="between" align="center" wrap={true} padding="2rem" className="mb-[2rem]">
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ flex: 1 }}
                    />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredPatients}
                        columns={columns}
                        fileName="admitted-patients.xlsx"
                    />
                </div>
            </CardBorder>
            {filteredPatients.length === 0 && !isLoading ? (
                <Box sx={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    minHeight: "300px",
                    p: 4
                }}>
                    <Typography variant="h6" sx={{ color: "var(--color-text-muted)", mb: 1 }}>
                        No patients found
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--color-text-muted)" }}>
                        {searchText ? "Try adjusting your search criteria" : "There are currently no patients allocated to you"}
                    </Typography>
                </Box>
            ) : (
                <TableComponent
                    columns={columns}
                    rows={filteredPatients}
                    actions={getActions}
                    showStatusBadge={false}
                />
            )}
        </>
    );
}

export default Monitoring;
