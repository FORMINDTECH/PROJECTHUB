import React, { useState } from 'react';
import './QuickTaskForm.css';

const QuickTaskForm = ({ onCreateTask, columns }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todo');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim()) {
      console.log('QuickTaskForm - Criando tarefa com status:', selectedStatus);
      const result = await onCreateTask({
        title: title.trim(),
        description: description.trim(),
        status: selectedStatus,
      });
      
      if (result && result.success) {
        // Limpar apenas os campos, mas manter o formulário aberto
        setTitle('');
        setDescription('');
        // Não fechar o formulário - setIsExpanded(false); removido
      } else if (result && result.error) {
        alert(result.error);
      }
    }
  };

  const selectedColumn = columns.find(col => col.status === selectedStatus);

  return (
    <div className="quick-task-form">
      <div 
        className={`quick-task-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="quick-task-icon">📝</div>
        <span className="quick-task-title">Nova Tarefa Rápida</span>
        <span className="quick-task-arrow">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <form className="quick-task-content" onSubmit={handleSubmit}>
          <div className="quick-task-field">
            <input
              type="text"
              placeholder="Título da tarefa *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="quick-task-input"
            />
          </div>

          <div className="quick-task-field">
            <textarea
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="quick-task-textarea"
            />
          </div>

          <div className="quick-task-field">
            <label className="quick-task-label">Criar em:</label>
            <div className="quick-task-columns">
              {columns.map((column) => {
                const isActive = selectedStatus === column.status;
                // Cores mais elegantes e profissionais
                const statusColors = {
                  'todo': { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
                  'in-progress': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
                  'done': { bg: '#d1fae5', border: '#10b981', text: '#065f46' }
                };
                const colors = statusColors[column.status] || { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
                
                return (
                  <button
                    key={column.id}
                    type="button"
                    className={`quick-task-column-btn ${
                      isActive ? 'active' : ''
                    }`}
                    style={{
                      backgroundColor: isActive ? colors.bg : 'transparent',
                      borderColor: colors.border,
                      color: isActive ? colors.text : colors.border,
                    }}
                    onClick={() => setSelectedStatus(column.status)}
                  >
                    {column.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="quick-task-actions">
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setTitle('');
                setDescription('');
              }}
              className="btn btn-secondary btn-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
            >
              Criar Tarefa
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default QuickTaskForm;

