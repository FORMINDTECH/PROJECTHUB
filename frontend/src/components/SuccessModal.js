import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './SuccessModal.css';

const SuccessModal = ({ isOpen, onClose, title, message }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div 
        className="success-modal-content" 
        onClick={(e) => e.stopPropagation()}
        data-theme={theme}
      >
        <div className="success-modal-header">
          <div className="success-icon">✓</div>
          <h2>{title || 'Sucesso!'}</h2>
        </div>
        <div className="success-modal-body">
          <p>{message || 'Operação realizada com sucesso.'}</p>
        </div>
        <div className="success-modal-footer">
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

export default SuccessModal;

