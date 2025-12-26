import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Grid,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Divider,
    Paper,
    Chip,
    IconButton,
    Stack,
    alpha,
    useTheme,
    Container,
    Card,
    CardContent,
    LinearProgress,
    Badge
} from "@mui/material";
import {
    LocalPharmacy,
    ArrowBack,
    Print,
    Download,
    CheckCircle,
    Pending,
    Medication,
    Person,
    CalendarToday,
    Female,
    Male,
    LocalHotel,
    LocalHospital
} from "@mui/icons-material";

import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../../components/card/HeadingCard";

function Inpatientprescriptions() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [status, setStatus] = useState("pending"); // pending, dispensed

    /* 🔹 Mock Data for Inpatient (replace with API by id later) */
    const patient = {
        id,
        name: "Rohit Verma",
        age: 45,
        gender: "Male",
        doctor: "Dr. Mehta",
        diagnosis: "Diabetes Management",
        contact: "+91 98765 43210",
        admissionDate: "2025-01-10",
        prescriptionDate: "2025-01-20",
        roomNo: "102",
        wardCategory: "General",
        uhid: "UHID-2025-001",
        allergies: ["Penicillin"]
    };

    const prescriptions = [
        {
            id: 1,
            medicine: "Metformin 500mg",
            dosage: "1 tablet",
            frequency: "2 times/day",
            duration: "Ongoing",
            quantity: 30,
            notes: "After meals",
            status: "available"
        },
        {
            id: 2,
            medicine: "Glipizide 5mg",
            dosage: "1 tablet",
            frequency: "1 time/day (morning)",
            duration: "Ongoing",
            quantity: 15,
            notes: "Before breakfast",
            status: "available"
        },
        {
            id: 3,
            medicine: "Insulin Glargine",
            dosage: "20 units",
            frequency: "1 time/day (night)",
            duration: "Ongoing",
            quantity: 1,
            notes: "Subcutaneous injection",
            status: "available"
        },
    ];

    /* Breadcrumb */
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist/dashboard" },
        { label: "Inpatient Prescriptions", url: "/pharmacist/prescriptions/inpatient" },
        { label: patient.name },
    ];

    const handleDispense = () => {
        setStatus("dispensed");
        // Add API call here
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Implement download logic
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Header with Back Button */}
            <Box sx={{ mb: 3 }}>
                <Breadcrumb items={breadcrumbItems} />
            </Box>

            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <HeadingCard
                    title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LocalHospital sx={{ color: theme.palette.primary.main }} />
                            <span>Inpatient Prescription #{id}</span>
                            <Chip
                                label={status === "dispensed" ? "Dispensed" : "Pending"}
                                color={status === "dispensed" ? "success" : "warning"}
                                size="small"
                                icon={status === "dispensed" ? <CheckCircle /> : <Pending />}
                                sx={{ ml: 1 }}
                            />
                        </Box>
                    }
                    subtitle="Review inpatient details and dispense prescribed medicines. Patient is currently admitted."
                    action={
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={<Print />}
                                onClick={handlePrint}
                                sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                            >
                                Print
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={handleDownload}
                                sx={{ borderColor: alpha(theme.palette.divider, 0.5) }}
                            >
                                Download
                            </Button>
                            {status !== "dispensed" && (
                                <Button
                                    variant="contained"
                                    startIcon={<CheckCircle />}
                                    onClick={handleDispense}
                                    sx={{
                                        backgroundColor: theme.palette.success.main,
                                        '&:hover': {
                                            backgroundColor: theme.palette.success.dark
                                        }
                                    }}
                                >
                                    Mark as Dispensed
                                </Button>
                            )}
                        </Stack>
                    }
                    sx={{
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: 2,
                    }}
                />
            </Box>

            <Grid container spacing={3}>
                {/* Patient Information Card */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            height: '100%',
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={3} sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Person fontSize="small" />
                                Inpatient Information
                            </Typography>

                            <Stack spacing={2.5}>
                                <DetailCard
                                    label="Full Name"
                                    value={patient.name}
                                    icon={<Person fontSize="small" />}
                                />

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <DetailCard
                                        label="Age"
                                        value={`${patient.age} years`}
                                        icon={<CalendarToday fontSize="small" />}
                                        fullWidth
                                    />
                                    <DetailCard
                                        label="Gender"
                                        value={patient.gender}
                                        icon={patient.gender === "Male" ? <Male fontSize="small" /> : <Female fontSize="small" />}
                                        fullWidth
                                    />
                                </Box>

                                <DetailCard
                                    label="UHID"
                                    value={patient.uhid}
                                    sx={{
                                        backgroundColor: alpha(theme.palette.info.main, 0.05),
                                        borderLeft: `3px solid ${theme.palette.info.main}`
                                    }}
                                />

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <DetailCard
                                        label="Room No"
                                        value={patient.roomNo}
                                        icon={<LocalHotel fontSize="small" />}
                                        fullWidth
                                    />
                                    <DetailCard
                                        label="Ward"
                                        value={patient.wardCategory}
                                        icon={<LocalHospital fontSize="small" />}
                                        fullWidth
                                    />
                                </Box>

                                <DetailCard
                                    label="Contact"
                                    value={patient.contact}
                                />

                                <DetailCard
                                    label="Admission Date"
                                    value={new Date(patient.admissionDate).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                    icon={<CalendarToday fontSize="small" />}
                                />

                                <DetailCard
                                    label="Consulting Doctor"
                                    value={patient.doctor}
                                />

                                <DetailCard
                                    label="Diagnosis"
                                    value={patient.diagnosis}
                                    sx={{
                                        backgroundColor: alpha(theme.palette.warning.main, 0.05),
                                        borderLeft: `3px solid ${theme.palette.warning.main}`
                                    }}
                                />

                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                        Known Allergies
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        {patient.allergies.map((allergy, index) => (
                                            <Chip
                                                key={index}
                                                label={allergy}
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                                sx={{ mb: 0.5 }}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Prescription Details */}
                <Grid item xs={12} md={8}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                    >
                        <CardContent>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3
                            }}>
                                <Typography variant="h6" fontWeight={600} sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Medication fontSize="small" />
                                    Prescribed Medicines
                                </Typography>

                                <Chip
                                    label={`${prescriptions.length} medicines`}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>

                            <Table sx={{
                                '& .MuiTableCell-head': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                },
                                '& .MuiTableRow-root:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                }
                            }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Medicine</TableCell>
                                        <TableCell>Dosage</TableCell>
                                        <TableCell>Frequency</TableCell>
                                        <TableCell>Duration</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Notes</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {prescriptions.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            sx={{ '&:last-child td': { borderBottom: 0 } }}
                                        >
                                            <TableCell>
                                                <Typography fontWeight={500}>
                                                    {item.medicine}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.dosage}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell>{item.frequency}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.duration}
                                                    size="small"
                                                    color="info"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={500} color="primary">
                                                    {item.quantity}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.notes}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label="In Stock"
                                                    size="small"
                                                    color="success"
                                                    variant="filled"
                                                    sx={{
                                                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                                                        color: theme.palette.success.dark,
                                                        fontWeight: 500
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Dispensing Action */}
                            {status !== "dispensed" && (
                                <Box sx={{
                                    mt: 3,
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: alpha(theme.palette.warning.main, 0.05),
                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                                }}>
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        Ready to dispense? Please verify all medicines before proceeding. This is for an admitted patient.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<LocalPharmacy />}
                                        onClick={handleDispense}
                                        fullWidth
                                        sx={{
                                            backgroundColor: theme.palette.success.main,
                                            '&:hover': {
                                                backgroundColor: theme.palette.success.dark
                                            }
                                        }}
                                    >
                                        Dispense All Medicines
                                    </Button>
                                </Box>
                            )}

                            {/* Dispensed Status */}
                            {status === "dispensed" && (
                                <Box sx={{
                                    mt: 3,
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <CheckCircle color="success" />
                                        <Typography fontWeight={600} color="success.dark">
                                            Prescription Dispensed
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        All medicines have been dispensed to the inpatient on {new Date().toLocaleDateString()}.
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

/* 🔹 Enhanced Detail Component */
const DetailCard = ({ label, value, icon, sx = {}, fullWidth = false }) => (
    <Box sx={{
        p: 1.5,
        borderRadius: 1,
        backgroundColor: 'background.default',
        border: `1px solid ${alpha(useTheme().palette.divider, 0.1)}`,
        width: fullWidth ? '100%' : 'auto',
        ...sx
    }}>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            {icon && (
                <Box component="span" sx={{ mr: 0.5, verticalAlign: 'middle' }}>
                    {icon}
                </Box>
            )}
            {label}
        </Typography>
        <Typography fontWeight={600} fontSize="0.95rem">
            {value}
        </Typography>
    </Box>
);

export default Inpatientprescriptions;
