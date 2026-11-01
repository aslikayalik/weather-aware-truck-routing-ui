import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  useDeleteUserRoleMutation,
  useGetUserRolesQuery,
} from '@app/services/userRoleApi';
import type { UserRole } from '@app/types/userRole';
import ConfirmDeleteDialog from '@app/components/ConfirmDeleteDialog';
import ModernTable, { ModernTableColumn } from '@app/components/ModernTable';
import FilterComponent from '@app/components/FilterComponent';
import { PROTECTED_ROLE_NAMES } from '@app/config/constants';

const UserRoleList: React.FC = () => {
  const navigate = useNavigate();
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch paginated user roles with search
  const {
    data: userRolesResp,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetUserRolesQuery({ page, rowsPerPage, search: debouncedSearch });

  // Extract userRoles and totalCount from response
  const userRoles = userRolesResp?.results ?? [];
  const totalCount = userRolesResp?.count ?? userRoles.length;
  const [deleteUserRole] = useDeleteUserRoleMutation();
  const [relatedWarning, setRelatedWarning] = useState<{ detail: string; role: UserRole } | null>(null);

const handleDelete = async (row: any) => {
    try {
      await deleteUserRole({ id: row.id, force: false }).unwrap();
      refetch();
    } catch (err: any) {
      if (err?.status === 400 && err?.data?.has_related) {
        setRelatedWarning({ 
          detail: err.data.detail, 
          role: row.original_role 
        });
      } else {
        alert('The role could not be deleted.');
      }
    }
  };


  const handleForceDelete = async () => {
    if (!relatedWarning?.role) return;
    try {
      await deleteUserRole({ id: relatedWarning.role.id, force: true }).unwrap();
      setRelatedWarning(null);
      refetch();
    } catch (err) {
      alert('The operation failed.');
      setRelatedWarning(null);
    }
  };

  const handleEdit = (row: any) => {
    navigate(`/admin/user-roles/edit/${row.id}`);
  };

  const getDeleteMessage = (row: any) => {
    if (!row) return 'Are you sure you want to delete this role?';
    return `Are you sure you want to delete the role "${row.display_name}"? This action cannot be undone.`;
  };

  // Server-side search is used, no client-side filtering needed
  const processedRows = (userRoles || []).map((role) => ({
    id: role.id,
    name: role.name,
    display_name: role.display_name,
    rank: role.rank ?? 0,
    is_active: role.is_active,
    created_at: role.created_at,
    updated_at: role.updated_at,
    original_role: role,
    is_protected: PROTECTED_ROLE_NAMES.includes(role.name),
    canDelete: !PROTECTED_ROLE_NAMES.includes(role.name),
  }));

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Error loading user roles
        </Typography>
      </Container>
    );
  }

  const columns: ModernTableColumn[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: '30%',
      wrap: true,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon sx={{ fontSize: 16, color: '#667085' }} />
          <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#101828' }}>
            {row.name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'display_name',
      headerName: 'Display Name',
      width: '30%',
      wrap: true,
      renderCell: (row) => (
        <Typography sx={{ fontSize: '14px', color: '#344054' }}>
          {row.display_name}
        </Typography>
      ),
    },
    {
      field: 'rank',
      headerName: 'Rank',
      width: '10%',
      wrap: true,
      renderCell: (row) => (
        <Chip
          label={row.rank}
          size="small"
          sx={{
            backgroundColor: row.rank >= 100 ? '#fef3c7' : row.rank >= 10 ? '#eff8ff' : '#f0fdf4',
            color: row.rank >= 100 ? '#92400e' : row.rank >= 10 ? '#1570EF' : '#166534',
            border: `1px solid ${row.rank >= 100 ? '#fde68a' : row.rank >= 10 ? '#b2ddff' : '#bbf7d0'}`,
            fontSize: '12px',
            fontWeight: 600,
            height: '24px',
            borderRadius: '12px',
            minWidth: '36px',
          }}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      width: '20%',
      wrap: true,
      renderCell: (row) => (
        <Typography sx={{ fontSize: '14px', color: '#667085' }}>
          {new Date(row.created_at).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'updated_at',
      headerName: 'Updated At',
      width: '20%',
      renderCell: (row) => (
        <Typography sx={{ fontSize: '14px', color: '#667085' }}>
          {new Date(row.updated_at).toLocaleDateString()}
        </Typography>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      {/* Filter Component */}
      <FilterComponent
        title="User Role Management"
        subtitle="View and manage all user roles in the system"
        totalCount={totalCount}
        addButtonLabel="Create New Role"
        onAdd={() => navigate('/admin/user-roles/create')}
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
        searchPlaceholder="Search by name or display name..."
      />

      {/* Table */}
        <ModernTable
          isFetching={isFetching}
          rows={processedRows}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleteConfirmMessage={getDeleteMessage}
          deleteConfirmName="evet"
          selectable={false}
          showActions={true}
          defaultRowsPerPage={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          emptyMessage="No user roles found"
          canDelete={(row) => !row.is_protected}
          page={page}
          maxHeight="calc(100vh - 300px)"
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />

      {/* Related records warning dialog */}
      <ConfirmDeleteDialog
        open={!!relatedWarning}
        message={relatedWarning?.detail || ''}
        onCancel={() => setRelatedWarning(null)}
        onConfirm={handleForceDelete}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmName="evet"
      />
    </Container>
  );
};

export default UserRoleList;