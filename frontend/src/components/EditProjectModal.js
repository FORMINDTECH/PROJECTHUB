import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import './EditProjectModal.css';

const EditProjectModal = ({ isOpen, onClose, project, onUpdate }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setLogoPreview(project.logo ? `http://localhost:5000${project.logo}` : null);
      setLogo(null);
    }
  }, [project, isOpen]);

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
      // Atualizar nome e descrição
      await api.put(`/projects/${project.id}`, {
        name,
        description: description || null,
      });

      // Upload de logo se houver
      if (logo) {
        const formData = new FormData();
        formData.append('logo', logo);
        await api.post(`/projects/${project.id}/logo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Remover logo se foi removido (quando havia logo antes mas agora não há preview nem novo logo)
      if (!logo && !logoPreview && project.logo) {
        // Tentar deletar o logo via DELETE
        try {
          await api.delete(`/projects/${project.id}/logo`);
        } catch (err) {
          console.error('Erro ao remover logo:', err);
          // Se não houver rota DELETE, apenas continuar
        }
      }

      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar projeto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-project-modal-overlay" onClick={onClose}>
      <div 
        className="edit-project-modal-content" 
        onClick={(e) => e.stopPropagation()}
        data-theme={theme}
      >
        <div className="edit-project-modal-header">
          <h2>Editar Projeto</h2>
          <button 
            className="btn btn-ghost btn-icon" 
            onClick={onClose}
            title="Fechar"
          >
            ×
          </button>
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

          <div className="edit-project-modal-actions">
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

export default EditProjectModal;

