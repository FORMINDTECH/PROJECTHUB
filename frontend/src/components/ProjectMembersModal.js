import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';
import ConfirmModal from './ConfirmModal';
import './ProjectMembersModal.css';

const ProjectMembersModal = ({ projectId, onClose, isOwner, projectOwner = null, projectCreatedAt = null }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, memberId: null });

  useEffect(() => {
    loadMembers();
  }, [projectId, projectOwner]);

  const loadMembers = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/members`);
      const membersList = response.data;
      
      // Adicionar o owner na lista se não estiver presente
      if (projectOwner && !membersList.find(m => m.id === projectOwner.id)) {
        setMembers([projectOwner, ...membersList]);
      } else {
        setMembers(membersList);
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setAddingMember(true);

    try {
      // Enviar convite ao invés de adicionar diretamente
      await api.post(`/projects/${projectId}/invites`, {
        email: memberEmail
      });
      setMemberEmail('');
      setError(''); // Limpar erro
      setSuccessModal({ 
        isOpen: true, 
        title: 'Convite Enviado!', 
        message: 'Convite enviado com sucesso! O usuário receberá uma notificação.' 
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao enviar convite');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = (userId) => {
    setConfirmModal({ isOpen: true, memberId: userId });
  };

  const confirmRemoveMember = async () => {
    if (!confirmModal.memberId) return;

    try {
      await api.delete(`/projects/${projectId}/members/${confirmModal.memberId}`);
      setMembers(members.filter(m => m.id !== confirmModal.memberId));
      setSuccessModal({ 
        isOpen: true, 
        title: 'Membro Removido!', 
        message: 'Membro removido com sucesso!' 
      });
    } catch (error) {
      setErrorModal({ isOpen: true, message: 'Erro ao remover membro' });
    } finally {
      setConfirmModal({ isOpen: false, memberId: null });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content members-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Membros do Projeto</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Fechar">×</button>
        </div>

        {loading ? (
          <div className="loading">Carregando membros...</div>
        ) : (
          <>
            {isOwner && (
              <form onSubmit={handleAddMember} className="add-member-form">
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                  <input
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="Email do usuário para convidar"
                    required
                    className="member-email-input"
                  />
                  <button type="submit" disabled={addingMember} className="btn btn-primary btn-sm">
                    {addingMember ? 'Enviando...' : 'Enviar Convite'}
                  </button>
                </div>
              </form>
            )}

            <div className="members-list">
              {members.length === 0 ? (
                <div className="empty-members">
                  <p>Nenhum membro adicionado ainda.</p>
                  {isOwner && <small>Adicione membros pelo email acima.</small>}
                </div>
              ) : (
                members.map((member) => {
                  const isProjectOwner = projectOwner && member.id === projectOwner.id;
                  return (
                    <div key={member.id} className={`member-item ${isProjectOwner ? 'owner' : ''}`}>
                      <div className="member-info">
                        <div className="member-avatar-container">
                          {member.avatar ? (
                            <img 
                              src={`http://localhost:5000${member.avatar}`} 
                              alt={member.nickname || member.name}
                              className="member-avatar"
                            />
                          ) : (
                            <div className="member-avatar-initial">
                              {(member.nickname || member.name)?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="member-details">
                          <div className="member-name">
                            {member.nickname || member.name}
                          </div>
                          <div className="member-email">{member.email}</div>
                          {isProjectOwner && projectCreatedAt && (
                            <div className="member-created-date">
                              Criado em {new Date(projectCreatedAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      {isOwner && !isProjectOwner && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
      />

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Erro"
        message={errorModal.message}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, memberId: null })}
        onConfirm={confirmRemoveMember}
        title="Remover Membro"
        message="Tem certeza que deseja remover este membro?"
      />
    </div>
  );
};

export default ProjectMembersModal;

