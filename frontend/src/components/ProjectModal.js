import React, { useState } from 'react';
import './ProjectModal.css';

const ProjectModal = ({ onClose, onSave, project = null }) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [color, setColor] = useState(project?.color || '#6366f1');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#ef4444', '#f59e0b', '#10b981', '#06b6d4',
    '#3b82f6', '#84cc16', '#f97316', '#14b8a6'
  ];

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await onSave({ name, description, color, logo });
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
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Fechar">×</button>
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
            <label htmlFor="logo">Logo do Projeto</label>
            <div className="logo-upload-section">
              {logoPreview && (
                <div className="logo-preview">
                  <img src={logoPreview} alt="Preview" />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={handleRemoveLogo}
                  >
                    Remover
                  </button>
                </div>
              )}
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="logo" className="btn btn-secondary">
                {logoPreview ? 'Alterar Logo' : 'Adicionar Logo'}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Cor do Projeto</label>
            <div className="color-picker-section">
              <div className="color-picker-label">Cores pré-definidas:</div>
              <div className="color-picker">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-option ${color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    title={c}
                  />
                ))}
              </div>
              <div className="color-picker-label">Ou escolha uma cor personalizada:</div>
              <label htmlFor="custom-color" className="color-custom-picker">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="color-input"
                  id="custom-color"
                />
                <span className="color-custom-label">
                  <span className="color-preview" style={{ backgroundColor: color }}></span>
                  <span className="color-hex">{color.toUpperCase()}</span>
                </span>
              </label>
            </div>
          </div>

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

export default ProjectModal;

