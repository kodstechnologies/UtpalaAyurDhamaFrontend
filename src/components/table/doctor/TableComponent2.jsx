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
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

import MedicalServicesIcon from "@mui/icons-material/MedicalServices"; // Treatment
import MedicationIcon from "@mui/icons-material/Medication"; // Medicine
import NoteAltIcon from "@mui/icons-material/NoteAlt"; // Notes

import { useNavigate } from "react-router-dom";

function TableComponent2({ title = "Table Name", columns = [], rows = [], onDelete, onCreate }) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    const navigate = useNavigate();

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

    return (
        <Paper elevation={0} sx={{ padding: 3, borderRadius: 3, minHeight: "30vh", backgroundColor: "var(--color-bg-table)" }}>

            {/* Title + Search + Create Button */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
            >
                <Stack direction="row" alignItems="center" spacing={3}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {title}
                    </Typography>

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
                        <SearchIcon color="primary" />
                        <TextField
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

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreate}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                >
                    Create
                </Button>
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
                                />
                            </TableCell>

                            <TableCell>Sl. No.</TableCell>

                            {columns.map((col) => (
                                <TableCell key={col.field}>{col.header}</TableCell>
                            ))}

                            <TableCell align="center">Actions</TableCell>
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

                                        {/* ACTION BUTTONS EXACTLY LIKE YOUR SCREENSHOT */}
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1.5} justifyContent="center">

                                                {/* View */}
                                                <IconButton
                                                    onClick={() => navigate(`/view/${row._id}`)}
                                                    sx={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: "10px",
                                                        border: "2px solid #4f4f4f",
                                                        color: "#4f4f4f",
                                                    }}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>

                                                {/* Treatment */}
                                                <IconButton
                                                    onClick={() => navigate(`/treatment/${row._id}`)}
                                                    sx={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: "10px",
                                                        border: "2px solid #0ca678",
                                                        color: "#0ca678",
                                                    }}
                                                >
                                                    <MedicalServicesIcon />
                                                </IconButton>

                                                {/* Medicine */}
                                                <IconButton
                                                    onClick={() => navigate(`/medicine/${row._id}`)}
                                                    sx={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: "10px",
                                                        border: "2px solid #7e57c2",
                                                        color: "#7e57c2",
                                                    }}
                                                >
                                                    <MedicationIcon />
                                                </IconButton>

                                                {/* Edit */}
                                                <IconButton
                                                    onClick={() => navigate(`/edit/${row._id}`)}
                                                    sx={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: "10px",
                                                        border: "2px solid #ff9800",
                                                        color: "#ff9800",
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>

                                                {/* Delete */}
                                                <IconButton
                                                    onClick={() => onDelete?.(row._id)}
                                                    sx={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: "10px",
                                                        border: "2px solid #ef5350",
                                                        color: "#ef5350",
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>

                                                {/* Notes */}
                                                <IconButton
                                                    onClick={() => navigate(`/notes/${row._id}`)}
                                                    sx={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: "10px",
                                                        border: "2px solid #43a047",
                                                        color: "#43a047",
                                                    }}
                                                >
                                                    <NoteAltIcon />
                                                </IconButton>

                                            </Stack>
                                        </TableCell>
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
        </Paper>
    );
}

export default TableComponent2;
