import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Header from './header';
import Sidebar from './sidebar';

const SIDEBAR_STATE_KEY = 'sidebar_open';

const readSidebarState = () => {
  try {
    return localStorage.getItem(SIDEBAR_STATE_KEY) !== 'false';
  } catch {
    return true;
  }
};

const AppLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(readSidebarState);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(prev => !prev);
      return;
    }
    setOpen(prev => {
      try {
        localStorage.setItem(SIDEBAR_STATE_KEY, String(!prev));
      } catch {
        // If localStorage is unavailable, the state is kept for this session only
      }
      return !prev;
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar open={open} mobileOpen={mobileOpen} isMobile={isMobile} onMobileClose={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
