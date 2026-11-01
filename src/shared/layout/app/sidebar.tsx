import React from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Tooltip,
} from '@mui/material';
import { DRAWER_WIDTH } from '@app/config/constants';
import { useSelector } from '@store/store';
import { hasRequiredRole } from '@app/utils/roleHelpers';
import { MENU_SECTIONS } from './menu';

export const COLLAPSED_WIDTH = 64;

interface SidebarProps {
  open: boolean;
  mobileOpen: boolean;
  isMobile: boolean;
  onMobileClose: () => void;
}

const Sidebar = ({ open, mobileOpen, isMobile, onMobileClose }: SidebarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector(state => state.auth.user);

  const canSee = (allowedRoles?: string[]) =>
    !allowedRoles?.length || !!user?.is_superuser || hasRequiredRole(user?.role_detail, allowedRoles);

  const expanded = isMobile || open;

  const content = (
    <Box sx={{ overflowX: 'hidden' }}>
      <Toolbar />
      {MENU_SECTIONS.map((section, idx) => {
        const items = section.items.filter(item => canSee(item.allowedRoles));
        if (!items.length) return null;
        return (
          <List
            key={section.titleKey ?? idx}
            subheader={
              section.titleKey && expanded ? (
                <ListSubheader disableSticky sx={{ lineHeight: '32px', bgcolor: 'transparent' }}>
                  {t(section.titleKey, section.defaultTitle)}
                </ListSubheader>
              ) : undefined
            }
          >
            {items.map(item => {
              const label = t(item.labelKey, item.defaultLabel);
              const selected =
                item.path === '/' ? pathname === '/' : !!matchPath({ path: item.path, end: false }, pathname);
              return (
                <Tooltip key={item.path} title={expanded ? '' : label} placement="right">
                  <ListItemButton
                    selected={selected}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) onMobileClose();
                    }}
                    sx={{ mx: 1, borderRadius: 1, minHeight: 44, px: 2.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: expanded ? 2 : 'auto', justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                    {expanded && <ListItemText primary={label} />}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>
        );
      })}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {content}
      </Drawer>
    );
  }

  const width = open ? DRAWER_WIDTH : COLLAPSED_WIDTH;
  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: theme => theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
        },
      }}
    >
      {content}
    </Drawer>
  );
};

export default Sidebar;
