import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import HeadingCard from "../../../components/card/HeadingCard";
import SubmitButton from "../../../components/buttons/SubmitButton";
import CancelButton from "../../../components/buttons/CancelButton";
import diseaseService from "../../../services/diseaseService";

function Diseases_Add() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Disease name is required";
    } else if (name.trim().length > 150) {
      newErrors.name = "Disease name must be 150 characters or less";
    }

    if (description && description.length > 1000) {
      newErrors.description = "Description must be 1000 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
      };

      const response = await diseaseService.createDisease(payload);

      if (response.success) {
        toast.success("Disease created successfully");
        navigate("/admin/diseases/view", { state: { refresh: true } });
      } else {
        toast.error(response.message || "Failed to create disease");
      }
    } catch (error) {
      console.error("Error creating disease:", error);
      const errorMessage =
        error.message || error.response?.data?.message || "Failed to create disease";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <HeadingCard
        title="Add Disease"
        subtitle="Create a new disease record for reference."
        breadcrumbItems={[
          { label: "Admin", url: "/admin/dashboard" },
          { label: "Diseases", url: "/admin/diseases/view" },
          { label: "Add" },
        ]}
      />

      <Box
        sx={{
          backgroundColor: "var(--color-bg-card)",
          borderRadius: 4,
          p: 4,
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-medium)",
          mt: 3,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="semibold" sx={{ mb: 1 }}>
            Disease Name <span style={{ color: "red" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter disease name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="semibold" sx={{ mb: 1 }}>
            Description
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            error={!!errors.description}
            helperText={
              errors.description || `${description.length}/1000 characters`
            }
            inputProps={{ maxLength: 1000 }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 3,
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <CancelButton onClick={() => navigate("/admin/diseases/view")} />

          <SubmitButton
            text={isSubmitting ? "Adding..." : "Add Disease"}
            onClick={handleSubmit}
            disabled={isSubmitting}
          />
        </Box>

        <Typography
          variant="caption"
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "text.secondary",
          }}
        >
          <span style={{ color: "red" }}>●</span>
          Required fields are marked with an asterisk (*). All changes will be
          saved upon submission.
        </Typography>
      </Box>
    </Box>
  );
}

export default Diseases_Add;

