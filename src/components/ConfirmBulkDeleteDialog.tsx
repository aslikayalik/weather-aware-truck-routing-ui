import React, { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ConfirmBulkDeleteDialogProps {
  open: boolean;
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
}

const ConfirmBulkDeleteDialog: React.FC<ConfirmBulkDeleteDialogProps> = ({
  open,
  count,
  onCancel,
  onConfirm,
  title = "Confirm Bulk Delete"
}) => {
  const [confirmText, setConfirmText] = useState('');
  const normalizedText = confirmText.trim().toLowerCase();
  const canConfirm = useMemo(() => normalizedText === 'evet' || normalizedText === 'yes', [normalizedText]);

  useEffect(() => {
    if (open) {
      setConfirmText('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#fef2f2' }}>
        <WarningIcon color="error" />
        <Typography variant="h6" fontWeight={700} color="#991b1b">
          {title}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body1">
          Are you sure you want to delete <b>{count}</b> documents?
        </Typography>
        <TextField
          fullWidth
          size="small"
          label="Confirmation"
          placeholder="yes"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          helperText="Type yes to confirm the deletion."
          sx={{ mt: 2 }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f9fafb' }}>
        <Button onClick={onCancel} variant="outlined" color="inherit" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={!canConfirm}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Yes, Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmBulkDeleteDialog;