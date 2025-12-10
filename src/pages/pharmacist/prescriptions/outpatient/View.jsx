// // import React from "react";
// // import { Box } from "@mui/material";

// // import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
// // import HeadingCardingCard from "../../../../components/card/HeadingCard";
// // import TableComponent from "../../../../components/table/TableComponent";

// // function Outpatient_View() {
// //     // Breadcrumb Items
// //     const breadcrumbItems = [
// //         { label: "Home", url: "/" },
// //         { label: "Pharmacist", url: "/pharmacist" },
// //         { label: "Outpatient Prescriptions" }
// //     ];

// //     // Table Columns
// //     const columns = [
// //         { field: "name", header: "Name" },
// //         { field: "age", header: "Age" },
// //         { field: "gender", header: "Gender" },
// //         { field: "doctor", header: "Doctor" },
// //         { field: "diagnosis", header: "Diagnosis" },
// //     ];

// //     // Example Table Data
// //     const rows = [
// //         {
// //             _id: "1",
// //             name: "Amit Kumar",
// //             age: 32,
// //             gender: "Male",
// //             doctor: "Dr. Sharma",
// //             diagnosis: "Fever",
// //         },
// //         {
// //             _id: "2",
// //             name: "Neha Singh",
// //             age: 25,
// //             gender: "Female",
// //             doctor: "Dr. Rao",
// //             diagnosis: "Cough & Cold",
// //         },
// //     ];

// //     return (
// //         <Box sx={{ padding: "20px" }}>

// //             {/* ⭐ Breadcrumb Navigation */}
// //             <Breadcrumb items={breadcrumbItems} />

// //             {/* ⭐ Page Header */}
// //             <HeadingCardingCard
// //                 category="PRESCRIPTIONS"
// //                 title="Outpatient Prescriptions"
// //                 subtitle="View, verify, and manage outpatient medication requests received from doctors."
// //             />

// //             {/* ⭐ TABLE COMPONENT */}
// //             <TableComponent
// //                 title="Outpatient Prescription List"
// //                 columns={columns}
// //                 rows={rows}
// //                 onCreate={() => console.log("Add new outpatient record")}
// //                 onDelete={(id) => console.log("Delete row:", id)}
// //             />

// //         </Box>
// //     );
// // }

// // export default Outpatient_View;


// // import React from "react";
// // import { Box } from "@mui/material";

// // import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
// // import HeadingCardingCard from "../../../../components/card/HeadingCard";
// // import TableComponent from "../../../../components/table/TableComponent";

// // function Outpatient_View() {
// //     // Breadcrumb Items
// //     const breadcrumbItems = [
// //         { label: "Home", url: "/" },
// //         { label: "Pharmacist", url: "/pharmacist" },
// //         { label: "Outpatient Prescriptions" }
// //     ];

// //     // Table Columns
// //     const columns = [
// //         { field: "name", header: "Name" },
// //         { field: "age", header: "Age" },
// //         { field: "gender", header: "Gender" },
// //         { field: "doctor", header: "Doctor" },
// //         { field: "diagnosis", header: "Diagnosis" },
// //     ];

// //     // Example Table Data
// //     const rows = [
// //         {
// //             _id: "1",
// //             name: "Amit Kumar",
// //             age: 32,
// //             gender: "Male",
// //             doctor: "Dr. Sharma",
// //             diagnosis: "Fever",
// //         },
// //         {
// //             _id: "2",
// //             name: "Neha Singh",
// //             age: 25,
// //             gender: "Female",
// //             doctor: "Dr. Rao",
// //             diagnosis: "Cough & Cold",
// //         },
// //     ];

// //     return (
// //         <Box sx={{ padding: "20px" }}>

// //             {/* ⭐ Breadcrumb Navigation */}
// //             <Breadcrumb items={breadcrumbItems} />

// //             {/* ⭐ Page Header */}
// //             <HeadingCardingCard
// //                 category="PRESCRIPTIONS"
// //                 title="Outpatient Prescriptions"
// //                 subtitle="View, verify, and manage outpatient medication requests received from doctors."
// //             />

// //             {/* ⭐ TABLE COMPONENT */}
// //             <TableComponent
// //                 title="Outpatient Prescription List"
// //                 columns={columns}
// //                 rows={rows}
// //                 onCreate={() => console.log("Add new outpatient record")}
// //                 onDelete={(id) => console.log("Delete row:", id)}
// //             />

// //         </Box>
// //     );
// // }

// // export default Outpatient_View;


// import React, { useState } from "react";
// import { Box, Dialog, DialogTitle, DialogContent, Typography, Chip } from "@mui/material";
// import StarIcon from "@mui/icons-material/Star"; // ⭐ For * icon (StarIcon as approximation; use custom SVG if needed)

// import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
// import HeadingCardingCard from "../../../../components/card/HeadingCard";
// import TableComponent from "../../../../components/table/TableComponent";

// // Simple Prescriptions Modal Component (inline for demo; extract to separate file if needed)
// function PrescriptionsModal({ open, onClose, prescriptionData }) {
//     if (!prescriptionData) return null;

//     // Parse prescriptions string into array for better display (e.g., split by comma)
//     const meds = prescriptionData.split(',').map(med => med.trim());

//     return (
//         <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//             <DialogTitle>
//                 Prescription Details
//                 <Box sx={{ position: 'absolute', right: 16, top: 16 }}>
//                     <StarIcon color="primary" />
//                 </Box>
//             </DialogTitle>
//             <DialogContent sx={{ p: 3 }}>
//                 <Typography variant="h6" gutterBottom>Medications:</Typography>
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
//                     {meds.map((med, idx) => (
//                         <Chip key={idx} label={med} variant="outlined" color="primary" />
//                     ))}
//                 </Box>
//                 <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
//                     Note: Verify and dispense as per guidelines.
//                 </Typography>
//             </DialogContent>
//         </Dialog>
//     );
// }

// function Outpatient_View() {
//     // Breadcrumb Items
//     const breadcrumbItems = [
//         { label: "Home", url: "/" },
//         { label: "Pharmacist", url: "/pharmacist" },
//         { label: "Outpatient Prescriptions" }
//     ];

//     // Table Columns
//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "age", header: "Age" },
//         { field: "gender", header: "Gender" },
//         { field: "doctor", header: "Doctor" },
//         { field: "diagnosis", header: "Diagnosis" },
//         { field: "prescriptions", header: "Prescriptions" },
//     ];

//     // Example Table Data
//     const rows = [
//         {
//             _id: "1",
//             name: "Amit Kumar",
//             age: 32,
//             gender: "Male",
//             doctor: "Dr. Sharma",
//             diagnosis: "Fever",
//             prescriptions: "Paracetamol 500mg (2 tabs/day), Ibuprofen 400mg (1 tab/day)",
//         },
//         {
//             _id: "2",
//             name: "Neha Singh",
//             age: 25,
//             gender: "Female",
//             doctor: "Dr. Rao",
//             diagnosis: "Cough & Cold",
//             prescriptions: "Cetirizine 10mg (1 tab/night), Dextromethorphan 15mg (10ml syrup 3x/day)",
//         },
//     ];

//     // State for Prescriptions Modal
//     const [prescriptionsModalOpen, setPrescriptionsModalOpen] = useState(false);
//     const [selectedPrescription, setSelectedPrescription] = useState(null);

//     // Handler for * icon click - Calls/Opens Prescriptions component/modal
//     const handlePrescriptionsView = (row) => {
//         setSelectedPrescription(row.prescriptions);
//         setPrescriptionsModalOpen(true);
//         console.log("Prescriptions component called for:", row); // For debugging
//     };

//     return (
//         <Box sx={{ padding: "20px" }}>

//             {/* ⭐ Breadcrumb Navigation */}
//             <Breadcrumb items={breadcrumbItems} />

//             {/* ⭐ Page Header */}
//             <HeadingCardingCard
//                 category="PRESCRIPTIONS"
//                 title="Outpatient Prescriptions"
//                 subtitle="View, verify, and manage outpatient medication requests received from doctors."
//             />

//             {/* ⭐ Prescriptions Modal Component */}
//             <PrescriptionsModal
//                 open={prescriptionsModalOpen}
//                 onClose={() => setPrescriptionsModalOpen(false)}
//                 prescriptionData={selectedPrescription}
//             />

//             {/* ⭐ TABLE COMPONENT - Closed view icon (showView=false), Added * icon via customActions */}
//             <TableComponent
//                 title="Outpatient Prescription List"
//                 columns={columns}
//                 rows={rows}
//                 onCreate={() => console.log("Add new outpatient record")}
//                 onDelete={(id) => console.log("Delete row:", id)}
//                 showView={false} // ⭐ CLOSED VIEW ICON
//                 customActions={[
//                     // ⭐ ADDED * ICON (StarIcon) - On click, calls prescriptions handler
//                     {
//                         icon: <StarIcon fontSize="small" />,
//                         onClick: handlePrescriptionsView,
//                         tooltip: "View Prescriptions Details",
//                         color: "var(--color-primary)"
//                     }
//                 ]}
//             // For Inpatient: Apply same pattern in Inpatient_View component
//             />

//         </Box>
//     );
// }

// export default Outpatient_View;

// import React, { useState } from "react";
// import { Box, Dialog, DialogTitle, DialogContent, Typography } from "@mui/material";
// import StarIcon from "@mui/icons-material/Star";

// import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
// import HeadingCardingCard from "../../../../components/card/HeadingCard";
// import TableComponent from "../../../../components/table/TableComponent";
// import Prescriptions_Card from "../../../../components/card/prescriptions/Prescriptions_Card";
// // import Prescriptions_Card from "./Prescriptions_Card"; // ⭐ IMPORTED Prescriptions_Card (adjust path as needed)

// function Outpatient_View() {
//     // Breadcrumb Items
//     const breadcrumbItems = [
//         { label: "Home", url: "/" },
//         { label: "Pharmacist", url: "/pharmacist" },
//         { label: "Outpatient Prescriptions" }
//     ];

//     // Table Columns
//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "age", header: "Age" },
//         { field: "gender", header: "Gender" },
//         { field: "doctor", header: "Doctor" },
//         { field: "diagnosis", header: "Diagnosis" },
//         { field: "prescriptions", header: "Prescriptions" },
//     ];

//     // Example Table Data
//     const rows = [
//         {
//             _id: "1",
//             name: "Amit Kumar",
//             age: 32,
//             gender: "Male",
//             doctor: "Dr. Sharma",
//             diagnosis: "Fever",
//             prescriptions: "Paracetamol 500mg (2 tabs/day), Ibuprofen 400mg (1 tab/day)",
//         },
//         {
//             _id: "2",
//             name: "Neha Singh",
//             age: 25,
//             gender: "Female",
//             doctor: "Dr. Rao",
//             diagnosis: "Cough & Cold",
//             prescriptions: "Cetirizine 10mg (1 tab/night), Dextromethorphan 15mg (10ml syrup 3x/day)",
//         },
//     ];

//     // State for Prescriptions Modal (now renders Prescriptions_Card)
//     const [prescriptionsModalOpen, setPrescriptionsModalOpen] = useState(false);
//     const [selectedRow, setSelectedRow] = useState(null); // ⭐ Store full row for card props if needed

//     // Updated Handler: Calls function to open modal with Prescriptions_Card
//     const handlePrescriptionsView = (row) => {
//         setSelectedRow(row); // Pass row data to card if needed
//         setPrescriptionsModalOpen(true);
//         console.log("Prescriptions component called for:", row); // For debugging
//     };

//     return (
//         <Box sx={{ padding: "20px" }}>

//             {/* ⭐ Breadcrumb Navigation */}
//             <Breadcrumb items={breadcrumbItems} />

//             {/* ⭐ Page Header */}
//             <HeadingCardingCard
//                 category="PRESCRIPTIONS"
//                 title="Outpatient Prescriptions"
//                 subtitle="View, verify, and manage outpatient medication requests received from doctors."
//             />

//             {/* ⭐ Prescriptions Modal - Now renders Prescriptions_Card inside Dialog */}
//             <Dialog open={prescriptionsModalOpen} onClose={() => setPrescriptionsModalOpen(false)} fullWidth maxWidth="md">
//                 <DialogTitle>
//                     Prescription Details
//                     <Box sx={{ position: 'absolute', right: 16, top: 16 }}>
//                         <StarIcon color="primary" />
//                     </Box>
//                 </DialogTitle>
//                 <DialogContent sx={{ p: 3 }}>
//                     <Prescriptions_Card
//                         data={selectedRow} // ⭐ Pass row data as prop (e.g., for prescriptions, name, etc.)
//                         onClose={() => setPrescriptionsModalOpen(false)} // Optional close handler
//                     />
//                 </DialogContent>
//             </Dialog>

//             {/* ⭐ TABLE COMPONENT - * icon calls handlePrescriptionsView to open card */}
//             <TableComponent
//                 title="Outpatient Prescription List"
//                 columns={columns}
//                 rows={rows}
//                 onCreate={() => console.log("Add new outpatient record")}
//                 onDelete={(id) => console.log("Delete row:", id)}
//                 showView={false}
//                 customActions={[
//                     {
//                         icon: <StarIcon fontSize="small" />,
//                         onClick: handlePrescriptionsView,
//                         tooltip: "View Prescriptions Details",
//                         color: "var(--color-primary)"
//                     }
//                 ]}
//             />

//         </Box>
//     );
// }

// export default Outpatient_View;

import React, { useState } from "react";
import { Box, Dialog, DialogTitle, DialogContent, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility"; // ⭐ IMPORTED VisibilityIcon

import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../../components/card/HeadingCard";
import TableComponent from "../../../../components/table/TableComponent";
import Prescriptions_Card from "../../../../components/card/prescriptions/Prescriptions_Card";
// import Prescriptions_Card from "./Prescriptions_Card"; // ⭐ IMPORTED Prescriptions_Card (adjust path as needed)

function Outpatient_View() {
    // Breadcrumb Items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist" },
        { label: "Outpatient Prescriptions" }
    ];

    // Table Columns
    const columns = [
        { field: "name", header: "Name" },
        { field: "age", header: "Age" },
        { field: "gender", header: "Gender" },
        { field: "doctor", header: "Doctor" },
        { field: "diagnosis", header: "Diagnosis" },
        { field: "prescriptions", header: "Prescriptions" },
    ];

    // Example Table Data
    const rows = [
        {
            _id: "1",
            name: "Amit Kumar",
            age: 32,
            gender: "Male",
            doctor: "Dr. Sharma",
            diagnosis: "Fever",
            prescriptions: "Paracetamol 500mg (2 tabs/day), Ibuprofen 400mg (1 tab/day)",
        },
        {
            _id: "2",
            name: "Neha Singh",
            age: 25,
            gender: "Female",
            doctor: "Dr. Rao",
            diagnosis: "Cough & Cold",
            prescriptions: "Cetirizine 10mg (1 tab/night), Dextromethorphan 15mg (10ml syrup 3x/day)",
        },
    ];

    // State for Prescriptions Modal (now renders Prescriptions_Card)
    const [prescriptionsModalOpen, setPrescriptionsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null); // ⭐ Store full row for card props if needed

    // Updated Handler: Calls function to open modal with Prescriptions_Card
    const handlePrescriptionsView = (row) => {
        setSelectedRow(row); // Pass row data to card if needed
        setPrescriptionsModalOpen(true);
        console.log("Prescriptions component called for:", row); // For debugging
    };

    return (
        <Box sx={{ padding: "20px" }}>

            {/* ⭐ Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Page Header */}
            <HeadingCardingCard
                category="PRESCRIPTIONS"
                title="Outpatient Prescriptions"
                subtitle="View, verify, and manage outpatient medication requests received from doctors."
            />

            {/* ⭐ Prescriptions Modal - Now renders Prescriptions_Card inside Dialog */}
            <Dialog open={prescriptionsModalOpen} onClose={() => setPrescriptionsModalOpen(false)} fullWidth maxWidth="md">

                <DialogContent sx={{ p: 0 }}>
                    <Prescriptions_Card
                        data={selectedRow} // ⭐ Pass row data as prop (e.g., for prescriptions, name, etc.)
                        onClose={() => setPrescriptionsModalOpen(false)} // Optional close handler
                    />
                </DialogContent>
            </Dialog>

            {/* ⭐ TABLE COMPONENT - * icon calls handlePrescriptionsView to open card */}
            <TableComponent
                title="Outpatient Prescription List"
                columns={columns}
                rows={rows}
                onCreate={() => console.log("Add new outpatient record")}
                onDelete={(id) => console.log("Delete row:", id)}
                showView={false}
                customActions={[
                    {
                        icon: <VisibilityIcon fontSize="small" />, // ⭐ CHANGED FROM StarIcon TO VisibilityIcon
                        onClick: handlePrescriptionsView,
                        tooltip: "View Prescriptions Details",
                        color: "var(--color-primary)"
                    }
                ]}
            />

        </Box>
    );
}

export default Outpatient_View;