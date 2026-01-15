import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import HeadingCard from '../../../../components/card/HeadingCard';
import TableComponent from '../../../../components/table/TableComponent';
import CardBorder from '../../../../components/card/CardBorder';
import Search from '../../../../components/search/Search';
import ExportDataButton from '../../../../components/buttons/ExportDataButton';
import RedirectButton from '../../../../components/buttons/RedirectButton';
import { Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import therapyService from '../../../../services/therapyService';
import { Box, CircularProgress } from '@mui/material';

function TherapyManagement() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Fetch therapies from API
    useEffect(() => {
        fetchTherapies();
    }, []);

    const fetchTherapies = async () => {
        try {
            setIsLoading(true);
            const response = await therapyService.getAllTherapies({ page: 1, limit: 100 });
            if (response.success && response.data) {
                setRows(response.data);
            } else {
                toast.error(response.message || "Failed to fetch therapies");
            }
        } catch (error) {
            console.error("Error fetching therapies:", error);
            toast.error(error.message || "Failed to fetch therapies");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this therapy?")) {
            try {
                const response = await therapyService.deleteTherapy(id);
                if (response.success) {
                    toast.success("Therapy deleted successfully");
                    setRows((prev) => prev.filter((r) => r._id !== id));
                } else {
                    toast.error(response.message || "Failed to delete therapy");
                }
            } catch (error) {
                console.error("Error deleting therapy:", error);
                toast.error(error.message || "Failed to delete therapy");
            }
        }
    };

    const filteredRows = rows.filter((row) =>
        Object.values(row)
            .join(" ")
            .toLowerCase()
            .includes(searchText.toLowerCase())
    );

    // Function to truncate text to 25 words and add "read more" link
    const truncateDescription = (text, maxWords = 25, rowId) => {
        if (!text) return "-";
        
        const words = text.trim().split(/\s+/);
        const shouldTruncate = words.length > maxWords;
        
        if (!shouldTruncate) {
            return text;
        }
        
        const truncatedText = words.slice(0, maxWords).join(" ");
        
        return (
            <span>
                {truncatedText}{" "}
                <span
                    onClick={() => navigate(`/admin/treatment-therapy/view/${rowId}`)}
                    style={{
                        color: "#3b82f6",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.color = "#2563eb";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.color = "#3b82f6";
                    }}
                >
                    ...read more
                </span>
            </span>
        );
    };

    const columns = [
        { field: "therapyName", header: "Therapy Name" },
        { 
            field: "cost", 
            header: "Cost",
            render: (row) => `₹${row.cost || 0}`
        },
        { 
            field: "description", 
            header: "Description",
            render: (row) => truncateDescription(row.description, 25, row._id)
        },
    ];

    const actions = [
        {
            label: "View",
            icon: <Eye />,
            color: "#3b82f6",
            onClick: (row) => navigate(`/admin/treatment-therapy/view/${row._id}`)
        },
        {
            label: "Edit",
            icon: <Edit />,
            color: "var(--color-icon-2)",
            onClick: (row) => navigate(`/admin/treatment-therapy/edit/${row._id}`)
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
                title="Therapy Scheduling & Pricing"
                subtitle="Manage therapy schedules, assign specialists, and maintain transparent pricing."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Therapy Scheduling & Pricing" }
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
                        fileName="therapies.xlsx"
                    />
                    <RedirectButton text="Create" link="/admin/treatment-therapy/add" />
                </div>
            </CardBorder>

            {/* TABLE */}
            <TableComponent
                columns={columns}
                rows={filteredRows}
                actions={actions}
                showStatusBadge={false}  // No status in therapy
            />
        </div>
    );
}

export default TherapyManagement;
