// // // // // // import React, { useState } from "react";
// // // // // // import {
// // // // // //     Table,
// // // // // //     TableHead,
// // // // // //     TableRow,
// // // // // //     TableCell,
// // // // // //     TableBody,
// // // // // //     TableContainer,
// // // // // //     Paper,
// // // // // //     Checkbox,
// // // // // //     IconButton,
// // // // // //     TextField,
// // // // // //     TablePagination,
// // // // // //     Stack,
// // // // // //     Typography,
// // // // // //     Button,
// // // // // //     Dialog,
// // // // // //     DialogTitle,
// // // // // //     DialogContent,
// // // // // //     DialogActions,
// // // // // //     Box,
// // // // // // } from "@mui/material";
// // // // // // import VisibilityIcon from "@mui/icons-material/Visibility";
// // // // // // import EditIcon from "@mui/icons-material/Edit";
// // // // // // import DeleteIcon from "@mui/icons-material/Delete";
// // // // // // import SearchIcon from "@mui/icons-material/Search";
// // // // // // import AddIcon from "@mui/icons-material/Add";
// // // // // // import { useNavigate } from "react-router-dom";
// // // // // // import CreateEditCard from "../card/tableRelated/CreateEditCard"; // Adjust path to import CreateEditCard
// // // // // // import ViewCard from "../card/tableRelated/ViewCard"; // Adjust path to import ViewCard
// // // // // // import { X } from 'lucide-react';

// // // // // // function TableComponent({
// // // // // //     title = "Table Name",
// // // // // //     columns = [],
// // // // // //     rows = [],
// // // // // //     onDelete,
// // // // // //     onCreate, // Legacy: () => void for navigation/direct action
// // // // // //     onCreateSubmit, // New: (data: any) => Promise<void> for modal create submit (API + refresh)
// // // // // //     onView, // Optional function (row) => void for View action (custom)
// // // // // //     onEdit, // Legacy: (row) => void for direct edit action
// // // // // //     onEditSubmit, // New: (data: any, row: any) => Promise<void> for modal edit submit
// // // // // //     viewPath = "/view", // Fallback navigation path if onView not provided and no modal
// // // // // //     editPath = "/edit", // Fallback navigation path if onEdit not provided
// // // // // //     // Action visibility toggles (default: false to hide by default)
// // // // // //     showView = false,
// // // // // //     showEdit = false,
// // // // // //     showDelete = false,
// // // // // //     // Form fields for modals: Array of { name: string, label: string, type: 'text' | 'email' | 'number' | 'date' | 'select', required: boolean, options?: array for select }
// // // // // //     formFields = [],
// // // // // //     // Custom actions: array of { icon: ReactNode, color: string, onClick: (row) => void, tooltip?: string }
// // // // // //     customActions = [],
// // // // // //     // Header actions: array of { label: string, icon?: ReactNode, onClick: () => void, variant?: string, color?: string, sx?: object }
// // // // // //     headerActions = [],
// // // // // //     // Legacy createModalContent (optional, but prefer formFields + onCreateSubmit for integration)
// // // // // //     createModalContent = null,
// // // // // // }) {
// // // // // //     const [search, setSearch] = useState("");
// // // // // //     const [selected, setSelected] = useState([]);
// // // // // //     const [page, setPage] = useState(0);
// // // // // //     const [rowsPerPage, setRowsPerPage] = useState(8);
// // // // // //     const [createModalOpen, setCreateModalOpen] = useState(false);
// // // // // //     const [editModalOpen, setEditModalOpen] = useState(false);
// // // // // //     const [editRow, setEditRow] = useState(null);
// // // // // //     const [viewModalOpen, setViewModalOpen] = useState(false);
// // // // // //     const [viewRow, setViewRow] = useState(null);
// // // // // //     const navigate = useNavigate();

// // // // // //     // Backward compatibility: Add default Create if onCreate/onCreateSubmit provided and no headerActions
// // // // // //     const effectiveHeaderActions = React.useMemo(() => {
// // // // // //         if ((onCreate || onCreateSubmit) && headerActions.length === 0) {
// // // // // //             const isModalCreate = onCreateSubmit && formFields.length > 0;
// // // // // //             return [
// // // // // //                 {
// // // // // //                     label: "Create",
// // // // // //                     icon: <AddIcon />,
// // // // // //                     onClick: () => {
// // // // // //                         if (isModalCreate) {
// // // // // //                             setCreateModalOpen(true);
// // // // // //                         } else if (onCreate) {
// // // // // //                             onCreate();
// // // // // //                         }
// // // // // //                     },
// // // // // //                     variant: "contained",
// // // // // //                     color: "primary",
// // // // // //                     sx: {
// // // // // //                         textTransform: "none",
// // // // // //                         borderRadius: 2,
// // // // // //                         backgroundColor: "var(--color-bg-table-button)",
// // // // // //                     }
// // // // // //                 }
// // // // // //             ];
// // // // // //         }
// // // // // //         return headerActions;
// // // // // //     }, [headerActions, onCreate, onCreateSubmit, formFields.length]);

// // // // // //     const filteredRows = rows.filter((row) =>
// // // // // //         Object.values(row).some((value) =>
// // // // // //             String(value).toLowerCase().includes(search.toLowerCase())
// // // // // //         )
// // // // // //     );

// // // // // //     const handleSelect = (id) => {
// // // // // //         setSelected((prev) =>
// // // // // //             prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
// // // // // //         );
// // // // // //     };

// // // // // //     const handleSelectAll = (event) => {
// // // // // //         if (event.target.checked) {
// // // // // //             setSelected(filteredRows.map((r) => r._id));
// // // // // //         } else {
// // // // // //             setSelected([]);
// // // // // //         }
// // // // // //     };

// // // // // //     // Derive view fields from columns for read-only display
// // // // // //     const viewFields = columns.map((col) => ({ name: col.field, label: col.header }));

// // // // // //     // Build action buttons for each row
// // // // // //     const getActions = (row) => (
// // // // // //         <Stack
// // // // // //             direction="row"
// // // // // //             spacing={0.5}
// // // // // //             justifyContent="center"
// // // // // //             alignItems="center"
// // // // // //             sx={{ width: "100%" }}
// // // // // //         >
// // // // // //             {showView && (
// // // // // //                 <IconButton
// // // // // //                     sx={{ color: "var(--color-primary)" }}
// // // // // //                     onClick={() => {
// // // // // //                         if (onView) {
// // // // // //                             onView(row);
// // // // // //                         } else {
// // // // // //                             setViewRow(row);
// // // // // //                             setViewModalOpen(true);
// // // // // //                         }
// // // // // //                     }}
// // // // // //                     title="View"
// // // // // //                 >
// // // // // //                     <VisibilityIcon fontSize="small" />
// // // // // //                 </IconButton>
// // // // // //             )}
// // // // // //             {showEdit && (
// // // // // //                 <IconButton
// // // // // //                     sx={{ color: "var(--color-success)" }}
// // // // // //                     onClick={() => {
// // // // // //                         const isModalEdit = onEditSubmit && formFields.length > 0;
// // // // // //                         if (isModalEdit) {
// // // // // //                             setEditRow(row);
// // // // // //                             setEditModalOpen(true);
// // // // // //                         } else if (onEdit) {
// // // // // //                             onEdit(row);
// // // // // //                         } else {
// // // // // //                             navigate(`${editPath}/${row._id}`);
// // // // // //                         }
// // // // // //                     }}
// // // // // //                     title="Edit"
// // // // // //                 >
// // // // // //                     <EditIcon fontSize="small" />
// // // // // //                 </IconButton>
// // // // // //             )}
// // // // // //             {showDelete && onDelete && (
// // // // // //                 <IconButton
// // // // // //                     sx={{ color: "var(--color-error)" }}
// // // // // //                     onClick={() => onDelete(row._id)}
// // // // // //                     title="Delete"
// // // // // //                 >
// // // // // //                     <DeleteIcon fontSize="small" />
// // // // // //                 </IconButton>
// // // // // //             )}
// // // // // //             {customActions.map((action, index) => (
// // // // // //                 <IconButton
// // // // // //                     key={index}
// // // // // //                     sx={{ color: action.color || "var(--color-primary)" }}
// // // // // //                     onClick={() => action.onClick(row)}
// // // // // //                     title={action.tooltip || "Custom Action"}
// // // // // //                 >
// // // // // //                     {action.icon}
// // // // // //                 </IconButton>
// // // // // //             ))}
// // // // // //         </Stack>
// // // // // //     );

// // // // // //     const hasActions = showView || showEdit || showDelete || customActions.length > 0;

// // // // // //     // Handle Create modal close
// // // // // //     const handleCreateModalClose = () => {
// // // // // //         setCreateModalOpen(false);
// // // // // //         // Legacy: if no formFields, call original onCreate after close
// // // // // //         if (onCreate && !onCreateSubmit) {
// // // // // //             onCreate();
// // // // // //         }
// // // // // //     };

// // // // // //     // Handle Edit modal close
// // // // // //     const handleEditModalClose = () => {
// // // // // //         setEditModalOpen(false);
// // // // // //         setEditRow(null);
// // // // // //     };

// // // // // //     // Handle View modal close
// // // // // //     const handleViewModalClose = () => {
// // // // // //         setViewModalOpen(false);
// // // // // //         setViewRow(null);
// // // // // //     };

// // // // // //     // Create modal content
// // // // // //     const createModalContentNode = createModalContent || (
// // // // // //         onCreateSubmit && formFields.length > 0 ? (
// // // // // //             <CreateEditCard
// // // // // //                 fields={formFields}
// // // // // //                 onSave={async (data) => {
// // // // // //                     await onCreateSubmit(data);
// // // // // //                     handleCreateModalClose();
// // // // // //                 }}
// // // // // //                 onCancel={handleCreateModalClose}
// // // // // //                 isEdit={false}
// // // // // //                 title="Create New Item"
// // // // // //                 showToast={true}
// // // // // //             />
// // // // // //         ) : (
// // // // // //             <Typography>No content provided for Create modal.</Typography>
// // // // // //         )
// // // // // //     );

// // // // // //     // Edit modal content
// // // // // //     const editModalContentNode = onEditSubmit && formFields.length > 0 ? (
// // // // // //         <CreateEditCard
// // // // // //             fields={formFields}
// // // // // //             payload={editRow}
// // // // // //             onSave={async (data) => {
// // // // // //                 await onEditSubmit(data, editRow);
// // // // // //                 handleEditModalClose();
// // // // // //             }}
// // // // // //             onCancel={handleEditModalClose}
// // // // // //             isEdit={true}
// // // // // //             title="Edit Item"
// // // // // //             showToast={true}
// // // // // //         />
// // // // // //     ) : (
// // // // // //         <Typography>No content provided for Edit modal.</Typography>
// // // // // //     );

// // // // // //     return (
// // // // // //         <Paper elevation={0} sx={{ padding: 3, borderRadius: 3, minHeight: "30vh", backgroundColor: "var(--color-bg-table)", color: "var(--color-text-dark)" }}>
// // // // // //             {/* Title + Search + Header Actions */}
// // // // // //             <Stack
// // // // // //                 direction="row"
// // // // // //                 alignItems="center"
// // // // // //                 justifyContent="space-between"
// // // // // //                 sx={{ mb: 2 }}
// // // // // //             >
// // // // // //                 {/* LEFT SIDE — TITLE + SEARCH */}
// // // // // //                 <Stack direction="row" alignItems="center" spacing={3}>
// // // // // //                     <Typography variant="h6" sx={{ fontWeight: 700 }}>
// // // // // //                         {title}
// // // // // //                     </Typography>
// // // // // //                     {/* Search Box */}
// // // // // //                     <Stack
// // // // // //                         direction="row"
// // // // // //                         alignItems="center"
// // // // // //                         spacing={1}
// // // // // //                         sx={{
// // // // // //                             width: "280px",
// // // // // //                             paddingX: 1,
// // // // // //                             paddingY: 0.5,
// // // // // //                             border: "1px solid #ccc",
// // // // // //                             borderRadius: 2,
// // // // // //                         }}
// // // // // //                     >
// // // // // //                         <SearchIcon sx={{ color: "var(--color-icons)" }} />
// // // // // //                         <TextField
// // // // // //                             sx={{
// // // // // //                                 color: "var(--color-text-light)",
// // // // // //                                 "& .MuiInputBase-root": {
// // // // // //                                     color: "var(--color-text-light)",
// // // // // //                                 },
// // // // // //                             }}
// // // // // //                             variant="standard"
// // // // // //                             placeholder="Search here"
// // // // // //                             fullWidth
// // // // // //                             value={search}
// // // // // //                             onChange={(e) => setSearch(e.target.value)}
// // // // // //                             InputProps={{
// // // // // //                                 disableUnderline: true,
// // // // // //                             }}
// // // // // //                         />
// // // // // //                     </Stack>
// // // // // //                 </Stack>
// // // // // //                 {/* RIGHT SIDE — HEADER ACTIONS */}
// // // // // //                 {effectiveHeaderActions.length > 0 && (
// // // // // //                     <Stack direction="row" spacing={1}>
// // // // // //                         {effectiveHeaderActions.map((action, index) => (
// // // // // //                             <Button
// // // // // //                                 key={index}
// // // // // //                                 variant={action.variant || "contained"}
// // // // // //                                 color={action.color || "primary"}
// // // // // //                                 startIcon={action.icon}
// // // // // //                                 onClick={action.onClick}
// // // // // //                                 sx={{
// // // // // //                                     textTransform: "none",
// // // // // //                                     borderRadius: 2,
// // // // // //                                     backgroundColor: action.sx?.backgroundColor || "var(--color-bg-table-button)",
// // // // // //                                     ...action.sx,
// // // // // //                                 }}
// // // // // //                             >
// // // // // //                                 {action.label}
// // // // // //                             </Button>
// // // // // //                         ))}
// // // // // //                     </Stack>
// // // // // //                 )}
// // // // // //             </Stack>
// // // // // //             {/* TABLE */}
// // // // // //             <TableContainer>
// // // // // //                 <Table>
// // // // // //                     <TableHead>
// // // // // //                         <TableRow>
// // // // // //                             <TableCell padding="checkbox">
// // // // // //                                 <Checkbox
// // // // // //                                     checked={selected.length > 0 && selected.length === filteredRows.length}
// // // // // //                                     onChange={handleSelectAll}
// // // // // //                                     sx={{
// // // // // //                                         color: "var(--color-checkmark)",
// // // // // //                                         "&.Mui-checked": {
// // // // // //                                             color: "var(--color-checkmark-light) !important",
// // // // // //                                         },
// // // // // //                                         "& .MuiSvgIcon-root": {
// // // // // //                                             fontSize: 24,
// // // // // //                                         }
// // // // // //                                     }}
// // // // // //                                 />
// // // // // //                             </TableCell>
// // // // // //                             <TableCell sx={{ color: "var(--color-text-dark)" }}>Sl. No.</TableCell>
// // // // // //                             {columns.map((col) => (
// // // // // //                                 <TableCell key={col.field} sx={{ color: "var(--color-text-dark)" }}>
// // // // // //                                     {col.header}
// // // // // //                                 </TableCell>
// // // // // //                             ))}
// // // // // //                             {hasActions && (
// // // // // //                                 <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>
// // // // // //                                     Actions
// // // // // //                                 </TableCell>
// // // // // //                             )}
// // // // // //                         </TableRow>
// // // // // //                     </TableHead>
// // // // // //                     <TableBody>
// // // // // //                         {filteredRows
// // // // // //                             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
// // // // // //                             .map((row, index) => {
// // // // // //                                 const realIndex = page * rowsPerPage + index + 1;
// // // // // //                                 return (
// // // // // //                                     <TableRow key={row._id} hover>
// // // // // //                                         <TableCell padding="checkbox">
// // // // // //                                             <Checkbox
// // // // // //                                                 checked={selected.includes(row._id)}
// // // // // //                                                 onChange={() => handleSelect(row._id)}
// // // // // //                                             />
// // // // // //                                         </TableCell>
// // // // // //                                         <TableCell>{realIndex}</TableCell>
// // // // // //                                         {columns.map((col) => (
// // // // // //                                             <TableCell key={col.field}>{row[col.field]}</TableCell>
// // // // // //                                         ))}
// // // // // //                                         {hasActions && (
// // // // // //                                             <TableCell align="center" style={{
// // // // // //                                                 textAlign: "center"
// // // // // //                                             }}>{getActions(row)}</TableCell>
// // // // // //                                         )}
// // // // // //                                     </TableRow>
// // // // // //                                 );
// // // // // //                             })}
// // // // // //                     </TableBody>
// // // // // //                 </Table>
// // // // // //             </TableContainer>
// // // // // //             {/* Pagination */}
// // // // // //             <TablePagination
// // // // // //                 component="div"
// // // // // //                 page={page}
// // // // // //                 count={filteredRows.length}
// // // // // //                 rowsPerPage={rowsPerPage}
// // // // // //                 rowsPerPageOptions={[8, 10, 20, 50]}
// // // // // //                 onPageChange={(e, newPage) => setPage(newPage)}
// // // // // //                 onRowsPerPageChange={(e) => {
// // // // // //                     setRowsPerPage(parseInt(e.target.value));
// // // // // //                     setPage(0);
// // // // // //                 }}
// // // // // //             />
// // // // // //             {/* CREATE MODAL */}
// // // // // //             <Dialog open={createModalOpen} onClose={handleCreateModalClose} maxWidth="md" fullWidth>

// // // // // //                 {/* 🔥 Title + Close Button in ONE ROW */}
// // // // // //                 <DialogTitle
// // // // // //                     sx={{
// // // // // //                         display: "flex",
// // // // // //                         alignItems: "center",
// // // // // //                         justifyContent: "space-between",
// // // // // //                         paddingRight: 2,
// // // // // //                     }}
// // // // // //                 >
// // // // // //                     Create New Item

// // // // // //                     <IconButton onClick={handleCreateModalClose} size="small">
// // // // // //                         <X />
// // // // // //                     </IconButton>
// // // // // //                 </DialogTitle>

// // // // // //                 <DialogContent>
// // // // // //                     <Box sx={{ p: 2 }}>
// // // // // //                         {createModalContentNode}
// // // // // //                     </Box>
// // // // // //                 </DialogContent>

// // // // // //             </Dialog>

// // // // // //             {/* EDIT MODAL */}
// // // // // //             <Dialog open={editModalOpen} onClose={handleEditModalClose} maxWidth="md" fullWidth>

// // // // // //                 {/* 🔥 Title + X button in ONE row */}
// // // // // //                 <DialogTitle
// // // // // //                     sx={{
// // // // // //                         display: "flex",
// // // // // //                         alignItems: "center",
// // // // // //                         justifyContent: "space-between",
// // // // // //                         paddingRight: 2,
// // // // // //                     }}
// // // // // //                 >
// // // // // //                     Edit Item

// // // // // //                     <IconButton onClick={handleEditModalClose} size="small">
// // // // // //                         <X />
// // // // // //                     </IconButton>
// // // // // //                 </DialogTitle>

// // // // // //                 <DialogContent>
// // // // // //                     <Box sx={{ p: 2 }}>
// // // // // //                         {editModalContentNode}
// // // // // //                     </Box>
// // // // // //                 </DialogContent>
// // // // // //             </Dialog>

// // // // // //             {/* VIEW MODAL */}
// // // // // //             <Dialog open={viewModalOpen} onClose={handleViewModalClose} maxWidth="md" fullWidth>

// // // // // //                 <DialogTitle
// // // // // //                     sx={{
// // // // // //                         display: "flex",
// // // // // //                         alignItems: "center",
// // // // // //                         justifyContent: "space-between",
// // // // // //                         paddingRight: 2,
// // // // // //                     }}
// // // // // //                 >
// // // // // //                     View Details

// // // // // //                     <IconButton onClick={handleViewModalClose} size="small">
// // // // // //                         <X />
// // // // // //                     </IconButton>
// // // // // //                 </DialogTitle>

// // // // // //                 <DialogContent>
// // // // // //                     <Box sx={{ p: 2 }}>
// // // // // //                         {viewRow ? (
// // // // // //                             <ViewCard
// // // // // //                                 data={viewRow}
// // // // // //                                 fields={viewFields}
// // // // // //                                 title={`${title} Details`}
// // // // // //                             />
// // // // // //                         ) : (
// // // // // //                             <Typography>Loading...</Typography>
// // // // // //                         )}
// // // // // //                     </Box>
// // // // // //                 </DialogContent>

// // // // // //             </Dialog>

// // // // // //         </Paper>
// // // // // //     );
// // // // // // }

// // // // // // export default TableComponent;

// // // // // // TableComponent.jsx

// // // // // import React, { useState, useMemo } from "react";
// // // // // import {
// // // // //     Table,
// // // // //     TableHead,
// // // // //     TableRow,
// // // // //     TableCell,
// // // // //     TableBody,
// // // // //     TableContainer,
// // // // //     Paper,
// // // // //     Checkbox,
// // // // //     IconButton,
// // // // //     TextField,
// // // // //     TablePagination,
// // // // //     Stack,
// // // // //     Typography,
// // // // //     Button,
// // // // //     Dialog,
// // // // //     DialogTitle,
// // // // //     DialogContent,
// // // // //     Box,
// // // // // } from "@mui/material";
// // // // // import VisibilityIcon from "@mui/icons-material/Visibility";
// // // // // import EditIcon from "@mui/icons-material/Edit";
// // // // // import DeleteIcon from "@mui/icons-material/Delete";
// // // // // import SearchIcon from "@mui/icons-material/Search";
// // // // // import AddIcon from "@mui/icons-material/Add";
// // // // // import { X } from "lucide-react";
// // // // // import { useNavigate } from "react-router-dom";

// // // // // import CreateEditCard from "../card/tableRelated/CreateEditCard";
// // // // // import ViewCard from "../card/tableRelated/ViewCard";

// // // // // function TableComponent({
// // // // //     title = "Table Name",
// // // // //     columns = [],
// // // // //     rows = [],
// // // // //     onDelete,
// // // // //     onCreate,
// // // // //     onCreateSubmit,
// // // // //     onView,
// // // // //     onEdit,
// // // // //     onEditSubmit,
// // // // //     viewPath = "/view",
// // // // //     editPath = "/edit",

// // // // //     showView = false,
// // // // //     showEdit = false,
// // // // //     showDelete = false,

// // // // //     formFields = [],
// // // // //     customActions = [],
// // // // //     headerActions = [],
// // // // //     createModalContent = null,

// // // // //     // Status Badge Control
// // // // //     showStatusBadge = null, // null = auto-detect, true = force show, false = hide
// // // // //     statusField = null,     // e.g., "status", "isActive"
// // // // // }) {
// // // // //     const [search, setSearch] = useState("");
// // // // //     const [selected, setSelected] = useState([]);
// // // // //     const [page, setPage] = useState(0);
// // // // //     const [rowsPerPage, setRowsPerPage] = useState(8);
// // // // //     const [createModalOpen, setCreateModalOpen] = useState(false);
// // // // //     const [editModalOpen, setEditModalOpen] = useState(false);
// // // // //     const [editRow, setEditRow] = useState(null);
// // // // //     const [viewModalOpen, setViewModalOpen] = useState(false);
// // // // //     const [viewRow, setViewRow] = useState(null);

// // // // //     const navigate = useNavigate();

// // // // //     // Auto-detect status field
// // // // //     const detectedStatusField = useMemo(() => {
// // // // //         if (statusField) return statusField;
// // // // //         return (
// // // // //             columns.find((col) =>
// // // // //                 ["status", "isActive", "active", "is_active", "state", "enabled"].includes(col.field)
// // // // //             )?.field || null
// // // // //         );
// // // // //     }, [columns, statusField]);

// // // // //     const shouldShowStatusBadge =
// // // // //         showStatusBadge === null ? !!detectedStatusField : showStatusBadge;

// // // // //     // Auto-add Create button if needed
// // // // //     const effectiveHeaderActions = useMemo(() => {
// // // // //         if ((onCreate || onCreateSubmit) && headerActions.length === 0) {
// // // // //             const isModalCreate = onCreateSubmit && formFields.length > 0;
// // // // //             return [
// // // // //                 {
// // // // //                     label: "Create",
// // // // //                     icon: <AddIcon />,
// // // // //                     onClick: () => {
// // // // //                         if (isModalCreate) setCreateModalOpen(true);
// // // // //                         else if (onCreate) onCreate();
// // // // //                     },
// // // // //                     variant: "contained",
// // // // //                     color: "primary",
// // // // //                     sx: { textTransform: "none", borderRadius: 2 },
// // // // //                 },
// // // // //             ];
// // // // //         }
// // // // //         return headerActions;
// // // // //     }, [headerActions, onCreate, onCreateSubmit, formFields.length]);

// // // // //     // Search filter
// // // // //     const filteredRows = useMemo(() => {
// // // // //         return rows.filter((row) =>
// // // // //             Object.values(row).some((value) =>
// // // // //                 String(value ?? "").toLowerCase().includes(search.toLowerCase())
// // // // //             )
// // // // //         );
// // // // //     }, [rows, search]);

// // // // //     const handleSelect = (id) => {
// // // // //         setSelected((prev) =>
// // // // //             prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
// // // // //         );
// // // // //     };

// // // // //     const handleSelectAll = (event) => {
// // // // //         if (event.target.checked) {
// // // // //             setSelected(filteredRows.map((r) => r._id));
// // // // //         } else {
// // // // //             setSelected([]);
// // // // //         }
// // // // //     };

// // // // //     const viewFields = columns.map((col) => ({ name: col.field, label: col.header }));

// // // // //     // Status Badge Renderer
// // // // //     const renderStatusBadge = (value) => {
// // // // //         const isActive =
// // // // //             value === true ||
// // // // //             ["active", "Active", "ACTIVE", "yes", "enabled"].includes(String(value));

// // // // //         return (
// // // // //             <Box
// // // // //                 sx={{
// // // // //                     display: "inline-flex",
// // // // //                     alignItems: "center",
// // // // //                     gap: 0.8,
// // // // //                     px: 1.5,
// // // // //                     py: 0.5,
// // // // //                     borderRadius: 3,
// // // // //                     fontSize: "0.75rem",
// // // // //                     fontWeight: 600,
// // // // //                     textTransform: "uppercase",
// // // // //                     backgroundColor: isActive
// // // // //                         ? "color-mix(in srgb, var(--color-success) 20%, transparent)"
// // // // //                         : "color-mix(in srgb, var(--color-error) 20%, transparent)",
// // // // //                     color: isActive ? "var(--color-success)" : "var(--color-error)",
// // // // //                 }}
// // // // //             >
// // // // //                 <Box
// // // // //                     sx={{
// // // // //                         width: 8,
// // // // //                         height: 8,
// // // // //                         borderRadius: "50%",
// // // // //                         backgroundColor: isActive ? "var(--color-success)" : "var(--color-error)",
// // // // //                     }}
// // // // //                 />
// // // // //                 {isActive ? "Active" : "Inactive"}
// // // // //             </Box>
// // // // //         );
// // // // //     };

// // // // //     // Row Actions
// // // // //     const getActions = (row) => (
// // // // //         <Stack direction="row" spacing={0.5} justifyContent="center">
// // // // //             {showView && (
// // // // //                 <IconButton
// // // // //                     sx={{ color: "var(--color-primary)" }}
// // // // //                     onClick={() => {
// // // // //                         if (onView) onView(row);
// // // // //                         else {
// // // // //                             setViewRow(row);
// // // // //                             setViewModalOpen(true);
// // // // //                         }
// // // // //                     }}
// // // // //                     title="View"
// // // // //                 >
// // // // //                     <VisibilityIcon fontSize="small" />
// // // // //                 </IconButton>
// // // // //             )}

// // // // //             {showEdit && (
// // // // //                 <IconButton
// // // // //                     sx={{ color: "var(--color-success)" }}
// // // // //                     onClick={() => {
// // // // //                         const isModalEdit = onEditSubmit && formFields.length > 0;
// // // // //                         if (isModalEdit) {
// // // // //                             setEditRow(row);
// // // // //                             setEditModalOpen(true);
// // // // //                         } else if (onEdit) {
// // // // //                             onEdit(row);
// // // // //                         } else {
// // // // //                             navigate(`${editPath}/${row._id}`);
// // // // //                         }
// // // // //                     }}
// // // // //                     title="Edit"
// // // // //                 >
// // // // //                     <EditIcon fontSize="small" />
// // // // //                 </IconButton>
// // // // //             )}

// // // // //             {showDelete && onDelete && (
// // // // //                 <IconButton
// // // // //                     sx={{ color: "var(--color-error)" }}
// // // // //                     onClick={() => onDelete(row._id)}
// // // // //                     title="Delete"
// // // // //                 >
// // // // //                     <DeleteIcon fontSize="small" />
// // // // //                 </IconButton>
// // // // //             )}

// // // // //             {customActions.map((action, i) => (
// // // // //                 <IconButton
// // // // //                     key={i}
// // // // //                     sx={{ color: action.color || "var(--color-primary)" }}
// // // // //                     onClick={() => action.onClick(row)}
// // // // //                     title={action.tooltip}
// // // // //                 >
// // // // //                     {action.icon}
// // // // //                 </IconButton>
// // // // //             ))}
// // // // //         </Stack>
// // // // //     );

// // // // //     const hasActions = showView || showEdit || showDelete || customActions.length > 0;

// // // // //     return (
// // // // //         <Paper
// // // // //             elevation={0}
// // // // //             sx={{
// // // // //                 p: 3,
// // // // //                 borderRadius: 3,
// // // // //                 minHeight: "30vh",
// // // // //                 bgcolor: "var(--color-bg-table)",
// // // // //                 color: "var(--color-text-dark)",
// // // // //             }}
// // // // //         >
// // // // //             {/* Header */}
// // // // //             {/* <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
// // // // //                 <Stack direction="row" alignItems="center" spacing={3}>
// // // // //                     <Typography variant="h6" fontWeight={700}>
// // // // //                         {title}
// // // // //                     </Typography>

// // // // //                     <Stack
// // // // //                         direction="row"
// // // // //                         alignItems="center"
// // // // //                         sx={{
// // // // //                             width: 280,
// // // // //                             px: 1.5,
// // // // //                             py: 0.5,
// // // // //                             border: "1px solid #ddd",
// // // // //                             borderRadius: 2,
// // // // //                             bgcolor: "background.paper",
// // // // //                         }}
// // // // //                     >
// // // // //                         <SearchIcon sx={{ color: "text.secondary" }} />
// // // // //                         <TextField
// // // // //                             variant="standard"
// // // // //                             placeholder="Search..."
// // // // //                             fullWidth
// // // // //                             value={search}
// // // // //                             onChange={(e) => setSearch(e.target.value)}
// // // // //                             InputProps={{ disableUnderline: true }}
// // // // //                             sx={{ ml: 1 }}
// // // // //                         />
// // // // //                     </Stack>
// // // // //                 </Stack>

// // // // //                 {effectiveHeaderActions.length > 0 && (
// // // // //                     <Stack direction="row" spacing={1}>
// // // // //                         {effectiveHeaderActions.map((action, i) => (
// // // // //                             // <Button
// // // // //                             //     key={i}
// // // // //                             //     variant={action.variant || "contained"}
// // // // //                             //     color={action.color || "primary"}
// // // // //                             //     startIcon={action.icon}
// // // // //                             //     onClick={action.onClick}
// // // // //                             //     sx={{ textTransform: "none", borderRadius: 2, ...action.sx, backgroundColor: action.sx?.backgroundColor || "var(--color-bg-table-button)" }}
// // // // //                             // >
// // // // //                             //     {action.label}
// // // // //                             // </Button>
// // // // //                             <Button
// // // // //                                 key={i}
// // // // //                                 variant={action.variant || "contained"}
// // // // //                                 color={action.color || "primary"}
// // // // //                                 startIcon={action.icon}
// // // // //                                 onClick={action.onClick}
// // // // //                                 sx={{
// // // // //                                     textTransform: "none",
// // // // //                                     borderRadius: 2,
// // // // //                                     position: "relative",
// // // // //                                     overflow: "hidden",
// // // // //                                     px: 2,
// // // // //                                     backgroundColor:
// // // // //                                         action.sx?.backgroundColor || "var(--color-bg-table-button)",
// // // // //                                     color: "var(--color-text-white)",

// // // // //                                     "&::after": {
// // // // //                                         content: '""',
// // // // //                                         position: "absolute",
// // // // //                                         top: 0,
// // // // //                                         left: "-150%",
// // // // //                                         width: "120%",
// // // // //                                         height: "100%",
// // // // //                                         background:
// // // // //                                             "linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent)",
// // // // //                                         transition: "0.6s",
// // // // //                                     },

// // // // //                                     "&:hover::after": {
// // // // //                                         left: "150%",
// // // // //                                     },

// // // // //                                     ...action.sx,
// // // // //                                 }}
// // // // //                             >
// // // // //                                 {action.label}
// // // // //                             </Button>

// // // // //                         ))}
// // // // //                     </Stack>
// // // // //                 )}
// // // // //             </Stack> */}
// // // // //             {/* Header */}
// // // // //             <Stack direction="column" spacing={3}>
// // // // //                 {/* Top: Title + Search + Buttons */}
// // // // //                 <Stack direction="row" justifyContent="space-between" alignItems="center">
// // // // //                     <Stack direction="row" alignItems="center" spacing={3}>
// // // // //                         <Typography variant="h6" fontWeight={700}>
// // // // //                             {title}
// // // // //                         </Typography>

// // // // //                         <Stack
// // // // //                             direction="row"
// // // // //                             alignItems="center"
// // // // //                             sx={{
// // // // //                                 width: 300,
// // // // //                                 px: 1.5,
// // // // //                                 py: 0.5,
// // // // //                                 border: "1px solid #ddd",
// // // // //                                 borderRadius: 2,
// // // // //                                 bgcolor: "background.paper",
// // // // //                             }}
// // // // //                         >
// // // // //                             <SearchIcon sx={{ color: "text.secondary" }} />
// // // // //                             <TextField
// // // // //                                 variant="standard"
// // // // //                                 placeholder="Search..."
// // // // //                                 fullWidth
// // // // //                                 value={search}
// // // // //                                 onChange={(e) => setSearch(e.target.value)}
// // // // //                                 InputProps={{ disableUnderline: true }}
// // // // //                                 sx={{ ml: 1 }}
// // // // //                             />
// // // // //                         </Stack>
// // // // //                     </Stack>

// // // // //                     {/* Add & Export Buttons */}
// // // // //                     {effectiveHeaderActions.length > 0 && (
// // // // //                         <Stack direction="row" spacing={2}>
// // // // //                             {effectiveHeaderActions.map((action, i) => (
// // // // //                                 <Button
// // // // //                                     key={i}
// // // // //                                     variant={action.variant || "contained"}
// // // // //                                     startIcon={action.icon}
// // // // //                                     onClick={action.onClick}
// // // // //                                     sx={{
// // // // //                                         textTransform: "none",
// // // // //                                         borderRadius: 3,
// // // // //                                         px: 3,
// // // // //                                         backgroundColor: action.sx?.backgroundColor || "var(--color-bg-table-button)",
// // // // //                                         color: "white",
// // // // //                                         boxShadow: 3,
// // // // //                                         "&:hover": {
// // // // //                                             bgcolor: "#4a3025",
// // // // //                                             transform: "translateY(-2px)",
// // // // //                                         },
// // // // //                                         ...action.sx,
// // // // //                                     }}
// // // // //                                 >
// // // // //                                     {action.label}
// // // // //                                 </Button>
// // // // //                             ))}
// // // // //                         </Stack>
// // // // //                     )}
// // // // //                 </Stack>

// // // // //                 {/* NEW: Extra Filters from Page */}
// // // // //                 {extraFilters && (
// // // // //                     <Stack
// // // // //                         direction={{ xs: "column", sm: "row" }}
// // // // //                         spacing={2}
// // // // //                         alignItems="center"
// // // // //                         justifyContent="flex-end"
// // // // //                     >
// // // // //                         {extraFilters}
// // // // //                     </Stack>
// // // // //                 )}
// // // // //             </Stack>

// // // // //             {/* Table */}
// // // // //             <TableContainer>
// // // // //                 <Table>
// // // // //                     <TableHead>
// // // // //                         <TableRow>
// // // // //                             <TableCell padding="checkbox">
// // // // //                                 <Checkbox
// // // // //                                     checked={
// // // // //                                         selected.length === filteredRows.length && filteredRows.length > 0
// // // // //                                     }
// // // // //                                     indeterminate={
// // // // //                                         selected.length > 0 && selected.length < filteredRows.length
// // // // //                                     }
// // // // //                                     onChange={handleSelectAll}
// // // // //                                 />
// // // // //                             </TableCell>
// // // // //                             <TableCell sx={{ color: "var(--color-text-dark)" }}>Sl. No.</TableCell>
// // // // //                             {columns.map((col) => (
// // // // //                                 <TableCell key={col.field} sx={{ color: "var(--color-text-dark)" }}>
// // // // //                                     {col.header}
// // // // //                                 </TableCell>
// // // // //                             ))}
// // // // //                             {hasActions && (
// // // // //                                 <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>
// // // // //                                     Actions
// // // // //                                 </TableCell>
// // // // //                             )}
// // // // //                         </TableRow>
// // // // //                     </TableHead>
// // // // //                     <TableBody>
// // // // //                         {filteredRows
// // // // //                             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
// // // // //                             .map((row, idx) => {
// // // // //                                 const serialNo = page * rowsPerPage + idx + 1;
// // // // //                                 return (
// // // // //                                     <TableRow key={row._id || idx} hover>
// // // // //                                         <TableCell padding="checkbox">
// // // // //                                             <Checkbox
// // // // //                                                 checked={selected.includes(row._id)}
// // // // //                                                 onChange={() => handleSelect(row._id)}
// // // // //                                             />
// // // // //                                         </TableCell>
// // // // //                                         <TableCell>{serialNo}</TableCell>

// // // // //                                         {columns.map((col) => {
// // // // //                                             const isStatusCol =
// // // // //                                                 shouldShowStatusBadge && col.field === detectedStatusField;

// // // // //                                             if (isStatusCol) {
// // // // //                                                 return (
// // // // //                                                     <TableCell key={col.field}>
// // // // //                                                         {renderStatusBadge(row[col.field])}
// // // // //                                                     </TableCell>
// // // // //                                                 );
// // // // //                                             }

// // // // //                                             return (
// // // // //                                                 <TableCell key={col.field}>
// // // // //                                                     {row[col.field] ?? "-"}
// // // // //                                                 </TableCell>
// // // // //                                             );
// // // // //                                         })}

// // // // //                                         {hasActions && (
// // // // //                                             <TableCell align="center">{getActions(row)}</TableCell>
// // // // //                                         )}
// // // // //                                     </TableRow>
// // // // //                                 );
// // // // //                             })}
// // // // //                     </TableBody>
// // // // //                 </Table>
// // // // //             </TableContainer>

// // // // //             <TablePagination
// // // // //                 component="div"
// // // // //                 count={filteredRows.length}
// // // // //                 page={page}
// // // // //                 rowsPerPage={rowsPerPage}
// // // // //                 rowsPerPageOptions={[8, 10, 25, 50]}
// // // // //                 onPageChange={(_, newPage) => setPage(newPage)}
// // // // //                 onRowsPerPageChange={(e) => {
// // // // //                     setRowsPerPage(parseInt(e.target.value, 10));
// // // // //                     setPage(0);
// // // // //                 }}
// // // // //             />

// // // // //             {/* Create Modal */}
// // // // //             <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="md" fullWidth>
// // // // //                 <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
// // // // //                     Create
// // // // //                     <IconButton onClick={() => setCreateModalOpen(false)}>
// // // // //                         <X />
// // // // //                     </IconButton>
// // // // //                 </DialogTitle>
// // // // //                 <DialogContent dividers>
// // // // //                     <Box p={1}>
// // // // //                         {createModalContent || (onCreateSubmit && formFields.length > 0 ? (
// // // // //                             <CreateEditCard
// // // // //                                 fields={formFields}
// // // // //                                 onSave={async (data) => {
// // // // //                                     await onCreateSubmit(data);
// // // // //                                     setCreateModalOpen(false);
// // // // //                                 }}
// // // // //                                 onCancel={() => setCreateModalOpen(false)}
// // // // //                                 isEdit={false}
// // // // //                                 title="Create New"
// // // // //                                 showToast
// // // // //                             />
// // // // //                         ) : (
// // // // //                             <Typography>Enable modal create with formFields + onCreateSubmit</Typography>
// // // // //                         ))}
// // // // //                     </Box>
// // // // //                 </DialogContent>
// // // // //             </Dialog>

// // // // //             {/* Edit Modal */}
// // // // //             <Dialog open={editModalOpen} onClose={() => { setEditModalOpen(false); setEditRow(null); }} maxWidth="md" fullWidth>
// // // // //                 <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
// // // // //                     Edit Item
// // // // //                     <IconButton onClick={() => { setEditModalOpen(false); setEditRow(null); }}>
// // // // //                         <X />
// // // // //                     </IconButton>
// // // // //                 </DialogTitle>
// // // // //                 <DialogContent dividers>
// // // // //                     <Box p={1}>
// // // // //                         {editRow && onEditSubmit && formFields.length > 0 ? (
// // // // //                             <CreateEditCard
// // // // //                                 fields={formFields}
// // // // //                                 payload={editRow}
// // // // //                                 onSave={async (data) => {
// // // // //                                     await onEditSubmit(data, editRow);
// // // // //                                     setEditModalOpen(false);
// // // // //                                     setEditRow(null);
// // // // //                                 }}
// // // // //                                 onCancel={() => { setEditModalOpen(false); setEditRow(null); }}
// // // // //                                 isEdit={true}
// // // // //                                 title="Edit Item"
// // // // //                                 showToast
// // // // //                             />
// // // // //                         ) : (
// // // // //                             <Typography>No edit form configured</Typography>
// // // // //                         )}
// // // // //                     </Box>
// // // // //                 </DialogContent>
// // // // //             </Dialog>

// // // // //             {/* View Modal */}
// // // // //             <Dialog open={viewModalOpen} onClose={() => { setViewModalOpen(false); setViewRow(null); }} maxWidth="md" fullWidth>
// // // // //                 <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
// // // // //                     View Details
// // // // //                     <IconButton onClick={() => { setViewModalOpen(false); setViewRow(null); }}>
// // // // //                         <X />
// // // // //                     </IconButton>
// // // // //                 </DialogTitle>
// // // // //                 <DialogContent dividers>
// // // // //                     <Box p={2}>
// // // // //                         {viewRow ? (
// // // // //                             <ViewCard data={viewRow} fields={viewFields} title={title} />
// // // // //                         ) : (
// // // // //                             "Loading..."
// // // // //                         )}
// // // // //                     </Box>
// // // // //                 </DialogContent>
// // // // //             </Dialog>
// // // // //         </Paper>
// // // // //     );
// // // // // }

// // // // // export default TableComponent;

// // // // import React, { useState, useMemo } from "react";
// // // // import {
// // // //     Table,
// // // //     TableHead,
// // // //     TableRow,
// // // //     TableCell,
// // // //     TableBody,
// // // //     TableContainer,
// // // //     Paper,
// // // //     Checkbox,
// // // //     IconButton,
// // // //     TextField,
// // // //     TablePagination,
// // // //     Stack,
// // // //     Typography,
// // // //     Button,
// // // //     Dialog,
// // // //     DialogTitle,
// // // //     DialogContent,
// // // //     Box,
// // // // } from "@mui/material";
// // // // import VisibilityIcon from "@mui/icons-material/Visibility";
// // // // import EditIcon from "@mui/icons-material/Edit";
// // // // import DeleteIcon from "@mui/icons-material/Delete";
// // // // import SearchIcon from "@mui/icons-material/Search";
// // // // import AddIcon from "@mui/icons-material/Add";
// // // // import { X } from "lucide-react";
// // // // import { useNavigate } from "react-router-dom";

// // // // import CreateEditCard from "../card/tableRelated/CreateEditCard";
// // // // import ViewCard from "../card/tableRelated/ViewCard";

// // // // function TableComponent({
// // // //     title = "Table Name",
// // // //     columns = [],
// // // //     rows = [],
// // // //     onDelete,
// // // //     onCreate,
// // // //     onCreateSubmit,
// // // //     onView,
// // // //     onEdit,
// // // //     onEditSubmit,
// // // //     viewPath = "/view",
// // // //     editPath = "/edit",

// // // //     showView = false,
// // // //     showEdit = false,
// // // //     showDelete = false,

// // // //     formFields = [],
// // // //     customActions = [],
// // // //     headerActions = [],
// // // //     createModalContent = null,

// // // //     // Status Badge Control
// // // //     showStatusBadge = null,
// // // //     statusField = null,

// // // //     // NEW: Extra filters from page (e.g. Category, Status dropdowns)
// // // //     extraFilters = null, // ← THIS WAS MISSING!
// // // // }) {
// // // //     const [search, setSearch] = useState("");
// // // //     const [selected, setSelected] = useState([]);
// // // //     const [page, setPage] = useState(0);
// // // //     const [rowsPerPage, setRowsPerPage] = useState(8);
// // // //     const [createModalOpen, setCreateModalOpen] = useState(false);
// // // //     const [editModalOpen, setEditModalOpen] = useState(false);
// // // //     const [editRow, setEditRow] = useState(null);
// // // //     const [viewModalOpen, setViewModalOpen] = useState(false);
// // // //     const [viewRow, setViewRow] = useState(null);

// // // //     const navigate = useNavigate();

// // // //     // Auto-detect status field
// // // //     const detectedStatusField = useMemo(() => {
// // // //         if (statusField) return statusField;
// // // //         return columns.find(col =>
// // // //             ["status", "isActive", "active", "is_active", "state", "enabled"].includes(col.field)
// // // //         )?.field || null;
// // // //     }, [columns, statusField]);

// // // //     const shouldShowStatusBadge = showStatusBadge === null ? !!detectedStatusField : showStatusBadge;

// // // //     // Auto-add Create button
// // // //     const effectiveHeaderActions = useMemo(() => {
// // // //         if ((onCreate || onCreateSubmit) && headerActions.length === 0) {
// // // //             const isModalCreate = onCreateSubmit && formFields.length > 0;
// // // //             return [
// // // //                 {
// // // //                     label: "Add New",
// // // //                     icon: <AddIcon />,
// // // //                     onClick: () => {
// // // //                         if (isModalCreate) setCreateModalOpen(true);
// // // //                         else if (onCreate) onCreate();
// // // //                     },
// // // //                     variant: "contained",
// // // //                     sx: {
// // // //                         bgcolor: "var(--color-bg-table-button)",
// // // //                         color: "white",
// // // //                         textTransform: "none",
// // // //                         borderRadius: 3,
// // // //                         px: 3,
// // // //                         boxShadow: 3,
// // // //                         "&:hover": { bgcolor: "#4a3025" },
// // // //                     },
// // // //                 },
// // // //             ];
// // // //         }
// // // //         return headerActions;
// // // //     }, [headerActions, onCreate, onCreateSubmit, formFields.length]);

// // // //     const filteredRows = useMemo(() => {
// // // //         return rows.filter((row) =>
// // // //             Object.values(row).some((value) =>
// // // //                 String(value ?? "").toLowerCase().includes(search.toLowerCase())
// // // //             )
// // // //         );
// // // //     }, [rows, search, extraFilters]);

// // // //     const handleSelect = (id) => {
// // // //         setSelected((prev =>
// // // //             prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
// // // //         ));
// // // //     };

// // // //     const handleSelectAll = (event) => {
// // // //         if (event.target.checked) {
// // // //             setSelected(filteredRows.map(r => r._id));
// // // //         } else {
// // // //             setSelected([]);
// // // //         }
// // // //     };

// // // //     const viewFields = columns.map(col => ({ name: col.field, label: col.header }));

// // // //     const renderStatusBadge = (value) => {
// // // //         const isActive = value === true ||
// // // //             ["active", "Active", "ACTIVE", "yes", "enabled"].includes(String(value));

// // // //         return (
// // // //             <Box sx={{
// // // //                 display: "inline-flex", alignItems: "center", gap: 0.8,
// // // //                 px: 1.5, py: 0.5, borderRadius: 3, fontSize: "0.75rem",
// // // //                 fontWeight: 600, textTransform: "uppercase",
// // // //                 bgcolor: isActive
// // // //                     ? "color-mix(in srgb, var(--color-success) 20%, transparent)"
// // // //                     : "color-mix(in srgb, var(--color-error) 20%, transparent)",
// // // //                 color: isActive ? "var(--color-success)" : "var(--color-error)",
// // // //             }}>
// // // //                 <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: isActive ? "var(--color-success)" : "var(--color-error)" }} />
// // // //                 {isActive ? "Active" : "Inactive"}
// // // //             </Box>
// // // //         );
// // // //     };

// // // //     const getActions = (row) => (
// // // //         <Stack direction="row" spacing={0.5} justifyContent="center">
// // // //             {showView && (
// // // //                 <IconButton sx={{ color: "var(--color-primary)" }} onClick={() => {
// // // //                     if (onView) onView(row);
// // // //                     else { setViewRow(row); setViewModalOpen(true); }
// // // //                 }} title="View"><VisibilityIcon fontSize="small" /></IconButton>
// // // //             )}
// // // //             {showEdit && (
// // // //                 <IconButton sx={{ color: "var(--color-success)" }} onClick={() => {
// // // //                     const isModalEdit = onEditSubmit && formFields.length > 0;
// // // //                     if (isModalEdit) { setEditRow(row); setEditModalOpen(true); }
// // // //                     else if (onEdit) onEdit(row);
// // // //                     else navigate(`${editPath}/${row._id}`);
// // // //                 }} title="Edit"><EditIcon fontSize="small" /></IconButton>
// // // //             )}
// // // //             {showDelete && onDelete && (
// // // //                 <IconButton sx={{ color: "var(--color-error)" }} onClick={() => onDelete(row._id)} title="Delete">
// // // //                     <DeleteIcon fontSize="small" />
// // // //                 </IconButton>
// // // //             )}
// // // //             {customActions.map((action, i) => (
// // // //                 <IconButton key={i} sx={{ color: action.color || "var(--color-primary)" }}
// // // //                     onClick={() => action.onClick(row)} title={action.tooltip}>
// // // //                     {action.icon}
// // // //                 </IconButton>
// // // //             ))}
// // // //         </Stack>
// // // //     );

// // // //     const hasActions = showView || showEdit || showDelete || customActions.length > 0;

// // // //     return (
// // // //         <Paper elevation={0} sx={{ p: 3, borderRadius: 3, minHeight: "30vh", bgcolor: "var(--color-bg-table)", color: "var(--color-text-dark)" }}>
// // // //             {/* Header */}
// // // //             <Stack direction="column" spacing={3}>
// // // //                 {/* Top Row: Title + Search + Add Button */}
// // // //                 <Stack direction="row" justifyContent="space-between" alignItems="center">
// // // //                     <Stack direction="row" alignItems="center" spacing={3}>
// // // //                         <Typography variant="h6" fontWeight={700}>{title}</Typography>

// // // //                         <Stack direction="row" alignItems="center" sx={{
// // // //                             width: 300, px: 1.5, py: 0.5,
// // // //                             border: "1px solid #ddd", borderRadius: 2, bgcolor: "background.paper"
// // // //                         }}>
// // // //                             <SearchIcon sx={{ color: "text.secondary" }} />
// // // //                             <TextField
// // // //                                 variant="standard" placeholder="Search..."
// // // //                                 fullWidth value={search} onChange={e => setSearch(e.target.value)}
// // // //                                 InputProps={{ disableUnderline: true }} sx={{ ml: 1 }}
// // // //                             />
// // // //                         </Stack>
// // // //                     </Stack>

// // // //                     {/* Add Button */}
// // // //                     {effectiveHeaderActions.length > 0 && (
// // // //                         <Stack direction="row" spacing={2}>
// // // //                             {effectiveHeaderActions.map((action, i) => (
// // // //                                 <Button
// // // //                                     key={i}
// // // //                                     variant={action.variant || "contained"}
// // // //                                     startIcon={action.icon}
// // // //                                     onClick={action.onClick}
// // // //                                     sx={{
// // // //                                         textTransform: "none",
// // // //                                         borderRadius: 3,
// // // //                                         px: 3,
// // // //                                         bgcolor: "var(--color-bg-table-button)",
// // // //                                         color: "white",
// // // //                                         boxShadow: 3,
// // // //                                         "&:hover": { bgcolor: "#4a3025" },
// // // //                                         ...action.sx,
// // // //                                     }}
// // // //                                 >
// // // //                                     {action.label}
// // // //                                 </Button>
// // // //                             ))}
// // // //                         </Stack>
// // // //                     )}
// // // //                 </Stack>

// // // //                 {/* NEW: Extra Filters (Category, Status, etc.) */}
// // // //                 {extraFilters && (
// // // //                     <Stack
// // // //                         direction={{ xs: "column", sm: "row" }}
// // // //                         spacing={2}
// // // //                         alignItems="center"
// // // //                         justifyContent="flex-end"
// // // //                     >
// // // //                         {extraFilters}
// // // //                     </Stack>
// // // //                 )}
// // // //             </Stack>

// // // //             {/* Table */}
// // // //             <TableContainer sx={{ mt: 3 }}>
// // // //                 <Table>
// // // //                     <TableHead>
// // // //                         <TableRow>
// // // //                             <TableCell padding="checkbox">
// // // //                                 <Checkbox
// // // //                                     checked={selected.length === filteredRows.length && filteredRows.length > 0}
// // // //                                     indeterminate={selected.length > 0 && selected.length < filteredRows.length}
// // // //                                     onChange={handleSelectAll}
// // // //                                 />
// // // //                             </TableCell>
// // // //                             <TableCell sx={{ color: "var(--color-text-dark)" }}>Sl. No.</TableCell>
// // // //                             {columns.map(col => (
// // // //                                 <TableCell key={col.field} sx={{ color: "var(--color-text-dark)" }}>
// // // //                                     {col.header}
// // // //                                 </TableCell>
// // // //                             ))}
// // // //                             {hasActions && <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>Actions</TableCell>}
// // // //                         </TableRow>
// // // //                     </TableHead>
// // // //                     <TableBody>
// // // //                         {filteredRows
// // // //                             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
// // // //                             .map((row, idx) => {
// // // //                                 const serialNo = page * rowsPerPage + idx + idx + 1;
// // // //                                 return (
// // // //                                     <TableRow key={row._id || idx} hover>
// // // //                                         <TableCell padding="checkbox">
// // // //                                             <Checkbox checked={selected.includes(row._id)}
// // // //                                                 onChange={() => handleSelect(row._id)} />
// // // //                                         </TableCell>
// // // //                                         <TableCell>{serialNo}</TableCell>
// // // //                                         {columns.map(col => {
// // // //                                             if (shouldShowStatusBadge && col.field === detectedStatusField) {
// // // //                                                 return <TableCell key={col.field}>{renderStatusBadge(row[col.field])}</TableCell>;
// // // //                                             }
// // // //                                             return <TableCell key={col.field}>{row[col.field] ?? "-"}</TableCell>;
// // // //                                         })}
// // // //                                         {hasActions && <TableCell align="center">{getActions(row)}</TableCell>}
// // // //                                     </TableRow>
// // // //                                 );
// // // //                             })}
// // // //                     </TableBody>
// // // //                 </Table>
// // // //             </TableContainer>

// // // //             <TablePagination
// // // //                 component="div"
// // // //                 count={filteredRows.length}
// // // //                 page={page}
// // // //                 rowsPerPage={rowsPerPage}
// // // //                 rowsPerPageOptions={[8, 10, 25, 50]}
// // // //                 onPageChange={(_, p) => setPage(p)}
// // // //                 onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
// // // //             />

// // // //             {/* Modals */}
// // // //             {/* ... (Create, Edit, View modals - keep exactly as you had) */}
// // // //         </Paper>
// // // //     );
// // // // }

// // // // export default TableComponent;

// // // import React, { useState, useMemo } from "react";
// // // import {
// // //     Table, TableHead, TableRow, TableCell, TableBody,
// // //     TableContainer, Paper, Checkbox, IconButton, TextField,
// // //     TablePagination, Stack, Typography, Button, Dialog,
// // //     DialogTitle, DialogContent, Box,
// // // } from "@mui/material";
// // // import VisibilityIcon from "@mui/icons-material/Visibility";
// // // import EditIcon from "@mui/icons-material/Edit";
// // // import DeleteIcon from "@mui/icons-material/Delete";
// // // import SearchIcon from "@mui/icons-material/Search";
// // // import AddIcon from "@mui/icons-material/Add";
// // // import DownloadIcon from "@mui/icons-material/Download";
// // // import { X } from "lucide-react";
// // // import { useNavigate } from "react-router-dom";
// // // import * as XLSX from "xlsx"; // Import for Excel export

// // // import CreateEditCard from "../card/tableRelated/CreateEditCard";
// // // import ViewCard from "../card/tableRelated/ViewCard";

// // // function TableComponent({
// // //     title = "Table Name",
// // //     columns = [],
// // //     rows = [],
// // //     onDelete,
// // //     onCreate,
// // //     onCreateSubmit,
// // //     onView,
// // //     onEdit,
// // //     onEditSubmit,

// // //     showView = false,
// // //     showEdit = false,
// // //     showDelete = false,

// // //     formFields = [],
// // //     customActions = [],
// // //     headerActions = [],

// // //     showStatusBadge = null,
// // //     statusField = null,

// // //     extraFilters = null,

// // //     // NEW: Default Add button ON, Export OFF
// // //     showAddButton = true,        // ← Default: true (you can disable with false
// // //     showExportButton = false,    // ← Default: falseyou can enable with true
// // // }) {
// // //     const [search, setSearch] = useState("");
// // //     const [selected, setSelected] = useState([]);
// // //     const [page, setPage] = useState(0);
// // //     const [rowsPerPage, setRowsPerPage] = useState(8);
// // //     const [createModalOpen, setCreateModalOpen] = useState(false);
// // //     const [editModalOpen, setEditModalOpen] = useState(false);
// // //     const [editRow, setEditRow] = useState(null);
// // //     const [viewModalOpen, setViewModalOpen] = useState(false);
// // //     const [viewRow, setViewRow] = useState(null);

// // //     const navigate = useNavigate();

// // //     // Auto-detect status field
// // //     const detectedStatusField = useMemo(() => {
// // //         if (statusField) return statusField;
// // //         return columns.find(col =>
// // //             ["status", "isActive", "active", "is_active", "state", "enabled"].includes(col.field)
// // //         )?.field || null;
// // //     }, [columns, statusField]);

// // //     const shouldShowStatusBadge = showStatusBadge === null ? !!detectedStatusField : showStatusBadge;

// // //     // Add Button (default true)
// // //     const addButton = useMemo(() => {
// // //         if (!showAddButton) return null;
// // //         const isModalCreate = onCreateSubmit && formFields.length > 0;
// // //         return {
// // //             label: "Add New",
// // //             icon: <AddIcon />,
// // //             onClick: () => {
// // //                 if (isModalCreate) setCreateModalOpen(true);
// // //                 else if (onCreate) onCreate();
// // //             },
// // //             variant: "contained",
// // //             sx: {
// // //                 bgcolor: "var(--color-bg-table-button)",
// // //                 color: "white",
// // //                 textTransform: "none",
// // //                 borderRadius: 3,
// // //                 px: 3,
// // //                 boxShadow: 3,
// // //                 "&:hover": { bgcolor: "#4a3025" },
// // //             },
// // //         };
// // //     }, [showAddButton, onCreateSubmit, formFields.length, onCreate]);

// // //     // Export Button
// // //     const exportButton = showExportButton ? {
// // //         label: "Export Excel",
// // //         icon: <DownloadIcon />,
// // //         onClick: () => {
// // //             const dataToExport = rows.map(row => {
// // //                 const obj = {};
// // //                 columns.forEach(col => {
// // //                     obj[col.header] = row[col.field] ?? "";
// // //                 });
// // //                 return obj;
// // //             });

// // //             const ws = XLSX.utils.json_to_sheet(dataToExport);
// // //             const wb = XLSX.utils.book_new();
// // //             XLSX.utils.book_append_sheet(wb, ws, "Data");

// // //             const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
// // //             XLSX.writeFile(wb, file);
// // //         },
// // //         variant: "outlined",
// // //         sx: {
// // //             borderColor: "#27AE60",
// // //             color: "#27AE60",
// // //             textTransform: "none",
// // //             borderRadius: 3,
// // //             px: 3,
// // //         },
// // //     } : null;

// // //     // Final buttons
// // //     const finalHeaderButtons = [
// // //         ...(addButton ? [addButton] : []),
// // //         ...(exportButton ? [exportButton] : []),
// // //         ...headerActions,
// // //     ];

// // //     const filteredRows = useMemo(() => {
// // //         return rows.filter((row) =>
// // //             Object.values(row).some((value) =>
// // //                 String(value ?? "").toLowerCase().includes(search.toLowerCase())
// // //             )
// // //         );
// // //     }, [rows, search]);

// // //     const viewFields = columns.map(col => ({ name: col.field, label: col.header }));

// // //     const renderStatusBadge = (value) => {
// // //         const isActive = value === true ||
// // //             ["active", "Active", "ACTIVE", "yes", "enabled"].includes(String(value));

// // //         return (
// // //             <Box sx={{
// // //                 display: "inline-flex", alignItems: "center", gap: 0.8,
// // //                 px: 1.5, py: 0.5, borderRadius: 3, fontSize: "0.75rem",
// // //                 fontWeight: 600, textTransform: "uppercase",
// // //                 bgcolor: isActive
// // //                     ? "color-mix(in srgb, var(--color-success) 20%, transparent)"
// // //                     : "color-mix(in srgb, var(--color-error) 20%, transparent)",
// // //                 color: isActive ? "var(--color-success)" : "var(--color-error)",
// // //             }}>
// // //                 <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: isActive ? "var(--color-success)" : "var(--color-error)" }} />
// // //                 {isActive ? "Active" : "Inactive"}
// // //             </Box>
// // //         );
// // //     };

// // //     const getActions = (row) => (
// // //         <Stack direction="row" spacing={0.5} justifyContent="center">
// // //             {showView && (
// // //                 <IconButton sx={{ color: "var(--color-primary)" }} onClick={() => {
// // //                     if (onView) onView(row);
// // //                     else { setViewRow(row); setViewModalOpen(true); }
// // //                 }} title="View"><VisibilityIcon fontSize="small" /></IconButton>
// // //             )}
// // //             {showEdit && (
// // //                 <IconButton sx={{ color: "var(--color-success)" }} onClick={() => {
// // //                     const isModalEdit = onEditSubmit && formFields.length > 0;
// // //                     if (isModalEdit) { setEditRow(row); setEditModalOpen(true); }
// // //                     else if (onEdit) onEdit(row);
// // //                     else navigate(`${editPath}/${row._id}`);
// // //                 }} title="Edit"><EditIcon fontSize="small" /></IconButton>
// // //             )}
// // //             {showDelete && onDelete && (
// // //                 <IconButton sx={{ color: "var(--color-error)" }} onClick={() => onDelete(row._id)} title="Delete">
// // //                     <DeleteIcon fontSize="small" />
// // //                 </IconButton>
// // //             )}
// // //             {customActions.map((action, i) => (
// // //                 <IconButton key={i} sx={{ color: action.color || "var(--color-primary)" }}
// // //                     onClick={() => action.onClick(row)} title={action.tooltip}>
// // //                     {action.icon}
// // //                 </IconButton>
// // //             ))}
// // //         </Stack>
// // //     );

// // //     const hasActions = showView || showEdit || showDelete || customActions.length > 0;

// // //     return (
// // //         <Paper elevation={0} sx={{ p: 3, borderRadius: 3, minHeight: "30vh", bgcolor: "var(--color-bg-table)", color: "var(--color-text-dark)" }}>
// // //             {/* Header */}
// // //             <Stack direction="column" spacing={3}>
// // //                 <Stack direction="row" justifyContent="space-between" alignItems="center">
// // //                     <Stack direction="row" alignItems="center" spacing={3}>
// // //                         <Typography variant="h6" fontWeight={700}>{title}</Typography>

// // //                         <Stack direction="row" alignItems="center" sx={{
// // //                             width: 300, px: 1.5, py: 0.5,
// // //                             border: "1px solid #ddd", borderRadius: 2, bgcolor: "background.paper"
// // //                         }}>
// // //                             <SearchIcon sx={{ color: "text.secondary" }} />
// // //                             <TextField
// // //                                 variant="standard" placeholder="Search..."
// // //                                 fullWidth value={search} onChange={e => setSearch(e.target.value)}
// // //                                 InputProps={{ disableUnderline: true }} sx={{ ml: 1 }}
// // //                             />
// // //                         </Stack>
// // //                     </Stack>

// // //                     {/* Add + Export Buttons */}
// // //                     {finalHeaderButtons.length > 0 && (
// // //                         <Stack direction="row" spacing={2}>
// // //                             {finalHeaderButtons.map((btn, i) => (
// // //                                 <Button
// // //                                     key={i}
// // //                                     variant={btn.variant || "contained"}
// // //                                     startIcon={btn.icon}
// // //                                     onClick={btn.onClick}
// // //                                     sx={btn.sx}
// // //                                 >
// // //                                     {btn.label}
// // //                                 </Button>
// // //                             ))}
// // //                         </Stack>
// // //                     )}
// // //                 </Stack>

// // //                 {/* Extra Filters */}
// // //                 {extraFilters && (
// // //                     <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
// // //                         {extraFilters}
// // //                     </Stack>
// // //                 )}
// // //             </Stack>

// // //             {/* Table */}
// // //             <TableContainer sx={{ mt: 3 }}>
// // //                 <Table>
// // //                     <TableHead>
// // //                         <TableRow>
// // //                             <TableCell padding="checkbox">
// // //                                 <Checkbox
// // //                                     checked={selected.length === filteredRows.length && filteredRows.length > 0}
// // //                                     indeterminate={selected.length > 0 && selected.length < filteredRows.length}
// // //                                     onChange={handleSelectAll}
// // //                                 />
// // //                             </TableCell>
// // //                             <TableCell sx={{ color: "var(--color-text-dark)" }}>Sl. No.</TableCell>
// // //                             {columns.map(col => (
// // //                                 <TableCell key={col.field} sx={{ color: "var(--color-text-dark)" }}>
// // //                                     {col.header}
// // //                                 </TableCell>
// // //                             ))}
// // //                             {hasActions && <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>Actions</TableCell>}
// // //                         </TableRow>
// // //                     </TableHead>
// // //                     <TableBody>
// // //                         {filteredRows
// // //                             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
// // //                             .map((row, idx) => {
// // //                                 const serialNo = page * rowsPerPage + idx + 1;
// // //                                 return (
// // //                                     <TableRow key={row._id || idx} hover>
// // //                                         <TableCell padding="checkbox">
// // //                                             <Checkbox checked={selected.includes(row._id)}
// // //                                                 onChange={() => handleSelect(row._id)} />
// // //                                         </TableCell>
// // //                                         <TableCell>{serialNo}</TableCell>
// // //                                         {columns.map(col => {
// // //                                             if (shouldShowStatusBadge && col.field === detectedStatusField) {
// // //                                                 return <TableCell key={col.field}>{renderStatusBadge(row[col.field])}</TableCell>;
// // //                                             }
// // //                                             return <TableCell key={col.field}>{row[col.field] ?? "-"}</TableCell>;
// // //                                         })}
// // //                                         {hasActions && <TableCell align="center">{getActions(row)}</TableCell>}
// // //                                     </TableRow>
// // //                                 );
// // //                             })}
// // //                     </TableBody>
// // //                 </Table>
// // //             </TableContainer>

// // //             <TablePagination
// // //                 component="div"
// // //                 count={filteredRows.length}
// // //                 page={page}
// // //                 rowsPerPage={rowsPerPage}
// // //                 rowsPerPageOptions={[8, 10, 25, 50]}
// // //                 onPageChange={(_, p) => setPage(p)}
// // //                 onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
// // //             />

// // //             {/* Modals */}
// // //             {/* Keep your Create/Edit/View modals here */}
// // //         </Paper>
// // //     );
// // // }

// // // export default TableComponent;


// // import React, { useState, useMemo } from "react";
// // import {
// //     Table,
// //     TableHead,
// //     TableRow,
// //     TableCell,
// //     TableBody,
// //     TableContainer,
// //     Paper,
// //     Checkbox,
// //     IconButton,
// //     TextField,
// //     TablePagination,
// //     Stack,
// //     Typography,
// //     Button,
// //     Dialog,
// //     DialogTitle,
// //     DialogContent,
// //     Box,
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

// //     showView = false,
// //     showEdit = false,
// //     showDelete = false,

// //     formFields = [],
// //     customActions = [],
// //     headerActions = [],

// //     showStatusBadge = null,
// //     statusField = null,
// //     extraFilters = null,

// //     // Default: Add button ON, Export OFF
// //     showAddButton = true,
// //     showExportButton = false,
// // }) {
// //     const [search, setSearch] = useState("");
// //     const [selected, setSelected] = useState([]);
// //     const [page, setPage] = useState(0);
// //     const [rowsPerPage, setRowsPerPage] = useState(8);
// //     const [createModalOpen, setCreateModalOpen] = useState(false);
// //     const [editModalOpen, setEditModalOpen] = useState(false);
// //     const [editRow, setEditRow] = useState(null);
// //     const [viewModalOpen, setViewModalOpen] = useState(false);
// //     const [viewRow, setViewRow] = useState(null);

// //     const navigate = useNavigate();

// //     // Status badge auto-detect
// //     const detectedStatusField = useMemo(() => {
// //         if (statusField) return statusField;
// //         return columns.find(col =>
// //             ["status", "isActive", "active", "is_active", "state", "enabled"].includes(col.field)
// //         )?.field || null;
// //     }, [columns, statusField]);

// //     const shouldShowStatusBadge = showStatusBadge === null ? !!detectedStatusField : showStatusBadge;

// //     // Add Button (default true)
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
// //                 boxShadow: 3,
// //                 "&:hover": { bgcolor: "#4a3025" },
// //             },
// //         };
// //     }, [showAddButton, onCreateSubmit, formFields.length, onCreate]);

// //     // Export Excel Button
// //     const exportButton = showExportButton
// //         ? {
// //             label: "Export Excel",
// //             icon: <DownloadIcon />,
// //             onClick: () => {
// //                 const exportData = rows.map(row => {
// //                     const obj = {};
// //                     columns.forEach(col => {
// //                         obj[col.header] = row[col.field] ?? "";
// //                     });
// //                     return obj;
// //                 });

// //                 const ws = XLSX.utils.json_to_sheet(exportData);
// //                 const wb = XLSX.utils.book_new();
// //                 XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
// //                 const fileName = `${title.replace(/\s+/g, "_")}_${new Date()
// //                     .toISOString()
// //                     .slice(0, 10)}.xlsx`;
// //                 XLSX.writeFile(wb, fileName);
// //             },
// //             variant: "outlined",
// //             sx: {
// //                 borderColor: "var(--color-success)",
// //                 color: "var(--color-success)",
// //                 textTransform: "none",
// //                 borderRadius: 3,
// //                 px: 3,
// //             },
// //         }
// //         : null;

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

// //     // Fixed: handleSelectAll was missing!
// //     const handleSelectAll = event => {
// //         if (event.target.checked) {
// //             setSelected(filteredRows.map(r => r._id));
// //         } else {
// //             setSelected([]);
// //         }
// //     };

// //     const handleSelect = id => {
// //         setSelected(prev =>
// //             prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
// //         );
// //     };

// //     const viewFields = columns.map(col => ({ name: col.field, label: col.header }));

// //     const renderStatusBadge = value => {
// //         const isActive =
// //             value === true ||
// //             ["active", "Active", "ACTIVE", "yes", "enabled"].includes(String(value));

// //         return (
// //             <Box
// //                 sx={{
// //                     display: "inline-flex",
// //                     alignItems: "center",
// //                     gap: 0.8,
// //                     px: 1.5,
// //                     py: 0.5,
// //                     borderRadius: 3,
// //                     fontSize: "0.75rem",
// //                     fontWeight: 600,
// //                     textTransform: "uppercase",
// //                     bgcolor: isActive
// //                         ? "color-mix(in srgb, var(--color-success) 20%, transparent)"
// //                         : "color-mix(in srgb, var(--color-error) 20%, transparent)",
// //                     color: isActive ? "var(--color-success)" : "var(--color-error)",
// //                 }}
// //             >
// //                 <Box
// //                     sx={{
// //                         width: 8,
// //                         height: 8,
// //                         borderRadius: "50%",
// //                         bgcolor: isActive ? "var(--color-success)" : "var(--color-error)",
// //                     }}
// //                 />
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
// //                         if (onView) onView(row);
// //                         else {
// //                             setViewRow(row);
// //                             setViewModalOpen(true);
// //                         }
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
// //                         const isModalEdit = onEditSubmit && formFields.length > 0;
// //                         if (isModalEdit) {
// //                             setEditRow(row);
// //                             setEditModalOpen(true);
// //                         } else if (onEdit) {
// //                             onEdit(row);
// //                         } else {
// //                             navigate(`${editPath}/${row._id}`);
// //                         }
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
// //         <Paper
// //             elevation={0}
// //             sx={{
// //                 p: 3,
// //                 borderRadius: 3,
// //                 minHeight: "30vh",
// //                 bgcolor: "var(--color-bg-table)",
// //                 color: "var(--color-text-dark)",
// //             }}
// //         >
// //             {/* Header */}
// //             <Stack direction="column" spacing={3}>
// //                 <Stack direction="row" justifyContent="space-between" alignItems="center">
// //                     <Stack direction="row" alignItems="center" spacing={3}>
// //                         <Typography variant="h6" fontWeight={700}>
// //                             {title}
// //                         </Typography>

// //                         <Stack
// //                             direction="row"
// //                             alignItems="center"
// //                             sx={{
// //                                 width: 300,
// //                                 px: 1.5,
// //                                 py: 0.5,
// //                                 border: "1px solid #ddd",
// //                                 borderRadius: 2,
// //                                 bgcolor: "background.paper",
// //                             }}
// //                         >
// //                             <SearchIcon sx={{ color: "text.secondary" }} />
// //                             <TextField
// //                                 variant="standard"
// //                                 placeholder="Search..."
// //                                 fullWidth
// //                                 value={search}
// //                                 onChange={e => setSearch(e.target.value)}
// //                                 InputProps={{ disableUnderline: true }}
// //                                 sx={{ ml: 1 }}
// //                             />
// //                         </Stack>
// //                     </Stack>

// //                     {/* Add + Export Buttons */}
// //                     {finalHeaderButtons.length > 0 && (
// //                         <Stack direction="row" spacing={2}>
// //                             {finalHeaderButtons.map((btn, i) => (
// //                                 <Button
// //                                     key={i}
// //                                     variant={btn.variant || "contained"}
// //                                     startIcon={btn.icon}
// //                                     onClick={btn.onClick}
// //                                     sx={btn.sx}
// //                                 >
// //                                     {btn.label}
// //                                 </Button>
// //                             ))}
// //                         </Stack>
// //                     )}
// //                 </Stack>

// //                 {/* Extra Filters */}
// //                 {extraFilters && (
// //                     <Stack
// //                         direction={{ xs: "column", sm: "row" }}
// //                         spacing={2}
// //                         alignItems="center"
// //                         justifyContent="flex-end"
// //                     >
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
// //                             {hasActions && (
// //                                 <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>
// //                                     Actions
// //                                 </TableCell>
// //                             )}
// //                         </TableRow>
// //                     </TableHead>    
// //                     <TableBody>
// //                         {filteredRows
// //                             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
// //                             .map((row, idx) => {
// //                                 const serialNo = page * rowsPerPage + idx + 1; // Fixed
// //                                 return (
// //                                     <TableRow key={row._id || idx} hover>
// //                                         <TableCell padding="checkbox">
// //                                             <Checkbox
// //                                                 checked={selected.includes(row._id)}
// //                                                 onChange={() => handleSelect(row._id)}
// //                                             />
// //                                         </TableCell>
// //                                         <TableCell>{serialNo}</TableCell>
// //                                         {columns.map(col => {
// //                                             if (shouldShowStatusBadge && col.field === detectedStatusField) {
// //                                                 return (
// //                                                     <TableCell key={col.field}>
// //                                                         {renderStatusBadge(row[col.field])}
// //                                                     </TableCell>
// //                                                 );
// //                                             }
// //                                             return (
// //                                                 <TableCell key={col.field}>
// //                                                     {row[col.field] ?? "-"}
// //                                                 </TableCell>
// //                                             );
// //                                         })}
// //                                         {hasActions && <TableCell align="center">{getActions(row)}</TableCell>}
// //                                     </TableRow>
// //                                 );
// //                             })}
// //                     </TableBody>
// //                 </Table>
// //             </TableContainer>

// //             <TablePagination
// //                 component="div"
// //                 count={filteredRows.length}
// //                 page={page}
// //                 rowsPerPage={rowsPerPage}
// //                 rowsPerPageOptions={[8, 10, 25, 50]}
// //                 onPageChange={(_, p) => setPage(p)}
// //                 onRowsPerPageChange={e => {
// //                     setRowsPerPage(+e.target.value);
// //                     setPage(0);
// //                 }}
// //             />

// //             {/* Keep your modals here (Create, Edit, View) */}
// //             {/* ... */}
// //         </Paper>
// //     );
// // }

// // export default TableComponent;

// import React, { useState, useMemo } from "react";
// import {
//     Table, TableHead, TableRow, TableCell, TableBody,
//     TableContainer, Paper, Checkbox, IconButton, TextField,
//     TablePagination, Stack, Typography, Button, Dialog,
//     DialogTitle, DialogContent, Box,
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
//     editPath = "/edit", // ← NOW DEFINED IN PROPS

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
//                 boxShadow: 3,
//                 "&:hover": { bgcolor: "#4a3025" },
//             },
//         };
//     }, [showAddButton, onCreateSubmit, formFields.length, onCreate]);

//     // Export Excel Button
//     const exportButton = showExportButton ? {
//         label: "Export Excel",
//         icon: <DownloadIcon />,
//         onClick: () => {
//             const exportData = rows.map(row => {
//                 const obj = {};
//                 columns.forEach(col => {
//                     obj[col.header] = row[col.field] ?? "";
//                 });
//                 return obj;
//             });
//             const ws = XLSX.utils.json_to_sheet(exportData);
//             const wb = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(wb, ws, "Data");
//             const fileName = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
//             XLSX.writeFile(wb, fileName);
//         },
//         variant: "outlined",
//         sx: {
//             borderColor: "var(--color-success)",
//             color: "var(--color-success)",
//             textTransform: "none",
//             borderRadius: 3,
//         },
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

//     const handleSelectAll = event => {
//         if (event.target.checked) {
//             setSelected(filteredRows.map(r => r._id));
//         } else {
//             setSelected([]);
//         }
//     };

//     const handleSelect = id => {
//         setSelected(prev =>
//             prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
//         );
//     };

//     const viewFields = columns.map(col => ({ name: col.field, label: col.header }));

//     const renderStatusBadge = value => {
//         const isActive = value === true ||
//             ["active", "Active", "ACTIVE", "yes", "enabled"].includes(String(value));
//         return (
//             <Box sx={{
//                 display: "inline-flex", alignItems: "center", gap: 0.8,
//                 px: 1.5, py: 0.5, borderRadius: 3, fontSize: "0.75rem",
//                 fontWeight: 600, textTransform: "uppercase",
//                 bgcolor: isActive
//                     ? "color-mix(in srgb, var(--color-success) 20%, transparent)"
//                     : "color-mix(in srgb, var(--color-error) 20%, transparent)",
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
//                         if (onView) {
//                             onView(row);
//                         } else {
//                             setViewRow(row);
//                             setViewModalOpen(true); // ← THIS WAS BROKEN BEFORE!
//                         }
//                     }}
//                     title="View Details"
//                 >
//                     <VisibilityIcon fontSize="small" />
//                 </IconButton>
//             )}
//             {showEdit && (
//                 <IconButton
//                     sx={{ color: "var(--color-success)" }}
//                     onClick={() => {
//                         const isModalEdit = onEditSubmit && formFields.length > 0;
//                         if (isModalEdit) {
//                             setEditRow(row);
//                             setEditModalOpen(true);
//                         } else if (onEdit) {
//                             onEdit(row);
//                         } else {
//                             navigate(`${editPath}/${row._id}`);
//                         }
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

//     const hasActions = showView || showView || showEdit || showDelete || customActions.length > 0;

//     return (
//         <Paper elevation={0} sx={{ p: 3, borderRadius: 3, minHeight: "30vh", bgcolor: "var(--color-bg-table)", color: "var(--color-text-dark)" }}>
//             {/* Header */}
//             <Stack direction="column" spacing={3}>
//                 <Stack direction="row" justifyContent="space-between" alignItems="center">
//                     <Stack direction="row" alignItems="center" spacing={3}>
//                         <Typography variant="h6" fontWeight={700}>{title}</Typography>
//                         <Stack direction="row" alignItems="center" sx={{
//                             width: 300, px: 1.5, py: 0.5,
//                             border: "1px solid #ddd", borderRadius: 2, bgcolor: "background.paper"
//                         }}>
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
//                 component="div"
//                 count={filteredRows.length}
//                 page={page}
//                 rowsPerPage={rowsPerPage}
//                 rowsPerPageOptions={[8, 10, 25, 50]}
//                 onPageChange={(_, p) => setPage(p)}
//                 onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
//             />

//             {/* VIEW MODAL - NOW WORKS! */}
//             <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="md" fullWidth>
//                 <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     View Details
//                     <IconButton onClick={() => setViewModalOpen(false)}>
//                         <X />
//                     </IconButton>
//                 </DialogTitle>
//                 <DialogContent dividers>
//                     <Box p={2}>
//                         {viewRow ? (
//                             <ViewCard data={viewRow} fields={viewFields} title={title} />
//                         ) : (
//                             <Typography>Loading...</Typography>
//                         )}
//                     </Box>
//                 </DialogContent>
//             </Dialog>

//             {/* Create & Edit modals... */}
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
                        <Typography variant="h6" fontWeight={700}>{title}</Typography>
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
            <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Create New {title.replace("List", "").trim()}
                    <IconButton onClick={() => setCreateModalOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <X />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <CreateEditCard
                        fields={formFields}
                        onSave={async (data) => {
                            await onCreateSubmit(data);
                            setCreateModalOpen(false);
                        }}
                        onCancel={() => setCreateModalOpen(false)}
                        isEdit={false}
                        showToast
                    />
                </DialogContent>
            </Dialog>

            {/* EDIT MODAL - NOW WORKS */}
            <Dialog open={editModalOpen} onClose={() => { setEditModalOpen(false); setEditRow(null); }} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Edit {title.replace("List", "").trim()}
                    <IconButton onClick={() => { setEditModalOpen(false); setEditRow(null); }} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <X />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
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
                            showToast
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* VIEW MODAL */}
            <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    View Details
                    <IconButton onClick={() => setViewModalOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <X />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box p={2}>
                        {viewRow ? <ViewCard data={viewRow} fields={viewFields} title={title} /> : "Loading..."}
                    </Box>
                </DialogContent>
            </Dialog>
        </Paper>
    );
}

export default TableComponent;