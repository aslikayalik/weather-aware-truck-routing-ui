import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Slider, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useDispatch, useSelector } from '@app/store/store';
import { setFontSize } from '@app/store/slices/settingsSlice';
import { useUpdateFontSizeMutation } from '@app/services/userSettingsApi';

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 22;

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const fontSize = useSelector(state => state.settings.fontSize);
  const [updateFontSize] = useUpdateFontSizeMutation();

  const handleFontSizeCommit = (_: unknown, value: number | number[]) => {
    const size = value as number;
    dispatch(setFontSize(size));
    updateFontSize({ font_size: size });
  };

  const handleLanguageChange = (_: unknown, lang: string | null) => {
    if (!lang) return;
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        {t('settingsPage.title', 'Settings')}
      </Typography>

      <Stack spacing={2}>
        <Paper sx={{ p: 3 }}>
          <Typography fontWeight={600}>{t('settingsPage.fontSize', 'Font size')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('settingsPage.fontSizeDescription', 'Adjust the font size across the app.')}
          </Typography>
          <Slider
            defaultValue={fontSize}
            min={MIN_FONT_SIZE}
            max={MAX_FONT_SIZE}
            step={1}
            marks
            valueLabelDisplay="auto"
            onChangeCommitted={handleFontSizeCommit}
          />
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography fontWeight={600} sx={{ mb: 2 }}>
            {t('settingsPage.language', 'Language')}
          </Typography>
          <ToggleButtonGroup exclusive size="small" value={i18n.language} onChange={handleLanguageChange}>
            <ToggleButton value="tr">Türkçe</ToggleButton>
            <ToggleButton value="en">English</ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </Stack>
    </Box>
  );
};

export default SettingsPage;
