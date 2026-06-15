import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    CircularProgress,
    Chip,
    Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import MedicationIcon from "@mui/icons-material/Medication";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import HeadingCard from "../../../../components/card/HeadingCard";
import TableComponent from "../../../../components/table/TableComponent";
import CardBorder from "../../../../components/card/CardBorder";
import Search from "../../../../components/search/Search";
import ExportDataButton from "../../../../components/buttons/ExportDataButton";
import RedirectButton from "../../../../components/buttons/RedirectButton";
import DeleteConfirmationModal from "../../../../components/modal/DeleteConfirmationModal";
import outsideDispenseService from "../../../../services/outsideDispenseService";

const derivePaymentStatus = (record) => {
    const normalizedStatus = (record?.paymentStatus || "").toLowerCase();
    if (normalizedStatus === "paid") return "Paid";
    if (normalizedStatus === "partially paid") return "Unpaid";
    if (normalizedStatus === "unpaid") return "Unpaid";

    const totalAmount = Number(record?.totalAmount || 0);
    const paidAmount = Number(record?.paidAmount || 0);
    return paidAmount >= totalAmount && totalAmount > 0 ? "Paid" : "Unpaid";
};

function OutsideDispense_View() {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        recordId: null,
        recordName: "",
        isDeleting: false,
    });

    const fetchRecords = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await outsideDispenseService.getAll({ limit: 200 });
            if (response?.success) {
                setRecords(response.data || []);
            } else {
                toast.error(response?.message || "Failed to fetch records");
            }
        } catch (error) {
            toast.error(error?.message || "Failed to fetch records");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const filteredRows = useMemo(() => {
        if (!searchText) return records;
        const q = searchText.toLowerCase();
        return records.filter(
            (r) =>
                (r.name || "").toLowerCase().includes(q) ||
                (r.phone || "").toLowerCase().includes(q) ||
                (r.email || "").toLowerCase().includes(q) ||
                (r.disease || "").toLowerCase().includes(q) ||
                (r.medicines || []).some((m) => m.medicineName?.toLowerCase().includes(q))
        );
    }, [records, searchText]);

    const tableRows = useMemo(
        () =>
            filteredRows.map((record, index) => ({
                _id: record._id,
                slNo: index + 1,
                name: record.name || "N/A",
                phone: record.phone || "N/A",
                email: record.email || "N/A",
                age: record.age ?? "N/A",
                disease: record.disease || "N/A",
                medicines: record.medicines || [],
                totalAmount: record.totalAmount || 0,
                paymentStatus: derivePaymentStatus(record),
                dispensedOn: record.createdAt
                    ? new Date(record.createdAt).toLocaleDateString()
                    : "N/A",
                raw: record,
            })),
        [filteredRows]
    );

    const columns = [
        { field: "name", header: "Name" },
        { field: "phone", header: "Phone" },
        { field: "email", header: "Email" },
        { field: "age", header: "Age" },
        { field: "disease", header: "Disease" },
        {
            field: "medicines",
            header: "Medicines",
            render: (row) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxWidth: 320 }}>
                    {(row.medicines || []).map((med, idx) => (
                        <Chip
                            key={idx}
                            size="small"
                            icon={<MedicationIcon fontSize="small" />}
                            label={`${med.medicineName} - ${med.dispensedQuantity}`}
                        />
                    ))}
                </Box>
            ),
        },
        {
            field: "totalAmount",
            header: "Total Amount",
            render: (row) => `₹${Number(row.totalAmount || 0).toFixed(2)}`,
        },
        {
            field: "paymentStatus",
            header: "Payment Status",
            render: (row) => (
                <Chip
                    label={row.paymentStatus}
                    size="small"
                    color={row.paymentStatus === "Paid" ? "success" : "warning"}
                    sx={{ fontWeight: 600 }}
                />
            ),
        },
        { field: "dispensedOn", header: "Dispensed On" },
    ];

    const handleDeleteClick = useCallback((row) => {
        setDeleteModal({
            isOpen: true,
            recordId: row._id,
            recordName: row.name || "this record",
            isDeleting: false,
        });
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteModal.recordId) return;

        setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

        try {
            const response = await outsideDispenseService.delete(deleteModal.recordId);
            if (response?.success) {
                toast.success("Outside dispense record deleted. Stock restored.");
                setDeleteModal({ isOpen: false, recordId: null, recordName: "", isDeleting: false });
                fetchRecords();
            } else {
                toast.error(response?.message || "Failed to delete record");
                setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
            }
        } catch (error) {
            toast.error(error?.message || "Failed to delete record");
            setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
        }
    }, [deleteModal.recordId, fetchRecords]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteModal({ isOpen: false, recordId: null, recordName: "", isDeleting: false });
    }, []);

    const exportColumns = [
        { field: "slNo", header: "Sl. No." },
        { field: "name", header: "Name" },
        { field: "phone", header: "Phone" },
        { field: "email", header: "Email" },
        { field: "age", header: "Age" },
        { field: "disease", header: "Disease" },
        { field: "totalAmount", header: "Total Amount" },
        { field: "paymentStatus", header: "Payment Status" },
        { field: "dispensedOn", header: "Dispensed On" },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <HeadingCard
                title="Outside Dispense"
                subtitle="Dispense medicines to outside walk-in customers and track records."
                breadcrumbItems={[
                    { label: "Pharmacist", url: "/pharmacist/dashboard" },
                    { label: "Prescriptions", url: "/pharmacist/prescriptions/outside" },
                    { label: "Outside" },
                ]}
            />

            <CardBorder
                justify="between"
                align="center"
                wrap
                padding="2rem"
                style={{ width: "100%", marginBottom: "2rem" }}
            >
                <Search
                    value={searchText}
                    onChange={setSearchText}
                    placeholder="Search by name, phone, email, disease..."
                    style={{ width: 280 }}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                    <ExportDataButton
                        rows={tableRows}
                        columns={exportColumns}
                        fileName="outside-dispense.xlsx"
                    />
                    <RedirectButton
                        text="Add Outside Dispense"
                        link="/pharmacist/prescriptions/outside/add"
                    />
                </Box>
            </CardBorder>

            <TableComponent
                title="Outside Dispense Records"
                subtitle={`${tableRows.length} people received medicine`}
                columns={columns}
                rows={tableRows}
                actions={(row) => {
                    const rowActions = [
                        {
                            label: "View",
                            icon: <VisibilityIcon fontSize="small" />,
                            color: "var(--color-primary)",
                            onClick: (actionRow) =>
                                navigate(`/pharmacist/prescriptions/outside/${actionRow._id}`),
                        },
                    ];

                    if (row.paymentStatus !== "Paid") {
                        rowActions.push({
                            label: "Edit",
                            icon: <EditIcon fontSize="small" />,
                            color: "var(--color-icon-2)",
                            onClick: (actionRow) =>
                                navigate(`/pharmacist/prescriptions/outside/edit/${actionRow._id}`),
                        });
                    }

                    rowActions.push({
                        label: "Delete",
                        icon: <DeleteIcon fontSize="small" />,
                        color: "var(--color-icon-1)",
                        onClick: handleDeleteClick,
                    });

                    return rowActions;
                }}
                showAddButton={false}
                showExportButton={false}
                showView={false}
                showEdit={false}
                showDelete={false}
            />

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Outside Dispense"
                message={`Are you sure you want to delete the dispense record for ${deleteModal.recordName}? Stock will be restored. This action cannot be undone.`}
                isDeleting={deleteModal.isDeleting}
            />
        </Box>
    );
}

export default OutsideDispense_View;
