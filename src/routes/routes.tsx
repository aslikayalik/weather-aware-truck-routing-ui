import React from 'react';
import { Navigate } from 'react-router-dom';
import PlannerPage from '@app/pages/planner/PlannerPage';
import PageNotFound from '@app/shared/error/page-not-found';
import AppLayout from '@app/shared/layout/app';
import Login from '@app/pages/login';
import PrivateRoute from './private-route';
import UserList from '@app/pages/admin/users/user-list';
import UserForm from '@app/pages/admin/users/user-form';
import UserRoleList from '@app/pages/admin/user-roles/pages/UserRoleList';
import UserRoleCreate from '@app/pages/admin/user-roles/pages/UserRoleCreate';
import UserRoleEdit from '@app/pages/admin/user-roles/pages/UserRoleEdit';
import ChangePasswordForm from '@app/pages/me/change-password';
import Profile from '@app/pages/me/profile';
import SettingsPage from '@app/pages/settings/Settings';
import { ADMIN_ROLES } from '@app/config/constants';
import { APP_ROUTES } from './paths';

export { APP_ROUTES };

const routesConfig = [
  {
    path: APP_ROUTES.LOGIN,
    element: <Login />,
  },
  {
    element: <PrivateRoute Component={AppLayout} />,
    children: [
      { path: APP_ROUTES.HOME, element: <PlannerPage /> },
      { path: APP_ROUTES.PROFILE, element: <Profile /> },
      { path: APP_ROUTES.CHANGE_PASSWORD, element: <ChangePasswordForm /> },
      { path: APP_ROUTES.SETTINGS, element: <SettingsPage /> },
      {
        path: APP_ROUTES.ADMIN_USERS,
        element: <PrivateRoute Component={UserList} allowedRoles={ADMIN_ROLES} />,
      },
      {
        path: APP_ROUTES.ADMIN_USER_ADD,
        element: <PrivateRoute Component={UserForm} allowedRoles={ADMIN_ROLES} />,
      },
      {
        path: APP_ROUTES.ADMIN_USER_EDIT,
        element: <PrivateRoute Component={UserForm} allowedRoles={ADMIN_ROLES} />,
      },
      {
        path: APP_ROUTES.ADMIN_USER_ROLES,
        element: <PrivateRoute Component={UserRoleList} allowedRoles={ADMIN_ROLES} />,
      },
      {
        path: APP_ROUTES.ADMIN_USER_ROLE_CREATE,
        element: <PrivateRoute Component={UserRoleCreate} allowedRoles={ADMIN_ROLES} />,
      },
      {
        path: APP_ROUTES.ADMIN_USER_ROLE_EDIT,
        element: <PrivateRoute Component={UserRoleEdit} allowedRoles={ADMIN_ROLES} />,
      },
      // Domain pages are added here
    ],
  },
  {
    path: APP_ROUTES.NOT_FOUND,
    element: <PageNotFound />,
  },
  {
    path: '*',
    element: <Navigate to={APP_ROUTES.NOT_FOUND} replace />,
  },
];

export default routesConfig;
