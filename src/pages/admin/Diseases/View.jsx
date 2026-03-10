import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Chip,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PowerSettingsNew as ToggleIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import HeadingCard from "../../../components/card/HeadingCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import TableComponent from "../../../components/table/TableComponent";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import RedirectButton from "../../../components/buttons/RedirectButton";
import diseaseService from "../../../services/diseaseService";

const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

function Diseases_View() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 25,
    total: 0,
  });

  useEffect(() => {
    fetchDiseases();
  }, [pagination.page, pagination.rowsPerPage, statusFilter]);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchDiseases();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, [statusFilter, searchText]);

  const fetchDiseases = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage,
      };

      if (statusFilter !== "All") {
        params.isActive = statusFilter === "Active";
      }

      if (searchText) {
        params.search = searchText;
      }

      const response = await diseaseService.getAllDiseases(params);

      if (response.success && response.data) {
        const transformed = response.data.map((item, index) => ({
          _id: item._id,
          slNo: pagination.page * pagination.rowsPerPage + index + 1,
          name: item.name || "N/A",
          status: item.isActive ? "Active" : "Inactive",
          isActive: item.isActive,
          updated: item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString()
            : "N/A",
        }));

        setRows(transformed);

        if (response.meta) {
          setPagination((prev) => ({
            ...prev,
            total: response.meta.total || 0,
          }));
        }
      } else {
        toast.error(response.message || "Failed to fetch diseases");
      }
    } catch (error) {
      console.error("Error fetching diseases:", error);
      toast.error(error.message || "Failed to fetch diseases");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this disease?")) {
      try {
        const response = await diseaseService.deleteDisease(id);
        if (response.success) {
          toast.success("Disease deleted successfully");
          fetchDiseases();
        } else {
          toast.error(response.message || "Failed to delete disease");
        }
      } catch (error) {
        console.error("Error deleting disease:", error);
        toast.error(error.message || "Failed to delete disease");
      }
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const newStatus = !row.isActive;
      const response = await diseaseService.updateDiseaseStatus(
        row._id,
        newStatus
      );

      if (response.success) {
        toast.success(
          `Disease ${newStatus ? "activated" : "deactivated"} successfully`
        );
        fetchDiseases();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const columns = [
    { field: "slNo", header: "Sl. No." },
    { field: "name", header: "Disease Name" },
    { field: "status", header: "Status" },
    { field: "updated", header: "Last Updated" },
  ];

  const actions = [
    {
      label: "Details",
      icon: <VisibilityIcon fontSize="small" />,
      color: "var(--color-primary)",
      onClick: (row) => navigate(`/admin/diseases/view/${row._id}`),
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      color: "var(--color-primary)",
      onClick: (row) => navigate(`/admin/diseases/edit/${row._id}`),
    },
    {
      icon: <ToggleIcon fontSize="small" />,
      label: "Toggle Status",
      color: "default",
      onClick: (row) => handleToggleStatus(row),
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      color: "#f44336",
      onClick: (row) => handleDelete(row._id),
    },
  ];

  const tableRows = rows.map((row) => ({
    ...row,
    status: (
      <Chip
        label={row.status}
        color={row.status === "Active" ? "success" : "default"}
        size="small"
      />
    ),
  }));

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <HeadingCard
        title="Diseases"
        subtitle="Manage reference list of diseases for clinical and billing workflows."
        breadcrumbItems={[
          { label: "Admin", url: "/admin/dashboard" },
          { label: "Diseases" },
        ]}
      />

      <CardBorder
        justify="between"
        align="center"
        wrap={true}
        padding="2rem"
        style={{ width: "100%", marginBottom: "2rem" }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "1rem",
            flex: 1,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Search
            value={searchText}
            onChange={(val) => setSearchText(val)}
            style={{ width: "220px" }}
          />

          <TextField
            select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 180 }}
            variant="outlined"
            size="small"
            label="Status"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: "flex", gap: "1rem" }}>
          <ExportDataButton
            rows={rows}
            columns={columns}
            fileName="diseases.xlsx"
          />
          <RedirectButton text="Create" link="/admin/diseases/add" />
        </Box>
      </CardBorder>

      <TableComponent
        columns={columns}
        rows={tableRows}
        actions={actions}
        showStatusBadge={false}
        serverSidePagination={true}
        totalCount={pagination.total}
        page={pagination.page}
        rowsPerPage={pagination.rowsPerPage}
        onPageChange={(newPage) =>
          setPagination((prev) => ({ ...prev, page: newPage }))
        }
        onRowsPerPageChange={(newRowsPerPage) =>
          setPagination((prev) => ({
            ...prev,
            rowsPerPage: newRowsPerPage,
            page: 0,
          }))
        }
      />
    </Box>
  );
}

export default Diseases_View;

