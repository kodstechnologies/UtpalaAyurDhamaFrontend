import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";

import HeadingCard from "../../../components/card/HeadingCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import TableComponent from "../../../components/table/TableComponent";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function Discharge() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPatientsForDischarge();
    }, []);

    const fetchPatientsForDischarge = async () => {
        setIsLoading(true);
        try {
            // Fetch admitted patients (those who can be discharged)
            const response = await axios.get(
                getApiUrl("inpatients?status=Admitted&limit=100"),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                const transformedData = (response.data.data || []).map((inpatient) => ({
                    _id: inpatient._id,
                    patientId: inpatient.patient?.user?.uhid || inpatient.patient?.patientId || "N/A",
                    patientName: inpatient.patient?.user?.name || "Unknown",
                    wardBed: `${inpatient.wardType || "N/A"} / ${inpatient.bedNumber || "N/A"}`,
                    admissionDate: inpatient.admissionDate
                        ? new Date(inpatient.admissionDate).toLocaleDateString("en-GB")
                        : "N/A",
                    doctor: inpatient.doctor?.user?.name || "Not Assigned",
                    rawData: inpatient,
                }));
                setPatients(transformedData);
            } else {
                toast.error(response.data.message || "Failed to fetch patients");
            }
        } catch (error) {
            console.error("Error fetching patients for discharge:", error);
            toast.error(error.response?.data?.message || "Error fetching patients");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = (row) => {
        const params = new URLSearchParams({
            inpatientId: row._id || "",
            patientId: row.patientId || "",
            patientName: row.patientName || "",
        });
        navigate(`/nurse/discharge-preparation/prepare?${params.toString()}`);
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
        { field: "wardBed", header: "Ward / Bed" },
        { field: "admissionDate", header: "Admission Date" },
        { field: "doctor", header: "Consulting Doctor" },
    ];

    const actions = [
        {
            label: "Prepare Discharge",
            icon: <AssignmentTurnedInIcon />,
            color: "var(--color-success)",
            variant: "contained",
            onClick: handleOpen,
        },
    ];

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
                title="Discharge Preparation"
                subtitle="Prepare patient discharge summaries, instructions, and follow-up details."
                breadcrumbItems={[
                    { label: "Nurse", url: "/nurse/dashboard" },
                    { label: "Discharge Preparation" },
                ]}
            />

            {/* Search & Export */}
            <CardBorder
                justify="between"
                align="center"
                wrap
                padding="2rem"
                className="mb-[2rem]"
            >
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={setSearchText}
                    />
                </div>

                <ExportDataButton
                    rows={filteredPatients}
                    columns={columns}
                    fileName="discharge-patients.xlsx"
                />
            </CardBorder>

            {/* Table */}
            <TableComponent
                columns={columns}
                rows={filteredPatients}
                actions={actions}
            />
        </>
    );
}

export default Discharge;
