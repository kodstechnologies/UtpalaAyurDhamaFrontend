// import React from "react";
// import { Box, Typography, Card, CardContent, Divider } from "@mui/material";

// function PatientDetails() {
//     return (
//         <Box sx={{ padding: "24px", backgroundColor: "var(--color-background)" }}>

//             {/* ========== PAGE HEADER ========== */}
//             <Box sx={{ mb: 3 }}>
//                 <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--color-primary-dark)" }}>
//                     Sharavni
//                 </Typography>

//                 <Typography sx={{ mt: 1, color: "var(--color-text-muted)", fontSize: "15px" }}>
//                     Ward: General &nbsp; • &nbsp; Room: 101 &nbsp; • &nbsp; Admitted: 25/11/2025
//                 </Typography>
//             </Box>

//             {/* ========== TOP CARDS ========== */}
//             <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>

//                 <Card sx={{ flex: 1, borderRadius: "12px", background: "#E8F1FF", boxShadow: "var(--shadow-soft)" }}>
//                     <CardContent>
//                         <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#3B5998" }}>
//                             CHECKUPS
//                         </Typography>
//                         <Typography sx={{ fontSize: 32, fontWeight: 700 }}>1</Typography>
//                     </CardContent>
//                 </Card>

//                 <Card sx={{ flex: 1, borderRadius: "12px", background: "#E7F7EA", boxShadow: "var(--shadow-soft)" }}>
//                     <CardContent>
//                         <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--color-success)" }}>
//                             THERAPY SESSIONS
//                         </Typography>
//                         <Typography sx={{ fontSize: 32, fontWeight: 700 }}>1</Typography>
//                     </CardContent>
//                 </Card>

//                 <Card sx={{ flex: 1, borderRadius: "12px", background: "#F3E8FF", boxShadow: "var(--shadow-soft)" }}>
//                     <CardContent>
//                         <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#8A4CC7" }}>
//                             PRESCRIPTIONS
//                         </Typography>
//                         <Typography sx={{ fontSize: 32, fontWeight: 700 }}>0</Typography>
//                     </CardContent>
//                 </Card>
//             </Box>

//             {/* ========== THERAPY PROGRESS ========== */}
//             <Card sx={{ mb: 4, borderRadius: "12px", backgroundColor: "var(--color-bg-card)", boxShadow: "var(--shadow-medium)" }}>
//                 <CardContent>
//                     <Typography sx={{ fontWeight: 700, fontSize: "18px", mb: 2 }}>
//                         Therapy Progress
//                     </Typography>

//                     <Typography sx={{ fontWeight: 600 }}>Cardiology</Typography>
//                     <Typography sx={{ color: "var(--color-text-muted)", mb: 1 }}>
//                         Status: Scheduled • Therapist: Ther
//                     </Typography>

//                     <Typography sx={{ color: "var(--color-text-muted)", fontSize: 14 }}>
//                         Completed: 0/1 • Remaining: 1 • Next Session: —
//                     </Typography>

//                     {/* Progress bar */}
//                     <Box
//                         sx={{
//                             height: "6px",
//                             backgroundColor: "#eee",
//                             borderRadius: "10px",
//                             mt: 2
//                         }}
//                     >
//                         <Box
//                             sx={{
//                                 width: "0%",
//                                 height: "100%",
//                                 backgroundColor: "var(--color-primary)",
//                                 borderRadius: "10px",
//                             }}
//                         ></Box>
//                     </Box>
//                 </CardContent>
//             </Card>

//             {/* ========== DAILY CHECKUPS TABLE ========== */}
//             <Card sx={{ mb: 4, borderRadius: "12px", boxShadow: "var(--shadow-medium)", backgroundColor: "var(--color-bg-card)" }}>
//                 <CardContent>
//                     <Typography sx={{ fontWeight: 700, fontSize: "18px", mb: 2 }}>
//                         Daily Checkups
//                     </Typography>

//                     <Box sx={{ overflowX: "auto" }}>
//                         <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                             <thead>
//                                 <tr style={{ background: "#F5F5F5", textAlign: "left" }}>
//                                     <th style={th}>Date & Time</th>
//                                     <th style={th}>Doctor</th>
//                                     <th style={th}>Temperature</th>
//                                     <th style={th}>Blood Pressure</th>
//                                     <th style={th}>Pulse</th>
//                                     <th style={th}>SpO₂</th>
//                                     <th style={th}>Notes</th>
//                                 </tr>
//                             </thead>

//                             <tbody>
//                                 <tr>
//                                     <td style={td}>25 Nov 2025, 5:30 am</td>
//                                     <td style={td}>Anajali D</td>
//                                     <td style={td}>12</td>
//                                     <td style={td}>12</td>
//                                     <td style={td}>12</td>
//                                     <td style={td}>12</td>
//                                     <td style={td}>12</td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </Box>
//                 </CardContent>
//             </Card>

//             {/* ========== PRESCRIPTIONS ========== */}
//             <Card sx={{ mb: 5, borderRadius: "12px", boxShadow: "var(--shadow-medium)" }}>
//                 <CardContent>
//                     <Typography sx={{ fontWeight: 700, fontSize: "18px", mb: 2 }}>
//                         Prescriptions
//                     </Typography>

//                     <Typography sx={{ color: "var(--color-text-muted)", fontSize: 15 }}>
//                         No prescriptions found.
//                     </Typography>
//                 </CardContent>
//             </Card>


//         </Box>
//     );
// }

// // Table styles
// const th = {
//     padding: "12px",
//     fontWeight: 600,
//     color: "var(--color-text-dark)",
//     borderBottom: "1px solid var(--color-border)"
// };

// const td = {
//     padding: "12px",
//     borderBottom: "1px solid var(--color-border)"
// };

// export default PatientDetails;


import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";


// Icons
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MedicationIcon from "@mui/icons-material/Medication";
import HealingIcon from "@mui/icons-material/Healing";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";

function PatientDetails() {

    // 👉 Daily checkup table columns
    const checkupColumns = [
        { field: "date", header: "Date & Time" },
        { field: "doctor", header: "Doctor" },
        { field: "temperature", header: "Temperature" },
        { field: "bp", header: "Blood Pressure" },
        { field: "pulse", header: "Pulse" },
        { field: "spo2", header: "SpO₂" },
        { field: "notes", header: "Notes" },
    ];

    // 👉 Rows for testing (Dummy Data)
    const checkupRows = [
        {
            _id: "1",
            date: "25 Nov 2025, 5:30 am",
            doctor: "Anajali D",
            temperature: "98.5°F",
            bp: "120/80",
            pulse: "72",
            spo2: "98%",
            notes: "Stable",
        },
    ];

    return (
        <Box sx={{ padding: "24px", backgroundColor: "var(--color-background)" }}>

            {/* ========== PAGE HEADER ========== */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--color-primary-dark)" }}>
                    Sharavni
                </Typography>

                <Typography sx={{ mt: 1, color: "var(--color-text-muted)", fontSize: "15px" }}>
                    Ward: General • Room: 101 • Admitted: 25/11/2025
                </Typography>
            </Box>

            {/* ========== TOP CARDS ========== */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mb: 4,

                    // ⭐ Do NOT wrap on large screens
                    flexWrap: { xs: "wrap", sm: "wrap", md: "nowrap" },

                    // Optional: full row container
                    width: "100%",
                }}
            >
                <DashboardCard
                    title="CHECKUPS"
                    count={1}
                    icon={CalendarTodayIcon}
                    sx={{ flex: 1 }}
                />

                <DashboardCard
                    title="THERAPY SESSIONS"
                    count={1}
                    icon={HealingIcon}
                    sx={{ flex: 1 }}
                />

                <DashboardCard
                    title="PRESCRIPTIONS"
                    count={0}
                    icon={MedicationIcon}
                    sx={{ flex: 1 }}
                />
            </Box>


            {/* ========== THERAPY PROGRESS ========== */}
            <Card sx={{ mb: 4, borderRadius: "12px", backgroundColor: "var(--color-bg-card)", boxShadow: "var(--shadow-medium)" }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: "18px", mb: 2 }}>
                        Therapy Progress
                    </Typography>

                    <Typography sx={{ fontWeight: 600 }}>Cardiology</Typography>
                    <Typography sx={{ color: "var(--color-text-muted)", mb: 1 }}>
                        Status: Scheduled • Therapist: Ther
                    </Typography>

                    <Typography sx={{ color: "var(--color-text-muted)", fontSize: 14 }}>
                        Completed: 0/1 • Remaining: 1 • Next Session: —
                    </Typography>

                    {/* Progress bar */}
                    <Box
                        sx={{
                            height: "6px",
                            backgroundColor: "#eee",
                            borderRadius: "10px",
                            mt: 2
                        }}
                    >
                        <Box
                            sx={{
                                width: "0%",
                                height: "100%",
                                backgroundColor: "var(--color-primary)",
                                borderRadius: "10px",
                            }}
                        ></Box>
                    </Box>
                </CardContent>
            </Card>

            {/* ========== DAILY CHECKUPS (USING TableComponent) ========== */}
            <Card sx={{ mb: 4, borderRadius: "12px", backgroundColor: "var(--color-bg-card)", boxShadow: "var(--shadow-medium)" }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: "18px", mb: 2 }}>
                        Daily Checkups
                    </Typography>

                    <TableComponent
                        title="Daily Checkups"
                        columns={checkupColumns}
                        rows={checkupRows}

                        showAddButton={false}
                        showEdit={false}
                        showDelete={false}
                        showView={false}
                        headerActions={[]}
                        customActions={[]}
                        showStatusBadge={false}
                    />
                </CardContent>
            </Card>

            {/* ========== PRESCRIPTIONS SECTION ========== */}
            <Card sx={{ mb: 5, borderRadius: "12px", boxShadow: "var(--shadow-medium)" }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: "18px", mb: 2 }}>
                        Prescriptions
                    </Typography>

                    <Typography sx={{ color: "var(--color-text-muted)", fontSize: 15 }}>
                        No prescriptions found.
                    </Typography>
                </CardContent>
            </Card>

        </Box>
    );
}

export default PatientDetails;
