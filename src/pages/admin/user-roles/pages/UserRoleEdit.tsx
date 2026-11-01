import { useGetUserRoleQuery, useUpdateUserRoleMutation } from '@app/services/userRoleApi';
import { UpdateUserRoleRequest } from '@app/types/userRole';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PROTECTED_ROLE_NAMES } from '@app/config/constants';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const UserRoleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: userRole, isLoading: isFetching, error: fetchError } = useGetUserRoleQuery(id);
  const [updateUserRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();

  const [formData, setFormData] = useState<UpdateUserRoleRequest>({
    name: '',
    display_name: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (userRole) {
      setFormData({
        name: userRole.name,
        display_name: userRole.display_name,
        is_active: userRole.is_active,
      });
    }
  }, [userRole]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters, numbers, hyphens, and underscores';
    }

    if (!formData.display_name?.trim()) {
      newErrors.display_name = 'Display name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateUserRole({ id, data: formData }).unwrap();
      navigate('/admin/user-roles');
    } catch (err: any) {
      console.error('Failed to update user role:', err);

      if (err.data) {
        const backendErrors: { [key: string]: string } = {};
        Object.keys(err.data).forEach((key) => {
          if (Array.isArray(err.data[key])) {
            backendErrors[key] = err.data[key][0];
          } else {
            backendErrors[key] = err.data[key];
          }
        });
        setErrors(backendErrors);
      } else {
        alert('Failed to update user role. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/user-roles');
  };

  if (isFetching) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} sx={{ color: '#6366F1' }} />
      </Box>
    );
  }

  if (fetchError || !userRole) {
    return (
      <Container maxWidth="md" sx={{ minHeight: '100vh', py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography
            sx={{
              color: '#EF4444',
              fontSize: '20px',
              fontWeight: 600,
              mb: 2
            }}
          >
            An error occurred while loading the user role
          </Typography>
          <Button
            variant="contained"
            onClick={handleCancel}
            sx={{
              mt: 2,
              fontWeight: 600,
              borderRadius: 2,
              background: '#2563eb',
              boxShadow: 'none',
              '&:hover': {
                background: '#1d4ed8',
                boxShadow: 'none',
              }
            }}
          >
            Back to List
          </Button>
        </Paper>
      </Container>
    );
  }

  const isNameProtected = PROTECTED_ROLE_NAMES.includes(formData.name || '');

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: '100vh',
        py: 4,
        position: 'relative',
      }}
    >
      {/* Back Button */}
      <IconButton onClick={handleCancel} sx={{ mb: 2, color: '#2563EB', background: '#f1f5f9', border: '1px solid #e5e7eb', '&:hover': { background: '#e0e7ef' } }}>
        <ArrowBackIcon />
      </IconButton>

      {/* Main Card */}
      <Paper
        elevation={0}
        sx={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '48px 32px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              backgroundColor: '#EEF2FF',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#111827',
              mb: 1,
              textAlign: 'center',
            }}
          >
            Edit User Role
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '14px',
              color: '#6B7280',
              textAlign: 'center',
            }}
          >
            Update the user role details
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
          {/* Protected Role Warning */}
          {isNameProtected && (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                borderRadius: '8px',
                backgroundColor: '#EEF2FF',
                border: '1px solid #C7D2FE',
                color: '#4338CA',
                '& .MuiAlert-icon': {
                  color: '#6366F1'
                },
                '& .MuiAlert-message': {
                  fontSize: '14px',
                }
              }}
            >
              This is a protected role. Its name cannot be changed.
            </Alert>
          )}

          {/* Name Field */}
          <Box sx={{ mb: 3 }}>
            <Typography
              component="label"
              sx={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                mb: 1,
              }}
            >
              Role Name <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., admin, manager, user"
              error={!!errors.name}
              helperText={
                isNameProtected
                  ? 'This role name cannot be changed.'
                  : (errors.name || 'Unique identifier for the role (lowercase, no spaces)')
              }
              disabled={isNameProtected}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '14px',
                  borderRadius: '8px',
                  backgroundColor: isNameProtected ? '#F9FAFB' : 'transparent',
                  '& fieldset': {
                    borderColor: errors.name ? '#EF4444' : '#D1D5DB',
                  },
                  '&:hover fieldset': {
                    borderColor: isNameProtected ? '#D1D5DB' : (errors.name ? '#EF4444' : '#9CA3AF'),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.name ? '#EF4444' : '#6366F1',
                    boxShadow: errors.name ? 'none' : '0 0 0 3px rgba(99, 102, 241, 0.1)',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#F9FAFB',
                  }
                },
                '& .MuiFormHelperText-root': {
                  fontSize: '13px',
                  mt: 0.75,
                  color: errors.name ? '#EF4444' : '#6B7280',
                },
              }}
            />
          </Box>

          {/* Display Name Field */}
          <Box sx={{ mb: 3 }}>
            <Typography
              component="label"
              sx={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                mb: 1,
              }}
            >
              Display Name <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              placeholder="e.g., Administrator, Manager, Regular User"
              error={!!errors.display_name}
              helperText={errors.display_name || 'User-friendly name for the role'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '14px',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: errors.display_name ? '#EF4444' : '#D1D5DB',
                  },
                  '&:hover fieldset': {
                    borderColor: errors.display_name ? '#EF4444' : '#9CA3AF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.display_name ? '#EF4444' : '#6366F1',
                    boxShadow: errors.display_name ? 'none' : '0 0 0 3px rgba(99, 102, 241, 0.1)',
                  },
                },
                '& .MuiFormHelperText-root': {
                  fontSize: '13px',
                  mt: 0.75,
                  color: errors.display_name ? '#EF4444' : '#6B7280',
                },
              }}
            />
          </Box>

          {/* Metadata */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: '13px',
                color: '#6B7280',
                mb: 1
              }}
            >
              <strong style={{ color: '#374151' }}>Created:</strong> {userRole.created_at ? new Date(userRole.created_at).toLocaleString() : '-'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '13px',
                color: '#6B7280'
              }}
            >
              <strong style={{ color: '#374151' }}>Last Updated:</strong> {userRole.updated_at ? new Date(userRole.updated_at).toLocaleString() : '-'}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
              disabled={isUpdating}
              sx={{
                flex: 1,
                fontWeight: 600,
                borderRadius: 2,
                border: '1.5px solid #2563eb',
                color: '#2563eb',
                background: '#fff',
                '&:hover': {
                  background: '#f1f5f9',
                  borderColor: '#2563eb',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isUpdating}
              sx={{
                flex: 1,
                fontWeight: 600,
                borderRadius: 2,
                background: '#2563eb',
                color: '#fff',
                boxShadow: 'none',
                '&:hover': {
                  background: '#1d4ed8',
                  boxShadow: 'none',
                },
              }}
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserRoleEdit;