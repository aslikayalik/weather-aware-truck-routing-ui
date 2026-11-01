import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import { useGetAdminUsersQuery, useUpdateAdminUserMutation } from '@services/userApi';
import { Button, Typography, Chip, Avatar, Paper, Container, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Email as EmailIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { highlightMatches, stripHtmlTags } from '@app/components/collapsibleTable/highlightMatches';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store/store';
import { canManageUser } from '@app/utils/roleHelpers';
import ModernTable, { ModernTableColumn } from '@app/components/ModernTable';
import FilterComponent from '@app/components/FilterComponent';

// A deterministic colour is picked from the role name
const ROLE_COLORS = [
  { bg: '#eff8ff', color: '#1570EF', border: '#b2ddff' },
  { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4' },
  { bg: '#f4e8ff', color: '#9333ea', border: '#e9d5ff' },
  { bg: '#ecfdf3', color: '#027a48', border: '#abefc6' },
  { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
  { bg: '#eef2ff', color: '#3730a3', border: '#c7d2fe' },
  { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
];

const getRoleColor = (roleName: string) => {
  const normalized = roleName.toLowerCase().trim();

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ROLE_COLORS[Math.abs(hash) % ROLE_COLORS.length];
};

const UserList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'error' | 'warning' | 'success' }>({ open: false, message: '', severity: 'error' });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch paginated users with search
  const {
    isLoading,
    isFetching,
    data: usersResp,
    error,
    refetch,
  } = useGetAdminUsersQuery({ page, rowsPerPage, search: debouncedSearch, status: statusFilter }, { refetchOnMountOrArgChange: true });

  // Extract users and totalCount from response
  const users = usersResp?.results ?? [];
  const totalCount = usersResp?.count ?? users.length;

  const [updateUser] = useUpdateAdminUserMutation();

  const processedRows = useMemo(() => {
    return users.map((user) => {
      const roleText = user.role_detail?.display_name || user.role_detail?.name || user.role || '';

      return {
        id: user.id,
        first_name: highlightMatches(stripHtmlTags(user.first_name || ''), search),
        last_name: highlightMatches(stripHtmlTags(user.last_name || ''), search),
        full_name: highlightMatches(stripHtmlTags(`${user.first_name || ''} ${user.last_name || ''}`).trim(), search),
        email: highlightMatches(stripHtmlTags(user.email || ''), search),
        phone: stripHtmlTags(user.phone || ''),
        role: highlightMatches(stripHtmlTags(roleText), search),
        is_active: user.is_active,
        groups: user.user_groups || [],
        role_detail: user.role_detail,
        profile: user.profile || {},
        original_user: user,
      };
    });
  }, [users, search]);

  const statusCounts = useMemo(() => {
    const meta = usersResp?.meta;
    return {
      all: meta?.all_count ?? usersResp?.count ?? 0,
      active: meta?.active_count ?? 0,
      inactive: meta?.inactive_count ?? 0,
    };
  }, [usersResp]);

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h6">{t('loading')}</Typography>
        <Button onClick={() => refetch()}>{t('refetch')}</Button>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h6" color="error">{t('error')}</Typography>
        <Button onClick={() => refetch()}>{t('refetch')}</Button>
      </Box>
    );
  }

  const columns: ModernTableColumn[] = [
    {
      field: 'full_name',
      headerName: t('userList.columns.user'),
      width: '25%',
      wrap: true,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              backgroundColor: '#1570EF',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {stripHtmlTags(row.first_name)?.charAt(0) || ''}{stripHtmlTags(row.last_name)?.charAt(0) || ''}
          </Avatar>
          <Box>
            <Typography
              sx={{ fontSize: '14px', fontWeight: 500, color: '#101828' }}
              dangerouslySetInnerHTML={{ __html: row.full_name }}
            />
          </Box>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: t('userList.columns.contact'),
      width: '25%',
      wrap: true,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 0.5, color: '#667085' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ fontSize: 16 }} />
            <span dangerouslySetInnerHTML={{ __html: row.email }} />
          </Box>
          {row.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span role="img" aria-label="phone" style={{ fontSize: 16 }}>📞</span>
              <span>{row.phone}</span>
            </Box>
          )}
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: t('userList.columns.rolePermission'),
      width: '20%',
      wrap: true,
      align: 'center',
      renderCell(row) {
        const colorScheme = getRoleColor(stripHtmlTags(row.role));

        return (
          <Chip
            label={<span dangerouslySetInnerHTML={{ __html: row.role }} />}
            size="small"
            sx={{
              backgroundColor: colorScheme.bg,
              color: colorScheme.color,
              border: `1px solid ${colorScheme.border}`,
              fontSize: '12px',
              fontWeight: 500,
              height: 'auto',
              minHeight: '24px',
              maxWidth: '100%',
              borderRadius: '12px',
              '& .MuiChip-label': {
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                textAlign: 'center',
                lineHeight: 1.2,
                py: 0.5
              }
            }}
          />
        );
      }
    },
    {
      field: 'is_active',
      headerName: t('userList.columns.status'),
      width: '10%',
      wrap: true,
      renderCell: (row) => (
        <Chip
          label={row.is_active ? t('userList.status.active') : t('userList.status.inactive')}
          size="small"
          sx={{
            backgroundColor: row.is_active ? '#ecfdf3' : '#f2f4f7',
            color: row.is_active ? '#027a48' : '#344054',
            border: `1px solid ${row.is_active ? '#abefc6' : '#d0d5dd'}`,
            fontSize: '12px',
            fontWeight: 500,
            height: '24px',
            borderRadius: '12px',
            '&::before': row.is_active ? { content: '"●"', marginRight: '6px' } : {},
          }}
        />
      ),
    },
  ];

  const handleEdit = (row: any) => {
    const currentRank = currentUser?.role_detail?.rank;
    const targetRank = row.original_user?.role_detail?.rank;
    if (!canManageUser(currentRank, targetRank)) {
      setSnackbar({ open: true, message: t('userList.errors.insufficientRank'), severity: 'warning' });
      return;
    }
    navigate(`/admin/users-edit/${row.id}`);
  };

  const handleDelete = (row: any) => {
    const currentRank = currentUser?.role_detail?.rank;
    const targetRank = row.original_user?.role_detail?.rank;
    if (!canManageUser(currentRank, targetRank)) {
      setSnackbar({ open: true, message: t('userList.errors.insufficientRank'), severity: 'warning' });
      return;
    }
    updateUser({
      ...row.original_user,
      is_active: false
    });
  }

  // Toggle active/inactive
  const handleToggleActive = async (row: any) => {
    const userObj = row.original_user;

    // Hierarchical rank check
    const currentRank = currentUser?.role_detail?.rank;
    const targetRank = userObj?.role_detail?.rank;
    if (!canManageUser(currentRank, targetRank)) {
      setSnackbar({ open: true, message: t('userList.errors.insufficientRank'), severity: 'warning' });
      return;
    }

    // Resolve the role id
    const roleId = userObj?.role_detail?.id ||
      (typeof userObj?.role === 'string' && /^[0-9a-fA-F-]{36}$/.test(userObj.role) ? userObj.role : '');

    if (!roleId) {
      setSnackbar({ open: true, message: t('userList.errors.roleNotFound'), severity: 'error' });
      return;
    }

    await updateUser({
      id: row.id,
      is_active: !row.is_active,
      first_name: stripHtmlTags(row.first_name),
      last_name: stripHtmlTags(row.last_name),
      email: stripHtmlTags(row.email),
      phone: stripHtmlTags(userObj.phone || ''),
      role: roleId,
      profile: row.profile || {},
    });
  };

  // Delete confirmation message
  const getDeleteMessage = (row: any) => {
    if (!row) return t('userList.deleteConfirm.fallback');
    const email = row.email ? stripHtmlTags(row.email) : t('userList.deleteConfirm.unknownUser');
    return t('userList.deleteConfirm.message', { email });
  };

  const filteredTotalCount =
    statusFilter === "all"
      ? statusCounts.all
      : statusFilter === "active"
        ? statusCounts.active
        : statusCounts.inactive;

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      {/* Filter Component with Tabs */}
      <FilterComponent
        title={t('userList.title')}
        subtitle={t('userList.subtitle')}
        totalCount={totalCount}
        addButtonLabel={t('userList.addButton')}
        onAdd={() => navigate('/admin/users-add')}
        onSearchChange={setSearch}
        searchValue={search}
        searchPlaceholder={t('userList.searchPlaceholder')}
      >
        {/* Status Filter Tabs - Inside FilterComponent, above search */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {[
            { value: 'all', label: t('userList.tabs.all') },
            { value: 'active', label: t('userList.tabs.active') },
            { value: 'inactive', label: t('userList.tabs.inactive') }
          ].map((tab) => (
            <Button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value as 'all' | 'active' | 'inactive');
                setPage(0);
              }}
              sx={{
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
                padding: '8px 16px',
                borderRadius: '8px',
                minHeight: '36px',
                backgroundColor: statusFilter === tab.value ? '#eff8ff' : 'transparent',
                color: statusFilter === tab.value ? '#1570EF' : '#667085',
                border: statusFilter === tab.value ? '1px solid #b2ddff' : '1px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: statusFilter === tab.value ? '#eff8ff' : '#f9fafb',
                  borderColor: statusFilter === tab.value ? '#b2ddff' : '#eaecf0',
                },
              }}
            >
              {tab.label}
              <Box
                component="span"
                sx={{
                  ml: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: statusFilter === tab.value ? '#1570EF' : '#f2f4f7',
                  color: statusFilter === tab.value ? '#fff' : '#344054',
                  fontWeight: 600,
                  fontSize: '12px',
                  borderRadius: '12px',
                  minWidth: '22px',
                  height: '22px',
                  px: 0.75,
                }}
              >
                {statusCounts[tab.value]}
              </Box>
            </Button>
          ))}
        </Box>
      </FilterComponent>

      {/* Table */}
      <ModernTable
        isFetching={isFetching}
        rows={processedRows}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        showActions
        deleteConfirmMessage={getDeleteMessage}
        deleteConfirmName="evet"
        selectable={false}
        maxHeight="calc(100vh - 330px)"
        defaultRowsPerPage={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        emptyMessage={t('userList.emptyMessage')}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredTotalCount}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={e => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: '10px', fontSize: '14px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserList;