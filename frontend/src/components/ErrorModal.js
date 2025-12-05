import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ErrorModal.css';

const ErrorModal = ({ isOpen, onClose, title, message }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="error-modal-overlay" onClick={onClose}>
      <div 
        className="error-modal-content" 
        onClick={(e) => e.stopPropagation()}
        data-theme={theme}
      >
        <div className="error-modal-header">
          <div className="error-icon">✕</div>
          <h2>{title || 'Erro!'}</h2>
        </div>
        <div className="error-modal-body">
          <p>{message || 'Ocorreu um erro ao processar sua solicitação.'}</p>
        </div>
        <div className="error-modal-footer">
          <button 
            className="btn btn-primary" 
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;

