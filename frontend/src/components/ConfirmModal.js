import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div 
        className="confirm-modal-content" 
        onClick={(e) => e.stopPropagation()}
        data-theme={theme}
      >
        <div className="confirm-modal-header">
          <h2>{title || 'Confirmar ação'}</h2>
        </div>
        <div className="confirm-modal-body">
          <p>{message || 'Tem certeza que deseja realizar esta ação?'}</p>
        </div>
        <div className="confirm-modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-danger" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

