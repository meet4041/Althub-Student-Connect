import Markup from './app/Routes.jsx';
import React from "react";
import './App.css';
import './styles/institute-layout.css';

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/session';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
         <Markup />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
