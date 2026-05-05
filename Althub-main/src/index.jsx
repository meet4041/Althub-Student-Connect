import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css'; 
import { AuthProvider } from './auth/session';
import { configureGlobalAxios } from './api/client';

// --- MUI Imports ---
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Import the custom theme we created

configureGlobalAxios();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Provides the Material UI Theme to the whole app */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline kicksstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
