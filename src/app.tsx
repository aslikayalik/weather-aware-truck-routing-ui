import React, { useEffect } from 'react';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import routesConfig from '@app/routes/routes';
import theme from '@app/config/theme';
import enJSON from '@app/locales/en.json';
import trJSON from '@app/locales/tr.json';
import { useDispatch, useSelector } from '@store/store';
import { BuildInfo } from './components/BuildInfo';
import { useGetUserSettingsQuery } from '@app/services/userSettingsApi';
import { setFontSize } from '@app/store/slices/settingsSlice';

const router = createHashRouter(routesConfig);

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enJSON },
    tr: { translation: trJSON },
  },
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const App = () => {
  const dispatch = useDispatch();
  const fontSize = useSelector(state => state.settings.fontSize);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const { data: dbSettings, isSuccess } = useGetUserSettingsQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (fontSize) {
      document.documentElement.style.fontSize = `${fontSize}px`;
    }
  }, [fontSize]);

  useEffect(() => {
    if (isAuthenticated && isSuccess && dbSettings?.font_size) {
      dispatch(setFontSize(dbSettings.font_size));
    }
  }, [dbSettings, isSuccess, isAuthenticated, dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RouterProvider router={router} />
        <BuildInfo />
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
