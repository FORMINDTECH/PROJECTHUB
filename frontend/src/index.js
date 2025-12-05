import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/buttons.css';
import App from './App';

// Aplicar tema inicial
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

