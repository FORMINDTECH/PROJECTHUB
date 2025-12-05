import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ProjectMembersModal.css';

const ProjectMembersModal = ({ projectId, onClose, isOwner, projectOwner = null }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState('');

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
                            {isProjectOwner && <span className="owner-badge">👑 Dono</span>}
                          </div>
                          <div className="member-email">{member.email}</div>
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
    </div>
  );
};

export default ProjectMembersModal;

