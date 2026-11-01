import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface CustomDialogProps {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  title: string;
  description: string;
  loading?: boolean;
  cancelText?: string;
  submitText?: string;
}

const CustomDialog = (props: CustomDialogProps) => {
  const { open, loading, title, description, cancelText = 'Cancel', submitText = 'Submit', onConfirm, onClose } = props;
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{description}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: '1rem' }}>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={loading}>
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;
