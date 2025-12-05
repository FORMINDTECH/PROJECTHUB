import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import './AssignMemberModal.css';

const AssignMemberModal = ({ isOpen, onClose, task, projectId, onAssign }) => {
  const { theme } = useTheme();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadMembers();
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    if (task) {
      // Usar assignedToId se disponível, senão usar assignedTo?.id
      const assignedId = task.assignedToId || task.assignedTo?.id || null;
      setSelectedMember(assignedId);
    }
  }, [task, isOpen]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${projectId}/members`);
      const membersList = response.data || [];
      
      // Incluir o owner do projeto se disponível
      try {
        const projectResponse = await api.get(`/projects/${projectId}`);
        if (projectResponse.data?.owner && !membersList.find(m => m.id === projectResponse.data.owner.id)) {
          setMembers([projectResponse.data.owner, ...membersList]);
        } else {
          setMembers(membersList);
        }
      } catch (err) {
        // Se não conseguir buscar o projeto, usar apenas os membros
        setMembers(membersList);
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      alert('Erro ao carregar membros do projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!task) return;

    try {
      await api.put(`/tasks/${task.id}`, {
        assignedTo: selectedMember || null,
      });
      onAssign();
      onClose();
    } catch (error) {
      console.error('Erro ao associar membro:', error);
      alert('Erro ao associar membro à tarefa');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="assign-modal-overlay" onClick={onClose}>
      <div 
        className="assign-modal-content" 
        onClick={(e) => e.stopPropagation()}
        data-theme={theme}
      >
        <div className="assign-modal-header">
          <h2>Associar Membro</h2>
          <button 
            className="btn btn-ghost btn-icon" 
            onClick={onClose}
            title="Fechar"
          >
            ×
          </button>
        </div>

        <div className="assign-modal-body">
          <div className="task-info">
            <h3>{task?.title}</h3>
            {task?.description && <p className="task-description-preview">{task.description}</p>}
          </div>

          <div className="members-list">
            <label className="members-label">Selecione um membro:</label>
            {loading ? (
              <div className="loading-members">Carregando membros...</div>
            ) : (
              <div className="members-options">
                <button
                  className={`member-option ${selectedMember === null ? 'selected' : ''}`}
                  onClick={() => setSelectedMember(null)}
                >
                  <div className="member-option-content">
                    <div className="member-avatar-placeholder">—</div>
                    <span>Nenhum membro</span>
                  </div>
                </button>
                {members.map((member) => (
                  <button
                    key={member.id}
                    className={`member-option ${selectedMember === member.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMember(member.id)}
                  >
                    <div className="member-option-content">
                      {member.avatar ? (
                        <img 
                          src={`http://localhost:5000${member.avatar}`} 
                          alt={member.nickname || member.name}
                          className="member-avatar"
                        />
                      ) : (
                        <div className="member-avatar-placeholder">
                          {(member.nickname || member.name)?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{member.nickname || member.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="assign-modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleAssign}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignMemberModal;

