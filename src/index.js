import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Rendering the main App component inside a StrictMode wrapper for highlighting potential problems
// This is the entry point for the App 
// I have found that the strict mode helps catch issues early in development
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
