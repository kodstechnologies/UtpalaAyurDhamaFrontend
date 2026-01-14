// // import { useState, useMemo, useEffect, useCallback } from "react";
// // import { Box, Stack, Button, CircularProgress, Chip } from "@mui/material";
// // import { useNavigate } from "react-router-dom";
// // import { useSelector } from "react-redux";
// // import ReplayIcon from "@mui/icons-material/Replay";
// // import PersonIcon from "@mui/icons-material/Person";
// // import EventIcon from "@mui/icons-material/Event";
// // import AccessTimeIcon from "@mui/icons-material/AccessTime";
// // import axios from "axios";
// // import { toast } from "react-toastify";

// // import HeadingCard from "../../../components/card/HeadingCard";
// // import TableComponent from "../../../components/table/TableComponent";
// // import DashboardCard from "../../../components/card/DashboardCard";
// // import CardBorder from "../../../components/card/CardBorder";
// // import Search from "../../../components/search/Search";
// // import ExportDataButton from "../../../components/buttons/ExportDataButton";
// // import { getApiUrl, getAuthHeaders } from "../../../config/api";

// // function FollowUps_View() {
// //     const [followUps, setFollowUps] = useState([]);
// //     const [isLoading, setIsLoading] = useState(true);
// //     const [searchText, setSearchText] = useState("");
// //     const [filter, setFilter] = useState("All");
// //     const navigate = useNavigate();
// //     const { user } = useSelector((state) => state.auth);

// //     // Fetch follow-ups from backend
// //     const fetchFollowUps = useCallback(async () => {
// //         if (!user?._id) {
// //             setIsLoading(false);
// //             return;
// //         }

// //         setIsLoading(true);
// //         try {
// //             // Fetch all follow-ups for the authenticated doctor
// //             const response = await axios.get(
// //                 getApiUrl(`examinations/followups/all/by-doctor`),
// //                 { headers: getAuthHeaders() }
// //             );

// //             if (response.data.success) {
// //                 const followUpData = response.data.data || [];

// //                 // Transform the data to match the table structure
// //                 const transformedFollowUps = followUpData.map((fup) => {
// //                     const followUpDate = fup.date
// //                         ? new Date(fup.date).toISOString().split("T")[0]
// //                         : "N/A";
// //                     const followUpTime = fup.date
// //                         ? new Date(fup.date).toLocaleTimeString("en-US", {
// //                             hour: "2-digit",
// //                             minute: "2-digit",
// //                             hour12: true
// //                         })
// //                         : "N/A";

// //                     const daysUntil = fup.daysUntil !== undefined ? fup.daysUntil : 0;

// //                     return {
// //                         _id: fup._id,
// //                         patientName: fup.patientName || "Unknown",
// //                         patientId: fup.patientUhid || fup.patientId || "N/A",
// //                         followUpDate,
// //                         followUpTime,
// //                         reason: fup.note || "Follow-up appointment",
// //                         status: fup.status || "Upcoming",
// //                         daysUntil,
// //                         examinationId: fup.examinationId,
// //                         patientIdRaw: fup.patientUserId || fup.patientId,
// //                     };
// //                 });

// //                 setFollowUps(transformedFollowUps);
// //             } else {
// //                 toast.error(response.data.message || "Failed to fetch follow-ups");
// //             }
// //         } catch (error) {
// //             console.error("Error fetching follow-ups:", error);
// //             toast.error(error.response?.data?.message || "Error fetching follow-ups");
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     }, [user]);

// //     useEffect(() => {
// //         fetchFollowUps();
// //     }, [fetchFollowUps]);

// //     // Filter follow-ups
// //     const filteredFollowUps = useMemo(() => {
// //         return followUps.filter((followUp) => {
// //             const searchMatch =
// //                 searchText === "" ||
// //                 followUp.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
// //                 followUp.patientId.toLowerCase().includes(searchText.toLowerCase()) ||
// //                 followUp.reason.toLowerCase().includes(searchText.toLowerCase());

// //             const statusMatch = filter === "All" || followUp.status === filter;

// //             return searchMatch && statusMatch;
// //         });
// //     }, [followUps, searchText, filter]);

// //     // Calculate statistics
// //     const stats = useMemo(() => {
// //         return {
// //             total: followUps.length,
// //             today: followUps.filter((f) => f.status === "Today").length,
// //             upcoming: followUps.filter((f) => f.status === "Upcoming").length,
// //             overdue: followUps.filter((f) => f.status === "Overdue").length,
// //         };
// //     }, [followUps]);

// //     const getDaysUntilDisplay = (daysUntil) => {
// //         if (daysUntil === 0) {
// //             return { text: "Today", color: "warning", variant: "filled" };
// //         } else if (daysUntil > 0) {
// //             if (daysUntil === 1) {
// //                 return { text: "Tomorrow", color: "info", variant: "filled" };
// //             } else if (daysUntil <= 7) {
// //                 return { text: `In ${daysUntil} days`, color: "info", variant: "outlined" };
// //             } else {
// //                 return { text: `In ${daysUntil} days`, color: "default", variant: "outlined" };
// //             }
// //         } else {
// //             return { text: `${Math.abs(daysUntil)} days ago`, color: "error", variant: "filled" };
// //         }
// //     };

// //     const columns = [
// //         { field: "patientName", header: "Patient Name" },
// //         { field: "patientId", header: "Patient ID" },
// //         { field: "followUpDate", header: "Date" },
// //         { field: "followUpTime", header: "Time" },
// //         {
// //             field: "daysUntil",
// //             header: "Timeline",
// //             render: (row) => {
// //                 const display = getDaysUntilDisplay(row.daysUntil);
// //                 return (
// //                     <Chip
// //                         icon={<AccessTimeIcon fontSize="small" />}
// //                         label={display.text}
// //                         color={display.color}
// //                         variant={display.variant}
// //                         size="small"
// //                         sx={{
// //                             fontWeight: 600,
// //                             "& .MuiChip-icon": {
// //                                 color: "inherit",
// //                             },
// //                         }}
// //                     />
// //                 );
// //             },
// //         },
// //         { field: "reason", header: "Reason" },
// //     ];

// //     const actions = [
// //         {
// //             icon: <PersonIcon fontSize="small" />,
// //             color: "var(--color-primary)",
// //             tooltip: "Patient Calendar",
// //             onClick: (row) => {

// //             },
// //         },
// //         // {
// //         //     icon: <PersonIcon fontSize="small" />,
// //         //     color: "var(--color-primary)",
// //         //     tooltip: "Patient Calendar",
// //         //     onClick: (row) => {
// //         //         if (row.patientIdRaw) {
// //         //             navigate(`/doctor/examination/${row.patientIdRaw}`);
// //         //         } else {
// //         //             toast.info("Patient information not available");
// //         //         }
// //         //     },
// //         // },
// //     ];


// //     return (
// //         <Box>
// //             <HeadingCard
// //                 title="Follow-ups"
// //                 subtitle="Manage and track patient follow-up appointments"
// //                 breadcrumbItems={[
// //                     { label: "Doctor", url: "/doctor/dashboard" },
// //                     { label: "Follow-ups" },
// //                 ]}
// //             />

// //             {/* Statistics Cards */}
// //             <Stack
// //                 direction={{ xs: "column", sm: "row" }}
// //                 spacing={3}
// //                 my={4}
// //                 justifyContent="flex-start"
// //                 sx={{
// //                     flexWrap: { xs: "wrap", sm: "nowrap" },
// //                 }}
// //             >
// //                 <DashboardCard title="Total Follow-ups" count={stats.total} icon={ReplayIcon} />
// //                 <DashboardCard title="Today" count={stats.today} icon={EventIcon} />
// //                 <DashboardCard title="Upcoming" count={stats.upcoming} icon={EventIcon} />
// //             </Stack>

// //             {/* Search */}
// //             <CardBorder
// //                 justify="between"
// //                 align="center"
// //                 wrap={true}
// //                 padding="2rem"
// //                 style={{
// //                     width: "100%",
// //                     marginBottom: "2rem",
// //                 }}
// //             >
// //                 <div style={{ flex: 1, marginRight: "1rem" }}>
// //                     <Search
// //                         value={searchText}
// //                         onChange={(val) => setSearchText(val)}
// //                         style={{ width: "100%" }}
// //                     />
// //                 </div>

// //                 <div style={{ display: "flex", gap: "1rem" }}>
// //                     <ExportDataButton
// //                         rows={filteredFollowUps}
// //                         columns={columns}
// //                         fileName="follow-ups.xlsx"
// //                     />
// //                 </div>
// //             </CardBorder>

// //             {/* Filter Buttons */}
// //             <Stack direction="row" spacing={2} mb={3}>
// //                 {["All", "Today", "Upcoming"].map((btn) => (
// //                     <Button
// //                         key={btn}
// //                         onClick={() => setFilter(btn)}
// //                         variant={filter === btn ? "contained" : "outlined"}
// //                         sx={{
// //                             px: 3,
// //                             py: 1,
// //                             borderRadius: 2,
// //                             bgcolor: filter === btn ? "var(--color-primary)" : "transparent",
// //                             color: filter === btn ? "white" : "var(--color-text-dark)",
// //                             borderColor: "var(--color-border)",
// //                             fontWeight: 600,
// //                             textTransform: "none",
// //                             "&:hover": {
// //                                 bgcolor: filter === btn ? "var(--color-primary-dark)" : "var(--color-bg-hover)",
// //                             },
// //                         }}
// //                     >
// //                         {btn}
// //                     </Button>
// //                 ))}
// //             </Stack>

// //             {/* Table */}
// //             {isLoading ? (
// //                 <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
// //                     <CircularProgress />
// //                 </Box>
// //             ) : (
// //             <TableComponent
// //                 title="Follow-ups"
// //                 columns={columns}
// //                     rows={filteredFollowUps}
// //                 actions={actions}
// //                 showView={false}
// //                 showEdit={false}
// //                 showDelete={false}
// //                 showAddButton={false}
// //                 showExportButton={false}
// //             />
// //             )}
// //         </Box>
// //     );
// // }

// // export default FollowUps_View;



// import { useState, useMemo, useEffect, useCallback } from "react";
// import { Box, Stack, Button, CircularProgress, Chip, Checkbox } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import ReplayIcon from "@mui/icons-material/Replay";
// import PersonIcon from "@mui/icons-material/Person";
// import EventIcon from "@mui/icons-material/Event";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import axios from "axios";
// import { toast } from "react-toastify";

// import HeadingCard from "../../../components/card/HeadingCard";
// import TableComponent from "../../../components/table/TableComponent";
// import DashboardCard from "../../../components/card/DashboardCard";
// import CardBorder from "../../../components/card/CardBorder";
// import Search from "../../../components/search/Search";
// import ExportDataButton from "../../../components/buttons/ExportDataButton";
// import { getApiUrl, getAuthHeaders } from "../../../config/api";

// function FollowUps_View() {
//     const [followUps, setFollowUps] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [searchText, setSearchText] = useState("");
//     const [filter, setFilter] = useState("All");
//     const navigate = useNavigate();
//     const { user } = useSelector((state) => state.auth);

//     // Fetch follow-ups from backend
//     const fetchFollowUps = useCallback(async () => {
//         if (!user?._id) {
//             setIsLoading(false);
//             return;
//         }

//         setIsLoading(true);
//         try {
//             // Fetch all follow-ups for the authenticated doctor
//             const response = await axios.get(
//                 getApiUrl(`examinations/followups/all/by-doctor`),
//                 { headers: getAuthHeaders() }
//             );

//             if (response.data.success) {
//                 const followUpData = response.data.data || [];

//                 // Transform the data to match the table structure
//                 const transformedFollowUps = followUpData.map((fup) => {
//                     const followUpDate = fup.date
//                         ? new Date(fup.date).toISOString().split("T")[0]
//                         : "N/A";
//                     const followUpTime = fup.date
//                         ? new Date(fup.date).toLocaleTimeString("en-US", {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                             hour12: true
//                         })
//                         : "N/A";

//                     const daysUntil = fup.daysUntil !== undefined ? fup.daysUntil : 0;

//                     return {
//                         _id: fup._id,
//                         patientName: fup.patientName || "Unknown",
//                         patientId: fup.patientUhid || fup.patientId || "N/A",
//                         followUpDate,
//                         followUpTime,
//                         reason: fup.note || "Follow-up appointment",
//                         status: fup.status || "Upcoming",
//                         daysUntil,
//                         examinationId: fup.examinationId,
//                         patientIdRaw: fup.patientUserId || fup.patientId,
//                         followUp: fup.followUp || false, // Add followUp boolean from backend
//                     };
//                 });

//                 setFollowUps(transformedFollowUps);
//             } else {
//                 toast.error(response.data.message || "Failed to fetch follow-ups");
//             }
//         } catch (error) {
//             console.error("Error fetching follow-ups:", error);
//             toast.error(error.response?.data?.message || "Error fetching follow-ups");
//         } finally {
//             setIsLoading(false);
//         }
//     }, [user]);

//     // Handle completing a follow-up
//     const handleCompleteFollowUp = useCallback(async (row) => {
//         if (!row.examinationId || !row._id) {
//             toast.error("Missing required data for update");
//             return;
//         }

//         try {
//             const response = await axios.post(
//                 getApiUrl(`examinations/followups/all/by-doctor`),
//                 {
//                     examinationId: row.examinationId,
//                     followUpId: row._id,
//                 },
//                 { headers: getAuthHeaders() }
//             );

//             if (response.data.success) {
//                 toast.success(response.data.message || "Follow-up marked as completed");
//                 fetchFollowUps(); // Refresh the list to reflect changes
//             } else {
//                 toast.error(response.data.message || "Failed to update follow-up");
//             }
//         } catch (error) {
//             console.error("Error updating follow-up:", error);
//             toast.error(error.response?.data?.message || "Error updating follow-up");
//         }
//     }, [fetchFollowUps]);

//     useEffect(() => {
//         fetchFollowUps();
//     }, [fetchFollowUps]);

//     // Filter follow-ups
//     const filteredFollowUps = useMemo(() => {
//         return followUps.filter((followUp) => {
//             const searchMatch =
//                 searchText === "" ||
//                 followUp.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
//                 followUp.patientId.toLowerCase().includes(searchText.toLowerCase()) ||
//                 followUp.reason.toLowerCase().includes(searchText.toLowerCase());

//             const statusMatch = filter === "All" || followUp.status === filter;

//             return searchMatch && statusMatch;
//         });
//     }, [followUps, searchText, filter]);

//     // Calculate statistics
//     const stats = useMemo(() => {
//         return {
//             total: followUps.length,
//             today: followUps.filter((f) => f.status === "Today").length,
//             upcoming: followUps.filter((f) => f.status === "Upcoming").length,
//             overdue: followUps.filter((f) => f.status === "Overdue").length,
//         };
//     }, [followUps]);

//     const getDaysUntilDisplay = (daysUntil) => {
//         if (daysUntil === 0) {
//             return { text: "Today", color: "warning", variant: "filled" };
//         } else if (daysUntil > 0) {
//             if (daysUntil === 1) {
//                 return { text: "Tomorrow", color: "info", variant: "filled" };
//             } else if (daysUntil <= 7) {
//                 return { text: `In ${daysUntil} days`, color: "info", variant: "outlined" };
//             } else {
//                 return { text: `In ${daysUntil} days`, color: "default", variant: "outlined" };
//             }
//         } else {
//             return { text: `${Math.abs(daysUntil)} days ago`, color: "error", variant: "filled" };
//         }
//     };

//     const columns = [

//         { field: "patientName", header: "Patient Name" },
//         { field: "patientId", header: "Patient ID" },
//         { field: "followUpDate", header: "Date" },
//         { field: "followUpTime", header: "Time" },
//         {
//             field: "daysUntil",
//             header: "Timeline",
//             render: (row) => {
//                 const display = getDaysUntilDisplay(row.daysUntil);
//                 return (
//                     <Chip
//                         icon={<AccessTimeIcon fontSize="small" />}
//                         label={display.text}
//                         color={display.color}
//                         variant={display.variant}
//                         size="small"
//                         sx={{
//                             fontWeight: 600,
//                             "& .MuiChip-icon": {
//                                 color: "inherit",
//                             },
//                         }}
//                     />
//                 );
//             },
//         },
//         { field: "reason", header: "Reason" },
//         {
//             field: "completed",
//             header: "Completed",
//             render: (row) => (
//                 <Checkbox
//                     checked={row.followUp || false}
//                     onChange={() => handleCompleteFollowUp(row)}
//                     disabled={row.followUp} // Prevent re-checking if already true
//                 />
//             ),
//         },
//     ];

//     // const actions = [
//     //     {
//     //         icon: <PersonIcon fontSize="small" />,
//     //         color: "var(--color-primary)",
//     //         tooltip: "Patient Calendar",
//     //         onClick: (row) => {

//     //         },
//     //     },
//     // {
//     //     icon: <PersonIcon fontSize="small" />,
//     //     color: "var(--color-primary)",
//     //     tooltip: "Patient Calendar",
//     //     onClick: (row) => {
//     //         if (row.patientIdRaw) {
//     //             navigate(`/doctor/examination/${row.patientIdRaw}`);
//     //         } else {
//     //             toast.info("Patient information not available");
//     //         }
//     //     },
//     // },
//     // ];


//     return (
//         <Box>
//             <HeadingCard
//                 title="Follow-ups"
//                 subtitle="Manage and track patient follow-up appointments"
//                 breadcrumbItems={[
//                     { label: "Doctor", url: "/doctor/dashboard" },
//                     { label: "Follow-ups" },
//                 ]}
//             />

//             {/* Statistics Cards */}
//             <Stack
//                 direction={{ xs: "column", sm: "row" }}
//                 spacing={3}
//                 my={4}
//                 justifyContent="flex-start"
//                 sx={{
//                     flexWrap: { xs: "wrap", sm: "nowrap" },
//                 }}
//             >
//                 <DashboardCard title="Total Follow-ups" count={stats.total} icon={ReplayIcon} />
//                 <DashboardCard title="Today" count={stats.today} icon={EventIcon} />
//                 <DashboardCard title="Upcoming" count={stats.upcoming} icon={EventIcon} />
//             </Stack>

//             {/* Search */}
//             <CardBorder
//                 justify="between"
//                 align="center"
//                 wrap={true}
//                 padding="2rem"
//                 style={{
//                     width: "100%",
//                     marginBottom: "2rem",
//                 }}
//             >
//                 <div style={{ flex: 1, marginRight: "1rem" }}>
//                     <Search
//                         value={searchText}
//                         onChange={(val) => setSearchText(val)}
//                         style={{ width: "100%" }}
//                     />
//                 </div>

//                 <div style={{ display: "flex", gap: "1rem" }}>
//                     <ExportDataButton
//                         rows={filteredFollowUps}
//                         columns={columns}
//                         fileName="follow-ups.xlsx"
//                     />
//                 </div>
//             </CardBorder>

//             {/* Filter Buttons */}
//             <Stack direction="row" spacing={2} mb={3}>
//                 {["All", "Today", "Upcoming"].map((btn) => (
//                     <Button
//                         key={btn}
//                         onClick={() => setFilter(btn)}
//                         variant={filter === btn ? "contained" : "outlined"}
//                         sx={{
//                             px: 3,
//                             py: 1,
//                             borderRadius: 2,
//                             bgcolor: filter === btn ? "var(--color-primary)" : "transparent",
//                             color: filter === btn ? "white" : "var(--color-text-dark)",
//                             borderColor: "var(--color-border)",
//                             fontWeight: 600,
//                             textTransform: "none",
//                             "&:hover": {
//                                 bgcolor: filter === btn ? "var(--color-primary-dark)" : "var(--color-bg-hover)",
//                             },
//                         }}
//                     >
//                         {btn}
//                     </Button>
//                 ))}
//             </Stack>

//             {/* Table */}
//             {isLoading ? (
//                 <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
//                     <CircularProgress />
//                 </Box>
//             ) : (
//                 <TableComponent
//                     title="Follow-ups"
//                     columns={columns}
//                     rows={filteredFollowUps}
//                     // actions={actions}
//                     showView={false}
//                     showEdit={false}
//                     showDelete={false}
//                     showAddButton={false}
//                     showExportButton={false}
//                 />
//             )}
//         </Box>
//     );
// }

// export default FollowUps_View;

import { useState, useMemo, useEffect, useCallback } from "react";
import { Box, Stack, Button, CircularProgress, Chip, Checkbox } from "@mui/material";
import { Box, Stack, Button, CircularProgress, Chip, Checkbox } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ReplayIcon from "@mui/icons-material/Replay";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import axios from "axios";
import { toast } from "react-toastify";
import doctorService from "../../../services/doctorService";

import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import DashboardCard from "../../../components/card/DashboardCard";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

function FollowUps_View() {
    const [followUps, setFollowUps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("All");
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // Fetch follow-ups from backend
    const fetchFollowUps = useCallback(async () => {
        if (!user?._id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Fetch all follow-ups for the authenticated doctor
            const response = await axios.get(
                getApiUrl(`examinations/followups/all/by-doctor`),
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                const followUpData = response.data.data || [];

                // Transform the data to match the table structure
                const transformedFollowUps = followUpData.map((fup) => {
                    const followUpDate = fup.date
                        ? new Date(fup.date).toISOString().split("T")[0]
                        : "N/A";
                    const followUpTime = fup.date
                        ? new Date(fup.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        })
                        : "N/A";

                    const daysUntil = fup.daysUntil !== undefined ? fup.daysUntil : 0;

                    // Parse examinationId if it's concatenated (e.g., "examId_followUpId") to extract the actual examination ID
                    let parsedExaminationId = fup.examinationId;
                    if (typeof fup.examinationId === 'string' && fup.examinationId.includes('_')) {
                        parsedExaminationId = fup.examinationId.split('_')[0]; // Assume first part is examinationId
                    }

                    return {
                        _id: fup._id,
                        followUpId: fup.followUpId || null,
                        patientName: fup.patientName || "Unknown",
                        patientId: fup.patientUhid || fup.patientId || "N/A",
                        followUpDate,
                        followUpTime,
                        reason: fup.note || "Follow-up appointment",
                        status: fup.status || "Upcoming",
                        daysUntil,
                        examinationId: parsedExaminationId, // Use parsed ID for updates
                        patientIdRaw: fup.patientUserId || fup.patientId,
                        completed: fup.completed || false,
                    };
                });

                setFollowUps(transformedFollowUps);
            } else {
                toast.error(response.data.message || "Failed to fetch follow-ups");
            }
        } catch (error) {
            console.error("Error fetching follow-ups:", error);
            toast.error(error.response?.data?.message || "Error fetching follow-ups");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Handle completing a follow-up
    const handleCompleteFollowUp = useCallback(async (row) => {
        console.log("🚀 ~ FollowUps_View ~ row:", row)
        if (!row.examinationId || !row._id) {
            toast.error("Missing required data for update");
            return;
        }

        try {
            const response = await axios.post(
                getApiUrl(`examinations/followups/all/by-doctor`),
                {
                    examinationId: row.examinationId, // Now using parsed valid ID
                    followUpId: row._id,
                },
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                toast.success(response.data.message || "Follow-up marked as completed");
                fetchFollowUps(); // Refresh the list to reflect changes
            } else {
                toast.error(response.data.message || "Failed to update follow-up");
            }
        } catch (error) {
            console.error("Error updating follow-up:", error);
            toast.error(error.response?.data?.message || "Error updating follow-up");
        }
    }, [fetchFollowUps]);

    useEffect(() => {
        fetchFollowUps();
    }, [fetchFollowUps]);

    // Filter follow-ups
    const filteredFollowUps = useMemo(() => {
        return followUps.filter((followUp) => {
            const searchMatch =
                searchText === "" ||
                followUp.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
                followUp.patientId.toLowerCase().includes(searchText.toLowerCase()) ||
                followUp.reason.toLowerCase().includes(searchText.toLowerCase());

            const statusMatch = filter === "All" || followUp.status === filter;

            return searchMatch && statusMatch;
        });
    }, [followUps, searchText, filter]);

    // Calculate statistics
    const stats = useMemo(() => {
        return {
            total: followUps.length,
            today: followUps.filter((f) => f.status === "Today").length,
            upcoming: followUps.filter((f) => f.status === "Upcoming").length,
            overdue: followUps.filter((f) => f.status === "Overdue").length,
        };
    }, [followUps]);

    const getDaysUntilDisplay = (daysUntil) => {
        if (daysUntil === 0) {
            return { text: "Today", color: "warning", variant: "filled" };
        } else if (daysUntil > 0) {
            if (daysUntil === 1) {
                return { text: "Tomorrow", color: "info", variant: "filled" };
            } else if (daysUntil <= 7) {
                return { text: `In ${daysUntil} days`, color: "info", variant: "outlined" };
            } else {
                return { text: `In ${daysUntil} days`, color: "default", variant: "outlined" };
            }
        } else {
            return { text: `${Math.abs(daysUntil)} days ago`, color: "error", variant: "filled" };
        }
    };

    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "patientId", header: "Patient ID" },
        { field: "followUpDate", header: "Date" },
        { field: "followUpTime", header: "Time" },
        {
            field: "daysUntil",
            header: "Timeline",
            render: (row) => {
                const display = getDaysUntilDisplay(row.daysUntil);
                return (
                    <Chip
                        icon={<AccessTimeIcon fontSize="small" />}
                        label={display.text}
                        color={display.color}
                        variant={display.variant}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            "& .MuiChip-icon": {
                                color: "inherit",
                            },
                        }}
                    />
                );
            },
        },
        { field: "reason", header: "Reason" },
    ];

    // Handle follow-up completion toggle
    const handleFollowUpToggle = async (row, event) => {
        event.stopPropagation(); // Prevent row click
        
        if (!row.examinationId || !row.followUpId) {
            toast.error("Unable to update follow-up. Missing required information.");
            return;
        }

        const newCompletedStatus = !row.completed;

        try {
            await doctorService.markFollowUpCompleted(
                row.examinationId,
                row.followUpId,
                newCompletedStatus
            );

            // Update local state
            setFollowUps((prevFollowUps) =>
                prevFollowUps.map((fup) =>
                    fup._id === row._id
                        ? { ...fup, completed: newCompletedStatus }
                        : fup
                )
            );

            toast.success(
                newCompletedStatus
                    ? "Follow-up marked as completed"
                    : "Follow-up marked as incomplete"
            );
        } catch (error) {
            console.error("Error updating follow-up:", error);
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to update follow-up status"
            );
        }
    };

    const actions = [
        {
            render: (row) => (
                <Checkbox
                    checked={row.completed || false}
                    onChange={(e) => handleFollowUpToggle(row, e)}
                    color="primary"
                    size="small"
                    sx={{
                        padding: "4px",
                        "& .MuiSvgIcon-root": {
                            fontSize: "1.2rem",
                        },
                    }}
                />
            ),
            tooltip: (row) => (row.completed ? "Mark as incomplete" : "Mark as completed"),
        },
    ];

    return (
        <Box>
            <HeadingCard
                title="Follow-ups"
                subtitle="Manage and track patient follow-up appointments"
                breadcrumbItems={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "Follow-ups" },
                ]}
            />

            {/* Statistics Cards */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                my={4}
                justifyContent="flex-start"
                sx={{
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
            >
                <DashboardCard title="Total Follow-ups" count={stats.total} icon={ReplayIcon} />
                <DashboardCard title="Today" count={stats.today} icon={EventIcon} />
                <DashboardCard title="Upcoming" count={stats.upcoming} icon={EventIcon} />
            </Stack>

            {/* Search */}
            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{
                    width: "100%",
                    marginBottom: "2rem",
                }}
            >
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredFollowUps}
                        columns={columns}
                        fileName="follow-ups.xlsx"
                    />
                </div>
            </CardBorder>

            {/* Filter Buttons */}
            <Stack direction="row" spacing={2} mb={3}>
                {["All", "Today", "Upcoming"].map((btn) => (
                    <Button
                        key={btn}
                        onClick={() => setFilter(btn)}
                        variant={filter === btn ? "contained" : "outlined"}
                        sx={{
                            px: 3,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: filter === btn ? "var(--color-primary)" : "transparent",
                            color: filter === btn ? "white" : "var(--color-text-dark)",
                            borderColor: "var(--color-border)",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": {
                                bgcolor: filter === btn ? "var(--color-primary-dark)" : "var(--color-bg-hover)",
                            },
                        }}
                    >
                        {btn}
                    </Button>
                ))}
            </Stack>

            {/* Table */}
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableComponent
                    title="Follow-ups"
                    columns={columns}
                    rows={filteredFollowUps}
                    showView={false}
                    showEdit={false}
                    showDelete={false}
                    showAddButton={false}
                    showExportButton={false}
                />
            )}
        </Box>
    );
}

export default FollowUps_View;