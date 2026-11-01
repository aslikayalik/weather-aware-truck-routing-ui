import * as React from 'react';
import { useUpdateAdminUserMutation, useCreateAdminUserMutation, useLazyGetAdminUserQuery, useGetUserQuery } from '@services/userApi';
import { Box, Button, FormControl, FormHelperText, InputLabel, MenuItem, OutlinedInput, Select, Stack, Switch, Typography, IconButton, RadioGroup, FormControlLabel, Radio, InputAdornment, Dialog, DialogTitle, DialogContent, Slider, Paper, Avatar, Chip, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { UserFormData } from '@app/types/user';
import { useNavigate } from 'react-router';
import { LoadingButton } from '@mui/lab';
import { Save as SaveIcon, Check as CheckIcon, Close as CloseIcon, Visibility, VisibilityOff, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PasswordStrengthBar from '@app/shared/layout/password/password-strength-bar';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { useGetUserRolesQuery } from '@app/services/userRoleApi';

const UserForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: currentUser } = useGetUserQuery();
  const [updateUser, { isLoading: isLoadingUpdate }] = useUpdateAdminUserMutation();
  const [addUser, { isLoading: isLoadingCreate }] = useCreateAdminUserMutation();
  const [fetchUser, { isLoading: getUserLoading, data: user }] = useLazyGetAdminUserQuery();
  const { data: userRolesResp, isLoading: isUserRolesLoading } = useGetUserRolesQuery({ page: 0, rowsPerPage: 1000 });
  const userRoles = userRolesResp?.results ?? [];

  // The backend does not allow assigning roles ranked above the user's own
  const currentUserRank = currentUser?.role_detail?.rank;
  const selectableRoles = currentUser?.is_superuser || currentUserRank === undefined || currentUserRank === null
    ? userRoles
    : userRoles.filter((role) => role.rank <= currentUserRank);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    control,
  } = useForm<UserFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      expire_date: undefined,
      role: '',
      is_active: false,
      password: '',
      password_confirmation: '',
      profile: {
        avatar: '',
        initials: '',
        avatar_bg_color: '#1570EF',
        use_initials_avatar: true,
        initials_type: 'double',
      }
    }
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#1570EF');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [initialsType, setInitialsType] = useState('double');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passwordLength, setPasswordLength] = useState(8);
  const [is_active, setIsActive] = useState(false);
  const [isExpiryDateValid, setIsExpiryDateValid] = useState(true);
  const [expireDateErrorMsg, setExpireDateErrorMsg] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [useInitialsAvatar, setUseInitialsAvatar] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id, fetchUser]);

  useEffect(() => {
    if (user) {
      setValue('first_name', user.first_name);
      setValue('last_name', user.last_name);
      setValue('email', user.email);
      setValue('expire_date', user.expire_date);
      setValue('phone', user.phone || '');

      const roleId = user.role_detail && typeof user.role_detail === 'object' ? user.role_detail.id : (user.role_detail || '');
      setValue('role', roleId as string);

      setIsActive(user.is_active);

      if (user.profile) {
        setValue('profile.avatar', user.profile.avatar || '');

        if (user.profile.use_initials_avatar !== undefined) {
          setUseInitialsAvatar(user.profile.use_initials_avatar);
        }
        if (user.profile.initials) {
          setInitialsType(user.profile.initials.length === 1 ? 'single' : 'double');
        }
        if (user.profile.avatar_bg_color) {
          setBackgroundColor(user.profile.avatar_bg_color);
        }
        if (user.profile.avatar) {
          setAvatarUrl(user.profile.avatar);
        }
      }
    }
  }, [user, setValue]);

  const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('is_active', event.target.checked);
    setIsActive(event.target.checked);
  };

  const watchExpireDate = watch('expire_date');

  useEffect(() => {
    if (!watchExpireDate) {
      setIsExpiryDateValid(true);
      setExpireDateErrorMsg('');
      return;
    }
    const year = parseInt(watchExpireDate.split('-')[0], 10);
    if (isNaN(year) || year < 2000 || year > 2100) {
      setIsExpiryDateValid(false);
      setExpireDateErrorMsg(t('userForm.accountStatus.invalidDate'));
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(watchExpireDate) < today) {
      setIsExpiryDateValid(false);
      setExpireDateErrorMsg(t('userForm.accountStatus.pastDate'));
    } else {
      setIsExpiryDateValid(true);
      setExpireDateErrorMsg('');
    }
  }, [watchExpireDate, t]);

  if (getUserLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>{t('loading')}</Typography>
      </Box>
    );
  }

  const handleCancel = () => {
    navigate('/admin/users');
  };

  const generateInitials = (firstName: string, lastName: string, type: string) => {
    if (!firstName) return '';
    if (type === 'single') {
      return firstName.charAt(0).toUpperCase();
    }
    return `${firstName.charAt(0).toUpperCase()}${lastName ? lastName.charAt(0).toUpperCase() : ''}`;
  };

  const generateRandomPassword = () => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?/';

    let password = '';
    password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

    const allChars = lowercaseChars + uppercaseChars + numberChars + specialChars;
    for (let i = 4; i < passwordLength; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    setValue('password', password);
    clearErrors(['password']);
    setDialogOpen(false);
  };

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setPasswordLength(newValue as number);
  };

  const onSubmit = async (data: UserFormData) => {
    if (!id && passwordStrength < 20) {
      setError('password', {
        type: 'manual',
        message: t('profile.weakPasswordWarning'),
      });
      return;
    }

    if (expireDateErrorMsg) {
      setError('expire_date', { type: 'manual', message: expireDateErrorMsg });
      return;
    }

    const payload: any = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email.toLowerCase(),
      phone: data.phone || '',
      role: data.role,
      is_active,
      expire_date: data.expire_date || null,
      profile: {
        initials: generateInitials(data.first_name || '', data.last_name || '', initialsType),
        avatar_bg_color: backgroundColor,
        use_initials_avatar: useInitialsAvatar,
        initials_type: initialsType,
      },
    };

    if (!id) {
      if (data.password) payload.password = data.password;
      if (data.password_confirmation) payload.password_confirmation = data.password_confirmation;
    }

    try {
      if (id) {
        await updateUser({ ...payload, id }).unwrap();
      } else {
        await addUser(payload).unwrap();
      }
      navigate('/admin/users');
    } catch (error: any) {
      if (error?.data) {
        Object.keys(error.data).forEach((field: string) => {
          const fieldError = error.data[field];
          setError(field as any, {
            type: 'manual',
            message: Array.isArray(fieldError) ? fieldError.join(', ') : String(fieldError),
          });
        });
      }
    }
  };

  const password = watch('password');
  const regex = /[!@#$%^&*(),.?":{}|<>[\]\\\-_=+;:'`~@/]/;

  const passwordValidationRules = [
    {
      validate: (value?: string) => (value?.length ?? 0) >= 8,
      message: t('profile.passwordLengthRequirement'),
    },
    {
      validate: (value?: string) => /[a-z]+/.test(value || ''),
      message: t('profile.passwordMustContainLowercase'),
    },
    {
      validate: (value?: string) => /[A-Z]+/.test(value || ''),
      message: t('profile.passwordMustContainUppercase'),
    },
    {
      validate: (value?: string) => /\d+/.test(value || ''),
      message: t('profile.passwordMustContainNumber'),
    },
    {
      validate: (value?: string) => regex.test(value || ''),
      message: t('profile.passwordMustContainSpecialChar'),
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', pt: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        {/* Back Button */}
        <IconButton onClick={handleCancel} sx={{ mb: 2, color: '#2563EB', background: '#f1f5f9', border: '1px solid #e5e7eb', '&:hover': { background: '#e0e7ef' } }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontSize: '28px', fontWeight: 600, color: '#101828', mb: 0.75 }}>
          {id ? t('userForm.title.edit') : t('userForm.title.create')}
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#667085' }}>
          {id ? t('userForm.subtitle.edit') : t('userForm.subtitle.create')}
        </Typography>
      </Box>

      <Paper sx={{ border: '1px solid #eaecf0', borderRadius: '8px', p: 3, boxShadow: 'none' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Avatar Section */}
            <Box sx={{ pb: 3, borderBottom: '1px solid #eaecf0' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#344054', mb: 2 }}>
                {t('userForm.avatar.sectionTitle')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {useInitialsAvatar ? (
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor,
                      fontSize: '32px',
                      fontWeight: 600,
                      borderRadius: '8px',
                    }}
                  >
                    {generateInitials(getValues('first_name') || '', getValues('last_name') || '', initialsType)}
                  </Avatar>
                ) : (
                  <Avatar
                    src={avatarUrl}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '8px',
                    }}
                  />
                )}
                <Box sx={{ flex: 1 }}>
                  <RadioGroup
                    row
                    value={useInitialsAvatar ? 'initials' : 'image'}
                    onChange={(e) => setUseInitialsAvatar(e.target.value === 'initials')}
                  >
                    <FormControlLabel
                      value="initials"
                      control={<Radio sx={{ color: '#d0d5dd', '&.Mui-checked': { color: '#1570EF' } }} />}
                      label={<Typography sx={{ fontSize: '14px', color: '#344054' }}>{t('userForm.avatar.useInitials')}</Typography>}
                    />
                    {id && (
                      <FormControlLabel
                        value="image"
                        control={<Radio sx={{ color: '#d0d5dd', '&.Mui-checked': { color: '#1570EF' } }} />}
                        label={<Typography sx={{ fontSize: '14px', color: '#344054' }}>{t('userForm.avatar.useImage')}</Typography>}
                      />
                    )}
                  </RadioGroup>
                  {useInitialsAvatar && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
                      <Box role="radiogroup" aria-label="Initials type" sx={{ display: 'flex', gap: 2 }}>
                        <Box
                          role="radio"
                          aria-checked={initialsType === 'single'}
                          aria-labelledby="initials-single-label"
                          tabIndex={0}
                          onClick={() => setInitialsType('single')}
                          onKeyDown={(event) => {
                            if (event.key === ' ' || event.key === 'Enter') {
                              event.preventDefault();
                              setInitialsType('single');
                            }
                          }}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: 'pointer',
                            outline: 'none',
                            '&:focus-visible': {
                              boxShadow: '0 0 0 2px #c7d2fe',
                              borderRadius: '6px',
                            },
                          }}
                        >
                          <Radio
                            checked={initialsType === 'single'}
                            tabIndex={-1}
                            size="small"
                            sx={{ color: '#d0d5dd', '&.Mui-checked': { color: '#1570EF' } }}
                          />
                          <Typography id="initials-single-label" sx={{ fontSize: '13px', color: '#667085' }}>
                            {t('userForm.avatar.singleLetter')}
                          </Typography>
                        </Box>
                        <Box
                          role="radio"
                          aria-checked={initialsType === 'double'}
                          aria-labelledby="initials-double-label"
                          tabIndex={0}
                          onClick={() => setInitialsType('double')}
                          onKeyDown={(event) => {
                            if (event.key === ' ' || event.key === 'Enter') {
                              event.preventDefault();
                              setInitialsType('double');
                            }
                          }}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: 'pointer',
                            outline: 'none',
                            '&:focus-visible': {
                              boxShadow: '0 0 0 2px #c7d2fe',
                              borderRadius: '6px',
                            },
                          }}
                        >
                          <Radio
                            checked={initialsType === 'double'}
                            tabIndex={-1}
                            size="small"
                            sx={{ color: '#d0d5dd', '&.Mui-checked': { color: '#1570EF' } }}
                          />
                          <Typography id="initials-double-label" sx={{ fontSize: '13px', color: '#667085' }}>
                            {t('userForm.avatar.doubleLetter')}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: '#f9fafb',
                            '&:hover': { backgroundColor: '#f2f4f7' },
                          }}
                        >
                          <ColorLensIcon sx={{ fontSize: 16, color: '#667085' }} />
                        </IconButton>
                        {showColorPicker && (
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            style={{
                              width: 40,
                              height: 32,
                              border: '1px solid #d0d5dd',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Personal Information */}
            <Box>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#344054', mb: 2 }}>
                {t('userForm.personalInfo.sectionTitle')}
              </Typography>
              <Stack spacing={2.5}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel sx={{ fontSize: '14px' }}>{t('userForm.personalInfo.firstName')} *</InputLabel>
                  <OutlinedInput
                    {...register('first_name', {
                      required: t('userForm.personalInfo.firstNameRequired'),
                      maxLength: { value: 100, message: t('userForm.personalInfo.firstNameMaxLength') },
                      minLength: { value: 1, message: t('userForm.personalInfo.firstNameMinLength') },
                    })}
                    label={`${t('userForm.personalInfo.firstName')} *`}
                    sx={{
                      fontSize: '14px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0d5dd' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#98a2b3' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1570EF' },
                    }}
                  />
                  {errors.first_name && (
                    <FormHelperText error sx={{ fontSize: '13px' }}>
                      {errors.first_name.message}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel sx={{ fontSize: '14px' }}>{t('userForm.personalInfo.lastName')} *</InputLabel>
                  <OutlinedInput
                    {...register('last_name', {
                      required: t('userForm.personalInfo.lastNameRequired'),
                      maxLength: { value: 100, message: t('userForm.personalInfo.lastNameMaxLength') },
                      minLength: { value: 1, message: t('userForm.personalInfo.lastNameMinLength') },
                    })}
                    label={`${t('userForm.personalInfo.lastName')} *`}
                    sx={{
                      fontSize: '14px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0d5dd' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#98a2b3' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1570EF' },
                    }}
                  />
                  {errors.last_name && (
                    <FormHelperText error sx={{ fontSize: '13px' }}>
                      {errors.last_name.message}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth variant="outlined">
                  <InputLabel sx={{ fontSize: '14px' }}>{t('userForm.personalInfo.email')} *</InputLabel>
                  <OutlinedInput
                    {...register('email', {
                      required: t('userForm.personalInfo.emailRequired'),
                      maxLength: { value: 255, message: t('userForm.personalInfo.emailMaxLength') },
                      validate(value) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        const asciiOnlyRegex = /^[\x00-\x7F]*$/;
                        if (!value || !value.trim()) {
                          return t('userForm.personalInfo.emailRequired');
                        }
                        else if (!asciiOnlyRegex.test(value)) {
                          return t('userForm.personalInfo.emailAsciiOnly');
                        }
                        else if (!emailRegex.test(value)) {
                          return t('userForm.personalInfo.emailInvalid');
                        }
                        return true;
                      },
                    })}
                    label={`${t('userForm.personalInfo.email')} *`}
                    placeholder={t('userForm.personalInfo.emailPlaceholder')}
                    sx={{
                      fontSize: '14px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0d5dd' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#98a2b3' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1570EF' },
                    }}
                  />
                  {errors.email && (
                    <FormHelperText error sx={{ fontSize: '13px' }}>
                      {errors.email.message}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth variant="outlined" sx={{ mt: 2, mb: 2 }}>
                  <InputLabel sx={{ fontSize: '14px' }}>Phone Number *</InputLabel>
                  <OutlinedInput
                    {...register('phone', {
                      required: 'Phone number is required',
                      maxLength: { value: 15, message: 'At most 15 characters' },
                      pattern: {
                        value: /^\+?\d{10,15}$/,
                        message: 'Enter a valid phone number (e.g. +905xxxxxxxxx or 05xxxxxxxxx)'
                      }
                    })}
                    label="Phone Number *"
                    placeholder="Enter a phone number"
                    inputProps={{ maxLength: 15 }}
                    sx={{
                      fontSize: '14px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0d5dd' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#98a2b3' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1570EF' },
                    }}
                  />
                  {errors.phone && (
                    <FormHelperText error sx={{ fontSize: '13px' }}>
                      {errors.phone.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </Stack>
            </Box>

            {/* Role & Permissions */}
            <Box sx={{ pt: 2, borderTop: '1px solid #eaecf0' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#344054', mb: 2 }}>
                {t('userForm.rolePermissions.sectionTitle')}
              </Typography>
              <Stack spacing={2.5}>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: t('userForm.rolePermissions.roleRequired') }}
                  render={({ field }) => (
                    <FormControl fullWidth variant="outlined" error={!!errors.role} sx={{ mb: 2 }}>
                      <InputLabel sx={{ fontSize: '14px' }}>{t('userForm.rolePermissions.role')} *</InputLabel>
                      <Select
                        {...field}
                        label={`${t('userForm.rolePermissions.role')} *`}
                        disabled={isUserRolesLoading}
                        sx={{
                          fontSize: '14px',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0d5dd' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#98a2b3' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1570EF' },
                        }}
                      >
                        {isUserRolesLoading && <MenuItem value="">{t('loading')}</MenuItem>}
                        {!isUserRolesLoading && selectableRoles.length > 0 ? (
                          selectableRoles.map((role) => (
                            <MenuItem key={role.id} value={role.id} sx={{ fontSize: '14px' }}>
                              {role.display_name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="" disabled>
                            {t('userForm.rolePermissions.roleNotFound')}
                          </MenuItem>
                        )}
                      </Select>
                      {errors.role && (
                        <FormHelperText error sx={{ fontSize: '13px' }}>
                          {errors.role.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

              </Stack>
            </Box>

            {/* Account Status */}
            <Box sx={{ pt: 2, borderTop: '1px solid #eaecf0' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#344054', mb: 2 }}>
                {t('userForm.accountStatus.sectionTitle')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Controller
                  name="expire_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      label={t('userForm.accountStatus.expireDate')}
                      type="date"
                      error={!!expireDateErrorMsg}
                      helperText={expireDateErrorMsg || undefined}
                      InputLabelProps={{ shrink: true }}
                      FormHelperTextProps={{ sx: { fontSize: '13px', color: '#d32f2f' } }}
                      sx={{
                        flex: 1,
                        fontSize: '14px',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0d5dd' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#98a2b3' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1570EF' },
                      }}
                    />
                  )}
                />
                <Box sx={{ pt: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={is_active}
                          onChange={handleActiveChange}
                          disabled={!isExpiryDateValid}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#1570EF',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#1570EF',
                            },
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#344054' }}>
                            {t('userForm.accountStatus.active')}
                          </Typography>
                          <Typography sx={{ fontSize: '12px', color: '#667085' }}>
                            {t('userForm.accountStatus.activeDescription')}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
              </Box>
            </Box>

            {/* Password Section - Only for new users */}
            {!id && (
              <Box sx={{ pt: 2, borderTop: '1px solid #eaecf0' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#344054', mb: 2 }}>
                  {t('userForm.password.sectionTitle')}
                </Typography>
                <Stack spacing={2.5}>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: t('userForm.password.passwordRequired'),
                      minLength: { value: 8, message: t('userForm.password.passwordMinLength') },
                      validate: {
                        hasLowercase: (value) => /[a-z]/.test(value || '') || t('userForm.password.hasLowercase'),
                        hasUppercase: (value) => /[A-Z]/.test(value || '') || t('userForm.password.hasUppercase'),
                        hasNumber: (value) => /\d/.test(value || '') || t('userForm.password.hasNumber'),
                        hasSpecialChar: (value) => regex.test(value || '') || t('userForm.password.hasSpecialChar'),
                        isStrongEnough: () => passwordStrength >= 30 || t('userForm.password.tooWeak'),
                      },
                    }}
                    render={({ field }) => (
                      <FormControl fullWidth variant="outlined">
                        <InputLabel sx={{ fontSize: '14px' }}>{t('userForm.password.password')} *</InputLabel>
                        <OutlinedInput
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          label={`${t('userForm.password.password')} *`}
                          inputProps={{ maxLength: 40 }}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                disabled={!field.value}
                                sx={{ color: '#667085' }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          }
                          sx={{
                            fontSize: '14px',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0d5dd' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#98a2b3' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1570EF' },
                          }}
                        />
                        {errors.password && (
                          <FormHelperText error sx={{ fontSize: '13px' }}>
                            {errors.password.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />

                  {password && (
                    <Box>
                      <PasswordStrengthBar password={password || ''} onChangeScore={setPasswordStrength} />
                      <Stack spacing={0.5} sx={{ mt: 2 }}>
                        {passwordValidationRules.map((rule, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {rule.validate(password) ? (
                              <CheckIcon sx={{ fontSize: 16, color: '#12b76a' }} />
                            ) : (
                              <CloseIcon sx={{ fontSize: 16, color: '#f04438' }} />
                            )}
                            <Typography
                              sx={{
                                fontSize: '13px',
                                color: rule.validate(password) ? '#027a48' : '#b42318',
                              }}
                            >
                              {rule.message}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={{ fontSize: '14px' }}>{t('userForm.password.confirmPassword')} *</InputLabel>
                    <OutlinedInput
                      {...register('password_confirmation', {
                        required: getValues('password') ? t('userForm.password.confirmPasswordRequired') : false,
                        validate: (value) => value === getValues('password') || t('userForm.password.passwordMismatch'),
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      label={`${t('userForm.password.confirmPassword')} *`}
                      inputProps={{ maxLength: 40 }}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            disabled={!watch('password_confirmation')}
                            sx={{ color: '#667085' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      sx={{
                        fontSize: '14px',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0d5dd' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#98a2b3' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1570EF' },
                      }}
                    />
                    {errors.password_confirmation && (
                      <FormHelperText error sx={{ fontSize: '13px' }}>
                        {errors.password_confirmation.message}
                      </FormHelperText>
                    )}
                  </FormControl>

                  <Button
                    variant="outlined"
                    onClick={() => setDialogOpen(true)}
                    sx={{
                      textTransform: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      borderColor: '#d0d5dd',
                      color: '#344054',
                      '&:hover': {
                        borderColor: '#98a2b3',
                        backgroundColor: '#f9fafb',
                      },
                    }}
                  >
                    {t('userForm.password.generateRandom')}
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1.5,
                pt: 3,
                borderTop: '1px solid #eaecf0',
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '9px 20px',
                  borderColor: '#d0d5dd',
                  color: '#344054',
                  '&:hover': {
                    borderColor: '#98a2b3',
                    backgroundColor: '#f9fafb',
                  },
                }}
              >
                {t('userForm.actions.cancel')}
              </Button>
              <LoadingButton
                loading={isLoadingUpdate || isLoadingCreate}
                loadingPosition="start"
                startIcon={<SaveIcon />}
                variant="contained"
                type="submit"
                sx={{
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '9px 20px',
                  backgroundColor: '#1570EF',
                  '&:hover': { backgroundColor: '#0e5fd8' },
                }}
              >
                {id ? t('userForm.actions.update') : t('userForm.actions.save')}
              </LoadingButton>
            </Box>
          </Stack>
        </form>
      </Paper>

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
          {t('userForm.password.dialogTitle')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography sx={{ fontSize: '14px', color: '#667085', mb: 2 }}>
              {t('userForm.password.dialogLengthLabel', { length: passwordLength })}
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
                {t('userForm.actions.cancel')}
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
                {t('userForm.password.dialogGenerate')}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UserForm;