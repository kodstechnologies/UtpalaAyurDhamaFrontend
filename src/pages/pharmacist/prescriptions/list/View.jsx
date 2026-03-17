import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Box, CircularProgress, Chip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MedicationIcon from "@mui/icons-material/Medication";

import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../../components/card/HeadingCard";
import TableComponent from "../../../../components/table/TableComponent";
import CardBorder from "../../../../components/card/CardBorder";
import Search from "../../../../components/search/Search";
import ExportDataButton from "../../../../components/buttons/ExportDataButton";
import prescriptionService from "../../../../services/prescriptionService";

function List_View_Details() {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    const fetchPrescriptions = useCallback(async () => {
        setIsLoading(true);
        try {
            // const response = await prescriptionService.getPendingInpatientPrescriptions();
            const response = await prescriptionService.getPendingAll_List_patientPrescriptions();
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
        return prescriptions.map((item) => ({
            _id: item._id,
            patientProfileId: item.patient?._id,
            patientId: item.patient?.patientId || "N/A",
            name: item.patient?.user?.name || "Unknown",
            uhid: item.patient?.user?.uhid || "N/A",
            status: item.patient?.admissionStatus || "N/A",
            prescriptions: (item.prescriptions || []).map((med) => ({
                medication: med.medication,
                dosage: med.dosage,
                quantity: med.quantity,
                status: med.status
            }))
        }));
    }, [prescriptions]);

    const filteredRows = useMemo(() => {
        if (!searchText) return groupedPrescriptions;

        const q = searchText.toLowerCase();

        return groupedPrescriptions.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.uhid.toLowerCase().includes(q) ||
                r.patientId.toLowerCase().includes(q) ||
                r.prescriptions.some((p) =>
                    p.medication?.toLowerCase().includes(q)
                )
        );
    }, [searchText, groupedPrescriptions]);
    const formatMedicines = (medicines) => {
        if (!medicines || medicines.length === 0) return "No medicines";
        return medicines.map((med, idx) => (
            <Chip
                key={idx}
                label={`${med.medication}${med.dosage ? ` - ${med.dosage}` : ""}${med.frequency ? ` (${med.frequency})` : ""}`}
                size="small"
                icon={<MedicationIcon fontSize="small" />}
                sx={{
                    m: 0.25,
                    fontSize: "0.75rem",
                    height: "24px",
                }}
            />
        ));
    };

    const columns = [
        { field: "name", header: "Patient Name" },
        { field: "uhid", header: "UHID" },
        { field: "patientId", header: "Patient ID" },
        { field: "status", header: "Admission Status" },
        {
            field: "medicines",
            header: "Medicines Allocated",
            render: (row) => {
                if (!row.prescriptions || row.prescriptions.length === 0) {
                    return (
                        <Typography variant="body2" color="text.secondary">
                            No medicines
                        </Typography>
                    );
                }

                return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxWidth: "500px" }}>
                        {formatMedicines(row.prescriptions)}
                    </Box>
                );
            },
        },
    ];

    const actions = [
        {
            label: "View Prescriptions",
            icon: <VisibilityIcon fontSize="small" />,
            color: "var(--color-primary)",
            onClick: (row) => {
                navigate(`/pharmacist/prescriptions/list/${row._id}?patientId=${row.patientId}`);
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
            <Breadcrumb
                items={[
                    { label: "Home", url: "/" },
                    { label: "Pharmacist", url: "/pharmacist/dashboard" },
                    { label: "List of Prescriptions" },
                ]}
            />

            <HeadingCard
                title="List of Prescriptions"
                subtitle="Manage and dispense medications prescribed for admitted patients with allocated medicines."
            />

            <CardBorder justify="between" align="center" wrap={true} padding="2rem" className="mb-[2rem]">
                <Box sx={{ flex: 1, mr: 1 }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        sx={{ flex: 1 }}
                        placeholder="Search by patient"
                    />
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="inpatient-prescriptions.xlsx"
                    />
                </Box>
            </CardBorder>

            <TableComponent
                columns={columns}
                rows={filteredRows}
                actions={actions}
                showStatusBadge={false}
            />
        </Box>
    );
}

export default List_View_Details;
