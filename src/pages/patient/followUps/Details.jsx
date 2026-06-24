import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

const isImageAttachment = (file) =>
    file?.fileType?.startsWith("image/") ||
    /\.(jpe?g|png|gif|webp)$/i.test(file?.originalFileName || "");

const isPdfAttachment = (file) =>
    file?.fileType === "application/pdf" ||
    /\.pdf$/i.test(file?.originalFileName || "");

const formatUploadedAt = (date) => {
    if (!date) return "Upload time not available";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Upload time not available";
    return parsed.toLocaleString();
};

function FollowUpAttachmentPreview({ file, uploadedAt }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary">
                {file.originalFileName || file.name}
                {uploadedAt ? ` • Uploaded: ${formatUploadedAt(uploadedAt)}` : ""}
            </Typography>
            <Box sx={{ mt: 1 }}>
                {file.viewUrl && isImageAttachment(file) ? (
                    <Box
                        component="img"
                        src={file.viewUrl}
                        alt={file.originalFileName || file.name}
                        sx={{
                            width: "100%",
                            maxHeight: "70vh",
                            objectFit: "contain",
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "grey.50",
                        }}
                    />
                ) : file.viewUrl && isPdfAttachment(file) ? (
                    <Box
                        component="iframe"
                        src={file.viewUrl}
                        title={file.originalFileName || file.name}
                        sx={{
                            width: "100%",
                            height: 480,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                        }}
                    />
                ) : file.viewUrl ? (
                    <Button
                        variant="outlined"
                        href={file.viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<AttachFileIcon />}
                    >
                        Open {file.originalFileName || file.name}
                    </Button>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Preview unavailable
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

function FollowUpDetails() {
    const navigate = useNavigate();
    const { examinationId, followUpId } = useParams();
    const user = useSelector((state) => state.auth.user);
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState(null);

    const fetchDetail = useCallback(async () => {
        const userId = user?._id || JSON.parse(localStorage.getItem("user") || "{}")?._id;

        if (!userId) {
            toast.error("User information not found. Please log in again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                getApiUrl(`examinations/followups/by-user/${userId}/${examinationId}/${followUpId}/detail`),
                { headers: getAuthHeaders() }
            );
            if (response.data?.success) {
                setDetail(response.data.data || null);
            } else {
                toast.error(response.data?.message || "Failed to load follow-up details.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load follow-up details.");
        } finally {
            setLoading(false);
        }
    }, [user, examinationId, followUpId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return (
        <Box>
            <HeadingCard
                title="Follow-up Details"
                subtitle="View your follow-up notes and uploaded files."
                breadcrumbItems={[
                    { label: "Patient", url: "/patient/dashboard" },
                    { label: "My Follow Ups", url: "/patient/follow-ups" },
                    { label: "Follow-up Details" },
                ]}
            />

            <Box sx={{ mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/patient/follow-ups")}
                >
                    Back to Follow-ups
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : !detail ? (
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                        Follow-up details were not found.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                        {detail.patientName || "Patient"}
                        {detail.date ? ` • ${new Date(detail.date).toLocaleDateString()}` : ""}
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                            Progress Notes
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                            {detail.progressNote?.trim() || "No progress notes added."}
                        </Typography>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                            Uploaded Files
                        </Typography>
                        {Array.isArray(detail.attachments) && detail.attachments.length > 0 ? (
                            <Stack spacing={2}>
                                {detail.attachments.map((file) => (
                                    <FollowUpAttachmentPreview
                                        key={file._id}
                                        file={file}
                                        uploadedAt={file.uploadedAt}
                                    />
                                ))}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No files uploaded.
                            </Typography>
                        )}
                    </Paper>
                </Stack>
            )}
        </Box>
    );
}

export default FollowUpDetails;
