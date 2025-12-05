import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ProjectMembersModal.css';

const ProjectMembersModal = ({ projectId, onClose, isOwner }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  const loadMembers = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/members`);
      setMembers(response.data);
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
      const newMember = await api.post(`/projects/${projectId}/members`, {
        email: memberEmail
      });
      setMembers([...members, newMember.data]);
      setMemberEmail('');
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao adicionar membro');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Tem certeza que deseja remover este membro?')) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      setMembers(members.filter(m => m.id !== userId));
    } catch (error) {
      alert('Erro ao remover membro');
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
                    placeholder="Email do usuário"
                    required
                    className="member-email-input"
                  />
                  <button type="submit" disabled={addingMember} className="btn btn-primary btn-sm">
                    {addingMember ? 'Adicionando...' : 'Adicionar'}
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
                members.map((member) => (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <div className="member-name">{member.nickname || member.name}</div>
                      <div className="member-email">{member.email}</div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectMembersModal;

