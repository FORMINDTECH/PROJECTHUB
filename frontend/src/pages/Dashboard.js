import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import ProfileModal from '../components/ProfileModal';
import InvitesModal from '../components/InvitesModal';
import ConfirmModal from '../components/ConfirmModal';
import ErrorModal from '../components/ErrorModal';
import Footer from '../components/Footer';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showInvitesModal, setShowInvitesModal] = useState(false);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, projectId: null });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
    loadInvitesCount();
  }, []);

  const loadInvitesCount = async () => {
    try {
      const response = await api.get('/invites');
      setPendingInvitesCount(response.data?.length || 0);
    } catch (error) {
      console.error('Erro ao carregar contagem de convites:', error);
    }
  };

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

  const handleDeleteProject = (id) => {
    setConfirmModal({ isOpen: true, projectId: id });
  };

  const confirmDeleteProject = async () => {
    if (!confirmModal.projectId) return;

    try {
      await api.delete(`/projects/${confirmModal.projectId}`);
      setProjects(projects.filter((p) => p.id !== confirmModal.projectId));
    } catch (error) {
      setErrorModal({ isOpen: true, message: 'Erro ao deletar projeto' });
    } finally {
      setConfirmModal({ isOpen: false, projectId: null });
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Meus Projetos</h1>
          <div className="header-actions">
            <span className="user-name">Olá, {user?.nickname || user?.name}</span>
            {pendingInvitesCount > 0 && (
              <button 
                onClick={() => setShowInvitesModal(true)} 
                className="btn btn-primary btn-sm invites-btn"
                title="Convites Pendentes"
              >
                📬 Convites ({pendingInvitesCount})
              </button>
            )}
            <button 
              onClick={() => setShowProfileModal(true)} 
              className="btn btn-secondary btn-lg user-profile-btn"
              title="Meu Perfil"
            >
              {user?.avatar ? (
                <img 
                  src={`http://localhost:5000${user.avatar}`} 
                  alt={user?.nickname || user?.name}
                  className="user-avatar-header"
                />
              ) : (
                <div className="user-avatar-header-initial">
                  {(user?.nickname || user?.name)?.charAt(0).toUpperCase()}
                </div>
              )}
              <span>Perfil</span>
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

        <InvitesModal
          isOpen={showInvitesModal}
          onClose={() => {
            setShowInvitesModal(false);
            loadInvitesCount();
          }}
          onUpdate={() => {
            loadProjects();
            loadInvitesCount();
          }}
        />

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, projectId: null })}
          onConfirm={confirmDeleteProject}
          title="Deletar Projeto"
          message="Tem certeza que deseja deletar este projeto? Esta ação não pode ser desfeita."
        />

        <ErrorModal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal({ isOpen: false, message: '' })}
          title="Erro"
          message={errorModal.message}
        />
      <Footer />
    </div>
  );
};

  export default Dashboard;

