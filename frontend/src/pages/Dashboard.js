import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user, logout } = useContext(AuthContext);
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
            <span className="user-name">Olá, {user?.name}</span>
            <button onClick={logout} className="btn-logout">
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
              className="btn-create-project"
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
                className="btn-create-project"
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
    </div>
  );
};

export default Dashboard;

