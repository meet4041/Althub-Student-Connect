import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css'; 

// --- MUI Imports ---
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Import the custom theme we created

axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Provides the Material UI Theme to the whole app */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline kicksstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);