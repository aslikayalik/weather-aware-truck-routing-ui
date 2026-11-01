import { createTheme } from '@mui/material/styles';
import { trTR } from '@mui/material/locale';

// App-wide colours and component defaults are managed in one place
const theme = createTheme(
  {
    palette: {
      primary: { main: '#1e5aa8' },
      secondary: { main: '#f59e0b' },
      background: { default: '#f5f7fa' },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiAppBar: { defaultProps: { elevation: 0 } },
      MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid #e5e7eb' } } },
      MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    },
  },
  trTR,
);

export default theme;
