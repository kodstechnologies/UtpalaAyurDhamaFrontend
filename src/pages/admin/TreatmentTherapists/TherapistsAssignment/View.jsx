import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import HeadingCard from '../../../../components/card/HeadingCard';
import TableComponent from '../../../../components/table/TableComponent';
import CardBorder from '../../../../components/card/CardBorder';
import Search from '../../../../components/search/Search';
import ExportDataButton from '../../../../components/buttons/ExportDataButton';
import RedirectButton from '../../../../components/buttons/RedirectButton';
import { Edit, Trash2 } from "lucide-react";
import therapyService from '../../../../services/therapyService';
import { Box, CircularProgress, Typography } from '@mui/material';

function View() {
    const navigate = useNavigate();
    const location = useLocation();
    const [rows, setRows] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Fetch assignments from API
    useEffect(() => {
        fetchAssignments();
    }, []);

    // Refresh data when navigating back from add/edit pages
    useEffect(() => {
        if (location.state?.refresh) {
            fetchAssignments();
        }
    }, [location.state]);

    const fetchAssignments = async () => {
        try {
            setIsLoading(true);
            console.log("Fetching assignments from API...");
            const response = await therapyService.getAllAssignments({ page: 1, limit: 1000 });
            
            console.log("API Response:", response);
            
            if (response && response.success) {
                // Backend returns: { success: true, data: [...assignments], meta: {...} }
                // So response.data is the array directly
                const assignmentsData = Array.isArray(response.data)
                    ? response.data
                    : (response.data?.data || []);
                
                console.log("Assignments Data:", assignmentsData);
                
                // Transform data for table display
                const transformedData = assignmentsData.map((assignment, index) => {
                    // Handle therapist name - from populated therapist.user.name
                    // The backend populates: therapist (TherapistProfile) -> user (User) -> name
                    let therapistName = "N/A";
                    if (assignment.therapist) {
                        if (typeof assignment.therapist === "object") {
                            if (assignment.therapist.user && typeof assignment.therapist.user === "object") {
                                therapistName = assignment.therapist.user.name || "N/A";
                            } else if (assignment.therapist.name) {
                                therapistName = assignment.therapist.name;
                            }
                        } else if (typeof assignment.therapist === "string") {
                            therapistName = "N/A (ID: " + assignment.therapist + ")";
                        }
                    }
                    
                    // Handle therapy name
                    const therapyName = assignment.therapy?.therapyName 
                        || (assignment.therapy && typeof assignment.therapy === "object" ? "N/A" : "N/A");
                    
                    // Handle cost
                    const cost = assignment.cost || 0;
                    
                    // Get IDs for edit/delete operations
                    const therapyId = assignment.therapy?._id || assignment.therapy || null;
                    const therapistId = assignment.therapist?._id || assignment.therapist || null;
                    
                    return {
                        _id: assignment._id,
                        slNo: index + 1,
                        therapyType: therapyName,
                        therapist: therapistName,
                        cost: cost,
                        therapyId: therapyId,
                        therapistId: therapistId,
                    };
                });
                
                console.log("Transformed Data:", transformedData);
                setRows(transformedData);
            } else {
                console.error("API Response Error:", response);
                toast.error(response?.message || "Failed to fetch assignments");
                setRows([]);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
            console.error("Error details:", error.response?.data);
            toast.error(error.response?.data?.message || error.message || "Failed to fetch assignments");
            setRows([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this assignment?")) {
            try {
                const response = await therapyService.deleteAssignment(id);
                if (response.success) {
                    toast.success("Assignment deleted successfully");
                    fetchAssignments(); // Refresh the list
                } else {
                    toast.error(response.message || "Failed to delete assignment");
                }
            } catch (error) {
                console.error("Error deleting assignment:", error);
                toast.error(error.message || "Failed to delete assignment");
            }
        }
    };

    const filteredRows = rows.filter((row) =>
        Object.values(row)
            .join(" ")
            .toLowerCase()
            .includes(searchText.toLowerCase())
    );

    const columns = [
        { field: "slNo", header: "Sl. No." },
        { field: "therapyType", header: "Therapy Type" },
        { field: "therapist", header: "Therapist" },
        { 
            field: "cost", 
            header: "Cost",
            render: (row) => `₹${typeof row.cost === 'number' ? row.cost.toLocaleString('en-IN') : (row.cost || 0)}`
        },
    ];

    const actions = [
        {
            label: "Edit",
            icon: <Edit />,
            color: "var(--color-icon-2)",
            onClick: (row) => navigate(`/admin/treatment-assignments/edit/${row._id}`)
        },
        {
            label: "Delete",
            icon: <Trash2 />,
            color: "var(--color-icon-1)",
            onClick: (row) => handleDelete(row._id),
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
        <div className="space-y-6 p-6">
            <HeadingCard
                title="Therapists Assignment"
                subtitle="Assign trained therapists to treatments and manage their service costs efficiently."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Therapists Assignment" }
                ]}
            />

            {/* SEARCH + EXPORT + CREATE */}
            <CardBorder justify="between" align="center" wrap={true} padding="2rem">
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={setSearchText}
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={rows}
                        columns={columns}
                        fileName="therapy-assignments.xlsx"
                    />
                    <RedirectButton text="Create" link="/admin/treatment-assignments/add" />
                </div>
            </CardBorder>

            {/* TABLE */}
            {rows.length === 0 ? (
                <CardBorder padding="2rem">
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                        <Typography variant="body1" color="text.secondary">
                            No therapist assignments found.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" style={{ marginTop: "0.5rem" }}>
                            Click "Create" to add a new assignment.
                        </Typography>
                    </div>
                </CardBorder>
            ) : (
                <TableComponent
                    columns={columns}
                    rows={filteredRows}
                    actions={actions}
                    showStatusBadge={false}
                />
            )}
        </div>
    );
}

export default View;
