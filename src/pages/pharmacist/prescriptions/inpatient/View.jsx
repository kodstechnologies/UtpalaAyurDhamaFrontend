import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";

import HeadingCard from "../../../../components/card/HeadingCard";
import TableComponent from "../../../../components/table/TableComponent";
import CardBorder from "../../../../components/card/CardBorder";
import Search from "../../../../components/search/Search";
import ExportDataButton from "../../../../components/buttons/ExportDataButton";
import prescriptionService from "../../../../services/prescriptionService";
import { getRemainingPrescriptionQuantity } from "../../../../utils/prescriptionQuantity";

function Inpatient_View_Details() {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    const fetchPrescriptions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await prescriptionService.getPendingInpatientPrescriptions();
            if (response && response.success) {
                setPrescriptions(response.data || []);
            } else {
                toast.error(response?.message || "Failed to fetch prescriptions");
                setPrescriptions([]);
            }
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch prescriptions";
            toast.error(errorMessage);
            setPrescriptions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrescriptions();
    }, [fetchPrescriptions]);

    // Group prescriptions by examination (patient + examination combination)
    const groupedPrescriptions = useMemo(() => {
        const grouped = {};
        prescriptions.forEach((prescription) => {
            const examinationId = prescription.examination?._id || prescription.examination;
            const patientId = prescription.patient?._id || prescription.patient;
            const key = `${examinationId}_${patientId}`;

            if (!grouped[key]) {
                const inpatient = prescription.examination?.inpatient;
                grouped[key] = {
                    _id: key,
                    examinationId: examinationId,
                    patientId: patientId,
                    name: prescription.patient?.user?.name || "Unknown",
                    age: prescription.patientAge || 0,
                    doctor: prescription.doctor?.user?.name || "Unknown",
                    diagnosis: prescription.examination?.complaints || "N/A",
                    uhid: prescription.patient?.user?.uhid || prescription.patient?.uhid || "N/A",
                    roomNumber: inpatient?.roomNumber || "N/A",
                    wardCategory: inpatient?.wardCategory || "N/A",
                    prescriptions: [],
                };
            }
            grouped[key].prescriptions.push({
                medication: prescription.medication,
                dosage: prescription.dosage,
                frequency: prescription.frequency,
                duration: prescription.duration,
                quantity: prescription.quantity,
                dispensedQuantity: prescription.dispensedQuantity || 0,
                medicineType: prescription.medicineType,
                notes: prescription.notes,
            });
        });
        return Object.values(grouped).filter((group) =>
            group.prescriptions.some((med) => {
                const remaining = getRemainingPrescriptionQuantity({
                    quantity: med.quantity,
                    dosage: med.dosage,
                    dispensedQuantity: med.dispensedQuantity,
                });
                return remaining > 0;
            })
        );
    }, [prescriptions]);

    const filteredRows = useMemo(() => {
        if (!searchText) return groupedPrescriptions;
        const q = searchText.toLowerCase();
        return groupedPrescriptions.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.doctor.toLowerCase().includes(q) ||
                r.diagnosis.toLowerCase().includes(q) ||
                r.roomNumber?.toLowerCase().includes(q) ||
                r.prescriptions.some((p) => p.medication?.toLowerCase().includes(q))
        );
    }, [searchText, groupedPrescriptions]);

    const columns = [
        { field: "name", header: "Patient Name" },
        { field: "age", header: "Age" },
        { field: "roomNumber", header: "Room No." },
        { field: "wardCategory", header: "Ward" },
        { field: "doctor", header: "Doctor" },
        { field: "diagnosis", header: "Diagnosis" },
    ];

    const actions = [
        {
            label: "View Details",
            icon: <VisibilityIcon fontSize="small" />,
            onClick: (row) => {
                navigate(`/pharmacist/prescriptions/inpatient/${row.examinationId}?patientId=${row.patientId}`);
            },
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
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Inpatient Prescriptions"
                subtitle="Manage and dispense medications prescribed for admitted patients with allocated medicines."
            />

            <CardBorder className="mb-[2rem]" justify="between" align="center" wrap={true} padding="2rem">
                <Box sx={{ flex: 1, mr: 1 }}>
                    <Search
                        value={searchText}
                        onChange={setSearchText}
                        placeholder="Search by patient, doctor, room, diagnosis, or medicine..."
                    />
                </Box>
                <ExportDataButton
                    rows={filteredRows}
                    columns={columns}
                    fileName="inpatient-prescriptions.xlsx"
                />
            </CardBorder>

            <TableComponent
                columns={columns}
                rows={filteredRows}
                actions={actions}
            />
        </Box>
    );
}

export default Inpatient_View_Details;