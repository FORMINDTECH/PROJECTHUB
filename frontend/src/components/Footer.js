import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './Footer.css';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="app-footer" data-theme={theme}>
      <p>© Formind Tech</p>
    </footer>
  );
};

export default Footer;

