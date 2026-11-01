import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Translate from '@mui/icons-material/Translate';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import Logout from '@mui/icons-material/Logout';

import { APP_NAME } from '@app/config/constants';
import { APP_ROUTES } from '@app/routes/paths';
import { baseApi } from '@services/baseApi';
import { useLogoutSessionMutation } from '@services/authApi';
import { logout } from '@slices/authSlice';
import { useDispatch, useSelector } from '@store/store';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [logoutSession] = useLogoutSessionMutation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email;
  const profile = user?.profile;
  const initials = profile?.initials || (user?.first_name?.[0] ?? '') + (user?.last_name?.[0] ?? '');

  const go = (path: string) => {
    setAnchorEl(null);
    navigate(path);
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      await logoutSession().unwrap();
    } catch {
      // The session may already be gone on the backend; log out locally anyway
    }
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('refresh_token');
    navigate(APP_ROUTES.LOGIN);
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(next);
    localStorage.setItem('language', next);
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={{ zIndex: theme => theme.zIndex.drawer + 1, borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Toolbar>
        <IconButton edge="start" onClick={onToggleSidebar} sx={{ mr: 1 }} aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          sx={{ fontWeight: 700, cursor: 'pointer', color: 'primary.main' }}
          onClick={() => navigate(APP_ROUTES.HOME)}
        >
          {APP_NAME}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={t('header.language', 'Language')}>
          <IconButton onClick={toggleLanguage} sx={{ mr: 1 }}>
            <Translate fontSize="small" />
            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600 }}>
              {i18n.language.toUpperCase()}
            </Typography>
          </IconButton>
        </Tooltip>

        <Tooltip title={fullName ?? ''}>
          <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar
              src={profile?.use_initials_avatar ? undefined : profile?.avatar || undefined}
              sx={{ width: 34, height: 34, fontSize: 14, bgcolor: profile?.avatar_bg_color || 'primary.main' }}
            >
              {initials.toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { minWidth: 220, mt: 1 } }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography fontWeight={600}>{fullName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role_detail?.display_name ?? user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => go(APP_ROUTES.PROFILE)}>
            <ListItemIcon>
              <PersonOutline fontSize="small" />
            </ListItemIcon>
            {t('header.profile', 'Profile')}
          </MenuItem>
          <MenuItem onClick={() => go(APP_ROUTES.CHANGE_PASSWORD)}>
            <ListItemIcon>
              <LockOutlined fontSize="small" />
            </ListItemIcon>
            {t('header.changePassword', 'Change Password')}
          </MenuItem>
          <MenuItem onClick={() => go(APP_ROUTES.SETTINGS)}>
            <ListItemIcon>
              <SettingsOutlined fontSize="small" />
            </ListItemIcon>
            {t('header.settings', 'Settings')}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            {t('header.logout', 'Sign Out')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
