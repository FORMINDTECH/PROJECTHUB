import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ProjectCard.css';

const ProjectCard = ({ project, onClick, onDelete }) => {
  const { theme } = useTheme();
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  const truncateName = (name) => {
    if (name && name.length > 6) {
      return name.substring(0, 6) + '...';
    }
    return name;
  };

  const cardStyle = {
    borderTopColor: project.color,
    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
    color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
  };

  return (
    <div
      className="project-card"
      onClick={onClick}
      style={cardStyle}
    >
      <div className="project-card-header">
        {project.logo && (
          <img
            src={`http://localhost:5000${project.logo}`}
            alt={project.name}
            className="project-logo"
          />
        )}
        <button
          className="btn btn-danger btn-icon"
          onClick={handleDelete}
          title="Deletar projeto"
        >
          ×
        </button>
      </div>
      {!project.logo && (
        <div style={{ marginBottom: '20px' }}></div>
      )}
      <h3 className="project-name">{truncateName(project.name)}</h3>
      {project.description && (
        <p className="project-description">{project.description}</p>
      )}
      <div className="project-footer">
        <span className="project-color" style={{ backgroundColor: project.color }}>
          {project.color}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;

