import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import SuccessModal from './SuccessModal';
import './InvitesModal.css';

const InvitesModal = ({ isOpen, onClose, onUpdate }) => {
  const { theme } = useTheme();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    if (isOpen) {
      loadInvites();
    }
  }, [isOpen]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invites');
      setInvites(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (inviteId) => {
    try {
      await api.post(`/invites/${inviteId}/accept`);
      await loadInvites();
      if (onUpdate) {
        onUpdate();
      }
      setSuccessModal({ isOpen: true, message: 'Convite aceito! Você agora é membro do projeto.' });
    } catch (error) {
      setSuccessModal({ isOpen: true, message: error.response?.data?.message || 'Erro ao aceitar convite' });
    }
  };

  const handleDecline = async (inviteId) => {
    try {
      await api.post(`/invites/${inviteId}/decline`);
      await loadInvites();
      setSuccessModal({ isOpen: true, message: 'Convite recusado.' });
    } catch (error) {
      setSuccessModal({ isOpen: true, message: error.response?.data?.message || 'Erro ao recusar convite' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="invites-modal-overlay" onClick={onClose}>
      <div 
        className="invites-modal-content" 
        onClick={(e) => e.stopPropagation()}
        data-theme={theme}
      >
        <div className="invites-modal-header">
          <h2>Convites Pendentes</h2>
          <button 
            className="btn btn-ghost btn-icon" 
            onClick={onClose}
            title="Fechar"
          >
            ×
          </button>
        </div>

        <div className="invites-modal-body">
          {loading ? (
            <div className="loading-invites">Carregando convites...</div>
          ) : invites.length === 0 ? (
            <div className="empty-invites">
              <p>Você não tem convites pendentes.</p>
            </div>
          ) : (
            <div className="invites-list">
              {invites.map((invite) => (
                <div key={invite.id} className="invite-item">
                  <div className="invite-info">
                    {invite.project?.logo && (
                      <img 
                        src={`http://localhost:5000${invite.project.logo}`} 
                        alt={invite.project.name}
                        className="invite-project-logo"
                      />
                    )}
                    <div className="invite-details">
                      <h3>{invite.project?.name}</h3>
                      <p className="invite-message">
                        <strong>{invite.inviter?.nickname || invite.inviter?.name}</strong> convidou você para participar deste projeto
                      </p>
                      {invite.project?.description && (
                        <p className="invite-description">{invite.project.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="invite-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAccept(invite.id)}
                    >
                      Aceitar
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDecline(invite.id)}
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <SuccessModal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ isOpen: false, message: '' })}
          title={successModal.message.includes('Erro') ? 'Erro' : 'Sucesso!'}
          message={successModal.message}
        />
      </div>
    </div>
  );
};

export default InvitesModal;

