import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';

import useLogin from '@hooks/useLogin';
import LocalCaptcha from '@components/LocalCaptcha';
import { useValidateCaptchaMutation } from '@services/commonApi';
import { useSelector } from '@app/store/store';
import { APP_NAME } from '@app/config/constants';
import { APP_ROUTES } from '../../routes/paths';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PASSWORD_LENGTH = 40;

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const { onSubmit, isLoading, error, isSuccess } = useLogin();
  const [validateCaptchaMutation] = useValidateCaptchaMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [captchaRefreshTrigger, setCaptchaRefreshTrigger] = useState(0);
  const [sessionMessage, setSessionMessage] = useState('');

  useEffect(() => {
    const message = sessionStorage.getItem('session_terminated_message');
    if (message) {
      setSessionMessage(message);
      sessionStorage.removeItem('session_terminated_message');
    }
  }, []);

  useEffect(() => {
    if (error) setCaptchaRefreshTrigger(prev => prev + 1);
  }, [error]);

  useEffect(() => {
    if (isSuccess) navigate(APP_ROUTES.HOME, { replace: true });
  }, [isSuccess, navigate]);

  if (isAuthenticated && !isSuccess) {
    return <Navigate to={APP_ROUTES.HOME} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError('');
    setPasswordError('');
    setCaptchaError('');

    if (!email) return setEmailError(t('loginPage.errors.emailRequired', 'Please enter your email address.'));
    if (!EMAIL_REGEX.test(email)) return setEmailError(t('loginPage.errors.emailInvalid', 'Please enter a valid email address.'));
    if (!password) return setPasswordError(t('loginPage.errors.passwordRequired', 'Please enter your password.'));
    if (!captchaKey || !captchaValue) return setCaptchaError(t('captcha.required', 'Please enter the security code.'));

    try {
      const result = await validateCaptchaMutation({ key: captchaKey, value: captchaValue }).unwrap();
      if (!result.valid) return setCaptchaError(t('captcha.invalid', 'The security code is incorrect.'));
    } catch {
      setCaptchaRefreshTrigger(prev => prev + 1);
      return setCaptchaError(t('captcha.validationError', 'The security code could not be verified.'));
    }

    setSessionMessage('');
    onSubmit(email, password, rememberMe);
  };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Sol panel */}
      <Grid
        item
        md={6}
        sx={{
          background: theme => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          color: '#fff',
        }}
      >
        <LocalShippingOutlined sx={{ fontSize: 120, mb: 3, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
          {APP_NAME}
        </Typography>
        <Typography sx={{ opacity: 0.9, maxWidth: 440, textAlign: 'center', lineHeight: 1.7 }}>
          {t('loginPage.tagline', 'Secure and easy access. Sign in to continue.')}
        </Typography>
      </Grid>

      {/* Right panel - form */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4 }}>
            <Typography component="h1" variant="h5" fontWeight={800} textAlign="center">
              {t('loginPage.title', 'Sign In')}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
              {t('loginPage.subtitle', 'Enter your details to continue')}
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  label={t('loginPage.email', 'Email')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  error={!!emailError}
                  helperText={emailError}
                  autoComplete="email"
                  autoFocus
                />
                <TextField
                  label={t('loginPage.password', 'Password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value.slice(0, MAX_PASSWORD_LENGTH))}
                  error={!!passwordError}
                  helperText={passwordError}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(prev => !prev)} size="small" edge="end">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControlLabel
                  control={<Checkbox size="small" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />}
                  label={t('loginPage.rememberMe', 'Remember me')}
                />
              </Stack>

              {sessionMessage && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {sessionMessage}
                </Alert>
              )}
              {(error || captchaError) && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error || captchaError}
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="center">
                <LocalCaptcha
                  onKeyChange={setCaptchaKey}
                  onValueChange={setCaptchaValue}
                  error={captchaError}
                  disabled={isLoading}
                  refreshTrigger={captchaRefreshTrigger}
                />
              </Box>

              <LoadingButton type="submit" fullWidth variant="contained" loading={isLoading} sx={{ mt: 3, py: 1.1 }}>
                {t('loginPage.submit', 'Sign In')}
              </LoadingButton>
            </Box>
          </Paper>
        </Container>
      </Grid>
    </Grid>
  );
};

export default Login;
