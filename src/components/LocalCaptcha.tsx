import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, TextField, IconButton, CircularProgress, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLazyGenerateCaptchaQuery } from '@services/commonApi';
import { useTranslation } from 'react-i18next';

interface LocalCaptchaProps {
  onKeyChange: (key: string) => void;
  onValueChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  refreshTrigger?: number;
}

const CAPTCHA_LENGTH = 6;

/**
 * Rules:
 * - ONLY A–Z and 0–9
 * - Automatic uppercase
 * - No Turkish i / İ / ı / I casing issues
 * - All input, including paste, is filtered
 * - Refreshes automatically via a parent re-render on backend #8105 / captcha errors
 *
 * Note:
 * - When the captcha image fails to load, it is usually an img request to the wrong origin + caching.
 *   So the image is requested from the API origin and a cache-buster is added.
 */
const LocalCaptcha: React.FC<LocalCaptchaProps> = ({
  onKeyChange,
  onValueChange,
  error,
  disabled = false,
  refreshTrigger,
}) => {
  const { t } = useTranslation();

  const [captchaValue, setCaptchaValue] = useState('');
  const [imageError, setImageError] = useState(false);

  const [generateCaptcha, { data: captchaData, isLoading, isFetching }] =
    useLazyGenerateCaptchaQuery();

  const busy = isLoading || isFetching;

  /** Input temizleme: A–Z + 0–9 */
  const sanitize = useMemo(
    () => (input: string) =>
      input
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, CAPTCHA_LENGTH),
    []
  );

  /** API origin (from REACT_APP_API_URL) */
  const API_ORIGIN = useMemo(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost/api/v1/';
    try {
      return new URL(apiUrl).origin; // "http://localhost"
    } catch {
      return 'http://localhost';
    }
  }, []);

  const withBust = (url: string) =>
    url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;


  /** Generate a captcha */
  const refreshCaptcha = useCallback(() => {
    setCaptchaValue('');
    if (onValueChange) onValueChange('');
    setImageError(false);
    generateCaptcha();
  }, [generateCaptcha, onValueChange]);

  useEffect(() => {
    refreshCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  useEffect(() => {
    if (captchaData?.key) {
      onKeyChange(captchaData.key);
    }
  }, [captchaData?.key]); 

  const lastErrorRef = useRef<string | undefined>('');
  useEffect(() => {
    const isCaptchaInvalid = error === t('captcha.invalid') || error?.includes('güvenlik kodu yanlış');

    if (isCaptchaInvalid && error !== lastErrorRef.current) {
      refreshCaptcha();
    }
    lastErrorRef.current = error;
  }, [error, t, refreshCaptcha]);

  const isFirstTriggerRender = useRef(true);
  useEffect(() => {
    if (isFirstTriggerRender.current) {
      isFirstTriggerRender.current = false;
      return;
    }
    if (refreshTrigger !== undefined) {
      refreshCaptcha();
    }
  }, [refreshTrigger]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CAPTCHA_LENGTH);
    setCaptchaValue(val);
    if (onValueChange) onValueChange(val); // This re-renders the parent but must not make LocalCaptcha refetch
  };

  const imageUrl = useMemo(() => {
    if (!captchaData?.image_url) return '';
    const raw = captchaData.image_url;
    const base = /^https?:\/\//i.test(raw) ? raw : `${API_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`;
    return `${base}${base.includes('?') ? '&' : '?'}t=${captchaData.key}`; // Key-based cache busting
  }, [captchaData?.image_url, captchaData?.key, API_ORIGIN]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ position: 'relative', width: 200, height: 60, border: '1px solid #ddd', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff' }}>
          {busy ? <CircularProgress size={20} /> : 
           imageError ? <Typography variant="caption">Error!</Typography> :
           captchaData?.image_url && <img src={imageUrl} alt="captcha" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setImageError(true)} />
          }
        </Box>
   <IconButton
          onClick={refreshCaptcha}
          disabled={disabled || busy}
          size="small"
          title={t('captcha.refresh')}
          sx={{ color: 'primary.main' }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>
      <TextField
        fullWidth
        size="small"
        label={t('captcha.label')}
        value={captchaValue}
        onChange={handleInputChange}
        autoComplete="off"
        disabled={disabled || busy}
      />
    </Box>
  );
};


export default React.memo(LocalCaptcha);