// import React from "react";
// import { Box } from "@mui/material";
// import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
// import HeadingCardingCard from "../../../../components/card/HeadingCard";
// import TableComponent from "../../../../components/table/TableComponent";

// function Inpatient_View() {
//     // ⭐ Breadcrumb Items
//     const breadcrumbItems = [
//         { label: "Home", url: "/" },
//         { label: "Pharmacist", url: "/pharmacist" },
//         { label: "Inpatient Prescriptions" }
//     ];

//     // ⭐ Table Columns
//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "age", header: "Age" },
//         { field: "gender", header: "Gender" },
//         { field: "doctor", header: "Doctor" },
//         { field: "diagnosis", header: "Diagnosis" },
//     ];

//     // ⭐ Example Table Data
//     const rows = [
//         {
//             _id: "101",
//             name: "Rohit Verma",
//             age: 45,
//             gender: "Male",
//             doctor: "Dr. Mehta",
//             diagnosis: "Diabetes Management",
//         },
//         {
//             _id: "102",
//             name: "Anusha Reddy",
//             age: 33,
//             gender: "Female",
//             doctor: "Dr. Iyer",
//             diagnosis: "Post-Surgery Medication",
//         }
//     ];

//     return (
//         <Box sx={{ padding: "20px" }}>

//             {/* ⭐ Breadcrumb Navigation */}
//             <Breadcrumb items={breadcrumbItems} />

//             {/* ⭐ Page Header */}
//             <HeadingCardingCard
//                 category="PRESCRIPTIONS"
//                 title="Inpatient Prescriptions"
//                 subtitle="Manage and dispense medications prescribed for admitted patients."
//             />

//             {/* ⭐ Inpatient Prescription Table */}
//             <TableComponent
//                 title="Inpatient Prescription List"
//                 columns={columns}
//                 rows={rows}
//                 onCreate={() => console.log("Add new inpatient prescription")}
//                 onDelete={(id) => console.log("Delete row:", id)}
//             />

//         </Box>
//     );
// }

// export default Inpatient_View;


// import React from "react";
// import { Box, Dialog, DialogContent } from "@mui/material";
// import VisibilityIcon from "@mui/icons-material/Visibility"; // ⭐ IMPORTED VisibilityIcon

// import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
// import HeadingCard from "../../../../components/card/HeadingCard";   // ✅ FIXED IMPORT
// import TableComponent from "../../../../components/table/TableComponent";

// import Prescriptions_Card from "../../../../components/card/prescriptions/Prescriptions_Card";

// function Inpatient_View() {
//     // ⭐ Breadcrumb items
//     const breadcrumbItems = [
//         { label: "Home", url: "/" },
//         { label: "Pharmacist", url: "/pharmacist" },
//         { label: "Inpatient Prescriptions" }
//     ];

//     // ⭐ Table Columns
//     const columns = [
//         { field: "name", header: "Name" },
//         { field: "age", header: "Age" },
//         { field: "gender", header: "Gender" },
//         { field: "doctor", header: "Doctor" },
//         { field: "diagnosis", header: "Diagnosis" },
//     ];

//     // ⭐ Table Data
//     const rows = [
//         {
//             _id: "101",
//             name: "Rohit Verma",
//             age: 45,
//             gender: "Male",
//             doctor: "Dr. Mehta",
//             diagnosis: "Diabetes Management",
//         },
//         {
//             _id: "102",
//             name: "Anusha Reddy",
//             age: 33,
//             gender: "Female",
//             doctor: "Dr. Iyer",
//             diagnosis: "Post-Surgery Medication",
//         }
//     ];

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
//             <HeadingCard
//                 category="PRESCRIPTIONS"
//                 title="Inpatient Prescriptions"
//                 subtitle="Manage and dispense medications prescribed for admitted patients."
//             />
//             {/* ⭐ Prescriptions Modal - Now renders Prescriptions_Card inside Dialog */}
//             <Dialog open={prescriptionsModalOpen} onClose={() => setPrescriptionsModalOpen(false)} fullWidth maxWidth="md">

//                 <DialogContent sx={{ p: 0 }}>
//                     <Prescriptions_Card
//                         data={selectedRow} // ⭐ Pass row data as prop (e.g., for prescriptions, name, etc.)
//                         onClose={() => setPrescriptionsModalOpen(false)} // Optional close handler
//                     />
//                 </DialogContent>
//             </Dialog>
//             {/* ⭐ Table Component (VIEW ONLY) */}
//             <TableComponent
//                 title="Inpatient Prescription List"
//                 columns={columns}
//                 rows={rows}

//                 /* ❌ Disable create, edit, delete */
//                 showAddButton={false}
//                 showEdit={false}
//                 showDelete={false}

//                 /* ✔ Only view row */
//                 showView={false}

//                 /* ❌ Remove extra icons */
//                 customActions={[
//                     {
//                         icon: <VisibilityIcon fontSize="small" />, // ⭐ CHANGED FROM StarIcon TO VisibilityIcon
//                         onClick: handlePrescriptionsView,
//                         tooltip: "View Prescriptions Details",
//                         color: "var(--color-primary)"
//                     }
//                 ]}
//                 /* ❌ Remove status badge */
//                 showStatusBadge={false}

//                 /* ❌ Remove header extra buttons */
//                 headerActions={[]}
//             />

//         </Box>
//     );
// }

// export default Inpatient_View;


import React, { useState } from "react";
import { Box, Dialog, DialogContent } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import Breadcrumb from "../../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../../components/card/HeadingCard";
import TableComponent from "../../../../components/table/TableComponent";

import Prescriptions_Card from "../../../../components/card/prescriptions/Prescriptions_Card";

function Inpatient_View() {

    // ⭐ FIX 1 — Add missing states
    const [selectedRow, setSelectedRow] = useState(null);
    const [prescriptionsModalOpen, setPrescriptionsModalOpen] = useState(false);

    // ⭐ Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Pharmacist", url: "/pharmacist" },
        { label: "Inpatient Prescriptions" }
    ];

    // ⭐ Table Columns
    const columns = [
        { field: "name", header: "Name" },
        { field: "age", header: "Age" },
        { field: "gender", header: "Gender" },
        { field: "doctor", header: "Doctor" },
        { field: "diagnosis", header: "Diagnosis" },
    ];

    // ⭐ Table Data
    const rows = [
        {
            _id: "101",
            name: "Rohit Verma",
            age: 45,
            gender: "Male",
            doctor: "Dr. Mehta",
            diagnosis: "Diabetes Management",
        },
        {
            _id: "102",
            name: "Anusha Reddy",
            age: 33,
            gender: "Female",
            doctor: "Dr. Iyer",
            diagnosis: "Post-Surgery Medication",
        }
    ];

    // ⭐ FIX 2 — Now the handler works properly
    const handlePrescriptionsView = (row) => {
        setSelectedRow(row);
        setPrescriptionsModalOpen(true);
        console.log("Prescriptions component opened for:", row);
    };

    return (
        <Box sx={{ padding: "20px" }}>

            {/* ⭐ Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Page Header */}
            <HeadingCard
                category="PRESCRIPTIONS"
                title="Inpatient Prescriptions"
                subtitle="Manage and dispense medications prescribed for admitted patients."
            />

            {/* ⭐ Modal */}
            <Dialog
                open={prescriptionsModalOpen}
                onClose={() => setPrescriptionsModalOpen(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogContent sx={{ p: 0 }}>
                    <Prescriptions_Card
                        data={selectedRow}
                        onClose={() => setPrescriptionsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* ⭐ Table */}
            <TableComponent
                title="Inpatient Prescription List"
                columns={columns}
                rows={rows}

                showAddButton={false}
                showEdit={false}
                showDelete={false}
                showView={false}

                customActions={[
                    {
                        icon: <VisibilityIcon fontSize="small" />,
                        onClick: handlePrescriptionsView,
                        tooltip: "View Prescriptions Details",
                        color: "var(--color-primary)"
                    }
                ]}

                showStatusBadge={false}
                headerActions={[]}
            />
        </Box>
    );
}

export default Inpatient_View;
