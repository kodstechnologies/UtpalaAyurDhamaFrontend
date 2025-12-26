// import React, { useState } from "react";

// import RestaurantIcon from "@mui/icons-material/Restaurant";
// import { Dialog, DialogContent, IconButton } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

// import HeadingCard from "../../../components/card/HeadingCard";
// import TableComponent from "../../../components/table/TableComponent";
// import { Eye } from "lucide-react";
// import LogFoodCard from "../../../components/card/nurseCard/LogFoodCard";
// import UpdateVitalsCard from "../../../components/card/nurseCard/UpdateVitalsCard";
// import CardBorder from "../../../components/card/CardBorder";
// import Search from "../../../components/search/Search";
// import ExportDataButton from "../../../components/buttons/ExportDataButton";
// import RedirectButton from "../../../components/buttons/RedirectButton";

// function Monitoring() {
//     const [open, setOpen] = useState(false);
//     const [popupType, setPopupType] = useState(null);
//     const [selectedPatient, setSelectedPatient] = useState(null);

//     const handleOpen = (type, row) => {
//         setPopupType(type);
//         setSelectedPatient(row);
//         setOpen(true);
//     };

//     const handleClose = () => {
//         setOpen(false);
//         setPopupType(null);
//         setSelectedPatient(null);
//     };

//     const columns = [
//         { field: "patientId", header: "Patient ID" },
//         { field: "patientName", header: "Patient Name" },
//         { field: "wardBed", header: "Ward / Bed" },
//         { field: "admissionDate", header: "Admission Date" },
//         { field: "doctor", header: "Consulting Doctor" },
//     ];

//     const rows = [
//         {
//             _id: "6925447e4f7901cd12909d33",
//             patientId: "6925447e4f7901cd12909d33",
//             patientName: "Sharavni",
//             wardBed: "General / 101",
//             admissionDate: "25/11/2025",
//             doctor: "Anjali D",
//         },
//     ];

//     const actions = [
//         {
//             label: "Log Food",
//             icon: <RestaurantIcon />,
//             color: "var(--color-icon-3)",
//             variant: "outlined",
//             onClick: (row) => handleOpen("food", row),
//         },
//         {
//             label: "Update Vitals",
//             icon: <Eye />,
//             color: "var(--color-success)",
//             variant: "contained",
//             onClick: (row) => handleOpen("vitals", row),
//         },
//     ];

//     return (
//         <>
//             <HeadingCard
//                 title="Admitted Patients"
//                 subtitle="Monitor admitted patients, log food intake, and update vital signs."
//                 breadcrumbItems={[
//                     { label: "Admin", url: "/admin/dashboard" },
//                     { label: "Monitoring" },
//                 ]}
//             />
//             <CardBorder justify="between" align="center" wrap={true} padding="2rem">
//                 <div style={{ flex: 1, marginRight: "1rem" }}>
//                     <Search
//                         value={searchText}
//                         onChange={(val) => setSearchText(val)}
//                         style={{ flex: 1 }}
//                     />
//                 </div>
//                 <div style={{ display: "flex", gap: "1rem" }}>
//                     <ExportDataButton
//                         rows={rows}
//                         columns={columns}
//                         fileName="nursing.xlsx"
//                     />
//                     <RedirectButton text="create" link="/admin/nursing/add" />
//                 </div>
//             </CardBorder>
//             <TableComponent
//                 columns={columns}
//                 rows={rows}
//                 actions={actions}
//                 showStatusBadge={false}
//             />

//             {/* 🔹 Popup Dialog */}
//             <Dialog
//                 open={open}
//                 onClose={handleClose}
//                 maxWidth="md"
//                 fullWidth
//                 PaperProps={{
//                     sx: {
//                         borderRadius: "18px",
//                         overflow: "hidden",
//                         backgroundColor: "transparent",
//                         boxShadow: "none",
//                         maxWidth: "600px",
//                     }
//                 }}
//                 BackdropProps={{
//                     sx: {
//                         backgroundColor: "rgba(0, 0, 0, 0.4)",
//                         backdropFilter: "blur(2px)",
//                     }
//                 }}
//             >
//                 <DialogContent sx={{ p: 0, m: 0 }}>
//                     {popupType === "food" && (
//                         <LogFoodCard
//                             patient={selectedPatient}
//                             onClose={handleClose}
//                         />
//                     )}

//                     {popupType === "vitals" && (
//                         <UpdateVitalsCard
//                             patient={selectedPatient}
//                             onClose={handleClose}
//                         />
//                     )}
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }

// export default Monitoring;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import { Eye } from "lucide-react";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";

function Monitoring() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");

    const handleOpen = (type, row) => {
        const params = new URLSearchParams({
            patientId: row._id || row.patientId || "",
            patientName: row.patientName || "",
        });
        if (type === "food") {
            navigate(`/nurse/monitoring/log-food?${params.toString()}`);
        } else if (type === "vitals") {
            navigate(`/nurse/monitoring/update-vitals?${params.toString()}`);
        }
    };

    const columns = [
        { field: "patientId", header: "Patient ID" },
        { field: "patientName", header: "Patient Name" },
        { field: "wardBed", header: "Ward / Bed" },
        { field: "admissionDate", header: "Admission Date" },
        { field: "doctor", header: "Consulting Doctor" },
    ];

    const rows = [
        {
            _id: "6925447e4f7901cd12909d33",
            patientId: "6925447e4f7901cd12909d33",
            patientName: "Sharavni",
            wardBed: "General / 101",
            admissionDate: "25/11/2025",
            doctor: "Anjali D",
        },
    ];

    const actions = [
        {
            label: "Log Food",
            icon: <RestaurantIcon />,
            color: "var(--color-icon-3)",
            variant: "outlined",
            onClick: (row) => handleOpen("food", row),
        },
        {
            label: "Update Vitals",
            icon: <Eye />,
            color: "var(--color-success)",
            variant: "contained",
            onClick: (row) => handleOpen("vitals", row),
        },
    ];

    return (
        <>
            <HeadingCard
                title="Admitted Patients"
                subtitle="Monitor admitted patients, log food intake, and update vital signs."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Monitoring" },
                ]}
            />
            <CardBorder justify="between" align="center" wrap={true} padding="2rem" className="mb-[2rem]">
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ flex: 1 }}
                    />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={rows}
                        columns={columns}
                        fileName="nursing.xlsx"
                    />
                </div>
            </CardBorder>
            <TableComponent
                columns={columns}
                rows={rows}
                actions={actions}
                showStatusBadge={false}
            />
        </>
    );
}

export default Monitoring;