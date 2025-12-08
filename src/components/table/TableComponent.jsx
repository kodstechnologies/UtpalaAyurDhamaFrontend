
// import React, { useState } from "react";
// import {
//     Table,
//     TableHead,
//     TableRow,
//     TableCell,
//     TableBody,
//     TableContainer,
//     Paper,
//     Checkbox,
//     IconButton,
//     TextField,
//     TablePagination,
//     Stack,
//     Typography,
//     Button,
// } from "@mui/material";

// import VisibilityIcon from "@mui/icons-material/Visibility";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import SearchIcon from "@mui/icons-material/Search";
// import AddIcon from "@mui/icons-material/Add";
// import { useNavigate } from "react-router-dom";

// function TableComponent({
//     title = "Table Name",
//     columns = [],
//     rows = [],
//     onDelete,
//     onCreate,
//     onView,     // New: Optional function (row) => void for View action (e.g., open modal/component)
//     onEdit,     // New: Optional function (row) => void for Edit action (e.g., open modal/component)
//     viewPath = "/view",  // Fallback navigation path if onView not provided
//     editPath = "/edit",   // Fallback navigation path if onEdit not provided
//     // Action visibility toggles (default: false to hide by default)
//     showView = false,
//     showEdit = false,
//     showDelete = false,
//     // Custom actions: array of { icon: ReactNode, color: string, onClick: (row) => void, tooltip?: string }
//     customActions = [],
//     // Header actions: array of { label: string, icon?: ReactNode, onClick: () => void, variant?: string, color?: string, sx?: object }
//     headerActions = [],
//     // Backward compatibility: if onCreate passed and headerActions empty, add default Create button
// }) {
//     const [search, setSearch] = useState("");
//     const [selected, setSelected] = useState([]);
//     const [page, setPage] = useState(0);
//     const [rowsPerPage, setRowsPerPage] = useState(8);

//     const navigate = useNavigate();

//     // Backward compatibility: Add default Create if onCreate provided and no headerActions
//     const effectiveHeaderActions = React.useMemo(() => {
//         if (onCreate && headerActions.length === 0) {
//             return [
//                 {
//                     label: "Create",
//                     icon: <AddIcon />,
//                     onClick: onCreate,
//                     variant: "contained",
//                     color: "primary",
//                     sx: {
//                         textTransform: "none",
//                         borderRadius: 2,
//                         backgroundColor: "var(--color-bg-table-button)",
//                     }
//                 }
//             ];
//         }
//         return headerActions;
//     }, [headerActions, onCreate]);

//     const filteredRows = rows.filter((row) =>
//         Object.values(row).some((value) =>
//             String(value).toLowerCase().includes(search.toLowerCase())
//         )
//     );

//     const handleSelect = (id) => {
//         setSelected((prev) =>
//             prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
//         );
//     };

//     const handleSelectAll = (event) => {
//         if (event.target.checked) {
//             setSelected(filteredRows.map((r) => r._id));
//         } else {
//             setSelected([]);
//         }
//     };

//     // Build action buttons for each row
//     // const getActions = (row) => (
//     //     <Stack direction="row" spacing={0.5}>
//     //         {showView && (
//     //             <IconButton
//     //                 sx={{ color: "var(--color-primary)" }}
//     //                 onClick={() => onView ? onView(row) : navigate(`${viewPath}/${row._id}`)}
//     //                 title="View"
//     //             >
//     //                 <VisibilityIcon fontSize="small" />
//     //             </IconButton>
//     //         )}
//     //         {showEdit && (
//     //             <IconButton
//     //                 sx={{ color: "var(--color-success)" }}
//     //                 onClick={() => onEdit ? onEdit(row) : navigate(`${editPath}/${row._id}`)}
//     //                 title="Edit"
//     //             >
//     //                 <EditIcon fontSize="small" />
//     //             </IconButton>
//     //         )}
//     //         {showDelete && onDelete && (
//     //             <IconButton
//     //                 sx={{ color: "var(--color-error)" }}
//     //                 onClick={() => onDelete(row._id)}
//     //                 title="Delete"
//     //             >
//     //                 <DeleteIcon fontSize="small" />
//     //             </IconButton>
//     //         )}
//     //         {customActions.map((action, index) => (
//     //             <IconButton
//     //                 key={index}
//     //                 sx={{ color: action.color || "var(--color-primary)" }}
//     //                 onClick={() => action.onClick(row)}
//     //                 title={action.tooltip || "Custom Action"}
//     //             >
//     //                 {action.icon}
//     //             </IconButton>
//     //         ))}
//     //     </Stack>
//     // );

//     const getActions = (row) => (
//         <Stack
//             direction="row"
//             spacing={0.5}
//             justifyContent="center"      // ⭐ Center horizontally
//             alignItems="center"          // ⭐ Center vertically
//             sx={{ width: "100%" }}       // ⭐ Fill width so center works
//         >
//             {showView && (
//                 <IconButton
//                     sx={{ color: "var(--color-primary)" }}
//                     onClick={() => onView ? onView(row) : navigate(`${viewPath}/${row._id}`)}
//                     title="View"
//                 >
//                     <VisibilityIcon fontSize="small" />
//                 </IconButton>
//             )}

//             {showEdit && (
//                 <IconButton
//                     sx={{ color: "var(--color-success)" }}
//                     onClick={() => onEdit ? onEdit(row) : navigate(`${editPath}/${row._id}`)}
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

//             {customActions.map((action, index) => (
//                 <IconButton
//                     key={index}
//                     sx={{ color: action.color || "var(--color-primary)" }}
//                     onClick={() => action.onClick(row)}
//                     title={action.tooltip || "Custom Action"}
//                 >
//                     {action.icon}
//                 </IconButton>
//             ))}
//         </Stack>
//     );


//     const hasActions = showView || showEdit || showDelete || customActions.length > 0;

//     return (
//         <Paper elevation={0} sx={{ padding: 3, borderRadius: 3, minHeight: "30vh", backgroundColor: "var(--color-bg-table)", color: "var(--color-text-dark)" }}>

//             {/* Title + Search + Header Actions */}
//             <Stack
//                 direction="row"
//                 alignItems="center"
//                 justifyContent="space-between"
//                 sx={{ mb: 2 }}
//             >
//                 {/* LEFT SIDE — TITLE + SEARCH */}
//                 <Stack direction="row" alignItems="center" spacing={3}>
//                     <Typography variant="h6" sx={{ fontWeight: 700 }}>
//                         {title}
//                     </Typography>

//                     {/* Search Box */}
//                     <Stack
//                         direction="row"
//                         alignItems="center"
//                         spacing={1}
//                         sx={{
//                             width: "280px",
//                             paddingX: 1,
//                             paddingY: 0.5,
//                             border: "1px solid #ccc",
//                             borderRadius: 2,
//                         }}
//                     >
//                         <SearchIcon sx={{ color: "var(--color-icons)" }} />
//                         <TextField
//                             sx={{
//                                 color: "var(--color-text-light)",
//                                 "& .MuiInputBase-root": {
//                                     color: "var(--color-text-light)",
//                                 },
//                             }}
//                             variant="standard"
//                             placeholder="Search here"
//                             fullWidth
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             InputProps={{
//                                 disableUnderline: true,
//                             }}
//                         />
//                     </Stack>
//                 </Stack>

//                 {/* RIGHT SIDE — HEADER ACTIONS */}
//                 {effectiveHeaderActions.length > 0 && (
//                     <Stack direction="row" spacing={1}>
//                         {effectiveHeaderActions.map((action, index) => (
//                             <Button
//                                 key={index}
//                                 variant={action.variant || "contained"}
//                                 color={action.color || "primary"}
//                                 startIcon={action.icon}
//                                 onClick={action.onClick}
//                                 sx={{
//                                     textTransform: "none",
//                                     borderRadius: 2,
//                                     backgroundColor: action.sx?.backgroundColor || "var(--color-bg-table-button)",
//                                     ...action.sx,
//                                 }}
//                             >
//                                 {action.label}
//                             </Button>
//                         ))}
//                     </Stack>
//                 )}
//             </Stack>

//             {/* TABLE */}
//             <TableContainer>
//                 <Table>
//                     <TableHead>
//                         <TableRow>
//                             <TableCell padding="checkbox">
//                                 <Checkbox
//                                     checked={selected.length > 0 && selected.length === filteredRows.length}
//                                     onChange={handleSelectAll}
//                                     sx={{
//                                         color: "var(--color-checkmark)",
//                                         "&.Mui-checked": {
//                                             color: "var(--color-checkmark-light) !important",
//                                         },
//                                         "& .MuiSvgIcon-root": {
//                                             fontSize: 24,
//                                         }
//                                     }}
//                                 />
//                             </TableCell>

//                             <TableCell sx={{ color: "var(--color-text-dark)" }}>Sl. No.</TableCell>

//                             {columns.map((col) => (
//                                 <TableCell key={col.field} sx={{ color: "var(--color-text-dark)" }}>
//                                     {col.header}
//                                 </TableCell>
//                             ))}

//                             {hasActions && (
//                                 <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>
//                                     Actions
//                                 </TableCell>
//                             )}
//                         </TableRow>
//                     </TableHead>

//                     <TableBody>
//                         {filteredRows
//                             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                             .map((row, index) => {
//                                 const realIndex = page * rowsPerPage + index + 1;

//                                 return (
//                                     <TableRow key={row._id} hover>
//                                         <TableCell padding="checkbox">
//                                             <Checkbox
//                                                 checked={selected.includes(row._id)}
//                                                 onChange={() => handleSelect(row._id)}
//                                             />
//                                         </TableCell>

//                                         <TableCell>{realIndex}</TableCell>

//                                         {columns.map((col) => (
//                                             <TableCell key={col.field}>{row[col.field]}</TableCell>
//                                         ))}

//                                         {hasActions && (
//                                             <TableCell align="center" style={{
//                                                 textAlign: "center"
//                                             }}>{getActions(row)}</TableCell>
//                                         )}
//                                     </TableRow>
//                                 );
//                             })}
//                     </TableBody>
//                 </Table>
//             </TableContainer>

//             {/* Pagination */}
//             <TablePagination
//                 component="div"
//                 page={page}
//                 count={filteredRows.length}
//                 rowsPerPage={rowsPerPage}
//                 rowsPerPageOptions={[8, 10, 20, 50]}
//                 onPageChange={(e, newPage) => setPage(newPage)}
//                 onRowsPerPageChange={(e) => {
//                     setRowsPerPage(parseInt(e.target.value));
//                     setPage(0);
//                 }}
//             />
//         </Paper>
//     );
// }

// export default TableComponent;

// import React, { useState } from "react";
// import {
//     Table,
//     TableHead,
//     TableRow,
//     TableCell,
//     TableBody,
//     TableContainer,
//     Paper,
//     Checkbox,
//     IconButton,
//     TextField,
//     TablePagination,
//     Stack,
//     Typography,
//     Button,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     Box,
// } from "@mui/material";

// import VisibilityIcon from "@mui/icons-material/Visibility";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import SearchIcon from "@mui/icons-material/Search";
// import AddIcon from "@mui/icons-material/Add";
// import { useNavigate } from "react-router-dom";

// function TableComponent({
//     title = "Table Name",
//     columns = [],
//     rows = [],
//     onDelete,
//     onCreate,
//     onView,     // New: Optional function (row) => void for View action (e.g., open modal/component)
//     onEdit,     // New: Optional function (row) => void for Edit action (e.g., open modal/component)
//     viewPath = "/view",  // Fallback navigation path if onView not provided
//     editPath = "/edit",   // Fallback navigation path if onEdit not provided
//     // Action visibility toggles (default: false to hide by default)
//     showView = false,
//     showEdit = false,
//     showDelete = false,
//     // Custom actions: array of { icon: ReactNode, color: string, onClick: (row) => void, tooltip?: string }
//     customActions = [],
//     // Header actions: array of { label: string, icon?: ReactNode, onClick: () => void, variant?: string, color?: string, sx?: object }
//     headerActions = [],
//     // Create Modal Content: React component or node to render inside the Create modal (optional)
//     createModalContent = null, // e.g., <CreateCard />
//     // Backward compatibility: if onCreate passed and headerActions empty, add default Create button
// }) {
//     const [search, setSearch] = useState("");
//     const [selected, setSelected] = useState([]);
//     const [page, setPage] = useState(0);
//     const [rowsPerPage, setRowsPerPage] = useState(8);
//     const [createModalOpen, setCreateModalOpen] = useState(false); // Modal state for Create

//     const navigate = useNavigate();

//     // Backward compatibility: Add default Create if onCreate provided and no headerActions
//     const effectiveHeaderActions = React.useMemo(() => {
//         if (onCreate && headerActions.length === 0) {
//             return [
//                 {
//                     label: "Create",
//                     icon: <AddIcon />,
//                     onClick: () => setCreateModalOpen(true), // Open modal instead of direct onCreate
//                     variant: "contained",
//                     color: "primary",
//                     sx: {
//                         textTransform: "none",
//                         borderRadius: 2,
//                         backgroundColor: "var(--color-bg-table-button)",
//                     }
//                 }
//             ];
//         }
//         return headerActions;
//     }, [headerActions, onCreate]);

//     const filteredRows = rows.filter((row) =>
//         Object.values(row).some((value) =>
//             String(value).toLowerCase().includes(search.toLowerCase())
//         )
//     );

//     const handleSelect = (id) => {
//         setSelected((prev) =>
//             prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
//         );
//     };

//     const handleSelectAll = (event) => {
//         if (event.target.checked) {
//             setSelected(filteredRows.map((r) => r._id));
//         } else {
//             setSelected([]);
//         }
//     };

//     // Build action buttons for each row
//     const getActions = (row) => (
//         <Stack
//             direction="row"
//             spacing={0.5}
//             justifyContent="center"      // ⭐ Center horizontally
//             alignItems="center"          // ⭐ Center vertically
//             sx={{ width: "100%" }}       // ⭐ Fill width so center works
//         >
//             {showView && (
//                 <IconButton
//                     sx={{ color: "var(--color-primary)" }}
//                     onClick={() => onView ? onView(row) : navigate(`${viewPath}/${row._id}`)}
//                     title="View"
//                 >
//                     <VisibilityIcon fontSize="small" />
//                 </IconButton>
//             )}

//             {showEdit && (
//                 <IconButton
//                     sx={{ color: "var(--color-success)" }}
//                     onClick={() => onEdit ? onEdit(row) : navigate(`${editPath}/${row._id}`)}
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

//             {customActions.map((action, index) => (
//                 <IconButton
//                     key={index}
//                     sx={{ color: action.color || "var(--color-primary)" }}
//                     onClick={() => action.onClick(row)}
//                     title={action.tooltip || "Custom Action"}
//                 >
//                     {action.icon}
//                 </IconButton>
//             ))}
//         </Stack>
//     );

//     const hasActions = showView || showEdit || showDelete || customActions.length > 0;

//     // Handle Create modal close (call onCreate if provided for API/submit logic)
//     const handleCreateModalClose = () => {
//         setCreateModalOpen(false);
//         if (onCreate) onCreate(); // Trigger parent's onCreate for API call if needed
//     };

//     return (
//         <Paper elevation={0} sx={{ padding: 3, borderRadius: 3, minHeight: "30vh", backgroundColor: "var(--color-bg-table)", color: "var(--color-text-dark)" }}>

//             {/* Title + Search + Header Actions */}
//             <Stack
//                 direction="row"
//                 alignItems="center"
//                 justifyContent="space-between"
//                 sx={{ mb: 2 }}
//             >
//                 {/* LEFT SIDE — TITLE + SEARCH */}
//                 <Stack direction="row" alignItems="center" spacing={3}>
//                     <Typography variant="h6" sx={{ fontWeight: 700 }}>
//                         {title}
//                     </Typography>

//                     {/* Search Box */}
//                     <Stack
//                         direction="row"
//                         alignItems="center"
//                         spacing={1}
//                         sx={{
//                             width: "280px",
//                             paddingX: 1,
//                             paddingY: 0.5,
//                             border: "1px solid #ccc",
//                             borderRadius: 2,
//                         }}
//                     >
//                         <SearchIcon sx={{ color: "var(--color-icons)" }} />
//                         <TextField
//                             sx={{
//                                 color: "var(--color-text-light)",
//                                 "& .MuiInputBase-root": {
//                                     color: "var(--color-text-light)",
//                                 },
//                             }}
//                             variant="standard"
//                             placeholder="Search here"
//                             fullWidth
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             InputProps={{
//                                 disableUnderline: true,
//                             }}
//                         />
//                     </Stack>
//                 </Stack>

//                 {/* RIGHT SIDE — HEADER ACTIONS */}
//                 {effectiveHeaderActions.length > 0 && (
//                     <Stack direction="row" spacing={1}>
//                         {effectiveHeaderActions.map((action, index) => (
//                             <Button
//                                 key={index}
//                                 variant={action.variant || "contained"}
//                                 color={action.color || "primary"}
//                                 startIcon={action.icon}
//                                 onClick={action.onClick}
//                                 sx={{
//                                     textTransform: "none",
//                                     borderRadius: 2,
//                                     backgroundColor: action.sx?.backgroundColor || "var(--color-bg-table-button)",
//                                     ...action.sx,
//                                 }}
//                             >
//                                 {action.label}
//                             </Button>
//                         ))}
//                     </Stack>
//                 )}
//             </Stack>

//             {/* TABLE */}
//             <TableContainer>
//                 <Table>
//                     <TableHead>
//                         <TableRow>
//                             <TableCell padding="checkbox">
//                                 <Checkbox
//                                     checked={selected.length > 0 && selected.length === filteredRows.length}
//                                     onChange={handleSelectAll}
//                                     sx={{
//                                         color: "var(--color-checkmark)",
//                                         "&.Mui-checked": {
//                                             color: "var(--color-checkmark-light) !important",
//                                         },
//                                         "& .MuiSvgIcon-root": {
//                                             fontSize: 24,
//                                         }
//                                     }}
//                                 />
//                             </TableCell>

//                             <TableCell sx={{ color: "var(--color-text-dark)" }}>Sl. No.</TableCell>

//                             {columns.map((col) => (
//                                 <TableCell key={col.field} sx={{ color: "var(--color-text-dark)" }}>
//                                     {col.header}
//                                 </TableCell>
//                             ))}

//                             {hasActions && (
//                                 <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>
//                                     Actions
//                                 </TableCell>
//                             )}
//                         </TableRow>
//                     </TableHead>

//                     <TableBody>
//                         {filteredRows
//                             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                             .map((row, index) => {
//                                 const realIndex = page * rowsPerPage + index + 1;

//                                 return (
//                                     <TableRow key={row._id} hover>
//                                         <TableCell padding="checkbox">
//                                             <Checkbox
//                                                 checked={selected.includes(row._id)}
//                                                 onChange={() => handleSelect(row._id)}
//                                             />
//                                         </TableCell>

//                                         <TableCell>{realIndex}</TableCell>

//                                         {columns.map((col) => (
//                                             <TableCell key={col.field}>{row[col.field]}</TableCell>
//                                         ))}

//                                         {hasActions && (
//                                             <TableCell align="center" style={{
//                                                 textAlign: "center"
//                                             }}>{getActions(row)}</TableCell>
//                                         )}
//                                     </TableRow>
//                                 );
//                             })}
//                     </TableBody>
//                 </Table>
//             </TableContainer>

//             {/* Pagination */}
//             <TablePagination
//                 component="div"
//                 page={page}
//                 count={filteredRows.length}
//                 rowsPerPage={rowsPerPage}
//                 rowsPerPageOptions={[8, 10, 20, 50]}
//                 onPageChange={(e, newPage) => setPage(newPage)}
//                 onRowsPerPageChange={(e) => {
//                     setRowsPerPage(parseInt(e.target.value));
//                     setPage(0);
//                 }}
//             />

//             {/* CREATE MODAL */}
//             <Dialog open={createModalOpen} onClose={handleCreateModalClose} maxWidth="md" fullWidth>
//                 <DialogTitle>Create New Item</DialogTitle>
//                 <DialogContent>
//                     <Box sx={{ p: 2 }}>
//                         {createModalContent ? (
//                             <Box>{createModalContent}</Box>
//                         ) : (
//                             <Typography>No content provided for Create modal.</Typography>
//                         )}
//                     </Box>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleCreateModalClose}>Cancel</Button>
//                     <Button onClick={handleCreateModalClose} variant="contained">Save</Button>
//                 </DialogActions>
//             </Dialog>
//         </Paper>
//     );
// }

// export default TableComponent;

// import React, { useState } from "react";
// import {
//     Table,
//     TableHead,
//     TableRow,
//     TableCell,
//     TableBody,
//     TableContainer,
//     Paper,
//     Checkbox,
//     IconButton,
//     TextField,
//     TablePagination,
//     Stack,
//     Typography,
//     Button,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     Box,
// } from "@mui/material";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import SearchIcon from "@mui/icons-material/Search";
// import AddIcon from "@mui/icons-material/Add";
// import { useNavigate } from "react-router-dom";
// import CreateEditCard from "../card/tableRelated/CreateEditCard"; // Adjust path to import CreateEditCard

// function TableComponent({
//     title = "Table Name",
//     columns = [],
//     rows = [],
//     onDelete,
//     onCreate, // Legacy: () => void for navigation/direct action
//     onCreateSubmit, // New: (data: any) => Promise<void> for modal create submit (API + refresh)
//     onView, // Optional function (row) => void for View action
//     onEdit, // Legacy: (row) => void for direct edit action
//     onEditSubmit, // New: (data: any, row: any) => Promise<void> for modal edit submit
//     viewPath = "/view", // Fallback navigation path if onView not provided
//     editPath = "/edit", // Fallback navigation path if onEdit not provided
//     // Action visibility toggles (default: false to hide by default)
//     showView = false,
//     showEdit = false,
//     showDelete = false,
//     // Form fields for modals: Array of { name: string, label: string, type: 'text' | 'email' | 'number' | 'date' | 'select', required: boolean, options?: array for select }
//     formFields = [],
//     // Custom actions: array of { icon: ReactNode, color: string, onClick: (row) => void, tooltip?: string }
//     customActions = [],
//     // Header actions: array of { label: string, icon?: ReactNode, onClick: () => void, variant?: string, color?: string, sx?: object }
//     headerActions = [],
//     // Legacy createModalContent (optional, but prefer formFields + onCreateSubmit for integration)
//     createModalContent = null,
// }) {
//     const [search, setSearch] = useState("");
//     const [selected, setSelected] = useState([]);
//     const [page, setPage] = useState(0);
//     const [rowsPerPage, setRowsPerPage] = useState(8);
//     const [createModalOpen, setCreateModalOpen] = useState(false);
//     const [editModalOpen, setEditModalOpen] = useState(false);
//     const [editRow, setEditRow] = useState(null);
//     const navigate = useNavigate();

//     // Backward compatibility: Add default Create if onCreate/onCreateSubmit provided and no headerActions
//     const effectiveHeaderActions = React.useMemo(() => {
//         if ((onCreate || onCreateSubmit) && headerActions.length === 0) {
//             const isModalCreate = onCreateSubmit && formFields.length > 0;
//             return [
//                 {
//                     label: "Create",
//                     icon: <AddIcon />,
//                     onClick: () => {
//                         if (isModalCreate) {
//                             setCreateModalOpen(true);
//                         } else if (onCreate) {
//                             onCreate();
//                         }
//                     },
//                     variant: "contained",
//                     color: "primary",
//                     sx: {
//                         textTransform: "none",
//                         borderRadius: 2,
//                         backgroundColor: "var(--color-bg-table-button)",
//                     }
//                 }
//             ];
//         }
//         return headerActions;
//     }, [headerActions, onCreate, onCreateSubmit, formFields.length]);

//     const filteredRows = rows.filter((row) =>
//         Object.values(row).some((value) =>
//             String(value).toLowerCase().includes(search.toLowerCase())
//         )
//     );

//     const handleSelect = (id) => {
//         setSelected((prev) =>
//             prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
//         );
//     };

//     const handleSelectAll = (event) => {
//         if (event.target.checked) {
//             setSelected(filteredRows.map((r) => r._id));
//         } else {
//             setSelected([]);
//         }
//     };

//     // Build action buttons for each row
//     const getActions = (row) => (
//         <Stack
//             direction="row"
//             spacing={0.5}
//             justifyContent="center"
//             alignItems="center"
//             sx={{ width: "100%" }}
//         >
//             {showView && (
//                 <IconButton
//                     sx={{ color: "var(--color-primary)" }}
//                     onClick={() => {
//                         if (onView) {
//                             onView(row);
//                         } else {
//                             navigate(`${viewPath}/${row._id}`);
//                         }
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
//             {customActions.map((action, index) => (
//                 <IconButton
//                     key={index}
//                     sx={{ color: action.color || "var(--color-primary)" }}
//                     onClick={() => action.onClick(row)}
//                     title={action.tooltip || "Custom Action"}
//                 >
//                     {action.icon}
//                 </IconButton>
//             ))}
//         </Stack>
//     );

//     const hasActions = showView || showEdit || showDelete || customActions.length > 0;

//     // Handle Create modal close
//     const handleCreateModalClose = () => {
//         setCreateModalOpen(false);
//         // Legacy: if no formFields, call original onCreate after close
//         if (onCreate && !onCreateSubmit) {
//             onCreate();
//         }
//     };

//     // Handle Edit modal close
//     const handleEditModalClose = () => {
//         setEditModalOpen(false);
//         setEditRow(null);
//     };

//     // Create modal content
//     const createModalContentNode = createModalContent || (
//         onCreateSubmit && formFields.length > 0 ? (
//             <CreateEditCard
//                 fields={formFields}
//                 onSave={async (data) => {
//                     await onCreateSubmit(data);
//                     handleCreateModalClose();
//                 }}
//                 onCancel={handleCreateModalClose}
//                 isEdit={false}
//                 title="Create New Item"
//                 showToast={true}
//             />
//         ) : (
//             <Typography>No content provided for Create modal.</Typography>
//         )
//     );

//     // Edit modal content
//     const editModalContentNode = onEditSubmit && formFields.length > 0 ? (
//         <CreateEditCard
//             fields={formFields}
//             payload={editRow}
//             onSave={async (data) => {
//                 await onEditSubmit(data, editRow);
//                 handleEditModalClose();
//             }}
//             onCancel={handleEditModalClose}
//             isEdit={true}
//             title="Edit Item"
//             showToast={true}
//         />
//     ) : (
//         <Typography>No content provided for Edit modal.</Typography>
//     );

//     return (
//         <Paper elevation={0} sx={{ padding: 3, borderRadius: 3, minHeight: "30vh", backgroundColor: "var(--color-bg-table)", color: "var(--color-text-dark)" }}>
//             {/* Title + Search + Header Actions */}
//             <Stack
//                 direction="row"
//                 alignItems="center"
//                 justifyContent="space-between"
//                 sx={{ mb: 2 }}
//             >
//                 {/* LEFT SIDE — TITLE + SEARCH */}
//                 <Stack direction="row" alignItems="center" spacing={3}>
//                     <Typography variant="h6" sx={{ fontWeight: 700 }}>
//                         {title}
//                     </Typography>
//                     {/* Search Box */}
//                     <Stack
//                         direction="row"
//                         alignItems="center"
//                         spacing={1}
//                         sx={{
//                             width: "280px",
//                             paddingX: 1,
//                             paddingY: 0.5,
//                             border: "1px solid #ccc",
//                             borderRadius: 2,
//                         }}
//                     >
//                         <SearchIcon sx={{ color: "var(--color-icons)" }} />
//                         <TextField
//                             sx={{
//                                 color: "var(--color-text-light)",
//                                 "& .MuiInputBase-root": {
//                                     color: "var(--color-text-light)",
//                                 },
//                             }}
//                             variant="standard"
//                             placeholder="Search here"
//                             fullWidth
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             InputProps={{
//                                 disableUnderline: true,
//                             }}
//                         />
//                     </Stack>
//                 </Stack>
//                 {/* RIGHT SIDE — HEADER ACTIONS */}
//                 {effectiveHeaderActions.length > 0 && (
//                     <Stack direction="row" spacing={1}>
//                         {effectiveHeaderActions.map((action, index) => (
//                             <Button
//                                 key={index}
//                                 variant={action.variant || "contained"}
//                                 color={action.color || "primary"}
//                                 startIcon={action.icon}
//                                 onClick={action.onClick}
//                                 sx={{
//                                     textTransform: "none",
//                                     borderRadius: 2,
//                                     backgroundColor: action.sx?.backgroundColor || "var(--color-bg-table-button)",
//                                     ...action.sx,
//                                 }}
//                             >
//                                 {action.label}
//                             </Button>
//                         ))}
//                     </Stack>
//                 )}
//             </Stack>
//             {/* TABLE */}
//             <TableContainer>
//                 <Table>
//                     <TableHead>
//                         <TableRow>
//                             <TableCell padding="checkbox">
//                                 <Checkbox
//                                     checked={selected.length > 0 && selected.length === filteredRows.length}
//                                     onChange={handleSelectAll}
//                                     sx={{
//                                         color: "var(--color-checkmark)",
//                                         "&.Mui-checked": {
//                                             color: "var(--color-checkmark-light) !important",
//                                         },
//                                         "& .MuiSvgIcon-root": {
//                                             fontSize: 24,
//                                         }
//                                     }}
//                                 />
//                             </TableCell>
//                             <TableCell sx={{ color: "var(--color-text-dark)" }}>Sl. No.</TableCell>
//                             {columns.map((col) => (
//                                 <TableCell key={col.field} sx={{ color: "var(--color-text-dark)" }}>
//                                     {col.header}
//                                 </TableCell>
//                             ))}
//                             {hasActions && (
//                                 <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>
//                                     Actions
//                                 </TableCell>
//                             )}
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {filteredRows
//                             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                             .map((row, index) => {
//                                 const realIndex = page * rowsPerPage + index + 1;
//                                 return (
//                                     <TableRow key={row._id} hover>
//                                         <TableCell padding="checkbox">
//                                             <Checkbox
//                                                 checked={selected.includes(row._id)}
//                                                 onChange={() => handleSelect(row._id)}
//                                             />
//                                         </TableCell>
//                                         <TableCell>{realIndex}</TableCell>
//                                         {columns.map((col) => (
//                                             <TableCell key={col.field}>{row[col.field]}</TableCell>
//                                         ))}
//                                         {hasActions && (
//                                             <TableCell align="center" style={{
//                                                 textAlign: "center"
//                                             }}>{getActions(row)}</TableCell>
//                                         )}
//                                     </TableRow>
//                                 );
//                             })}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//             {/* Pagination */}
//             <TablePagination
//                 component="div"
//                 page={page}
//                 count={filteredRows.length}
//                 rowsPerPage={rowsPerPage}
//                 rowsPerPageOptions={[8, 10, 20, 50]}
//                 onPageChange={(e, newPage) => setPage(newPage)}
//                 onRowsPerPageChange={(e) => {
//                     setRowsPerPage(parseInt(e.target.value));
//                     setPage(0);
//                 }}
//             />
//             {/* CREATE MODAL */}
//             <Dialog open={createModalOpen} onClose={handleCreateModalClose} maxWidth="md" fullWidth>
//                 <DialogTitle>Create New Item</DialogTitle>
//                 <DialogContent>
//                     <Box sx={{ p: 2 }}>
//                         {createModalContentNode}
//                     </Box>
//                 </DialogContent>
//             </Dialog>
//             {/* EDIT MODAL */}
//             <Dialog open={editModalOpen} onClose={handleEditModalClose} maxWidth="md" fullWidth>
//                 <DialogTitle>Edit Item</DialogTitle>
//                 <DialogContent>
//                     <Box sx={{ p: 2 }}>
//                         {editModalContentNode}
//                     </Box>
//                 </DialogContent>
//             </Dialog>
//         </Paper>
//     );
// }

// export default TableComponent;

import React, { useState } from "react";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
    Checkbox,
    IconButton,
    TextField,
    TablePagination,
    Stack,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import CreateEditCard from "../card/tableRelated/CreateEditCard"; // Adjust path to import CreateEditCard
import ViewCard from "../card/tableRelated/ViewCard"; // Adjust path to import ViewCard
import { X } from 'lucide-react';

function TableComponent({
    title = "Table Name",
    columns = [],
    rows = [],
    onDelete,
    onCreate, // Legacy: () => void for navigation/direct action
    onCreateSubmit, // New: (data: any) => Promise<void> for modal create submit (API + refresh)
    onView, // Optional function (row) => void for View action (custom)
    onEdit, // Legacy: (row) => void for direct edit action
    onEditSubmit, // New: (data: any, row: any) => Promise<void> for modal edit submit
    viewPath = "/view", // Fallback navigation path if onView not provided and no modal
    editPath = "/edit", // Fallback navigation path if onEdit not provided
    // Action visibility toggles (default: false to hide by default)
    showView = false,
    showEdit = false,
    showDelete = false,
    // Form fields for modals: Array of { name: string, label: string, type: 'text' | 'email' | 'number' | 'date' | 'select', required: boolean, options?: array for select }
    formFields = [],
    // Custom actions: array of { icon: ReactNode, color: string, onClick: (row) => void, tooltip?: string }
    customActions = [],
    // Header actions: array of { label: string, icon?: ReactNode, onClick: () => void, variant?: string, color?: string, sx?: object }
    headerActions = [],
    // Legacy createModalContent (optional, but prefer formFields + onCreateSubmit for integration)
    createModalContent = null,
}) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewRow, setViewRow] = useState(null);
    const navigate = useNavigate();

    // Backward compatibility: Add default Create if onCreate/onCreateSubmit provided and no headerActions
    const effectiveHeaderActions = React.useMemo(() => {
        if ((onCreate || onCreateSubmit) && headerActions.length === 0) {
            const isModalCreate = onCreateSubmit && formFields.length > 0;
            return [
                {
                    label: "Create",
                    icon: <AddIcon />,
                    onClick: () => {
                        if (isModalCreate) {
                            setCreateModalOpen(true);
                        } else if (onCreate) {
                            onCreate();
                        }
                    },
                    variant: "contained",
                    color: "primary",
                    sx: {
                        textTransform: "none",
                        borderRadius: 2,
                        backgroundColor: "var(--color-bg-table-button)",
                    }
                }
            ];
        }
        return headerActions;
    }, [headerActions, onCreate, onCreateSubmit, formFields.length]);

    const filteredRows = rows.filter((row) =>
        Object.values(row).some((value) =>
            String(value).toLowerCase().includes(search.toLowerCase())
        )
    );

    const handleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelected(filteredRows.map((r) => r._id));
        } else {
            setSelected([]);
        }
    };

    // Derive view fields from columns for read-only display
    const viewFields = columns.map((col) => ({ name: col.field, label: col.header }));

    // Build action buttons for each row
    const getActions = (row) => (
        <Stack
            direction="row"
            spacing={0.5}
            justifyContent="center"
            alignItems="center"
            sx={{ width: "100%" }}
        >
            {showView && (
                <IconButton
                    sx={{ color: "var(--color-primary)" }}
                    onClick={() => {
                        if (onView) {
                            onView(row);
                        } else {
                            setViewRow(row);
                            setViewModalOpen(true);
                        }
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
                        const isModalEdit = onEditSubmit && formFields.length > 0;
                        if (isModalEdit) {
                            setEditRow(row);
                            setEditModalOpen(true);
                        } else if (onEdit) {
                            onEdit(row);
                        } else {
                            navigate(`${editPath}/${row._id}`);
                        }
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
            {customActions.map((action, index) => (
                <IconButton
                    key={index}
                    sx={{ color: action.color || "var(--color-primary)" }}
                    onClick={() => action.onClick(row)}
                    title={action.tooltip || "Custom Action"}
                >
                    {action.icon}
                </IconButton>
            ))}
        </Stack>
    );

    const hasActions = showView || showEdit || showDelete || customActions.length > 0;

    // Handle Create modal close
    const handleCreateModalClose = () => {
        setCreateModalOpen(false);
        // Legacy: if no formFields, call original onCreate after close
        if (onCreate && !onCreateSubmit) {
            onCreate();
        }
    };

    // Handle Edit modal close
    const handleEditModalClose = () => {
        setEditModalOpen(false);
        setEditRow(null);
    };

    // Handle View modal close
    const handleViewModalClose = () => {
        setViewModalOpen(false);
        setViewRow(null);
    };

    // Create modal content
    const createModalContentNode = createModalContent || (
        onCreateSubmit && formFields.length > 0 ? (
            <CreateEditCard
                fields={formFields}
                onSave={async (data) => {
                    await onCreateSubmit(data);
                    handleCreateModalClose();
                }}
                onCancel={handleCreateModalClose}
                isEdit={false}
                title="Create New Item"
                showToast={true}
            />
        ) : (
            <Typography>No content provided for Create modal.</Typography>
        )
    );

    // Edit modal content
    const editModalContentNode = onEditSubmit && formFields.length > 0 ? (
        <CreateEditCard
            fields={formFields}
            payload={editRow}
            onSave={async (data) => {
                await onEditSubmit(data, editRow);
                handleEditModalClose();
            }}
            onCancel={handleEditModalClose}
            isEdit={true}
            title="Edit Item"
            showToast={true}
        />
    ) : (
        <Typography>No content provided for Edit modal.</Typography>
    );

    return (
        <Paper elevation={0} sx={{ padding: 3, borderRadius: 3, minHeight: "30vh", backgroundColor: "var(--color-bg-table)", color: "var(--color-text-dark)" }}>
            {/* Title + Search + Header Actions */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
            >
                {/* LEFT SIDE — TITLE + SEARCH */}
                <Stack direction="row" alignItems="center" spacing={3}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {title}
                    </Typography>
                    {/* Search Box */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            width: "280px",
                            paddingX: 1,
                            paddingY: 0.5,
                            border: "1px solid #ccc",
                            borderRadius: 2,
                        }}
                    >
                        <SearchIcon sx={{ color: "var(--color-icons)" }} />
                        <TextField
                            sx={{
                                color: "var(--color-text-light)",
                                "& .MuiInputBase-root": {
                                    color: "var(--color-text-light)",
                                },
                            }}
                            variant="standard"
                            placeholder="Search here"
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                disableUnderline: true,
                            }}
                        />
                    </Stack>
                </Stack>
                {/* RIGHT SIDE — HEADER ACTIONS */}
                {effectiveHeaderActions.length > 0 && (
                    <Stack direction="row" spacing={1}>
                        {effectiveHeaderActions.map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant || "contained"}
                                color={action.color || "primary"}
                                startIcon={action.icon}
                                onClick={action.onClick}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                    backgroundColor: action.sx?.backgroundColor || "var(--color-bg-table-button)",
                                    ...action.sx,
                                }}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </Stack>
                )}
            </Stack>
            {/* TABLE */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selected.length > 0 && selected.length === filteredRows.length}
                                    onChange={handleSelectAll}
                                    sx={{
                                        color: "var(--color-checkmark)",
                                        "&.Mui-checked": {
                                            color: "var(--color-checkmark-light) !important",
                                        },
                                        "& .MuiSvgIcon-root": {
                                            fontSize: 24,
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell sx={{ color: "var(--color-text-dark)" }}>Sl. No.</TableCell>
                            {columns.map((col) => (
                                <TableCell key={col.field} sx={{ color: "var(--color-text-dark)" }}>
                                    {col.header}
                                </TableCell>
                            ))}
                            {hasActions && (
                                <TableCell align="center" sx={{ color: "var(--color-text-dark)" }}>
                                    Actions
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, index) => {
                                const realIndex = page * rowsPerPage + index + 1;
                                return (
                                    <TableRow key={row._id} hover>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selected.includes(row._id)}
                                                onChange={() => handleSelect(row._id)}
                                            />
                                        </TableCell>
                                        <TableCell>{realIndex}</TableCell>
                                        {columns.map((col) => (
                                            <TableCell key={col.field}>{row[col.field]}</TableCell>
                                        ))}
                                        {hasActions && (
                                            <TableCell align="center" style={{
                                                textAlign: "center"
                                            }}>{getActions(row)}</TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Pagination */}
            <TablePagination
                component="div"
                page={page}
                count={filteredRows.length}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[8, 10, 20, 50]}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value));
                    setPage(0);
                }}
            />
            {/* CREATE MODAL */}
            <Dialog open={createModalOpen} onClose={handleCreateModalClose} maxWidth="md" fullWidth>

                {/* 🔥 Title + Close Button in ONE ROW */}
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingRight: 2,
                    }}
                >
                    Create New Item

                    <IconButton onClick={handleCreateModalClose} size="small">
                        <X />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        {createModalContentNode}
                    </Box>
                </DialogContent>

            </Dialog>

            {/* EDIT MODAL */}
            <Dialog open={editModalOpen} onClose={handleEditModalClose} maxWidth="md" fullWidth>

                {/* 🔥 Title + X button in ONE row */}
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingRight: 2,
                    }}
                >
                    Edit Item

                    <IconButton onClick={handleEditModalClose} size="small">
                        <X />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        {editModalContentNode}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* VIEW MODAL */}
            <Dialog open={viewModalOpen} onClose={handleViewModalClose} maxWidth="md" fullWidth>

                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingRight: 2,
                    }}
                >
                    View Details

                    <IconButton onClick={handleViewModalClose} size="small">
                        <X />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        {viewRow ? (
                            <ViewCard
                                data={viewRow}
                                fields={viewFields}
                                title={`${title} Details`}
                            />
                        ) : (
                            <Typography>Loading...</Typography>
                        )}
                    </Box>
                </DialogContent>

            </Dialog>

        </Paper>
    );
}

export default TableComponent;