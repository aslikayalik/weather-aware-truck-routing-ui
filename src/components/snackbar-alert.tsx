import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor } from '@mui/material/Alert';

interface SnackbarAlertProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity: AlertColor;
}

const SnackbarAlert = ({ open, onClose, message, severity }: SnackbarAlertProps) => {
  return (
    <Snackbar open={open} autoHideDuration={5000} onClose={onClose}>
      <MuiAlert severity={severity} onClose={onClose}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default SnackbarAlert;