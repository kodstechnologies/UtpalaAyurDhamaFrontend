import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";

function BatchLogViewPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const itemId = searchParams.get("itemId") || "";
    const itemName = searchParams.get("itemName") || "";

    // In a real app, fetch batch log from API based on itemId
    const batchLog = {
        batchNo: searchParams.get("batchNo") || "BCH-2025-001",
        expiryDate: searchParams.get("expiryDate") || "31 Dec 2026",
        supplier: searchParams.get("supplier") || "MedLife Pharmaceuticals",
        receivedOn: searchParams.get("receivedOn") || "05 Jan 2025",
        quantityReceived: searchParams.get("quantityReceived") || "500 units",
    };

    return (
        <div>
            <HeadingCard
                title={`Batch Log${itemName ? ` - ${itemName}` : ""}`}
                subtitle="View batch information for this item"
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Inventory", url: "/admin/inventory" },
                    { label: "Batch Log" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                    maxWidth: "600px",
                    mx: "auto",
                }}
            >
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Batch information for this item:
                </Typography>
                
                <Card sx={{ bgcolor: "#f5f5f5", p: 3, borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Batch No:</strong> {batchLog.batchNo}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Expiry Date:</strong> {batchLog.expiryDate}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Supplier:</strong> {batchLog.supplier}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Received On:</strong> {batchLog.receivedOn}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Quantity Received:</strong> {batchLog.quantityReceived}
                    </Typography>
                </Card>

                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Close
                    </Button>
                </Box>
            </Box>
        </div>
    );
}

export default BatchLogViewPage;

