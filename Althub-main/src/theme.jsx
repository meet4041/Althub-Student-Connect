import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#66bd9e', // Your brand green
      contrastText: '#fff',
    },
    secondary: {
      main: '#2d3436', // Dark gray text
    },
    error: {
      main: '#ff4757',
    },
    warning: {
      main: '#f1c40f',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }, // Disable uppercase buttons
  },
  shape: {
    borderRadius: 16, // Global rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #f0f0f0',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

export default theme;