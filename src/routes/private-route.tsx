import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import ErrorBoundary from '@app/shared/error/error-boundary';
import { useGetUserQuery } from '@services/userApi';
import { useDispatch, useSelector } from '@store/store';
import { selectAuth, setAuthUser } from '../store/slices/authSlice';
import { hasRequiredRole } from '../utils/roleHelpers';

interface PrivateRouteProps {
  Component?: React.ComponentType<any>;
  /** Role names from the backend; if empty, any signed-in user may access it. */
  allowedRoles?: string[];
}

export const PrivateRoute = ({ Component, allowedRoles = [] }: PrivateRouteProps) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(selectAuth);

  const { isLoading, data: userData } = useGetUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (userData) {
      dispatch(setAuthUser(userData));
    }
  }, [userData, dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Superusers can access every page; everyone else goes through the role check
  if (allowedRoles.length > 0 && !user.is_superuser && !hasRequiredRole(user.role_detail, allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return <ErrorBoundary>{Component ? <Component /> : <Outlet />}</ErrorBoundary>;
};

export default PrivateRoute;
