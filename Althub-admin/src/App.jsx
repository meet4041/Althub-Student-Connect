import Markup from './app/Routes.jsx';
import React from "react";
import './App.css';

import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Markup />
    </BrowserRouter>
  );
}

export default App;
