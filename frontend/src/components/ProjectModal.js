import React, { useState } from 'react';
import './ProjectModal.css';

const ProjectModal = ({ onClose, onSave, project = null }) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [color, setColor] = useState(project?.color || '#6366f1');
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#ef4444', '#f59e0b', '#10b981', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await onSave({ name, description, color });
      if (!result.success) {
        setError(result.error || 'Erro ao salvar projeto');
      }
    } catch (err) {
      setError('Erro ao salvar projeto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{project ? 'Editar Projeto' : 'Novo Projeto'}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome do Projeto *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Projeto Kanban"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="Descreva seu projeto..."
            />
          </div>

          <div className="form-group">
            <label>Cor do Projeto</label>
            <div className="color-picker">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-input"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-save"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;

