import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Chip,
    Button,
    Stack,
    CircularProgress,
    Container,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
    LocalPharmacy,
    Person,
    CalendarToday,
    Medication,
    CheckCircle,
    ArrowBack,
    Email,
    Phone,
    Print,
    Download,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../../components/card/HeadingCard";
import outsideDispenseService from "../../../../services/outsideDispenseService";
import { handleOutsidePrint } from "../components/OutsideDispenseGenerator";
import { handleOutsideDownload } from "../components/OutsideDispenseDownload";

const LIST_PATH = "/pharmacist/prescriptions/outside";

const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

function DetailCard({ label, value, icon }) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: "background.default",
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: "100%",
            }}
        >
            <Typography variant="caption" color="text.secondary" display="block" mb={0.3} sx={{ fontSize: "0.7rem" }}>
                {icon && (
                    <Box component="span" sx={{ mr: 0.5, verticalAlign: "middle", fontSize: "0.9rem" }}>
                        {icon}
                    </Box>
                )}
                {label}
            </Typography>
            <Typography fontWeight={600} fontSize="0.875rem" sx={{ wordBreak: "break-word" }}>
                {value || "N/A"}
            </Typography>
        </Box>
    );
}

function OutsideDispense_Details() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [record, setRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecord = async () => {
            setIsLoading(true);
            try {
                const response = await outsideDispenseService.getById(id);
                if (response?.success) {
                    setRecord(response.data);
                } else {
                    toast.error(response?.message || "Failed to load record");
                    navigate(LIST_PATH);
                }
            } catch (error) {
                toast.error(error?.message || "Failed to load record");
                navigate(LIST_PATH);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchRecord();
    }, [id, navigate]);

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!record) return null;

    const customerName = record.name || "Walk-in Customer";
    const medicines = record.medicines || [];
    const totalAmount = Number(record.totalAmount || 0);

    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist/dashboard" },
        { label: "Outside Dispense", url: LIST_PATH },
        { label: customerName },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Breadcrumb items={breadcrumbItems} />
            </Box>

            <Box sx={{ mb: 4 }}>
                <HeadingCard
                    title={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                            <LocalPharmacy sx={{ color: theme.palette.primary.main }} />
                            <span>Outside Dispense</span>
                            <Chip
                                label="Dispensed"
                                color="success"
                                size="small"
                                icon={<CheckCircle />}
                            />
                        </Box>
                    }
                    subtitle="View outside walk-in customer dispense details."
                    action={
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Button
                                variant="outlined"
                                startIcon={<Print />}
                                onClick={() => handleOutsidePrint(record)}
                                sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                            >
                                Print
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() => handleOutsideDownload(record)}
                                sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                            >
                                Download
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBack />}
                                onClick={() => navigate(LIST_PATH)}
                                sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                            >
                                Back to List
                            </Button>
                        </Stack>
                    }
                />
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Person fontSize="small" />
                                Customer Information
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Full Name" value={customerName} icon={<Person fontSize="small" />} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Phone" value={record.phone} icon={<Phone fontSize="small" />} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Email" value={record.email} icon={<Email fontSize="small" />} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard label="Age" value={record.age ?? "N/A"} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard
                                        label="Dispensed On"
                                        value={formatDate(record.createdAt)}
                                        icon={<CalendarToday fontSize="small" />}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DetailCard
                                        label="Dispensed By"
                                        value={record.dispensedBy?.name || "N/A"}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1,
                                            backgroundColor: alpha(theme.palette.warning.main, 0.05),
                                            borderLeft: `3px solid ${theme.palette.warning.main}`,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                            Disease
                                        </Typography>
                                        <Typography fontWeight={600} fontSize="0.95rem">
                                            {record.disease || "N/A"}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                                <Typography variant="h6" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Medication fontSize="small" />
                                    Dispensed Medicines
                                </Typography>
                                <Chip
                                    label={`${medicines.length} item${medicines.length !== 1 ? "s" : ""}`}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>

                            <TableContainer sx={{ overflowX: "auto" }}>
                                <Table
                                    sx={{
                                        "& .MuiTableCell-head": {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                            fontWeight: 600,
                                            fontSize: "0.875rem",
                                            whiteSpace: "nowrap",
                                        },
                                    }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Medicine</TableCell>
                                            <TableCell>Frequency</TableCell>
                                            <TableCell>Duration</TableCell>
                                            <TableCell>Food Timing</TableCell>
                                            <TableCell>Dosage Schedule</TableCell>
                                            <TableCell>Subtype</TableCell>
                                            <TableCell align="center">Dispense Qty</TableCell>
                                            <TableCell align="center">Amount</TableCell>
                                            <TableCell>Notes</TableCell>
                                            <TableCell align="center">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {medicines.map((med, idx) => (
                                            <TableRow key={idx} hover>
                                                <TableCell>
                                                    <Typography fontWeight={600} fontSize="0.875rem">
                                                        {med.medicineName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{med.frequency || "-"}</TableCell>
                                                <TableCell>{med.duration || "-"}</TableCell>
                                                <TableCell>{med.foodTiming || "-"}</TableCell>
                                                <TableCell>{med.dosageSchedule || "-"}</TableCell>
                                                <TableCell>{med.subType || "-"}</TableCell>
                                                <TableCell align="center">{med.dispensedQuantity}</TableCell>
                                                <TableCell align="center">₹{Number(med.amount || 0).toFixed(2)}</TableCell>
                                                <TableCell>{med.notes || "-"}</TableCell>
                                                <TableCell align="center">
                                                    <Chip label="Dispensed" size="small" color="success" variant="filled" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        width: { xs: "100%", sm: 380 },
                                        borderRadius: 2,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                                    }}
                                >
                                    <CardContent sx={{ p: 2 }}>
                                        <Stack spacing={1}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography color="text.secondary">Total Amount</Typography>
                                                <Typography fontWeight={700} color="primary.main">
                                                    ₹{totalAmount.toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default OutsideDispense_Details;
