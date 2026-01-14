import { useState } from "react";
import {
    Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Checkbox,
    TablePagination, Stack,
    IconButton,
    Chip,
    Tooltip,
    Box
} from "@mui/material";

function TableComponent({
    columns = [],
    rows = [],

    actions = [],   // ← ALL ACTIONS COME FROM PARENT

    showStatusBadge = false,
    statusField = null,
    showCheckbox = true, // New prop to control checkbox visibility
}) {
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    // Ensure rows is always an array
    const safeRows = Array.isArray(rows) ? rows : [];

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelected(safeRows.map((r) => r._id));
        else setSelected([]);
    };

    const handleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    const hasActions = (typeof actions === 'function' ? true : actions.length > 0);

    // Helper function to render cell content
    const renderCellContent = (col, row) => {
        if (col.render) {
            return col.render(row);
        }
        if (col.field === statusField && showStatusBadge && row[col.field]) {
            const status = row[col.field];
            return (
                // <Chip
                //     label={status}
                //     color={status === 'Active' ? 'success' : 'error'}
                //     size="small"
                //     variant="filled"
                // />
                <Chip
                    label={status}
                    size="small"
                    sx={{
                        backgroundColor:
                            status?.toLowerCase() === "active" ? "#1987542e" : "#8e714f30",
                        color:
                            status?.toLowerCase() === "active" ? "#2C5530" : "#5A5044",
                        fontWeight: 500,
                    }}
                />

            );
        }
        return row[col.field] ?? "-";
    };

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>

            {/* TABLE */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {showCheckbox && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={
                                            selected.length === safeRows.length && safeRows.length > 0
                                        }
                                        indeterminate={
                                            selected.length > 0 &&
                                            selected.length < safeRows.length
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                            )}

                            <TableCell>Sl. No.</TableCell>

                            {columns.map((col) => (
                                <TableCell key={col.field}>{col.header}</TableCell>
                            ))}

                            {hasActions && (
                                <TableCell align="center">Actions</TableCell>
                            )}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {safeRows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, i) => (
                                <TableRow key={row._id || i} hover>
                                    {showCheckbox && (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selected.includes(row._id)}
                                                onChange={() => handleSelect(row._id)}
                                            />
                                        </TableCell>
                                    )}

                                    <TableCell>
                                        {page * rowsPerPage + i + 1}
                                    </TableCell>

                                    {columns.map((col) => (
                                        <TableCell key={col.field}>
                                            {renderCellContent(col, row)}
                                        </TableCell>
                                    ))}

                                    {hasActions && (
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={0.8} justifyContent="center">
                                                {(typeof actions === 'function' ? actions(row) : actions).map((action, idx) => {
                                                    // If action has a render function, use it directly
                                                    if (typeof action.render === 'function') {
                                                        const renderedContent = action.render(row);
                                                        const tooltipText = typeof action.tooltip === 'function'
                                                            ? action.tooltip(row)
                                                            : (action.tooltip || "");
                                                        
                                                        return tooltipText ? (
                                                            <Tooltip key={idx} title={tooltipText} arrow>
                                                                {renderedContent}
                                                            </Tooltip>
                                                        ) : (
                                                            <Box key={idx}>{renderedContent}</Box>
                                                        );
                                                    }
                                                    
                                                    // Handle function-based icon and color
                                                    const iconElement = typeof action.icon === 'function' 
                                                        ? action.icon(row) 
                                                        : action.icon;
                                                    const colorValue = typeof action.color === 'function' 
                                                        ? action.color(row) 
                                                        : action.color;
                                                    const tooltipText = typeof action.label === 'function'
                                                        ? action.label(row)
                                                        : (action.tooltip || action.label || "");
                                                    
                                                    const iconButton = (
                                                    <IconButton
                                                        key={idx}
                                                        sx={{ color: colorValue || "var(--color-primary)" }}
                                                        onClick={() => action.onClick(row)}
                                                        disabled={action.disabled || false}
                                                    >
                                                        {iconElement}
                                                    </IconButton>
                                                    );
                                                    
                                                    return tooltipText ? (
                                                        <Tooltip key={idx} title={tooltipText} arrow>
                                                            {iconButton}
                                                        </Tooltip>
                                                    ) : (
                                                        iconButton
                                                    );
                                                })}
                                            </Stack>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* PAGINATION */}
            <TablePagination
                component="div"
                count={safeRows.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(+e.target.value);
                    setPage(0);
                }}
            />
        </Paper>
    );
}

export default TableComponent;