import React, { useState, useEffect, useMemo } from 'react';
import { Stack, Box, Typography, Chip, CircularProgress } from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import HeadingCard from '../../../../components/card/HeadingCard';
import TableComponent from '../../../../components/table/TableComponent';
import DashboardCard from '../../../../components/card/DashboardCard';
import CardBorder from "../../../../components/card/CardBorder";
import Search from "../../../../components/search/Search";
import ExportDataButton from "../../../../components/buttons/ExportDataButton";
import RedirectButton from "../../../../components/buttons/RedirectButton";
import consultationFeeService from '../../../../services/consultationFeeService';

function Consultation_View() {
    const [rows, setRows] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch consultation fees from API
    useEffect(() => {
        fetchConsultationFees();
    }, []);

    const fetchConsultationFees = async () => {
        try {
            setIsLoading(true);
            const response = await consultationFeeService.getAllConsultationFees({ 
                page: 1, 
                limit: 100 
            });
            
            if (response.success && response.data) {
                // Transform data for table display
                const transformedData = response.data.map((fee, index) => ({
                    _id: fee._id,
                    slNo: index + 1,
                    doctor: fee.doctor?.user?.name || "Unknown",
                    doctorId: fee.doctor?._id || fee.doctor,
                    fee: fee.amount || 0,
                    currency: fee.currency || "INR",
                    status: fee.isActive ? "Active" : "Inactive",
                    isActive: fee.isActive,
                    notes: fee.notes || "",
                    updated: fee.updatedAt ? new Date(fee.updatedAt).toLocaleDateString() : "N/A",
                }));
                setRows(transformedData);
            } else {
                toast.error(response.message || "Failed to fetch consultation fees");
            }
        } catch (error) {
            console.error("Error fetching consultation fees:", error);
            toast.error(error.message || "Failed to fetch consultation fees");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this consultation fee?")) {
            try {
                const response = await consultationFeeService.deleteConsultationFee(id);
                if (response.success) {
                    toast.success("Consultation fee deleted successfully");
                    fetchConsultationFees(); // Refresh the list
                } else {
                    toast.error(response.message || "Failed to delete consultation fee");
                }
            } catch (error) {
                console.error("Error deleting consultation fee:", error);
                toast.error(error.message || "Failed to delete consultation fee");
            }
        }
    };

    const handleToggleStatus = async (row) => {
        try {
            const newStatus = !row.isActive;
            const response = await consultationFeeService.updateConsultationFee(row._id, {
                isActive: newStatus
            });
            
            if (response.success) {
                toast.success(`Consultation fee ${newStatus ? "activated" : "deactivated"} successfully`);
                fetchConsultationFees(); // Refresh the list
            } else {
                toast.error(response.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleDuplicate = async (row) => {
        if (window.confirm("Are you sure you want to duplicate this consultation fee?")) {
            try {
                // Create a new fee with same data but different doctor (if needed)
                const payload = {
                    doctor: row.doctorId,
                    amount: row.fee,
                    currency: row.currency,
                    notes: row.notes,
                    isActive: row.isActive,
                };
                
                const response = await consultationFeeService.createConsultationFee(payload);
                if (response.success) {
                    toast.success("Consultation fee duplicated successfully");
                    fetchConsultationFees(); // Refresh the list
                } else {
                    toast.error(response.message || "Failed to duplicate consultation fee");
                }
            } catch (error) {
                console.error("Error duplicating consultation fee:", error);
                toast.error(error.message || "Failed to duplicate consultation fee");
            }
        }
    };

    // Filtered rows based on search
    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const searchMatch = searchText === '' ||
                row.doctor.toLowerCase().includes(searchText.toLowerCase()) ||
                row.fee.toString().includes(searchText) ||
                row.currency.toLowerCase().includes(searchText.toLowerCase()) ||
                row.status.toLowerCase().includes(searchText.toLowerCase()) ||
                row.notes.toLowerCase().includes(searchText.toLowerCase());
            return searchMatch;
        });
    }, [rows, searchText]);

    // Live Stats
    const stats = useMemo(() => {
        const active = rows.filter(r => r.status === "Active").length;
        const inactive = rows.filter(r => r.status === "Inactive").length;
        const highest = rows.reduce((max, r) =>
            r.status === "Active" && r.fee > max ? r.fee : max, 0
        );

        return { active, inactive, highest };
    }, [rows]);

    const columns = [
        { field: "slNo", header: "Sl. No." },
        { field: "doctor", header: "Doctor" },
        { 
            field: "fee", 
            header: "Consultation Fee",
            render: (row) => (
                <Typography variant="body2" fontWeight="medium">
                    {row.currency} {row.fee.toLocaleString("en-IN")}
                </Typography>
            )
        },
        { field: "currency", header: "Currency" },
        { field: "status", header: "Status" },
        { field: "updated", header: "Last Updated" },
    ];

    const actions = [
        {
            icon: <EditIcon fontSize="small" />,
            color: "var(--color-primary)",
            label: "Edit",
            onClick: (row) => {
                navigate(`/admin/consultation/fees/edit/${row._id}`);
            },
        },
        {
            icon: <SwapHorizIcon fontSize="small" />,
            color: "var(--color-info)",
            label: "Duplicate",
            onClick: (row) => {
                handleDuplicate(row);
            },
        },
        {
            icon: (row) => row.status === "Active"
                ? <CancelIcon fontSize="small" />
                : <CheckCircleIcon fontSize="small" />,
            color: (row) => row.status === "Active"
                ? "var(--color-error)"
                : "var(--color-success)",
            label: (row) => row.status === "Active" ? "Deactivate" : "Activate",
            onClick: (row) => {
                handleToggleStatus(row);
            },
        },
        {
            icon: <DeleteIcon fontSize="small" />,
            color: "#f44336",
            label: "Delete",
            onClick: (row) => {
                handleDelete(row._id);
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
        <Box>
            {/* Page Header */}
            <HeadingCard
                title="Consultation Fee Management"
                subtitle="Manage consultation fees, status, and currency for different doctors."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Consultation Fees" }
                ]}
            />

            {/* Stats Cards */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                my={4}
                justifyContent="flex-start"
                sx={{
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
            >
                <DashboardCard
                    title="Active Fees"
                    count={stats.active}
                    icon={CheckCircleIcon}
                />

                <DashboardCard
                    title="Inactive Fees"
                    count={stats.inactive}
                    icon={CancelIcon}
                />

                <DashboardCard
                    title="Highest Rate"
                    count={stats.highest}
                    icon={CurrencyRupeeIcon}
                    overrideContent={
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="h4" fontWeight="bold" color="var(--color-text-dark)">
                                ₹{stats.highest.toLocaleString("en-IN")}
                            </Typography>
                        </Box>
                    }
                />
            </Stack>

            {/* SEARCH + EXPORT + CREATE */}
            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{
                    width: "100%",
                    marginBottom: "2rem",
                }}
            >
                {/* LEFT SIDE — Search */}
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ width: "100%" }}
                    />
                </div>

                {/* RIGHT SIDE — Export + Create Buttons */}
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="consultation-fees.xlsx"
                    />
                    <RedirectButton text="Add Fee" link="/admin/consultation/fees/add" />
                </div>
            </CardBorder>

            {/* Table */}
            <TableComponent
                title="Consultation Fees List"
                subtitle={`${filteredRows.length} fees found`}
                columns={columns}
                rows={filteredRows.map((row) => ({
                    ...row,
                    status: (
                        <Chip
                            label={row.status}
                            color={row.status === "Active" ? "success" : "default"}
                            size="small"
                        />
                    )
                }))}
                actions={actions}
                showView={false}
                showEdit={false}
                showDelete={false}
                showAddButton={false}
                showStatusBadge={false}
            />
        </Box>
    );
}

export default Consultation_View;
