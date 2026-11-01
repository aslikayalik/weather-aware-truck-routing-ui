import React from 'react';
import RouteOutlined from '@mui/icons-material/RouteOutlined';
import PeopleOutline from '@mui/icons-material/PeopleOutline';
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';
import { APP_ROUTES } from '@app/routes/paths';
import { ADMIN_ROLES } from '@app/config/constants';

export interface MenuItemConfig {
  /** i18n key */
  labelKey: string;
  /** Text shown when there is no translation */
  defaultLabel: string;
  path: string;
  icon: React.ReactElement;
  /** If empty, every signed-in user sees it */
  allowedRoles?: string[];
}

export interface MenuSectionConfig {
  titleKey?: string;
  defaultTitle?: string;
  items: MenuItemConfig[];
}

// Extend the menu here as new pages are added
export const MENU_SECTIONS: MenuSectionConfig[] = [
  {
    items: [{ labelKey: 'menu.planner', defaultLabel: 'Route Planner', path: APP_ROUTES.HOME, icon: <RouteOutlined /> }],
  },
  {
    titleKey: 'menu.management',
    defaultTitle: 'Management',
    items: [
      {
        labelKey: 'menu.users',
        defaultLabel: 'Users',
        path: APP_ROUTES.ADMIN_USERS,
        icon: <PeopleOutline />,
        allowedRoles: ADMIN_ROLES,
      },
      {
        labelKey: 'menu.roles',
        defaultLabel: 'Roles',
        path: APP_ROUTES.ADMIN_USER_ROLES,
        icon: <AdminPanelSettingsOutlined />,
        allowedRoles: ADMIN_ROLES,
      },
    ],
  },
];
