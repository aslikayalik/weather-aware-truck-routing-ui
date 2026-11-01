import React, { useState } from 'react';
import {
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Typography,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  CheckCircle as CheckCircleIcon,
  CallMerge as CallMergeIcon,
} from '@mui/icons-material';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { useTranslation } from 'react-i18next';

export interface ModernTableColumn {
  field: string;
  headerName: string;
  width?: number | string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  compact?: boolean;
  wrap?: boolean;
  renderCell?: (row: any, column: ModernTableColumn) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
}

export interface ModernTableProps {
  rows: any[];
  columns: ModernTableColumn[];
  onEdit?: (row: any) => void;
  onApprove?: (row: any) => void;
  onMerge?: (row: any) => void;
  editLabel?: string;
  approveLabel?: string;
  onView?: (row: any) => void;
  onDelete?: (row: any) => void;
  onToggleActive?: (row: any) => void;
  isEditDisabled?: (row: any) => boolean;
  deleteConfirmMessage?: (row: any) => string;
  deleteConfirmName?: string;
  onRowClick?: (row: any) => void;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  selectable?: boolean;
  showActions?: boolean;
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  emptyMessage?: string;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  canDelete?: (row: any) => boolean;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isFetching?: boolean;
  loadingMessage?: string;
  toggleActiveOnlyForActive?: boolean;
}

const ModernTable: React.FC<ModernTableProps> = ({
  rows,
  columns,
  onEdit,
  editLabel = 'Edit',
  onApprove,
  approveLabel = 'ONAYLA',
  onMerge,
  onView,
  onDelete,
  onToggleActive,
  isEditDisabled,
  deleteConfirmMessage,
  deleteConfirmName = 'evet',
  onRowClick,
  selectedIds = [],
  onSelectionChange,
  selectable = false,
  showActions = true,
  defaultRowsPerPage = 20,
  rowsPerPageOptions = [10, 20, 50, 100],
  emptyMessage = 'No records found',
  stickyHeader = true,
  maxHeight = 600,
  canDelete,
  page: externalPage,
  rowsPerPage: externalRowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  isFetching = false,
  loadingMessage = 'Updating...',
  toggleActiveOnlyForActive = false,
}) => {
  const { t } = useTranslation();
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(defaultRowsPerPage);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentRow, setCurrentRow] = useState<any>(null);

  const page = typeof externalPage === 'number' ? externalPage : internalPage;
  const rowsPerPage = typeof externalRowsPerPage === 'number' ? externalRowsPerPage : internalRowsPerPage;
  const actualTotalCount = (typeof totalCount === 'number' && totalCount > 0) ? totalCount : rows.length;

  const shouldShowActionsForRow = (row: any) => {
    if (!showActions) return false;

    const hasOnlyToggleActive = onToggleActive && !onEdit && !onDelete && !onView && !onApprove && !onMerge;
    if (hasOnlyToggleActive && toggleActiveOnlyForActive) {
      return row.is_active === true;
    }

    return showActions;
  };

  const hasAnyAction = (!!onEdit || !!onView || !!onDelete || !!onToggleActive || !!onApprove || !!onMerge) && showActions;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setCurrentRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentRow(null);
  };

  const handleEditClick = () => {
    if (currentRow && onEdit) {
      onEdit(currentRow);
    }
    handleMenuClose();
  };

  const handleViewClick = () => {
    if (currentRow && onView) {
      onView(currentRow);
    }
    handleMenuClose();
  };

  const handleApproveClick = () => {
    if (currentRow && onApprove) {
      onApprove(currentRow);
    }
    handleMenuClose();
  };

  const handleMergeClick = () => {
    if (currentRow && onMerge) {
      onMerge(currentRow);
    }
    handleMenuClose();
  };

  const handleToggleActiveClick = () => {
    if (currentRow && onToggleActive) {
      onToggleActive(currentRow);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (rowToDelete && onDelete) {
      onDelete(rowToDelete);
    }
    setDeleteDialogOpen(false);
    setRowToDelete(null);
  };

  const displayRows = onPageChange ? rows : rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const selected = selectedIds;

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const handleClick = (id: string) => {
    if (!selectable) return;
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter(item => item !== id);
    }

    onSelectionChange?.(newSelected);
  };

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <>
      <Paper sx={{ border: '1px solid #eaecf0', borderRadius: '8px', boxShadow: 'none', mt: 2, position: 'relative', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {isFetching && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
            <LinearProgress sx={{ height: 2, borderRadius: '8px 8px 0 0' }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderBottom: '1px solid #eaecf0' }}>
              <Typography sx={{ fontSize: '11px', color: '#667085', fontWeight: 500 }}>
                {loadingMessage ?? t('modernTable.loadingMessage')}
              </Typography>
            </Box>
          </Box>
        )}
        <TableContainer sx={{ flex: 1, minHeight: 0, maxHeight: maxHeight === 'none' ? undefined : maxHeight, width: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
          <Table
            stickyHeader={stickyHeader}
            sx={{
              width: '100%',
              minWidth: 0,
              tableLayout: 'fixed',
            }}
          >
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell padding="checkbox" sx={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #eaecf0', width: 48 }}>
                    <Checkbox
                      color="primary"
                      indeterminate={selected.length > 0 && selected.length < rows.length}
                      checked={rows.length > 0 && selected.length === rows.length}
                      onChange={(e) => {
                        const newSelected = e.target.checked ? rows.map(n => n.id) : [];
                        onSelectionChange?.(newSelected);
                      }}
                      sx={{ color: '#d0d5dd', '&.Mui-checked': { color: '#1570EF' } }}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    align={column.align || 'left'}
                    sx={{
                      backgroundColor: '#f9fafb',
                      borderBottom: '1px solid #eaecf0',

                      padding: column.compact
                        ? '8px 4px'
                        : '10px 8px',
                      width: column.width,
                      minWidth: column.minWidth,
                      boxSizing: 'border-box',
                      verticalAlign: 'middle',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: column.compact
                          ? '9px'
                          : '10px',

                        fontWeight: 600,
                        color: '#667085',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2px',
                        lineHeight: 1.15,
                        whiteSpace: 'normal',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                      }}
                    >
                      {column.renderHeader
                        ? column.renderHeader()
                        : column.headerName}
                    </Typography>
                  </TableCell>
                ))}
                {hasAnyAction && (
                  <TableCell
                    align="right"
                    sx={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #eaecf0', padding: '12px 20px', width: 80 }}
                  />
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (selectable ? 1 : 0) + (hasAnyAction ? 1 : 0)}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <Typography color="textSecondary">
                      {emptyMessage ?? t('modernTable.emptyMessage')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayRows.map((row) => {
                  const showRowActions = shouldShowActionsForRow(row);

                  return (
                    <TableRow
                      key={row.id}
                      hover
                      onClick={() => {
                        handleClick(row.id);
                        handleRowClick(row);
                      }}
                      sx={{ '&:hover': { backgroundColor: '#f9fafb' }, cursor: 'pointer' }}
                    >
                      {selectable && (
                        <TableCell padding="checkbox" sx={{ borderTop: '1px solid #eaecf0' }}>
                          <Checkbox
                            checked={isSelected(row.id)}
                            color="primary"
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleClick(row.id)}
                            sx={{ color: '#d0d5dd' }}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell
                          key={column.field}
                          align={column.align || 'left'}
                          sx={{
                            padding: column.compact
                              ? '10px 4px'
                              : '12px 8px',

                            fontSize: column.compact
                              ? '11px'
                              : '13px',

                            borderTop: '1px solid #eaecf0',
                            width: column.width,
                            minWidth: column.minWidth,
                            boxSizing: 'border-box',
                            verticalAlign: 'middle',
                            whiteSpace: column.wrap
                              ? 'normal'
                              : 'nowrap',

                            overflowWrap: column.wrap
                              ? 'anywhere'
                              : 'normal',

                            wordBreak: column.wrap
                              ? 'break-word'
                              : 'normal',
                            overflow: 'hidden',

                            textOverflow: column.wrap
                              ? 'clip'
                              : 'ellipsis',
                          }}
                        >
                          {column.renderCell
                            ? column.renderCell(row, column)
                            : (
                              <span>
                                {row[column.field]}
                              </span>
                            )}
                        </TableCell>
                      ))}
                      {hasAnyAction && showRowActions && (
                        <TableCell align="right" sx={{ padding: '16px 20px', borderTop: '1px solid #eaecf0' }}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, row)}
                          >
                            <MoreVertIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </TableCell>
                      )}
                      {hasAnyAction && !showRowActions && (
                        <TableCell sx={{ padding: '16px 20px', borderTop: '1px solid #eaecf0' }} />
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderTop: '4px solid #eaecf0', flexShrink: 0 }}>
          <Typography sx={{ fontSize: '12px', color: '#344054' }}>
            {actualTotalCount === 0 ? 0 : page * rowsPerPage + 1}-
            {Math.min((page + 1) * rowsPerPage, actualTotalCount)} / {actualTotalCount} {t('modernTable.pagination.records')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '11px', color: '#344054', mr: 1 }}>{t('modernTable.pagination.show')}</Typography>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                const handler = onRowsPerPageChange || ((ev: React.ChangeEvent<HTMLInputElement>) => {
                  setInternalRowsPerPage(parseInt(ev.target.value, 10));
                  setInternalPage(0);
                });
                handler({ target: { value: e.target.value } } as React.ChangeEvent<HTMLInputElement>);
              }}
              style={{
                padding: '2px 6px',
                border: '1px solid #d0d5dd',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                backgroundColor: '#fff',
                height: '28px',
              }}
            >
              {rowsPerPageOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <Box sx={{ display: 'flex', gap: 0.3, ml: 1 }}>
              <IconButton
                onClick={() => {
                  const handler = onPageChange || ((_, newPage: number) => setInternalPage(newPage));
                  handler(null, 0);
                }}
                disabled={page === 0}
                sx={{ border: '1px solid #d0d5dd', borderRadius: '6px', p: 0.25 }}
                size="small"
              >
                <FirstPageIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                onClick={() => {
                  const handler = onPageChange || ((_, newPage: number) => setInternalPage(newPage));
                  handler(null, page - 1);
                }}
                disabled={page === 0}
                sx={{ border: '1px solid #d0d5dd', borderRadius: '6px', p: 0.25 }}
                size="small"
              >
                <KeyboardArrowLeft sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                onClick={() => {
                  const handler = onPageChange || ((_, newPage: number) => setInternalPage(newPage));
                  handler(null, page + 1);
                }}
                disabled={page >= Math.ceil(actualTotalCount / rowsPerPage) - 1}
                sx={{ border: '1px solid #d0d5dd', borderRadius: '6px', p: 0.25 }}
                size="small"
              >
                <KeyboardArrowRight sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                onClick={() => {
                  const handler = onPageChange || ((_, newPage: number) => setInternalPage(newPage));
                  const lastPage = Math.max(0, Math.ceil(actualTotalCount / rowsPerPage) - 1);
                  handler(null, lastPage);
                }}
                disabled={page >= Math.ceil(actualTotalCount / rowsPerPage) - 1}
                sx={{ border: '1px solid #d0d5dd', borderRadius: '6px', p: 0.25 }}
                size="small"
              >
                <LastPageIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Dynamic menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: '8px' } }}
      >
        {onView && (
          <MenuItem onClick={handleViewClick} sx={{ fontSize: '14px' }}>
            <ListItemIcon><VisibilityIcon sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primary={t('modernTable.actions.view')} />
          </MenuItem>
        )}

        {onEdit && (
          <MenuItem
            onClick={handleEditClick}
            disabled={currentRow && isEditDisabled ? isEditDisabled(currentRow) : false}
            sx={{ fontSize: '14px' }}
          >
            <ListItemIcon><EditIcon sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primary={editLabel} />
          </MenuItem>
        )}

        {onApprove && (
          <MenuItem onClick={handleApproveClick} sx={{ fontSize: '14px' }}>
            <ListItemIcon><CheckCircleIcon sx={{ fontSize: 18, color: '#22c55e' }} /></ListItemIcon>
            <ListItemText primary={approveLabel} />
          </MenuItem>
        )}

        {onDelete && currentRow && (canDelete ? canDelete(currentRow) : true) && (
          <MenuItem
            onClick={() => { setRowToDelete(currentRow); setDeleteDialogOpen(true); handleMenuClose(); }}
            sx={{ color: '#dc2626', fontSize: '14px' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}><DeleteIcon sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primary={t('modernTable.actions.delete')} />
          </MenuItem>
        )}

        {onMerge && (
          <MenuItem onClick={handleMergeClick} sx={{ fontSize: '14px', color: '#6b7280', borderTop: '1px solid #f2f4f7' }}>
            <ListItemIcon><CallMergeIcon sx={{ fontSize: 18, color: '#6366f1' }} /></ListItemIcon>
            <ListItemText primary="Merge" />
          </MenuItem>
        )}

        {onToggleActive && (
          <>
            {!toggleActiveOnlyForActive ? (
              <MenuItem onClick={handleToggleActiveClick} sx={{ fontSize: '14px', borderTop: '1px solid #f2f4f7' }}>
                <ListItemIcon>
                  <PowerSettingsNewIcon sx={{ fontSize: 18, color: currentRow?.is_active ? '#16a34a' : '#dc2626' }} />
                </ListItemIcon>
                <ListItemText
                  primary={currentRow?.is_active
                    ? t('modernTable.actions.setInactive')
                    : t('modernTable.actions.setActive')}
                />
              </MenuItem>
            ) : (
              currentRow?.is_active === true && (
                <MenuItem onClick={handleToggleActiveClick} sx={{ fontSize: '14px', borderTop: '1px solid #f2f4f7' }}>
                  <ListItemIcon>
                    <PowerSettingsNewIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('modernTable.actions.setInactive')} />
                </MenuItem>
              )
            )}
          </>
        )}
      </Menu>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        message={deleteConfirmMessage && rowToDelete ? deleteConfirmMessage(rowToDelete) : t('modernTable.deleteConfirm.fallback')}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        confirmName={deleteConfirmName ?? t('modernTable.deleteConfirm.confirmWord')}
      />
    </>
  );
};

export default ModernTable;