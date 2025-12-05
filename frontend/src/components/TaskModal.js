import React, { useState, useEffect } from 'react';
import './TaskModal.css';

const TaskModal = ({ onClose, onSave, task = null, initialStatus = null, members = [] }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(initialStatus || task?.status || 'todo');
  const [assignedTo, setAssignedTo] = useState(task?.assignedToId || task?.assignedTo?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setAssignedTo(task.assignedToId || task.assignedTo?.id || '');
    } else if (initialStatus) {
      setStatus(initialStatus);
    }
  }, [task, initialStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = task
        ? await onSave(task._id || task.id, { title, description, status, assignedTo: assignedTo || null })
        : await onSave({ title, description, status, assignedTo: assignedTo || null });
      if (!result.success) {
        setError(result.error || 'Erro ao salvar tarefa');
      }
    } catch (err) {
      setError('Erro ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Fechar">×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título da Tarefa *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Implementar login"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Descreva a tarefa..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="status-select"
            >
              <option value="todo">A Fazer</option>
              <option value="in-progress">Em Progresso</option>
              <option value="done">Concluído</option>
            </select>
          </div>

          {members.length > 0 && (
            <div className="form-group">
              <label htmlFor="assignedTo">Atribuir a</label>
              <select
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="status-select"
              >
                <option value="">Ninguém</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.nickname || member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

