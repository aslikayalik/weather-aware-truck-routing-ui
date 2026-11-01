import React, { useEffect, useState } from 'react';
import { useGetUserQuery, useChangeUserAvatarMutation } from '@services/userApi';
import {
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  RadioGroup,
  FormControl,
  FormLabel,
  Radio,
  IconButton,
  Popover,
  CircularProgress,
  Container,
  Paper,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import { Palette as PaletteIcon, PhotoCamera as PhotoCamera, Save as SaveIcon, Person as PersonIcon, Email as EmailIcon, Badge as BadgeIcon, Group as GroupIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { data: user, isLoading, isError, refetch } = useGetUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });


  const [changeUserAvatar, { isLoading: isUploading }] = useChangeUserAvatarMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [useInitialsAvatar, setUseInitialsAvatar] = useState<boolean>(user?.profile?.use_initials_avatar ?? true);
  const [isSaved, setIsSaved] = useState(true);
  const [initials, setInitials] = useState(user?.profile?.initials || '');
  const [avatarBgColor, setAvatarBgColor] = useState(user?.profile?.avatar_bg_color || '#64b5f6');
  const [initialsType, setInitialsType] = useState<'single' | 'double'>('double');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    if (user?.profile) {
      setUseInitialsAvatar(user.profile.use_initials_avatar ?? true);
      setInitials(user.profile.initials || '');
      setAvatarBgColor(user.profile.avatar_bg_color || '#64b5f6');
      setInitialsType(user.profile.initials?.length === 1 ? 'single' : 'double');
      setIsSaved(true);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // File size check (250KB)
      if (file.size > 250 * 1024) {
        setUploadError('The file must be smaller than 250KB');
        return;
      }

      // File type check
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files can be uploaded');
        return;
      }

      setUploadError(null);
      setSelectedFile(file);
      setIsSaved(false);
    }
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setUseInitialsAvatar(checked);
    setIsSaved(false);
  };

  const handleSavePreference = async () => {
    try {
      setUploadError(null);
      const formData = new FormData();

      formData.append('use_initials_avatar', String(useInitialsAvatar));
      formData.append('initials_type', initialsType);
      formData.append('avatar_bg_color', avatarBgColor);

      // Send the avatar file only when initials are not used and a file was selected
      if (!useInitialsAvatar && selectedFile) {
        formData.append('avatar', selectedFile);
      }

      console.log('Uploading with data:', {
        use_initials_avatar: useInitialsAvatar,
        initials_type: initialsType,
        avatar_bg_color: avatarBgColor,
        has_file: !!selectedFile,
      });

      await changeUserAvatar(formData).unwrap();

      setIsSaved(true);
      setSelectedFile(null);
      setPreview(null);

      // Reload the user data
      await refetch();

      console.log('Avatar updated successfully');
    } catch (error: any) {
      console.error('Error saving preference:', error);
      setUploadError(error?.data?.detail || 'An error occurred while updating the avatar');
    }
  };

  const handleInitialsTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedType = event.target.value as 'single' | 'double';
    setInitialsType(selectedType);

    const newInitials =
      selectedType === 'single'
        ? user?.first_name?.charAt(0).toUpperCase()
        : `${user?.first_name?.charAt(0).toUpperCase()}${user?.last_name?.charAt(0).toUpperCase()}`;

    setInitials(newInitials || '');
    setIsSaved(false);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarBgColor(event.target.value);
    setIsSaved(false);
  };

  const handlePaletteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'color-popover' : undefined;

  const generateInitialsAvatar = (initials: string, bgColor: string) => {
    return (
      <Box
        sx={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '50px',
          color: '#fff',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          border: '4px solid #eaecf0',
        }}
      >
        {initials}
      </Box>
    );
  };

  const renderAvatar = () => {
    if (useInitialsAvatar) {
      return generateInitialsAvatar(initials, avatarBgColor);
    } else if (preview) {
      return (
        <img
          src={preview}
          alt={t('profile.user_avatar')}
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid #eaecf0',
          }}
        />
      );
    } else if (user?.profile?.avatar) {
      // MinIO'dan gelen avatar
      return (
        <img
          src={user.profile.avatar}
          alt={t('profile.user_avatar')}
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid #eaecf0',
          }}
          onError={(e) => {
            console.error('Avatar loading error');
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    } else {
      return (
        <Box
          sx={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            backgroundColor: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#667085',
            border: '4px solid #eaecf0',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {t('profile.no_avatar')}
        </Box>
      );
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>

        <Alert
          severity="error"
          sx={{
            border: '1px solid #fecaca',
            borderRadius: '8px',
          }}
        >
          {t('profile.error_loading')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      {/* Warning Alert */}
      {!isSaved && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            border: '1px solid #fef3c7',
            borderRadius: '8px',
            backgroundColor: '#fffbeb',
            '& .MuiAlert-icon': {
              color: '#f59e0b',
            },
          }}
        >
          {t('profile.save_avatar_type')}
        </Alert>
      )}

      {/* Main Content */}
      <Paper
        sx={{
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
            Profile Settings
          </Typography>
          <Typography
            sx={{
              fontSize: '14px',
              color: '#667085',
              mt: 0.5,
            }}
          >
            Manage your profile details and avatar settings
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            {/* Avatar Section */}
            <Box sx={{ minWidth: '250px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {renderAvatar()}

                {/* Avatar Controls */}
                <Box sx={{ width: '100%' }}>
                  {!useInitialsAvatar && (
                    <Box sx={{ mb: 2 }}>
                      <input type="file" id="fileUpload" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                      <label htmlFor="fileUpload">
                        <Button
                          variant="outlined"
                          component="span"
                          disabled={isUploading}
                          fullWidth
                          startIcon={<PhotoCamera />}
                          sx={{
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#1570EF',
                            borderColor: '#1570EF',
                            borderRadius: '8px',
                            py: 1,
                            '&:hover': {
                              backgroundColor: '#f0f9ff',
                              borderColor: '#0e5fd8',
                            },
                          }}
                        >
                          {t('profile.file')}
                        </Button>
                      </label>
                      {selectedFile && (
                        <Typography
                          sx={{
                            fontSize: '12px',
                            color: '#667085',
                            mt: 1,
                            textAlign: 'center',
                          }}
                        >
                          {selectedFile.name}
                        </Typography>
                      )}
                      {uploadError && (
                        <Alert
                          severity="error"
                          sx={{
                            mt: 1,
                            fontSize: '12px',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                          }}
                        >
                          {uploadError}
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* Switch */}
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #eaecf0',
                      mb: 2,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useInitialsAvatar}
                          onChange={handleSwitchChange}
                          disabled={isUploading}
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
                        <Typography sx={{ fontSize: '14px', color: '#344054', fontWeight: 500 }}>
                          {t('profile.use_initials_avatar')}
                        </Typography>
                      }
                    />
                  </Box>

                  {/* Initials Settings */}
                  {useInitialsAvatar && (
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #eaecf0',
                        mb: 2,
                      }}
                    >
                      <FormControl component="fieldset" fullWidth>
                        <FormLabel
                          component="legend"
                          sx={{
                            fontSize: '14px',
                            color: '#344054',
                            fontWeight: 500,
                            mb: 1,
                          }}
                        >
                          {t('profile.initials_type')}
                        </FormLabel>
                        <RadioGroup value={initialsType} onChange={handleInitialsTypeChange}>
                          <FormControlLabel
                            value="single"
                            control={
                              <Radio
                                sx={{
                                  color: '#d0d5dd',
                                  '&.Mui-checked': {
                                    color: '#1570EF',
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ fontSize: '14px', color: '#344054' }}>{t('profile.single_initial')}</Typography>
                            }
                            disabled={isUploading}
                          />
                          <FormControlLabel
                            value="double"
                            control={
                              <Radio
                                sx={{
                                  color: '#d0d5dd',
                                  '&.Mui-checked': {
                                    color: '#1570EF',
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ fontSize: '14px', color: '#344054' }}>{t('profile.double_initial')}</Typography>
                            }
                            disabled={isUploading}
                          />
                        </RadioGroup>
                      </FormControl>

                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
                        <Typography sx={{ fontSize: '14px', color: '#344054', fontWeight: 500 }}>
                          Arka Plan Rengi:
                        </Typography>
                        <IconButton
                          onClick={handlePaletteClick}
                          disabled={isUploading}
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: avatarBgColor,
                            border: '2px solid #eaecf0',
                            '&:hover': {
                              backgroundColor: avatarBgColor,
                              opacity: 0.8,
                            },
                          }}
                        >
                          <PaletteIcon sx={{ fontSize: 16, color: '#fff' }} />
                        </IconButton>
                      </Box>

                      <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClosePopover}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'left',
                        }}
                        PaperProps={{
                          sx: {
                            borderRadius: '8px',
                            border: '1px solid #eaecf0',
                            boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
                          },
                        }}
                      >
                        <Box sx={{ p: 2 }}>
                          <input
                            type="color"
                            value={avatarBgColor}
                            onChange={handleColorChange}
                            style={{
                              height: '50px',
                              width: '100px',
                              border: 'none',
                              cursor: 'pointer',
                              borderRadius: '4px',
                            }}
                          />
                        </Box>
                      </Popover>
                    </Box>
                  )}

                  {/* Save Button */}
                  <Button
                    onClick={handleSavePreference}
                    variant="contained"
                    disabled={isUploading || isSaved}
                    fullWidth
                    startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    sx={{
                      textTransform: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      backgroundColor: '#1570EF',
                      borderRadius: '8px',
                      py: 1.2,
                      '&:hover': {
                        backgroundColor: '#0e5fd8',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#f9fafb',
                        color: '#98a2b3',
                      },
                    }}
                  >
                    {isUploading ? t('profile.uploading') : t('profile.save')}
                  </Button>
                </Box>
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

            {/* User Info Section */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#101828',
                  mb: 3,
                }}
              >
                {user?.first_name} {user?.last_name}
              </Typography>

              <Stack spacing={2.5}>
                {/* Email */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      backgroundColor: '#f0f9ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EmailIcon sx={{ fontSize: 20, color: '#1570EF' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#667085', fontWeight: 500, mb: 0.5 }}>
                      {t('profile.email')}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#344054', fontWeight: 500 }}>{user?.email}</Typography>
                  </Box>
                </Box>

                {/* Role */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      backgroundColor: '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BadgeIcon sx={{ fontSize: 20, color: '#16a34a' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#667085', fontWeight: 500, mb: 0.5 }}>
                      {t('profile.role')}
                    </Typography>
                    <Chip
                      label={user?.role_detail?.display_name || ''}
                      size="small"
                      sx={{
                        backgroundColor: '#f0fdf4',
                        color: '#16a34a',
                        fontWeight: 500,
                        fontSize: '12px',
                        height: '24px',
                      }}
                    />
                  </Box>
                </Box>

                {/* Groups */}
                {/** 
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      backgroundColor: '#fef3f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GroupIcon sx={{ fontSize: 20, color: '#f97316' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#667085', fontWeight: 500, mb: 0.5 }}>
                      {t('profile.groups')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {user?.user_groups && user.user_groups.length > 0 ? (
                        user.user_groups.map((group, index) => (
                          <Chip
                            key={index}
                            label={group.name}
                            size="small"
                            sx={{
                              backgroundColor: '#fef3f2',
                              color: '#f97316',
                              fontWeight: 500,
                              fontSize: '12px',
                              height: '24px',
                            }}
                          />
                        ))
                      ) : (
                        <Typography sx={{ fontSize: '14px', color: '#98a2b3' }}>
                          Grup yok
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                */}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;