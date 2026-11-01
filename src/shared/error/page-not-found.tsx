import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@mui/material';

const PageNotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" gap={2}>
      <Typography variant="h2" fontWeight={700} color="primary">
        404
      </Typography>
      <Typography color="text.secondary">{t('notFound.message', 'The page you are looking for was not found.')}</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        {t('notFound.backHome', 'Back to home')}
      </Button>
    </Box>
  );
};

export default PageNotFound;
