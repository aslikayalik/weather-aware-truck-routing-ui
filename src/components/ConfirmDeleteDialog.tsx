import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Box } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useTranslation } from 'react-i18next';

interface ConfirmDeleteDialogProps {
  open: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmName?: string;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  message,
  onCancel,
  onConfirm,
  confirmText,
  cancelText,
  confirmName = ""
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    if (!open) setInputValue("");
  }, [open]);

  const isMatch = ["evet", "yes"].includes(inputValue.trim().toLowerCase()) && confirmName.trim().toLowerCase() === "evet";

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 1,
          pt: 3,
          px: 3,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 24, color: '#dc2626' }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#101828' }}>
            {t('confirmDeleteDialog.title')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 3, px: 3 }}>
        <Typography
          sx={{
            fontSize: '14px',
            color: '#667085',
            lineHeight: 1.6,
            mb: confirmName ? 2.5 : 0,
          }}
        >
          {message}
        </Typography>

        {confirmName && (
          <TextField
            autoFocus
            fullWidth
            label={t('confirmDeleteDialog.confirmLabel')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            variant="outlined"
            placeholder="evet"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '14px',
                '& fieldset': {
                  borderColor: '#d0d5dd',
                },
                '&:hover fieldset': {
                  borderColor: '#98a2b3',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#dc2626',
                  borderWidth: '2px',
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: '14px',
                color: '#667085',
                '&.Mui-focused': {
                  color: '#dc2626',
                },
              },
            }}
          />
        )}
      </DialogContent>

      <DialogActions
        sx={{
          gap: 1,
          px: 3,
          pb: 3,
          pt: 0,
        }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            flex: 1,
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
          {cancelText ?? t('confirmDeleteDialog.cancelText')}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={!!confirmName && !isMatch}
          sx={{
            flex: 1,
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 500,
            padding: '9px 20px',
            backgroundColor: '#dc2626',
            '&:hover': {
              backgroundColor: '#b91c1c',
            },
            '&.Mui-disabled': {
              backgroundColor: '#fecdd3',
              color: '#fca5a5',
            },
          }}
        >
          {confirmText ?? t('confirmDeleteDialog.confirmText')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;