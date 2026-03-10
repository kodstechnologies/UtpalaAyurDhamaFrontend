import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Typography, CircularProgress, Chip, Divider } from "@mui/material";
import HeadingCard from "../../../components/card/HeadingCard";
import CancelButton from "../../../components/buttons/CancelButton";
import diseaseService from "../../../services/diseaseService";

function Diseases_Details() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [disease, setDisease] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        toast.error("Disease ID is missing");
        navigate("/admin/diseases/view");
        return;
      }

      try {
        setIsLoading(true);
        const response = await diseaseService.getDiseaseById(id);

        if (response.success && response.data) {
          setDisease(response.data);
        } else {
          toast.error(response.message || "Failed to fetch disease details");
          navigate("/admin/diseases/view");
        }
      } catch (error) {
        console.error("Error fetching disease details:", error);
        toast.error(error.message || "Failed to fetch disease details");
        navigate("/admin/diseases/view");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

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

  if (!disease) {
    return null;
  }

  const createdDate = disease.createdAt
    ? new Date(disease.createdAt).toLocaleString()
    : "N/A";
  const updatedDate = disease.updatedAt
    ? new Date(disease.updatedAt).toLocaleString()
    : "N/A";

  return (
    <Box sx={{ p: 3 }}>
      <HeadingCard
        title="Disease Details"
        subtitle="View full information for a single disease."
        breadcrumbItems={[
          { label: "Admin", url: "/admin/dashboard" },
          { label: "Diseases", url: "/admin/diseases/view" },
          { label: "Details" },
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {disease.name}
          </Typography>

          <Chip
            label={disease.isActive ? "Active" : "Inactive"}
            color={disease.isActive ? "success" : "default"}
            size="small"
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}
            >
              {disease.description || "No description provided."}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">{createdDate}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body1">{updatedDate}</Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 4,
            pt: 2,
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <CancelButton onClick={() => navigate("/admin/diseases/view")} />
        </Box>
      </Box>
    </Box>
  );
}

export default Diseases_Details;

