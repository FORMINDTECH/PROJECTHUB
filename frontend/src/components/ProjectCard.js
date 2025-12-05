import React from 'react';
import './ProjectCard.css';

const ProjectCard = ({ project, onClick, onDelete }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  return (
    <div
      className="project-card"
      onClick={onClick}
      style={{ borderTopColor: project.color }}
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
          className="btn-delete"
          onClick={handleDelete}
          title="Deletar projeto"
        >
          ×
        </button>
      </div>
      <h3 className="project-name">{project.name}</h3>
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

