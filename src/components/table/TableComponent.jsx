

// // import React, { useState, useMemo } from "react";
// // import {
// //     Table, TableHead, TableRow, TableCell, TableBody,
// //     TableContainer, Paper, Checkbox, IconButton, TextField,
// //     TablePagination, Stack, Typography, Button, Dialog,
// //     DialogTitle, DialogContent, DialogActions, Box,
// // } from "@mui/material";
// // import VisibilityIcon from "@mui/icons-material/Visibility";
// // import EditIcon from "@mui/icons-material/Edit";
// // import DeleteIcon from "@mui/icons-material/Delete";
// // import SearchIcon from "@mui/icons-material/Search";
// // import AddIcon from "@mui/icons-material/Add";
// // import DownloadIcon from "@mui/icons-material/Download";
// // import { X } from "lucide-react";
// // import { useNavigate } from "react-router-dom";
// // import * as XLSX from "xlsx";

// // import CreateEditCard from "../card/tableRelated/CreateEditCard";
// // import ViewCard from "../card/tableRelated/ViewCard";

// // function TableComponent({
// //     title = "Table Name",
// //     columns = [],
// //     rows = [],
// //     onDelete,
// //     onCreate,
// //     onCreateSubmit,
// //     onView,
// //     onEdit,
// //     onEditSubmit,
// //     viewPath = "/view",
// //     editPath = "/edit",

// //     showView = false,
// //     showEdit = false,
// //     showDelete = false,

// //     formFields = [],
// //     customActions = [],
// //     headerActions = [],

// //     showStatusBadge = null,
// //     statusField = null,
// //     extraFilters = null,

// //     showAddButton = true,
// //     showExportButton = false,
// // }) {
// //     const [search, setSearch] = useState("");
// //     const [selected, setSelected] = useState([]);
// //     const [page, setPage] = useState(0);
// //     const [rowsPerPage, setRowsPerPage] = useState(8);

// //     // Modal States
// //     const [createModalOpen, setCreateModalOpen] = useState(false);
// //     const [editModalOpen, setEditModalOpen] = useState(false);
// //     const [editRow, setEditRow] = useState(null);
// //     const [viewModalOpen, setViewModalOpen] = useState(false);
// //     const [viewRow, setViewRow] = useState(null);

// //     const navigate = useNavigate();

// //     // Status badge
// //     const detectedStatusField = useMemo(() => {
// //         if (statusField) return statusField;
// //         return columns.find(col =>
// //             ["status", "isActive", "active", "is_active", "state", "enabled"].includes(col.field)
// //         )?.field || null;
// //     }, [columns, statusField]);

// //     const shouldShowStatusBadge = showStatusBadge === null ? !!detectedStatusField : showStatusBadge;

// //     // Add Button
// //     const addButton = useMemo(() => {
// //         if (!showAddButton) return null;
// //         const isModalCreate = onCreateSubmit && formFields.length > 0;
// //         return {
// //             label: "Add New",
// //             icon: <AddIcon />,
// //             onClick: () => {
// //                 if (isModalCreate) setCreateModalOpen(true);
// //                 else if (onCreate) onCreate();
// //             },
// //             variant: "contained",
// //             sx: {
// //                 bgcolor: "var(--color-bg-table-button)",
// //                 color: "white",
// //                 textTransform: "none",
// //                 borderRadius: 3,
// //                 px: 3,
// //                 py: 1.2,
// //                 boxShadow: 3,
// //                 "&:hover": { bgcolor: "#4a3025" },
// //             },
// //         };
// //     }, [showAddButton, onCreateSubmit, formFields.length, onCreate]);

// //     // Export Button
// //     const exportButton = showExportButton ? {
// //         label: "Export Excel",
// //         icon: <DownloadIcon />,
// //         onClick: () => {
// //             const data = rows.map(row => {
// //                 const obj = {};
// //                 columns.forEach(col => {
// //                     obj[col.header] = row[col.field] ?? "";
// //                 });
// //                 return obj;
// //             });
// //             const ws = XLSX.utils.json_to_sheet(data);
// //             const wb = XLSX.utils.book_new();
// //             XLSX.utils.book_append_sheet(wb, ws, "Data");
// //             XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
// //         },
// //         variant: "outlined",
// //         sx: { borderColor: "var(--color-success)", color: "var(--color-success)" },
// //     } : null;

// //     const finalHeaderButtons = [
// //         ...(addButton ? [addButton] : []),
// //         ...(exportButton ? [exportButton] : []),
// //         ...headerActions,
// //     ];

// //     const filteredRows = useMemo(() => {
// //         return rows.filter(row =>
// //             Object.values(row).some(value =>
// //                 String(value ?? "").toLowerCase().includes(search.toLowerCase())
// //             )
// //         );
// //     }, [rows, search]);

// //     const handleSelectAll = e => {
// //         if (e.target.checked) setSelected(filteredRows.map(r => r._id));
// //         else setSelected([]);
// //     };

// //     const handleSelect = id => {
// //         setSelected(prev =>
// //             prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
// //         );
// //     };

// //     const viewFields = columns.map(col => ({ name: col.field, label: col.header }));

// //     const renderStatusBadge = value => {
// //         const isActive = value === true || ["active", "Active", "ACTIVE", "yes", "enabled"].includes(String(value));
// //         return (
// //             <Box sx={{
// //                 display: "inline-flex", alignItems: "center", gap: 0.8,
// //                 px: 1.5, py: 0.5, borderRadius: 3, fontSize: "0.75rem",
// //                 fontWeight: 600, textTransform: "uppercase",
// //                 bgcolor: isActive ? "color-mix(in srgb, var(--color-success) 20%, transparent)" : "color-mix(in srgb, var(--color-error) 20%, transparent)",
// //                 color: isActive ? "var(--color-success)" : "var(--color-error)",
// //             }}>
// //                 <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: isActive ? "var(--color-success)" : "var(--color-error)" }} />
// //                 {isActive ? "Active" : "Inactive"}
// //             </Box>
// //         );
// //     };

// //     const getActions = row => (
// //         <Stack direction="row" spacing={0.5} justifyContent="center">
// //             {showView && (
// //                 <IconButton
// //                     sx={{ color: "var(--color-primary)" }}
// //                     onClick={() => {
// //                         setViewRow(row);
// //                         setViewModalOpen(true);
// //                     }}
// //                     title="View"
// //                 >
// //                     <VisibilityIcon fontSize="small" />
// //                 </IconButton>
// //             )}
// //             {showEdit && (
// //                 <IconButton
// //                     sx={{ color: "var(--color-success)" }}
// //                     onClick={() => {
// //                         setEditRow(row);
// //                         setEditModalOpen(true);
// //                     }}
// //                     title="Edit"
// //                 >
// //                     <EditIcon fontSize="small" />
// //                 </IconButton>
// //             )}
// //             {showDelete && onDelete && (
// //                 <IconButton
// //                     sx={{ color: "var(--color-error)" }}
// //                     onClick={() => onDelete(row._id)}
// //                     title="Delete"
// //                 >
// //                     <DeleteIcon fontSize="small" />
// //                 </IconButton>
// //             )}
// //             {customActions.map((action, i) => (
// //                 <IconButton
// //                     key={i}
// //                     sx={{ color: action.color || "var(--color-primary)" }}
// //                     onClick={() => action.onClick(row)}
// //                     title={action.tooltip}
// //                 >
// //                     {action.icon}
// //                 </IconButton>
// //             ))}
// //         </Stack>
// //     );

// //     const hasActions = showView || showEdit || showDelete || customActions.length > 0;

// //     return (
// //         <Paper elevation={0} sx={{ p: 3, borderRadius: 3, minHeight: "30vh", bgcolor: "var(--color-bg-table)" }}>
// //             {/* Header */}
// //             <Stack direction="column" spacing={3}>
// //                 <Stack direction="row" justifyContent="space-between" alignItems="center">
// //                     <Stack direction="row" alignItems="center" spacing={3}>
// //                         {/* <Typography variant="h6" fontWeight={700}>{title}</Typography> */}
// //                         <Stack direction="row" alignItems="center" sx={{ width: 300, px: 1.5, py: 0.5, border: "1px solid #ddd", borderRadius: 2, bgcolor: "background.paper" }}>
// //                             <SearchIcon sx={{ color: "text.secondary" }} />
// //                             <TextField
// //                                 variant="standard" placeholder="Search..."
// //                                 fullWidth value={search} onChange={e => setSearch(e.target.value)}
// //                                 InputProps={{ disableUnderline: true }} sx={{ ml: 1 }}
// //                             />
// //                         </Stack>
// //                     </Stack>

// //                     {finalHeaderButtons.length > 0 && (
// //                         <Stack direction="row" spacing={2}>
// //                             {finalHeaderButtons.map((btn, i) => (
// //                                 <Button key={i} variant={btn.variant || "contained"} startIcon={btn.icon} onClick={btn.onClick} sx={btn.sx}>
// //                                     {btn.label}
// //                                 </Button>
// //                             ))}
// //                         </Stack>
// //                     )}
// //                 </Stack>

// //                 {extraFilters && (
// //                     <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
// //                         {extraFilters}
// //                     </Stack>
// //                 )}
// //             </Stack>

// //             {/* Table */}
// //             <TableContainer sx={{ mt: 3 }}>
// //                 <Table>
// //                     <TableHead>
// //                         <TableRow>
// //                             <TableCell padding="checkbox">
// //                                 <Checkbox
// //                                     checked={selected.length === filteredRows.length && filteredRows.length > 0}
// //                                     indeterminate={selected.length > 0 && selected.length < filteredRows.length}
// //                                     onChange={handleSelectAll}
// //                                 />
// //                             </TableCell>
// //                             <TableCell sx={{ color: "var(--color-text-dark)" }}>Sl. No.</TableCell>
// //                             {columns.map(col => (
// //                                 <TableCell key={col.field} sx={{ color: "var(--color-text-dark)" }}>
// //                                     {col.header}
// //                                 </TableCell>
// //                             ))}
// //                             {hasActions && <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>Actions</TableCell>}
// //                         </TableRow>
// //                     </TableHead>
// //                     <TableBody>
// //                         {filteredRows
// //                             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
// //                             .map((row, idx) => {
// //                                 const serialNo = page * rowsPerPage + idx + 1;
// //                                 return (
// //                                     <TableRow key={row._id || idx} hover>
// //                                         <TableCell padding="checkbox">
// //                                             <Checkbox checked={selected.includes(row._id)}
// //                                                 onChange={() => handleSelect(row._id)} />
// //                                         </TableCell>
// //                                         <TableCell>{serialNo}</TableCell>
// //                                         {columns.map(col => {
// //                                             if (shouldShowStatusBadge && col.field === detectedStatusField) {
// //                                                 return <TableCell key={col.field}>{renderStatusBadge(row[col.field])}</TableCell>;
// //                                             }
// //                                             return <TableCell key={col.field}>{row[col.field] ?? "-"}</TableCell>;
// //                                         })}
// //                                         {hasActions && <TableCell align="center">{getActions(row)}</TableCell>}
// //                                     </TableRow>
// //                                 );
// //                             })}
// //                     </TableBody>
// //                 </Table>
// //             </TableContainer>

// //             <TablePagination
// //                 component="div" count={filteredRows.length} page={page} rowsPerPage={rowsPerPage}
// //                 rowsPerPageOptions={[8, 10, 25, 50]}
// //                 onPageChange={(_, p) => setPage(p)}
// //                 onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
// //             />

// //             {/* CREATE MODAL - NOW WORKS */}
// //             <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)}
// //                 // maxWidth="md"
// //                 fullWidth
// //             >

// //                 <DialogContent dividers sx={{ p: "0", m: "0", backgroundColor: "rgba(0, 0, 0, 0)" }}>
// //                     <CreateEditCard
// //                         fields={formFields}
// //                         onSave={async (data) => {
// //                             await onCreateSubmit(data);
// //                             setCreateModalOpen(false);
// //                         }}
// //                         onCancel={() => setCreateModalOpen(false)}
// //                         isEdit={false}
// //                         showToast
// //                     />
// //                 </DialogContent>
// //             </Dialog>

// //             {/* EDIT MODAL - NOW WORKS */}
// //             <Dialog open={editModalOpen} onClose={() => { setEditModalOpen(false); setEditRow(null); }} maxWidth="md" fullWidth>

// //                 <DialogContent dividers sx={{ p: "0", m: "0", backgroundColor: "rgba(0, 0, 0, 0)" }}>
// //                     {editRow && (
// //                         <CreateEditCard
// //                             fields={formFields}
// //                             payload={editRow}
// //                             onSave={async (data) => {
// //                                 await onEditSubmit(data, editRow);
// //                                 setEditModalOpen(false);
// //                                 setEditRow(null);
// //                             }}
// //                             onCancel={() => { setEditModalOpen(false); setEditRow(null); }}
// //                             isEdit={true}
// //                             showToast
// //                         />
// //                     )}
// //                 </DialogContent>
// //             </Dialog>

// //             {/* VIEW MODAL */}
// //             <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="md" fullWidth>

// //                 <DialogContent dividers>
// //                     <Box p={2}>
// //                         {viewRow ? <ViewCard data={viewRow} fields={viewFields} title={title} /> : "Loading..."}
// //                     </Box>
// //                 </DialogContent>
// //             </Dialog>
// //         </Paper>
// //     );
// // }

// // export default TableComponent;


// import React, { useState, useMemo } from "react";
// import {
//     Table, TableHead, TableRow, TableCell, TableBody,
//     TableContainer, Paper, Checkbox, IconButton, TextField,
//     TablePagination, Stack, Typography, Button, Dialog,
//     DialogTitle, DialogContent, DialogActions, Box,
// } from "@mui/material";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import SearchIcon from "@mui/icons-material/Search";
// import AddIcon from "@mui/icons-material/Add";
// import DownloadIcon from "@mui/icons-material/Download";
// import { X } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import * as XLSX from "xlsx";

// import CreateEditCard from "../card/tableRelated/CreateEditCard";
// import ViewCard from "../card/tableRelated/ViewCard";

// function TableComponent({
//     title = "Table Name",
//     columns = [],
//     rows = [],
//     onDelete,
//     onCreate,
//     onCreateSubmit,
//     onView,
//     onEdit,
//     onEditSubmit,
//     viewPath = "/view",
//     editPath = "/edit",

//     showView = false,
//     showEdit = false,
//     showDelete = false,

//     formFields = [],
//     customActions = [],
//     headerActions = [],

//     showStatusBadge = null,
//     statusField = null,
//     extraFilters = null,

//     showAddButton = true,
//     showExportButton = false,
// }) {
//     const [search, setSearch] = useState("");
//     const [selected, setSelected] = useState([]);
//     const [page, setPage] = useState(0);
//     const [rowsPerPage, setRowsPerPage] = useState(8);

//     // Modal States
//     const [createModalOpen, setCreateModalOpen] = useState(false);
//     const [editModalOpen, setEditModalOpen] = useState(false);
//     const [editRow, setEditRow] = useState(null);
//     const [viewModalOpen, setViewModalOpen] = useState(false);
//     const [viewRow, setViewRow] = useState(null);

//     const navigate = useNavigate();

//     // Status badge
//     const detectedStatusField = useMemo(() => {
//         if (statusField) return statusField;
//         return columns.find(col =>
//             ["status", "isActive", "active", "is_active", "state", "enabled"].includes(col.field)
//         )?.field || null;
//     }, [columns, statusField]);

//     const shouldShowStatusBadge = showStatusBadge === null ? !!detectedStatusField : showStatusBadge;

//     // Add Button
//     const addButton = useMemo(() => {
//         if (!showAddButton) return null;
//         const isModalCreate = onCreateSubmit && formFields.length > 0;
//         return {
//             label: "Add New",
//             icon: <AddIcon />,
//             onClick: () => {
//                 if (isModalCreate) setCreateModalOpen(true);
//                 else if (onCreate) onCreate();
//             },
//             variant: "contained",
//             sx: {
//                 bgcolor: "var(--color-bg-table-button)",
//                 color: "white",
//                 textTransform: "none",
//                 borderRadius: 3,
//                 px: 3,
//                 py: 1.2,
//                 boxShadow: 3,
//                 "&:hover": { bgcolor: "#4a3025" },
//             },
//         };
//     }, [showAddButton, onCreateSubmit, formFields.length, onCreate]);

//     // Export Button
//     const exportButton = showExportButton ? {
//         label: "Export Excel",
//         icon: <DownloadIcon />,
//         onClick: () => {
//             const data = rows.map(row => {
//                 const obj = {};
//                 columns.forEach(col => {
//                     obj[col.header] = row[col.field] ?? "";
//                 });
//                 return obj;
//             });
//             const ws = XLSX.utils.json_to_sheet(data);
//             const wb = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(wb, ws, "Data");
//             XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
//         },
//         variant: "outlined",
//         sx: { borderColor: "var(--color-success)", color: "var(--color-success)" },
//     } : null;

//     const finalHeaderButtons = [
//         ...(addButton ? [addButton] : []),
//         ...(exportButton ? [exportButton] : []),
//         ...headerActions,
//     ];

//     const filteredRows = useMemo(() => {
//         return rows.filter(row =>
//             Object.values(row).some(value =>
//                 String(value ?? "").toLowerCase().includes(search.toLowerCase())
//             )
//         );
//     }, [rows, search]);

//     const handleSelectAll = e => {
//         if (e.target.checked) setSelected(filteredRows.map(r => r._id));
//         else setSelected([]);
//     };

//     const handleSelect = id => {
//         setSelected(prev =>
//             prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
//         );
//     };

//     const viewFields = columns.map(col => ({ name: col.field, label: col.header }));

//     const renderStatusBadge = value => {
//         const isActive = value === true || ["active", "Active", "ACTIVE", "yes", "enabled"].includes(String(value));
//         return (
//             <Box sx={{
//                 display: "inline-flex", alignItems: "center", gap: 0.8,
//                 px: 1.5, py: 0.5, borderRadius: 3, fontSize: "0.75rem",
//                 fontWeight: 600, textTransform: "uppercase",
//                 bgcolor: isActive ? "color-mix(in srgb, var(--color-success) 20%, transparent)" : "color-mix(in srgb, var(--color-error) 20%, transparent)",
//                 color: isActive ? "var(--color-success)" : "var(--color-error)",
//             }}>
//                 <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: isActive ? "var(--color-success)" : "var(--color-error)" }} />
//                 {isActive ? "Active" : "Inactive"}
//             </Box>
//         );
//     };

//     const getActions = row => (
//         <Stack direction="row" spacing={0.5} justifyContent="center">
//             {showView && (
//                 <IconButton
//                     sx={{ color: "var(--color-primary)" }}
//                     onClick={() => {
//                         setViewRow(row);
//                         setViewModalOpen(true);
//                     }}
//                     title="View"
//                 >
//                     <VisibilityIcon fontSize="small" />
//                 </IconButton>
//             )}
//             {showEdit && (
//                 <IconButton
//                     sx={{ color: "var(--color-success)" }}
//                     onClick={() => {
//                         setEditRow(row);
//                         setEditModalOpen(true);
//                     }}
//                     title="Edit"
//                 >
//                     <EditIcon fontSize="small" />
//                 </IconButton>
//             )}
//             {showDelete && onDelete && (
//                 <IconButton
//                     sx={{ color: "var(--color-error)" }}
//                     onClick={() => onDelete(row._id)}
//                     title="Delete"
//                 >
//                     <DeleteIcon fontSize="small" />
//                 </IconButton>
//             )}
//             {customActions.map((action, i) => (
//                 <IconButton
//                     key={i}
//                     sx={{ color: action.color || "var(--color-primary)" }}
//                     onClick={() => action.onClick(row)}
//                     title={action.tooltip}
//                 >
//                     {action.icon}
//                 </IconButton>
//             ))}
//         </Stack>
//     );

//     const hasActions = showView || showEdit || showDelete || customActions.length > 0;

//     return (
//         <Paper elevation={0} sx={{ p: 3, borderRadius: 3, minHeight: "30vh", bgcolor: "var(--color-bg-table)" }}>
//             {/* Header */}
//             <Stack direction="column" spacing={3}>
//                 <Stack direction="row" justifyContent="space-between" alignItems="center">
//                     <Stack direction="row" alignItems="center" spacing={3}>
//                         {/* <Typography variant="h6" fontWeight={700}>{title}</Typography> */}
//                         <Stack direction="row" alignItems="center" sx={{ width: 300, px: 1.5, py: 0.5, border: "1px solid #ddd", borderRadius: 2, bgcolor: "background.paper" }}>
//                             <SearchIcon sx={{ color: "text.secondary" }} />
//                             <TextField
//                                 variant="standard" placeholder="Search..."
//                                 fullWidth value={search} onChange={e => setSearch(e.target.value)}
//                                 InputProps={{ disableUnderline: true }} sx={{ ml: 1 }}
//                             />
//                         </Stack>
//                     </Stack>

//                     {finalHeaderButtons.length > 0 && (
//                         <Stack direction="row" spacing={2}>
//                             {finalHeaderButtons.map((btn, i) => (
//                                 <Button key={i} variant={btn.variant || "contained"} startIcon={btn.icon} onClick={btn.onClick} sx={btn.sx}>
//                                     {btn.label}
//                                 </Button>
//                             ))}
//                         </Stack>
//                     )}
//                 </Stack>

//                 {extraFilters && (
//                     <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
//                         {extraFilters}
//                     </Stack>
//                 )}
//             </Stack>

//             {/* Table */}
//             <TableContainer sx={{ mt: 3 }}>
//                 <Table>
//                     <TableHead>
//                         <TableRow>
//                             <TableCell padding="checkbox">
//                                 <Checkbox
//                                     checked={selected.length === filteredRows.length && filteredRows.length > 0}
//                                     indeterminate={selected.length > 0 && selected.length < filteredRows.length}
//                                     onChange={handleSelectAll}
//                                 />
//                             </TableCell>
//                             <TableCell sx={{ color: "var(--color-text-dark)" }}>Sl. No.</TableCell>
//                             {columns.map(col => (
//                                 <TableCell key={col.field} sx={{ color: "var(--color-text-dark)" }}>
//                                     {col.header}
//                                 </TableCell>
//                             ))}
//                             {hasActions && <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>Actions</TableCell>}
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {filteredRows
//                             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                             .map((row, idx) => {
//                                 const serialNo = page * rowsPerPage + idx + 1;
//                                 return (
//                                     <TableRow key={row._id || idx} hover>
//                                         <TableCell padding="checkbox">
//                                             <Checkbox checked={selected.includes(row._id)}
//                                                 onChange={() => handleSelect(row._id)} />
//                                         </TableCell>
//                                         <TableCell>{serialNo}</TableCell>
//                                         {columns.map(col => {
//                                             if (shouldShowStatusBadge && col.field === detectedStatusField) {
//                                                 return <TableCell key={col.field}>{renderStatusBadge(row[col.field])}</TableCell>;
//                                             }
//                                             return <TableCell key={col.field}>{row[col.field] ?? "-"}</TableCell>;
//                                         })}
//                                         {hasActions && <TableCell align="center">{getActions(row)}</TableCell>}
//                                     </TableRow>
//                                 );
//                             })}
//                     </TableBody>
//                 </Table>
//             </TableContainer>

//             <TablePagination
//                 component="div" count={filteredRows.length} page={page} rowsPerPage={rowsPerPage}
//                 rowsPerPageOptions={[8, 10, 25, 50]}
//                 onPageChange={(_, p) => setPage(p)}
//                 onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
//             />

//             {/* CREATE MODAL - NOW WORKS */}
//             <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)}
//                 // maxWidth="md"
//                 fullWidth
//             >

//                 <DialogContent dividers sx={{
//                     padding: "0",

//                 }}>
//                     <CreateEditCard
//                         fields={formFields}
//                         onSave={async (data) => {
//                             await onCreateSubmit(data);
//                             setCreateModalOpen(false);
//                         }}
//                         onCancel={() => setCreateModalOpen(false)}
//                         isEdit={false}
//                         showToast
//                     />
//                 </DialogContent>
//             </Dialog>

//             {/* EDIT MODAL - NOW WORKS */}
//             <Dialog open={editModalOpen} onClose={() => { setEditModalOpen(false); setEditRow(null); }} fullWidth >

//                 <DialogContent dividers
//                     sx={{
//                         padding: "0",

//                     }}>
//                     {editRow && (
//                         <CreateEditCard
//                             fields={formFields}
//                             payload={editRow}
//                             onSave={async (data) => {
//                                 await onEditSubmit(data, editRow);
//                                 setEditModalOpen(false);
//                                 setEditRow(null);
//                             }}
//                             onCancel={() => { setEditModalOpen(false); setEditRow(null); }}
//                             isEdit={true}
//                             showToast
//                         />
//                     )}
//                 </DialogContent>
//             </Dialog>

//             {/* VIEW MODAL */}
//             <Dialog open={viewModalOpen} onClose={() => { setViewModalOpen(false); setViewRow(null); }} fullWidth>
//                 <DialogContent dividers sx={{ padding: "0" }}>
//                     <Box sx={{ p: 0, margin: "0" }}>
//                         {viewRow ? (
//                             <ViewCard
//                                 data={viewRow}
//                                 fields={viewFields}
//                                 title={title}
//                                 onClose={() => {
//                                     setViewModalOpen(false);
//                                     setViewRow(null);
//                                 }}
//                             />
//                         ) : "Loading..."}
//                     </Box>
//                 </DialogContent>
//             </Dialog>
//         </Paper>
//     );
// }

// export default TableComponent;

import React, { useState, useMemo } from "react";
import {
    Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Checkbox, IconButton, TextField,
    TablePagination, Stack, Typography, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, Box,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import CreateEditCard from "../card/tableRelated/CreateEditCard";
import ViewCard from "../card/tableRelated/ViewCard";

function TableComponent({
    title = "Table Name",
    columns = [],
    rows = [],
    onDelete,
    onCreate,
    onCreateSubmit,
    onView,
    onEdit,
    onEditSubmit,
    viewPath = "/view",
    editPath = "/edit",

    showView = false,
    showEdit = false,
    showDelete = false,

    formFields = [],
    customActions = [],
    headerActions = [],

    showStatusBadge = null,
    statusField = null,
    extraFilters = null,

    showAddButton = true,
    showExportButton = false,
}) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    // Modal States
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewRow, setViewRow] = useState(null);

    const navigate = useNavigate();

    // Helper to singularize table title (e.g., "Doctors" -> "Doctor")
    const getSingularTitle = (tableTitle) => {
        if (!tableTitle) return "Item";
        return tableTitle.endsWith("s") ? tableTitle.slice(0, -1) : tableTitle;
    };

    // Status badge
    const detectedStatusField = useMemo(() => {
        if (statusField) return statusField;
        return columns.find(col =>
            ["status", "isActive", "active", "is_active", "state", "enabled"].includes(col.field)
        )?.field || null;
    }, [columns, statusField]);

    const shouldShowStatusBadge = showStatusBadge === null ? !!detectedStatusField : showStatusBadge;

    // Add Button
    const addButton = useMemo(() => {
        if (!showAddButton) return null;
        const isModalCreate = onCreateSubmit && formFields.length > 0;
        return {
            label: "Add New",
            icon: <AddIcon />,
            onClick: () => {
                if (isModalCreate) setCreateModalOpen(true);
                else if (onCreate) onCreate();
            },
            variant: "contained",
            sx: {
                bgcolor: "var(--color-bg-table-button)",
                color: "white",
                textTransform: "none",
                borderRadius: 3,
                px: 3,
                py: 1.2,
                boxShadow: 3,
                "&:hover": { bgcolor: "#4a3025" },
            },
        };
    }, [showAddButton, onCreateSubmit, formFields.length, onCreate]);

    // Export Button
    const exportButton = showExportButton ? {
        label: "Export Excel",
        icon: <DownloadIcon />,
        onClick: () => {
            const data = rows.map(row => {
                const obj = {};
                columns.forEach(col => {
                    obj[col.header] = row[col.field] ?? "";
                });
                return obj;
            });
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data");
            XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        },
        variant: "outlined",
        sx: { borderColor: "var(--color-success)", color: "var(--color-success)" },
    } : null;

    const finalHeaderButtons = [
        ...(addButton ? [addButton] : []),
        ...(exportButton ? [exportButton] : []),
        ...headerActions,
    ];

    const filteredRows = useMemo(() => {
        return rows.filter(row =>
            Object.values(row).some(value =>
                String(value ?? "").toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [rows, search]);

    const handleSelectAll = e => {
        if (e.target.checked) setSelected(filteredRows.map(r => r._id));
        else setSelected([]);
    };

    const handleSelect = id => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        );
    };

    const viewFields = columns.map(col => ({ name: col.field, label: col.header }));

    const renderStatusBadge = value => {
        const isActive = value === true || ["active", "Active", "ACTIVE", "yes", "enabled"].includes(String(value));
        return (
            <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.8,
                px: 1.5, py: 0.5, borderRadius: 3, fontSize: "0.75rem",
                fontWeight: 600, textTransform: "uppercase",
                bgcolor: isActive ? "color-mix(in srgb, var(--color-success) 20%, transparent)" : "color-mix(in srgb, var(--color-error) 20%, transparent)",
                color: isActive ? "var(--color-success)" : "var(--color-error)",
            }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: isActive ? "var(--color-success)" : "var(--color-error)" }} />
                {isActive ? "Active" : "Inactive"}
            </Box>
        );
    };

    const getActions = row => (
        <Stack direction="row" spacing={0.5} justifyContent="center">
            {showView && (
                <IconButton
                    sx={{ color: "var(--color-primary)" }}
                    onClick={() => {
                        setViewRow(row);
                        setViewModalOpen(true);
                    }}
                    title="View"
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            )}
            {showEdit && (
                <IconButton
                    sx={{ color: "var(--color-success)" }}
                    onClick={() => {
                        setEditRow(row);
                        setEditModalOpen(true);
                    }}
                    title="Edit"
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            )}
            {showDelete && onDelete && (
                <IconButton
                    sx={{ color: "var(--color-error)" }}
                    onClick={() => onDelete(row._id)}
                    title="Delete"
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            )}
            {customActions.map((action, i) => (
                <IconButton
                    key={i}
                    sx={{ color: action.color || "var(--color-primary)" }}
                    onClick={() => action.onClick(row)}
                    title={action.tooltip}
                >
                    {action.icon}
                </IconButton>
            ))}
        </Stack>
    );

    const hasActions = showView || showEdit || showDelete || customActions.length > 0;

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, minHeight: "30vh", bgcolor: "var(--color-bg-table)" }}>
            {/* Header */}
            <Stack direction="column" spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={3}>
                        {/* <Typography variant="h6" fontWeight={700}>{title}</Typography> */}
                        <Stack direction="row" alignItems="center" sx={{ width: 300, px: 1.5, py: 0.5, border: "1px solid #ddd", borderRadius: 2, bgcolor: "background.paper" }}>
                            <SearchIcon sx={{ color: "text.secondary" }} />
                            <TextField
                                variant="standard" placeholder="Search..."
                                fullWidth value={search} onChange={e => setSearch(e.target.value)}
                                InputProps={{ disableUnderline: true }} sx={{ ml: 1 }}
                            />
                        </Stack>
                    </Stack>

                    {finalHeaderButtons.length > 0 && (
                        <Stack direction="row" spacing={2}>
                            {finalHeaderButtons.map((btn, i) => (
                                <Button key={i} variant={btn.variant || "contained"} startIcon={btn.icon} onClick={btn.onClick} sx={btn.sx}>
                                    {btn.label}
                                </Button>
                            ))}
                        </Stack>
                    )}
                </Stack>

                {extraFilters && (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
                        {extraFilters}
                    </Stack>
                )}
            </Stack>

            {/* Table */}
            <TableContainer sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selected.length === filteredRows.length && filteredRows.length > 0}
                                    indeterminate={selected.length > 0 && selected.length < filteredRows.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell sx={{ color: "var(--color-text-dark)" }}>Sl. No.</TableCell>
                            {columns.map(col => (
                                <TableCell key={col.field} sx={{ color: "var(--color-text-dark)" }}>
                                    {col.header}
                                </TableCell>
                            ))}
                            {hasActions && <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, idx) => {
                                const serialNo = page * rowsPerPage + idx + 1;
                                return (
                                    <TableRow key={row._id || idx} hover>
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={selected.includes(row._id)}
                                                onChange={() => handleSelect(row._id)} />
                                        </TableCell>
                                        <TableCell>{serialNo}</TableCell>
                                        {columns.map(col => {
                                            if (shouldShowStatusBadge && col.field === detectedStatusField) {
                                                return <TableCell key={col.field}>{renderStatusBadge(row[col.field])}</TableCell>;
                                            }
                                            return <TableCell key={col.field}>{row[col.field] ?? "-"}</TableCell>;
                                        })}
                                        {hasActions && <TableCell align="center">{getActions(row)}</TableCell>}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div" count={filteredRows.length} page={page} rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[8, 10, 25, 50]}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
            />

            {/* CREATE MODAL - NOW WORKS */}
            <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)}
                // maxWidth="md"
                fullWidth
            >

                <DialogContent dividers sx={{
                    padding: "0",

                }}>
                    <CreateEditCard
                        fields={formFields}
                        onSave={async (data) => {
                            await onCreateSubmit(data);
                            setCreateModalOpen(false);
                        }}
                        onCancel={() => setCreateModalOpen(false)}
                        isEdit={false}
                        title={`Create ${getSingularTitle(title)}`}
                        showToast
                    />
                </DialogContent>
            </Dialog>

            {/* EDIT MODAL - NOW WORKS */}
            <Dialog open={editModalOpen} onClose={() => { setEditModalOpen(false); setEditRow(null); }} fullWidth >

                <DialogContent dividers
                    sx={{
                        padding: "0",

                    }}>
                    {editRow && (
                        <CreateEditCard
                            fields={formFields}
                            payload={editRow}
                            onSave={async (data) => {
                                await onEditSubmit(data, editRow);
                                setEditModalOpen(false);
                                setEditRow(null);
                            }}
                            onCancel={() => { setEditModalOpen(false); setEditRow(null); }}
                            isEdit={true}
                            title={`Edit ${getSingularTitle(title)}`}
                            showToast
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* VIEW MODAL */}
            <Dialog open={viewModalOpen} onClose={() => { setViewModalOpen(false); setViewRow(null); }} fullWidth>
                <DialogContent dividers sx={{ padding: "0" }}>
                    <Box sx={{ p: 0, margin: "0" }}>
                        {viewRow ? (
                            <ViewCard
                                data={viewRow}
                                fields={viewFields}
                                title={title}
                                onClose={() => {
                                    setViewModalOpen(false);
                                    setViewRow(null);
                                }}
                            />
                        ) : "Loading..."}
                    </Box>
                </DialogContent>
            </Dialog>
        </Paper>
    );
}

export default TableComponent;