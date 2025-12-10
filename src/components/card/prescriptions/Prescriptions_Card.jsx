// // import React from 'react';
// // import { Typography, Chip, Box } from '@mui/material';

// // function Prescriptions_Card({ data, onClose }) {
// //     if (!data) return <div>No data</div>;
// //     const meds = data.prescriptions?.split(',').map(med => med.trim()) || [];

// //     return (
// //         <Box>
// //             <Typography variant="h6" gutterBottom>Prescriptions for {data.name}</Typography>
// //             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
// //                 {meds.map((med, idx) => (
// //                     <Chip key={idx} label={med} variant="outlined" color="primary" />
// //                 ))}
// //             </Box>
// //             <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
// //                 Diagnosis: {data.diagnosis}
// //             </Typography>
// //             {onClose && (
// //                 <button onClick={onClose} style={{ marginTop: 16 }}>Close</button>
// //             )}
// //         </Box>
// //     );
// // }

// // export default Prescriptions_Card;

// //     import React from "react";
// //     import { Typography, Chip, Box, Divider } from "@mui/material";

// //     function Prescriptions_Card({ data, onClose }) {
// //         if (!data) return <div>No data</div>;

// //         const medicines = data.medicines || {
// //             churna: [],
// //             powder: [],
// //             oil: [],
// //             other: []
// //         };

// //         return (
// //             <Box
// //                 sx={{
// //                     backgroundColor: "var(--color-bg-card)",
// //                     padding: "20px",
// //                     borderRadius: "12px",
// //                     boxShadow: "var(--shadow-medium)",
// //                     color: "var(--color-text-dark)"
// //                 }}
// //             >
// //                 {/* Title */}
// //                 <Typography
// //                     variant="h6"
// //                     gutterBottom
// //                     sx={{ color: "var(--color-primary-dark)", fontWeight: 600 }}
// //                 >
// //                     Prescription Details
// //                 </Typography>

// //                 {/* Patient & Doctor */}
// //                 <Box sx={{ mb: 2 }}>
// //                     <Typography sx={{ fontWeight: 600 }}>
// //                         Patient: <span style={{ color: "var(--color-primary)" }}>{data.name}</span>
// //                     </Typography>
// //                     <Typography sx={{ fontWeight: 600 }}>
// //                         Doctor: <span style={{ color: "var(--color-primary)" }}>{data.doctor}</span>
// //                     </Typography>
// //                 </Box>

// //                 <Divider sx={{ mb: 2 }} />

// //                 {/* Ayurvedic Categories */}
// //                 {/* Churna */}
// //                 {medicines.churna.length > 0 && (
// //                     <Box sx={{ mb: 2 }}>
// //                         <Typography sx={{ fontWeight: 600, mb: 1, color: "var(--color-primary-dark)" }}>
// //                             Churna / Powder:
// //                         </Typography>
// //                         <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
// //                             {medicines.churna.map((item, idx) => (
// //                                 <Chip
// //                                     key={idx}
// //                                     label={item}
// //                                     variant="outlined"
// //                                     sx={{
// //                                         borderColor: "var(--color-primary)",
// //                                         color: "var(--color-primary-dark)"
// //                                     }}
// //                                 />
// //                             ))}
// //                         </Box>
// //                     </Box>
// //                 )}

// //                 {/* Oil */}
// //                 {medicines.oil.length > 0 && (
// //                     <Box sx={{ mb: 2 }}>
// //                         <Typography sx={{ fontWeight: 600, mb: 1, color: "var(--color-primary-dark)" }}>
// //                             Herbal Oil / Tailam:
// //                         </Typography>
// //                         <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
// //                             {medicines.oil.map((item, idx) => (
// //                                 <Chip
// //                                     key={idx}
// //                                     label={item}
// //                                     variant="outlined"
// //                                     sx={{
// //                                         borderColor: "var(--color-primary)",
// //                                         color: "var(--color-primary-dark)"
// //                                     }}
// //                                 />
// //                             ))}
// //                         </Box>
// //                     </Box>
// //                 )}

// //                 {/* Other Tablets, Syrups */}
// //                 {medicines.other.length > 0 && (
// //                     <Box sx={{ mb: 2 }}>
// //                         <Typography sx={{ fontWeight: 600, mb: 1, color: "var(--color-primary-dark)" }}>
// //                             Other Medicines:
// //                         </Typography>
// //                         <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
// //                             {medicines.other.map((item, idx) => (
// //                                 <Chip
// //                                     key={idx}
// //                                     label={item}
// //                                     variant="outlined"
// //                                     sx={{
// //                                         borderColor: "var(--color-primary)",
// //                                         color: "var(--color-primary-dark)"
// //                                     }}
// //                                 />
// //                             ))}
// //                         </Box>
// //                     </Box>
// //                 )}
// // <p>Medicine Type : powder</p>
// // <p>Frequency / Intake Timing* : After Food</p>
// // <p>Administration Route : internal 
// // </p>
// // <p>Special Instructions : </p>
// // <p>Medicine Name</p>
// // <p>Dosage Times : morning</p>
// // <p>Quantity : 1</p>
// //                 {/* Diagnosis */}
// //                 <Typography
// //                     variant="body2"
// //                     sx={{ mt: 2, color: "var(--color-text-muted)" }}
// //                 >
// //                     Diagnosis: {data.diagnosis}
// //                 </Typography>

// //                 {/* Close Button */}
// //                 {onClose && (
// //                     <button
// //                         onClick={onClose}
// //                         style={{
// //                             marginTop: 20,
// //                             padding: "8px 16px",
// //                             backgroundColor: "var(--color-primary)",
// //                             color: "var(--color-text-white)",
// //                             borderRadius: "6px",
// //                             border: "none",
// //                             cursor: "pointer",
// //                             fontWeight: 600
// //                         }}
// //                     >
// //                         Close
// //                     </button>
// //                 )}
// //             </Box>
// //         );
// //     }

// //     export default Prescriptions_Card;


// import React from "react";
// import { Typography, Chip, Box, Divider } from "@mui/material";

// function Prescriptions_Card({ data, onClose }) {
//     if (!data) return <div>No data</div>;

//     const medicines = data.medicines || {
//         churna: [],
//         powder: [],
//         oil: [],
//         other: []
//     };

//     return (
//         <Box
//             sx={{
//                 backgroundColor: "var(--color-bg-card)",
//                 padding: "20px",
//                 borderRadius: "12px",
//                 boxShadow: "var(--shadow-medium)",
//                 color: "var(--color-text-dark)",
//                 width: "100%",
//             }}
//         >
//             {/* Title */}
//             <Typography
//                 variant="h6"
//                 gutterBottom
//                 sx={{ color: "var(--color-primary-dark)", fontWeight: 700 }}
//             >
//                 Prescription Details
//             </Typography>

//             {/* Patient & Doctor */}
//             <Box sx={{ mb: 2 }}>
//                 <Typography sx={{ fontWeight: 600 }}>
//                     Patient:{" "}
//                     <span style={{ color: "var(--color-primary)" }}>{data.name}</span>
//                 </Typography>
//                 <Typography sx={{ fontWeight: 600 }}>
//                     Doctor:{" "}
//                     <span style={{ color: "var(--color-primary)" }}>{data.doctor}</span>
//                 </Typography>
//             </Box>

//             <Divider sx={{ mb: 2 }} />

//             {/* ----- AYURVEDIC CATEGORY MEDICINES ----- */}

//             {/* CHURNA / POWDER */}
//             {medicines.churna.length > 0 && (
//                 <Box sx={{ mb: 2 }}>
//                     <Typography
//                         sx={{ fontWeight: 600, mb: 1, color: "var(--color-primary-dark)" }}
//                     >
//                         Churna / Powder:
//                     </Typography>
//                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//                         {medicines.churna.map((item, idx) => (
//                             <Chip
//                                 key={idx}
//                                 label={item}
//                                 variant="outlined"
//                                 sx={{
//                                     borderColor: "var(--color-primary)",
//                                     color: "var(--color-primary-dark)",
//                                 }}
//                             />
//                         ))}
//                     </Box>
//                 </Box>
//             )}

//             {/* OIL */}
//             {medicines.oil.length > 0 && (
//                 <Box sx={{ mb: 2 }}>
//                     <Typography
//                         sx={{ fontWeight: 600, mb: 1, color: "var(--color-primary-dark)" }}
//                     >
//                         Herbal Oil / Tailam:
//                     </Typography>
//                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//                         {medicines.oil.map((item, idx) => (
//                             <Chip
//                                 key={idx}
//                                 label={item}
//                                 variant="outlined"
//                                 sx={{
//                                     borderColor: "var(--color-primary)",
//                                     color: "var(--color-primary-dark)",
//                                 }}
//                             />
//                         ))}
//                     </Box>
//                 </Box>
//             )}

//             {/* OTHER */}
//             {medicines.other.length > 0 && (
//                 <Box sx={{ mb: 2 }}>
//                     <Typography
//                         sx={{ fontWeight: 600, mb: 1, color: "var(--color-primary-dark)" }}
//                     >
//                         Other Medicines:
//                     </Typography>
//                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//                         {medicines.other.map((item, idx) => (
//                             <Chip
//                                 key={idx}
//                                 label={item}
//                                 variant="outlined"
//                                 sx={{
//                                     borderColor: "var(--color-primary)",
//                                     color: "var(--color-primary-dark)",
//                                 }}
//                             />
//                         ))}
//                     </Box>
//                 </Box>
//             )}

//             {/* ----- PRESCRIPTION DETAILS (Proper Display) ----- */}

//             <Divider sx={{ my: 2 }} />

//             <Typography
//                 variant="h6"
//                 sx={{ fontWeight: 600, color: "var(--color-primary-dark)", mb: 1 }}
//             >
//                 Medicine Information
//             </Typography>

//             <Box sx={{ lineHeight: 1.9 }}>
//                 <p><strong>Medicine Type:</strong> {data.medicineType}</p>
//                 <p><strong>Medicine Name:</strong> {data.medicineName}</p>
//                 <p><strong>Frequency / Intake Timing:</strong> {data.intakeTiming}</p>
//                 <p><strong>Administration Route:</strong> {data.administrationRoute}</p>
//                 <p><strong>Dosage Times:</strong> {data.dosageTimes}</p>
//                 <p><strong>Quantity:</strong> {data.quantity}</p>
//                 <p><strong>Special Instructions:</strong> {data.specialInstructions || "None"}</p>
//             </Box>

//             {/* Diagnosis */}
//             <Typography
//                 variant="body2"
//                 sx={{ mt: 2, color: "var(--color-text-muted)" }}
//             >
//                 Diagnosis: {data.diagnosis}
//             </Typography>

//             {/* CLOSE BUTTON */}
//             {onClose && (
//                 <button
//                     onClick={onClose}
//                     style={{
//                         marginTop: 20,
//                         padding: "10px 18px",
//                         backgroundColor: "var(--color-primary)",
//                         color: "var(--color-text-white)",
//                         borderRadius: "8px",
//                         border: "none",
//                         cursor: "pointer",
//                         fontWeight: 600,
//                     }}
//                 >
//                     Close
//                 </button>
//             )}
//         </Box>
//     );
// }

// export default Prescriptions_Card;


import React from "react";
import { Typography, Chip, Box, Divider } from "@mui/material";

function Prescriptions_Card({ data = {}, onClose }) {

    // ------ DUMMY FALLBACK VALUES ------
    const fallback = {
        name: "Sharavni",
        doctor: "Dr. Sharma",
        diagnosis: "General Checkup",
        medicineType: "Powder",
        medicineName: "Triphala Churna",
        intakeTiming: "After Food",
        administrationRoute: "Internal",
        dosageTimes: "Morning",
        quantity: "1 Pack",
        specialInstructions: "Take with warm water.",
        medicines: {
            churna: ["Triphala", "Ashwagandha"],
            powder: ["Guduchi Powder"],
            oil: ["Dhanwantaram Tailam"],
            other: ["Giloy Tablets"]
        }
    };

    // Merge real data with fallback dummy values
    const merged = { ...fallback, ...data };
    merged.medicines = { ...fallback.medicines, ...(data.medicines || {}) };

    const { medicines } = merged;

    return (
        <Box
            sx={{
                backgroundColor: "var(--color-bg-card)",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "var(--shadow-medium)",
                color: "var(--color-text-dark)",
                width: "100%",
            }}
        >
            {/* Title */}
            <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "var(--color-primary-dark)", fontWeight: 700 }}
            >
                Prescription Details
            </Typography>

            {/* Patient & Doctor */}
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>
                    Patient:{" "}
                    <span style={{ color: "var(--color-primary)" }}>
                        {merged.name}
                    </span>
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                    Doctor:{" "}
                    <span style={{ color: "var(--color-primary)" }}>
                        {merged.doctor}
                    </span>
                </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* CHURNA / POWDER */}
            {medicines.churna.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography
                        sx={{ fontWeight: 600, mb: 1, color: "var(--color-primary-dark)" }}
                    >
                        Churna / Powder:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {medicines.churna.map((item, idx) => (
                            <Chip
                                key={idx}
                                label={item}
                                variant="outlined"
                                sx={{
                                    borderColor: "var(--color-primary)",
                                    color: "var(--color-primary-dark)",
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            )}

            {/* OIL */}
            {medicines.oil.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography
                        sx={{ fontWeight: 600, mb: 1, color: "var(--color-primary-dark)" }}
                    >
                        Herbal Oil / Tailam:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {medicines.oil.map((item, idx) => (
                            <Chip
                                key={idx}
                                label={item}
                                variant="outlined"
                                sx={{
                                    borderColor: "var(--color-primary)",
                                    color: "var(--color-primary-dark)",
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            )}

            {/* OTHER */}
            {medicines.other.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography
                        sx={{ fontWeight: 600, mb: 1, color: "var(--color-primary-dark)" }}
                    >
                        Other Medicines:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {medicines.other.map((item, idx) => (
                            <Chip
                                key={idx}
                                label={item}
                                variant="outlined"
                                sx={{
                                    borderColor: "var(--color-primary)",
                                    color: "var(--color-primary-dark)",
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* ---- MAIN MEDICINE INFO ---- */}
            <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "var(--color-primary-dark)", mb: 1 }}
            >
                Medicine Information
            </Typography>

            <Box sx={{ lineHeight: 1.9 }}>
                <p><strong>Medicine Type:</strong> {merged.medicineType}</p>
                <p><strong>Medicine Name:</strong> {merged.medicineName}</p>
                <p><strong>Frequency / Intake Timing:</strong> {merged.intakeTiming}</p>
                <p><strong>Administration Route:</strong> {merged.administrationRoute}</p>
                <p><strong>Dosage Times:</strong> {merged.dosageTimes}</p>
                <p><strong>Quantity:</strong> {merged.quantity}</p>
                <p><strong>Special Instructions:</strong> {merged.specialInstructions}</p>
            </Box>

            {/* Diagnosis */}
            <Typography
                variant="body2"
                sx={{ mt: 2, color: "var(--color-text-muted)" }}
            >
                Diagnosis: {merged.diagnosis}
            </Typography>

            {/* CLOSE BUTTON */}
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        marginTop: 20,
                        padding: "10px 18px",
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-text-white)",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Close
                </button>
            )}
        </Box>
    );
}

export default Prescriptions_Card;
