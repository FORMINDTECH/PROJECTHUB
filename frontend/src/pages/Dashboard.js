import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import ProfileModal from '../components/ProfileModal';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      setProjects([response.data, ...projects]);
      setShowModal(false);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar projeto',
      };
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este projeto?')) {
      return;
    }

    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      alert('Erro ao deletar projeto');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Meus Projetos</h1>
          <div className="header-actions">
            <span className="user-name">Olá, {user?.nickname || user?.name}</span>
            <button 
              onClick={() => setShowProfileModal(true)} 
              className="btn btn-secondary btn-sm"
              title="Meu Perfil"
            >
              👤 Perfil
            </button>
            <button onClick={toggleTheme} className="btn btn-secondary btn-icon" title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button onClick={logout} className="btn btn-danger btn-sm">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="projects-container">
          <div className="projects-header">
            <h2>Projetos ({projects.length})</h2>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              + Novo Projeto
            </button>
          </div>

          {loading ? (
            <div className="loading">Carregando projetos...</div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <p>Você ainda não tem projetos.</p>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
              >
                Criar Primeiro Projeto
              </button>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                  onClick={() => navigate(`/project/${project.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <ProjectModal
          onClose={() => setShowModal(false)}
          onSave={handleCreateProject}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;

