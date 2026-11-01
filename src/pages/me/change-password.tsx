import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { APP_ROUTES } from '../../routes/paths';
import { useChangeUserPasswordMutation } from '@services/userApi';
import { logout } from '@app/store/slices/authSlice';
import { baseApi } from '@app/services/baseApi';
import { FormControl, FormHelperText, InputLabel, OutlinedInput, Stack, Box, Paper, Button, Typography, IconButton, InputAdornment, Dialog, DialogTitle, DialogContent, Slider, Container } from '@mui/material';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import { Save as SaveIcon, LockReset as LockResetIcon, Cancel as CancelIcon, Check as CheckIcon, Close as CloseIcon, Visibility as Visibility, VisibilityOff as VisibilityOff, ArrowBack as ArrowBackIcon } from '@mui/icons-material/';
import { useTranslation } from 'react-i18next';
import PasswordStrengthBar from '@app/shared/layout/password/password-strength-bar';

const passwordInputSx = {
  fontSize: '14px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#d0d5dd',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#98a2b3',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1570EF',
  },
  // Hide the browser's built-in icons
  '& input::-ms-reveal, & input::-ms-clear': {
    display: 'none'
  },
  '& input::-webkit-credentials-auto-fill-button': {
    display: 'none'
  },
  '& input::-webkit-textfield-decoration-container': {
    visibility: 'hidden',
    pointerEvents: 'none'
  },
};

const ChangePasswordForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [changePassword, { isLoading }] = useChangeUserPasswordMutation();
  const [passwordStrength, setPasswordStrength] = React.useState(0);
  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [passwordLength, setPasswordLength] = React.useState(8);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPassword = watch('newPassword');
  const confirmNewPassword = watch('confirmNewPassword');

  const handleLogoutAndRedirect = () => {
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    navigate(APP_ROUTES.LOGIN);
  };

  const generateRandomPassword = () => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const specialChars = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

    let password = '';

    // Ensure each validation rule is satisfied by including at least one character from each group
    password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

    // Fill the remaining length with random characters from all sets
    const allChars = lowercaseChars + uppercaseChars + numberChars + specialChars;
    for (let i = 4; i < passwordLength; i++) { // Dynamic length based on passwordLength state
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Optionally shuffle the password to make the character order random
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    // Set the password in the form and clear any errors
    setValue('newPassword', password);
    clearErrors(['newPassword']);
    setDialogOpen(false); // Close dialog after generating password
  };

  const handleSliderChange = (event, newValue) => {
    setPasswordLength(newValue);
  };

  const onSubmit = async (formData) => {
    const { oldPassword, newPassword: newPwd, confirmNewPassword: confirmPwd } = formData;

    if (newPwd !== confirmPwd) {
      setError('confirmNewPassword', {
        type: 'manual',
        message: t('profile.passwordMismatch'),
      });
      return;
    }

    if (oldPassword === newPwd) {
      setError('newPassword', {
        type: 'manual',
        message: t('profile.samePasswordWarning'),
      });
      return;
    }

    if (passwordStrength < 20) {
      setError('newPassword', {
        type: 'manual',
        message: t('profile.weakPasswordWarning'),
      });
      return;
    }

    try {
      await changePassword({ oldPassword, newPassword: newPwd, confirmNewPassword: confirmPwd }).unwrap();
      handleLogoutAndRedirect();
    } catch (err) {
      const error = err as { data?: { non_field_errors?: string[] } };
      if (error?.data?.non_field_errors && error.data.non_field_errors[0] === 'This password is too common.') {
        setError('newPassword', {
          type: 'manual',
          message: t('profile.passwordTooCommon'),
        });
      } else {
        setError('oldPassword', {
          type: 'manual',
          message: t('profile.oldPasswordWrong'),
        });
      }
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  const regex = /[!@#$%^&*(),.?":{}|<>[\]\\\-_=+;:'`~@/]/;

  const passwordValidationRules = [
    {
      validate: (value) => value.length >= 8,
      message: t('profile.passwordLengthRequirement'),
    },
    {
      validate: (value) => /[a-zşğüöçı]+/.test(value),
      message: t('profile.passwordMustContainLowercase'),
    },
    {
      validate: (value) => /[A-ZŞĞÜÖÇİ]+/.test(value),
      message: t('profile.passwordMustContainUppercase'),
    },
    {
      validate: (value) => /\d+/.test(value),
      message: t('profile.passwordMustContainNumber'),
    },
    {
      validate: (value) => regex.test(value),
      message: t('profile.passwordMustContainSpecialChar'),
    },
  ];

  return (
    <>
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 200px)',
          }}
        >
          <Paper
            sx={{
              width: '100%',
              maxWidth: '600px',
              border: '1px solid #eaecf0',
              borderRadius: '12px',
              boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 3,
                borderBottom: '1px solid #eaecf0',
                backgroundColor: '#f9fafb',
              }}
            >
              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#101828',
                }}
              >
                Change Password
              </Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  color: '#667085',
                  mt: 0.5,
                }}
              >
                Update your password and keep your account secure
              </Typography>
            </Box>

            {/* Form */}
            <Box sx={{ p: 3 }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  {/* Old Password */}
                  <FormControl error={!!errors.oldPassword} fullWidth>
                    <InputLabel
                      htmlFor="old-password"
                      sx={{
                        fontSize: '14px',
                        color: '#344054',
                        '&.Mui-focused': { color: '#1570EF' },
                      }}
                    >
                      {t('profile.oldPassword')}
                    </InputLabel>
                    <OutlinedInput
                      id="old-password"
                      type={showOldPassword ? 'text' : 'password'}
                      label={t('profile.oldPassword')}
                      {...register('oldPassword', { required: t('profile.passwordRequired') })}
                      inputProps={{ maxLength: 40 }}
                      sx={passwordInputSx}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            edge="end"
                            disabled={!watch('oldPassword')}
                            sx={{ color: '#667085' }}
                          >
                            {showOldPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {errors.oldPassword && (
                      <FormHelperText sx={{ fontSize: '12px', color: '#f04438' }}>
                        {errors.oldPassword.message}
                      </FormHelperText>
                    )}
                  </FormControl>

                  {/* New Password */}
                  <FormControl error={!!errors.newPassword} fullWidth>
                    <InputLabel
                      htmlFor="new-password"
                      sx={{
                        fontSize: '14px',
                        color: '#344054',
                        '&.Mui-focused': { color: '#1570EF' },
                      }}
                    >
                      {t('profile.newPassword')}
                    </InputLabel>
                    <OutlinedInput
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      label={t('profile.newPassword')}
                      {...register('newPassword', {
                        required: t('profile.passwordRequired'),
                        minLength: {
                          value: 8,
                          message: t('profile.passwordLengthRequirement'),
                        },
                        validate: {
                          hasLowercase: (value) => /[a-zşğüöçı]/.test(value) || t('profile.passwordMustContainLowercase'),
                          hasUppercase: (value) => /[A-ZŞĞÜÖÇİ]/.test(value) || t('profile.passwordMustContainUppercase'),
                          hasNumber: (value) => /\d/.test(value) || t('profile.passwordMustContainNumber'),
                          isNotCommon: (value) =>
                            !['123456', 'password', '123456789', '12345678', '12345', '1234567', 'qwerty', 'abc123', '111111', 'letmein'].includes(
                              value
                            ) || t('profile.passwordTooCommon'),
                          hasSpecialChar: (value) => regex.test(value) || t('profile.passwordMustContainSpecialChar'),
                          isStrongEnough: () => passwordStrength >= 30 || t('profile.weakPasswordWarning'),
                        },
                      })}
                      value={newPassword || ''}
                      inputProps={{ maxLength: 40 }}
                      sx={passwordInputSx}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                            disabled={!newPassword}
                            sx={{ color: '#667085' }}
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {errors.newPassword && (
                      <FormHelperText sx={{ fontSize: '12px', color: '#f04438' }}>
                        {errors.newPassword.message}
                      </FormHelperText>
                    )}

                    <PasswordStrengthBar password={newPassword} onChangeScore={setPasswordStrength} />

                    {/* Password Validation Rules */}
                    {newPassword && (
                      <Box sx={{ mt: 2, p: 2, backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #eaecf0' }}>
                        {passwordValidationRules.map((rule, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: index !== passwordValidationRules.length - 1 ? 1 : 0,
                            }}
                          >
                            {rule.validate(newPassword) ? (
                              <CheckIcon sx={{ fontSize: 16, color: '#12b76a' }} />
                            ) : (
                              <CloseIcon sx={{ fontSize: 16, color: '#f04438' }} />
                            )}
                            <Typography
                              sx={{
                                fontSize: '13px',
                                color: rule.validate(newPassword) ? '#12b76a' : '#f04438',
                                fontWeight: 500,
                              }}
                            >
                              {rule.message}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </FormControl>

                  {/* Confirm New Password */}
                  <FormControl
                    error={!!(errors.confirmNewPassword || (newPassword && confirmNewPassword && newPassword !== confirmNewPassword))}
                    fullWidth
                  >
                    <InputLabel
                      htmlFor="confirm-new-password"
                      sx={{
                        fontSize: '14px',
                        color: '#344054',
                        '&.Mui-focused': { color: '#1570EF' },
                      }}
                    >
                      {t('profile.confirmNewPassword')}
                    </InputLabel>
                    <OutlinedInput
                      id="confirm-new-password"
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      label={t('profile.confirmNewPassword')}
                      {...register('confirmNewPassword', {
                        required: t('profile.passwordRequired'),
                        minLength: {
                          value: 8,
                          message: t('profile.passwordLengthRequirement'),
                        },
                        validate: (value) => value === newPassword || t('profile.passwordMismatch'),
                      })}
                      inputProps={{ maxLength: 40 }}
                      sx={passwordInputSx}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            edge="end"
                            disabled={!confirmNewPassword}
                            sx={{ color: '#667085' }}
                          >
                            {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {(errors.confirmNewPassword || (newPassword && confirmNewPassword && newPassword !== confirmNewPassword)) && (
                      <FormHelperText sx={{ fontSize: '12px', color: '#f04438' }}>
                        {errors.confirmNewPassword ? errors.confirmNewPassword.message : t('profile.passwordMismatch')}
                      </FormHelperText>
                    )}
                  </FormControl>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                    <LoadingButton
                      loading={isLoading}
                      variant="contained"
                      startIcon={<SaveIcon />}
                      type="submit"
                      fullWidth
                      sx={{
                        textTransform: 'none',
                        fontSize: '14px',
                        fontWeight: 600,
                        backgroundColor: '#1570EF',
                        borderRadius: '8px',
                        py: 1.2,
                        '&:hover': { backgroundColor: '#0e5fd8' },
                      }}
                    >
                      {t('profile.changeMyPassword')}
                    </LoadingButton>

                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      startIcon={<CancelIcon />}
                      fullWidth
                      sx={{
                        textTransform: 'none',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#667085',
                        borderColor: '#d0d5dd',
                        borderRadius: '8px',
                        py: 1.2,
                        '&:hover': {
                          backgroundColor: '#f9fafb',
                          borderColor: '#98a2b3',
                        },
                      }}
                    >
                      {t('profile.cancel')}
                    </Button>
                  </Box>

                  {/* Generate Random Password Button */}
                  <Button
                    variant="outlined"
                    onClick={() => setDialogOpen(true)}
                    startIcon={<LockResetIcon />}
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1570EF',
                      borderColor: '#1570EF',
                      borderRadius: '8px',
                      py: 1.2,
                      '&:hover': {
                        backgroundColor: '#f0f9ff',
                        borderColor: '#0e5fd8',
                      },
                    }}
                  >
                    {t('profile.generateRandomPassword')}
                  </Button>
                </Stack>
              </form>
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Random Password Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            border: '1px solid #eaecf0',
          },
        }}
      >
        <DialogTitle sx={{ fontSize: '18px', fontWeight: 600, color: '#101828', pb: 1 }}>
          {t('profile.generateRandomPassword')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography sx={{ fontSize: '14px', color: '#667085', mb: 2 }}>
              {t('profile.passwordLengthLabel')}: {passwordLength}
            </Typography>
            <Slider
              value={passwordLength}
              onChange={handleSliderChange}
              aria-labelledby="password-length-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={8}
              max={40}
              sx={{
                color: '#1570EF',
                '& .MuiSlider-thumb': {
                  width: 20,
                  height: 20,
                },
                '& .MuiSlider-mark': {
                  backgroundColor: '#d0d5dd',
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
              <Button
                onClick={() => setDialogOpen(false)}
                sx={{
                  textTransform: 'none',
                  fontSize: '14px',
                  color: '#667085',
                }}
              >
                {t('profile.cancel') || 'Cancel'}
              </Button>
              <Button
                variant="contained"
                onClick={generateRandomPassword}
                sx={{
                  textTransform: 'none',
                  fontSize: '14px',
                  backgroundColor: '#1570EF',
                  '&:hover': { backgroundColor: '#0e5fd8' },
                }}
              >
                Generate
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChangePasswordForm;