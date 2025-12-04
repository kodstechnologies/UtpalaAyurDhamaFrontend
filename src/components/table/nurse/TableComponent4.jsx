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
    TextField,
    TablePagination,
    Stack,
    Typography,
    Button,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

function TableComponent4({ title = "Table Name", columns = [], rows = [], onCreate }) {
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

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(filteredRows.map((r) => r._id));
        } else {
            setSelected([]);
        }
    };

    return (
        <Paper elevation={0} sx={{ padding: 3, borderRadius: 3, backgroundColor: "var(--color-bg-table)" }}>

            {/* Header Section */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={3}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {title}
                    </Typography>

                    {/* Search */}
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
                            InputProps={{ disableUnderline: true }}
                        />
                    </Stack>
                </Stack>

                {/* Create Button */}
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreate}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                >
                    Create
                </Button>
            </Stack>

            {/* Table */}
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
                                            <TableCell key={col.field}>
                                                {row[col.field]}
                                            </TableCell>
                                        ))}

                                        <TableCell align="center">
                                            {/* Prepare Discharge Button */}
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{ textTransform: "none" }}
                                                onClick={() => navigate(`/prepare-discharge/${row._id}`)}
                                            >
                                                Prepare Discharge
                                            </Button>
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
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
            />
        </Paper>
    );
}

export default TableComponent4;
